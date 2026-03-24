"use client";

import type { CSSProperties } from "react";
import { getFlagUrl } from "@/constants/f1";
import { CIRCUIT_DETAILS } from "@/constants/circuits";
import { CircuitCanvas3D } from "./CircuitCanvas3D";
import type { Race } from "@/types/f1";

function zoneLabel(season: string) {
  return parseInt(season, 10) >= 2026 ? "OA" : "DRS";
}
function zoneLabelFull(season: string) {
  return parseInt(season, 10) >= 2026 ? "Overtaking Aid" : "DRS Zone";
}

const OA_COLOR = "#00ffcc";

interface Props {
  race: Race | null;
  /** When true, the component fills its parent 100% and embeds the header inside the canvas */
  embedded?: boolean;
  onClose?: () => void;
}

export function CircuitDetailView({ race, embedded, onClose }: Props) {
  if (!race) return null;

  const detail      = CIRCUIT_DETAILS[race.circuitId];
  const isCompleted = new Date(race.date) < new Date();
  const is2026Plus  = parseInt(race.season, 10) >= 2026;
  const zl          = zoneLabel(race.season);
  const zlFull      = zoneLabelFull(race.season);

  /* ── Embedded (full-container) mode ─────────────────────────────────────── */
  if (embedded) {
    return (
      <div style={{ width: "100%", height: "100%", position: "relative", background: "#060209" }}>

        {/* Three.js canvas — fills entire space */}
        {detail && <CircuitCanvas3D race={race} detail={detail} />}

        {/* ── Top header overlay ───────────────────────────────────── */}
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, zIndex: 10,
          padding: "12px 50px 28px 14px",
          background: "linear-gradient(to bottom, rgba(6,2,9,0.92) 40%, transparent 100%)",
          pointerEvents: "none",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={getFlagUrl(race.country)} alt={race.country}
              style={{ width: "18px", height: "13px", objectFit: "cover", borderRadius: "2px", flexShrink: 0 }} />
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", fontWeight: 700, color: "var(--accent-red)", letterSpacing: "0.12em", textTransform: "uppercase" }}>
              Round {String(race.round).padStart(2, "0")} · {race.raceName.replace(" Grand Prix", " GP")}
            </span>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "rgba(255,255,255,0.22)" }}>
              — {race.circuitName}
            </span>
            {is2026Plus && (
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "9px", color: OA_COLOR, letterSpacing: "0.1em", background: "rgba(0,255,204,0.07)", border: `1px solid rgba(0,255,204,0.2)`, padding: "2px 8px", borderRadius: "100px" }}>
                2026 ERA · NO DRS
              </span>
            )}
            {isCompleted && (
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "9px", color: "rgba(255,255,255,0.25)", letterSpacing: "0.1em", background: "rgba(255,255,255,0.05)", padding: "2px 8px", borderRadius: "100px" }}>
                COMPLETED
              </span>
            )}
          </div>
        </div>

        {/* ── Close button ─────────────────────────────────────────── */}
        {onClose && (
          <button
            onClick={onClose}
            style={{
              position: "absolute", top: 10, right: 12, zIndex: 20,
              background: "rgba(6,2,9,0.8)", border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "6px", cursor: "pointer", color: "rgba(255,255,255,0.5)",
              display: "flex", alignItems: "center", gap: "4px",
              padding: "5px 8px",
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>arrow_back</span>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "8px", letterSpacing: "0.1em" }}>GLOBE</span>
          </button>
        )}

        {/* ── Top-left legend ──────────────────────────────────────── */}
        {detail && (
          <div style={{
            position: "absolute", top: 50, left: 14, zIndex: 10,
            display: "flex", flexDirection: "column", gap: "5px",
            pointerEvents: "none",
          }}>
            <div style={overlayPill()}>
              <div style={{ width: 16, height: 3, borderRadius: 2, background: is2026Plus ? OA_COLOR : "#00e566", boxShadow: `0 0 5px ${is2026Plus ? OA_COLOR : "#00e566"}` }} />
              <span style={monoSm()}>{zlFull} · {detail.drsZones}×</span>
            </div>
            <div style={overlayPill()}>
              <div style={{
                width: 15, height: 15, borderRadius: "50%",
                background: "rgba(8,3,3,0.92)", border: "1px solid rgba(255,255,255,0.35)",
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              }}>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "7px", color: "rgba(255,255,255,0.85)", fontWeight: 700 }}>1</span>
              </div>
              <span style={monoSm()}>{detail.turns} turns</span>
            </div>
            <div style={overlayPill()}>
              <div style={{ width: 16, height: 3, borderRadius: 2, background: "white", boxShadow: "0 0 4px rgba(255,255,255,0.6)" }} />
              <span style={monoSm()}>track</span>
            </div>
            <div style={{ ...overlayPill(), marginTop: 2 }}>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "7px", color: "rgba(255,255,255,0.22)", letterSpacing: "0.06em" }}>hover to pause</span>
            </div>
          </div>
        )}

        {/* ── Top-right stats ───────────────────────────────────────── */}
        {detail && (
          <div style={{
            position: "absolute", top: 50, right: 14, zIndex: 10,
            display: "flex", flexDirection: "column", gap: "5px",
            pointerEvents: "none",
          }}>
            {[
              { label: "Track Length",   value: `${detail.length.toFixed(3)} km` },
              { label: "Lap Record",     value: detail.lapRecord, sub: `${detail.lapRecordHolder} · ${detail.lapRecordYear}`, red: true },
              { label: "First GP",       value: String(detail.firstGP) },
              { label: "Est. Top Speed", value: `${detail.topSpeed} km/h` },
              { label: "Elevation Δ",    value: `+${detail.elevationChange} m` },
            ].map(({ label, value, sub, red }) => (
              <div key={label} style={{
                background: "rgba(6,2,9,0.84)", border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: "7px", padding: "6px 10px", minWidth: 130,
              }}>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: "7px", letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.28)", marginBottom: "2px" }}>
                  {label}
                </div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: "13px", fontWeight: 700, color: red ? "#e00700" : "rgba(255,255,255,0.85)", lineHeight: 1 }}>
                  {value}
                </div>
                {sub && (
                  <div style={{ fontFamily: "var(--font-sans)", fontSize: "9px", color: "rgba(255,255,255,0.3)", marginTop: "2px" }}>{sub}</div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ── Bottom strip ─────────────────────────────────────────── */}
        {detail && (
          <div style={{
            position: "absolute", bottom: 0, left: 0, right: 0, zIndex: 10,
            padding: "8px 16px",
            background: "linear-gradient(transparent, rgba(6,2,9,0.94))",
            display: "flex", alignItems: "center", gap: "18px",
            pointerEvents: "none",
          }}>
            {[
              { icon: "route",        val: `${detail.length.toFixed(3)} km` },
              { icon: "rotate_right", val: `${detail.turns} turns` },
              { icon: "speed",        val: `${detail.drsZones}× ${zl}` },
              { icon: "landscape",    val: `+${detail.elevationChange} m elev.` },
            ].map(({ icon, val }) => (
              <div key={icon} style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                <span className="material-symbols-outlined" style={{ fontSize: "13px", color: "rgba(224,7,0,0.65)" }}>{icon}</span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "9px", color: "rgba(255,255,255,0.38)", letterSpacing: "0.07em" }}>{val}</span>
              </div>
            ))}

            {/* Description inline in bottom strip */}
            {detail.description && (
              <span style={{
                marginLeft: "auto", fontFamily: "var(--font-sans)", fontSize: "9px",
                color: "rgba(255,255,255,0.18)", fontStyle: "italic",
                maxWidth: "320px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              }}>
                "{detail.description}"
              </span>
            )}
          </div>
        )}

        {/* No-detail fallback */}
        {!detail && (
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 3 }}>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "rgba(255,255,255,0.2)" }}>
              No circuit data available
            </span>
          </div>
        )}
      </div>
    );
  }

  /* ── Standalone mode (original layout, used elsewhere) ──────────────────── */
  return (
    <div style={{
      padding: "28px 28px 40px",
      borderTop: "1px solid rgba(224,7,0,0.1)",
      animation: "fadeSlideUp 0.45s ease both",
    }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "22px" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={getFlagUrl(race.country)} alt={race.country}
          style={{ width: "18px", height: "13px", objectFit: "cover", borderRadius: "2px", flexShrink: 0 }} />
        <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", fontWeight: 700, color: "var(--accent-red)", letterSpacing: "0.12em", textTransform: "uppercase" }}>
          Round {String(race.round).padStart(2, "0")} · {race.raceName.replace(" Grand Prix", " GP")}
        </span>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "rgba(255,255,255,0.22)" }}>
          — {race.circuitName}
        </span>
        {is2026Plus && (
          <span style={{ marginLeft: "4px", fontFamily: "var(--font-mono)", fontSize: "9px", color: OA_COLOR, letterSpacing: "0.1em", background: "rgba(0,255,204,0.07)", border: `1px solid rgba(0,255,204,0.2)`, padding: "2px 8px", borderRadius: "100px" }}>
            2026 ERA · NO DRS
          </span>
        )}
        {isCompleted && (
          <span style={{ marginLeft: "auto", fontFamily: "var(--font-mono)", fontSize: "9px", color: "rgba(255,255,255,0.25)", letterSpacing: "0.1em", background: "rgba(255,255,255,0.05)", padding: "2px 8px", borderRadius: "100px" }}>
            COMPLETED
          </span>
        )}
      </div>

      {/* 3-D canvas */}
      <div style={{ position: "relative", borderRadius: "14px", overflow: "hidden", height: "480px", border: "1px solid rgba(224,7,0,0.13)", background: "#060209" }}>
        {detail && <CircuitCanvas3D race={race} detail={detail} />}

        {detail && (
          <div style={{ position: "absolute", top: 14, left: 14, zIndex: 10, display: "flex", flexDirection: "column", gap: "5px", pointerEvents: "none" }}>
            <div style={overlayPill()}>
              <div style={{ width: 16, height: 3, borderRadius: 2, background: is2026Plus ? OA_COLOR : "#00e566", boxShadow: `0 0 5px ${is2026Plus ? OA_COLOR : "#00e566"}` }} />
              <span style={monoSm()}>{zlFull} · {detail.drsZones}×</span>
            </div>
            <div style={overlayPill()}>
              <div style={{ width: 15, height: 15, borderRadius: "50%", background: "rgba(8,3,3,0.92)", border: "1px solid rgba(255,255,255,0.35)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "7px", color: "rgba(255,255,255,0.85)", fontWeight: 700 }}>1</span>
              </div>
              <span style={monoSm()}>{detail.turns} turns</span>
            </div>
            <div style={overlayPill()}>
              <div style={{ width: 16, height: 3, borderRadius: 2, background: "white", boxShadow: "0 0 4px rgba(255,255,255,0.6)" }} />
              <span style={monoSm()}>track</span>
            </div>
            <div style={{ ...overlayPill(), marginTop: 2 }}>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "7px", color: "rgba(255,255,255,0.22)", letterSpacing: "0.06em" }}>hover to pause</span>
            </div>
          </div>
        )}

        {detail && (
          <div style={{ position: "absolute", top: 14, right: 14, zIndex: 10, display: "flex", flexDirection: "column", gap: "5px", pointerEvents: "none" }}>
            {[
              { label: "Track Length",   value: `${detail.length.toFixed(3)} km` },
              { label: "Lap Record",     value: detail.lapRecord, sub: `${detail.lapRecordHolder} · ${detail.lapRecordYear}`, red: true },
              { label: "First GP",       value: String(detail.firstGP) },
              { label: "Est. Top Speed", value: `${detail.topSpeed} km/h` },
              { label: "Elevation Δ",    value: `+${detail.elevationChange} m` },
            ].map(({ label, value, sub, red }) => (
              <div key={label} style={{ background: "rgba(6,2,9,0.84)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "7px", padding: "6px 10px", minWidth: 130 }}>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: "7px", letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.28)", marginBottom: "2px" }}>{label}</div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: "13px", fontWeight: 700, color: red ? "#e00700" : "rgba(255,255,255,0.85)", lineHeight: 1 }}>{value}</div>
                {sub && <div style={{ fontFamily: "var(--font-sans)", fontSize: "9px", color: "rgba(255,255,255,0.3)", marginTop: "2px" }}>{sub}</div>}
              </div>
            ))}
          </div>
        )}

        {detail && (
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, zIndex: 10, padding: "8px 16px", background: "linear-gradient(transparent, rgba(6,2,9,0.94))", display: "flex", alignItems: "center", gap: "18px", pointerEvents: "none" }}>
            {[
              { icon: "route",        val: `${detail.length.toFixed(3)} km` },
              { icon: "rotate_right", val: `${detail.turns} turns` },
              { icon: "speed",        val: `${detail.drsZones}× ${zl}` },
              { icon: "landscape",    val: `+${detail.elevationChange} m elev.` },
            ].map(({ icon, val }) => (
              <div key={icon} style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                <span className="material-symbols-outlined" style={{ fontSize: "13px", color: "rgba(224,7,0,0.65)" }}>{icon}</span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "9px", color: "rgba(255,255,255,0.38)", letterSpacing: "0.07em" }}>{val}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {detail && (
        <p style={{ margin: "18px 0 0", fontFamily: "var(--font-sans)", fontSize: "13px", color: "rgba(255,255,255,0.3)", fontStyle: "italic", textAlign: "center", letterSpacing: "0.01em" }}>
          "{detail.description}"
        </p>
      )}
    </div>
  );
}

/* ── Tiny style helpers ──────────────────────────────────────────────────── */
function overlayPill(): CSSProperties {
  return {
    display: "flex", alignItems: "center", gap: "7px",
    background: "rgba(6,2,9,0.82)",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: "6px", padding: "5px 9px",
  };
}
function monoSm(): CSSProperties {
  return {
    fontFamily: "var(--font-mono)", fontSize: "8px",
    color: "rgba(255,255,255,0.42)", letterSpacing: "0.06em",
  };
}
