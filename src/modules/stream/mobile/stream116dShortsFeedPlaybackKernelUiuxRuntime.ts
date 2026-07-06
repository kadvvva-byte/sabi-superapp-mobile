import type { StreamRoomRuntimeState } from "./streamRoomRuntime";
import type { Stream116CShortsPublishReadinessEvidence } from "./stream116cShortsPublishReadinessKernelUiuxRuntime";

export type Stream116DShortsFeedPlaybackSectionId =
  | "feed_surface"
  | "vertical_swipe"
  | "playback_overlay"
  | "like_save_share"
  | "comments_sheet"
  | "creator_bridge"
  | "business_bridge"
  | "safety_language_guard"
  | "kernel_feed_contract"
  | "playback_views_blocked"
  | "gifts_monetization_deferred";

export type Stream116DShortsFeedPlaybackStatus = "ready" | "needs_polish";

export type Stream116DShortsFeedPlaybackSection = {
  readonly id: Stream116DShortsFeedPlaybackSectionId;
  readonly title: string;
  readonly description: string;
  readonly status: Stream116DShortsFeedPlaybackStatus;
};

export type Stream116DShortsFeedPlaybackState = {
  readonly version: "STREAM-116D";
  readonly selectedSectionId: Stream116DShortsFeedPlaybackSectionId;
  readonly readySectionIds: readonly Stream116DShortsFeedPlaybackSectionId[];
  readonly lastAction: string;
  readonly feedSurfaceLocal: boolean;
  readonly verticalSwipeLocal: boolean;
  readonly playbackOverlayLocal: boolean;
  readonly likeSaveShareLocal: boolean;
  readonly commentsSheetLocal: boolean;
  readonly creatorBridgeLocal: boolean;
  readonly businessBridgeLocal: boolean;
  readonly safetyLanguageGuardLocal: boolean;
  readonly kernelFeedContractLocal: boolean;
  readonly playbackViewsBlockedLocal: boolean;
  readonly giftsMonetizationDeferredLocal: boolean;
  readonly allConnectionsThroughKernel: true;
  readonly directShortsProviderAllowed: false;
  readonly directPlaybackProviderAllowed: false;
  readonly directFeedProviderAllowed: false;
  readonly directSocialProviderAllowed: false;
  readonly directCommentsProviderAllowed: false;
  readonly directProfileProviderAllowed: false;
  readonly directBusinessProviderAllowed: false;
  readonly directWalletConnectionAllowed: false;
  readonly directGiftPaymentAllowed: false;
  readonly feedBackendTouchedNow: false;
  readonly playbackBackendTouchedNow: false;
  readonly socialBackendTouchedNow: false;
  readonly commentsBackendTouchedNow: false;
  readonly profileBackendTouchedNow: false;
  readonly businessBackendTouchedNow: false;
  readonly walletTouchedNow: false;
  readonly messengerTouchedNow: false;
  readonly mainAiTouchedNow: false;
  readonly fakeFeedLoadedAllowed: false;
  readonly fakePlaybackAllowed: false;
  readonly fakeAutoplayAllowed: false;
  readonly fakeViewsAllowed: false;
  readonly fakeLikesAllowed: false;
  readonly fakeSaveAllowed: false;
  readonly fakeShareSuccessAllowed: false;
  readonly fakeCommentSentAllowed: false;
  readonly fakeCreatorLinkedAllowed: false;
  readonly fakeBusinessLinkedAllowed: false;
  readonly fakeUploadAllowed: false;
  readonly fakePublishAllowed: false;
  readonly fakeMonetizationAllowed: false;
  readonly fakePaymentAllowed: false;
  readonly fakeGiftSendingAllowed: false;
  readonly giftSendingImplementedNow: false;
  readonly monetizationImplementedNow: false;
};

