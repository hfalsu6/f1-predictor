import Link from "next/link";
import { fetchRaceSchedule } from "@/lib/api/schedule";
import { CIRCUIT_IMAGES, getFlagUrl } from "@/constants/f1";

export const revalidate = 3600;

function getCountdown(dateStr: string) {
  const diff = new Date(dateStr).getTime() - Date.now();
  if (diff <= 0) return null;
  return {
    days:  Math.floor(diff / 864e5),
    hours: Math.floor((diff % 864e5) / 36e5),
  };
}

function pad(n: number) { return String(n).padStart(2, "0"); }

export default async function CalendarPage() {
  const schedule = await fetchRaceSchedule();
  const now = new Date();

  const nextRaceIndex = schedule.findIndex((r) => new Date(r.date) >= now);

  const completedCount = schedule.filter((r) => new Date(r.date) < now).length;
  const upcomingCount  = schedule.length - completedCount;

  return (
    <div style={{ padding: "32px" }}>
      <div style={{ maxWidth: "880px", margin: "0 auto" }}>

            {/* Page header */}
            <div style={{ marginBottom: "28px" }}>
              <h1 style={{ fontSize: "24px", fontWeight: 800, margin: "0 0 6px", letterSpacing: "-0.02em" }}>
                {schedule[0]?.season ?? ""} Season Calendar
              </h1>
              <p style={{ fontSize: "13px", color: "var(--text-secondary)", margin: 0 }}>
                {schedule.length} Grands Prix · {completedCount} completed · {upcomingCount} upcoming
              </p>
            </div>

            {/* Stats row */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", marginBottom: "28px" }}>
              {[
                { label: "Total Rounds",   value: schedule.length,   icon: "flag" },
                { label: "Completed",      value: completedCount,     icon: "check_circle" },
                { label: "Remaining",      value: upcomingCount,      icon: "schedule" },
              ].map(({ label, value, icon }) => (
                <div key={label} style={{ padding: "16px 20px", background: "rgba(224,7,0,0.03)", border: "1px solid rgba(224,7,0,0.08)", borderRadius: "12px", display: "flex", alignItems: "center", gap: "14px" }}>
                  <span className="material-symbols-outlined" style={{ fontSize: "22px", color: "var(--accent-red)" }}>{icon}</span>
                  <div>
                    <div style={{ fontSize: "22px", fontWeight: 800 }}>{value}</div>
                    <div style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.1em" }}>{label}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Race list */}
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {schedule.map((race, i) => {
                const isCompleted = new Date(race.date) < now;
                const isNext = i === nextRaceIndex;
                const countdown = !isCompleted ? getCountdown(race.date) : null;
                const circuitImg = CIRCUIT_IMAGES[race.circuitId];
                const flagUrl = getFlagUrl(race.country);

                return (
                  <div
                    key={race.round}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "20px",
                      padding: "18px 22px",
                      borderRadius: "12px",
                      background: isNext
                        ? "rgba(224,7,0,0.05)"
                        : isCompleted
                        ? "rgba(255,255,255,0.01)"
                        : "rgba(255,255,255,0.02)",
                      border: isNext
                        ? "1px solid rgba(224,7,0,0.2)"
                        : "1px solid rgba(255,255,255,0.04)",
                      borderLeft: isNext ? "3px solid var(--accent-red)" : "3px solid transparent",
                      opacity: isCompleted ? 0.55 : 1,
                      transition: "opacity 0.15s ease",
                    }}
                  >
                    {/* Flag + Round */}
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", width: "56px", flexShrink: 0 }}>
                      <img
                        src={flagUrl}
                        alt={race.country}
                        width={56}
                        height={37}
                        style={{ width: "56px", height: "37px", objectFit: "cover", borderRadius: "4px", display: "block" }}
                      />
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--text-muted)", letterSpacing: "0.08em" }}>
                        R{pad(race.round)}
                      </span>
                    </div>

                    {/* Race info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px", flexWrap: "wrap" }}>
                        {isNext && (
                          <span style={{ fontSize: "9px", fontWeight: 700, color: "white", background: "var(--accent-red)", padding: "2px 8px", borderRadius: "100px", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                            Next Up
                          </span>
                        )}
                        {isCompleted && (
                          <span style={{ fontSize: "9px", fontWeight: 700, color: "var(--text-muted)", background: "rgba(255,255,255,0.06)", padding: "2px 8px", borderRadius: "100px", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                            Completed
                          </span>
                        )}
                        <h3 style={{ fontSize: "15px", fontWeight: 700, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {race.raceName}
                        </h3>
                      </div>
                      <p style={{ fontSize: "12px", color: "var(--text-secondary)", margin: "0 0 4px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {race.circuitName}
                      </p>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                        <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--text-muted)" }}>
                          {new Date(race.date).toLocaleDateString("en-US", { weekday: "short", month: "long", day: "numeric" })}
                          {race.time && ` · ${race.time.slice(0, 5)} UTC`}
                        </span>
                        <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>{race.locality}, {race.country}</span>
                        {countdown && (
                          <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: isNext ? "var(--accent-red)" : "var(--text-secondary)", fontWeight: 600 }}>
                            in {countdown.days}d {pad(countdown.hours)}h
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Circuit map + action */}
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "10px", flexShrink: 0 }}>
                      {circuitImg && (
                        <img
                          src={circuitImg}
                          alt={`${race.raceName} circuit map`}
                          style={{ height: "52px", maxWidth: "110px", objectFit: "contain", filter: "grayscale(1) brightness(0.8)", opacity: isCompleted ? 0.5 : 0.8 }}
                        />
                      )}
                      {!isCompleted && (
                        <Link
                          href={`/simulate/${race.round}`}
                          style={{
                            display: "inline-flex", alignItems: "center", gap: "4px",
                            padding: "5px 12px", borderRadius: "6px",
                            background: isNext ? "var(--accent-red)" : "rgba(224,7,0,0.1)",
                            color: isNext ? "white" : "var(--accent-red)",
                            fontSize: "11px", fontWeight: 700, textDecoration: "none",
                            letterSpacing: "0.05em",
                          }}
                        >
                          Simulate
                          <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>chevron_right</span>
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <footer style={{ marginTop: "32px", paddingTop: "20px", borderTop: "1px solid rgba(224,7,0,0.07)", display: "flex", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--text-muted)", fontSize: "11px" }}>
                <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>update</span>
                Data sourced from Jolpi F1 API · Updates every 24 hours.
              </div>
            </footer>
      </div>
    </div>
  );
}
