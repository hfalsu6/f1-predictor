import Link from "next/link";
import { fetchDriverStandings, fetchConstructorStandings } from "@/lib/api/standings";
import { fetchRaceSchedule, getFutureRaces } from "@/lib/api/schedule";
import { StandingsWithProfile } from "@/components/standings/StandingsWithProfile";
import { CIRCUIT_IMAGES, getFlagUrl } from "@/constants/f1";

export const revalidate = 3600;

function getCountdown(dateStr: string) {
  const diff = new Date(dateStr).getTime() - Date.now();
  if (diff <= 0) return null;
  return {
    days:  Math.floor(diff / 864e5),
    hours: Math.floor((diff % 864e5) / 36e5),
    mins:  Math.floor((diff % 36e5) / 6e4),
  };
}

function pad(n: number) { return String(n).padStart(2, "0"); }

export default async function StandingsPage() {
  const [drivers, , schedule] = await Promise.all([
    fetchDriverStandings(),
    fetchConstructorStandings(),
    fetchRaceSchedule(),
  ]);

  const now = new Date();
  const futureRaces     = getFutureRaces(schedule);
  const nextRace        = futureRaces[0];
  const heroCountdown   = nextRace ? getCountdown(nextRace.date) : null;
  const nextRaceIndex   = schedule.findIndex((r) => new Date(r.date) >= now);
  const completedCount  = schedule.filter((r) => new Date(r.date) < now).length;
  const upcomingCount   = schedule.length - completedCount;

  return (
    <div style={{ padding: "32px" }}>
      <div style={{ maxWidth: "960px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "32px" }}>

        {/* Hero — full-width next race card (links to Maps) */}
        {nextRace && (
          <section>
            <Link href="/maps" style={{ display: "block", textDecoration: "none" }}>
            <div style={{
              position: "relative", borderRadius: "12px", overflow: "hidden", minHeight: "260px",
              background: "linear-gradient(145deg, #1a0808 0%, #2e1010 50%, #1a0808 100%)",
              cursor: "pointer",
            }}>
              <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(ellipse at 65% 40%, rgba(224,7,0,0.1) 0%, transparent 65%)" }} />
              {CIRCUIT_IMAGES[nextRace.circuitId] && (
                <>
                  <img
                    src={CIRCUIT_IMAGES[nextRace.circuitId]}
                    alt=""
                    aria-hidden
                    style={{
                      position: "absolute", right: "-5%", top: "50%",
                      transform: "translateY(-50%)",
                      height: "90%", width: "45%", objectFit: "contain",
                      filter: "grayscale(1) brightness(0.5)", opacity: 0.2, pointerEvents: "none",
                    }}
                  />
                  <div style={{
                    position: "absolute", inset: 0,
                    background: "linear-gradient(to right, rgba(26,8,8,1) 0%, rgba(26,8,8,0.95) 35%, rgba(26,8,8,0.4) 75%, rgba(26,8,8,0) 100%)",
                    pointerEvents: "none",
                  }} />
                </>
              )}
              <div style={{ position: "absolute", inset: 0, padding: "32px", display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
                <span style={{
                  display: "inline-flex", padding: "4px 12px", borderRadius: "100px",
                  background: "var(--accent-red)", color: "white",
                  fontSize: "10px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase",
                  marginBottom: "14px", width: "fit-content",
                }}>Next Up</span>
                {getFlagUrl && (
                  <img
                    src={getFlagUrl(nextRace.country)}
                    alt={nextRace.country}
                    style={{ width: "24px", height: "16px", objectFit: "cover", borderRadius: "2px", display: "inline-block", marginLeft: "8px", verticalAlign: "middle" }}
                  />
                )}
                <h1 style={{ fontSize: "34px", fontWeight: 700, color: "white", letterSpacing: "-0.02em", margin: "0 0 6px", lineHeight: 1.1 }}>
                  {nextRace.raceName}
                </h1>
                <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "13px", margin: "0 0 22px" }}>
                  {nextRace.circuitName} · {new Date(nextRace.date).toLocaleDateString("en-US", { month: "long", day: "numeric" })}
                </p>
                {heroCountdown && (
                  <div style={{ display: "flex", gap: "10px" }}>
                    {[
                      { value: pad(heroCountdown.days),  label: "Days"  },
                      { value: pad(heroCountdown.hours), label: "Hours" },
                      { value: pad(heroCountdown.mins),  label: "Mins"  },
                    ].map((item) => (
                      <div key={item.label} style={{
                        background: "rgba(255,255,255,0.07)", backdropFilter: "blur(8px)",
                        borderRadius: "8px", padding: "10px 14px", minWidth: "64px",
                        border: "1px solid rgba(255,255,255,0.08)", textAlign: "center",
                      }}>
                        <div style={{ fontSize: "22px", fontWeight: 700, color: "white" }}>{item.value}</div>
                        <div style={{ fontSize: "9px", color: "rgba(255,255,255,0.4)", letterSpacing: "0.14em", textTransform: "uppercase" }}>{item.label}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            </Link>
          </section>
        )}

        {/* Standings + Calendar sidebar */}
        <div style={{ display: "grid", gridTemplateColumns: "8fr 4fr", gap: "28px" }}>

          {/* Driver standings */}
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px", padding: "0 2px" }}>
              <h2 style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "16px", fontWeight: 700, margin: 0 }}>
                <span className="material-symbols-outlined" style={{ color: "var(--accent-red)", fontSize: "20px" }}>emoji_events</span>
                Driver Standings
              </h2>
              {nextRace && (
                <Link href={`/simulate/${nextRace.round}`} style={{ fontSize: "12px", color: "var(--accent-red)", textDecoration: "none", fontWeight: 500 }}>
                  View Simulator →
                </Link>
              )}
            </div>
            <div style={{ background: "rgba(224,7,0,0.02)", border: "1px solid rgba(224,7,0,0.08)", borderRadius: "12px", overflow: "hidden" }}>
              <StandingsWithProfile standings={drivers} />
            </div>
          </div>

          {/* Race calendar sidebar */}
          <div>
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px", padding: "0 2px" }}>
              <h2 style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "16px", fontWeight: 700, margin: 0 }}>
                <span className="material-symbols-outlined" style={{ color: "var(--accent-red)", fontSize: "20px" }}>calendar_month</span>
                {schedule[0]?.season ?? "2025"} Calendar
              </h2>
            </div>

            {/* Season stats */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "6px", marginBottom: "12px" }}>
              {[
                { label: "Total", value: schedule.length },
                { label: "Done",  value: completedCount  },
                { label: "Left",  value: upcomingCount   },
              ].map(({ label, value }) => (
                <div key={label} style={{
                  padding: "8px 6px", textAlign: "center",
                  background: "rgba(224,7,0,0.04)", borderRadius: "8px",
                  border: "1px solid rgba(224,7,0,0.08)",
                }}>
                  <div style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)" }}>{value}</div>
                  <div style={{ fontSize: "8px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</div>
                </div>
              ))}
            </div>

            {/* Scrollable full race list */}
            <div style={{ display: "flex", flexDirection: "column", gap: "5px", maxHeight: "520px", overflowY: "auto", paddingRight: "2px" }}>
              {schedule.map((race, i) => {
                const isCompleted = new Date(race.date) < now;
                const isNext      = i === nextRaceIndex;
                const cd          = isCompleted ? null : getCountdown(race.date);
                const flagUrl     = getFlagUrl(race.country);

                return (
                  <Link
                    key={race.round}
                    href={`/simulate/${race.round}`}
                    style={{
                      display: "flex", alignItems: "center", gap: "10px",
                      padding: "9px 11px", borderRadius: "8px", textDecoration: "none",
                      background: isNext ? "rgba(224,7,0,0.06)" : "rgba(255,255,255,0.02)",
                      border: isNext ? "1px solid rgba(224,7,0,0.18)" : "1px solid rgba(255,255,255,0.04)",
                      borderLeft: isNext ? "3px solid var(--accent-red)" : "3px solid transparent",
                      opacity: isCompleted ? 0.5 : 1,
                      transition: "opacity 0.15s ease",
                    }}
                  >
                    {/* Flag + round */}
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "3px", flexShrink: 0, width: "36px" }}>
                      <img
                        src={flagUrl}
                        alt={race.country}
                        style={{ width: "36px", height: "24px", objectFit: "cover", borderRadius: "3px" }}
                      />
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: "8px", color: "var(--text-muted)" }}>
                        R{pad(race.round)}
                      </span>
                    </div>

                    {/* Race info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "5px", marginBottom: "2px" }}>
                        {isNext && (
                          <span style={{ fontSize: "7px", fontWeight: 700, color: "white", background: "var(--accent-red)", padding: "1px 5px", borderRadius: "100px", letterSpacing: "0.08em", textTransform: "uppercase", flexShrink: 0 }}>
                            Next
                          </span>
                        )}
                        {isCompleted && (
                          <span style={{ fontSize: "7px", fontWeight: 700, color: "var(--text-muted)", background: "rgba(255,255,255,0.06)", padding: "1px 5px", borderRadius: "100px", letterSpacing: "0.08em", textTransform: "uppercase", flexShrink: 0 }}>
                            Done
                          </span>
                        )}
                        <p style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-primary)", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {race.raceName.replace(" Grand Prix", " GP")}
                        </p>
                      </div>
                      <p style={{ fontSize: "9px", color: "var(--text-muted)", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {new Date(race.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        {cd ? ` · in ${cd.days}d ${pad(cd.hours)}h` : ""}
                        {race.time ? ` · ${race.time.slice(0, 5)} UTC` : ""}
                      </p>
                      <p style={{ fontSize: "9px", color: "rgba(255,255,255,0.25)", margin: "1px 0 0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {race.circuitName}
                      </p>
                    </div>

                    <span className="material-symbols-outlined" style={{ fontSize: "14px", color: isNext ? "var(--accent-red)" : "rgba(255,255,255,0.15)", flexShrink: 0 }}>
                      chevron_right
                    </span>
                  </Link>
                );
              })}
            </div>

            {/* Track Focus — links to Maps */}
            {nextRace && (
              <Link
                href="/maps"
                style={{ display: "block", textDecoration: "none", marginTop: "14px" }}
              >
                <div style={{
                  padding: "16px", background: "rgba(224,7,0,0.05)", borderRadius: "12px",
                  border: "1px solid rgba(224,7,0,0.1)",
                  transition: "border-color 0.15s ease",
                  cursor: "pointer",
                }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
                    <p style={{ fontSize: "10px", fontWeight: 700, color: "var(--accent-red)", textTransform: "uppercase", letterSpacing: "0.15em", margin: 0 }}>
                      Track Focus: {nextRace.country}
                    </p>
                    <span className="material-symbols-outlined" style={{ fontSize: "14px", color: "var(--accent-red)" }}>open_in_full</span>
                  </div>
                  <div style={{ width: "100%", aspectRatio: "16/9", background: "rgba(0,0,0,0.25)", borderRadius: "8px", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {CIRCUIT_IMAGES[nextRace.circuitId] ? (
                      <img
                        src={CIRCUIT_IMAGES[nextRace.circuitId]}
                        alt={`${nextRace.raceName} circuit`}
                        style={{ width: "100%", height: "100%", objectFit: "contain", filter: "grayscale(1) brightness(0.85)", padding: "8px" }}
                      />
                    ) : (
                      <span className="material-symbols-outlined" style={{ fontSize: "48px", color: "rgba(224,7,0,0.2)" }}>map</span>
                    )}
                  </div>
                  <p style={{ fontSize: "9px", color: "var(--text-muted)", textAlign: "center", margin: "8px 0 0", display: "flex", alignItems: "center", justifyContent: "center", gap: "4px" }}>
                    <span className="material-symbols-outlined" style={{ fontSize: "11px" }}>map</span>
                    Click to open Maps Overview
                  </p>
                </div>
              </Link>
            )}
          </div>
        </div>

        {/* Footer — attribution only */}
        <footer style={{
          paddingTop: "20px", borderTop: "1px solid rgba(224,7,0,0.07)",
          display: "flex", alignItems: "center",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--text-muted)", fontSize: "11px" }}>
            <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>update</span>
            Data sourced from Jolpi F1 API · Updates every hour.
          </div>
        </footer>

      </div>
    </div>
  );
}
