import type { StreamRoomRuntimeState } from "./streamRoomRuntime";
import type { StreamRoomStageRuntimeState } from "./streamRoomStageRuntime";
import type { Stream115BOfficialStreamerSetupEvidence } from "./stream115bOfficialStreamerSetupKernelUiuxRuntime";

export type Stream115CCreatorContentTabsSectionId =
  | "content_tabs_entry"
  | "live_archive_tab"
  | "shorts_grid_tab"
  | "video_replay_tab"
  | "pinned_content"
  | "category_filter"
  | "empty_content_state"
  | "business_content_bridge"
  | "kernel_content_contract"
  | "gifts_monetization_deferred";

export type Stream115CCreatorContentTabsStatus = "ready" | "needs_polish";

export type Stream115CCreatorContentTabsSection = {
  readonly id: Stream115CCreatorContentTabsSectionId;
  readonly title: string;
  readonly description: string;
  readonly status: Stream115CCreatorContentTabsStatus;
};

export type Stream115CCreatorContentTabsState = {
  readonly version: "STREAM-115C";
  readonly selectedSectionId: Stream115CCreatorContentTabsSectionId;
  readonly readySectionIds: readonly Stream115CCreatorContentTabsSectionId[];
  readonly lastAction: string;
  readonly contentTabsEntryLocal: boolean;
  readonly liveArchiveTabLocal: boolean;
  readonly shortsGridTabLocal: boolean;
  readonly videoReplayTabLocal: boolean;
  readonly pinnedContentLocal: boolean;
  readonly categoryFilterLocal: boolean;
  readonly emptyContentStateLocal: boolean;
  readonly businessContentBridgeLocal: boolean;
  readonly kernelContentContractLocal: boolean;
  readonly giftsMonetizationDeferredLocal: boolean;
  readonly allConnectionsThroughKernel: true;
  readonly directProfileProviderAllowed: false;
  readonly directContentProviderAllowed: false;
  readonly directRealtimeConnectionAllowed: false;
  readonly directShortsServiceAllowed: false;
  readonly directVideoProviderAllowed: false;
  readonly directBusinessProviderAllowed: false;
  readonly directWalletConnectionAllowed: false;
  readonly directGiftPaymentAllowed: false;
  readonly profileBackendTouchedNow: false;
  readonly contentBackendTouchedNow: false;
  readonly shortsBackendTouchedNow: false;
  readonly videoBackendTouchedNow: false;
  readonly businessBackendTouchedNow: false;
  readonly walletTouchedNow: false;
  readonly messengerTouchedNow: false;
  readonly mainAiTouchedNow: false;
  readonly fakeViewsAllowed: false;
  readonly fakeLikeCountAllowed: false;
  readonly fakeFollowerCountAllowed: false;
  readonly fakeVideoUploadAllowed: false;
  readonly fakeReplayPlaybackAllowed: false;
  readonly fakeShortsPlaybackAllowed: false;
  readonly fakeBusinessLeadAllowed: false;
  readonly fakeMonetizationAllowed: false;
  readonly fakePaymentAllowed: false;
  readonly fakeGiftSendingAllowed: false;
  readonly giftSendingImplementedNow: false;
  readonly monetizationImplementedNow: false;
};

