import {
  STREAM_135K_MOBILE_KERNEL_EVENT_ENVELOPE_REGISTRY,
  type Stream135KMobileKernelEventEnvelope,
  type Stream135KMobileKernelEventName,
  type Stream135KMobileKernelEventStatus,
} from "./stream135kMobileKernelEventEnvelopeDraft";

export type Stream135LKernelReducerDecisionStatus =
  | "accepted_local_kernel_only"
  | "blocked_backend_common_foundation_missing"
  | "blocked_admin_gate_missing"
  | "blocked_provider_gate_missing"
  | "blocked_wallet_gift_stage_missing"
  | "blocked_unknown_event";

export type Stream135LKernelReducerEffect =
  | "update_local_kernel_snapshot"
  | "show_safe_blocked_state"
  | "show_admin_gate_required_state"
  | "show_provider_gate_required_state"
  | "show_wallet_gift_boundary_state"
  | "drop_unknown_event";

export type Stream135LKernelReducerGuard = {
  readonly id: string;
  readonly label: string;
  readonly passedNow: boolean;
  readonly requiredLater: boolean;
  readonly reason: string;
};

export type Stream135LKernelReducerDecision = {
  readonly version: "STREAM-CORE-135L";
  readonly eventName: Stream135KMobileKernelEventName | "unknown";
  readonly sourceEnvelopeVersion: Stream135KMobileKernelEventEnvelope["version"] | "unknown";
  readonly sourceStatus: Stream135KMobileKernelEventStatus | "unknown";
  readonly decisionStatus: Stream135LKernelReducerDecisionStatus;
  readonly effect: Stream135LKernelReducerEffect;
  readonly uiMessageKey: string;
  readonly contractId: string;
  readonly blockedReason: string;
  readonly guards: readonly Stream135LKernelReducerGuard[];
  readonly nextImplementationLocation: "backend_or_shared_core_outside_mobile";
  readonly reducerMayUpdateLocalStateNow: boolean;
  readonly reducerMayExecuteBackendRouteNow: false;
  readonly reducerMayWriteDatabaseNow: false;
  readonly reducerMayCallProviderNow: false;
  readonly reducerMayTouchWalletNow: false;
  readonly reducerMayTouchMessengerNow: false;
  readonly fakeSuccessAllowed: false;
};

export type Stream135LKernelReducerState = {
  readonly version: "STREAM-CORE-135L";
  readonly title: string;
  readonly sourceScope: "stream_mobile_kernel_event_reducer_only";
  readonly reducerInputVersion: typeof STREAM_135K_MOBILE_KERNEL_EVENT_ENVELOPE_REGISTRY.version;
  readonly reducerOutputCount: number;
  readonly decisions: readonly Stream135LKernelReducerDecision[];
  readonly localAcceptedCount: number;
  readonly blockedCount: number;
  readonly unknownEventHandling: "drop_and_show_safe_blocked_state";
  readonly requiredReducerGuards: readonly string[];
  readonly invariants: readonly string[];
  readonly nextStep: "STREAM-CORE-135M_KERNEL_STATE_MACHINE_DRAFT";
  readonly safety: {
    readonly mobileUiRedesignNow: false;
    readonly streamVisualLayoutChangedNow: false;
    readonly commonFoundationModuleCreatedInMobileNow: false;
    readonly backendImplementationStartedNow: false;
    readonly backendRoutesMountedNow: false;
    readonly routeMountExecutedNow: false;
    readonly databaseWriteExecutedNow: false;
    readonly providerAdapterExecutedNow: false;
    readonly providerCallExecutedNow: false;
    readonly serverSecretStoredInMobileNow: false;
    readonly serverSecretsReturnedToUiNow: false;
    readonly walletTouchedNow: false;
    readonly messengerTouchedNow: false;
    readonly giftsRuntimeTouchedNow: false;
    readonly paymentsRuntimeTouchedNow: false;
    readonly fakeLiveAllowed: false;
    readonly fakeUploadAllowed: false;
    readonly fakePublishAllowed: false;
    readonly fakePlaybackAllowed: false;
    readonly fakeViewsAllowed: false;
    readonly fakeAnalyticsAllowed: false;
    readonly fakeModerationAllowed: false;
    readonly fakeBusinessOrderAllowed: false;
    readonly fakePaymentAllowed: false;
    readonly fakeGiftSendingAllowed: false;
  };
};

