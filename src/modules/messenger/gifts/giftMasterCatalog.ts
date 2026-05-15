export type GiftSegment =
  | "base"
  | "cheap_quick"
  | "family_battle"
  | "zodiac"
  | "seasonal_event";

export type GiftTier =
  | "micro"
  | "basic"
  | "enhanced"
  | "audio"
  | "near_fullscreen"
  | "premium"
  | "ultra";

export type GiftPrimaryCategory =
  | "flowers"
  | "romance"
  | "cute"
  | "luxury"
  | "fantasy"
  | "transport"
  | "royal"
  | "cosmic"
  | "zodiac"
  | "battle"
  | "support"
  | "holiday"
  | "treasure";

export type LegacyGiftMenuTab =
  | "featured"
  | "family"
  | "local"
  | "treasure"
  | "luxury";

export type LegacyGiftAssetCategory =
  | "romance"
  | "flowers"
  | "rings"
  | "dragons"
  | "cars"
  | "bikes"
  | "treasure"
  | "holiday"
  | "luxury";

export type SeasonalTag =
  | "new_year"
  | "winter"
  | "valentine"
  | "ramadan"
  | "eid"
  | "navruz"
  | "spring"
  | "summer"
  | "autumn"
  | "halloween"
  | "birthday"
  | "wedding";

export type GiftMasterItem = {
  id: string;
  slug: string;
  title: string;
  segment: GiftSegment;
  primaryCategory: GiftPrimaryCategory;
  legacyMenuTab: LegacyGiftMenuTab;
  legacyAssetCategory: LegacyGiftAssetCategory;
  priceDiamond: number;
  coinEquivalent: number;
  tier: GiftTier;
  durationMs: number;
  isFullscreen: boolean;
  hasAudio: boolean;
  streamReady: boolean;
  seasonalTags: SeasonalTag[];
  isPremium3D: true;
};

const gift = (item: Omit<GiftMasterItem, "isPremium3D">): GiftMasterItem => ({
  ...item,
  isPremium3D: true,
});

export const DIAMONDS_PER_COIN = 100;

export const GIFT_MASTER_CATALOG: GiftMasterItem[] = [
  gift({
    id: "gift_galaxy_dragon_supreme",
    slug: "galaxy_dragon_supreme",
    title: "Galaxy Dragon Supreme",
    segment: "base",
    primaryCategory: "cosmic",
    legacyMenuTab: "featured",
    legacyAssetCategory: "dragons",
    priceDiamond: 15000,
    coinEquivalent: 150,
    tier: "ultra",
    durationMs: 20000,
    isFullscreen: true,
    hasAudio: true,
    streamReady: false,
    seasonalTags: ["new_year"],
  }),
];

export const GIFT_MASTER_TOTAL = GIFT_MASTER_CATALOG.length;

export const GIFT_MASTER_SEGMENT_ORDER: GiftSegment[] = [
  "cheap_quick",
  "base",
  "zodiac",
  "seasonal_event",
  "family_battle",
];

export const GIFT_MASTER_TIER_ORDER: GiftTier[] = [
  "micro",
  "basic",
  "enhanced",
  "audio",
  "near_fullscreen",
  "premium",
  "ultra",
];

export const LEGACY_GIFT_MENU_TAB_ORDER: LegacyGiftMenuTab[] = [
  "featured",
  "treasure",
  "luxury",
  "family",
  "local",
];

export const MESSENGER_ACTIVE_GIFT_SEGMENTS: GiftSegment[] = ["base"];
export const FUTURE_LOCKED_GIFT_SEGMENTS: GiftSegment[] = [];
export const HIGH_IMPACT_GIFT_TIERS: GiftTier[] = [
  "audio",
  "near_fullscreen",
  "premium",
  "ultra",
];
export const PREMIUM_PLAYBACK_GIFT_TIERS: GiftTier[] = [
  "near_fullscreen",
  "premium",
  "ultra",
];
export const PREMIUM_VISUAL_GIFT_TIERS: GiftTier[] = ["premium", "ultra"];

export const GIFT_MASTER_COUNTS = {
  total: GIFT_MASTER_CATALOG.length,
  base: GIFT_MASTER_CATALOG.filter((item) => item.segment === "base").length,
  cheapQuick: 0,
  familyBattle: 0,
  zodiac: 0,
  seasonalEvent: 0,
  messengerSafe: GIFT_MASTER_CATALOG.filter((item) =>
    MESSENGER_ACTIVE_GIFT_SEGMENTS.includes(item.segment),
  ).length,
  futureLocked: 0,
  streamReady: GIFT_MASTER_CATALOG.filter((item) => item.streamReady).length,
  fullscreen: GIFT_MASTER_CATALOG.filter((item) => item.isFullscreen).length,
  withAudio: GIFT_MASTER_CATALOG.filter((item) => item.hasAudio).length,
  premiumVisual: GIFT_MASTER_CATALOG.filter((item) =>
    PREMIUM_VISUAL_GIFT_TIERS.includes(item.tier),
  ).length,
  premiumPlayback: GIFT_MASTER_CATALOG.filter((item) =>
    PREMIUM_PLAYBACK_GIFT_TIERS.includes(item.tier),
  ).length,
};

export function getGiftMasterItemById(id: string) {
  return GIFT_MASTER_CATALOG.find((item) => item.id === id) ?? null;
}

export function getGiftMasterItemsBySegment(segment: GiftSegment) {
  return GIFT_MASTER_CATALOG.filter((item) => item.segment === segment);
}

