import {
  STREAM_135N_KERNEL_ACTION_DISPATCHER_DRAFT_VERSION,
  dispatchStream135NKernelAction,
  getStream135NDispatchSnapshot,
  type Stream135NActionKind,
  type Stream135NDispatchResult,
} from "./stream135nKernelActionDispatcherDraft";
import {
  STREAM_135O_KERNEL_INTEGRATION_SMOKE_SNAPSHOT_DRAFT_VERSION,
  getStream135OKernelIntegrationSmokeSnapshot,
  type Stream135OSmokeSnapshot,
} from "./stream135oKernelIntegrationSmokeSnapshotDraft";

export const STREAM_135P_MOBILE_KERNEL_FACADE_DRAFT_VERSION = "STREAM-CORE-135P" as const;

export type Stream135PMobileFacadeSurface =
  | "stream_entry"
  | "live_composer"
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

export type Stream135PMobileFacadeCallStatus =
  | "accepted_local_kernel_only"
  | "blocked_backend_common_foundation"
  | "blocked_realtime_foundation"
  | "blocked_media_foundation"
  | "blocked_admin_gate"
  | "blocked_provider_gate"
  | "blocked_wallet_gift_stage"
  | "blocked_unknown_surface";

export type Stream135PMobileFacadeCall = Readonly<{
  version: typeof STREAM_135P_MOBILE_KERNEL_FACADE_DRAFT_VERSION;
  dispatcherVersion: typeof STREAM_135N_KERNEL_ACTION_DISPATCHER_DRAFT_VERSION;
  surface: Stream135PMobileFacadeSurface;
  actionKind: Stream135NActionKind;
  status: Stream135PMobileFacadeCallStatus;
  mayUpdateLocalKernelSnapshot: boolean;
  uiMayShowBlockedReason: true;
  uiMayCallBackendRouteNow: false;
  uiMayCallProviderNow: false;
  uiMayWriteDatabaseNow: false;
  uiMayStoreServerSecretNow: false;
  fakeSuccessAllowed: false;
  nextImplementationLocation: "backend_or_shared_core_outside_mobile";
  dispatch: Stream135NDispatchResult;
}>;

export type Stream135PMobileFacadeSurfaceDescriptor = Readonly<{
  surface: Stream135PMobileFacadeSurface;
  actionKind: Stream135NActionKind;
  uiRole: "entry" | "composer" | "room" | "feed" | "profile" | "admin" | "boundary";
  allowedInMobileNow: "local_kernel_snapshot_only" | "blocked_contract_preview_only";
  missingFoundationLater: readonly string[];
}>;

export type Stream135PMobileFacadeSnapshot = Readonly<{
  version: typeof STREAM_135P_MOBILE_KERNEL_FACADE_DRAFT_VERSION;
  dispatcherVersion: typeof STREAM_135N_KERNEL_ACTION_DISPATCHER_DRAFT_VERSION;
  smokeVersion: typeof STREAM_135O_KERNEL_INTEGRATION_SMOKE_SNAPSHOT_DRAFT_VERSION;
  scope: "stream_mobile_kernel_facade_only";
  moduleBoundary: "no_src_modules_superapp_inside_mobile";
  pipeline: readonly [
    "mobile_ui_surface",
    "135P_facade",
    "135N_dispatcher",
    "135M_state_machine",
    "135L_reducer",
    "135K_event_envelope",
    "backend_common_foundation_later_outside_mobile",
  ];
  totalSurfaces: number;
  localKernelOnlySurfaces: number;
  blockedSurfaces: number;
  surfaceDescriptors: readonly Stream135PMobileFacadeSurfaceDescriptor[];
  sampleCalls: readonly Stream135PMobileFacadeCall[];
  dispatcherSnapshot: ReturnType<typeof getStream135NDispatchSnapshot>;
  smokeSnapshot: Stream135OSmokeSnapshot;
  nextStep: "STREAM-CORE-135Q mobile kernel facade UI binding read-only draft";
  safety: typeof stream135pMobileKernelFacadeSafety;
}>;

