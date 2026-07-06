import type { StreamRoomRuntimeState } from "./streamRoomRuntime";
import type { StreamRoomStageRuntimeState } from "./streamRoomStageRuntime";
import { enqueueLocalStreamRoomEvent, type StreamRoomEventQueueRuntimeState } from "./streamRoomEventQueueRuntime";
import type { StreamBusinessStreamReadinessRuntimeState } from "./streamBusinessStreamReadinessRuntime";
import type { StreamBusinessRoomControlsRuntimeState } from "./streamBusinessRoomControlsRuntime";
import type { StreamBusinessShowcaseContentRuntimeState } from "./streamBusinessShowcaseContentRuntime";
import type { StreamBusinessPresenterSequenceRuntimeState } from "./streamBusinessPresenterSequenceRuntime";

export type StreamBusinessAudienceQaStatus =
  | "not_started_local"
  | "collecting_local"
  | "review_required_local"
  | "qa_ready_local"
  | "blocked_local"
  | "provider_qa_blocked";

export type StreamBusinessAudienceQuestionStatus =
  | "draft_local"
  | "pending_review_local"
  | "approved_local"
  | "answered_local"
  | "declined_local"
  | "compliance_hold_local"
  | "provider_required";

export type StreamBusinessAudienceQaBlockerCode =
  | "business_room_required"
  | "business_readiness_required"
  | "business_controls_required"
  | "business_content_required"
  | "presenter_sequence_required"
  | "active_or_completed_presenter_segment_required"
  | "audience_question_required"
  | "question_review_required"
  | "answer_draft_required"
  | "audience_qna_policy_ack_required"
  | "audience_compliance_review_required"
  | "audience_qa_event_queue_required"
  | "backend_audience_qa_contract_required"
  | "realtime_audience_qa_provider_required"
  | "moderation_audience_qa_queue_required"
  | "admin_audience_qa_review_required"
  | "fake_audience_qa_forbidden"
  | "fake_business_launch_forbidden"
  | "fake_payment_forbidden"
  | "fake_gift_forbidden"
  | "fake_monetization_forbidden";

export type StreamBusinessAudienceQuestion = {
  readonly id: string;
  readonly viewerName: string;
  readonly questionText: string;
  readonly answerDraft: string;
  readonly linkedPresenterSegmentId: string | null;
  readonly status: StreamBusinessAudienceQuestionStatus;
  readonly reviewedLocal: boolean;
  readonly answeredLocal: boolean;
  readonly declinedLocal: boolean;
  readonly complianceHoldLocal: boolean;
  readonly localOnly: true;
  readonly deliveredToBackend: false;
  readonly deliveredToProvider: false;
  readonly paymentEnabled: false;
  readonly giftEnabled: false;
};

export type StreamBusinessAudienceQaIntegration = {
  readonly backendAudienceQaContract: "not_connected" | "connected";
  readonly realtimeAudienceQaProvider: "not_configured" | "configured";
  readonly moderationAudienceQaQueue: "not_connected" | "connected";
  readonly adminAudienceQaReview: "not_connected" | "connected";
  readonly paymentsAllowedNow: false;
  readonly giftsAllowedNow: false;
  readonly monetizationAllowedNow: false;
  readonly walletBridgeRequiredNow: false;
  readonly fakeAudienceQaAllowed: false;
  readonly fakeBusinessLaunchAllowed: false;
  readonly fakePaymentAllowed: false;
  readonly fakeGiftAllowed: false;
  readonly fakeMonetizationAllowed: false;
};

export type StreamBusinessAudienceQaRuntimeState = {
  readonly version: "STREAM-109Q";
  readonly roomId: string;
  readonly status: StreamBusinessAudienceQaStatus;
  readonly selectedQuestionId: string;
  readonly questions: readonly StreamBusinessAudienceQuestion[];
  readonly audienceQnaPolicyAcknowledgedLocal: boolean;
  readonly audienceComplianceReviewAcknowledgedLocal: boolean;
  readonly queuedAudienceQaEvents: number;
  readonly providerAudienceQaHandoffRequestedLocal: boolean;
  readonly localBlockers: readonly StreamBusinessAudienceQaBlockerCode[];
  readonly providerBlockers: readonly StreamBusinessAudienceQaBlockerCode[];
  readonly integration: StreamBusinessAudienceQaIntegration;
  readonly updatedAt: string;
};

