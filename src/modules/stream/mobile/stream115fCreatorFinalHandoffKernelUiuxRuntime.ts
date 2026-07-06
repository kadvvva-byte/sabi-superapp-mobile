import type { StreamRoomRuntimeState } from "./streamRoomRuntime";
import type { StreamRoomStageRuntimeState } from "./streamRoomStageRuntime";
import type { Stream115ECreatorPrivacySafetyEvidence } from "./stream115eCreatorPrivacySafetyKernelUiuxRuntime";

export type Stream115FCreatorFinalHandoffSectionId =
  | "profile_product_surface"
  | "creator_identity_clean"
  | "live_business_context"
  | "content_tabs_grid"
  | "engagement_privacy_safety"
  | "official_streamer_boundary"
  | "language_kernel_boundary"
  | "gifts_monetization_deferred"
  | "final_stream_profile_handoff";

export type Stream115FCreatorFinalHandoffStatus = "ready" | "needs_polish";

export type Stream115FCreatorFinalHandoffSection = {
  readonly id: Stream115FCreatorFinalHandoffSectionId;
  readonly title: string;
  readonly description: string;
  readonly status: Stream115FCreatorFinalHandoffStatus;
};

export type Stream115FCreatorFinalHandoffState = {
  readonly version: "STREAM-115F";
  readonly selectedSectionId: Stream115FCreatorFinalHandoffSectionId;
  readonly readySectionIds: readonly Stream115FCreatorFinalHandoffSectionId[];
  readonly lastAction: string;
  readonly profileProductSurfaceLocal: boolean;
  readonly creatorIdentityCleanLocal: boolean;
  readonly liveBusinessContextLocal: boolean;
  readonly contentTabsGridLocal: boolean;
  readonly engagementPrivacySafetyLocal: boolean;
  readonly officialStreamerBoundaryLocal: boolean;
  readonly languageKernelBoundaryLocal: boolean;
  readonly giftsMonetizationDeferredLocal: boolean;
  readonly finalStreamProfileHandoffLocal: boolean;
  readonly allConnectionsThroughKernel: true;
  readonly directProfileProviderAllowed: false;
  readonly directRealtimeProviderAllowed: false;
  readonly directBusinessProviderAllowed: false;
  readonly directMessengerProviderAllowed: false;
  readonly directWalletConnectionAllowed: false;
  readonly directGiftPaymentAllowed: false;
  readonly profileBackendTouchedNow: false;
  readonly businessBackendTouchedNow: false;
  readonly messengerTouchedNow: false;
  readonly walletTouchedNow: false;
  readonly mainAiTouchedNow: false;
  readonly fakeCreatorProfileSavedAllowed: false;
  readonly fakeOfficialVerificationAllowed: false;
  readonly fakeFollowersAllowed: false;
  readonly fakeLiveStatusAllowed: false;
  readonly fakeShortsPlaybackAllowed: false;
  readonly fakeMessageSentAllowed: false;
  readonly fakeNotificationSubscriptionAllowed: false;
  readonly fakeBusinessVerificationAllowed: false;
  readonly fakeMonetizationAllowed: false;
  readonly fakePaymentAllowed: false;
  readonly fakeGiftSendingAllowed: false;
  readonly giftSendingImplementedNow: false;
  readonly monetizationImplementedNow: false;
};

