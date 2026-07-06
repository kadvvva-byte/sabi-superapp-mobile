import {
  STREAM_135W_BACKEND_COMMON_RESPONSE_ENVELOPE_CONTRACT_DRAFT_VERSION,
  getStream135WBackendCommonResponseEnvelopeContractSnapshot,
  stream135wBackendCommonResponseEnvelopeContractSafety,
  type Stream135WBackendCommonResponseEnvelope,
  type Stream135WBackendCommonResponseKind,
  type Stream135WBackendCommonResponseSeverity,
} from "./stream135wBackendCommonResponseEnvelopeContractDraft";

export const STREAM_135X_BACKEND_COMMON_ERROR_TAXONOMY_CONTRACT_DRAFT_VERSION = "STREAM-CORE-135X" as const;

export type Stream135XBackendCommonErrorFamily =
  | "scope_boundary"
  | "identity_auth_session"
  | "locale_error"
  | "realtime_room"
  | "live_lifecycle"
  | "media_storage_cdn"
  | "shorts_upload_publish_feed"
  | "playback_analytics"
  | "moderation_admin"
  | "creator_business_verification"
  | "business_stream_merchant"
  | "notification_qr_deeplink"
  | "wallet_coin_gift_boundary"
  | "provider_secret_gate"
  | "observability_audit_launch";

export type Stream135XBackendCommonClientTreatment =
  | "keep_existing_local_kernel_snapshot"
  | "show_safe_blocked_state"
  | "show_safe_review_required_state"
  | "wait_for_backend_common_foundation_stage"
  | "keep_wallet_gift_boundary_locked";

export type Stream135XBackendCommonErrorTaxonomyEntry = Readonly<{
  taxonomyId: string;
  family: Stream135XBackendCommonErrorFamily;
  sourceResponseKind: Stream135WBackendCommonResponseKind;
  severity: Stream135WBackendCommonResponseSeverity;
  safeCode: string;
  safeMessageKey: string;
  clientTreatment: Stream135XBackendCommonClientTreatment;
  backendCommonOwnerLater: string;
  adminActionRequiredLater: boolean;
  providerActionRequiredLater: boolean;
  walletGiftActionRequiredLater: boolean;
  retryAllowedBeforeBackendCommonFoundation: false;
  piiAllowedInErrorEnvelope: false;
  secretsAllowedInErrorEnvelope: false;
  providerSuccessAllowedInErrorEnvelope: false;
  persistenceSuccessAllowedInErrorEnvelope: false;
  fakeSuccessAllowed: false;
  ownerApprovalRequiredBeforeRuntime: true;
}>;

export type Stream135XBackendCommonErrorTaxonomyContractSnapshot = Readonly<{
  version: typeof STREAM_135X_BACKEND_COMMON_ERROR_TAXONOMY_CONTRACT_DRAFT_VERSION;
  upstreamResponseEnvelopeVersion: typeof STREAM_135W_BACKEND_COMMON_RESPONSE_ENVELOPE_CONTRACT_DRAFT_VERSION;
  scope: "stream_backend_common_error_taxonomy_contract_only";
  moduleBoundary: "stream_only_no_global_common_module_inside_mobile";
  handoffDirection: "stream_mobile_kernel_to_backend_common_foundation_later_outside_mobile";
  forbiddenMobileModulePath: "src/modules/superapp";
  pipeline: readonly [
    "135X_backend_common_error_taxonomy_contract",
    "135W_backend_common_response_envelope_contract",
    "135V_backend_common_input_checklist",
    "135U_handoff_manifest",
    "135T_boundary_audit",
    "135S_action_smoke",
    "135R_runtime_panel_wiring",
    "135Q_ui_binding",
    "135P_facade",
    "135N_dispatcher",
    "135M_state_machine",
    "135L_reducer",
    "135K_event_envelope",
    "backend_common_foundation_later_outside_mobile",
  ];
  totalTaxonomyEntries: number;
  blockedEntries: number;
  reviewRequiredEntries: number;
  infoEntries: number;
  familiesCovered: readonly Stream135XBackendCommonErrorFamily[];
  taxonomyEntries: readonly Stream135XBackendCommonErrorTaxonomyEntry[];
  mobileSafeHandlingRules: readonly string[];
  backendCommonImplementationRulesLater: readonly string[];
  forbiddenErrorPayloadFields: readonly string[];
  requiredErrorPayloadFieldsLater: readonly string[];
  allEntriesSafeBlockedOrContractOnly: boolean;
  allEntriesSecretFree: boolean;
  allEntriesFakeSuccessBlocked: boolean;
  noSuperappModuleInsideMobile: true;
  backendCommonFoundationMustStayOutsideMobile: true;
  mobileCanOnlyConsumeSafeErrorTaxonomy: true;
  runtimeExecutionAllowedNow: false;
  backendRoutesAllowedNow: false;
  dbWritesAllowedNow: false;
  providerCallsAllowedNow: false;
  walletMessengerRuntimeTouchAllowedNow: false;
  fakeSuccessAllowedNow: false;
  nextStep: "STREAM-CORE-135Y mobile/backend handoff readiness index draft";
  safety: typeof stream135xBackendCommonErrorTaxonomyContractSafety;
}>;

