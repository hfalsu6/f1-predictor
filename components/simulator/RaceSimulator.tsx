"use client";

import { useState, useEffect, useRef } from "react";
import { useWebHaptics } from "web-haptics/react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  useDroppable,
  useDraggable,
  closestCenter,
} from "@dnd-kit/core";
import { useSimulationStore } from "@/store/simulationStore";
import { getConstructorColor } from "@/lib/api/mappers";
import { POINTS_TABLE, SPRINT_POINTS_TABLE } from "@/constants/f1";
import type { Driver } from "@/types/f1";
import type { DNFReason, FinishPosition } from "@/types/simulation";

// ─────────────────────────────────────────────────────────────────────────────
// Draggable driver cell (compact, fits in 2-column grid)
// ─────────────────────────────────────────────────────────────────────────────
function DraggableDriverCell({ driver, color }: { driver: Driver; color: string }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: driver.driverId });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "2px",
        padding: "8px 9px",
        borderRadius: "5px",
        border: `1px solid ${color}20`,
        background: isDragging ? `rgba(255,255,255,0.06)` : `rgba(255,255,255,0.02)`,
        cursor: isDragging ? "grabbing" : "grab",
        userSelect: "none",
        opacity: isDragging ? 0.25 : 1,
        transition: "opacity 0.1s ease, background 0.1s ease",
        touchAction: "none",
        minWidth: 0,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
        <span style={{
          width: "2px", height: "14px", borderRadius: "1px",
          background: color, flexShrink: 0,
          boxShadow: `0 0 5px ${color}70`,
        }} />
        <span style={{
          fontFamily: "var(--font-data)", fontSize: "13px", fontWeight: 700,
          letterSpacing: "0.06em", color: "var(--text-primary)",
        }}>
          {driver.code}
        </span>
      </div>
      <span style={{
        fontFamily: "var(--font-sans)", fontSize: "11px",
        color: "var(--text-secondary)",
        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        display: "block", paddingLeft: "7px",
      }}>
        {driver.familyName}
      </span>
      <span style={{
        fontFamily: "var(--font-mono)", fontSize: "9px",
        color: "var(--text-muted)", paddingLeft: "7px",
        letterSpacing: "0.04em",
      }}>
        #{driver.permanentNumber}
      </span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Team card — groups 2 drivers side-by-side
