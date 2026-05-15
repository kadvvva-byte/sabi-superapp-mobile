import { appStorage } from "../../../shared/storage/app-storage";

export type MessengerThemeCategory =
  | "brand"
  | "animals"
  | "anime"
  | "space"
  | "nature";

export type MessengerThemeId =
  | "brand"
  | "tiger_night"
  | "lion_gold"
  | "bear_forest"
  | "anime_neon"
  | "anime_sakura"
  | "space_orbit"
  | "ocean_deep"
  | "mountain_mist";

export type MessengerThemeState = {
  themeId: MessengerThemeId;
  wallpaperUri?: string;
};

export type MessengerThemePalette = {
  id: MessengerThemeId;
  category: MessengerThemeCategory;
  title: string;
  mood: string;
  background: [string, string, string, string];
  surface: [string, string];
  surfaceRaised: [string, string];
  accent: string;
  accentSoft: string;
  accentAlt: string;
  textMain: string;
  textSecondary: string;
};

export const MESSENGER_THEME_PACKS: MessengerThemePalette[] = [
  {
    id: "brand",
    category: "brand",
    title: "Sabi Brand",
    mood: "deep glass signature",
    background: ["#03110E", "#061714", "#0A211B", "#0B1420"],
    surface: ["rgba(12,39,32,0.68)", "rgba(9,29,24,0.48)"],
    surfaceRaised: ["rgba(30,215,165,0.18)", "rgba(255,255,255,0.04)"],
    accent: "#1ED7A5",
    accentSoft: "#D7FFF1",
    accentAlt: "#7BF3D0",
    textMain: "#F6FFF9",
    textSecondary: "rgba(232,255,246,0.74)",
  },
  {
    id: "tiger_night",
    category: "animals",
    title: "Tiger Night",
    mood: "predator amber glow",
    background: ["#140A07", "#24110C", "#3A1A10", "#120B0A"],
    surface: ["rgba(58,28,18,0.68)", "rgba(25,13,10,0.48)"],
    surfaceRaised: ["rgba(255,159,67,0.18)", "rgba(255,255,255,0.04)"],
    accent: "#FF9F43",
    accentSoft: "#FFE6C7",
    accentAlt: "#FFB86B",
    textMain: "#FFF8F2",
    textSecondary: "rgba(255,235,223,0.76)",
  },
  {
    id: "lion_gold",
    category: "animals",
    title: "Lion Gold",
    mood: "royal dusk luxury",
    background: ["#140F08", "#22170C", "#37230F", "#110C09"],
    surface: ["rgba(64,41,18,0.68)", "rgba(25,17,10,0.48)"],
    surfaceRaised: ["rgba(255,196,85,0.18)", "rgba(255,255,255,0.04)"],
    accent: "#F4C14F",
    accentSoft: "#FFF0C7",
    accentAlt: "#FFD978",
    textMain: "#FFFBEF",
    textSecondary: "rgba(255,242,215,0.76)",
  },
  {
    id: "bear_forest",
    category: "animals",
    title: "Bear Forest",
    mood: "earthy forest power",
    background: ["#09100B", "#102016", "#183425", "#0A110C"],
    surface: ["rgba(22,47,33,0.68)", "rgba(10,24,16,0.48)"],
    surfaceRaised: ["rgba(89,185,123,0.18)", "rgba(255,255,255,0.04)"],
    accent: "#59B97B",
    accentSoft: "#DAF8E4",
    accentAlt: "#8CD9A4",
    textMain: "#F6FFF9",
    textSecondary: "rgba(229,245,234,0.74)",
  },
  {
    id: "anime_neon",
    category: "anime",
    title: "Anime Neon",
    mood: "cyber glow pulse",
    background: ["#080913", "#11142B", "#1D1240", "#0A1120"],
    surface: ["rgba(39,27,84,0.68)", "rgba(17,18,44,0.48)"],
    surfaceRaised: ["rgba(126,90,255,0.18)", "rgba(255,255,255,0.04)"],
    accent: "#8C69FF",
    accentSoft: "#E6DFFF",
    accentAlt: "#C39DFF",
    textMain: "#F8F6FF",
    textSecondary: "rgba(239,233,255,0.76)",
  },
  {
    id: "anime_sakura",
    category: "anime",
    title: "Anime Sakura",
    mood: "soft romantic bloom",
    background: ["#140A10", "#25131D", "#3E1C2A", "#120A10"],
    surface: ["rgba(74,32,52,0.68)", "rgba(28,14,22,0.48)"],
    surfaceRaised: ["rgba(255,142,177,0.18)", "rgba(255,255,255,0.04)"],
    accent: "#FF8EB1",
    accentSoft: "#FFE2EA",
    accentAlt: "#FFB2CD",
    textMain: "#FFF8FA",
    textSecondary: "rgba(255,231,239,0.76)",
  },
  {
    id: "space_orbit",
    category: "space",
    title: "Space Orbit",
    mood: "cosmic orbit blue",
    background: ["#050913", "#0A1430", "#13244B", "#070D18"],
    surface: ["rgba(18,36,84,0.68)", "rgba(10,18,42,0.48)"],
    surfaceRaised: ["rgba(99,154,255,0.18)", "rgba(255,255,255,0.04)"],
    accent: "#74A7FF",
    accentSoft: "#DEEBFF",
    accentAlt: "#9EC1FF",
    textMain: "#F7FAFF",
    textSecondary: "rgba(228,237,255,0.74)",
  },
  {
    id: "ocean_deep",
    category: "nature",
    title: "Ocean Deep",
    mood: "cold abyss current",
    background: ["#04131A", "#061E28", "#0A3144", "#09121A"],
    surface: ["rgba(13,68,90,0.68)", "rgba(9,28,39,0.48)"],
    surfaceRaised: ["rgba(57,189,248,0.18)", "rgba(255,255,255,0.04)"],
    accent: "#39BDF8",
    accentSoft: "#D6F4FF",
    accentAlt: "#7DDCFF",
    textMain: "#F5FDFF",
    textSecondary: "rgba(225,247,255,0.74)",
  },
  {
    id: "mountain_mist",
    category: "nature",
    title: "Mountain Mist",
    mood: "cold dusk altitude",
    background: ["#081015", "#101922", "#1A2430", "#0C1016"],
    surface: ["rgba(32,46,63,0.68)", "rgba(14,21,29,0.48)"],
    surfaceRaised: ["rgba(165,196,225,0.16)", "rgba(255,255,255,0.04)"],
    accent: "#A5C4E1",
    accentSoft: "#EDF6FF",
    accentAlt: "#C9DCF0",
    textMain: "#F7FBFF",
    textSecondary: "rgba(227,238,248,0.74)",
  },
];

