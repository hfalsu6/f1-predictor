import { notFound } from "next/navigation";
import { fetchDriverStandings, fetchConstructorStandings } from "@/lib/api/standings";
import { fetchRaceSchedule, getFutureRaces } from "@/lib/api/schedule";
import { fetchRaceResults } from "@/lib/api/results";
import { SimulatorLayout } from "@/components/simulator/SimulatorLayout";
import type { CompletedRaceResult } from "@/types/f1";

export const revalidate = 3600;

interface Props {
  params: Promise<{ round: string }>;
}

export default async function SimulatePage({ params }: Props) {
  const { round } = await params;
  const roundNumber = parseInt(round, 10);

  const [drivers, constructors, schedule] = await Promise.all([
    fetchDriverStandings(),
    fetchConstructorStandings(),
    fetchRaceSchedule(),
  ]);

  const futureRaces = getFutureRaces(schedule);

  if (futureRaces.length === 0) {
    notFound();
  }

  // Find which index in futureRaces corresponds to the requested round
  const raceIndex = futureRaces.findIndex((r) => r.round === roundNumber);
  const initialRoundIndex = raceIndex >= 0 ? raceIndex : 0;

  // Fetch completed race results (past races) in parallel
  const now = new Date();
  const completedRaces = schedule.filter(r => new Date(r.date) < now);
  const season = schedule[0]?.season ?? new Date().getFullYear().toString();

  const completedResultsArray = await Promise.all(
    completedRaces.map(async (race) => {
      const results = await fetchRaceResults(season, race.round);
      return { round: race.round, results };
    })
  );

  const completedResults: Record<number, CompletedRaceResult[]> = {};
  for (const { round: r, results } of completedResultsArray) {
    if (results.length > 0) {
      completedResults[r] = results;
    }
  }

  return (
    <SimulatorLayout
      baselineDriverStandings={drivers}
      baselineConstructorStandings={constructors}
      futureRaces={futureRaces}
      initialRoundIndex={initialRoundIndex}
      completedResults={completedResults}
    />
  );
}
