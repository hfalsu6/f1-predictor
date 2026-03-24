"use client";
import { useState } from "react";
import type { CompletedRaceResult } from "@/types/f1";
import { getConstructorColor } from "@/lib/api/mappers";

interface Props {
  results: CompletedRaceResult[];
  raceName: string;
}

export function ActualResultsPanel({ results, raceName }: Props) {
  const [open, setOpen] = useState(false);
  if (!results.length) return null;

  return (
    <div style={{
      borderBottom: "1px solid var(--border)",
      background: "rgba(255,255,255,0.015)",
      flexShrink: 0,
    }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: "100%", display: "flex", alignItems: "center", gap: "8px",
          padding: "8px 24px",
          background: "transparent", border: "none",
          cursor: "pointer", textAlign: "left",
          color: "var(--text-muted)",
        }}
      >
        <span className="material-symbols-outlined" style={{ fontSize: "14px", color: "rgba(57,211,83,0.6)" }}>
          check_circle
        </span>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: "9px", letterSpacing: "0.14em" }}>
          ACTUAL RESULTS — {raceName.replace(" Grand Prix", " GP")}
        </span>
        <span className="material-symbols-outlined" style={{
          fontSize: "14px", marginLeft: "auto",
          transform: open ? "rotate(180deg)" : "none",
          transition: "transform 0.2s ease",
        }}>
          expand_more
        </span>
      </button>

      {open && (
        <div style={{
          padding: "4px 24px 12px",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
          gap: "4px",
        }}>
          {results.slice(0, 20).map(r => (
            <div key={r.driverId} style={{
              display: "flex", alignItems: "center", gap: "6px",
              padding: "4px 6px", borderRadius: "4px",
              background: "rgba(255,255,255,0.02)",
            }}>
              <span style={{
                fontFamily: "var(--font-mono)", fontSize: "10px",
                color: r.position <= 3 ? "var(--accent-red)" : "var(--text-muted)",
                minWidth: "16px",
              }}>
                {r.position <= 3 ? (["🥇","🥈","🥉"] as const)[r.position - 1] : `P${r.position}`}
              </span>
              <span style={{
                width: "2px", height: "10px", borderRadius: "1px",
                background: getConstructorColor(r.constructorId),
                flexShrink: 0,
              }} />
              <span style={{
                fontFamily: "var(--font-mono)", fontSize: "10px",
                color: "var(--text-secondary)", fontWeight: 600,
              }}>
                {r.driverCode}
              </span>
              {r.hasFastestLap && (
                <span style={{ fontSize: "8px", color: "#a855f7" }}>⚡</span>
              )}
              {r.points > 0 && (
                <span style={{
                  fontFamily: "var(--font-mono)", fontSize: "9px",
                  color: "var(--text-muted)", marginLeft: "auto",
                }}>
                  +{r.points}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
