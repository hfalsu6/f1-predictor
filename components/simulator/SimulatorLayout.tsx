"use client";

import { useEffect } from "react";
import Link from "next/link";
import { CIRCUIT_IMAGES, getFlagUrl } from "@/constants/f1";
import { useSimulationStore } from "@/store/simulationStore";
import { RaceSimulator } from "./RaceSimulator";
import { MultiRaceProgress } from "./MultiRaceProgress";
import { LiveStandingsPanel } from "@/components/preview/LiveStandingsPanel";
import { ShareButton } from "./ShareButton";
import { ChampionshipSwingPanel } from "./ChampionshipSwingPanel";
import { ActualResultsPanel } from "./ActualResultsPanel";
import type { DriverStanding, ConstructorStanding, Race } from "@/types/f1";

import type { CompletedRaceResult } from "@/types/f1";

interface Props {
  baselineDriverStandings: DriverStanding[];
  baselineConstructorStandings: ConstructorStanding[];
  futureRaces: Race[];
  initialRoundIndex: number;
  completedResults?: Record<number, CompletedRaceResult[]>;
}

export function SimulatorLayout({
  baselineDriverStandings,
  baselineConstructorStandings,
  futureRaces,
  initialRoundIndex,
  completedResults,
}: Props) {
  const initializeBaseline = useSimulationStore((s) => s.initializeBaseline);
  const currentRaceIndex   = useSimulationStore((s) => s.currentRaceIndex);
  const currentRace        = futureRaces[currentRaceIndex];
  const advanceToNextRace  = useSimulationStore((s) => s.advanceToNextRace);
  const resetCurrentRace   = useSimulationStore((s) => s.resetCurrentRace);
  const goToRace           = useSimulationStore((s) => s.goToRace);
  const simulations        = useSimulationStore((s) => s.simulations);
  const currentSim         = simulations[currentRaceIndex];
  const activeTab          = useSimulationStore((s) => s.activeTab);
  const setActiveTab       = useSimulationStore((s) => s.setActiveTab);
  const assignedCount      = currentSim ? Object.keys(currentSim.results).length : 0;
  const totalDrivers       = baselineDriverStandings.length;
  const progressPct        = totalDrivers > 0 ? (assignedCount / totalDrivers) * 100 : 0;
  const isComplete         = assignedCount === totalDrivers && totalDrivers > 0;

  useEffect(() => {
    initializeBaseline(baselineDriverStandings, baselineConstructorStandings, futureRaces);
    goToRace(initialRoundIndex);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="sim-container" style={{
      display: "flex",
      flexDirection: "column",
      height: "100%",
      background: "transparent",
      overflow: "hidden",
    }}>

      {/* ── Header ── */}
      <header className="sim-header" style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 24px",
        height: "56px",
        borderBottom: "1px solid var(--border)",
        background: "var(--bg-base)",
        flexShrink: 0,
      }}>
        {/* Left: Back + brand */}
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <Link
            href="/standings"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              textDecoration: "none",
              fontFamily: "var(--font-mono)",
              fontSize: "11px",
              letterSpacing: "0.08em",
              color: "var(--text-muted)",
              padding: "5px 10px",
              borderRadius: "4px",
              border: "1px solid var(--border)",
              transition: "all 0.15s ease",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.color = "var(--text-primary)";
              (e.currentTarget as HTMLAnchorElement).style.borderColor = "var(--border-mid)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.color = "var(--text-muted)";
              (e.currentTarget as HTMLAnchorElement).style.borderColor = "var(--border)";
            }}
          >
            ← Standings
          </Link>

          <div style={{ width: "1px", height: "18px", background: "var(--border)" }} />

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{
              background: "var(--accent-red)",
              color: "white",
              fontFamily: "var(--font-data)",
              fontSize: "11px",
              fontWeight: 700,
              letterSpacing: "0.14em",
              padding: "3px 7px",
              borderRadius: "3px",
            }}>F1</span>
            <span style={{
              fontFamily: "var(--font-display)",
              fontSize: "14px",
              fontWeight: 700,
              color: "var(--text-primary)",
              letterSpacing: "-0.01em",
            }}>
              Scenario Predictor
            </span>
          </div>
        </div>

        {/* Right: Progress pill + actions */}
        <div className="sim-header-right" style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {/* Progress */}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "4px 12px",
            border: "1px solid var(--border)",
            borderRadius: "20px",
            background: isComplete ? "rgba(57,211,83,0.06)" : "transparent",
            borderColor: isComplete ? "rgba(57,211,83,0.25)" : "var(--border)",
            transition: "all 0.3s ease",
          }}>
            <div style={{
              width: "60px",
              height: "2px",
              background: "rgba(255,255,255,0.08)",
              borderRadius: "1px",
              overflow: "hidden",
            }}>
              <div style={{
                height: "100%",
                width: `${progressPct}%`,
                background: isComplete ? "var(--accent-green)" : "var(--accent-red)",
                borderRadius: "1px",
                transition: "width 0.3s ease, background 0.3s ease",
              }} />
            </div>
            <span style={{
              fontFamily: "var(--font-mono)",
              fontSize: "11px",
              color: isComplete ? "var(--accent-green)" : "var(--text-muted)",
              letterSpacing: "0.04em",
              minWidth: "36px",
            }}>
              {assignedCount}/{totalDrivers}
            </span>
          </div>

          {/* Share */}
          <ShareButton currentRound={currentRace?.round ?? 1} />

          {/* Reset */}
          <button
            onClick={resetCurrentRace}
            style={{
              padding: "6px 14px",
              background: "transparent",
              border: "1px solid var(--border)",
              borderRadius: "4px",
              color: "var(--text-muted)",
              fontFamily: "var(--font-mono)",
              fontSize: "11px",
              letterSpacing: "0.08em",
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border-mid)";
              (e.currentTarget as HTMLButtonElement).style.color = "var(--text-primary)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border)";
              (e.currentTarget as HTMLButtonElement).style.color = "var(--text-muted)";
            }}
          >
            Reset
          </button>

          {currentRaceIndex < futureRaces.length - 1 && (
            <button
              onClick={advanceToNextRace}
              style={{
                padding: "6px 16px",
                background: "var(--accent-red)",
                border: "none",
                borderRadius: "4px",
                color: "white",
                fontFamily: "var(--font-display)",
                fontSize: "13px",
                fontWeight: 700,
                letterSpacing: "0.02em",
                cursor: "pointer",
                boxShadow: "0 0 16px rgba(232,0,45,0.3)",
                transition: "background 0.15s ease",
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#c8001f"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "var(--accent-red)"; }}
            >
              Next Race →
            </button>
          )}
        </div>
      </header>

      {/* ── Race context bar ── */}
      {currentRace && (
        <div
          key={currentRace.round}
          className="animate-fade-slide-up sim-race-bar"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "24px",
            padding: "10px 24px",
            borderBottom: "1px solid var(--border)",
            background: "var(--bg-surface)",
            flexShrink: 0,
          }}
        >
          <span style={{
            fontFamily: "var(--font-mono)",
            fontSize: "10px",
            letterSpacing: "0.14em",
            color: "var(--accent-red)",
            background: "rgba(232,0,45,0.10)",
            padding: "2px 7px",
            borderRadius: "3px",
            border: "1px solid rgba(232,0,45,0.2)",
            flexShrink: 0,
          }}>
            R{currentRace.round}
          </span>
          <span style={{
            fontFamily: "var(--font-display)",
            fontSize: "15px",
            fontWeight: 700,
            color: "var(--text-primary)",
            letterSpacing: "-0.01em",
          }}>
            {currentRace.raceName}
          </span>
          <span className="sim-race-bar-divider" style={{ width: "1px", height: "14px", background: "var(--border)", flexShrink: 0 }} />
          <span className="sim-race-bar-location" style={{
            fontFamily: "var(--font-mono)",
            fontSize: "11px",
            color: "var(--text-secondary)",
            letterSpacing: "0.04em",
          }}>
            {currentRace.locality}, {currentRace.country}
          </span>
          <span className="sim-race-bar-divider" style={{ width: "1px", height: "14px", background: "var(--border)", flexShrink: 0 }} />
          <span style={{
            fontFamily: "var(--font-mono)",
            fontSize: "11px",
            color: "var(--text-muted)",
          }}>
            {new Date(currentRace.date).toLocaleDateString("en-US", {
              weekday: "short", month: "long", day: "numeric",
            })}
          </span>
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "12px" }}>
            {currentRace && getFlagUrl && (
              <img
                src={getFlagUrl(currentRace.country)}
                alt={currentRace.country}
                style={{ width: "28px", height: "18px", objectFit: "cover", borderRadius: "3px", flexShrink: 0 }}
              />
            )}
            {currentRace && CIRCUIT_IMAGES[currentRace.circuitId] && (
              <img
                src={CIRCUIT_IMAGES[currentRace.circuitId]}
                alt={`${currentRace.raceName} circuit`}
                style={{ height: "36px", maxWidth: "100px", objectFit: "contain", filter: "grayscale(1) brightness(0.7)", opacity: 0.6 }}
              />
            )}
          </div>
        </div>
      )}

      {/* ── Actual results panel (for completed races) ── */}
      {currentRace && completedResults?.[currentRace.round] && (
        <ActualResultsPanel
          results={completedResults[currentRace.round]}
          raceName={currentRace.raceName}
        />
      )}

      {/* ── Race timeline (own full-width scrollable row) ── */}
      <div className="sim-timeline" style={{
        borderBottom: "1px solid var(--border)",
        background: "var(--bg-base)",
        flexShrink: 0,
      }}>
        <MultiRaceProgress />
      </div>

      {/* ── Championship swing panel ── */}
      <ChampionshipSwingPanel />

      {/* ── Main content: full-width 3-column layout ── */}
      <div className="sim-body" style={{ flex: 1, overflow: "hidden", display: "flex" }}>
        <div className="sim-panels" style={{
          width: "100%",
          display: "flex",
          overflow: "hidden",
        }}>

          {/* Panels 1 + 2: Driver pool + Finishing order (shared DndContext) */}
          <div style={{ flex: 1, overflow: "hidden", display: "flex" }}>
            <RaceSimulator mode={activeTab} hasSprint={currentRace?.hasSprint ?? false} />
          </div>

          {/* Panel 3: Projected standings */}
          <div className="sim-standings-panel" style={{
            width: "260px",
            flexShrink: 0,
            borderLeft: "1px solid var(--border)",
            background: "var(--bg-surface)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}>
            <div style={{
              padding: "16px 20px 12px",
              borderBottom: "1px solid var(--border)",
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}>
              <span className="live-dot" />
              <span style={{
                fontFamily: "var(--font-mono)",
                fontSize: "10px",
                letterSpacing: "0.16em",
                color: "var(--text-muted)",
              }}>
                PROJECTED STANDINGS
              </span>
            </div>
            <div style={{ flex: 1, overflow: "hidden", padding: "8px" }}>
              <LiveStandingsPanel />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
