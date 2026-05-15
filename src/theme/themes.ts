import { sabiColors } from "./colors";
import { sabiGradients } from "./gradients";

export const darkTheme = {
  mode: "dark" as const,

  colors: sabiColors.dark,
  gradients: sabiGradients.dark,

  radius: {
    sm: 10,
    md: 14,
    lg: 18,
    xl: 24,
  },
};

export const midnightTheme = {
  mode: "midnight" as const,

  colors: {
    ...sabiColors.dark,

    background: "#05070F",
    surface: "#0B1220",
    card: "#0F172A",
    cardSoft: "#111827",

    text: "#FFFFFF",
    textSecondary: "#94A3B8",

    border: "rgba(255,255,255,0.08)",

    accent: "#63FF00",
  },

  gradients: {
    hero: ["#020617", "#07111F", "#13210A"],
    card: ["#020617", "#0F172A"],
  },

  radius: {
    sm: 10,
    md: 14,
    lg: 18,
    xl: 24,
  },
};

export const oceanTheme = {
  mode: "ocean" as const,

  colors: {
    background: "#0D1726",
    surface: "#142235",
    card: "rgba(20,34,53,0.85)",
    cardSoft: "rgba(20,34,53,0.65)",

    text: "#F8FAFC",
    textSecondary: "#A8B3C7",

    border: "rgba(255,255,255,0.10)",

    accent: "#63FF00",

    success: "#22C55E",
    danger: "#EF4444",
    warning: "#F59E0B",

    glow: "rgba(99,255,0,0.25)",
  },

  gradients: {
    hero: ["#0D1726", "#142235", "#1E3A5F"],
    card: ["#142235", "#1E3A5F"],
  },

  radius: {
    sm: 10,
    md: 14,
    lg: 18,
    xl: 24,
  },
};

export type SabiTheme = typeof darkTheme;