import { POINTS_TABLE, SPRINT_POINTS_TABLE } from "@/constants/f1";
import type { RaceResultEntry } from "@/types/simulation";

export function getPointsForPosition(position: number | null): number {
  if (position === null || position < 1) return 0;
  return POINTS_TABLE[position] ?? 0;
}

export function calculateDriverRacePoints(result: Pick<RaceResultEntry, "position" | "dnf">): number {
  if (result.dnf !== null) return 0;
  return getPointsForPosition(result.position);
}

export function calculateDriverSprintPoints(result: Pick<RaceResultEntry, "position" | "dnf">): number {
  if (result.dnf !== null) return 0;
  if (result.position === null) return 0;
  return SPRINT_POINTS_TABLE[result.position] ?? 0;
}

export function validateRaceResults(results: RaceResultEntry[]): string[] {
  const errors: string[] = [];
  const positions = results
    .filter((r) => r.position !== null && r.dnf === null)
    .map((r) => r.position as number);

  const duplicates = positions.filter((p, i) => positions.indexOf(p) !== i);
  if (duplicates.length > 0) {
    errors.push(`Duplicate positions: ${[...new Set(duplicates)].join(", ")}`);
  }

  return errors;
}
