export const STREAM_108N_VERSION = "STREAM-108N-LAUNCH-CONTROL-SAFETY-REGISTRY" as const;

export type Stream108NControlCategory =
  | "live_engine"
  | "media_storage"
  | "realtime_counters"
  | "creator_verification"
  | "moderation_safety"
  | "monetization_gifts"
  | "creator_payout"
  | "download_test_launch"
  | "owner_go_no_go";

export type Stream108NControlStatus =
  | "provider_not_configured"
  | "admin_review_required"
  | "owner_approval_required"
  | "blocked_until_real_integration";

export type Stream108NLaunchBlocker = {
  id: string;
  category: Stream108NControlCategory;
  title: string;
  status: Stream108NControlStatus;
  launchBlocking: true;
  previewVisible: true;
  fakeCompletionAllowed: false;
  requiresSeparateOwnerApproval: true;
  requiresRealProviderOrAdminSource: true;
  walletRuntimeTouched: false;
  messengerRuntimeTouched: false;
  callsRuntimeTouched: false;
  serverFoundationTouched: false;
  backendFinanceTouched: false;
};

export type Stream108NLaunchReadinessSnapshot = {
  version: typeof STREAM_108N_VERSION;
  stage: "108N";
  previewLocked: true;
  launchComplete: false;
  publicLaunchAllowed: false;
  fakeLaunchCompleteAllowed: false;
  fakeLiveAllowed: false;
  fakeProviderAllowed: false;
  fakePaymentAllowed: false;
  walletRuntimeTouched: false;
  messengerRuntimeTouched: false;
  callsRuntimeTouched: false;
  serverFoundationTouched: false;
  backendFinanceTouched: false;
  totalBlockers: number;
  unresolvedBlockers: number;
  blockerCategories: Stream108NControlCategory[];
  blockers: Stream108NLaunchBlocker[];
  nextAllowedStep: "108O_source_only_admin_snapshot_plan_or_visual_polish";
};

const lockedBlockerBase = {
  launchBlocking: true,
  previewVisible: true,
  fakeCompletionAllowed: false,
  requiresSeparateOwnerApproval: true,
  requiresRealProviderOrAdminSource: true,
  walletRuntimeTouched: false,
  messengerRuntimeTouched: false,
  callsRuntimeTouched: false,
  serverFoundationTouched: false,
  backendFinanceTouched: false,
} as const;

export const STREAM_108N_LAUNCH_BLOCKERS: Stream108NLaunchBlocker[] = [
  {
    ...lockedBlockerBase,
    id: "stream_live_engine_provider_gate",
    category: "live_engine",
    title: "Live engine must stay provider_not_configured until a real streaming engine is bound.",
    status: "provider_not_configured",
  },
  {
    ...lockedBlockerBase,
    id: "stream_media_storage_gate",
    category: "media_storage",
    title: "Real media storage/CDN pipeline is required before publishing real video assets.",
    status: "provider_not_configured",
  },
  {
    ...lockedBlockerBase,
    id: "stream_realtime_counter_gate",
    category: "realtime_counters",
    title: "Online/live/viewer counters must come from a real backend source, not local fake counters.",
    status: "provider_not_configured",
  },
  {
    ...lockedBlockerBase,
    id: "stream_official_creator_review_gate",
    category: "creator_verification",
    title: "Official streamer registration requires Admin review, identity/age policy, and owner-approved rules.",
    status: "admin_review_required",
  },
  {
    ...lockedBlockerBase,
    id: "stream_moderation_queue_gate",
    category: "moderation_safety",
    title: "Reports, abuse triage, content quality review, and audit visibility must exist before public launch.",
    status: "admin_review_required",
  },
  {
    ...lockedBlockerBase,
    id: "stream_gift_wallet_bridge_gate",
    category: "monetization_gifts",
    title: "Gift and paid-feature flows remain blocked until the Wallet bridge is separately approved later.",
    status: "blocked_until_real_integration",
  },
  {
    ...lockedBlockerBase,
    id: "stream_creator_payout_gate",
    category: "creator_payout",
    title: "Creator payout readiness stays blocked until real accounting, compliance, and payout routing are approved.",
    status: "blocked_until_real_integration",
  },
  {
    ...lockedBlockerBase,
    id: "stream_test_download_launch_gate",
    category: "download_test_launch",
    title: "Test download launch can only be marked allowed after owner go/no-go and release package review.",
    status: "owner_approval_required",
  },
  {
    ...lockedBlockerBase,
    id: "stream_owner_go_no_go_gate",
    category: "owner_go_no_go",
    title: "Owner go/no-go is mandatory; this stage cannot mark launch as complete.",
    status: "owner_approval_required",
  },
] as const satisfies Stream108NLaunchBlocker[];

