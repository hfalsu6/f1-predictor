"use client";

import { useDroppable } from "@dnd-kit/core";
import type { Driver } from "@/types/f1";
import type { DNFReason } from "@/types/simulation";
import { getConstructorColor } from "@/lib/api/mappers";
import { POINTS_TABLE } from "@/constants/f1";

interface Props {
  position: number;
  assignedDriver: Driver | null;
  onClear: () => void;
  onDNF: (reason: DNFReason) => void;
}

export function FinishPositionSlot({ position, assignedDriver, onClear, onDNF }: Props) {
  const { setNodeRef, isOver } = useDroppable({ id: `slot-${position}` });
  const pts = POINTS_TABLE[position] ?? 0;
  const color = assignedDriver ? getConstructorColor(assignedDriver.constructorId) : null;

  const isTop3 = position <= 3;
  const positionColor =
    position === 1 ? "#ffd700" :
    position === 2 ? "#c0c0c0" :
    position === 3 ? "#cd7f32" :
    "var(--text-muted)";

  return (
    <div
      ref={setNodeRef}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "10px",
        padding: "8px 12px",
        minHeight: "42px",
        borderRadius: "5px",
        border: isOver
          ? "1px solid rgba(232,0,45,0.5)"
          : assignedDriver
          ? "1px solid rgba(255,255,255,0.06)"
          : "1px dashed rgba(255,255,255,0.06)",
        background: isOver
          ? "rgba(232,0,45,0.06)"
          : assignedDriver
          ? "var(--bg-surface)"
          : "transparent",
        transition: "border-color 0.1s ease, background 0.1s ease",
      }}
    >
      {/* Position number */}
      <span style={{
        fontFamily: "var(--font-mono)",
        fontSize: "13px",
        fontWeight: 600,
        color: isTop3 ? positionColor : "var(--text-muted)",
        width: "22px",
        textAlign: "right",
        flexShrink: 0,
      }}>
        {position}
      </span>

      {/* Points */}
      <span style={{
        fontFamily: "var(--font-mono)",
        fontSize: "10px",
        color: pts > 0 ? "var(--accent-orange)" : "var(--text-muted)",
        width: "30px",
        textAlign: "center",
        flexShrink: 0,
        opacity: 0.7,
      }}>
        {pts > 0 ? `+${pts}` : ""}
      </span>

      {/* Assigned driver or placeholder */}
      {assignedDriver && color ? (
        <>
          <span style={{
            width: "3px",
            height: "18px",
            borderRadius: "2px",
            background: color,
            flexShrink: 0,
            boxShadow: `0 0 6px ${color}60`,
          }} />
          <span style={{
            fontFamily: "var(--font-data)",
            fontSize: "14px",
            fontWeight: 700,
            letterSpacing: "0.06em",
            color: "var(--text-primary)",
            flex: 1,
          }}>
            {assignedDriver.code}
          </span>
          <span style={{
            fontFamily: "var(--font-display)",
            fontSize: "11px",
            color: "var(--text-muted)",
            flex: 1,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}>
            {assignedDriver.familyName}
          </span>
          <button
            onClick={onClear}
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "10px",
              color: "var(--text-muted)",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "2px 6px",
              borderRadius: "3px",
              transition: "color 0.1s ease, background 0.1s ease",
              flexShrink: 0,
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.color = "var(--text-primary)";
              (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.06)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.color = "var(--text-muted)";
              (e.currentTarget as HTMLButtonElement).style.background = "none";
            }}
          >
            ✕
          </button>
        </>
      ) : (
        <span style={{
          flex: 1,
          fontFamily: "var(--font-display)",
          fontSize: "12px",
          color: isOver ? "rgba(232,0,45,0.6)" : "var(--text-muted)",
          opacity: 0.5,
        }}>
          {isOver ? "Release to assign" : "Drop driver here"}
        </span>
      )}
    </div>
  );
}