function taxonomyFamilyForEnvelope(envelope: Stream135WBackendCommonResponseEnvelope): Stream135XBackendCommonErrorFamily {
  switch (envelope.contractInputId) {
    case "backend_common_scope_lock":
      return "scope_boundary";
    case "identity_auth_session_input":
      return "identity_auth_session";
    case "locale_error_contract_input":
      return "locale_error";
    case "stream_realtime_room_input":
      return "realtime_room";
    case "live_lifecycle_input":
      return "live_lifecycle";
    case "media_storage_cdn_input":
      return "media_storage_cdn";
    case "shorts_upload_publish_feed_input":
      return "shorts_upload_publish_feed";
    case "playback_analytics_input":
      return "playback_analytics";
    case "moderation_admin_input":
      return "moderation_admin";
    case "creator_business_verification_input":
      return "creator_business_verification";
    case "business_stream_merchant_input":
      return "business_stream_merchant";
    case "notification_qr_deeplink_input":
      return "notification_qr_deeplink";
    case "wallet_coin_gift_boundary_input":
      return "wallet_coin_gift_boundary";
    case "provider_secret_gate_input":
      return "provider_secret_gate";
    case "observability_audit_input":
    case "launch_readiness_input":
    case "mobile_handoff_evidence_input":
      return "observability_audit_launch";
    default:
      return "scope_boundary";
  }
}

function clientTreatmentForEnvelope(envelope: Stream135WBackendCommonResponseEnvelope): Stream135XBackendCommonClientTreatment {
  if (envelope.walletGiftStageRequiredLater) {
    return "keep_wallet_gift_boundary_locked";
  }

  if (envelope.severity === "review_required") {
    return "show_safe_review_required_state";
  }

  if (envelope.severity === "blocked") {
    return "show_safe_blocked_state";
  }

  if (envelope.mobileKernelAction === "keep_local_snapshot_only") {
    return "keep_existing_local_kernel_snapshot";
  }

  return "wait_for_backend_common_foundation_stage";
}

function taxonomyEntryFromEnvelope(
  envelope: Stream135WBackendCommonResponseEnvelope,
  index: number,
): Stream135XBackendCommonErrorTaxonomyEntry {
  const family = taxonomyFamilyForEnvelope(envelope);
  const ordinal = String(index + 1).padStart(2, "0");

  return {
    taxonomyId: `stream_135x_${ordinal}_${family}`,
    family,
    sourceResponseKind: envelope.responseKind,
    severity: envelope.severity,
    safeCode: envelope.safeCode,
    safeMessageKey: envelope.safeMessageKey,
    clientTreatment: clientTreatmentForEnvelope(envelope),
    backendCommonOwnerLater: envelope.backendCommonRequirementLater,
    adminActionRequiredLater: envelope.adminGateRequiredLater,
    providerActionRequiredLater: envelope.providerGateRequiredLater,
    walletGiftActionRequiredLater: envelope.walletGiftStageRequiredLater,
    retryAllowedBeforeBackendCommonFoundation: false,
    piiAllowedInErrorEnvelope: false,
    secretsAllowedInErrorEnvelope: false,
    providerSuccessAllowedInErrorEnvelope: false,
    persistenceSuccessAllowedInErrorEnvelope: false,
    fakeSuccessAllowed: false,
    ownerApprovalRequiredBeforeRuntime: true,
  };
}

