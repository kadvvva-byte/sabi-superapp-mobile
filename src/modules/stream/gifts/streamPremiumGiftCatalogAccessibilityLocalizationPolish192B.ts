import {
  streamPremiumGiftCatalogFinalPolishRows192A,
  streamPremiumGiftCatalogFinalPolishSummary192A,
} from "./streamPremiumGiftCatalogFinalPolish192A";

export type StreamPremiumGiftCatalogAccessibilityLocalization192B = {
  assetId: string;
  displayNameRu: string;
  displayName: string;
  localeBadgeRu: string;
  localeBadgeEn: string;
  screenReaderLabelRu: string;
  screenReaderLabelEn: string;
  screenReaderHintRu: string;
  screenReaderHintEn: string;
  highContrastLabelRu: string;
  highContrastLabelEn: string;
  reduceMotionLabelRu: string;
  reduceMotionLabelEn: string;
  priceDisclosureRu: string;
  priceDisclosureEn: string;
  safetyDisclosureRu: string;
  safetyDisclosureEn: string;
  catalogAccessRowsRu: readonly string[];
  catalogAccessRowsEn: readonly string[];
  polishChipsRu: readonly string[];
  polishChipsEn: readonly string[];
  supportedLocales: readonly ["ru", "en"];
  accessibilityPolishOnly: true;
  localizationPolishOnly: true;
  userFacingOnly: true;
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

export const streamPremiumGiftCatalogAccessibilityLocalizationRows192B: StreamPremiumGiftCatalogAccessibilityLocalization192B[] = streamPremiumGiftCatalogFinalPolishRows192A.map((gift, index) => ({
  assetId: gift.assetId,
  displayNameRu: gift.displayNameRu,
  displayName: gift.displayName,
  localeBadgeRu: `${gift.packShortLabelRu} · RU/EN · ${gift.rarityLaneRu}`,
  localeBadgeEn: `${gift.packShortLabelRu} · RU/EN · ${gift.rarityLaneRu}`,
  screenReaderLabelRu: `${gift.displayNameRu}. ${gift.packLabelRu}. ${gift.rarityLaneRu}. ${gift.pricePreviewRu}. Локальный preview подарка.`,
  screenReaderLabelEn: `${gift.displayName}. ${gift.packShortLabelRu}. ${gift.rarityLaneRu}. ${gift.pricePreviewRu}. Local gift preview.`,
  screenReaderHintRu: "Открывает понятное описание подарка, цены-preview и безопасного локального просмотра без отправки и оплаты.",
  screenReaderHintEn: "Opens a clear gift description, price preview, and safe local preview without sending or payment.",
  highContrastLabelRu: `Контрастная карточка ${index + 1}/${streamPremiumGiftCatalogFinalPolishSummary192A.giftCount}`,
  highContrastLabelEn: `High contrast card ${index + 1}/${streamPremiumGiftCatalogFinalPolishSummary192A.giftCount}`,
  reduceMotionLabelRu: "Lite preview: poster-first, без autoplay и без резких эффектов.",
  reduceMotionLabelEn: "Lite preview: poster-first, no autoplay, no sudden effects.",
  priceDisclosureRu: `${gift.pricePreviewRu}. Финальная покупка будет подключаться позже через безопасный billing/backend flow.`,
  priceDisclosureEn: `${gift.pricePreviewRu}. Final purchase will be connected later through a safe billing/backend flow.`,
  safetyDisclosureRu: "Каталог показывает только локальные подарки: нет backend-отправки, списания, payout, provider call, autoplay и random win logic.",
  safetyDisclosureEn: "Catalog shows local gifts only: no backend send, charge, payout, provider call, autoplay, or random win logic.",
  catalogAccessRowsRu: [
    `Название RU: ${gift.displayNameRu}`,
    `Название EN: ${gift.displayName}`,
    `Навигация: ${gift.packLabelRu} · ${gift.rarityLaneRu}`,
    "Доступность: screen-reader label + reduce-motion copy",
  ],
  catalogAccessRowsEn: [
    `RU title: ${gift.displayNameRu}`,
    `EN title: ${gift.displayName}`,
    `Navigation: ${gift.packShortLabelRu} · ${gift.rarityLaneRu}`,
    "Accessibility: screen-reader label + reduce-motion copy",
  ],
  polishChipsRu: ["RU", "EN", "a11y", "contrast", "lite", "no send"],
  polishChipsEn: ["RU", "EN", "a11y", "contrast", "lite", "no send"],
  supportedLocales: ["ru", "en"],
  accessibilityPolishOnly: true,
  localizationPolishOnly: true,
  userFacingOnly: true,
  sourceRuntimeChangedNow: false,
  backendRuntimeEnabledNow: false,
  paymentRuntimeEnabledNow: false,
  providerRuntimeEnabledNow: false,
  payoutRuntimeEnabledNow: false,
  sendRuntimeEnabledNow: false,
  actualAnimationPlaybackRuntimeEnabledNow: false,
  actualSoundAutoplayRuntimeEnabledNow: false,
  randomWinRuntimeEnabledNow: false,
}));

export const streamPremiumGiftCatalogAccessibilityLocalizationSummary192B = {
  version: "STREAM-GAME-GIFTS-192B",
  giftCount: streamPremiumGiftCatalogAccessibilityLocalizationRows192B.length,
  ruCopyCoverage: streamPremiumGiftCatalogAccessibilityLocalizationRows192B.filter((gift) => gift.screenReaderLabelRu.length > 0 && gift.safetyDisclosureRu.length > 0).length,
  enCopyCoverage: streamPremiumGiftCatalogAccessibilityLocalizationRows192B.filter((gift) => gift.screenReaderLabelEn.length > 0 && gift.safetyDisclosureEn.length > 0).length,
  supportedLocaleCount: 2,
  supportedLocales: ["ru", "en"],
  highContrastCoverage: streamPremiumGiftCatalogAccessibilityLocalizationRows192B.filter((gift) => gift.highContrastLabelRu.length > 0).length,
  reduceMotionCoverage: streamPremiumGiftCatalogAccessibilityLocalizationRows192B.filter((gift) => gift.reduceMotionLabelRu.length > 0).length,
  priceDisclosureCoverage: streamPremiumGiftCatalogAccessibilityLocalizationRows192B.filter((gift) => gift.priceDisclosureRu.length > 0).length,
  safetyDisclosureCoverage: streamPremiumGiftCatalogAccessibilityLocalizationRows192B.filter((gift) => gift.safetyDisclosureRu.includes("нет backend") && gift.safetyDisclosureEn.includes("no backend")).length,
  accessibilityPolishOnly: true,
  localizationPolishOnly: true,
  userFacingOnly: true,
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

export function getStreamPremiumGiftCatalogAccessibilityLocalization192B(assetId: string): StreamPremiumGiftCatalogAccessibilityLocalization192B {
  return streamPremiumGiftCatalogAccessibilityLocalizationRows192B.find((gift) => gift.assetId === assetId) ?? streamPremiumGiftCatalogAccessibilityLocalizationRows192B[0];
}
