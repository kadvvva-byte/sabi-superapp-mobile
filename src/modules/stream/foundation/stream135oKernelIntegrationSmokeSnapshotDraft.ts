import {
  STREAM_135N_KERNEL_ACTION_DISPATCHER_DRAFT_VERSION,
  dispatchStream135NKernelAction,
  getStream135NDispatchSnapshot,
  type Stream135NActionKind,
  type Stream135NDispatchChannel,
  type Stream135NDispatchResult,
} from "./stream135nKernelActionDispatcherDraft";

export const STREAM_135O_KERNEL_INTEGRATION_SMOKE_SNAPSHOT_DRAFT_VERSION = "STREAM-CORE-135O" as const;

export type Stream135OSmokeCaseStatus = "passed_local_kernel_only" | "passed_safe_blocked" | "failed_contract_mismatch";

export type Stream135OSmokeCase = Readonly<{
  id: string;
  actionKind: Stream135NActionKind;
  expectedChannel: Stream135NDispatchChannel;
  expectedLocalKernelOnly: boolean;
  expectedStateAfter: string;
  requiresBackendCommonLater: boolean;
  requiresAdminGateLater: boolean;
  requiresProviderGateLater: boolean;
  requiresWalletGiftStageLater: boolean;
}>;

export type Stream135OSmokeCaseResult = Readonly<{
  version: typeof STREAM_135O_KERNEL_INTEGRATION_SMOKE_SNAPSHOT_DRAFT_VERSION;
  sourceDispatcherVersion: typeof STREAM_135N_KERNEL_ACTION_DISPATCHER_DRAFT_VERSION;
  id: string;
  actionKind: Stream135NActionKind;
  status: Stream135OSmokeCaseStatus;
  expectedChannel: Stream135NDispatchChannel;
  actualChannel: Stream135NDispatchChannel;
  expectedLocalKernelOnly: boolean;
  actualLocalKernelOnly: boolean;
  expectedStateAfter: string;
  actualStateAfter: string;
  safeExecutionBlocked: boolean;
  noMobileSuperAppModuleRequired: true;
  backendExecutionAllowedNow: false;
  providerExecutionAllowedNow: false;
  dbWriteAllowedNow: false;
  routeMountAllowedNow: false;
  mobileSecretAllowed: false;
  fakeSuccessAllowed: false;
  dispatch: Stream135NDispatchResult;
}>;

export type Stream135OSmokeSnapshot = Readonly<{
  version: typeof STREAM_135O_KERNEL_INTEGRATION_SMOKE_SNAPSHOT_DRAFT_VERSION;
  sourceDispatcherVersion: typeof STREAM_135N_KERNEL_ACTION_DISPATCHER_DRAFT_VERSION;
  scope: "stream_mobile_kernel_only";
  moduleBoundary: "no_src_modules_superapp_inside_mobile";
  pipeline: readonly [
    "135K_event_envelope",
    "135L_reducer",
    "135M_state_machine",
    "135N_dispatcher",
    "135O_smoke_snapshot",
  ];
  totalCases: number;
  passedCases: number;
  failedCases: number;
  localKernelOnlyCases: number;
  safeBlockedCases: number;
  dispatcherSnapshot: ReturnType<typeof getStream135NDispatchSnapshot>;
  cases: readonly Stream135OSmokeCaseResult[];
  nextStep: "STREAM-CORE-135P mobile kernel facade draft";
  safety: typeof stream135oKernelIntegrationSmokeSafety;
}>;

