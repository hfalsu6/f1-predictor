"use client";

import { useState } from "react";
import { useSimulationStore } from "@/store/simulationStore";
import { StandingsDiffRow } from "./StandingsDiffRow";
import { getConstructorColor } from "@/lib/api/mappers";

type Tab = "drivers" | "constructors";

export function LiveStandingsPanel() {
  const [tab, setTab] = useState<Tab>("drivers");

  const projected             = useSimulationStore((s) => s.projectedDriverStandings);
  const projectedConstructors = useSimulationStore((s) => s.projectedConstructorStandings);
  const preRace               = useSimulationStore((s) => s.preRaceDriverStandings);
  const preRaceConstructors   = useSimulationStore((s) => s.preRaceConstructorStandings);

  // Delta compares against standings *before* this race, not the original season baseline.
  // This prevents drivers that improved in earlier simulated races from always showing green.
  const baselinePositionMap = Object.fromEntries(
    preRace.map((s) => [s.driver.driverId, s.position])
  );
  const baselineConstructorPositionMap = Object.fromEntries(
    preRaceConstructors.map((cs) => [cs.constructorId, cs.position])
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>

      {/* Tab switcher */}
      <div style={{
        display: "flex",
        borderBottom: "1px solid var(--border)",
        marginBottom: "8px",
        flexShrink: 0,
      }}>
        {(["drivers", "constructors"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              flex: 1,
              padding: "10px 4px",
              background: "none",
              border: "none",
              borderBottom: tab === t ? "2px solid var(--accent-red)" : "2px solid transparent",
              cursor: "pointer",
              fontFamily: "var(--font-mono)",
              fontSize: "10px",
              fontWeight: 500,
              letterSpacing: "0.12em",
              color: tab === t ? "var(--text-primary)" : "var(--text-muted)",
              transition: "color 0.15s ease",
              textTransform: "uppercase",
              marginBottom: "-1px",
            }}
          >
            {t === "drivers" ? "DRV" : "CON"}
          </button>
        ))}
      </div>

      {/* Scrollable content */}
      <div style={{ flex: 1, overflowY: "auto" }}>
        {tab === "drivers" ? (
          <div>
            {projected.map((s) => (
              <StandingsDiffRow
                key={s.driver.driverId}
                projected={s}
                baselinePosition={baselinePositionMap[s.driver.driverId] ?? s.position}
              />
            ))}
          </div>
        ) : (
          <div>
            {projectedConstructors.map((cs) => {
              const basePos = baselineConstructorPositionMap[cs.constructorId] ?? cs.position;
              const delta   = basePos - cs.position;
              const color   = getConstructorColor(cs.constructorId);

              return (
                <div
                  key={cs.constructorId}
                  className="stagger-row"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "7px 8px",
                    borderRadius: "4px",
                    transition: "background 0.1s ease",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,0.03)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLDivElement).style.background = "transparent";
                  }}
                >
                  <span style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "12px",
                    fontWeight: 600,
                    color: "var(--text-muted)",
                    width: "20px",
                    textAlign: "right",
                    flexShrink: 0,
                  }}>
                    {cs.position}
                  </span>

                  <span style={{
                    width: "28px",
                    textAlign: "center",
                    flexShrink: 0,
                    fontFamily: "var(--font-mono)",
                    fontSize: "11px",
                    fontWeight: 600,
                  }}>
                    {delta > 0 ? (
                      <span style={{ color: "var(--accent-green)" }}>↑{delta}</span>
                    ) : delta < 0 ? (
                      <span style={{ color: "var(--accent-red)" }}>↓{Math.abs(delta)}</span>
                    ) : (
                      <span style={{ color: "var(--text-muted)", opacity: 0.4 }}>—</span>
                    )}
                  </span>

                  <span style={{
                    width: "3px",
                    height: "16px",
                    borderRadius: "2px",
                    background: color,
                    flexShrink: 0,
                    boxShadow: `0 0 5px ${color}50`,
                  }} />

                  <span style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "12px",
                    fontWeight: 700,
                    color: "var(--text-primary)",
                    flex: 1,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}>
                    {cs.constructorName}
                  </span>

                  <span style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "12px",
                    fontWeight: 600,
                    color: "var(--text-secondary)",
                    flexShrink: 0,
                  }}>
                    {cs.points}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
