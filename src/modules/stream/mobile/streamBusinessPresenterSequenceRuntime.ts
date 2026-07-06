import type { StreamRoomRuntimeState } from "./streamRoomRuntime";
import type { StreamRoomStageRuntimeState } from "./streamRoomStageRuntime";
import { enqueueLocalStreamRoomEvent, type StreamRoomEventQueueRuntimeState } from "./streamRoomEventQueueRuntime";
import type { StreamBusinessStreamReadinessRuntimeState } from "./streamBusinessStreamReadinessRuntime";
import type { StreamBusinessRoomControlsRuntimeState } from "./streamBusinessRoomControlsRuntime";
import type { StreamBusinessShowcaseContentRuntimeState, StreamBusinessShowcaseContentItem } from "./streamBusinessShowcaseContentRuntime";

export type StreamBusinessPresenterSequenceStatus =
  | "not_started_local"
  | "preparing_local"
  | "blocked_local"
  | "sequence_ready_local"
  | "provider_sequence_blocked";

export type StreamBusinessPresenterSegmentKind =
  | "intro"
  | "showcase_item"
  | "demo_segment"
  | "audience_qna_prompt"
  | "compliance_notice"
  | "closing";

export type StreamBusinessPresenterSegmentStatus =
  | "draft_local"
  | "queued_local"
  | "active_local"
  | "completed_local"
  | "compliance_hold_local"
  | "provider_required";

export type StreamBusinessPresenterSequenceBlockerCode =
  | "business_room_required"
  | "business_readiness_required"
  | "business_controls_required"
  | "business_content_required"
  | "prepared_showcase_content_required"
  | "presenter_segment_required"
  | "presenter_script_required"
  | "active_segment_required"
  | "qna_policy_ack_required"
  | "compliance_checkpoint_required"
  | "sequence_event_queue_required"
  | "backend_presenter_sequence_contract_required"
  | "realtime_presenter_sequence_provider_required"
  | "media_presenter_segment_provider_required"
  | "admin_business_sequence_review_required"
  | "fake_presenter_sequence_forbidden"
  | "fake_business_launch_forbidden"
  | "fake_payment_forbidden"
  | "fake_gift_forbidden"
  | "fake_monetization_forbidden";

export type StreamBusinessPresenterSegment = {
  readonly id: string;
  readonly kind: StreamBusinessPresenterSegmentKind;
  readonly title: string;
  readonly script: string;
  readonly linkedContentItemId: string | null;
  readonly status: StreamBusinessPresenterSegmentStatus;
  readonly localOnly: true;
  readonly deliveredToBackend: false;
  readonly published: false;
  readonly paymentEnabled: false;
  readonly giftEnabled: false;
};

export type StreamBusinessPresenterSequenceIntegration = {
  readonly backendPresenterSequenceContract: "not_connected" | "connected";
  readonly realtimePresenterSequenceProvider: "not_configured" | "configured";
  readonly mediaPresenterSegmentProvider: "not_configured" | "configured";
  readonly adminBusinessSequenceReview: "not_connected" | "connected";
  readonly paymentsAllowedNow: false;
  readonly giftsAllowedNow: false;
  readonly monetizationAllowedNow: false;
  readonly walletBridgeRequiredNow: false;
  readonly fakePresenterSequenceAllowed: false;
  readonly fakeBusinessLaunchAllowed: false;
  readonly fakePaymentAllowed: false;
  readonly fakeGiftAllowed: false;
  readonly fakeMonetizationAllowed: false;
};

