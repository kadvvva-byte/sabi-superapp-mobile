import type { StreamRoomRuntimeState } from "./streamRoomRuntime";
import type { Stream116FShortsCreationFlowEvidence } from "./stream116fShortsCreationFlowKernelUiuxRuntime";

export type Stream116GShortsFinalAcceptanceSectionId =
  | "premium_product_surface"
  | "feed_player_ready"
  | "creation_editor_ready"
  | "comments_moderation_ready"
  | "publish_gate_ready"
  | "creator_business_bridge"
  | "kernel_only_contract"
  | "no_fake_counters"
  | "gifts_monetization_deferred"
  | "stream_next_handoff";

export type Stream116GShortsFinalAcceptanceStatus = "ready" | "needs_polish";

export type Stream116GShortsFinalAcceptanceSection = {
  readonly id: Stream116GShortsFinalAcceptanceSectionId;
  readonly title: string;
  readonly description: string;
  readonly status: Stream116GShortsFinalAcceptanceStatus;
};

export type Stream116GShortsFinalAcceptanceState = {
  readonly version: "STREAM-116G";
  readonly selectedSectionId: Stream116GShortsFinalAcceptanceSectionId;
  readonly readySectionIds: readonly Stream116GShortsFinalAcceptanceSectionId[];
  readonly lastAction: string;
  readonly premiumProductSurfaceLocal: boolean;
  readonly feedPlayerReadyLocal: boolean;
  readonly creationEditorReadyLocal: boolean;
  readonly commentsModerationReadyLocal: boolean;
  readonly publishGateReadyLocal: boolean;
  readonly creatorBusinessBridgeLocal: boolean;
  readonly kernelOnlyContractLocal: boolean;
  readonly noFakeCountersLocal: boolean;
  readonly giftsMonetizationDeferredLocal: boolean;
  readonly streamNextHandoffLocal: boolean;
  readonly allConnectionsThroughKernel: true;
  readonly directFeedProviderAllowed: false;
  readonly directPlaybackProviderAllowed: false;
  readonly directEditorProviderAllowed: false;
  readonly directUploadProviderAllowed: false;
  readonly directProfileProviderAllowed: false;
  readonly directBusinessProviderAllowed: false;
  readonly directWalletConnectionAllowed: false;
  readonly directGiftPaymentAllowed: false;
  readonly feedBackendTouchedNow: false;
  readonly playbackBackendTouchedNow: false;
  readonly editorBackendTouchedNow: false;
  readonly uploadBackendTouchedNow: false;
  readonly profileBackendTouchedNow: false;
  readonly businessBackendTouchedNow: false;
  readonly walletTouchedNow: false;
  readonly messengerTouchedNow: false;
  readonly mainAiTouchedNow: false;
  readonly fakeFeedLoadedAllowed: false;
  readonly fakePlaybackAllowed: false;
  readonly fakeAutoplayAllowed: false;
  readonly fakeEditorOutputAllowed: false;
  readonly fakeUploadAllowed: false;
  readonly fakePublishAllowed: false;
  readonly fakeViewsAllowed: false;
  readonly fakeLikesAllowed: false;
  readonly fakeCommentsAllowed: false;
  readonly fakeAnalyticsAllowed: false;
  readonly fakeMonetizationAllowed: false;
  readonly fakePaymentAllowed: false;
  readonly fakeGiftSendingAllowed: false;
  readonly giftSendingImplementedNow: false;
  readonly monetizationImplementedNow: false;
};

