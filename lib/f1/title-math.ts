import type { DriverStanding } from "@/types/f1";
import type { Race } from "@/types/f1";
import { POINTS_TABLE } from "@/constants/f1";

const MAX_PER_RACE = 26; // 25 + 1 fastest lap

export interface TitleScenarioRace {
  round: number;
  raceName: string;
  // minimum position the selected driver needs
  minRequired: number | null; // null = any result works
  // max the leader can score for driver to still win
  leaderMaxAllowed: number;
}

export interface TitlePath {
  driverId: string;
  currentPoints: number;
  currentGap: number;        // points behind leader (0 if they ARE the leader)
  remainingRaces: number;
  maxGain: number;           // max points available from remaining races
  canWin: boolean;
  alreadyWon: boolean;       // gap <= 0 and no races remain = champion
  minimumScenario: TitleScenarioRace[];
  eliminatedAfterRound: number | null;
}

export function computeTitlePath(
  selected: DriverStanding,
  allStandings: DriverStanding[],
  futureRaces: Race[],
): TitlePath {
  const remaining = futureRaces.length;
  const maxGain = remaining * MAX_PER_RACE;
  const leader = allStandings[0];
  const isLeader = selected.driver.driverId === leader.driver.driverId;
  const currentGap = isLeader ? 0 : leader.points - selected.points;

  // Can win if max possible points >= leader's current points (assuming leader scores 0)
  const canWin = selected.points + maxGain >= leader.points;
  const alreadyWon = remaining === 0 && selected.position === 1;

  // Find elimination round: first round after which even max performance can't close gap
  let eliminatedAfterRound: number | null = null;
  if (!canWin && !isLeader) {
    // They're already mathematically out
    eliminatedAfterRound = 0;
  }

  // Minimum scenario: for each remaining race, what's the minimum the driver needs?
  // Greedy approach: give driver P1+FL (26pts) each race, give leader minimum (P8=4pts)
  // Find the minimum finish position per race such that driver catches up
  const minimumScenario: TitleScenarioRace[] = futureRaces.map((race, i) => {
    const racesLeft = remaining - i;
    // Points driver still needs to reach leader (assuming leader scores minimum from here)
    const driverProjected = selected.points + i * MAX_PER_RACE;
    const leaderProjected = leader.points + i * 4; // leader scores P8 = 4pts each race
    const stillNeeded = leaderProjected - driverProjected;

    if (stillNeeded <= 0) {
      return { round: race.round, raceName: race.raceName, minRequired: null, leaderMaxAllowed: 26 };
    }

    // Find minimum position that gives enough points
    let minPos = 1;
    for (let pos = 1; pos <= 10; pos++) {
      const pts = (POINTS_TABLE[pos] ?? 0) + (pos === 1 ? 1 : 0); // +FL bonus for P1
      if (selected.points + pts * (racesLeft - 0) >= leaderProjected + 4 * (racesLeft - 0)) {
        minPos = pos;
        break;
      }
    }

    return {
      round: race.round,
      raceName: race.raceName,
      minRequired: isLeader ? null : Math.min(minPos, 10),
      leaderMaxAllowed: isLeader ? 26 : Math.max(0, (POINTS_TABLE[minPos] ?? 0) - 2),
    };
  });

  return {
    driverId: selected.driver.driverId,
    currentPoints: selected.points,
    currentGap,
    remainingRaces: remaining,
    maxGain,
    canWin: canWin || isLeader,
    alreadyWon,
    minimumScenario,
    eliminatedAfterRound,
  };
}