export type Stream116DShortsFeedPlaybackEvidence = {
  readonly version: "STREAM-116D";
  readonly selectedSectionId: Stream116DShortsFeedPlaybackSectionId;
  readonly feedScore: number;
  readonly readySections: number;
  readonly totalSections: number;
  readonly sectionItems: readonly Stream116DShortsFeedPlaybackSection[];
  readonly heroTitle: string;
  readonly heroSubtitle: string;
  readonly phoneStatus: string;
  readonly primaryAction: string;
  readonly secondaryAction: string;
  readonly publishReadinessReady: boolean;
  readonly feedSurfaceReady: boolean;
  readonly verticalSwipeReady: boolean;
  readonly playbackOverlayReady: boolean;
  readonly likeSaveShareReady: boolean;
  readonly commentsSheetReady: boolean;
  readonly creatorBridgeReady: boolean;
  readonly businessBridgeReady: boolean;
  readonly safetyLanguageGuardReady: boolean;
  readonly kernelFeedContractReady: boolean;
  readonly playbackViewsBlockedReady: boolean;
  readonly giftsMonetizationDeferredReady: boolean;
  readonly shortsFeedPlaybackUiuxReady: boolean;
  readonly nextShortsFinalCleanupReady: boolean;
  readonly allConnectionsThroughKernel: true;
  readonly directShortsProviderAllowed: false;
  readonly directPlaybackProviderAllowed: false;
  readonly directFeedProviderAllowed: false;
  readonly directSocialProviderAllowed: false;
  readonly directCommentsProviderAllowed: false;
  readonly directProfileProviderAllowed: false;
  readonly directBusinessProviderAllowed: false;
  readonly directWalletConnectionAllowed: false;
  readonly directGiftPaymentAllowed: false;
  readonly feedBackendTouchedNow: false;
  readonly playbackBackendTouchedNow: false;
  readonly socialBackendTouchedNow: false;
  readonly commentsBackendTouchedNow: false;
  readonly profileBackendTouchedNow: false;
  readonly businessBackendTouchedNow: false;
  readonly walletTouchedNow: false;
  readonly messengerTouchedNow: false;
  readonly mainAiTouchedNow: false;
  readonly fakeFeedLoadedAllowed: false;
  readonly fakePlaybackAllowed: false;
  readonly fakeAutoplayAllowed: false;
  readonly fakeViewsAllowed: false;
  readonly fakeLikesAllowed: false;
  readonly fakeSaveAllowed: false;
  readonly fakeShareSuccessAllowed: false;
  readonly fakeCommentSentAllowed: false;
  readonly fakeCreatorLinkedAllowed: false;
  readonly fakeBusinessLinkedAllowed: false;
  readonly fakeUploadAllowed: false;
  readonly fakePublishAllowed: false;
  readonly fakeMonetizationAllowed: false;
  readonly fakePaymentAllowed: false;
  readonly fakeGiftSendingAllowed: false;
  readonly giftSendingImplementedNow: false;
  readonly monetizationImplementedNow: false;
};

const SECTION_ORDER: readonly Stream116DShortsFeedPlaybackSectionId[] = [
  "feed_surface",
  "vertical_swipe",
  "playback_overlay",
  "like_save_share",
  "comments_sheet",
  "creator_bridge",
  "business_bridge",
  "safety_language_guard",
  "kernel_feed_contract",
  "playback_views_blocked",
  "gifts_monetization_deferred",
];

const SECTION_TITLES: Record<Stream116DShortsFeedPlaybackSectionId, string> = {
  feed_surface: "Поверхность ленты Shorts",
  vertical_swipe: "Vertical swipe",
  playback_overlay: "Overlay плеера",
  like_save_share: "Панель лайк / сохранить / поделиться",
  comments_sheet: "Панель комментариев",
  creator_bridge: "Связь с профилем автора",
  business_bridge: "Связь с Business Stream",
  safety_language_guard: "Safety / language guard",
  kernel_feed_contract: "Kernel feed contract",
  playback_views_blocked: "Playback / просмотры заблокированы",
  gifts_monetization_deferred: "Подарки позже",
};

const SECTION_DESCRIPTIONS: Record<Stream116DShortsFeedPlaybackSectionId, string> = {
  feed_surface: "Лента Shorts оформлена как premium phone-surface, а не debug-card или имитация загруженной ленты.",
  vertical_swipe: "Swipe navigation is shown as local UI intent until feed/player state comes from kernel events.",
  playback_overlay: "Play/pause, автор и подписи оформлены чисто, но без имитации autoplay или playback success.",
  like_save_share: "Лайк, сохранить и поделиться — продуктовые действия как kernel-намерения, а не имитация social-счётчиков.",
  comments_sheet: "Комментарии открываются как чистое нижнее kernel-намерение без имитации отправки или backend enforcement.",
  creator_bridge: "Профиль автора доступен из Shorts вовремя, без имитации синхронизации профиля или счётчиков.",
  business_bridge: "Контекст Business Stream может появляться в Shorts без имитации merchant, order, stock или payment.",
  safety_language_guard: "Текст 25 языков, Sabi AI guard, жалоба и границы 18+ остаются видимыми для playback Shorts.",
  kernel_feed_contract: "Every feed/player/social/comment action must go through Stream core/kernel contracts/facades/events.",
  playback_views_blocked: "Real feed load, playback, autoplay, views, likes and counters stay blocked until backend/provider work.",
  gifts_monetization_deferred: "Gift sending and monetization remain mandatory final Stream stages, not this feed/player pass.",
};

