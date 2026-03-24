import { describe, it, expect } from "vitest";
import { getPointsForPosition, calculateDriverRacePoints } from "../points";

describe("getPointsForPosition", () => {
  it("returns 25 for P1", () => expect(getPointsForPosition(1)).toBe(25));
  it("returns 18 for P2", () => expect(getPointsForPosition(2)).toBe(18));
  it("returns 15 for P3", () => expect(getPointsForPosition(3)).toBe(15));
  it("returns 12 for P4", () => expect(getPointsForPosition(4)).toBe(12));
  it("returns 10 for P5", () => expect(getPointsForPosition(5)).toBe(10));
  it("returns 8 for P6", () => expect(getPointsForPosition(6)).toBe(8));
  it("returns 6 for P7", () => expect(getPointsForPosition(7)).toBe(6));
  it("returns 4 for P8", () => expect(getPointsForPosition(8)).toBe(4));
  it("returns 2 for P9", () => expect(getPointsForPosition(9)).toBe(2));
  it("returns 1 for P10", () => expect(getPointsForPosition(10)).toBe(1));
  it("returns 0 for P11", () => expect(getPointsForPosition(11)).toBe(0));
  it("returns 0 for P22", () => expect(getPointsForPosition(22)).toBe(0));
  it("returns 0 for null", () => expect(getPointsForPosition(null)).toBe(0));
});

describe("calculateDriverRacePoints", () => {
  it("returns 25 for P1 finish", () =>
    expect(calculateDriverRacePoints({ position: 1, dnf: null })).toBe(25));

  it("returns 0 for DNF", () =>
    expect(calculateDriverRacePoints({ position: null, dnf: "DNF" })).toBe(0));

  it("returns 0 for DNS", () =>
    expect(calculateDriverRacePoints({ position: null, dnf: "DNS" })).toBe(0));

  it("returns 0 for DSQ", () =>
    expect(calculateDriverRacePoints({ position: null, dnf: "DSQ" })).toBe(0));

  it("returns 0 for P11 (no points zone)", () =>
    expect(calculateDriverRacePoints({ position: 11, dnf: null })).toBe(0));

  it("DNF overrides position (DNF+position gives 0)", () =>
    expect(calculateDriverRacePoints({ position: 1, dnf: "DNF" })).toBe(0));
});
