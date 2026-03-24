"use client";
import type { DriverStanding } from "@/types/f1";
import { getConstructorColor } from "@/lib/api/mappers";

interface DriverStandingsTableProps {
  standings: DriverStanding[];
  onDriverClick?: (driverId: string) => void;
}

export function DriverStandingsTable({ standings, onDriverClick }: DriverStandingsTableProps) {
  return (
    <table style={{ width: "100%", borderCollapse: "collapse" }}>
      <thead>
        <tr style={{ background: "rgba(224,7,0,0.06)" }}>
          {["Pos", "Driver", "Team", "Pts"].map((h, i) => (
            <th
              key={h}
              style={{
                padding: "12px 20px",
                fontSize: "10px",
                fontWeight: 700,
                color: "var(--text-muted)",
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                textAlign: i === 3 ? "right" : "left",
                fontFamily: "var(--font-sans)",
              }}
            >
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {standings.map((s, i) => {
          const color = getConstructorColor(s.driver.constructorId);
          const r = parseInt(color.slice(1, 3), 16);
          const g = parseInt(color.slice(3, 5), 16);
          const b = parseInt(color.slice(5, 7), 16);
          const initials = `${s.driver.givenName[0]}${s.driver.familyName[0]}`;
          const isLeader = i === 0;

          return (
            <tr
              key={s.driver.driverId}
              className="stagger-row row-hover"
              onClick={onDriverClick ? () => onDriverClick(s.driver.driverId) : undefined}
              style={{
                borderBottom: "1px solid rgba(224,7,0,0.05)",
                transition: "background 0.15s ease",
                cursor: onDriverClick ? "pointer" : undefined,
              }}
            >
              {/* Position */}
              <td style={{ padding: "14px 20px", width: "56px" }}>
                <span style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "22px",
                  fontWeight: 900,
                  fontStyle: "italic",
                  color: "var(--text-muted)",
                }}>
                  {String(s.position).padStart(2, "0")}
                </span>
              </td>

              {/* Driver */}
              <td style={{ padding: "14px 20px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  {/* Avatar */}
                  <div style={{
                    width: "38px", height: "38px", borderRadius: "50%", flexShrink: 0,
                    background: `rgba(${r},${g},${b},0.14)`,
                    border: `2px solid ${isLeader ? color : "transparent"}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <span style={{ fontSize: "12px", fontWeight: 700, color, fontFamily: "var(--font-sans)" }}>
                      {initials}
                    </span>
                  </div>
                  <div>
                    <p style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)", margin: "0 0 2px", fontFamily: "var(--font-sans)" }}>
                      {s.driver.givenName} {s.driver.familyName}
                    </p>
                    <p style={{ fontSize: "11px", color: "var(--text-muted)", margin: 0, fontFamily: "var(--font-sans)" }}>
                      {s.driver.nationality}
                    </p>
                  </div>
                </div>
              </td>

              {/* Team badge */}
              <td style={{ padding: "14px 20px" }}>
                <span style={{
                  display: "inline-block",
                  padding: "3px 10px",
                  borderRadius: "100px",
                  background: "rgba(224,7,0,0.08)",
                  border: "1px solid rgba(224,7,0,0.14)",
                  color: "var(--accent-red)",
                  fontSize: "10px",
                  fontWeight: 700,
                  letterSpacing: "0.07em",
                  textTransform: "uppercase",
                  whiteSpace: "nowrap",
                  fontFamily: "var(--font-sans)",
                }}>
                  {s.driver.constructorName}
                </span>
              </td>

              {/* Points */}
              <td style={{ padding: "14px 20px", textAlign: "right" }}>
                <span style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "20px",
                  fontWeight: 900,
                  color: isLeader ? "var(--accent-red)" : "var(--text-secondary)",
                }}>
                  {s.points}
                </span>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