export function getStream135XBackendCommonErrorTaxonomyEntries(): readonly Stream135XBackendCommonErrorTaxonomyEntry[] {
  const upstreamSnapshot = getStream135WBackendCommonResponseEnvelopeContractSnapshot();
  return upstreamSnapshot.envelopes.map((envelope, index) => taxonomyEntryFromEnvelope(envelope, index));
}

export function getStream135XBackendCommonErrorTaxonomyContractSnapshot(): Stream135XBackendCommonErrorTaxonomyContractSnapshot {
  const taxonomyEntries = getStream135XBackendCommonErrorTaxonomyEntries();
  const familiesCovered = Array.from(new Set(taxonomyEntries.map((entry) => entry.family))).sort();
  const blockedEntries = taxonomyEntries.filter((entry) => entry.severity === "blocked").length;
  const reviewRequiredEntries = taxonomyEntries.filter((entry) => entry.severity === "review_required").length;
  const infoEntries = taxonomyEntries.filter((entry) => entry.severity === "info").length;

  return {
    version: STREAM_135X_BACKEND_COMMON_ERROR_TAXONOMY_CONTRACT_DRAFT_VERSION,
    upstreamResponseEnvelopeVersion: STREAM_135W_BACKEND_COMMON_RESPONSE_ENVELOPE_CONTRACT_DRAFT_VERSION,
    scope: "stream_backend_common_error_taxonomy_contract_only",
    moduleBoundary: "stream_only_no_global_common_module_inside_mobile",
    handoffDirection: "stream_mobile_kernel_to_backend_common_foundation_later_outside_mobile",
    forbiddenMobileModulePath: "src/modules/superapp",
    pipeline: [
      "135X_backend_common_error_taxonomy_contract",
      "135W_backend_common_response_envelope_contract",
      "135V_backend_common_input_checklist",
      "135U_handoff_manifest",
      "135T_boundary_audit",
      "135S_action_smoke",
      "135R_runtime_panel_wiring",
      "135Q_ui_binding",
      "135P_facade",
      "135N_dispatcher",
      "135M_state_machine",
      "135L_reducer",
      "135K_event_envelope",
      "backend_common_foundation_later_outside_mobile",
    ],
    totalTaxonomyEntries: taxonomyEntries.length,
    blockedEntries,
    reviewRequiredEntries,
    infoEntries,
    familiesCovered,
    taxonomyEntries,
    mobileSafeHandlingRules: [
      "Mobile must consume backend/common errors only as safe taxonomy entries through the Stream kernel facade.",
      "Mobile must not treat an error taxonomy entry as a live, media, publish, payment, moderation or provider success.",
      "Mobile may keep local read-only evidence for info entries only.",
      "Mobile must show existing safe blocked or review-required states for blocked and review-required entries.",
      "Wallet, COIN and gift taxonomy entries remain locked until the separate monetization stage.",
      "Unknown backend/common codes must be treated as blocked_unknown_safe_code by the Stream kernel.",
      "All user-visible text must continue to come from i18n message keys, not new hardcoded visible copy.",
    ],
    backendCommonImplementationRulesLater: [
      "Backend/common foundation must return safe codes and message keys only, not internal stack details.",
      "Backend/common foundation must not return provider credentials, media secrets, payment secrets or raw Admin notes to mobile.",
      "Backend/common foundation must sign or otherwise bind sensitive responses to user/session/owner scope before mobile consumption.",
      "Backend/common foundation must append real audit evidence server-side only after separate approved backend work.",
      "Provider readiness, payment readiness and media readiness must remain explicit blocked or review-required states until real gates exist.",
    ],
    forbiddenErrorPayloadFields: [
      "raw provider credentials",
      "raw media bucket credentials",
      "server stack traces",
      "database delegate names or internal IDs that imply persistence success",
      "payment or Wallet ledger success",
      "Admin approval without Admin audit evidence",
      "fake live room id",
      "fake upload id",
      "fake publish id",
      "fake playback URL",
    ],
    requiredErrorPayloadFieldsLater: [
      "safeCode",
      "safeMessageKey",
      "severity",
      "clientTreatment",
      "ownerScopeStatus",
      "adminGateStatus",
      "providerGateStatus",
      "idempotencyStatus",
      "auditReferenceWhenServerSideAuditExists",
    ],
    allEntriesSafeBlockedOrContractOnly: taxonomyEntries.every((entry) => entry.severity === "blocked" || entry.severity === "review_required" || entry.severity === "info"),
    allEntriesSecretFree: taxonomyEntries.every((entry) => !entry.secretsAllowedInErrorEnvelope && !entry.piiAllowedInErrorEnvelope),
    allEntriesFakeSuccessBlocked: taxonomyEntries.every((entry) => !entry.fakeSuccessAllowed),
    noSuperappModuleInsideMobile: true,
    backendCommonFoundationMustStayOutsideMobile: true,
    mobileCanOnlyConsumeSafeErrorTaxonomy: true,
    runtimeExecutionAllowedNow: false,
    backendRoutesAllowedNow: false,
    dbWritesAllowedNow: false,
    providerCallsAllowedNow: false,
    walletMessengerRuntimeTouchAllowedNow: false,
    fakeSuccessAllowedNow: false,
    nextStep: "STREAM-CORE-135Y mobile/backend handoff readiness index draft",
    safety: stream135xBackendCommonErrorTaxonomyContractSafety,
  };
}

