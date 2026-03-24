"use client";

import dynamic from "next/dynamic";
import { forwardRef } from "react";
import type { Race } from "@/types/f1";
import type { CircuitMapHandle } from "./CircuitMap";

const CircuitMapDynamic = dynamic(
  () => import("./CircuitMap").then((m) => m.CircuitMap),
  {
    ssr: false,
    loading: () => (
      <div style={{
        width: "100%", height: "100%",
        display: "flex", alignItems: "center", justifyContent: "center",
        background: "#160b0b",
      }}>
        <span
          className="material-symbols-outlined"
          style={{ fontSize: "40px", color: "rgba(224,7,0,0.2)", animation: "pulse-dot 1.4s ease-in-out infinite" }}
        >
          public
        </span>
      </div>
    ),
  }
);

interface Props {
  races: Race[];
  nextRaceRound?: number;
  onSelect?: (race: Race | null) => void;
}

export const CircuitMapLoader = forwardRef<CircuitMapHandle, Props>(
  function CircuitMapLoader({ races, nextRaceRound, onSelect }, ref) {
    return (
      <CircuitMapDynamic
        ref={ref}
        races={races}
        nextRaceRound={nextRaceRound}
        onSelect={onSelect}
      />
    );
  }
);
