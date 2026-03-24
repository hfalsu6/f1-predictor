"use client";

import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  closestCenter,
} from "@dnd-kit/core";
import { useDroppable } from "@dnd-kit/core";
import { useState } from "react";
import { useSimulationStore } from "@/store/simulationStore";
import { getConstructorColor } from "@/lib/api/mappers";
import { POINTS_TABLE } from "@/constants/f1";
import type { Driver } from "@/types/f1";
import type { FinishPosition } from "@/types/simulation";

// ── Drag overlay card ──────────────────────────────────────────────────────
function FloatingCard({ driver }: { driver: Driver }) {
  const color = getConstructorColor(driver.constructorId);
  return (
    <div style={{
      display: "inline-flex",
      alignItems: "center",
      gap: "10px",
      padding: "9px 14px",
      borderRadius: "6px",
      border: `1px solid ${color}50`,
      background: "var(--bg-elevated)",
      boxShadow: `0 12px 32px rgba(0,0,0,0.6), 0 0 0 1px ${color}30`,
      cursor: "grabbing",
      userSelect: "none",
      transform: "rotate(1.5deg) scale(1.04)",
    }}>
      <span style={{ width: "3px", height: "20px", borderRadius: "2px", background: color, boxShadow: `0 0 8px ${color}80` }} />
      <span style={{ fontFamily: "var(--font-data)", fontSize: "14px", fontWeight: 700, letterSpacing: "0.06em", color: "var(--text-primary)" }}>
        {driver.code}
      </span>
      <span style={{ fontFamily: "var(--font-display)", fontSize: "12px", color: "var(--text-secondary)" }}>
        {driver.familyName}
      </span>
    </div>
  );
}

// ── Single position slot ───────────────────────────────────────────────────
function PositionSlot({
  position,
  driver,
  onClear,
}: {
  position: number;
  driver: Driver | null;
  onClear: () => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: `slot-${position}` });
  const pts   = POINTS_TABLE[position] ?? 0;
  const color = driver ? getConstructorColor(driver.constructorId) : null;

  const posLabel =
    position === 1 ? "1st" :
    position === 2 ? "2nd" :
    position === 3 ? "3rd" :
    `${position}th`;

  const posAccent =
    position === 1 ? "#ffd700" :
    position === 2 ? "#c0c0c0" :
    position === 3 ? "#cd7f32" :
    null;

  return (
    <div
      ref={setNodeRef}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
        padding: "8px 14px",
        borderRadius: "6px",
        border: isOver
          ? "1px solid rgba(232,0,45,0.45)"
          : driver
          ? "1px solid rgba(255,255,255,0.07)"
          : "1px dashed rgba(255,255,255,0.05)",
        background: isOver
          ? "rgba(232,0,45,0.05)"
          : driver
          ? "var(--bg-surface)"
          : "transparent",
        minHeight: "44px",
        transition: "border-color 0.1s ease, background 0.1s ease",
      }}
    >
      {/* Position number */}
      <span style={{
        fontFamily: "var(--font-mono)",
        fontSize: "12px",
        fontWeight: 600,
        color: posAccent ?? "rgba(255,255,255,0.18)",
        width: "28px",
        textAlign: "right",
        flexShrink: 0,
        letterSpacing: "0.02em",
      }}>
        {posLabel}
      </span>

      {/* Points badge */}
      <span style={{
        fontFamily: "var(--font-mono)",
        fontSize: "10px",
        fontWeight: 500,
        color: pts > 0 ? "rgba(255,128,0,0.65)" : "rgba(255,255,255,0.12)",
        width: "32px",
        textAlign: "center",
        flexShrink: 0,
        letterSpacing: "0.04em",
      }}>
        {pts > 0 ? `+${pts}` : "—"}
      </span>

      {/* Driver slot */}
      {driver && color ? (
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flex: 1, minWidth: 0 }}>
          <span style={{
            width: "3px",
            height: "20px",
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
            flexShrink: 0,
          }}>
            {driver.code}
          </span>
          <span style={{
            fontFamily: "var(--font-display)",
            fontSize: "12px",
            color: "var(--text-secondary)",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            flex: 1,
          }}>
            {driver.familyName}
          </span>
          <button
            onClick={onClear}
            style={{
              background: "none",
              border: "none",
              color: "var(--text-muted)",
              cursor: "pointer",
              fontSize: "12px",
              padding: "2px 4px",
              borderRadius: "3px",
              lineHeight: 1,
              flexShrink: 0,
              opacity: 0.5,
              transition: "opacity 0.1s ease",
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = "1"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = "0.5"; }}
          >
            ✕
          </button>
        </div>
      ) : (
        <span style={{
          fontFamily: "var(--font-display)",
          fontSize: "12px",
          color: isOver ? "rgba(232,0,45,0.5)" : "rgba(255,255,255,0.12)",
          flex: 1,
        }}>
          {isOver ? "Drop to assign" : "—"}
        </span>
      )}
    </div>
  );
}

