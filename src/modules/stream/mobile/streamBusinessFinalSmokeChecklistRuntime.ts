import type { StreamRoomRuntimeState } from "./streamRoomRuntime";
import { enqueueLocalStreamRoomEvent, type StreamRoomEventQueueRuntimeState } from "./streamRoomEventQueueRuntime";
import type { StreamBusinessFinalRoomAcceptanceRuntimeState } from "./streamBusinessFinalRoomAcceptanceGateRuntime";

export type StreamBusinessFinalSmokeStatus =
  | "not_started_local"
  | "running_local"
  | "blocked_local"
  | "local_smoke_ready"
  | "provider_admin_required";

export type StreamBusinessFinalSmokeCheckId =
  | "business_room_final_acceptance_ready"
  | "final_acceptance_event_queued"
  | "local_business_event_queue_ready"
  | "business_launch_blockers_visible"
  | "no_monetization_scope_confirmed"
  | "shorts_phase_handoff_allowed";

export type StreamBusinessFinalSmokeCheckStatus = "pending_local" | "reviewed_local" | "blocked_local" | "provider_required";

export type StreamBusinessFinalSmokeBlockerCode =
  | "business_final_acceptance_required"
  | "final_acceptance_event_required"
  | "local_business_event_queue_required"
  | "backend_business_room_contract_required"
  | "realtime_business_provider_required"
  | "media_business_provider_required"
  | "admin_business_review_required"
  | "shorts_handoff_review_required"
  | "fake_business_launch_forbidden"
  | "fake_payment_forbidden"
  | "fake_gift_forbidden"
  | "fake_monetization_forbidden";

export type StreamBusinessFinalSmokeCheck = {
  readonly id: StreamBusinessFinalSmokeCheckId;
  readonly title: string;
  readonly purpose: string;
  readonly status: StreamBusinessFinalSmokeCheckStatus;
  readonly reviewedLocal: boolean;
  readonly providerRequired: boolean;
  readonly blockers: readonly StreamBusinessFinalSmokeBlockerCode[];
  readonly deliveredToBackend: false;
};

export type StreamBusinessFinalSmokeIntegration = {
  readonly backendBusinessRoomContract: "not_connected" | "connected";
  readonly realtimeBusinessProvider: "not_configured" | "configured";
  readonly mediaBusinessProvider: "not_configured" | "configured";
  readonly adminBusinessReview: "not_connected" | "connected";
  readonly paymentsAllowedNow: false;
  readonly giftsAllowedNow: false;
  readonly monetizationAllowedNow: false;
  readonly walletBridgeRequiredNow: false;
  readonly fakeBusinessLaunchAllowed: false;
  readonly fakePaymentAllowed: false;
  readonly fakeGiftAllowed: false;
  readonly fakeMonetizationAllowed: false;
};

export type StreamBusinessFinalSmokeRuntimeState = {
  readonly version: "STREAM-109V";
  readonly roomId: string;
  readonly status: StreamBusinessFinalSmokeStatus;
  readonly selectedCheckId: StreamBusinessFinalSmokeCheckId;
  readonly checks: readonly StreamBusinessFinalSmokeCheck[];
  readonly smokeReviewedLocal: boolean;
  readonly shortsHandoffReviewedLocal: boolean;
  readonly queuedFinalSmokeEvents: number;
  readonly providerAdminHandoffRequestedLocal: boolean;
  readonly localBlockers: readonly StreamBusinessFinalSmokeBlockerCode[];
  readonly providerBlockers: readonly StreamBusinessFinalSmokeBlockerCode[];
  readonly integration: StreamBusinessFinalSmokeIntegration;
  readonly updatedAt: string;
};

