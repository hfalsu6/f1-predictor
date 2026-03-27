import { fetchDriverStandings } from "@/lib/api/standings";
import { fetchRaceSchedule, getFutureRaces } from "@/lib/api/schedule";
import { TitleWatchClient } from "@/components/title/TitleWatchClient";

export const revalidate = 3600;

export default async function TitlePage() {
  const [standings, schedule] = await Promise.all([
    fetchDriverStandings(),
    fetchRaceSchedule(),
  ]);
  const futureRaces = getFutureRaces(schedule);
  const totalRaces = schedule.length;
  const completedRaces = totalRaces - futureRaces.length;

  return (
    <div className="page-root" style={{ maxWidth: "1100px", margin: "0 auto" }}>
      <div style={{ marginBottom: "28px" }}>
        <h1 style={{ fontSize: "26px", fontWeight: 800, margin: "0 0 6px", letterSpacing: "-0.02em" }}>
          Title Watch
        </h1>
        <p style={{ fontSize: "13px", color: "var(--text-muted)", margin: 0 }}>
          {completedRaces} of {totalRaces} races complete · {futureRaces.length} remaining
        </p>
      </div>
      <TitleWatchClient standings={standings} futureRaces={futureRaces} completedCount={completedRaces} />
    </div>
  );
}
