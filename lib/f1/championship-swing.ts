import type { DriverStanding } from "@/types/f1";

export interface OvertakeEvent {
  driver: DriverStanding;
  overtook: DriverStanding;
}

export interface ChampionshipSwing {
  overtakes: OvertakeEvent[];
  pointsGained: Array<{ standing: DriverStanding; delta: number }>;
  leaderChanged: boolean;
  newLeader: DriverStanding | null;
}

export function computeChampionshipSwing(
  before: DriverStanding[],
  after: DriverStanding[],
): ChampionshipSwing {
  const beforeMap = new Map(before.map(s => [s.driver.driverId, s]));

  const overtakes: OvertakeEvent[] = [];
  const deltas: Array<{ standing: DriverStanding; delta: number }> = [];

  for (const afterS of after) {
    const beforeS = beforeMap.get(afterS.driver.driverId);
    if (!beforeS) continue;
    const delta = afterS.points - beforeS.points;
    if (delta !== 0) deltas.push({ standing: afterS, delta });
    // Overtake: position improved AND the driver they overtook is real
    if (afterS.position < beforeS.position) {
      for (let pos = afterS.position + 1; pos <= beforeS.position; pos++) {
        const overtakenAfter = after.find(s => s.position === pos);
        const overtakenBefore = before.find(s => s.driver.driverId === overtakenAfter?.driver.driverId);
        if (overtakenAfter && overtakenBefore && overtakenBefore.position < beforeS.position) {
          overtakes.push({ driver: afterS, overtook: overtakenAfter });
        }
      }
    }
  }

  deltas.sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta));

  const prevLeader = before[0]?.driver.driverId;
  const newLeaderStanding = after[0];
  const leaderChanged = newLeaderStanding?.driver.driverId !== prevLeader;

  return {
    overtakes: overtakes.slice(0, 5),
    pointsGained: deltas.slice(0, 6),
    leaderChanged,
    newLeader: leaderChanged ? newLeaderStanding : null,
  };
}
