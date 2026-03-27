export const POINTS_TABLE: Record<number, number> = {
  1: 25,
  2: 18,
  3: 15,
  4: 12,
  5: 10,
  6: 8,
  7: 6,
  8: 4,
  9: 2,
  10: 1,
};

export const SPRINT_POINTS_TABLE: Record<number, number> = {
  1: 8,
  2: 7,
  3: 6,
  4: 5,
  5: 4,
  6: 3,
  7: 2,
  8: 1,
};

export const MAX_DRIVERS = 20;
export const MAX_CONSTRUCTORS = 10;

// Constructor brand colors (hex)
export const CONSTRUCTOR_COLORS: Record<string, string> = {
  red_bull: "#3671C6",
  ferrari: "#E8002D",
  mercedes: "#27F4D2",
  mclaren: "#FF8000",
  aston_martin: "#229971",
  alpine: "#FF87BC",
  haas: "#B6BABD",
  rb: "#6692FF",
  williams: "#64C4FF",
  kick_sauber: "#52E252",
  // aliases / legacy
  alphatauri: "#6692FF",
  alfa: "#52E252",
};

// Circuit track map SVGs from f1db (https://github.com/f1db/f1db)
// White stroke variant — clean on dark backgrounds
const F1DB = "https://raw.githubusercontent.com/f1db/f1db/main/src/assets/circuits/white";
export const CIRCUIT_IMAGES: Record<string, string> = {
  bahrain:        `${F1DB}/bahrain-1.svg`,
  jeddah:         `${F1DB}/jeddah-1.svg`,
  albert_park:    `${F1DB}/melbourne-2.svg`,
  suzuka:         `${F1DB}/suzuka-2.svg`,
  shanghai:       `${F1DB}/shanghai-1.svg`,
  miami:          `${F1DB}/miami-1.svg`,
  imola:          `${F1DB}/imola-3.svg`,
  monaco:         `${F1DB}/monaco-6.svg`,
  villeneuve:     `${F1DB}/montreal-6.svg`,
  catalunya:      `${F1DB}/catalunya-6.svg`,
  red_bull_ring:  `${F1DB}/spielberg-3.svg`,
  silverstone:    `${F1DB}/silverstone-8.svg`,
  hungaroring:    `${F1DB}/hungaroring-3.svg`,
  spa:            `${F1DB}/spa-francorchamps-4.svg`,
  zandvoort:      `${F1DB}/zandvoort-5.svg`,
  monza:          `${F1DB}/monza-7.svg`,
  baku:           `${F1DB}/baku-1.svg`,
  marina_bay:     `${F1DB}/marina-bay-4.svg`,
  americas:       `${F1DB}/austin-1.svg`,
  rodriguez:      `${F1DB}/mexico-city-3.svg`,
  interlagos:     `${F1DB}/interlagos-2.svg`,
  las_vegas:      `${F1DB}/las-vegas-1.svg`,  // legacy key
  vegas:          `${F1DB}/las-vegas-1.svg`,
  madring:        `${F1DB}/madring-1.svg`,
  losail:         `${F1DB}/lusail-1.svg`,
  yas_marina:     `${F1DB}/yas-marina-2.svg`,
};

export const CONSTRUCTOR_DISPLAY_NAMES: Record<string, string> = {
  red_bull: "Red Bull",
  ferrari: "Ferrari",
  mercedes: "Mercedes",
  mclaren: "McLaren",
  aston_martin: "Aston Martin",
  alpine: "Alpine",
  haas: "Haas",
  rb: "RB",
  williams: "Williams",
  kick_sauber: "Kick Sauber",
};

// Country name (from Ergast/Jolpi API) → ISO 3166-1 alpha-2 code
export const COUNTRY_FLAG_CODES: Record<string, string> = {
  "Australia": "au",
  "Bahrain": "bh",
  "Saudi Arabia": "sa",
  "Japan": "jp",
  "China": "cn",
  "United States": "us",
  "USA": "us",
  "Italy": "it",
  "Monaco": "mc",
  "Canada": "ca",
  "Spain": "es",
  "Austria": "at",
  "United Kingdom": "gb",
  "UK": "gb",
  "Hungary": "hu",
  "Belgium": "be",
  "Netherlands": "nl",
  "Singapore": "sg",
  "Azerbaijan": "az",
  "Mexico": "mx",
  "Brazil": "br",
  "Qatar": "qa",
  "United Arab Emirates": "ae",
  "UAE": "ae",
};

