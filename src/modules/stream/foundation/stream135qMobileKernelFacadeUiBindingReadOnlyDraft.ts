import {
  STREAM_135P_MOBILE_KERNEL_FACADE_DRAFT_VERSION,
  getStream135PMobileKernelFacadeSnapshot,
  invokeStream135PMobileKernelFacade,
  type Stream135PMobileFacadeCall,
  type Stream135PMobileFacadeCallStatus,
  type Stream135PMobileFacadeSnapshot,
  type Stream135PMobileFacadeSurface,
} from "./stream135pMobileKernelFacadeDraft";

export const STREAM_135Q_MOBILE_KERNEL_FACADE_UI_BINDING_READONLY_DRAFT_VERSION = "STREAM-CORE-135Q" as const;

export type Stream135QUIBindingSlot =
  | "runtime_compact_status"
  | "stream_entry_status_card"
  | "live_composer_gate_card"
  | "live_room_gate_card"
  | "shorts_creator_gate_card"
  | "shorts_feed_gate_card"
  | "business_stream_gate_card"
  | "creator_profile_gate_card"
  | "moderation_admin_gate_card"
  | "playback_analytics_gate_card"
  | "wallet_gift_boundary_gate_card";

export type Stream135QUIBindingBadge =
  | "local_kernel_only"
  | "blocked_backend_common"
  | "blocked_realtime"
  | "blocked_media"
  | "blocked_admin"
  | "blocked_provider"
  | "blocked_wallet_gift_last"
  | "blocked_unknown";

export type Stream135QUIBindingI18nKeys = Readonly<{
  titleKey: string;
  statusKey: string;
  reasonKey: string;
  actionKey: string;
  safetyKey: string;
}>;

export type Stream135QUIBoundSurface = Readonly<{
  version: typeof STREAM_135Q_MOBILE_KERNEL_FACADE_UI_BINDING_READONLY_DRAFT_VERSION;
  facadeVersion: typeof STREAM_135P_MOBILE_KERNEL_FACADE_DRAFT_VERSION;
  surface: Stream135PMobileFacadeSurface;
  slot: Stream135QUIBindingSlot;
  status: Stream135PMobileFacadeCallStatus;
  badge: Stream135QUIBindingBadge;
  i18nKeys: Stream135QUIBindingI18nKeys;
  visibleTextHardcoded: false;
  mayRenderReadOnlyGateCard: true;
  mayRenderBlockedReason: true;
  mayChangeVisualLayoutNow: false;
  mayOpenBackendRouteNow: false;
  mayCallProviderNow: false;
  mayWriteDatabaseNow: false;
  mayTouchWalletMessengerNow: false;
  fakeSuccessAllowed: false;
  call: Stream135PMobileFacadeCall;
}>;

export type Stream135QUIBindingSnapshot = Readonly<{
  version: typeof STREAM_135Q_MOBILE_KERNEL_FACADE_UI_BINDING_READONLY_DRAFT_VERSION;
  facadeVersion: typeof STREAM_135P_MOBILE_KERNEL_FACADE_DRAFT_VERSION;
  scope: "stream_mobile_facade_ui_binding_readonly_only";
  moduleBoundary: "no_src_modules_superapp_inside_mobile";
  pipeline: readonly [
    "stream_mobile_ui_readonly_binding",
    "135Q_ui_binding",
    "135P_facade",
    "135N_dispatcher",
    "135M_state_machine",
    "135L_reducer",
    "135K_event_envelope",
    "backend_common_foundation_later_outside_mobile",
  ];
  totalBindings: number;
  localKernelOnlyBindings: number;
  blockedBindings: number;
  hardcodedVisibleTextCount: 0;
  bindings: readonly Stream135QUIBoundSurface[];
  facadeSnapshot: Stream135PMobileFacadeSnapshot;
  nextStep: "STREAM-CORE-135R mobile StreamRoomRuntimePanel facade read-only wiring patch";
  safety: typeof stream135qMobileKernelFacadeUiBindingSafety;
}>;

const surfaceToSlot = {
  stream_entry: "stream_entry_status_card",
  live_composer: "live_composer_gate_card",
  live_single: "live_room_gate_card",
  live_group: "live_room_gate_card",
  live_audio: "live_room_gate_card",
  live_game_screen: "live_room_gate_card",
  live_video_file: "live_room_gate_card",
  shorts_creator: "shorts_creator_gate_card",
  shorts_feed: "shorts_feed_gate_card",
  business_stream: "business_stream_gate_card",
  creator_profile: "creator_profile_gate_card",
  moderation_admin: "moderation_admin_gate_card",
  playback_analytics: "playback_analytics_gate_card",
  wallet_gift_boundary: "wallet_gift_boundary_gate_card",
} as const satisfies Record<Stream135PMobileFacadeSurface, Stream135QUIBindingSlot>;

