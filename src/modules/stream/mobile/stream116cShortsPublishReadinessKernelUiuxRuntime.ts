import type { StreamRoomRuntimeState } from "./streamRoomRuntime";
import type { Stream116BShortsEditorActionsEvidence } from "./stream116bShortsEditorActionsKernelUiuxRuntime";

export type Stream116CShortsPublishReadinessSectionId =
  | "publish_sheet"
  | "caption_review"
  | "music_effects_readiness"
  | "thumbnail_cover_preview"
  | "privacy_visibility"
  | "moderation_language_check"
  | "creator_profile_bridge"
  | "business_stream_bridge"
  | "kernel_publish_gate"
  | "upload_publish_blocked"
  | "gifts_monetization_deferred";

export type Stream116CShortsPublishReadinessStatus = "ready" | "needs_polish";

export type Stream116CShortsPublishReadinessSection = {
  readonly id: Stream116CShortsPublishReadinessSectionId;
  readonly title: string;
  readonly description: string;
  readonly status: Stream116CShortsPublishReadinessStatus;
};

export type Stream116CShortsPublishReadinessState = {
  readonly version: "STREAM-116C";
  readonly selectedSectionId: Stream116CShortsPublishReadinessSectionId;
  readonly readySectionIds: readonly Stream116CShortsPublishReadinessSectionId[];
  readonly lastAction: string;
  readonly publishSheetLocal: boolean;
  readonly captionReviewLocal: boolean;
  readonly musicEffectsReadinessLocal: boolean;
  readonly thumbnailCoverPreviewLocal: boolean;
  readonly privacyVisibilityLocal: boolean;
  readonly moderationLanguageCheckLocal: boolean;
  readonly creatorProfileBridgeLocal: boolean;
  readonly businessStreamBridgeLocal: boolean;
  readonly kernelPublishGateLocal: boolean;
  readonly uploadPublishBlockedLocal: boolean;
  readonly giftsMonetizationDeferredLocal: boolean;
  readonly allConnectionsThroughKernel: true;
  readonly directShortsProviderAllowed: false;
  readonly directMediaProviderAllowed: false;
  readonly directMusicProviderAllowed: false;
  readonly directUploadProviderAllowed: false;
  readonly directProfileProviderAllowed: false;
  readonly directBusinessProviderAllowed: false;
  readonly directWalletConnectionAllowed: false;
  readonly directGiftPaymentAllowed: false;
  readonly shortsBackendTouchedNow: false;
  readonly mediaUploadBackendTouchedNow: false;
  readonly publishBackendTouchedNow: false;
  readonly musicProviderTouchedNow: false;
  readonly profileBackendTouchedNow: false;
  readonly businessBackendTouchedNow: false;
  readonly walletTouchedNow: false;
  readonly messengerTouchedNow: false;
  readonly mainAiTouchedNow: false;
  readonly fakeCaptionApprovedAllowed: false;
  readonly fakeEffectRenderAllowed: false;
  readonly fakeMp3LicenseAllowed: false;
  readonly fakeThumbnailSavedAllowed: false;
  readonly fakeVisibilitySavedAllowed: false;
  readonly fakeModerationApprovedAllowed: false;
  readonly fakeCreatorProfileLinkedAllowed: false;
  readonly fakeBusinessLinkedAllowed: false;
  readonly fakeUploadAllowed: false;
  readonly fakePublishAllowed: false;
  readonly fakePlaybackAllowed: false;
  readonly fakeViewsAllowed: false;
  readonly fakeLikesAllowed: false;
  readonly fakeMonetizationAllowed: false;
  readonly fakePaymentAllowed: false;
  readonly fakeGiftSendingAllowed: false;
  readonly giftSendingImplementedNow: false;
  readonly monetizationImplementedNow: false;
};

