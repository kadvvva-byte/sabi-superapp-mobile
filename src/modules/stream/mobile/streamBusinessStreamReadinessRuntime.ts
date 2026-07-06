import type { StreamBroadcastSource, StreamRoomRuntimeState } from "./streamRoomRuntime";
import type { StreamRoomLayoutState, StreamRoomStageRuntimeState } from "./streamRoomStageRuntime";
import { enqueueLocalStreamRoomEvent, type StreamRoomEventQueueRuntimeState } from "./streamRoomEventQueueRuntime";
import type { StreamScenarioAcceptanceRuntimeState } from "./streamRoomScenarioAcceptanceRuntime";

export type StreamBusinessStreamReadinessStatus =
  | "not_started_local"
  | "checking_local"
  | "blocked_local"
  | "business_room_ready_local"
  | "provider_business_handoff_blocked";

export type StreamBusinessStreamReadinessBlockerCode =
  | "business_room_mode_required"
  | "business_visibility_required"
  | "business_title_required"
  | "business_topic_required"
  | "business_showcase_layout_required"
  | "business_source_required"
  | "business_comments_rail_required"
  | "business_participants_rail_required"
  | "business_moderation_rail_required"
  | "business_profile_draft_required"
  | "business_policy_ack_required"
  | "business_scenario_acceptance_required"
  | "backend_business_room_contract_required"
  | "realtime_business_provider_required"
  | "media_business_provider_required"
  | "admin_business_review_required"
  | "fake_business_launch_forbidden"
  | "fake_payment_forbidden"
  | "fake_gift_forbidden";

export type StreamBusinessProfileDraft = {
  readonly businessName: string;
  readonly businessCategory: string;
  readonly businessContact: string;
  readonly showcaseDescription: string;
  readonly productShowcaseIntentLocal: boolean;
  readonly catalogIntentLocal: boolean;
  readonly paymentIntentEnabled: false;
  readonly giftIntentEnabled: false;
  readonly monetizationIntentEnabled: false;
  readonly localOnly: true;
  readonly deliveredToBackend: false;
};

export type StreamBusinessStreamReadinessIntegration = {
  readonly backendBusinessRoomContract: "not_connected" | "connected";
  readonly realtimeBusinessProvider: "not_configured" | "configured";
  readonly mediaBusinessProvider: "not_configured" | "configured";
  readonly adminBusinessReview: "not_connected" | "connected";
  readonly walletBridgeRequiredNow: false;
  readonly paymentsAllowedNow: false;
  readonly giftsAllowedNow: false;
  readonly monetizationAllowedNow: false;
  readonly fakeBusinessLaunchAllowed: false;
  readonly fakePaymentAllowed: false;
  readonly fakeGiftAllowed: false;
};

export type StreamBusinessStreamReadinessRuntimeState = {
  readonly version: "STREAM-109M";
  readonly roomId: string;
  readonly status: StreamBusinessStreamReadinessStatus;
  readonly requiredSourceOptions: readonly StreamBroadcastSource[];
  readonly requiredLayout: StreamRoomLayoutState;
  readonly selectedBlocker: StreamBusinessStreamReadinessBlockerCode;
  readonly profileDraft: StreamBusinessProfileDraft;
  readonly businessPolicyAcknowledgedLocal: boolean;
  readonly businessCleanPassRanLocal: boolean;
  readonly queuedBusinessReadinessEvents: number;
  readonly providerBusinessHandoffRequestedLocal: boolean;
  readonly localBlockers: readonly StreamBusinessStreamReadinessBlockerCode[];
  readonly providerBlockers: readonly StreamBusinessStreamReadinessBlockerCode[];
  readonly integration: StreamBusinessStreamReadinessIntegration;
  readonly updatedAt: string;
};

export type StreamBusinessStreamReadinessEvidenceSnapshot = {
  readonly version: "STREAM-109M";
  readonly roomId: string;
  readonly status: StreamBusinessStreamReadinessStatus;
  readonly selectedBlocker: StreamBusinessStreamReadinessBlockerCode;
  readonly requiredLayout: StreamRoomLayoutState;
  readonly actualLayout: StreamRoomLayoutState;
  readonly requiredSourceOptions: readonly StreamBroadcastSource[];
  readonly actualSource: StreamBroadcastSource | null;
  readonly businessModeReady: boolean;
  readonly businessVisibilityReady: boolean;
  readonly businessProfileDraftReady: boolean;
  readonly businessPolicyAcknowledgedLocal: boolean;
  readonly scenarioAcceptanceReady: boolean;
  readonly localBlockers: readonly StreamBusinessStreamReadinessBlockerCode[];
  readonly providerBlockers: readonly StreamBusinessStreamReadinessBlockerCode[];
  readonly queuedBusinessReadinessEvents: number;
  readonly providerBusinessHandoffRequestedLocal: boolean;
  readonly backendBusinessRoomContract: StreamBusinessStreamReadinessIntegration["backendBusinessRoomContract"];
  readonly realtimeBusinessProvider: StreamBusinessStreamReadinessIntegration["realtimeBusinessProvider"];
  readonly mediaBusinessProvider: StreamBusinessStreamReadinessIntegration["mediaBusinessProvider"];
  readonly adminBusinessReview: StreamBusinessStreamReadinessIntegration["adminBusinessReview"];
  readonly walletBridgeRequiredNow: false;
  readonly paymentsAllowedNow: false;
  readonly giftsAllowedNow: false;
  readonly monetizationAllowedNow: false;
  readonly fakeBusinessLaunchAllowed: false;
  readonly fakePaymentAllowed: false;
  readonly fakeGiftAllowed: false;
  readonly readyForBackendUnion: boolean;
};

