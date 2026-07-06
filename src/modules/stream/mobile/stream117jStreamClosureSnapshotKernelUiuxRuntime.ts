import type { StreamRoomRuntimeState } from "./streamRoomRuntime";
import type { Stream117IIntegrationRecoveryEvidence } from "./stream117iIntegrationRecoveryKernelUiuxRuntime";

export type Stream117JClosureSnapshotSectionId =
  | "closure_surface_ready"
  | "product_scope_snapshot"
  | "live_business_profile_shorts_closed"
  | "uiux_acceptance_snapshot"
  | "backend_provider_boundary_snapshot"
  | "install_safety_inherited"
  | "language_safety_inherited"
  | "gifts_monetization_last"
  | "owner_next_decision"
  | "archive_handoff_ready"
  | "no_launch_claim";

export type Stream117JClosureSnapshotStatus = "ready" | "blocked";

export type Stream117JClosureSnapshotSection = {
  readonly id: Stream117JClosureSnapshotSectionId;
  readonly title: string;
  readonly description: string;
  readonly status: Stream117JClosureSnapshotStatus;
};

export type Stream117JClosureSnapshotState = {
  readonly version: "STREAM-117J";
  readonly selectedSectionId: Stream117JClosureSnapshotSectionId;
  readonly readySectionIds: readonly Stream117JClosureSnapshotSectionId[];
  readonly lastAction: string;
  readonly closureSurfaceReadyLocal: boolean;
  readonly productScopeSnapshotLocal: boolean;
  readonly liveBusinessProfileShortsClosedLocal: boolean;
  readonly uiuxAcceptanceSnapshotLocal: boolean;
  readonly backendProviderBoundarySnapshotLocal: boolean;
  readonly installSafetyInheritedLocal: boolean;
  readonly languageSafetyInheritedLocal: boolean;
  readonly giftsMonetizationLastLocal: boolean;
  readonly ownerNextDecisionLocal: boolean;
  readonly archiveHandoffReadyLocal: boolean;
  readonly noLaunchClaimLocal: boolean;
  readonly allConnectionsThroughKernel: true;
  readonly finalUiuxClosureOnly: true;
  readonly integrationRecoveryRequired: true;
  readonly ownerApprovedScopeRequiredForRealWork: true;
  readonly backendProviderImplementationStartedNow: false;
  readonly providerActivatedNow: false;
  readonly realtimeProviderActivatedNow: false;
  readonly mediaProviderActivatedNow: false;
  readonly uploadProviderActivatedNow: false;
  readonly playbackProviderActivatedNow: false;
  readonly analyticsProviderActivatedNow: false;
  readonly moderationProviderActivatedNow: false;
  readonly envSecretsCollectedInMobile: false;
  readonly envSecretsReturnedToUi: false;
  readonly directRealtimeProviderAllowed: false;
  readonly directMediaProviderAllowed: false;
  readonly directUploadProviderAllowed: false;
  readonly directPlaybackProviderAllowed: false;
  readonly directAnalyticsProviderAllowed: false;
  readonly directModerationProviderAllowed: false;
  readonly directWalletProviderAllowed: false;
  readonly directGiftPaymentAllowed: false;
  readonly walletTouchedNow: false;
  readonly messengerTouchedNow: false;
  readonly mainAiTouchedNow: false;
  readonly fakeLaunchAllowed: false;
  readonly fakeLiveAllowed: false;
  readonly fakeRealtimeAllowed: false;
  readonly fakeProviderAllowed: false;
  readonly fakeUploadAllowed: false;
  readonly fakePublishAllowed: false;
  readonly fakePlaybackAllowed: false;
  readonly fakeViewsAllowed: false;
  readonly fakeAnalyticsAllowed: false;
  readonly fakeModerationAllowed: false;
  readonly fakeOrderAllowed: false;
  readonly fakePaymentAllowed: false;
  readonly fakeGiftSendingAllowed: false;
  readonly giftSendingImplementedNow: false;
  readonly monetizationImplementedNow: false;
};