export type Stream116CShortsPublishReadinessEvidence = {
  readonly version: "STREAM-116C";
  readonly selectedSectionId: Stream116CShortsPublishReadinessSectionId;
  readonly publishScore: number;
  readonly readySections: number;
  readonly totalSections: number;
  readonly sectionItems: readonly Stream116CShortsPublishReadinessSection[];
  readonly heroTitle: string;
  readonly heroSubtitle: string;
  readonly phoneStatus: string;
  readonly primaryAction: string;
  readonly secondaryAction: string;
  readonly shortsEditorReady: boolean;
  readonly publishSheetReady: boolean;
  readonly captionReviewReady: boolean;
  readonly musicEffectsReadinessReady: boolean;
  readonly thumbnailCoverPreviewReady: boolean;
  readonly privacyVisibilityReady: boolean;
  readonly moderationLanguageCheckReady: boolean;
  readonly creatorProfileBridgeReady: boolean;
  readonly businessStreamBridgeReady: boolean;
  readonly kernelPublishGateReady: boolean;
  readonly uploadPublishBlockedReady: boolean;
  readonly giftsMonetizationDeferredReady: boolean;
  readonly shortsPublishUiuxReady: boolean;
  readonly nextShortsFeedPlaybackReady: boolean;
  readonly allConnectionsThroughKernel: true;
  readonly directShortsProviderAllowed: false;
  readonly directMediaProviderAllowed: false;
  readonly directMusicProviderAllowed: false;
  readonly directUploadProviderAllowed: false;
  readonly directProfileProviderAllowed: false;
  readonly directBusinessProviderAllowed: false;
  readonly directWalletConnectionAllowed: false;
  readonly directGiftPaymentAllowed: false;
  readonly shortsBackendTouchedNow: false;
  readonly mediaUploadBackendTouchedNow: false;
  readonly publishBackendTouchedNow: false;
  readonly musicProviderTouchedNow: false;
  readonly profileBackendTouchedNow: false;
  readonly businessBackendTouchedNow: false;
  readonly walletTouchedNow: false;
  readonly messengerTouchedNow: false;
  readonly mainAiTouchedNow: false;
  readonly fakeCaptionApprovedAllowed: false;
  readonly fakeEffectRenderAllowed: false;
  readonly fakeMp3LicenseAllowed: false;
  readonly fakeThumbnailSavedAllowed: false;
  readonly fakeVisibilitySavedAllowed: false;
  readonly fakeModerationApprovedAllowed: false;
  readonly fakeCreatorProfileLinkedAllowed: false;
  readonly fakeBusinessLinkedAllowed: false;
  readonly fakeUploadAllowed: false;
  readonly fakePublishAllowed: false;
  readonly fakePlaybackAllowed: false;
  readonly fakeViewsAllowed: false;
  readonly fakeLikesAllowed: false;
  readonly fakeMonetizationAllowed: false;
  readonly fakePaymentAllowed: false;
  readonly fakeGiftSendingAllowed: false;
  readonly giftSendingImplementedNow: false;
  readonly monetizationImplementedNow: false;
};

const SECTION_ORDER: readonly Stream116CShortsPublishReadinessSectionId[] = [
  "publish_sheet",
  "caption_review",
  "music_effects_readiness",
  "thumbnail_cover_preview",
  "privacy_visibility",
  "moderation_language_check",
  "creator_profile_bridge",
  "business_stream_bridge",
  "kernel_publish_gate",
  "upload_publish_blocked",
  "gifts_monetization_deferred",
];

const SECTION_TITLES: Record<Stream116CShortsPublishReadinessSectionId, string> = {
  publish_sheet: "Панель публикации",
  caption_review: "Проверка подписи",
  music_effects_readiness: "Готовность музыки / эффектов",
  thumbnail_cover_preview: "Предпросмотр обложки",
  privacy_visibility: "Privacy / visibility",
  moderation_language_check: "Safety / language check",
  creator_profile_bridge: "Связь с профилем автора",
  business_stream_bridge: "Связь с Business Stream",
  kernel_publish_gate: "Kernel publish gate",
  upload_publish_blocked: "Загрузка / публикация заблокированы",
  gifts_monetization_deferred: "Подарки позже",
};

const SECTION_DESCRIPTIONS: Record<Stream116CShortsPublishReadinessSectionId, string> = {
  publish_sheet: "Финальная панель публикации Shorts — чистый phone-screen, а не экран backend-успеха.",
  caption_review: "Подпись и hashtags проверяются как локальное UI-намерение, без имитации сохранения подписи или публикации.",
  music_effects_readiness: "Готовность музыки, MP3 и эффектов видна, но без имитации рендера, провайдера или лицензии.",
  thumbnail_cover_preview: "Выбор обложки/thumbnail — только продуктовый UI до появления media processing через kernel/provider.",
  privacy_visibility: "Видимость и аудитория подготовлены как kernel-намерение, без имитации сохранённых настроек.",
  moderation_language_check: "Текст безопасности для 25 языков, Sabi AI guard и границы 18+ проверяются до намерения публикации.",
  creator_profile_bridge: "Связь с профилем автора названа вовремя, но без имитации обновления профиля или счётчиков.",
  business_stream_bridge: "Связь с Business Stream готова как контекст, без имитации merchant, order, payment или product attach.",
  kernel_publish_gate: "Every publish/readiness action routes through Stream core/kernel contracts/facades/events.",
  upload_publish_blocked: "Загрузка, публикация, playback, просмотры и лайки честно заблокированы до backend/provider работы.",
  gifts_monetization_deferred: "Подарки и монетизация остаются финальным этапом Stream, не этим Shorts-проходом.",
};

