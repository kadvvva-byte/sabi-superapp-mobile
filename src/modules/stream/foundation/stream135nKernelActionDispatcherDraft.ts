import {
  STREAM_135M_KERNEL_STATE_MACHINE_DRAFT_VERSION,
  getStream135MModeReadiness,
  reduceStream135MKernelState,
  type Stream135MKernelEvent,
  type Stream135MKernelMode,
  type Stream135MKernelState,
  type Stream135MKernelTransitionResult,
} from "./stream135mKernelStateMachineDraft";

export const STREAM_135N_KERNEL_ACTION_DISPATCHER_DRAFT_VERSION = "STREAM-CORE-135N" as const;

export type Stream135NActionKind =
  | "open_stream_entry"
  | "open_live_composer"
  | "prepare_live_single"
  | "prepare_live_group"
  | "prepare_live_audio"
  | "prepare_live_game_screen"
  | "prepare_live_video_file"
  | "prepare_shorts_creator"
  | "prepare_shorts_feed"
  | "prepare_business_stream"
  | "prepare_creator_profile"
  | "prepare_moderation_admin"
  | "prepare_playback_analytics"
  | "prepare_wallet_gift_boundary"
  | "request_backend_common_execution"
  | "request_provider_execution"
  | "request_admin_execution"
  | "request_wallet_gift_execution";

export type Stream135NDispatchChannel =
  | "local_kernel_snapshot"
  | "blocked_backend_common_foundation"
  | "blocked_realtime_foundation"
  | "blocked_media_foundation"
  | "blocked_admin_gate"
  | "blocked_provider_gate"
  | "blocked_wallet_gift_stage"
  | "blocked_unknown_action";

export type Stream135NDispatchReason =
  | "ui_state_only_allowed"
  | "backend_common_foundation_is_outside_mobile"
  | "realtime_foundation_is_not_ready"
  | "media_foundation_is_not_ready"
  | "admin_gate_is_not_ready"
  | "provider_gate_is_not_ready"
  | "wallet_gift_stage_is_last"
  | "unknown_action_blocked_by_default";

export type Stream135NActionDescriptor = Readonly<{
  actionKind: Stream135NActionKind;
  mode: Stream135MKernelMode;
  stateBefore: Stream135MKernelState;
  kernelEvent: Stream135MKernelEvent;
  expectedChannel: Stream135NDispatchChannel;
  userIdRequiredLater: boolean;
  ownerScopeRequiredLater: boolean;
  adminGateRequiredLater: boolean;
  providerGateRequiredLater: boolean;
  idempotencyKeyRequiredLater: boolean;
  backendExecutionAllowedNow: false;
  providerExecutionAllowedNow: false;
  dbWriteAllowedNow: false;
  mobileSecretAllowed: false;
  fakeSuccessAllowed: false;
}>;

export type Stream135NDispatchResult = Readonly<{
  version: typeof STREAM_135N_KERNEL_ACTION_DISPATCHER_DRAFT_VERSION;
  stateMachineVersion: typeof STREAM_135M_KERNEL_STATE_MACHINE_DRAFT_VERSION;
  actionKind: Stream135NActionKind;
  mode: Stream135MKernelMode;
  stateBefore: Stream135MKernelState;
  stateAfter: Stream135MKernelState;
  channel: Stream135NDispatchChannel;
  acceptedLocalKernelOnly: boolean;
  reason: Stream135NDispatchReason;
  kernelTransition: Stream135MKernelTransitionResult;
  backendExecutionAllowedNow: false;
  providerExecutionAllowedNow: false;
  dbWriteAllowedNow: false;
  routeMountAllowedNow: false;
  mobileSecretAllowed: false;
  fakeSuccessAllowed: false;
  notes: readonly string[];
}>;

