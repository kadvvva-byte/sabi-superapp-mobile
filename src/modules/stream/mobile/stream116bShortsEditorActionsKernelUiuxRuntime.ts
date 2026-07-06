import type { StreamRoomRuntimeState } from "./streamRoomRuntime";
import type { Stream116AShortsPremiumPolishEvidence } from "./stream116aShortsPremiumPolishKernelUiuxRuntime";

export type Stream116BShortsEditorActionSectionId =
  | "editor_shell"
  | "effects_picker"
  | "effect_preview_boundary"
  | "mp3_music_picker"
  | "music_timeline"
  | "caption_trim_tools"
  | "comments_composer"
  | "like_save_share_dock"
  | "kernel_editor_contract"
  | "upload_publish_blocked"
  | "gifts_monetization_deferred";

export type Stream116BShortsEditorActionStatus = "ready" | "needs_polish";

export type Stream116BShortsEditorActionSection = {
  readonly id: Stream116BShortsEditorActionSectionId;
  readonly title: string;
  readonly description: string;
  readonly status: Stream116BShortsEditorActionStatus;
};

export type Stream116BShortsEditorActionsState = {
  readonly version: "STREAM-116B";
  readonly selectedSectionId: Stream116BShortsEditorActionSectionId;
  readonly readySectionIds: readonly Stream116BShortsEditorActionSectionId[];
  readonly lastAction: string;
  readonly editorShellLocal: boolean;
  readonly effectsPickerLocal: boolean;
  readonly effectPreviewBoundaryLocal: boolean;
  readonly mp3MusicPickerLocal: boolean;
  readonly musicTimelineLocal: boolean;
  readonly captionTrimToolsLocal: boolean;
  readonly commentsComposerLocal: boolean;
  readonly likeSaveShareDockLocal: boolean;
  readonly kernelEditorContractLocal: boolean;
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
  readonly musicProviderTouchedNow: false;
  readonly profileBackendTouchedNow: false;
  readonly businessBackendTouchedNow: false;
  readonly walletTouchedNow: false;
  readonly messengerTouchedNow: false;
  readonly mainAiTouchedNow: false;
  readonly fakeEffectAppliedAllowed: false;
  readonly fakeRenderedPreviewAllowed: false;
  readonly fakeMp3PickedAllowed: false;
  readonly fakeMusicLicenseAllowed: false;
  readonly fakeTimelineWriteAllowed: false;
  readonly fakeCaptionSavedAllowed: false;
  readonly fakeCommentSubmittedAllowed: false;
  readonly fakeLikeAllowed: false;
  readonly fakeSaveAllowed: false;
  readonly fakeShareAnalyticsAllowed: false;
  readonly fakeUploadAllowed: false;
  readonly fakePublishAllowed: false;
  readonly fakeViewsAllowed: false;
  readonly fakeMonetizationAllowed: false;
  readonly fakePaymentAllowed: false;
  readonly fakeGiftSendingAllowed: false;
  readonly giftSendingImplementedNow: false;
  readonly monetizationImplementedNow: false;
};

export type Stream116BShortsEditorActionsEvidence = {
  readonly version: "STREAM-116B";
  readonly selectedSectionId: Stream116BShortsEditorActionSectionId;
  readonly editorScore: number;
  readonly readySections: number;
  readonly totalSections: number;
  readonly sectionItems: readonly Stream116BShortsEditorActionSection[];
  readonly heroTitle: string;
  readonly heroSubtitle: string;
  readonly phoneStatus: string;
  readonly primaryAction: string;
  readonly secondaryAction: string;
  readonly shortsFoundationReady: boolean;
  readonly editorShellReady: boolean;
  readonly effectsPickerReady: boolean;
  readonly effectPreviewBoundaryReady: boolean;
  readonly mp3MusicPickerReady: boolean;
  readonly musicTimelineReady: boolean;
  readonly captionTrimToolsReady: boolean;
  readonly commentsComposerReady: boolean;
  readonly likeSaveShareDockReady: boolean;
  readonly kernelEditorContractReady: boolean;
  readonly uploadPublishBlockedReady: boolean;
  readonly giftsMonetizationDeferredReady: boolean;
  readonly shortsEditorUiuxReady: boolean;
  readonly nextShortsFeedCleanupReady: boolean;
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
  readonly musicProviderTouchedNow: false;
  readonly profileBackendTouchedNow: false;
  readonly businessBackendTouchedNow: false;
  readonly walletTouchedNow: false;
  readonly messengerTouchedNow: false;
  readonly mainAiTouchedNow: false;
  readonly fakeEffectAppliedAllowed: false;
  readonly fakeRenderedPreviewAllowed: false;
  readonly fakeMp3PickedAllowed: false;
  readonly fakeMusicLicenseAllowed: false;
  readonly fakeTimelineWriteAllowed: false;
  readonly fakeCaptionSavedAllowed: false;
  readonly fakeCommentSubmittedAllowed: false;
  readonly fakeLikeAllowed: false;
  readonly fakeSaveAllowed: false;
  readonly fakeShareAnalyticsAllowed: false;
  readonly fakeUploadAllowed: false;
  readonly fakePublishAllowed: false;
  readonly fakeViewsAllowed: false;
  readonly fakeMonetizationAllowed: false;
  readonly fakePaymentAllowed: false;
  readonly fakeGiftSendingAllowed: false;
  readonly giftSendingImplementedNow: false;
  readonly monetizationImplementedNow: false;
};

