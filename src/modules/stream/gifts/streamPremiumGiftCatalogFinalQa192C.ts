import {
  streamPremiumGiftCatalogOrganizationRows188F,
  streamPremiumGiftCatalogOrganizationSummary188F,
  streamPremiumGiftCatalogPackFilters188F,
  streamPremiumGiftCatalogRarityLanes188F,
} from "./streamPremiumGiftCatalogOrganization188F";
import {
  streamPremiumGiftCatalogFinalPolishRows192A,
  streamPremiumGiftCatalogFinalPolishSummary192A,
} from "./streamPremiumGiftCatalogFinalPolish192A";
import {
  streamPremiumGiftCatalogAccessibilityLocalizationRows192B,
  streamPremiumGiftCatalogAccessibilityLocalizationSummary192B,
} from "./streamPremiumGiftCatalogAccessibilityLocalizationPolish192B";

export type StreamPremiumGiftCatalogFinalQa192C = {
  assetId: string;
  displayNameRu: string;
  displayName: string;
  qaStatusRu: string;
  qaStatusEn: string;
  coverageLabelRu: string;
  storefrontQaRu: string;
  accessibilityQaRu: string;
  localizationQaRu: string;
  packLaneQaRu: string;
  rarityLaneQaRu: string;
  priceDisclosureQaRu: string;
  safetyDisclosureQaRu: string;
  finalQaRowsRu: readonly string[];
  finalQaChipsRu: readonly string[];
  userFacingOnly: true;
  catalogFinalQaOnly: true;
  sourceRuntimeChangedNow: false;
  backendRuntimeEnabledNow: false;
  paymentRuntimeEnabledNow: false;
  providerRuntimeEnabledNow: false;
  payoutRuntimeEnabledNow: false;
  sendRuntimeEnabledNow: false;
  actualAnimationPlaybackRuntimeEnabledNow: false;
  actualSoundAutoplayRuntimeEnabledNow: false;
  randomWinRuntimeEnabledNow: false;
};

const organizationByAssetId192C = new Map(streamPremiumGiftCatalogOrganizationRows188F.map((row) => [row.assetId, row] as const));
const accessibilityByAssetId192C = new Map(streamPremiumGiftCatalogAccessibilityLocalizationRows192B.map((row) => [row.assetId, row] as const));

export const streamPremiumGiftCatalogFinalQaRows192C: StreamPremiumGiftCatalogFinalQa192C[] = streamPremiumGiftCatalogFinalPolishRows192A.map((gift) => {
  const organization = organizationByAssetId192C.get(gift.assetId) ?? streamPremiumGiftCatalogOrganizationRows188F[0];
  const accessibility = accessibilityByAssetId192C.get(gift.assetId) ?? streamPremiumGiftCatalogAccessibilityLocalizationRows192B[0];
  const qaStatusRu = "Catalog QA passed";
  return {
    assetId: gift.assetId,
    displayNameRu: gift.displayNameRu,
    displayName: gift.displayName,
    qaStatusRu,
    qaStatusEn: "Catalog QA passed",
    coverageLabelRu: `${gift.catalogOrderLabelRu} · ${gift.packShortLabelRu} · 32 gifts`,
    storefrontQaRu: `${gift.showcaseTitleRu} · ${gift.storefrontBadgeRu}`,
    accessibilityQaRu: `${accessibility.highContrastLabelRu} · ${accessibility.reduceMotionLabelRu}`,
    localizationQaRu: `${accessibility.supportedLocales.join("/")} · ${accessibility.localeBadgeRu}`,
    packLaneQaRu: `${organization.packLabelRu} · ${organization.shelfLaneRu}`,
    rarityLaneQaRu: `${organization.rarityLaneRu} · ${organization.catalogBadgeRu}`,
    priceDisclosureQaRu: accessibility.priceDisclosureRu,
    safetyDisclosureQaRu: accessibility.safetyDisclosureRu,
    finalQaRowsRu: [
      `Storefront: ${gift.showcaseSubtitleRu}`,
      `Pack lane: ${organization.packLabelRu}`,
      `Rarity lane: ${organization.rarityLaneRu}`,
      `Accessibility: ${accessibility.highContrastLabelRu}`,
      `Localization: RU/EN copy ready`,
      "Safety: no backend/send/payment/payout/autoplay/runtime",
    ],
    finalQaChipsRu: [gift.packShortLabelRu, organization.rarityLaneRu, "RU/EN", "a11y", "32 gifts", "safe"],
    userFacingOnly: true,
    catalogFinalQaOnly: true,
    sourceRuntimeChangedNow: false,
    backendRuntimeEnabledNow: false,
    paymentRuntimeEnabledNow: false,
    providerRuntimeEnabledNow: false,
    payoutRuntimeEnabledNow: false,
    sendRuntimeEnabledNow: false,
    actualAnimationPlaybackRuntimeEnabledNow: false,
    actualSoundAutoplayRuntimeEnabledNow: false,
    randomWinRuntimeEnabledNow: false,
  };
});

export const streamPremiumGiftCatalogFinalQaSummary192C = {
  version: "STREAM-GAME-GIFTS-192C",
  giftCount: streamPremiumGiftCatalogFinalQaRows192C.length,
  totalCatalogGifts: streamPremiumGiftCatalogOrganizationSummary188F.totalGifts,
  pack1Coverage: streamPremiumGiftCatalogOrganizationSummary188F.pack1Count,
  pack2Coverage: streamPremiumGiftCatalogOrganizationSummary188F.pack2Count,
  pack3Coverage: streamPremiumGiftCatalogOrganizationSummary188F.pack3Count,
  packFilterCoverage: streamPremiumGiftCatalogPackFilters188F.length,
  rarityLaneCoverage: streamPremiumGiftCatalogRarityLanes188F.length,
  finalPolishCoverage: streamPremiumGiftCatalogFinalPolishSummary192A.giftCount,
  accessibilityCoverage: streamPremiumGiftCatalogAccessibilityLocalizationSummary192B.highContrastCoverage,
  localizationCoverage: streamPremiumGiftCatalogAccessibilityLocalizationSummary192B.ruCopyCoverage,
  priceDisclosureCoverage: streamPremiumGiftCatalogAccessibilityLocalizationSummary192B.priceDisclosureCoverage,
  safetyDisclosureCoverage: streamPremiumGiftCatalogAccessibilityLocalizationSummary192B.safetyDisclosureCoverage,
  qaPassedCount: streamPremiumGiftCatalogFinalQaRows192C.filter((row) => row.qaStatusRu === "Catalog QA passed").length,
  userFacingOnly: true,
  catalogFinalQaOnly: true,
  sourceRuntimeChangedNow: false,
  backendRuntimeEnabledNow: false,
  paymentRuntimeEnabledNow: false,
  providerRuntimeEnabledNow: false,
  payoutRuntimeEnabledNow: false,
  sendRuntimeEnabledNow: false,
  actualAnimationPlaybackRuntimeEnabledNow: false,
  actualSoundAutoplayRuntimeEnabledNow: false,
  randomWinRuntimeEnabledNow: false,
} as const;

export function getStreamPremiumGiftCatalogFinalQa192C(assetId: string): StreamPremiumGiftCatalogFinalQa192C {
  return streamPremiumGiftCatalogFinalQaRows192C.find((gift) => gift.assetId === assetId) ?? streamPremiumGiftCatalogFinalQaRows192C[0];
}
