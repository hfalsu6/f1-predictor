// Raw Jolpica / Ergast API response shapes

export interface JolpicaDriverStanding {
  position: string;
  positionText: string;
  points: string;
  wins: string;
  Driver: {
    driverId: string;
    permanentNumber: string;
    code: string;
    givenName: string;
    familyName: string;
    nationality: string;
  };
  Constructors: Array<{
    constructorId: string;
    name: string;
    nationality: string;
  }>;
}

export interface JolpicaConstructorStanding {
  position: string;
  positionText: string;
  points: string;
  wins: string;
  Constructor: {
    constructorId: string;
    name: string;
    nationality: string;
  };
}

export interface JolpicaRace {
  season: string;
  round: string;
  raceName: string;
  Circuit: {
    circuitId: string;
    circuitName: string;
    Location: {
      locality: string;
      country: string;
    };
  };
  date: string;
  time?: string;
  Sprint?: { date: string };
}

export interface JolpicaDriverStandingsResponse {
  MRData: {
    StandingsTable: {
      StandingsLists: Array<{
        DriverStandings: JolpicaDriverStanding[];
      }>;
    };
  };
}

export interface JolpicaConstructorStandingsResponse {
  MRData: {
    StandingsTable: {
      StandingsLists: Array<{
        ConstructorStandings: JolpicaConstructorStanding[];
      }>;
    };
  };
}

export interface JolpicaScheduleResponse {
  MRData: {
    RaceTable: {
      Races: JolpicaRace[];
    };
  };
}

export interface JolpicaRaceResult {
  position: string;
  Driver: { driverId: string; code: string; };
  Constructor: { constructorId: string; };
  points: string;
  FastestLap?: { rank: string; };
  Time?: { time: string; };
  status: string;
}

export interface JolpicaRaceResultsResponse {
  MRData: {
    RaceTable: {
      season: string;
      Races: Array<{
        round: string;
        raceName: string;
        Results: JolpicaRaceResult[];
      }>;
    };
  };
}