export type Stream117JClosureSnapshotEvidence = {
  readonly version: "STREAM-117J";
  readonly selectedSectionId: Stream117JClosureSnapshotSectionId;
  readonly closureScore: number;
  readonly readySections: number;
  readonly totalSections: number;
  readonly sectionItems: readonly Stream117JClosureSnapshotSection[];
  readonly heroTitle: string;
  readonly heroSubtitle: string;
  readonly phoneStatus: string;
  readonly primaryAction: string;
  readonly secondaryAction: string;
  readonly closureSurfaceReady: boolean;
  readonly productScopeSnapshot: boolean;
  readonly liveBusinessProfileShortsClosed: boolean;
  readonly uiuxAcceptanceSnapshot: boolean;
  readonly backendProviderBoundarySnapshot: boolean;
  readonly installSafetyInherited: boolean;
  readonly languageSafetyInherited: boolean;
  readonly giftsMonetizationLast: boolean;
  readonly ownerNextDecision: boolean;
  readonly archiveHandoffReady: boolean;
  readonly noLaunchClaim: boolean;
  readonly integrationRecoveryReady: boolean;
  readonly streamUiuxClosureReady: boolean;
  readonly allConnectionsThroughKernel: true;
  readonly finalUiuxClosureOnly: true;
  readonly integrationRecoveryRequired: true;
  readonly ownerApprovedScopeRequiredForRealWork: true;
  readonly backendProviderImplementationStartedNow: false;
  readonly providerActivatedNow: false;
  readonly realtimeProviderActivatedNow: false;
  readonly mediaProviderActivatedNow: false;
  readonly uploadProviderActivatedNow: false;
  readonly playbackProviderActivatedNow: false;
  readonly analyticsProviderActivatedNow: false;
  readonly moderationProviderActivatedNow: false;
  readonly envSecretsCollectedInMobile: false;
  readonly envSecretsReturnedToUi: false;
  readonly directRealtimeProviderAllowed: false;
  readonly directMediaProviderAllowed: false;
  readonly directUploadProviderAllowed: false;
  readonly directPlaybackProviderAllowed: false;
  readonly directAnalyticsProviderAllowed: false;
  readonly directModerationProviderAllowed: false;
  readonly directWalletProviderAllowed: false;
  readonly directGiftPaymentAllowed: false;
  readonly walletTouchedNow: false;
  readonly messengerTouchedNow: false;
  readonly mainAiTouchedNow: false;
  readonly fakeLaunchAllowed: false;
  readonly fakeLiveAllowed: false;
  readonly fakeRealtimeAllowed: false;
  readonly fakeProviderAllowed: false;
  readonly fakeUploadAllowed: false;
  readonly fakePublishAllowed: false;
  readonly fakePlaybackAllowed: false;
  readonly fakeViewsAllowed: false;
  readonly fakeAnalyticsAllowed: false;
  readonly fakeModerationAllowed: false;
  readonly fakeOrderAllowed: false;
  readonly fakePaymentAllowed: false;
  readonly fakeGiftSendingAllowed: false;
  readonly giftSendingImplementedNow: false;
  readonly monetizationImplementedNow: false;
};

const SECTION_COPY: Record<Stream117JClosureSnapshotSectionId, { title: string; description: string }> = {
  closure_surface_ready: {
    title: "Closure поверхность",
    description: "Владелец sees one финальный Stream UI/UX closure snapshot instead of another фейк запуск screen.",
  },
  product_scope_snapshot: {
    title: "Продукт scope snapshot",
    description: "Эфир, Бизнес Stream, профиль автора and Шорты are summarized as the current продукт UI/UX scope.",
  },
  live_business_profile_shorts_closed: {
    title: "Four pillars closed",
    description: "The UI/UX closure keeps Эфир, Бизнес, Профиль and Шорты together without jumping to Wallet or подарки now.",
  },
  uiux_acceptance_snapshot: {
    title: "UI/UX acceptance",
    description: "This is a UI/UX acceptance snapshot only; real бэкенд/провайдер execution remains separate.",
  },
  backend_provider_boundary_snapshot: {
    title: "Бэкенд/провайдер граница",
    description: "Реалтайм, медиа, загрузка, воспроизведение and moderation провайдер work is visible but still заблокирован here.",
  },
  install_safety_inherited: {
    title: "Install safety inherited",
    description: "The 117I install, cumulative patch and TypeScript regression guards remain required before any следующий scope.",
  },
  language_safety_inherited: {
    title: "Language/safety inherited",
    description: "The 25-language, AI moderation, 18+ and Админ проверка boundaries stay inherited from Stream readiness.",
  },
  gifts_monetization_last: {
    title: "Подарки/monetization last",
    description: "Подарки, diamonds, Wallet, merchant and paid creator earnings remain the финальный Stream этап.",
  },
  owner_next_decision: {
    title: "Владелец следующий decision",
    description: "The следующий move must be an explicit владелец-approved бэкенд/провайдер slice, not a hidden UI shortcut.",
  },
  archive_handoff_ready: {
    title: "Archive передача",
    description: "The closure snapshot becomes the передача record for the следующий chat or бэкенд/провайдер execution step.",
  },
  no_launch_claim: {
    title: "No запуск claim",
    description: "No фейк go-live, фейк провайдер success, фейк воспроизведение, фейк order, фейк платёж or фейк подарок sending is claimed.",
  },
};

