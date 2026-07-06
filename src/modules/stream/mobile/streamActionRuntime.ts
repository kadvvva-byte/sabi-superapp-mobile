export type StreamLaunchMode = "soloLive" | "groupLive" | "audioLive" | "gameLive" | "cinemaLive" | "businessLive";
export type StreamVisibility = "public" | "followers" | "private" | "business_only";
export type StreamPermissionStatus = "unknown" | "granted" | "denied";
export type StreamProviderStatus = "unconfigured" | "configured";
export type StreamAdminApprovalStatus = "not_submitted" | "pending_review" | "approved" | "rejected";
export type StreamLocalPreviewStatus = "closed" | "ready";

export type StreamActionResultStatus =
  | "draft_updated"
  | "permission_updated"
  | "local_preview_ready"
  | "local_preview_closed"
  | "start_live_blocked"
  | "provider_handoff_required";

export type StreamActionBlockerCode =
  | "title_required"
  | "topic_required"
  | "description_required_for_business"
  | "camera_permission_required"
  | "microphone_permission_required"
  | "stream_provider_not_configured"
  | "streamer_admin_approval_required"
  | "business_stream_requires_business_visibility";

export type StreamActionLogEntry = {
  readonly id: string;
  readonly action: string;
  readonly status: StreamActionResultStatus;
  readonly createdAt: string;
  readonly blockers: readonly StreamActionBlockerCode[];
};

export type StreamLocalDraft = {
  readonly mode: StreamLaunchMode;
  readonly title: string;
  readonly topic: string;
  readonly description: string;
  readonly visibility: StreamVisibility;
  readonly tags: readonly string[];
  readonly scheduledAt: string | null;
};

export type StreamPermissionSnapshot = {
  readonly camera: StreamPermissionStatus;
  readonly microphone: StreamPermissionStatus;
};

export type StreamIntegrationSnapshot = {
  readonly provider: StreamProviderStatus;
  readonly adminApproval: StreamAdminApprovalStatus;
  readonly fakeLiveAllowed: false;
  readonly fakeProviderAllowed: false;
  readonly fakePaymentAllowed: false;
  readonly fakeLaunchCompleteAllowed: false;
};

export type StreamLocalPreviewSnapshot = {
  readonly status: StreamLocalPreviewStatus;
  readonly draftId: string | null;
  readonly openedAt: string | null;
};

export type StreamActionRuntimeState = {
  readonly draftId: string;
  readonly draft: StreamLocalDraft;
  readonly permissions: StreamPermissionSnapshot;
  readonly integration: StreamIntegrationSnapshot;
  readonly preview: StreamLocalPreviewSnapshot;
  readonly actionLog: readonly StreamActionLogEntry[];
};

export type StreamDraftPatch = Partial<Pick<StreamLocalDraft, "mode" | "title" | "topic" | "description" | "visibility" | "tags" | "scheduledAt">>;

export type StreamActionResult = {
  readonly status: StreamActionResultStatus;
  readonly blockers: readonly StreamActionBlockerCode[];
  readonly canOpenLocalPreview: boolean;
  readonly canRequestProviderHandoff: boolean;
  readonly state: StreamActionRuntimeState;
};

const DEFAULT_DRAFT_ID = "stream-local-draft";
const MAX_LOG_SIZE = 24;

function normalizeText(value: string | null | undefined): string {
  return String(value ?? "").trim().replace(/\s+/g, " ");
}

function normalizeTags(tags: readonly string[] | null | undefined): readonly string[] {
  const unique = new Set<string>();
  for (const tag of tags ?? []) {
    const normalized = normalizeText(tag).toLowerCase();
    if (normalized.length > 0) {
      unique.add(normalized.slice(0, 32));
    }
  }
  return Array.from(unique).slice(0, 8);
}

function nowIso(now: Date | string | number | undefined): string {
  if (now instanceof Date) {
    return now.toISOString();
  }
  if (typeof now === "string") {
    return new Date(now).toISOString();
  }
  if (typeof now === "number") {
    return new Date(now).toISOString();
  }
  return new Date().toISOString();
}