export type Stream115FCreatorFinalHandoffEvidence = {
  readonly version: "STREAM-115F";
  readonly selectedSectionId: Stream115FCreatorFinalHandoffSectionId;
  readonly finalHandoffScore: number;
  readonly readySections: number;
  readonly totalSections: number;
  readonly sectionItems: readonly Stream115FCreatorFinalHandoffSection[];
  readonly heroTitle: string;
  readonly heroSubtitle: string;
  readonly phoneStatus: string;
  readonly primaryAction: string;
  readonly secondaryAction: string;
  readonly privacySafetyReady: boolean;
  readonly profileProductSurfaceReady: boolean;
  readonly creatorIdentityCleanReady: boolean;
  readonly liveBusinessContextReady: boolean;
  readonly contentTabsGridReady: boolean;
  readonly engagementPrivacySafetyReady: boolean;
  readonly officialStreamerBoundaryReady: boolean;
  readonly languageKernelBoundaryReady: boolean;
  readonly giftsMonetizationDeferredReady: boolean;
  readonly finalStreamProfileHandoffReady: boolean;
  readonly creatorProfileUiuxReady: boolean;
  readonly nextShortsPremiumPolishReady: boolean;
  readonly allConnectionsThroughKernel: true;
  readonly directProfileProviderAllowed: false;
  readonly directRealtimeProviderAllowed: false;
  readonly directBusinessProviderAllowed: false;
  readonly directMessengerProviderAllowed: false;
  readonly directWalletConnectionAllowed: false;
  readonly directGiftPaymentAllowed: false;
  readonly profileBackendTouchedNow: false;
  readonly businessBackendTouchedNow: false;
  readonly messengerTouchedNow: false;
  readonly walletTouchedNow: false;
  readonly mainAiTouchedNow: false;
  readonly fakeCreatorProfileSavedAllowed: false;
  readonly fakeOfficialVerificationAllowed: false;
  readonly fakeFollowersAllowed: false;
  readonly fakeLiveStatusAllowed: false;
  readonly fakeShortsPlaybackAllowed: false;
  readonly fakeMessageSentAllowed: false;
  readonly fakeNotificationSubscriptionAllowed: false;
  readonly fakeBusinessVerificationAllowed: false;
  readonly fakeMonetizationAllowed: false;
  readonly fakePaymentAllowed: false;
  readonly fakeGiftSendingAllowed: false;
  readonly giftSendingImplementedNow: false;
  readonly monetizationImplementedNow: false;
};

const SECTION_ORDER: readonly Stream115FCreatorFinalHandoffSectionId[] = [
  "profile_product_surface",
  "creator_identity_clean",
  "live_business_context",
  "content_tabs_grid",
  "engagement_privacy_safety",
  "official_streamer_boundary",
  "language_kernel_boundary",
  "gifts_monetization_deferred",
  "final_stream_profile_handoff",
];

const SECTION_TITLES: Record<Stream115FCreatorFinalHandoffSectionId, string> = {
  profile_product_surface: "Продуктовая поверхность профиля",
  creator_identity_clean: "Личность автора",
  live_business_context: "Live и бизнес-контекст",
  content_tabs_grid: "Вкладки контента",
  engagement_privacy_safety: "Действия и безопасность",
  official_streamer_boundary: "Граница официального стримера",
  language_kernel_boundary: "25 languages + kernel",
  gifts_monetization_deferred: "Подарки позже",
  final_stream_profile_handoff: "Передача профиля",
};

const SECTION_DESCRIPTIONS: Record<Stream115FCreatorFinalHandoffSectionId, string> = {
  profile_product_surface: "Профиль автора показан как чистая телефонная продуктовая поверхность, а не QA/debug-доска.",
  creator_identity_clean: "Аватар, обложка, описание, категория и тексты личности подготовлены без фейкового сохранения профиля или верификации.",
  live_business_context: "Live status and Business creator context are named on time without fake live, merchant, order or payment readiness.",
  content_tabs_grid: "Live archive, Shorts grid, replays and pinned content are prepared as kernel content intents, not fake playback or fake counts.",
  engagement_privacy_safety: "Подписка, поделиться, контакт, жалоба, приватность и безопасность сгруппированы без фейкового backend enforcement.",
  official_streamer_boundary: "Official streamer application is a future review path, not fake badge, fake document approval or fake eligibility.",
  language_kernel_boundary: "Профиль наследует 25-язычный слой Stream и ведёт все подключения через контракты/фасады/события ядра Stream.",
  gifts_monetization_deferred: "Подарки и монетизация обязательны позже, но остаются отложены до финального этапа подарков/монетизации Stream.",
  final_stream_profile_handoff: "UI/UX профиля автора готов для передачи перед возвратом к premium polish Shorts.",
};

