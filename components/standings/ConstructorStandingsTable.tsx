import type { ConstructorStanding } from "@/types/f1";
import { getConstructorColor } from "@/lib/api/mappers";

export function ConstructorStandingsTable({ standings }: { standings: ConstructorStanding[] }) {
  const leader = standings[0]?.points ?? 0;

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            {["POS", "CONSTRUCTOR", "PTS", "GAP"].map((h) => (
              <th
                key={h}
                style={{
                  paddingBottom: "12px",
                  paddingTop: "4px",
                  paddingRight: h !== "GAP" ? "16px" : 0,
                  textAlign: h === "PTS" || h === "GAP" ? "right" : "left",
                  fontFamily: "var(--font-mono)",
                  fontSize: "10px",
                  letterSpacing: "0.15em",
                  color: "var(--text-muted)",
                  fontWeight: 500,
                }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {standings.map((cs, i) => {
            const color = getConstructorColor(cs.constructorId);
            const gap = leader - cs.points;
            const isLeader = i === 0;

            return (
              <tr
                key={cs.constructorId}
                className="stagger-row row-hover"
                style={{ borderBottom: "1px solid rgba(255,255,255,0.04)", transition: "background 0.15s ease" }}
              >
                <td style={{ padding: "11px 16px 11px 0", width: "40px" }}>
                  <span style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "13px",
                    fontWeight: 600,
                    color: isLeader ? "var(--accent-red)" : "var(--text-muted)",
                  }}>
                    {String(cs.position).padStart(2, "0")}
                  </span>
                </td>

                <td style={{ padding: "11px 16px 11px 0" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span style={{
                      width: "3px",
                      height: "22px",
                      borderRadius: "2px",
                      background: color,
                      flexShrink: 0,
                      boxShadow: `0 0 8px ${color}60`,
                    }} />
                    <span style={{
                      fontFamily: "var(--font-data)",
                      fontSize: "14px",
                      fontWeight: 600,
                      letterSpacing: "0.03em",
                      color: "var(--text-primary)",
                    }}>
                      {cs.constructorName}
                    </span>
                  </div>
                </td>

                <td style={{ padding: "11px 0", textAlign: "right" }}>
                  <span style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "14px",
                    fontWeight: 600,
                    color: "var(--text-primary)",
                  }}>
                    {cs.points}
                  </span>
                </td>

                <td style={{ padding: "11px 0 11px 16px", textAlign: "right" }}>
                  <span style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "12px",
                    color: isLeader ? "var(--accent-orange)" : "var(--text-muted)",
                  }}>
                    {isLeader ? "LEAD" : `–${gap}`}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