export type Stream115CCreatorContentTabsEvidence = {
  readonly version: "STREAM-115C";
  readonly selectedSectionId: Stream115CCreatorContentTabsSectionId;
  readonly contentTabsScore: number;
  readonly readySections: number;
  readonly totalSections: number;
  readonly sectionItems: readonly Stream115CCreatorContentTabsSection[];
  readonly heroTitle: string;
  readonly heroSubtitle: string;
  readonly phoneStatus: string;
  readonly primaryAction: string;
  readonly secondaryAction: string;
  readonly officialStreamerSetupReady: boolean;
  readonly contentTabsEntryReady: boolean;
  readonly liveArchiveTabReady: boolean;
  readonly shortsGridTabReady: boolean;
  readonly videoReplayTabReady: boolean;
  readonly pinnedContentReady: boolean;
  readonly categoryFilterReady: boolean;
  readonly emptyContentStateReady: boolean;
  readonly businessContentBridgeReady: boolean;
  readonly kernelContentContractReady: boolean;
  readonly giftsMonetizationDeferredReady: boolean;
  readonly creatorContentTabsUiuxReady: boolean;
  readonly nextProfilePolishReady: boolean;
  readonly allConnectionsThroughKernel: true;
  readonly directProfileProviderAllowed: false;
  readonly directContentProviderAllowed: false;
  readonly directRealtimeConnectionAllowed: false;
  readonly directShortsServiceAllowed: false;
  readonly directVideoProviderAllowed: false;
  readonly directBusinessProviderAllowed: false;
  readonly directWalletConnectionAllowed: false;
  readonly directGiftPaymentAllowed: false;
  readonly profileBackendTouchedNow: false;
  readonly contentBackendTouchedNow: false;
  readonly shortsBackendTouchedNow: false;
  readonly videoBackendTouchedNow: false;
  readonly businessBackendTouchedNow: false;
  readonly walletTouchedNow: false;
  readonly messengerTouchedNow: false;
  readonly mainAiTouchedNow: false;
  readonly fakeViewsAllowed: false;
  readonly fakeLikeCountAllowed: false;
  readonly fakeFollowerCountAllowed: false;
  readonly fakeVideoUploadAllowed: false;
  readonly fakeReplayPlaybackAllowed: false;
  readonly fakeShortsPlaybackAllowed: false;
  readonly fakeBusinessLeadAllowed: false;
  readonly fakeMonetizationAllowed: false;
  readonly fakePaymentAllowed: false;
  readonly fakeGiftSendingAllowed: false;
  readonly giftSendingImplementedNow: false;
  readonly monetizationImplementedNow: false;
};

const SECTION_ORDER: readonly Stream115CCreatorContentTabsSectionId[] = [
  "content_tabs_entry",
  "live_archive_tab",
  "shorts_grid_tab",
  "video_replay_tab",
  "pinned_content",
  "category_filter",
  "empty_content_state",
  "business_content_bridge",
  "kernel_content_contract",
  "gifts_monetization_deferred",
];

const SECTION_TITLES: Record<Stream115CCreatorContentTabsSectionId, string> = {
  content_tabs_entry: "Вкладки контента",
  live_archive_tab: "Live tab",
  shorts_grid_tab: "Сетка Shorts",
  video_replay_tab: "Video replays",
  pinned_content: "Закреплённый контент",
  category_filter: "Категории",
  empty_content_state: "Пустые состояния",
  business_content_bridge: "Бизнес-связка",
  kernel_content_contract: "Контракт ядра",
  gifts_monetization_deferred: "Подарки позже",
};

const SECTION_DESCRIPTIONS: Record<Stream115CCreatorContentTabsSectionId, string> = {
  content_tabs_entry: "Creator profile content area opens with clear tabs for Live, Shorts, videos and categories.",
  live_archive_tab: "Live history is represented as kernel-state preview only; no fake live archive, fake replay or fake counters.",
  shorts_grid_tab: "Shorts grid prepares the creator profile connection without direct Shorts service calls or fake playback.",
  video_replay_tab: "Video/replay tab is a product shell with honest provider boundary until real media backend exists.",
  pinned_content: "Pinned content gives the creator a premium hero placement without fake promotion or fake monetization.",
  category_filter: "Category chips keep Stream profile navigation clean across the 25-language registry.",
  empty_content_state: "Empty grids explain what happens next instead of showing broken blank screens or test/debug copy.",
  business_content_bridge: "Business creator content can link to Business Stream context later, but no fake lead/order/payment now.",
  kernel_content_contract: "All profile content, Live archive, Shorts, video and business links go through Stream core/kernel contracts/facades/events.",
  gifts_monetization_deferred: "Gifts and monetization are mandatory later, but they stay deferred until the final Stream gifts/monetization stage.",
};

