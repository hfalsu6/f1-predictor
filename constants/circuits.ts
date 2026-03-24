export interface CircuitDetail {
  length: number;          // km
  turns: number;
  drsZones: number;
  lapRecord: string;
  lapRecordHolder: string;
  lapRecordYear: number;
  elevationChange: number; // metres
  firstGP: number;
  topSpeed: number;        // estimated km/h
  description: string;
  // ~20-point normalised elevation profile (0–1, start→finish)
  elevationProfile: number[];
  // Fractions (0–1 along path) where Sector 2 and Sector 3 begin
  sectorBoundaries: [number, number];
  // DRS activation zones — approximate path fractions
  drsZonePositions: Array<{ start: number; end: number }>;
  // Optional famous corners with path fractions
  notableCorners?: Array<{ fraction: number; name: string }>;
}

export const CIRCUIT_DETAILS: Record<string, CircuitDetail> = {
  bahrain: {
    length: 5.412, turns: 15, drsZones: 3,
    lapRecord: "1:31.447", lapRecordHolder: "P. de la Rosa", lapRecordYear: 2005,
    elevationChange: 3, firstGP: 2004, topSpeed: 320,
    description: "Fast, flowing desert circuit with cool evening air giving it a second life.",
    elevationProfile: [0.30,0.30,0.32,0.30,0.28,0.30,0.32,0.30,0.28,0.30,0.32,0.30,0.28,0.30,0.32,0.30,0.30,0.30,0.30,0.30],
    sectorBoundaries: [0.33, 0.67],
    drsZonePositions: [
      { start: 0.86, end: 0.98 },
      { start: 0.20, end: 0.30 },
      { start: 0.58, end: 0.68 },
    ],
    notableCorners: [
      { fraction: 0.05, name: "T1" },
      { fraction: 0.28, name: "T4" },
      { fraction: 0.68, name: "T11" },
    ],
  },
  jeddah: {
    length: 6.174, turns: 27, drsZones: 3,
    lapRecord: "1:28.563", lapRecordHolder: "L. Hamilton", lapRecordYear: 2021,
    elevationChange: 5, firstGP: 2021, topSpeed: 335,
    description: "The fastest street circuit on the calendar, hugging the Red Sea coastline.",
    elevationProfile: [0.30,0.34,0.30,0.28,0.30,0.32,0.28,0.30,0.32,0.30,0.28,0.30,0.32,0.28,0.30,0.35,0.32,0.28,0.30,0.30],
    sectorBoundaries: [0.35, 0.70],
    drsZonePositions: [
      { start: 0.85, end: 0.98 },
      { start: 0.42, end: 0.56 },
      { start: 0.68, end: 0.80 },
    ],
  },
  albert_park: {
    length: 5.278, turns: 14, drsZones: 4,
    lapRecord: "1:19.813", lapRecordHolder: "L. Hamilton", lapRecordYear: 2019,
    elevationChange: 7, firstGP: 1996, topSpeed: 308,
    description: "Semi-permanent park circuit in Melbourne — the traditional season opener.",
    elevationProfile: [0.40,0.45,0.40,0.38,0.42,0.40,0.38,0.40,0.42,0.40,0.42,0.40,0.38,0.40,0.40,0.42,0.40,0.40,0.42,0.40],
    sectorBoundaries: [0.38, 0.68],
    drsZonePositions: [
      { start: 0.85, end: 0.98 },
      { start: 0.05, end: 0.13 },
      { start: 0.32, end: 0.42 },
      { start: 0.55, end: 0.65 },
    ],
  },
  suzuka: {
    length: 5.807, turns: 18, drsZones: 2,
    lapRecord: "1:30.983", lapRecordHolder: "L. Hamilton", lapRecordYear: 2019,
    elevationChange: 40, firstGP: 1987, topSpeed: 325,
    description: "Technical figure-eight layout — home of the legendary 130R corner.",
    elevationProfile: [0.40,0.50,0.70,0.60,0.40,0.50,0.70,0.85,0.65,0.50,0.40,0.50,0.60,0.72,0.55,0.40,0.50,0.60,0.50,0.40],
    sectorBoundaries: [0.35, 0.68],
    drsZonePositions: [
      { start: 0.88, end: 0.99 },
      { start: 0.48, end: 0.60 },
    ],
    notableCorners: [
      { fraction: 0.02, name: "T1" },
      { fraction: 0.22, name: "S-Curves" },
      { fraction: 0.65, name: "Spoon" },
      { fraction: 0.80, name: "130R" },
      { fraction: 0.88, name: "Chicane" },
    ],
  },
  shanghai: {
    length: 5.451, turns: 16, drsZones: 2,
    lapRecord: "1:32.238", lapRecordHolder: "M. Schumacher", lapRecordYear: 2004,
    elevationChange: 7, firstGP: 2004, topSpeed: 327,
    description: "Tilke masterwork with its distinctive snail-shell hairpin complex.",
    elevationProfile: [0.30,0.35,0.38,0.35,0.30,0.32,0.35,0.38,0.35,0.32,0.30,0.35,0.38,0.35,0.32,0.30,0.32,0.35,0.38,0.35],
    sectorBoundaries: [0.38, 0.68],
    drsZonePositions: [
      { start: 0.85, end: 0.98 },
      { start: 0.50, end: 0.64 },
    ],
  },
  miami: {
    length: 5.412, turns: 19, drsZones: 3,
    lapRecord: "1:29.708", lapRecordHolder: "M. Verstappen", lapRecordYear: 2023,
    elevationChange: 3, firstGP: 2022, topSpeed: 320,
    description: "Purpose-built street circuit wrapped around Hard Rock Stadium.",
    elevationProfile: [0.30,0.30,0.32,0.30,0.28,0.30,0.32,0.30,0.28,0.30,0.32,0.30,0.28,0.30,0.32,0.30,0.30,0.30,0.30,0.30],
    sectorBoundaries: [0.35, 0.68],
    drsZonePositions: [
      { start: 0.85, end: 0.98 },
      { start: 0.40, end: 0.52 },
      { start: 0.64, end: 0.76 },
    ],
  },
  imola: {
    length: 4.909, turns: 19, drsZones: 2,
    lapRecord: "1:15.484", lapRecordHolder: "R. Barrichello", lapRecordYear: 2004,
    elevationChange: 32, firstGP: 1980, topSpeed: 310,
    description: "Narrow, unforgiving Apennine circuit with zero room for error.",
    elevationProfile: [0.40,0.50,0.60,0.72,0.65,0.60,0.50,0.40,0.45,0.50,0.60,0.72,0.65,0.55,0.45,0.40,0.45,0.50,0.50,0.45],
    sectorBoundaries: [0.40, 0.72],
    drsZonePositions: [
      { start: 0.88, end: 0.99 },
      { start: 0.60, end: 0.72 },
    ],
    notableCorners: [
      { fraction: 0.05, name: "Tamburello" },
      { fraction: 0.30, name: "Tosa" },
      { fraction: 0.60, name: "Acque Minerali" },
      { fraction: 0.85, name: "Rivazza" },
    ],
  },
  monaco: {
    length: 3.337, turns: 19, drsZones: 1,
    lapRecord: "1:12.909", lapRecordHolder: "K. Räikkönen", lapRecordYear: 2018,
    elevationChange: 42, firstGP: 1950, topSpeed: 290,
    description: "The crown jewel of Formula 1 — glamour, history and impossible streets.",
    elevationProfile: [0.30,0.50,0.70,0.85,1.00,0.90,0.75,0.60,0.50,0.40,0.30,0.25,0.20,0.25,0.30,0.35,0.30,0.25,0.20,0.30],
    sectorBoundaries: [0.48, 0.73],
    drsZonePositions: [
      { start: 0.88, end: 0.99 },
    ],
    notableCorners: [
      { fraction: 0.03, name: "Ste Devote" },
      { fraction: 0.18, name: "Casino" },
      { fraction: 0.30, name: "Grand Hotel" },
      { fraction: 0.36, name: "Portier" },
      { fraction: 0.46, name: "Chicane" },
      { fraction: 0.72, name: "Rascasse" },
      { fraction: 0.84, name: "Noghes" },
    ],
  },
  villeneuve: {
    length: 4.361, turns: 14, drsZones: 2,
    lapRecord: "1:13.078", lapRecordHolder: "V. Bottas", lapRecordYear: 2019,
    elevationChange: 4, firstGP: 1978, topSpeed: 330,
    description: "Street circuit on Île Notre-Dame — famous for its Wall of Champions.",
    elevationProfile: [0.30,0.32,0.35,0.32,0.30,0.28,0.30,0.32,0.30,0.28,0.30,0.32,0.30,0.30,0.32,0.30,0.30,0.30,0.30,0.30],
    sectorBoundaries: [0.35, 0.68],
    drsZonePositions: [
      { start: 0.85, end: 0.98 },
      { start: 0.40, end: 0.54 },
    ],
    notableCorners: [
      { fraction: 0.50, name: "Hairpin" },
    ],
  },
  catalunya: {
    length: 4.657, turns: 16, drsZones: 2,
    lapRecord: "1:16.330", lapRecordHolder: "M. Verstappen", lapRecordYear: 2023,
    elevationChange: 30, firstGP: 1991, topSpeed: 315,
    description: "The benchmark circuit — teams spend more test days here than anywhere.",
    elevationProfile: [0.40,0.50,0.60,0.72,0.65,0.55,0.45,0.40,0.45,0.50,0.55,0.60,0.65,0.55,0.45,0.40,0.45,0.50,0.50,0.45],
    sectorBoundaries: [0.33, 0.65],
    drsZonePositions: [
      { start: 0.88, end: 0.99 },
      { start: 0.46, end: 0.58 },
    ],
    notableCorners: [
      { fraction: 0.02, name: "T1" },
      { fraction: 0.15, name: "T3" },
      { fraction: 0.55, name: "T9 La Caixa" },
      { fraction: 0.82, name: "T16" },
    ],
  },
  red_bull_ring: {
    length: 4.318, turns: 10, drsZones: 3,
    lapRecord: "1:05.619", lapRecordHolder: "V. Bottas", lapRecordYear: 2020,
    elevationChange: 65, firstGP: 1970, topSpeed: 320,
    description: "Short, explosive circuit carved into the Styrian hills of Austria.",
    elevationProfile: [0.30,0.60,0.90,1.00,0.80,0.60,0.40,0.30,0.50,0.72,0.90,0.80,0.60,0.40,0.30,0.40,0.50,0.40,0.30,0.30],
    sectorBoundaries: [0.35, 0.70],
    drsZonePositions: [
      { start: 0.82, end: 0.98 },
      { start: 0.18, end: 0.28 },
      { start: 0.30, end: 0.42 },
    ],
    notableCorners: [
      { fraction: 0.02, name: "T1" },
      { fraction: 0.20, name: "T2" },
      { fraction: 0.36, name: "Remus" },
      { fraction: 0.75, name: "T9" },
    ],
  },
  silverstone: {
    length: 5.891, turns: 18, drsZones: 2,
    lapRecord: "1:27.097", lapRecordHolder: "L. Hamilton", lapRecordYear: 2020,
    elevationChange: 20, firstGP: 1950, topSpeed: 330,
    description: "Home of British motorsport — sweeping high-speed corners on an old airfield.",
    elevationProfile: [0.40,0.45,0.50,0.55,0.60,0.55,0.50,0.45,0.40,0.45,0.50,0.55,0.60,0.55,0.50,0.45,0.40,0.45,0.50,0.45],
    sectorBoundaries: [0.38, 0.68],
    drsZonePositions: [
      { start: 0.88, end: 0.99 },
      { start: 0.42, end: 0.55 },
    ],
    notableCorners: [
      { fraction: 0.02, name: "Abbey" },
      { fraction: 0.12, name: "Copse" },
      { fraction: 0.18, name: "Becketts" },
      { fraction: 0.44, name: "Stowe" },
      { fraction: 0.65, name: "Luffield" },
      { fraction: 0.90, name: "Woodcote" },
    ],
  },
  hungaroring: {
    length: 4.381, turns: 14, drsZones: 2,
    lapRecord: "1:16.627", lapRecordHolder: "L. Hamilton", lapRecordYear: 2020,
    elevationChange: 35, firstGP: 1986, topSpeed: 305,
    description: "Twisty, technical hillside circuit — the Monaco of permanent tracks.",
    elevationProfile: [0.40,0.50,0.60,0.72,0.65,0.75,0.80,0.70,0.60,0.50,0.40,0.45,0.50,0.62,0.65,0.55,0.45,0.40,0.45,0.45],
    sectorBoundaries: [0.35, 0.68],
    drsZonePositions: [
      { start: 0.88, end: 0.99 },
      { start: 0.22, end: 0.34 },
    ],
  },
  spa: {
    length: 7.004, turns: 19, drsZones: 2,
    lapRecord: "1:41.252", lapRecordHolder: "V. Bottas", lapRecordYear: 2018,
    elevationChange: 104, firstGP: 1950, topSpeed: 350,
    description: "The greatest circuit in the world — Eau Rouge, Pouhon and the Ardennes fog.",
    elevationProfile: [0.30,0.20,0.10,0.80,1.00,0.90,0.75,0.70,0.60,0.50,0.60,0.72,0.60,0.50,0.40,0.30,0.20,0.15,0.20,0.30],
    sectorBoundaries: [0.35, 0.70],
    drsZonePositions: [
      { start: 0.85, end: 0.98 },
      { start: 0.10, end: 0.24 },
    ],
    notableCorners: [
      { fraction: 0.01, name: "La Source" },
      { fraction: 0.07, name: "Eau Rouge" },
      { fraction: 0.12, name: "Raidillon" },
      { fraction: 0.28, name: "Les Combes" },
      { fraction: 0.48, name: "Pouhon" },
      { fraction: 0.78, name: "Blanchimont" },
      { fraction: 0.89, name: "Bus Stop" },
    ],
  },
  zandvoort: {
    length: 4.259, turns: 14, drsZones: 2,
    lapRecord: "1:11.097", lapRecordHolder: "L. Hamilton", lapRecordYear: 2021,
    elevationChange: 10, firstGP: 1952, topSpeed: 305,
    description: "Banked Dutch hairpins carved through North Sea dunes.",
    elevationProfile: [0.30,0.40,0.50,0.45,0.55,0.50,0.45,0.40,0.45,0.50,0.55,0.50,0.45,0.40,0.45,0.50,0.50,0.45,0.40,0.35],
    sectorBoundaries: [0.35, 0.68],
    drsZonePositions: [
      { start: 0.86, end: 0.99 },
      { start: 0.20, end: 0.32 },
    ],
    notableCorners: [
      { fraction: 0.02, name: "T1" },
      { fraction: 0.28, name: "Hugenholtz" },
      { fraction: 0.65, name: "Arie Luyendijk" },
      { fraction: 0.82, name: "Tarzan" },
    ],
  },
  monza: {
    length: 5.793, turns: 11, drsZones: 2,
    lapRecord: "1:21.046", lapRecordHolder: "R. Barrichello", lapRecordYear: 2004,
    elevationChange: 12, firstGP: 1950, topSpeed: 365,
    description: "Temple of Speed — minimal cornering, maximum velocity through the Monza park.",
    elevationProfile: [0.40,0.45,0.50,0.48,0.45,0.40,0.42,0.45,0.48,0.45,0.42,0.40,0.42,0.45,0.48,0.45,0.42,0.40,0.42,0.40],
    sectorBoundaries: [0.30, 0.62],
    drsZonePositions: [
      { start: 0.88, end: 0.99 },
      { start: 0.38, end: 0.52 },
    ],
    notableCorners: [
      { fraction: 0.03, name: "Prima Variante" },
      { fraction: 0.22, name: "Seconda Variante" },
      { fraction: 0.36, name: "Lesmo 1" },
      { fraction: 0.44, name: "Lesmo 2" },
      { fraction: 0.60, name: "Ascari" },
      { fraction: 0.82, name: "Parabolica" },
    ],
  },
  baku: {
    length: 6.003, turns: 20, drsZones: 2,
    lapRecord: "1:43.009", lapRecordHolder: "C. Leclerc", lapRecordYear: 2019,
    elevationChange: 7, firstGP: 2016, topSpeed: 350,
    description: "Dramatic street circuit through Baku's ancient walled city.",
    elevationProfile: [0.30,0.32,0.35,0.38,0.35,0.30,0.32,0.38,0.42,0.38,0.32,0.30,0.35,0.38,0.35,0.30,0.32,0.35,0.30,0.30],
    sectorBoundaries: [0.35, 0.68],
    drsZonePositions: [
      { start: 0.85, end: 0.98 },
      { start: 0.20, end: 0.34 },
    ],
    notableCorners: [
      { fraction: 0.02, name: "T1" },
      { fraction: 0.38, name: "Castle Wall" },
      { fraction: 0.55, name: "T8" },
    ],
  },
  marina_bay: {
    length: 5.063, turns: 23, drsZones: 3,
    lapRecord: "1:35.867", lapRecordHolder: "K. Magnussen", lapRecordYear: 2018,
    elevationChange: 8, firstGP: 2008, topSpeed: 320,
    description: "F1's original night race, weaving through Singapore's illuminated skyline.",
    elevationProfile: [0.30,0.32,0.35,0.32,0.30,0.32,0.35,0.38,0.35,0.32,0.30,0.32,0.35,0.38,0.35,0.32,0.30,0.32,0.35,0.32],
    sectorBoundaries: [0.40, 0.72],
    drsZonePositions: [
      { start: 0.85, end: 0.98 },
      { start: 0.18, end: 0.28 },
      { start: 0.62, end: 0.72 },
    ],
  },
  americas: {
    length: 5.513, turns: 20, drsZones: 2,
    lapRecord: "1:36.169", lapRecordHolder: "C. Leclerc", lapRecordYear: 2019,
    elevationChange: 41, firstGP: 2012, topSpeed: 325,
    description: "Dramatic uphill Turn 1, then technical back section through the Texas hills.",
    elevationProfile: [0.30,0.72,0.90,0.80,0.60,0.50,0.40,0.50,0.60,0.50,0.40,0.30,0.40,0.50,0.60,0.50,0.40,0.30,0.30,0.30],
    sectorBoundaries: [0.35, 0.68],
    drsZonePositions: [
      { start: 0.85, end: 0.98 },
      { start: 0.46, end: 0.60 },
    ],
    notableCorners: [
      { fraction: 0.02, name: "T1 Uphill" },
      { fraction: 0.12, name: "T2" },
      { fraction: 0.48, name: "T12" },
    ],
  },
  rodriguez: {
    length: 4.304, turns: 17, drsZones: 2,
    lapRecord: "1:17.774", lapRecordHolder: "V. Bottas", lapRecordYear: 2021,
    elevationChange: 2, firstGP: 1963, topSpeed: 360,
    description: "Highest-altitude F1 circuit at 2,285 m — thin air, wild power-unit behaviour.",
    elevationProfile: [0.30,0.32,0.35,0.32,0.30,0.32,0.35,0.38,0.35,0.32,0.30,0.32,0.35,0.38,0.35,0.32,0.30,0.32,0.35,0.32],
    sectorBoundaries: [0.38, 0.72],
    drsZonePositions: [
      { start: 0.85, end: 0.98 },
      { start: 0.40, end: 0.54 },
    ],
    notableCorners: [
      { fraction: 0.30, name: "Peraltada" },
    ],
  },
  interlagos: {
    length: 4.309, turns: 15, drsZones: 2,
    lapRecord: "1:10.540", lapRecordHolder: "R. Barrichello", lapRecordYear: 2004,
    elevationChange: 40, firstGP: 1973, topSpeed: 315,
    description: "Anti-clockwise São Paulo classic — unpredictable weather keeps everyone guessing.",
    elevationProfile: [0.40,0.50,0.60,0.72,0.75,0.80,0.70,0.60,0.50,0.40,0.30,0.40,0.50,0.62,0.72,0.65,0.55,0.45,0.40,0.40],
    sectorBoundaries: [0.38, 0.72],
    drsZonePositions: [
      { start: 0.84, end: 0.98 },
      { start: 0.05, end: 0.18 },
    ],
    notableCorners: [
      { fraction: 0.02, name: "Senna S" },
      { fraction: 0.28, name: "Ferradura" },
      { fraction: 0.60, name: "Mergulho" },
      { fraction: 0.84, name: "Junção" },
    ],
  },
  las_vegas: {
    length: 6.120, turns: 17, drsZones: 3,
    lapRecord: "1:35.490", lapRecordHolder: "M. Verstappen", lapRecordYear: 2023,
    elevationChange: 2, firstGP: 2023, topSpeed: 340,
    description: "Glittering night race on the Las Vegas Strip — pure spectacle at 340 km/h.",
    elevationProfile: [0.30,0.30,0.32,0.30,0.28,0.30,0.32,0.30,0.28,0.30,0.32,0.30,0.28,0.30,0.32,0.30,0.30,0.30,0.30,0.30],
    sectorBoundaries: [0.35, 0.68],
    drsZonePositions: [
      { start: 0.82, end: 0.96 },
      { start: 0.34, end: 0.47 },
      { start: 0.56, end: 0.70 },
    ],
    notableCorners: [
      { fraction: 0.03, name: "T1" },
      { fraction: 0.38, name: "Koval" },
      { fraction: 0.60, name: "Harmon" },
    ],
  },
  vegas: {
    length: 6.120, turns: 17, drsZones: 3,
    lapRecord: "1:35.490", lapRecordHolder: "M. Verstappen", lapRecordYear: 2023,
    elevationChange: 2, firstGP: 2023, topSpeed: 340,
    description: "Glittering night race on the Las Vegas Strip — pure spectacle at 340 km/h.",
    elevationProfile: [0.30,0.30,0.32,0.30,0.28,0.30,0.32,0.30,0.28,0.30,0.32,0.30,0.28,0.30,0.32,0.30,0.30,0.30,0.30,0.30],
    sectorBoundaries: [0.35, 0.68],
    drsZonePositions: [
      { start: 0.82, end: 0.96 },
      { start: 0.34, end: 0.47 },
      { start: 0.56, end: 0.70 },
    ],
  },
  madring: {
    length: 5.476, turns: 20, drsZones: 3,
    lapRecord: "—", lapRecordHolder: "TBD", lapRecordYear: 2026,
    elevationChange: 32, firstGP: 2026, topSpeed: 315,
    description: "Brand-new Madrid street circuit — the newest addition to the F1 calendar.",
    elevationProfile: [0.40,0.50,0.62,0.55,0.50,0.60,0.72,0.65,0.60,0.50,0.40,0.45,0.50,0.55,0.50,0.45,0.40,0.45,0.50,0.45],
    sectorBoundaries: [0.35, 0.68],
    drsZonePositions: [
      { start: 0.85, end: 0.98 },
      { start: 0.34, end: 0.47 },
      { start: 0.60, end: 0.72 },
    ],
  },
  losail: {
    length: 5.380, turns: 16, drsZones: 3,
    lapRecord: "1:24.319", lapRecordHolder: "M. Verstappen", lapRecordYear: 2023,
    elevationChange: 3, firstGP: 2021, topSpeed: 320,
    description: "Fast, flowing circuit under the Qatari floodlights — short but relentless.",
    elevationProfile: [0.30,0.32,0.35,0.32,0.30,0.32,0.35,0.38,0.35,0.32,0.30,0.32,0.35,0.38,0.35,0.32,0.30,0.32,0.35,0.32],
    sectorBoundaries: [0.38, 0.72],
    drsZonePositions: [
      { start: 0.85, end: 0.98 },
      { start: 0.27, end: 0.40 },
      { start: 0.58, end: 0.70 },
    ],
  },
  yas_marina: {
    length: 5.281, turns: 16, drsZones: 2,
    lapRecord: "1:26.103", lapRecordHolder: "L. Hamilton", lapRecordYear: 2019,
    elevationChange: 3, firstGP: 2009, topSpeed: 330,
    description: "Season finale under Abu Dhabi's lights — where championships are decided.",
    elevationProfile: [0.30,0.32,0.35,0.32,0.30,0.32,0.35,0.38,0.35,0.32,0.30,0.32,0.35,0.38,0.35,0.32,0.30,0.32,0.35,0.32],
    sectorBoundaries: [0.38, 0.72],
    drsZonePositions: [
      { start: 0.82, end: 0.98 },
      { start: 0.28, end: 0.42 },
    ],
    notableCorners: [
      { fraction: 0.02, name: "T1" },
      { fraction: 0.30, name: "T7" },
      { fraction: 0.65, name: "Marina" },
    ],
  },
};
