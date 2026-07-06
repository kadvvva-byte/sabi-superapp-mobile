export type StreamRegistrationKind = "ordinary_creator" | "official_streamer" | "business_streamer";
export type StreamRegistrationStatus = "draft" | "local_ready" | "admin_handoff_blocked";
export type StreamRegistrationDocumentIntent = "none" | "identity_ready" | "business_docs_ready" | "identity_and_business_docs_ready";
export type StreamRegistrationMonetizationIntent = "not_requested" | "requested";

export type StreamRegistrationBlockerCode =
  | "display_name_required"
  | "legal_name_required"
  | "contact_required"
  | "country_required"
  | "category_required"
  | "bio_required"
  | "age_confirmation_required"
  | "rules_acceptance_required"
  | "content_policy_acceptance_required"
  | "identity_document_intent_required"
  | "business_documents_required"
  | "backend_admin_not_connected"
  | "provider_not_configured"
  | "monetization_wallet_provider_not_configured";

export type StreamRegistrationDraft = {
  readonly kind: StreamRegistrationKind;
  readonly displayName: string;
  readonly legalName: string;
  readonly contact: string;
  readonly country: string;
  readonly primaryCategory: string;
  readonly bio: string;
  readonly documentIntent: StreamRegistrationDocumentIntent;
  readonly monetizationIntent: StreamRegistrationMonetizationIntent;
  readonly ageConfirmed: boolean;
  readonly rulesAccepted: boolean;
  readonly contentPolicyAccepted: boolean;
};

export type StreamRegistrationIntegrationState = {
  readonly backendAdminConnected: false;
  readonly providerConfigured: false;
  readonly walletProviderConfigured: false;
  readonly fakeSubmitAllowed: false;
  readonly fakeApprovalAllowed: false;
  readonly fakeOfficialBadgeAllowed: false;
  readonly fakeMonetizationAllowed: false;
};

export type StreamRegistrationAuditEntry = {
  readonly id: string;
  readonly action: string;
  readonly status: StreamRegistrationStatus;
  readonly createdAt: string;
  readonly blockers: readonly StreamRegistrationBlockerCode[];
};

export type StreamRegistrationRuntimeState = {
  readonly draftId: string;
  readonly status: StreamRegistrationStatus;
  readonly draft: StreamRegistrationDraft;
  readonly integration: StreamRegistrationIntegrationState;
  readonly blockers: readonly StreamRegistrationBlockerCode[];
  readonly auditLog: readonly StreamRegistrationAuditEntry[];
};

export type StreamRegistrationPatch = Partial<StreamRegistrationDraft>;

export type StreamRegistrationActionResult = {
  readonly status: StreamRegistrationStatus;
  readonly blockers: readonly StreamRegistrationBlockerCode[];
  readonly canMarkLocalReady: boolean;
  readonly canSubmitToAdminNow: false;
  readonly state: StreamRegistrationRuntimeState;
};

const DEFAULT_REGISTRATION_DRAFT_ID = "stream-official-registration-local-draft";
const MAX_AUDIT_LOG_SIZE = 32;

function normalizeText(value: string | null | undefined, maxLength = 160): string {
  return String(value ?? "").trim().replace(/\s+/g, " ").slice(0, maxLength);
}

function nowIso(now?: Date | string | number): string {
  if (now instanceof Date) {
    return now.toISOString();
  }
  if (typeof now === "string" || typeof now === "number") {
    return new Date(now).toISOString();
  }
  return new Date().toISOString();
}

function makeAuditEntry(
  action: string,
  status: StreamRegistrationStatus,
  blockers: readonly StreamRegistrationBlockerCode[],
  now?: Date | string | number,
): StreamRegistrationAuditEntry {
  const createdAt = nowIso(now);
  return {
    id: `${action}-${createdAt}`,
    action,
    status,
    createdAt,
    blockers,
  };
}

function appendAuditLog(
  state: StreamRegistrationRuntimeState,
  action: string,
  status: StreamRegistrationStatus,
  blockers: readonly StreamRegistrationBlockerCode[],
  now?: Date | string | number,
): StreamRegistrationRuntimeState {
  return {
    ...state,
    auditLog: [makeAuditEntry(action, status, blockers, now), ...state.auditLog].slice(0, MAX_AUDIT_LOG_SIZE),
  };
}

function sanitizePatch(patch: StreamRegistrationPatch): StreamRegistrationPatch {
  return {
    ...patch,
    displayName: patch.displayName === undefined ? undefined : normalizeText(patch.displayName, 48),
    legalName: patch.legalName === undefined ? undefined : normalizeText(patch.legalName, 96),
    contact: patch.contact === undefined ? undefined : normalizeText(patch.contact, 96),
    country: patch.country === undefined ? undefined : normalizeText(patch.country, 64),
    primaryCategory: patch.primaryCategory === undefined ? undefined : normalizeText(patch.primaryCategory, 64),
    bio: patch.bio === undefined ? undefined : normalizeText(patch.bio, 420),
  };
}