export type Stream116GShortsFinalAcceptanceEvidence = {
  readonly version: "STREAM-116G";
  readonly selectedSectionId: Stream116GShortsFinalAcceptanceSectionId;
  readonly acceptanceScore: number;
  readonly readySections: number;
  readonly totalSections: number;
  readonly sectionItems: readonly Stream116GShortsFinalAcceptanceSection[];
  readonly heroTitle: string;
  readonly heroSubtitle: string;
  readonly phoneStatus: string;
  readonly primaryAction: string;
  readonly secondaryAction: string;
  readonly creationFlowReady: boolean;
  readonly premiumProductSurfaceReady: boolean;
  readonly feedPlayerReady: boolean;
  readonly creationEditorReady: boolean;
  readonly commentsModerationReady: boolean;
  readonly publishGateReady: boolean;
  readonly creatorBusinessBridgeReady: boolean;
  readonly kernelOnlyContractReady: boolean;
  readonly noFakeCountersReady: boolean;
  readonly giftsMonetizationDeferredReady: boolean;
  readonly streamNextHandoffReady: boolean;
  readonly shortsFinalAcceptanceUiuxReady: boolean;
  readonly nextStreamOverallAcceptanceReady: boolean;
  readonly allConnectionsThroughKernel: true;
  readonly directFeedProviderAllowed: false;
  readonly directPlaybackProviderAllowed: false;
  readonly directEditorProviderAllowed: false;
  readonly directUploadProviderAllowed: false;
  readonly directProfileProviderAllowed: false;
  readonly directBusinessProviderAllowed: false;
  readonly directWalletConnectionAllowed: false;
  readonly directGiftPaymentAllowed: false;
  readonly feedBackendTouchedNow: false;
  readonly playbackBackendTouchedNow: false;
  readonly editorBackendTouchedNow: false;
  readonly uploadBackendTouchedNow: false;
  readonly profileBackendTouchedNow: false;
  readonly businessBackendTouchedNow: false;
  readonly walletTouchedNow: false;
  readonly messengerTouchedNow: false;
  readonly mainAiTouchedNow: false;
  readonly fakeFeedLoadedAllowed: false;
  readonly fakePlaybackAllowed: false;
  readonly fakeAutoplayAllowed: false;
  readonly fakeEditorOutputAllowed: false;
  readonly fakeUploadAllowed: false;
  readonly fakePublishAllowed: false;
  readonly fakeViewsAllowed: false;
  readonly fakeLikesAllowed: false;
  readonly fakeCommentsAllowed: false;
  readonly fakeAnalyticsAllowed: false;
  readonly fakeMonetizationAllowed: false;
  readonly fakePaymentAllowed: false;
  readonly fakeGiftSendingAllowed: false;
  readonly giftSendingImplementedNow: false;
  readonly monetizationImplementedNow: false;
};

const SECTION_COPY: Record<Stream116GShortsFinalAcceptanceSectionId, { title: string; description: string }> = {
  premium_product_surface: {
    title: "Премиальная продуктовая поверхность",
    description: "Shorts теперь выглядит как единый чистый продуктовый поток, а не отдельные QA-панели.",
  },
  feed_player_ready: {
    title: "Лента / плеер готовы",
    description: "Лента viewer, overlay плеера, swipe path, действия и безопасные empty-states сгруппированы чисто.",
  },
  creation_editor_ready: {
    title: "Создание / редактор готовы",
    description: "Камера/галерея, обрезка, эффекты, MP3/музыка, подпись, обложка и приватность — единый путь создания.",
  },
  comments_moderation_ready: {
    title: "Комментарии + модерация готовы",
    description: "Комментарии, ответы, реакции, жалобы, 18+, 25 языков и Sabi AI guard имеют чистые UI-границы.",
  },
  publish_gate_ready: {
    title: "Publish gate готов",
    description: "Upload и publish показаны как kernel gates без имитации success или playback.",
  },
  creator_business_bridge: {
    title: "Связь Creator / Business",
    description: "Shorts связывается с профилем автора и Business Stream context вовремя только через kernel.",
  },
  kernel_only_contract: {
    title: "Контракт только через kernel",
    description: "Лента, плеер, редактор, publish, profile, business, gifts и monetization должны использовать core/kernel facades/events.",
  },
  no_fake_counters: {
    title: "Без имитации счётчиков",
    description: "Views, likes, comments, analytics, playback, upload и publish не изображают backend/provider success.",
  },
  gifts_monetization_deferred: {
    title: "Подарки позже",
    description: "Gift sending and monetization remain strictly deferred until the final Stream gift stage.",
  },
  stream_next_handoff: {
    title: "Передача Stream",
    description: "После приёмки Shorts следующий проход может закрыть общий UI/UX Stream перед gifts/монетизацией.",
  },
};

