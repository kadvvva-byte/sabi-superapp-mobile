export const STREAM_135M_KERNEL_STATE_MACHINE_DRAFT_VERSION = "STREAM-CORE-135M" as const;

export type Stream135MKernelMode =
  | "live_single"
  | "live_group"
  | "live_audio"
  | "live_game_screen"
  | "live_video_file"
  | "shorts_creator"
  | "shorts_feed"
  | "business_stream"
  | "creator_profile"
  | "moderation_admin"
  | "playback_analytics"
  | "wallet_gift_boundary";

export type Stream135MKernelState =
  | "idle"
  | "local_draft_ready"
  | "local_preflight_ready"
  | "local_kernel_snapshot_ready"
  | "blocked_backend_common_foundation_missing"
  | "blocked_realtime_foundation_missing"
  | "blocked_media_foundation_missing"
  | "blocked_admin_gate_missing"
  | "blocked_provider_gate_missing"
  | "blocked_wallet_gift_stage_missing"
  | "blocked_unknown_transition";

export type Stream135MKernelEvent =
  | "open_stream_entry"
  | "prepare_live_session"
  | "prepare_group_live_session"
  | "prepare_audio_live_session"
  | "prepare_game_screen_session"
  | "prepare_video_file_session"
  | "prepare_shorts_draft"
  | "prepare_shorts_feed"
  | "prepare_business_stream"
  | "prepare_creator_profile"
  | "prepare_moderation_action"
  | "prepare_playback_analytics"
  | "prepare_wallet_gift_boundary"
  | "request_backend_execution"
  | "request_provider_execution"
  | "request_admin_execution"
  | "request_wallet_gift_execution";

export type Stream135MTransitionBlocker =
  | "none_local_kernel_only"
  | "backend_common_foundation_not_in_mobile"
  | "realtime_foundation_not_ready"
  | "media_foundation_not_ready"
  | "admin_gate_not_ready"
  | "provider_gate_not_ready"
  | "wallet_gift_stage_not_ready"
  | "unknown_transition";

export type Stream135MKernelTransition = Readonly<{
  mode: Stream135MKernelMode;
  event: Stream135MKernelEvent;
  from: Stream135MKernelState;
  to: Stream135MKernelState;
  localKernelOnly: boolean;
  backendExecutionAllowedNow: false;
  providerExecutionAllowedNow: false;
  dbWriteAllowedNow: false;
  mobileSecretAllowed: false;
  fakeSuccessAllowed: false;
  blocker: Stream135MTransitionBlocker;
  nextRealLayerLater: "backend_common_foundation_outside_mobile" | "admin_provider_wallet_later";
}>;

export type Stream135MKernelTransitionResult = Readonly<{
  version: typeof STREAM_135M_KERNEL_STATE_MACHINE_DRAFT_VERSION;
  mode: Stream135MKernelMode;
  event: Stream135MKernelEvent;
  previousState: Stream135MKernelState;
  nextState: Stream135MKernelState;
  transitionFound: boolean;
  acceptedLocalKernelOnly: boolean;
  blocker: Stream135MTransitionBlocker;
  backendExecutionAllowedNow: false;
  providerExecutionAllowedNow: false;
  dbWriteAllowedNow: false;
  mobileSecretAllowed: false;
  fakeSuccessAllowed: false;
  notes: readonly string[];
}>;

