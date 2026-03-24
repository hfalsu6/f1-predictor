"use client";
import { useState } from "react";
import { useSimulationStore } from "@/store/simulationStore";
import { encodeSimulations } from "@/lib/share/encode";

export function ShareButton({ currentRound }: { currentRound: number }) {
  const [copied, setCopied] = useState(false);
  const simulations = useSimulationStore(s => s.simulations);

  const hasAny = simulations.some(s => Object.keys(s.results).length > 0);

  const handleShare = async () => {
    const encoded = encodeSimulations(simulations);
    const url = `${window.location.origin}/simulate/${currentRound}?s=${encoded}`;
    await navigator.clipboard.writeText(url).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleShare}
      disabled={!hasAny}
      style={{
        display: "flex", alignItems: "center", gap: "5px",
        padding: "6px 12px",
        background: copied ? "rgba(57,211,83,0.1)" : "transparent",
        border: `1px solid ${copied ? "rgba(57,211,83,0.3)" : "var(--border)"}`,
        borderRadius: "4px",
        color: copied ? "var(--accent-green)" : "var(--text-muted)",
        fontFamily: "var(--font-mono)", fontSize: "11px", letterSpacing: "0.08em",
        cursor: hasAny ? "pointer" : "not-allowed",
        opacity: hasAny ? 1 : 0.4,
        transition: "all 0.2s ease",
      }}
    >
      <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>
        {copied ? "check" : "share"}
      </span>
      {copied ? "Copied!" : "Share"}
    </button>
  );
}
