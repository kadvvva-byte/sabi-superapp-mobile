import type { StreamRoomRuntimeState } from "./streamRoomRuntime";
import type { Stream117KArchiveHandoffEvidence } from "./stream117kStreamArchiveHandoffKernelUiuxRuntime";

export type Stream118ABackendProviderReadinessSectionId =
  | "backend_scope_source_only"
  | "kernel_contract_entrypoints"
  | "room_lifecycle_contract"
  | "realtime_provider_contract"
  | "media_provider_contract"
  | "upload_publish_contract"
  | "playback_analytics_contract"
  | "moderation_admin_contract"
  | "server_secret_boundary"
  | "rollback_smoke_contract"
  | "wallet_gifts_deferred";

export type Stream118ABackendProviderReadinessStatus = "ready" | "blocked";

export type Stream118ABackendProviderReadinessSection = {
  readonly id: Stream118ABackendProviderReadinessSectionId;
  readonly title: string;
  readonly description: string;
  readonly status: Stream118ABackendProviderReadinessStatus;
};

export type Stream118ABackendProviderReadinessState = {
  readonly version: "STREAM-118A";
  readonly selectedSectionId: Stream118ABackendProviderReadinessSectionId;
  readonly readySectionIds: readonly Stream118ABackendProviderReadinessSectionId[];
  readonly lastAction: string;
  readonly backendScopeSourceOnlyLocal: boolean;
  readonly kernelContractEntrypointsLocal: boolean;
  readonly roomLifecycleContractLocal: boolean;
  readonly realtimeProviderContractLocal: boolean;
  readonly mediaProviderContractLocal: boolean;
  readonly uploadPublishContractLocal: boolean;
  readonly playbackAnalyticsContractLocal: boolean;
  readonly moderationAdminContractLocal: boolean;
  readonly serverSecretBoundaryLocal: boolean;
  readonly rollbackSmokeContractLocal: boolean;
  readonly walletGiftsDeferredLocal: boolean;
  readonly allConnectionsThroughKernel: true;
  readonly sourceOnlyReadinessContract: true;
  readonly backendProviderExecutionRequiresSeparateApproval: true;
  readonly backendImplementationStartedNow: false;
  readonly backendRoutesMountedNow: false;
  readonly providerActivatedNow: false;
  readonly realtimeProviderActivatedNow: false;
  readonly mediaProviderActivatedNow: false;
  readonly uploadProviderActivatedNow: false;
  readonly playbackProviderActivatedNow: false;
  readonly analyticsProviderActivatedNow: false;
  readonly moderationProviderActivatedNow: false;
  readonly serverSecretsStoredInMobile: false;
  readonly serverSecretsReturnedToUi: false;
  readonly envSecretValuesPrinted: false;
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

export type Stream118ABackendProviderReadinessEvidence = {
  readonly version: "STREAM-118A";
  readonly selectedSectionId: Stream118ABackendProviderReadinessSectionId;
  readonly readinessScore: number;
  readonly readySections: number;
  readonly totalSections: number;
  readonly sectionItems: readonly Stream118ABackendProviderReadinessSection[];
  readonly heroTitle: string;
  readonly heroSubtitle: string;
  readonly phoneStatus: string;
  readonly primaryAction: string;
  readonly secondaryAction: string;
  readonly backendScopeSourceOnly: boolean;
  readonly kernelContractEntrypoints: boolean;
  readonly roomLifecycleContract: boolean;
  readonly realtimeProviderContract: boolean;
  readonly mediaProviderContract: boolean;
  readonly uploadPublishContract: boolean;
  readonly playbackAnalyticsContract: boolean;
  readonly moderationAdminContract: boolean;
  readonly serverSecretBoundary: boolean;
  readonly rollbackSmokeContract: boolean;
  readonly walletGiftsDeferred: boolean;
  readonly archiveHandoffReady: boolean;
  readonly backendProviderReadinessContractsReady: boolean;
  readonly allConnectionsThroughKernel: true;
  readonly sourceOnlyReadinessContract: true;
  readonly backendProviderExecutionRequiresSeparateApproval: true;
  readonly backendImplementationStartedNow: false;
  readonly backendRoutesMountedNow: false;
  readonly providerActivatedNow: false;
  readonly realtimeProviderActivatedNow: false;
  readonly mediaProviderActivatedNow: false;
  readonly uploadProviderActivatedNow: false;
  readonly playbackProviderActivatedNow: false;
  readonly analyticsProviderActivatedNow: false;
  readonly moderationProviderActivatedNow: false;
  readonly serverSecretsStoredInMobile: false;
  readonly serverSecretsReturnedToUi: false;
  readonly envSecretValuesPrinted: false;
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

const SECTION_COPY: Record<Stream118ABackendProviderReadinessSectionId, { title: string; description: string }> = {
  backend_scope_source_only: {
    title: "Только исходный код",
    description: "118A готовит только контракты готовности backend/provider; маршруты не монтируются и провайдер не запускается.",
  },
  kernel_contract_entrypoints: {
    title: "Входы через ядро",
    description: "Будущая работа провайдера должна идти через контракты/фасады/события Stream kernel, а не через вызовы провайдера с экрана.",
  },
  room_lifecycle_contract: {
    title: "Жизненный цикл комнаты",
    description: "Создание, вход, выход, завершение, переподключение и блокировки требуют серверных контрактов до реального запуска.",
  },
  realtime_provider_contract: {
    title: "Контракт real-time",
    description: "Синхронизация ведущий/зритель, co-host, battle и комментарии требуют реальный realtime adapter без фейкового socket success.",
  },
  media_provider_contract: {
    title: "Медиа-контракт",
    description: "Камера, аудио, игра и трансляция экрана требуют реальный media-session handoff и rollback до выхода в эфир.",
  },
  upload_publish_contract: {
    title: "Контракт загрузки/публикации",
    description: "Загрузка Shorts, публикация, обложка, музыка и эффекты требуют provider-backed contract до включения.",
  },
  playback_analytics_contract: {
    title: "Плеер/аналитика",
    description: "Плеер, просмотры, лайки и счётчики аналитики остаются заблокированы до provider-backed telemetry.",
  },
  moderation_admin_contract: {
    title: "Модерация/Admin",
    description: "AI-сигналы, 18+, жалобы, апелляции и Admin review должны быть подключены до реальных публичных комнат.",
  },
  server_secret_boundary: {
    title: "Секреты только на сервере",
    description: "Ключи провайдера, env-значения и проверки секретов остаются на сервере; mobile UI не должен показывать или хранить их.",
  },
  rollback_smoke_contract: {
    title: "Smoke/rollback",
    description: "Каждый будущий execution slice требует TypeScript, runtime smoke, audit и rollback evidence.",
  },
  wallet_gifts_deferred: {
    title: "Wallet/подарки отложены",
    description: "Подарки, diamonds, Wallet, merchant и монетизация остаются после стабильной реальной Stream foundation.",
  },
};

const ALL_SECTIONS: readonly Stream118ABackendProviderReadinessSectionId[] = [
  "backend_scope_source_only",
  "kernel_contract_entrypoints",
  "room_lifecycle_contract",
  "realtime_provider_contract",
  "media_provider_contract",
  "upload_publish_contract",
  "playback_analytics_contract",
  "moderation_admin_contract",
  "server_secret_boundary",
  "rollback_smoke_contract",
  "wallet_gifts_deferred",
];

const FIELD_BY_SECTION: Record<Stream118ABackendProviderReadinessSectionId, keyof Pick<
  Stream118ABackendProviderReadinessState,
  | "backendScopeSourceOnlyLocal"
  | "kernelContractEntrypointsLocal"
  | "roomLifecycleContractLocal"
  | "realtimeProviderContractLocal"
  | "mediaProviderContractLocal"
  | "uploadPublishContractLocal"
  | "playbackAnalyticsContractLocal"
  | "moderationAdminContractLocal"
  | "serverSecretBoundaryLocal"
  | "rollbackSmokeContractLocal"
  | "walletGiftsDeferredLocal"
>> = {
  backend_scope_source_only: "backendScopeSourceOnlyLocal",
  kernel_contract_entrypoints: "kernelContractEntrypointsLocal",
  room_lifecycle_contract: "roomLifecycleContractLocal",
  realtime_provider_contract: "realtimeProviderContractLocal",
  media_provider_contract: "mediaProviderContractLocal",
  upload_publish_contract: "uploadPublishContractLocal",
  playback_analytics_contract: "playbackAnalyticsContractLocal",
  moderation_admin_contract: "moderationAdminContractLocal",
  server_secret_boundary: "serverSecretBoundaryLocal",
  rollback_smoke_contract: "rollbackSmokeContractLocal",
  wallet_gifts_deferred: "walletGiftsDeferredLocal",
};

function uniqueSectionIds(sectionIds: readonly Stream118ABackendProviderReadinessSectionId[]): readonly Stream118ABackendProviderReadinessSectionId[] {
  return ALL_SECTIONS.filter((sectionId) => sectionIds.includes(sectionId));
}

export function createInitialStream118ABackendProviderReadinessState(): Stream118ABackendProviderReadinessState {
  return {
    version: "STREAM-118A",
    selectedSectionId: "backend_scope_source_only",
    readySectionIds: [],
    lastAction: "118A: контракты готовности backend/provider ждут owner review в режиме source-only.",
    backendScopeSourceOnlyLocal: false,
    kernelContractEntrypointsLocal: false,
    roomLifecycleContractLocal: false,
    realtimeProviderContractLocal: false,
    mediaProviderContractLocal: false,
    uploadPublishContractLocal: false,
    playbackAnalyticsContractLocal: false,
    moderationAdminContractLocal: false,
    serverSecretBoundaryLocal: false,
    rollbackSmokeContractLocal: false,
    walletGiftsDeferredLocal: false,
    allConnectionsThroughKernel: true,
    sourceOnlyReadinessContract: true,
    backendProviderExecutionRequiresSeparateApproval: true,
    backendImplementationStartedNow: false,
    backendRoutesMountedNow: false,
    providerActivatedNow: false,
    realtimeProviderActivatedNow: false,
    mediaProviderActivatedNow: false,
    uploadProviderActivatedNow: false,
    playbackProviderActivatedNow: false,
    analyticsProviderActivatedNow: false,
    moderationProviderActivatedNow: false,
    serverSecretsStoredInMobile: false,
    serverSecretsReturnedToUi: false,
    envSecretValuesPrinted: false,
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

export function selectStream118ABackendProviderReadinessSection(
  state: Stream118ABackendProviderReadinessState,
  sectionId: Stream118ABackendProviderReadinessSectionId,
): Stream118ABackendProviderReadinessState {
  return {
    ...state,
    selectedSectionId: sectionId,
    lastAction: `${SECTION_COPY[sectionId].title}: ${SECTION_COPY[sectionId].description}`,
  };
}

export function markStream118ABackendProviderReadinessSectionReady(
  state: Stream118ABackendProviderReadinessState,
  sectionId: Stream118ABackendProviderReadinessSectionId,
  action: string,
): Stream118ABackendProviderReadinessState {
  return {
    ...state,
    selectedSectionId: sectionId,
    readySectionIds: uniqueSectionIds([...state.readySectionIds, sectionId]),
    [FIELD_BY_SECTION[sectionId]]: true,
    lastAction: action,
  };
}

export function markStream118ABackendProviderReadinessAllReady(
  state: Stream118ABackendProviderReadinessState,
  action: string,
): Stream118ABackendProviderReadinessState {
  return {
    ...state,
    selectedSectionId: "rollback_smoke_contract",
    readySectionIds: ALL_SECTIONS,
    lastAction: action,
    backendScopeSourceOnlyLocal: true,
    kernelContractEntrypointsLocal: true,
    roomLifecycleContractLocal: true,
    realtimeProviderContractLocal: true,
    mediaProviderContractLocal: true,
    uploadPublishContractLocal: true,
    playbackAnalyticsContractLocal: true,
    moderationAdminContractLocal: true,
    serverSecretBoundaryLocal: true,
    rollbackSmokeContractLocal: true,
    walletGiftsDeferredLocal: true,
  };
}

export function buildStream118ABackendProviderReadinessEvidence(
  state: Stream118ABackendProviderReadinessState,
  room: StreamRoomRuntimeState,
  archiveHandoffEvidence: Stream117KArchiveHandoffEvidence,
): Stream118ABackendProviderReadinessEvidence {
  const sectionItems: Stream118ABackendProviderReadinessSection[] = ALL_SECTIONS.map((sectionId) => ({
    id: sectionId,
    title: SECTION_COPY[sectionId].title,
    description: SECTION_COPY[sectionId].description,
    status: state.readySectionIds.includes(sectionId) ? "ready" : "blocked",
  }));
  const readySections = sectionItems.filter((item) => item.status === "ready").length;
  const totalSections = sectionItems.length;
  const readinessScore = Math.round((readySections / totalSections) * 100);
  const roomHasTitle = room.title.trim().length > 0;
  const archiveHandoffReady = archiveHandoffEvidence.streamArchiveHandoffReady;
  const backendProviderReadinessContractsReady = roomHasTitle
    && archiveHandoffReady
    && readinessScore === 100
    && state.allConnectionsThroughKernel
    && state.sourceOnlyReadinessContract
    && state.backendProviderExecutionRequiresSeparateApproval
    && state.backendImplementationStartedNow === false
    && state.backendRoutesMountedNow === false
    && state.providerActivatedNow === false
    && state.realtimeProviderActivatedNow === false
    && state.mediaProviderActivatedNow === false
    && state.uploadProviderActivatedNow === false
    && state.playbackProviderActivatedNow === false
    && state.analyticsProviderActivatedNow === false
    && state.moderationProviderActivatedNow === false
    && state.serverSecretsStoredInMobile === false
    && state.serverSecretsReturnedToUi === false
    && state.envSecretValuesPrinted === false
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
    version: "STREAM-118A",
    selectedSectionId: state.selectedSectionId,
    readinessScore,
    readySections,
    totalSections,
    sectionItems,
    heroTitle: "Контракты готовности Stream backend/provider",
    heroSubtitle: "118A — source-only готовность mobile UI/UX для реального Stream backend/provider execution. Здесь фиксируются входы через ядро и блокеры без активации провайдера и без заявления запуска.",
    phoneStatus: backendProviderReadinessContractsReady ? "Контракты backend/provider готовы" : "Контракты backend/provider требуют проверки",
    primaryAction: "Зафиксировать порядок реального Stream execution: lifecycle комнаты, realtime, media, upload/publish, playback/analytics и moderation должны идти через kernel contracts.",
    secondaryAction: "Здесь не включаются provider, route mount, secret, Wallet, gift payment или fake launch. Следующий execution требует явный owner-approved backend slice.",
    backendScopeSourceOnly: state.backendScopeSourceOnlyLocal,
    kernelContractEntrypoints: state.kernelContractEntrypointsLocal,
    roomLifecycleContract: state.roomLifecycleContractLocal,
    realtimeProviderContract: state.realtimeProviderContractLocal,
    mediaProviderContract: state.mediaProviderContractLocal,
    uploadPublishContract: state.uploadPublishContractLocal,
    playbackAnalyticsContract: state.playbackAnalyticsContractLocal,
    moderationAdminContract: state.moderationAdminContractLocal,
    serverSecretBoundary: state.serverSecretBoundaryLocal,
    rollbackSmokeContract: state.rollbackSmokeContractLocal,
    walletGiftsDeferred: state.walletGiftsDeferredLocal,
    archiveHandoffReady,
    backendProviderReadinessContractsReady,
    allConnectionsThroughKernel: true,
    sourceOnlyReadinessContract: true,
    backendProviderExecutionRequiresSeparateApproval: true,
    backendImplementationStartedNow: false,
    backendRoutesMountedNow: false,
    providerActivatedNow: false,
    realtimeProviderActivatedNow: false,
    mediaProviderActivatedNow: false,
    uploadProviderActivatedNow: false,
    playbackProviderActivatedNow: false,
    analyticsProviderActivatedNow: false,
    moderationProviderActivatedNow: false,
    serverSecretsStoredInMobile: false,
    serverSecretsReturnedToUi: false,
    envSecretValuesPrinted: false,
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
