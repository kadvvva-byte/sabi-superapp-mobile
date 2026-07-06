export type StreamProfileSetupType = "creator" | "official_streamer" | "business_streamer";

export type StreamProfileSetupStatus = "draft_local" | "incomplete_local" | "ready_local" | "provider_blocked";

export type StreamProfileSetupCheckId =
  | "profile_identity"
  | "handle_display"
  | "bio_category"
  | "avatar_cover"
  | "language_region"
  | "official_status"
  | "business_identity"
  | "safety_policy"
  | "shorts_handoff"
  | "business_stream_handoff"
  | "provider_admin_handoff";

export type StreamProfileSetupCheckStatus = "pending_local" | "ready_local" | "blocked_local" | "provider_required";

export type StreamProfileSetupBlockerCode =
  | "display_name_required"
  | "handle_required"
  | "bio_required"
  | "category_required"
  | "avatar_intent_required"
  | "cover_intent_required"
  | "language_required"
  | "country_required"
  | "official_request_required"
  | "business_name_required"
  | "safety_policy_required"
  | "shorts_handoff_required"
  | "business_stream_handoff_required"
  | "backend_profile_contract_required"
  | "media_profile_provider_required"
  | "admin_profile_review_required";

export type StreamProfileSetupEventKind =
  | "profile_setup_updated_local"
  | "profile_setup_check_run_local"
  | "profile_setup_handoff_blocked_local";

export type StreamProfileSetupEvent = {
  readonly eventId: string;
  readonly kind: StreamProfileSetupEventKind;
  readonly profileId: string;
  readonly profileType: StreamProfileSetupType;
  readonly status: StreamProfileSetupStatus;
  readonly selectedCheckId: StreamProfileSetupCheckId;
  readonly createdAt: string;
  readonly deliveredToBackend: false;
  readonly deliveredToProvider: false;
};

export type StreamProfileSetupCheck = {
  readonly id: StreamProfileSetupCheckId;
  readonly title: string;
  readonly purpose: string;
  readonly status: StreamProfileSetupCheckStatus;
  readonly blockers: readonly StreamProfileSetupBlockerCode[];
  readonly providerRequired: boolean;
  readonly reviewedLocal: boolean;
};

export type StreamProfileSetupEvidence = {
  readonly localBlockers: readonly StreamProfileSetupBlockerCode[];
  readonly providerBlockers: readonly StreamProfileSetupBlockerCode[];
  readonly readyLocalChecks: number;
  readonly blockedLocalChecks: number;
  readonly providerRequiredChecks: number;
  readonly queuedProfileEvents: number;
  readonly profileCompletenessPercent: number;
  readonly backendProfileContract: "not_connected";
  readonly mediaProfileProvider: "not_configured";
  readonly adminProfileReview: "not_connected";
  readonly fakeProfilePublishAllowed: false;
  readonly fakeOfficialBadgeAllowed: false;
  readonly fakeFollowerCountAllowed: false;
  readonly fakePaymentAllowed: false;
  readonly fakeGiftAllowed: false;
  readonly monetizationAllowedNow: false;
};

export type StreamProfileSetupRuntimeState = {
  readonly profileId: string;
  readonly profileType: StreamProfileSetupType;
  readonly status: StreamProfileSetupStatus;
  readonly displayName: string;
  readonly handle: string;
  readonly bio: string;
  readonly category: string;
  readonly primaryLanguage: string;
  readonly country: string;
  readonly businessName: string;
  readonly avatarIntentReadyLocal: boolean;
  readonly coverIntentReadyLocal: boolean;
  readonly officialStatusRequestedLocal: boolean;
  readonly businessIdentityPreparedLocal: boolean;
  readonly safetyPolicyAcknowledgedLocal: boolean;
  readonly shortsHandoffReviewedLocal: boolean;
  readonly businessStreamHandoffReviewedLocal: boolean;
  readonly selectedCheckId: StreamProfileSetupCheckId;
  readonly checks: readonly StreamProfileSetupCheck[];
  readonly events: readonly StreamProfileSetupEvent[];
  readonly evidence: StreamProfileSetupEvidence;
  readonly updatedAt: string;
};

