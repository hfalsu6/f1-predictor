"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { CIRCUIT_COORDS, CIRCUIT_IMAGES, getFlagUrl } from "@/constants/f1";
import type { Race } from "@/types/f1";

interface CircuitPoint {
  race: Race;
  lat: number;
  lng: number;
  isNext: boolean;
  isCompleted: boolean;
}

interface Props {
  races: Race[];
  nextRaceRound?: number;
  onSelect?: (race: Race | null) => void;
}

export interface CircuitMapHandle {
  flyTo: (lat: number, lng: number, altitude?: number, duration?: number) => void;
}

export const CircuitMap = forwardRef<CircuitMapHandle, Props>(function CircuitMap({ races, nextRaceRound, onSelect }, ref) {
  const containerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const globeRef     = useRef<any>(null);
  const roRef        = useRef<ResizeObserver | null>(null);

  useImperativeHandle(ref, () => ({
    flyTo: (lat, lng, altitude = 1.2, duration = 900) => {
      globeRef.current?.controls && (globeRef.current.controls().autoRotate = false);
      globeRef.current?.pointOfView?.({ lat, lng, altitude }, duration);
    },
  }));
  const [selected, setSelected]     = useState<Race | null>(null);
  const [isLoaded, setIsLoaded]     = useState(false);
  const now = new Date();

  const points: CircuitPoint[] = races
    .filter((r) => CIRCUIT_COORDS[r.circuitId])
    .map((r) => ({
      race: r,
      lat: CIRCUIT_COORDS[r.circuitId][0],
      lng: CIRCUIT_COORDS[r.circuitId][1],
      isNext:      r.round === nextRaceRound,
      isCompleted: new Date(r.date) < now,
    }));

  useEffect(() => {
    if (!containerRef.current) return;
    let cancelled = false;

    import("globe.gl").then(({ default: GlobeConstructor }) => {
      // globe.gl exports a curried factory but its TS types declare it as a class constructor
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const Globe = GlobeConstructor as any;
      if (cancelled || !containerRef.current) return;

      const w = containerRef.current.offsetWidth;
      const h = containerRef.current.offsetHeight;

      const globe = Globe({ animateIn: true })(containerRef.current)
        .width(w)
        .height(h)
        .backgroundColor("#060209")
        // Earth night lights texture (city glow from space)
        .globeImageUrl("//unpkg.com/three-globe/example/img/earth-night.jpg")
        .bumpImageUrl("//unpkg.com/three-globe/example/img/earth-topology.png")
        // Red atmosphere to match the F1 theme
        .atmosphereColor("rgba(200,10,0,0.85)")
        .atmosphereAltitude(0.14)
        // HTML markers
        .htmlElementsData(points)
        .htmlLat((d: object) => (d as CircuitPoint).lat)
        .htmlLng((d: object) => (d as CircuitPoint).lng)
        .htmlAltitude(0.01)
        .htmlElement((d: object) => {
          const pt = d as CircuitPoint;

          const el = document.createElement("div");
          el.style.cssText = `
            width: 26px;
            height: 26px;
            border-radius: 50%;
            background: ${pt.isCompleted ? "#282828" : "#e00700"};
            opacity: ${pt.isCompleted ? 0.5 : 1};
            border: 2px solid rgba(255,255,255,${pt.isNext ? "0.45" : "0.18"});
            box-shadow: ${pt.isNext
              ? "0 0 0 4px rgba(224,7,0,0.3), 0 0 20px rgba(224,7,0,0.8)"
              : "0 0 10px rgba(224,7,0,0.45)"};
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: 'IBM Plex Mono', monospace;
            font-size: 9px;
            font-weight: 700;
            color: white;
            cursor: pointer;
            transition: transform 0.15s ease, box-shadow 0.15s ease;
            pointer-events: all;
            user-select: none;
          `;
          el.textContent = String(pt.race.round).padStart(2, "0");

          // Prevent OrbitControls from treating the marker tap as a drag/pan
          el.addEventListener("mousedown",   (e) => e.stopPropagation());
          el.addEventListener("pointerdown", (e) => e.stopPropagation());
          el.addEventListener("touchstart",  (e) => e.stopPropagation(), { passive: true });

          el.addEventListener("click", (e) => {
            e.stopPropagation();
            globe.controls().autoRotate = false;
            setSelected(pt.race);
            onSelect?.(pt.race);
            globe.pointOfView({ lat: pt.lat, lng: pt.lng, altitude: 1.8 }, 700);
          });
          el.addEventListener("mouseenter", () => {
            el.style.transform = "scale(1.3)";
            el.style.zIndex = "9999";
          });
          el.addEventListener("mouseleave", () => {
            el.style.transform = "scale(1)";
          });

          return el;
        });

      // Camera controls
      globe.controls().autoRotate      = true;
      globe.controls().autoRotateSpeed = 0.45;
      globe.controls().enableDamping   = true;
      globe.controls().dampingFactor   = 0.08;
      globe.controls().minDistance     = 150;
      globe.controls().maxDistance     = 700;

      // Initial camera position
      globe.pointOfView({ lat: 20, lng: 10, altitude: 2.4 });

      // Fly to next race after a short delay
      if (nextRaceRound) {
        const next = points.find((p) => p.race.round === nextRaceRound);
        if (next) {
          setTimeout(() => {
            globe.pointOfView({ lat: next.lat, lng: next.lng, altitude: 2.0 }, 1600);
          }, 900);
        }
      }

      globeRef.current = globe as typeof globeRef.current;
      setIsLoaded(true);

      // Resize observer
      roRef.current = new ResizeObserver(() => {
        if (!containerRef.current) return;
        globe
          .width(containerRef.current.offsetWidth)
          .height(containerRef.current.offsetHeight);
      });
      roRef.current.observe(containerRef.current);
    });

    return () => {
      cancelled = true;
      roRef.current?.disconnect();
      // Clear the canvas so hot-reload doesn't stack canvases
      if (containerRef.current) containerRef.current.innerHTML = "";
      globeRef.current = null;
      setIsLoaded(false);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const closePanel = () => {
    setSelected(null);
    if (globeRef.current) globeRef.current.controls().autoRotate = true;
  };

  return (
    <div style={{ width: "100%", height: "100%", position: "relative", background: "#060209", overflow: "hidden" }}>

      {/* Loading overlay */}
      {!isLoaded && (
        <div style={{
          position: "absolute", inset: 0, zIndex: 5,
          display: "flex", alignItems: "center", justifyContent: "center",
          background: "#060209",
        }}>
          <span
            className="material-symbols-outlined"
            style={{ fontSize: "48px", color: "rgba(224,7,0,0.25)", animation: "pulse-dot 1.4s ease-in-out infinite" }}
          >
            public
          </span>
        </div>
      )}

      {/* Globe canvas mount point */}
      <div ref={containerRef} style={{ width: "100%", height: "100%" }} />

      {/* Hint */}
      {isLoaded && !selected && (
        <div style={{
          position: "absolute", bottom: "14px", left: "50%", transform: "translateX(-50%)",
          padding: "5px 12px", background: "rgba(0,0,0,0.5)", borderRadius: "100px",
          fontSize: "10px", color: "rgba(255,255,255,0.3)", fontFamily: "var(--font-mono)",
          letterSpacing: "0.06em", pointerEvents: "none", whiteSpace: "nowrap",
        }}>
          click a marker · drag to rotate · scroll to zoom
        </div>
      )}

      {/* Circuit info panel */}
      {selected && (() => {
        const isNext      = selected.round === nextRaceRound;
        const isCompleted = new Date(selected.date) < now;
        const circuitImg  = CIRCUIT_IMAGES[selected.circuitId];

        return (
          <div style={{
            position: "absolute", top: "16px", right: "16px",
            width: "268px",
            background: "rgba(22,8,8,0.96)",
            border: "1px solid rgba(224,7,0,0.22)",
            borderRadius: "12px",
            overflow: "hidden",
            boxShadow: "0 12px 40px rgba(0,0,0,0.8), 0 0 0 1px rgba(224,7,0,0.08)",
            zIndex: 10,
            animation: "scaleIn 0.2s ease both",
          }}>

            {/* Close */}
            <button
              onClick={closePanel}
              style={{
                position: "absolute", top: "9px", right: "11px",
                background: "none", border: "none", cursor: "pointer",
                color: "rgba(255,255,255,0.35)", fontSize: "20px", lineHeight: 1,
                padding: 0, fontFamily: "sans-serif",
              }}
            >×</button>

            {/* Header */}
            <div style={{ padding: "14px 36px 12px 14px", borderBottom: "1px solid rgba(224,7,0,0.1)" }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                <div style={{
                  flexShrink: 0, width: "36px", height: "36px", borderRadius: "50%",
                  background: isNext ? "rgba(224,7,0,0.15)" : "rgba(255,255,255,0.05)",
                  border: isNext ? "2px solid #e00700" : "1px solid rgba(255,255,255,0.1)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: "var(--font-mono)", fontSize: "11px", fontWeight: 700,
                  color: isNext ? "#e00700" : "rgba(255,255,255,0.4)",
                }}>
                  {String(selected.round).padStart(2, "0")}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  {isNext && (
                    <span style={{
                      display: "inline-block", fontSize: "9px", fontWeight: 700,
                      letterSpacing: "0.1em", textTransform: "uppercase", color: "white",
                      background: "#e00700", padding: "2px 6px", borderRadius: "100px", marginBottom: "4px",
                    }}>Next Up</span>
                  )}
                  {isCompleted && (
                    <span style={{
                      display: "inline-block", fontSize: "9px", fontWeight: 700,
                      letterSpacing: "0.1em", textTransform: "uppercase",
                      color: "rgba(255,255,255,0.3)", background: "rgba(255,255,255,0.07)",
                      padding: "2px 6px", borderRadius: "100px", marginBottom: "4px",
                    }}>Completed</span>
                  )}
                  <p style={{ margin: 0, fontSize: "14px", fontWeight: 700, color: "#f1f0f2", lineHeight: 1.2, fontFamily: "var(--font-sans)" }}>
                    {selected.raceName.replace(" Grand Prix", " GP")}
                  </p>
                  <div style={{ display: "flex", alignItems: "center", gap: "5px", marginTop: "5px" }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={getFlagUrl(selected.country)} alt={selected.country}
                      style={{ width: "14px", height: "10px", objectFit: "cover", borderRadius: "2px" }} />
                    <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", fontFamily: "var(--font-sans)" }}>
                      {selected.locality} · {new Date(selected.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Circuit map */}
            <div style={{ padding: "12px 14px 14px" }}>
              {circuitImg && (
                <div style={{
                  height: "88px", display: "flex", alignItems: "center", justifyContent: "center",
                  background: "rgba(0,0,0,0.3)", borderRadius: "7px", marginBottom: "8px",
                }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={circuitImg} alt={selected.circuitName}
                    style={{
                      maxHeight: "76px", maxWidth: "100%", objectFit: "contain",
                      filter: isCompleted ? "grayscale(1) brightness(0.5)" : "brightness(0.9)",
                      opacity: isCompleted ? 0.6 : 0.95,
                    }}
                  />
                </div>
              )}
              <p style={{
                margin: 0, fontSize: "10px", color: "rgba(255,255,255,0.25)",
                fontFamily: "var(--font-mono)", letterSpacing: "0.07em",
              }}>
                {selected.circuitName.toUpperCase()}
              </p>
            </div>

          </div>
        );
      })()}
    </div>
  );
});
