"use client";

import { useRef, useState } from "react";
import type { Race } from "@/types/f1";
import { CIRCUIT_COORDS, CIRCUIT_IMAGES, getFlagUrl } from "@/constants/f1";
import { CircuitMapLoader } from "./CircuitMapLoader";
import { CircuitDetailView } from "./CircuitDetailView";
import type { CircuitMapHandle } from "./CircuitMap";

interface Props {
  races: Race[];
  nextRaceRound?: number;
  nextRace?: Race;
}

const VIEWER_H  = 500;  // single merged viewer height — same for globe & circuit
const FLY_MS    = 1100; // fly to circuit location (altitude 0.8)
const ZOOM_MS   = 900;  // zoom into surface (altitude 0.08) after landing
const ZOOM_CUT  = 0.45; // fraction of zoom completed when circuit cuts in

export function MapsClient({ races, nextRaceRound, nextRace }: Props) {
  const [selected,     setSelected]     = useState<Race | null>(null);
  const [showCircuit,  setShowCircuit]  = useState(false);
  const globeRef   = useRef<CircuitMapHandle>(null);
  const timerRef   = useRef<ReturnType<typeof setTimeout> | null>(null);
  const now        = new Date();

  const handleSelect = (race: Race | null) => {
    // Clear any in-flight timer so rapid clicks don't stack
    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }

    if (!race) {
      // Close: cross-fade back to globe immediately
      setShowCircuit(false);
      setSelected(null);
      return;
    }

    // 1) Hide circuit (for when switching between circuits)
    setShowCircuit(false);
    // 2) Mount new circuit so Three.js loads silently during the transition
    setSelected(race);

    const coords = CIRCUIT_COORDS[race.circuitId];

    // 3) Fly globe to the circuit's location
    if (coords) globeRef.current?.flyTo(coords[0], coords[1], 0.8, FLY_MS);

    // 4) After fly lands: zoom in dramatically toward the surface
    timerRef.current = setTimeout(() => {
      if (coords) globeRef.current?.flyTo(coords[0], coords[1], 0.08, ZOOM_MS);

      // 5) Cut in the circuit layout partway through the zoom — feels snappy
      timerRef.current = setTimeout(() => setShowCircuit(true), Math.round(ZOOM_MS * ZOOM_CUT));
    }, FLY_MS + 60);
  };

  return (
    <>
      {/* ── Single merged viewer: globe ↔ circuit layout ──────────── */}
      <div style={{
        position: "relative",
        height: VIEWER_H,
        flexShrink: 0,
        overflow: "hidden",
        background: "#060209",
      }}>

        {/* ── Globe layer — stays visible during fly, fades out after landing ── */}
        <div style={{
          position: "absolute", inset: 0, zIndex: 1,
          opacity: showCircuit ? 0 : 1,
          transition: "opacity 0.42s ease",
          pointerEvents: showCircuit ? "none" : "auto",
        }}>
          <CircuitMapLoader
            ref={globeRef}
            races={races}
            nextRaceRound={nextRaceRound}
            onSelect={handleSelect}
          />
        </div>

        {/* ── Circuit layout layer — cross-fades in after globe finishes flying ── */}
        <div style={{
          position: "absolute", inset: 0, zIndex: 2,
          opacity: showCircuit ? 1 : 0,
          transition: "opacity 0.42s ease",
          pointerEvents: showCircuit ? "auto" : "none",
        }}>
          <CircuitDetailView
            race={selected}
            embedded
            onClose={() => handleSelect(null)}
          />
        </div>

      </div>

      {/* ── Below-fold content ──────────────────────────────────────── */}
      <div style={{ padding: "24px 28px 32px" }}>

        {/* Next race banner */}
        {nextRace && (
          <div style={{
            marginBottom: "20px", padding: "14px 18px",
            background: "rgba(224,7,0,0.05)", border: "1px solid rgba(224,7,0,0.15)",
            borderLeft: "3px solid var(--accent-red)", borderRadius: "8px",
            display: "flex", alignItems: "center", gap: "14px",
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: "20px", color: "var(--accent-red)", flexShrink: 0 }}>
              location_on
            </span>
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, fontSize: "11px", color: "var(--accent-red)", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "var(--font-sans)" }}>
                Next Race — Round {nextRace.round}
              </p>
              <p style={{ margin: "2px 0 0", fontSize: "14px", fontWeight: 700, color: "var(--text-primary)", fontFamily: "var(--font-sans)" }}>
                {nextRace.raceName} · {nextRace.circuitName}
              </p>
            </div>
            <p style={{ margin: 0, fontSize: "12px", color: "var(--text-secondary)", fontFamily: "var(--font-mono)", flexShrink: 0 }}>
              {new Date(nextRace.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            </p>
          </div>
        )}

        <h2 style={{
          fontSize: "13px", fontWeight: 700, margin: "0 0 14px",
          color: "var(--text-muted)", letterSpacing: "0.12em", textTransform: "uppercase",
          fontFamily: "var(--font-sans)",
        }}>
          All Circuits
        </h2>

        {/* Circuit grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "10px" }}>
          {races.map((race) => {
            const isCompleted = new Date(race.date) < now;
            const isNext      = race.round === nextRace?.round;
            const isSelected  = selected?.round === race.round;

            return (
              <button
                key={race.round}
                onClick={() => handleSelect(isSelected ? null : race)}
                style={{
                  all: "unset",
                  cursor: "pointer",
                  padding: "14px",
                  background: isSelected
                    ? "rgba(224,7,0,0.1)"
                    : isNext
                    ? "rgba(224,7,0,0.05)"
                    : "rgba(224,7,0,0.02)",
                  border: isSelected
                    ? "1px solid rgba(224,7,0,0.45)"
                    : isNext
                    ? "1px solid rgba(224,7,0,0.2)"
                    : "1px solid rgba(224,7,0,0.07)",
                  borderRadius: "10px",
                  display: "flex", flexDirection: "column", gap: "8px",
                  opacity: isCompleted ? 0.5 : 1,
                  transition: "border-color 0.15s ease, background 0.15s ease, transform 0.12s ease",
                  boxShadow: isSelected ? "0 0 0 1px rgba(224,7,0,0.2), 0 4px 20px rgba(224,7,0,0.12)" : "none",
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(224,7,0,0.28)";
                  (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)";
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) (e.currentTarget as HTMLButtonElement).style.borderColor =
                    isNext ? "rgba(224,7,0,0.2)" : "rgba(224,7,0,0.07)";
                  (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
                }}
              >
                {/* Circuit SVG */}
                <div style={{ height: "60px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {CIRCUIT_IMAGES[race.circuitId] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={CIRCUIT_IMAGES[race.circuitId]}
                      alt={race.circuitName}
                      style={{
                        maxHeight: "60px", maxWidth: "100%", objectFit: "contain",
                        filter: isSelected ? "brightness(1) drop-shadow(0 0 5px rgba(224,7,0,0.5))" : "brightness(0.75)",
                        opacity: isSelected ? 1 : 0.75,
                        transition: "filter 0.2s ease, opacity 0.2s ease",
                      }}
                    />
                  ) : (
                    <span className="material-symbols-outlined" style={{ fontSize: "28px", color: "rgba(224,7,0,0.12)" }}>route</span>
                  )}
                </div>

                {/* Info */}
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "5px", marginBottom: "3px" }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={getFlagUrl(race.country)} alt={race.country}
                      style={{ width: "14px", height: "10px", objectFit: "cover", borderRadius: "1px" }} />
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "9px", color: isNext ? "var(--accent-red)" : "var(--text-muted)", letterSpacing: "0.1em" }}>
                      R{String(race.round).padStart(2, "0")}
                    </span>
                    {isCompleted && (
                      <span style={{ fontSize: "8px", color: "rgba(255,255,255,0.25)", marginLeft: "auto" }}>✓</span>
                    )}
                    {isSelected && (
                      <span style={{ fontSize: "8px", color: "var(--accent-red)", marginLeft: "auto" }}>●</span>
                    )}
                  </div>
                  <p style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-primary)", margin: "0 0 2px", fontFamily: "var(--font-sans)", lineHeight: 1.3 }}>
                    {race.raceName.replace(" Grand Prix", " GP")}
                  </p>
                  <p style={{ fontSize: "9px", color: "var(--text-muted)", margin: 0, fontFamily: "var(--font-sans)" }}>
                    {race.locality}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

      </div>
    </>
  );
}
