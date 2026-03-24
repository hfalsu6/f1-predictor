import { fetchF1 } from "./client";
import { mapRace } from "./mappers";
import type { JolpicaScheduleResponse } from "@/types/api";
import type { Race } from "@/types/f1";

export async function fetchRaceSchedule(): Promise<Race[]> {
  const data = await fetchF1<JolpicaScheduleResponse>("current.json", 86400);
  return data.MRData.RaceTable.Races.map(mapRace);
}

export function getFutureRaces(races: Race[], referenceDate: Date = new Date()): Race[] {
  return races.filter((r) => new Date(r.date) >= referenceDate);
}

export function getNextRace(races: Race[], referenceDate: Date = new Date()): Race | undefined {
  return getFutureRaces(races, referenceDate)[0];
}
