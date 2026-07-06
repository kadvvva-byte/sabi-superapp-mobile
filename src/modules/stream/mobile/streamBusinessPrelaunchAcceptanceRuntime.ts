import type { StreamRoomRuntimeState } from "./streamRoomRuntime";
import type { StreamRoomStageRuntimeState } from "./streamRoomStageRuntime";
import type { StreamRoomEventQueueRuntimeState } from "./streamRoomEventQueueRuntime";
import { enqueueLocalStreamRoomEvent } from "./streamRoomEventQueueRuntime";
import type { StreamScenarioAcceptanceRuntimeState } from "./streamRoomScenarioAcceptanceRuntime";
import type { StreamBusinessStreamReadinessRuntimeState } from "./streamBusinessStreamReadinessRuntime";
import type { StreamBusinessRoomControlsRuntimeState } from "./streamBusinessRoomControlsRuntime";
import type { StreamBusinessShowcaseContentRuntimeState } from "./streamBusinessShowcaseContentRuntime";
import type { StreamBusinessPresenterSequenceRuntimeState } from "./streamBusinessPresenterSequenceRuntime";
import type { StreamBusinessAudienceQaRuntimeState } from "./streamBusinessAudienceQaRuntime";
import type { StreamBusinessModerationComplianceRuntimeState } from "./streamBusinessModerationComplianceRuntime";

export type StreamBusinessPrelaunchAcceptanceStatus =
  | "not_started_local"
  | "checking_local"
  | "blocked_local"
  | "business_prelaunch_ready_local"
  | "provider_handoff_blocked";

export type StreamBusinessPrelaunchCheckpointId =
  | "business_room_readiness"
  | "business_room_controls"
  | "business_showcase_content"
  | "business_presenter_sequence"
  | "business_audience_qa"
  | "business_compliance_final_pass"
  | "business_scenario_acceptance"
  | "business_local_event_queue"
  | "business_provider_handoff";

export type StreamBusinessPrelaunchCheckpointStatus =
  | "pending_local"
  | "ready_local"
  | "blocked_local"
  | "provider_required";

export type StreamBusinessPrelaunchBlockerCode =
  | "business_room_required"
  | "business_readiness_required"
  | "business_controls_required"
  | "business_content_required"
  | "business_presenter_sequence_required"
  | "business_audience_qa_required"
  | "business_compliance_required"
  | "business_scenario_acceptance_required"
  | "business_prelaunch_owner_ack_required"
  | "business_prelaunch_event_required"
  | "backend_business_prelaunch_contract_required"
  | "realtime_business_prelaunch_provider_required"
  | "media_business_prelaunch_provider_required"
  | "admin_business_prelaunch_review_required"
  | "fake_business_prelaunch_forbidden"
  | "fake_business_launch_forbidden"
  | "fake_payment_forbidden"
  | "fake_gift_forbidden"
  | "fake_monetization_forbidden";

export type StreamBusinessPrelaunchCheckpoint = {
  readonly id: StreamBusinessPrelaunchCheckpointId;
  readonly title: string;
  readonly purpose: string;
  readonly status: StreamBusinessPrelaunchCheckpointStatus;
  readonly blockers: readonly StreamBusinessPrelaunchBlockerCode[];
  readonly readyLocal: boolean;
  readonly providerRequired: boolean;
  readonly localOnly: true;
  readonly deliveredToBackend: false;
};

export type StreamBusinessPrelaunchIntegration = {
  readonly backendBusinessPrelaunchContract: "not_connected" | "connected";
  readonly realtimeBusinessPrelaunchProvider: "not_configured" | "configured";
  readonly mediaBusinessPrelaunchProvider: "not_configured" | "configured";
  readonly adminBusinessPrelaunchReview: "not_connected" | "connected";
  readonly paymentsAllowedNow: false;
  readonly giftsAllowedNow: false;
  readonly monetizationAllowedNow: false;
  readonly walletBridgeRequiredNow: false;
  readonly fakeBusinessPrelaunchAllowed: false;
  readonly fakeBusinessLaunchAllowed: false;
  readonly fakePaymentAllowed: false;
  readonly fakeGiftAllowed: false;
  readonly fakeMonetizationAllowed: false;
};

