"use client";
import { useSimulationStore } from "@/store/simulationStore";
import { computeChampionshipSwing } from "@/lib/f1/championship-swing";
import { getConstructorColor } from "@/lib/api/mappers";

export function ChampionshipSwingPanel() {
  const pre  = useSimulationStore(s => s.preRaceDriverStandings);
  const post = useSimulationStore(s => s.projectedDriverStandings);
  const sim  = useSimulationStore(s => s.simulations[s.currentRaceIndex]);

  if (!sim?.isComplete) return null;

  const swing = computeChampionshipSwing(pre, post);

  if (swing.overtakes.length === 0 && !swing.leaderChanged && swing.pointsGained.filter(d => d.delta > 0).length === 0) return null;

  return (
    <div style={{
      borderTop: "1px solid var(--border)",
      background: "var(--bg-surface)",
      padding: "10px 20px",
      display: "flex",
      flexWrap: "wrap",
      gap: "8px",
      alignItems: "center",
      flexShrink: 0,
    }}>
      <span style={{
        fontFamily: "var(--font-mono)", fontSize: "9px",
        letterSpacing: "0.14em", color: "var(--text-muted)",
        marginRight: "4px",
      }}>SWING</span>

      {swing.leaderChanged && swing.newLeader && (
        <div style={{
          display: "flex", alignItems: "center", gap: "5px",
          background: "rgba(224,7,0,0.08)", border: "1px solid rgba(224,7,0,0.2)",
          borderRadius: "4px", padding: "3px 8px",
        }}>
          <span className="material-symbols-outlined" style={{ fontSize: "12px", color: "var(--accent-red)" }}>military_tech</span>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--accent-red)", fontWeight: 700 }}>
            NEW LEADER: {swing.newLeader.driver.code}
          </span>
        </div>
      )}

      {swing.overtakes.map((ev, i) => (
        <div key={i} style={{
          display: "flex", alignItems: "center", gap: "4px",
          background: "rgba(57,211,83,0.05)", border: "1px solid rgba(57,211,83,0.12)",
          borderRadius: "4px", padding: "3px 8px",
        }}>
          <span style={{
            fontFamily: "var(--font-mono)", fontSize: "10px",
            color: "rgba(57,211,83,0.9)",
          }}>
            {ev.driver.driver.code} ↑ P{ev.driver.position}
          </span>
          <span style={{ fontSize: "9px", color: "var(--text-muted)" }}>
            over {ev.overtook.driver.code}
          </span>
        </div>
      ))}

      {swing.pointsGained.slice(0, 5).map(({ standing, delta }) => (
        <div key={standing.driver.driverId} style={{
          display: "flex", alignItems: "center", gap: "4px",
          borderRadius: "4px", padding: "3px 7px",
          background: delta > 0 ? "rgba(255,255,255,0.03)" : "rgba(224,7,0,0.03)",
          border: `1px solid ${delta > 0 ? "rgba(255,255,255,0.08)" : "rgba(224,7,0,0.1)"}`,
        }}>
          <span style={{
            width: "2px", height: "10px", borderRadius: "1px",
            background: getConstructorColor(standing.driver.constructorId),
          }} />
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--text-secondary)" }}>
            {standing.driver.code}
          </span>
          <span style={{
            fontFamily: "var(--font-mono)", fontSize: "10px", fontWeight: 700,
            color: delta > 0 ? "rgba(57,211,83,0.9)" : "rgba(224,7,0,0.7)",
          }}>
            {delta > 0 ? `+${delta}` : String(delta)}
          </span>
        </div>
      ))}
    </div>
  );
}
