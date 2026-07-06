import type { StreamRoomRuntimeState } from "./streamRoomRuntime";
import { enqueueLocalStreamRoomEvent, type StreamRoomEventQueueRuntimeState } from "./streamRoomEventQueueRuntime";
import type { StreamBusinessHandoffEvidenceRuntimeState } from "./streamBusinessHandoffEvidenceRuntime";

export type StreamBusinessFinalRoomAcceptanceStatus =
  | "not_started_local"
  | "checking_local"
  | "blocked_local"
  | "local_acceptance_ready"
  | "provider_admin_required";

export type StreamBusinessFinalRoomAcceptanceCheckId =
  | "room_lifecycle_ready"
  | "business_room_ready"
  | "business_handoff_evidence_ready"
  | "local_event_queue_ready"
  | "final_owner_acceptance"
  | "final_qa_acceptance"
  | "provider_admin_handoff";

export type StreamBusinessFinalRoomAcceptanceCheckStatus = "pending_local" | "reviewed_local" | "blocked_local" | "provider_required";

export type StreamBusinessFinalRoomAcceptanceBlockerCode =
  | "room_lifecycle_not_ready"
  | "business_mode_required"
  | "business_handoff_evidence_required"
  | "local_event_queue_required"
  | "final_owner_acceptance_required"
  | "final_qa_acceptance_required"
  | "final_readiness_lock_required"
  | "final_acceptance_event_required"
  | "backend_business_room_contract_required"
  | "realtime_business_room_provider_required"
  | "media_business_room_provider_required"
  | "admin_business_room_acceptance_required"
  | "fake_business_launch_forbidden"
  | "fake_payment_forbidden"
  | "fake_gift_forbidden"
  | "fake_monetization_forbidden";

export type StreamBusinessFinalRoomAcceptanceCheck = {
  readonly id: StreamBusinessFinalRoomAcceptanceCheckId;
  readonly title: string;
  readonly purpose: string;
  readonly status: StreamBusinessFinalRoomAcceptanceCheckStatus;
  readonly blockers: readonly StreamBusinessFinalRoomAcceptanceBlockerCode[];
  readonly reviewedLocal: boolean;
  readonly providerRequired: boolean;
  readonly deliveredToBackend: false;
};

export type StreamBusinessFinalRoomAcceptanceIntegration = {
  readonly backendBusinessRoomContract: "not_connected" | "connected";
  readonly realtimeBusinessRoomProvider: "not_configured" | "configured";
  readonly mediaBusinessRoomProvider: "not_configured" | "configured";
  readonly adminBusinessRoomAcceptance: "not_connected" | "connected";
  readonly paymentsAllowedNow: false;
  readonly giftsAllowedNow: false;
  readonly monetizationAllowedNow: false;
  readonly walletBridgeRequiredNow: false;
  readonly fakeBusinessLaunchAllowed: false;
  readonly fakePaymentAllowed: false;
  readonly fakeGiftAllowed: false;
  readonly fakeMonetizationAllowed: false;
};

export type StreamBusinessFinalRoomAcceptanceRuntimeState = {
  readonly version: "STREAM-109U";
  readonly roomId: string;
  readonly status: StreamBusinessFinalRoomAcceptanceStatus;
  readonly selectedCheckId: StreamBusinessFinalRoomAcceptanceCheckId;
  readonly checks: readonly StreamBusinessFinalRoomAcceptanceCheck[];
  readonly finalOwnerAcceptedLocal: boolean;
  readonly finalQaAcceptedLocal: boolean;
  readonly finalReadinessLockedLocal: boolean;
  readonly queuedFinalAcceptanceEvents: number;
  readonly providerAdminHandoffRequestedLocal: boolean;
  readonly localBlockers: readonly StreamBusinessFinalRoomAcceptanceBlockerCode[];
  readonly providerBlockers: readonly StreamBusinessFinalRoomAcceptanceBlockerCode[];
  readonly integration: StreamBusinessFinalRoomAcceptanceIntegration;
  readonly updatedAt: string;
};