const ALL_SECTIONS: readonly Stream116GShortsFinalAcceptanceSectionId[] = [
  "premium_product_surface",
  "feed_player_ready",
  "creation_editor_ready",
  "comments_moderation_ready",
  "publish_gate_ready",
  "creator_business_bridge",
  "kernel_only_contract",
  "no_fake_counters",
  "gifts_monetization_deferred",
  "stream_next_handoff",
];

const FIELD_BY_SECTION: Record<Stream116GShortsFinalAcceptanceSectionId, keyof Pick<
  Stream116GShortsFinalAcceptanceState,
  | "premiumProductSurfaceLocal"
  | "feedPlayerReadyLocal"
  | "creationEditorReadyLocal"
  | "commentsModerationReadyLocal"
  | "publishGateReadyLocal"
  | "creatorBusinessBridgeLocal"
  | "kernelOnlyContractLocal"
  | "noFakeCountersLocal"
  | "giftsMonetizationDeferredLocal"
  | "streamNextHandoffLocal"
>> = {
  premium_product_surface: "premiumProductSurfaceLocal",
  feed_player_ready: "feedPlayerReadyLocal",
  creation_editor_ready: "creationEditorReadyLocal",
  comments_moderation_ready: "commentsModerationReadyLocal",
  publish_gate_ready: "publishGateReadyLocal",
  creator_business_bridge: "creatorBusinessBridgeLocal",
  kernel_only_contract: "kernelOnlyContractLocal",
  no_fake_counters: "noFakeCountersLocal",
  gifts_monetization_deferred: "giftsMonetizationDeferredLocal",
  stream_next_handoff: "streamNextHandoffLocal",
};

function uniqueSectionIds(sectionIds: readonly Stream116GShortsFinalAcceptanceSectionId[]): readonly Stream116GShortsFinalAcceptanceSectionId[] {
  return Array.from(new Set(sectionIds));
}

export function createInitialStream116GShortsFinalAcceptanceState(): Stream116GShortsFinalAcceptanceState {
  return {
    version: "STREAM-116G",
    selectedSectionId: "premium_product_surface",
    readySectionIds: [],
    lastAction: "Финальная приёмка Shorts ждёт финальный product cleanup pass.",
    premiumProductSurfaceLocal: false,
    feedPlayerReadyLocal: false,
    creationEditorReadyLocal: false,
    commentsModerationReadyLocal: false,
    publishGateReadyLocal: false,
    creatorBusinessBridgeLocal: false,
    kernelOnlyContractLocal: false,
    noFakeCountersLocal: true,
    giftsMonetizationDeferredLocal: true,
    streamNextHandoffLocal: false,
    allConnectionsThroughKernel: true,
    directFeedProviderAllowed: false,
    directPlaybackProviderAllowed: false,
    directEditorProviderAllowed: false,
    directUploadProviderAllowed: false,
    directProfileProviderAllowed: false,
    directBusinessProviderAllowed: false,
    directWalletConnectionAllowed: false,
    directGiftPaymentAllowed: false,
    feedBackendTouchedNow: false,
    playbackBackendTouchedNow: false,
    editorBackendTouchedNow: false,
    uploadBackendTouchedNow: false,
    profileBackendTouchedNow: false,
    businessBackendTouchedNow: false,
    walletTouchedNow: false,
    messengerTouchedNow: false,
    mainAiTouchedNow: false,
    fakeFeedLoadedAllowed: false,
    fakePlaybackAllowed: false,
    fakeAutoplayAllowed: false,
    fakeEditorOutputAllowed: false,
    fakeUploadAllowed: false,
    fakePublishAllowed: false,
    fakeViewsAllowed: false,
    fakeLikesAllowed: false,
    fakeCommentsAllowed: false,
    fakeAnalyticsAllowed: false,
    fakeMonetizationAllowed: false,
    fakePaymentAllowed: false,
    fakeGiftSendingAllowed: false,
    giftSendingImplementedNow: false,
    monetizationImplementedNow: false,
  };
}

