import type { StreamRoomRuntimeState } from "./streamRoomRuntime";
import type { Stream118ABackendProviderReadinessEvidence } from "./stream118aBackendProviderReadinessContractsKernelUiuxRuntime";

export type Stream118BBackendProviderExecutionPlanSectionId =
  | "owner_scope_approval"
  | "readonly_preflight_snapshot"
  | "route_mount_plan_blocked"
  | "provider_adapter_plan_blocked"
  | "realtime_smoke_plan"
  | "media_smoke_plan"
  | "shorts_upload_plan_blocked"
  | "moderation_admin_plan"
  | "rollback_audit_plan"
  | "secrets_server_only"
  | "wallet_gifts_last";

export type Stream118BBackendProviderExecutionPlanStatus = "ready" | "blocked";

export type Stream118BBackendProviderExecutionPlanSection = {
  readonly id: Stream118BBackendProviderExecutionPlanSectionId;
  readonly title: string;
  readonly description: string;
  readonly status: Stream118BBackendProviderExecutionPlanStatus;
};

export type Stream118BBackendProviderExecutionPlanState = {
  readonly version: "STREAM-118B";
  readonly selectedSectionId: Stream118BBackendProviderExecutionPlanSectionId;
  readonly readySectionIds: readonly Stream118BBackendProviderExecutionPlanSectionId[];
  readonly lastAction: string;
  readonly ownerScopeApprovalLocal: boolean;
  readonly readonlyPreflightSnapshotLocal: boolean;
  readonly routeMountPlanBlockedLocal: boolean;
  readonly providerAdapterPlanBlockedLocal: boolean;
  readonly realtimeSmokePlanLocal: boolean;
  readonly mediaSmokePlanLocal: boolean;
  readonly shortsUploadPlanBlockedLocal: boolean;
  readonly moderationAdminPlanLocal: boolean;
  readonly rollbackAuditPlanLocal: boolean;
  readonly secretsServerOnlyLocal: boolean;
  readonly walletGiftsLastLocal: boolean;
  readonly allConnectionsThroughKernel: true;
  readonly sourceOnlyExecutionPlan: true;
  readonly backendProviderReadinessRequired: true;
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

export type Stream118BBackendProviderExecutionPlanEvidence = {
  readonly version: "STREAM-118B";
  readonly selectedSectionId: Stream118BBackendProviderExecutionPlanSectionId;
  readonly executionPlanScore: number;
  readonly readySections: number;
  readonly totalSections: number;
  readonly sectionItems: readonly Stream118BBackendProviderExecutionPlanSection[];
  readonly heroTitle: string;
  readonly heroSubtitle: string;
  readonly phoneStatus: string;
  readonly primaryAction: string;
  readonly secondaryAction: string;
  readonly ownerScopeApproval: boolean;
  readonly readonlyPreflightSnapshot: boolean;
  readonly routeMountPlanBlocked: boolean;
  readonly providerAdapterPlanBlocked: boolean;
  readonly realtimeSmokePlan: boolean;
  readonly mediaSmokePlan: boolean;
  readonly shortsUploadPlanBlocked: boolean;
  readonly moderationAdminPlan: boolean;
  readonly rollbackAuditPlan: boolean;
  readonly secretsServerOnly: boolean;
  readonly walletGiftsLast: boolean;
  readonly readinessContractsReady: boolean;
  readonly backendProviderExecutionPlanReady: boolean;
  readonly allConnectionsThroughKernel: true;
  readonly sourceOnlyExecutionPlan: true;
  readonly backendProviderReadinessRequired: true;
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

const SECTION_COPY: Record<Stream118BBackendProviderExecutionPlanSectionId, { title: string; description: string }> = {
  owner_scope_approval: {
    title: "Owner approval scope",
    description: "118B требует отдельный owner-approved backend/provider execution slice до любого реального implementation.",
  },
  readonly_preflight_snapshot: {
    title: "Read-only preflight",
    description: "Первый backend step должен быть read-only snapshot: environment, routes, providers, DB counters и blockers.",
  },
  route_mount_plan_blocked: {
    title: "Route mount заблокирован",
    description: "Route mount здесь остаётся заблокирован; будущий mount требует exact target detection, auth, audit и rollback evidence.",
  },
  provider_adapter_plan_blocked: {
    title: "Provider adapter заблокирован",
    description: "Realtime/media provider adapter остаётся заблокирован до approval server-only secrets и explicit smoke scope.",
  },
  realtime_smoke_plan: {
    title: "Realtime smoke plan",
    description: "Запланировать smoke tests для host/viewer sync, lifecycle, co-host, battles и comments без fake socket success.",
  },
  media_smoke_plan: {
    title: "Media smoke plan",
    description: "Запланировать audio/video/game/screen media-session smoke tests с честным показом provider errors.",
  },
  shorts_upload_plan_blocked: {
    title: "Shorts upload заблокирован",
    description: "Shorts upload/publish остаётся заблокирован до реальных storage, media processing, music/effects rights и moderation.",
  },
  moderation_admin_plan: {
    title: "Модерация/Admin plan",
    description: "18+, AI risk signals, reports, appeals и Admin review должны быть включены до публичных комнат.",
  },
  rollback_audit_plan: {
    title: "Rollback/audit plan",
    description: "Каждый execution slice требует before/after counters, source hashes, smoke report и rollback path.",
  },
  secrets_server_only: {
    title: "Secrets server-only",
    description: "Provider key, env value или secret check не хранится в mobile и не возвращается в UI.",
  },
  wallet_gifts_last: {
    title: "Wallet/подарки в конце",
    description: "Подарки, diamonds, Wallet, merchant и монетизация остаются последними, после рабочей реальной Stream foundation.",
  },
};

const ALL_SECTIONS: readonly Stream118BBackendProviderExecutionPlanSectionId[] = [
  "owner_scope_approval",
  "readonly_preflight_snapshot",
  "route_mount_plan_blocked",
  "provider_adapter_plan_blocked",
  "realtime_smoke_plan",
  "media_smoke_plan",
  "shorts_upload_plan_blocked",
  "moderation_admin_plan",
  "rollback_audit_plan",
  "secrets_server_only",
  "wallet_gifts_last",
];

const FIELD_BY_SECTION: Record<Stream118BBackendProviderExecutionPlanSectionId, keyof Pick<
  Stream118BBackendProviderExecutionPlanState,
  | "ownerScopeApprovalLocal"
  | "readonlyPreflightSnapshotLocal"
  | "routeMountPlanBlockedLocal"
  | "providerAdapterPlanBlockedLocal"
  | "realtimeSmokePlanLocal"
  | "mediaSmokePlanLocal"
  | "shortsUploadPlanBlockedLocal"
  | "moderationAdminPlanLocal"
  | "rollbackAuditPlanLocal"
  | "secretsServerOnlyLocal"
  | "walletGiftsLastLocal"
>> = {
  owner_scope_approval: "ownerScopeApprovalLocal",
  readonly_preflight_snapshot: "readonlyPreflightSnapshotLocal",
  route_mount_plan_blocked: "routeMountPlanBlockedLocal",
  provider_adapter_plan_blocked: "providerAdapterPlanBlockedLocal",
  realtime_smoke_plan: "realtimeSmokePlanLocal",
  media_smoke_plan: "mediaSmokePlanLocal",
  shorts_upload_plan_blocked: "shortsUploadPlanBlockedLocal",
  moderation_admin_plan: "moderationAdminPlanLocal",
  rollback_audit_plan: "rollbackAuditPlanLocal",
  secrets_server_only: "secretsServerOnlyLocal",
  wallet_gifts_last: "walletGiftsLastLocal",
};

function uniqueSectionIds(sectionIds: readonly Stream118BBackendProviderExecutionPlanSectionId[]): readonly Stream118BBackendProviderExecutionPlanSectionId[] {
  return ALL_SECTIONS.filter((sectionId) => sectionIds.includes(sectionId));
}

export function createInitialStream118BBackendProviderExecutionPlanState(): Stream118BBackendProviderExecutionPlanState {
  return {
    version: "STREAM-118B",
    selectedSectionId: "owner_scope_approval",
    readySectionIds: [],
    lastAction: "118B: план backend/provider execution ждёт owner review в режиме source-only.",
    ownerScopeApprovalLocal: false,
    readonlyPreflightSnapshotLocal: false,
    routeMountPlanBlockedLocal: false,
    providerAdapterPlanBlockedLocal: false,
    realtimeSmokePlanLocal: false,
    mediaSmokePlanLocal: false,
    shortsUploadPlanBlockedLocal: false,
    moderationAdminPlanLocal: false,
    rollbackAuditPlanLocal: false,
    secretsServerOnlyLocal: false,
    walletGiftsLastLocal: false,
    allConnectionsThroughKernel: true,
    sourceOnlyExecutionPlan: true,
    backendProviderReadinessRequired: true,
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

export function selectStream118BBackendProviderExecutionPlanSection(
  state: Stream118BBackendProviderExecutionPlanState,
  sectionId: Stream118BBackendProviderExecutionPlanSectionId,
): Stream118BBackendProviderExecutionPlanState {
  return {
    ...state,
    selectedSectionId: sectionId,
    lastAction: `${SECTION_COPY[sectionId].title}: ${SECTION_COPY[sectionId].description}`,
  };
}

export function markStream118BBackendProviderExecutionPlanSectionReady(
  state: Stream118BBackendProviderExecutionPlanState,
  sectionId: Stream118BBackendProviderExecutionPlanSectionId,
  action: string,
): Stream118BBackendProviderExecutionPlanState {
  return {
    ...state,
    selectedSectionId: sectionId,
    readySectionIds: uniqueSectionIds([...state.readySectionIds, sectionId]),
    [FIELD_BY_SECTION[sectionId]]: true,
    lastAction: action,
  };
}

export function markStream118BBackendProviderExecutionPlanAllReady(
  state: Stream118BBackendProviderExecutionPlanState,
  action: string,
): Stream118BBackendProviderExecutionPlanState {
  return {
    ...state,
    selectedSectionId: "rollback_audit_plan",
    readySectionIds: ALL_SECTIONS,
    lastAction: action,
    ownerScopeApprovalLocal: true,
    readonlyPreflightSnapshotLocal: true,
    routeMountPlanBlockedLocal: true,
    providerAdapterPlanBlockedLocal: true,
    realtimeSmokePlanLocal: true,
    mediaSmokePlanLocal: true,
    shortsUploadPlanBlockedLocal: true,
    moderationAdminPlanLocal: true,
    rollbackAuditPlanLocal: true,
    secretsServerOnlyLocal: true,
    walletGiftsLastLocal: true,
  };
}

export function buildStream118BBackendProviderExecutionPlanEvidence(
  state: Stream118BBackendProviderExecutionPlanState,
  room: StreamRoomRuntimeState,
  readinessEvidence: Stream118ABackendProviderReadinessEvidence,
): Stream118BBackendProviderExecutionPlanEvidence {
  const sectionItems: Stream118BBackendProviderExecutionPlanSection[] = ALL_SECTIONS.map((sectionId) => ({
    id: sectionId,
    title: SECTION_COPY[sectionId].title,
    description: SECTION_COPY[sectionId].description,
    status: state.readySectionIds.includes(sectionId) ? "ready" : "blocked",
  }));
  const readySections = sectionItems.filter((item) => item.status === "ready").length;
  const totalSections = sectionItems.length;
  const executionPlanScore = Math.round((readySections / totalSections) * 100);
  const roomHasTitle = room.title.trim().length > 0;
  const readinessContractsReady = readinessEvidence.backendProviderReadinessContractsReady;
  const backendProviderExecutionPlanReady = roomHasTitle
    && readinessContractsReady
    && executionPlanScore === 100
    && state.allConnectionsThroughKernel
    && state.sourceOnlyExecutionPlan
    && state.backendProviderReadinessRequired
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
    version: "STREAM-118B",
    selectedSectionId: state.selectedSectionId,
    executionPlanScore,
    readySections,
    totalSections,
    sectionItems,
    heroTitle: "План Stream backend/provider execution",
    heroSubtitle: "118B — source-only execution-plan gate перед реальной работой Stream backend/provider. Здесь фиксируются owner approval, read-only preflight, route/provider blockers, smoke tests, audit и rollback без выполнения.",
    phoneStatus: backendProviderExecutionPlanReady ? "Execution plan готов" : "Execution plan требует проверки",
    primaryAction: "Подготовить реальный execution order: сначала read-only preflight, затем отдельно approved route/provider slices со smoke, audit и rollback evidence.",
    secondaryAction: "В 118B не включаются backend route, DB write, provider call, secret, Wallet, gift payment или fake launch.",
    ownerScopeApproval: state.ownerScopeApprovalLocal,
    readonlyPreflightSnapshot: state.readonlyPreflightSnapshotLocal,
    routeMountPlanBlocked: state.routeMountPlanBlockedLocal,
    providerAdapterPlanBlocked: state.providerAdapterPlanBlockedLocal,
    realtimeSmokePlan: state.realtimeSmokePlanLocal,
    mediaSmokePlan: state.mediaSmokePlanLocal,
    shortsUploadPlanBlocked: state.shortsUploadPlanBlockedLocal,
    moderationAdminPlan: state.moderationAdminPlanLocal,
    rollbackAuditPlan: state.rollbackAuditPlanLocal,
    secretsServerOnly: state.secretsServerOnlyLocal,
    walletGiftsLast: state.walletGiftsLastLocal,
    readinessContractsReady,
    backendProviderExecutionPlanReady,
    allConnectionsThroughKernel: true,
    sourceOnlyExecutionPlan: true,
    backendProviderReadinessRequired: true,
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