export function getGiftMasterItemsByPrimaryCategory(
  primaryCategory: GiftPrimaryCategory,
) {
  return GIFT_MASTER_CATALOG.filter(
    (item) => item.primaryCategory === primaryCategory,
  );
}

export function getGiftMasterItemsByLegacyTab(tab: LegacyGiftMenuTab) {
  return GIFT_MASTER_CATALOG.filter((item) => item.legacyMenuTab === tab);
}

export function getGiftMasterItemsByLegacyAssetCategory(
  category: LegacyGiftAssetCategory,
) {
  return GIFT_MASTER_CATALOG.filter(
    (item) => item.legacyAssetCategory === category,
  );
}

export function getGiftMasterSeasonalItems(tag: SeasonalTag) {
  return GIFT_MASTER_CATALOG.filter((item) => item.seasonalTags.includes(tag));
}

export function getStreamReadyGiftMasterItems() {
  return GIFT_MASTER_CATALOG.filter((item) => item.streamReady);
}

export function getGiftMasterItemsByTier(tier: GiftTier) {
  return GIFT_MASTER_CATALOG.filter((item) => item.tier === tier);
}

export function getGiftMasterItemsByCoinRange(minCoin: number, maxCoin: number) {
  return GIFT_MASTER_CATALOG.filter(
    (item) => item.coinEquivalent >= minCoin && item.coinEquivalent <= maxCoin,
  );
}

export function getGiftMasterItemsByDiamondRange(
  minDiamond: number,
  maxDiamond: number,
) {
  return GIFT_MASTER_CATALOG.filter(
    (item) => item.priceDiamond >= minDiamond && item.priceDiamond <= maxDiamond,
  );
}

export function getGiftMasterItemsBySeasonalTags(tags: SeasonalTag[]) {
  if (!tags.length) {
    return [];
  }

  return GIFT_MASTER_CATALOG.filter((item) =>
    tags.some((tag) => item.seasonalTags.includes(tag)),
  );
}

export function isMessengerGiftMasterItem(item: GiftMasterItem) {
  return MESSENGER_ACTIVE_GIFT_SEGMENTS.includes(item.segment);
}

export function isFutureLockedGiftMasterItem(item: GiftMasterItem) {
  return FUTURE_LOCKED_GIFT_SEGMENTS.includes(item.segment);
}

export function isHighImpactGiftMasterItem(item: GiftMasterItem) {
  return HIGH_IMPACT_GIFT_TIERS.includes(item.tier);
}

export function isPremiumPlaybackGiftMasterItem(item: GiftMasterItem) {
  return PREMIUM_PLAYBACK_GIFT_TIERS.includes(item.tier);
}

export function isPremiumVisualGiftMasterItem(item: GiftMasterItem) {
  return PREMIUM_VISUAL_GIFT_TIERS.includes(item.tier);
}

export function getMessengerGiftMasterItems() {
  return GIFT_MASTER_CATALOG.filter(isMessengerGiftMasterItem);
}

export function getFutureLockedGiftMasterItems() {
  return GIFT_MASTER_CATALOG.filter(isFutureLockedGiftMasterItem);
}

export function getHighImpactGiftMasterItems() {
  return GIFT_MASTER_CATALOG.filter(isHighImpactGiftMasterItem);
}

export function getPremiumPlaybackGiftMasterItems() {
  return GIFT_MASTER_CATALOG.filter(isPremiumPlaybackGiftMasterItem);
}

export function getPremiumVisualGiftMasterItems() {
  return GIFT_MASTER_CATALOG.filter(isPremiumVisualGiftMasterItem);
}

export function getGiftMasterItemsForLegacyTab(
  tab: LegacyGiftMenuTab,
  options?: {
    messengerOnly?: boolean;
    excludeFutureLocked?: boolean;
  },
) {
  const messengerOnly = options?.messengerOnly ?? false;
  const excludeFutureLocked = options?.excludeFutureLocked ?? false;

  return GIFT_MASTER_CATALOG.filter((item) => {
    if (item.legacyMenuTab !== tab) {
      return false;
    }

    if (messengerOnly && !isMessengerGiftMasterItem(item)) {
      return false;
    }

    if (excludeFutureLocked && isFutureLockedGiftMasterItem(item)) {
      return false;
    }

    return true;
  });
}

export function getGiftMasterCatalogIntegrityErrors() {
  const errors: string[] = [];
  const seenIds = new Set<string>();
  const seenSlugs = new Set<string>();

  for (const item of GIFT_MASTER_CATALOG) {
    if (seenIds.has(item.id)) {
      errors.push(`Duplicate gift id: ${item.id}`);
    } else {
      seenIds.add(item.id);
    }

    if (seenSlugs.has(item.slug)) {
      errors.push(`Duplicate gift slug: ${item.slug}`);
    } else {
      seenSlugs.add(item.slug);
    }

    const expectedCoin = item.priceDiamond / DIAMONDS_PER_COIN;
    const coinDelta = Math.abs(expectedCoin - item.coinEquivalent);
    if (coinDelta > 0.000001) {
      errors.push(
        `Coin mismatch for ${item.id}: expected ${expectedCoin}, received ${item.coinEquivalent}`,
      );
    }

    if (item.isFullscreen && !PREMIUM_PLAYBACK_GIFT_TIERS.includes(item.tier)) {
      errors.push(
        `Fullscreen gift ${item.id} uses non-premium playback tier ${item.tier}`,
      );
    }

    if (item.hasAudio && item.tier === "micro") {
      errors.push(`Micro gift ${item.id} must not have audio`);
    }
  }

  return errors;
}

export const GIFT_MASTER_VALIDATION_ERRORS = getGiftMasterCatalogIntegrityErrors();