const SECTION_ORDER: readonly Stream116BShortsEditorActionSectionId[] = [
  "editor_shell",
  "effects_picker",
  "effect_preview_boundary",
  "mp3_music_picker",
  "music_timeline",
  "caption_trim_tools",
  "comments_composer",
  "like_save_share_dock",
  "kernel_editor_contract",
  "upload_publish_blocked",
  "gifts_monetization_deferred",
];

const SECTION_TITLES: Record<Stream116BShortsEditorActionSectionId, string> = {
  editor_shell: "Editor shell",
  effects_picker: "Effects picker",
  effect_preview_boundary: "Граница предпросмотра эффекта",
  mp3_music_picker: "MP3 / music picker",
  music_timeline: "Музыкальная линия",
  caption_trim_tools: "Подпись / обрезка",
  comments_composer: "Composer комментариев",
  like_save_share_dock: "Панель лайк / сохранить / поделиться",
  kernel_editor_contract: "Kernel editor contract",
  upload_publish_blocked: "Загрузка / публикация заблокированы",
  gifts_monetization_deferred: "Подарки позже",
};

const SECTION_DESCRIPTIONS: Record<Stream116BShortsEditorActionSectionId, string> = {
  editor_shell: "Редактор Shorts открывается как единый чистый premium phone-flow, а не как разрозненные тестовые controls.",
  effects_picker: "Эффекты выбираются как локальное UI-намерение через Stream kernel, без имитации рендера видео.",
  effect_preview_boundary: "Текст предпросмотра честно говорит, что render/provider не имитируется и позже должен идти через kernel/provider.",
  mp3_music_picker: "Выбор MP3/музыки — это музыкальное намерение kernel без имитации выбора файла, лицензии или успеха провайдера.",
  music_timeline: "Музыкальная линия показывает только намерение размещения, без имитации записи timeline или сохранённого аудиомикса.",
  caption_trim_tools: "Подпись и обрезка — продуктовые UI-намерения без имитации сохранённого монтажа или export.",
  comments_composer: "Composer комментариев подготовлен как чистое нижнее взаимодействие без имитации отправленного комментария.",
  like_save_share_dock: "Лайк, сохранить и поделиться остаются видимыми premium-действиями без имитации счётчиков или аналитики.",
  kernel_editor_contract: "Все действия редактора Shorts идут через контракты/фасады/события Stream core/kernel.",
  upload_publish_blocked: "Загрузка, публикация, playback и просмотры честно заблокированы до реальной backend/provider работы.",
  gifts_monetization_deferred: "Подарки и монетизация остаются обязательными позже, не в этом UI/UX проходе редактора.",
};

function uniqueReady(items: readonly Stream116BShortsEditorActionSectionId[]): readonly Stream116BShortsEditorActionSectionId[] {
  return SECTION_ORDER.filter((item) => items.includes(item));
}