function createActionLogEntry(action: string, status: StreamActionResultStatus, blockers: readonly StreamActionBlockerCode[], now?: Date | string | number): StreamActionLogEntry {
  const createdAt = nowIso(now);
  return {
    id: `${action}-${createdAt}`,
    action,
    status,
    createdAt,
    blockers,
  };
}

function appendActionLog(
  state: StreamActionRuntimeState,
  action: string,
  status: StreamActionResultStatus,
  blockers: readonly StreamActionBlockerCode[],
  now?: Date | string | number,
): StreamActionRuntimeState {
  return {
    ...state,
    actionLog: [createActionLogEntry(action, status, blockers, now), ...state.actionLog].slice(0, MAX_LOG_SIZE),
  };
}

export function createInitialStreamActionRuntimeState(params: {
  readonly draftId?: string;
  readonly mode?: StreamLaunchMode;
  readonly now?: Date | string | number;
} = {}): StreamActionRuntimeState {
  const mode = params.mode ?? "soloLive";
  return {
    draftId: params.draftId ?? DEFAULT_DRAFT_ID,
    draft: {
      mode,
      title: "",
      topic: "",
      description: "",
      visibility: mode === "businessLive" ? "business_only" : "public",
      tags: [],
      scheduledAt: null,
    },
    permissions: {
      camera: "unknown",
      microphone: "unknown",
    },
    integration: {
      provider: "unconfigured",
      adminApproval: "not_submitted",
      fakeLiveAllowed: false,
      fakeProviderAllowed: false,
      fakePaymentAllowed: false,
      fakeLaunchCompleteAllowed: false,
    },
    preview: {
      status: "closed",
      draftId: null,
      openedAt: null,
    },
    actionLog: [createActionLogEntry("runtime_initialized", "draft_updated", [], params.now)],
  };
}

export function updateStreamLocalDraft(
  state: StreamActionRuntimeState,
  patch: StreamDraftPatch,
  now?: Date | string | number,
): StreamActionResult {
  const nextMode = patch.mode ?? state.draft.mode;
  const nextDraft: StreamLocalDraft = {
    ...state.draft,
    ...patch,
    mode: nextMode,
    title: patch.title === undefined ? state.draft.title : normalizeText(patch.title),
    topic: patch.topic === undefined ? state.draft.topic : normalizeText(patch.topic),
    description: patch.description === undefined ? state.draft.description : normalizeText(patch.description),
    visibility: patch.visibility ?? (nextMode === "businessLive" ? "business_only" : state.draft.visibility),
    tags: patch.tags === undefined ? state.draft.tags : normalizeTags(patch.tags),
    scheduledAt: patch.scheduledAt === undefined ? state.draft.scheduledAt : patch.scheduledAt,
  };

  const nextState = appendActionLog({ ...state, draft: nextDraft }, "draft_updated", "draft_updated", [], now);
  const blockers = getStreamActionBlockers(nextState);
  return buildStreamActionResult("draft_updated", nextState, blockers);
}

export function setStreamPermissionStatus(
  state: StreamActionRuntimeState,
  permission: keyof StreamPermissionSnapshot,
  status: StreamPermissionStatus,
  now?: Date | string | number,
): StreamActionResult {
  const nextState = appendActionLog(
    { ...state, permissions: { ...state.permissions, [permission]: status } },
    `${permission}_permission_updated`,
    "permission_updated",
    [],
    now,
  );
  const blockers = getStreamActionBlockers(nextState);
  return buildStreamActionResult("permission_updated", nextState, blockers);
}

export function setStreamProviderStatus(
  state: StreamActionRuntimeState,
  provider: StreamProviderStatus,
  now?: Date | string | number,
): StreamActionResult {
  const nextState = appendActionLog(
    { ...state, integration: { ...state.integration, provider } },
    "provider_status_updated",
    "draft_updated",
    [],
    now,
  );
  const blockers = getStreamActionBlockers(nextState);
  return buildStreamActionResult("draft_updated", nextState, blockers);
}