export type StreamBusinessPresenterSequenceRuntimeState = {
  readonly version: "STREAM-109P";
  readonly roomId: string;
  readonly status: StreamBusinessPresenterSequenceStatus;
  readonly selectedSegmentId: string;
  readonly activeSegmentId: string | null;
  readonly segments: readonly StreamBusinessPresenterSegment[];
  readonly qnaPolicyAcknowledgedLocal: boolean;
  readonly complianceCheckpointAcknowledgedLocal: boolean;
  readonly presenterScriptPreparedLocal: boolean;
  readonly queuedPresenterSequenceEvents: number;
  readonly providerSequenceHandoffRequestedLocal: boolean;
  readonly localBlockers: readonly StreamBusinessPresenterSequenceBlockerCode[];
  readonly providerBlockers: readonly StreamBusinessPresenterSequenceBlockerCode[];
  readonly integration: StreamBusinessPresenterSequenceIntegration;
  readonly updatedAt: string;
};

export type StreamBusinessPresenterSequenceEvidenceSnapshot = {
  readonly version: "STREAM-109P";
  readonly roomId: string;
  readonly status: StreamBusinessPresenterSequenceStatus;
  readonly selectedSegmentId: string;
  readonly selectedSegmentKind: StreamBusinessPresenterSegmentKind;
  readonly selectedSegmentStatus: StreamBusinessPresenterSegmentStatus;
  readonly activeSegmentId: string | null;
  readonly totalSegments: number;
  readonly queuedSegments: number;
  readonly activeSegments: number;
  readonly completedSegments: number;
  readonly complianceHoldSegments: number;
  readonly providerRequiredSegments: number;
  readonly linkedShowcaseSegments: number;
  readonly qnaPolicyAcknowledgedLocal: boolean;
  readonly complianceCheckpointAcknowledgedLocal: boolean;
  readonly presenterScriptPreparedLocal: boolean;
  readonly queuedPresenterSequenceEvents: number;
  readonly providerSequenceHandoffRequestedLocal: boolean;
  readonly localBlockers: readonly StreamBusinessPresenterSequenceBlockerCode[];
  readonly providerBlockers: readonly StreamBusinessPresenterSequenceBlockerCode[];
  readonly backendPresenterSequenceContract: StreamBusinessPresenterSequenceIntegration["backendPresenterSequenceContract"];
  readonly realtimePresenterSequenceProvider: StreamBusinessPresenterSequenceIntegration["realtimePresenterSequenceProvider"];
  readonly mediaPresenterSegmentProvider: StreamBusinessPresenterSequenceIntegration["mediaPresenterSegmentProvider"];
  readonly adminBusinessSequenceReview: StreamBusinessPresenterSequenceIntegration["adminBusinessSequenceReview"];
  readonly paymentsAllowedNow: false;
  readonly giftsAllowedNow: false;
  readonly monetizationAllowedNow: false;
  readonly walletBridgeRequiredNow: false;
  readonly fakePresenterSequenceAllowed: false;
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

function createSegmentId(kind: StreamBusinessPresenterSegmentKind, now?: Date | string | number): string {
  const stamp = nowIso(now).replace(/[^0-9]/g, "").slice(0, 17);
  return `business-presenter-${kind}-${stamp}`;
}

function cleanText(value: string | null | undefined, fallback: string): string {
  const normalized = String(value ?? "").trim().replace(/\s+/g, " ");
  return normalized || fallback;
}

function defaultIntegration(): StreamBusinessPresenterSequenceIntegration {
  return {
    backendPresenterSequenceContract: "not_connected",
    realtimePresenterSequenceProvider: "not_configured",
    mediaPresenterSegmentProvider: "not_configured",
    adminBusinessSequenceReview: "not_connected",
    paymentsAllowedNow: false,
    giftsAllowedNow: false,
    monetizationAllowedNow: false,
    walletBridgeRequiredNow: false,
    fakePresenterSequenceAllowed: false,
    fakeBusinessLaunchAllowed: false,
    fakePaymentAllowed: false,
    fakeGiftAllowed: false,
    fakeMonetizationAllowed: false,
  };
}

function firstContentId(content: StreamBusinessShowcaseContentRuntimeState, kind?: StreamBusinessShowcaseContentItem["kind"]): string | null {
  const item = content.contentItems.find((entry) => kind ? entry.kind === kind : entry.status === "prepared_local") ?? content.contentItems[0];
  return item?.id ?? null;
}

function defaultSegments(room: StreamRoomRuntimeState, content: StreamBusinessShowcaseContentRuntimeState, now?: Date | string | number): readonly StreamBusinessPresenterSegment[] {
  return [
    {
      id: createSegmentId("intro", now),
      kind: "intro",
      title: "Business room opening",
      script: cleanText(room.title, "Introduce the Business Stream room and explain what viewers will see."),
      linkedContentItemId: null,
      status: "draft_local",
      localOnly: true,
      deliveredToBackend: false,
      published: false,
      paymentEnabled: false,
      giftEnabled: false,
    },
    {
      id: createSegmentId("showcase_item", now),
      kind: "showcase_item",
      title: "Main showcase item",
      script: "Present the prepared product/service card as information only. No checkout, gift, or monetization action in this stage.",
      linkedContentItemId: firstContentId(content, "hero_product_card"),
      status: "draft_local",
      localOnly: true,
      deliveredToBackend: false,
      published: false,
      paymentEnabled: false,
      giftEnabled: false,
    },
    {
      id: createSegmentId("demo_segment", now),
      kind: "demo_segment",
      title: "Local demo segment",
      script: "Run a presenter/demo sequence locally and keep media/provider handoff blocked until real provider contracts exist.",
      linkedContentItemId: firstContentId(content, "demo_segment"),
      status: "draft_local",
      localOnly: true,
      deliveredToBackend: false,
      published: false,
      paymentEnabled: false,
      giftEnabled: false,
    },
    {
      id: createSegmentId("audience_qna_prompt", now),
      kind: "audience_qna_prompt",
      title: "Audience Q&A prompt",
      script: "Prepare viewer question collection locally. Realtime delivery and moderation queue remain provider/Admin required.",
      linkedContentItemId: null,
      status: "compliance_hold_local",
      localOnly: true,
      deliveredToBackend: false,
      published: false,
      paymentEnabled: false,
      giftEnabled: false,
    },
    {
      id: createSegmentId("compliance_notice", now),
      kind: "compliance_notice",
      title: "Compliance notice",
      script: "Show a local compliance notice before any business claims, prices, promotions, or regulated content.",
      linkedContentItemId: firstContentId(content, "policy_notice"),
      status: "compliance_hold_local",
      localOnly: true,
      deliveredToBackend: false,
      published: false,
      paymentEnabled: false,
      giftEnabled: false,
    },
    {
      id: createSegmentId("closing", now),
      kind: "closing",
      title: "Closing segment",
      script: "Close the Business Stream locally and keep conversion/payment/gift flows out of scope until monetization phase.",
      linkedContentItemId: null,
      status: "draft_local",
      localOnly: true,
      deliveredToBackend: false,
      published: false,
      paymentEnabled: false,
      giftEnabled: false,
    },
  ];
}

function providerBlockers(): readonly StreamBusinessPresenterSequenceBlockerCode[] {
  return [
    "backend_presenter_sequence_contract_required",
    "realtime_presenter_sequence_provider_required",
    "media_presenter_segment_provider_required",
    "admin_business_sequence_review_required",
    "fake_presenter_sequence_forbidden",
    "fake_business_launch_forbidden",
    "fake_payment_forbidden",
    "fake_gift_forbidden",
    "fake_monetization_forbidden",
  ];
}

function unique<T extends string>(values: readonly T[]): readonly T[] {
  return Array.from(new Set(values));
}

function computeLocalBlockers(
  state: StreamBusinessPresenterSequenceRuntimeState,
  room: StreamRoomRuntimeState,
  stage: StreamRoomStageRuntimeState,
  readiness: StreamBusinessStreamReadinessRuntimeState,
  controls: StreamBusinessRoomControlsRuntimeState,
  content: StreamBusinessShowcaseContentRuntimeState,
): readonly StreamBusinessPresenterSequenceBlockerCode[] {
  const blockers: StreamBusinessPresenterSequenceBlockerCode[] = [];
  if (room.mode !== "businessLive" || stage.layout !== "business_showcase") blockers.push("business_room_required");
  if (readiness.status !== "business_room_ready_local" || readiness.localBlockers.length > 0) blockers.push("business_readiness_required");
  if (controls.status !== "business_controls_ready_local" || controls.localBlockers.length > 0) blockers.push("business_controls_required");
  if (content.contentItems.length === 0) blockers.push("business_content_required");
  if (!content.contentItems.some((item) => item.status === "prepared_local" || item.status === "compliance_review_local")) blockers.push("prepared_showcase_content_required");
  if (state.segments.length === 0) blockers.push("presenter_segment_required");
  if (!state.presenterScriptPreparedLocal || state.segments.some((segment) => cleanText(segment.script, "").length < 12)) blockers.push("presenter_script_required");
  if (!state.activeSegmentId && !state.segments.some((segment) => segment.status === "active_local" || segment.status === "completed_local")) blockers.push("active_segment_required");
  if (!state.qnaPolicyAcknowledgedLocal) blockers.push("qna_policy_ack_required");
  if (!state.complianceCheckpointAcknowledgedLocal || state.segments.some((segment) => segment.status === "compliance_hold_local")) blockers.push("compliance_checkpoint_required");
  if (state.queuedPresenterSequenceEvents < 1) blockers.push("sequence_event_queue_required");
  return unique(blockers);
}

function applyComputedState(
  state: StreamBusinessPresenterSequenceRuntimeState,
  room: StreamRoomRuntimeState,
  stage: StreamRoomStageRuntimeState,
  readiness: StreamBusinessStreamReadinessRuntimeState,
  controls: StreamBusinessRoomControlsRuntimeState,
  content: StreamBusinessShowcaseContentRuntimeState,
  updatedAt: string,
): StreamBusinessPresenterSequenceRuntimeState {
  const localBlockers = computeLocalBlockers(state, room, stage, readiness, controls, content);
  const provider = providerBlockers();
  const hasActiveOrCompleted = state.segments.some((segment) => segment.status === "active_local" || segment.status === "completed_local");
  const status: StreamBusinessPresenterSequenceStatus = state.providerSequenceHandoffRequestedLocal
    ? "provider_sequence_blocked"
    : localBlockers.length > 0
      ? hasActiveOrCompleted || state.presenterScriptPreparedLocal ? "blocked_local" : "preparing_local"
      : "sequence_ready_local";
  return {
    ...state,
    roomId: room.roomId,
    status,
    localBlockers,
    providerBlockers: provider,
    updatedAt,
  };
}

export function createInitialStreamBusinessPresenterSequenceState(
  room: StreamRoomRuntimeState,
  stage: StreamRoomStageRuntimeState,
  readiness: StreamBusinessStreamReadinessRuntimeState,
  controls: StreamBusinessRoomControlsRuntimeState,
  content: StreamBusinessShowcaseContentRuntimeState,
  now?: Date | string | number,
): StreamBusinessPresenterSequenceRuntimeState {
  const updatedAt = nowIso(now);
  const segments = defaultSegments(room, content, now);
  const base: StreamBusinessPresenterSequenceRuntimeState = {
    version: "STREAM-109P",
    roomId: room.roomId,
    status: "not_started_local",
    selectedSegmentId: segments[0]?.id ?? "business-presenter-segment-missing",
    activeSegmentId: null,
    segments,
    qnaPolicyAcknowledgedLocal: false,
    complianceCheckpointAcknowledgedLocal: false,
    presenterScriptPreparedLocal: false,
    queuedPresenterSequenceEvents: 0,
    providerSequenceHandoffRequestedLocal: false,
    localBlockers: [],
    providerBlockers: providerBlockers(),
    integration: defaultIntegration(),
    updatedAt,
  };
  return applyComputedState(base, room, stage, readiness, controls, content, updatedAt);
}

export function syncStreamBusinessPresenterSequenceState(
  state: StreamBusinessPresenterSequenceRuntimeState,
  room: StreamRoomRuntimeState,
  stage: StreamRoomStageRuntimeState,
  readiness: StreamBusinessStreamReadinessRuntimeState,
  controls: StreamBusinessRoomControlsRuntimeState,
  content: StreamBusinessShowcaseContentRuntimeState,
  now?: Date | string | number,
): StreamBusinessPresenterSequenceRuntimeState {
  const updatedAt = nowIso(now);
  const linkedSegments = state.segments.map((segment): StreamBusinessPresenterSegment => {
    if (segment.kind !== "showcase_item" && segment.kind !== "demo_segment" && segment.kind !== "compliance_notice") return segment;
    const kind: StreamBusinessShowcaseContentItem["kind"] = segment.kind === "compliance_notice" ? "policy_notice" : segment.kind === "demo_segment" ? "demo_segment" : "hero_product_card";
    return { ...segment, linkedContentItemId: segment.linkedContentItemId ?? firstContentId(content, kind) };
  });
  const next = { ...state, roomId: room.roomId, segments: linkedSegments };
  return applyComputedState(next, room, stage, readiness, controls, content, updatedAt);
}

function updateSelectedSegment(
  state: StreamBusinessPresenterSequenceRuntimeState,
  updater: (segment: StreamBusinessPresenterSegment) => StreamBusinessPresenterSegment,
  now?: Date | string | number,
): StreamBusinessPresenterSequenceRuntimeState {
  const updatedAt = nowIso(now);
  const selectedId = state.selectedSegmentId || state.segments[0]?.id || "";
  return {
    ...state,
    updatedAt,
    segments: state.segments.map((segment) => segment.id === selectedId ? updater(segment) : segment),
  };
}

export function selectNextStreamBusinessPresenterSegmentLocal(state: StreamBusinessPresenterSequenceRuntimeState, now?: Date | string | number): StreamBusinessPresenterSequenceRuntimeState {
  if (state.segments.length === 0) return state;
  const updatedAt = nowIso(now);
  const currentIndex = Math.max(0, state.segments.findIndex((segment) => segment.id === state.selectedSegmentId));
  const next = state.segments[(currentIndex + 1) % state.segments.length] ?? state.segments[0];
  return { ...state, selectedSegmentId: next.id, updatedAt };
}

export function prepareSelectedStreamBusinessPresenterSegmentLocal(state: StreamBusinessPresenterSequenceRuntimeState, now?: Date | string | number): StreamBusinessPresenterSequenceRuntimeState {
  return updateSelectedSegment(
    { ...state, presenterScriptPreparedLocal: true },
    (segment) => ({ ...segment, status: segment.status === "compliance_hold_local" ? "compliance_hold_local" : "queued_local" }),
    now,
  );
}

export function prepareAllStreamBusinessPresenterSegmentsLocal(state: StreamBusinessPresenterSequenceRuntimeState, now?: Date | string | number): StreamBusinessPresenterSequenceRuntimeState {
  const updatedAt = nowIso(now);
  return {
    ...state,
    presenterScriptPreparedLocal: true,
    updatedAt,
    segments: state.segments.map((segment): StreamBusinessPresenterSegment => ({
      ...segment,
      status: segment.status === "compliance_hold_local" ? "compliance_hold_local" : "queued_local",
    })),
  };
}

export function activateSelectedStreamBusinessPresenterSegmentLocal(state: StreamBusinessPresenterSequenceRuntimeState, now?: Date | string | number): StreamBusinessPresenterSequenceRuntimeState {
  const updatedAt = nowIso(now);
  return {
    ...state,
    activeSegmentId: state.selectedSegmentId,
    updatedAt,
    segments: state.segments.map((segment): StreamBusinessPresenterSegment => ({
      ...segment,
      status: segment.id === state.selectedSegmentId ? "active_local" : segment.status === "active_local" ? "queued_local" : segment.status,
    })),
  };
}

export function completeSelectedStreamBusinessPresenterSegmentLocal(state: StreamBusinessPresenterSequenceRuntimeState, now?: Date | string | number): StreamBusinessPresenterSequenceRuntimeState {
  const updatedAt = nowIso(now);
  const next = updateSelectedSegment(state, (segment) => ({ ...segment, status: "completed_local" }), now);
  return {
    ...next,
    activeSegmentId: state.activeSegmentId === state.selectedSegmentId ? null : state.activeSegmentId,
    updatedAt,
  };
}

export function acknowledgeStreamBusinessPresenterQnaPolicyLocal(state: StreamBusinessPresenterSequenceRuntimeState, now?: Date | string | number): StreamBusinessPresenterSequenceRuntimeState {
  return { ...state, qnaPolicyAcknowledgedLocal: true, updatedAt: nowIso(now) };
}

export function acknowledgeStreamBusinessPresenterComplianceCheckpointLocal(state: StreamBusinessPresenterSequenceRuntimeState, now?: Date | string | number): StreamBusinessPresenterSequenceRuntimeState {
  const updatedAt = nowIso(now);
  return {
    ...state,
    complianceCheckpointAcknowledgedLocal: true,
    updatedAt,
    segments: state.segments.map((segment): StreamBusinessPresenterSegment => ({
      ...segment,
      status: segment.status === "compliance_hold_local" ? "queued_local" : segment.status,
    })),
  };
}

export function runStreamBusinessPresenterSequenceCheck(
  state: StreamBusinessPresenterSequenceRuntimeState,
  room: StreamRoomRuntimeState,
  stage: StreamRoomStageRuntimeState,
  readiness: StreamBusinessStreamReadinessRuntimeState,
  controls: StreamBusinessRoomControlsRuntimeState,
  content: StreamBusinessShowcaseContentRuntimeState,
  now?: Date | string | number,
): StreamBusinessPresenterSequenceRuntimeState {
  return applyComputedState(state, room, stage, readiness, controls, content, nowIso(now));
}

export function queueStreamBusinessPresenterSequenceEvent(
  state: StreamBusinessPresenterSequenceRuntimeState,
  queue: StreamRoomEventQueueRuntimeState,
  room: StreamRoomRuntimeState,
  stage: StreamRoomStageRuntimeState,
  readiness: StreamBusinessStreamReadinessRuntimeState,
  controls: StreamBusinessRoomControlsRuntimeState,
  content: StreamBusinessShowcaseContentRuntimeState,
): { readonly state: StreamBusinessPresenterSequenceRuntimeState; readonly eventQueue: StreamRoomEventQueueRuntimeState } {
  const synced = runStreamBusinessPresenterSequenceCheck(state, room, stage, readiness, controls, content);
  const selected = synced.segments.find((segment) => segment.id === synced.selectedSegmentId) ?? synced.segments[0] ?? null;
  const eventQueue = enqueueLocalStreamRoomEvent(queue, room, {
    kind: "stage",
    label: selected ? `Business presenter segment: ${selected.title}` : "Business presenter sequence",
    priority: synced.localBlockers.length > 0 ? "high" : "normal",
    payload: {
      scope: "business_presenter_sequence",
      status: synced.status,
      selectedSegmentId: selected?.id ?? null,
      selectedSegmentKind: selected?.kind ?? null,
      selectedSegmentStatus: selected?.status ?? null,
      activeSegmentId: synced.activeSegmentId,
      roomMode: room.mode,
      layout: stage.layout,
      queuedPresenterSequenceEvents: synced.queuedPresenterSequenceEvents + 1,
      paymentsAllowedNow: false,
      giftsAllowedNow: false,
      monetizationAllowedNow: false,
      fakePresenterSequenceAllowed: false,
    },
  });
  return {
    state: {
      ...synced,
      queuedPresenterSequenceEvents: synced.queuedPresenterSequenceEvents + 1,
      updatedAt: nowIso(),
    },
    eventQueue,
  };
}

export function requestStreamBusinessPresenterSequenceProviderBlocked(
  state: StreamBusinessPresenterSequenceRuntimeState,
  room: StreamRoomRuntimeState,
  stage: StreamRoomStageRuntimeState,
  readiness: StreamBusinessStreamReadinessRuntimeState,
  controls: StreamBusinessRoomControlsRuntimeState,
  content: StreamBusinessShowcaseContentRuntimeState,
  now?: Date | string | number,
): StreamBusinessPresenterSequenceRuntimeState {
  const updatedAt = nowIso(now);
  const checked = runStreamBusinessPresenterSequenceCheck(state, room, stage, readiness, controls, content, updatedAt);
  return {
    ...checked,
    status: "provider_sequence_blocked",
    providerSequenceHandoffRequestedLocal: true,
    providerBlockers: providerBlockers(),
    updatedAt,
  };
}

export function buildStreamBusinessPresenterSequenceEvidenceSnapshot(state: StreamBusinessPresenterSequenceRuntimeState): StreamBusinessPresenterSequenceEvidenceSnapshot {
  const selected = state.segments.find((segment) => segment.id === state.selectedSegmentId) ?? state.segments[0];
  const provider = providerBlockers();
  return {
    version: "STREAM-109P",
    roomId: state.roomId,
    status: state.status,
    selectedSegmentId: selected?.id ?? state.selectedSegmentId,
    selectedSegmentKind: selected?.kind ?? "intro",
    selectedSegmentStatus: selected?.status ?? "draft_local",
    activeSegmentId: state.activeSegmentId,
    totalSegments: state.segments.length,
    queuedSegments: state.segments.filter((segment) => segment.status === "queued_local").length,
    activeSegments: state.segments.filter((segment) => segment.status === "active_local").length,
    completedSegments: state.segments.filter((segment) => segment.status === "completed_local").length,
    complianceHoldSegments: state.segments.filter((segment) => segment.status === "compliance_hold_local").length,
    providerRequiredSegments: state.segments.filter((segment) => segment.status === "provider_required").length,
    linkedShowcaseSegments: state.segments.filter((segment) => Boolean(segment.linkedContentItemId)).length,
    qnaPolicyAcknowledgedLocal: state.qnaPolicyAcknowledgedLocal,
    complianceCheckpointAcknowledgedLocal: state.complianceCheckpointAcknowledgedLocal,
    presenterScriptPreparedLocal: state.presenterScriptPreparedLocal,
    queuedPresenterSequenceEvents: state.queuedPresenterSequenceEvents,
    providerSequenceHandoffRequestedLocal: state.providerSequenceHandoffRequestedLocal,
    localBlockers: unique(state.localBlockers),
    providerBlockers: unique(provider),
    backendPresenterSequenceContract: state.integration.backendPresenterSequenceContract,
    realtimePresenterSequenceProvider: state.integration.realtimePresenterSequenceProvider,
    mediaPresenterSegmentProvider: state.integration.mediaPresenterSegmentProvider,
    adminBusinessSequenceReview: state.integration.adminBusinessSequenceReview,
    paymentsAllowedNow: false,
    giftsAllowedNow: false,
    monetizationAllowedNow: false,
    walletBridgeRequiredNow: false,
    fakePresenterSequenceAllowed: false,
    fakeBusinessLaunchAllowed: false,
    fakePaymentAllowed: false,
    fakeGiftAllowed: false,
    fakeMonetizationAllowed: false,
    readyForBackendUnion: state.localBlockers.length === 0 && state.queuedPresenterSequenceEvents > 0 && provider.length > 0,
  };
}
