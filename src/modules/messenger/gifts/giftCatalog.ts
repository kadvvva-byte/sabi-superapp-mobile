import type { GiftCatalogItem, GiftProgramScope, GiftRewardTier } from "./giftTypes";
import { messengerUnifiedStreamGiftCatalog197V } from "./messengerUnifiedStreamGifts197V";

export type GiftCategory = GiftCatalogItem["category"];
export type GiftItem = GiftCatalogItem;

function resolvePlaybackType(item: Partial<GiftCatalogItem>): GiftCatalogItem["playbackType"] {
  return (
    item.playbackType ??
    (((item.priceCoin ?? 1) >= 60 ? "fullscreen_3d" : "inline_3d") as GiftCatalogItem["playbackType"])
  ) as GiftCatalogItem["playbackType"];
}

function createGift(
  item: Partial<GiftCatalogItem> & Pick<GiftCatalogItem, "id" | "title">
): GiftCatalogItem {
  const slug = item.slug ?? item.id;
  const category = (item.category ?? "love_romance") as GiftCategory;
  const isEventGift = item.isEventGift ?? category === "seasonal_event";

  return {
    ...item,
    id: item.id,
    slug,
    title: item.title,
    subtitle: item.subtitle ?? "",
    shortLabel: item.shortLabel ?? item.title,
    category,
    tier: (item.tier ?? "basic_3d") as GiftCatalogItem["tier"],
    rewardTier: (item.rewardTier ?? "basic") as GiftRewardTier,
    priceCoin: item.priceCoin ?? 1,
    currency: item.currency ?? "COIN",
    hasAudio: item.hasAudio ?? false,
    is3D: item.is3D ?? true,
    isEventGift,
    lifecycle: (item.lifecycle ?? "default") as GiftCatalogItem["lifecycle"],
    durationMinSec: item.durationMinSec ?? 5,
    durationMaxSec: item.durationMaxSec ?? 5,
    playbackType: resolvePlaybackType(item),
    previewAsset:
      (item.previewAsset ?? `gift-preview://${slug}`) as GiftCatalogItem["previewAsset"],
    animationAsset:
      (item.animationAsset ?? `gift-animation://${slug}`) as GiftCatalogItem["animationAsset"],
    availableIn:
      (item.availableIn ?? "both") as GiftCatalogItem["availableIn"],
    badgeLabel: item.badgeLabel,
    availableFrom: item.availableFrom,
    availableUntil: item.availableUntil,
    sortOrder: item.sortOrder ?? 0,
  };
}

export const GIFT_CATEGORY_ORDER = [
  "love_romance",
  "cars_moto",
  "power_weapon",
  "fantasy_myth",
  "divine",
  "luxury_status",
  "wealth_money",
  "animals",
  "space_epic",
  "seasonal_event",
] as const satisfies readonly GiftCategory[];