function nowIso(now?: Date | string | number): string {
  if (now instanceof Date) return now.toISOString();
  if (typeof now === "string") return new Date(now).toISOString();
  if (typeof now === "number") return new Date(now).toISOString();
  return new Date().toISOString();
}

function defaultProfileDraft(): StreamBusinessProfileDraft {
  return {
    businessName: "",
    businessCategory: "",
    businessContact: "",
    showcaseDescription: "",
    productShowcaseIntentLocal: false,
    catalogIntentLocal: false,
    paymentIntentEnabled: false,
    giftIntentEnabled: false,
    monetizationIntentEnabled: false,
    localOnly: true,
    deliveredToBackend: false,
  };
}

function defaultIntegration(): StreamBusinessStreamReadinessIntegration {
  return {
    backendBusinessRoomContract: "not_connected",
    realtimeBusinessProvider: "not_configured",
    mediaBusinessProvider: "not_configured",
    adminBusinessReview: "not_connected",
    walletBridgeRequiredNow: false,
    paymentsAllowedNow: false,
    giftsAllowedNow: false,
    monetizationAllowedNow: false,
    fakeBusinessLaunchAllowed: false,
    fakePaymentAllowed: false,
    fakeGiftAllowed: false,
  };
}

function cleanText(value: string | null | undefined): string {
  return String(value ?? "").trim().replace(/\s+/g, " ");
}

function sourceReady(room: StreamRoomRuntimeState, required: readonly StreamBroadcastSource[]): boolean {
  return room.broadcast.source !== null && required.includes(room.broadcast.source);
}

function profileReady(profile: StreamBusinessProfileDraft): boolean {
  return Boolean(cleanText(profile.businessName) && cleanText(profile.businessCategory) && cleanText(profile.businessContact) && cleanText(profile.showcaseDescription));
}

function scenarioAcceptanceReady(acceptance: StreamScenarioAcceptanceRuntimeState): boolean {
  return acceptance.selectedScenarioId === "business_stream_scenario" && acceptance.hints.every((hint) => hint.status === "ready_local" || hint.status === "reviewed_local" || hint.status === "provider_required");
}

function localBlockers(
  room: StreamRoomRuntimeState,
  stage: StreamRoomStageRuntimeState,
  acceptance: StreamScenarioAcceptanceRuntimeState,
  state: Pick<StreamBusinessStreamReadinessRuntimeState, "profileDraft" | "businessPolicyAcknowledgedLocal" | "requiredSourceOptions" | "requiredLayout">,
): readonly StreamBusinessStreamReadinessBlockerCode[] {
  const blockers: StreamBusinessStreamReadinessBlockerCode[] = [];
  if (room.mode !== "businessLive") blockers.push("business_room_mode_required");
  if (room.visibility !== "business_only") blockers.push("business_visibility_required");
  if (!cleanText(room.title)) blockers.push("business_title_required");
  if (!cleanText(room.topic)) blockers.push("business_topic_required");
  if (stage.layout !== state.requiredLayout) blockers.push("business_showcase_layout_required");
  if (!sourceReady(room, state.requiredSourceOptions)) blockers.push("business_source_required");
  if (!stage.commentsVisible) blockers.push("business_comments_rail_required");
  if (!stage.participantsVisible) blockers.push("business_participants_rail_required");
  if (!stage.moderationRailVisible) blockers.push("business_moderation_rail_required");
  if (!profileReady(state.profileDraft)) blockers.push("business_profile_draft_required");
  if (!state.businessPolicyAcknowledgedLocal) blockers.push("business_policy_ack_required");
  if (!scenarioAcceptanceReady(acceptance)) blockers.push("business_scenario_acceptance_required");
  return blockers;
}

function providerBlockers(): readonly StreamBusinessStreamReadinessBlockerCode[] {
  return [
    "backend_business_room_contract_required",
    "realtime_business_provider_required",
    "media_business_provider_required",
    "admin_business_review_required",
    "fake_business_launch_forbidden",
    "fake_payment_forbidden",
    "fake_gift_forbidden",
  ];
}