function uniqueReady(items: readonly Stream116DShortsFeedPlaybackSectionId[]): readonly Stream116DShortsFeedPlaybackSectionId[] {
  return SECTION_ORDER.filter((item) => items.includes(item));
}

export function createInitialStream116DShortsFeedPlaybackState(): Stream116DShortsFeedPlaybackState {
  return {
    version: "STREAM-116D",
    selectedSectionId: "feed_surface",
    readySectionIds: ["kernel_feed_contract", "playback_views_blocked", "gifts_monetization_deferred"],
    lastAction: "116D начинает UI ленты/плеера Shorts: premium feed surface, swipe, overlays, social-панель, комментарии, profile/business bridge, только kernel, без имитации playback/views/gifts.",
    feedSurfaceLocal: false,
    verticalSwipeLocal: false,
    playbackOverlayLocal: false,
    likeSaveShareLocal: false,
    commentsSheetLocal: false,
    creatorBridgeLocal: false,
    businessBridgeLocal: false,
    safetyLanguageGuardLocal: false,
    kernelFeedContractLocal: true,
    playbackViewsBlockedLocal: true,
    giftsMonetizationDeferredLocal: true,
    allConnectionsThroughKernel: true,
    directShortsProviderAllowed: false,
    directPlaybackProviderAllowed: false,
    directFeedProviderAllowed: false,
    directSocialProviderAllowed: false,
    directCommentsProviderAllowed: false,
    directProfileProviderAllowed: false,
    directBusinessProviderAllowed: false,
    directWalletConnectionAllowed: false,
    directGiftPaymentAllowed: false,
    feedBackendTouchedNow: false,
    playbackBackendTouchedNow: false,
    socialBackendTouchedNow: false,
    commentsBackendTouchedNow: false,
    profileBackendTouchedNow: false,
    businessBackendTouchedNow: false,
    walletTouchedNow: false,
    messengerTouchedNow: false,
    mainAiTouchedNow: false,
    fakeFeedLoadedAllowed: false,
    fakePlaybackAllowed: false,
    fakeAutoplayAllowed: false,
    fakeViewsAllowed: false,
    fakeLikesAllowed: false,
    fakeSaveAllowed: false,
    fakeShareSuccessAllowed: false,
    fakeCommentSentAllowed: false,
    fakeCreatorLinkedAllowed: false,
    fakeBusinessLinkedAllowed: false,
    fakeUploadAllowed: false,
    fakePublishAllowed: false,
    fakeMonetizationAllowed: false,
    fakePaymentAllowed: false,
    fakeGiftSendingAllowed: false,
    giftSendingImplementedNow: false,
    monetizationImplementedNow: false,
  };
}

function setReadyFlag(state: Stream116DShortsFeedPlaybackState, sectionId: Stream116DShortsFeedPlaybackSectionId): Stream116DShortsFeedPlaybackState {
  const readySectionIds = uniqueReady([...state.readySectionIds, sectionId]);
  return {
    ...state,
    selectedSectionId: sectionId,
    readySectionIds,
    feedSurfaceLocal: sectionId === "feed_surface" ? true : state.feedSurfaceLocal,
    verticalSwipeLocal: sectionId === "vertical_swipe" ? true : state.verticalSwipeLocal,
    playbackOverlayLocal: sectionId === "playback_overlay" ? true : state.playbackOverlayLocal,
    likeSaveShareLocal: sectionId === "like_save_share" ? true : state.likeSaveShareLocal,
    commentsSheetLocal: sectionId === "comments_sheet" ? true : state.commentsSheetLocal,
    creatorBridgeLocal: sectionId === "creator_bridge" ? true : state.creatorBridgeLocal,
    businessBridgeLocal: sectionId === "business_bridge" ? true : state.businessBridgeLocal,
    safetyLanguageGuardLocal: sectionId === "safety_language_guard" ? true : state.safetyLanguageGuardLocal,
    kernelFeedContractLocal: sectionId === "kernel_feed_contract" ? true : state.kernelFeedContractLocal,
    playbackViewsBlockedLocal: sectionId === "playback_views_blocked" ? true : state.playbackViewsBlockedLocal,
    giftsMonetizationDeferredLocal: sectionId === "gifts_monetization_deferred" ? true : state.giftsMonetizationDeferredLocal,
  };
}

