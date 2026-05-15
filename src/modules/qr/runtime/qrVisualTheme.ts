import type { SabiQrFunctionDefinition } from "../contracts/universalQr.contracts";

export type SabiQrVisualTheme = {
  top: string;
  mid: string;
  bottom: string;
  accent: string;
  accentSoft: string;
  card: string;
  text: string;
  muted: string;
  chip: string;
};

export function getSabiQrVisualTheme(definition?: Pick<SabiQrFunctionDefinition, "brandTone"> | null): SabiQrVisualTheme {
  const tone = definition?.brandTone ?? "blue";

  if (tone === "emerald") {
    return {
      top: "#031A15",
      mid: "#063326",
      bottom: "#06110F",
      accent: "#58E6B4",
      accentSoft: "rgba(88,230,180,0.2)",
      card: "rgba(7,35,29,0.92)",
      text: "#FFFFFF",
      muted: "#B8DCD2",
      chip: "COIN / LIVE",
    };
  }

  if (tone === "purple") {
    return {
      top: "#150A2E",
      mid: "#2B145D",
      bottom: "#080713",
      accent: "#B588FF",
      accentSoft: "rgba(181,136,255,0.2)",
      card: "rgba(24,12,52,0.92)",
      text: "#FFFFFF",
      muted: "#D8CBFF",
      chip: "IDENTITY / BUSINESS",
    };
  }

  if (tone === "gold") {
    return {
      top: "#221703",
      mid: "#4A3407",
      bottom: "#090806",
      accent: "#FFD36A",
      accentSoft: "rgba(255,211,106,0.2)",
      card: "rgba(46,32,7,0.92)",
      text: "#FFFFFF",
      muted: "#F8E0A8",
      chip: "MERCHANT / ORDER",
    };
  }

  if (tone === "cyan") {
    return {
      top: "#061826",
      mid: "#0D3C55",
      bottom: "#050B12",
      accent: "#66D9FF",
      accentSoft: "rgba(102,217,255,0.2)",
      card: "rgba(7,31,48,0.92)",
      text: "#FFFFFF",
      muted: "#BDEEFF",
      chip: "CHAT / ATTENDANCE",
    };
  }

  if (tone === "rose") {
    return {
      top: "#2A0713",
      mid: "#5C1832",
      bottom: "#0B0508",
      accent: "#FF7AAF",
      accentSoft: "rgba(255,122,175,0.2)",
      card: "rgba(45,11,25,0.92)",
      text: "#FFFFFF",
      muted: "#FFD0E2",
      chip: "MARKET / ADMIN",
    };
  }

  if (tone === "slate") {
    return {
      top: "#07111E",
      mid: "#172538",
      bottom: "#05080D",
      accent: "#AFC3E8",
      accentSoft: "rgba(175,195,232,0.18)",
      card: "rgba(14,25,40,0.92)",
      text: "#FFFFFF",
      muted: "#C7D2E8",
      chip: "SECURE / AUDIT",
    };
  }

  return {
    top: "#06122B",
    mid: "#173C9A",
    bottom: "#040914",
    accent: "#77A7FF",
    accentSoft: "rgba(119,167,255,0.2)",
    card: "rgba(10,25,61,0.92)",
    text: "#FFFFFF",
    muted: "#C3D7FF",
    chip: "SABI QR",
  };
}