export const stream135mLocalKernelTransitionMatrix = [
  {
    mode: "live_single",
    event: "open_stream_entry",
    from: "idle",
    to: "local_draft_ready",
    localKernelOnly: true,
    blocker: "none_local_kernel_only",
    nextRealLayerLater: "backend_common_foundation_outside_mobile",
  },
  {
    mode: "live_single",
    event: "prepare_live_session",
    from: "local_draft_ready",
    to: "blocked_backend_common_foundation_missing",
    localKernelOnly: false,
    blocker: "backend_common_foundation_not_in_mobile",
    nextRealLayerLater: "backend_common_foundation_outside_mobile",
  },
  {
    mode: "live_group",
    event: "prepare_group_live_session",
    from: "local_draft_ready",
    to: "blocked_realtime_foundation_missing",
    localKernelOnly: false,
    blocker: "realtime_foundation_not_ready",
    nextRealLayerLater: "backend_common_foundation_outside_mobile",
  },
  {
    mode: "live_audio",
    event: "prepare_audio_live_session",
    from: "local_draft_ready",
    to: "blocked_media_foundation_missing",
    localKernelOnly: false,
    blocker: "media_foundation_not_ready",
    nextRealLayerLater: "backend_common_foundation_outside_mobile",
  },
  {
    mode: "live_game_screen",
    event: "prepare_game_screen_session",
    from: "local_draft_ready",
    to: "blocked_media_foundation_missing",
    localKernelOnly: false,
    blocker: "media_foundation_not_ready",
    nextRealLayerLater: "backend_common_foundation_outside_mobile",
  },
  {
    mode: "live_video_file",
    event: "prepare_video_file_session",
    from: "local_draft_ready",
    to: "blocked_media_foundation_missing",
    localKernelOnly: false,
    blocker: "media_foundation_not_ready",
    nextRealLayerLater: "backend_common_foundation_outside_mobile",
  },
  {
    mode: "shorts_creator",
    event: "prepare_shorts_draft",
    from: "idle",
    to: "local_kernel_snapshot_ready",
    localKernelOnly: true,
    blocker: "none_local_kernel_only",
    nextRealLayerLater: "backend_common_foundation_outside_mobile",
  },
  {
    mode: "shorts_feed",
    event: "prepare_shorts_feed",
    from: "idle",
    to: "blocked_backend_common_foundation_missing",
    localKernelOnly: false,
    blocker: "backend_common_foundation_not_in_mobile",
    nextRealLayerLater: "backend_common_foundation_outside_mobile",
  },
  {
    mode: "business_stream",
    event: "prepare_business_stream",
    from: "idle",
    to: "blocked_admin_gate_missing",
    localKernelOnly: false,
    blocker: "admin_gate_not_ready",
    nextRealLayerLater: "admin_provider_wallet_later",
  },
  {
    mode: "creator_profile",
    event: "prepare_creator_profile",
    from: "idle",
    to: "local_preflight_ready",
    localKernelOnly: true,
    blocker: "none_local_kernel_only",
    nextRealLayerLater: "backend_common_foundation_outside_mobile",
  },
  {
    mode: "moderation_admin",
    event: "prepare_moderation_action",
    from: "idle",
    to: "blocked_admin_gate_missing",
    localKernelOnly: false,
    blocker: "admin_gate_not_ready",
    nextRealLayerLater: "admin_provider_wallet_later",
  },
  {
    mode: "playback_analytics",
    event: "prepare_playback_analytics",
    from: "idle",
    to: "blocked_backend_common_foundation_missing",
    localKernelOnly: false,
    blocker: "backend_common_foundation_not_in_mobile",
    nextRealLayerLater: "backend_common_foundation_outside_mobile",
  },
  {
    mode: "wallet_gift_boundary",
    event: "prepare_wallet_gift_boundary",
    from: "idle",
    to: "blocked_wallet_gift_stage_missing",
    localKernelOnly: false,
    blocker: "wallet_gift_stage_not_ready",
    nextRealLayerLater: "admin_provider_wallet_later",
  },
] as const satisfies readonly Omit<
  Stream135MKernelTransition,
  | "backendExecutionAllowedNow"
  | "providerExecutionAllowedNow"
  | "dbWriteAllowedNow"
  | "mobileSecretAllowed"
  | "fakeSuccessAllowed"
>[];

const blockedExecutionEvents = new Set<Stream135MKernelEvent>([
  "request_backend_execution",
  "request_provider_execution",
  "request_admin_execution",
  "request_wallet_gift_execution",
]);

