import { fetchF1 } from "./client";
import type { JolpicaRaceResultsResponse } from "@/types/api";
import type { CompletedRaceResult } from "@/types/f1";

export async function fetchRaceResults(season: string, round: number): Promise<CompletedRaceResult[]> {
  try {
    const data = await fetchF1<JolpicaRaceResultsResponse>(`${season}/${round}/results.json`, 86400);
    const race = data.MRData.RaceTable.Races[0];
    if (!race) return [];
    return race.Results.map(r => ({
      position: parseInt(r.position, 10),
      driverId: r.Driver.driverId,
      driverCode: r.Driver.code ?? r.Driver.driverId.substring(0, 3).toUpperCase(),
      constructorId: r.Constructor.constructorId,
      points: parseFloat(r.points),
      hasFastestLap: r.FastestLap?.rank === "1",
      status: r.status,
    })).sort((a, b) => a.position - b.position);
  } catch {
    return [];
  }
}