function uniqueReady(items: readonly Stream116CShortsPublishReadinessSectionId[]): readonly Stream116CShortsPublishReadinessSectionId[] {
  return SECTION_ORDER.filter((item) => items.includes(item));
}

export function createInitialStream116CShortsPublishReadinessState(): Stream116CShortsPublishReadinessState {
  return {
    version: "STREAM-116C",
    selectedSectionId: "publish_sheet",
    readySectionIds: ["kernel_publish_gate", "upload_publish_blocked", "gifts_monetization_deferred"],
    lastAction: "116C начинает UI готовности публикации Shorts: чистая панель, подпись/музыка/эффекты, profile/business bridge, только kernel, без имитации upload/publish/views/gifts.",
    publishSheetLocal: false,
    captionReviewLocal: false,
    musicEffectsReadinessLocal: false,
    thumbnailCoverPreviewLocal: false,
    privacyVisibilityLocal: false,
    moderationLanguageCheckLocal: false,
    creatorProfileBridgeLocal: false,
    businessStreamBridgeLocal: false,
    kernelPublishGateLocal: true,
    uploadPublishBlockedLocal: true,
    giftsMonetizationDeferredLocal: true,
    allConnectionsThroughKernel: true,
    directShortsProviderAllowed: false,
    directMediaProviderAllowed: false,
    directMusicProviderAllowed: false,
    directUploadProviderAllowed: false,
    directProfileProviderAllowed: false,
    directBusinessProviderAllowed: false,
    directWalletConnectionAllowed: false,
    directGiftPaymentAllowed: false,
    shortsBackendTouchedNow: false,
    mediaUploadBackendTouchedNow: false,
    publishBackendTouchedNow: false,
    musicProviderTouchedNow: false,
    profileBackendTouchedNow: false,
    businessBackendTouchedNow: false,
    walletTouchedNow: false,
    messengerTouchedNow: false,
    mainAiTouchedNow: false,
    fakeCaptionApprovedAllowed: false,
    fakeEffectRenderAllowed: false,
    fakeMp3LicenseAllowed: false,
    fakeThumbnailSavedAllowed: false,
    fakeVisibilitySavedAllowed: false,
    fakeModerationApprovedAllowed: false,
    fakeCreatorProfileLinkedAllowed: false,
    fakeBusinessLinkedAllowed: false,
    fakeUploadAllowed: false,
    fakePublishAllowed: false,
    fakePlaybackAllowed: false,
    fakeViewsAllowed: false,
    fakeLikesAllowed: false,
    fakeMonetizationAllowed: false,
    fakePaymentAllowed: false,
    fakeGiftSendingAllowed: false,
    giftSendingImplementedNow: false,
    monetizationImplementedNow: false,
  };
}

function setReadyFlag(state: Stream116CShortsPublishReadinessState, sectionId: Stream116CShortsPublishReadinessSectionId): Stream116CShortsPublishReadinessState {
  const readySectionIds = uniqueReady([...state.readySectionIds, sectionId]);
  return {
    ...state,
    selectedSectionId: sectionId,
    readySectionIds,
    publishSheetLocal: sectionId === "publish_sheet" ? true : state.publishSheetLocal,
    captionReviewLocal: sectionId === "caption_review" ? true : state.captionReviewLocal,
    musicEffectsReadinessLocal: sectionId === "music_effects_readiness" ? true : state.musicEffectsReadinessLocal,
    thumbnailCoverPreviewLocal: sectionId === "thumbnail_cover_preview" ? true : state.thumbnailCoverPreviewLocal,
    privacyVisibilityLocal: sectionId === "privacy_visibility" ? true : state.privacyVisibilityLocal,
    moderationLanguageCheckLocal: sectionId === "moderation_language_check" ? true : state.moderationLanguageCheckLocal,
    creatorProfileBridgeLocal: sectionId === "creator_profile_bridge" ? true : state.creatorProfileBridgeLocal,
    businessStreamBridgeLocal: sectionId === "business_stream_bridge" ? true : state.businessStreamBridgeLocal,
    kernelPublishGateLocal: sectionId === "kernel_publish_gate" ? true : state.kernelPublishGateLocal,
    uploadPublishBlockedLocal: sectionId === "upload_publish_blocked" ? true : state.uploadPublishBlockedLocal,
    giftsMonetizationDeferredLocal: sectionId === "gifts_monetization_deferred" ? true : state.giftsMonetizationDeferredLocal,
  };
}

