import type { StreamRoomRuntimeState } from "./streamRoomRuntime";
import type { Stream118BBackendProviderExecutionPlanEvidence } from "./stream118bBackendProviderExecutionPlanKernelUiuxRuntime";

export type Stream118CReadOnlyPreflightSectionId =
  | "scope_identity"
  | "environment_inventory"
  | "route_registry_inventory"
  | "provider_gate_inventory"
  | "database_counter_snapshot"
  | "secret_redaction_check"
  | "kernel_contract_consistency"
  | "realtime_media_blockers"
  | "upload_publish_blockers"
  | "moderation_admin_blockers"
  | "rollback_report_ready"
  | "wallet_gifts_blocked";

export type Stream118CReadOnlyPreflightStatus = "ready" | "blocked";

export type Stream118CReadOnlyPreflightSection = {
  readonly id: Stream118CReadOnlyPreflightSectionId;
  readonly title: string;
  readonly description: string;
  readonly status: Stream118CReadOnlyPreflightStatus;
};

export type Stream118CReadOnlyPreflightState = {
  readonly version: "STREAM-118C";
  readonly selectedSectionId: Stream118CReadOnlyPreflightSectionId;
  readonly readySectionIds: readonly Stream118CReadOnlyPreflightSectionId[];
  readonly lastAction: string;
  readonly scopeIdentityLocal: boolean;
  readonly environmentInventoryLocal: boolean;
  readonly routeRegistryInventoryLocal: boolean;
  readonly providerGateInventoryLocal: boolean;
  readonly databaseCounterSnapshotLocal: boolean;
  readonly secretRedactionCheckLocal: boolean;
  readonly kernelContractConsistencyLocal: boolean;
  readonly realtimeMediaBlockersLocal: boolean;
  readonly uploadPublishBlockersLocal: boolean;
  readonly moderationAdminBlockersLocal: boolean;
  readonly rollbackReportReadyLocal: boolean;
  readonly walletGiftsBlockedLocal: boolean;
  readonly allConnectionsThroughKernel: true;
  readonly sourceOnlyPreflightSnapshot: true;
  readonly readOnlyPreflightOnly: true;
  readonly executionPlanRequired: true;
  readonly backendImplementationStartedNow: false;
  readonly backendRoutesMountedNow: false;
  readonly routeMountExecutedNow: false;
  readonly providerActivatedNow: false;
  readonly providerAdapterExecutedNow: false;
  readonly realtimeProviderActivatedNow: false;
  readonly mediaProviderActivatedNow: false;
  readonly uploadProviderActivatedNow: false;
  readonly playbackProviderActivatedNow: false;
  readonly analyticsProviderActivatedNow: false;
  readonly moderationProviderActivatedNow: false;
  readonly databaseWriteExecutedNow: false;
  readonly providerCallExecutedNow: false;
  readonly productionTrafficEnabledNow: false;
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

export type Stream118CReadOnlyPreflightEvidence = {
  readonly version: "STREAM-118C";
  readonly selectedSectionId: Stream118CReadOnlyPreflightSectionId;
  readonly preflightSnapshotScore: number;
  readonly readySections: number;
  readonly totalSections: number;
  readonly sectionItems: readonly Stream118CReadOnlyPreflightSection[];
  readonly heroTitle: string;
  readonly heroSubtitle: string;
  readonly phoneStatus: string;
  readonly primaryAction: string;
  readonly secondaryAction: string;
  readonly scopeIdentity: boolean;
  readonly environmentInventory: boolean;
  readonly routeRegistryInventory: boolean;
  readonly providerGateInventory: boolean;
  readonly databaseCounterSnapshot: boolean;
  readonly secretRedactionCheck: boolean;
  readonly kernelContractConsistency: boolean;
  readonly realtimeMediaBlockers: boolean;
  readonly uploadPublishBlockers: boolean;
  readonly moderationAdminBlockers: boolean;
  readonly rollbackReportReady: boolean;
  readonly walletGiftsBlocked: boolean;
  readonly executionPlanReady: boolean;
  readonly readOnlyPreflightSnapshotReady: boolean;
  readonly allConnectionsThroughKernel: true;
  readonly sourceOnlyPreflightSnapshot: true;
  readonly readOnlyPreflightOnly: true;
  readonly executionPlanRequired: true;
  readonly backendImplementationStartedNow: false;
  readonly backendRoutesMountedNow: false;
  readonly routeMountExecutedNow: false;
  readonly providerActivatedNow: false;
  readonly providerAdapterExecutedNow: false;
  readonly realtimeProviderActivatedNow: false;
  readonly mediaProviderActivatedNow: false;
  readonly uploadProviderActivatedNow: false;
  readonly playbackProviderActivatedNow: false;
  readonly analyticsProviderActivatedNow: false;
  readonly moderationProviderActivatedNow: false;
  readonly databaseWriteExecutedNow: false;
  readonly providerCallExecutedNow: false;
  readonly productionTrafficEnabledNow: false;
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

const SECTION_COPY: Record<Stream118CReadOnlyPreflightSectionId, { title: string; description: string }> = {
  scope_identity: {
    title: "Идентичность scope",
    description: "118C — только планирование read-only preflight snapshot; нельзя mount routes, write DB rows или call providers.",
  },
  environment_inventory: {
    title: "Инвентаризация environment",
    description: "Будущий preflight должен показать server-side env names и missing states без печати secret values.",
  },
  route_registry_inventory: {
    title: "Инвентаризация route registry",
    description: "Будущий preflight должен проверить Stream route registration targets до approval любого mount patch.",
  },
  provider_gate_inventory: {
    title: "Инвентаризация provider gates",
    description: "Будущий preflight должен показывать realtime/media/upload/playback provider gates как blocked до настройки.",
  },
  database_counter_snapshot: {
    title: "DB counter snapshot",
    description: "Будущий preflight должен сравнить read-only before/after counters и доказать, что write не было.",
  },
  secret_redaction_check: {
    title: "Secret redaction",
    description: "Будущий preflight должен доказать, что API keys, folder IDs, tokens или env values не возвращаются в mobile UI.",
  },
  kernel_contract_consistency: {
    title: "Kernel consistency",
    description: "Будущая backend/provider work должна сохранить Stream kernel contracts/facades/events как единственный integration path.",
  },
  realtime_media_blockers: {
    title: "Realtime/media blockers",
    description: "Будущий preflight должен честно показывать live room realtime и media blockers без fake socket или media success.",
  },
  upload_publish_blockers: {
    title: "Upload/publish blockers",
    description: "Будущий preflight должен держать Shorts upload, publish, playback и counters blocked до provider-backed основы.",
  },
  moderation_admin_blockers: {
    title: "Модерация/Admin blockers",
    description: "Будущий preflight должен включить 18+, AI risk signals, reports, appeals и Admin review readiness.",
  },
  rollback_report_ready: {
    title: "Rollback report",
    description: "Будущие execution slices требуют source hashes, tsc/smoke evidence, before/after counters и rollback instructions.",
  },
  wallet_gifts_blocked: {
    title: "Wallet/подарки заблокированы",
    description: "Подарки, Wallet, diamonds, merchant и монетизация остаются blocked до стабильной реальной Stream foundation.",
  },
};

const ALL_SECTIONS: readonly Stream118CReadOnlyPreflightSectionId[] = [
  "scope_identity",
  "environment_inventory",
  "route_registry_inventory",
  "provider_gate_inventory",
  "database_counter_snapshot",
  "secret_redaction_check",
  "kernel_contract_consistency",
  "realtime_media_blockers",
  "upload_publish_blockers",
  "moderation_admin_blockers",
  "rollback_report_ready",
  "wallet_gifts_blocked",
];

const FIELD_BY_SECTION: Record<Stream118CReadOnlyPreflightSectionId, keyof Pick<
  Stream118CReadOnlyPreflightState,
  | "scopeIdentityLocal"
  | "environmentInventoryLocal"
  | "routeRegistryInventoryLocal"
  | "providerGateInventoryLocal"
  | "databaseCounterSnapshotLocal"
  | "secretRedactionCheckLocal"
  | "kernelContractConsistencyLocal"
  | "realtimeMediaBlockersLocal"
  | "uploadPublishBlockersLocal"
  | "moderationAdminBlockersLocal"
  | "rollbackReportReadyLocal"
  | "walletGiftsBlockedLocal"
>> = {
  scope_identity: "scopeIdentityLocal",
  environment_inventory: "environmentInventoryLocal",
  route_registry_inventory: "routeRegistryInventoryLocal",
  provider_gate_inventory: "providerGateInventoryLocal",
  database_counter_snapshot: "databaseCounterSnapshotLocal",
  secret_redaction_check: "secretRedactionCheckLocal",
  kernel_contract_consistency: "kernelContractConsistencyLocal",
  realtime_media_blockers: "realtimeMediaBlockersLocal",
  upload_publish_blockers: "uploadPublishBlockersLocal",
  moderation_admin_blockers: "moderationAdminBlockersLocal",
  rollback_report_ready: "rollbackReportReadyLocal",
  wallet_gifts_blocked: "walletGiftsBlockedLocal",
};

function uniqueSectionIds(sectionIds: readonly Stream118CReadOnlyPreflightSectionId[]): readonly Stream118CReadOnlyPreflightSectionId[] {
  return ALL_SECTIONS.filter((sectionId) => sectionIds.includes(sectionId));
}

export function createInitialStream118CReadOnlyPreflightState(): Stream118CReadOnlyPreflightState {
  return {
    version: "STREAM-118C",
    selectedSectionId: "scope_identity",
    readySectionIds: [],
    lastAction: "118C: контракт read-only preflight snapshot ждёт owner review.",
    scopeIdentityLocal: false,
    environmentInventoryLocal: false,
    routeRegistryInventoryLocal: false,
    providerGateInventoryLocal: false,
    databaseCounterSnapshotLocal: false,
    secretRedactionCheckLocal: false,
    kernelContractConsistencyLocal: false,
    realtimeMediaBlockersLocal: false,
    uploadPublishBlockersLocal: false,
    moderationAdminBlockersLocal: false,
    rollbackReportReadyLocal: false,
    walletGiftsBlockedLocal: false,
    allConnectionsThroughKernel: true,
    sourceOnlyPreflightSnapshot: true,
    readOnlyPreflightOnly: true,
    executionPlanRequired: true,
    backendImplementationStartedNow: false,
    backendRoutesMountedNow: false,
    routeMountExecutedNow: false,
    providerActivatedNow: false,
    providerAdapterExecutedNow: false,
    realtimeProviderActivatedNow: false,
    mediaProviderActivatedNow: false,
    uploadProviderActivatedNow: false,
    playbackProviderActivatedNow: false,
    analyticsProviderActivatedNow: false,
    moderationProviderActivatedNow: false,
    databaseWriteExecutedNow: false,
    providerCallExecutedNow: false,
    productionTrafficEnabledNow: false,
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

export function selectStream118CReadOnlyPreflightSection(
  state: Stream118CReadOnlyPreflightState,
  sectionId: Stream118CReadOnlyPreflightSectionId,
): Stream118CReadOnlyPreflightState {
  return {
    ...state,
    selectedSectionId: sectionId,
    lastAction: `${SECTION_COPY[sectionId].title}: ${SECTION_COPY[sectionId].description}`,
  };
}

export function markStream118CReadOnlyPreflightSectionReady(
  state: Stream118CReadOnlyPreflightState,
  sectionId: Stream118CReadOnlyPreflightSectionId,
  action: string,
): Stream118CReadOnlyPreflightState {
  return {
    ...state,
    selectedSectionId: sectionId,
    readySectionIds: uniqueSectionIds([...state.readySectionIds, sectionId]),
    [FIELD_BY_SECTION[sectionId]]: true,
    lastAction: action,
  };
}

export function markStream118CReadOnlyPreflightAllReady(
  state: Stream118CReadOnlyPreflightState,
  action: string,
): Stream118CReadOnlyPreflightState {
  return {
    ...state,
    selectedSectionId: "rollback_report_ready",
    readySectionIds: ALL_SECTIONS,
    lastAction: action,
    scopeIdentityLocal: true,
    environmentInventoryLocal: true,
    routeRegistryInventoryLocal: true,
    providerGateInventoryLocal: true,
    databaseCounterSnapshotLocal: true,
    secretRedactionCheckLocal: true,
    kernelContractConsistencyLocal: true,
    realtimeMediaBlockersLocal: true,
    uploadPublishBlockersLocal: true,
    moderationAdminBlockersLocal: true,
    rollbackReportReadyLocal: true,
    walletGiftsBlockedLocal: true,
  };
}

export function buildStream118CReadOnlyPreflightEvidence(
  state: Stream118CReadOnlyPreflightState,
  room: StreamRoomRuntimeState,
  executionPlanEvidence: Stream118BBackendProviderExecutionPlanEvidence,
): Stream118CReadOnlyPreflightEvidence {
  const sectionItems: Stream118CReadOnlyPreflightSection[] = ALL_SECTIONS.map((sectionId) => ({
    id: sectionId,
    title: SECTION_COPY[sectionId].title,
    description: SECTION_COPY[sectionId].description,
    status: state.readySectionIds.includes(sectionId) ? "ready" : "blocked",
  }));
  const readySections = sectionItems.filter((item) => item.status === "ready").length;
  const totalSections = sectionItems.length;
  const preflightSnapshotScore = Math.round((readySections / totalSections) * 100);
  const roomHasTitle = room.title.trim().length > 0;
  const executionPlanReady = executionPlanEvidence.backendProviderExecutionPlanReady;
  const readOnlyPreflightSnapshotReady = roomHasTitle
    && executionPlanReady
    && preflightSnapshotScore === 100
    && state.allConnectionsThroughKernel
    && state.sourceOnlyPreflightSnapshot
    && state.readOnlyPreflightOnly
    && state.executionPlanRequired
    && state.backendImplementationStartedNow === false
    && state.backendRoutesMountedNow === false
    && state.routeMountExecutedNow === false
    && state.providerActivatedNow === false
    && state.providerAdapterExecutedNow === false
    && state.realtimeProviderActivatedNow === false
    && state.mediaProviderActivatedNow === false
    && state.uploadProviderActivatedNow === false
    && state.playbackProviderActivatedNow === false
    && state.analyticsProviderActivatedNow === false
    && state.moderationProviderActivatedNow === false
    && state.databaseWriteExecutedNow === false
    && state.providerCallExecutedNow === false
    && state.productionTrafficEnabledNow === false
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
    version: "STREAM-118C",
    selectedSectionId: state.selectedSectionId,
    preflightSnapshotScore,
    readySections,
    totalSections,
    sectionItems,
    heroTitle: "Контракт Stream read-only preflight snapshot",
    heroSubtitle: "118C фиксирует read-only preflight snapshot перед любым реальным Stream backend/provider execution: env inventory, routes, provider gates, DB counters, blockers, redaction и rollback evidence. Backend/provider work здесь не выполняется.",
    phoneStatus: readOnlyPreflightSnapshotReady ? "Read-only preflight готов" : "Read-only preflight заблокирован",
    primaryAction: "Сначала подготовить реальный preflight как read-only evidence: inventory, blockers, counters, redaction, kernel consistency и rollback path.",
    secondaryAction: "В 118C не включаются route mount, DB write, provider call, production traffic, Wallet, gift payment или fake launch.",
    scopeIdentity: state.scopeIdentityLocal,
    environmentInventory: state.environmentInventoryLocal,
    routeRegistryInventory: state.routeRegistryInventoryLocal,
    providerGateInventory: state.providerGateInventoryLocal,
    databaseCounterSnapshot: state.databaseCounterSnapshotLocal,
    secretRedactionCheck: state.secretRedactionCheckLocal,
    kernelContractConsistency: state.kernelContractConsistencyLocal,
    realtimeMediaBlockers: state.realtimeMediaBlockersLocal,
    uploadPublishBlockers: state.uploadPublishBlockersLocal,
    moderationAdminBlockers: state.moderationAdminBlockersLocal,
    rollbackReportReady: state.rollbackReportReadyLocal,
    walletGiftsBlocked: state.walletGiftsBlockedLocal,
    executionPlanReady,
    readOnlyPreflightSnapshotReady,
    allConnectionsThroughKernel: true,
    sourceOnlyPreflightSnapshot: true,
    readOnlyPreflightOnly: true,
    executionPlanRequired: true,
    backendImplementationStartedNow: false,
    backendRoutesMountedNow: false,
    routeMountExecutedNow: false,
    providerActivatedNow: false,
    providerAdapterExecutedNow: false,
    realtimeProviderActivatedNow: false,
    mediaProviderActivatedNow: false,
    uploadProviderActivatedNow: false,
    playbackProviderActivatedNow: false,
    analyticsProviderActivatedNow: false,
    moderationProviderActivatedNow: false,
    databaseWriteExecutedNow: false,
    providerCallExecutedNow: false,
    productionTrafficEnabledNow: false,
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