// Circuit GPS coordinates [lat, lng]
export const CIRCUIT_COORDS: Record<string, [number, number]> = {
  bahrain:       [26.0325,  50.5106],
  jeddah:        [21.6319,  39.1044],
  albert_park:   [-37.8497, 144.968],
  suzuka:        [34.8431,  136.541],
  shanghai:      [31.3389,  121.220],
  miami:         [25.9581,  -80.239],
  imola:         [44.3439,   11.717],
  monaco:        [43.7347,    7.421],
  villeneuve:    [45.5000,  -73.523],
  catalunya:     [41.5700,    2.261],
  red_bull_ring: [47.2197,   14.765],
  silverstone:   [52.0786,   -1.017],
  hungaroring:   [47.5789,   19.249],
  spa:           [50.4372,    5.971],
  zandvoort:     [52.3888,    4.541],
  monza:         [45.6156,    9.281],
  baku:          [40.3725,   49.853],
  marina_bay:    [1.2914,   103.864],
  americas:      [30.1328,  -97.641],
  rodriguez:     [19.4042,  -99.091],
  interlagos:    [-23.7036, -46.700],
  las_vegas:     [36.1162, -115.174],
  vegas:         [36.1162, -115.174],
  madring:       [40.3817,   -3.725],
  losail:        [25.4900,   51.454],
  yas_marina:    [24.4672,   54.603],
};

export function getFlagUrl(country: string): string {
  const code = COUNTRY_FLAG_CODES[country] ?? "un";
  return `https://flagcdn.com/w80/${code}.png`;
}

// Official F1 driver portrait URLs — all 22 drivers verified from formula1.com.
// Using Cloudinary's `d_` fallback parameter so a generic F1 placeholder is
// served automatically if a portrait hasn't been uploaded yet.
const F1_BASE = "https://media.formula1.com/image/upload/c_fill,w_320/q_auto/d_common:f1:2026:fallback:driver:2026fallbackdriverright.webp/v1740000001/common/f1/2026";

function portrait(team: string, code: string): string {
  return `${F1_BASE}/${team}/${code}/2026${team}${code}right.webp`;
}

export const DRIVER_IMAGES: Record<string, string> = {
  // Red Bull Racing
  max_verstappen:   portrait("redbullracing", "maxver01"),
  hadjar:           portrait("redbullracing", "isahad01"),
  isack_hadjar:     portrait("redbullracing", "isahad01"),
  // Ferrari
  leclerc:          portrait("ferrari",        "chalec01"),
  hamilton:         portrait("ferrari",        "lewham01"),
  // Mercedes
  george_russell:   portrait("mercedes",       "georus01"),
  antonelli:        portrait("mercedes",       "andant01"),
  kimi_antonelli:   portrait("mercedes",       "andant01"),
  // McLaren
  norris:           portrait("mclaren",        "lannor01"),
  piastri:          portrait("mclaren",        "oscpia01"),
  // Haas F1 Team  (team slug is "haasf1team", not "haas")
  ocon:             portrait("haasf1team",     "estoco01"),
  bearman:          portrait("haasf1team",     "olibea01"),
  oliver_bearman:   portrait("haasf1team",     "olibea01"),
  // Racing Bulls
  lawson:           portrait("racingbulls",    "lialaw01"),
  liam_lawson:      portrait("racingbulls",    "lialaw01"),
  lindblad:         portrait("racingbulls",    "arvlin01"),
  arvid_lindblad:   portrait("racingbulls",    "arvlin01"),
  // Alpine
  gasly:            portrait("alpine",         "piegas01"),
  colapinto:        portrait("alpine",         "fracol01"),
  franco_colapinto: portrait("alpine",         "fracol01"),
  // Audi
  hulkenberg:       portrait("audi",           "nichul01"),
  nico_hulkenberg:  portrait("audi",           "nichul01"),
  bortoleto:        portrait("audi",           "gabbor01"),
  // Williams
  sainz:            portrait("williams",       "carsai01"),
  albon:            portrait("williams",       "alealb01"),
  // Cadillac
  perez:            portrait("cadillac",       "serper01"),
  sergio_perez:     portrait("cadillac",       "serper01"),
  bottas:           portrait("cadillac",       "valbot01"),
  valtteri_bottas:  portrait("cadillac",       "valbot01"),
  // Aston Martin
  alonso:           portrait("astonmartin",    "feralo01"),
  stroll:           portrait("astonmartin",    "lanstr01"),
};

export function getDriverImageUrl(driverId: string): string | null {
  return DRIVER_IMAGES[driverId] ?? null;
}