export type StreamBusinessAudienceQaEvidenceSnapshot = {
  readonly version: "STREAM-109Q";
  readonly roomId: string;
  readonly status: StreamBusinessAudienceQaStatus;
  readonly selectedQuestionId: string;
  readonly selectedQuestionStatus: StreamBusinessAudienceQuestionStatus;
  readonly totalQuestions: number;
  readonly pendingReviewQuestions: number;
  readonly approvedQuestions: number;
  readonly answeredQuestions: number;
  readonly declinedQuestions: number;
  readonly complianceHoldQuestions: number;
  readonly providerRequiredQuestions: number;
  readonly linkedPresenterQuestions: number;
  readonly audienceQnaPolicyAcknowledgedLocal: boolean;
  readonly audienceComplianceReviewAcknowledgedLocal: boolean;
  readonly queuedAudienceQaEvents: number;
  readonly providerAudienceQaHandoffRequestedLocal: boolean;
  readonly localBlockers: readonly StreamBusinessAudienceQaBlockerCode[];
  readonly providerBlockers: readonly StreamBusinessAudienceQaBlockerCode[];
  readonly backendAudienceQaContract: StreamBusinessAudienceQaIntegration["backendAudienceQaContract"];
  readonly realtimeAudienceQaProvider: StreamBusinessAudienceQaIntegration["realtimeAudienceQaProvider"];
  readonly moderationAudienceQaQueue: StreamBusinessAudienceQaIntegration["moderationAudienceQaQueue"];
  readonly adminAudienceQaReview: StreamBusinessAudienceQaIntegration["adminAudienceQaReview"];
  readonly paymentsAllowedNow: false;
  readonly giftsAllowedNow: false;
  readonly monetizationAllowedNow: false;
  readonly walletBridgeRequiredNow: false;
  readonly fakeAudienceQaAllowed: false;
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

function createId(prefix: string, now?: Date | string | number): string {
  const stamp = nowIso(now).replace(/[^0-9]/g, "").slice(0, 17);
  return `${prefix}-${stamp}`;
}

function cleanText(value: string | null | undefined, fallback: string): string {
  const text = String(value ?? "").trim().replace(/\s+/g, " ");
  return text || fallback;
}

function defaultIntegration(): StreamBusinessAudienceQaIntegration {
  return {
    backendAudienceQaContract: "not_connected",
    realtimeAudienceQaProvider: "not_configured",
    moderationAudienceQaQueue: "not_connected",
    adminAudienceQaReview: "not_connected",
    paymentsAllowedNow: false,
    giftsAllowedNow: false,
    monetizationAllowedNow: false,
    walletBridgeRequiredNow: false,
    fakeAudienceQaAllowed: false,
    fakeBusinessLaunchAllowed: false,
    fakePaymentAllowed: false,
    fakeGiftAllowed: false,
    fakeMonetizationAllowed: false,
  };
}

function activeOrCompletedSegmentId(presenter: StreamBusinessPresenterSequenceRuntimeState): string | null {
  const segment = presenter.segments.find((item) => item.status === "active_local") ?? presenter.segments.find((item) => item.status === "completed_local") ?? presenter.segments.find((item) => item.id === presenter.selectedSegmentId);
  return segment?.id ?? null;
}

function defaultQuestions(room: StreamRoomRuntimeState, presenter: StreamBusinessPresenterSequenceRuntimeState, now?: Date | string | number): readonly StreamBusinessAudienceQuestion[] {
  const linked = activeOrCompletedSegmentId(presenter);
  return [
    {
      id: createId("business-audience-question", now),
      viewerName: "Local viewer",
      questionText: cleanText(room.topic, "What problem does this product or service solve for customers?"),
      answerDraft: cleanText(room.title, "Host answer draft required before this Q&A can be accepted."),
      linkedPresenterSegmentId: linked,
      status: "draft_local",
      reviewedLocal: false,
      answeredLocal: false,
      declinedLocal: false,
      complianceHoldLocal: false,
      localOnly: true,
      deliveredToBackend: false,
      deliveredToProvider: false,
      paymentEnabled: false,
      giftEnabled: false,
    },
    {
      id: createId("business-audience-question-followup", now),
      viewerName: "Business viewer",
      questionText: "Can the host explain availability, support, and service terms without starting payment in Stream?",
      answerDraft: "Answer with information only. Payments, gifts, and monetization stay disabled until the later Wallet phase.",
      linkedPresenterSegmentId: linked,
      status: "pending_review_local",
      reviewedLocal: false,
      answeredLocal: false,
      declinedLocal: false,
      complianceHoldLocal: false,
      localOnly: true,
      deliveredToBackend: false,
      deliveredToProvider: false,
      paymentEnabled: false,
      giftEnabled: false,
    },
  ];
}

function providerBlockers(): readonly StreamBusinessAudienceQaBlockerCode[] {
  return [
    "backend_audience_qa_contract_required",
    "realtime_audience_qa_provider_required",
    "moderation_audience_qa_queue_required",
    "admin_audience_qa_review_required",
    "fake_audience_qa_forbidden",
    "fake_business_launch_forbidden",
    "fake_payment_forbidden",
    "fake_gift_forbidden",
    "fake_monetization_forbidden",
  ];
}

function localBlockersFor(
  room: StreamRoomRuntimeState,
  stage: StreamRoomStageRuntimeState,
  readiness: StreamBusinessStreamReadinessRuntimeState,
  controls: StreamBusinessRoomControlsRuntimeState,
  content: StreamBusinessShowcaseContentRuntimeState,
  presenter: StreamBusinessPresenterSequenceRuntimeState,
  state: Pick<StreamBusinessAudienceQaRuntimeState, "questions" | "selectedQuestionId" | "audienceQnaPolicyAcknowledgedLocal" | "audienceComplianceReviewAcknowledgedLocal" | "queuedAudienceQaEvents">,
): readonly StreamBusinessAudienceQaBlockerCode[] {
  const blockers: StreamBusinessAudienceQaBlockerCode[] = [];
  const selected = state.questions.find((item) => item.id === state.selectedQuestionId) ?? state.questions[0];
  const hasActiveOrCompletedSegment = presenter.segments.some((segment) => segment.status === "active_local" || segment.status === "completed_local");
  const hasPreparedContent = content.contentItems.some((item) => item.status === "prepared_local");
  if (room.mode !== "businessLive" || stage.layout !== "business_showcase") blockers.push("business_room_required");
  if (readiness.status !== "business_room_ready_local" && readiness.status !== "provider_business_handoff_blocked") blockers.push("business_readiness_required");
  if (controls.status !== "business_controls_ready_local" && controls.status !== "provider_controls_blocked") blockers.push("business_controls_required");
  if (!hasPreparedContent) blockers.push("business_content_required");
  if (presenter.status !== "sequence_ready_local" && presenter.status !== "provider_sequence_blocked") blockers.push("presenter_sequence_required");
  if (!hasActiveOrCompletedSegment) blockers.push("active_or_completed_presenter_segment_required");
  if (!selected || cleanText(selected.questionText, "").length < 4) blockers.push("audience_question_required");
  if (selected && (selected.status === "draft_local" || selected.status === "pending_review_local") && !selected.reviewedLocal) blockers.push("question_review_required");
  if (selected && selected.status === "approved_local" && cleanText(selected.answerDraft, "").length < 4) blockers.push("answer_draft_required");
  if (!state.audienceQnaPolicyAcknowledgedLocal) blockers.push("audience_qna_policy_ack_required");
  if (!state.audienceComplianceReviewAcknowledgedLocal) blockers.push("audience_compliance_review_required");
  if (state.queuedAudienceQaEvents < 1) blockers.push("audience_qa_event_queue_required");
  return blockers;
}

function statusFor(localBlockers: readonly StreamBusinessAudienceQaBlockerCode[], providerHandoff: boolean): StreamBusinessAudienceQaStatus {
  if (providerHandoff) return "provider_qa_blocked";
  if (localBlockers.length === 0) return "qa_ready_local";
  if (localBlockers.includes("question_review_required")) return "review_required_local";
  if (localBlockers.includes("audience_question_required")) return "collecting_local";
  return "blocked_local";
}

function normalizeState(
  state: StreamBusinessAudienceQaRuntimeState,
  room: StreamRoomRuntimeState,
  stage: StreamRoomStageRuntimeState,
  readiness: StreamBusinessStreamReadinessRuntimeState,
  controls: StreamBusinessRoomControlsRuntimeState,
  content: StreamBusinessShowcaseContentRuntimeState,
  presenter: StreamBusinessPresenterSequenceRuntimeState,
  now?: Date | string | number,
): StreamBusinessAudienceQaRuntimeState {
  const localBlockers = localBlockersFor(room, stage, readiness, controls, content, presenter, state);
  const provider = providerBlockers();
  return {
    ...state,
    roomId: room.roomId,
    status: statusFor(localBlockers, state.providerAudienceQaHandoffRequestedLocal),
    localBlockers,
    providerBlockers: provider,
    updatedAt: nowIso(now),
  };
}

export function createInitialStreamBusinessAudienceQaState(
  room: StreamRoomRuntimeState,
  stage: StreamRoomStageRuntimeState,
  readiness: StreamBusinessStreamReadinessRuntimeState,
  controls: StreamBusinessRoomControlsRuntimeState,
  content: StreamBusinessShowcaseContentRuntimeState,
  presenter: StreamBusinessPresenterSequenceRuntimeState,
  now?: Date | string | number,
): StreamBusinessAudienceQaRuntimeState {
  const updatedAt = nowIso(now);
  const questions = defaultQuestions(room, presenter, now);
  const base: StreamBusinessAudienceQaRuntimeState = {
    version: "STREAM-109Q",
    roomId: room.roomId,
    status: "not_started_local",
    selectedQuestionId: questions[0]?.id ?? createId("business-audience-question", now),
    questions,
    audienceQnaPolicyAcknowledgedLocal: false,
    audienceComplianceReviewAcknowledgedLocal: false,
    queuedAudienceQaEvents: 0,
    providerAudienceQaHandoffRequestedLocal: false,
    localBlockers: [],
    providerBlockers: providerBlockers(),
    integration: defaultIntegration(),
    updatedAt,
  };
  return normalizeState(base, room, stage, readiness, controls, content, presenter, now);
}

export function syncStreamBusinessAudienceQaState(
  state: StreamBusinessAudienceQaRuntimeState,
  room: StreamRoomRuntimeState,
  stage: StreamRoomStageRuntimeState,
  readiness: StreamBusinessStreamReadinessRuntimeState,
  controls: StreamBusinessRoomControlsRuntimeState,
  content: StreamBusinessShowcaseContentRuntimeState,
  presenter: StreamBusinessPresenterSequenceRuntimeState,
  now?: Date | string | number,
): StreamBusinessAudienceQaRuntimeState {
  const linked = activeOrCompletedSegmentId(presenter);
  const questions = state.questions.length > 0
    ? state.questions.map((question) => question.linkedPresenterSegmentId ? question : { ...question, linkedPresenterSegmentId: linked })
    : defaultQuestions(room, presenter, now);
  return normalizeState({ ...state, questions, selectedQuestionId: questions.some((item) => item.id === state.selectedQuestionId) ? state.selectedQuestionId : questions[0]?.id ?? state.selectedQuestionId }, room, stage, readiness, controls, content, presenter, now);
}

export function selectNextStreamBusinessAudienceQuestionLocal(state: StreamBusinessAudienceQaRuntimeState, now?: Date | string | number): StreamBusinessAudienceQaRuntimeState {
  const index = state.questions.findIndex((question) => question.id === state.selectedQuestionId);
  const next = state.questions[(index + 1) % Math.max(state.questions.length, 1)] ?? state.questions[0];
  return { ...state, selectedQuestionId: next?.id ?? state.selectedQuestionId, updatedAt: nowIso(now) };
}

export function addStreamBusinessAudienceQuestionLocal(
  state: StreamBusinessAudienceQaRuntimeState,
  presenter: StreamBusinessPresenterSequenceRuntimeState,
  viewerName?: string,
  questionText?: string,
  now?: Date | string | number,
): StreamBusinessAudienceQaRuntimeState {
  const question: StreamBusinessAudienceQuestion = {
    id: createId("business-audience-question-added", now),
    viewerName: cleanText(viewerName, "Local business viewer"),
    questionText: cleanText(questionText, "Audience question draft requires review before it can be answered."),
    answerDraft: "Answer draft required. Keep this informational only; no payment, gift, or monetization action.",
    linkedPresenterSegmentId: activeOrCompletedSegmentId(presenter),
    status: "pending_review_local",
    reviewedLocal: false,
    answeredLocal: false,
    declinedLocal: false,
    complianceHoldLocal: false,
    localOnly: true,
    deliveredToBackend: false,
    deliveredToProvider: false,
    paymentEnabled: false,
    giftEnabled: false,
  };
  return { ...state, selectedQuestionId: question.id, questions: [...state.questions, question], updatedAt: nowIso(now) };
}

function updateSelectedQuestion(
  state: StreamBusinessAudienceQaRuntimeState,
  update: (question: StreamBusinessAudienceQuestion) => StreamBusinessAudienceQuestion,
  now?: Date | string | number,
): StreamBusinessAudienceQaRuntimeState {
  const questions = state.questions.map((question) => question.id === state.selectedQuestionId ? update(question) : question);
  return { ...state, questions, updatedAt: nowIso(now) };
}

export function approveSelectedStreamBusinessAudienceQuestionLocal(state: StreamBusinessAudienceQaRuntimeState, now?: Date | string | number): StreamBusinessAudienceQaRuntimeState {
  return updateSelectedQuestion(state, (question) => ({ ...question, status: "approved_local", reviewedLocal: true, complianceHoldLocal: false }), now);
}

export function answerSelectedStreamBusinessAudienceQuestionLocal(state: StreamBusinessAudienceQaRuntimeState, answerDraft?: string, now?: Date | string | number): StreamBusinessAudienceQaRuntimeState {
  return updateSelectedQuestion(state, (question) => ({ ...question, status: "answered_local", reviewedLocal: true, answeredLocal: true, answerDraft: cleanText(answerDraft, question.answerDraft || "Answered locally with informational content only.") }), now);
}

export function declineSelectedStreamBusinessAudienceQuestionLocal(state: StreamBusinessAudienceQaRuntimeState, now?: Date | string | number): StreamBusinessAudienceQaRuntimeState {
  return updateSelectedQuestion(state, (question) => ({ ...question, status: "declined_local", reviewedLocal: true, declinedLocal: true }), now);
}

export function holdSelectedStreamBusinessAudienceQuestionForComplianceLocal(state: StreamBusinessAudienceQaRuntimeState, now?: Date | string | number): StreamBusinessAudienceQaRuntimeState {
  return updateSelectedQuestion(state, (question) => ({ ...question, status: "compliance_hold_local", reviewedLocal: true, complianceHoldLocal: true }), now);
}

export function acknowledgeStreamBusinessAudienceQaPolicyLocal(state: StreamBusinessAudienceQaRuntimeState, now?: Date | string | number): StreamBusinessAudienceQaRuntimeState {
  return { ...state, audienceQnaPolicyAcknowledgedLocal: true, updatedAt: nowIso(now) };
}

export function acknowledgeStreamBusinessAudienceComplianceReviewLocal(state: StreamBusinessAudienceQaRuntimeState, now?: Date | string | number): StreamBusinessAudienceQaRuntimeState {
  return { ...state, audienceComplianceReviewAcknowledgedLocal: true, updatedAt: nowIso(now) };
}

export function runStreamBusinessAudienceQaCheck(
  state: StreamBusinessAudienceQaRuntimeState,
  room: StreamRoomRuntimeState,
  stage: StreamRoomStageRuntimeState,
  readiness: StreamBusinessStreamReadinessRuntimeState,
  controls: StreamBusinessRoomControlsRuntimeState,
  content: StreamBusinessShowcaseContentRuntimeState,
  presenter: StreamBusinessPresenterSequenceRuntimeState,
  now?: Date | string | number,
): StreamBusinessAudienceQaRuntimeState {
  return normalizeState(state, room, stage, readiness, controls, content, presenter, now);
}

export function queueStreamBusinessAudienceQaEvent(
  state: StreamBusinessAudienceQaRuntimeState,
  eventQueue: StreamRoomEventQueueRuntimeState,
  room: StreamRoomRuntimeState,
  stage: StreamRoomStageRuntimeState,
  readiness: StreamBusinessStreamReadinessRuntimeState,
  controls: StreamBusinessRoomControlsRuntimeState,
  content: StreamBusinessShowcaseContentRuntimeState,
  presenter: StreamBusinessPresenterSequenceRuntimeState,
  now?: Date | string | number,
): { readonly state: StreamBusinessAudienceQaRuntimeState; readonly eventQueue: StreamRoomEventQueueRuntimeState } {
  const checked = runStreamBusinessAudienceQaCheck(state, room, stage, readiness, controls, content, presenter, now);
  const selected = checked.questions.find((question) => question.id === checked.selectedQuestionId) ?? checked.questions[0];
  const nextQueue = enqueueLocalStreamRoomEvent(eventQueue, room, {
    kind: "comment",
    label: "Business Stream audience Q&A local event",
    priority: checked.localBlockers.length > 0 ? "normal" : "high",
    payload: {
      source: "business_audience_qa",
      questionId: selected?.id ?? null,
      questionStatus: selected?.status ?? null,
      viewerName: selected?.viewerName ?? null,
      linkedPresenterSegmentId: selected?.linkedPresenterSegmentId ?? null,
      answeredLocal: selected?.answeredLocal ?? false,
      paymentsAllowedNow: false,
      giftsAllowedNow: false,
      monetizationAllowedNow: false,
      providerRequired: true,
    },
  }, now);
  return {
    state: { ...checked, queuedAudienceQaEvents: checked.queuedAudienceQaEvents + 1, updatedAt: nowIso(now) },
    eventQueue: nextQueue,
  };
}

export function requestStreamBusinessAudienceQaProviderBlocked(
  state: StreamBusinessAudienceQaRuntimeState,
  room: StreamRoomRuntimeState,
  stage: StreamRoomStageRuntimeState,
  readiness: StreamBusinessStreamReadinessRuntimeState,
  controls: StreamBusinessRoomControlsRuntimeState,
  content: StreamBusinessShowcaseContentRuntimeState,
  presenter: StreamBusinessPresenterSequenceRuntimeState,
  now?: Date | string | number,
): StreamBusinessAudienceQaRuntimeState {
  const checked = runStreamBusinessAudienceQaCheck(state, room, stage, readiness, controls, content, presenter, now);
  return {
    ...checked,
    status: "provider_qa_blocked",
    providerAudienceQaHandoffRequestedLocal: true,
    providerBlockers: providerBlockers(),
    updatedAt: nowIso(now),
  };
}

export function buildStreamBusinessAudienceQaEvidenceSnapshot(state: StreamBusinessAudienceQaRuntimeState): StreamBusinessAudienceQaEvidenceSnapshot {
  const selected = state.questions.find((question) => question.id === state.selectedQuestionId) ?? state.questions[0];
  return {
    version: "STREAM-109Q",
    roomId: state.roomId,
    status: state.status,
    selectedQuestionId: selected?.id ?? state.selectedQuestionId,
    selectedQuestionStatus: selected?.status ?? "draft_local",
    totalQuestions: state.questions.length,
    pendingReviewQuestions: state.questions.filter((question) => question.status === "pending_review_local").length,
    approvedQuestions: state.questions.filter((question) => question.status === "approved_local").length,
    answeredQuestions: state.questions.filter((question) => question.status === "answered_local").length,
    declinedQuestions: state.questions.filter((question) => question.status === "declined_local").length,
    complianceHoldQuestions: state.questions.filter((question) => question.status === "compliance_hold_local").length,
    providerRequiredQuestions: state.questions.filter((question) => question.status === "provider_required").length,
    linkedPresenterQuestions: state.questions.filter((question) => Boolean(question.linkedPresenterSegmentId)).length,
    audienceQnaPolicyAcknowledgedLocal: state.audienceQnaPolicyAcknowledgedLocal,
    audienceComplianceReviewAcknowledgedLocal: state.audienceComplianceReviewAcknowledgedLocal,
    queuedAudienceQaEvents: state.queuedAudienceQaEvents,
    providerAudienceQaHandoffRequestedLocal: state.providerAudienceQaHandoffRequestedLocal,
    localBlockers: state.localBlockers,
    providerBlockers: state.providerBlockers,
    backendAudienceQaContract: state.integration.backendAudienceQaContract,
    realtimeAudienceQaProvider: state.integration.realtimeAudienceQaProvider,
    moderationAudienceQaQueue: state.integration.moderationAudienceQaQueue,
    adminAudienceQaReview: state.integration.adminAudienceQaReview,
    paymentsAllowedNow: false,
    giftsAllowedNow: false,
    monetizationAllowedNow: false,
    walletBridgeRequiredNow: false,
    fakeAudienceQaAllowed: false,
    fakeBusinessLaunchAllowed: false,
    fakePaymentAllowed: false,
    fakeGiftAllowed: false,
    fakeMonetizationAllowed: false,
    readyForBackendUnion: state.localBlockers.length === 0 && state.providerBlockers.length > 0,
  };
}
