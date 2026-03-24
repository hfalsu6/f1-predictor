"use client";

import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import type { DriverStanding, ConstructorStanding, Race } from "@/types/f1";
import type { RaceSimulation, RaceResultEntry, DNFReason, FinishPosition } from "@/types/simulation";
import { calculateDriverRacePoints, calculateDriverSprintPoints } from "@/lib/f1/points";
import { applySimulationsToStandings } from "@/lib/f1/standings-calculator";
import { buildConstructorStandings } from "@/lib/f1/constructors";

interface SimulationState {
  // Baseline (from API)
  baselineDriverStandings: DriverStanding[];
  baselineConstructorStandings: ConstructorStanding[];
  futureRaces: Race[];

  // Simulation state
  currentRaceIndex: number;
  simulations: RaceSimulation[]; // one per future race
  activeTab: "race" | "sprint";

  // Derived (recomputed on mutation)
  projectedDriverStandings: DriverStanding[];
  projectedConstructorStandings: ConstructorStanding[];
  // Standings BEFORE current race (after all prior simulated races) — used for delta comparison
  preRaceDriverStandings: DriverStanding[];
  preRaceConstructorStandings: ConstructorStanding[];
}

interface SimulationActions {
  initializeBaseline: (
    drivers: DriverStanding[],
    constructors: ConstructorStanding[],
    races: Race[]
  ) => void;
  assignPosition: (driverId: string, position: FinishPosition) => void;
  assignDNF: (driverId: string, reason: DNFReason) => void;
  clearDriver: (driverId: string) => void;
  autofill: () => void;
  resetCurrentRace: () => void;
  advanceToNextRace: () => void;
  goToRace: (index: number) => void;
  setActiveTab: (tab: "race" | "sprint") => void;
  assignSprintPosition: (driverId: string, position: FinishPosition) => void;
  assignSprintDNF: (driverId: string, reason: DNFReason) => void;
  clearSprintDriver: (driverId: string) => void;
  autofillSprint: () => void;
  resetCurrentSprint: () => void;
  hydrateFromEncoded: (decoded: Array<{round: number; results: Record<string, {pos: number|null; dnf: string|null}>; sprint: Record<string, {pos: number|null; dnf: string|null}>}>) => void;
}

type SimStore = SimulationState & SimulationActions;

function makeEmptySimulation(race: Race): RaceSimulation {
  return {
    round: race.round,
    raceName: race.raceName,
    results: {},
    isComplete: false,
    sprintResults: undefined,
    isSprintComplete: false,
  };
}

function checkSprintComplete(sim: RaceSimulation, totalDrivers: number): boolean {
  const assigned = Object.values(sim.sprintResults ?? {}).filter(
    (r) => r.position !== null || r.dnf !== null
  ).length;
  return assigned >= totalDrivers;
}

function recompute(state: SimulationState): void {
  // Standings after all races BEFORE the current one — the correct "original position" anchor
  const priorSims = state.simulations.slice(0, state.currentRaceIndex);
  state.preRaceDriverStandings = applySimulationsToStandings(
    state.baselineDriverStandings,
    priorSims
  );
  state.preRaceConstructorStandings = buildConstructorStandings(
    state.preRaceDriverStandings,
    state.baselineConstructorStandings
  );

  // Projected standings including the current race's (partial) simulation
  const simsToApply = state.simulations.slice(0, state.currentRaceIndex + 1);
  state.projectedDriverStandings = applySimulationsToStandings(
    state.baselineDriverStandings,
    simsToApply
  );
  state.projectedConstructorStandings = buildConstructorStandings(
    state.projectedDriverStandings,
    state.baselineConstructorStandings
  );
}

function checkComplete(sim: RaceSimulation, totalDrivers: number): boolean {
  const assigned = Object.values(sim.results).filter(
    (r) => r.position !== null || r.dnf !== null
  ).length;
  return assigned >= totalDrivers;
}

