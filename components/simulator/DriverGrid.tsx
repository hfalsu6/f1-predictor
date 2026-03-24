"use client";

import { useState } from "react";
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
import { useDraggable } from "@dnd-kit/core";
import { useSimulationStore } from "@/store/simulationStore";
import { DriverCard } from "./DriverCard";
import { FinishPositionSlot } from "./FinishPositionSlot";
import type { Driver } from "@/types/f1";
import type { DNFReason, FinishPosition } from "@/types/simulation";

function DraggableDriverCard({ driver }: { driver: Driver }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: driver.driverId,
  });

  return (
    <div ref={setNodeRef} {...listeners} {...attributes}>
      <DriverCard driver={driver} isDragging={isDragging} />
    </div>
  );
}

export function DriverGrid() {
  const [activeDriverId, setActiveDriverId] = useState<string | null>(null);

  const baselineStandings = useSimulationStore((s) => s.baselineDriverStandings);
  const simulations       = useSimulationStore((s) => s.simulations);
  const currentRaceIndex  = useSimulationStore((s) => s.currentRaceIndex);
  const assignPosition    = useSimulationStore((s) => s.assignPosition);
  const assignDNF         = useSimulationStore((s) => s.assignDNF);
  const clearDriver       = useSimulationStore((s) => s.clearDriver);

  const currentSim = simulations[currentRaceIndex];
  const results    = currentSim?.results ?? {};
  const allDrivers = baselineStandings.map((s) => s.driver);

  const assignedToPosition = new Set(
    Object.values(results)
      .filter((r) => r.position !== null && r.dnf === null)
      .map((r) => r.driverId)
  );
  const assignedDNF = new Set(
    Object.values(results)
      .filter((r) => r.dnf !== null)
      .map((r) => r.driverId)
  );

  const unassignedDrivers = allDrivers.filter(
    (d) => !assignedToPosition.has(d.driverId) && !assignedDNF.has(d.driverId)
  );

  const totalPositions = allDrivers.length;
  const positionToDriver: Record<number, Driver | null> = {};
  for (let i = 1; i <= totalPositions; i++) positionToDriver[i] = null;
  for (const [driverId, entry] of Object.entries(results)) {
    if (entry.position !== null && entry.dnf === null) {
      const driver = allDrivers.find((d) => d.driverId === driverId);
      if (driver) positionToDriver[entry.position] = driver;
    }
  }

  const activeDriver = activeDriverId
    ? allDrivers.find((d) => d.driverId === activeDriverId) ?? null
    : null;

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } })
  );

  function handleDragStart(event: DragStartEvent) {
    setActiveDriverId(event.active.id as string);
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveDriverId(null);
    const { active, over } = event;
    if (!over) return;
    const driverId = active.id as string;
    const slotId   = over.id as string;
    if (slotId.startsWith("slot-")) {
      const position = parseInt(slotId.replace("slot-", ""), 10) as FinishPosition;
      assignPosition(driverId, position);
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "32px" }}>

        {/* Left: Driver pool */}
        <div>
          {/* Unassigned */}
          <div style={{ marginBottom: "4px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{
              fontFamily: "var(--font-mono)",
              fontSize: "10px",
              letterSpacing: "0.14em",
              color: "var(--text-muted)",
            }}>
              DRIVER POOL
            </span>
            <span style={{
              fontFamily: "var(--font-mono)",
              fontSize: "10px",
              color: "var(--text-muted)",
              opacity: 0.6,
            }}>
              {unassignedDrivers.length} left
            </span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "4px", marginBottom: "20px" }}>
            {unassignedDrivers.length === 0 ? (
              <div style={{
                padding: "16px",
                textAlign: "center",
                fontFamily: "var(--font-mono)",
                fontSize: "11px",
                color: "var(--text-muted)",
                border: "1px dashed rgba(255,255,255,0.06)",
                borderRadius: "6px",
                letterSpacing: "0.1em",
              }}>
                ALL DRIVERS ASSIGNED
              </div>
            ) : (
              unassignedDrivers.map((driver) => (
                <DraggableDriverCard key={driver.driverId} driver={driver} />
              ))
            )}
          </div>

          {/* DNF section */}
          {unassignedDrivers.length > 0 && (
            <div>
              <div style={{
                fontFamily: "var(--font-mono)",
                fontSize: "10px",
                letterSpacing: "0.14em",
                color: "var(--text-muted)",
                marginBottom: "6px",
                opacity: 0.7,
              }}>
                MARK NON-FINISHERS
              </div>
              <div style={{
                display: "flex",
                flexDirection: "column",
                gap: "3px",
                maxHeight: "220px",
                overflowY: "auto",
                padding: "1px",
              }}>
                {unassignedDrivers.map((driver) => (
                  <div key={driver.driverId} style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "6px 10px",
                    borderRadius: "4px",
                    border: "1px solid rgba(255,255,255,0.04)",
                  }}>
                    <span style={{
                      fontFamily: "var(--font-data)",
                      fontSize: "13px",
                      fontWeight: 600,
                      letterSpacing: "0.05em",
                      color: "var(--text-secondary)",
                      flex: 1,
                    }}>
                      {driver.code}
                    </span>
                    {(["DNF", "DNS", "DSQ"] as DNFReason[]).map((reason) => (
                      <button
                        key={reason}
                        onClick={() => assignDNF(driver.driverId, reason)}
                        style={{
                          padding: "3px 8px",
                          background: "rgba(232,0,45,0.08)",
                          border: "1px solid rgba(232,0,45,0.15)",
                          borderRadius: "3px",
                          color: "rgba(232,0,45,0.7)",
                          fontFamily: "var(--font-mono)",
                          fontSize: "10px",
                          fontWeight: 500,
                          letterSpacing: "0.08em",
                          cursor: "pointer",
                          transition: "all 0.1s ease",
                        }}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLButtonElement).style.background = "rgba(232,0,45,0.18)";
                          (e.currentTarget as HTMLButtonElement).style.color = "var(--accent-red)";
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLButtonElement).style.background = "rgba(232,0,45,0.08)";
                          (e.currentTarget as HTMLButtonElement).style.color = "rgba(232,0,45,0.7)";
                        }}
                      >
                        {reason}
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* DNF'd drivers */}
          {assignedDNF.size > 0 && (
            <div style={{ marginTop: "16px" }}>
              <div style={{
                fontFamily: "var(--font-mono)",
                fontSize: "10px",
                letterSpacing: "0.14em",
                color: "rgba(232,0,45,0.5)",
                marginBottom: "6px",
              }}>
                NON-FINISHERS
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
                {allDrivers.filter((d) => assignedDNF.has(d.driverId)).map((driver) => {
                  const entry = results[driver.driverId];
                  return (
                    <div key={driver.driverId} style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      padding: "6px 10px",
                      borderRadius: "4px",
                      border: "1px solid rgba(232,0,45,0.10)",
                      background: "rgba(232,0,45,0.04)",
                    }}>
                      <span style={{
                        fontFamily: "var(--font-data)",
                        fontSize: "13px",
                        fontWeight: 600,
                        color: "var(--text-muted)",
                        flex: 1,
                        letterSpacing: "0.05em",
                      }}>
                        {driver.code}
                      </span>
                      <span style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "10px",
                        color: "rgba(232,0,45,0.6)",
                        letterSpacing: "0.08em",
                      }}>
                        {entry?.dnf}
                      </span>
                      <button
                        onClick={() => clearDriver(driver.driverId)}
                        style={{
                          background: "none",
                          border: "none",
                          color: "var(--text-muted)",
                          cursor: "pointer",
                          fontSize: "12px",
                          padding: "0 2px",
                          opacity: 0.6,
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right: Finish order slots */}
        <div>
          <div style={{
            fontFamily: "var(--font-mono)",
            fontSize: "10px",
            letterSpacing: "0.14em",
            color: "var(--text-muted)",
            marginBottom: "6px",
          }}>
            FINISHING ORDER
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
            {Array.from({ length: totalPositions }, (_, i) => i + 1).map((pos) => (
              <FinishPositionSlot
                key={pos}
                position={pos}
                assignedDriver={positionToDriver[pos]}
                onClear={() => {
                  const driver = positionToDriver[pos];
                  if (driver) clearDriver(driver.driverId);
                }}
                onDNF={(reason) => {
                  const driver = positionToDriver[pos];
                  if (driver) assignDNF(driver.driverId, reason);
                }}
              />
            ))}
          </div>
        </div>
      </div>

      <DragOverlay>
        {activeDriver && <DriverCard driver={activeDriver} isDragging />}
      </DragOverlay>
    </DndContext>
  );
}
