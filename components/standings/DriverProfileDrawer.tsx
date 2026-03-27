"use client";
import { useEffect, useState } from "react";
import { fetchDriverSeasonSummary, type DriverSeasonSummary } from "@/lib/api/driver-results";
import { getConstructorColor } from "@/lib/api/mappers";
import { getDriverImageUrl } from "@/constants/f1";
import type { DriverStanding } from "@/types/f1";

interface Props {
  standing: DriverStanding | null;
  onClose: () => void;
}

function PointsSparkline({ points }: { points: number[] }) {
  if (points.length < 2) return null;
  const max = Math.max(...points, 1);
  const W = 200, H = 40;
  const pts = points.map((p, i) => `${(i / (points.length - 1)) * W},${H - (p / max) * H}`).join(" ");
  return (
    <svg width={W} height={H} style={{ overflow: "visible", width: "100%" }}>
      <polyline points={pts} fill="none" stroke="var(--accent-red)" strokeWidth="1.5" strokeLinejoin="round" />
      {points.map((p, i) => (
        <circle key={i} cx={(i / (points.length - 1)) * W} cy={H - (p / max) * H} r="2.5" fill={p > 0 ? "var(--accent-red)" : "rgba(255,255,255,0.2)"} />
      ))}
    </svg>
  );
}