function uniqueReady(items: readonly Stream115CCreatorContentTabsSectionId[]): readonly Stream115CCreatorContentTabsSectionId[] {
  return SECTION_ORDER.filter((item) => items.includes(item));
}

export function createInitialStream115CCreatorContentTabsState(): Stream115CCreatorContentTabsState {
  return {
    version: "STREAM-115C",
    selectedSectionId: "content_tabs_entry",
    readySectionIds: ["kernel_content_contract", "gifts_monetization_deferred"],
    lastAction: "115C начинает UI/UX вкладок/сетки контента профиля автора: только ядро, без фейковых просмотров/playback/подарков.",
    contentTabsEntryLocal: false,
    liveArchiveTabLocal: false,
    shortsGridTabLocal: false,
    videoReplayTabLocal: false,
    pinnedContentLocal: false,
    categoryFilterLocal: false,
    emptyContentStateLocal: false,
    businessContentBridgeLocal: false,
    kernelContentContractLocal: true,
    giftsMonetizationDeferredLocal: true,
    allConnectionsThroughKernel: true,
    directProfileProviderAllowed: false,
    directContentProviderAllowed: false,
    directRealtimeConnectionAllowed: false,
    directShortsServiceAllowed: false,
    directVideoProviderAllowed: false,
    directBusinessProviderAllowed: false,
    directWalletConnectionAllowed: false,
    directGiftPaymentAllowed: false,
    profileBackendTouchedNow: false,
    contentBackendTouchedNow: false,
    shortsBackendTouchedNow: false,
    videoBackendTouchedNow: false,
    businessBackendTouchedNow: false,
    walletTouchedNow: false,
    messengerTouchedNow: false,
    mainAiTouchedNow: false,
    fakeViewsAllowed: false,
    fakeLikeCountAllowed: false,
    fakeFollowerCountAllowed: false,
    fakeVideoUploadAllowed: false,
    fakeReplayPlaybackAllowed: false,
    fakeShortsPlaybackAllowed: false,
    fakeBusinessLeadAllowed: false,
    fakeMonetizationAllowed: false,
    fakePaymentAllowed: false,
    fakeGiftSendingAllowed: false,
    giftSendingImplementedNow: false,
    monetizationImplementedNow: false,
  };
}

function setReadyFlag(state: Stream115CCreatorContentTabsState, sectionId: Stream115CCreatorContentTabsSectionId): Stream115CCreatorContentTabsState {
  return {
    ...state,
    contentTabsEntryLocal: state.contentTabsEntryLocal || sectionId === "content_tabs_entry",
    liveArchiveTabLocal: state.liveArchiveTabLocal || sectionId === "live_archive_tab",
    shortsGridTabLocal: state.shortsGridTabLocal || sectionId === "shorts_grid_tab",
    videoReplayTabLocal: state.videoReplayTabLocal || sectionId === "video_replay_tab",
    pinnedContentLocal: state.pinnedContentLocal || sectionId === "pinned_content",
    categoryFilterLocal: state.categoryFilterLocal || sectionId === "category_filter",
    emptyContentStateLocal: state.emptyContentStateLocal || sectionId === "empty_content_state",
    businessContentBridgeLocal: state.businessContentBridgeLocal || sectionId === "business_content_bridge",
    kernelContentContractLocal: state.kernelContentContractLocal || sectionId === "kernel_content_contract",
    giftsMonetizationDeferredLocal: state.giftsMonetizationDeferredLocal || sectionId === "gifts_monetization_deferred",
  };
}

export function selectStream115CCreatorContentTabsSection(state: Stream115CCreatorContentTabsState, sectionId: Stream115CCreatorContentTabsSectionId): Stream115CCreatorContentTabsState {
  return {
    ...state,
    selectedSectionId: sectionId,
    lastAction: `115C selected ${SECTION_TITLES[sectionId]} for creator profile content tabs/grid UI/UX.`,
  };
}

