import { ImageSourcePropType } from "react-native";

import {
  GIFT_MASTER_CATALOG,
  type GiftMasterItem,
} from "./giftMasterCatalog";

export type GiftCategory =
  | "featured"
  | "family"
  | "local"
  | "treasure"
  | "luxury"
  | "romance"
  | "flowers"
  | "rings"
  | "cars"
  | "bikes"
  | "dragons"
  | "holiday";

export type GiftAssetItem = {
  id: string;
  label: string;
  category: GiftCategory;
  priceDiamond: number;
  premium: boolean;
  durationMs: number;
  icon?: ImageSourcePropType;
  preview?: ImageSourcePropType;
  fallbackEmoji?: string;
};

const CATEGORY_EMOJI: Record<GiftCategory, string> = {
  featured: "✨",
  family: "🛡️",
  local: "🏁",
  treasure: "🎁",
  luxury: "👑",
  romance: "💖",
  flowers: "🌹",
  rings: "💍",
  cars: "🏎️",
  bikes: "🚀",
  dragons: "🐉",
  holiday: "🎆",
};

const GIFT_ICON_SOURCES: Partial<Record<string, ImageSourcePropType>> = {
  gift_galaxy_dragon_supreme: require("./assets/gift_galaxy_dragon_supreme.png"),
};

function normalizeLegacyAssetCategory(
  value: GiftMasterItem["legacyAssetCategory"],
): GiftCategory {
  switch (value) {
    case "romance":
    case "flowers":
    case "rings":
    case "cars":
    case "bikes":
    case "dragons":
    case "holiday":
    case "luxury":
      return value;
    case "treasure":
      return "treasure";
    default:
      return "featured";
  }
}

function resolveFallbackEmoji(item: GiftMasterItem, category: GiftCategory) {
  if (item.id === "gift_galaxy_dragon_supreme") return "🐉";

  switch (item.primaryCategory) {
    case "flowers":
      return "🌹";
    case "romance":
      return "💖";
    case "cute":
      return "🧸";
    case "luxury":
      return "💎";
    case "fantasy":
      return "🪽";
    case "transport":
      return category === "bikes" ? "🚀" : "🏎️";
    case "royal":
      return "👑";
    case "cosmic":
      return "🌌";
    case "zodiac":
      return "♈";
    case "battle":
      return "🏆";
    case "support":
      return "🔥";
    case "holiday":
      return "🎆";
    case "treasure":
      return "🎁";
    default:
      return CATEGORY_EMOJI[category];
  }
}

function resolvePremium(item: GiftMasterItem) {
  if (item.priceDiamond >= 1000) return true;

  return (
    item.tier === "enhanced" ||
    item.tier === "audio" ||
    item.tier === "near_fullscreen" ||
    item.tier === "premium" ||
    item.tier === "ultra"
  );
}

function mapMasterToAsset(item: GiftMasterItem): GiftAssetItem {
  const category = normalizeLegacyAssetCategory(item.legacyAssetCategory);
  const icon = GIFT_ICON_SOURCES[item.id];

  return {
    id: item.id,
    label: item.title,
    category,
    priceDiamond: item.priceDiamond,
    premium: resolvePremium(item),
    durationMs: item.durationMs,
    icon,
    preview: icon,
    fallbackEmoji: resolveFallbackEmoji(item, category),
  };
}

export const GIFT_ASSET_MAP: GiftAssetItem[] = GIFT_MASTER_CATALOG.map(
  mapMasterToAsset,
);

export const GIFT_REAL_ICON_IDS = Object.keys(GIFT_ICON_SOURCES);

export function hasGiftRealIcon(id: string) {
  return Boolean(GIFT_ICON_SOURCES[id]);
}

export function getGiftById(id: string) {
  return GIFT_ASSET_MAP.find((item) => item.id === id) ?? null;
}

export function getGiftsByCategory(category: GiftCategory) {
  return GIFT_ASSET_MAP.filter((item) => item.category === category);
}
