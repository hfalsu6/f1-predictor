import type { DriverStanding } from "@/types/f1";
import { getConstructorColor } from "@/lib/api/mappers";

interface Props {
  projected: DriverStanding;
  baselinePosition: number;
}

export function StandingsDiffRow({ projected, baselinePosition }: Props) {
  const delta = baselinePosition - projected.position;
  const color = getConstructorColor(projected.driver.constructorId);

  return (
    <div
      className="stagger-row"
      style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        padding: "7px 8px",
        borderRadius: "4px",
        transition: "background 0.1s ease",
        cursor: "default",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,0.03)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.background = "transparent";
      }}
    >
      {/* Position */}
      <span style={{
        fontFamily: "var(--font-mono)",
        fontSize: "12px",
        fontWeight: 600,
        color: "var(--text-muted)",
        width: "20px",
        textAlign: "right",
        flexShrink: 0,
      }}>
        {projected.position}
      </span>

      {/* Delta */}
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

      {/* Constructor bar */}
      <span style={{
        width: "3px",
        height: "16px",
        borderRadius: "2px",
        background: color,
        flexShrink: 0,
        boxShadow: `0 0 5px ${color}50`,
      }} />

      {/* Driver code */}
      <span style={{
        fontFamily: "var(--font-data)",
        fontSize: "13px",
        fontWeight: 700,
        letterSpacing: "0.05em",
        color: "var(--text-primary)",
        flex: 1,
      }}>
        {projected.driver.code}
      </span>

      {/* Points */}
      <span style={{
        fontFamily: "var(--font-mono)",
        fontSize: "12px",
        fontWeight: 600,
        color: "var(--text-secondary)",
        flexShrink: 0,
      }}>
        {projected.points}
      </span>
    </div>
  );
}
