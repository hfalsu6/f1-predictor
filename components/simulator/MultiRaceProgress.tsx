"use client";

import { useEffect, useRef, useState } from "react";
import { useSimulationStore } from "@/store/simulationStore";
import { CIRCUIT_IMAGES } from "@/constants/f1";

export function MultiRaceProgress() {
  const futureRaces      = useSimulationStore((s) => s.futureRaces);
  const currentRaceIndex = useSimulationStore((s) => s.currentRaceIndex);
  const simulations      = useSimulationStore((s) => s.simulations);
  const goToRace         = useSimulationStore((s) => s.goToRace);
  const scrollRef        = useRef<HTMLDivElement>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Scroll active tab into view when race changes
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;
    const tab = container.children[currentRaceIndex] as HTMLElement;
    if (!tab) return;
    const containerLeft = container.scrollLeft;
    const containerWidth = container.clientWidth;
    const tabLeft = tab.offsetLeft;
    const tabWidth = tab.offsetWidth;
    if (tabLeft < containerLeft || tabLeft + tabWidth > containerLeft + containerWidth) {
      container.scrollTo({ left: tabLeft - tabWidth / 2, behavior: "smooth" });
    }
  }, [currentRaceIndex]);

  if (futureRaces.length === 0) return null;

  return (
    <div
      ref={scrollRef}
      style={{
        display: "flex",
        overflowX: "auto",
        scrollSnapType: "x mandatory",
        scrollbarWidth: "none",
        msOverflowStyle: "none",
      }}
    >
      {futureRaces.map((race, i) => {
        const hasResults = simulations[i] && Object.keys(simulations[i].results).length > 0;
        const isCurrent  = i === currentRaceIndex;
        const isPast     = i < currentRaceIndex;
        const isHovered  = hoveredIndex === i;
        const imgSrc     = CIRCUIT_IMAGES[race.circuitId];

        const dateStr = new Date(race.date).toLocaleDateString("en-US", {
          month: "short", day: "numeric",
        });

        const borderColor = isCurrent
          ? "rgba(232,0,45,0.6)"
          : isPast && hasResults
          ? "rgba(57,211,83,0.3)"
          : isHovered
          ? "rgba(255,255,255,0.15)"
          : "rgba(255,255,255,0.06)";

        const bgColor = isCurrent
          ? "rgba(232,0,45,0.07)"
          : isPast && hasResults
          ? "rgba(57,211,83,0.04)"
          : isHovered
          ? "rgba(255,255,255,0.03)"
          : "transparent";

        return (
          <button
            key={race.round}
            onClick={() => goToRace(i)}
            onMouseEnter={() => setHoveredIndex(i)}
            onMouseLeave={() => setHoveredIndex(null)}
            style={{
              flex: "0 0 20%",
              minWidth: "120px",
              display: "flex",
              flexDirection: "column",
              alignItems: "stretch",
              border: "none",
              borderRight: "1px solid var(--border)",
              borderBottom: isCurrent ? `2px solid rgba(232,0,45,0.8)` : isPast && hasResults ? `2px solid rgba(57,211,83,0.6)` : "2px solid transparent",
              outline: "none",
              background: bgColor,
              cursor: "pointer",
              transition: "background 0.15s ease",
              scrollSnapAlign: "start",
              padding: 0,
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Active indicator top bar */}
            {isCurrent && (
              <div style={{
                position: "absolute",
                top: 0, left: 0, right: 0,
                height: "2px",
                background: "var(--accent-red)",
                boxShadow: "0 0 12px rgba(232,0,45,0.8)",
              }} />
            )}

            {/* Circuit image area */}
            <div style={{
              position: "relative",
              height: "72px",
              overflow: "hidden",
              background: "transparent",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}>
              {imgSrc ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={imgSrc}
                  alt={race.circuitName}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                    objectPosition: "center",
                    padding: "8px 14px",
                    opacity: isCurrent
                      ? 1
                      : isPast && hasResults
                      ? 0.5
                      : 0.25,
                    filter: isCurrent
                      ? "none"
                      : isPast && hasResults
                      ? "sepia(0.6) hue-rotate(80deg) saturate(1.4)"
                      : "none",
                    transition: "opacity 0.2s ease, filter 0.2s ease",
                  }}
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.display = "none";
                  }}
                />
              ) : (
                <span style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "9px",
                  letterSpacing: "0.12em",
                  color: "rgba(255,255,255,0.2)",
                }}>
                  {race.circuitName.toUpperCase()}
                </span>
              )}

              {/* Completed checkmark overlay */}
              {isPast && hasResults && (
                <div style={{
                  position: "absolute",
                  top: "6px",
                  right: "8px",
                  width: "16px",
                  height: "16px",
                  borderRadius: "50%",
                  background: "rgba(57,211,83,0.9)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "9px",
                  color: "white",
                  fontWeight: 700,
                }}>
                  ✓
                </div>
              )}
            </div>

            {/* Divider */}
            <div style={{ height: "1px", background: borderColor, transition: "background 0.15s ease" }} />

            {/* Info row */}
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "8px 12px 10px",
            }}>
              {/* Round badge */}
              <span style={{
                fontFamily: "var(--font-mono)",
                fontSize: "9px",
                fontWeight: 700,
                letterSpacing: "0.12em",
                color: isCurrent ? "var(--accent-red)" : isPast && hasResults ? "var(--accent-green)" : "var(--text-muted)",
                background: isCurrent ? "rgba(232,0,45,0.12)" : isPast && hasResults ? "rgba(57,211,83,0.1)" : "rgba(255,255,255,0.05)",
                padding: "2px 5px",
                borderRadius: "3px",
                flexShrink: 0,
              }}>
                R{race.round}
              </span>

              <div style={{ flex: 1, minWidth: 0, textAlign: "left" }}>
                {/* Country */}
                <div style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "12px",
                  fontWeight: isCurrent ? 700 : 500,
                  color: isCurrent ? "var(--text-primary)" : "var(--text-secondary)",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  lineHeight: 1.3,
                }}>
                  {race.country}
                </div>
                {/* Date */}
                <div style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "10px",
                  color: "var(--text-muted)",
                  letterSpacing: "0.02em",
                  lineHeight: 1.3,
                }}>
                  {dateStr}
                </div>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
