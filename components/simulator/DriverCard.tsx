import { getConstructorColor } from "@/lib/api/mappers";
import type { Driver } from "@/types/f1";
import { cn } from "@/components/ui";

interface Props {
  driver: Driver;
  isAssigned?: boolean;
  isDragging?: boolean;
  className?: string;
}

export function DriverCard({ driver, isAssigned, isDragging, className }: Props) {
  const color = getConstructorColor(driver.constructorId);

  return (
    <div
      className={cn(className)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "10px",
        padding: "10px 14px",
        background: isDragging
          ? "var(--bg-elevated)"
          : isAssigned
          ? "rgba(255,255,255,0.02)"
          : "var(--bg-surface)",
        border: isDragging
          ? `1px solid ${color}50`
          : isAssigned
          ? "1px solid rgba(255,255,255,0.04)"
          : "1px solid var(--border-mid)",
        borderRadius: "6px",
        cursor: isAssigned ? "default" : isDragging ? "grabbing" : "grab",
        opacity: isAssigned ? 0.4 : 1,
        boxShadow: isDragging ? `0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px ${color}40` : "none",
        transform: isDragging ? "rotate(1.5deg) scale(1.04)" : "none",
        transition: isDragging ? "none" : "border-color 0.15s ease, background 0.15s ease",
        userSelect: "none",
      }}
    >
      {/* Constructor color bar */}
      <span style={{
        width: "3px",
        height: "22px",
        borderRadius: "2px",
        background: color,
        flexShrink: 0,
        boxShadow: isAssigned ? "none" : `0 0 6px ${color}70`,
      }} />

      {/* Driver code */}
      <span style={{
        fontFamily: "var(--font-data)",
        fontSize: "15px",
        fontWeight: 700,
        letterSpacing: "0.06em",
        color: "var(--text-primary)",
        width: "38px",
        flexShrink: 0,
      }}>
        {driver.code}
      </span>

      {/* Last name */}
      <span style={{
        fontFamily: "var(--font-display)",
        fontSize: "12px",
        color: "var(--text-secondary)",
        flex: 1,
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
      }}>
        {driver.familyName}
      </span>

      {/* Car number */}
      <span style={{
        fontFamily: "var(--font-mono)",
        fontSize: "11px",
        color: "var(--text-muted)",
        flexShrink: 0,
      }}>
        #{driver.permanentNumber}
      </span>
    </div>
  );
}