export type StreamBusinessPrelaunchAcceptanceRuntimeState = {
  readonly version: "STREAM-109S";
  readonly roomId: string;
  readonly status: StreamBusinessPrelaunchAcceptanceStatus;
  readonly selectedCheckpointId: StreamBusinessPrelaunchCheckpointId;
  readonly checkpoints: readonly StreamBusinessPrelaunchCheckpoint[];
  readonly ownerPrelaunchAcknowledgedLocal: boolean;
  readonly launchRiskAcknowledgedLocal: boolean;
  readonly businessHandoffNotesPreparedLocal: boolean;
  readonly queuedBusinessPrelaunchEvents: number;
  readonly providerPrelaunchHandoffRequestedLocal: boolean;
  readonly localBlockers: readonly StreamBusinessPrelaunchBlockerCode[];
  readonly providerBlockers: readonly StreamBusinessPrelaunchBlockerCode[];
  readonly integration: StreamBusinessPrelaunchIntegration;
  readonly updatedAt: string;
};

export type StreamBusinessPrelaunchAcceptanceEvidenceSnapshot = {
  readonly version: "STREAM-109S";
  readonly roomId: string;
  readonly status: StreamBusinessPrelaunchAcceptanceStatus;
  readonly selectedCheckpointId: StreamBusinessPrelaunchCheckpointId;
  readonly selectedCheckpointStatus: StreamBusinessPrelaunchCheckpointStatus;
  readonly totalCheckpoints: number;
  readonly readyLocalCheckpoints: number;
  readonly blockedLocalCheckpoints: number;
  readonly providerRequiredCheckpoints: number;
  readonly ownerPrelaunchAcknowledgedLocal: boolean;
  readonly launchRiskAcknowledgedLocal: boolean;
  readonly businessHandoffNotesPreparedLocal: boolean;
  readonly queuedBusinessPrelaunchEvents: number;
  readonly providerPrelaunchHandoffRequestedLocal: boolean;
  readonly businessRoomReady: boolean;
  readonly businessControlsReady: boolean;
  readonly businessContentReady: boolean;
  readonly businessPresenterReady: boolean;
  readonly businessAudienceQaReady: boolean;
  readonly businessComplianceReady: boolean;
  readonly businessScenarioAcceptanceReady: boolean;
  readonly localBlockers: readonly StreamBusinessPrelaunchBlockerCode[];
  readonly providerBlockers: readonly StreamBusinessPrelaunchBlockerCode[];
  readonly backendBusinessPrelaunchContract: StreamBusinessPrelaunchIntegration["backendBusinessPrelaunchContract"];
  readonly realtimeBusinessPrelaunchProvider: StreamBusinessPrelaunchIntegration["realtimeBusinessPrelaunchProvider"];
  readonly mediaBusinessPrelaunchProvider: StreamBusinessPrelaunchIntegration["mediaBusinessPrelaunchProvider"];
  readonly adminBusinessPrelaunchReview: StreamBusinessPrelaunchIntegration["adminBusinessPrelaunchReview"];
  readonly paymentsAllowedNow: false;
  readonly giftsAllowedNow: false;
  readonly monetizationAllowedNow: false;
  readonly walletBridgeRequiredNow: false;
  readonly fakeBusinessPrelaunchAllowed: false;
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

function defaultIntegration(): StreamBusinessPrelaunchIntegration {
  return {
    backendBusinessPrelaunchContract: "not_connected",
    realtimeBusinessPrelaunchProvider: "not_configured",
    mediaBusinessPrelaunchProvider: "not_configured",
    adminBusinessPrelaunchReview: "not_connected",
    paymentsAllowedNow: false,
    giftsAllowedNow: false,
    monetizationAllowedNow: false,
    walletBridgeRequiredNow: false,
    fakeBusinessPrelaunchAllowed: false,
    fakeBusinessLaunchAllowed: false,
    fakePaymentAllowed: false,
    fakeGiftAllowed: false,
    fakeMonetizationAllowed: false,
  };
}

function providerBlockers(): readonly StreamBusinessPrelaunchBlockerCode[] {
  return [
    "backend_business_prelaunch_contract_required",
    "realtime_business_prelaunch_provider_required",
    "media_business_prelaunch_provider_required",
    "admin_business_prelaunch_review_required",
    "fake_business_prelaunch_forbidden",
    "fake_business_launch_forbidden",
    "fake_payment_forbidden",
    "fake_gift_forbidden",
    "fake_monetization_forbidden",
  ];
}

function isBusinessRoomReady(room: StreamRoomRuntimeState, stage: StreamRoomStageRuntimeState): boolean {
  return room.mode === "businessLive" && room.visibility === "business_only" && stage.layout === "business_showcase";
}

function localBlockersForAll(
  room: StreamRoomRuntimeState,
  stage: StreamRoomStageRuntimeState,
  acceptance: StreamScenarioAcceptanceRuntimeState,
  readiness: StreamBusinessStreamReadinessRuntimeState,
  controls: StreamBusinessRoomControlsRuntimeState,
  content: StreamBusinessShowcaseContentRuntimeState,
  presenter: StreamBusinessPresenterSequenceRuntimeState,
  audienceQa: StreamBusinessAudienceQaRuntimeState,
  compliance: StreamBusinessModerationComplianceRuntimeState,
  state: Pick<StreamBusinessPrelaunchAcceptanceRuntimeState, "ownerPrelaunchAcknowledgedLocal" | "launchRiskAcknowledgedLocal" | "businessHandoffNotesPreparedLocal" | "queuedBusinessPrelaunchEvents">,
): readonly StreamBusinessPrelaunchBlockerCode[] {
  const blockers: StreamBusinessPrelaunchBlockerCode[] = [];
  if (!isBusinessRoomReady(room, stage)) blockers.push("business_room_required");
  if (readiness.status !== "business_room_ready_local") blockers.push("business_readiness_required");
  if (controls.status !== "business_controls_ready_local") blockers.push("business_controls_required");
  if (content.status !== "showcase_content_ready_local") blockers.push("business_content_required");
  if (presenter.status !== "sequence_ready_local") blockers.push("business_presenter_sequence_required");
  if (audienceQa.status !== "qa_ready_local") blockers.push("business_audience_qa_required");
  if (compliance.status !== "business_compliance_ready_local") blockers.push("business_compliance_required");
  if (acceptance.status !== "queued_local" && acceptance.status !== "provider_acceptance_blocked") blockers.push("business_scenario_acceptance_required");
  if (!state.ownerPrelaunchAcknowledgedLocal || !state.launchRiskAcknowledgedLocal) blockers.push("business_prelaunch_owner_ack_required");
  if (!state.businessHandoffNotesPreparedLocal || state.queuedBusinessPrelaunchEvents <= 0) blockers.push("business_prelaunch_event_required");
  return Array.from(new Set(blockers));
}

function statusForCheckpoint(blockers: readonly StreamBusinessPrelaunchBlockerCode[], providerRequired: boolean): StreamBusinessPrelaunchCheckpointStatus {
  if (providerRequired) return "provider_required";
  return blockers.length > 0 ? "blocked_local" : "ready_local";
}

function buildCheckpoints(
  room: StreamRoomRuntimeState,
  stage: StreamRoomStageRuntimeState,
  acceptance: StreamScenarioAcceptanceRuntimeState,
  readiness: StreamBusinessStreamReadinessRuntimeState,
  controls: StreamBusinessRoomControlsRuntimeState,
  content: StreamBusinessShowcaseContentRuntimeState,
  presenter: StreamBusinessPresenterSequenceRuntimeState,
  audienceQa: StreamBusinessAudienceQaRuntimeState,
  compliance: StreamBusinessModerationComplianceRuntimeState,
  state: Pick<StreamBusinessPrelaunchAcceptanceRuntimeState, "ownerPrelaunchAcknowledgedLocal" | "launchRiskAcknowledgedLocal" | "businessHandoffNotesPreparedLocal" | "queuedBusinessPrelaunchEvents">,
): readonly StreamBusinessPrelaunchCheckpoint[] {
  const definitions: readonly { readonly id: StreamBusinessPrelaunchCheckpointId; readonly title: string; readonly purpose: string; readonly blockers: readonly StreamBusinessPrelaunchBlockerCode[]; readonly providerRequired?: boolean }[] = [
    { id: "business_room_readiness", title: "Business room readiness", purpose: "Business Stream mode, business-only visibility and showcase layout must be local-ready.", blockers: isBusinessRoomReady(room, stage) && readiness.status === "business_room_ready_local" ? [] : ["business_room_required", "business_readiness_required"] },
    { id: "business_room_controls", title: "Business controls", purpose: "Showcase rails, business roles, compliance and moderation controls must be local-ready.", blockers: controls.status === "business_controls_ready_local" ? [] : ["business_controls_required"] },
    { id: "business_showcase_content", title: "Business showcase content", purpose: "Business showcase content cards and compliance evidence must be local-ready.", blockers: content.status === "showcase_content_ready_local" ? [] : ["business_content_required"] },
    { id: "business_presenter_sequence", title: "Presenter sequence", purpose: "Presenter flow and compliance checkpoints must be local-ready.", blockers: presenter.status === "sequence_ready_local" ? [] : ["business_presenter_sequence_required"] },
    { id: "business_audience_qa", title: "Audience Q&A", purpose: "Audience Q&A moderation and compliance review must be local-ready.", blockers: audienceQa.status === "qa_ready_local" ? [] : ["business_audience_qa_required"] },
    { id: "business_compliance_final_pass", title: "Compliance final pass", purpose: "Business safety, disclosure, Q&A safety and moderation review must be ready.", blockers: compliance.status === "business_compliance_ready_local" ? [] : ["business_compliance_required"] },
    { id: "business_scenario_acceptance", title: "Scenario acceptance", purpose: "Business Stream scenario acceptance must be queued locally before provider handoff.", blockers: acceptance.status === "queued_local" || acceptance.status === "provider_acceptance_blocked" ? [] : ["business_scenario_acceptance_required"] },
    { id: "business_local_event_queue", title: "Local handoff event", purpose: "Owner acknowledgement, risk acknowledgement, handoff notes and local event evidence are required.", blockers: state.ownerPrelaunchAcknowledgedLocal && state.launchRiskAcknowledgedLocal && state.businessHandoffNotesPreparedLocal && state.queuedBusinessPrelaunchEvents > 0 ? [] : ["business_prelaunch_owner_ack_required", "business_prelaunch_event_required"] },
    { id: "business_provider_handoff", title: "Provider/Admin handoff", purpose: "Future backend/realtime/media/Admin handoff stays blocked until real contracts are connected.", blockers: state.queuedBusinessPrelaunchEvents > 0 ? [] : ["business_prelaunch_event_required"], providerRequired: true },
  ];
  return definitions.map((item): StreamBusinessPrelaunchCheckpoint => {
    const blockers = Array.from(new Set(item.blockers));
    const providerRequired = item.providerRequired ?? false;
    return {
      id: item.id,
      title: item.title,
      purpose: item.purpose,
      status: statusForCheckpoint(blockers, providerRequired),
      blockers,
      readyLocal: blockers.length === 0,
      providerRequired,
      localOnly: true,
      deliveredToBackend: false,
    };
  });
}

function computeStatus(localBlockers: readonly StreamBusinessPrelaunchBlockerCode[], queuedEvents: number, providerRequested: boolean): StreamBusinessPrelaunchAcceptanceStatus {
  if (providerRequested) return "provider_handoff_blocked";
  if (localBlockers.length > 0) return "blocked_local";
  if (queuedEvents > 0) return "business_prelaunch_ready_local";
  return "checking_local";
}

function recompute(
  state: StreamBusinessPrelaunchAcceptanceRuntimeState,
  room: StreamRoomRuntimeState,
  stage: StreamRoomStageRuntimeState,
  acceptance: StreamScenarioAcceptanceRuntimeState,
  readiness: StreamBusinessStreamReadinessRuntimeState,
  controls: StreamBusinessRoomControlsRuntimeState,
  content: StreamBusinessShowcaseContentRuntimeState,
  presenter: StreamBusinessPresenterSequenceRuntimeState,
  audienceQa: StreamBusinessAudienceQaRuntimeState,
  compliance: StreamBusinessModerationComplianceRuntimeState,
  now?: Date | string | number,
): StreamBusinessPrelaunchAcceptanceRuntimeState {
  const updatedAt = nowIso(now);
  const checkpoints = buildCheckpoints(room, stage, acceptance, readiness, controls, content, presenter, audienceQa, compliance, state);
  const selectedCheckpoint = checkpoints.find((checkpoint) => checkpoint.id === state.selectedCheckpointId) ?? checkpoints[0];
  const localBlockers = localBlockersForAll(room, stage, acceptance, readiness, controls, content, presenter, audienceQa, compliance, state);
  const status = computeStatus(localBlockers, state.queuedBusinessPrelaunchEvents, state.providerPrelaunchHandoffRequestedLocal);
  return {
    ...state,
    roomId: room.roomId,
    status,
    selectedCheckpointId: selectedCheckpoint.id,
    checkpoints,
    localBlockers,
    providerBlockers: providerBlockers(),
    updatedAt,
  };
}

export function createInitialStreamBusinessPrelaunchAcceptanceState(
  room: StreamRoomRuntimeState,
  stage: StreamRoomStageRuntimeState,
  acceptance: StreamScenarioAcceptanceRuntimeState,
  readiness: StreamBusinessStreamReadinessRuntimeState,
  controls: StreamBusinessRoomControlsRuntimeState,
  content: StreamBusinessShowcaseContentRuntimeState,
  presenter: StreamBusinessPresenterSequenceRuntimeState,
  audienceQa: StreamBusinessAudienceQaRuntimeState,
  compliance: StreamBusinessModerationComplianceRuntimeState,
  now?: Date | string | number,
): StreamBusinessPrelaunchAcceptanceRuntimeState {
  const updatedAt = nowIso(now);
  const base: StreamBusinessPrelaunchAcceptanceRuntimeState = {
    version: "STREAM-109S",
    roomId: room.roomId,
    status: "not_started_local",
    selectedCheckpointId: "business_room_readiness",
    checkpoints: [],
    ownerPrelaunchAcknowledgedLocal: false,
    launchRiskAcknowledgedLocal: false,
    businessHandoffNotesPreparedLocal: false,
    queuedBusinessPrelaunchEvents: 0,
    providerPrelaunchHandoffRequestedLocal: false,
    localBlockers: [],
    providerBlockers: providerBlockers(),
    integration: defaultIntegration(),
    updatedAt,
  };
  return recompute(base, room, stage, acceptance, readiness, controls, content, presenter, audienceQa, compliance, updatedAt);
}

export function syncStreamBusinessPrelaunchAcceptanceState(
  state: StreamBusinessPrelaunchAcceptanceRuntimeState,
  room: StreamRoomRuntimeState,
  stage: StreamRoomStageRuntimeState,
  acceptance: StreamScenarioAcceptanceRuntimeState,
  readiness: StreamBusinessStreamReadinessRuntimeState,
  controls: StreamBusinessRoomControlsRuntimeState,
  content: StreamBusinessShowcaseContentRuntimeState,
  presenter: StreamBusinessPresenterSequenceRuntimeState,
  audienceQa: StreamBusinessAudienceQaRuntimeState,
  compliance: StreamBusinessModerationComplianceRuntimeState,
): StreamBusinessPrelaunchAcceptanceRuntimeState {
  return recompute(state, room, stage, acceptance, readiness, controls, content, presenter, audienceQa, compliance);
}

export function selectNextStreamBusinessPrelaunchCheckpointLocal(state: StreamBusinessPrelaunchAcceptanceRuntimeState): StreamBusinessPrelaunchAcceptanceRuntimeState {
  const index = state.checkpoints.findIndex((checkpoint) => checkpoint.id === state.selectedCheckpointId);
  const next = state.checkpoints[(index + 1) % Math.max(1, state.checkpoints.length)] ?? state.checkpoints[0];
  return { ...state, selectedCheckpointId: next?.id ?? state.selectedCheckpointId, updatedAt: nowIso() };
}

export function acknowledgeStreamBusinessPrelaunchOwnerLocal(state: StreamBusinessPrelaunchAcceptanceRuntimeState): StreamBusinessPrelaunchAcceptanceRuntimeState {
  return { ...state, ownerPrelaunchAcknowledgedLocal: true, updatedAt: nowIso() };
}

export function acknowledgeStreamBusinessPrelaunchRiskLocal(state: StreamBusinessPrelaunchAcceptanceRuntimeState): StreamBusinessPrelaunchAcceptanceRuntimeState {
  return { ...state, launchRiskAcknowledgedLocal: true, updatedAt: nowIso() };
}

export function prepareStreamBusinessHandoffNotesLocal(state: StreamBusinessPrelaunchAcceptanceRuntimeState): StreamBusinessPrelaunchAcceptanceRuntimeState {
  return { ...state, businessHandoffNotesPreparedLocal: true, updatedAt: nowIso() };
}

export function runStreamBusinessPrelaunchAcceptanceCheck(
  state: StreamBusinessPrelaunchAcceptanceRuntimeState,
  room: StreamRoomRuntimeState,
  stage: StreamRoomStageRuntimeState,
  acceptance: StreamScenarioAcceptanceRuntimeState,
  readiness: StreamBusinessStreamReadinessRuntimeState,
  controls: StreamBusinessRoomControlsRuntimeState,
  content: StreamBusinessShowcaseContentRuntimeState,
  presenter: StreamBusinessPresenterSequenceRuntimeState,
  audienceQa: StreamBusinessAudienceQaRuntimeState,
  compliance: StreamBusinessModerationComplianceRuntimeState,
): StreamBusinessPrelaunchAcceptanceRuntimeState {
  return recompute(state, room, stage, acceptance, readiness, controls, content, presenter, audienceQa, compliance);
}

export function queueStreamBusinessPrelaunchAcceptanceEvent(
  state: StreamBusinessPrelaunchAcceptanceRuntimeState,
  queue: StreamRoomEventQueueRuntimeState,
  room: StreamRoomRuntimeState,
  stage: StreamRoomStageRuntimeState,
  acceptance: StreamScenarioAcceptanceRuntimeState,
  readiness: StreamBusinessStreamReadinessRuntimeState,
  controls: StreamBusinessRoomControlsRuntimeState,
  content: StreamBusinessShowcaseContentRuntimeState,
  presenter: StreamBusinessPresenterSequenceRuntimeState,
  audienceQa: StreamBusinessAudienceQaRuntimeState,
  compliance: StreamBusinessModerationComplianceRuntimeState,
): { readonly state: StreamBusinessPrelaunchAcceptanceRuntimeState; readonly eventQueue: StreamRoomEventQueueRuntimeState } {
  const recomputed = recompute(state, room, stage, acceptance, readiness, controls, content, presenter, audienceQa, compliance);
  const checkpoint = recomputed.checkpoints.find((item) => item.id === recomputed.selectedCheckpointId) ?? recomputed.checkpoints[0];
  const nextQueue = enqueueLocalStreamRoomEvent(queue, room, {
    kind: "provider_handoff_request",
    label: `Business prelaunch acceptance: ${checkpoint?.title ?? "handoff"}`,
    priority: recomputed.localBlockers.length > 0 ? "high" : "critical",
    payload: {
      checkpointId: checkpoint?.id ?? "business_provider_handoff",
      status: recomputed.status,
      businessMode: room.mode,
      layout: stage.layout,
      localBlockers: recomputed.localBlockers.length,
      providerBlockers: recomputed.providerBlockers.length,
      ownerAck: recomputed.ownerPrelaunchAcknowledgedLocal,
      riskAck: recomputed.launchRiskAcknowledgedLocal,
      paymentsAllowedNow: false,
      giftsAllowedNow: false,
      monetizationAllowedNow: false,
      fakeBusinessLaunchAllowed: false,
    },
  });
  return {
    state: recompute({ ...recomputed, queuedBusinessPrelaunchEvents: recomputed.queuedBusinessPrelaunchEvents + 1 }, room, stage, acceptance, readiness, controls, content, presenter, audienceQa, compliance),
    eventQueue: nextQueue,
  };
}

export function requestStreamBusinessPrelaunchProviderHandoffBlocked(
  state: StreamBusinessPrelaunchAcceptanceRuntimeState,
  room: StreamRoomRuntimeState,
  stage: StreamRoomStageRuntimeState,
  acceptance: StreamScenarioAcceptanceRuntimeState,
  readiness: StreamBusinessStreamReadinessRuntimeState,
  controls: StreamBusinessRoomControlsRuntimeState,
  content: StreamBusinessShowcaseContentRuntimeState,
  presenter: StreamBusinessPresenterSequenceRuntimeState,
  audienceQa: StreamBusinessAudienceQaRuntimeState,
  compliance: StreamBusinessModerationComplianceRuntimeState,
): StreamBusinessPrelaunchAcceptanceRuntimeState {
  return recompute({ ...state, providerPrelaunchHandoffRequestedLocal: true }, room, stage, acceptance, readiness, controls, content, presenter, audienceQa, compliance);
}

export function buildStreamBusinessPrelaunchAcceptanceEvidenceSnapshot(
  state: StreamBusinessPrelaunchAcceptanceRuntimeState,
  room: StreamRoomRuntimeState,
  stage: StreamRoomStageRuntimeState,
  acceptance: StreamScenarioAcceptanceRuntimeState,
  readiness: StreamBusinessStreamReadinessRuntimeState,
  controls: StreamBusinessRoomControlsRuntimeState,
  content: StreamBusinessShowcaseContentRuntimeState,
  presenter: StreamBusinessPresenterSequenceRuntimeState,
  audienceQa: StreamBusinessAudienceQaRuntimeState,
  compliance: StreamBusinessModerationComplianceRuntimeState,
): StreamBusinessPrelaunchAcceptanceEvidenceSnapshot {
  const synced = recompute(state, room, stage, acceptance, readiness, controls, content, presenter, audienceQa, compliance);
  const selected = synced.checkpoints.find((checkpoint) => checkpoint.id === synced.selectedCheckpointId) ?? synced.checkpoints[0];
  const readyLocalCheckpoints = synced.checkpoints.filter((checkpoint) => checkpoint.status === "ready_local").length;
  const blockedLocalCheckpoints = synced.checkpoints.filter((checkpoint) => checkpoint.status === "blocked_local").length;
  const providerRequiredCheckpoints = synced.checkpoints.filter((checkpoint) => checkpoint.status === "provider_required").length;
  const readyForBackendUnion = synced.localBlockers.length === 0 && synced.queuedBusinessPrelaunchEvents > 0 && synced.ownerPrelaunchAcknowledgedLocal && synced.launchRiskAcknowledgedLocal && synced.businessHandoffNotesPreparedLocal;
  return {
    version: "STREAM-109S",
    roomId: synced.roomId,
    status: synced.status,
    selectedCheckpointId: synced.selectedCheckpointId,
    selectedCheckpointStatus: selected?.status ?? "pending_local",
    totalCheckpoints: synced.checkpoints.length,
    readyLocalCheckpoints,
    blockedLocalCheckpoints,
    providerRequiredCheckpoints,
    ownerPrelaunchAcknowledgedLocal: synced.ownerPrelaunchAcknowledgedLocal,
    launchRiskAcknowledgedLocal: synced.launchRiskAcknowledgedLocal,
    businessHandoffNotesPreparedLocal: synced.businessHandoffNotesPreparedLocal,
    queuedBusinessPrelaunchEvents: synced.queuedBusinessPrelaunchEvents,
    providerPrelaunchHandoffRequestedLocal: synced.providerPrelaunchHandoffRequestedLocal,
    businessRoomReady: isBusinessRoomReady(room, stage) && readiness.status === "business_room_ready_local",
    businessControlsReady: controls.status === "business_controls_ready_local",
    businessContentReady: content.status === "showcase_content_ready_local",
    businessPresenterReady: presenter.status === "sequence_ready_local",
    businessAudienceQaReady: audienceQa.status === "qa_ready_local",
    businessComplianceReady: compliance.status === "business_compliance_ready_local",
    businessScenarioAcceptanceReady: acceptance.status === "queued_local" || acceptance.status === "provider_acceptance_blocked",
    localBlockers: synced.localBlockers,
    providerBlockers: synced.providerBlockers,
    backendBusinessPrelaunchContract: synced.integration.backendBusinessPrelaunchContract,
    realtimeBusinessPrelaunchProvider: synced.integration.realtimeBusinessPrelaunchProvider,
    mediaBusinessPrelaunchProvider: synced.integration.mediaBusinessPrelaunchProvider,
    adminBusinessPrelaunchReview: synced.integration.adminBusinessPrelaunchReview,
    paymentsAllowedNow: false,
    giftsAllowedNow: false,
    monetizationAllowedNow: false,
    walletBridgeRequiredNow: false,
    fakeBusinessPrelaunchAllowed: false,
    fakeBusinessLaunchAllowed: false,
    fakePaymentAllowed: false,
    fakeGiftAllowed: false,
    fakeMonetizationAllowed: false,
    readyForBackendUnion,
  };
}
