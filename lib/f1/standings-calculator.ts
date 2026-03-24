import type { DriverStanding } from "@/types/f1";
import type { RaceSimulation } from "@/types/simulation";
import { calculateDriverRacePoints, calculateDriverSprintPoints } from "./points";

export function applySimulationsToStandings(
  baseline: DriverStanding[],
  simulations: RaceSimulation[]
): DriverStanding[] {
  // Build a map of extra points per driver from simulations
  const extraPoints: Record<string, number> = {};
  const extraWins: Record<string, number> = {};

  for (const sim of simulations) {
    for (const [driverId, entry] of Object.entries(sim.results)) {
      const pts = calculateDriverRacePoints(entry);
      extraPoints[driverId] = (extraPoints[driverId] ?? 0) + pts;
      if (entry.position === 1 && entry.dnf === null) {
        extraWins[driverId] = (extraWins[driverId] ?? 0) + 1;
      }
    }
    for (const [driverId, entry] of Object.entries(sim.sprintResults ?? {})) {
      const pts = calculateDriverSprintPoints(entry);
      extraPoints[driverId] = (extraPoints[driverId] ?? 0) + pts;
      // no win counting for sprint
    }
  }

  const updated = baseline.map((standing) => {
    const driverId = standing.driver.driverId;
    return {
      ...standing,
      points: standing.points + (extraPoints[driverId] ?? 0),
      wins: standing.wins + (extraWins[driverId] ?? 0),
    };
  });

  // Sort: primary = points desc, secondary = wins desc
  updated.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    return b.wins - a.wins;
  });

  // Re-assign positions and compute gap to leader
  const leaderPoints = updated[0]?.points ?? 0;
  return updated.map((s, i) => ({
    ...s,
    position: i + 1,
    gap: leaderPoints - s.points,
  }));
}

// Extend DriverStanding with gap for projected view
declare module "@/types/f1" {
  interface DriverStanding {
    gap?: number;
  }
}