export type StreamBusinessFinalRoomAcceptanceEvidenceSnapshot = {
  readonly version: "STREAM-109U";
  readonly roomId: string;
  readonly status: StreamBusinessFinalRoomAcceptanceStatus;
  readonly selectedCheckId: StreamBusinessFinalRoomAcceptanceCheckId;
  readonly selectedCheckStatus: StreamBusinessFinalRoomAcceptanceCheckStatus;
  readonly totalChecks: number;
  readonly reviewedLocalChecks: number;
  readonly blockedLocalChecks: number;
  readonly providerRequiredChecks: number;
  readonly finalOwnerAcceptedLocal: boolean;
  readonly finalQaAcceptedLocal: boolean;
  readonly finalReadinessLockedLocal: boolean;
  readonly queuedFinalAcceptanceEvents: number;
  readonly providerAdminHandoffRequestedLocal: boolean;
  readonly roomStatus: StreamRoomRuntimeState["status"];
  readonly roomMode: StreamRoomRuntimeState["mode"];
  readonly businessHandoffStatus: StreamBusinessHandoffEvidenceRuntimeState["status"];
  readonly businessHandoffQueuedEvents: number;
  readonly localRoomEvents: number;
  readonly localBlockers: readonly StreamBusinessFinalRoomAcceptanceBlockerCode[];
  readonly providerBlockers: readonly StreamBusinessFinalRoomAcceptanceBlockerCode[];
  readonly backendBusinessRoomContract: StreamBusinessFinalRoomAcceptanceIntegration["backendBusinessRoomContract"];
  readonly realtimeBusinessRoomProvider: StreamBusinessFinalRoomAcceptanceIntegration["realtimeBusinessRoomProvider"];
  readonly mediaBusinessRoomProvider: StreamBusinessFinalRoomAcceptanceIntegration["mediaBusinessRoomProvider"];
  readonly adminBusinessRoomAcceptance: StreamBusinessFinalRoomAcceptanceIntegration["adminBusinessRoomAcceptance"];
  readonly paymentsAllowedNow: false;
  readonly giftsAllowedNow: false;
  readonly monetizationAllowedNow: false;
  readonly walletBridgeRequiredNow: false;
  readonly fakeBusinessLaunchAllowed: false;
  readonly fakePaymentAllowed: false;
  readonly fakeGiftAllowed: false;
  readonly fakeMonetizationAllowed: false;
  readonly localAcceptanceReady: boolean;
  readonly readyForProviderAdminUnion: boolean;
};

export const BUSINESS_FINAL_ACCEPTANCE_BLOCKER_LABELS: Record<StreamBusinessFinalRoomAcceptanceBlockerCode, string> = {
  room_lifecycle_not_ready: "Room lifecycle must be locally ready before final Business Stream acceptance.",
  business_mode_required: "Business Stream acceptance requires the business live room mode.",
  business_handoff_evidence_required: "Business handoff evidence cleanup must be locally ready.",
  local_event_queue_required: "Local event queue evidence must exist for Business Stream acceptance.",
  final_owner_acceptance_required: "Owner final local acceptance is required.",
  final_qa_acceptance_required: "QA final local acceptance is required.",
  final_readiness_lock_required: "Final local readiness lock is required.",
  final_acceptance_event_required: "Final acceptance evidence event must be queued locally.",
  backend_business_room_contract_required: "Backend Business Stream room contract is required before real launch.",
  realtime_business_room_provider_required: "Realtime Business Stream provider is required before real launch.",
  media_business_room_provider_required: "Media Business Stream provider is required before real launch.",
  admin_business_room_acceptance_required: "Admin Business Stream acceptance contract is required before real launch.",
  fake_business_launch_forbidden: "Fake Business Stream launch is forbidden.",
  fake_payment_forbidden: "Payments are out of scope at this stage and fake payment is forbidden.",
  fake_gift_forbidden: "Gifts are out of scope at this stage and fake gifts are forbidden.",
  fake_monetization_forbidden: "Monetization is out of scope at this stage and fake monetization is forbidden.",
};

function nowIso(now?: Date | string | number): string {
  if (now instanceof Date) return now.toISOString();
  if (typeof now === "string") return new Date(now).toISOString();
  if (typeof now === "number") return new Date(now).toISOString();
  return new Date().toISOString();
}

function defaultIntegration(): StreamBusinessFinalRoomAcceptanceIntegration {
  return {
    backendBusinessRoomContract: "not_connected",
    realtimeBusinessRoomProvider: "not_configured",
    mediaBusinessRoomProvider: "not_configured",
    adminBusinessRoomAcceptance: "not_connected",
    paymentsAllowedNow: false,
    giftsAllowedNow: false,
    monetizationAllowedNow: false,
    walletBridgeRequiredNow: false,
    fakeBusinessLaunchAllowed: false,
    fakePaymentAllowed: false,
    fakeGiftAllowed: false,
    fakeMonetizationAllowed: false,
  };
}