const actionMap = {
  open_stream_entry: {
    mode: "live_single",
    stateBefore: "idle",
    kernelEvent: "open_stream_entry",
    expectedChannel: "local_kernel_snapshot",
    userIdRequiredLater: false,
    ownerScopeRequiredLater: false,
    adminGateRequiredLater: false,
    providerGateRequiredLater: false,
    idempotencyKeyRequiredLater: false,
  },
  open_live_composer: {
    mode: "live_single",
    stateBefore: "idle",
    kernelEvent: "open_stream_entry",
    expectedChannel: "local_kernel_snapshot",
    userIdRequiredLater: false,
    ownerScopeRequiredLater: false,
    adminGateRequiredLater: false,
    providerGateRequiredLater: false,
    idempotencyKeyRequiredLater: false,
  },
  prepare_live_single: {
    mode: "live_single",
    stateBefore: "local_draft_ready",
    kernelEvent: "prepare_live_session",
    expectedChannel: "blocked_backend_common_foundation",
    userIdRequiredLater: true,
    ownerScopeRequiredLater: true,
    adminGateRequiredLater: false,
    providerGateRequiredLater: true,
    idempotencyKeyRequiredLater: true,
  },
  prepare_live_group: {
    mode: "live_group",
    stateBefore: "local_draft_ready",
    kernelEvent: "prepare_group_live_session",
    expectedChannel: "blocked_realtime_foundation",
    userIdRequiredLater: true,
    ownerScopeRequiredLater: true,
    adminGateRequiredLater: false,
    providerGateRequiredLater: true,
    idempotencyKeyRequiredLater: true,
  },
  prepare_live_audio: {
    mode: "live_audio",
    stateBefore: "local_draft_ready",
    kernelEvent: "prepare_audio_live_session",
    expectedChannel: "blocked_media_foundation",
    userIdRequiredLater: true,
    ownerScopeRequiredLater: true,
    adminGateRequiredLater: false,
    providerGateRequiredLater: true,
    idempotencyKeyRequiredLater: true,
  },
  prepare_live_game_screen: {
    mode: "live_game_screen",
    stateBefore: "local_draft_ready",
    kernelEvent: "prepare_game_screen_session",
    expectedChannel: "blocked_media_foundation",
    userIdRequiredLater: true,
    ownerScopeRequiredLater: true,
    adminGateRequiredLater: true,
    providerGateRequiredLater: true,
    idempotencyKeyRequiredLater: true,
  },
  prepare_live_video_file: {
    mode: "live_video_file",
    stateBefore: "local_draft_ready",
    kernelEvent: "prepare_video_file_session",
    expectedChannel: "blocked_media_foundation",
    userIdRequiredLater: true,
    ownerScopeRequiredLater: true,
    adminGateRequiredLater: true,
    providerGateRequiredLater: true,
    idempotencyKeyRequiredLater: true,
  },
  prepare_shorts_creator: {
    mode: "shorts_creator",
    stateBefore: "idle",
    kernelEvent: "prepare_shorts_draft",
    expectedChannel: "local_kernel_snapshot",
    userIdRequiredLater: false,
    ownerScopeRequiredLater: false,
    adminGateRequiredLater: false,
    providerGateRequiredLater: false,
    idempotencyKeyRequiredLater: false,
  },
  prepare_shorts_feed: {
    mode: "shorts_feed",
    stateBefore: "idle",
    kernelEvent: "prepare_shorts_feed",
    expectedChannel: "blocked_backend_common_foundation",
    userIdRequiredLater: true,
    ownerScopeRequiredLater: false,
    adminGateRequiredLater: false,
    providerGateRequiredLater: true,
    idempotencyKeyRequiredLater: true,
  },
  prepare_business_stream: {
    mode: "business_stream",
    stateBefore: "idle",
    kernelEvent: "prepare_business_stream",
    expectedChannel: "blocked_admin_gate",
    userIdRequiredLater: true,
    ownerScopeRequiredLater: true,
    adminGateRequiredLater: true,
    providerGateRequiredLater: true,
    idempotencyKeyRequiredLater: true,
  },
  prepare_creator_profile: {
    mode: "creator_profile",
    stateBefore: "idle",
    kernelEvent: "prepare_creator_profile",
    expectedChannel: "local_kernel_snapshot",
    userIdRequiredLater: false,
    ownerScopeRequiredLater: false,
    adminGateRequiredLater: false,
    providerGateRequiredLater: false,
    idempotencyKeyRequiredLater: false,
  },
  prepare_moderation_admin: {
    mode: "moderation_admin",
    stateBefore: "idle",
    kernelEvent: "prepare_moderation_action",
    expectedChannel: "blocked_admin_gate",
    userIdRequiredLater: true,
    ownerScopeRequiredLater: true,
    adminGateRequiredLater: true,
    providerGateRequiredLater: false,
    idempotencyKeyRequiredLater: true,
  },
  prepare_playback_analytics: {
    mode: "playback_analytics",
    stateBefore: "idle",
    kernelEvent: "prepare_playback_analytics",
    expectedChannel: "blocked_backend_common_foundation",
    userIdRequiredLater: true,
    ownerScopeRequiredLater: false,
    adminGateRequiredLater: false,
    providerGateRequiredLater: true,
    idempotencyKeyRequiredLater: true,
  },
  prepare_wallet_gift_boundary: {
    mode: "wallet_gift_boundary",
    stateBefore: "idle",
    kernelEvent: "prepare_wallet_gift_boundary",
    expectedChannel: "blocked_wallet_gift_stage",
    userIdRequiredLater: true,
    ownerScopeRequiredLater: true,
    adminGateRequiredLater: true,
    providerGateRequiredLater: true,
    idempotencyKeyRequiredLater: true,
  },
  request_backend_common_execution: {
    mode: "live_single",
    stateBefore: "local_draft_ready",
    kernelEvent: "request_backend_execution",
    expectedChannel: "blocked_backend_common_foundation",
    userIdRequiredLater: true,
    ownerScopeRequiredLater: true,
    adminGateRequiredLater: false,
    providerGateRequiredLater: true,
    idempotencyKeyRequiredLater: true,
  },
  request_provider_execution: {
    mode: "live_single",
    stateBefore: "local_draft_ready",
    kernelEvent: "request_provider_execution",
    expectedChannel: "blocked_provider_gate",
    userIdRequiredLater: true,
    ownerScopeRequiredLater: true,
    adminGateRequiredLater: true,
    providerGateRequiredLater: true,
    idempotencyKeyRequiredLater: true,
  },
  request_admin_execution: {
    mode: "moderation_admin",
    stateBefore: "idle",
    kernelEvent: "request_admin_execution",
    expectedChannel: "blocked_admin_gate",
    userIdRequiredLater: true,
    ownerScopeRequiredLater: true,
    adminGateRequiredLater: true,
    providerGateRequiredLater: false,
    idempotencyKeyRequiredLater: true,
  },
  request_wallet_gift_execution: {
    mode: "wallet_gift_boundary",
    stateBefore: "idle",
    kernelEvent: "request_wallet_gift_execution",
    expectedChannel: "blocked_wallet_gift_stage",
    userIdRequiredLater: true,
    ownerScopeRequiredLater: true,
    adminGateRequiredLater: true,
    providerGateRequiredLater: true,
    idempotencyKeyRequiredLater: true,
  },
} as const satisfies Record<Stream135NActionKind, Omit<Stream135NActionDescriptor,
  | "actionKind"
  | "backendExecutionAllowedNow"
  | "providerExecutionAllowedNow"
  | "dbWriteAllowedNow"
  | "mobileSecretAllowed"
  | "fakeSuccessAllowed"