const orderedSurfaces = [
  "stream_entry",
  "live_composer",
  "live_single",
  "live_group",
  "live_audio",
  "live_game_screen",
  "live_video_file",
  "shorts_creator",
  "shorts_feed",
  "business_stream",
  "creator_profile",
  "moderation_admin",
  "playback_analytics",
  "wallet_gift_boundary",
] as const satisfies readonly Stream135PMobileFacadeSurface[];

function badgeFromStatus(status: Stream135PMobileFacadeCallStatus): Stream135QUIBindingBadge {
  switch (status) {
    case "accepted_local_kernel_only":
      return "local_kernel_only";
    case "blocked_realtime_foundation":
      return "blocked_realtime";
    case "blocked_media_foundation":
      return "blocked_media";
    case "blocked_admin_gate":
      return "blocked_admin";
    case "blocked_provider_gate":
      return "blocked_provider";
    case "blocked_wallet_gift_stage":
      return "blocked_wallet_gift_last";
    case "blocked_backend_common_foundation":
      return "blocked_backend_common";
    case "blocked_unknown_surface":
    default:
      return "blocked_unknown";
  }
}

function buildI18nKeys(surface: Stream135PMobileFacadeSurface, status: Stream135PMobileFacadeCallStatus): Stream135QUIBindingI18nKeys {
  const base = `stream.kernel.facade.${surface}`;
  return {
    titleKey: `${base}.title`,
    statusKey: `${base}.status.${status}`,
    reasonKey: `${base}.reason`,
    actionKey: `${base}.action`,
    safetyKey: "stream.kernel.facade.safety.noBackendNoProviderNoFakeSuccess",
  };
}

export function bindStream135QMobileKernelFacadeUiSurface(surface: Stream135PMobileFacadeSurface): Stream135QUIBoundSurface {
  const call = invokeStream135PMobileKernelFacade(surface);

  return {
    version: STREAM_135Q_MOBILE_KERNEL_FACADE_UI_BINDING_READONLY_DRAFT_VERSION,
    facadeVersion: STREAM_135P_MOBILE_KERNEL_FACADE_DRAFT_VERSION,
    surface,
    slot: surfaceToSlot[surface],
    status: call.status,
    badge: badgeFromStatus(call.status),
    i18nKeys: buildI18nKeys(surface, call.status),
    visibleTextHardcoded: false,
    mayRenderReadOnlyGateCard: true,
    mayRenderBlockedReason: true,
    mayChangeVisualLayoutNow: false,
    mayOpenBackendRouteNow: false,
    mayCallProviderNow: false,
    mayWriteDatabaseNow: false,
    mayTouchWalletMessengerNow: false,
    fakeSuccessAllowed: false,
    call,
  };
}

export function getStream135QMobileKernelFacadeUiBindingSnapshot(): Stream135QUIBindingSnapshot {
  const bindings = orderedSurfaces.map(bindStream135QMobileKernelFacadeUiSurface);
  const localKernelOnlyBindings = bindings.filter((binding) => binding.status === "accepted_local_kernel_only").length;

  return {
    version: STREAM_135Q_MOBILE_KERNEL_FACADE_UI_BINDING_READONLY_DRAFT_VERSION,
    facadeVersion: STREAM_135P_MOBILE_KERNEL_FACADE_DRAFT_VERSION,
    scope: "stream_mobile_facade_ui_binding_readonly_only",
    moduleBoundary: "no_src_modules_superapp_inside_mobile",
    pipeline: [
      "stream_mobile_ui_readonly_binding",
      "135Q_ui_binding",
      "135P_facade",
      "135N_dispatcher",
      "135M_state_machine",
      "135L_reducer",
      "135K_event_envelope",
      "backend_common_foundation_later_outside_mobile",
    ],
    totalBindings: bindings.length,
    localKernelOnlyBindings,
    blockedBindings: bindings.length - localKernelOnlyBindings,
    hardcodedVisibleTextCount: 0,
    bindings,
    facadeSnapshot: getStream135PMobileKernelFacadeSnapshot(),
    nextStep: "STREAM-CORE-135R mobile StreamRoomRuntimePanel facade read-only wiring patch",
    safety: stream135qMobileKernelFacadeUiBindingSafety,
  };
}

export const stream135qMobileKernelFacadeUiBindingSafety = {
  version: STREAM_135Q_MOBILE_KERNEL_FACADE_UI_BINDING_READONLY_DRAFT_VERSION,
  scope: "stream_mobile_facade_ui_binding_readonly_only",
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
  hardcodedVisibleUiTextAdded: 0,
  i18nKeysOnlyForVisibleCopy: true,
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
  nextStep: "STREAM-CORE-135R mobile StreamRoomRuntimePanel facade read-only wiring patch",
} as const;