export function selectStream116DShortsFeedPlaybackSection(state: Stream116DShortsFeedPlaybackState, sectionId: Stream116DShortsFeedPlaybackSectionId): Stream116DShortsFeedPlaybackState {
  return {
    ...state,
    selectedSectionId: sectionId,
    lastAction: `116D выбран раздел ленты/плеера Shorts: ${SECTION_TITLES[sectionId]}.`,
  };
}

export function markStream116DShortsFeedPlaybackSectionReady(state: Stream116DShortsFeedPlaybackState, sectionId: Stream116DShortsFeedPlaybackSectionId, action: string): Stream116DShortsFeedPlaybackState {
  return {
    ...setReadyFlag(state, sectionId),
    lastAction: action,
  };
}

export function markStream116DShortsFeedPlaybackAllReady(state: Stream116DShortsFeedPlaybackState, action = "116D UI/UX ленты/плеера Shorts готов: лента, swipe, overlay, лайк/сохранить/поделиться, комментарии, creator/business bridge, safety/language, только kernel, playback/views заблокированы, gifts позже."): Stream116DShortsFeedPlaybackState {
  return {
    ...state,
    selectedSectionId: "kernel_feed_contract",
    readySectionIds: SECTION_ORDER,
    lastAction: action,
    feedSurfaceLocal: true,
    verticalSwipeLocal: true,
    playbackOverlayLocal: true,
    likeSaveShareLocal: true,
    commentsSheetLocal: true,
    creatorBridgeLocal: true,
    businessBridgeLocal: true,
    safetyLanguageGuardLocal: true,
    kernelFeedContractLocal: true,
    playbackViewsBlockedLocal: true,
    giftsMonetizationDeferredLocal: true,
  };
}

function buildSectionItems(state: Stream116DShortsFeedPlaybackState): readonly Stream116DShortsFeedPlaybackSection[] {
  return SECTION_ORDER.map((id) => ({
    id,
    title: SECTION_TITLES[id],
    description: SECTION_DESCRIPTIONS[id],
    status: state.readySectionIds.includes(id) ? "ready" : "needs_polish",
  }));
}