function statusFor(local: readonly StreamBusinessStreamReadinessBlockerCode[], providerRequested: boolean): StreamBusinessStreamReadinessStatus {
  if (providerRequested) return "provider_business_handoff_blocked";
  if (local.length > 0) return "blocked_local";
  return "business_room_ready_local";
}

function withRecomputed(
  state: StreamBusinessStreamReadinessRuntimeState,
  room: StreamRoomRuntimeState,
  stage: StreamRoomStageRuntimeState,
  acceptance: StreamScenarioAcceptanceRuntimeState,
  now?: Date | string | number,
): StreamBusinessStreamReadinessRuntimeState {
  const local = localBlockers(room, stage, acceptance, state);
  const provider = providerBlockers();
  return {
    ...state,
    roomId: room.roomId,
    localBlockers: local,
    providerBlockers: provider,
    selectedBlocker: local[0] ?? provider[0] ?? "fake_business_launch_forbidden",
    status: state.businessCleanPassRanLocal || state.providerBusinessHandoffRequestedLocal ? statusFor(local, state.providerBusinessHandoffRequestedLocal) : "not_started_local",
    updatedAt: nowIso(now),
  };
}

export function createInitialStreamBusinessStreamReadinessState(
  room: StreamRoomRuntimeState,
  stage: StreamRoomStageRuntimeState,
  acceptance: StreamScenarioAcceptanceRuntimeState,
  now?: Date | string | number,
): StreamBusinessStreamReadinessRuntimeState {
  const base: StreamBusinessStreamReadinessRuntimeState = {
    version: "STREAM-109M",
    roomId: room.roomId,
    status: "not_started_local",
    requiredSourceOptions: ["camera", "video_file", "external_rtmp"],
    requiredLayout: "business_showcase",
    selectedBlocker: "business_room_mode_required",
    profileDraft: defaultProfileDraft(),
    businessPolicyAcknowledgedLocal: false,
    businessCleanPassRanLocal: false,
    queuedBusinessReadinessEvents: 0,
    providerBusinessHandoffRequestedLocal: false,
    localBlockers: [],
    providerBlockers: providerBlockers(),
    integration: defaultIntegration(),
    updatedAt: nowIso(now),
  };
  return withRecomputed(base, room, stage, acceptance, now);
}

export function syncStreamBusinessStreamReadinessState(
  state: StreamBusinessStreamReadinessRuntimeState,
  room: StreamRoomRuntimeState,
  stage: StreamRoomStageRuntimeState,
  acceptance: StreamScenarioAcceptanceRuntimeState,
  now?: Date | string | number,
): StreamBusinessStreamReadinessRuntimeState {
  return withRecomputed(state, room, stage, acceptance, now);
}

export function patchStreamBusinessProfileDraftLocal(
  state: StreamBusinessStreamReadinessRuntimeState,
  room: StreamRoomRuntimeState,
  patch: Partial<Pick<StreamBusinessProfileDraft, "businessName" | "businessCategory" | "businessContact" | "showcaseDescription" | "productShowcaseIntentLocal" | "catalogIntentLocal">>,
  now?: Date | string | number,
): StreamBusinessStreamReadinessRuntimeState {
  return {
    ...state,
    roomId: room.roomId,
    profileDraft: {
      ...state.profileDraft,
      businessName: cleanText(patch.businessName ?? state.profileDraft.businessName),
      businessCategory: cleanText(patch.businessCategory ?? state.profileDraft.businessCategory),
      businessContact: cleanText(patch.businessContact ?? state.profileDraft.businessContact),
      showcaseDescription: cleanText(patch.showcaseDescription ?? state.profileDraft.showcaseDescription),
      productShowcaseIntentLocal: patch.productShowcaseIntentLocal ?? state.profileDraft.productShowcaseIntentLocal,
      catalogIntentLocal: patch.catalogIntentLocal ?? state.profileDraft.catalogIntentLocal,
      paymentIntentEnabled: false,
      giftIntentEnabled: false,
      monetizationIntentEnabled: false,
      localOnly: true,
      deliveredToBackend: false,
    },
    updatedAt: nowIso(now),
  };
}

export function acknowledgeStreamBusinessPolicyLocal(
  state: StreamBusinessStreamReadinessRuntimeState,
  now?: Date | string | number,
): StreamBusinessStreamReadinessRuntimeState {
  return {
    ...state,
    businessPolicyAcknowledgedLocal: true,
    updatedAt: nowIso(now),
  };
}