export const STREAM_108N_LAUNCH_CONTROL_CENTER = {
  version: STREAM_108N_VERSION,
  stage: "108N",
  mode: "locked_preview_only",
  previewLocked: true,
  launchComplete: false,
  publicLaunchAllowed: false,
  fakeLaunchCompleteAllowed: false,
  fakeLiveAllowed: false,
  fakeProviderAllowed: false,
  fakePaymentAllowed: false,
  walletRuntimeTouched: false,
  messengerRuntimeTouched: false,
  callsRuntimeTouched: false,
  serverFoundationTouched: false,
  backendFinanceTouched: false,
  sourceOnly: true,
  mobileVisualRuntimeChange: false,
  nextAllowedStep: "108O_source_only_admin_snapshot_plan_or_visual_polish",
} as const;

export const STREAM_108N_ALLOWED_NEXT_ACTIONS = [
  "source_only_admin_snapshot_contract",
  "source_only_visual_polish_inside_stream_module",
  "read_only_stream_launch_blocker_display",
  "i18n_only_stream_label_completion",
] as const;

export const STREAM_108N_FORBIDDEN_NEXT_ACTIONS = [
  "fake_live_room_success",
  "fake_provider_ready",
  "fake_payment_success",
  "fake_launch_complete",
  "wallet_runtime_change",
  "messenger_runtime_change",
  "calls_runtime_change",
  "server_foundation_change",
  "backend_finance_change",
] as const;

export function getStream108NLaunchReadinessSnapshot(): Stream108NLaunchReadinessSnapshot {
  const blockerCategories = Array.from(new Set(STREAM_108N_LAUNCH_BLOCKERS.map((blocker) => blocker.category)));

  return {
    version: STREAM_108N_VERSION,
    stage: "108N",
    previewLocked: true,
    launchComplete: false,
    publicLaunchAllowed: false,
    fakeLaunchCompleteAllowed: false,
    fakeLiveAllowed: false,
    fakeProviderAllowed: false,
    fakePaymentAllowed: false,
    walletRuntimeTouched: false,
    messengerRuntimeTouched: false,
    callsRuntimeTouched: false,
    serverFoundationTouched: false,
    backendFinanceTouched: false,
    totalBlockers: STREAM_108N_LAUNCH_BLOCKERS.length,
    unresolvedBlockers: STREAM_108N_LAUNCH_BLOCKERS.length,
    blockerCategories,
    blockers: [...STREAM_108N_LAUNCH_BLOCKERS],
    nextAllowedStep: "108O_source_only_admin_snapshot_plan_or_visual_polish",
  };
}

export function assertStream108NLaunchControlIsSafe(snapshot: Stream108NLaunchReadinessSnapshot): true {
  const unsafe =
    snapshot.launchComplete ||
    snapshot.publicLaunchAllowed ||
    snapshot.fakeLaunchCompleteAllowed ||
    snapshot.fakeLiveAllowed ||
    snapshot.fakeProviderAllowed ||
    snapshot.fakePaymentAllowed ||
    snapshot.walletRuntimeTouched ||
    snapshot.messengerRuntimeTouched ||
    snapshot.callsRuntimeTouched ||
    snapshot.serverFoundationTouched ||
    snapshot.backendFinanceTouched ||
    snapshot.unresolvedBlockers <= 0 ||
    snapshot.blockers.some((blocker) => blocker.fakeCompletionAllowed || !blocker.launchBlocking);

  if (unsafe) {
    throw new Error("STREAM_108N_UNSAFE_LAUNCH_CONTROL_STATE");
  }

  return true;
}

export const STREAM_108N_LAUNCH_CONTROL_SNAPSHOT = getStream108NLaunchReadinessSnapshot();

assertStream108NLaunchControlIsSafe(STREAM_108N_LAUNCH_CONTROL_SNAPSHOT);