export function setStreamAdminApprovalStatus(
  state: StreamActionRuntimeState,
  adminApproval: StreamAdminApprovalStatus,
  now?: Date | string | number,
): StreamActionResult {
  const nextState = appendActionLog(
    { ...state, integration: { ...state.integration, adminApproval } },
    "admin_approval_updated",
    "draft_updated",
    [],
    now,
  );
  const blockers = getStreamActionBlockers(nextState);
  return buildStreamActionResult("draft_updated", nextState, blockers);
}

export function getStreamActionBlockers(state: StreamActionRuntimeState): readonly StreamActionBlockerCode[] {
  const blockers: StreamActionBlockerCode[] = [];

  if (normalizeText(state.draft.title).length < 3) {
    blockers.push("title_required");
  }
  if (normalizeText(state.draft.topic).length < 2) {
    blockers.push("topic_required");
  }
  if (state.draft.mode === "businessLive" && normalizeText(state.draft.description).length < 10) {
    blockers.push("description_required_for_business");
  }
  if (state.draft.mode !== "audioLive" && state.permissions.camera !== "granted") {
    blockers.push("camera_permission_required");
  }
  if (state.permissions.microphone !== "granted") {
    blockers.push("microphone_permission_required");
  }
  if (state.integration.provider !== "configured") {
    blockers.push("stream_provider_not_configured");
  }
  if (state.integration.adminApproval !== "approved") {
    blockers.push("streamer_admin_approval_required");
  }
  if (state.draft.mode === "businessLive" && state.draft.visibility !== "business_only") {
    blockers.push("business_stream_requires_business_visibility");
  }

  return blockers;
}

export function getStreamLocalPreviewBlockers(state: StreamActionRuntimeState): readonly StreamActionBlockerCode[] {
  return getStreamActionBlockers(state).filter(
    (blocker) => blocker !== "stream_provider_not_configured" && blocker !== "streamer_admin_approval_required",
  );
}

export function canOpenStreamLocalPreview(state: StreamActionRuntimeState): boolean {
  return getStreamLocalPreviewBlockers(state).length === 0;
}

export function openStreamLocalPreview(state: StreamActionRuntimeState, now?: Date | string | number): StreamActionResult {
  const blockers = getStreamLocalPreviewBlockers(state);
  if (blockers.length > 0) {
    return buildStreamActionResult("start_live_blocked", appendActionLog(state, "local_preview_blocked", "start_live_blocked", blockers, now), blockers);
  }

  const nextState = appendActionLog(
    { ...state, preview: { status: "ready", draftId: state.draftId, openedAt: nowIso(now) } },
    "local_preview_opened",
    "local_preview_ready",
    [],
    now,
  );
  return buildStreamActionResult("local_preview_ready", nextState, getStreamActionBlockers(nextState));
}

export function closeStreamLocalPreview(state: StreamActionRuntimeState, now?: Date | string | number): StreamActionResult {
  const nextState = appendActionLog(
    { ...state, preview: { status: "closed", draftId: null, openedAt: null } },
    "local_preview_closed",
    "local_preview_closed",
    [],
    now,
  );
  return buildStreamActionResult("local_preview_closed", nextState, getStreamActionBlockers(nextState));
}

export function requestStreamProviderHandoff(state: StreamActionRuntimeState, now?: Date | string | number): StreamActionResult {
  const blockers = getStreamActionBlockers(state);
  if (blockers.length > 0) {
    return buildStreamActionResult("start_live_blocked", appendActionLog(state, "provider_handoff_blocked", "start_live_blocked", blockers, now), blockers);
  }

  const nextState = appendActionLog(state, "provider_handoff_requested", "provider_handoff_required", [], now);
  return buildStreamActionResult("provider_handoff_required", nextState, []);
}

function buildStreamActionResult(
  status: StreamActionResultStatus,
  state: StreamActionRuntimeState,
  blockers: readonly StreamActionBlockerCode[],
): StreamActionResult {
  return {
    status,
    blockers,
    canOpenLocalPreview: canOpenStreamLocalPreview(state),
    canRequestProviderHandoff: blockers.length === 0,
    state,
  };
}
