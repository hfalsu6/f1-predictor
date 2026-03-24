import { describe, it, expect } from "vitest";
import { applySimulationsToStandings } from "../standings-calculator";
import type { DriverStanding } from "@/types/f1";
import type { RaceSimulation } from "@/types/simulation";

function makeDriver(id: string, code: string): DriverStanding["driver"] {
  return {
    driverId: id,
    code,
    givenName: "Test",
    familyName: code,
    constructorId: "test_team",
    constructorName: "Test Team",
    nationality: "British",
    permanentNumber: "99",
  };
}

function makeStanding(pos: number, pts: number, wins: number, id: string, code: string): DriverStanding {
  return { position: pos, points: pts, wins, driver: makeDriver(id, code) };
}

const baseline: DriverStanding[] = [
  makeStanding(1, 100, 3, "ver", "VER"),
  makeStanding(2, 80, 1, "lec", "LEC"),
  makeStanding(3, 60, 0, "ham", "HAM"),
];

describe("applySimulationsToStandings", () => {
  it("returns baseline unchanged when no simulations", () => {
    const result = applySimulationsToStandings(baseline, []);
    expect(result.map((r) => r.driver.driverId)).toEqual(["ver", "lec", "ham"]);
    expect(result[0].points).toBe(100);
  });

  it("adds race points correctly", () => {
    const sim: RaceSimulation = {
      round: 1,
      raceName: "Test GP",
      isComplete: false,
      results: {
        ver: { driverId: "ver", position: 2, dnf: null, points: 18 },
        lec: { driverId: "lec", position: 1, dnf: null, points: 25 },
        ham: { driverId: "ham", position: 3, dnf: null, points: 15 },
      },
    };

    const result = applySimulationsToStandings(baseline, [sim]);
    // VER: 100+18=118, LEC: 80+25=105, HAM: 60+15=75
    expect(result[0].driver.driverId).toBe("ver");
    expect(result[0].points).toBe(118);
    expect(result[1].driver.driverId).toBe("lec");
    expect(result[1].points).toBe(105);
    expect(result[2].driver.driverId).toBe("ham");
    expect(result[2].points).toBe(75);
  });

  it("championship overtake: LEC P1 in race overtakes VER", () => {
    const sim: RaceSimulation = {
      round: 1,
      raceName: "Test GP",
      isComplete: false,
      results: {
        ver: { driverId: "ver", position: null, dnf: "DNF", points: 0 },
        lec: { driverId: "lec", position: 1, dnf: null, points: 25 },
        ham: { driverId: "ham", position: 2, dnf: null, points: 18 },
      },
    };

    const result = applySimulationsToStandings(baseline, [sim]);
    // VER: 100+0=100, LEC: 80+25=105 → LEC leads
    expect(result[0].driver.driverId).toBe("lec");
    expect(result[0].position).toBe(1);
    expect(result[1].driver.driverId).toBe("ver");
  });

  it("uses wins as tiebreaker when points are equal", () => {
    const tied: DriverStanding[] = [
      makeStanding(1, 100, 3, "ver", "VER"),
      makeStanding(2, 100, 1, "lec", "LEC"),
    ];
    const result = applySimulationsToStandings(tied, []);
    expect(result[0].driver.driverId).toBe("ver"); // more wins
  });

  it("multi-race: accumulates across two simulations", () => {
    const sim1: RaceSimulation = {
      round: 1,
      raceName: "Race 1",
      isComplete: true,
      results: {
        ham: { driverId: "ham", position: 1, dnf: null, points: 25 },
      },
    };
    const sim2: RaceSimulation = {
      round: 2,
      raceName: "Race 2",
      isComplete: true,
      results: {
        ham: { driverId: "ham", position: 1, dnf: null, points: 25 },
      },
    };

    const result = applySimulationsToStandings(baseline, [sim1, sim2]);
    const ham = result.find((r) => r.driver.driverId === "ham")!;
    expect(ham.points).toBe(60 + 25 + 25); // 110
    expect(ham.wins).toBe(2);
  });

  it("gap is calculated from leader", () => {
    const result = applySimulationsToStandings(baseline, []);
    expect((result[0] as any).gap).toBe(0);
    expect((result[1] as any).gap).toBe(20);
    expect((result[2] as any).gap).toBe(40);
  });
});