// ─────────────────────────────────────────────────────────────────────────────
function TeamCard({
  constructorId,
  constructorName,
  drivers,
  assignDNF,
  clearDriver,
  results,
  assignedToPosition,
  assignedDNF,
  isSprint,
}: {
  constructorId: string;
  constructorName: string;
  drivers: Driver[];
  assignDNF: (id: string, reason: DNFReason) => void;
  clearDriver: (id: string) => void;
  results: Record<string, { position: number | null; dnf: string | null }>;
  assignedToPosition: Set<string>;
  assignedDNF: Set<string>;
  isSprint?: boolean;
}) {
  const color = getConstructorColor(constructorId);
  const hex6 = color.replace("#", "");
  const r = parseInt(hex6.slice(0, 2), 16);
  const g = parseInt(hex6.slice(2, 4), 16);
  const b = parseInt(hex6.slice(4, 6), 16);

  const unassignedDrivers = drivers.filter(
    (d) => !assignedToPosition.has(d.driverId) && !assignedDNF.has(d.driverId)
  );

  return (
    <div style={{
      borderRadius: "8px",
      border: `1px solid ${color}28`,
      background: `rgba(${r},${g},${b},0.04)`,
      overflow: "hidden",
    }}>
      {/* Team header */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        padding: "7px 10px",
        borderBottom: `1px solid ${color}18`,
        background: `rgba(${r},${g},${b},0.06)`,
      }}>
        <span style={{
          width: "3px", height: "12px", borderRadius: "2px",
          background: color, flexShrink: 0,
          boxShadow: `0 0 6px ${color}80`,
        }} />
        <span style={{
          fontFamily: "var(--font-data)", fontSize: "10px", fontWeight: 700,
          letterSpacing: "0.12em", color,
          textTransform: "uppercase",
        }}>
          {constructorName}
        </span>
      </div>

      {/* Driver cells — side by side in 2-column grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "4px",
        padding: "6px",
      }}>
        {drivers.map((driver) => {
          const isPlaced  = assignedToPosition.has(driver.driverId);
          const isRetired = assignedDNF.has(driver.driverId);
          const dnfEntry  = results[driver.driverId];

          if (isPlaced) {
            return (
              <div key={driver.driverId} style={{
                display: "flex", flexDirection: "column", gap: "2px",
                padding: "8px 9px", borderRadius: "5px",
                border: "1px solid rgba(255,255,255,0.05)",
                background: "rgba(255,255,255,0.01)",
                opacity: 0.3,
                minWidth: 0, overflow: "hidden",
              }}>
                <span style={{
                  fontFamily: "var(--font-data)", fontSize: "13px", fontWeight: 700,
                  letterSpacing: "0.06em", color: "var(--text-muted)", paddingLeft: "7px",
                }}>
                  {driver.code}
                </span>
                <span style={{
                  fontFamily: "var(--font-display)", fontSize: "10px",
                  color: "var(--text-muted)", paddingLeft: "7px",
                }}>
                  placed
                </span>
              </div>
            );
          }

          if (isRetired) {
            return (
              <div key={driver.driverId} style={{
                display: "flex", flexDirection: "column", gap: "2px",
                padding: "8px 9px", borderRadius: "5px",
                border: "1px solid rgba(232,0,45,0.12)",
                background: "rgba(232,0,45,0.04)",
                opacity: 0.6,
                position: "relative",
                minWidth: 0, overflow: "hidden",
              }}>
                <span style={{
                  fontFamily: "var(--font-data)", fontSize: "13px", fontWeight: 700,
                  letterSpacing: "0.06em", color: "var(--text-muted)", paddingLeft: "7px",
                }}>
                  {driver.code}
                </span>
                <span style={{
                  fontFamily: "var(--font-mono)", fontSize: "9px",
                  color: "rgba(232,0,45,0.7)", letterSpacing: "0.08em", paddingLeft: "7px",
                }}>
                  {dnfEntry?.dnf}
                </span>
                <button
                  onClick={() => clearDriver(driver.driverId)}
                  style={{
                    position: "absolute", top: "4px", right: "5px",
                    background: "none", border: "none",
                    color: "var(--text-muted)", cursor: "pointer",
                    fontSize: "10px", padding: "1px 3px",
                    opacity: 0.5, lineHeight: 1,
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = "1"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = "0.5"; }}
                >
                  ✕
                </button>
              </div>
            );
          }

          return <DraggableDriverCell key={driver.driverId} driver={driver} color={color} />;
        })}
      </div>

      {/* DNF buttons for unassigned drivers */}
      {unassignedDrivers.length > 0 && (
        <div style={{
          padding: "2px 6px 7px",
          display: "flex", flexDirection: "column", gap: "3px",
          borderTop: `1px solid ${color}10`,
        }}>
          {unassignedDrivers.map((driver) => (
            <div key={`dnf-${driver.driverId}`} style={{
              display: "flex", alignItems: "center", gap: "4px",
            }}>
              <span style={{
                fontFamily: "var(--font-data)", fontSize: "10px", fontWeight: 600,
                color: "var(--text-muted)", letterSpacing: "0.06em",
                flex: 1, opacity: 0.55,
              }}>
                {driver.code}
              </span>
              {(["DNF", "DNS", "DSQ"] as DNFReason[]).map((reason) => (
                <button
                  key={reason}
                  onClick={() => assignDNF(driver.driverId, reason)}
                  style={{
                    padding: "2px 5px", background: "transparent",
                    border: `1px solid ${color}20`, borderRadius: "3px",
                    color: `${color}70`, fontFamily: "var(--font-mono)",
                    fontSize: "9px", letterSpacing: "0.06em", cursor: "pointer",
                    transition: "all 0.1s ease",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background = `${color}18`;
                    (e.currentTarget as HTMLButtonElement).style.color = color;
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                    (e.currentTarget as HTMLButtonElement).style.color = `${color}70`;
                  }}
                >
                  {reason}
                </button>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Drag overlay card
// ─────────────────────────────────────────────────────────────────────────────
function FloatingCard({ driver }: { driver: Driver }) {
  const color = getConstructorColor(driver.constructorId);
  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: "10px",
      padding: "9px 14px", borderRadius: "6px",
      border: `1px solid ${color}50`, background: "var(--bg-elevated)",
      boxShadow: `0 12px 32px rgba(0,0,0,0.6), 0 0 0 1px ${color}30`,
      transform: "rotate(1.5deg) scale(1.04)", cursor: "grabbing",
      pointerEvents: "none",
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

// ─────────────────────────────────────────────────────────────────────────────
// Draggable assigned driver (inside a position slot — allows repositioning)
// ─────────────────────────────────────────────────────────────────────────────
function DraggableAssignedDriver({ driver, color, onClear }: {
  driver: Driver; color: string; onClear: () => void;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: driver.driverId });

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "10px", flex: 1, minWidth: 0, opacity: isDragging ? 0.3 : 1 }}>
      <div
        ref={setNodeRef}
        {...listeners}
        {...attributes}
        style={{
          display: "flex", alignItems: "center", gap: "10px", flex: 1, minWidth: 0,
          cursor: isDragging ? "grabbing" : "grab",
          userSelect: "none", touchAction: "none",
        }}
      >
        <span style={{
          width: "3px", height: "20px", borderRadius: "2px",
          background: color, flexShrink: 0, boxShadow: `0 0 6px ${color}60`,
        }} />
        <span style={{
          fontFamily: "var(--font-data)", fontSize: "14px", fontWeight: 700,
          letterSpacing: "0.06em", color: "var(--text-primary)", flexShrink: 0,
        }}>
          {driver.code}
        </span>
        <span style={{
          fontFamily: "var(--font-sans)", fontSize: "12px", color: "var(--text-secondary)",
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1,
          display: "block",
        }}>
          {driver.familyName}
        </span>
      </div>
      <button
        onClick={onClear}
        style={{
          background: "none", border: "none", color: "var(--text-muted)",
          cursor: "pointer", fontSize: "12px", padding: "2px 4px",
          lineHeight: 1, flexShrink: 0, opacity: 0.4, transition: "opacity 0.1s ease",
        }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = "1"; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = "0.4"; }}
      >
        ✕
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Droppable position slot
// ─────────────────────────────────────────────────────────────────────────────
function PositionSlot({ position, driver, onClear, pointsTable }: {
  position: number; driver: Driver | null; onClear: () => void;
  pointsTable?: Record<number, number>;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: `slot-${position}` });
  const [flash, setFlash]    = useState(false);
  const prevDriverRef        = useRef<Driver | null>(null);

  useEffect(() => {
    if (driver && !prevDriverRef.current) {
      setFlash(true);
      const t = setTimeout(() => setFlash(false), 500);
      return () => clearTimeout(t);
    }
    prevDriverRef.current = driver;
  }, [driver]);
  const pts      = (pointsTable ?? POINTS_TABLE)[position] ?? 0;
  const color    = driver ? getConstructorColor(driver.constructorId) : null;
  const posLabel = position === 1 ? "1st" : position === 2 ? "2nd" : position === 3 ? "3rd" : `${position}th`;
  const posAccent = position === 1 ? "#ffd700" : position === 2 ? "#c0c0c0" : position === 3 ? "#cd7f32" : null;

  return (
    <div
      ref={setNodeRef}
      className={flash ? "slot-flash" : undefined}
      style={{
        display: "flex", alignItems: "center", gap: "12px",
        padding: "8px 14px", borderRadius: "6px", minHeight: "44px",
        border: isOver ? "1px solid rgba(232,0,45,0.45)"
          : driver ? "1px solid rgba(255,255,255,0.07)"
          : "1px dashed rgba(255,255,255,0.05)",
        background: isOver ? "rgba(232,0,45,0.06)" : driver ? "var(--bg-surface)" : "transparent",
        transition: "border-color 0.1s ease, background 0.1s ease",
      }}
    >
      <span style={{
        fontFamily: "var(--font-mono)", fontSize: "12px", fontWeight: 600,
        color: posAccent ?? "rgba(255,255,255,0.18)",
        width: "28px", textAlign: "right", flexShrink: 0,
      }}>
        {posLabel}
      </span>
      <span style={{
        fontFamily: "var(--font-mono)", fontSize: "10px", fontWeight: 500,
        color: pts > 0 ? "rgba(255,128,0,0.65)" : "rgba(255,255,255,0.12)",
        width: "32px", textAlign: "center", flexShrink: 0,
      }}>
        {pts > 0 ? `+${pts}` : "—"}
      </span>

      {driver && color ? (
        <DraggableAssignedDriver driver={driver} color={color} onClear={onClear} />
      ) : (
        <span style={{
          fontFamily: "var(--font-sans)", fontSize: "12px",
          color: isOver ? "rgba(232,0,45,0.5)" : "rgba(255,255,255,0.12)", flex: 1,
        }}>
          {isOver ? "Drop to assign" : "—"}
        </span>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Zone divider
// ─────────────────────────────────────────────────────────────────────────────
function ZoneDivider({ label }: { label: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "10px", margin: "4px 0" }}>
      <div style={{ flex: 1, height: "1px", background: "var(--border)" }} />
      <span style={{
        fontFamily: "var(--font-mono)", fontSize: "9px",
        letterSpacing: "0.18em", color: "var(--text-muted)", opacity: 0.5,
      }}>
        {label}
      </span>
      <div style={{ flex: 1, height: "1px", background: "var(--border)" }} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main — single DndContext wraps both panels
// ─────────────────────────────────────────────────────────────────────────────
export function RaceSimulator({ mode = "race" }: { mode?: "race" | "sprint" }) {
  const [activeDriverId, setActiveDriverId] = useState<string | null>(null);
  const haptic = useWebHaptics();

  const baselineStandings     = useSimulationStore((s) => s.baselineDriverStandings);
  const simulations           = useSimulationStore((s) => s.simulations);
  const currentRaceIndex      = useSimulationStore((s) => s.currentRaceIndex);
  const assignPosition        = useSimulationStore((s) => s.assignPosition);
  const assignDNF             = useSimulationStore((s) => s.assignDNF);
  const clearDriver           = useSimulationStore((s) => s.clearDriver);
  const autofill              = useSimulationStore((s) => s.autofill);
  const assignSprintPosition  = useSimulationStore((s) => s.assignSprintPosition);
  const assignSprintDNF       = useSimulationStore((s) => s.assignSprintDNF);
  const clearSprintDriver     = useSimulationStore((s) => s.clearSprintDriver);
  const autofillSprint        = useSimulationStore((s) => s.autofillSprint);

  const isSprint = mode === "sprint";

  // Mode-aware action dispatchers
  const doAssignPosition = isSprint ? assignSprintPosition : assignPosition;
  const doAssignDNF      = isSprint ? assignSprintDNF : assignDNF;
  const doClearDriver    = isSprint ? clearSprintDriver : clearDriver;
  const doAutofill       = isSprint ? autofillSprint : autofill;

  // Haptic-enhanced wrappers
  const assignDNFWithHaptic = (driverId: string, reason: DNFReason) => {
    doAssignDNF(driverId, reason);
    haptic.trigger("warning"); // marking a driver as retired/DNS/DSQ
  };
  const clearDriverWithHaptic = (driverId: string) => {
    doClearDriver(driverId);
    haptic.trigger("light"); // removing an assignment
  };

  const currentSim = simulations[currentRaceIndex];
  const results    = isSprint
    ? (currentSim?.sprintResults ?? {})
    : (currentSim?.results ?? {});
  const allDrivers = baselineStandings.map((s) => s.driver);
  const total      = allDrivers.length;
  // Sprint only scores top 8 positions
  const maxPositions = isSprint ? 8 : total;
  const activePointsTable = isSprint ? SPRINT_POINTS_TABLE : POINTS_TABLE;

  const assignedToPosition = new Set(
    Object.values(results).filter((r) => r.position !== null && r.dnf === null).map((r) => r.driverId)
  );
  const assignedDNF = new Set(
    Object.values(results).filter((r) => r.dnf !== null).map((r) => r.driverId)
  );
  const assignedCount = assignedToPosition.size + assignedDNF.size;

  // Group drivers by constructor (preserving championship order within each team)
  const teamMap = new Map<string, { constructorId: string; constructorName: string; drivers: Driver[] }>();
  for (const driver of allDrivers) {
    const key = driver.constructorId;
    if (!teamMap.has(key)) {
      teamMap.set(key, { constructorId: key, constructorName: driver.constructorName, drivers: [] });
    }
    teamMap.get(key)!.drivers.push(driver);
  }
  const teams = Array.from(teamMap.values());

  const allPlaced = allDrivers.every(
    (d) => assignedToPosition.has(d.driverId) || assignedDNF.has(d.driverId)
  );

  // Position → driver map
  const posToDriver: Record<number, Driver | null> = {};
  for (let i = 1; i <= (isSprint ? total : total); i++) posToDriver[i] = null;
  for (const [driverId, entry] of Object.entries(results)) {
    if (entry.position !== null && entry.dnf === null) {
      const d = allDrivers.find((d) => d.driverId === driverId);
      if (d) posToDriver[entry.position] = d;
    }
  }

  const activeDriver = activeDriverId ? allDrivers.find((d) => d.driverId === activeDriverId) ?? null : null;

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } })
  );

  function handleDragStart(e: DragStartEvent) {
    setActiveDriverId(e.active.id as string);
    haptic.trigger("light"); // picking up a driver card
  }
  function handleDragEnd(e: DragEndEvent) {
    setActiveDriverId(null);
    const { active, over } = e;
    if (!over) return;
    const slotId = over.id as string;
    if (slotId.startsWith("slot-")) {
      const pos = parseInt(slotId.replace("slot-", ""), 10) as FinishPosition;
      doAssignPosition(active.id as string, pos);
      haptic.trigger("medium"); // driver snaps into position
    }
  }

  // Finishing order rows with zone dividers
  const orderRows: Array<{ type: "slot"; pos: number } | { type: "divider"; label: string }> = [];
  if (isSprint) {
    // Sprint: only 8 scored positions
    for (let p = 1; p <= 8; p++) {
      if (p === 2) orderRows.push({ type: "divider", label: "SPRINT POINTS" });
      orderRows.push({ type: "slot", pos: p });
    }
  } else {
    for (let p = 1; p <= total; p++) {
      if (p === 4)  orderRows.push({ type: "divider", label: "POINTS ZONE" });
      if (p === 11) orderRows.push({ type: "divider", label: "NO POINTS" });
      orderRows.push({ type: "slot", pos: p });
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div style={{ display: "flex", height: "100%", overflow: "hidden", width: "100%" }}>

        {/* ── Left: Team-grouped driver pool ── */}
        <div
          className="animate-scale-in"
          style={{
            width: "300px",
            flexShrink: 0,
            borderRight: "1px solid var(--border)",
            background: "var(--bg-surface)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          <div style={{
            padding: "14px 16px 10px",
            borderBottom: "1px solid var(--border)",
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "10px", letterSpacing: "0.16em", color: "var(--text-muted)" }}>
              DRIVER POOL
            </span>
            {allPlaced && (
              <span style={{
                fontFamily: "var(--font-mono)", fontSize: "9px", letterSpacing: "0.1em",
                color: "var(--accent-green)",
              }}>
                ✓ COMPLETE
              </span>
            )}
          </div>

          <div style={{ flex: 1, overflowY: "auto", padding: "10px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {teams.map((team) => (
              <div key={team.constructorId} className="stagger-row">
              <TeamCard
                key={`card-${team.constructorId}`}
                constructorId={team.constructorId}
                constructorName={team.constructorName}
                drivers={team.drivers}
                assignDNF={assignDNFWithHaptic}
                clearDriver={clearDriverWithHaptic}
                results={results as Record<string, { position: number | null; dnf: string | null }>}
                assignedToPosition={assignedToPosition}
                assignedDNF={assignedDNF}
                isSprint={isSprint}
              />
              </div>
            ))}
            </div>
          </div>
        </div>

        {/* ── Right: Finishing order ── */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px 28px" }}>
          <div style={{ marginBottom: "14px", display: "flex", alignItems: "center", justifyContent: "space-between", maxWidth: "480px" }}>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "10px", letterSpacing: "0.16em", color: "var(--text-muted)" }}>
              {isSprint ? "SPRINT ORDER" : "FINISHING ORDER"}
            </span>
            {!allPlaced && (
              <button
                onClick={() => { doAutofill(); haptic.trigger("medium"); }}
                style={{
                  fontFamily: "var(--font-mono)", fontSize: "9px", letterSpacing: "0.12em",
                  color: "rgba(232,0,45,0.7)", background: "rgba(232,0,45,0.06)",
                  border: "1px solid rgba(232,0,45,0.2)", borderRadius: "4px",
                  padding: "3px 8px", cursor: "pointer",
                  transition: "all 0.1s ease",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = "rgba(232,0,45,0.12)";
                  (e.currentTarget as HTMLButtonElement).style.color = "rgba(232,0,45,1)";
                  (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(232,0,45,0.4)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = "rgba(232,0,45,0.06)";
                  (e.currentTarget as HTMLButtonElement).style.color = "rgba(232,0,45,0.7)";
                  (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(232,0,45,0.2)";
                }}
              >
                AUTOFILL
              </button>
            )}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "3px", maxWidth: "480px" }}>
            {orderRows.map((row, i) =>
              row.type === "divider" ? (
                <ZoneDivider key={`d-${i}`} label={row.label} />
              ) : (
                <PositionSlot
                  key={row.pos}
                  position={row.pos}
                  driver={posToDriver[row.pos]}
                  onClear={() => { const d = posToDriver[row.pos]; if (d) clearDriverWithHaptic(d.driverId); }}
                  pointsTable={activePointsTable}
                />
              )
            )}
          </div>
        </div>
      </div>

      <DragOverlay dropAnimation={null}>
        {activeDriver && <FloatingCard driver={activeDriver} />}
      </DragOverlay>
    </DndContext>
  );
}