export function selectStream116GShortsFinalAcceptanceSection(
  state: Stream116GShortsFinalAcceptanceState,
  sectionId: Stream116GShortsFinalAcceptanceSectionId,
): Stream116GShortsFinalAcceptanceState {
  return {
    ...state,
    selectedSectionId: sectionId,
    lastAction: `${SECTION_COPY[sectionId].title}: ${SECTION_COPY[sectionId].description}`,
  };
}

export function markStream116GShortsFinalAcceptanceSectionReady(
  state: Stream116GShortsFinalAcceptanceState,
  sectionId: Stream116GShortsFinalAcceptanceSectionId,
  action: string,
): Stream116GShortsFinalAcceptanceState {
  return {
    ...state,
    selectedSectionId: sectionId,
    readySectionIds: uniqueSectionIds([...state.readySectionIds, sectionId]),
    [FIELD_BY_SECTION[sectionId]]: true,
    lastAction: action,
  };
}

export function markStream116GShortsFinalAcceptanceAllReady(
  state: Stream116GShortsFinalAcceptanceState,
  action: string,
): Stream116GShortsFinalAcceptanceState {
  return {
    ...state,
    selectedSectionId: "stream_next_handoff",
    readySectionIds: ALL_SECTIONS,
    lastAction: action,
    premiumProductSurfaceLocal: true,
    feedPlayerReadyLocal: true,
    creationEditorReadyLocal: true,
    commentsModerationReadyLocal: true,
    publishGateReadyLocal: true,
    creatorBusinessBridgeLocal: true,
    kernelOnlyContractLocal: true,
    noFakeCountersLocal: true,
    giftsMonetizationDeferredLocal: true,
    streamNextHandoffLocal: true,
  };
}