function uniqueReady(items: readonly Stream115FCreatorFinalHandoffSectionId[]): readonly Stream115FCreatorFinalHandoffSectionId[] {
  return SECTION_ORDER.filter((item) => items.includes(item));
}

export function createInitialStream115FCreatorFinalHandoffState(): Stream115FCreatorFinalHandoffState {
  return {
    version: "STREAM-115F",
    selectedSectionId: "profile_product_surface",
    readySectionIds: ["language_kernel_boundary", "gifts_monetization_deferred"],
    lastAction: "115F начинает финальную передачу профиля автора: только ядро, 25 языков, без фейкового сохранения профиля, верификации и подарков.",
    profileProductSurfaceLocal: false,
    creatorIdentityCleanLocal: false,
    liveBusinessContextLocal: false,
    contentTabsGridLocal: false,
    engagementPrivacySafetyLocal: false,
    officialStreamerBoundaryLocal: false,
    languageKernelBoundaryLocal: true,
    giftsMonetizationDeferredLocal: true,
    finalStreamProfileHandoffLocal: false,
    allConnectionsThroughKernel: true,
    directProfileProviderAllowed: false,
    directRealtimeProviderAllowed: false,
    directBusinessProviderAllowed: false,
    directMessengerProviderAllowed: false,
    directWalletConnectionAllowed: false,
    directGiftPaymentAllowed: false,
    profileBackendTouchedNow: false,
    businessBackendTouchedNow: false,
    messengerTouchedNow: false,
    walletTouchedNow: false,
    mainAiTouchedNow: false,
    fakeCreatorProfileSavedAllowed: false,
    fakeOfficialVerificationAllowed: false,
    fakeFollowersAllowed: false,
    fakeLiveStatusAllowed: false,
    fakeShortsPlaybackAllowed: false,
    fakeMessageSentAllowed: false,
    fakeNotificationSubscriptionAllowed: false,
    fakeBusinessVerificationAllowed: false,
    fakeMonetizationAllowed: false,
    fakePaymentAllowed: false,
    fakeGiftSendingAllowed: false,
    giftSendingImplementedNow: false,
    monetizationImplementedNow: false,
  };
}

function setReadyFlag(state: Stream115FCreatorFinalHandoffState, sectionId: Stream115FCreatorFinalHandoffSectionId): Stream115FCreatorFinalHandoffState {
  return {
    ...state,
    profileProductSurfaceLocal: state.profileProductSurfaceLocal || sectionId === "profile_product_surface",
    creatorIdentityCleanLocal: state.creatorIdentityCleanLocal || sectionId === "creator_identity_clean",
    liveBusinessContextLocal: state.liveBusinessContextLocal || sectionId === "live_business_context",
    contentTabsGridLocal: state.contentTabsGridLocal || sectionId === "content_tabs_grid",
    engagementPrivacySafetyLocal: state.engagementPrivacySafetyLocal || sectionId === "engagement_privacy_safety",
    officialStreamerBoundaryLocal: state.officialStreamerBoundaryLocal || sectionId === "official_streamer_boundary",
    languageKernelBoundaryLocal: state.languageKernelBoundaryLocal || sectionId === "language_kernel_boundary",
    giftsMonetizationDeferredLocal: state.giftsMonetizationDeferredLocal || sectionId === "gifts_monetization_deferred",
    finalStreamProfileHandoffLocal: state.finalStreamProfileHandoffLocal || sectionId === "final_stream_profile_handoff",
  };
}

export function selectStream115FCreatorFinalHandoffSection(
  state: Stream115FCreatorFinalHandoffState,
  sectionId: Stream115FCreatorFinalHandoffSectionId,
): Stream115FCreatorFinalHandoffState {
  return {
    ...state,
    selectedSectionId: sectionId,
    lastAction: `115F selected ${SECTION_TITLES[sectionId]} for creator profile final handoff polish.`,
  };
}

