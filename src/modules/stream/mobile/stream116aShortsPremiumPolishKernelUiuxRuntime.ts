import type { StreamRoomRuntimeState } from "./streamRoomRuntime";
import type { Stream115FCreatorFinalHandoffEvidence } from "./stream115fCreatorFinalHandoffKernelUiuxRuntime";

export type Stream116AShortsPremiumPolishSectionId =
  | "shorts_premium_surface"
  | "like_save_share_actions"
  | "comments_bottom_sheet"
  | "effects_editor_entry"
  | "mp3_music_insert"
  | "creator_profile_bridge"
  | "business_stream_bridge"
  | "kernel_action_contract"
  | "gifts_monetization_deferred";

export type Stream116AShortsPremiumPolishStatus = "ready" | "needs_polish";

export type Stream116AShortsPremiumPolishSection = {
  readonly id: Stream116AShortsPremiumPolishSectionId;
  readonly title: string;
  readonly description: string;
  readonly status: Stream116AShortsPremiumPolishStatus;
};

export type Stream116AShortsPremiumPolishState = {
  readonly version: "STREAM-116A";
  readonly selectedSectionId: Stream116AShortsPremiumPolishSectionId;
  readonly readySectionIds: readonly Stream116AShortsPremiumPolishSectionId[];
  readonly lastAction: string;
  readonly shortsPremiumSurfaceLocal: boolean;
  readonly likeSaveShareActionsLocal: boolean;
  readonly commentsBottomSheetLocal: boolean;
  readonly effectsEditorEntryLocal: boolean;
  readonly mp3MusicInsertLocal: boolean;
  readonly creatorProfileBridgeLocal: boolean;
  readonly businessStreamBridgeLocal: boolean;
  readonly kernelActionContractLocal: boolean;
  readonly giftsMonetizationDeferredLocal: boolean;
  readonly allConnectionsThroughKernel: true;
  readonly directShortsProviderAllowed: false;
  readonly directRealtimeProviderAllowed: false;
  readonly directMediaProviderAllowed: false;
  readonly directMusicProviderAllowed: false;
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
  readonly fakeLikeAllowed: false;
  readonly fakeSaveAllowed: false;
  readonly fakeShareAnalyticsAllowed: false;
  readonly fakeCommentSubmittedAllowed: false;
  readonly fakeEffectRenderedAllowed: false;
  readonly fakeMp3InsertedAllowed: false;
  readonly fakeMusicLicenseAllowed: false;
  readonly fakeVideoUploadAllowed: false;
  readonly fakePlaybackAllowed: false;
  readonly fakeViewsAllowed: false;
  readonly fakeMonetizationAllowed: false;
  readonly fakePaymentAllowed: false;
  readonly fakeGiftSendingAllowed: false;
  readonly giftSendingImplementedNow: false;
  readonly monetizationImplementedNow: false;
};

export type Stream116AShortsPremiumPolishEvidence = {
  readonly version: "STREAM-116A";
  readonly selectedSectionId: Stream116AShortsPremiumPolishSectionId;
  readonly shortsPremiumScore: number;
  readonly readySections: number;
  readonly totalSections: number;
  readonly sectionItems: readonly Stream116AShortsPremiumPolishSection[];
  readonly heroTitle: string;
  readonly heroSubtitle: string;
  readonly phoneStatus: string;
  readonly primaryAction: string;
  readonly secondaryAction: string;
  readonly creatorProfileReady: boolean;
  readonly shortsPremiumSurfaceReady: boolean;
  readonly likeSaveShareActionsReady: boolean;
  readonly commentsBottomSheetReady: boolean;
  readonly effectsEditorEntryReady: boolean;
  readonly mp3MusicInsertReady: boolean;
  readonly creatorProfileBridgeReady: boolean;
  readonly businessStreamBridgeReady: boolean;
  readonly kernelActionContractReady: boolean;
  readonly giftsMonetizationDeferredReady: boolean;
  readonly shortsPremiumUiuxReady: boolean;
  readonly nextShortsEditorDepthReady: boolean;
  readonly allConnectionsThroughKernel: true;
  readonly directShortsProviderAllowed: false;
  readonly directRealtimeProviderAllowed: false;
  readonly directMediaProviderAllowed: false;
  readonly directMusicProviderAllowed: false;
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
  readonly fakeLikeAllowed: false;
  readonly fakeSaveAllowed: false;
  readonly fakeShareAnalyticsAllowed: false;
  readonly fakeCommentSubmittedAllowed: false;
  readonly fakeEffectRenderedAllowed: false;
  readonly fakeMp3InsertedAllowed: false;
  readonly fakeMusicLicenseAllowed: false;
  readonly fakeVideoUploadAllowed: false;
  readonly fakePlaybackAllowed: false;
  readonly fakeViewsAllowed: false;
  readonly fakeMonetizationAllowed: false;
  readonly fakePaymentAllowed: false;
  readonly fakeGiftSendingAllowed: false;
  readonly giftSendingImplementedNow: false;
  readonly monetizationImplementedNow: false;
};

