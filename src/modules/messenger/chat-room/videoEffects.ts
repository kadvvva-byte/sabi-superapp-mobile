export type VideoEffectId =
  | "normal"
  | "beauty"
  | "warm"
  | "cold"
  | "cinema"
  | "vivid"
  | "mono"
  | "blur_background"
  | "light_glow"
  | "soft_skin"
  | "bright_eyes"
  | "portrait_glow"
  | "anime"
  | "custom";

export type VideoEffectCategory =
  | "base"
  | "beauty"
  | "color"
  | "cinema"
  | "portrait"
  | "future";

export type VideoEffectPreset = {
  id: VideoEffectId;
  title: string;
  subtitle: string;
  intensityDefault: number;
  minIntensity?: number;
  maxIntensity?: number;
  badge?: string;
  category: VideoEffectCategory;
};

export type CustomVideoEffectConfig = {
  warmth: number;
  coolness: number;
  glow: number;
  softness: number;
  contrast: number;
  blur: number;
  anime: number;
  saturation: number;
};

export type SavedVideoPreset = {
  id: string;
  title: string;
  subtitle: string;
  isFavorite: boolean;
  source: "system" | "custom";
  effectId: VideoEffectId;
  effectIntensity: number;
  customConfig?: CustomVideoEffectConfig;
};

export const DEFAULT_CUSTOM_VIDEO_EFFECT_CONFIG: CustomVideoEffectConfig = {
  warmth: 42,
  coolness: 8,
  glow: 34,
  softness: 44,
  contrast: 48,
  blur: 16,
  anime: 18,
  saturation: 58,
};

export const VIDEO_EFFECT_PRESETS: VideoEffectPreset[] = [
  {
    id: "normal",
    title: "Oddiy",
    subtitle: "toza kamera asosi",
    intensityDefault: 0,
    category: "base",
  },
  {
    id: "beauty",
    title: "Go‘zallik Pro",
    subtitle: "yumshoq silliq ko‘rinish",
    intensityDefault: 62,
    badge: "top",
    category: "beauty",
  },
  {
    id: "soft_skin",
    title: "Silliq teri",
    subtitle: "premium yumshoq filtr",
    intensityDefault: 68,
    badge: "top",
    category: "beauty",
  },
  {
    id: "bright_eyes",
    title: "Yorqin ko‘z",
    subtitle: "toza yorqin ko‘rinish",
    intensityDefault: 54,
    badge: "selfi",
    category: "beauty",
  },
  {
    id: "portrait_glow",
    title: "Portret nuri",
    subtitle: "studiya portret nuri",
    intensityDefault: 64,
    badge: "top",
    category: "portrait",
  },
  {
    id: "light_glow",
    title: "Yumshoq chaqnash",
    subtitle: "premium yorug‘lik",
    intensityDefault: 58,
    category: "portrait",
  },
  {
    id: "warm",
    title: "Oltin ohang",
    subtitle: "iliq premium teri",
    intensityDefault: 56,
    category: "color",
  },
  {
    id: "cold",
    title: "Muzdek shisha",
    subtitle: "sovuq kristall ohang",
    intensityDefault: 54,
    category: "color",
  },
  {
    id: "vivid",
    title: "Neon rang",
    subtitle: "yorqin kuchli ranglar",
    intensityDefault: 66,
    badge: "strim",
    category: "color",
  },
  {
    id: "cinema",
    title: "Kino qora",
    subtitle: "chuqur kontrast kayfiyat",
    intensityDefault: 64,
    badge: "pro",
    category: "cinema",
  },
  {
    id: "mono",
    title: "Qora-oq",
    subtitle: "toza qora-oq",
    intensityDefault: 100,
    category: "cinema",
  },
  {
    id: "blur_background",
    title: "Chuqurlik xiraligi",
    subtitle: "portret uslubida fokus",
    intensityDefault: 58,
    category: "portrait",
  },
  {
    id: "anime",
    title: "Anime ohang",
    subtitle: "anime uslubidan ilhomlangan",
    intensityDefault: 68,
    badge: "anime",
    category: "future",
  },
  {
    id: "custom",
    title: "Maxsus sozlama",
    subtitle: "o‘zingizning strim ko‘rinishingiz",
    intensityDefault: 50,
    badge: "konstruktor",
    category: "future",
  },
];

export const GIRLS_FOCUSED_EFFECTS: VideoEffectId[] = [
  "beauty",
  "soft_skin",
  "bright_eyes",
  "portrait_glow",
  "light_glow",
];

export const INITIAL_SAVED_VIDEO_PRESETS: SavedVideoPreset[] = [
  {
    id: "preset-soft-princess",
    title: "Yumshoq malika",
    subtitle: "go‘zallik · selfi nuri",
    isFavorite: true,
    source: "system",
    effectId: "soft_skin",
    effectIntensity: 72,
  },
  {
    id: "preset-stream-neon",
    title: "Strim neon",
    subtitle: "strim · yorqin rang",
    isFavorite: true,
    source: "system",
    effectId: "vivid",
    effectIntensity: 72,
  },
  {
    id: "preset-cinema-night",
    title: "Kino tun",
    subtitle: "video · qorong‘i kayfiyat",
    isFavorite: true,
    source: "system",
    effectId: "cinema",
    effectIntensity: 66,
  },
  {
    id: "preset-anime-stage",
    title: "Anime sahna",
    subtitle: "anime · jonli ohang",
    isFavorite: false,
    source: "system",
    effectId: "anime",
    effectIntensity: 74,
  },
];

export function getVideoEffectPreset(effectId: VideoEffectId) {
  return VIDEO_EFFECT_PRESETS.find((item) => item.id === effectId) ?? VIDEO_EFFECT_PRESETS[0];
}

export function createSavedPresetFromCustom(args: {
  title: string;
  subtitle?: string;
  effectIntensity: number;
  customConfig: CustomVideoEffectConfig;
}): SavedVideoPreset {
  return {
    id: `preset-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    title: args.title.trim() || "Mening sozlamam",
    subtitle: args.subtitle?.trim() || "maxsus strim sozlamasi",
    isFavorite: false,
    source: "custom",
    effectId: "custom",
    effectIntensity: args.effectIntensity,
    customConfig: args.customConfig,
  };
}
