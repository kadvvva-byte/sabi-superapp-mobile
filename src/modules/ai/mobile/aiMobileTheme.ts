export const AI_MOBILE_COLORS = {
  bgTop: "#040B16",
  bgMid: "#071727",
  bgBottom: "#0B1024",
  card: "rgba(255,255,255,0.075)",
  cardStrong: "rgba(255,255,255,0.11)",
  cardSoft: "rgba(255,255,255,0.045)",
  border: "rgba(255,255,255,0.13)",
  borderStrong: "rgba(137,220,255,0.25)",
  text: "#F8FBFF",
  softText: "#D8E7F7",
  muted: "#9BB0C5",
  dim: "#6F8298",
  blue: "#70B7FF",
  cyan: "#66E7E0",
  green: "#7BE58B",
  purple: "#B58CFF",
  pink: "#FF91C8",
  gold: "#FFD36B",
  danger: "#FF7B8B",
};

export const AI_MOBILE_GRADIENT = [
  AI_MOBILE_COLORS.bgTop,
  AI_MOBILE_COLORS.bgMid,
  AI_MOBILE_COLORS.bgBottom,
] as const;

export const AI_MOBILE_ACCENT_GRADIENT = [
  "rgba(112,183,255,0.34)",
  "rgba(102,231,224,0.24)",
  "rgba(181,140,255,0.22)",
] as const;

export const AI_MOBILE_PURPLE_GRADIENT = [
  "rgba(181,140,255,0.34)",
  "rgba(255,145,200,0.22)",
] as const;

export const AI_MOBILE_GREEN_GRADIENT = [
  "rgba(123,229,139,0.30)",
  "rgba(102,231,224,0.22)",
] as const;