// ── Zone divider ──────────────────────────────────────────────────────────
function ZoneDivider({ label }: { label: string }) {
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: "10px",
      margin: "4px 0",
    }}>
      <div style={{ flex: 1, height: "1px", background: "var(--border)" }} />
      <span style={{
        fontFamily: "var(--font-mono)",
        fontSize: "9px",
        letterSpacing: "0.18em",
        color: "var(--text-muted)",
        opacity: 0.6,
      }}>
        {label}
      </span>
      <div style={{ flex: 1, height: "1px", background: "var(--border)" }} />
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────
export function FinishingOrder() {
  const [activeDriverId, setActiveDriverId] = useState<string | null>(null);

  const baselineStandings = useSimulationStore((s) => s.baselineDriverStandings);
  const simulations       = useSimulationStore((s) => s.simulations);
  const currentRaceIndex  = useSimulationStore((s) => s.currentRaceIndex);
  const assignPosition    = useSimulationStore((s) => s.assignPosition);
  const clearDriver       = useSimulationStore((s) => s.clearDriver);

  const results    = simulations[currentRaceIndex]?.results ?? {};
  const allDrivers = baselineStandings.map((s) => s.driver);
  const total      = allDrivers.length;

  // Build position → driver map
  const posToDriver: Record<number, Driver | null> = {};
  for (let i = 1; i <= total; i++) posToDriver[i] = null;
  for (const [driverId, entry] of Object.entries(results)) {
    if (entry.position !== null && entry.dnf === null) {
      const d = allDrivers.find((d) => d.driverId === driverId);
      if (d) posToDriver[entry.position] = d;
    }
  }

  const activeDriver = activeDriverId
    ? allDrivers.find((d) => d.driverId === activeDriverId) ?? null
    : null;

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } })
  );

  function handleDragStart(e: DragStartEvent) { setActiveDriverId(e.active.id as string); }
  function handleDragEnd(e: DragEndEvent) {
    setActiveDriverId(null);
    const { active, over } = e;
    if (!over) return;
    const slotId = over.id as string;
    if (slotId.startsWith("slot-")) {
      const pos = parseInt(slotId.replace("slot-", ""), 10) as FinishPosition;
      assignPosition(active.id as string, pos);
    }
  }

  // Build slot rows with zone dividers
  const rows: Array<{ type: "slot"; pos: number } | { type: "divider"; label: string }> = [];
  for (let p = 1; p <= total; p++) {
    if (p === 4)  rows.push({ type: "divider", label: "POINTS ZONE" });
    if (p === 11) rows.push({ type: "divider", label: "NO POINTS" });
    rows.push({ type: "slot", pos: p });
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "3px", maxWidth: "520px" }}>
        {rows.map((row, i) =>
          row.type === "divider" ? (
            <ZoneDivider key={`divider-${i}`} label={row.label} />
          ) : (
            <PositionSlot
              key={row.pos}
              position={row.pos}
              driver={posToDriver[row.pos]}
              onClear={() => {
                const d = posToDriver[row.pos];
                if (d) clearDriver(d.driverId);
              }}
            />
          )
        )}
      </div>

      <DragOverlay>
        {activeDriver && <FloatingCard driver={activeDriver} />}
      </DragOverlay>
    </DndContext>
  );
}
