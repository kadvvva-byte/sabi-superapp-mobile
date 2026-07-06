import type { StreamRoomRuntimeState } from "./streamRoomRuntime";
import { enqueueLocalStreamRoomEvent, type StreamRoomEventQueueRuntimeState } from "./streamRoomEventQueueRuntime";
import type { StreamBusinessPrelaunchAcceptanceRuntimeState } from "./streamBusinessPrelaunchAcceptanceRuntime";

export type StreamBusinessHandoffEvidenceStatus =
  | "not_started_local"
  | "collecting_local"
  | "blocked_local"
  | "handoff_ready_local"
  | "provider_admin_handoff_blocked";

export type StreamBusinessHandoffEvidenceSectionId =
  | "business_prelaunch_acceptance"
  | "local_event_queue_evidence"
  | "business_safety_handoff"
  | "backend_union_contract"
  | "media_realtime_provider_contracts"
  | "admin_review_contract";

export type StreamBusinessHandoffEvidenceSectionStatus = "pending_local" | "reviewed_local" | "blocked_local" | "provider_required";

export type StreamBusinessHandoffEvidenceBlockerCode =
  | "business_prelaunch_evidence_required"
  | "local_event_queue_evidence_required"
  | "handoff_summary_review_required"
  | "technical_evidence_review_required"
  | "provider_admin_blockers_review_required"
  | "final_handoff_notes_required"
  | "business_handoff_event_required"
  | "backend_business_stream_contract_required"
  | "realtime_business_stream_provider_required"
  | "media_business_stream_provider_required"
  | "admin_business_stream_review_required"
  | "fake_business_launch_forbidden"
  | "fake_payment_forbidden"
  | "fake_gift_forbidden"
  | "fake_monetization_forbidden";

export type StreamBusinessHandoffEvidenceSection = {
  readonly id: StreamBusinessHandoffEvidenceSectionId;
  readonly title: string;
  readonly purpose: string;
  readonly status: StreamBusinessHandoffEvidenceSectionStatus;
  readonly blockers: readonly StreamBusinessHandoffEvidenceBlockerCode[];
  readonly reviewedLocal: boolean;
  readonly providerRequired: boolean;
  readonly deliveredToBackend: false;
};

export type StreamBusinessHandoffEvidenceIntegration = {
  readonly backendBusinessStreamContract: "not_connected" | "connected";
  readonly realtimeBusinessStreamProvider: "not_configured" | "configured";
  readonly mediaBusinessStreamProvider: "not_configured" | "configured";
  readonly adminBusinessStreamReview: "not_connected" | "connected";
  readonly paymentsAllowedNow: false;
  readonly giftsAllowedNow: false;
  readonly monetizationAllowedNow: false;
  readonly walletBridgeRequiredNow: false;
  readonly fakeBusinessLaunchAllowed: false;
  readonly fakePaymentAllowed: false;
  readonly fakeGiftAllowed: false;
  readonly fakeMonetizationAllowed: false;
};

export type StreamBusinessHandoffEvidenceRuntimeState = {
  readonly version: "STREAM-109T";
  readonly roomId: string;
  readonly status: StreamBusinessHandoffEvidenceStatus;
  readonly selectedSectionId: StreamBusinessHandoffEvidenceSectionId;
  readonly sections: readonly StreamBusinessHandoffEvidenceSection[];
  readonly handoffSummaryReviewedLocal: boolean;
  readonly technicalEvidenceReviewedLocal: boolean;
  readonly providerAdminBlockersReviewedLocal: boolean;
  readonly finalHandoffNotesPreparedLocal: boolean;
  readonly queuedHandoffEvidenceEvents: number;
  readonly providerAdminHandoffRequestedLocal: boolean;
  readonly localBlockers: readonly StreamBusinessHandoffEvidenceBlockerCode[];
  readonly providerBlockers: readonly StreamBusinessHandoffEvidenceBlockerCode[];
  readonly integration: StreamBusinessHandoffEvidenceIntegration;
  readonly updatedAt: string;
};

