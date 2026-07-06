import { streamPremiumGiftPack187A } from "./streamPremiumGiftPack187A";
import { streamPremiumGiftPack188A } from "./streamPremiumGiftPack188A";
import { streamPremiumGiftPack190A } from "./streamPremiumGiftPack190A";
import { streamPremiumGiftPack197A } from "./streamPremiumGiftPack197A";
import { streamPremiumGiftPack197C } from "./streamPremiumGiftPack197C";
import { streamPremiumGiftPack197D } from "./streamPremiumGiftPack197D";
import { streamPremiumGiftPack197E } from "./streamPremiumGiftPack197E";
import { streamPremiumGiftPack197F } from "./streamPremiumGiftPack197F";
import { streamPremiumGiftPack197G } from "./streamPremiumGiftPack197G";
import { streamPremiumGiftPack197H } from "./streamPremiumGiftPack197H";
import {
  streamPremiumGiftCatalogOrganizationRows188F,
  streamPremiumGiftCatalogOrganizationSummary188F,
  streamPremiumGiftCatalogPackFilters188F,
  streamPremiumGiftCatalogRarityLanes188F,
} from "./streamPremiumGiftCatalogOrganization188F";
import { streamPremiumGiftLivePreviewFinalQaRows191D } from "./streamPremiumGiftLivePreviewFinalQa191D";

type StreamPremiumGiftCatalogFinalPolishGiftMeta192A = {
  assetId: string;
  displayNameRu: string;
  displayName: string;
  localCostLabel: string;
  previewRu: string;
  qualityLabel: string;
  rarityLabel: string;
  catalogSegment: string;
  iconName: string;
};

