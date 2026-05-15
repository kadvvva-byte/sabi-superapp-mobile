export const PROFILE_THEME_TOKENS = {
  bgTop: "#05140D",
  bgMid: "#062018",
  bgBottom: "#08261E",

  heroStart: "rgba(30,55,90,0.94)",
  heroMid: "rgba(17,33,58,0.94)",
  heroEnd: "rgba(11,42,38,0.94)",

  card: "rgba(16, 31, 48, 0.82)",
  cardAlt: "rgba(26, 44, 64, 0.82)",
  cardBorder: "rgba(120, 220, 160, 0.12)",

  text: "#F5FBFF",
  textSoft: "#D8E7F3",
  muted: "#A8C3D7",

  success: "#77E28C",
  teal: "#58D5C9",
  blue: "#63A8FF",
  purple: "#B588FF",
  gold: "#FFCC66",
  danger: "#FF6B76",

  avatarBase: "#0B1620",
  avatarInner: "rgba(7, 21, 28, 0.96)",
  avatarFallbackText: "#F5FBFF",

  white06: "rgba(255,255,255,0.06)",
  white08: "rgba(255,255,255,0.08)",
  white10: "rgba(255,255,255,0.10)",
  white14: "rgba(255,255,255,0.14)",
} as const;

export type ProfileThemeTokenKey = keyof typeof PROFILE_THEME_TOKENS;