export type StreamBusinessHandoffEvidenceSnapshot = {
  readonly version: "STREAM-109T";
  readonly roomId: string;
  readonly status: StreamBusinessHandoffEvidenceStatus;
  readonly selectedSectionId: StreamBusinessHandoffEvidenceSectionId;
  readonly selectedSectionStatus: StreamBusinessHandoffEvidenceSectionStatus;
  readonly totalSections: number;
  readonly reviewedLocalSections: number;
  readonly blockedLocalSections: number;
  readonly providerRequiredSections: number;
  readonly handoffSummaryReviewedLocal: boolean;
  readonly technicalEvidenceReviewedLocal: boolean;
  readonly providerAdminBlockersReviewedLocal: boolean;
  readonly finalHandoffNotesPreparedLocal: boolean;
  readonly queuedHandoffEvidenceEvents: number;
  readonly providerAdminHandoffRequestedLocal: boolean;
  readonly businessPrelaunchStatus: StreamBusinessPrelaunchAcceptanceRuntimeState["status"];
  readonly businessPrelaunchReadyForBackendUnion: boolean;
  readonly businessPrelaunchQueuedEvents: number;
  readonly localRoomEvents: number;
  readonly localBlockers: readonly StreamBusinessHandoffEvidenceBlockerCode[];
  readonly providerBlockers: readonly StreamBusinessHandoffEvidenceBlockerCode[];
  readonly backendBusinessStreamContract: StreamBusinessHandoffEvidenceIntegration["backendBusinessStreamContract"];
  readonly realtimeBusinessStreamProvider: StreamBusinessHandoffEvidenceIntegration["realtimeBusinessStreamProvider"];
  readonly mediaBusinessStreamProvider: StreamBusinessHandoffEvidenceIntegration["mediaBusinessStreamProvider"];
  readonly adminBusinessStreamReview: StreamBusinessHandoffEvidenceIntegration["adminBusinessStreamReview"];
  readonly paymentsAllowedNow: false;
  readonly giftsAllowedNow: false;
  readonly monetizationAllowedNow: false;
  readonly walletBridgeRequiredNow: false;
  readonly fakeBusinessLaunchAllowed: false;
  readonly fakePaymentAllowed: false;
  readonly fakeGiftAllowed: false;
  readonly fakeMonetizationAllowed: false;
  readonly readyForBackendUnion: boolean;
};

function nowIso(now?: Date | string | number): string {
  if (now instanceof Date) return now.toISOString();
  if (typeof now === "string") return new Date(now).toISOString();
  if (typeof now === "number") return new Date(now).toISOString();
  return new Date().toISOString();
}