const ALL_SECTIONS: readonly Stream117JClosureSnapshotSectionId[] = [
  "closure_surface_ready",
  "product_scope_snapshot",
  "live_business_profile_shorts_closed",
  "uiux_acceptance_snapshot",
  "backend_provider_boundary_snapshot",
  "install_safety_inherited",
  "language_safety_inherited",
  "gifts_monetization_last",
  "owner_next_decision",
  "archive_handoff_ready",
  "no_launch_claim",
];

const FIELD_BY_SECTION: Record<Stream117JClosureSnapshotSectionId, keyof Pick<
  Stream117JClosureSnapshotState,
  | "closureSurfaceReadyLocal"
  | "productScopeSnapshotLocal"
  | "liveBusinessProfileShortsClosedLocal"
  | "uiuxAcceptanceSnapshotLocal"
  | "backendProviderBoundarySnapshotLocal"
  | "installSafetyInheritedLocal"
  | "languageSafetyInheritedLocal"
  | "giftsMonetizationLastLocal"
  | "ownerNextDecisionLocal"
  | "archiveHandoffReadyLocal"
  | "noLaunchClaimLocal"
>> = {
  closure_surface_ready: "closureSurfaceReadyLocal",
  product_scope_snapshot: "productScopeSnapshotLocal",
  live_business_profile_shorts_closed: "liveBusinessProfileShortsClosedLocal",
  uiux_acceptance_snapshot: "uiuxAcceptanceSnapshotLocal",
  backend_provider_boundary_snapshot: "backendProviderBoundarySnapshotLocal",
  install_safety_inherited: "installSafetyInheritedLocal",
  language_safety_inherited: "languageSafetyInheritedLocal",
  gifts_monetization_last: "giftsMonetizationLastLocal",
  owner_next_decision: "ownerNextDecisionLocal",
  archive_handoff_ready: "archiveHandoffReadyLocal",
  no_launch_claim: "noLaunchClaimLocal",
};

function uniqueSectionIds(sectionIds: readonly Stream117JClosureSnapshotSectionId[]): readonly Stream117JClosureSnapshotSectionId[] {
  return ALL_SECTIONS.filter((sectionId) => sectionIds.includes(sectionId));
}

export function createInitialStream117JClosureSnapshotState(): Stream117JClosureSnapshotState {
  return {
    version: "STREAM-117J",
    selectedSectionId: "closure_surface_ready",
    readySectionIds: [],
    lastAction: "117J Stream финальный UI/UX closure snapshot is waiting for владелец проверка.",
    closureSurfaceReadyLocal: false,
    productScopeSnapshotLocal: false,
    liveBusinessProfileShortsClosedLocal: false,
    uiuxAcceptanceSnapshotLocal: false,
    backendProviderBoundarySnapshotLocal: false,
    installSafetyInheritedLocal: false,
    languageSafetyInheritedLocal: false,
    giftsMonetizationLastLocal: false,
    ownerNextDecisionLocal: false,
    archiveHandoffReadyLocal: false,
    noLaunchClaimLocal: false,
    allConnectionsThroughKernel: true,
    finalUiuxClosureOnly: true,
    integrationRecoveryRequired: true,
    ownerApprovedScopeRequiredForRealWork: true,
    backendProviderImplementationStartedNow: false,
    providerActivatedNow: false,
    realtimeProviderActivatedNow: false,
    mediaProviderActivatedNow: false,
    uploadProviderActivatedNow: false,
    playbackProviderActivatedNow: false,
    analyticsProviderActivatedNow: false,
    moderationProviderActivatedNow: false,
    envSecretsCollectedInMobile: false,
    envSecretsReturnedToUi: false,
    directRealtimeProviderAllowed: false,
    directMediaProviderAllowed: false,
    directUploadProviderAllowed: false,
    directPlaybackProviderAllowed: false,
    directAnalyticsProviderAllowed: false,
    directModerationProviderAllowed: false,
    directWalletProviderAllowed: false,
    directGiftPaymentAllowed: false,
    walletTouchedNow: false,
    messengerTouchedNow: false,
    mainAiTouchedNow: false,
    fakeLaunchAllowed: false,
    fakeLiveAllowed: false,
    fakeRealtimeAllowed: false,
    fakeProviderAllowed: false,
    fakeUploadAllowed: false,
    fakePublishAllowed: false,
    fakePlaybackAllowed: false,
    fakeViewsAllowed: false,
    fakeAnalyticsAllowed: false,
    fakeModerationAllowed: false,
    fakeOrderAllowed: false,
    fakePaymentAllowed: false,
    fakeGiftSendingAllowed: false,
    giftSendingImplementedNow: false,
    monetizationImplementedNow: false,
  };
}

