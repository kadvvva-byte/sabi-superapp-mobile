export type ProfileFrameThemeKey =
  | "defaultGlow"
  | "heartPulse"
  | "crystalRing"
  | "royalGold"
  | "neonWave"
  | "aiHalo"
  | "softStars"
  | "seasonalBloom";

export type ProfileFrameTheme = {
  key: ProfileFrameThemeKey;
  label: string;
  description: string;
  ringColors: [string, string, string];
  badgeColors: [string, string];
  glowColor: string;
};

export const PROFILE_FRAME_THEMES: Record<ProfileFrameThemeKey, ProfileFrameTheme> = {
  defaultGlow: {
    key: "defaultGlow",
    label: "Default Glow",
    description: "Clean premium glow ring for the standard Sabi profile look.",
    ringColors: ["#7EF0D0", "#63A8FF", "#58D5C9"],
    badgeColors: ["rgba(88,213,201,0.92)", "rgba(99,168,255,0.92)"],
    glowColor: "#7EF0D0",
  },
  heartPulse: {
    key: "heartPulse",
    label: "Heart Pulse",
    description: "Soft romantic frame with warm premium pink glow.",
    ringColors: ["#FF8AB8", "#FF6FA4", "#FFB1CF"],
    badgeColors: ["rgba(255,138,184,0.96)", "rgba(255,111,164,0.96)"],
    glowColor: "#FF8AB8",
  },
  crystalRing: {
    key: "crystalRing",
    label: "Crystal Ring",
    description: "Cool crystal-inspired frame with bright polished edges.",
    ringColors: ["#AEE8FF", "#86C7FF", "#D5F3FF"],
    badgeColors: ["rgba(174,232,255,0.96)", "rgba(134,199,255,0.96)"],
    glowColor: "#AEE8FF",
  },
  royalGold: {
    key: "royalGold",
    label: "Royal Gold",
    description: "Luxury gold frame for premium identity presentation.",
    ringColors: ["#FFD978", "#FFB84D", "#FFF0B2"],
    badgeColors: ["rgba(255,217,120,0.96)", "rgba(255,184,77,0.96)"],
    glowColor: "#FFD978",
  },
  neonWave: {
    key: "neonWave",
    label: "Neon Wave",
    description: "Bright teal-violet energy wave with nightlife premium feel.",
    ringColors: ["#58D5C9", "#B588FF", "#63A8FF"],
    badgeColors: ["rgba(88,213,201,0.96)", "rgba(181,136,255,0.96)"],
    glowColor: "#58D5C9",
  },
  aiHalo: {
    key: "aiHalo",
    label: "AI Halo",
    description: "Smart futuristic halo for AI and advanced premium identity.",
    ringColors: ["#7EF0D0", "#CBA6FF", "#BDE7FF"],
    badgeColors: ["rgba(126,240,208,0.96)", "rgba(203,166,255,0.96)"],
    glowColor: "#CBA6FF",
  },
  softStars: {
    key: "softStars",
    label: "Soft Stars",
    description: "Elegant soft-light frame with starlike premium mood.",
    ringColors: ["#D7EEFF", "#FFF0B2", "#BBD7FF"],
    badgeColors: ["rgba(215,238,255,0.96)", "rgba(255,240,178,0.96)"],
    glowColor: "#FFF0B2",
  },
  seasonalBloom: {
    key: "seasonalBloom",
    label: "Seasonal Bloom",
    description: "Event-ready festive frame for seasonal and holiday themes.",
    ringColors: ["#7EF0D0", "#FFB8D8", "#FFF0B2"],
    badgeColors: ["rgba(126,240,208,0.96)", "rgba(255,184,216,0.96)"],
    glowColor: "#FFB8D8",
  },
};

export function getProfileFrameTheme(
  key: ProfileFrameThemeKey = "defaultGlow",
): ProfileFrameTheme {
  return PROFILE_FRAME_THEMES[key] ?? PROFILE_FRAME_THEMES.defaultGlow;
}
