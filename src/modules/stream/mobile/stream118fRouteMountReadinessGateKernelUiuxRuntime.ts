import type { StreamRoomRuntimeState } from "./streamRoomRuntime";
import type { Stream118EProtectedRouteMountPlanEvidence } from "./stream118eProtectedRouteMountPlanKernelUiuxRuntime";

export type Stream118FRouteMountReadinessGateSectionId =
  | "source_only_readiness_gate"
  | "target_hash_guard"
  | "import_anchor_guard"
  | "mount_anchor_guard"
  | "admin_owner_auth_gate"
  | "read_only_route_gate"
  | "no_provider_execution_gate"
  | "no_db_write_gate"
  | "secret_redaction_gate"
  | "smoke_rollback_gate"
  | "wallet_gifts_blocked";

export type Stream118FRouteMountReadinessGateStatus = "pending" | "ready";

export type Stream118FRouteMountReadinessGateSection = {
  readonly id: Stream118FRouteMountReadinessGateSectionId;
  readonly title: string;
  readonly description: string;
  readonly status: Stream118FRouteMountReadinessGateStatus;
};

export type Stream118FRouteMountReadinessGateState = {
  readonly version: "STREAM-118F";
  readonly selectedSectionId: Stream118FRouteMountReadinessGateSectionId;
  readonly readySectionIds: readonly Stream118FRouteMountReadinessGateSectionId[];
  readonly lastAction: string;
  readonly sourceOnlyReadinessGateLocal: boolean;
  readonly targetHashGuardLocal: boolean;
  readonly importAnchorGuardLocal: boolean;
  readonly mountAnchorGuardLocal: boolean;
  readonly adminOwnerAuthGateLocal: boolean;
  readonly readOnlyRouteGateLocal: boolean;
  readonly noProviderExecutionGateLocal: boolean;
  readonly noDbWriteGateLocal: boolean;
  readonly secretRedactionGateLocal: boolean;
  readonly smokeRollbackGateLocal: boolean;
  readonly walletGiftsBlockedLocal: boolean;
  readonly allConnectionsThroughKernel: true;
  readonly sourceOnlyRouteMountReadinessGate: true;
  readonly routeMountPlanRequired: true;
  readonly routeMountExecutionRequiresSeparateApproval: true;
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

export type Stream118FRouteMountReadinessGateEvidence = {
  readonly version: "STREAM-118F";
  readonly selectedSectionId: Stream118FRouteMountReadinessGateSectionId;
  readonly readinessGateScore: number;
  readonly readySections: number;
  readonly totalSections: number;
  readonly sectionItems: readonly Stream118FRouteMountReadinessGateSection[];
  readonly heroTitle: string;
  readonly heroSubtitle: string;
  readonly phoneStatus: string;
  readonly primaryAction: string;
  readonly secondaryAction: string;
  readonly sourceOnlyReadinessGate: boolean;
  readonly targetHashGuard: boolean;
  readonly importAnchorGuard: boolean;
  readonly mountAnchorGuard: boolean;
  readonly adminOwnerAuthGate: boolean;
  readonly readOnlyRouteGate: boolean;
  readonly noProviderExecutionGate: boolean;
  readonly noDbWriteGate: boolean;
  readonly secretRedactionGate: boolean;
  readonly smokeRollbackGate: boolean;
  readonly walletGiftsBlocked: boolean;
  readonly protectedRouteMountPlanReady: boolean;
  readonly routeMountReadinessGateReady: boolean;
  readonly allConnectionsThroughKernel: true;
  readonly sourceOnlyRouteMountReadinessGate: true;
  readonly routeMountPlanRequired: true;
  readonly routeMountExecutionRequiresSeparateApproval: true;
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

const SECTION_COPY: Record<Stream118FRouteMountReadinessGateSectionId, { title: string; description: string }> = {
  source_only_readiness_gate: {
    title: "Source-only readiness gate",
    description: "118F проверяет, можно ли запросить будущий protected route mount; mount не выполняется и backend/provider work не стартует.",
  },
  target_hash_guard: {
    title: "Target hash guard",
    description: "Будущий route mount execution должен фиксировать target route registry hashes до и после любого source write.",
  },
  import_anchor_guard: {
    title: "Import anchor guard",
    description: "Route factory import anchor должен быть stable и reviewed до любого mount patch в backend file.",
  },
  mount_anchor_guard: {
    title: "Mount anchor guard",
    description: "Protected Admin/owner mount anchor должен быть explicit и не expose public Stream provider endpoints.",
  },
  admin_owner_auth_gate: {
    title: "Admin/owner auth gate",
    description: "Будущий route должен быть protected by owner/Admin auth и не может возвращать provider readiness public clients.",
  },
  read_only_route_gate: {
    title: "Read-only route gate",
    description: "Первый mounted endpoint должен возвращать только diagnostics и не может mutate DB, provider, Wallet, gifts или live state.",
  },
  no_provider_execution_gate: {
    title: "Нет provider execution",
    description: "Realtime, media, upload, playback, analytics и moderation provider execution остаётся blocked до later provider scope.",
  },
  no_db_write_gate: {
    title: "Нет DB write gate",
    description: "В этом gate нельзя создавать Stream, provider, Business, Wallet, moderation, gift, diamond или monetization rows.",
  },
  secret_redaction_gate: {
    title: "Secret redaction gate",
    description: "Будущие route responses могут показывать только configured/missing status и никогда не возвращать keys, tokens, env values или folder IDs.",
  },
  smoke_rollback_gate: {
    title: "Smoke/rollback gate",
    description: "Будущий mount execution требует TypeScript, protected route smoke, no-provider-call proof, source hashes и rollback instructions.",
  },
  wallet_gifts_blocked: {
    title: "Wallet/подарки заблокированы",
    description: "Wallet, merchant, gifts, diamonds and monetization remain blocked until real Stream backend/provider foundation is stable.",
  },
};

const ALL_SECTIONS: readonly Stream118FRouteMountReadinessGateSectionId[] = [
  "source_only_readiness_gate",
  "target_hash_guard",
  "import_anchor_guard",
  "mount_anchor_guard",
  "admin_owner_auth_gate",
  "read_only_route_gate",
  "no_provider_execution_gate",
  "no_db_write_gate",
  "secret_redaction_gate",
  "smoke_rollback_gate",
  "wallet_gifts_blocked",
];

const FIELD_BY_SECTION: Record<Stream118FRouteMountReadinessGateSectionId, keyof Pick<
  Stream118FRouteMountReadinessGateState,
  | "sourceOnlyReadinessGateLocal"
  | "targetHashGuardLocal"
  | "importAnchorGuardLocal"
  | "mountAnchorGuardLocal"
  | "adminOwnerAuthGateLocal"
  | "readOnlyRouteGateLocal"
  | "noProviderExecutionGateLocal"
  | "noDbWriteGateLocal"
  | "secretRedactionGateLocal"
  | "smokeRollbackGateLocal"
  | "walletGiftsBlockedLocal"
>> = {
  source_only_readiness_gate: "sourceOnlyReadinessGateLocal",
  target_hash_guard: "targetHashGuardLocal",
  import_anchor_guard: "importAnchorGuardLocal",
  mount_anchor_guard: "mountAnchorGuardLocal",
  admin_owner_auth_gate: "adminOwnerAuthGateLocal",
  read_only_route_gate: "readOnlyRouteGateLocal",
  no_provider_execution_gate: "noProviderExecutionGateLocal",
  no_db_write_gate: "noDbWriteGateLocal",
  secret_redaction_gate: "secretRedactionGateLocal",
  smoke_rollback_gate: "smokeRollbackGateLocal",
  wallet_gifts_blocked: "walletGiftsBlockedLocal",
};

const countReady = (state: Stream118FRouteMountReadinessGateState): number => ALL_SECTIONS.filter((id) => state[FIELD_BY_SECTION[id]]).length;
const uniqueReady = (ids: readonly Stream118FRouteMountReadinessGateSectionId[]): readonly Stream118FRouteMountReadinessGateSectionId[] => ALL_SECTIONS.filter((id) => ids.includes(id));

const toSection = (state: Stream118FRouteMountReadinessGateState, id: Stream118FRouteMountReadinessGateSectionId): Stream118FRouteMountReadinessGateSection => ({
  id,
  title: SECTION_COPY[id].title,
  description: SECTION_COPY[id].description,
  status: state[FIELD_BY_SECTION[id]] ? "ready" : "pending",
});

export const createInitialStream118FRouteMountReadinessGateState = (): Stream118FRouteMountReadinessGateState => ({
  version: "STREAM-118F",
  selectedSectionId: "source_only_readiness_gate",
  readySectionIds: [],
  lastAction: "118F route mount readiness gate source-only и ждёт owner-approved mount execution.",
  sourceOnlyReadinessGateLocal: false,
  targetHashGuardLocal: false,
  importAnchorGuardLocal: false,
  mountAnchorGuardLocal: false,
  adminOwnerAuthGateLocal: false,
  readOnlyRouteGateLocal: false,
  noProviderExecutionGateLocal: false,
  noDbWriteGateLocal: false,
  secretRedactionGateLocal: false,
  smokeRollbackGateLocal: false,
  walletGiftsBlockedLocal: false,
  allConnectionsThroughKernel: true,
  sourceOnlyRouteMountReadinessGate: true,
  routeMountPlanRequired: true,
  routeMountExecutionRequiresSeparateApproval: true,
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

export const selectStream118FRouteMountReadinessGateSection = (
  state: Stream118FRouteMountReadinessGateState,
  sectionId: Stream118FRouteMountReadinessGateSectionId,
): Stream118FRouteMountReadinessGateState => ({
  ...state,
  selectedSectionId: sectionId,
  lastAction: `118F selected ${SECTION_COPY[sectionId].title}.`,
});

export const markStream118FRouteMountReadinessGateSectionReady = (
  state: Stream118FRouteMountReadinessGateState,
  sectionId: Stream118FRouteMountReadinessGateSectionId,
  action: string,
): Stream118FRouteMountReadinessGateState => ({
  ...state,
  selectedSectionId: sectionId,
  readySectionIds: uniqueReady([...state.readySectionIds, sectionId]),
  [FIELD_BY_SECTION[sectionId]]: true,
  lastAction: action,
});

export const markStream118FRouteMountReadinessGateAllReady = (
  state: Stream118FRouteMountReadinessGateState,
  action: string,
): Stream118FRouteMountReadinessGateState => ({
  ...state,
  selectedSectionId: "smoke_rollback_gate",
  readySectionIds: ALL_SECTIONS,
  lastAction: action,
  sourceOnlyReadinessGateLocal: true,
  targetHashGuardLocal: true,
  importAnchorGuardLocal: true,
  mountAnchorGuardLocal: true,
  adminOwnerAuthGateLocal: true,
  readOnlyRouteGateLocal: true,
  noProviderExecutionGateLocal: true,
  noDbWriteGateLocal: true,
  secretRedactionGateLocal: true,
  smokeRollbackGateLocal: true,
  walletGiftsBlockedLocal: true,
});

export const buildStream118FRouteMountReadinessGateEvidence = (
  state: Stream118FRouteMountReadinessGateState,
  runtime: StreamRoomRuntimeState,
  previous: Stream118EProtectedRouteMountPlanEvidence,
): Stream118FRouteMountReadinessGateEvidence => {
  const readySections = countReady(state);
  const totalSections = ALL_SECTIONS.length;
  const protectedRouteMountPlanReady = previous.protectedRouteMountPlanReady;
  const routeMountReadinessGateReady = readySections === totalSections && protectedRouteMountPlanReady;

  return {
    version: "STREAM-118F",
    selectedSectionId: state.selectedSectionId,
    readinessGateScore: Math.round((readySections / totalSections) * 100),
    readySections,
    totalSections,
    sectionItems: ALL_SECTIONS.map((id) => toSection(state, id)),
    heroTitle: "Gate готовности protected route mount",
    heroSubtitle: "Source-only gate перед future controlled route mount. Сейчас не выполняются backend route, route factory, provider call, DB write, Wallet, gifts или fake launch.",
    phoneStatus: runtime.status === "local_preview_active" ? "Только UI: runtime остаётся local, route mount blocked" : "Route mount readiness gate остаётся source-only",
    primaryAction: "Проверить target hash, anchors, Admin/owner auth, read-only route, secret redaction, no-provider/no-DB gates и rollback smoke requirements.",
    secondaryAction: routeMountReadinessGateReady
      ? "118F ready: protected route mount can be requested later as a separate controlled source-write execution."
      : "Complete 118F gate before any route mount source write is allowed.",
    sourceOnlyReadinessGate: state.sourceOnlyReadinessGateLocal,
    targetHashGuard: state.targetHashGuardLocal,
    importAnchorGuard: state.importAnchorGuardLocal,
    mountAnchorGuard: state.mountAnchorGuardLocal,
    adminOwnerAuthGate: state.adminOwnerAuthGateLocal,
    readOnlyRouteGate: state.readOnlyRouteGateLocal,
    noProviderExecutionGate: state.noProviderExecutionGateLocal,
    noDbWriteGate: state.noDbWriteGateLocal,
    secretRedactionGate: state.secretRedactionGateLocal,
    smokeRollbackGate: state.smokeRollbackGateLocal,
    walletGiftsBlocked: state.walletGiftsBlockedLocal,
    protectedRouteMountPlanReady,
    routeMountReadinessGateReady,
    allConnectionsThroughKernel: true,
    sourceOnlyRouteMountReadinessGate: true,
    routeMountPlanRequired: true,
    routeMountExecutionRequiresSeparateApproval: true,
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
