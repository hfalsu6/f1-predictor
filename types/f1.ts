export interface Driver {
  driverId: string;
  code: string; // e.g. "VER", "HAM"
  givenName: string;
  familyName: string;
  constructorId: string;
  constructorName: string;
  nationality: string;
  permanentNumber: string;
}

export interface DriverStanding {
  position: number;
  points: number;
  wins: number;
  driver: Driver;
}

export interface ConstructorStanding {
  position: number;
  points: number;
  wins: number;
  constructorId: string;
  constructorName: string;
  nationality: string;
}

export interface CompletedRaceResult {
  position: number;
  driverId: string;
  driverCode: string;
  constructorId: string;
  points: number;
  hasFastestLap: boolean;
  status: string; // "Finished", "+1 Lap", "DNF", etc.
}

export interface Race {
  round: number;
  raceName: string;
  circuitId: string;
  circuitName: string;
  country: string;
  locality: string;
  date: string; // ISO date string
  time?: string;
  season: string;
  hasSprint?: boolean;
  sprintDate?: string;
}