export function DriverProfileDrawer({ standing, onClose }: Props) {
  const [summary, setSummary] = useState<DriverSeasonSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [imgFailed, setImgFailed] = useState(false);

  useEffect(() => {
    if (!standing) { setSummary(null); return; }
    setLoading(true);
    setSummary(null);
    setImgFailed(false);

    fetchDriverSeasonSummary(standing.driver.driverId).then(s => {
      setSummary(s);
      setLoading(false);
    });
  }, [standing?.driver.driverId]);

  if (!standing) return null;

  const color = getConstructorColor(standing.driver.constructorId);

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed", inset: 0, zIndex: 40,
          background: "rgba(0,0,0,0.65)",
          backdropFilter: "blur(4px)",
          animation: "fadeIn 0.2s ease",
        }}
      />

      {/* Centered modal */}
      <div style={{
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: "min(520px, calc(100vw - 48px))",
        maxHeight: "85vh",
        zIndex: 50,
        background: "var(--bg-base)",
        border: "1px solid var(--border)",
        borderRadius: "16px",
        display: "flex",
        flexDirection: "column",
        animation: "fadeIn 0.2s ease",
        overflowY: "auto",
      }}>

        {/* Header */}
        <div style={{
          padding: "24px 24px 20px",
          borderBottom: "1px solid var(--border)",
          background: `linear-gradient(135deg, ${color}10 0%, transparent 100%)`,
          flexShrink: 0,
          position: "relative",
        }}>
          {/* Close button */}
          <button
            onClick={onClose}
            style={{
              position: "absolute", top: "16px", right: "16px",
              background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
              cursor: "pointer", color: "var(--text-muted)",
              width: "32px", height: "32px", borderRadius: "50%",
              display: "flex", alignItems: "center", justifyContent: "center",
              padding: 0,
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>close</span>
          </button>

          <div style={{ display: "flex", alignItems: "flex-start", gap: "18px" }}>
            {/* Driver photo */}
            {(() => {
              const photoUrl = getDriverImageUrl(standing.driver.driverId);
              return (
                <div style={{
                  width: "100px", height: "120px", borderRadius: "12px",
                  background: `${color}15`, border: `2px solid ${color}40`,
                  overflow: "hidden", flexShrink: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  {photoUrl && !imgFailed ? (
                    <img
                      src={photoUrl}
                      alt={`${standing.driver.givenName} ${standing.driver.familyName}`}
                      onError={() => setImgFailed(true)}
                      style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top center" }}
                    />
                  ) : (
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "22px", fontWeight: 800, color }}>
                      {standing.driver.code}
                    </span>
                  )}
                </div>
              );
            })()}

            {/* Driver info */}
            <div style={{ flex: 1, paddingTop: "6px", paddingRight: "40px" }}>
              <div style={{ fontSize: "22px", fontWeight: 800, letterSpacing: "-0.01em", lineHeight: 1.1 }}>
                {standing.driver.givenName}<br />{standing.driver.familyName}
              </div>
              <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "5px" }}>
                #{standing.driver.permanentNumber} · {standing.driver.constructorName}
              </div>
            </div>
          </div>

          {/* Key stats */}
          <div style={{ display: "flex", gap: "12px", marginTop: "18px" }}>
            {[
              { label: "Position", value: `P${standing.position}` },
              { label: "Points",   value: String(standing.points) },
              { label: "Wins",     value: String(standing.wins) },
            ].map(({ label, value }) => (
              <div key={label} style={{
                flex: 1, padding: "10px", textAlign: "center",
                background: "rgba(255,255,255,0.04)", borderRadius: "8px",
                border: "1px solid rgba(255,255,255,0.06)",
              }}>
                <div style={{ fontSize: "18px", fontWeight: 800, color: "var(--text-primary)" }}>{value}</div>
                <div style={{ fontSize: "9px", color: "var(--text-muted)", letterSpacing: "0.1em", textTransform: "uppercase" }}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: "20px" }}>

          {loading && (
            <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--text-muted)" }}>
              <span className="material-symbols-outlined" style={{ fontSize: "16px", animation: "spin 1s linear infinite" }}>progress_activity</span>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "10px" }}>Loading season data...</span>
            </div>
          )}

          {summary && (
            <>
              {/* Season stats */}
              <div>
                <div style={{ fontSize: "10px", fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "10px" }}>
                  Season Stats
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                  {[
                    { label: "Wins",         value: summary.wins,                                             icon: "emoji_events"      },
                    { label: "Podiums",       value: summary.podiums,                                          icon: "social_leaderboard" },
                    { label: "Best Finish",   value: summary.bestFinish ? `P${summary.bestFinish}` : "—",     icon: "flag"              },
                    { label: "Fastest Laps",  value: summary.fastestLaps,                                      icon: "speed"             },
                    { label: "DNFs",          value: summary.dnfCount,                                         icon: "report"            },
                    { label: "Races",         value: summary.raceResults.length,                               icon: "calendar_today"    },
                  ].map(({ label, value, icon }) => (
                    <div key={label} style={{
                      display: "flex", alignItems: "center", gap: "8px",
                      padding: "8px 10px",
                      background: "rgba(255,255,255,0.02)", borderRadius: "6px",
                      border: "1px solid rgba(255,255,255,0.05)",
                    }}>
                      <span className="material-symbols-outlined" style={{ fontSize: "14px", color, opacity: 0.7 }}>{icon}</span>
                      <div>
                        <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)" }}>{value}</div>
                        <div style={{ fontSize: "9px", color: "var(--text-muted)" }}>{label}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Points trajectory sparkline */}
              {summary.pointsPerRound.length > 1 && (
                <div>
                  <div style={{ fontSize: "10px", fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "10px" }}>
                    Points Per Race
                  </div>
                  <div style={{ padding: "12px", background: "rgba(255,255,255,0.02)", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.05)", overflowX: "auto" }}>
                    <PointsSparkline points={summary.pointsPerRound} />
                  </div>
                </div>
              )}

              {/* Recent results */}
              <div>
                <div style={{ fontSize: "10px", fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "10px" }}>
                  Race Results
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  {summary.raceResults.slice(-10).reverse().map(r => (
                    <div key={r.round} style={{
                      display: "flex", alignItems: "center", gap: "8px",
                      padding: "5px 8px", borderRadius: "5px",
                      background: r.position === 1 ? "rgba(224,7,0,0.06)" : "rgba(255,255,255,0.02)",
                      border: `1px solid ${r.position === 1 ? "rgba(224,7,0,0.15)" : "rgba(255,255,255,0.04)"}`,
                    }}>
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: "9px", color: "var(--text-muted)", minWidth: "18px" }}>
                        R{r.round}
                      </span>
                      <span style={{
                        flex: 1, fontSize: "10px", color: "var(--text-secondary)",
                        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                      }}>
                        {r.raceName.replace(" Grand Prix", " GP")}
                      </span>
                      <span style={{
                        fontFamily: "var(--font-mono)", fontSize: "11px", fontWeight: 700,
                        color: r.dnf ? "rgba(224,7,0,0.6)" : r.position !== null && r.position <= 3 ? "var(--accent-red)" : "var(--text-secondary)",
                        minWidth: "28px", textAlign: "right",
                      }}>
                        {r.dnf ? "DNF" : r.position !== null ? `P${r.position}` : "—"}
                      </span>
                      {r.points > 0 && (
                        <span style={{ fontFamily: "var(--font-mono)", fontSize: "9px", color: "var(--text-muted)", minWidth: "24px", textAlign: "right" }}>
                          +{r.points}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
