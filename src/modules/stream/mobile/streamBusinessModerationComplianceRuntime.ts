import type { StreamRoomRuntimeState } from "./streamRoomRuntime";
import type { StreamRoomStageRuntimeState } from "./streamRoomStageRuntime";
import { enqueueLocalStreamRoomEvent, type StreamRoomEventQueueRuntimeState } from "./streamRoomEventQueueRuntime";
import type { StreamRoomModerationRuntimeState } from "./streamRoomModerationRuntime";
import type { StreamBusinessStreamReadinessRuntimeState } from "./streamBusinessStreamReadinessRuntime";
import type { StreamBusinessRoomControlsRuntimeState } from "./streamBusinessRoomControlsRuntime";
import type { StreamBusinessShowcaseContentRuntimeState } from "./streamBusinessShowcaseContentRuntime";
import type { StreamBusinessPresenterSequenceRuntimeState } from "./streamBusinessPresenterSequenceRuntime";
import type { StreamBusinessAudienceQaRuntimeState } from "./streamBusinessAudienceQaRuntime";

export type StreamBusinessModerationComplianceStatus =
  | "not_started_local"
  | "checking_local"
  | "blocked_local"
  | "business_compliance_ready_local"
  | "provider_compliance_blocked";

export type StreamBusinessComplianceCheckId =
  | "business_room_identity"
  | "business_controls_policy"
  | "showcase_content_review"
  | "presenter_sequence_review"
  | "audience_qa_review"
  | "room_moderation_review"
  | "provider_compliance_handoff";

export type StreamBusinessComplianceCheckStatus =
  | "pending_local"
  | "reviewed_local"
  | "blocked_local"
  | "provider_required";

export type StreamBusinessModerationComplianceBlockerCode =
  | "business_room_required"
  | "business_readiness_required"
  | "business_controls_policy_required"
  | "business_content_compliance_required"
  | "presenter_compliance_required"
  | "audience_qa_compliance_required"
  | "room_moderation_policy_required"
  | "pending_reports_review_required"
  | "local_compliance_event_required"
  | "backend_business_compliance_contract_required"
  | "realtime_business_moderation_provider_required"
  | "durable_business_moderation_store_required"
  | "admin_business_compliance_review_required"
  | "fake_business_compliance_forbidden"
  | "fake_business_launch_forbidden"
  | "fake_payment_forbidden"
  | "fake_gift_forbidden"
  | "fake_monetization_forbidden";

export type StreamBusinessComplianceCheck = {
  readonly id: StreamBusinessComplianceCheckId;
  readonly title: string;
  readonly purpose: string;
  readonly status: StreamBusinessComplianceCheckStatus;
  readonly blockers: readonly StreamBusinessModerationComplianceBlockerCode[];
  readonly reviewedLocal: boolean;
  readonly providerRequired: boolean;
  readonly localOnly: true;
  readonly deliveredToBackend: false;
};

export type StreamBusinessModerationComplianceIntegration = {
  readonly backendBusinessComplianceContract: "not_connected" | "connected";
  readonly realtimeBusinessModerationProvider: "not_configured" | "configured";
  readonly durableBusinessModerationStore: "local_memory_only" | "durable_connected";
  readonly adminBusinessComplianceReview: "not_connected" | "connected";
  readonly paymentsAllowedNow: false;
  readonly giftsAllowedNow: false;
  readonly monetizationAllowedNow: false;
  readonly walletBridgeRequiredNow: false;
  readonly fakeBusinessComplianceAllowed: false;
  readonly fakeBusinessLaunchAllowed: false;
  readonly fakePaymentAllowed: false;
  readonly fakeGiftAllowed: false;
  readonly fakeMonetizationAllowed: false;
};

