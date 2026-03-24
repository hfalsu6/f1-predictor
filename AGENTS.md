# AGENTS.md

This file provides guidance to Codex (Codex.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Start dev server (localhost:3000)
npm run build      # Production build
npm run lint       # Run ESLint
npm run test       # Run tests once (Vitest)
npm run test:ui    # Run tests with interactive UI
```

To run a single test file:
```bash
npx vitest run lib/f1/__tests__/points.test.ts
```

## Architecture

This is an **F1 championship scenario predictor** — users simulate upcoming race finishes via drag-and-drop and see projected championship standings update in real time.

### Data Flow

1. **Fetch** — Server components (`app/standings/page.tsx`, `app/simulate/[round]/page.tsx`) call `lib/api/standings.ts` and `lib/api/schedule.ts`, which hit `https://api.jolpi.ca/ergast/f1` with ISR revalidation (3600s for standings, 86400s for season data).
2. **Map** — Raw Jolpi API shapes (`types/api.ts`) are transformed to domain types (`types/f1.ts`) in `lib/api/mappers.ts`.
3. **Simulate** — Client-side Zustand store (`store/simulationStore.ts`) holds all race result entries. When the user assigns a position or DNF, the store recalculates projected standings via:
   - `lib/f1/points.ts` → points per finish position
   - `lib/f1/standings-calculator.ts` → apply all simulations on top of baseline standings
   - `lib/f1/constructors.ts` → aggregate driver points into constructor standings

### Key Directories

- `app/` — Next.js App Router pages (server components by default; pages with interactivity use `"use client"`)
- `components/simulator/` — Drag-and-drop race simulator UI (`@dnd-kit`); `RaceSimulator.tsx` is the main entry (~600 LOC)
- `components/standings/` — Driver and constructor standings tables
- `components/preview/` — Live standings panel that shows projected delta vs. current standings
- `lib/api/` — Server-side F1 data fetching and mapping
- `lib/f1/` — Pure business logic (points calculation, standings application); covered by Vitest unit tests
- `store/simulationStore.ts` — All client state; uses Zustand 5 with Immer middleware
- `constants/f1.ts` — Points table, constructor brand colors, circuit image URLs, display names
- `types/` — TypeScript domain types (`f1.ts`), simulation types (`simulation.ts`), raw API shapes (`api.ts`)

### State Management Pattern

The Zustand store is the single source of truth for simulations. Each race round has a `RaceSimulation` entry containing an array of `RaceResultEntry` objects (one per driver), tracking finish position, DNF/DNS/DSQ status, and fastest lap. The store exposes derived standings (driver + constructor) that recompute whenever simulations change.

### Styling

Tailwind CSS 4 with CSS custom properties for theming (dark theme, `bg-zinc-950` base). Three custom font families: Syne (display headings), IBM Plex Mono, Barlow Condensed. Use `clsx` + `tailwind-merge` (re-exported from `components/ui/index.tsx`) for conditional class merging.
