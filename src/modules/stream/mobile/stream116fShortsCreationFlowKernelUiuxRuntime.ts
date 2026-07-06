import type { StreamRoomRuntimeState } from "./streamRoomRuntime";
import type { Stream116EShortsCommentsReactionsEvidence } from "./stream116eShortsCommentsReactionsModerationKernelUiuxRuntime";

export type Stream116FShortsCreationFlowSectionId =
  | "capture_gallery_entry"
  | "clip_trim_flow"
  | "effects_music_review"
  | "caption_cover_review"
  | "privacy_safety_gate"
  | "creator_business_bridge"
  | "kernel_creation_contract"
  | "upload_publish_blocked"
  | "analytics_counters_blocked"
  | "gifts_monetization_deferred";

export type Stream116FShortsCreationFlowStatus = "ready" | "needs_polish";

export type Stream116FShortsCreationFlowSection = {
  readonly id: Stream116FShortsCreationFlowSectionId;
  readonly title: string;
  readonly description: string;
  readonly status: Stream116FShortsCreationFlowStatus;
};

export type Stream116FShortsCreationFlowState = {
  readonly version: "STREAM-116F";
  readonly selectedSectionId: Stream116FShortsCreationFlowSectionId;
  readonly readySectionIds: readonly Stream116FShortsCreationFlowSectionId[];
  readonly lastAction: string;
  readonly captureGalleryEntryLocal: boolean;
  readonly clipTrimFlowLocal: boolean;
  readonly effectsMusicReviewLocal: boolean;
  readonly captionCoverReviewLocal: boolean;
  readonly privacySafetyGateLocal: boolean;
  readonly creatorBusinessBridgeLocal: boolean;
  readonly kernelCreationContractLocal: boolean;
  readonly uploadPublishBlockedLocal: boolean;
  readonly analyticsCountersBlockedLocal: boolean;
  readonly giftsMonetizationDeferredLocal: boolean;
  readonly allConnectionsThroughKernel: true;
  readonly directCameraProviderAllowed: false;
  readonly directGalleryProviderAllowed: false;
  readonly directEffectsProviderAllowed: false;
  readonly directMusicProviderAllowed: false;
  readonly directUploadProviderAllowed: false;
  readonly directPlaybackProviderAllowed: false;
  readonly directAnalyticsProviderAllowed: false;
  readonly directProfileProviderAllowed: false;
  readonly directBusinessProviderAllowed: false;
  readonly directWalletConnectionAllowed: false;
  readonly directGiftPaymentAllowed: false;
  readonly cameraBackendTouchedNow: false;
  readonly galleryBackendTouchedNow: false;
  readonly effectsBackendTouchedNow: false;
  readonly musicBackendTouchedNow: false;
  readonly uploadBackendTouchedNow: false;
  readonly playbackBackendTouchedNow: false;
  readonly analyticsBackendTouchedNow: false;
  readonly walletTouchedNow: false;
  readonly messengerTouchedNow: false;
  readonly mainAiTouchedNow: false;
  readonly fakeCameraCaptureAllowed: false;
  readonly fakeGalleryImportAllowed: false;
  readonly fakeClipTrimAllowed: false;
  readonly fakeEffectRenderedAllowed: false;
  readonly fakeMusicInsertedAllowed: false;
  readonly fakeCaptionSavedAllowed: false;
  readonly fakeCoverGeneratedAllowed: false;
  readonly fakeUploadAllowed: false;
  readonly fakePublishAllowed: false;
  readonly fakePlaybackAllowed: false;
  readonly fakeViewsAllowed: false;
  readonly fakeLikesAllowed: false;
  readonly fakeAnalyticsAllowed: false;
  readonly fakeMonetizationAllowed: false;
  readonly fakePaymentAllowed: false;
  readonly fakeGiftSendingAllowed: false;
  readonly giftSendingImplementedNow: false;
  readonly monetizationImplementedNow: false;
};