export const stream135oSmokeCases = [
  {
    id: "open_entry_local_kernel_only",
    actionKind: "open_stream_entry",
    expectedChannel: "local_kernel_snapshot",
    expectedLocalKernelOnly: true,
    expectedStateAfter: "local_draft_ready",
    requiresBackendCommonLater: false,
    requiresAdminGateLater: false,
    requiresProviderGateLater: false,
    requiresWalletGiftStageLater: false,
  },
  {
    id: "live_single_backend_common_blocked",
    actionKind: "prepare_live_single",
    expectedChannel: "blocked_backend_common_foundation",
    expectedLocalKernelOnly: false,
    expectedStateAfter: "blocked_backend_common_foundation_missing",
    requiresBackendCommonLater: true,
    requiresAdminGateLater: false,
    requiresProviderGateLater: true,
    requiresWalletGiftStageLater: false,
  },
  {
    id: "group_live_realtime_blocked",
    actionKind: "prepare_live_group",
    expectedChannel: "blocked_realtime_foundation",
    expectedLocalKernelOnly: false,
    expectedStateAfter: "blocked_realtime_foundation_missing",
    requiresBackendCommonLater: true,
    requiresAdminGateLater: false,
    requiresProviderGateLater: true,
    requiresWalletGiftStageLater: false,
  },
  {
    id: "audio_live_media_blocked",
    actionKind: "prepare_live_audio",
    expectedChannel: "blocked_media_foundation",
    expectedLocalKernelOnly: false,
    expectedStateAfter: "blocked_media_foundation_missing",
    requiresBackendCommonLater: true,
    requiresAdminGateLater: false,
    requiresProviderGateLater: true,
    requiresWalletGiftStageLater: false,
  },
  {
    id: "shorts_creator_local_kernel_only",
    actionKind: "prepare_shorts_creator",
    expectedChannel: "local_kernel_snapshot",
    expectedLocalKernelOnly: true,
    expectedStateAfter: "local_kernel_snapshot_ready",
    requiresBackendCommonLater: false,
    requiresAdminGateLater: false,
    requiresProviderGateLater: false,
    requiresWalletGiftStageLater: false,
  },
  {
    id: "shorts_feed_backend_common_blocked",
    actionKind: "prepare_shorts_feed",
    expectedChannel: "blocked_backend_common_foundation",
    expectedLocalKernelOnly: false,
    expectedStateAfter: "blocked_backend_common_foundation_missing",
    requiresBackendCommonLater: true,
    requiresAdminGateLater: false,
    requiresProviderGateLater: true,
    requiresWalletGiftStageLater: false,
  },
  {
    id: "business_stream_admin_blocked",
    actionKind: "prepare_business_stream",
    expectedChannel: "blocked_admin_gate",
    expectedLocalKernelOnly: false,
    expectedStateAfter: "blocked_admin_gate_missing",
    requiresBackendCommonLater: true,
    requiresAdminGateLater: true,
    requiresProviderGateLater: true,
    requiresWalletGiftStageLater: false,
  },
  {
    id: "creator_profile_local_kernel_only",
    actionKind: "prepare_creator_profile",
    expectedChannel: "local_kernel_snapshot",
    expectedLocalKernelOnly: true,
    expectedStateAfter: "local_preflight_ready",
    requiresBackendCommonLater: false,
    requiresAdminGateLater: false,
    requiresProviderGateLater: false,
    requiresWalletGiftStageLater: false,
  },
  {
    id: "moderation_admin_gate_blocked",
    actionKind: "prepare_moderation_admin",
    expectedChannel: "blocked_admin_gate",
    expectedLocalKernelOnly: false,
    expectedStateAfter: "blocked_admin_gate_missing",
    requiresBackendCommonLater: true,
    requiresAdminGateLater: true,
    requiresProviderGateLater: false,
    requiresWalletGiftStageLater: false,
  },
  {
    id: "playback_analytics_backend_common_blocked",
    actionKind: "prepare_playback_analytics",
    expectedChannel: "blocked_backend_common_foundation",
    expectedLocalKernelOnly: false,
    expectedStateAfter: "blocked_backend_common_foundation_missing",
    requiresBackendCommonLater: true,
    requiresAdminGateLater: false,
    requiresProviderGateLater: true,
    requiresWalletGiftStageLater: false,
  },
  {
    id: "wallet_gift_boundary_last_stage_blocked",
    actionKind: "prepare_wallet_gift_boundary",
    expectedChannel: "blocked_wallet_gift_stage",
    expectedLocalKernelOnly: false,
    expectedStateAfter: "blocked_wallet_gift_stage_missing",
    requiresBackendCommonLater: true,
    requiresAdminGateLater: true,
    requiresProviderGateLater: true,
    requiresWalletGiftStageLater: true,
  },
  {
    id: "backend_execution_request_blocked",
    actionKind: "request_backend_common_execution",
    expectedChannel: "blocked_backend_common_foundation",
    expectedLocalKernelOnly: false,
    expectedStateAfter: "blocked_backend_common_foundation_missing",
    requiresBackendCommonLater: true,
    requiresAdminGateLater: false,
    requiresProviderGateLater: true,
    requiresWalletGiftStageLater: false,
  },
  {
    id: "provider_execution_request_blocked",
    actionKind: "request_provider_execution",
    expectedChannel: "blocked_provider_gate",
    expectedLocalKernelOnly: false,
    expectedStateAfter: "blocked_provider_gate_missing",
    requiresBackendCommonLater: true,
    requiresAdminGateLater: true,
    requiresProviderGateLater: true,
    requiresWalletGiftStageLater: false,
  },
  {
    id: "wallet_gift_execution_request_blocked",
    actionKind: "request_wallet_gift_execution",
    expectedChannel: "blocked_wallet_gift_stage",
    expectedLocalKernelOnly: false,
    expectedStateAfter: "blocked_wallet_gift_stage_missing",
    requiresBackendCommonLater: true,
    requiresAdminGateLater: true,
    requiresProviderGateLater: true,
    requiresWalletGiftStageLater: true,
  },
] as const satisfies readonly Stream135OSmokeCase[];