export type StreamBusinessModerationComplianceRuntimeState = {
  readonly version: "STREAM-109R";
  readonly roomId: string;
  readonly status: StreamBusinessModerationComplianceStatus;
  readonly selectedCheckId: StreamBusinessComplianceCheckId;
  readonly checks: readonly StreamBusinessComplianceCheck[];
  readonly businessSafetyPolicyAcknowledgedLocal: boolean;
  readonly advertisingDisclosureAcknowledgedLocal: boolean;
  readonly qnaSafetyPolicyAcknowledgedLocal: boolean;
  readonly moderationReviewAcknowledgedLocal: boolean;
  readonly queuedBusinessComplianceEvents: number;
  readonly providerComplianceHandoffRequestedLocal: boolean;
  readonly localBlockers: readonly StreamBusinessModerationComplianceBlockerCode[];
  readonly providerBlockers: readonly StreamBusinessModerationComplianceBlockerCode[];
  readonly integration: StreamBusinessModerationComplianceIntegration;
  readonly updatedAt: string;
};

export type StreamBusinessModerationComplianceEvidenceSnapshot = {
  readonly version: "STREAM-109R";
  readonly roomId: string;
  readonly status: StreamBusinessModerationComplianceStatus;
  readonly selectedCheckId: StreamBusinessComplianceCheckId;
  readonly selectedCheckStatus: StreamBusinessComplianceCheckStatus;
  readonly totalChecks: number;
  readonly reviewedChecks: number;
  readonly blockedChecks: number;
  readonly providerRequiredChecks: number;
  readonly pendingReports: number;
  readonly hiddenComments: number;
  readonly mutedParticipants: number;
  readonly blockedParticipants: number;
  readonly businessSafetyPolicyAcknowledgedLocal: boolean;
  readonly advertisingDisclosureAcknowledgedLocal: boolean;
  readonly qnaSafetyPolicyAcknowledgedLocal: boolean;
  readonly moderationReviewAcknowledgedLocal: boolean;
  readonly queuedBusinessComplianceEvents: number;
  readonly providerComplianceHandoffRequestedLocal: boolean;
  readonly localBlockers: readonly StreamBusinessModerationComplianceBlockerCode[];
  readonly providerBlockers: readonly StreamBusinessModerationComplianceBlockerCode[];
  readonly backendBusinessComplianceContract: StreamBusinessModerationComplianceIntegration["backendBusinessComplianceContract"];
  readonly realtimeBusinessModerationProvider: StreamBusinessModerationComplianceIntegration["realtimeBusinessModerationProvider"];
  readonly durableBusinessModerationStore: StreamBusinessModerationComplianceIntegration["durableBusinessModerationStore"];
  readonly adminBusinessComplianceReview: StreamBusinessModerationComplianceIntegration["adminBusinessComplianceReview"];
  readonly paymentsAllowedNow: false;
  readonly giftsAllowedNow: false;
  readonly monetizationAllowedNow: false;
  readonly walletBridgeRequiredNow: false;
  readonly fakeBusinessComplianceAllowed: false;
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

function defaultIntegration(): StreamBusinessModerationComplianceIntegration {
  return {
    backendBusinessComplianceContract: "not_connected",
    realtimeBusinessModerationProvider: "not_configured",
    durableBusinessModerationStore: "local_memory_only",
    adminBusinessComplianceReview: "not_connected",
    paymentsAllowedNow: false,
    giftsAllowedNow: false,
    monetizationAllowedNow: false,
    walletBridgeRequiredNow: false,
    fakeBusinessComplianceAllowed: false,
    fakeBusinessLaunchAllowed: false,
    fakePaymentAllowed: false,
    fakeGiftAllowed: false,
    fakeMonetizationAllowed: false,
  };
}

function providerBlockers(): readonly StreamBusinessModerationComplianceBlockerCode[] {
  return [
    "backend_business_compliance_contract_required",
    "realtime_business_moderation_provider_required",
    "durable_business_moderation_store_required",
    "admin_business_compliance_review_required",
    "fake_business_compliance_forbidden",
    "fake_business_launch_forbidden",
    "fake_payment_forbidden",
    "fake_gift_forbidden",
    "fake_monetization_forbidden",
  ];
}

function pendingReports(moderation: StreamRoomModerationRuntimeState): number {
  return moderation.reportQueue.filter((report) => report.status === "pending_local").length;
}

function localBlockersForAll(
  room: StreamRoomRuntimeState,
  stage: StreamRoomStageRuntimeState,
  moderation: StreamRoomModerationRuntimeState,
  readiness: StreamBusinessStreamReadinessRuntimeState,
  controls: StreamBusinessRoomControlsRuntimeState,
  content: StreamBusinessShowcaseContentRuntimeState,
  presenter: StreamBusinessPresenterSequenceRuntimeState,
  audienceQa: StreamBusinessAudienceQaRuntimeState,
  state: Pick<StreamBusinessModerationComplianceRuntimeState, "businessSafetyPolicyAcknowledgedLocal" | "advertisingDisclosureAcknowledgedLocal" | "qnaSafetyPolicyAcknowledgedLocal" | "moderationReviewAcknowledgedLocal" | "queuedBusinessComplianceEvents">,
): readonly StreamBusinessModerationComplianceBlockerCode[] {
  const blockers: StreamBusinessModerationComplianceBlockerCode[] = [];
  if (room.mode !== "businessLive" || stage.layout !== "business_showcase") blockers.push("business_room_required");
  if (readiness.status !== "business_room_ready_local") blockers.push("business_readiness_required");
  if (controls.status !== "business_controls_ready_local" || !controls.businessCompliancePolicyAcknowledgedLocal || !controls.businessModerationPolicyAcknowledgedLocal) blockers.push("business_controls_policy_required");
  if (content.status !== "showcase_content_ready_local" || !content.complianceReviewPreparedLocal) blockers.push("business_content_compliance_required");
  if (presenter.status !== "sequence_ready_local" || !presenter.complianceCheckpointAcknowledgedLocal) blockers.push("presenter_compliance_required");
  if (audienceQa.status !== "qa_ready_local" || !audienceQa.audienceComplianceReviewAcknowledgedLocal) blockers.push("audience_qa_compliance_required");
  if (!state.businessSafetyPolicyAcknowledgedLocal || !state.advertisingDisclosureAcknowledgedLocal || !state.qnaSafetyPolicyAcknowledgedLocal || !state.moderationReviewAcknowledgedLocal) blockers.push("room_moderation_policy_required");
  if (pendingReports(moderation) > 0) blockers.push("pending_reports_review_required");
  if (state.queuedBusinessComplianceEvents <= 0) blockers.push("local_compliance_event_required");
  return Array.from(new Set(blockers));
}

function statusForCheck(blockers: readonly StreamBusinessModerationComplianceBlockerCode[], providerRequired: boolean): StreamBusinessComplianceCheckStatus {
  if (providerRequired) return "provider_required";
  return blockers.length > 0 ? "blocked_local" : "reviewed_local";
}

function buildChecks(
  room: StreamRoomRuntimeState,
  stage: StreamRoomStageRuntimeState,
  moderation: StreamRoomModerationRuntimeState,
  readiness: StreamBusinessStreamReadinessRuntimeState,
  controls: StreamBusinessRoomControlsRuntimeState,
  content: StreamBusinessShowcaseContentRuntimeState,
  presenter: StreamBusinessPresenterSequenceRuntimeState,
  audienceQa: StreamBusinessAudienceQaRuntimeState,
  state: Pick<StreamBusinessModerationComplianceRuntimeState, "businessSafetyPolicyAcknowledgedLocal" | "advertisingDisclosureAcknowledgedLocal" | "qnaSafetyPolicyAcknowledgedLocal" | "moderationReviewAcknowledgedLocal" | "queuedBusinessComplianceEvents">,
): readonly StreamBusinessComplianceCheck[] {
  const hasBusinessRoom = room.mode === "businessLive" && stage.layout === "business_showcase";
  const businessPolicyReady = state.businessSafetyPolicyAcknowledgedLocal && state.advertisingDisclosureAcknowledgedLocal && state.qnaSafetyPolicyAcknowledgedLocal && state.moderationReviewAcknowledgedLocal;
  const definitions: readonly { readonly id: StreamBusinessComplianceCheckId; readonly title: string; readonly purpose: string; readonly blockers: readonly StreamBusinessModerationComplianceBlockerCode[]; readonly providerRequired?: boolean }[] = [
    { id: "business_room_identity", title: "Business room identity", purpose: "Verify Business Stream mode, showcase layout, and local readiness.", blockers: hasBusinessRoom && readiness.status === "business_room_ready_local" ? [] : ["business_room_required", "business_readiness_required"] },
    { id: "business_controls_policy", title: "Business host controls policy", purpose: "Verify showcase rails, host roles, compliance and moderation controls.", blockers: controls.status === "business_controls_ready_local" && controls.businessCompliancePolicyAcknowledgedLocal && controls.businessModerationPolicyAcknowledgedLocal ? [] : ["business_controls_policy_required"] },
    { id: "showcase_content_review", title: "Showcase content review", purpose: "Verify content cards are local drafts and compliance-reviewed before future provider handoff.", blockers: content.status === "showcase_content_ready_local" && content.complianceReviewPreparedLocal ? [] : ["business_content_compliance_required"] },
    { id: "presenter_sequence_review", title: "Presenter sequence review", purpose: "Verify presenter segments and compliance checkpoint are ready locally.", blockers: presenter.status === "sequence_ready_local" && presenter.complianceCheckpointAcknowledgedLocal ? [] : ["presenter_compliance_required"] },
    { id: "audience_qa_review", title: "Audience Q&A review", purpose: "Verify Q&A moderation and compliance state before future realtime/provider integration.", blockers: audienceQa.status === "qa_ready_local" && audienceQa.audienceComplianceReviewAcknowledgedLocal ? [] : ["audience_qa_compliance_required"] },
    { id: "room_moderation_review", title: "Room moderation review", purpose: "Verify reports, muted/blocked participants and policy acknowledgements.", blockers: businessPolicyReady && pendingReports(moderation) === 0 ? [] : ["room_moderation_policy_required", ...(pendingReports(moderation) > 0 ? ["pending_reports_review_required" as const] : [])] },
    { id: "provider_compliance_handoff", title: "Provider compliance handoff", purpose: "Keep backend/provider/Admin compliance handoff blocked until real contracts exist.", blockers: state.queuedBusinessComplianceEvents > 0 ? [] : ["local_compliance_event_required"], providerRequired: true },
  ];

  return definitions.map((item): StreamBusinessComplianceCheck => {
    const blockers = Array.from(new Set(item.blockers));
    const providerRequired = item.providerRequired ?? false;
    const status = statusForCheck(blockers, providerRequired);
    return {
      id: item.id,
      title: item.title,
      purpose: item.purpose,
      status,
      blockers,
      reviewedLocal: blockers.length === 0,
      providerRequired,
      localOnly: true,
      deliveredToBackend: false,
    };
  });
}

function computeStatus(localBlockers: readonly StreamBusinessModerationComplianceBlockerCode[], queuedEvents: number, providerRequested: boolean): StreamBusinessModerationComplianceStatus {
  if (providerRequested) return "provider_compliance_blocked";
  if (localBlockers.length > 0) return "blocked_local";
  if (queuedEvents > 0) return "business_compliance_ready_local";
  return "checking_local";
}

function recompute(
  state: StreamBusinessModerationComplianceRuntimeState,
  room: StreamRoomRuntimeState,
  stage: StreamRoomStageRuntimeState,
  moderation: StreamRoomModerationRuntimeState,
  readiness: StreamBusinessStreamReadinessRuntimeState,
  controls: StreamBusinessRoomControlsRuntimeState,
  content: StreamBusinessShowcaseContentRuntimeState,
  presenter: StreamBusinessPresenterSequenceRuntimeState,
  audienceQa: StreamBusinessAudienceQaRuntimeState,
  now?: Date | string | number,
): StreamBusinessModerationComplianceRuntimeState {
  const updatedAt = nowIso(now);
  const localBlockers = localBlockersForAll(room, stage, moderation, readiness, controls, content, presenter, audienceQa, state);
  const checks = buildChecks(room, stage, moderation, readiness, controls, content, presenter, audienceQa, state);
  const selectedCheckId = checks.some((check) => check.id === state.selectedCheckId) ? state.selectedCheckId : checks[0]?.id ?? "business_room_identity";
  const status = computeStatus(localBlockers, state.queuedBusinessComplianceEvents, state.providerComplianceHandoffRequestedLocal);
  return {
    ...state,
    roomId: room.roomId,
    status,
    selectedCheckId,
    checks,
    localBlockers,
    providerBlockers: providerBlockers(),
    updatedAt,
  };
}

export function createInitialStreamBusinessModerationComplianceState(
  room: StreamRoomRuntimeState,
  stage: StreamRoomStageRuntimeState,
  moderation: StreamRoomModerationRuntimeState,
  readiness: StreamBusinessStreamReadinessRuntimeState,
  controls: StreamBusinessRoomControlsRuntimeState,
  content: StreamBusinessShowcaseContentRuntimeState,
  presenter: StreamBusinessPresenterSequenceRuntimeState,
  audienceQa: StreamBusinessAudienceQaRuntimeState,
  now?: Date | string | number,
): StreamBusinessModerationComplianceRuntimeState {
  const updatedAt = nowIso(now);
  const base: StreamBusinessModerationComplianceRuntimeState = {
    version: "STREAM-109R",
    roomId: room.roomId,
    status: "not_started_local",
    selectedCheckId: "business_room_identity",
    checks: [],
    businessSafetyPolicyAcknowledgedLocal: false,
    advertisingDisclosureAcknowledgedLocal: false,
    qnaSafetyPolicyAcknowledgedLocal: false,
    moderationReviewAcknowledgedLocal: false,
    queuedBusinessComplianceEvents: 0,
    providerComplianceHandoffRequestedLocal: false,
    localBlockers: [],
    providerBlockers: providerBlockers(),
    integration: defaultIntegration(),
    updatedAt,
  };
  return recompute(base, room, stage, moderation, readiness, controls, content, presenter, audienceQa, now);
}

export function syncStreamBusinessModerationComplianceState(
  state: StreamBusinessModerationComplianceRuntimeState,
  room: StreamRoomRuntimeState,
  stage: StreamRoomStageRuntimeState,
  moderation: StreamRoomModerationRuntimeState,
  readiness: StreamBusinessStreamReadinessRuntimeState,
  controls: StreamBusinessRoomControlsRuntimeState,
  content: StreamBusinessShowcaseContentRuntimeState,
  presenter: StreamBusinessPresenterSequenceRuntimeState,
  audienceQa: StreamBusinessAudienceQaRuntimeState,
  now?: Date | string | number,
): StreamBusinessModerationComplianceRuntimeState {
  return recompute(state, room, stage, moderation, readiness, controls, content, presenter, audienceQa, now);
}

export function selectNextStreamBusinessComplianceCheckLocal(state: StreamBusinessModerationComplianceRuntimeState): StreamBusinessModerationComplianceRuntimeState {
  const currentIndex = Math.max(0, state.checks.findIndex((check) => check.id === state.selectedCheckId));
  const next = state.checks[(currentIndex + 1) % Math.max(1, state.checks.length)];
  return next ? { ...state, selectedCheckId: next.id, updatedAt: nowIso() } : state;
}

export function acknowledgeStreamBusinessSafetyPolicyLocal(state: StreamBusinessModerationComplianceRuntimeState): StreamBusinessModerationComplianceRuntimeState {
  return { ...state, businessSafetyPolicyAcknowledgedLocal: true, updatedAt: nowIso() };
}

export function acknowledgeStreamBusinessAdvertisingDisclosureLocal(state: StreamBusinessModerationComplianceRuntimeState): StreamBusinessModerationComplianceRuntimeState {
  return { ...state, advertisingDisclosureAcknowledgedLocal: true, updatedAt: nowIso() };
}

export function acknowledgeStreamBusinessQnaSafetyPolicyLocal(state: StreamBusinessModerationComplianceRuntimeState): StreamBusinessModerationComplianceRuntimeState {
  return { ...state, qnaSafetyPolicyAcknowledgedLocal: true, updatedAt: nowIso() };
}

export function acknowledgeStreamBusinessModerationReviewLocal(state: StreamBusinessModerationComplianceRuntimeState): StreamBusinessModerationComplianceRuntimeState {
  return { ...state, moderationReviewAcknowledgedLocal: true, updatedAt: nowIso() };
}

export function reviewSelectedStreamBusinessComplianceCheckLocal(state: StreamBusinessModerationComplianceRuntimeState): StreamBusinessModerationComplianceRuntimeState {
  const checks = state.checks.map((check): StreamBusinessComplianceCheck => check.id === state.selectedCheckId && check.status === "pending_local" ? { ...check, status: "reviewed_local", reviewedLocal: true } : check);
  return { ...state, checks, updatedAt: nowIso() };
}

export function runStreamBusinessModerationComplianceFinalPass(
  state: StreamBusinessModerationComplianceRuntimeState,
  room: StreamRoomRuntimeState,
  stage: StreamRoomStageRuntimeState,
  moderation: StreamRoomModerationRuntimeState,
  readiness: StreamBusinessStreamReadinessRuntimeState,
  controls: StreamBusinessRoomControlsRuntimeState,
  content: StreamBusinessShowcaseContentRuntimeState,
  presenter: StreamBusinessPresenterSequenceRuntimeState,
  audienceQa: StreamBusinessAudienceQaRuntimeState,
): StreamBusinessModerationComplianceRuntimeState {
  return recompute({ ...state, status: "checking_local" }, room, stage, moderation, readiness, controls, content, presenter, audienceQa);
}

export function queueStreamBusinessModerationComplianceEvent(
  state: StreamBusinessModerationComplianceRuntimeState,
  eventQueue: StreamRoomEventQueueRuntimeState,
  room: StreamRoomRuntimeState,
  stage: StreamRoomStageRuntimeState,
  moderation: StreamRoomModerationRuntimeState,
  readiness: StreamBusinessStreamReadinessRuntimeState,
  controls: StreamBusinessRoomControlsRuntimeState,
  content: StreamBusinessShowcaseContentRuntimeState,
  presenter: StreamBusinessPresenterSequenceRuntimeState,
  audienceQa: StreamBusinessAudienceQaRuntimeState,
): { readonly state: StreamBusinessModerationComplianceRuntimeState; readonly eventQueue: StreamRoomEventQueueRuntimeState } {
  const reviewedChecks = state.checks.filter((check) => check.reviewedLocal).length;
  const nextQueue = enqueueLocalStreamRoomEvent(eventQueue, room, {
    kind: "moderation",
    label: `Business compliance final pass: ${state.status}`,
    priority: state.localBlockers.length > 0 ? "high" : "critical",
    payload: {
      roomId: room.roomId,
      mode: room.mode,
      layout: stage.layout,
      complianceStatus: state.status,
      reviewedChecks,
      pendingReports: pendingReports(moderation),
      readinessStatus: readiness.status,
      controlsStatus: controls.status,
      contentStatus: content.status,
      presenterStatus: presenter.status,
      audienceQaStatus: audienceQa.status,
      deliveredToProvider: false,
      fakeBusinessComplianceAllowed: false,
      fakeBusinessLaunchAllowed: false,
      fakePaymentAllowed: false,
      fakeGiftAllowed: false,
      fakeMonetizationAllowed: false,
    },
  });
  const queuedState = { ...state, queuedBusinessComplianceEvents: state.queuedBusinessComplianceEvents + 1, updatedAt: nowIso() };
  return { state: queuedState, eventQueue: nextQueue };
}

export function requestStreamBusinessComplianceProviderBlocked(
  state: StreamBusinessModerationComplianceRuntimeState,
  room: StreamRoomRuntimeState,
  stage: StreamRoomStageRuntimeState,
  moderation: StreamRoomModerationRuntimeState,
  readiness: StreamBusinessStreamReadinessRuntimeState,
  controls: StreamBusinessRoomControlsRuntimeState,
  content: StreamBusinessShowcaseContentRuntimeState,
  presenter: StreamBusinessPresenterSequenceRuntimeState,
  audienceQa: StreamBusinessAudienceQaRuntimeState,
): StreamBusinessModerationComplianceRuntimeState {
  return recompute({ ...state, providerComplianceHandoffRequestedLocal: true }, room, stage, moderation, readiness, controls, content, presenter, audienceQa);
}

export function buildStreamBusinessModerationComplianceEvidenceSnapshot(state: StreamBusinessModerationComplianceRuntimeState, moderation: StreamRoomModerationRuntimeState): StreamBusinessModerationComplianceEvidenceSnapshot {
  const selected = state.checks.find((check) => check.id === state.selectedCheckId) ?? state.checks[0];
  const reviewedChecks = state.checks.filter((check) => check.reviewedLocal).length;
  const blockedChecks = state.checks.filter((check) => check.status === "blocked_local").length;
  const providerRequiredChecks = state.checks.filter((check) => check.status === "provider_required").length;
  return {
    version: "STREAM-109R",
    roomId: state.roomId,
    status: state.status,
    selectedCheckId: selected?.id ?? "business_room_identity",
    selectedCheckStatus: selected?.status ?? "blocked_local",
    totalChecks: state.checks.length,
    reviewedChecks,
    blockedChecks,
    providerRequiredChecks,
    pendingReports: pendingReports(moderation),
    hiddenComments: moderation.hiddenCommentIds.length,
    mutedParticipants: moderation.participantControls.filter((participant) => participant.muted).length,
    blockedParticipants: moderation.participantControls.filter((participant) => participant.blocked).length,
    businessSafetyPolicyAcknowledgedLocal: state.businessSafetyPolicyAcknowledgedLocal,
    advertisingDisclosureAcknowledgedLocal: state.advertisingDisclosureAcknowledgedLocal,
    qnaSafetyPolicyAcknowledgedLocal: state.qnaSafetyPolicyAcknowledgedLocal,
    moderationReviewAcknowledgedLocal: state.moderationReviewAcknowledgedLocal,
    queuedBusinessComplianceEvents: state.queuedBusinessComplianceEvents,
    providerComplianceHandoffRequestedLocal: state.providerComplianceHandoffRequestedLocal,
    localBlockers: state.localBlockers,
    providerBlockers: state.providerBlockers,
    backendBusinessComplianceContract: state.integration.backendBusinessComplianceContract,
    realtimeBusinessModerationProvider: state.integration.realtimeBusinessModerationProvider,
    durableBusinessModerationStore: state.integration.durableBusinessModerationStore,
    adminBusinessComplianceReview: state.integration.adminBusinessComplianceReview,
    paymentsAllowedNow: false,
    giftsAllowedNow: false,
    monetizationAllowedNow: false,
    walletBridgeRequiredNow: false,
    fakeBusinessComplianceAllowed: false,
    fakeBusinessLaunchAllowed: false,
    fakePaymentAllowed: false,
    fakeGiftAllowed: false,
    fakeMonetizationAllowed: false,
    readyForBackendUnion: state.localBlockers.length === 0 && state.queuedBusinessComplianceEvents > 0,
  };
}