export function reduceStream135MKernelState(
  mode: Stream135MKernelMode,
  previousState: Stream135MKernelState,
  event: Stream135MKernelEvent,
): Stream135MKernelTransitionResult {
  const transition = stream135mLocalKernelTransitionMatrix.find(
    (candidate) => candidate.mode === mode && candidate.from === previousState && candidate.event === event,
  );

  if (transition) {
    return {
      version: STREAM_135M_KERNEL_STATE_MACHINE_DRAFT_VERSION,
      mode,
      event,
      previousState,
      nextState: transition.to,
      transitionFound: true,
      acceptedLocalKernelOnly: transition.localKernelOnly,
      blocker: transition.blocker,
      backendExecutionAllowedNow: false,
      providerExecutionAllowedNow: false,
      dbWriteAllowedNow: false,
      mobileSecretAllowed: false,
      fakeSuccessAllowed: false,
      notes: transition.localKernelOnly
        ? ["Local Stream kernel snapshot may update UI state only.", "No backend/common execution is performed inside mobile."]
        : ["Transition is intentionally blocked until the real backend/common layer exists outside mobile."],
    };
  }

  const blocker: Stream135MTransitionBlocker = blockedExecutionEvents.has(event)
    ? event === "request_provider_execution"
      ? "provider_gate_not_ready"
      : event === "request_admin_execution"
        ? "admin_gate_not_ready"
        : event === "request_wallet_gift_execution"
          ? "wallet_gift_stage_not_ready"
          : "backend_common_foundation_not_in_mobile"
    : "unknown_transition";

  const nextState: Stream135MKernelState = blocker === "provider_gate_not_ready"
    ? "blocked_provider_gate_missing"
    : blocker === "admin_gate_not_ready"
      ? "blocked_admin_gate_missing"
      : blocker === "wallet_gift_stage_not_ready"
        ? "blocked_wallet_gift_stage_missing"
        : blocker === "backend_common_foundation_not_in_mobile"
          ? "blocked_backend_common_foundation_missing"
          : "blocked_unknown_transition";

  return {
    version: STREAM_135M_KERNEL_STATE_MACHINE_DRAFT_VERSION,
    mode,
    event,
    previousState,
    nextState,
    transitionFound: false,
    acceptedLocalKernelOnly: false,
    blocker,
    backendExecutionAllowedNow: false,
    providerExecutionAllowedNow: false,
    dbWriteAllowedNow: false,
    mobileSecretAllowed: false,
    fakeSuccessAllowed: false,
    notes: [
      "Unknown or execution transition is blocked by default.",
      "Mobile remains a Stream UI/kernel client; real foundation belongs outside mobile.",
    ],
  };
}

export function getStream135MModeReadiness(mode: Stream135MKernelMode): Stream135MKernelTransitionResult {
  const localEntryEvent: Stream135MKernelEvent = mode === "shorts_creator"
    ? "prepare_shorts_draft"
    : mode === "creator_profile"
      ? "prepare_creator_profile"
      : mode === "business_stream"
        ? "prepare_business_stream"
        : mode === "moderation_admin"
          ? "prepare_moderation_action"
          : mode === "playback_analytics"
            ? "prepare_playback_analytics"
            : mode === "wallet_gift_boundary"
              ? "prepare_wallet_gift_boundary"
              : "open_stream_entry";

  return reduceStream135MKernelState(mode, "idle", localEntryEvent);
}

export const stream135mKernelStateMachineSafety = {
  version: STREAM_135M_KERNEL_STATE_MACHINE_DRAFT_VERSION,
  scope: "stream_mobile_kernel_only",
  moduleBoundary: "no_src_modules_superapp_inside_mobile",
  backendRoutesMounted: 0,
  dbWrites: 0,
  providerCalls: 0,
  walletRuntimeTouched: 0,
  messengerRuntimeTouched: 0,
  mobileSecretsAllowed: false,
  fakeLiveAllowed: false,
  fakeUploadAllowed: false,
  fakePublishAllowed: false,
  fakePlaybackAllowed: false,
  fakeAnalyticsAllowed: false,
  fakeModerationAllowed: false,
  fakePaymentGiftAllowed: false,
  nextStep: "STREAM-CORE-135N kernel action dispatcher draft",
} as const;