function providerBlockers(): readonly StreamBusinessFinalRoomAcceptanceBlockerCode[] {
  return [
    "backend_business_room_contract_required",
    "realtime_business_room_provider_required",
    "media_business_room_provider_required",
    "admin_business_room_acceptance_required",
    "fake_business_launch_forbidden",
    "fake_payment_forbidden",
    "fake_gift_forbidden",
    "fake_monetization_forbidden",
  ];
}

function isRoomLifecycleReady(room: StreamRoomRuntimeState): boolean {
  return room.mode === "businessLive" && (room.status === "local_room_ready" || room.status === "local_preview_active" || room.status === "provider_handoff_blocked");
}

function isBusinessHandoffReady(handoff: StreamBusinessHandoffEvidenceRuntimeState): boolean {
  return (
    handoff.localBlockers.length === 0 &&
    handoff.handoffSummaryReviewedLocal &&
    handoff.technicalEvidenceReviewedLocal &&
    handoff.providerAdminBlockersReviewedLocal &&
    handoff.finalHandoffNotesPreparedLocal &&
    handoff.queuedHandoffEvidenceEvents > 0
  );
}

function localBlockersForAll(
  state: Pick<StreamBusinessFinalRoomAcceptanceRuntimeState, "finalOwnerAcceptedLocal" | "finalQaAcceptedLocal" | "finalReadinessLockedLocal" | "queuedFinalAcceptanceEvents">,
  room: StreamRoomRuntimeState,
  queue: StreamRoomEventQueueRuntimeState,
  handoff: StreamBusinessHandoffEvidenceRuntimeState,
): readonly StreamBusinessFinalRoomAcceptanceBlockerCode[] {
  const blockers: StreamBusinessFinalRoomAcceptanceBlockerCode[] = [];
  if (!isRoomLifecycleReady(room)) blockers.push("room_lifecycle_not_ready");
  if (room.mode !== "businessLive") blockers.push("business_mode_required");
  if (!isBusinessHandoffReady(handoff)) blockers.push("business_handoff_evidence_required");
  if (queue.events.length <= 0 || handoff.queuedHandoffEvidenceEvents <= 0) blockers.push("local_event_queue_required");
  if (!state.finalOwnerAcceptedLocal) blockers.push("final_owner_acceptance_required");
  if (!state.finalQaAcceptedLocal) blockers.push("final_qa_acceptance_required");
  if (!state.finalReadinessLockedLocal) blockers.push("final_readiness_lock_required");
  if (state.queuedFinalAcceptanceEvents <= 0) blockers.push("final_acceptance_event_required");
  return Array.from(new Set(blockers));
}

function checkStatus(blockers: readonly StreamBusinessFinalRoomAcceptanceBlockerCode[], providerRequired: boolean, reviewedLocal: boolean): StreamBusinessFinalRoomAcceptanceCheckStatus {
  if (providerRequired) return "provider_required";
  if (blockers.length > 0) return "blocked_local";
  return reviewedLocal ? "reviewed_local" : "pending_local";
}

