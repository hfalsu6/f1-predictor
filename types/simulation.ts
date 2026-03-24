export type FinishPosition = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20 | 21 | 22;

export type DNFReason = "DNF" | "DNS" | "DSQ";

export interface RaceResultEntry {
  driverId: string;
  position: FinishPosition | null;
  dnf: DNFReason | null;
  points: number;
}

export interface RaceSimulation {
  round: number;
  raceName: string;
  results: Record<string, RaceResultEntry>; // keyed by driverId
  isComplete: boolean; // true when all 22 drivers have a position or DNF
  sprintResults?: Record<string, RaceResultEntry>; // keyed by driverId, only for sprint weekends
  isSprintComplete?: boolean;
}