export const stream135xBackendCommonErrorTaxonomyContractSafety = {
  version: STREAM_135X_BACKEND_COMMON_ERROR_TAXONOMY_CONTRACT_DRAFT_VERSION,
  scope: "stream_backend_common_error_taxonomy_contract_only",
  upstreamResponseEnvelopeVersion: STREAM_135W_BACKEND_COMMON_RESPONSE_ENVELOPE_CONTRACT_DRAFT_VERSION,
  moduleBoundary: "stream_only_no_global_common_module_inside_mobile",
  globalCommonModuleInsideMobileAllowed: false,
  backendCommonImplementationInsideMobileAllowed: false,
  srcModulesSuperappInsideMobileAllowed: false,
  mobileUiRedesignNow: 0,
  streamVisualLayoutChangedNow: 0,
  hardcodedVisibleUiTextAdded: 0,
  backendRoutesMounted: 0,
  routeMountExecuted: 0,
  backendExecutionRequested: 0,
  dbWrites: 0,
  providerCalls: 0,
  walletRuntimeTouched: 0,
  messengerRuntimeTouched: 0,
  giftsPaymentsRuntimeTouched: 0,
  serverSecretStoredInMobile: false,
  serverSecretsReturnedToUi: false,
  errorTaxonomyMayContainPii: false,
  errorTaxonomyMayContainSecrets: false,
  errorTaxonomyMayContainPersistenceSuccess: false,
  errorTaxonomyMayContainProviderSuccess: false,
  fakeLiveAllowed: false,
  fakeUploadAllowed: false,
  fakePublishAllowed: false,
  fakePlaybackAllowed: false,
  fakeViewsAllowed: false,
  fakeAnalyticsAllowed: false,
  fakeModerationAllowed: false,
  fakeBusinessOrderAllowed: false,
  fakePaymentGiftAllowed: false,
  upstreamSafety: stream135wBackendCommonResponseEnvelopeContractSafety,
  nextStep: "STREAM-CORE-135Y mobile/backend handoff readiness index draft",
} as const;
