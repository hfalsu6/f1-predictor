import type {
  JolpicaDriverStanding,
  JolpicaConstructorStanding,
  JolpicaRace,
} from "@/types/api";
import type { DriverStanding, ConstructorStanding, Race } from "@/types/f1";
import { CONSTRUCTOR_COLORS } from "@/constants/f1";

export function mapDriverStanding(raw: JolpicaDriverStanding): DriverStanding {
  const constructor = raw.Constructors[0];
  return {
    position: parseInt(raw.position, 10),
    points: parseFloat(raw.points),
    wins: parseInt(raw.wins, 10),
    driver: {
      driverId: raw.Driver.driverId,
      code: raw.Driver.code ?? raw.Driver.familyName.substring(0, 3).toUpperCase(),
      givenName: raw.Driver.givenName,
      familyName: raw.Driver.familyName,
      permanentNumber: raw.Driver.permanentNumber ?? "",
      nationality: raw.Driver.nationality,
      constructorId: constructor?.constructorId ?? "",
      constructorName: constructor?.name ?? "",
    },
  };
}

export function mapConstructorStanding(
  raw: JolpicaConstructorStanding
): ConstructorStanding {
  return {
    position: parseInt(raw.position, 10),
    points: parseFloat(raw.points),
    wins: parseInt(raw.wins, 10),
    constructorId: raw.Constructor.constructorId,
    constructorName: raw.Constructor.name,
    nationality: raw.Constructor.nationality,
  };
}

export function mapRace(raw: JolpicaRace): Race {
  return {
    round: parseInt(raw.round, 10),
    season: raw.season,
    raceName: raw.raceName,
    circuitId: raw.Circuit.circuitId,
    circuitName: raw.Circuit.circuitName,
    country: raw.Circuit.Location.country,
    locality: raw.Circuit.Location.locality,
    date: raw.date,
    time: raw.time,
    hasSprint: !!raw.Sprint,
    sprintDate: raw.Sprint?.date,
  };
}

export function getConstructorColor(constructorId: string): string {
  return CONSTRUCTOR_COLORS[constructorId] ?? "#888888";
}
