import { fetchF1 } from "./client";

interface JolpicaDriverResultsResponse {
  MRData: {
    RaceTable: {
      Races: Array<{
        round: string;
        raceName: string;
        Results: Array<{
          position: string;
          points: string;
          FastestLap?: { rank: string };
          status: string;
        }>;
      }>;
    };
  };
}

export interface DriverSeasonSummary {
  driverId: string;
  raceResults: Array<{
    round: number;
    raceName: string;
    position: number | null;
    points: number;
    hasFastestLap: boolean;
    dnf: boolean;
  }>;
  wins: number;
  podiums: number;
  bestFinish: number | null;
  fastestLaps: number;
  totalPoints: number;
  dnfCount: number;
  pointsPerRound: number[];
}

export async function fetchDriverSeasonSummary(driverId: string): Promise<DriverSeasonSummary | null> {
  try {
    const data = await fetchF1<JolpicaDriverResultsResponse>(`current/drivers/${driverId}/results.json`, 3600);
    const races = data.MRData.RaceTable.Races;

    const raceResults = races.map(r => {
      const result = r.Results[0];
      const pos = result ? parseInt(result.position, 10) : null;
      const dnf = result ? (result.status !== "Finished" && !result.status.startsWith("+")) : false;
      return {
        round: parseInt(r.round, 10),
        raceName: r.raceName,
        position: isNaN(pos as number) || !result ? null : pos,
        points: result ? parseFloat(result.points) : 0,
        hasFastestLap: result?.FastestLap?.rank === "1",
        dnf,
      };
    });

    const finishes = raceResults.filter(r => r.position !== null).map(r => r.position as number);

    return {
      driverId,
      raceResults,
      wins: raceResults.filter(r => r.position === 1).length,
      podiums: raceResults.filter(r => r.position !== null && r.position <= 3).length,
      bestFinish: finishes.length ? Math.min(...finishes) : null,
      fastestLaps: raceResults.filter(r => r.hasFastestLap).length,
      totalPoints: raceResults.reduce((s, r) => s + r.points, 0),
      dnfCount: raceResults.filter(r => r.dnf).length,
      pointsPerRound: raceResults.map(r => r.points),
    };
  } catch {
    return null;
  }
}
