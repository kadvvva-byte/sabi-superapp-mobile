import type { StreamBroadcastSource, StreamRoomRuntimeState } from "./streamRoomRuntime";
import type { StreamRoomLayoutState, StreamRoomStageRuntimeState } from "./streamRoomStageRuntime";
import { enqueueLocalStreamRoomEvent, type StreamRoomEventQueueRuntimeState } from "./streamRoomEventQueueRuntime";
import type { StreamBusinessStreamReadinessRuntimeState } from "./streamBusinessStreamReadinessRuntime";

export type StreamBusinessRoomControlsStatus =
  | "not_started_local"
  | "checking_local"
  | "blocked_local"
  | "business_controls_ready_local"
  | "provider_controls_blocked";

export type StreamBusinessShowcaseRailId =
  | "business_showcase"
  | "business_catalog_preview"
  | "business_host_notes"
  | "business_contact_info"
  | "business_compliance"
  | "business_moderation"
  | "business_support";

export type StreamBusinessHostRoleId =
  | "business_host"
  | "co_presenter"
  | "product_moderator"
  | "compliance_reviewer"
  | "support_agent";

export type StreamBusinessControlStatus = "pending_local" | "prepared_local" | "review_required" | "provider_required";

export type StreamBusinessRoomControlsBlockerCode =
  | "business_room_required"
  | "business_readiness_clean_pass_required"
  | "business_showcase_layout_required"
  | "business_visibility_required"
  | "business_source_required"
  | "business_showcase_rail_required"
  | "business_compliance_policy_required"
  | "business_moderation_policy_required"
  | "business_host_role_required"
  | "business_support_role_required"
  | "business_event_queue_required"
  | "backend_business_controls_contract_required"
  | "realtime_business_controls_provider_required"
  | "media_business_controls_provider_required"
  | "admin_business_compliance_review_required"
  | "business_policy_backend_required"
  | "fake_business_controls_forbidden"
  | "fake_business_launch_forbidden"
  | "fake_payment_forbidden"
  | "fake_gift_forbidden"
  | "fake_monetization_forbidden";

export type StreamBusinessShowcaseRail = {
  readonly id: StreamBusinessShowcaseRailId;
  readonly label: string;
  readonly status: StreamBusinessControlStatus;
  readonly localOnly: true;
  readonly deliveredToBackend: false;
};

export type StreamBusinessHostRoleControl = {
  readonly id: StreamBusinessHostRoleId;
  readonly label: string;
  readonly assignedParticipantId: string | null;
  readonly status: StreamBusinessControlStatus;
  readonly localOnly: true;
  readonly deliveredToBackend: false;
};

export type StreamBusinessRoomControlsIntegration = {
  readonly backendBusinessControlsContract: "not_connected" | "connected";
  readonly realtimeBusinessControlsProvider: "not_configured" | "configured";
  readonly mediaBusinessControlsProvider: "not_configured" | "configured";
  readonly adminBusinessComplianceReview: "not_connected" | "connected";
  readonly businessPolicyBackend: "not_connected" | "connected";
  readonly paymentsAllowedNow: false;
  readonly giftsAllowedNow: false;
  readonly monetizationAllowedNow: false;
  readonly walletBridgeRequiredNow: false;
  readonly fakeBusinessControlsAllowed: false;
  readonly fakeBusinessLaunchAllowed: false;
  readonly fakePaymentAllowed: false;
  readonly fakeGiftAllowed: false;
  readonly fakeMonetizationAllowed: false;
};