function buildChecks(
  state: Pick<StreamBusinessFinalRoomAcceptanceRuntimeState, "finalOwnerAcceptedLocal" | "finalQaAcceptedLocal" | "finalReadinessLockedLocal" | "queuedFinalAcceptanceEvents" | "checks">,
  room: StreamRoomRuntimeState,
  queue: StreamRoomEventQueueRuntimeState,
  handoff: StreamBusinessHandoffEvidenceRuntimeState,
): readonly StreamBusinessFinalRoomAcceptanceCheck[] {
  const reviewed = new Set(state.checks.filter((check) => check.reviewedLocal).map((check) => check.id));
  const definitions: readonly {
    readonly id: StreamBusinessFinalRoomAcceptanceCheckId;
    readonly title: string;
    readonly purpose: string;
    readonly blockers: readonly StreamBusinessFinalRoomAcceptanceBlockerCode[];
    readonly providerRequired?: boolean;
  }[] = [
    {
      id: "room_lifecycle_ready",
      title: "Business room lifecycle ready",
      purpose: "Verify the Business Stream room is locally ready or preview active, not fake on-air.",
      blockers: isRoomLifecycleReady(room) ? [] : ["room_lifecycle_not_ready"],
    },
    {
      id: "business_room_ready",
      title: "Business mode confirmed",
      purpose: "Verify the room is in Business Stream mode with payment/gifts/monetization out of scope.",
      blockers: room.mode === "businessLive" ? [] : ["business_mode_required"],
    },
    {
      id: "business_handoff_evidence_ready",
      title: "Business handoff evidence ready",
      purpose: "Verify 109T handoff evidence cleanup has no local blockers and has queued evidence.",
      blockers: isBusinessHandoffReady(handoff) ? [] : ["business_handoff_evidence_required"],
    },
    {
      id: "local_event_queue_ready",
      title: "Local event queue evidence ready",
      purpose: "Verify local room/business handoff events exist before provider/Admin union.",
      blockers: queue.events.length > 0 && handoff.queuedHandoffEvidenceEvents > 0 ? [] : ["local_event_queue_required"],
    },
    {
      id: "final_owner_acceptance",
      title: "Owner final local acceptance",
      purpose: "Owner confirms local Business Stream room evidence without claiming real launch.",
      blockers: state.finalOwnerAcceptedLocal ? [] : ["final_owner_acceptance_required"],
    },
    {
      id: "final_qa_acceptance",
      title: "QA final local acceptance",
      purpose: "QA confirms local room actions/evidence are ready for backend/provider/Admin integration.",
      blockers: state.finalQaAcceptedLocal && state.finalReadinessLockedLocal ? [] : ["final_qa_acceptance_required", "final_readiness_lock_required"],
    },
    {
      id: "provider_admin_handoff",
      title: "Provider/Admin handoff required",
      purpose: "Keep Business Stream real launch blocked until backend/provider/Admin contracts exist.",
      blockers: providerBlockers(),
      providerRequired: true,
    },
  ];

  return definitions.map((definition) => {
    const reviewedLocal = reviewed.has(definition.id) || (definition.blockers.length === 0 && !definition.providerRequired);
    return {
      id: definition.id,
      title: definition.title,
      purpose: definition.purpose,
      status: checkStatus(definition.blockers, Boolean(definition.providerRequired), reviewedLocal),
      blockers: definition.blockers,
      reviewedLocal,
      providerRequired: Boolean(definition.providerRequired),
      deliveredToBackend: false,
    } satisfies StreamBusinessFinalRoomAcceptanceCheck;
  });
}

function statusFor(localBlockers: readonly StreamBusinessFinalRoomAcceptanceBlockerCode[], providerRequested: boolean): StreamBusinessFinalRoomAcceptanceStatus {
  if (localBlockers.length > 0) return "blocked_local";
  return providerRequested ? "provider_admin_required" : "local_acceptance_ready";
}

export function createInitialStreamBusinessFinalRoomAcceptanceState(
  room: StreamRoomRuntimeState,
  queue: StreamRoomEventQueueRuntimeState,
  handoff: StreamBusinessHandoffEvidenceRuntimeState,
  now?: Date | string | number,
): StreamBusinessFinalRoomAcceptanceRuntimeState {
  const updatedAt = nowIso(now);
  const base = {
    finalOwnerAcceptedLocal: false,
    finalQaAcceptedLocal: false,
    finalReadinessLockedLocal: false,
    queuedFinalAcceptanceEvents: 0,
    checks: [] as readonly StreamBusinessFinalRoomAcceptanceCheck[],
  };
  const checks = buildChecks(base, room, queue, handoff);
  const localBlockers = localBlockersForAll(base, room, queue, handoff);
  return {
    version: "STREAM-109U",
    roomId: room.roomId,
    status: localBlockers.length > 0 ? "not_started_local" : "local_acceptance_ready",
    selectedCheckId: "room_lifecycle_ready",
    checks,
    finalOwnerAcceptedLocal: false,
    finalQaAcceptedLocal: false,
    finalReadinessLockedLocal: false,
    queuedFinalAcceptanceEvents: 0,
    providerAdminHandoffRequestedLocal: false,
    localBlockers,
    providerBlockers: providerBlockers(),
    integration: defaultIntegration(),
    updatedAt,
  };
}

