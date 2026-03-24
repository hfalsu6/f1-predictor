"use client";

import { useDraggable } from "@dnd-kit/core";
import { useSimulationStore } from "@/store/simulationStore";
import { getConstructorColor } from "@/lib/api/mappers";
import type { Driver } from "@/types/f1";
import type { DNFReason } from "@/types/simulation";

function DraggableCard({ driver }: { driver: Driver }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: driver.driverId });
  const color = getConstructorColor(driver.constructorId);

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "10px",
        padding: "9px 12px",
        borderRadius: "6px",
        border: "1px solid var(--border-mid)",
        background: isDragging ? "var(--bg-elevated)" : "var(--bg-base)",
        cursor: isDragging ? "grabbing" : "grab",
        userSelect: "none",
        opacity: isDragging ? 0.5 : 1,
        transition: "border-color 0.12s ease, background 0.12s ease",
        boxShadow: isDragging ? `0 8px 24px rgba(0,0,0,0.5), 0 0 0 1px ${color}40` : "none",
      }}
    >
      <span style={{
        width: "3px",
        height: "20px",
        borderRadius: "2px",
        background: color,
        flexShrink: 0,
        boxShadow: `0 0 6px ${color}70`,
      }} />
      <span style={{
        fontFamily: "var(--font-data)",
        fontSize: "14px",
        fontWeight: 700,
        letterSpacing: "0.06em",
        color: "var(--text-primary)",
        width: "36px",
        flexShrink: 0,
      }}>
        {driver.code}
      </span>
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
      <span style={{
        fontFamily: "var(--font-mono)",
        fontSize: "10px",
        color: "var(--text-muted)",
        flexShrink: 0,
      }}>
        #{driver.permanentNumber}
      </span>
    </div>
  );
}

export function DriverPool() {
  const baselineStandings = useSimulationStore((s) => s.baselineDriverStandings);
  const simulations       = useSimulationStore((s) => s.simulations);
  const currentRaceIndex  = useSimulationStore((s) => s.currentRaceIndex);
  const assignDNF         = useSimulationStore((s) => s.assignDNF);
  const clearDriver       = useSimulationStore((s) => s.clearDriver);

  const currentSim = simulations[currentRaceIndex];
  const results    = currentSim?.results ?? {};
  const allDrivers = baselineStandings.map((s) => s.driver);

  const assignedToPosition = new Set(
    Object.values(results).filter((r) => r.position !== null && r.dnf === null).map((r) => r.driverId)
  );
  const assignedDNF = new Set(
    Object.values(results).filter((r) => r.dnf !== null).map((r) => r.driverId)
  );
  const unassigned = allDrivers.filter(
    (d) => !assignedToPosition.has(d.driverId) && !assignedDNF.has(d.driverId)
  );
  const dnfDrivers = allDrivers.filter((d) => assignedDNF.has(d.driverId));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

      {/* Unassigned drivers */}
      {unassigned.length > 0 ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
          {unassigned.map((driver) => (
            <DraggableCard key={driver.driverId} driver={driver} />
          ))}
        </div>
      ) : (
        <div style={{
          padding: "20px 12px",
          textAlign: "center",
          border: "1px dashed rgba(57,211,83,0.2)",
          borderRadius: "8px",
          background: "rgba(57,211,83,0.04)",
        }}>
          <div style={{
            fontFamily: "var(--font-mono)",
            fontSize: "11px",
            color: "var(--accent-green)",
            letterSpacing: "0.1em",
          }}>
            ✓ ALL DRIVERS PLACED
          </div>
        </div>
      )}

      {/* Mark DNF / DNS / DSQ */}
      {unassigned.length > 0 && (
        <div>
          <div style={{
            fontFamily: "var(--font-mono)",
            fontSize: "9px",
            letterSpacing: "0.16em",
            color: "var(--text-muted)",
            marginBottom: "6px",
            paddingLeft: "2px",
          }}>
            NON-FINISHERS
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
            {unassigned.map((driver) => (
              <div key={driver.driverId} style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "5px 8px",
                borderRadius: "5px",
              }}>
                <span style={{
                  fontFamily: "var(--font-data)",
                  fontSize: "12px",
                  fontWeight: 600,
                  letterSpacing: "0.06em",
                  color: "var(--text-muted)",
                  flex: 1,
                }}>
                  {driver.code}
                </span>
                {(["DNF", "DNS", "DSQ"] as DNFReason[]).map((r) => (
                  <button
                    key={r}
                    onClick={() => assignDNF(driver.driverId, r)}
                    style={{
                      padding: "3px 7px",
                      background: "transparent",
                      border: "1px solid rgba(232,0,45,0.15)",
                      borderRadius: "3px",
                      color: "rgba(232,0,45,0.55)",
                      fontFamily: "var(--font-mono)",
                      fontSize: "9px",
                      letterSpacing: "0.08em",
                      cursor: "pointer",
                      transition: "all 0.1s ease",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.background = "rgba(232,0,45,0.12)";
                      (e.currentTarget as HTMLButtonElement).style.color = "var(--accent-red)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                      (e.currentTarget as HTMLButtonElement).style.color = "rgba(232,0,45,0.55)";
                    }}
                  >
                    {r}
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* DNF'd drivers */}
      {dnfDrivers.length > 0 && (
        <div>
          <div style={{
            fontFamily: "var(--font-mono)",
            fontSize: "9px",
            letterSpacing: "0.16em",
            color: "rgba(232,0,45,0.4)",
            marginBottom: "6px",
            paddingLeft: "2px",
          }}>
            RETIRED
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
            {dnfDrivers.map((driver) => {
              const entry = results[driver.driverId];
              const color = getConstructorColor(driver.constructorId);
              return (
                <div key={driver.driverId} style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "7px 10px",
                  borderRadius: "5px",
                  border: "1px solid rgba(232,0,45,0.08)",
                  background: "rgba(232,0,45,0.03)",
                  opacity: 0.7,
                }}>
                  <span style={{
                    width: "2px",
                    height: "16px",
                    borderRadius: "1px",
                    background: color,
                    opacity: 0.5,
                    flexShrink: 0,
                  }} />
                  <span style={{
                    fontFamily: "var(--font-data)",
                    fontSize: "12px",
                    fontWeight: 600,
                    letterSpacing: "0.06em",
                    color: "var(--text-muted)",
                    flex: 1,
                  }}>
                    {driver.code}
                  </span>
                  <span style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "9px",
                    color: "rgba(232,0,45,0.5)",
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
                      fontSize: "11px",
                      padding: "0 2px",
                      opacity: 0.5,
                      lineHeight: 1,
                    }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = "1"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = "0.5"; }}
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
  );
}