export type StreamBusinessFinalSmokeEvidenceSnapshot = {
  readonly version: "STREAM-109V";
  readonly roomId: string;
  readonly status: StreamBusinessFinalSmokeStatus;
  readonly selectedCheckId: StreamBusinessFinalSmokeCheckId;
  readonly selectedCheckStatus: StreamBusinessFinalSmokeCheckStatus;
  readonly totalChecks: number;
  readonly reviewedChecks: number;
  readonly blockedChecks: number;
  readonly providerRequiredChecks: number;
  readonly smokeReviewedLocal: boolean;
  readonly shortsHandoffReviewedLocal: boolean;
  readonly queuedFinalSmokeEvents: number;
  readonly providerAdminHandoffRequestedLocal: boolean;
  readonly roomMode: StreamRoomRuntimeState["mode"];
  readonly roomStatus: StreamRoomRuntimeState["status"];
  readonly businessFinalAcceptanceStatus: StreamBusinessFinalRoomAcceptanceRuntimeState["status"];
  readonly businessFinalAcceptanceLocalReady: boolean;
  readonly businessFinalAcceptanceEvents: number;
  readonly localRoomEvents: number;
  readonly businessLocalEvents: number;
  readonly localBlockers: readonly StreamBusinessFinalSmokeBlockerCode[];
  readonly providerBlockers: readonly StreamBusinessFinalSmokeBlockerCode[];
  readonly backendBusinessRoomContract: StreamBusinessFinalSmokeIntegration["backendBusinessRoomContract"];
  readonly realtimeBusinessProvider: StreamBusinessFinalSmokeIntegration["realtimeBusinessProvider"];
  readonly mediaBusinessProvider: StreamBusinessFinalSmokeIntegration["mediaBusinessProvider"];
  readonly adminBusinessReview: StreamBusinessFinalSmokeIntegration["adminBusinessReview"];
  readonly paymentsAllowedNow: false;
  readonly giftsAllowedNow: false;
  readonly monetizationAllowedNow: false;
  readonly walletBridgeRequiredNow: false;
  readonly fakeBusinessLaunchAllowed: false;
  readonly fakePaymentAllowed: false;
  readonly fakeGiftAllowed: false;
  readonly fakeMonetizationAllowed: false;
  readonly businessStreamLocalSmokeReady: boolean;
  readonly shortsPhaseCanStartAfterOwnerDecision: boolean;
};

