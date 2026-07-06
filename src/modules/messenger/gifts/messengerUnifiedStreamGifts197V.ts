import type { StreamPremiumGiftAsset187A } from "../../stream/gifts/streamPremiumGiftPack187A";
import { streamPremiumGiftPack187A } from "../../stream/gifts/streamPremiumGiftPack187A";
import { streamPremiumGiftPack188A } from "../../stream/gifts/streamPremiumGiftPack188A";
import { streamPremiumGiftPack190A } from "../../stream/gifts/streamPremiumGiftPack190A";
import { streamPremiumGiftPack197A } from "../../stream/gifts/streamPremiumGiftPack197A";
import { streamPremiumGiftPack197C } from "../../stream/gifts/streamPremiumGiftPack197C";
import { streamPremiumGiftPack197D } from "../../stream/gifts/streamPremiumGiftPack197D";
import { streamPremiumGiftPack197E } from "../../stream/gifts/streamPremiumGiftPack197E";
import { streamPremiumGiftPack197F } from "../../stream/gifts/streamPremiumGiftPack197F";
import { streamPremiumGiftPack197G } from "../../stream/gifts/streamPremiumGiftPack197G";
import { streamPremiumGiftPack197H } from "../../stream/gifts/streamPremiumGiftPack197H";

import type { GiftCatalogItem, GiftCategory, GiftPlaybackType, GiftRewardTier, GiftTier } from "./giftTypes";

export type MessengerUnifiedStreamGift197V = GiftCatalogItem & {
  streamAssetId: string;
  diamondPrice: number;
  messengerUnifiedSource: "stream_gift_catalog_197v";
  sendRuntimeEnabledNow: false;
  paymentRuntimeEnabledNow: false;
  walletMutationRuntimeEnabledNow: false;
  backendLedgerRequired: true;
};

export const messengerUnifiedGifts197VVersion = "MESSENGER-STREAM-UNIFIED-GIFTS-197V" as const;
export const messengerUnifiedDiamondsPerCoin197V = 100 as const;
export const messengerUnifiedMinimumTopUpCoins197V = 10 as const;
export const messengerUnifiedMinimumTopUpUsd197V = 10 as const;
export const messengerUnifiedReceiverShareBps197V = 7000 as const;
export const messengerUnifiedPlatformFeeBps197V = 3000 as const;

const allStreamGiftAssets197V: readonly StreamPremiumGiftAsset187A[] = [
  ...streamPremiumGiftPack187A,
  ...streamPremiumGiftPack188A,
  ...streamPremiumGiftPack190A,
  ...streamPremiumGiftPack197A,
  ...streamPremiumGiftPack197C,
  ...streamPremiumGiftPack197D,
  ...streamPremiumGiftPack197E,
  ...streamPremiumGiftPack197F,
  ...streamPremiumGiftPack197G,
  ...streamPremiumGiftPack197H,
] as const;

function readDiamondPrice(asset: StreamPremiumGiftAsset187A): number {
  const maybeDiamond = (asset as { diamondPrice?: unknown }).diamondPrice;
  if (typeof maybeDiamond === "number" && Number.isFinite(maybeDiamond) && maybeDiamond > 0) {
    return Math.max(1, Math.min(10000, Math.round(maybeDiamond)));
  }

  const match = String(asset.localCostLabel ?? "").match(/(\d+)/);
  const parsed = match ? Number(match[1]) : 10;
  return Math.max(1, Math.min(10000, Math.round(Number.isFinite(parsed) ? parsed : 10)));
}

function mapCategory(asset: StreamPremiumGiftAsset187A): GiftCategory {
  const text = `${asset.catalogSegment} ${asset.iconName} ${asset.displayName} ${asset.displayNameRu}`.toLowerCase();
  if (text.includes("car") || text.includes("bike") || text.includes("самол") || text.includes("яхт") || text.includes("поезд")) return "cars_moto";
  if (text.includes("dragon") || text.includes("phoenix") || text.includes("pegasus") || text.includes("дракон") || text.includes("феникс")) return "fantasy_myth";
  if (text.includes("crown") || text.includes("palace") || text.includes("throne") || text.includes("корон") || text.includes("дворец")) return "luxury_status";
  if (text.includes("galaxy") || text.includes("cosmic") || text.includes("planet") || text.includes("галак") || text.includes("планет")) return "space_epic";
  if (text.includes("tiger") || text.includes("fox") || text.includes("cat") || text.includes("lion") || text.includes("тигр") || text.includes("лис")) return "animals";
  if (asset.catalogSegment === "sound") return "seasonal_event";
  if (asset.catalogSegment === "premium") return "luxury_status";
  return "love_romance";
}

function tierFromDiamondPrice(diamonds: number): GiftTier {
  if (diamonds <= 5) return "basic_3d";
  if (diamonds <= 25) return "visual_plus";
  if (diamonds <= 100) return "premium_audio";
  if (diamonds <= 500) return "near_fullscreen";
  if (diamonds <= 2500) return "premium_fullscreen";
  return "ultra_premium";
}