export const useSimulationStore = create<SimStore>()(
  immer((set) => ({
    baselineDriverStandings: [],
    baselineConstructorStandings: [],
    futureRaces: [],
    currentRaceIndex: 0,
    simulations: [],
    activeTab: "race" as const,
    projectedDriverStandings: [],
    projectedConstructorStandings: [],
    preRaceDriverStandings: [],
    preRaceConstructorStandings: [],

    initializeBaseline: (drivers, constructors, races) =>
      set((state) => {
        state.baselineDriverStandings = drivers;
        state.baselineConstructorStandings = constructors;
        state.futureRaces = races;
        state.currentRaceIndex = 0;
        state.simulations = races.map(makeEmptySimulation);
        state.projectedDriverStandings = [...drivers];
        state.projectedConstructorStandings = [...constructors];
        state.preRaceDriverStandings = [...drivers];
        state.preRaceConstructorStandings = [...constructors];
      }),

    assignPosition: (driverId, position) =>
      set((state) => {
        const sim = state.simulations[state.currentRaceIndex];
        if (!sim) return;

        // Remove any driver already occupying this position
        for (const [id, entry] of Object.entries(sim.results)) {
          if (entry.position === position && id !== driverId) {
            sim.results[id] = { ...entry, position: null, dnf: null, points: 0 };
          }
        }

        const pts = calculateDriverRacePoints({ position, dnf: null });
        sim.results[driverId] = { driverId, position, dnf: null, points: pts };
        sim.isComplete = checkComplete(sim, state.baselineDriverStandings.length);
        recompute(state);
      }),

    assignDNF: (driverId, reason) =>
      set((state) => {
        const sim = state.simulations[state.currentRaceIndex];
        if (!sim) return;
        sim.results[driverId] = { driverId, position: null, dnf: reason, points: 0 };
        sim.isComplete = checkComplete(sim, state.baselineDriverStandings.length);
        recompute(state);
      }),

    clearDriver: (driverId) =>
      set((state) => {
        const sim = state.simulations[state.currentRaceIndex];
        if (!sim) return;
        delete sim.results[driverId];
        sim.isComplete = false;
        recompute(state);
      }),

    autofill: () =>
      set((state) => {
        const sim = state.simulations[state.currentRaceIndex];
        if (!sim) return;

        const allDrivers = state.baselineDriverStandings.map((s) => s.driver);
        const total = allDrivers.length;

        const assignedToPosition = new Set(
          Object.values(sim.results)
            .filter((r) => r.position !== null && r.dnf === null)
            .map((r) => r.driverId)
        );
        const assignedDNF = new Set(
          Object.values(sim.results)
            .filter((r) => r.dnf !== null)
            .map((r) => r.driverId)
        );

        // Remaining drivers in current standings order
        const unassigned = allDrivers.filter(
          (d) => !assignedToPosition.has(d.driverId) && !assignedDNF.has(d.driverId)
        );

        // Empty positions in ascending order
        const occupiedPositions = new Set(
          Object.values(sim.results)
            .filter((r) => r.position !== null && r.dnf === null)
            .map((r) => r.position)
        );
        const emptyPositions: FinishPosition[] = [];
        for (let i = 1; i <= total; i++) {
          if (!occupiedPositions.has(i as FinishPosition)) emptyPositions.push(i as FinishPosition);
        }

        const count = Math.min(unassigned.length, emptyPositions.length);
        for (let i = 0; i < count; i++) {
          const driver = unassigned[i];
          const position = emptyPositions[i];
          const pts = calculateDriverRacePoints({ position, dnf: null });
          sim.results[driver.driverId] = { driverId: driver.driverId, position, dnf: null, points: pts };
        }

        sim.isComplete = checkComplete(sim, total);
        recompute(state);
      }),

    resetCurrentRace: () =>
      set((state) => {
        const race = state.futureRaces[state.currentRaceIndex];
        if (!race) return;
        state.simulations[state.currentRaceIndex] = makeEmptySimulation(race);
        recompute(state);
      }),

    advanceToNextRace: () =>
      set((state) => {
        if (state.currentRaceIndex < state.futureRaces.length - 1) {
          state.currentRaceIndex += 1;
          recompute(state);
        }
      }),

    goToRace: (index) =>
      set((state) => {
        if (index >= 0 && index < state.futureRaces.length) {
          state.currentRaceIndex = index;
          recompute(state);
        }
      }),

    setActiveTab: (tab) =>
      set((state) => {
        state.activeTab = tab;
      }),

    assignSprintPosition: (driverId, position) =>
      set((state) => {
        const sim = state.simulations[state.currentRaceIndex];
        if (!sim) return;

        if (!sim.sprintResults) sim.sprintResults = {};

        // Remove any driver already occupying this position in sprint
        for (const [id, entry] of Object.entries(sim.sprintResults)) {
          if (entry.position === position && id !== driverId) {
            sim.sprintResults[id] = { ...entry, position: null, dnf: null, points: 0 };
          }
        }

        const pts = calculateDriverSprintPoints({ position, dnf: null });
        sim.sprintResults[driverId] = { driverId, position, dnf: null, points: pts };
        sim.isSprintComplete = checkSprintComplete(sim, state.baselineDriverStandings.length);
        recompute(state);
      }),

    assignSprintDNF: (driverId, reason) =>
      set((state) => {
        const sim = state.simulations[state.currentRaceIndex];
        if (!sim) return;
        if (!sim.sprintResults) sim.sprintResults = {};
        sim.sprintResults[driverId] = { driverId, position: null, dnf: reason, points: 0 };
        sim.isSprintComplete = checkSprintComplete(sim, state.baselineDriverStandings.length);
        recompute(state);
      }),

    clearSprintDriver: (driverId) =>
      set((state) => {
        const sim = state.simulations[state.currentRaceIndex];
        if (!sim || !sim.sprintResults) return;
        delete sim.sprintResults[driverId];
        sim.isSprintComplete = false;
        recompute(state);
      }),

    autofillSprint: () =>
      set((state) => {
        const sim = state.simulations[state.currentRaceIndex];
        if (!sim) return;

        if (!sim.sprintResults) sim.sprintResults = {};

        const allDrivers = state.baselineDriverStandings.map((s) => s.driver);
        const total = allDrivers.length;

        const assignedToPosition = new Set(
          Object.values(sim.sprintResults)
            .filter((r) => r.position !== null && r.dnf === null)
            .map((r) => r.driverId)
        );
        const assignedDNF = new Set(
          Object.values(sim.sprintResults)
            .filter((r) => r.dnf !== null)
            .map((r) => r.driverId)
        );

        const unassigned = allDrivers.filter(
          (d) => !assignedToPosition.has(d.driverId) && !assignedDNF.has(d.driverId)
        );

        const occupiedPositions = new Set(
          Object.values(sim.sprintResults)
            .filter((r) => r.position !== null && r.dnf === null)
            .map((r) => r.position)
        );

        // Only 8 scored positions in sprint
        const emptyPositions: FinishPosition[] = [];
        for (let i = 1; i <= 8; i++) {
          if (!occupiedPositions.has(i as FinishPosition)) emptyPositions.push(i as FinishPosition);
        }

        // Fill scored positions first
        let unassignedIdx = 0;
        for (const pos of emptyPositions) {
          if (unassignedIdx >= unassigned.length) break;
          const driver = unassigned[unassignedIdx++];
          const pts = calculateDriverSprintPoints({ position: pos, dnf: null });
          sim.sprintResults[driver.driverId] = { driverId: driver.driverId, position: pos, dnf: null, points: pts };
        }

        // Rest get DNF
        for (let i = unassignedIdx; i < unassigned.length; i++) {
          const driver = unassigned[i];
          sim.sprintResults[driver.driverId] = { driverId: driver.driverId, position: null, dnf: "DNF", points: 0 };
        }

        // Also fill remaining unscored positions with "DNF" for any already-DNF positions (>8)
        const unassignedAfterScored = allDrivers.filter(
          (d) => !Object.keys(sim.sprintResults!).includes(d.driverId)
        );
        // Fill remaining positions P9..total
        const remainingPositions: FinishPosition[] = [];
        for (let i = 9; i <= total; i++) {
          if (!occupiedPositions.has(i as FinishPosition)) remainingPositions.push(i as FinishPosition);
        }
        for (let i = 0; i < Math.min(unassignedAfterScored.length, remainingPositions.length); i++) {
          const driver = unassignedAfterScored[i];
          const pos = remainingPositions[i];
          sim.sprintResults![driver.driverId] = { driverId: driver.driverId, position: pos, dnf: null, points: 0 };
        }

        sim.isSprintComplete = checkSprintComplete(sim, total);
        recompute(state);
      }),

    resetCurrentSprint: () =>
      set((state) => {
        const sim = state.simulations[state.currentRaceIndex];
        if (!sim) return;
        sim.sprintResults = undefined;
        sim.isSprintComplete = false;
        recompute(state);
      }),

    hydrateFromEncoded: (decoded) =>
      set((state) => {
        for (const item of decoded) {
          const simIdx = state.simulations.findIndex((s) => s.round === item.round);
          if (simIdx === -1) continue;
          const sim = state.simulations[simIdx];

          // Merge race results
          for (const [driverId, { pos, dnf }] of Object.entries(item.results)) {
            if (dnf !== null) {
              sim.results[driverId] = { driverId, position: null, dnf: dnf as DNFReason, points: 0 };
            } else if (pos !== null) {
              const position = pos as FinishPosition;
              const pts = calculateDriverRacePoints({ position, dnf: null });
              sim.results[driverId] = { driverId, position, dnf: null, points: pts };
            }
          }
          sim.isComplete = checkComplete(sim, state.baselineDriverStandings.length);

          // Merge sprint results
          if (Object.keys(item.sprint).length > 0) {
            if (!sim.sprintResults) sim.sprintResults = {};
            for (const [driverId, { pos, dnf }] of Object.entries(item.sprint)) {
              if (dnf !== null) {
                sim.sprintResults[driverId] = { driverId, position: null, dnf: dnf as DNFReason, points: 0 };
              } else if (pos !== null) {
                const position = pos as FinishPosition;
                const pts = calculateDriverSprintPoints({ position, dnf: null });
                sim.sprintResults[driverId] = { driverId, position, dnf: null, points: pts };
              }
            }
            sim.isSprintComplete = checkSprintComplete(sim, state.baselineDriverStandings.length);
          }
        }
        recompute(state);
      }),
  }))
);