export type Stream116FShortsCreationFlowEvidence = {
  readonly version: "STREAM-116F";
  readonly selectedSectionId: Stream116FShortsCreationFlowSectionId;
  readonly creationScore: number;
  readonly readySections: number;
  readonly totalSections: number;
  readonly sectionItems: readonly Stream116FShortsCreationFlowSection[];
  readonly heroTitle: string;
  readonly heroSubtitle: string;
  readonly phoneStatus: string;
  readonly primaryAction: string;
  readonly secondaryAction: string;
  readonly commentsReactionsReady: boolean;
  readonly captureGalleryEntryReady: boolean;
  readonly clipTrimFlowReady: boolean;
  readonly effectsMusicReviewReady: boolean;
  readonly captionCoverReviewReady: boolean;
  readonly privacySafetyGateReady: boolean;
  readonly creatorBusinessBridgeReady: boolean;
  readonly kernelCreationContractReady: boolean;
  readonly uploadPublishBlockedReady: boolean;
  readonly analyticsCountersBlockedReady: boolean;
  readonly giftsMonetizationDeferredReady: boolean;
  readonly shortsCreationFlowUiuxReady: boolean;
  readonly nextShortsAcceptanceReady: boolean;
  readonly allConnectionsThroughKernel: true;
  readonly directCameraProviderAllowed: false;
  readonly directGalleryProviderAllowed: false;
  readonly directEffectsProviderAllowed: false;
  readonly directMusicProviderAllowed: false;
  readonly directUploadProviderAllowed: false;
  readonly directPlaybackProviderAllowed: false;
  readonly directAnalyticsProviderAllowed: false;
  readonly directProfileProviderAllowed: false;
  readonly directBusinessProviderAllowed: false;
  readonly directWalletConnectionAllowed: false;
  readonly directGiftPaymentAllowed: false;
  readonly cameraBackendTouchedNow: false;
  readonly galleryBackendTouchedNow: false;
  readonly effectsBackendTouchedNow: false;
  readonly musicBackendTouchedNow: false;
  readonly uploadBackendTouchedNow: false;
  readonly playbackBackendTouchedNow: false;
  readonly analyticsBackendTouchedNow: false;
  readonly walletTouchedNow: false;
  readonly messengerTouchedNow: false;
  readonly mainAiTouchedNow: false;
  readonly fakeCameraCaptureAllowed: false;
  readonly fakeGalleryImportAllowed: false;
  readonly fakeClipTrimAllowed: false;
  readonly fakeEffectRenderedAllowed: false;
  readonly fakeMusicInsertedAllowed: false;
  readonly fakeCaptionSavedAllowed: false;
  readonly fakeCoverGeneratedAllowed: false;
  readonly fakeUploadAllowed: false;
  readonly fakePublishAllowed: false;
  readonly fakePlaybackAllowed: false;
  readonly fakeViewsAllowed: false;
  readonly fakeLikesAllowed: false;
  readonly fakeAnalyticsAllowed: false;
  readonly fakeMonetizationAllowed: false;
  readonly fakePaymentAllowed: false;
  readonly fakeGiftSendingAllowed: false;
  readonly giftSendingImplementedNow: false;
  readonly monetizationImplementedNow: false;
};

const SECTION_COPY: Record<Stream116FShortsCreationFlowSectionId, { title: string; description: string }> = {
  capture_gallery_entry: {
    title: "Камера / галерея",
    description: "Создание начинается с ясного выбора capture/import, но реальный доступ к media ждёт kernel/provider.",
  },
  clip_trim_flow: {
    title: "Обрезка",
    description: "Обрезка организована как premium editor intent без имитации резки или сохранённого output.",
  },
  effects_music_review: {
    title: "Проверка эффектов + музыки",
    description: "Эффекты и MP3/музыка проверяются вместе с видимыми границами лицензии/provider.",
  },
  caption_cover_review: {
    title: "Подпись + обложка",
    description: "Подпись, обложка и финальный preview — чистые UI-шаги без имитации сохранения или generated thumbnail.",
  },
  privacy_safety_gate: {
    title: "Приватность + безопасность",
    description: "Видимость, 18+, язык и Sabi AI moderation проверяются перед намерением публикации.",
  },
  creator_business_bridge: {
    title: "Связь Creator / Business",
    description: "Создание Shorts знает профиль автора и контекст Business Stream без прямых backend-вызовов.",
  },
  kernel_creation_contract: {
    title: "Контракт создания kernel",
    description: "Capture, import, edit, music, safety, upload и publish должны идти через Stream kernel.",
  },
  upload_publish_blocked: {
    title: "Загрузка / публикация заблокированы",
    description: "Upload и publish остаются заблокированными до реальной backend/provider работы.",
  },
  analytics_counters_blocked: {
    title: "Без имитации аналитики",
    description: "Views, likes, playback и counters остаются заблокированными до реальной feed/playback analytics.",
  },
  gifts_monetization_deferred: {
    title: "Подарки позже",
    description: "Gift sending and monetization remain deferred until the final Stream gift stage.",
  },
};