export function createInitialStream116BShortsEditorActionsState(): Stream116BShortsEditorActionsState {
  return {
    version: "STREAM-116B",
    selectedSectionId: "editor_shell",
    readySectionIds: ["kernel_editor_contract", "upload_publish_blocked", "gifts_monetization_deferred"],
    lastAction: "116B начинает глубокие действия редактора Shorts: эффекты, MP3/музыка, комментарии и панель действий только через kernel, без имитации загрузки/публикации/подарков.",
    editorShellLocal: false,
    effectsPickerLocal: false,
    effectPreviewBoundaryLocal: false,
    mp3MusicPickerLocal: false,
    musicTimelineLocal: false,
    captionTrimToolsLocal: false,
    commentsComposerLocal: false,
    likeSaveShareDockLocal: false,
    kernelEditorContractLocal: true,
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
    musicProviderTouchedNow: false,
    profileBackendTouchedNow: false,
    businessBackendTouchedNow: false,
    walletTouchedNow: false,
    messengerTouchedNow: false,
    mainAiTouchedNow: false,
    fakeEffectAppliedAllowed: false,
    fakeRenderedPreviewAllowed: false,
    fakeMp3PickedAllowed: false,
    fakeMusicLicenseAllowed: false,
    fakeTimelineWriteAllowed: false,
    fakeCaptionSavedAllowed: false,
    fakeCommentSubmittedAllowed: false,
    fakeLikeAllowed: false,
    fakeSaveAllowed: false,
    fakeShareAnalyticsAllowed: false,
    fakeUploadAllowed: false,
    fakePublishAllowed: false,
    fakeViewsAllowed: false,
    fakeMonetizationAllowed: false,
    fakePaymentAllowed: false,
    fakeGiftSendingAllowed: false,
    giftSendingImplementedNow: false,
    monetizationImplementedNow: false,
  };
}

function setReadyFlag(state: Stream116BShortsEditorActionsState, sectionId: Stream116BShortsEditorActionSectionId): Stream116BShortsEditorActionsState {
  const readySectionIds = uniqueReady([...state.readySectionIds, sectionId]);
  return {
    ...state,
    selectedSectionId: sectionId,
    readySectionIds,
    editorShellLocal: readySectionIds.includes("editor_shell"),
    effectsPickerLocal: readySectionIds.includes("effects_picker"),
    effectPreviewBoundaryLocal: readySectionIds.includes("effect_preview_boundary"),
    mp3MusicPickerLocal: readySectionIds.includes("mp3_music_picker"),
    musicTimelineLocal: readySectionIds.includes("music_timeline"),
    captionTrimToolsLocal: readySectionIds.includes("caption_trim_tools"),
    commentsComposerLocal: readySectionIds.includes("comments_composer"),
    likeSaveShareDockLocal: readySectionIds.includes("like_save_share_dock"),
    kernelEditorContractLocal: readySectionIds.includes("kernel_editor_contract"),
    uploadPublishBlockedLocal: readySectionIds.includes("upload_publish_blocked"),
    giftsMonetizationDeferredLocal: readySectionIds.includes("gifts_monetization_deferred"),
  };
}

export function selectStream116BShortsEditorActionSection(
  state: Stream116BShortsEditorActionsState,
  sectionId: Stream116BShortsEditorActionSectionId,
): Stream116BShortsEditorActionsState {
  return {
    ...state,
    selectedSectionId: sectionId,
    lastAction: `116B выбран раздел: ${SECTION_TITLES[sectionId]}`,
  };
}

export function markStream116BShortsEditorActionSectionReady(
  state: Stream116BShortsEditorActionsState,
  sectionId: Stream116BShortsEditorActionSectionId,
  action: string,
): Stream116BShortsEditorActionsState {
  return {
    ...setReadyFlag(state, sectionId),
    lastAction: action,
  };
}

export function markStream116BShortsEditorActionsAllReady(
  state: Stream116BShortsEditorActionsState,
  action = "116B действия редактора Shorts приняты: оболочка редактора, эффекты, MP3/музыка, комментарии, панель действий и границы kernel готовы.",
): Stream116BShortsEditorActionsState {
  return {
    ...state,
    selectedSectionId: "kernel_editor_contract",
    readySectionIds: SECTION_ORDER,
    lastAction: action,
    editorShellLocal: true,
    effectsPickerLocal: true,
    effectPreviewBoundaryLocal: true,
    mp3MusicPickerLocal: true,
    musicTimelineLocal: true,
    captionTrimToolsLocal: true,
    commentsComposerLocal: true,
    likeSaveShareDockLocal: true,
    kernelEditorContractLocal: true,
    uploadPublishBlockedLocal: true,
    giftsMonetizationDeferredLocal: true,
  };
}

