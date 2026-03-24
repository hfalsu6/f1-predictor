"use client";
import { useState } from "react";
import type { DriverStanding } from "@/types/f1";
import { DriverStandingsTable } from "./DriverStandingsTable";
import { DriverProfileDrawer } from "./DriverProfileDrawer";

interface Props {
  standings: DriverStanding[];
}

export function StandingsWithProfile({ standings }: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = standings.find(s => s.driver.driverId === selectedId) ?? null;

  return (
    <>
      <DriverStandingsTable standings={standings} onDriverClick={setSelectedId} />
      <DriverProfileDrawer standing={selected} onClose={() => setSelectedId(null)} />
    </>
  );
}