const ALL_SECTIONS: readonly Stream116FShortsCreationFlowSectionId[] = [
  "capture_gallery_entry",
  "clip_trim_flow",
  "effects_music_review",
  "caption_cover_review",
  "privacy_safety_gate",
  "creator_business_bridge",
  "kernel_creation_contract",
  "upload_publish_blocked",
  "analytics_counters_blocked",
  "gifts_monetization_deferred",
];

const FIELD_BY_SECTION: Record<Stream116FShortsCreationFlowSectionId, keyof Pick<
  Stream116FShortsCreationFlowState,
  | "captureGalleryEntryLocal"
  | "clipTrimFlowLocal"
  | "effectsMusicReviewLocal"
  | "captionCoverReviewLocal"
  | "privacySafetyGateLocal"
  | "creatorBusinessBridgeLocal"
  | "kernelCreationContractLocal"
  | "uploadPublishBlockedLocal"
  | "analyticsCountersBlockedLocal"
  | "giftsMonetizationDeferredLocal"
>> = {
  capture_gallery_entry: "captureGalleryEntryLocal",
  clip_trim_flow: "clipTrimFlowLocal",
  effects_music_review: "effectsMusicReviewLocal",
  caption_cover_review: "captionCoverReviewLocal",
  privacy_safety_gate: "privacySafetyGateLocal",
  creator_business_bridge: "creatorBusinessBridgeLocal",
  kernel_creation_contract: "kernelCreationContractLocal",
  upload_publish_blocked: "uploadPublishBlockedLocal",
  analytics_counters_blocked: "analyticsCountersBlockedLocal",
  gifts_monetization_deferred: "giftsMonetizationDeferredLocal",
};

function uniqueSectionIds(sectionIds: readonly Stream116FShortsCreationFlowSectionId[]): readonly Stream116FShortsCreationFlowSectionId[] {
  return Array.from(new Set(sectionIds));
}

export function createInitialStream116FShortsCreationFlowState(): Stream116FShortsCreationFlowState {
  return {
    version: "STREAM-116F",
    selectedSectionId: "capture_gallery_entry",
    readySectionIds: [],
    lastAction: "Поток создания Shorts ждёт финальную premium UI/UX чистку.",
    captureGalleryEntryLocal: false,
    clipTrimFlowLocal: false,
    effectsMusicReviewLocal: false,
    captionCoverReviewLocal: false,
    privacySafetyGateLocal: false,
    creatorBusinessBridgeLocal: false,
    kernelCreationContractLocal: false,
    uploadPublishBlockedLocal: true,
    analyticsCountersBlockedLocal: true,
    giftsMonetizationDeferredLocal: true,
    allConnectionsThroughKernel: true,
    directCameraProviderAllowed: false,
    directGalleryProviderAllowed: false,
    directEffectsProviderAllowed: false,
    directMusicProviderAllowed: false,
    directUploadProviderAllowed: false,
    directPlaybackProviderAllowed: false,
    directAnalyticsProviderAllowed: false,
    directProfileProviderAllowed: false,
    directBusinessProviderAllowed: false,
    directWalletConnectionAllowed: false,
    directGiftPaymentAllowed: false,
    cameraBackendTouchedNow: false,
    galleryBackendTouchedNow: false,
    effectsBackendTouchedNow: false,
    musicBackendTouchedNow: false,
    uploadBackendTouchedNow: false,
    playbackBackendTouchedNow: false,
    analyticsBackendTouchedNow: false,
    walletTouchedNow: false,
    messengerTouchedNow: false,
    mainAiTouchedNow: false,
    fakeCameraCaptureAllowed: false,
    fakeGalleryImportAllowed: false,
    fakeClipTrimAllowed: false,
    fakeEffectRenderedAllowed: false,
    fakeMusicInsertedAllowed: false,
    fakeCaptionSavedAllowed: false,
    fakeCoverGeneratedAllowed: false,
    fakeUploadAllowed: false,
    fakePublishAllowed: false,
    fakePlaybackAllowed: false,
    fakeViewsAllowed: false,
    fakeLikesAllowed: false,
    fakeAnalyticsAllowed: false,
    fakeMonetizationAllowed: false,
    fakePaymentAllowed: false,
    fakeGiftSendingAllowed: false,
    giftSendingImplementedNow: false,
    monetizationImplementedNow: false,
  };
}