export function selectStream116CShortsPublishReadinessSection(state: Stream116CShortsPublishReadinessState, sectionId: Stream116CShortsPublishReadinessSectionId): Stream116CShortsPublishReadinessState {
  return {
    ...state,
    selectedSectionId: sectionId,
    lastAction: `116C выбран раздел для проверки публикации Shorts: ${SECTION_TITLES[sectionId]}.`,
  };
}

export function markStream116CShortsPublishReadinessSectionReady(state: Stream116CShortsPublishReadinessState, sectionId: Stream116CShortsPublishReadinessSectionId, action: string): Stream116CShortsPublishReadinessState {
  return {
    ...setReadyFlag(state, sectionId),
    lastAction: action,
  };
}

export function markStream116CShortsPublishReadinessAllReady(state: Stream116CShortsPublishReadinessState, action = "116C UI/UX публикации Shorts готов: панель, подпись, музыка/эффекты, обложка, видимость, безопасность, profile/business bridge, только kernel, upload/publish заблокированы, gifts позже."): Stream116CShortsPublishReadinessState {
  return {
    ...state,
    selectedSectionId: "kernel_publish_gate",
    readySectionIds: SECTION_ORDER,
    lastAction: action,
    publishSheetLocal: true,
    captionReviewLocal: true,
    musicEffectsReadinessLocal: true,
    thumbnailCoverPreviewLocal: true,
    privacyVisibilityLocal: true,
    moderationLanguageCheckLocal: true,
    creatorProfileBridgeLocal: true,
    businessStreamBridgeLocal: true,
    kernelPublishGateLocal: true,
    uploadPublishBlockedLocal: true,
    giftsMonetizationDeferredLocal: true,
  };
}

function buildSectionItems(state: Stream116CShortsPublishReadinessState): readonly Stream116CShortsPublishReadinessSection[] {
  return SECTION_ORDER.map((id) => ({
    id,
    title: SECTION_TITLES[id],
    description: SECTION_DESCRIPTIONS[id],
    status: state.readySectionIds.includes(id) ? "ready" : "needs_polish",
  }));
}