export function buildStream116BShortsEditorActionsEvidence(
  state: Stream116BShortsEditorActionsState,
  room: StreamRoomRuntimeState,
  shortsEvidence: Stream116AShortsPremiumPolishEvidence,
): Stream116BShortsEditorActionsEvidence {
  const readySections = state.readySectionIds.length;
  const totalSections = SECTION_ORDER.length;
  const editorScore = Math.round((readySections / totalSections) * 100);
  const sectionItems: readonly Stream116BShortsEditorActionSection[] = SECTION_ORDER.map((id) => ({
    id,
    title: SECTION_TITLES[id],
    description: SECTION_DESCRIPTIONS[id],
    status: state.readySectionIds.includes(id) ? "ready" : "needs_polish",
  }));
  const shortsFoundationReady = shortsEvidence.shortsPremiumUiuxReady || shortsEvidence.nextShortsEditorDepthReady;
  const shortsEditorUiuxReady = shortsFoundationReady
    && state.editorShellLocal
    && state.effectsPickerLocal
    && state.effectPreviewBoundaryLocal
    && state.mp3MusicPickerLocal
    && state.musicTimelineLocal
    && state.captionTrimToolsLocal
    && state.commentsComposerLocal
    && state.likeSaveShareDockLocal
    && state.kernelEditorContractLocal
    && state.uploadPublishBlockedLocal
    && state.giftsMonetizationDeferredLocal
    && state.allConnectionsThroughKernel
    && state.fakeUploadAllowed === false
    && state.fakePublishAllowed === false
    && state.fakeGiftSendingAllowed === false;

  return {
    version: "STREAM-116B",
    selectedSectionId: state.selectedSectionId,
    editorScore,
    readySections,
    totalSections,
    sectionItems,
    heroTitle: shortsEditorUiuxReady ? "Действия редактора Shorts готовы как продуктовый UI." : "Заверши поток действий редактора Shorts.",
    heroSubtitle: shortsEditorUiuxReady
      ? "Эффекты, MP3/музыка, комментарии и social-панель — чистые kernel-намерения с честными границами загрузки/публикации/подарков."
      : "Закрой оболочку редактора, эффекты, MP3/музыку, комментарии, панель действий и границу загрузки/публикации без имитации backend.",
    phoneStatus: `${room.title} · Shorts editor · ${readySections}/${totalSections} ready`,
    primaryAction: state.lastAction,
    secondaryAction: shortsEditorUiuxReady ? "116B принят. Далее: визуальная чистка Shorts feed/playback без имитации playback или просмотров." : "Finish all editor actions before moving to feed/playback cleanup.",
    shortsFoundationReady,
    editorShellReady: state.editorShellLocal,
    effectsPickerReady: state.effectsPickerLocal,
    effectPreviewBoundaryReady: state.effectPreviewBoundaryLocal,
    mp3MusicPickerReady: state.mp3MusicPickerLocal,
    musicTimelineReady: state.musicTimelineLocal,
    captionTrimToolsReady: state.captionTrimToolsLocal,
    commentsComposerReady: state.commentsComposerLocal,
    likeSaveShareDockReady: state.likeSaveShareDockLocal,
    kernelEditorContractReady: state.kernelEditorContractLocal,
    uploadPublishBlockedReady: state.uploadPublishBlockedLocal,
    giftsMonetizationDeferredReady: state.giftsMonetizationDeferredLocal,
    shortsEditorUiuxReady,
    nextShortsFeedCleanupReady: shortsEditorUiuxReady,
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
    musicProviderTouchedNow: state.musicProviderTouchedNow,
    profileBackendTouchedNow: state.profileBackendTouchedNow,
    businessBackendTouchedNow: state.businessBackendTouchedNow,
    walletTouchedNow: state.walletTouchedNow,
    messengerTouchedNow: state.messengerTouchedNow,
    mainAiTouchedNow: state.mainAiTouchedNow,
    fakeEffectAppliedAllowed: state.fakeEffectAppliedAllowed,
    fakeRenderedPreviewAllowed: state.fakeRenderedPreviewAllowed,
    fakeMp3PickedAllowed: state.fakeMp3PickedAllowed,
    fakeMusicLicenseAllowed: state.fakeMusicLicenseAllowed,
    fakeTimelineWriteAllowed: state.fakeTimelineWriteAllowed,
    fakeCaptionSavedAllowed: state.fakeCaptionSavedAllowed,
    fakeCommentSubmittedAllowed: state.fakeCommentSubmittedAllowed,
    fakeLikeAllowed: state.fakeLikeAllowed,
    fakeSaveAllowed: state.fakeSaveAllowed,
    fakeShareAnalyticsAllowed: state.fakeShareAnalyticsAllowed,
    fakeUploadAllowed: state.fakeUploadAllowed,
    fakePublishAllowed: state.fakePublishAllowed,
    fakeViewsAllowed: state.fakeViewsAllowed,
    fakeMonetizationAllowed: state.fakeMonetizationAllowed,
    fakePaymentAllowed: state.fakePaymentAllowed,
    fakeGiftSendingAllowed: state.fakeGiftSendingAllowed,
    giftSendingImplementedNow: state.giftSendingImplementedNow,
    monetizationImplementedNow: state.monetizationImplementedNow,
  };
}