export function selectStream117JClosureSnapshotSection(
  state: Stream117JClosureSnapshotState,
  sectionId: Stream117JClosureSnapshotSectionId,
): Stream117JClosureSnapshotState {
  return {
    ...state,
    selectedSectionId: sectionId,
    lastAction: `${SECTION_COPY[sectionId].title}: ${SECTION_COPY[sectionId].description}`,
  };
}

export function markStream117JClosureSnapshotSectionReady(
  state: Stream117JClosureSnapshotState,
  sectionId: Stream117JClosureSnapshotSectionId,
  action: string,
): Stream117JClosureSnapshotState {
  return {
    ...state,
    selectedSectionId: sectionId,
    readySectionIds: uniqueSectionIds([...state.readySectionIds, sectionId]),
    [FIELD_BY_SECTION[sectionId]]: true,
    lastAction: action,
  };
}

export function markStream117JClosureSnapshotAllReady(
  state: Stream117JClosureSnapshotState,
  action: string,
): Stream117JClosureSnapshotState {
  return {
    ...state,
    selectedSectionId: "no_launch_claim",
    readySectionIds: ALL_SECTIONS,
    lastAction: action,
    closureSurfaceReadyLocal: true,
    productScopeSnapshotLocal: true,
    liveBusinessProfileShortsClosedLocal: true,
    uiuxAcceptanceSnapshotLocal: true,
    backendProviderBoundarySnapshotLocal: true,
    installSafetyInheritedLocal: true,
    languageSafetyInheritedLocal: true,
    giftsMonetizationLastLocal: true,
    ownerNextDecisionLocal: true,
    archiveHandoffReadyLocal: true,
    noLaunchClaimLocal: true,
  };
}