const STORAGE_KEY = "messenger_theme_state_v5";

const DEFAULT_STATE: MessengerThemeState = {
  themeId: "brand",
  wallpaperUri: "",
};

let cacheState: MessengerThemeState = { ...DEFAULT_STATE };
let didHydrate = false;

function isThemeId(value: string): value is MessengerThemeId {
  return MESSENGER_THEME_PACKS.some((item) => item.id === value);
}

function normalizeState(input?: Partial<MessengerThemeState> | null): MessengerThemeState {
  const themeId =
    typeof input?.themeId === "string" && isThemeId(input.themeId)
      ? input.themeId
      : DEFAULT_STATE.themeId;

  return {
    themeId,
    wallpaperUri: typeof input?.wallpaperUri === "string" ? input.wallpaperUri : "",
  };
}

async function readPersistedState(): Promise<MessengerThemeState> {
  try {
    const raw = await Promise.resolve(appStorage.getString(STORAGE_KEY) as unknown);
    if (typeof raw !== "string" || !raw.trim()) {
      return { ...DEFAULT_STATE };
    }
    const parsed = JSON.parse(raw);
    return normalizeState(parsed);
  } catch {
    return { ...DEFAULT_STATE };
  }
}

export function getMessengerThemeState(): MessengerThemeState {
  if (!didHydrate) {
    didHydrate = true;
    void hydrateMessengerThemeState();
  }
  return cacheState;
}

export async function hydrateMessengerThemeState(): Promise<MessengerThemeState> {
  const next = await readPersistedState();
  cacheState = next;
  return next;
}

export async function setMessengerThemeState(
  next: MessengerThemeState,
): Promise<MessengerThemeState> {
  const safe = normalizeState(next);
  cacheState = safe;

  try {
    await Promise.resolve(appStorage.setString(STORAGE_KEY, JSON.stringify(safe)) as unknown);
  } catch {
    // ignore persistence errors
  }

  return safe;
}

export async function clearMessengerWallpaper(): Promise<MessengerThemeState> {
  const current = getMessengerThemeState();
  return setMessengerThemeState({
    ...current,
    wallpaperUri: "",
  });
}

export function getMessengerThemePalette(themeId: MessengerThemeId): MessengerThemePalette {
  return (
    MESSENGER_THEME_PACKS.find((item) => item.id === themeId) ?? MESSENGER_THEME_PACKS[0]
  );
}

export function getMessengerThemePacksByCategory() {
  return {
    brand: MESSENGER_THEME_PACKS.filter((item) => item.category === "brand"),
    animals: MESSENGER_THEME_PACKS.filter((item) => item.category === "animals"),
    anime: MESSENGER_THEME_PACKS.filter((item) => item.category === "anime"),
    space: MESSENGER_THEME_PACKS.filter((item) => item.category === "space"),
    nature: MESSENGER_THEME_PACKS.filter((item) => item.category === "nature"),
  };
}
