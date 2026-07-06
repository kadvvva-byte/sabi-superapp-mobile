import type { StreamRoomRuntimeState } from "./streamRoomRuntime";
import type { Stream118CReadOnlyPreflightEvidence } from "./stream118cReadOnlyPreflightSnapshotKernelUiuxRuntime";

export type Stream118DRouteRegistryDiscoverySectionId =
  | "source_only_discovery"
  | "route_targets_inventory"
  | "admin_mount_targets"
  | "kernel_route_contracts"
  | "auth_guard_required"
  | "provider_paths_blocked"
  | "mobile_secret_guard"
  | "no_route_mount_execution"
  | "smoke_readiness"
  | "rollback_hashes"
  | "wallet_gifts_blocked";

export type Stream118DRouteRegistryDiscoveryStatus = "ready" | "blocked";

export type Stream118DRouteRegistryDiscoverySection = {
  readonly id: Stream118DRouteRegistryDiscoverySectionId;
  readonly title: string;
  readonly description: string;
  readonly status: Stream118DRouteRegistryDiscoveryStatus;
};

export type Stream118DRouteRegistryDiscoveryState = {
  readonly version: "STREAM-118D";
  readonly selectedSectionId: Stream118DRouteRegistryDiscoverySectionId;
  readonly readySectionIds: readonly Stream118DRouteRegistryDiscoverySectionId[];
  readonly lastAction: string;
  readonly sourceOnlyDiscoveryLocal: boolean;
  readonly routeTargetsInventoryLocal: boolean;
  readonly adminMountTargetsLocal: boolean;
  readonly kernelRouteContractsLocal: boolean;
  readonly authGuardRequiredLocal: boolean;
  readonly providerPathsBlockedLocal: boolean;
  readonly mobileSecretGuardLocal: boolean;
  readonly noRouteMountExecutionLocal: boolean;
  readonly smokeReadinessLocal: boolean;
  readonly rollbackHashesLocal: boolean;
  readonly walletGiftsBlockedLocal: boolean;
  readonly allConnectionsThroughKernel: true;
  readonly sourceOnlyRouteDiscovery: true;
  readonly readOnlyDiscoveryOnly: true;
  readonly routeMountRequiresSeparateApproval: true;
  readonly backendImplementationStartedNow: false;
  readonly backendRoutesMountedNow: false;
  readonly routeMountExecutedNow: false;
  readonly routeFactoryExecutedNow: false;
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

export type Stream118DRouteRegistryDiscoveryEvidence = {
  readonly version: "STREAM-118D";
  readonly selectedSectionId: Stream118DRouteRegistryDiscoverySectionId;
  readonly routeDiscoveryScore: number;
  readonly readySections: number;
  readonly totalSections: number;
  readonly sectionItems: readonly Stream118DRouteRegistryDiscoverySection[];
  readonly heroTitle: string;
  readonly heroSubtitle: string;
  readonly phoneStatus: string;
  readonly primaryAction: string;
  readonly secondaryAction: string;
  readonly sourceOnlyDiscovery: boolean;
  readonly routeTargetsInventory: boolean;
  readonly adminMountTargets: boolean;
  readonly kernelRouteContracts: boolean;
  readonly authGuardRequired: boolean;
  readonly providerPathsBlocked: boolean;
  readonly mobileSecretGuard: boolean;
  readonly noRouteMountExecution: boolean;
  readonly smokeReadiness: boolean;
  readonly rollbackHashes: boolean;
  readonly walletGiftsBlocked: boolean;
  readonly readOnlyPreflightSnapshotReady: boolean;
  readonly routeRegistryDiscoveryReady: boolean;
  readonly allConnectionsThroughKernel: true;
  readonly sourceOnlyRouteDiscovery: true;
  readonly readOnlyDiscoveryOnly: true;
  readonly routeMountRequiresSeparateApproval: true;
  readonly backendImplementationStartedNow: false;
  readonly backendRoutesMountedNow: false;
  readonly routeMountExecutedNow: false;
  readonly routeFactoryExecutedNow: false;
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

const SECTION_COPY: Record<Stream118DRouteRegistryDiscoverySectionId, { title: string; description: string }> = {
  source_only_discovery: {
    title: "Source-only discovery",
    description: "118D только обнаруживает требования route registry; Stream backend route не монтируется и route factory не выполняется.",
  },
  route_targets_inventory: {
    title: "Route target inventory",
    description: "Будущая backend work должна определить exact route files, mount anchors и existing Stream route references до patching.",
  },
  admin_mount_targets: {
    title: "Admin mount targets",
    description: "Admin diagnostics и owner-only preflight routes требуют protected mount targets без public client exposure.",
  },
  kernel_route_contracts: {
    title: "Kernel route contracts",
    description: "Все room lifecycle, realtime, media, upload и moderation routes должны идти через Stream kernel contracts.",
  },
  auth_guard_required: {
    title: "Auth guard обязателен",
    description: "Будущий route execution должен доказать admin/owner auth guards до возврата readiness или provider state.",
  },
  provider_paths_blocked: {
    title: "Provider paths заблокированы",
    description: "Provider adapter paths остаются blocked; discovery не должен вызывать realtime, media, upload или analytics providers.",
  },
  mobile_secret_guard: {
    title: "Mobile secret guard",
    description: "Route discovery никогда не должен переносить provider keys, env values, tokens или folder IDs в mobile code или UI responses.",
  },
  no_route_mount_execution: {
    title: "Нет route mount execution",
    description: "Этот шаг не является mount patch. Любой route mount требует отдельный owner-approved controlled execution stage.",
  },
  smoke_readiness: {
    title: "Smoke readiness",
    description: "Будущая route work требует tsc, health, protected-route, no-provider-call и no-DB-write smoke evidence.",
  },
  rollback_hashes: {
    title: "Rollback hashes",
    description: "Будущие route patches должны фиксировать file hashes, before/after route registry state и rollback instructions.",
  },
  wallet_gifts_blocked: {
    title: "Wallet/подарки заблокированы",
    description: "Gifts, Wallet, merchant, diamonds and monetization remain blocked until real Stream foundation is stable.",
  },
};

const ALL_SECTIONS: readonly Stream118DRouteRegistryDiscoverySectionId[] = [
  "source_only_discovery",
  "route_targets_inventory",
  "admin_mount_targets",
  "kernel_route_contracts",
  "auth_guard_required",
  "provider_paths_blocked",
  "mobile_secret_guard",
  "no_route_mount_execution",
  "smoke_readiness",
  "rollback_hashes",
  "wallet_gifts_blocked",
];

const FIELD_BY_SECTION: Record<Stream118DRouteRegistryDiscoverySectionId, keyof Pick<
  Stream118DRouteRegistryDiscoveryState,
  | "sourceOnlyDiscoveryLocal"
  | "routeTargetsInventoryLocal"
  | "adminMountTargetsLocal"
  | "kernelRouteContractsLocal"
  | "authGuardRequiredLocal"
  | "providerPathsBlockedLocal"
  | "mobileSecretGuardLocal"
  | "noRouteMountExecutionLocal"
  | "smokeReadinessLocal"
  | "rollbackHashesLocal"
  | "walletGiftsBlockedLocal"
>> = {
  source_only_discovery: "sourceOnlyDiscoveryLocal",
  route_targets_inventory: "routeTargetsInventoryLocal",
  admin_mount_targets: "adminMountTargetsLocal",
  kernel_route_contracts: "kernelRouteContractsLocal",
  auth_guard_required: "authGuardRequiredLocal",
  provider_paths_blocked: "providerPathsBlockedLocal",
  mobile_secret_guard: "mobileSecretGuardLocal",
  no_route_mount_execution: "noRouteMountExecutionLocal",
  smoke_readiness: "smokeReadinessLocal",
  rollback_hashes: "rollbackHashesLocal",
  wallet_gifts_blocked: "walletGiftsBlockedLocal",
};

const countReady = (state: Stream118DRouteRegistryDiscoveryState): number => ALL_SECTIONS.filter((id) => state[FIELD_BY_SECTION[id]]).length;
const uniqueReady = (ids: readonly Stream118DRouteRegistryDiscoverySectionId[]): readonly Stream118DRouteRegistryDiscoverySectionId[] => Array.from(new Set(ids));

const toSection = (state: Stream118DRouteRegistryDiscoveryState, id: Stream118DRouteRegistryDiscoverySectionId): Stream118DRouteRegistryDiscoverySection => ({
  id,
  title: SECTION_COPY[id].title,
  description: SECTION_COPY[id].description,
  status: state[FIELD_BY_SECTION[id]] ? "ready" : "blocked",
});

export const createInitialStream118DRouteRegistryDiscoveryState = (): Stream118DRouteRegistryDiscoveryState => ({
  version: "STREAM-118D",
  selectedSectionId: "source_only_discovery",
  readySectionIds: [],
  lastAction: "118D waiting: route registry discovery source-only; нет route mount, provider call, DB write, Wallet, gifts или fake launch.",
  sourceOnlyDiscoveryLocal: false,
  routeTargetsInventoryLocal: false,
  adminMountTargetsLocal: false,
  kernelRouteContractsLocal: false,
  authGuardRequiredLocal: false,
  providerPathsBlockedLocal: false,
  mobileSecretGuardLocal: false,
  noRouteMountExecutionLocal: false,
  smokeReadinessLocal: false,
  rollbackHashesLocal: false,
  walletGiftsBlockedLocal: false,
  allConnectionsThroughKernel: true,
  sourceOnlyRouteDiscovery: true,
  readOnlyDiscoveryOnly: true,
  routeMountRequiresSeparateApproval: true,
  backendImplementationStartedNow: false,
  backendRoutesMountedNow: false,
  routeMountExecutedNow: false,
  routeFactoryExecutedNow: false,
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
});

export const selectStream118DRouteRegistryDiscoverySection = (
  state: Stream118DRouteRegistryDiscoveryState,
  sectionId: Stream118DRouteRegistryDiscoverySectionId,
): Stream118DRouteRegistryDiscoveryState => ({
  ...state,
  selectedSectionId: sectionId,
  lastAction: `Selected 118D route discovery section: ${SECTION_COPY[sectionId].title}`,
});

export const markStream118DRouteRegistryDiscoverySectionReady = (
  state: Stream118DRouteRegistryDiscoveryState,
  sectionId: Stream118DRouteRegistryDiscoverySectionId,
  action: string,
): Stream118DRouteRegistryDiscoveryState => ({
  ...state,
  selectedSectionId: sectionId,
  readySectionIds: uniqueReady([...state.readySectionIds, sectionId]),
  [FIELD_BY_SECTION[sectionId]]: true,
  lastAction: action,
});

export const markStream118DRouteRegistryDiscoveryAllReady = (
  state: Stream118DRouteRegistryDiscoveryState,
  action: string,
): Stream118DRouteRegistryDiscoveryState => ({
  ...state,
  readySectionIds: ALL_SECTIONS,
  sourceOnlyDiscoveryLocal: true,
  routeTargetsInventoryLocal: true,
  adminMountTargetsLocal: true,
  kernelRouteContractsLocal: true,
  authGuardRequiredLocal: true,
  providerPathsBlockedLocal: true,
  mobileSecretGuardLocal: true,
  noRouteMountExecutionLocal: true,
  smokeReadinessLocal: true,
  rollbackHashesLocal: true,
  walletGiftsBlockedLocal: true,
  lastAction: action,
});

export const buildStream118DRouteRegistryDiscoveryEvidence = (
  state: Stream118DRouteRegistryDiscoveryState,
  room: StreamRoomRuntimeState,
  preflightEvidence: Stream118CReadOnlyPreflightEvidence,
): Stream118DRouteRegistryDiscoveryEvidence => {
  const readySections = countReady(state);
  const routeRegistryDiscoveryReady = readySections === ALL_SECTIONS.length && preflightEvidence.readOnlyPreflightSnapshotReady;
  const score = Math.round((readySections / ALL_SECTIONS.length) * 100);
  return {
    version: "STREAM-118D",
    selectedSectionId: state.selectedSectionId,
    routeDiscoveryScore: score,
    readySections,
    totalSections: ALL_SECTIONS.length,
    sectionItems: ALL_SECTIONS.map((id) => toSection(state, id)),
    heroTitle: "Обнаружение route registry",
    heroSubtitle: routeRegistryDiscoveryReady
      ? "Обнаружение route registry is locked as source-only/read-only: mount targets, auth guard, kernel contract and rollback are ready for a future approved backend slice."
      : "Prepare exact route registry discovery before any backend route mount. No route execution, provider call, DB write, secret exposure, Wallet, gifts or fake launch.",
    phoneStatus: `${room.title || "Sabi Stream"} · 118D route discovery · source-only`,
    primaryAction: state.lastAction,
    secondaryAction: "Дальше: controlled route mount readiness gate только после owner approval; не mount routes, не call providers и не включать production traffic в этом UI slice.",
    sourceOnlyDiscovery: state.sourceOnlyDiscoveryLocal,
    routeTargetsInventory: state.routeTargetsInventoryLocal,
    adminMountTargets: state.adminMountTargetsLocal,
    kernelRouteContracts: state.kernelRouteContractsLocal,
    authGuardRequired: state.authGuardRequiredLocal,
    providerPathsBlocked: state.providerPathsBlockedLocal,
    mobileSecretGuard: state.mobileSecretGuardLocal,
    noRouteMountExecution: state.noRouteMountExecutionLocal,
    smokeReadiness: state.smokeReadinessLocal,
    rollbackHashes: state.rollbackHashesLocal,
    walletGiftsBlocked: state.walletGiftsBlockedLocal,
    readOnlyPreflightSnapshotReady: preflightEvidence.readOnlyPreflightSnapshotReady,
    routeRegistryDiscoveryReady,
    allConnectionsThroughKernel: true,
    sourceOnlyRouteDiscovery: true,
    readOnlyDiscoveryOnly: true,
    routeMountRequiresSeparateApproval: true,
    backendImplementationStartedNow: false,
    backendRoutesMountedNow: false,
    routeMountExecutedNow: false,
    routeFactoryExecutedNow: false,
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
};