const SECTION_ORDER: readonly Stream116AShortsPremiumPolishSectionId[] = [
  "shorts_premium_surface",
  "like_save_share_actions",
  "comments_bottom_sheet",
  "effects_editor_entry",
  "mp3_music_insert",
  "creator_profile_bridge",
  "business_stream_bridge",
  "kernel_action_contract",
  "gifts_monetization_deferred",
];

const SECTION_TITLES: Record<Stream116AShortsPremiumPolishSectionId, string> = {
  shorts_premium_surface: "Премиальная поверхность Shorts",
  like_save_share_actions: "Лайк / сохранить / поделиться",
  comments_bottom_sheet: "Панель комментариев",
  effects_editor_entry: "Редактор эффектов",
  mp3_music_insert: "MP3 / музыка",
  creator_profile_bridge: "Связь с профилем автора",
  business_stream_bridge: "Связь с Business Stream",
  kernel_action_contract: "Контракт действий kernel",
  gifts_monetization_deferred: "Подарки позже",
};

const SECTION_DESCRIPTIONS: Record<Stream116AShortsPremiumPolishSectionId, string> = {
  shorts_premium_surface: "Экран Shorts подготовлен как премиальная вертикальная видео-поверхность, а не debug-панель.",
  like_save_share_actions: "Лайк, сохранение и поделиться показаны как честные локальные намерения через Stream kernel, без имитации счётчиков и аналитики.",
  comments_bottom_sheet: "Комментарии используют чистую нижнюю панель и текст модерации без имитации отправки и backend-доставки.",
  effects_editor_entry: "Вход в эффекты виден только как намерение редактора, без имитации рендера и прямого доступа к media-provider.",
  mp3_music_insert: "MP3/музыка подготовлены через музыкальный контракт kernel, без имитации лицензии, вставки или успеха провайдера.",
  creator_profile_bridge: "Контекст профиля автора из 115F подключён вовремя без прямых backend-вызовов профиля.",
  business_stream_bridge: "Контекст Business Stream обозначен для бизнес-авторов без имитации заказа, checkout, Merchant или Wallet готовности.",
  kernel_action_contract: "Все действия Shorts идут через контракты/фасады/события Stream core/kernel, а не напрямую к разрозненным провайдерам.",
  gifts_monetization_deferred: "Подарки и монетизация остаются обязательными позже, но не реализуются в этом UI/UX проходе Shorts.",
};

function uniqueReady(items: readonly Stream116AShortsPremiumPolishSectionId[]): readonly Stream116AShortsPremiumPolishSectionId[] {
  return SECTION_ORDER.filter((item) => items.includes(item));
}

export function createInitialStream116AShortsPremiumPolishState(): Stream116AShortsPremiumPolishState {
  return {
    version: "STREAM-116A",
    selectedSectionId: "shorts_premium_surface",
    readySectionIds: ["kernel_action_contract", "gifts_monetization_deferred"],
    lastAction: "116A начинает premium-polish Shorts после Live, Business Stream и профиля автора: только kernel, без имитации social/video/music/gifts.",
    shortsPremiumSurfaceLocal: false,
    likeSaveShareActionsLocal: false,
    commentsBottomSheetLocal: false,
    effectsEditorEntryLocal: false,
    mp3MusicInsertLocal: false,
    creatorProfileBridgeLocal: false,
    businessStreamBridgeLocal: false,
    kernelActionContractLocal: true,
    giftsMonetizationDeferredLocal: true,
    allConnectionsThroughKernel: true,
    directShortsProviderAllowed: false,
    directRealtimeProviderAllowed: false,
    directMediaProviderAllowed: false,
    directMusicProviderAllowed: false,
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
    fakeLikeAllowed: false,
    fakeSaveAllowed: false,
    fakeShareAnalyticsAllowed: false,
    fakeCommentSubmittedAllowed: false,
    fakeEffectRenderedAllowed: false,
    fakeMp3InsertedAllowed: false,
    fakeMusicLicenseAllowed: false,
    fakeVideoUploadAllowed: false,
    fakePlaybackAllowed: false,
    fakeViewsAllowed: false,
    fakeMonetizationAllowed: false,
    fakePaymentAllowed: false,
    fakeGiftSendingAllowed: false,
    giftSendingImplementedNow: false,
    monetizationImplementedNow: false,
  };
}