export function selectStream116FShortsCreationFlowSection(
  state: Stream116FShortsCreationFlowState,
  sectionId: Stream116FShortsCreationFlowSectionId,
): Stream116FShortsCreationFlowState {
  return {
    ...state,
    selectedSectionId: sectionId,
    lastAction: `${SECTION_COPY[sectionId].title}: ${SECTION_COPY[sectionId].description}`,
  };
}

export function markStream116FShortsCreationFlowSectionReady(
  state: Stream116FShortsCreationFlowState,
  sectionId: Stream116FShortsCreationFlowSectionId,
  action: string,
): Stream116FShortsCreationFlowState {
  return {
    ...state,
    selectedSectionId: sectionId,
    readySectionIds: uniqueSectionIds([...state.readySectionIds, sectionId]),
    [FIELD_BY_SECTION[sectionId]]: true,
    lastAction: action,
  };
}

export function markStream116FShortsCreationFlowAllReady(
  state: Stream116FShortsCreationFlowState,
  action: string,
): Stream116FShortsCreationFlowState {
  return {
    ...state,
    selectedSectionId: "kernel_creation_contract",
    readySectionIds: ALL_SECTIONS,
    lastAction: action,
    captureGalleryEntryLocal: true,
    clipTrimFlowLocal: true,
    effectsMusicReviewLocal: true,
    captionCoverReviewLocal: true,
    privacySafetyGateLocal: true,
    creatorBusinessBridgeLocal: true,
    kernelCreationContractLocal: true,
    uploadPublishBlockedLocal: true,
    analyticsCountersBlockedLocal: true,
    giftsMonetizationDeferredLocal: true,
  };
}

