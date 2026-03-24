import type { DriverStanding, ConstructorStanding } from "@/types/f1";

export function buildConstructorStandings(
  driverStandings: DriverStanding[],
  baselineConstructors: ConstructorStanding[]
): ConstructorStanding[] {
  // Aggregate driver points per constructorId
  const pointsByConstructor: Record<string, number> = {};
  const winsByConstructor: Record<string, number> = {};

  for (const ds of driverStandings) {
    const cid = ds.driver.constructorId;
    pointsByConstructor[cid] = (pointsByConstructor[cid] ?? 0) + ds.points;
    winsByConstructor[cid] = (winsByConstructor[cid] ?? 0) + ds.wins;
  }

  const updated = baselineConstructors.map((cs) => ({
    ...cs,
    points: pointsByConstructor[cs.constructorId] ?? cs.points,
    wins: winsByConstructor[cs.constructorId] ?? cs.wins,
  }));

  updated.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    return b.wins - a.wins;
  });

  return updated.map((cs, i) => ({ ...cs, position: i + 1 }));
}