function safeExecutionIsBlocked(dispatch: Stream135NDispatchResult): boolean {
  return dispatch.backendExecutionAllowedNow === false
    && dispatch.providerExecutionAllowedNow === false
    && dispatch.dbWriteAllowedNow === false
    && dispatch.routeMountAllowedNow === false
    && dispatch.mobileSecretAllowed === false
    && dispatch.fakeSuccessAllowed === false;
}

export function runStream135OSmokeCase(testCase: Stream135OSmokeCase): Stream135OSmokeCaseResult {
  const dispatch = dispatchStream135NKernelAction(testCase.actionKind);
  const channelMatches = dispatch.channel === testCase.expectedChannel;
  const localMatches = dispatch.acceptedLocalKernelOnly === testCase.expectedLocalKernelOnly;
  const stateMatches = dispatch.stateAfter === testCase.expectedStateAfter;
  const executionBlocked = safeExecutionIsBlocked(dispatch);
  const passed = channelMatches && localMatches && stateMatches && executionBlocked;

  return {
    version: STREAM_135O_KERNEL_INTEGRATION_SMOKE_SNAPSHOT_DRAFT_VERSION,
    sourceDispatcherVersion: STREAM_135N_KERNEL_ACTION_DISPATCHER_DRAFT_VERSION,
    id: testCase.id,
    actionKind: testCase.actionKind,
    status: passed
      ? testCase.expectedLocalKernelOnly
        ? "passed_local_kernel_only"
        : "passed_safe_blocked"
      : "failed_contract_mismatch",
    expectedChannel: testCase.expectedChannel,
    actualChannel: dispatch.channel,
    expectedLocalKernelOnly: testCase.expectedLocalKernelOnly,
    actualLocalKernelOnly: dispatch.acceptedLocalKernelOnly,
    expectedStateAfter: testCase.expectedStateAfter,
    actualStateAfter: dispatch.stateAfter,
    safeExecutionBlocked: executionBlocked,
    noMobileSuperAppModuleRequired: true,
    backendExecutionAllowedNow: false,
    providerExecutionAllowedNow: false,
    dbWriteAllowedNow: false,
    routeMountAllowedNow: false,
    mobileSecretAllowed: false,
    fakeSuccessAllowed: false,
    dispatch,
  };
}

export function getStream135OKernelIntegrationSmokeSnapshot(): Stream135OSmokeSnapshot {
  const cases = stream135oSmokeCases.map(runStream135OSmokeCase);
  const passedCases = cases.filter((item) => item.status !== "failed_contract_mismatch").length;
  const localKernelOnlyCases = cases.filter((item) => item.status === "passed_local_kernel_only").length;
  const safeBlockedCases = cases.filter((item) => item.status === "passed_safe_blocked").length;

  return {
    version: STREAM_135O_KERNEL_INTEGRATION_SMOKE_SNAPSHOT_DRAFT_VERSION,
    sourceDispatcherVersion: STREAM_135N_KERNEL_ACTION_DISPATCHER_DRAFT_VERSION,
    scope: "stream_mobile_kernel_only",
    moduleBoundary: "no_src_modules_superapp_inside_mobile",
    pipeline: [
      "135K_event_envelope",
      "135L_reducer",
      "135M_state_machine",
      "135N_dispatcher",
      "135O_smoke_snapshot",
    ],
    totalCases: cases.length,
    passedCases,
    failedCases: cases.length - passedCases,
    localKernelOnlyCases,
    safeBlockedCases,
    dispatcherSnapshot: getStream135NDispatchSnapshot(),
    cases,
    nextStep: "STREAM-CORE-135P mobile kernel facade draft",
    safety: stream135oKernelIntegrationSmokeSafety,
  };
}

export const stream135oKernelIntegrationSmokeSafety = {
  version: STREAM_135O_KERNEL_INTEGRATION_SMOKE_SNAPSHOT_DRAFT_VERSION,
  scope: "stream_mobile_kernel_only",
  moduleBoundary: "no_src_modules_superapp_inside_mobile",
  backendRoutesMounted: 0,
  routeMountExecuted: 0,
  dbWrites: 0,
  providerCalls: 0,
  walletRuntimeTouched: 0,
  messengerRuntimeTouched: 0,
  giftsPaymentsRuntimeTouched: 0,
  mobileSecretsAllowed: false,
  fakeLiveAllowed: false,
  fakeUploadAllowed: false,
  fakePublishAllowed: false,
  fakePlaybackAllowed: false,
  fakeAnalyticsAllowed: false,
  fakeModerationAllowed: false,
  fakePaymentGiftAllowed: false,
  smokeRunsAreReadOnly: true,
  nextStep: "STREAM-CORE-135P mobile kernel facade draft",
} as const;