const surfaceDescriptors = [
  {
    surface: "stream_entry",
    actionKind: "open_stream_entry",
    uiRole: "entry",
    allowedInMobileNow: "local_kernel_snapshot_only",
    missingFoundationLater: [],
  },
  {
    surface: "live_composer",
    actionKind: "open_live_composer",
    uiRole: "composer",
    allowedInMobileNow: "local_kernel_snapshot_only",
    missingFoundationLater: [],
  },
  {
    surface: "live_single",
    actionKind: "prepare_live_single",
    uiRole: "room",
    allowedInMobileNow: "blocked_contract_preview_only",
    missingFoundationLater: ["backend_common_foundation", "server_side_media_provider_gate"],
  },
  {
    surface: "live_group",
    actionKind: "prepare_live_group",
    uiRole: "room",
    allowedInMobileNow: "blocked_contract_preview_only",
    missingFoundationLater: ["backend_realtime_foundation", "room_role_validation", "server_side_provider_gate"],
  },
  {
    surface: "live_audio",
    actionKind: "prepare_live_audio",
    uiRole: "room",
    allowedInMobileNow: "blocked_contract_preview_only",
    missingFoundationLater: ["backend_media_foundation", "server_side_audio_provider_gate"],
  },
  {
    surface: "live_game_screen",
    actionKind: "prepare_live_game_screen",
    uiRole: "room",
    allowedInMobileNow: "blocked_contract_preview_only",
    missingFoundationLater: ["screen_capture_contract", "backend_media_foundation", "admin_safety_gate"],
  },
  {
    surface: "live_video_file",
    actionKind: "prepare_live_video_file",
    uiRole: "room",
    allowedInMobileNow: "blocked_contract_preview_only",
    missingFoundationLater: ["media_file_validation", "storage_cdn_contract", "copyright_moderation_gate"],
  },
  {
    surface: "shorts_creator",
    actionKind: "prepare_shorts_creator",
    uiRole: "composer",
    allowedInMobileNow: "local_kernel_snapshot_only",
    missingFoundationLater: [],
  },
  {
    surface: "shorts_feed",
    actionKind: "prepare_shorts_feed",
    uiRole: "feed",
    allowedInMobileNow: "blocked_contract_preview_only",
    missingFoundationLater: ["backend_feed_index", "playback_manifest_contract", "analytics_read_contract"],
  },
  {
    surface: "business_stream",
    actionKind: "prepare_business_stream",
    uiRole: "room",
    allowedInMobileNow: "blocked_contract_preview_only",
    missingFoundationLater: ["business_verification_gate", "merchant_catalog_contract", "admin_compliance_gate"],
  },
  {
    surface: "creator_profile",
    actionKind: "prepare_creator_profile",
    uiRole: "profile",
    allowedInMobileNow: "local_kernel_snapshot_only",
    missingFoundationLater: [],
  },
  {
    surface: "moderation_admin",
    actionKind: "prepare_moderation_admin",
    uiRole: "admin",
    allowedInMobileNow: "blocked_contract_preview_only",
    missingFoundationLater: ["admin_moderation_gate", "evidence_storage_contract", "audit_contract"],
  },
  {
    surface: "playback_analytics",
    actionKind: "prepare_playback_analytics",
    uiRole: "feed",
    allowedInMobileNow: "blocked_contract_preview_only",
    missingFoundationLater: ["playback_manifest_contract", "qoe_metrics_contract", "anti_fraud_analytics_gate"],
  },
  {
    surface: "wallet_gift_boundary",
    actionKind: "prepare_wallet_gift_boundary",
    uiRole: "boundary",
    allowedInMobileNow: "blocked_contract_preview_only",
    missingFoundationLater: ["wallet_coin_gift_stage_last", "admin_accountant_approval", "ledger_contract"],
  },
] as const satisfies readonly Stream135PMobileFacadeSurfaceDescriptor[];

function statusFromDispatch(dispatch: Stream135NDispatchResult): Stream135PMobileFacadeCallStatus {
  if (dispatch.acceptedLocalKernelOnly) return "accepted_local_kernel_only";

  switch (dispatch.channel) {
    case "blocked_realtime_foundation":
      return "blocked_realtime_foundation";
    case "blocked_media_foundation":
      return "blocked_media_foundation";
    case "blocked_admin_gate":
      return "blocked_admin_gate";
    case "blocked_provider_gate":
      return "blocked_provider_gate";
    case "blocked_wallet_gift_stage":
      return "blocked_wallet_gift_stage";
    case "blocked_backend_common_foundation":
      return "blocked_backend_common_foundation";
    case "blocked_unknown_action":
    default:
      return "blocked_unknown_surface";
  }
}