export function runStreamBusinessStreamReadinessCleanPass(
  state: StreamBusinessStreamReadinessRuntimeState,
  room: StreamRoomRuntimeState,
  stage: StreamRoomStageRuntimeState,
  acceptance: StreamScenarioAcceptanceRuntimeState,
  now?: Date | string | number,
): StreamBusinessStreamReadinessRuntimeState {
  const checked = {
    ...state,
    businessCleanPassRanLocal: true,
    providerBusinessHandoffRequestedLocal: false,
    updatedAt: nowIso(now),
  };
  return withRecomputed(checked, room, stage, acceptance, now);
}

export function queueStreamBusinessReadinessEvent(
  state: StreamBusinessStreamReadinessRuntimeState,
  eventQueue: StreamRoomEventQueueRuntimeState,
  room: StreamRoomRuntimeState,
  stage: StreamRoomStageRuntimeState,
  acceptance: StreamScenarioAcceptanceRuntimeState,
  now?: Date | string | number,
): { readonly state: StreamBusinessStreamReadinessRuntimeState; readonly eventQueue: StreamRoomEventQueueRuntimeState } {
  const checked = runStreamBusinessStreamReadinessCleanPass(state, room, stage, acceptance, now);
  const nextQueue = enqueueLocalStreamRoomEvent(eventQueue, room, {
    kind: "stage",
    label: "Business Stream readiness clean pass",
    priority: checked.localBlockers.length === 0 ? "high" : "normal",
    payload: {
      roomId: room.roomId,
      mode: room.mode,
      visibility: room.visibility,
      layout: stage.layout,
      source: room.broadcast.source,
      localBlockers: checked.localBlockers.length,
      profileDraftReady: profileReady(checked.profileDraft),
      businessPolicyAcknowledgedLocal: checked.businessPolicyAcknowledgedLocal,
      paymentsAllowedNow: false,
      giftsAllowedNow: false,
      monetizationAllowedNow: false,
      fakeBusinessLaunchAllowed: false,
    },
  }, now);
  return {
    state: {
      ...checked,
      queuedBusinessReadinessEvents: checked.queuedBusinessReadinessEvents + 1,
      updatedAt: nowIso(now),
    },
    eventQueue: nextQueue,
  };
}

export function requestStreamBusinessProviderHandoffBlocked(
  state: StreamBusinessStreamReadinessRuntimeState,
  room: StreamRoomRuntimeState,
  stage: StreamRoomStageRuntimeState,
  acceptance: StreamScenarioAcceptanceRuntimeState,
  now?: Date | string | number,
): StreamBusinessStreamReadinessRuntimeState {
  const checked = runStreamBusinessStreamReadinessCleanPass(state, room, stage, acceptance, now);
  return withRecomputed({ ...checked, providerBusinessHandoffRequestedLocal: true, updatedAt: nowIso(now) }, room, stage, acceptance, now);
}

export function buildStreamBusinessStreamReadinessEvidenceSnapshot(
  state: StreamBusinessStreamReadinessRuntimeState,
  room: StreamRoomRuntimeState,
  stage: StreamRoomStageRuntimeState,
  acceptance: StreamScenarioAcceptanceRuntimeState,
): StreamBusinessStreamReadinessEvidenceSnapshot {
  const local = localBlockers(room, stage, acceptance, state);
  const provider = providerBlockers();
  const profileDraftIsReady = profileReady(state.profileDraft);
  const acceptanceReady = scenarioAcceptanceReady(acceptance);
  return {
    version: "STREAM-109M",
    roomId: room.roomId,
    status: statusFor(local, state.providerBusinessHandoffRequestedLocal),
    selectedBlocker: local[0] ?? provider[0] ?? state.selectedBlocker,
    requiredLayout: state.requiredLayout,
    actualLayout: stage.layout,
    requiredSourceOptions: state.requiredSourceOptions,
    actualSource: room.broadcast.source,
    businessModeReady: room.mode === "businessLive",
    businessVisibilityReady: room.visibility === "business_only",
    businessProfileDraftReady: profileDraftIsReady,
    businessPolicyAcknowledgedLocal: state.businessPolicyAcknowledgedLocal,
    scenarioAcceptanceReady: acceptanceReady,
    localBlockers: local,
    providerBlockers: provider,
    queuedBusinessReadinessEvents: state.queuedBusinessReadinessEvents,
    providerBusinessHandoffRequestedLocal: state.providerBusinessHandoffRequestedLocal,
    backendBusinessRoomContract: state.integration.backendBusinessRoomContract,
    realtimeBusinessProvider: state.integration.realtimeBusinessProvider,
    mediaBusinessProvider: state.integration.mediaBusinessProvider,
    adminBusinessReview: state.integration.adminBusinessReview,
    walletBridgeRequiredNow: false,
    paymentsAllowedNow: false,
    giftsAllowedNow: false,
    monetizationAllowedNow: false,
    fakeBusinessLaunchAllowed: false,
    fakePaymentAllowed: false,
    fakeGiftAllowed: false,
    readyForBackendUnion: false,
  };
}