export type StreamBusinessRoomControlsRuntimeState = {
  readonly version: "STREAM-109N";
  readonly roomId: string;
  readonly status: StreamBusinessRoomControlsStatus;
  readonly selectedRailId: StreamBusinessShowcaseRailId;
  readonly selectedHostRoleId: StreamBusinessHostRoleId;
  readonly showcaseRails: readonly StreamBusinessShowcaseRail[];
  readonly hostRoleControls: readonly StreamBusinessHostRoleControl[];
  readonly businessCompliancePolicyAcknowledgedLocal: boolean;
  readonly businessModerationPolicyAcknowledgedLocal: boolean;
  readonly showcaseControlsPreparedLocal: boolean;
  readonly controlsCheckRanLocal: boolean;
  readonly queuedBusinessControlEvents: number;
  readonly providerControlsHandoffRequestedLocal: boolean;
  readonly localBlockers: readonly StreamBusinessRoomControlsBlockerCode[];
  readonly providerBlockers: readonly StreamBusinessRoomControlsBlockerCode[];
  readonly integration: StreamBusinessRoomControlsIntegration;
  readonly updatedAt: string;
};

export type StreamBusinessRoomControlsEvidenceSnapshot = {
  readonly version: "STREAM-109N";
  readonly roomId: string;
  readonly status: StreamBusinessRoomControlsStatus;
  readonly selectedRailId: StreamBusinessShowcaseRailId;
  readonly selectedHostRoleId: StreamBusinessHostRoleId;
  readonly roomMode: StreamRoomRuntimeState["mode"];
  readonly visibility: StreamRoomRuntimeState["visibility"];
  readonly layout: StreamRoomLayoutState;
  readonly source: StreamBroadcastSource | null;
  readonly preparedRails: number;
  readonly pendingRails: number;
  readonly assignedBusinessRoles: number;
  readonly providerRequiredRoles: number;
  readonly businessCompliancePolicyAcknowledgedLocal: boolean;
  readonly businessModerationPolicyAcknowledgedLocal: boolean;
  readonly showcaseControlsPreparedLocal: boolean;
  readonly controlsCheckRanLocal: boolean;
  readonly queuedBusinessControlEvents: number;
  readonly providerControlsHandoffRequestedLocal: boolean;
  readonly localBlockers: readonly StreamBusinessRoomControlsBlockerCode[];
  readonly providerBlockers: readonly StreamBusinessRoomControlsBlockerCode[];
  readonly backendBusinessControlsContract: StreamBusinessRoomControlsIntegration["backendBusinessControlsContract"];
  readonly realtimeBusinessControlsProvider: StreamBusinessRoomControlsIntegration["realtimeBusinessControlsProvider"];
  readonly mediaBusinessControlsProvider: StreamBusinessRoomControlsIntegration["mediaBusinessControlsProvider"];
  readonly adminBusinessComplianceReview: StreamBusinessRoomControlsIntegration["adminBusinessComplianceReview"];
  readonly businessPolicyBackend: StreamBusinessRoomControlsIntegration["businessPolicyBackend"];
  readonly paymentsAllowedNow: false;
  readonly giftsAllowedNow: false;
  readonly monetizationAllowedNow: false;
  readonly walletBridgeRequiredNow: false;
  readonly fakeBusinessControlsAllowed: false;
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

function defaultRails(): readonly StreamBusinessShowcaseRail[] {
  return [
    { id: "business_showcase", label: "Business showcase rail", status: "pending_local", localOnly: true, deliveredToBackend: false },
    { id: "business_catalog_preview", label: "Catalog preview rail", status: "pending_local", localOnly: true, deliveredToBackend: false },
    { id: "business_host_notes", label: "Host notes rail", status: "pending_local", localOnly: true, deliveredToBackend: false },
    { id: "business_contact_info", label: "Business contact rail", status: "pending_local", localOnly: true, deliveredToBackend: false },
    { id: "business_compliance", label: "Compliance rail", status: "pending_local", localOnly: true, deliveredToBackend: false },
    { id: "business_moderation", label: "Business moderation rail", status: "pending_local", localOnly: true, deliveredToBackend: false },
    { id: "business_support", label: "Support rail", status: "pending_local", localOnly: true, deliveredToBackend: false },
  ];
}

function defaultHostRoles(hostId: string | null): readonly StreamBusinessHostRoleControl[] {
  return [
    { id: "business_host", label: "Business host", assignedParticipantId: hostId, status: hostId ? "prepared_local" : "pending_local", localOnly: true, deliveredToBackend: false },
    { id: "co_presenter", label: "Co-presenter", assignedParticipantId: null, status: "pending_local", localOnly: true, deliveredToBackend: false },
    { id: "product_moderator", label: "Product moderator", assignedParticipantId: null, status: "pending_local", localOnly: true, deliveredToBackend: false },
    { id: "compliance_reviewer", label: "Compliance reviewer", assignedParticipantId: null, status: "pending_local", localOnly: true, deliveredToBackend: false },
    { id: "support_agent", label: "Support agent", assignedParticipantId: null, status: "pending_local", localOnly: true, deliveredToBackend: false },
  ];
}

function defaultIntegration(): StreamBusinessRoomControlsIntegration {
  return {
    backendBusinessControlsContract: "not_connected",
    realtimeBusinessControlsProvider: "not_configured",
    mediaBusinessControlsProvider: "not_configured",
    adminBusinessComplianceReview: "not_connected",
    businessPolicyBackend: "not_connected",
    paymentsAllowedNow: false,
    giftsAllowedNow: false,
    monetizationAllowedNow: false,
    walletBridgeRequiredNow: false,
    fakeBusinessControlsAllowed: false,
    fakeBusinessLaunchAllowed: false,
    fakePaymentAllowed: false,
    fakeGiftAllowed: false,
    fakeMonetizationAllowed: false,
  };
}

function providerBlockers(): readonly StreamBusinessRoomControlsBlockerCode[] {
  return [
    "backend_business_controls_contract_required",
    "realtime_business_controls_provider_required",
    "media_business_controls_provider_required",
    "admin_business_compliance_review_required",
    "business_policy_backend_required",
    "fake_business_controls_forbidden",
    "fake_business_launch_forbidden",
    "fake_payment_forbidden",
    "fake_gift_forbidden",
    "fake_monetization_forbidden",
  ];
}

function isBusinessSourceReady(source: StreamBroadcastSource | null): boolean {
  return source === "camera" || source === "video_file" || source === "external_rtmp";
}

function readinessReady(readiness: StreamBusinessStreamReadinessRuntimeState): boolean {
  return readiness.localBlockers.length === 0 && (readiness.status === "business_room_ready_local" || readiness.status === "provider_business_handoff_blocked");
}

function localBlockers(
  room: StreamRoomRuntimeState,
  stage: StreamRoomStageRuntimeState,
  readiness: StreamBusinessStreamReadinessRuntimeState,
  state: Pick<StreamBusinessRoomControlsRuntimeState, "showcaseRails" | "hostRoleControls" | "businessCompliancePolicyAcknowledgedLocal" | "businessModerationPolicyAcknowledgedLocal" | "queuedBusinessControlEvents">,
): readonly StreamBusinessRoomControlsBlockerCode[] {
  const blockers: StreamBusinessRoomControlsBlockerCode[] = [];
  if (room.mode !== "businessLive") blockers.push("business_room_required");
  if (!readinessReady(readiness)) blockers.push("business_readiness_clean_pass_required");
  if (room.visibility !== "business_only") blockers.push("business_visibility_required");
  if (stage.layout !== "business_showcase") blockers.push("business_showcase_layout_required");
  if (!isBusinessSourceReady(room.broadcast.source)) blockers.push("business_source_required");
  if (state.showcaseRails.filter((rail) => rail.status === "prepared_local").length < 4) blockers.push("business_showcase_rail_required");
  if (!state.businessCompliancePolicyAcknowledgedLocal) blockers.push("business_compliance_policy_required");
  if (!state.businessModerationPolicyAcknowledgedLocal) blockers.push("business_moderation_policy_required");
  if (!state.hostRoleControls.some((role) => role.id === "business_host" && role.assignedParticipantId)) blockers.push("business_host_role_required");
  if (!state.hostRoleControls.some((role) => role.id === "support_agent" && role.status === "prepared_local")) blockers.push("business_support_role_required");
  if (state.queuedBusinessControlEvents === 0) blockers.push("business_event_queue_required");
  return Array.from(new Set(blockers));
}

function statusFor(local: readonly StreamBusinessRoomControlsBlockerCode[], providerRequested: boolean): StreamBusinessRoomControlsStatus {
  if (providerRequested) return "provider_controls_blocked";
  if (local.length > 0) return "blocked_local";
  return "business_controls_ready_local";
}

function recompute(
  state: StreamBusinessRoomControlsRuntimeState,
  room: StreamRoomRuntimeState,
  stage: StreamRoomStageRuntimeState,
  readiness: StreamBusinessStreamReadinessRuntimeState,
  now?: Date | string | number,
): StreamBusinessRoomControlsRuntimeState {
  const blockers = localBlockers(room, stage, readiness, state);
  return {
    ...state,
    roomId: room.roomId,
    localBlockers: blockers,
    providerBlockers: providerBlockers(),
    status: statusFor(blockers, state.providerControlsHandoffRequestedLocal),
    updatedAt: nowIso(now),
  };
}

export function createInitialStreamBusinessRoomControlsState(
  room: StreamRoomRuntimeState,
  stage: StreamRoomStageRuntimeState,
  readiness: StreamBusinessStreamReadinessRuntimeState,
  now?: Date | string | number,
): StreamBusinessRoomControlsRuntimeState {
  const createdAt = nowIso(now);
  const initial: StreamBusinessRoomControlsRuntimeState = {
    version: "STREAM-109N",
    roomId: room.roomId,
    status: "not_started_local",
    selectedRailId: "business_showcase",
    selectedHostRoleId: "business_host",
    showcaseRails: defaultRails(),
    hostRoleControls: defaultHostRoles(room.hostId),
    businessCompliancePolicyAcknowledgedLocal: false,
    businessModerationPolicyAcknowledgedLocal: false,
    showcaseControlsPreparedLocal: false,
    controlsCheckRanLocal: false,
    queuedBusinessControlEvents: 0,
    providerControlsHandoffRequestedLocal: false,
    localBlockers: [],
    providerBlockers: providerBlockers(),
    integration: defaultIntegration(),
    updatedAt: createdAt,
  };
  return recompute(initial, room, stage, readiness, now);
}

export function syncStreamBusinessRoomControlsState(
  state: StreamBusinessRoomControlsRuntimeState,
  room: StreamRoomRuntimeState,
  stage: StreamRoomStageRuntimeState,
  readiness: StreamBusinessStreamReadinessRuntimeState,
  now?: Date | string | number,
): StreamBusinessRoomControlsRuntimeState {
  const syncedRoles = state.hostRoleControls.map((role) => role.id === "business_host" && !role.assignedParticipantId && room.hostId
    ? { ...role, assignedParticipantId: room.hostId, status: "prepared_local" as const }
    : role);
  return recompute({ ...state, hostRoleControls: syncedRoles }, room, stage, readiness, now);
}

export function selectStreamBusinessShowcaseRailLocal(state: StreamBusinessRoomControlsRuntimeState, railId?: StreamBusinessShowcaseRailId): StreamBusinessRoomControlsRuntimeState {
  const rails = state.showcaseRails;
  const currentIndex = rails.findIndex((rail) => rail.id === state.selectedRailId);
  const selectedRailId = railId ?? rails[(currentIndex + 1) % Math.max(rails.length, 1)]?.id ?? "business_showcase";
  return { ...state, selectedRailId, updatedAt: nowIso() };
}

export function prepareSelectedStreamBusinessShowcaseRailLocal(state: StreamBusinessRoomControlsRuntimeState): StreamBusinessRoomControlsRuntimeState {
  const updatedAt = nowIso();
  return {
    ...state,
    updatedAt,
    showcaseControlsPreparedLocal: true,
    showcaseRails: state.showcaseRails.map((rail) => rail.id === state.selectedRailId ? { ...rail, status: "prepared_local" } : rail),
  };
}

export function prepareAllStreamBusinessShowcaseRailsLocal(state: StreamBusinessRoomControlsRuntimeState): StreamBusinessRoomControlsRuntimeState {
  const updatedAt = nowIso();
  return {
    ...state,
    updatedAt,
    showcaseControlsPreparedLocal: true,
    showcaseRails: state.showcaseRails.map((rail) => ({ ...rail, status: rail.id === "business_support" ? "review_required" : "prepared_local" })),
  };
}

export function selectStreamBusinessHostRoleLocal(state: StreamBusinessRoomControlsRuntimeState, roleId?: StreamBusinessHostRoleId): StreamBusinessRoomControlsRuntimeState {
  const roles = state.hostRoleControls;
  const currentIndex = roles.findIndex((role) => role.id === state.selectedHostRoleId);
  const selectedHostRoleId = roleId ?? roles[(currentIndex + 1) % Math.max(roles.length, 1)]?.id ?? "business_host";
  return { ...state, selectedHostRoleId, updatedAt: nowIso() };
}

export function assignSelectedStreamBusinessHostRoleLocal(
  state: StreamBusinessRoomControlsRuntimeState,
  room: StreamRoomRuntimeState,
): StreamBusinessRoomControlsRuntimeState {
  const participant = room.participants.find((item) => item.role === "cohost" && !item.blocked) ?? room.participants.find((item) => item.id !== room.hostId && !item.blocked) ?? room.participants.find((item) => item.id === room.hostId) ?? room.participants[0];
  const updatedAt = nowIso();
  return {
    ...state,
    updatedAt,
    hostRoleControls: state.hostRoleControls.map((role) => role.id === state.selectedHostRoleId ? { ...role, assignedParticipantId: participant?.id ?? null, status: participant ? "prepared_local" : "pending_local" } : role),
  };
}

export function acknowledgeStreamBusinessCompliancePolicyLocal(state: StreamBusinessRoomControlsRuntimeState): StreamBusinessRoomControlsRuntimeState {
  return { ...state, businessCompliancePolicyAcknowledgedLocal: true, updatedAt: nowIso() };
}

export function acknowledgeStreamBusinessModerationPolicyLocal(state: StreamBusinessRoomControlsRuntimeState): StreamBusinessRoomControlsRuntimeState {
  return { ...state, businessModerationPolicyAcknowledgedLocal: true, updatedAt: nowIso() };
}

export function runStreamBusinessRoomControlsCheck(
  state: StreamBusinessRoomControlsRuntimeState,
  room: StreamRoomRuntimeState,
  stage: StreamRoomStageRuntimeState,
  readiness: StreamBusinessStreamReadinessRuntimeState,
): StreamBusinessRoomControlsRuntimeState {
  return recompute({ ...state, controlsCheckRanLocal: true, status: "checking_local" }, room, stage, readiness);
}

export function queueStreamBusinessRoomControlsEvent(
  state: StreamBusinessRoomControlsRuntimeState,
  eventQueue: StreamRoomEventQueueRuntimeState,
  room: StreamRoomRuntimeState,
  stage: StreamRoomStageRuntimeState,
  readiness: StreamBusinessStreamReadinessRuntimeState,
): { readonly state: StreamBusinessRoomControlsRuntimeState; readonly eventQueue: StreamRoomEventQueueRuntimeState } {
  const checked = runStreamBusinessRoomControlsCheck(state, room, stage, readiness);
  const nextQueue = enqueueLocalStreamRoomEvent(eventQueue, room, {
    kind: "provider_handoff_request",
    label: "Business Stream room controls local evidence",
    priority: "high",
    payload: {
      roomId: room.roomId,
      mode: room.mode,
      selectedRailId: checked.selectedRailId,
      selectedHostRoleId: checked.selectedHostRoleId,
      preparedRails: checked.showcaseRails.filter((rail) => rail.status === "prepared_local").length,
      assignedBusinessRoles: checked.hostRoleControls.filter((role) => Boolean(role.assignedParticipantId)).length,
      businessControlsReadyLocal: checked.localBlockers.length === 0,
      deliveredToProvider: false,
      fakeBusinessControlsAllowed: false,
      fakePaymentAllowed: false,
      fakeGiftAllowed: false,
    },
  });
  return {
    state: recompute({ ...checked, queuedBusinessControlEvents: checked.queuedBusinessControlEvents + 1 }, room, stage, readiness),
    eventQueue: nextQueue,
  };
}

export function requestStreamBusinessControlsProviderBlocked(
  state: StreamBusinessRoomControlsRuntimeState,
  room: StreamRoomRuntimeState,
  stage: StreamRoomStageRuntimeState,
  readiness: StreamBusinessStreamReadinessRuntimeState,
): StreamBusinessRoomControlsRuntimeState {
  return recompute({ ...state, providerControlsHandoffRequestedLocal: true }, room, stage, readiness);
}

export function buildStreamBusinessRoomControlsEvidenceSnapshot(
  state: StreamBusinessRoomControlsRuntimeState,
  room: StreamRoomRuntimeState,
  stage: StreamRoomStageRuntimeState,
): StreamBusinessRoomControlsEvidenceSnapshot {
  const preparedRails = state.showcaseRails.filter((rail) => rail.status === "prepared_local").length;
  const pendingRails = state.showcaseRails.filter((rail) => rail.status === "pending_local").length;
  const assignedBusinessRoles = state.hostRoleControls.filter((role) => Boolean(role.assignedParticipantId)).length;
  const providerRequiredRoles = state.hostRoleControls.filter((role) => role.status === "provider_required" || role.status === "review_required").length;
  return {
    version: "STREAM-109N",
    roomId: state.roomId,
    status: state.status,
    selectedRailId: state.selectedRailId,
    selectedHostRoleId: state.selectedHostRoleId,
    roomMode: room.mode,
    visibility: room.visibility,
    layout: stage.layout,
    source: room.broadcast.source,
    preparedRails,
    pendingRails,
    assignedBusinessRoles,
    providerRequiredRoles,
    businessCompliancePolicyAcknowledgedLocal: state.businessCompliancePolicyAcknowledgedLocal,
    businessModerationPolicyAcknowledgedLocal: state.businessModerationPolicyAcknowledgedLocal,
    showcaseControlsPreparedLocal: state.showcaseControlsPreparedLocal,
    controlsCheckRanLocal: state.controlsCheckRanLocal,
    queuedBusinessControlEvents: state.queuedBusinessControlEvents,
    providerControlsHandoffRequestedLocal: state.providerControlsHandoffRequestedLocal,
    localBlockers: state.localBlockers,
    providerBlockers: state.providerBlockers,
    backendBusinessControlsContract: state.integration.backendBusinessControlsContract,
    realtimeBusinessControlsProvider: state.integration.realtimeBusinessControlsProvider,
    mediaBusinessControlsProvider: state.integration.mediaBusinessControlsProvider,
    adminBusinessComplianceReview: state.integration.adminBusinessComplianceReview,
    businessPolicyBackend: state.integration.businessPolicyBackend,
    paymentsAllowedNow: false,
    giftsAllowedNow: false,
    monetizationAllowedNow: false,
    walletBridgeRequiredNow: false,
    fakeBusinessControlsAllowed: false,
    fakeBusinessLaunchAllowed: false,
    fakePaymentAllowed: false,
    fakeGiftAllowed: false,
    fakeMonetizationAllowed: false,
    readyForBackendUnion: true,
  };
}