export function markStream115FCreatorFinalHandoffSectionReady(
  state: Stream115FCreatorFinalHandoffState,
  sectionId: Stream115FCreatorFinalHandoffSectionId,
  action: string,
): Stream115FCreatorFinalHandoffState {
  const next = setReadyFlag(state, sectionId);
  return {
    ...next,
    selectedSectionId: sectionId,
    readySectionIds: uniqueReady([...next.readySectionIds, sectionId]),
    lastAction: action,
  };
}

export function markStream115FCreatorFinalHandoffAllReady(
  state: Stream115FCreatorFinalHandoffState,
  action = "115F финальная передача профиля автора product-ready, только ядро, 25 языков, без фейковой верификации/подарков.",
): Stream115FCreatorFinalHandoffState {
  return {
    ...state,
    selectedSectionId: "final_stream_profile_handoff",
    readySectionIds: SECTION_ORDER,
    lastAction: action,
    profileProductSurfaceLocal: true,
    creatorIdentityCleanLocal: true,
    liveBusinessContextLocal: true,
    contentTabsGridLocal: true,
    engagementPrivacySafetyLocal: true,
    officialStreamerBoundaryLocal: true,
    languageKernelBoundaryLocal: true,
    giftsMonetizationDeferredLocal: true,
    finalStreamProfileHandoffLocal: true,
  };
}

