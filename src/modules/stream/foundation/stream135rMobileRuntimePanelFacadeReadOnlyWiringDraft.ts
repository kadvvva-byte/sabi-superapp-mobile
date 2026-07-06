import {
  STREAM_135P_MOBILE_KERNEL_FACADE_DRAFT_VERSION,
  type Stream135PMobileFacadeSurface,
} from "./stream135pMobileKernelFacadeDraft";
import {
  STREAM_135Q_MOBILE_KERNEL_FACADE_UI_BINDING_READONLY_DRAFT_VERSION,
  getStream135QMobileKernelFacadeUiBindingSnapshot,
  type Stream135QUIBoundSurface,
  type Stream135QUIBindingSnapshot,
} from "./stream135qMobileKernelFacadeUiBindingReadOnlyDraft";

export const STREAM_135R_MOBILE_RUNTIME_PANEL_FACADE_READONLY_WIRING_DRAFT_VERSION = "STREAM-CORE-135R" as const;

export type Stream135RRuntimePanelCard = Readonly<{
  surface: Stream135PMobileFacadeSurface;
  title: string;
  subtitle: string;
  badge: string;
  status: Stream135QUIBoundSurface["status"];
  mayRenderReadOnly: true;
  mayMutateUiLayoutNow: false;
  mayOpenBackendRouteNow: false;
  mayCallProviderNow: false;
  mayWriteDatabaseNow: false;
  fakeSuccessAllowed: false;
}>;

export type Stream135RMobileRuntimePanelFacadeReadOnlyWiringSnapshot = Readonly<{
  version: typeof STREAM_135R_MOBILE_RUNTIME_PANEL_FACADE_READONLY_WIRING_DRAFT_VERSION;
  facadeVersion: typeof STREAM_135P_MOBILE_KERNEL_FACADE_DRAFT_VERSION;
  bindingVersion: typeof STREAM_135Q_MOBILE_KERNEL_FACADE_UI_BINDING_READONLY_DRAFT_VERSION;
  scope: "stream_mobile_runtime_panel_facade_readonly_wiring_only";
  moduleBoundary: "no_src_modules_superapp_inside_mobile";
  pipeline: readonly [
    "StreamRoomRuntimePanel_readonly_status",
    "135R_runtime_panel_wiring",
    "135Q_ui_binding",
    "135P_facade",
    "135N_dispatcher",
    "135M_state_machine",
    "135L_reducer",
    "135K_event_envelope",
    "backend_common_foundation_later_outside_mobile",
  ];
  compactTitle: string;
  compactMeta: string;
  compactBadge: string;
  totalBindings: number;
  localKernelOnlyBindings: number;
  blockedBindings: number;
  panelCards: readonly Stream135RRuntimePanelCard[];
  bindingSnapshot: Stream135QUIBindingSnapshot;
  nextStep: "STREAM-CORE-135S mobile facade action smoke read-only draft";
  safety: typeof stream135rMobileRuntimePanelFacadeReadOnlyWiringSafety;
}>;

function titleForSurface(surface: Stream135PMobileFacadeSurface): string {
  switch (surface) {
    case "stream_entry":
      return "Stream entry";
    case "live_composer":
      return "Live composer";
    case "live_single":
      return "Live single";
    case "live_group":
      return "Group Live";
    case "live_audio":
      return "Audio Live";
    case "live_game_screen":
      return "Game/screen Live";
    case "live_video_file":
      return "Video-file Live";
    case "shorts_creator":
      return "Shorts creator";
    case "shorts_feed":
      return "Shorts feed";
    case "business_stream":
      return "Business Stream";
    case "creator_profile":
      return "Creator profile";
    case "moderation_admin":
      return "Moderation/Admin";
    case "playback_analytics":
      return "Playback/analytics";
    case "wallet_gift_boundary":
      return "Wallet/Gift boundary";
    default:
      return "Stream surface";
  }
}

function subtitleForBinding(binding: Stream135QUIBoundSurface): string {
  if (binding.status === "accepted_local_kernel_only") {
    return "read-only local kernel snapshot only; no backend/provider execution";
  }

  return `${binding.badge}; waiting for backend/common foundation outside mobile`;
}

function cardFromBinding(binding: Stream135QUIBoundSurface): Stream135RRuntimePanelCard {
  return {
    surface: binding.surface,
    title: titleForSurface(binding.surface),
    subtitle: subtitleForBinding(binding),
    badge: binding.badge,
    status: binding.status,
    mayRenderReadOnly: true,
    mayMutateUiLayoutNow: false,
    mayOpenBackendRouteNow: false,
    mayCallProviderNow: false,
    mayWriteDatabaseNow: false,
    fakeSuccessAllowed: false,
  };
}

export function getStream135RMobileRuntimePanelFacadeReadOnlyWiringSnapshot(): Stream135RMobileRuntimePanelFacadeReadOnlyWiringSnapshot {
  const bindingSnapshot = getStream135QMobileKernelFacadeUiBindingSnapshot();
  const panelCards = bindingSnapshot.bindings
    .filter((binding) => [
      "stream_entry",
      "live_composer",
      "live_single",
      "shorts_creator",
      "business_stream",
      "moderation_admin",
      "wallet_gift_boundary",
    ].includes(binding.surface))
    .map(cardFromBinding);

  return {
    version: STREAM_135R_MOBILE_RUNTIME_PANEL_FACADE_READONLY_WIRING_DRAFT_VERSION,
    facadeVersion: STREAM_135P_MOBILE_KERNEL_FACADE_DRAFT_VERSION,
    bindingVersion: STREAM_135Q_MOBILE_KERNEL_FACADE_UI_BINDING_READONLY_DRAFT_VERSION,
    scope: "stream_mobile_runtime_panel_facade_readonly_wiring_only",
    moduleBoundary: "no_src_modules_superapp_inside_mobile",
    pipeline: [
      "StreamRoomRuntimePanel_readonly_status",
      "135R_runtime_panel_wiring",
      "135Q_ui_binding",
      "135P_facade",
      "135N_dispatcher",
      "135M_state_machine",
      "135L_reducer",
      "135K_event_envelope",
      "backend_common_foundation_later_outside_mobile",
    ],
    compactTitle: "135R facade read-only wiring",
    compactMeta: `${bindingSnapshot.localKernelOnlyBindings}/${bindingSnapshot.totalBindings} local kernel surfaces; ${bindingSnapshot.blockedBindings} safely blocked`,
    compactBadge: `${bindingSnapshot.localKernelOnlyBindings}/${bindingSnapshot.totalBindings}`,
    totalBindings: bindingSnapshot.totalBindings,
    localKernelOnlyBindings: bindingSnapshot.localKernelOnlyBindings,
    blockedBindings: bindingSnapshot.blockedBindings,
    panelCards,
    bindingSnapshot,
    nextStep: "STREAM-CORE-135S mobile facade action smoke read-only draft",
    safety: stream135rMobileRuntimePanelFacadeReadOnlyWiringSafety,
  };
}

export const stream135rMobileRuntimePanelFacadeReadOnlyWiringSafety = {
  version: STREAM_135R_MOBILE_RUNTIME_PANEL_FACADE_READONLY_WIRING_DRAFT_VERSION,
  scope: "stream_mobile_runtime_panel_facade_readonly_wiring_only",
  moduleBoundary: "no_src_modules_superapp_inside_mobile",
  mobileUiRedesignNow: 0,
  streamVisualLayoutChangedNow: 0,
  hardcodedVisibleUiTextAddedByWiring: 0,
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
  nextStep: "STREAM-CORE-135S mobile facade action smoke read-only draft",
} as const;