export function createInitialStreamRegistrationState(params: {
  readonly draftId?: string;
  readonly kind?: StreamRegistrationKind;
  readonly now?: Date | string | number;
} = {}): StreamRegistrationRuntimeState {
  const initialState: StreamRegistrationRuntimeState = {
    draftId: params.draftId ?? DEFAULT_REGISTRATION_DRAFT_ID,
    status: "draft",
    draft: {
      kind: params.kind ?? "official_streamer",
      displayName: "",
      legalName: "",
      contact: "",
      country: "",
      primaryCategory: "",
      bio: "",
      documentIntent: "none",
      monetizationIntent: "not_requested",
      ageConfirmed: false,
      rulesAccepted: false,
      contentPolicyAccepted: false,
    },
    integration: {
      backendAdminConnected: false,
      providerConfigured: false,
      walletProviderConfigured: false,
      fakeSubmitAllowed: false,
      fakeApprovalAllowed: false,
      fakeOfficialBadgeAllowed: false,
      fakeMonetizationAllowed: false,
    },
    blockers: [],
    auditLog: [],
  };

  const blockers = getStreamRegistrationBlockers(initialState, { includeIntegrationBlockers: false });
  return appendAuditLog({ ...initialState, blockers }, "registration_runtime_initialized", "draft", blockers, params.now);
}

export function updateStreamRegistrationDraft(
  state: StreamRegistrationRuntimeState,
  patch: StreamRegistrationPatch,
  now?: Date | string | number,
): StreamRegistrationActionResult {
  const nextDraft: StreamRegistrationDraft = {
    ...state.draft,
    ...sanitizePatch(patch),
  };
  const nextStatus: StreamRegistrationStatus = "draft";
  const nextBaseState: StreamRegistrationRuntimeState = { ...state, draft: nextDraft, status: nextStatus };
  const blockers = getStreamRegistrationBlockers(nextBaseState, { includeIntegrationBlockers: false });
  const nextState = appendAuditLog({ ...nextBaseState, blockers }, "registration_draft_updated", nextStatus, blockers, now);
  return buildRegistrationResult(nextState, blockers);
}

export function markStreamRegistrationLocalReady(
  state: StreamRegistrationRuntimeState,
  now?: Date | string | number,
): StreamRegistrationActionResult {
  const localBlockers = getStreamRegistrationBlockers(state, { includeIntegrationBlockers: false });
  if (localBlockers.length > 0) {
    const blockedState = appendAuditLog({ ...state, status: "draft", blockers: localBlockers }, "registration_local_ready_blocked", "draft", localBlockers, now);
    return buildRegistrationResult(blockedState, localBlockers);
  }

  const readyState = appendAuditLog({ ...state, status: "local_ready", blockers: [] }, "registration_local_ready", "local_ready", [], now);
  return buildRegistrationResult(readyState, []);
}

export function requestStreamRegistrationAdminHandoff(
  state: StreamRegistrationRuntimeState,
  now?: Date | string | number,
): StreamRegistrationActionResult {
  const blockers = getStreamRegistrationBlockers(state, { includeIntegrationBlockers: true });
  const nextState = appendAuditLog(
    { ...state, status: "admin_handoff_blocked", blockers },
    "registration_admin_handoff_blocked",
    "admin_handoff_blocked",
    blockers,
    now,
  );
  return buildRegistrationResult(nextState, blockers);
}

export function getStreamRegistrationBlockers(
  state: StreamRegistrationRuntimeState,
  options: { readonly includeIntegrationBlockers?: boolean } = {},
): readonly StreamRegistrationBlockerCode[] {
  const blockers: StreamRegistrationBlockerCode[] = [];
  const draft = state.draft;

  if (normalizeText(draft.displayName).length < 2) blockers.push("display_name_required");
  if (normalizeText(draft.legalName).length < 3) blockers.push("legal_name_required");
  if (normalizeText(draft.contact).length < 5) blockers.push("contact_required");
  if (normalizeText(draft.country).length < 2) blockers.push("country_required");
  if (normalizeText(draft.primaryCategory).length < 2) blockers.push("category_required");
  if (normalizeText(draft.bio).length < 20) blockers.push("bio_required");
  if (!draft.ageConfirmed) blockers.push("age_confirmation_required");
  if (!draft.rulesAccepted) blockers.push("rules_acceptance_required");
  if (!draft.contentPolicyAccepted) blockers.push("content_policy_acceptance_required");
  if (draft.documentIntent === "none") blockers.push("identity_document_intent_required");
  if (draft.kind === "business_streamer" && draft.documentIntent !== "business_docs_ready" && draft.documentIntent !== "identity_and_business_docs_ready") {
    blockers.push("business_documents_required");
  }

  if (options.includeIntegrationBlockers) {
    if (!state.integration.backendAdminConnected) blockers.push("backend_admin_not_connected");
    if (!state.integration.providerConfigured) blockers.push("provider_not_configured");
    if (draft.monetizationIntent === "requested" && !state.integration.walletProviderConfigured) {
      blockers.push("monetization_wallet_provider_not_configured");
    }
  }

  return blockers;
}

export function buildStreamRegistrationEvidenceSnapshot(state: StreamRegistrationRuntimeState) {
  return {
    draftId: state.draftId,
    status: state.status,
    kind: state.draft.kind,
    localBlockers: getStreamRegistrationBlockers(state, { includeIntegrationBlockers: false }),
    handoffBlockers: getStreamRegistrationBlockers(state, { includeIntegrationBlockers: true }),
    integration: state.integration,
    fakeSubmitAllowed: false as const,
    fakeApprovalAllowed: false as const,
    fakeOfficialBadgeAllowed: false as const,
    fakeMonetizationAllowed: false as const,
    readyForFutureBackendContract: true as const,
  };
}

function buildRegistrationResult(
  state: StreamRegistrationRuntimeState,
  blockers: readonly StreamRegistrationBlockerCode[],
): StreamRegistrationActionResult {
  const localBlockers = getStreamRegistrationBlockers(state, { includeIntegrationBlockers: false });
  return {
    status: state.status,
    blockers,
    canMarkLocalReady: localBlockers.length === 0,
    canSubmitToAdminNow: false,
    state,
  };
}