export const BUSINESS_FINAL_SMOKE_BLOCKER_LABELS: Record<StreamBusinessFinalSmokeBlockerCode, string> = {
  business_final_acceptance_required: "Business final local acceptance gate must be ready before Business Stream smoke pass.",
  final_acceptance_event_required: "Final acceptance event must be queued locally before smoke handoff.",
  local_business_event_queue_required: "Local business event queue evidence is required before smoke handoff.",
  backend_business_room_contract_required: "Backend Business Stream room contract is required before real launch.",
  realtime_business_provider_required: "Realtime Business Stream provider is required before real launch.",
  media_business_provider_required: "Media Business Stream provider is required before real launch.",
  admin_business_review_required: "Admin Business Stream review is required before real launch.",
  shorts_handoff_review_required: "Shorts phase handoff must be reviewed locally before switching phases.",
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

function defaultIntegration(): StreamBusinessFinalSmokeIntegration {
  return {
    backendBusinessRoomContract: "not_connected",
    realtimeBusinessProvider: "not_configured",
    mediaBusinessProvider: "not_configured",
    adminBusinessReview: "not_connected",
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

function providerBlockers(): readonly StreamBusinessFinalSmokeBlockerCode[] {
  return [
    "backend_business_room_contract_required",
    "realtime_business_provider_required",
    "media_business_provider_required",
    "admin_business_review_required",
    "fake_business_launch_forbidden",
    "fake_payment_forbidden",
    "fake_gift_forbidden",
    "fake_monetization_forbidden",
  ];
}

function businessEventCount(queue: StreamRoomEventQueueRuntimeState): number {
  return queue.events.filter((event) => String(event.kind).includes("business") || String(event.kind).includes("acceptance") || String(event.kind).includes("scenario")).length;
}

function isFinalAcceptanceReady(finalAcceptance: StreamBusinessFinalRoomAcceptanceRuntimeState): boolean {
  return (
    finalAcceptance.localBlockers.length === 0 &&
    finalAcceptance.finalOwnerAcceptedLocal &&
    finalAcceptance.finalQaAcceptedLocal &&
    finalAcceptance.finalReadinessLockedLocal &&
    finalAcceptance.queuedFinalAcceptanceEvents > 0
  );
}

function localBlockersForAll(
  state: Pick<StreamBusinessFinalSmokeRuntimeState, "smokeReviewedLocal" | "shortsHandoffReviewedLocal" | "queuedFinalSmokeEvents">,
  room: StreamRoomRuntimeState,
  queue: StreamRoomEventQueueRuntimeState,
  finalAcceptance: StreamBusinessFinalRoomAcceptanceRuntimeState,
): readonly StreamBusinessFinalSmokeBlockerCode[] {
  const blockers: StreamBusinessFinalSmokeBlockerCode[] = [];
  if (room.mode !== "businessLive" || !isFinalAcceptanceReady(finalAcceptance)) blockers.push("business_final_acceptance_required");
  if (finalAcceptance.queuedFinalAcceptanceEvents <= 0) blockers.push("final_acceptance_event_required");
  if (queue.events.length <= 0 || businessEventCount(queue) <= 0) blockers.push("local_business_event_queue_required");
  if (!state.shortsHandoffReviewedLocal) blockers.push("shorts_handoff_review_required");
  if (!state.smokeReviewedLocal) blockers.push("shorts_handoff_review_required");
  if (state.queuedFinalSmokeEvents <= 0) blockers.push("final_acceptance_event_required");
  return blockers;
}

function checkStatus(blockers: readonly StreamBusinessFinalSmokeBlockerCode[], providerRequired: boolean, reviewedLocal: boolean): StreamBusinessFinalSmokeCheckStatus {
  if (providerRequired) return "provider_required";
  if (blockers.length > 0) return "blocked_local";
  return reviewedLocal ? "reviewed_local" : "pending_local";
}

function buildChecks(
  state: Pick<StreamBusinessFinalSmokeRuntimeState, "smokeReviewedLocal" | "shortsHandoffReviewedLocal" | "queuedFinalSmokeEvents" | "checks">,
  room: StreamRoomRuntimeState,
  queue: StreamRoomEventQueueRuntimeState,
  finalAcceptance: StreamBusinessFinalRoomAcceptanceRuntimeState,
): readonly StreamBusinessFinalSmokeCheck[] {
  const reviewed = new Set(state.checks.filter((check) => check.reviewedLocal).map((check) => check.id));
  const finalReady = room.mode === "businessLive" && isFinalAcceptanceReady(finalAcceptance);
  const definitions: readonly {
    readonly id: StreamBusinessFinalSmokeCheckId;
    readonly title: string;
    readonly purpose: string;
    readonly blockers: readonly StreamBusinessFinalSmokeBlockerCode[];
    readonly providerRequired?: boolean;
  }[] = [
    {
      id: "business_room_final_acceptance_ready",
      title: "Business final acceptance ready",
      purpose: "Verify Business Stream has completed local final room acceptance without fake launch.",
      blockers: finalReady ? [] : ["business_final_acceptance_required"],
    },
    {
      id: "final_acceptance_event_queued",
      title: "Final acceptance event queued",
      purpose: "Verify final Business Stream acceptance evidence was queued locally.",
      blockers: finalAcceptance.queuedFinalAcceptanceEvents > 0 ? [] : ["final_acceptance_event_required"],
    },
    {
      id: "local_business_event_queue_ready",
      title: "Local Business Stream event queue ready",
      purpose: "Verify local evidence exists for handoff and smoke tracking.",
      blockers: queue.events.length > 0 && businessEventCount(queue) > 0 ? [] : ["local_business_event_queue_required"],
    },
    {
      id: "business_launch_blockers_visible",
      title: "Provider/Admin blockers visible",
      purpose: "Verify backend/provider/Admin blockers remain visible before real launch.",
      blockers: [],
      providerRequired: true,
    },
    {
      id: "no_monetization_scope_confirmed",
      title: "No payments/gifts/monetization scope confirmed",
      purpose: "Verify Business Stream handoff does not unlock payments, gifts, Wallet or monetization.",
      blockers: [],
    },
    {
      id: "shorts_phase_handoff_allowed",
      title: "Shorts phase handoff reviewed",
      purpose: "Verify the team can move to Shorts only after Business Stream local smoke evidence is reviewed.",
      blockers: state.shortsHandoffReviewedLocal ? [] : ["shorts_handoff_review_required"],
    },
  ];

  return definitions.map((definition): StreamBusinessFinalSmokeCheck => {
    const reviewedLocal = definition.id === "shorts_phase_handoff_allowed" ? state.shortsHandoffReviewedLocal : reviewed.has(definition.id) || state.smokeReviewedLocal;
    const providerRequired = Boolean(definition.providerRequired);
    return {
      id: definition.id,
      title: definition.title,
      purpose: definition.purpose,
      status: checkStatus(definition.blockers, providerRequired, reviewedLocal),
      reviewedLocal,
      providerRequired,
      blockers: definition.blockers,
      deliveredToBackend: false,
    };
  });
}

function statusFrom(blockers: readonly StreamBusinessFinalSmokeBlockerCode[], providerHandoff: boolean): StreamBusinessFinalSmokeStatus {
  if (providerHandoff) return "provider_admin_required";
  if (blockers.length > 0) return "blocked_local";
  return "local_smoke_ready";
}

export function createInitialStreamBusinessFinalSmokeState(
  room: StreamRoomRuntimeState,
  queue: StreamRoomEventQueueRuntimeState,
  finalAcceptance: StreamBusinessFinalRoomAcceptanceRuntimeState,
  now?: Date | string | number,
): StreamBusinessFinalSmokeRuntimeState {
  const base: StreamBusinessFinalSmokeRuntimeState = {
    version: "STREAM-109V",
    roomId: room.roomId,
    status: "not_started_local",
    selectedCheckId: "business_room_final_acceptance_ready",
    checks: [] as readonly StreamBusinessFinalSmokeCheck[],
    smokeReviewedLocal: false,
    shortsHandoffReviewedLocal: false,
    queuedFinalSmokeEvents: 0,
    providerAdminHandoffRequestedLocal: false,
    localBlockers: [],
    providerBlockers: providerBlockers(),
    integration: defaultIntegration(),
    updatedAt: nowIso(now),
  };
  const checks = buildChecks(base, room, queue, finalAcceptance);
  const localBlockers = localBlockersForAll(base, room, queue, finalAcceptance);
  return { ...base, checks, localBlockers, status: statusFrom(localBlockers, false) };
}

export function selectNextStreamBusinessFinalSmokeCheckLocal(state: StreamBusinessFinalSmokeRuntimeState, now?: Date | string | number): StreamBusinessFinalSmokeRuntimeState {
  const index = Math.max(0, state.checks.findIndex((check) => check.id === state.selectedCheckId));
  const next = state.checks[(index + 1) % Math.max(1, state.checks.length)] ?? state.checks[0];
  return { ...state, selectedCheckId: next?.id ?? state.selectedCheckId, updatedAt: nowIso(now) };
}

export function reviewSelectedStreamBusinessFinalSmokeCheckLocal(state: StreamBusinessFinalSmokeRuntimeState, now?: Date | string | number): StreamBusinessFinalSmokeRuntimeState {
  const checks: readonly StreamBusinessFinalSmokeCheck[] = state.checks.map((check): StreamBusinessFinalSmokeCheck => {
    if (check.id !== state.selectedCheckId) return check;
    const status: StreamBusinessFinalSmokeCheckStatus = check.providerRequired ? "provider_required" : "reviewed_local";
    return { ...check, reviewedLocal: true, status };
  });
  return { ...state, checks, smokeReviewedLocal: true, updatedAt: nowIso(now) };
}

export function reviewStreamBusinessShortsHandoffLocal(state: StreamBusinessFinalSmokeRuntimeState, now?: Date | string | number): StreamBusinessFinalSmokeRuntimeState {
  return { ...state, shortsHandoffReviewedLocal: true, updatedAt: nowIso(now) };
}

export function runStreamBusinessFinalSmokeChecklist(
  state: StreamBusinessFinalSmokeRuntimeState,
  room: StreamRoomRuntimeState,
  queue: StreamRoomEventQueueRuntimeState,
  finalAcceptance: StreamBusinessFinalRoomAcceptanceRuntimeState,
  now?: Date | string | number,
): StreamBusinessFinalSmokeRuntimeState {
  const updatedAt = nowIso(now);
  const checks = buildChecks(state, room, queue, finalAcceptance);
  const selected = checks.find((check) => check.id === state.selectedCheckId) ?? checks[0];
  const localBlockers = localBlockersForAll(state, room, queue, finalAcceptance);
  return {
    ...state,
    roomId: room.roomId,
    checks,
    selectedCheckId: selected?.id ?? state.selectedCheckId,
    localBlockers,
    providerBlockers: providerBlockers(),
    status: statusFrom(localBlockers, state.providerAdminHandoffRequestedLocal),
    updatedAt,
  };
}

export function queueStreamBusinessFinalSmokeEvent(
  state: StreamBusinessFinalSmokeRuntimeState,
  eventQueue: StreamRoomEventQueueRuntimeState,
  room: StreamRoomRuntimeState,
  finalAcceptance: StreamBusinessFinalRoomAcceptanceRuntimeState,
  now?: Date | string | number,
): { readonly state: StreamBusinessFinalSmokeRuntimeState; readonly eventQueue: StreamRoomEventQueueRuntimeState } {
  const checked = runStreamBusinessFinalSmokeChecklist(state, room, eventQueue, finalAcceptance, now);
  const eventQueueNext = enqueueLocalStreamRoomEvent(
    eventQueue,
    room,
    {
      kind: "room_lifecycle",
      label: "Business Stream final smoke checklist",
      priority: checked.localBlockers.length > 0 ? "high" : "critical",
      payload: {
        version: checked.version,
        roomId: room.roomId,
        actorId: room.hostId,
        actorRole: "host",
        status: checked.status,
        businessFinalAcceptanceStatus: finalAcceptance.status,
        businessFinalAcceptanceLocalReady: isFinalAcceptanceReady(finalAcceptance),
        finalAcceptanceEvents: finalAcceptance.queuedFinalAcceptanceEvents,
        smokeReviewedLocal: checked.smokeReviewedLocal,
        shortsHandoffReviewedLocal: checked.shortsHandoffReviewedLocal,
        localBlockersCount: checked.localBlockers.length,
        providerBlockersCount: checked.providerBlockers.length,
        paymentsAllowedNow: false,
        giftsAllowedNow: false,
        monetizationAllowedNow: false,
        walletBridgeRequiredNow: false,
        fakeBusinessLaunchAllowed: false,
        fakePaymentAllowed: false,
        fakeGiftAllowed: false,
        fakeMonetizationAllowed: false,
        deliveredToProvider: false,
      },
    },
    now,
  );
  return {
    state: runStreamBusinessFinalSmokeChecklist({ ...checked, queuedFinalSmokeEvents: checked.queuedFinalSmokeEvents + 1 }, room, eventQueueNext, finalAcceptance, now),
    eventQueue: eventQueueNext,
  };
}

export function requestStreamBusinessFinalSmokeProviderAdminBlocked(state: StreamBusinessFinalSmokeRuntimeState, now?: Date | string | number): StreamBusinessFinalSmokeRuntimeState {
  return {
    ...state,
    providerAdminHandoffRequestedLocal: true,
    providerBlockers: providerBlockers(),
    status: "provider_admin_required",
    updatedAt: nowIso(now),
  };
}

export function syncStreamBusinessFinalSmokeState(
  state: StreamBusinessFinalSmokeRuntimeState,
  room: StreamRoomRuntimeState,
  queue: StreamRoomEventQueueRuntimeState,
  finalAcceptance: StreamBusinessFinalRoomAcceptanceRuntimeState,
): StreamBusinessFinalSmokeRuntimeState {
  if (state.roomId !== room.roomId) return createInitialStreamBusinessFinalSmokeState(room, queue, finalAcceptance);
  return runStreamBusinessFinalSmokeChecklist(state, room, queue, finalAcceptance);
}

export function buildStreamBusinessFinalSmokeEvidenceSnapshot(
  state: StreamBusinessFinalSmokeRuntimeState,
  room: StreamRoomRuntimeState,
  queue: StreamRoomEventQueueRuntimeState,
  finalAcceptance: StreamBusinessFinalRoomAcceptanceRuntimeState,
): StreamBusinessFinalSmokeEvidenceSnapshot {
  const synced = runStreamBusinessFinalSmokeChecklist(state, room, queue, finalAcceptance);
  const selected = synced.checks.find((check) => check.id === synced.selectedCheckId) ?? synced.checks[0];
  const businessLocalEvents = businessEventCount(queue);
  const businessStreamLocalSmokeReady = synced.localBlockers.length === 0 && synced.queuedFinalSmokeEvents > 0;
  return {
    version: "STREAM-109V",
    roomId: room.roomId,
    status: synced.status,
    selectedCheckId: synced.selectedCheckId,
    selectedCheckStatus: selected?.status ?? "pending_local",
    totalChecks: synced.checks.length,
    reviewedChecks: synced.checks.filter((check) => check.reviewedLocal).length,
    blockedChecks: synced.checks.filter((check) => check.status === "blocked_local").length,
    providerRequiredChecks: synced.checks.filter((check) => check.providerRequired).length,
    smokeReviewedLocal: synced.smokeReviewedLocal,
    shortsHandoffReviewedLocal: synced.shortsHandoffReviewedLocal,
    queuedFinalSmokeEvents: synced.queuedFinalSmokeEvents,
    providerAdminHandoffRequestedLocal: synced.providerAdminHandoffRequestedLocal,
    roomMode: room.mode,
    roomStatus: room.status,
    businessFinalAcceptanceStatus: finalAcceptance.status,
    businessFinalAcceptanceLocalReady: isFinalAcceptanceReady(finalAcceptance),
    businessFinalAcceptanceEvents: finalAcceptance.queuedFinalAcceptanceEvents,
    localRoomEvents: queue.events.length,
    businessLocalEvents,
    localBlockers: synced.localBlockers,
    providerBlockers: synced.providerBlockers,
    backendBusinessRoomContract: synced.integration.backendBusinessRoomContract,
    realtimeBusinessProvider: synced.integration.realtimeBusinessProvider,
    mediaBusinessProvider: synced.integration.mediaBusinessProvider,
    adminBusinessReview: synced.integration.adminBusinessReview,
    paymentsAllowedNow: false,
    giftsAllowedNow: false,
    monetizationAllowedNow: false,
    walletBridgeRequiredNow: false,
    fakeBusinessLaunchAllowed: false,
    fakePaymentAllowed: false,
    fakeGiftAllowed: false,
    fakeMonetizationAllowed: false,
    businessStreamLocalSmokeReady,
    shortsPhaseCanStartAfterOwnerDecision: businessStreamLocalSmokeReady && synced.shortsHandoffReviewedLocal,
  };
}