export function markStream115CCreatorContentTabsSectionReady(state: Stream115CCreatorContentTabsState, sectionId: Stream115CCreatorContentTabsSectionId, action: string): Stream115CCreatorContentTabsState {
  const next = setReadyFlag(state, sectionId);
  return {
    ...next,
    selectedSectionId: sectionId,
    readySectionIds: uniqueReady([...next.readySectionIds, sectionId]),
    lastAction: action,
  };
}

export function markStream115CCreatorContentTabsAllReady(state: Stream115CCreatorContentTabsState, action: string): Stream115CCreatorContentTabsState {
  return {
    ...state,
    selectedSectionId: "gifts_monetization_deferred",
    readySectionIds: SECTION_ORDER,
    contentTabsEntryLocal: true,
    liveArchiveTabLocal: true,
    shortsGridTabLocal: true,
    videoReplayTabLocal: true,
    pinnedContentLocal: true,
    categoryFilterLocal: true,
    emptyContentStateLocal: true,
    businessContentBridgeLocal: true,
    kernelContentContractLocal: true,
    giftsMonetizationDeferredLocal: true,
    lastAction: action,
  };
}

export function buildStream115CCreatorContentTabsEvidence(
  state: Stream115CCreatorContentTabsState,
  room: StreamRoomRuntimeState,
  stage: StreamRoomStageRuntimeState,
  officialStreamerSetupEvidence: Stream115BOfficialStreamerSetupEvidence,
): Stream115CCreatorContentTabsEvidence {
  const readySectionIds = uniqueReady(state.readySectionIds);
  const officialStreamerSetupReady = officialStreamerSetupEvidence.officialStreamerSetupUiuxReady
    && officialStreamerSetupEvidence.allConnectionsThroughKernel
    && officialStreamerSetupEvidence.fakeOfficialVerificationAllowed === false
    && officialStreamerSetupEvidence.fakeMonetizationAllowed === false
    && officialStreamerSetupEvidence.fakeGiftSendingAllowed === false;

  const contentTabsEntryReady = state.contentTabsEntryLocal && officialStreamerSetupReady;
  const liveArchiveTabReady = state.liveArchiveTabLocal && state.fakeReplayPlaybackAllowed === false && stage.status === "broadcast_handoff_blocked";
  const shortsGridTabReady = state.shortsGridTabLocal && state.directShortsServiceAllowed === false && state.fakeShortsPlaybackAllowed === false;
  const videoReplayTabReady = state.videoReplayTabLocal && state.directVideoProviderAllowed === false && state.fakeVideoUploadAllowed === false;
  const pinnedContentReady = state.pinnedContentLocal && state.fakeViewsAllowed === false && state.fakeLikeCountAllowed === false;
  const categoryFilterReady = state.categoryFilterLocal && officialStreamerSetupEvidence.categorySetupReady;
  const emptyContentStateReady = state.emptyContentStateLocal && state.fakeViewsAllowed === false && state.fakeFollowerCountAllowed === false;
  const businessContentBridgeReady = state.businessContentBridgeLocal && state.businessBackendTouchedNow === false && state.fakeBusinessLeadAllowed === false;
  const kernelContentContractReady = state.kernelContentContractLocal && state.allConnectionsThroughKernel && officialStreamerSetupEvidence.allConnectionsThroughKernel;
  const giftsMonetizationDeferredReady = state.giftsMonetizationDeferredLocal && state.giftSendingImplementedNow === false && state.monetizationImplementedNow === false;
  const fakeSafetyReady = state.fakeViewsAllowed === false
    && state.fakeLikeCountAllowed === false
    && state.fakeFollowerCountAllowed === false
    && state.fakeVideoUploadAllowed === false
    && state.fakeReplayPlaybackAllowed === false
    && state.fakeShortsPlaybackAllowed === false
    && state.fakeBusinessLeadAllowed === false
    && state.fakeMonetizationAllowed === false
    && state.fakePaymentAllowed === false
    && state.fakeGiftSendingAllowed === false;
  const readyFlags = [
    contentTabsEntryReady,
    liveArchiveTabReady,
    shortsGridTabReady,
    videoReplayTabReady,
    pinnedContentReady,
    categoryFilterReady,
    emptyContentStateReady,
    businessContentBridgeReady,
    kernelContentContractReady,
    giftsMonetizationDeferredReady,
  ];
  const readySections = readyFlags.filter(Boolean).length;
  const creatorContentTabsUiuxReady = readyFlags.every(Boolean) && fakeSafetyReady;
  const sectionItems = SECTION_ORDER.map((id): Stream115CCreatorContentTabsSection => ({
    id,
    title: SECTION_TITLES[id],
    description: SECTION_DESCRIPTIONS[id],
    status: readySectionIds.includes(id) ? "ready" : "needs_polish",
  }));
  const roomTitle = room.title || "Sabi Stream";
  return {
    version: "STREAM-115C",
    selectedSectionId: state.selectedSectionId,
    contentTabsScore: Math.round((readySections / SECTION_ORDER.length) * 100),
    readySections,
    totalSections: SECTION_ORDER.length,
    sectionItems,
    heroTitle: creatorContentTabsUiuxReady ? "Вкладки контента автора готовы как UI/UX" : "Доведи контент профиля без фейковых метрик",
    heroSubtitle: `${roomTitle}: Live / Shorts / видео / категории / закреплённый контент остаются только через ядро. Без фейковых просмотров, playback, подписчиков, монетизации или подарков.`,
    phoneStatus: creatorContentTabsUiuxReady ? "Контент автора готов · только ядро" : "Проверка контента автора",
    primaryAction: "Собрать вкладки профиля: Live, Shorts, видео, закреплённый контент, категории, пустые состояния и бизнес-связку.",
    secondaryAction: creatorContentTabsUiuxReady ? "Следующий этап: 115D действия профиля автора / граница подписки-поделиться-сообщений UI/UX." : "Закрой разделы контента без фейковых просмотров, playback, подписчиков, монетизации и без реализации подарков/платежей.",
    officialStreamerSetupReady,
    contentTabsEntryReady,
    liveArchiveTabReady,
    shortsGridTabReady,
    videoReplayTabReady,
    pinnedContentReady,
    categoryFilterReady,
    emptyContentStateReady,
    businessContentBridgeReady,
    kernelContentContractReady,
    giftsMonetizationDeferredReady,
    creatorContentTabsUiuxReady,
    nextProfilePolishReady: creatorContentTabsUiuxReady,
    allConnectionsThroughKernel: true,
    directProfileProviderAllowed: false,
    directContentProviderAllowed: false,
    directRealtimeConnectionAllowed: false,
    directShortsServiceAllowed: false,
    directVideoProviderAllowed: false,
    directBusinessProviderAllowed: false,
    directWalletConnectionAllowed: false,
    directGiftPaymentAllowed: false,
    profileBackendTouchedNow: false,
    contentBackendTouchedNow: false,
    shortsBackendTouchedNow: false,
    videoBackendTouchedNow: false,
    businessBackendTouchedNow: false,
    walletTouchedNow: false,
    messengerTouchedNow: false,
    mainAiTouchedNow: false,
    fakeViewsAllowed: false,
    fakeLikeCountAllowed: false,
    fakeFollowerCountAllowed: false,
    fakeVideoUploadAllowed: false,
    fakeReplayPlaybackAllowed: false,
    fakeShortsPlaybackAllowed: false,
    fakeBusinessLeadAllowed: false,
    fakeMonetizationAllowed: false,
    fakePaymentAllowed: false,
    fakeGiftSendingAllowed: false,
    giftSendingImplementedNow: false,
    monetizationImplementedNow: false,
  };
}
