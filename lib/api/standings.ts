import { fetchF1 } from "./client";
import { mapDriverStanding, mapConstructorStanding } from "./mappers";
import type {
  JolpicaDriverStandingsResponse,
  JolpicaConstructorStandingsResponse,
} from "@/types/api";
import type { DriverStanding, ConstructorStanding } from "@/types/f1";

// If the current season has no standings yet (pre-season), fall back to last year's final standings
async function fetchDriverStandingsForSeason(season: string): Promise<DriverStanding[]> {
  const data = await fetchF1<JolpicaDriverStandingsResponse>(
    `${season}/driverstandings.json`,
    3600
  );
  const list = data.MRData.StandingsTable.StandingsLists[0];
  if (!list) return [];
  return list.DriverStandings.map(mapDriverStanding);
}

async function fetchConstructorStandingsForSeason(season: string): Promise<ConstructorStanding[]> {
  const data = await fetchF1<JolpicaConstructorStandingsResponse>(
    `${season}/constructorstandings.json`,
    3600
  );
  const list = data.MRData.StandingsTable.StandingsLists[0];
  if (!list) return [];
  return list.ConstructorStandings.map(mapConstructorStanding);
}

export async function fetchDriverStandings(): Promise<DriverStanding[]> {
  const current = await fetchDriverStandingsForSeason("current");
  if (current.length > 0) return current;
  // Pre-season: fall back to previous year's final standings
  const prevYear = new Date().getFullYear() - 1;
  return fetchDriverStandingsForSeason(String(prevYear));
}

export async function fetchConstructorStandings(): Promise<ConstructorStanding[]> {
  const current = await fetchConstructorStandingsForSeason("current");
  if (current.length > 0) return current;
  const prevYear = new Date().getFullYear() - 1;
  return fetchConstructorStandingsForSeason(String(prevYear));
}