export function syncStreamBusinessFinalRoomAcceptanceState(
  state: StreamBusinessFinalRoomAcceptanceRuntimeState,
  room: StreamRoomRuntimeState,
  queue: StreamRoomEventQueueRuntimeState,
  handoff: StreamBusinessHandoffEvidenceRuntimeState,
  now?: Date | string | number,
): StreamBusinessFinalRoomAcceptanceRuntimeState {
  return runStreamBusinessFinalRoomAcceptanceGate({ ...state, roomId: room.roomId }, room, queue, handoff, now);
}

export function selectNextStreamBusinessFinalAcceptanceCheckLocal(state: StreamBusinessFinalRoomAcceptanceRuntimeState): StreamBusinessFinalRoomAcceptanceRuntimeState {
  const index = Math.max(0, state.checks.findIndex((check) => check.id === state.selectedCheckId));
  const next = state.checks[(index + 1) % Math.max(1, state.checks.length)] ?? state.checks[0];
  return { ...state, selectedCheckId: next?.id ?? state.selectedCheckId, updatedAt: nowIso() };
}

export function acknowledgeStreamBusinessFinalOwnerAcceptanceLocal(state: StreamBusinessFinalRoomAcceptanceRuntimeState): StreamBusinessFinalRoomAcceptanceRuntimeState {
  return { ...state, finalOwnerAcceptedLocal: true, updatedAt: nowIso() };
}

export function acknowledgeStreamBusinessFinalQaAcceptanceLocal(state: StreamBusinessFinalRoomAcceptanceRuntimeState): StreamBusinessFinalRoomAcceptanceRuntimeState {
  return { ...state, finalQaAcceptedLocal: true, updatedAt: nowIso() };
}

export function lockStreamBusinessFinalReadinessLocal(state: StreamBusinessFinalRoomAcceptanceRuntimeState): StreamBusinessFinalRoomAcceptanceRuntimeState {
  return { ...state, finalReadinessLockedLocal: true, updatedAt: nowIso() };
}

export function reviewSelectedStreamBusinessFinalAcceptanceCheckLocal(state: StreamBusinessFinalRoomAcceptanceRuntimeState): StreamBusinessFinalRoomAcceptanceRuntimeState {
  const checks: readonly StreamBusinessFinalRoomAcceptanceCheck[] = state.checks.map((check): StreamBusinessFinalRoomAcceptanceCheck => {
    if (check.id !== state.selectedCheckId) {
      return check;
    }

    const status: StreamBusinessFinalRoomAcceptanceCheckStatus = check.providerRequired ? "provider_required" : "reviewed_local";
    return { ...check, reviewedLocal: true, status };
  });
  return { ...state, checks, updatedAt: nowIso() };
}

export function runStreamBusinessFinalRoomAcceptanceGate(
  state: StreamBusinessFinalRoomAcceptanceRuntimeState,
  room: StreamRoomRuntimeState,
  queue: StreamRoomEventQueueRuntimeState,
  handoff: StreamBusinessHandoffEvidenceRuntimeState,
  now?: Date | string | number,
): StreamBusinessFinalRoomAcceptanceRuntimeState {
  const updatedAt = nowIso(now);
  const checks = buildChecks(state, room, queue, handoff);
  const localBlockers = localBlockersForAll(state, room, queue, handoff);
  const selected = checks.find((check) => check.id === state.selectedCheckId) ?? checks[0];
  return {
    ...state,
    roomId: room.roomId,
    checks,
    selectedCheckId: selected?.id ?? state.selectedCheckId,
    status: statusFor(localBlockers, state.providerAdminHandoffRequestedLocal),
    localBlockers,
    providerBlockers: providerBlockers(),
    updatedAt,
  };
}