export function buildStream116DShortsFeedPlaybackEvidence(
  state: Stream116DShortsFeedPlaybackState,
  _room: StreamRoomRuntimeState,
  publishEvidence: Stream116CShortsPublishReadinessEvidence,
): Stream116DShortsFeedPlaybackEvidence {
  const sectionItems = buildSectionItems(state);
  const readySections = sectionItems.filter((item) => item.status === "ready").length;
  const totalSections = sectionItems.length;
  const feedScore = Math.round((readySections / totalSections) * 100);
  const publishReadinessReady = publishEvidence.shortsPublishUiuxReady;
  const feedSurfaceReady = state.feedSurfaceLocal && state.readySectionIds.includes("feed_surface");
  const verticalSwipeReady = state.verticalSwipeLocal && state.readySectionIds.includes("vertical_swipe");
  const playbackOverlayReady = state.playbackOverlayLocal && state.readySectionIds.includes("playback_overlay");
  const likeSaveShareReady = state.likeSaveShareLocal && state.readySectionIds.includes("like_save_share");
  const commentsSheetReady = state.commentsSheetLocal && state.readySectionIds.includes("comments_sheet");
  const creatorBridgeReady = state.creatorBridgeLocal && state.readySectionIds.includes("creator_bridge");
  const businessBridgeReady = state.businessBridgeLocal && state.readySectionIds.includes("business_bridge");
  const safetyLanguageGuardReady = state.safetyLanguageGuardLocal && state.readySectionIds.includes("safety_language_guard");
  const kernelFeedContractReady = state.kernelFeedContractLocal && state.readySectionIds.includes("kernel_feed_contract");
  const playbackViewsBlockedReady = state.playbackViewsBlockedLocal && state.readySectionIds.includes("playback_views_blocked");
  const giftsMonetizationDeferredReady = state.giftsMonetizationDeferredLocal && state.readySectionIds.includes("gifts_monetization_deferred");
  const shortsFeedPlaybackUiuxReady = publishReadinessReady
    && feedSurfaceReady
    && verticalSwipeReady
    && playbackOverlayReady
    && likeSaveShareReady
    && commentsSheetReady
    && creatorBridgeReady
    && businessBridgeReady
    && safetyLanguageGuardReady
    && kernelFeedContractReady
    && playbackViewsBlockedReady
    && giftsMonetizationDeferredReady;

  return {
    version: "STREAM-116D",
    selectedSectionId: state.selectedSectionId,
    feedScore,
    readySections,
    totalSections,
    sectionItems,
    heroTitle: shortsFeedPlaybackUiuxReady ? "Shorts feed/player готов как premium UI" : "Доводим ленту/плеер Shorts без имитации playback",
    heroSubtitle: "Лента, swipe, overlay плеера, social-панель, комментарии, creator/business bridge, безопасность и kernel gate в одном phone-first Shorts опыте.",
    phoneStatus: shortsFeedPlaybackUiuxReady ? "UI ленты/плеера · только kernel gate" : "Намерение ленты/плеера · playback/views заблокированы",
    primaryAction: "Собрать просмотр Shorts как premium phone UX: swipe, overlay, комментарии, лайк/сохранить/поделиться, creator/business bridge, но без имитации playback, counters, gift sending или payment.",
    secondaryAction: shortsFeedPlaybackUiuxReady ? "Следующий шаг: 116E финальная продуктовая чистка / приёмка Shorts." : "Закрой поверхность ленты, swipe, overlay, social-панель, комментарии, creator/business bridge, безопасность и kernel feed contract.",
    publishReadinessReady,
    feedSurfaceReady,
    verticalSwipeReady,
    playbackOverlayReady,
    likeSaveShareReady,
    commentsSheetReady,
    creatorBridgeReady,
    businessBridgeReady,
    safetyLanguageGuardReady,
    kernelFeedContractReady,
    playbackViewsBlockedReady,
    giftsMonetizationDeferredReady,
    shortsFeedPlaybackUiuxReady,
    nextShortsFinalCleanupReady: shortsFeedPlaybackUiuxReady,
    allConnectionsThroughKernel: state.allConnectionsThroughKernel,
    directShortsProviderAllowed: state.directShortsProviderAllowed,
    directPlaybackProviderAllowed: state.directPlaybackProviderAllowed,
    directFeedProviderAllowed: state.directFeedProviderAllowed,
    directSocialProviderAllowed: state.directSocialProviderAllowed,
    directCommentsProviderAllowed: state.directCommentsProviderAllowed,
    directProfileProviderAllowed: state.directProfileProviderAllowed,
    directBusinessProviderAllowed: state.directBusinessProviderAllowed,
    directWalletConnectionAllowed: state.directWalletConnectionAllowed,
    directGiftPaymentAllowed: state.directGiftPaymentAllowed,
    feedBackendTouchedNow: state.feedBackendTouchedNow,
    playbackBackendTouchedNow: state.playbackBackendTouchedNow,
    socialBackendTouchedNow: state.socialBackendTouchedNow,
    commentsBackendTouchedNow: state.commentsBackendTouchedNow,
    profileBackendTouchedNow: state.profileBackendTouchedNow,
    businessBackendTouchedNow: state.businessBackendTouchedNow,
    walletTouchedNow: state.walletTouchedNow,
    messengerTouchedNow: state.messengerTouchedNow,
    mainAiTouchedNow: state.mainAiTouchedNow,
    fakeFeedLoadedAllowed: state.fakeFeedLoadedAllowed,
    fakePlaybackAllowed: state.fakePlaybackAllowed,
    fakeAutoplayAllowed: state.fakeAutoplayAllowed,
    fakeViewsAllowed: state.fakeViewsAllowed,
    fakeLikesAllowed: state.fakeLikesAllowed,
    fakeSaveAllowed: state.fakeSaveAllowed,
    fakeShareSuccessAllowed: state.fakeShareSuccessAllowed,
    fakeCommentSentAllowed: state.fakeCommentSentAllowed,
    fakeCreatorLinkedAllowed: state.fakeCreatorLinkedAllowed,
    fakeBusinessLinkedAllowed: state.fakeBusinessLinkedAllowed,
    fakeUploadAllowed: state.fakeUploadAllowed,
    fakePublishAllowed: state.fakePublishAllowed,
    fakeMonetizationAllowed: state.fakeMonetizationAllowed,
    fakePaymentAllowed: state.fakePaymentAllowed,
    fakeGiftSendingAllowed: state.fakeGiftSendingAllowed,
    giftSendingImplementedNow: state.giftSendingImplementedNow,
    monetizationImplementedNow: state.monetizationImplementedNow,
  };
}