export function buildStream116GShortsFinalAcceptanceEvidence(
  state: Stream116GShortsFinalAcceptanceState,
  room: StreamRoomRuntimeState,
  creationEvidence: Stream116FShortsCreationFlowEvidence,
): Stream116GShortsFinalAcceptanceEvidence {
  const sectionItems: Stream116GShortsFinalAcceptanceSection[] = ALL_SECTIONS.map((sectionId) => ({
    id: sectionId,
    title: SECTION_COPY[sectionId].title,
    description: SECTION_COPY[sectionId].description,
    status: state.readySectionIds.includes(sectionId) ? "ready" : "needs_polish",
  }));
  const readySections = sectionItems.filter((item) => item.status === "ready").length;
  const totalSections = sectionItems.length;
  const acceptanceScore = Math.round((readySections / totalSections) * 100);
  const creationFlowReady = creationEvidence.shortsCreationFlowUiuxReady;
  const roomHasTitle = room.title.trim().length > 0;
  const shortsFinalAcceptanceUiuxReady = creationFlowReady
    && roomHasTitle
    && acceptanceScore === 100
    && state.allConnectionsThroughKernel
    && state.directFeedProviderAllowed === false
    && state.directPlaybackProviderAllowed === false
    && state.directEditorProviderAllowed === false
    && state.directUploadProviderAllowed === false
    && state.directProfileProviderAllowed === false
    && state.directBusinessProviderAllowed === false
    && state.directWalletConnectionAllowed === false
    && state.directGiftPaymentAllowed === false
    && state.feedBackendTouchedNow === false
    && state.playbackBackendTouchedNow === false
    && state.editorBackendTouchedNow === false
    && state.uploadBackendTouchedNow === false
    && state.profileBackendTouchedNow === false
    && state.businessBackendTouchedNow === false
    && state.walletTouchedNow === false
    && state.messengerTouchedNow === false
    && state.mainAiTouchedNow === false
    && state.fakeFeedLoadedAllowed === false
    && state.fakePlaybackAllowed === false
    && state.fakeAutoplayAllowed === false
    && state.fakeEditorOutputAllowed === false
    && state.fakeUploadAllowed === false
    && state.fakePublishAllowed === false
    && state.fakeViewsAllowed === false
    && state.fakeLikesAllowed === false
    && state.fakeCommentsAllowed === false
    && state.fakeAnalyticsAllowed === false
    && state.fakeMonetizationAllowed === false
    && state.fakePaymentAllowed === false
    && state.fakeGiftSendingAllowed === false
    && state.giftSendingImplementedNow === false
    && state.monetizationImplementedNow === false;

  return {
    version: "STREAM-116G",
    selectedSectionId: state.selectedSectionId,
    acceptanceScore,
    readySections,
    totalSections,
    sectionItems,
    heroTitle: "Shorts готов как premium UI/UX путь для передачи Stream",
    heroSubtitle: "Лента/плеер, редактор, комментарии, реакции, модерация, publish gate, creator bridge и Business bridge организованы как один чистый продуктовый путь Shorts только через Stream kernel.",
    phoneStatus: shortsFinalAcceptanceUiuxReady ? "UI/UX Shorts принят" : "Финальной приёмке Shorts нужна чистка",
    primaryAction: "Используй Shorts как premium product surface, затем остановись на честных kernel gates для ленты, playback, upload, publish, counters, gifts и monetization.",
    secondaryAction: "Далее: общая финальная приёмка Stream перед финальным этапом gifts и монетизации.",
    creationFlowReady,
    premiumProductSurfaceReady: state.premiumProductSurfaceLocal,
    feedPlayerReady: state.feedPlayerReadyLocal,
    creationEditorReady: state.creationEditorReadyLocal,
    commentsModerationReady: state.commentsModerationReadyLocal,
    publishGateReady: state.publishGateReadyLocal,
    creatorBusinessBridgeReady: state.creatorBusinessBridgeLocal,
    kernelOnlyContractReady: state.kernelOnlyContractLocal,
    noFakeCountersReady: state.noFakeCountersLocal,
    giftsMonetizationDeferredReady: state.giftsMonetizationDeferredLocal,
    streamNextHandoffReady: state.streamNextHandoffLocal,
    shortsFinalAcceptanceUiuxReady,
    nextStreamOverallAcceptanceReady: shortsFinalAcceptanceUiuxReady,
    allConnectionsThroughKernel: true,
    directFeedProviderAllowed: false,
    directPlaybackProviderAllowed: false,
    directEditorProviderAllowed: false,
    directUploadProviderAllowed: false,
    directProfileProviderAllowed: false,
    directBusinessProviderAllowed: false,
    directWalletConnectionAllowed: false,
    directGiftPaymentAllowed: false,
    feedBackendTouchedNow: false,
    playbackBackendTouchedNow: false,
    editorBackendTouchedNow: false,
    uploadBackendTouchedNow: false,
    profileBackendTouchedNow: false,
    businessBackendTouchedNow: false,
    walletTouchedNow: false,
    messengerTouchedNow: false,
    mainAiTouchedNow: false,
    fakeFeedLoadedAllowed: false,
    fakePlaybackAllowed: false,
    fakeAutoplayAllowed: false,
    fakeEditorOutputAllowed: false,
    fakeUploadAllowed: false,
    fakePublishAllowed: false,
    fakeViewsAllowed: false,
    fakeLikesAllowed: false,
    fakeCommentsAllowed: false,
    fakeAnalyticsAllowed: false,
    fakeMonetizationAllowed: false,
    fakePaymentAllowed: false,
    fakeGiftSendingAllowed: false,
    giftSendingImplementedNow: false,
    monetizationImplementedNow: false,
  };
}