>>;

function reasonForChannel(channel: Stream135NDispatchChannel): Stream135NDispatchReason {
  switch (channel) {
    case "local_kernel_snapshot":
      return "ui_state_only_allowed";
    case "blocked_realtime_foundation":
      return "realtime_foundation_is_not_ready";
    case "blocked_media_foundation":
      return "media_foundation_is_not_ready";
    case "blocked_admin_gate":
      return "admin_gate_is_not_ready";
    case "blocked_provider_gate":
      return "provider_gate_is_not_ready";
    case "blocked_wallet_gift_stage":
      return "wallet_gift_stage_is_last";
    case "blocked_backend_common_foundation":
      return "backend_common_foundation_is_outside_mobile";
    case "blocked_unknown_action":
    default:
      return "unknown_action_blocked_by_default";
  }
}

function channelForTransition(transition: Stream135MKernelTransitionResult): Stream135NDispatchChannel {
  if (transition.acceptedLocalKernelOnly) return "local_kernel_snapshot";
  switch (transition.blocker) {
    case "realtime_foundation_not_ready":
      return "blocked_realtime_foundation";
    case "media_foundation_not_ready":
      return "blocked_media_foundation";
    case "admin_gate_not_ready":
      return "blocked_admin_gate";
    case "provider_gate_not_ready":
      return "blocked_provider_gate";
    case "wallet_gift_stage_not_ready":
      return "blocked_wallet_gift_stage";
    case "backend_common_foundation_not_in_mobile":
      return "blocked_backend_common_foundation";
    case "unknown_transition":
    default:
      return "blocked_unknown_action";
  }
}