export function buildStream117JClosureSnapshotEvidence(
  state: Stream117JClosureSnapshotState,
  room: StreamRoomRuntimeState,
  integrationRecoveryEvidence: Stream117IIntegrationRecoveryEvidence,
): Stream117JClosureSnapshotEvidence {
  const sectionItems: Stream117JClosureSnapshotSection[] = ALL_SECTIONS.map((sectionId) => ({
    id: sectionId,
    title: SECTION_COPY[sectionId].title,
    description: SECTION_COPY[sectionId].description,
    status: state.readySectionIds.includes(sectionId) ? "ready" : "blocked",
  }));
  const readySections = sectionItems.filter((item) => item.status === "ready").length;
  const totalSections = sectionItems.length;
  const closureScore = Math.round((readySections / totalSections) * 100);
  const roomHasTitle = room.title.trim().length > 0;
  const integrationRecoveryReady = integrationRecoveryEvidence.integrationRecoveryReady;
  const streamUiuxClosureReady = roomHasTitle
    && integrationRecoveryReady
    && closureScore === 100
    && state.allConnectionsThroughKernel
    && state.finalUiuxClosureOnly
    && state.integrationRecoveryRequired
    && state.ownerApprovedScopeRequiredForRealWork
    && state.backendProviderImplementationStartedNow === false
    && state.providerActivatedNow === false
    && state.realtimeProviderActivatedNow === false
    && state.mediaProviderActivatedNow === false
    && state.uploadProviderActivatedNow === false
    && state.playbackProviderActivatedNow === false
    && state.analyticsProviderActivatedNow === false
    && state.moderationProviderActivatedNow === false
    && state.envSecretsCollectedInMobile === false
    && state.envSecretsReturnedToUi === false
    && state.directRealtimeProviderAllowed === false
    && state.directMediaProviderAllowed === false
    && state.directUploadProviderAllowed === false
    && state.directPlaybackProviderAllowed === false
    && state.directAnalyticsProviderAllowed === false
    && state.directModerationProviderAllowed === false
    && state.directWalletProviderAllowed === false
    && state.directGiftPaymentAllowed === false
    && state.walletTouchedNow === false
    && state.messengerTouchedNow === false
    && state.mainAiTouchedNow === false
    && state.fakeLaunchAllowed === false
    && state.fakeLiveAllowed === false
    && state.fakeRealtimeAllowed === false
    && state.fakeProviderAllowed === false
    && state.fakeUploadAllowed === false
    && state.fakePublishAllowed === false
    && state.fakePlaybackAllowed === false
    && state.fakeViewsAllowed === false
    && state.fakeAnalyticsAllowed === false
    && state.fakeModerationAllowed === false
    && state.fakeOrderAllowed === false
    && state.fakePaymentAllowed === false
    && state.fakeGiftSendingAllowed === false
    && state.giftSendingImplementedNow === false
    && state.monetizationImplementedNow === false;

  return {
    version: "STREAM-117J",
    selectedSectionId: state.selectedSectionId,
    closureScore,
    readySections,
    totalSections,
    sectionItems,
    heroTitle: "Stream UI/UX closure snapshot is готов",
    heroSubtitle: "This closes the current Stream продукт UI/UX layer: Эфир, Бизнес Stream, профиль автора and Шорты are organized; бэкенд/провайдер, подарки and Wallet remain separate real execution этапs.",
    phoneStatus: streamUiuxClosureReady ? "Stream UI/UX closure готов" : "Stream closure needs проверка",
    primaryAction: "Использовать это as the финальный Stream UI/UX closure record before choosing a real бэкенд/провайдер execution slice.",
    secondaryAction: "Следующий allowed move: владелец approves one бэкенд/провайдер slice. Подарки, Wallet, commerce and monetization still wait until the финальный Stream этап.",
    closureSurfaceReady: state.closureSurfaceReadyLocal,
    productScopeSnapshot: state.productScopeSnapshotLocal,
    liveBusinessProfileShortsClosed: state.liveBusinessProfileShortsClosedLocal,
    uiuxAcceptanceSnapshot: state.uiuxAcceptanceSnapshotLocal,
    backendProviderBoundarySnapshot: state.backendProviderBoundarySnapshotLocal,
    installSafetyInherited: state.installSafetyInheritedLocal,
    languageSafetyInherited: state.languageSafetyInheritedLocal,
    giftsMonetizationLast: state.giftsMonetizationLastLocal,
    ownerNextDecision: state.ownerNextDecisionLocal,
    archiveHandoffReady: state.archiveHandoffReadyLocal,
    noLaunchClaim: state.noLaunchClaimLocal,
    integrationRecoveryReady,
    streamUiuxClosureReady,
    allConnectionsThroughKernel: true,
    finalUiuxClosureOnly: true,
    integrationRecoveryRequired: true,
    ownerApprovedScopeRequiredForRealWork: true,
    backendProviderImplementationStartedNow: false,
    providerActivatedNow: false,
    realtimeProviderActivatedNow: false,
    mediaProviderActivatedNow: false,
    uploadProviderActivatedNow: false,
    playbackProviderActivatedNow: false,
    analyticsProviderActivatedNow: false,
    moderationProviderActivatedNow: false,
    envSecretsCollectedInMobile: false,
    envSecretsReturnedToUi: false,
    directRealtimeProviderAllowed: false,
    directMediaProviderAllowed: false,
    directUploadProviderAllowed: false,
    directPlaybackProviderAllowed: false,
    directAnalyticsProviderAllowed: false,
    directModerationProviderAllowed: false,
    directWalletProviderAllowed: false,
    directGiftPaymentAllowed: false,
    walletTouchedNow: false,
    messengerTouchedNow: false,
    mainAiTouchedNow: false,
    fakeLaunchAllowed: false,
    fakeLiveAllowed: false,
    fakeRealtimeAllowed: false,
    fakeProviderAllowed: false,
    fakeUploadAllowed: false,
    fakePublishAllowed: false,
    fakePlaybackAllowed: false,
    fakeViewsAllowed: false,
    fakeAnalyticsAllowed: false,
    fakeModerationAllowed: false,
    fakeOrderAllowed: false,
    fakePaymentAllowed: false,
    fakeGiftSendingAllowed: false,
    giftSendingImplementedNow: false,
    monetizationImplementedNow: false,
  };
}
