import type { StreamRoomRuntimeState } from "./streamRoomRuntime";
import type { Stream118DRouteRegistryDiscoveryEvidence } from "./stream118dRouteRegistryDiscoveryKernelUiuxRuntime";

export type Stream118EProtectedRouteMountPlanSectionId =
  | "source_only_mount_plan"
  | "exact_target_file"
  | "import_anchor"
  | "mount_anchor"
  | "protected_admin_guard"
  | "read_only_handler_contract"
  | "provider_blockers_preserved"
  | "db_write_blockers_preserved"
  | "secrets_redaction"
  | "rollback_patch_plan"
  | "wallet_gifts_blocked";

export type Stream118EProtectedRouteMountPlanStatus = "pending" | "ready";

export type Stream118EProtectedRouteMountPlanSection = {
  readonly id: Stream118EProtectedRouteMountPlanSectionId;
  readonly title: string;
  readonly description: string;
  readonly status: Stream118EProtectedRouteMountPlanStatus;
};

export type Stream118EProtectedRouteMountPlanState = {
  readonly selectedSectionId: Stream118EProtectedRouteMountPlanSectionId;
  readonly readySectionIds: readonly Stream118EProtectedRouteMountPlanSectionId[];
  readonly lastAction: string;
  readonly sourceOnlyMountPlanLocal: boolean;
  readonly exactTargetFileLocal: boolean;
  readonly importAnchorLocal: boolean;
  readonly mountAnchorLocal: boolean;
  readonly protectedAdminGuardLocal: boolean;
  readonly readOnlyHandlerContractLocal: boolean;
  readonly providerBlockersPreservedLocal: boolean;
  readonly dbWriteBlockersPreservedLocal: boolean;
  readonly secretsRedactionLocal: boolean;
  readonly rollbackPatchPlanLocal: boolean;
  readonly walletGiftsBlockedLocal: boolean;
  readonly allConnectionsThroughKernel: true;
  readonly sourceOnlyProtectedRouteMountPlan: true;
  readonly routeRegistryDiscoveryRequired: true;
  readonly routeMountRequiresSeparateApproval: true;
  readonly backendImplementationStartedNow: false;
  readonly backendRouteMountedNow: false;
  readonly routeMountExecutedNow: false;
  readonly routeFactoryExecutedNow: false;
  readonly protectedRouteHandlerExecutedNow: false;
  readonly providerActivatedNow: false;
  readonly providerAdapterExecutedNow: false;
  readonly realtimeProviderActivatedNow: false;
  readonly mediaProviderActivatedNow: false;
  readonly uploadProviderActivatedNow: false;
  readonly playbackProviderActivatedNow: false;
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

export type Stream118EProtectedRouteMountPlanEvidence = {
  readonly version: "STREAM-118E";
  readonly selectedSectionId: Stream118EProtectedRouteMountPlanSectionId;
  readonly mountPlanScore: number;
  readonly readySections: number;
  readonly totalSections: number;
  readonly sectionItems: readonly Stream118EProtectedRouteMountPlanSection[];
  readonly heroTitle: string;
  readonly heroSubtitle: string;
  readonly phoneStatus: string;
  readonly primaryAction: string;
  readonly secondaryAction: string;
  readonly sourceOnlyMountPlan: boolean;
  readonly exactTargetFile: boolean;
  readonly importAnchor: boolean;
  readonly mountAnchor: boolean;
  readonly protectedAdminGuard: boolean;
  readonly readOnlyHandlerContract: boolean;
  readonly providerBlockersPreserved: boolean;
  readonly dbWriteBlockersPreserved: boolean;
  readonly secretsRedaction: boolean;
  readonly rollbackPatchPlan: boolean;
  readonly walletGiftsBlocked: boolean;
  readonly routeRegistryDiscoveryReady: boolean;
  readonly protectedRouteMountPlanReady: boolean;
  readonly allConnectionsThroughKernel: true;
  readonly sourceOnlyProtectedRouteMountPlan: true;
  readonly routeRegistryDiscoveryRequired: true;
  readonly routeMountRequiresSeparateApproval: true;
  readonly backendImplementationStartedNow: false;
  readonly backendRouteMountedNow: false;
  readonly routeMountExecutedNow: false;
  readonly routeFactoryExecutedNow: false;
  readonly protectedRouteHandlerExecutedNow: false;
  readonly providerActivatedNow: false;
  readonly providerAdapterExecutedNow: false;
  readonly realtimeProviderActivatedNow: false;
  readonly mediaProviderActivatedNow: false;
  readonly uploadProviderActivatedNow: false;
  readonly playbackProviderActivatedNow: false;
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

const SECTION_COPY: Record<Stream118EProtectedRouteMountPlanSectionId, { title: string; description: string }> = {
  source_only_mount_plan: {
    title: "Source-only mount plan",
    description: "118E готовит только protected route mount patch plan; routes не монтируются, factories не выполняются и backend provider work не стартует.",
  },
  exact_target_file: {
    title: "Exact target file",
    description: "Будущий mount execution должен назвать exact backend route registry file до любого source write.",
  },
  import_anchor: {
    title: "Import anchor",
    description: "Будущий patch должен определить stable import anchor, чтобы Stream route factory добавлялась без scattered wiring.",
  },
  mount_anchor: {
    title: "Mount anchor",
    description: "Будущий protected route mount должен использовать точный Admin/owner mount anchor и никогда не expose public client endpoints.",
  },
  protected_admin_guard: {
    title: "Protected Admin guard",
    description: "Routes должны требовать owner/Admin auth до возврата Stream readiness, provider gate или preflight state.",
  },
  read_only_handler_contract: {
    title: "Read-only handler contract",
    description: "Первый mounted route должен быть read-only diagnostics без DB write, provider call, upload, publish или live activation.",
  },
  provider_blockers_preserved: {
    title: "Provider blockers preserved",
    description: "Realtime, media, upload, playback, analytics и moderation providers остаются blocked до explicit provider execution scope.",
  },
  db_write_blockers_preserved: {
    title: "DB write blockers preserved",
    description: "Во время этого route mount planning step нельзя создавать Business, Wallet, Stream, moderation или provider row.",
  },
  secrets_redaction: {
    title: "Secrets redaction",
    description: "Будущий route output должен показывать только configured/missing status и никогда не печатать env values, keys, tokens или folder IDs.",
  },
  rollback_patch_plan: {
    title: "Rollback patch plan",
    description: "Будущий mount execution требует before/after hashes, route reference scan, tsc result, service state и rollback instructions.",
  },
  wallet_gifts_blocked: {
    title: "Wallet/подарки заблокированы",
    description: "Wallet, merchant, gifts, diamonds и monetization остаются blocked до стабильной real Stream foundation и provider handoff.",
  },
};

const ALL_SECTIONS: readonly Stream118EProtectedRouteMountPlanSectionId[] = [
  "source_only_mount_plan",
  "exact_target_file",
  "import_anchor",
  "mount_anchor",
  "protected_admin_guard",
  "read_only_handler_contract",
  "provider_blockers_preserved",
  "db_write_blockers_preserved",
  "secrets_redaction",
  "rollback_patch_plan",
  "wallet_gifts_blocked",
];

const FIELD_BY_SECTION: Record<Stream118EProtectedRouteMountPlanSectionId, keyof Pick<
  Stream118EProtectedRouteMountPlanState,
  | "sourceOnlyMountPlanLocal"
  | "exactTargetFileLocal"
  | "importAnchorLocal"
  | "mountAnchorLocal"
  | "protectedAdminGuardLocal"
  | "readOnlyHandlerContractLocal"
  | "providerBlockersPreservedLocal"
  | "dbWriteBlockersPreservedLocal"
  | "secretsRedactionLocal"
  | "rollbackPatchPlanLocal"
  | "walletGiftsBlockedLocal"
>> = {
  source_only_mount_plan: "sourceOnlyMountPlanLocal",
  exact_target_file: "exactTargetFileLocal",
  import_anchor: "importAnchorLocal",
  mount_anchor: "mountAnchorLocal",
  protected_admin_guard: "protectedAdminGuardLocal",
  read_only_handler_contract: "readOnlyHandlerContractLocal",
  provider_blockers_preserved: "providerBlockersPreservedLocal",
  db_write_blockers_preserved: "dbWriteBlockersPreservedLocal",
  secrets_redaction: "secretsRedactionLocal",
  rollback_patch_plan: "rollbackPatchPlanLocal",
  wallet_gifts_blocked: "walletGiftsBlockedLocal",
};

const countReady = (state: Stream118EProtectedRouteMountPlanState): number => ALL_SECTIONS.filter((id) => state[FIELD_BY_SECTION[id]]).length;
const uniqueReady = (ids: readonly Stream118EProtectedRouteMountPlanSectionId[]): readonly Stream118EProtectedRouteMountPlanSectionId[] => Array.from(new Set(ids));

const toSection = (state: Stream118EProtectedRouteMountPlanState, id: Stream118EProtectedRouteMountPlanSectionId): Stream118EProtectedRouteMountPlanSection => ({
  id,
  title: SECTION_COPY[id].title,
  description: SECTION_COPY[id].description,
  status: state[FIELD_BY_SECTION[id]] ? "ready" : "pending",
});

export const createInitialStream118EProtectedRouteMountPlanState = (): Stream118EProtectedRouteMountPlanState => ({
  selectedSectionId: "source_only_mount_plan",
  readySectionIds: [],
  lastAction: "118E protected route mount patch plan source-only и blocked до отдельного owner-approved route mount execution.",
  sourceOnlyMountPlanLocal: false,
  exactTargetFileLocal: false,
  importAnchorLocal: false,
  mountAnchorLocal: false,
  protectedAdminGuardLocal: false,
  readOnlyHandlerContractLocal: false,
  providerBlockersPreservedLocal: false,
  dbWriteBlockersPreservedLocal: false,
  secretsRedactionLocal: false,
  rollbackPatchPlanLocal: false,
  walletGiftsBlockedLocal: false,
  allConnectionsThroughKernel: true,
  sourceOnlyProtectedRouteMountPlan: true,
  routeRegistryDiscoveryRequired: true,
  routeMountRequiresSeparateApproval: true,
  backendImplementationStartedNow: false,
  backendRouteMountedNow: false,
  routeMountExecutedNow: false,
  routeFactoryExecutedNow: false,
  protectedRouteHandlerExecutedNow: false,
  providerActivatedNow: false,
  providerAdapterExecutedNow: false,
  realtimeProviderActivatedNow: false,
  mediaProviderActivatedNow: false,
  uploadProviderActivatedNow: false,
  playbackProviderActivatedNow: false,
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
});

export const selectStream118EProtectedRouteMountPlanSection = (
  state: Stream118EProtectedRouteMountPlanState,
  sectionId: Stream118EProtectedRouteMountPlanSectionId,
): Stream118EProtectedRouteMountPlanState => ({
  ...state,
  selectedSectionId: sectionId,
  lastAction: `118E selected ${SECTION_COPY[sectionId].title}.`,
});

export const markStream118EProtectedRouteMountPlanSectionReady = (
  state: Stream118EProtectedRouteMountPlanState,
  sectionId: Stream118EProtectedRouteMountPlanSectionId,
  action: string,
): Stream118EProtectedRouteMountPlanState => ({
  ...state,
  selectedSectionId: sectionId,
  readySectionIds: uniqueReady([...state.readySectionIds, sectionId]),
  [FIELD_BY_SECTION[sectionId]]: true,
  lastAction: action,
});

export const markStream118EProtectedRouteMountPlanAllReady = (
  state: Stream118EProtectedRouteMountPlanState,
  action: string,
): Stream118EProtectedRouteMountPlanState => ({
  ...state,
  selectedSectionId: "rollback_patch_plan",
  readySectionIds: ALL_SECTIONS,
  lastAction: action,
  sourceOnlyMountPlanLocal: true,
  exactTargetFileLocal: true,
  importAnchorLocal: true,
  mountAnchorLocal: true,
  protectedAdminGuardLocal: true,
  readOnlyHandlerContractLocal: true,
  providerBlockersPreservedLocal: true,
  dbWriteBlockersPreservedLocal: true,
  secretsRedactionLocal: true,
  rollbackPatchPlanLocal: true,
  walletGiftsBlockedLocal: true,
});

export const buildStream118EProtectedRouteMountPlanEvidence = (
  state: Stream118EProtectedRouteMountPlanState,
  runtime: StreamRoomRuntimeState,
  previous: Stream118DRouteRegistryDiscoveryEvidence,
): Stream118EProtectedRouteMountPlanEvidence => {
  const readySections = countReady(state);
  const totalSections = ALL_SECTIONS.length;
  const routeRegistryDiscoveryReady = previous.routeRegistryDiscoveryReady;
  const protectedRouteMountPlanReady = readySections === totalSections && routeRegistryDiscoveryReady;

  return {
    version: "STREAM-118E",
    selectedSectionId: state.selectedSectionId,
    mountPlanScore: Math.round((readySections / totalSections) * 100),
    readySections,
    totalSections,
    sectionItems: ALL_SECTIONS.map((id) => toSection(state, id)),
    heroTitle: "План protected route mount patch",
    heroSubtitle: "Source-only plan для будущего protected Admin/owner route mount. Сейчас не выполняются route mount, route factory, provider call, DB write, Wallet, gifts или fake launch.",
    phoneStatus: runtime.status === "local_preview_active" ? "Только UI: local preview state не меняет backend/provider" : "План protected route mount остаётся source-only",
    primaryAction: "Подготовить exact target file, import anchor, mount anchor, protected guard, read-only handler и rollback plan.",
    secondaryAction: protectedRouteMountPlanReady
      ? "118E ready: future route mount can be requested as a separate controlled execution scope."
      : "Complete 118E checklist before any protected route mount execution.",
    sourceOnlyMountPlan: state.sourceOnlyMountPlanLocal,
    exactTargetFile: state.exactTargetFileLocal,
    importAnchor: state.importAnchorLocal,
    mountAnchor: state.mountAnchorLocal,
    protectedAdminGuard: state.protectedAdminGuardLocal,
    readOnlyHandlerContract: state.readOnlyHandlerContractLocal,
    providerBlockersPreserved: state.providerBlockersPreservedLocal,
    dbWriteBlockersPreserved: state.dbWriteBlockersPreservedLocal,
    secretsRedaction: state.secretsRedactionLocal,
    rollbackPatchPlan: state.rollbackPatchPlanLocal,
    walletGiftsBlocked: state.walletGiftsBlockedLocal,
    routeRegistryDiscoveryReady,
    protectedRouteMountPlanReady,
    allConnectionsThroughKernel: true,
    sourceOnlyProtectedRouteMountPlan: true,
    routeRegistryDiscoveryRequired: true,
    routeMountRequiresSeparateApproval: true,
    backendImplementationStartedNow: false,
    backendRouteMountedNow: false,
    routeMountExecutedNow: false,
    routeFactoryExecutedNow: false,
    protectedRouteHandlerExecutedNow: false,
    providerActivatedNow: false,
    providerAdapterExecutedNow: false,
    realtimeProviderActivatedNow: false,
    mediaProviderActivatedNow: false,
    uploadProviderActivatedNow: false,
    playbackProviderActivatedNow: false,
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
};