function rewardTierFromDiamondPrice(diamonds: number): GiftRewardTier {
  if (diamonds <= 5) return "basic";
  if (diamonds <= 25) return "fixed_20";
  if (diamonds <= 500) return "medium";
  return "premium";
}

function playbackFromTier(tier: GiftTier): GiftPlaybackType {
  switch (tier) {
    case "basic_3d": return "inline_3d";
    case "visual_plus":
    case "premium_audio": return "expanded_3d";
    case "near_fullscreen": return "near_fullscreen_3d";
    case "premium_fullscreen": return "fullscreen_3d";
    case "ultra_premium": return "ultra_fullscreen_3d";
    default: return "inline_3d";
  }
}

function durationForDiamondPrice(diamonds: number): { min: number; max: number } {
  if (diamonds <= 5) return { min: 2, max: 3 };
  if (diamonds <= 25) return { min: 3, max: 4 };
  if (diamonds <= 100) return { min: 4, max: 6 };
  if (diamonds <= 500) return { min: 6, max: 8 };
  if (diamonds <= 2500) return { min: 8, max: 11 };
  return { min: 12, max: 18 };
}

function buildMessengerGift(asset: StreamPremiumGiftAsset187A, index: number): MessengerUnifiedStreamGift197V {
  const diamondPrice = readDiamondPrice(asset);
  const tier = tierFromDiamondPrice(diamondPrice);
  const duration = durationForDiamondPrice(diamondPrice);
  const priceCoin = diamondPrice / messengerUnifiedDiamondsPerCoin197V;

  return {
    id: `stream_${asset.id}`,
    slug: `stream-${asset.id}`,
    title: asset.displayNameRu || asset.displayName,
    subtitle: `Unified Stream + Messenger gift · ${diamondPrice.toLocaleString("en-US")} diamonds · backend ledger required`,
    shortLabel: asset.displayNameRu || asset.displayName,
    category: mapCategory(asset),
    tier,
    rewardTier: rewardTierFromDiamondPrice(diamondPrice),
    priceCoin,
    currency: "COIN",
    is3D: true,
    hasAudio: asset.catalogSegment === "sound" || diamondPrice >= 50,
    durationMinSec: duration.min,
    durationMaxSec: duration.max,
    playbackType: playbackFromTier(tier),
    previewAsset: `stream-gift-preview://${asset.id}`,
    animationAsset: `stream-gift-animation://${asset.id}`,
    coverImage: asset.posterFile,
    badgeLabel: `${diamondPrice.toLocaleString("en-US")} D · unified`,
    tags: ["stream", "messenger", "unified", "backend-ledger-required"],
    availableIn: "both",
    isEventGift: false,
    lifecycle: "active",
    sortOrder: 197000 + index,
    streamAssetId: asset.id,
    diamondPrice,
    messengerUnifiedSource: "stream_gift_catalog_197v",
    sendRuntimeEnabledNow: false,
    paymentRuntimeEnabledNow: false,
    walletMutationRuntimeEnabledNow: false,
    backendLedgerRequired: true,
  };
}

export const messengerUnifiedStreamGiftCatalog197V: readonly MessengerUnifiedStreamGift197V[] = allStreamGiftAssets197V.map(buildMessengerGift);
export const messengerUnifiedStreamGiftIds197V = new Set(messengerUnifiedStreamGiftCatalog197V.map((gift) => gift.id));

export const messengerUnifiedGiftRuntimePolicy197V = {
  version: messengerUnifiedGifts197VVersion,
  userFacingCatalogReady: true,
  unifiedStreamMessengerCatalogReady: true,
  giftCount: messengerUnifiedStreamGiftCatalog197V.length,
  minDiamondPrice: Math.min(...messengerUnifiedStreamGiftCatalog197V.map((gift) => gift.diamondPrice)),
  maxDiamondPrice: Math.max(...messengerUnifiedStreamGiftCatalog197V.map((gift) => gift.diamondPrice)),
  diamondsPerCoin: messengerUnifiedDiamondsPerCoin197V,
  minimumTopUpCoins: messengerUnifiedMinimumTopUpCoins197V,
  minimumTopUpUsd: messengerUnifiedMinimumTopUpUsd197V,
  receiverShareBps: messengerUnifiedReceiverShareBps197V,
  platformFeeBps: messengerUnifiedPlatformFeeBps197V,
  realSendRuntimeEnabledNow: false,
  realPaymentRuntimeEnabledNow: false,
  walletMutationRuntimeEnabledNow: false,
  providerCallRuntimeEnabledNow: false,
  payoutRuntimeEnabledNow: false,
  fakeAvailableBalanceEnabledNow: false,
  backendLedgerRequiredForSend: true,
} as const;

export function isMessengerUnifiedStreamGift197V(giftId: string | null | undefined): boolean {
  return messengerUnifiedStreamGiftIds197V.has(String(giftId ?? ""));
}

export function getMessengerUnifiedStreamGiftById197V(giftId: string | null | undefined): MessengerUnifiedStreamGift197V | null {
  const normalized = String(giftId ?? "");
  return messengerUnifiedStreamGiftCatalog197V.find((gift) => gift.id === normalized) ?? null;
}