const buildGuards = (envelope: Stream135KMobileKernelEventEnvelope): readonly Stream135LKernelReducerGuard[] => [
  {
    id: "valid_mobile_kernel_envelope",
    label: "Valid 135K mobile kernel envelope",
    passedNow: envelope.version === "STREAM-CORE-135K" && envelope.fakeSuccessAllowed === false,
    requiredLater: false,
    reason: "Reducer only accepts 135K envelopes with fake success disabled.",
  },
  {
    id: "idempotency_key",
    label: "Idempotency key",
    passedNow: false,
    requiredLater: envelope.idempotencyKeyRequiredLater,
    reason: "Real backend/common execution later must require idempotency keys; mobile draft does not mint execution keys.",
  },
  {
    id: "user_identity",
    label: "Unified user identity",
    passedNow: false,
    requiredLater: envelope.userIdRequiredLater,
    reason: "Real execution later must validate unified user ID outside mobile.",
  },
  {
    id: "owner_scope",
    label: "Owner scope",
    passedNow: false,
    requiredLater: envelope.ownerScopeRequiredLater,
    reason: "Creator/business/admin ownership must be validated by backend/common foundation later.",
  },
  {
    id: "session_validation",
    label: "Session validation",
    passedNow: false,
    requiredLater: envelope.sessionValidationRequiredLater,
    reason: "Mobile cannot be the source of truth for auth/session execution.",
  },
  {
    id: "admin_gate",
    label: "Admin gate",
    passedNow: false,
    requiredLater: envelope.adminGateRequiredLater,
    reason: envelope.adminGateRequiredLater
      ? "Moderation, safety, launch and room controls must wait for Admin/backend gate."
      : "Admin gate is not needed for this local-only draft event.",
  },
  {
    id: "provider_gate",
    label: "Provider gate",
    passedNow: false,
    requiredLater: envelope.providerGateRequiredLater,
    reason: envelope.providerGateRequiredLater
      ? "Media/realtime/storage/provider execution must stay server-side and disabled until configured."
      : "Provider gate is not needed for this local-only draft event.",
  },
  {
    id: "wallet_gift_boundary",
    label: "Wallet/gift boundary",
    passedNow: false,
    requiredLater: envelope.walletGiftBoundaryRequiredLater,
    reason: envelope.walletGiftBoundaryRequiredLater
      ? "Wallet, COIN and gifts remain last-stage integrations with separate approvals."
      : "Wallet/gift boundary is not needed for this event now.",
  },
];

const decideBlockedStatus = (
  envelope: Stream135KMobileKernelEventEnvelope,
): Pick<Stream135LKernelReducerDecision, "decisionStatus" | "effect" | "uiMessageKey"> => {
  if (envelope.status === "local_kernel_ready") {
    return {
      decisionStatus: "accepted_local_kernel_only",
      effect: "update_local_kernel_snapshot",
      uiMessageKey: "stream.kernel.reducer.localOnlyReady",
    };
  }

  if (envelope.walletGiftBoundaryRequiredLater) {
    return {
      decisionStatus: "blocked_wallet_gift_stage_missing",
      effect: "show_wallet_gift_boundary_state",
      uiMessageKey: "stream.kernel.reducer.walletGiftBlocked",
    };
  }

  if (envelope.providerGateRequiredLater || envelope.status === "blocked_until_provider_gate") {
    return {
      decisionStatus: "blocked_provider_gate_missing",
      effect: "show_provider_gate_required_state",
      uiMessageKey: "stream.kernel.reducer.providerBlocked",
    };
  }

  if (envelope.adminGateRequiredLater || envelope.status === "blocked_until_admin_gate") {
    return {
      decisionStatus: "blocked_admin_gate_missing",
      effect: "show_admin_gate_required_state",
      uiMessageKey: "stream.kernel.reducer.adminBlocked",
    };
  }

  return {
    decisionStatus: "blocked_backend_common_foundation_missing",
    effect: "show_safe_blocked_state",
    uiMessageKey: "stream.kernel.reducer.backendBlocked",
  };
};

export const reduceStream135KEnvelopeTo135LDecision = (
  envelope: Stream135KMobileKernelEventEnvelope,
): Stream135LKernelReducerDecision => {
  const blocked = decideBlockedStatus(envelope);

  return {
    version: "STREAM-CORE-135L",
    eventName: envelope.eventName,
    sourceEnvelopeVersion: envelope.version,
    sourceStatus: envelope.status,
    decisionStatus: blocked.decisionStatus,
    effect: blocked.effect,
    uiMessageKey: blocked.uiMessageKey,
    contractId: envelope.contractId,
    blockedReason: envelope.blockedReason,
    guards: buildGuards(envelope),
    nextImplementationLocation: "backend_or_shared_core_outside_mobile",
    reducerMayUpdateLocalStateNow: envelope.status === "local_kernel_ready",
    reducerMayExecuteBackendRouteNow: false,
    reducerMayWriteDatabaseNow: false,
    reducerMayCallProviderNow: false,
    reducerMayTouchWalletNow: false,
    reducerMayTouchMessengerNow: false,
    fakeSuccessAllowed: false,
  };
};