function setReadyFlag(state: Stream116AShortsPremiumPolishState, sectionId: Stream116AShortsPremiumPolishSectionId): Stream116AShortsPremiumPolishState {
  return {
    ...state,
    shortsPremiumSurfaceLocal: state.shortsPremiumSurfaceLocal || sectionId === "shorts_premium_surface",
    likeSaveShareActionsLocal: state.likeSaveShareActionsLocal || sectionId === "like_save_share_actions",
    commentsBottomSheetLocal: state.commentsBottomSheetLocal || sectionId === "comments_bottom_sheet",
    effectsEditorEntryLocal: state.effectsEditorEntryLocal || sectionId === "effects_editor_entry",
    mp3MusicInsertLocal: state.mp3MusicInsertLocal || sectionId === "mp3_music_insert",
    creatorProfileBridgeLocal: state.creatorProfileBridgeLocal || sectionId === "creator_profile_bridge",
    businessStreamBridgeLocal: state.businessStreamBridgeLocal || sectionId === "business_stream_bridge",
    kernelActionContractLocal: state.kernelActionContractLocal || sectionId === "kernel_action_contract",
    giftsMonetizationDeferredLocal: state.giftsMonetizationDeferredLocal || sectionId === "gifts_monetization_deferred",
  };
}

export function selectStream116AShortsPremiumPolishSection(
  state: Stream116AShortsPremiumPolishState,
  sectionId: Stream116AShortsPremiumPolishSectionId,
): Stream116AShortsPremiumPolishState {
  return {
    ...state,
    selectedSectionId: sectionId,
    lastAction: `116A выбран раздел: ${SECTION_TITLES[sectionId]}`,
  };
}

export function markStream116AShortsPremiumPolishSectionReady(
  state: Stream116AShortsPremiumPolishState,
  sectionId: Stream116AShortsPremiumPolishSectionId,
  action: string,
): Stream116AShortsPremiumPolishState {
  const next = setReadyFlag(state, sectionId);
  return {
    ...next,
    selectedSectionId: sectionId,
    readySectionIds: uniqueReady([...next.readySectionIds, sectionId]),
    lastAction: action,
  };
}

export function markStream116AShortsPremiumPolishAllReady(
  state: Stream116AShortsPremiumPolishState,
  action: string,
): Stream116AShortsPremiumPolishState {
  return {
    ...state,
    readySectionIds: SECTION_ORDER,
    lastAction: action,
    shortsPremiumSurfaceLocal: true,
    likeSaveShareActionsLocal: true,
    commentsBottomSheetLocal: true,
    effectsEditorEntryLocal: true,
    mp3MusicInsertLocal: true,
    creatorProfileBridgeLocal: true,
    businessStreamBridgeLocal: true,
    kernelActionContractLocal: true,
    giftsMonetizationDeferredLocal: true,
  };
}