export function buildStream115FCreatorFinalHandoffEvidence(
  state: Stream115FCreatorFinalHandoffState,
  room: StreamRoomRuntimeState,
  stage: StreamRoomStageRuntimeState,
  privacyEvidence: Stream115ECreatorPrivacySafetyEvidence,
): Stream115FCreatorFinalHandoffEvidence {
  const sectionItems = SECTION_ORDER.map((id): Stream115FCreatorFinalHandoffSection => ({
    id,
    title: SECTION_TITLES[id],
    description: SECTION_DESCRIPTIONS[id],
    status: state.readySectionIds.includes(id) ? "ready" : "needs_polish",
  }));
  const readySections = sectionItems.filter((item) => item.status === "ready").length;
  const totalSections = sectionItems.length;
  const finalHandoffScore = Math.round((readySections / totalSections) * 100);
  const privacySafetyReady = privacyEvidence.creatorPrivacySafetyUiuxReady;
  const profileProductSurfaceReady = state.profileProductSurfaceLocal || state.readySectionIds.includes("profile_product_surface");
  const creatorIdentityCleanReady = state.creatorIdentityCleanLocal || state.readySectionIds.includes("creator_identity_clean");
  const liveBusinessContextReady = state.liveBusinessContextLocal || state.readySectionIds.includes("live_business_context");
  const contentTabsGridReady = state.contentTabsGridLocal || state.readySectionIds.includes("content_tabs_grid");
  const engagementPrivacySafetyReady = privacySafetyReady && (state.engagementPrivacySafetyLocal || state.readySectionIds.includes("engagement_privacy_safety"));
  const officialStreamerBoundaryReady = state.officialStreamerBoundaryLocal || state.readySectionIds.includes("official_streamer_boundary");
  const languageKernelBoundaryReady = state.languageKernelBoundaryLocal && state.allConnectionsThroughKernel;
  const giftsMonetizationDeferredReady = state.giftsMonetizationDeferredLocal && !state.giftSendingImplementedNow && !state.monetizationImplementedNow;
  const finalStreamProfileHandoffReady = state.finalStreamProfileHandoffLocal || state.readySectionIds.includes("final_stream_profile_handoff");
  const creatorProfileUiuxReady = privacySafetyReady
    && profileProductSurfaceReady
    && creatorIdentityCleanReady
    && liveBusinessContextReady
    && contentTabsGridReady
    && engagementPrivacySafetyReady
    && officialStreamerBoundaryReady
    && languageKernelBoundaryReady
    && giftsMonetizationDeferredReady
    && finalStreamProfileHandoffReady
    && state.fakeCreatorProfileSavedAllowed === false
    && state.fakeOfficialVerificationAllowed === false
    && state.fakeFollowersAllowed === false
    && state.fakeLiveStatusAllowed === false
    && state.fakeShortsPlaybackAllowed === false
    && state.fakeMessageSentAllowed === false
    && state.fakeNotificationSubscriptionAllowed === false
    && state.fakeBusinessVerificationAllowed === false
    && state.fakeGiftSendingAllowed === false;

  return {
    version: "STREAM-115F",
    selectedSectionId: state.selectedSectionId,
    finalHandoffScore,
    readySections,
    totalSections,
    sectionItems,
    heroTitle: "Профиль автора готов как чистая продуктовая поверхность Stream",
    heroSubtitle: "Профиль, личность, вкладки, вовлечение, приватность, граница официального стримера, бизнес-контекст и 25-язычные тексты ядра собраны без фейкового backend success.",
    phoneStatus: creatorProfileUiuxReady ? "UI/UX профиля автора принят. Дальше: premium polish для Shorts." : `Профилю автора нужно ${totalSections - readySections} проверок handoff.`,
    primaryAction: "Закрой профиль автора как продуктовый UI/kernel intent перед возвратом к premium polish Shorts.",
    secondaryAction: `Room ${room.roomId} · stage ${stage.status} · все действия profile/provider/business/gift остаются за границами ядра Stream.`,
    privacySafetyReady,
    profileProductSurfaceReady,
    creatorIdentityCleanReady,
    liveBusinessContextReady,
    contentTabsGridReady,
    engagementPrivacySafetyReady,
    officialStreamerBoundaryReady,
    languageKernelBoundaryReady,
    giftsMonetizationDeferredReady,
    finalStreamProfileHandoffReady,
    creatorProfileUiuxReady,
    nextShortsPremiumPolishReady: creatorProfileUiuxReady,
    allConnectionsThroughKernel: state.allConnectionsThroughKernel,
    directProfileProviderAllowed: state.directProfileProviderAllowed,
    directRealtimeProviderAllowed: state.directRealtimeProviderAllowed,
    directBusinessProviderAllowed: state.directBusinessProviderAllowed,
    directMessengerProviderAllowed: state.directMessengerProviderAllowed,
    directWalletConnectionAllowed: state.directWalletConnectionAllowed,
    directGiftPaymentAllowed: state.directGiftPaymentAllowed,
    profileBackendTouchedNow: state.profileBackendTouchedNow,
    businessBackendTouchedNow: state.businessBackendTouchedNow,
    messengerTouchedNow: state.messengerTouchedNow,
    walletTouchedNow: state.walletTouchedNow,
    mainAiTouchedNow: state.mainAiTouchedNow,
    fakeCreatorProfileSavedAllowed: state.fakeCreatorProfileSavedAllowed,
    fakeOfficialVerificationAllowed: state.fakeOfficialVerificationAllowed,
    fakeFollowersAllowed: state.fakeFollowersAllowed,
    fakeLiveStatusAllowed: state.fakeLiveStatusAllowed,
    fakeShortsPlaybackAllowed: state.fakeShortsPlaybackAllowed,
    fakeMessageSentAllowed: state.fakeMessageSentAllowed,
    fakeNotificationSubscriptionAllowed: state.fakeNotificationSubscriptionAllowed,
    fakeBusinessVerificationAllowed: state.fakeBusinessVerificationAllowed,
    fakeMonetizationAllowed: state.fakeMonetizationAllowed,
    fakePaymentAllowed: state.fakePaymentAllowed,
    fakeGiftSendingAllowed: state.fakeGiftSendingAllowed,
    giftSendingImplementedNow: state.giftSendingImplementedNow,
    monetizationImplementedNow: state.monetizationImplementedNow,
  };
}