function defaultIntegration(): StreamBusinessHandoffEvidenceIntegration {
  return {
    backendBusinessStreamContract: "not_connected",
    realtimeBusinessStreamProvider: "not_configured",
    mediaBusinessStreamProvider: "not_configured",
    adminBusinessStreamReview: "not_connected",
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

function providerBlockers(): readonly StreamBusinessHandoffEvidenceBlockerCode[] {
  return [
    "backend_business_stream_contract_required",
    "realtime_business_stream_provider_required",
    "media_business_stream_provider_required",
    "admin_business_stream_review_required",
    "fake_business_launch_forbidden",
    "fake_payment_forbidden",
    "fake_gift_forbidden",
    "fake_monetization_forbidden",
  ];
}

function isPrelaunchReady(prelaunch: StreamBusinessPrelaunchAcceptanceRuntimeState): boolean {
  return (
    prelaunch.localBlockers.length === 0 &&
    prelaunch.queuedBusinessPrelaunchEvents > 0 &&
    prelaunch.ownerPrelaunchAcknowledgedLocal &&
    prelaunch.launchRiskAcknowledgedLocal &&
    prelaunch.businessHandoffNotesPreparedLocal
  );
}

function localBlockersForAll(
  state: Pick<StreamBusinessHandoffEvidenceRuntimeState, "handoffSummaryReviewedLocal" | "technicalEvidenceReviewedLocal" | "providerAdminBlockersReviewedLocal" | "finalHandoffNotesPreparedLocal" | "queuedHandoffEvidenceEvents">,
  queue: StreamRoomEventQueueRuntimeState,
  prelaunch: StreamBusinessPrelaunchAcceptanceRuntimeState,
): readonly StreamBusinessHandoffEvidenceBlockerCode[] {
  const blockers: StreamBusinessHandoffEvidenceBlockerCode[] = [];
  if (!isPrelaunchReady(prelaunch)) blockers.push("business_prelaunch_evidence_required");
  if (queue.events.length <= 0 || prelaunch.queuedBusinessPrelaunchEvents <= 0) blockers.push("local_event_queue_evidence_required");
  if (!state.handoffSummaryReviewedLocal) blockers.push("handoff_summary_review_required");
  if (!state.technicalEvidenceReviewedLocal) blockers.push("technical_evidence_review_required");
  if (!state.providerAdminBlockersReviewedLocal) blockers.push("provider_admin_blockers_review_required");
  if (!state.finalHandoffNotesPreparedLocal) blockers.push("final_handoff_notes_required");
  if (state.queuedHandoffEvidenceEvents <= 0) blockers.push("business_handoff_event_required");
  return Array.from(new Set(blockers));
}

function sectionStatus(blockers: readonly StreamBusinessHandoffEvidenceBlockerCode[], providerRequired: boolean, reviewedLocal: boolean): StreamBusinessHandoffEvidenceSectionStatus {
  if (providerRequired) return "provider_required";
  if (blockers.length > 0) return "blocked_local";
  return reviewedLocal ? "reviewed_local" : "pending_local";
}

function buildSections(
  state: Pick<StreamBusinessHandoffEvidenceRuntimeState, "handoffSummaryReviewedLocal" | "technicalEvidenceReviewedLocal" | "providerAdminBlockersReviewedLocal" | "finalHandoffNotesPreparedLocal" | "queuedHandoffEvidenceEvents" | "sections">,
  queue: StreamRoomEventQueueRuntimeState,
  prelaunch: StreamBusinessPrelaunchAcceptanceRuntimeState,
): readonly StreamBusinessHandoffEvidenceSection[] {
  const previousReviewed = new Set(state.sections.filter((section) => section.reviewedLocal).map((section) => section.id));
  const definitions: readonly {
    readonly id: StreamBusinessHandoffEvidenceSectionId;
    readonly title: string;
    readonly purpose: string;
    readonly blockers: readonly StreamBusinessHandoffEvidenceBlockerCode[];
    readonly providerRequired?: boolean;
  }[] = [
    {
      id: "business_prelaunch_acceptance",
      title: "Business prelaunch acceptance",
      purpose: "Confirm the Business Stream room, content, presenter, Q&A, compliance and scenario acceptance are ready locally.",
      blockers: isPrelaunchReady(prelaunch) ? [] : ["business_prelaunch_evidence_required"],
    },
    {
      id: "local_event_queue_evidence",
      title: "Local event queue evidence",
      purpose: "Confirm Stream events were queued locally before backend/provider handoff.",
      blockers: queue.events.length > 0 && prelaunch.queuedBusinessPrelaunchEvents > 0 ? [] : ["local_event_queue_evidence_required"],
    },
    {
      id: "business_safety_handoff",
      title: "Business safety handoff",
      purpose: "Confirm owner/risk acknowledgement, technical review, provider blocker review, and final notes.",
      blockers: [
        ...(!state.handoffSummaryReviewedLocal ? ["handoff_summary_review_required" as const] : []),
        ...(!state.technicalEvidenceReviewedLocal ? ["technical_evidence_review_required" as const] : []),
        ...(!state.providerAdminBlockersReviewedLocal ? ["provider_admin_blockers_review_required" as const] : []),
        ...(!state.finalHandoffNotesPreparedLocal ? ["final_handoff_notes_required" as const] : []),
        ...(state.queuedHandoffEvidenceEvents <= 0 ? ["business_handoff_event_required" as const] : []),
      ],
    },
    {
      id: "backend_union_contract",
      title: "Backend union contract",
      purpose: "Backend must later accept the Business Stream handoff; mobile cannot fake this.",
      blockers: [],
      providerRequired: true,
    },
    {
      id: "media_realtime_provider_contracts",
      title: "Realtime/media provider contracts",
      purpose: "Realtime and media providers must be connected later; mobile cannot fake provider-ready state.",
      blockers: [],
      providerRequired: true,
    },
    {
      id: "admin_review_contract",
      title: "Admin review contract",
      purpose: "Admin review/approval must be connected later; mobile cannot fake approval or launch.",
      blockers: [],
      providerRequired: true,
    },
  ];

  return definitions.map((item): StreamBusinessHandoffEvidenceSection => {
    const reviewedLocal = previousReviewed.has(item.id) || (item.id === "business_safety_handoff" && state.handoffSummaryReviewedLocal && state.technicalEvidenceReviewedLocal && state.providerAdminBlockersReviewedLocal && state.finalHandoffNotesPreparedLocal);
    const providerRequired = item.providerRequired ?? false;
    const blockers = Array.from(new Set(item.blockers));
    return {
      id: item.id,
      title: item.title,
      purpose: item.purpose,
      status: sectionStatus(blockers, providerRequired, reviewedLocal),
      blockers,
      reviewedLocal,
      providerRequired,
      deliveredToBackend: false,
    };
  });
}

function computeStatus(localBlockers: readonly StreamBusinessHandoffEvidenceBlockerCode[], providerRequested: boolean): StreamBusinessHandoffEvidenceStatus {
  if (providerRequested) return "provider_admin_handoff_blocked";
  if (localBlockers.length > 0) return "blocked_local";
  return "handoff_ready_local";
}

function recompute(
  state: StreamBusinessHandoffEvidenceRuntimeState,
  room: StreamRoomRuntimeState,
  queue: StreamRoomEventQueueRuntimeState,
  prelaunch: StreamBusinessPrelaunchAcceptanceRuntimeState,
  now?: Date | string | number,
): StreamBusinessHandoffEvidenceRuntimeState {
  const updatedAt = nowIso(now);
  const sections = buildSections(state, queue, prelaunch);
  const selectedSection = sections.find((section) => section.id === state.selectedSectionId) ?? sections[0];
  const localBlockers = localBlockersForAll(state, queue, prelaunch);
  return {
    ...state,
    roomId: room.roomId,
    selectedSectionId: selectedSection?.id ?? state.selectedSectionId,
    sections,
    localBlockers,
    providerBlockers: providerBlockers(),
    status: computeStatus(localBlockers, state.providerAdminHandoffRequestedLocal),
    updatedAt,
  };
}

export function createInitialStreamBusinessHandoffEvidenceState(
  room: StreamRoomRuntimeState,
  queue: StreamRoomEventQueueRuntimeState,
  prelaunch: StreamBusinessPrelaunchAcceptanceRuntimeState,
  now?: Date | string | number,
): StreamBusinessHandoffEvidenceRuntimeState {
  const updatedAt = nowIso(now);
  const base: StreamBusinessHandoffEvidenceRuntimeState = {
    version: "STREAM-109T",
    roomId: room.roomId,
    status: "not_started_local",
    selectedSectionId: "business_prelaunch_acceptance",
    sections: [],
    handoffSummaryReviewedLocal: false,
    technicalEvidenceReviewedLocal: false,
    providerAdminBlockersReviewedLocal: false,
    finalHandoffNotesPreparedLocal: false,
    queuedHandoffEvidenceEvents: 0,
    providerAdminHandoffRequestedLocal: false,
    localBlockers: [],
    providerBlockers: providerBlockers(),
    integration: defaultIntegration(),
    updatedAt,
  };
  return recompute(base, room, queue, prelaunch, updatedAt);
}

export function syncStreamBusinessHandoffEvidenceState(
  state: StreamBusinessHandoffEvidenceRuntimeState,
  room: StreamRoomRuntimeState,
  queue: StreamRoomEventQueueRuntimeState,
  prelaunch: StreamBusinessPrelaunchAcceptanceRuntimeState,
): StreamBusinessHandoffEvidenceRuntimeState {
  return recompute(state, room, queue, prelaunch);
}

export function selectNextStreamBusinessHandoffSectionLocal(state: StreamBusinessHandoffEvidenceRuntimeState): StreamBusinessHandoffEvidenceRuntimeState {
  const index = state.sections.findIndex((section) => section.id === state.selectedSectionId);
  const next = state.sections[(index + 1) % Math.max(1, state.sections.length)] ?? state.sections[0];
  return { ...state, selectedSectionId: next?.id ?? state.selectedSectionId, updatedAt: nowIso() };
}

export function markSelectedStreamBusinessHandoffSectionReviewedLocal(state: StreamBusinessHandoffEvidenceRuntimeState): StreamBusinessHandoffEvidenceRuntimeState {
  const sections = state.sections.map((section): StreamBusinessHandoffEvidenceSection =>
    section.id === state.selectedSectionId && section.status !== "provider_required" && section.blockers.length === 0
      ? { ...section, reviewedLocal: true, status: "reviewed_local" }
      : section,
  );
  const selectedId = state.selectedSectionId;
  return {
    ...state,
    sections,
    handoffSummaryReviewedLocal: state.handoffSummaryReviewedLocal || selectedId === "business_prelaunch_acceptance" || selectedId === "business_safety_handoff",
    technicalEvidenceReviewedLocal: state.technicalEvidenceReviewedLocal || selectedId === "local_event_queue_evidence" || selectedId === "business_safety_handoff",
    providerAdminBlockersReviewedLocal: state.providerAdminBlockersReviewedLocal || selectedId === "backend_union_contract" || selectedId === "media_realtime_provider_contracts" || selectedId === "admin_review_contract" || selectedId === "business_safety_handoff",
    updatedAt: nowIso(),
  };
}

export function prepareStreamBusinessFinalHandoffNotesLocal(state: StreamBusinessHandoffEvidenceRuntimeState): StreamBusinessHandoffEvidenceRuntimeState {
  return {
    ...state,
    handoffSummaryReviewedLocal: true,
    technicalEvidenceReviewedLocal: true,
    providerAdminBlockersReviewedLocal: true,
    finalHandoffNotesPreparedLocal: true,
    updatedAt: nowIso(),
  };
}

export function runStreamBusinessHandoffEvidenceCleanup(
  state: StreamBusinessHandoffEvidenceRuntimeState,
  room: StreamRoomRuntimeState,
  queue: StreamRoomEventQueueRuntimeState,
  prelaunch: StreamBusinessPrelaunchAcceptanceRuntimeState,
): StreamBusinessHandoffEvidenceRuntimeState {
  return recompute(state, room, queue, prelaunch);
}

export function queueStreamBusinessHandoffEvidenceEvent(
  state: StreamBusinessHandoffEvidenceRuntimeState,
  queue: StreamRoomEventQueueRuntimeState,
  room: StreamRoomRuntimeState,
  prelaunch: StreamBusinessPrelaunchAcceptanceRuntimeState,
): { readonly state: StreamBusinessHandoffEvidenceRuntimeState; readonly eventQueue: StreamRoomEventQueueRuntimeState } {
  const recomputed = recompute(state, room, queue, prelaunch);
  const selected = recomputed.sections.find((section) => section.id === recomputed.selectedSectionId) ?? recomputed.sections[0];
  const nextQueue = enqueueLocalStreamRoomEvent(queue, room, {
    kind: "provider_handoff_request",
    label: `Business handoff evidence: ${selected?.title ?? "summary"}`,
    priority: recomputed.localBlockers.length > 0 ? "high" : "critical",
    payload: {
      handoffSectionId: selected?.id ?? "business_prelaunch_acceptance",
      status: recomputed.status,
      businessPrelaunchStatus: prelaunch.status,
      businessPrelaunchEvents: prelaunch.queuedBusinessPrelaunchEvents,
      localBlockers: recomputed.localBlockers.length,
      providerBlockers: recomputed.providerBlockers.length,
      finalNotesPrepared: recomputed.finalHandoffNotesPreparedLocal,
      paymentsAllowedNow: false,
      giftsAllowedNow: false,
      monetizationAllowedNow: false,
      fakeBusinessLaunchAllowed: false,
    },
  });
  return {
    state: recompute({ ...recomputed, queuedHandoffEvidenceEvents: recomputed.queuedHandoffEvidenceEvents + 1 }, room, nextQueue, prelaunch),
    eventQueue: nextQueue,
  };
}

export function requestStreamBusinessHandoffProviderAdminBlocked(
  state: StreamBusinessHandoffEvidenceRuntimeState,
  room: StreamRoomRuntimeState,
  queue: StreamRoomEventQueueRuntimeState,
  prelaunch: StreamBusinessPrelaunchAcceptanceRuntimeState,
): StreamBusinessHandoffEvidenceRuntimeState {
  return recompute({ ...state, providerAdminHandoffRequestedLocal: true }, room, queue, prelaunch);
}

export function buildStreamBusinessHandoffEvidenceSnapshot(
  state: StreamBusinessHandoffEvidenceRuntimeState,
  room: StreamRoomRuntimeState,
  queue: StreamRoomEventQueueRuntimeState,
  prelaunch: StreamBusinessPrelaunchAcceptanceRuntimeState,
): StreamBusinessHandoffEvidenceSnapshot {
  const synced = recompute(state, room, queue, prelaunch);
  const selected = synced.sections.find((section) => section.id === synced.selectedSectionId) ?? synced.sections[0];
  const reviewedLocalSections = synced.sections.filter((section) => section.status === "reviewed_local").length;
  const blockedLocalSections = synced.sections.filter((section) => section.status === "blocked_local").length;
  const providerRequiredSections = synced.sections.filter((section) => section.status === "provider_required").length;
  const prelaunchReady = isPrelaunchReady(prelaunch);
  const readyForBackendUnion = synced.localBlockers.length === 0 && synced.queuedHandoffEvidenceEvents > 0 && prelaunchReady;
  return {
    version: "STREAM-109T",
    roomId: synced.roomId,
    status: synced.status,
    selectedSectionId: synced.selectedSectionId,
    selectedSectionStatus: selected?.status ?? "pending_local",
    totalSections: synced.sections.length,
    reviewedLocalSections,
    blockedLocalSections,
    providerRequiredSections,
    handoffSummaryReviewedLocal: synced.handoffSummaryReviewedLocal,
    technicalEvidenceReviewedLocal: synced.technicalEvidenceReviewedLocal,
    providerAdminBlockersReviewedLocal: synced.providerAdminBlockersReviewedLocal,
    finalHandoffNotesPreparedLocal: synced.finalHandoffNotesPreparedLocal,
    queuedHandoffEvidenceEvents: synced.queuedHandoffEvidenceEvents,
    providerAdminHandoffRequestedLocal: synced.providerAdminHandoffRequestedLocal,
    businessPrelaunchStatus: prelaunch.status,
    businessPrelaunchReadyForBackendUnion: prelaunchReady,
    businessPrelaunchQueuedEvents: prelaunch.queuedBusinessPrelaunchEvents,
    localRoomEvents: queue.events.length,
    localBlockers: synced.localBlockers,
    providerBlockers: synced.providerBlockers,
    backendBusinessStreamContract: synced.integration.backendBusinessStreamContract,
    realtimeBusinessStreamProvider: synced.integration.realtimeBusinessStreamProvider,
    mediaBusinessStreamProvider: synced.integration.mediaBusinessStreamProvider,
    adminBusinessStreamReview: synced.integration.adminBusinessStreamReview,
    paymentsAllowedNow: false,
    giftsAllowedNow: false,
    monetizationAllowedNow: false,
    walletBridgeRequiredNow: false,
    fakeBusinessLaunchAllowed: false,
    fakePaymentAllowed: false,
    fakeGiftAllowed: false,
    fakeMonetizationAllowed: false,
    readyForBackendUnion,
  };
}