export function buildStream116FShortsCreationFlowEvidence(
  state: Stream116FShortsCreationFlowState,
  room: StreamRoomRuntimeState,
  commentsEvidence: Stream116EShortsCommentsReactionsEvidence,
): Stream116FShortsCreationFlowEvidence {
  const sectionItems: Stream116FShortsCreationFlowSection[] = ALL_SECTIONS.map((sectionId) => ({
    id: sectionId,
    title: SECTION_COPY[sectionId].title,
    description: SECTION_COPY[sectionId].description,
    status: state.readySectionIds.includes(sectionId) ? "ready" : "needs_polish",
  }));
  const readySections = sectionItems.filter((item) => item.status === "ready").length;
  const totalSections = sectionItems.length;
  const creationScore = Math.round((readySections / totalSections) * 100);
  const commentsReactionsReady = commentsEvidence.shortsCommentsReactionsUiuxReady;
  const roomHasTitle = room.title.trim().length > 0;
  const shortsCreationFlowUiuxReady = commentsReactionsReady
    && roomHasTitle
    && creationScore === 100
    && state.allConnectionsThroughKernel
    && state.directCameraProviderAllowed === false
    && state.directGalleryProviderAllowed === false
    && state.directEffectsProviderAllowed === false
    && state.directMusicProviderAllowed === false
    && state.directUploadProviderAllowed === false
    && state.directPlaybackProviderAllowed === false
    && state.directAnalyticsProviderAllowed === false
    && state.directGiftPaymentAllowed === false
    && state.cameraBackendTouchedNow === false
    && state.galleryBackendTouchedNow === false
    && state.effectsBackendTouchedNow === false
    && state.musicBackendTouchedNow === false
    && state.uploadBackendTouchedNow === false
    && state.playbackBackendTouchedNow === false
    && state.analyticsBackendTouchedNow === false
    && state.walletTouchedNow === false
    && state.fakeCameraCaptureAllowed === false
    && state.fakeGalleryImportAllowed === false
    && state.fakeClipTrimAllowed === false
    && state.fakeEffectRenderedAllowed === false
    && state.fakeMusicInsertedAllowed === false
    && state.fakeCaptionSavedAllowed === false
    && state.fakeCoverGeneratedAllowed === false
    && state.fakeUploadAllowed === false
    && state.fakePublishAllowed === false
    && state.fakePlaybackAllowed === false
    && state.fakeViewsAllowed === false
    && state.fakeLikesAllowed === false
    && state.fakeAnalyticsAllowed === false
    && state.fakeGiftSendingAllowed === false
    && state.giftSendingImplementedNow === false
    && state.monetizationImplementedNow === false;

  return {
    version: "STREAM-116F",
    selectedSectionId: state.selectedSectionId,
    creationScore,
    readySections,
    totalSections,
    sectionItems,
    heroTitle: "Поток создания Shorts выглядит premium и готов к kernel handoff",
    heroSubtitle: "Выбор камеры/галереи, обрезка, эффекты, MP3/музыка, подпись, обложка, приватность, безопасность и publish gate организованы как один чистый путь создания без имитации upload, playback, counters, gifts или payments.",
    phoneStatus: shortsCreationFlowUiuxReady ? "UI/UX создания Shorts готов" : "Созданию Shorts нужна финальная приёмка",
    primaryAction: "Создай short через чистый premium flow, затем остановись на честном kernel publish gate.",
    secondaryAction: "Далее: финальная приёмка/handoff Shorts перед более поздним этапом gifts/монетизации.",
    commentsReactionsReady,
    captureGalleryEntryReady: state.captureGalleryEntryLocal,
    clipTrimFlowReady: state.clipTrimFlowLocal,
    effectsMusicReviewReady: state.effectsMusicReviewLocal,
    captionCoverReviewReady: state.captionCoverReviewLocal,
    privacySafetyGateReady: state.privacySafetyGateLocal,
    creatorBusinessBridgeReady: state.creatorBusinessBridgeLocal,
    kernelCreationContractReady: state.kernelCreationContractLocal,
    uploadPublishBlockedReady: state.uploadPublishBlockedLocal,
    analyticsCountersBlockedReady: state.analyticsCountersBlockedLocal,
    giftsMonetizationDeferredReady: state.giftsMonetizationDeferredLocal,
    shortsCreationFlowUiuxReady,
    nextShortsAcceptanceReady: shortsCreationFlowUiuxReady,
    allConnectionsThroughKernel: true,
    directCameraProviderAllowed: false,
    directGalleryProviderAllowed: false,
    directEffectsProviderAllowed: false,
    directMusicProviderAllowed: false,
    directUploadProviderAllowed: false,
    directPlaybackProviderAllowed: false,
    directAnalyticsProviderAllowed: false,
    directProfileProviderAllowed: false,
    directBusinessProviderAllowed: false,
    directWalletConnectionAllowed: false,
    directGiftPaymentAllowed: false,
    cameraBackendTouchedNow: false,
    galleryBackendTouchedNow: false,
    effectsBackendTouchedNow: false,
    musicBackendTouchedNow: false,
    uploadBackendTouchedNow: false,
    playbackBackendTouchedNow: false,
    analyticsBackendTouchedNow: false,
    walletTouchedNow: false,
    messengerTouchedNow: false,
    mainAiTouchedNow: false,
    fakeCameraCaptureAllowed: false,
    fakeGalleryImportAllowed: false,
    fakeClipTrimAllowed: false,
    fakeEffectRenderedAllowed: false,
    fakeMusicInsertedAllowed: false,
    fakeCaptionSavedAllowed: false,
    fakeCoverGeneratedAllowed: false,
    fakeUploadAllowed: false,
    fakePublishAllowed: false,
    fakePlaybackAllowed: false,
    fakeViewsAllowed: false,
    fakeLikesAllowed: false,
    fakeAnalyticsAllowed: false,
    fakeMonetizationAllowed: false,
    fakePaymentAllowed: false,
    fakeGiftSendingAllowed: false,
    giftSendingImplementedNow: false,
    monetizationImplementedNow: false,
  };
}
