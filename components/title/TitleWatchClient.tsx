"use client";
import { useState } from "react";
import type { DriverStanding, Race } from "@/types/f1";
import { getConstructorColor } from "@/lib/api/mappers";
import { computeTitlePath } from "@/lib/f1/title-math";

interface Props {
  standings: DriverStanding[];
  futureRaces: Race[];
  completedCount: number;
}

export function TitleWatchClient({ standings, futureRaces, completedCount }: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(standings[0]?.driver.driverId ?? null);

  const selected = standings.find(s => s.driver.driverId === selectedId);
  const titlePath = selected ? computeTitlePath(selected, standings, futureRaces) : null;

  const maxPossible = futureRaces.length * 26;

  return (
    <div className="title-watch-layout" style={{ display: "flex", gap: "24px", alignItems: "flex-start" }}>

      {/* Left: Driver selector + gap chart */}
      <div className="title-watch-sidebar" style={{ width: "300px", flexShrink: 0, display: "flex", flexDirection: "column", gap: "8px" }}>
        <h2 style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.12em", textTransform: "uppercase", margin: "0 0 6px" }}>
          Contenders
        </h2>
        {standings.map(s => {
          const col = getConstructorColor(s.driver.constructorId);
          const isSelected = s.driver.driverId === selectedId;
          const maxAvail = s.points + maxPossible;
          const leader = standings[0];
          const canCatch = maxAvail >= leader.points;

          return (
            <button
              key={s.driver.driverId}
              onClick={() => setSelectedId(s.driver.driverId)}
              style={{
                all: "unset", cursor: "pointer",
                display: "flex", alignItems: "center", gap: "10px",
                padding: "10px 12px", borderRadius: "8px",
                background: isSelected ? `${col}12` : "rgba(255,255,255,0.02)",
                border: `1px solid ${isSelected ? col + "40" : "rgba(255,255,255,0.06)"}`,
                transition: "all 0.15s ease",
                opacity: canCatch ? 1 : 0.45,
              }}
            >
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--text-muted)", minWidth: "20px" }}>
                P{s.position}
              </span>
              <span style={{ width: "3px", height: "28px", borderRadius: "2px", background: col, flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "13px", fontWeight: 700, color: "var(--text-primary)" }}>
                    {s.driver.code}
                  </span>
                  {!canCatch && (
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "8px", color: "rgba(224,7,0,0.6)", letterSpacing: "0.08em" }}>
                      OUT
                    </span>
                  )}
                </div>
                <div style={{ fontSize: "10px", color: "var(--text-muted)" }}>
                  {s.driver.constructorName}
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: "13px", fontWeight: 700, color: "var(--text-primary)" }}>
                  {s.points}
                </div>
                {s.position > 1 && (
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: "9px", color: "rgba(224,7,0,0.7)" }}>
                    -{leader.points - s.points}
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Right: Title path analysis */}
      {titlePath && selected && (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "16px" }}>

          {/* Title path header */}
          <div style={{
            padding: "20px 24px",
            background: titlePath.canWin ? "rgba(57,211,83,0.04)" : "rgba(224,7,0,0.04)",
            border: `1px solid ${titlePath.canWin ? "rgba(57,211,83,0.15)" : "rgba(224,7,0,0.15)"}`,
            borderRadius: "12px",
            display: "flex", alignItems: "center", gap: "20px",
          }}>
            <div style={{
              width: "48px", height: "48px", borderRadius: "50%",
              background: `${getConstructorColor(selected.driver.constructorId)}20`,
              border: `2px solid ${getConstructorColor(selected.driver.constructorId)}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}>
              <span style={{
                fontFamily: "var(--font-mono)", fontSize: "14px", fontWeight: 700,
                color: getConstructorColor(selected.driver.constructorId),
              }}>{selected.driver.code}</span>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "18px", fontWeight: 800, letterSpacing: "-0.01em", marginBottom: "2px" }}>
                {selected.driver.givenName} {selected.driver.familyName}
              </div>
              <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                {selected.driver.constructorName} · P{selected.position} · {selected.points} pts
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              {titlePath.alreadyWon ? (
                <div style={{ fontSize: "20px", fontWeight: 800, color: "var(--accent-red)" }}>CHAMPION</div>
              ) : titlePath.canWin ? (
                <>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: "22px", fontWeight: 800, color: "rgba(57,211,83,0.9)" }}>
                    +{titlePath.maxGain}
                  </div>
                  <div style={{ fontSize: "10px", color: "var(--text-muted)" }}>max pts available</div>
                </>
              ) : (
                <>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: "22px", fontWeight: 800, color: "rgba(224,7,0,0.7)" }}>
                    ELIMINATED
                  </div>
                  <div style={{ fontSize: "10px", color: "var(--text-muted)" }}>mathematically out</div>
                </>
              )}
            </div>
          </div>

          {/* Points trajectory bar */}
          {titlePath.canWin && (
            <div style={{ padding: "16px 20px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "10px" }}>
              <div style={{ fontSize: "11px", color: "var(--text-muted)", marginBottom: "10px", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700 }}>
                Path to Title — Optimistic Scenario
              </div>
              {titlePath.minimumScenario.slice(0, 8).map(race => (
                <div key={race.round} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "5px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "9px", color: "var(--text-muted)", minWidth: "24px" }}>
                    R{race.round}
                  </span>
                  <span style={{ fontSize: "11px", color: "var(--text-secondary)", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {race.raceName.replace(" Grand Prix", " GP")}
                  </span>
                  <span style={{
                    fontFamily: "var(--font-mono)", fontSize: "10px", fontWeight: 700,
                    color: race.minRequired === null ? "rgba(57,211,83,0.7)" : race.minRequired <= 3 ? "var(--accent-red)" : "var(--text-secondary)",
                    minWidth: "40px", textAlign: "right",
                  }}>
                    {race.minRequired === null ? "ANY" : `P${race.minRequired}+`}
                  </span>
                </div>
              ))}
              {titlePath.minimumScenario.length > 8 && (
                <div style={{ fontSize: "10px", color: "var(--text-muted)", padding: "6px 0 0", textAlign: "center" }}>
                  +{titlePath.minimumScenario.length - 8} more races
                </div>
              )}
            </div>
          )}

          {/* Gap chart: visual bar comparing contenders */}
          <div style={{ padding: "16px 20px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "10px" }}>
            <div style={{ fontSize: "11px", color: "var(--text-muted)", marginBottom: "12px", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700 }}>
              Championship Gap
            </div>
            {standings.slice(0, 8).map(s => {
              const col = getConstructorColor(s.driver.constructorId);
              const maxPts = standings[0].points + 10; // normalize to leader
              const barW = Math.max(2, (s.points / maxPts) * 100);
              const isThis = s.driver.driverId === selectedId;
              return (
                <div key={s.driver.driverId} style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "9px", color: "var(--text-muted)", minWidth: "28px" }}>
                    {s.driver.code}
                  </span>
                  <div style={{ flex: 1, height: "6px", background: "rgba(255,255,255,0.05)", borderRadius: "3px", overflow: "hidden" }}>
                    <div style={{
                      height: "100%", width: `${barW}%`,
                      background: isThis ? col : col + "55",
                      borderRadius: "3px",
                      transition: "width 0.4s ease",
                    }} />
                  </div>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: isThis ? "var(--text-primary)" : "var(--text-muted)", minWidth: "30px", textAlign: "right" }}>
                    {s.points}
                  </span>
                </div>
              );
            })}
          </div>

        </div>
      )}
    </div>
  );
}