export function queueStreamBusinessFinalRoomAcceptanceEvent(
  state: StreamBusinessFinalRoomAcceptanceRuntimeState,
  queue: StreamRoomEventQueueRuntimeState,
  room: StreamRoomRuntimeState,
  handoff: StreamBusinessHandoffEvidenceRuntimeState,
): { readonly state: StreamBusinessFinalRoomAcceptanceRuntimeState; readonly eventQueue: StreamRoomEventQueueRuntimeState } {
  const checked = runStreamBusinessFinalRoomAcceptanceGate(state, room, queue, handoff);
  const eventQueue = enqueueLocalStreamRoomEvent(queue, room, {
    kind: "provider_handoff_request",
    label: "Business Stream final local acceptance evidence",
    priority: checked.localBlockers.length > 0 ? "high" : "critical",
    payload: {
      version: checked.version,
      roomId: room.roomId,
      roomStatus: room.status,
      roomMode: room.mode,
      status: checked.status,
      localAcceptanceReady: checked.localBlockers.length === 0,
      finalOwnerAcceptedLocal: checked.finalOwnerAcceptedLocal,
      finalQaAcceptedLocal: checked.finalQaAcceptedLocal,
      finalReadinessLockedLocal: checked.finalReadinessLockedLocal,
      businessHandoffStatus: handoff.status,
      fakeBusinessLaunchAllowed: false,
      paymentsAllowedNow: false,
      giftsAllowedNow: false,
      monetizationAllowedNow: false,
    },
  });
  return {
    state: runStreamBusinessFinalRoomAcceptanceGate({ ...checked, queuedFinalAcceptanceEvents: checked.queuedFinalAcceptanceEvents + 1 }, room, eventQueue, handoff),
    eventQueue,
  };
}

export function requestStreamBusinessFinalProviderAdminBlocked(
  state: StreamBusinessFinalRoomAcceptanceRuntimeState,
  room: StreamRoomRuntimeState,
  queue: StreamRoomEventQueueRuntimeState,
  handoff: StreamBusinessHandoffEvidenceRuntimeState,
): StreamBusinessFinalRoomAcceptanceRuntimeState {
  return runStreamBusinessFinalRoomAcceptanceGate({ ...state, providerAdminHandoffRequestedLocal: true }, room, queue, handoff);
}

export function buildStreamBusinessFinalRoomAcceptanceEvidenceSnapshot(
  state: StreamBusinessFinalRoomAcceptanceRuntimeState,
  room: StreamRoomRuntimeState,
  queue: StreamRoomEventQueueRuntimeState,
  handoff: StreamBusinessHandoffEvidenceRuntimeState,
): StreamBusinessFinalRoomAcceptanceEvidenceSnapshot {
  const synced = runStreamBusinessFinalRoomAcceptanceGate(state, room, queue, handoff);
  const selected = synced.checks.find((check) => check.id === synced.selectedCheckId) ?? synced.checks[0];
  const localAcceptanceReady = synced.localBlockers.length === 0;
  return {
    version: "STREAM-109U",
    roomId: room.roomId,
    status: synced.status,
    selectedCheckId: synced.selectedCheckId,
    selectedCheckStatus: selected?.status ?? "pending_local",
    totalChecks: synced.checks.length,
    reviewedLocalChecks: synced.checks.filter((check) => check.reviewedLocal).length,
    blockedLocalChecks: synced.checks.filter((check) => check.status === "blocked_local").length,
    providerRequiredChecks: synced.checks.filter((check) => check.providerRequired).length,
    finalOwnerAcceptedLocal: synced.finalOwnerAcceptedLocal,
    finalQaAcceptedLocal: synced.finalQaAcceptedLocal,
    finalReadinessLockedLocal: synced.finalReadinessLockedLocal,
    queuedFinalAcceptanceEvents: synced.queuedFinalAcceptanceEvents,
    providerAdminHandoffRequestedLocal: synced.providerAdminHandoffRequestedLocal,
    roomStatus: room.status,
    roomMode: room.mode,
    businessHandoffStatus: handoff.status,
    businessHandoffQueuedEvents: handoff.queuedHandoffEvidenceEvents,
    localRoomEvents: queue.events.length,
    localBlockers: synced.localBlockers,
    providerBlockers: synced.providerBlockers,
    backendBusinessRoomContract: synced.integration.backendBusinessRoomContract,
    realtimeBusinessRoomProvider: synced.integration.realtimeBusinessRoomProvider,
    mediaBusinessRoomProvider: synced.integration.mediaBusinessRoomProvider,
    adminBusinessRoomAcceptance: synced.integration.adminBusinessRoomAcceptance,
    paymentsAllowedNow: false,
    giftsAllowedNow: false,
    monetizationAllowedNow: false,
    walletBridgeRequiredNow: false,
    fakeBusinessLaunchAllowed: false,
    fakePaymentAllowed: false,
    fakeGiftAllowed: false,
    fakeMonetizationAllowed: false,
    localAcceptanceReady,
    readyForProviderAdminUnion: localAcceptanceReady && synced.queuedFinalAcceptanceEvents > 0,
  };
}
