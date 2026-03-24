import { fetchRaceSchedule, getFutureRaces } from "@/lib/api/schedule";
import { MapsClient } from "@/components/maps/MapsClient";

export const revalidate = 86400;

export default async function MapsPage() {
  const schedule  = await fetchRaceSchedule();
  const future    = getFutureRaces(schedule);
  const nextRace  = future[0];
  const season    = schedule[0]?.season ?? "";
  const now       = new Date();
  const completed = schedule.filter((r) => new Date(r.date) < now).length;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>

      {/* ── Page header ──────────────────────────────────────────── */}
      <div style={{
        padding: "20px 28px 16px",
        borderBottom: "1px solid rgba(224,7,0,0.07)",
        flexShrink: 0,
        display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px",
      }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "9px", marginBottom: "4px" }}>
            <span className="material-symbols-outlined" style={{ fontSize: "20px", color: "var(--accent-red)" }}>public</span>
            <h1 style={{ fontSize: "20px", fontWeight: 800, margin: 0, letterSpacing: "-0.02em", fontFamily: "var(--font-sans)" }}>
              {season} World Circuit Map
            </h1>
          </div>
          <p style={{ fontSize: "12px", color: "var(--text-muted)", margin: 0, fontFamily: "var(--font-sans)" }}>
            {schedule.length} circuits · {completed} completed · {schedule.length - completed} remaining
            <span style={{ marginLeft: "10px", color: "rgba(255,255,255,0.18)" }}>· click any circuit for 3D details</span>
          </p>
        </div>

        {/* Quick stats */}
        <div style={{ display: "flex", gap: "12px", flexShrink: 0 }}>
          {[
            { label: "Rounds", value: schedule.length },
            { label: "Done",   value: completed },
            { label: "To Go",  value: schedule.length - completed },
          ].map(({ label, value }) => (
            <div key={label} style={{
              padding: "8px 14px", background: "rgba(224,7,0,0.04)",
              border: "1px solid rgba(224,7,0,0.08)", borderRadius: "8px", textAlign: "center",
            }}>
              <div style={{ fontSize: "18px", fontWeight: 800, color: "var(--text-primary)", fontFamily: "var(--font-sans)" }}>{value}</div>
              <div style={{ fontSize: "9px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.1em", fontFamily: "var(--font-sans)" }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Scrollable interactive content ───────────────────────── */}
      <div style={{ flex: 1, overflowY: "auto", minHeight: 0 }}>
        <MapsClient
          races={schedule}
          nextRaceRound={nextRace?.round}
          nextRace={nextRace}
        />
      </div>

    </div>
  );
}
