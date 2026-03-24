import type { RaceSimulation } from "@/types/simulation";

// Encodes simulations to compact base64url string
export function encodeSimulations(simulations: RaceSimulation[]): string {
  // Only include sims that have any results
  const filled = simulations
    .filter(s => Object.keys(s.results).length > 0 || Object.keys(s.sprintResults ?? {}).length > 0)
    .map(s => ({
      r: s.round,
      // results: array of [driverId, position|"D"|"N"|"Q"] where D=DNF, N=DNS, Q=DSQ
      res: Object.entries(s.results).map(([id, e]) => [
        id, e.dnf ? e.dnf[0] : e.position  // first char of DNF reason or position number
      ]),
      // sprint results
      spr: Object.entries(s.sprintResults ?? {}).map(([id, e]) => [
        id, e.dnf ? e.dnf[0] : e.position
      ]),
    }));
  const json = JSON.stringify(filled);
  // btoa with URL-safe chars
  return btoa(json).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

export function decodeSimulations(encoded: string): Array<{
  round: number;
  results: Record<string, { pos: number | null; dnf: string | null }>;
  sprint: Record<string, { pos: number | null; dnf: string | null }>;
}> | null {
  try {
    const b64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
    const json = atob(b64);
    const raw = JSON.parse(json) as Array<{
      r: number;
      res: Array<[string, number | string]>;
      spr: Array<[string, number | string]>;
    }>;

    return raw.map(item => {
      const results: Record<string, { pos: number | null; dnf: string | null }> = {};
      for (const [id, val] of item.res) {
        if (typeof val === "number") {
          results[id] = { pos: val, dnf: null };
        } else {
          const dnfMap: Record<string, string> = { D: "DNF", N: "DNS", Q: "DSQ" };
          results[id] = { pos: null, dnf: dnfMap[val] ?? "DNF" };
        }
      }

      const sprint: Record<string, { pos: number | null; dnf: string | null }> = {};
      for (const [id, val] of (item.spr ?? [])) {
        if (typeof val === "number") {
          sprint[id] = { pos: val, dnf: null };
        } else {
          const dnfMap: Record<string, string> = { D: "DNF", N: "DNS", Q: "DSQ" };
          sprint[id] = { pos: null, dnf: dnfMap[val] ?? "DNF" };
        }
      }

      return { round: item.r, results, sprint };
    });
  } catch {
    return null;
  }
}