const PROFILE_ID = "stream-profile-local-draft";

function nowIso(): string {
  return new Date().toISOString();
}

function cleanText(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

const TEXT_LIMITS = {
  displayName: 32,
  handle: 24,
  bio: 160,
  category: 32,
  primaryLanguage: 12,
  country: 12,
  businessName: 48,
} as const;

function clampTextInput(field: keyof typeof TEXT_LIMITS, value: string): string {
  return value.slice(0, TEXT_LIMITS[field]);
}

function makeEventId(kind: StreamProfileSetupEventKind, profileId: string, index: number): string {
  return `${kind}-${profileId}-${index + 1}`;
}

function createCheck(
  id: StreamProfileSetupCheckId,
  title: string,
  purpose: string,
  blockers: readonly StreamProfileSetupBlockerCode[],
  providerRequired = false,
  reviewedLocal = false,
): StreamProfileSetupCheck {
  const status: StreamProfileSetupCheckStatus = providerRequired ? "provider_required" : blockers.length > 0 ? "blocked_local" : "ready_local";
  return { id, title, purpose, status, blockers, providerRequired, reviewedLocal };
}

function calculateChecks(state: Omit<StreamProfileSetupRuntimeState, "checks" | "evidence" | "status">): readonly StreamProfileSetupCheck[] {
  const displayNameReady = cleanText(state.displayName).length >= 2;
  const handleReady = cleanText(state.handle).length >= 3;
  const bioReady = cleanText(state.bio).length >= 12;
  const categoryReady = cleanText(state.category).length >= 2;
  const languageReady = cleanText(state.primaryLanguage).length >= 2;
  const countryReady = cleanText(state.country).length >= 2;
  const officialNeeded = state.profileType === "official_streamer" || state.profileType === "business_streamer";
  const businessNeeded = state.profileType === "business_streamer";

  return [
    createCheck(
      "profile_identity",
      "Profile identity",
      "Display name and streamer identity draft must be locally complete.",
      displayNameReady ? [] : ["display_name_required"],
    ),
    createCheck(
      "handle_display",
      "Handle and display",
      "Unique handle/display route draft is prepared locally; backend uniqueness remains provider/Admin handoff.",
      handleReady ? [] : ["handle_required"],
    ),
    createCheck(
      "bio_category",
      "Bio and category",
      "Creator bio and content category are filled before public profile handoff.",
      [...(bioReady ? [] : ["bio_required" as const]), ...(categoryReady ? [] : ["category_required" as const])],
    ),
    createCheck(
      "avatar_cover",
      "Avatar and cover intents",
      "Avatar and cover are source intents only; media provider upload remains blocked until storage/CDN.",
      [...(state.avatarIntentReadyLocal ? [] : ["avatar_intent_required" as const]), ...(state.coverIntentReadyLocal ? [] : ["cover_intent_required" as const])],
    ),
    createCheck(
      "language_region",
      "Language and region",
      "Primary profile language and region are selected for discovery and moderation routing.",
      [...(languageReady ? [] : ["language_required" as const]), ...(countryReady ? [] : ["country_required" as const])],
    ),
    createCheck(
      "official_status",
      "Official streamer status",
      "Official badge is a request/review path only; no fake official badge is allowed.",
      officialNeeded && !state.officialStatusRequestedLocal ? ["official_request_required"] : [],
      false,
      !officialNeeded || state.officialStatusRequestedLocal,
    ),
    createCheck(
      "business_identity",
      "Business identity",
      "Business streamer profile needs a business identity draft, but no payments or Wallet linking now.",
      businessNeeded && (!state.businessIdentityPreparedLocal || cleanText(state.businessName).length < 2) ? ["business_name_required"] : [],
      false,
      !businessNeeded || state.businessIdentityPreparedLocal,
    ),
    createCheck(
      "safety_policy",
      "Safety policy",
      "Profile safety, content policy, and no-fake-publication rules are acknowledged locally.",
      state.safetyPolicyAcknowledgedLocal ? [] : ["safety_policy_required"],
    ),
    createCheck(
      "shorts_handoff",
      "Shorts handoff",
      "Short video profile handoff is reviewed after 110F final smoke.",
      state.shortsHandoffReviewedLocal ? [] : ["shorts_handoff_required"],
    ),
    createCheck(
      "business_stream_handoff",
      "Business Stream handoff",
      "Business Stream profile link is reviewed without payments/gifts/Wallet.",
      businessNeeded && !state.businessStreamHandoffReviewedLocal ? ["business_stream_handoff_required"] : [],
      false,
      !businessNeeded || state.businessStreamHandoffReviewedLocal,
    ),
    createCheck(
      "provider_admin_handoff",
      "Provider/Admin handoff",
      "Backend profile contract, media provider and Admin review are required before public profile publish.",
      ["backend_profile_contract_required", "media_profile_provider_required", "admin_profile_review_required"],
      true,
    ),
  ];
}

function calculateEvidence(
  checks: readonly StreamProfileSetupCheck[],
  events: readonly StreamProfileSetupEvent[],
  profileType: StreamProfileSetupType,
): StreamProfileSetupEvidence {
  const relevantChecks = checks.filter((check) => isProfileTypeRelevantCheck(check.id, profileType));
  const localBlockers = Array.from(new Set(relevantChecks.flatMap((check) => (check.providerRequired ? [] : check.blockers))));
  const providerBlockers = Array.from(new Set(relevantChecks.flatMap((check) => (check.providerRequired ? check.blockers : []))));
  const readyLocalChecks = relevantChecks.filter((check) => check.status === "ready_local").length;
  const blockedLocalChecks = relevantChecks.filter((check) => check.status === "blocked_local").length;
  const providerRequiredChecks = relevantChecks.filter((check) => check.status === "provider_required").length;
  const relevantLocalChecks = relevantChecks.filter((check) => !check.providerRequired).length || 1;
  const profileCompletenessPercent = Math.round((readyLocalChecks / relevantLocalChecks) * 100);

  return {
    localBlockers,
    providerBlockers,
    readyLocalChecks,
    blockedLocalChecks,
    providerRequiredChecks,
    queuedProfileEvents: events.length,
    profileCompletenessPercent,
    backendProfileContract: "not_connected",
    mediaProfileProvider: "not_configured",
    adminProfileReview: "not_connected",
    fakeProfilePublishAllowed: false,
    fakeOfficialBadgeAllowed: false,
    fakeFollowerCountAllowed: false,
    fakePaymentAllowed: false,
    fakeGiftAllowed: false,
    monetizationAllowedNow: false,
  };
}

function resolveStatus(checks: readonly StreamProfileSetupCheck[], profileType: StreamProfileSetupType): StreamProfileSetupStatus {
  const relevantChecks = checks.filter((check) => isProfileTypeRelevantCheck(check.id, profileType));

  if (relevantChecks.some((check) => check.status === "blocked_local")) return "incomplete_local";
  if (relevantChecks.some((check) => check.status === "provider_required")) return "provider_blocked";
  return "ready_local";
}

function isProfileTypeRelevantCheck(checkId: StreamProfileSetupCheckId, profileType: StreamProfileSetupType): boolean {
  if (checkId === "official_status") {
    return profileType === "official_streamer" || profileType === "business_streamer";
  }

  if (checkId === "business_identity" || checkId === "business_stream_handoff") {
    return profileType === "business_streamer";
  }

  return true;
}

function isSelectableLocalCheck(check: StreamProfileSetupCheck, profileType: StreamProfileSetupType): boolean {
  return !check.providerRequired && isProfileTypeRelevantCheck(check.id, profileType);
}

function resolveSelectableCheckId(
  checks: readonly StreamProfileSetupCheck[],
  selectedCheckId: StreamProfileSetupCheckId,
  profileType: StreamProfileSetupType,
): StreamProfileSetupCheckId {
  const selectedCheck = checks.find((check) => check.id === selectedCheckId);
  if (selectedCheck && isSelectableLocalCheck(selectedCheck, profileType)) {
    return selectedCheck.id;
  }

  return checks.find((check) => isSelectableLocalCheck(check, profileType))?.id ?? checks[0]?.id ?? selectedCheckId;
}

function resolveVisibleCheckId(
  checks: readonly StreamProfileSetupCheck[],
  selectedCheckId: StreamProfileSetupCheckId,
  profileType: StreamProfileSetupType,
): StreamProfileSetupCheckId {
  const selectedCheck = checks.find((check) => check.id === selectedCheckId);
  if (selectedCheck && isProfileTypeRelevantCheck(selectedCheck.id, profileType)) {
    return selectedCheck.id;
  }

  return resolveSelectableCheckId(checks, selectedCheckId, profileType);
}

function recalculate(state: Omit<StreamProfileSetupRuntimeState, "checks" | "evidence" | "status">): StreamProfileSetupRuntimeState {
  const checks = calculateChecks(state);
  const evidence = calculateEvidence(checks, state.events, state.profileType);
  const status = resolveStatus(checks, state.profileType);
  const selectedCheckId = resolveVisibleCheckId(checks, state.selectedCheckId, state.profileType);
  return { ...state, selectedCheckId, checks, evidence, status };
}

export function createInitialStreamProfileSetupState(): StreamProfileSetupRuntimeState {
  const base = {
    profileId: PROFILE_ID,
    profileType: "creator" as StreamProfileSetupType,
    displayName: "",
    handle: "",
    bio: "",
    category: "stream",
    primaryLanguage: "ru",
    country: "UZ",
    businessName: "",
    avatarIntentReadyLocal: false,
    coverIntentReadyLocal: false,
    officialStatusRequestedLocal: false,
    businessIdentityPreparedLocal: false,
    safetyPolicyAcknowledgedLocal: false,
    shortsHandoffReviewedLocal: false,
    businessStreamHandoffReviewedLocal: false,
    selectedCheckId: "profile_identity" as StreamProfileSetupCheckId,
    events: [] as readonly StreamProfileSetupEvent[],
    updatedAt: nowIso(),
  };

  return recalculate(base);
}

function resetTypeScopedEvidenceForProfileType(
  state: StreamProfileSetupRuntimeState,
  profileType: StreamProfileSetupType,
): Pick<
  StreamProfileSetupRuntimeState,
  "officialStatusRequestedLocal" | "businessIdentityPreparedLocal" | "businessStreamHandoffReviewedLocal" | "businessName"
> {
  if (profileType === "creator") {
    return {
      officialStatusRequestedLocal: false,
      businessIdentityPreparedLocal: false,
      businessStreamHandoffReviewedLocal: false,
      businessName: "",
    };
  }

  if (profileType === "official_streamer") {
    return {
      officialStatusRequestedLocal: state.profileType === profileType ? state.officialStatusRequestedLocal : false,
      businessIdentityPreparedLocal: false,
      businessStreamHandoffReviewedLocal: false,
      businessName: "",
    };
  }

  return {
    officialStatusRequestedLocal: state.profileType === profileType ? state.officialStatusRequestedLocal : false,
    businessIdentityPreparedLocal: state.profileType === profileType ? state.businessIdentityPreparedLocal : false,
    businessStreamHandoffReviewedLocal: state.profileType === profileType ? state.businessStreamHandoffReviewedLocal : false,
    businessName: state.profileType === profileType ? state.businessName : "",
  };
}

function clearDraftScopedProfileSetupEvents(state: StreamProfileSetupRuntimeState): readonly StreamProfileSetupEvent[] {
  return state.events.filter((event) => (
    event.kind !== "profile_setup_check_run_local"
    && event.kind !== "profile_setup_updated_local"
  ));
}

function markProfileSetupDraftDirty(state: StreamProfileSetupRuntimeState): Omit<StreamProfileSetupRuntimeState, "checks" | "evidence" | "status"> {
  return {
    ...state,
    events: clearDraftScopedProfileSetupEvents(state),
    updatedAt: nowIso(),
  };
}

export function setStreamProfileSetupType(state: StreamProfileSetupRuntimeState, profileType: StreamProfileSetupType): StreamProfileSetupRuntimeState {
  if (state.profileType === profileType) {
    return state;
  }

  const scopedEvidence = resetTypeScopedEvidenceForProfileType(state, profileType);

  return recalculate({
    ...markProfileSetupDraftDirty(state),
    profileType,
    ...scopedEvidence,
  });
}

export function canEditStreamBusinessNameLocal(state: StreamProfileSetupRuntimeState): boolean {
  return state.profileType === "business_streamer";
}

export function updateStreamProfileSetupText(
  state: StreamProfileSetupRuntimeState,
  field: "displayName" | "handle" | "bio" | "category" | "primaryLanguage" | "country" | "businessName",
  value: string,
): StreamProfileSetupRuntimeState {
  if (field === "businessName" && !canEditStreamBusinessNameLocal(state)) {
    if (!state.businessName && !state.businessIdentityPreparedLocal && !state.businessStreamHandoffReviewedLocal) {
      return state;
    }

    return recalculate({
      ...markProfileSetupDraftDirty(state),
      businessName: "",
      businessIdentityPreparedLocal: false,
      businessStreamHandoffReviewedLocal: false,
    });
  }

  const normalizedValue = field === "handle" ? value.replace(/[^a-zA-Z0-9_.-]/g, "").toLowerCase() : value;
  const nextValue = clampTextInput(field, normalizedValue);

  if (state[field] === nextValue) {
    return state;
  }

  if (field === "businessName") {
    return recalculate({
      ...markProfileSetupDraftDirty(state),
      businessName: nextValue,
      businessIdentityPreparedLocal: false,
      businessStreamHandoffReviewedLocal: false,
    });
  }

  return recalculate({ ...markProfileSetupDraftDirty(state), [field]: nextValue });
}

export function markStreamProfileAvatarIntentReady(state: StreamProfileSetupRuntimeState): StreamProfileSetupRuntimeState {
  if (state.avatarIntentReadyLocal) {
    return state;
  }

  return recalculate({ ...markProfileSetupDraftDirty(state), avatarIntentReadyLocal: true });
}

export function markStreamProfileCoverIntentReady(state: StreamProfileSetupRuntimeState): StreamProfileSetupRuntimeState {
  if (state.coverIntentReadyLocal) {
    return state;
  }

  return recalculate({ ...markProfileSetupDraftDirty(state), coverIntentReadyLocal: true });
}

export function canRequestStreamOfficialStatusLocal(state: StreamProfileSetupRuntimeState): boolean {
  return state.profileType === "official_streamer" || state.profileType === "business_streamer";
}

export function requestStreamOfficialStatusLocal(state: StreamProfileSetupRuntimeState): StreamProfileSetupRuntimeState {
  if (!canRequestStreamOfficialStatusLocal(state) || state.officialStatusRequestedLocal) {
    return state;
  }

  return recalculate({ ...markProfileSetupDraftDirty(state), officialStatusRequestedLocal: true });
}

export function canPrepareStreamBusinessIdentityLocal(state: StreamProfileSetupRuntimeState): boolean {
  return state.profileType === "business_streamer" && cleanText(state.businessName).length >= 2;
}

export function prepareStreamBusinessIdentityLocal(state: StreamProfileSetupRuntimeState): StreamProfileSetupRuntimeState {
  if (!canPrepareStreamBusinessIdentityLocal(state)) {
    return state;
  }

  const businessName = cleanText(state.businessName);
  if (state.businessIdentityPreparedLocal && state.businessName === businessName) {
    return state;
  }

  return recalculate({ ...markProfileSetupDraftDirty(state), businessName, businessIdentityPreparedLocal: true });
}

export function acknowledgeStreamProfileSafetyPolicy(state: StreamProfileSetupRuntimeState): StreamProfileSetupRuntimeState {
  if (state.safetyPolicyAcknowledgedLocal) {
    return state;
  }

  return recalculate({ ...markProfileSetupDraftDirty(state), safetyPolicyAcknowledgedLocal: true });
}

export function reviewStreamProfileShortsHandoff(state: StreamProfileSetupRuntimeState): StreamProfileSetupRuntimeState {
  if (state.shortsHandoffReviewedLocal) {
    return state;
  }

  return recalculate({ ...markProfileSetupDraftDirty(state), shortsHandoffReviewedLocal: true });
}

export function canReviewStreamProfileBusinessHandoffLocal(state: StreamProfileSetupRuntimeState): boolean {
  return (
    state.profileType === "business_streamer"
    && state.officialStatusRequestedLocal
    && state.businessIdentityPreparedLocal
    && cleanText(state.businessName).length >= 2
  );
}

export function reviewStreamProfileBusinessHandoff(state: StreamProfileSetupRuntimeState): StreamProfileSetupRuntimeState {
  if (!canReviewStreamProfileBusinessHandoffLocal(state) || state.businessStreamHandoffReviewedLocal) {
    return state;
  }

  return recalculate({ ...markProfileSetupDraftDirty(state), businessStreamHandoffReviewedLocal: true });
}

export function selectStreamProfileSetupCheck(state: StreamProfileSetupRuntimeState): StreamProfileSetupRuntimeState {
  const selectableChecks = state.checks.filter((check) => isSelectableLocalCheck(check, state.profileType));
  const currentIndex = selectableChecks.findIndex((check) => check.id === state.selectedCheckId);
  const next = selectableChecks[(currentIndex + 1) % selectableChecks.length] ?? selectableChecks[0] ?? state.checks[0];
  return recalculate({ ...state, selectedCheckId: next.id, updatedAt: nowIso() });
}

export function resolveStreamProfileSetupReadinessFocusCheckId(state: StreamProfileSetupRuntimeState): StreamProfileSetupCheckId {
  const relevantChecks = state.checks.filter((check) => isProfileTypeRelevantCheck(check.id, state.profileType));
  const firstLocalBlocker = relevantChecks.find((check) => check.status === "blocked_local");
  if (firstLocalBlocker) {
    return firstLocalBlocker.id;
  }

  const firstProviderBlocker = relevantChecks.find((check) => check.status === "provider_required");
  if (firstProviderBlocker) {
    return firstProviderBlocker.id;
  }

  return resolveSelectableCheckId(state.checks, state.selectedCheckId, state.profileType);
}

export function runStreamProfileSetupReadinessCheck(state: StreamProfileSetupRuntimeState): StreamProfileSetupRuntimeState {
  const focusCheckId = resolveStreamProfileSetupReadinessFocusCheckId(state);
  if (state.selectedCheckId === focusCheckId) {
    return state;
  }

  return recalculate({
    ...state,
    selectedCheckId: focusCheckId,
    updatedAt: nowIso(),
  });
}

export function canQueueStreamProfileSetupLocalEvent(
  state: StreamProfileSetupRuntimeState,
  kind: StreamProfileSetupEventKind = "profile_setup_updated_local",
): boolean {
  if (kind === "profile_setup_handoff_blocked_local") {
    return false;
  }

  const alreadyQueued = state.events.some((event) => event.kind === kind);
  if (alreadyQueued) {
    return false;
  }

  if (kind === "profile_setup_check_run_local" && state.evidence.localBlockers.length > 0) {
    return false;
  }

  return true;
}

function resolveStreamProfileSetupQueuedEventCheckId(
  state: StreamProfileSetupRuntimeState,
  kind: StreamProfileSetupEventKind,
): StreamProfileSetupCheckId {
  if (kind === "profile_setup_handoff_blocked_local") {
    return "provider_admin_handoff";
  }

  return resolveStreamProfileSetupReadinessFocusCheckId(state);
}

export function queueStreamProfileSetupLocalEvent(state: StreamProfileSetupRuntimeState, kind: StreamProfileSetupEventKind = "profile_setup_updated_local"): StreamProfileSetupRuntimeState {
  if (!canQueueStreamProfileSetupLocalEvent(state, kind)) {
    return state;
  }

  const createdAt = nowIso();
  const selectedCheckId = resolveStreamProfileSetupQueuedEventCheckId(state, kind);
  const event: StreamProfileSetupEvent = {
    eventId: makeEventId(kind, state.profileId, state.events.length),
    kind,
    profileId: state.profileId,
    profileType: state.profileType,
    status: state.status,
    selectedCheckId,
    createdAt,
    deliveredToBackend: false,
    deliveredToProvider: false,
  };

  return recalculate({ ...state, selectedCheckId, events: [...state.events, event], updatedAt: createdAt });
}

export function requestStreamProfileProviderAdminBlocked(state: StreamProfileSetupRuntimeState): StreamProfileSetupRuntimeState {
  return state;
}