export const reduceUnknownStream135LEvent = (eventName: string): Stream135LKernelReducerDecision => ({
  version: "STREAM-CORE-135L",
  eventName: "unknown",
  sourceEnvelopeVersion: "unknown",
  sourceStatus: "unknown",
  decisionStatus: "blocked_unknown_event",
  effect: "drop_unknown_event",
  uiMessageKey: "stream.kernel.reducer.unknownEventBlocked",
  contractId: "unknown",
  blockedReason: `Unknown Stream kernel event is dropped safely: ${eventName}`,
  guards: [
    {
      id: "known_event_registry",
      label: "Known event registry",
      passedNow: false,
      requiredLater: false,
      reason: "Only events declared in the 135K envelope registry can be reduced.",
    },
  ],
  nextImplementationLocation: "backend_or_shared_core_outside_mobile",
  reducerMayUpdateLocalStateNow: false,
  reducerMayExecuteBackendRouteNow: false,
  reducerMayWriteDatabaseNow: false,
  reducerMayCallProviderNow: false,
  reducerMayTouchWalletNow: false,
  reducerMayTouchMessengerNow: false,
  fakeSuccessAllowed: false,
});

const REDUCED_DECISIONS = STREAM_135K_MOBILE_KERNEL_EVENT_ENVELOPE_REGISTRY.eventEnvelopes.map(
  reduceStream135KEnvelopeTo135LDecision,
);

export const STREAM_135L_KERNEL_EVENT_REDUCER_STATE: Stream135LKernelReducerState = {
  version: "STREAM-CORE-135L",
  title: "Stream kernel event reducer draft",
  sourceScope: "stream_mobile_kernel_event_reducer_only",
  reducerInputVersion: STREAM_135K_MOBILE_KERNEL_EVENT_ENVELOPE_REGISTRY.version,
  reducerOutputCount: REDUCED_DECISIONS.length,
  decisions: REDUCED_DECISIONS,
  localAcceptedCount: REDUCED_DECISIONS.filter((decision) => decision.decisionStatus === "accepted_local_kernel_only").length,
  blockedCount: REDUCED_DECISIONS.filter((decision) => decision.decisionStatus !== "accepted_local_kernel_only").length,
  unknownEventHandling: "drop_and_show_safe_blocked_state",
  requiredReducerGuards: [
    "valid_mobile_kernel_envelope",
    "idempotency_key",
    "user_identity",
    "owner_scope",
    "session_validation",
    "admin_gate",
    "provider_gate",
    "wallet_gift_boundary",
  ],
  invariants: [
    "Do not create src/modules/superapp inside superapp-mobile.",
    "Reducer is Stream-only and mobile-kernel-only; it does not implement backend/common foundation.",
    "Reducer may update local state only for local_kernel_ready envelope statuses.",
    "Reducer must block provider, backend, Admin, Wallet/gift and persistence effects until later approved stages.",
    "Unknown events are dropped safely and never converted into fake success.",
    "No direct provider calls, database writes, backend route calls, Wallet calls or Messenger runtime calls are allowed here.",
  ],
  nextStep: "STREAM-CORE-135M_KERNEL_STATE_MACHINE_DRAFT",
  safety: {
    mobileUiRedesignNow: false,
    streamVisualLayoutChangedNow: false,
    commonFoundationModuleCreatedInMobileNow: false,
    backendImplementationStartedNow: false,
    backendRoutesMountedNow: false,
    routeMountExecutedNow: false,
    databaseWriteExecutedNow: false,
    providerAdapterExecutedNow: false,
    providerCallExecutedNow: false,
    serverSecretStoredInMobileNow: false,
    serverSecretsReturnedToUiNow: false,
    walletTouchedNow: false,
    messengerTouchedNow: false,
    giftsRuntimeTouchedNow: false,
    paymentsRuntimeTouchedNow: false,
    fakeLiveAllowed: false,
    fakeUploadAllowed: false,
    fakePublishAllowed: false,
    fakePlaybackAllowed: false,
    fakeViewsAllowed: false,
    fakeAnalyticsAllowed: false,
    fakeModerationAllowed: false,
    fakeBusinessOrderAllowed: false,
    fakePaymentAllowed: false,
    fakeGiftSendingAllowed: false,
  },
};

export const buildStream135LKernelReducerSnapshot = () => ({
  version: STREAM_135L_KERNEL_EVENT_REDUCER_STATE.version,
  reducerInputVersion: STREAM_135L_KERNEL_EVENT_REDUCER_STATE.reducerInputVersion,
  reducerOutputCount: STREAM_135L_KERNEL_EVENT_REDUCER_STATE.reducerOutputCount,
  localAcceptedCount: STREAM_135L_KERNEL_EVENT_REDUCER_STATE.localAcceptedCount,
  blockedCount: STREAM_135L_KERNEL_EVENT_REDUCER_STATE.blockedCount,
  unknownEventHandling: STREAM_135L_KERNEL_EVENT_REDUCER_STATE.unknownEventHandling,
  backendRoutesMountedNow: false as const,
  databaseWriteExecutedNow: false as const,
  providerCallExecutedNow: false as const,
  walletTouchedNow: false as const,
  messengerTouchedNow: false as const,
  srcModulesSuperappCreatedNow: false as const,
  fakeSuccessAllowed: false as const,
  nextStep: STREAM_135L_KERNEL_EVENT_REDUCER_STATE.nextStep,
});
