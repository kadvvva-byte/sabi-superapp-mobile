export const ICON_COLORS = {
  text: "#F5FBFF",
  muted: "#A8C3D7",
  emerald: "#77E28C",
  teal: "#58D5C9",
  blue: "#63A8FF",
  purple: "#B588FF",
  gold: "#FFCC66",
  rose: "#FF7E9E",
  danger: "#FF6B76",
  warning: "#FFC85A",
  surface: "rgba(255,255,255,0.06)",
  border: "rgba(255,255,255,0.10)",
} as const;

export const ICON_SIZES = {
  xs: 14,
  sm: 16,
  md: 18,
  lg: 22,
  xl: 26,
  hero: 32,
} as const;

export const ICON_STROKES = {
  soft: 2,
  medium: 2.2,
  strong: 2.4,
  bold: 2.6,
} as const;

export type IconTone =
  | "default"
  | "active"
  | "premium"
  | "danger"
  | "muted"
  | "success"
  | "warning"
  | "comingSoon";

export function getIconToneColor(tone: IconTone = "default") {
  switch (tone) {
    case "active":
      return ICON_COLORS.emerald;
    case "premium":
      return ICON_COLORS.gold;
    case "danger":
      return ICON_COLORS.danger;
    case "muted":
      return ICON_COLORS.muted;
    case "success":
      return ICON_COLORS.emerald;
    case "warning":
      return ICON_COLORS.warning;
    case "comingSoon":
      return ICON_COLORS.purple;
    case "default":
    default:
      return ICON_COLORS.teal;
  }
}