export function buildStream116AShortsPremiumPolishEvidence(
  state: Stream116AShortsPremiumPolishState,
  room: StreamRoomRuntimeState,
  creatorProfile: Stream115FCreatorFinalHandoffEvidence,
): Stream116AShortsPremiumPolishEvidence {
  const readySections = state.readySectionIds.length;
  const totalSections = SECTION_ORDER.length;
  const creatorProfileReady = creatorProfile.creatorProfileUiuxReady;
  const sectionItems: readonly Stream116AShortsPremiumPolishSection[] = SECTION_ORDER.map((id) => ({
    id,
    title: SECTION_TITLES[id],
    description: SECTION_DESCRIPTIONS[id],
    status: state.readySectionIds.includes(id) ? "ready" : "needs_polish",
  }));
  const shortsPremiumScore = Math.round((readySections / totalSections) * 100);
  const shortsPremiumSurfaceReady = state.shortsPremiumSurfaceLocal;
  const likeSaveShareActionsReady = state.likeSaveShareActionsLocal;
  const commentsBottomSheetReady = state.commentsBottomSheetLocal;
  const effectsEditorEntryReady = state.effectsEditorEntryLocal;
  const mp3MusicInsertReady = state.mp3MusicInsertLocal;
  const creatorProfileBridgeReady = state.creatorProfileBridgeLocal && creatorProfileReady;
  const businessStreamBridgeReady = state.businessStreamBridgeLocal;
  const kernelActionContractReady = state.kernelActionContractLocal && state.allConnectionsThroughKernel;
  const giftsMonetizationDeferredReady = state.giftsMonetizationDeferredLocal && !state.giftSendingImplementedNow && !state.monetizationImplementedNow;
  const shortsPremiumUiuxReady = shortsPremiumScore === 100
    && creatorProfileReady
    && shortsPremiumSurfaceReady
    && likeSaveShareActionsReady
    && commentsBottomSheetReady
    && effectsEditorEntryReady
    && mp3MusicInsertReady
    && creatorProfileBridgeReady
    && businessStreamBridgeReady
    && kernelActionContractReady
    && giftsMonetizationDeferredReady;

  return {
    version: "STREAM-116A",
    selectedSectionId: state.selectedSectionId,
    shortsPremiumScore,
    readySections,
    totalSections,
    sectionItems,
    heroTitle: "Премиальная полировка Shorts",
    heroSubtitle: "Лайк, сохранение, поделиться, комментарии, эффекты, MP3/музыка и вход в редактор собираются в один premium Shorts UX через Stream kernel.",
    phoneStatus: `${room.title || "Sabi Shorts"} · Shorts UI/kernel intent`,
    primaryAction: state.lastAction,
    secondaryAction: shortsPremiumUiuxReady ? "116A premium-основа Shorts принята. Далее: глубокая чистка редактора, эффектов и музыки." : "Закрой поверхность Shorts, social-действия, комментарии, эффекты, MP3/музыку и kernel-контракт перед углублением.",
    creatorProfileReady,
    shortsPremiumSurfaceReady,
    likeSaveShareActionsReady,
    commentsBottomSheetReady,
    effectsEditorEntryReady,
    mp3MusicInsertReady,
    creatorProfileBridgeReady,
    businessStreamBridgeReady,
    kernelActionContractReady,
    giftsMonetizationDeferredReady,
    shortsPremiumUiuxReady,
    nextShortsEditorDepthReady: shortsPremiumUiuxReady,
    allConnectionsThroughKernel: state.allConnectionsThroughKernel,
    directShortsProviderAllowed: state.directShortsProviderAllowed,
    directRealtimeProviderAllowed: state.directRealtimeProviderAllowed,
    directMediaProviderAllowed: state.directMediaProviderAllowed,
    directMusicProviderAllowed: state.directMusicProviderAllowed,
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
    fakeLikeAllowed: state.fakeLikeAllowed,
    fakeSaveAllowed: state.fakeSaveAllowed,
    fakeShareAnalyticsAllowed: state.fakeShareAnalyticsAllowed,
    fakeCommentSubmittedAllowed: state.fakeCommentSubmittedAllowed,
    fakeEffectRenderedAllowed: state.fakeEffectRenderedAllowed,
    fakeMp3InsertedAllowed: state.fakeMp3InsertedAllowed,
    fakeMusicLicenseAllowed: state.fakeMusicLicenseAllowed,
    fakeVideoUploadAllowed: state.fakeVideoUploadAllowed,
    fakePlaybackAllowed: state.fakePlaybackAllowed,
    fakeViewsAllowed: state.fakeViewsAllowed,
    fakeMonetizationAllowed: state.fakeMonetizationAllowed,
    fakePaymentAllowed: state.fakePaymentAllowed,
    fakeGiftSendingAllowed: state.fakeGiftSendingAllowed,
    giftSendingImplementedNow: state.giftSendingImplementedNow,
    monetizationImplementedNow: state.monetizationImplementedNow,
  };
}