export function invokeStream135PMobileKernelFacade(surface: Stream135PMobileFacadeSurface): Stream135PMobileFacadeCall {
  const descriptor = surfaceDescriptors.find((candidate) => candidate.surface === surface) ?? surfaceDescriptors[0];
  const dispatch = dispatchStream135NKernelAction(descriptor.actionKind);

  return {
    version: STREAM_135P_MOBILE_KERNEL_FACADE_DRAFT_VERSION,
    dispatcherVersion: STREAM_135N_KERNEL_ACTION_DISPATCHER_DRAFT_VERSION,
    surface,
    actionKind: descriptor.actionKind,
    status: statusFromDispatch(dispatch),
    mayUpdateLocalKernelSnapshot: dispatch.acceptedLocalKernelOnly,
    uiMayShowBlockedReason: true,
    uiMayCallBackendRouteNow: false,
    uiMayCallProviderNow: false,
    uiMayWriteDatabaseNow: false,
    uiMayStoreServerSecretNow: false,
    fakeSuccessAllowed: false,
    nextImplementationLocation: "backend_or_shared_core_outside_mobile",
    dispatch,
  };
}

export function getStream135PMobileKernelFacadeSnapshot(): Stream135PMobileFacadeSnapshot {
  const sampleCalls = surfaceDescriptors.map((descriptor) => invokeStream135PMobileKernelFacade(descriptor.surface));
  const localKernelOnlySurfaces = sampleCalls.filter((call) => call.mayUpdateLocalKernelSnapshot).length;

  return {
    version: STREAM_135P_MOBILE_KERNEL_FACADE_DRAFT_VERSION,
    dispatcherVersion: STREAM_135N_KERNEL_ACTION_DISPATCHER_DRAFT_VERSION,
    smokeVersion: STREAM_135O_KERNEL_INTEGRATION_SMOKE_SNAPSHOT_DRAFT_VERSION,
    scope: "stream_mobile_kernel_facade_only",
    moduleBoundary: "no_src_modules_superapp_inside_mobile",
    pipeline: [
      "mobile_ui_surface",
      "135P_facade",
      "135N_dispatcher",
      "135M_state_machine",
      "135L_reducer",
      "135K_event_envelope",
      "backend_common_foundation_later_outside_mobile",
    ],
    totalSurfaces: surfaceDescriptors.length,
    localKernelOnlySurfaces,
    blockedSurfaces: sampleCalls.length - localKernelOnlySurfaces,
    surfaceDescriptors,
    sampleCalls,
    dispatcherSnapshot: getStream135NDispatchSnapshot(),
    smokeSnapshot: getStream135OKernelIntegrationSmokeSnapshot(),
    nextStep: "STREAM-CORE-135Q mobile kernel facade UI binding read-only draft",
    safety: stream135pMobileKernelFacadeSafety,
  };
}

export const stream135pMobileKernelFacadeSafety = {
  version: STREAM_135P_MOBILE_KERNEL_FACADE_DRAFT_VERSION,
  scope: "stream_mobile_kernel_facade_only",
  moduleBoundary: "no_src_modules_superapp_inside_mobile",
  mobileUiRedesignNow: 0,
  streamVisualLayoutChangedNow: 0,
  backendRoutesMounted: 0,
  routeMountExecuted: 0,
  dbWrites: 0,
  providerCalls: 0,
  walletRuntimeTouched: 0,
  messengerRuntimeTouched: 0,
  giftsPaymentsRuntimeTouched: 0,
  serverSecretStoredInMobile: false,
  serverSecretsReturnedToUi: false,
  fakeLiveAllowed: false,
  fakeUploadAllowed: false,
  fakePublishAllowed: false,
  fakePlaybackAllowed: false,
  fakeViewsAllowed: false,
  fakeAnalyticsAllowed: false,
  fakeModerationAllowed: false,
  fakeBusinessOrderAllowed: false,
  fakePaymentGiftAllowed: false,
  nextStep: "STREAM-CORE-135Q mobile kernel facade UI binding read-only draft",
} as const;