export function describeStream135NAction(actionKind: Stream135NActionKind): Stream135NActionDescriptor {
  const action = actionMap[actionKind];
  return {
    actionKind,
    ...action,
    backendExecutionAllowedNow: false,
    providerExecutionAllowedNow: false,
    dbWriteAllowedNow: false,
    mobileSecretAllowed: false,
    fakeSuccessAllowed: false,
  };
}

export function dispatchStream135NKernelAction(actionKind: Stream135NActionKind): Stream135NDispatchResult {
  const action = describeStream135NAction(actionKind);
  const transition = reduceStream135MKernelState(action.mode, action.stateBefore, action.kernelEvent);
  const channel = channelForTransition(transition);

  return {
    version: STREAM_135N_KERNEL_ACTION_DISPATCHER_DRAFT_VERSION,
    stateMachineVersion: STREAM_135M_KERNEL_STATE_MACHINE_DRAFT_VERSION,
    actionKind,
    mode: action.mode,
    stateBefore: action.stateBefore,
    stateAfter: transition.nextState,
    channel,
    acceptedLocalKernelOnly: transition.acceptedLocalKernelOnly,
    reason: reasonForChannel(channel),
    kernelTransition: transition,
    backendExecutionAllowedNow: false,
    providerExecutionAllowedNow: false,
    dbWriteAllowedNow: false,
    routeMountAllowedNow: false,
    mobileSecretAllowed: false,
    fakeSuccessAllowed: false,
    notes: transition.acceptedLocalKernelOnly
      ? [
        "Dispatcher may update local Stream kernel state only.",
        "No route mount, provider call, DB write, payment, gift, upload, publish, or playback success is created here.",
      ]
      : [
        "Dispatcher blocks execution and exposes the exact missing gate.",
        "The real backend/common foundation must live outside the mobile project.",
      ],
  };
}

export function getStream135NDispatchSnapshot() {
  const actions = (Object.keys(actionMap) as Stream135NActionKind[]).map((actionKind) => dispatchStream135NKernelAction(actionKind));
  const localOnly = actions.filter((action) => action.acceptedLocalKernelOnly).length;
  const blocked = actions.length - localOnly;

  return {
    version: STREAM_135N_KERNEL_ACTION_DISPATCHER_DRAFT_VERSION,
    stateMachineVersion: STREAM_135M_KERNEL_STATE_MACHINE_DRAFT_VERSION,
    scope: "stream_mobile_kernel_only",
    moduleBoundary: "no_src_modules_superapp_inside_mobile",
    totalActions: actions.length,
    localKernelOnlyActions: localOnly,
    blockedExecutionActions: blocked,
    readinessByMode: {
      liveSingle: getStream135MModeReadiness("live_single"),
      shortsCreator: getStream135MModeReadiness("shorts_creator"),
      businessStream: getStream135MModeReadiness("business_stream"),
      moderationAdmin: getStream135MModeReadiness("moderation_admin"),
      walletGiftBoundary: getStream135MModeReadiness("wallet_gift_boundary"),
    },
    actions,
    safety: stream135nKernelActionDispatcherSafety,
  } as const;
}

export const stream135nKernelActionDispatcherSafety = {
  version: STREAM_135N_KERNEL_ACTION_DISPATCHER_DRAFT_VERSION,
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
  nextStep: "STREAM-CORE-135O kernel integration smoke snapshot draft",
} as const;