export const GIFT_CATALOG: GiftCatalogItem[] = [
  createGift({
    id: "gift_rose_heart",
    title: "Rose Heart",
    shortLabel: "Rose",
    subtitle: "Romantic 3D heart rose gift",
    category: "love_romance",
    tier: "basic_3d",
    rewardTier: "basic",
    priceCoin: 5,
    hasAudio: false,
    durationMinSec: 5,
    durationMaxSec: 5,
  }),
  createGift({
    id: "gift_love_letter",
    title: "Love Letter",
    shortLabel: "Letter",
    subtitle: "Classic romance envelope animation",
    category: "love_romance",
    tier: "visual_plus",
    rewardTier: "medium",
    priceCoin: 20,
    hasAudio: false,
    durationMinSec: 5,
    durationMaxSec: 6,
  }),
  createGift({
    id: "gift_supercar",
    title: "Supercar",
    shortLabel: "Car",
    subtitle: "Luxury car entrance gift",
    category: "cars_moto",
    tier: "premium_audio",
    rewardTier: "premium",
    priceCoin: 50,
    hasAudio: true,
    durationMinSec: 8,
    durationMaxSec: 10,
  }),
  createGift({
    id: "gift_racing_bike",
    title: "Racing Bike",
    shortLabel: "Bike",
    subtitle: "Fast moto action gift",
    category: "cars_moto",
    tier: "visual_plus",
    rewardTier: "medium",
    priceCoin: 25,
    hasAudio: false,
    durationMinSec: 5,
    durationMaxSec: 6,
  }),
  createGift({
    id: "gift_thunder_blade",
    title: "Thunder Blade",
    shortLabel: "Blade",
    subtitle: "Power strike 3D gift",
    category: "power_weapon",
    tier: "premium_audio",
    rewardTier: "premium",
    priceCoin: 45,
    hasAudio: true,
    durationMinSec: 8,
    durationMaxSec: 10,
  }),
  createGift({
    id: "gift_dragon_flame",
    title: "Dragon Flame",
    shortLabel: "Dragon",
    subtitle: "Fantasy dragon fire entrance",
    category: "fantasy_myth",
    tier: "ultra_premium",
    rewardTier: "premium",
    priceCoin: 100,
    hasAudio: true,
    durationMinSec: 15,
    durationMaxSec: 20,
  }),
  createGift({
    id: "gift_guardian_angel",
    title: "Guardian Angel",
    shortLabel: "Angel",
    subtitle: "Divine angel light flight",
    category: "divine",
    tier: "premium_audio",
    rewardTier: "premium",
    priceCoin: 60,
    hasAudio: true,
    durationMinSec: 10,
    durationMaxSec: 12,
  }),
  createGift({
    id: "gift_gold_throne",
    title: "Gold Throne",
    shortLabel: "Throne",
    subtitle: "Luxury royal throne animation",
    category: "luxury_status",
    tier: "ultra_premium",
    rewardTier: "premium",
    priceCoin: 90,
    hasAudio: true,
    durationMinSec: 12,
    durationMaxSec: 15,
  }),
  createGift({
    id: "gift_money_rain",
    title: "Money Rain",
    shortLabel: "Money",
    subtitle: "Golden currency storm effect",
    category: "wealth_money",
    tier: "visual_plus",
    rewardTier: "medium",
    priceCoin: 30,
    hasAudio: false,
    durationMinSec: 6,
    durationMaxSec: 8,
  }),
  createGift({
    id: "gift_lucky_tiger",
    title: "Lucky Tiger",
    shortLabel: "Tiger",
    subtitle: "Power animal zodiac gift",
    category: "animals",
    tier: "premium_audio",
    rewardTier: "medium",
    priceCoin: 35,
    hasAudio: true,
    durationMinSec: 7,
    durationMaxSec: 9,
  }),
  createGift({
    id: "gift_star_portal",
    title: "Star Portal",
    shortLabel: "Portal",
    subtitle: "Space epic portal burst",
    category: "space_epic",
    tier: "ultra_premium",
    rewardTier: "premium",
    priceCoin: 120,
    hasAudio: true,
    durationMinSec: 15,
    durationMaxSec: 18,
  }),
  createGift({
    id: "gift_holiday_lantern",
    title: "Holiday Lantern",
    shortLabel: "Lantern",
    subtitle: "Seasonal event premium lantern",
    category: "seasonal_event",
    tier: "visual_plus",
    rewardTier: "medium",
    priceCoin: 10,
    hasAudio: false,
    durationMinSec: 5,
    durationMaxSec: 5,
    isEventGift: true,
  }),
  ...messengerUnifiedStreamGiftCatalog197V,
].map((item, index) => createGift({ ...item, sortOrder: item.sortOrder ?? index + 1 }));

export const GIFT_CATALOG_BY_ID = Object.freeze(
  GIFT_CATALOG.reduce<Record<string, GiftCatalogItem>>((acc, item) => {
    acc[item.id] = item;
    return acc;
  }, {})
);

export function getGiftById(id: string | null | undefined): GiftCatalogItem | null {
  const normalized = String(id ?? "").trim();
  if (!normalized) return null;
  return GIFT_CATALOG_BY_ID[normalized] ?? null;
}

function matchesSourceProgram(
  _gift: GiftCatalogItem,
  _sourceProgram: GiftProgramScope
): boolean {
  return true;
}

function matchesAvailability(gift: GiftCatalogItem, nowIso: string): boolean {
  const now = new Date(nowIso).getTime();
  if (!Number.isFinite(now)) return true;

  const from = gift.availableFrom ? new Date(gift.availableFrom).getTime() : null;
  const until = gift.availableUntil ? new Date(gift.availableUntil).getTime() : null;

  if (from !== null && Number.isFinite(from) && now < from) return false;
  if (until !== null && Number.isFinite(until) && now > until) return false;

  return true;
}

export function getCurrentlyAvailableGiftCatalog(
  sourceProgram: GiftProgramScope = "both",
  nowIso: string = new Date().toISOString()
): GiftCatalogItem[] {
  return GIFT_CATALOG.filter(
    (gift) =>
      matchesSourceProgram(gift, sourceProgram) &&
      matchesAvailability(gift, nowIso)
  );
}

export function getBasicRewardPool(): GiftCatalogItem[] {
  return GIFT_CATALOG.filter((item) => item.rewardTier === "basic");
}

export function getFixed20RewardPool(): GiftCatalogItem[] {
  return GIFT_CATALOG.filter((item) => item.rewardTier === "fixed_20");
}

export function getMediumRewardPool(): GiftCatalogItem[] {
  return GIFT_CATALOG.filter((item) => item.rewardTier === "medium");
}

export function getPremiumRewardPool(): GiftCatalogItem[] {
  return GIFT_CATALOG.filter((item) => item.rewardTier === "premium");
}