export function buildStream116CShortsPublishReadinessEvidence(
  state: Stream116CShortsPublishReadinessState,
  _room: StreamRoomRuntimeState,
  editorEvidence: Stream116BShortsEditorActionsEvidence,
): Stream116CShortsPublishReadinessEvidence {
  const sectionItems = buildSectionItems(state);
  const readySections = sectionItems.filter((item) => item.status === "ready").length;
  const totalSections = sectionItems.length;
  const publishScore = Math.round((readySections / totalSections) * 100);
  const shortsEditorReady = editorEvidence.shortsEditorUiuxReady;
  const publishSheetReady = state.publishSheetLocal && state.readySectionIds.includes("publish_sheet");
  const captionReviewReady = state.captionReviewLocal && state.readySectionIds.includes("caption_review");
  const musicEffectsReadinessReady = state.musicEffectsReadinessLocal && state.readySectionIds.includes("music_effects_readiness");
  const thumbnailCoverPreviewReady = state.thumbnailCoverPreviewLocal && state.readySectionIds.includes("thumbnail_cover_preview");
  const privacyVisibilityReady = state.privacyVisibilityLocal && state.readySectionIds.includes("privacy_visibility");
  const moderationLanguageCheckReady = state.moderationLanguageCheckLocal && state.readySectionIds.includes("moderation_language_check");
  const creatorProfileBridgeReady = state.creatorProfileBridgeLocal && state.readySectionIds.includes("creator_profile_bridge");
  const businessStreamBridgeReady = state.businessStreamBridgeLocal && state.readySectionIds.includes("business_stream_bridge");
  const kernelPublishGateReady = state.kernelPublishGateLocal && state.readySectionIds.includes("kernel_publish_gate");
  const uploadPublishBlockedReady = state.uploadPublishBlockedLocal && state.readySectionIds.includes("upload_publish_blocked");
  const giftsMonetizationDeferredReady = state.giftsMonetizationDeferredLocal && state.readySectionIds.includes("gifts_monetization_deferred");
  const shortsPublishUiuxReady = shortsEditorReady
    && publishSheetReady
    && captionReviewReady
    && musicEffectsReadinessReady
    && thumbnailCoverPreviewReady
    && privacyVisibilityReady
    && moderationLanguageCheckReady
    && creatorProfileBridgeReady
    && businessStreamBridgeReady
    && kernelPublishGateReady
    && uploadPublishBlockedReady
    && giftsMonetizationDeferredReady;

  return {
    version: "STREAM-116C",
    selectedSectionId: state.selectedSectionId,
    publishScore,
    readySections,
    totalSections,
    sectionItems,
    heroTitle: shortsPublishUiuxReady ? "Shorts publish flow готов как честный UI" : "Доводим публикацию Shorts без имитации publish",
    heroSubtitle: "Подпись, музыка/эффекты, обложка, видимость, безопасность, creator/business bridge и kernel gate в одном чистом экране публикации.",
    phoneStatus: shortsPublishUiuxReady ? "UI публикации готов · только kernel gate" : "UI-намерение публикации · upload/publish заблокированы",
    primaryAction: "Подготовить Shorts к публикации, но не показывать имитацию upload, publish, playback, views или gifts.",
    secondaryAction: shortsPublishUiuxReady ? "Следующий шаг: 116D визуальная чистка ленты/плеера Shorts." : "Закрой панель публикации, подпись, музыку/эффекты, обложку, видимость, безопасность, profile/business bridge и kernel gate.",
    shortsEditorReady,
    publishSheetReady,
    captionReviewReady,
    musicEffectsReadinessReady,
    thumbnailCoverPreviewReady,
    privacyVisibilityReady,
    moderationLanguageCheckReady,
    creatorProfileBridgeReady,
    businessStreamBridgeReady,
    kernelPublishGateReady,
    uploadPublishBlockedReady,
    giftsMonetizationDeferredReady,
    shortsPublishUiuxReady,
    nextShortsFeedPlaybackReady: shortsPublishUiuxReady,
    allConnectionsThroughKernel: state.allConnectionsThroughKernel,
    directShortsProviderAllowed: state.directShortsProviderAllowed,
    directMediaProviderAllowed: state.directMediaProviderAllowed,
    directMusicProviderAllowed: state.directMusicProviderAllowed,
    directUploadProviderAllowed: state.directUploadProviderAllowed,
    directProfileProviderAllowed: state.directProfileProviderAllowed,
    directBusinessProviderAllowed: state.directBusinessProviderAllowed,
    directWalletConnectionAllowed: state.directWalletConnectionAllowed,
    directGiftPaymentAllowed: state.directGiftPaymentAllowed,
    shortsBackendTouchedNow: state.shortsBackendTouchedNow,
    mediaUploadBackendTouchedNow: state.mediaUploadBackendTouchedNow,
    publishBackendTouchedNow: state.publishBackendTouchedNow,
    musicProviderTouchedNow: state.musicProviderTouchedNow,
    profileBackendTouchedNow: state.profileBackendTouchedNow,
    businessBackendTouchedNow: state.businessBackendTouchedNow,
    walletTouchedNow: state.walletTouchedNow,
    messengerTouchedNow: state.messengerTouchedNow,
    mainAiTouchedNow: state.mainAiTouchedNow,
    fakeCaptionApprovedAllowed: state.fakeCaptionApprovedAllowed,
    fakeEffectRenderAllowed: state.fakeEffectRenderAllowed,
    fakeMp3LicenseAllowed: state.fakeMp3LicenseAllowed,
    fakeThumbnailSavedAllowed: state.fakeThumbnailSavedAllowed,
    fakeVisibilitySavedAllowed: state.fakeVisibilitySavedAllowed,
    fakeModerationApprovedAllowed: state.fakeModerationApprovedAllowed,
    fakeCreatorProfileLinkedAllowed: state.fakeCreatorProfileLinkedAllowed,
    fakeBusinessLinkedAllowed: state.fakeBusinessLinkedAllowed,
    fakeUploadAllowed: state.fakeUploadAllowed,
    fakePublishAllowed: state.fakePublishAllowed,
    fakePlaybackAllowed: state.fakePlaybackAllowed,
    fakeViewsAllowed: state.fakeViewsAllowed,
    fakeLikesAllowed: state.fakeLikesAllowed,
    fakeMonetizationAllowed: state.fakeMonetizationAllowed,
    fakePaymentAllowed: state.fakePaymentAllowed,
    fakeGiftSendingAllowed: state.fakeGiftSendingAllowed,
    giftSendingImplementedNow: state.giftSendingImplementedNow,
    monetizationImplementedNow: state.monetizationImplementedNow,
  };
}