export type StreamPremiumGiftCatalogFinalPolish192A = {
  assetId: string;
  displayNameRu: string;
  displayName: string;
  packLabelRu: string;
  packShortLabelRu: string;
  rarityLaneRu: string;
  catalogOrderLabelRu: string;
  showcaseTitleRu: string;
  showcaseSubtitleRu: string;
  storefrontBadgeRu: string;
  shelfHintRu: string;
  pricePreviewRu: string;
  previewLineRu: string;
  filterCopyRu: string;
  accessibilityCopyRu: string;
  finalQaCopyRu: string;
  polishRowsRu: readonly string[];
  polishChipsRu: readonly string[];
  safetyCopyRu: string;
  userFacingOnly: true;
  catalogPolishOnly: true;
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

const allGiftMeta192A: StreamPremiumGiftCatalogFinalPolishGiftMeta192A[] = [
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
].map((gift) => ({
  assetId: gift.id,
  displayNameRu: gift.displayNameRu,
  displayName: gift.displayName,
  localCostLabel: gift.localCostLabel,
  previewRu: gift.previewRu,
  qualityLabel: gift.qualityLabel,
  rarityLabel: gift.rarityLabel,
  catalogSegment: gift.catalogSegment,
  iconName: gift.iconName,
}));

const giftMetaByAssetId192A = new Map(allGiftMeta192A.map((gift) => [gift.assetId, gift] as const));
const finalQaByAssetId192A = new Map(streamPremiumGiftLivePreviewFinalQaRows191D.map((row) => [row.assetId, row] as const));

function getPackShortLabel(packFilterKey: string): string {
  if (packFilterKey === "pack10") return "P10";
  if (packFilterKey === "pack9") return "P9";
  if (packFilterKey === "pack8") return "P8";
  if (packFilterKey === "pack7") return "P7";
  if (packFilterKey === "pack6") return "P6";
  if (packFilterKey === "pack5") return "P5";
  if (packFilterKey === "pack4") return "P4";
  if (packFilterKey === "pack3") return "P3";
  if (packFilterKey === "pack2") return "P2";
  return "P1";
}

export const streamPremiumGiftCatalogFinalPolishRows192A: StreamPremiumGiftCatalogFinalPolish192A[] = streamPremiumGiftCatalogOrganizationRows188F.map((row) => {
  const meta = giftMetaByAssetId192A.get(row.assetId) ?? allGiftMeta192A[0];
  const finalQa = finalQaByAssetId192A.get(row.assetId);
  const filterLabel = streamPremiumGiftCatalogPackFilters188F.find((filter) => filter.key === row.packFilterKey)?.labelRu ?? row.packLabelRu;
  const rarityMeta = streamPremiumGiftCatalogRarityLanes188F.find((lane) => lane.key === row.rarityLaneKey)?.metaRu ?? "premium preview";
  return {
    assetId: row.assetId,
    displayNameRu: meta.displayNameRu,
    displayName: meta.displayName,
    packLabelRu: row.packLabelRu,
    packShortLabelRu: getPackShortLabel(row.packFilterKey),
    rarityLaneRu: row.rarityLaneRu,
    catalogOrderLabelRu: `${row.catalogOrder}/${streamPremiumGiftCatalogOrganizationSummary188F.totalGifts}`,
    showcaseTitleRu: `${meta.displayNameRu} · ${row.rarityLaneRu}`,
    showcaseSubtitleRu: `${filterLabel} · ${row.shelfLaneRu} · ${rarityMeta}`,
    storefrontBadgeRu: `${getPackShortLabel(row.packFilterKey)} · ${row.catalogBadgeRu}`,
    shelfHintRu: `${row.previewGroupingRu} · ${row.recommendedUseRu}`,
    pricePreviewRu: `${meta.localCostLabel} · later billing only`,
    previewLineRu: `${meta.previewRu} · ${meta.qualityLabel}`,
    filterCopyRu: `${row.packLabelRu} · ${row.rarityLaneRu} · ${meta.catalogSegment}`,
    accessibilityCopyRu: `${meta.displayNameRu}: ${row.packLabelRu}, ${row.rarityLaneRu}, ${row.recommendedUseRu}. Локальный preview без отправки и оплаты.`,
    finalQaCopyRu: finalQa ? `${finalQa.qaStatusRu} · ${finalQa.coverageLabelRu}` : "live preview QA row missing",
    polishRowsRu: [
      `Витрина: ${row.packLabelRu}`,
      `Rarity lane: ${row.rarityLaneRu}`,
      `Сцена: ${row.shelfLaneRu}`,
      `Preview: ${meta.previewRu}`,
      finalQa ? "Live preview QA linked" : "Live preview QA needs review",
    ],
    polishChipsRu: [row.packLabelRu, row.rarityLaneRu, row.catalogBadgeRu, meta.catalogSegment, "80 gifts", "local only"],
    safetyCopyRu: "192A полирует только локальный каталог подарков: без backend, оплаты, списания, отправки, payout, autoplay и actual media playback.",
    userFacingOnly: true,
    catalogPolishOnly: true,
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

export const streamPremiumGiftCatalogFinalPolishSummary192A = {
  version: "STREAM-GAME-GIFTS-192A",
  giftCount: streamPremiumGiftCatalogFinalPolishRows192A.length,
  totalCatalogGifts: streamPremiumGiftCatalogOrganizationSummary188F.totalGifts,
  pack1Count: streamPremiumGiftCatalogOrganizationSummary188F.pack1Count,
  pack2Count: streamPremiumGiftCatalogOrganizationSummary188F.pack2Count,
  pack3Count: streamPremiumGiftCatalogOrganizationSummary188F.pack3Count,
  pack4Count: streamPremiumGiftCatalogOrganizationSummary188F.pack4Count,
  pack5Count: streamPremiumGiftCatalogOrganizationSummary188F.pack5Count,
  pack6Count: streamPremiumGiftCatalogOrganizationSummary188F.pack6Count,
  pack7Count: streamPremiumGiftCatalogOrganizationSummary188F.pack7Count,
  pack8Count: streamPremiumGiftCatalogOrganizationSummary188F.pack8Count,
  pack9Count: streamPremiumGiftCatalogOrganizationSummary188F.pack9Count,
  pack10Count: streamPremiumGiftCatalogOrganizationSummary188F.pack10Count,
  packFilterCount: streamPremiumGiftCatalogPackFilters188F.length,
  rarityLaneCount: streamPremiumGiftCatalogRarityLanes188F.length,
  finalQaLinkedCount: streamPremiumGiftCatalogFinalPolishRows192A.filter((row) => row.finalQaCopyRu.includes("QA passed")).length,
  userFacingOnly: true,
  catalogPolishOnly: true,
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

export function getStreamPremiumGiftCatalogFinalPolish192A(assetId: string): StreamPremiumGiftCatalogFinalPolish192A {
  return streamPremiumGiftCatalogFinalPolishRows192A.find((row) => row.assetId === assetId) ?? streamPremiumGiftCatalogFinalPolishRows192A[0];
}
