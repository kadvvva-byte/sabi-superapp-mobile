import {
  createStream135CBlockedActionResult,
  getStream135CProviderGate,
  STREAM_135C_PROVIDER_GATE_REGISTRY,
  type Stream135CActionKey,
  type Stream135CBlockedActionResult,
  type Stream135CProviderGate,
} from "./stream135cProviderGateLayerDraft";
import type { Stream135BIdentifier, Stream135BRoomMode } from "./stream135bBackendCoreContractsDraft";
import { STREAM_135G_PLAYBACK_ANALYTICS_REGISTRY } from "./stream135gPlaybackAnalyticsFoundationDraft";
import type { Stream135DRealtimeEventName } from "./stream135dRealtimeSignalingFoundationDraft";

export type Stream135HModerationAdminSurface =
  | "live_chat_report"
  | "shorts_comment_report"
  | "creator_profile_report"
  | "business_stream_report"
  | "age_gate_review"
  | "language_abuse_review"
  | "ai_signal_review"
  | "manual_admin_queue"
  | "appeal_review"
  | "owner_safety_snapshot";

export type Stream135HModerationAdminPhase =
  | "report_intent_local_only"
  | "evidence_storage_blocked"
  | "admin_review_required"
  | "ai_moderation_provider_blocked"
  | "age_gate_policy_required"
  | "language_abuse_policy_required"
  | "manual_action_blocked"
  | "appeal_route_blocked"
  | "audit_log_write_blocked"
  | "owner_diagnostics_only"
  | "rollback_required";

export type Stream135HModerationDecisionKind =
  | "report_received_later"
  | "hide_comment_later"
  | "restrict_room_later"
  | "age_gate_later"
  | "abuse_language_review_later"
  | "ai_signal_review_later"
  | "manual_admin_decision_later"
  | "appeal_decision_later"
  | "owner_snapshot_later";

export type Stream135HModerationAdminIntent = {
  readonly version: "STREAM-CORE-135H";
  readonly ids: Stream135BIdentifier;
  readonly roomMode: Stream135BRoomMode;
  readonly surface: Stream135HModerationAdminSurface;
  readonly phase: Stream135HModerationAdminPhase;
  readonly decisionKind: Stream135HModerationDecisionKind;
  readonly requestedAtIso: string;
  readonly idempotencyKey: string;
  readonly reportGate: Stream135CProviderGate;
  readonly aiGate: Stream135CProviderGate;
  readonly linkedRealtimeEventName: Stream135DRealtimeEventName;
  readonly payloadSchema: "moderation_admin_contract_placeholder";
  readonly reportSubmissionAllowedNow: false;
  readonly evidenceStorageAllowedNow: false;
  readonly aiModerationAllowedNow: false;
  readonly manualDecisionWriteAllowedNow: false;
  readonly appealWriteAllowedNow: false;
  readonly auditLogWriteAllowedNow: false;
  readonly databaseWriteAllowedNow: false;
  readonly providerCallAllowedNow: false;
  readonly automaticPunishmentAllowedNow: false;
  readonly fakeModerationSuccessAllowed: false;
};

export type Stream135HModerationAdminPlan = {
  readonly version: "STREAM-CORE-135H";
  readonly surface: Stream135HModerationAdminSurface;
  readonly phase: Stream135HModerationAdminPhase;
  readonly decisionKind: Stream135HModerationDecisionKind;
  readonly titleRu: string;
  readonly titleEn: string;
  readonly descriptionRu: string;
  readonly descriptionEn: string;
  readonly gateAction: Stream135CActionKey;
  readonly reportGate: Stream135CProviderGate;
  readonly aiGate: Stream135CProviderGate;
  readonly linkedRealtimeEventName: Stream135DRealtimeEventName;
  readonly requiredBackendPieces: readonly string[];
  readonly requiredProviderPieces: readonly string[];
  readonly requiredAdminPieces: readonly string[];
  readonly blockedByDefault: true;
  readonly databaseWriteAllowedNow: false;
  readonly providerCallAllowedNow: false;
  readonly automaticPunishmentAllowedNow: false;
  readonly fakeModerationSuccessAllowed: false;
};

export type Stream135HModerationAdminRegistry = {
  readonly version: "STREAM-CORE-135H";
  readonly title: string;
  readonly summary: string;
  readonly sourceScope: "mobile_repository_contract_handoff_only";
  readonly inheritedProviderGateRegistryVersion: typeof STREAM_135C_PROVIDER_GATE_REGISTRY.version;
  readonly inheritedPlaybackAnalyticsRegistryVersion: typeof STREAM_135G_PLAYBACK_ANALYTICS_REGISTRY.version;
  readonly plans: readonly Stream135HModerationAdminPlan[];
  readonly canonicalPhases: readonly Stream135HModerationAdminPhase[];
  readonly moderationInvariants: readonly string[];
  readonly requiredServerRuntime: readonly string[];
  readonly requiredAdminRuntime: readonly string[];
  readonly requiredProviderRuntime: readonly string[];
  readonly nextExecutionStep: "STREAM-CORE-135I_SUPERAPP_FOUNDATION_HANDOFF_DRAFT";
  readonly safety: {
    readonly mobileUiChangedNow: false;
    readonly backendRoutesMountedNow: false;
    readonly moderationRouteMountedNow: false;
    readonly adminRouteMountedNow: false;
    readonly databaseWriteExecutedNow: false;
    readonly providerCallExecutedNow: false;
    readonly secretReadExecutedNow: false;
    readonly fakeModerationAllowed: false;
    readonly fakeReportSuccessAllowed: false;
    readonly fakeAdminDecisionAllowed: false;
    readonly automaticPunishmentAllowed: false;
  };
};

type ModerationAdminSeed = {
  readonly surface: Stream135HModerationAdminSurface;
  readonly phase: Stream135HModerationAdminPhase;
  readonly decisionKind: Stream135HModerationDecisionKind;
  readonly titleRu: string;
  readonly titleEn: string;
  readonly descriptionRu: string;
  readonly descriptionEn: string;
  readonly gateAction: Stream135CActionKey;
  readonly linkedRealtimeEventName: Stream135DRealtimeEventName;
  readonly requiredBackendPieces: readonly string[];
  readonly requiredProviderPieces: readonly string[];
  readonly requiredAdminPieces: readonly string[];
};

const MODERATION_ADMIN_SEEDS: readonly ModerationAdminSeed[] = [
  {
    surface: "live_chat_report",
    phase: "report_intent_local_only",
    decisionKind: "report_received_later",
    titleRu: "Жалоба на Live/chat",
    titleEn: "Live/chat report",
    descriptionRu: "Mobile может подготовить report intent, но отправка, evidence storage и review требуют backend/Admin route.",
    descriptionEn: "Mobile may prepare a report intent, but submission, evidence storage and review require backend/Admin routes.",
    gateAction: "submit_report_evidence",
    linkedRealtimeEventName: "moderation.report_requested",
    requiredBackendPieces: ["Report submission route", "Evidence snapshot model", "Idempotency and rate limits"],
    requiredProviderPieces: ["Optional AI moderation provider later", "Evidence storage provider later", "No mobile credentials"],
    requiredAdminPieces: ["Review queue", "Manual decision workflow", "User-safe status wording"],
  },
  {
    surface: "age_gate_review",
    phase: "age_gate_policy_required",
    decisionKind: "age_gate_later",
    titleRu: "18+ / age gate",
    titleEn: "18+ / age gate",
    descriptionRu: "18+ policy должен быть backend/Admin controlled; UI не должен сам решать публичный возрастной статус.",
    descriptionEn: "The 18+ policy must be backend/Admin controlled; UI must not decide public age status by itself.",
    gateAction: "submit_ai_moderation_decision",
    linkedRealtimeEventName: "moderation.restriction_requested",
    requiredBackendPieces: ["Age gate policy contract", "Room/content restriction state", "Audit trail"],
    requiredProviderPieces: ["Age/vision/text classifier later if approved", "Manual review fallback", "Provider-not-configured state"],
    requiredAdminPieces: ["Age policy panel", "Manual override with audit", "Appeal path"],
  },
  {
    surface: "language_abuse_review",
    phase: "language_abuse_policy_required",
    decisionKind: "abuse_language_review_later",
    titleRu: "Abuse / profanity language review",
    titleEn: "Abuse / profanity language review",
    descriptionRu: "Оскорбления и profanity по 25 языкам должны идти через policy + Admin review, не через хаотичные локальные блокировки.",
    descriptionEn: "Abuse and profanity across 25 languages must go through policy + Admin review, not random local blocks.",
    gateAction: "submit_ai_moderation_decision",
    linkedRealtimeEventName: "chat.message_moderation_required",
    requiredBackendPieces: ["Language-aware moderation policy", "Comment/chat evidence capture", "Rate limit and escalation model"],
    requiredProviderPieces: ["AI/text moderation provider later", "Language model quality gate", "Manual fallback queue"],
    requiredAdminPieces: ["Policy editor later", "Review queue", "Appeal/evidence notes"],
  },
  {
    surface: "ai_signal_review",
    phase: "ai_moderation_provider_blocked",
    decisionKind: "ai_signal_review_later",
    titleRu: "AI moderation signals",
    titleEn: "AI moderation signals",
    descriptionRu: "AI может давать risk signals, но не final guilt decision; provider execution закрыт до server-side integration.",
    descriptionEn: "AI may produce risk signals, not final guilt decisions; provider execution is locked until server-side integration.",
    gateAction: "submit_ai_moderation_decision",
    linkedRealtimeEventName: "moderation.report_requested",
    requiredBackendPieces: ["AI signal route later", "Human review handoff", "False-positive notes"],
    requiredProviderPieces: ["Server-side AI provider gateway", "Prompt/version audit", "Provider cost and safety gates"],
    requiredAdminPieces: ["Human review queue", "Do-not-accuse wording", "Escalation policy"],
  },
  {
    surface: "manual_admin_queue",
    phase: "manual_action_blocked",
    decisionKind: "manual_admin_decision_later",
    titleRu: "Manual Admin actions",
    titleEn: "Manual Admin actions",
    descriptionRu: "Hide/restrict/hold actions требуют Admin auth, audit log и rollback; mobile UI не выполняет punishment actions.",
    descriptionEn: "Hide/restrict/hold actions require Admin auth, audit log and rollback; mobile UI does not execute punishment actions.",
    gateAction: "submit_report_evidence",
    linkedRealtimeEventName: "moderation.restriction_requested",
    requiredBackendPieces: ["Admin decision route", "Audit log", "Rollback/restore route"],
    requiredProviderPieces: ["No external provider required for manual review", "Evidence storage later", "No mobile admin secret"],
    requiredAdminPieces: ["Role-based queue", "Decision notes", "Appeal and restore controls"],
  },
  {
    surface: "appeal_review",
    phase: "appeal_route_blocked",
    decisionKind: "appeal_decision_later",
    titleRu: "Appeals",
    titleEn: "Appeals",
    descriptionRu: "Апелляции нужны до публичного запуска модерации, чтобы решения можно было проверить и откатить.",
    descriptionEn: "Appeals are required before public moderation launch so decisions can be reviewed and rolled back.",
    gateAction: "submit_report_evidence",
    linkedRealtimeEventName: "admin.readiness_snapshot_requested",
    requiredBackendPieces: ["Appeal submission route", "Decision linkage", "Restore/rollback state"],
    requiredProviderPieces: ["Evidence storage later", "No automatic provider punishment", "Provider-not-configured state"],
    requiredAdminPieces: ["Appeal queue", "Decision audit", "User-safe notification wording"],
  },
  {
    surface: "owner_safety_snapshot",
    phase: "owner_diagnostics_only",
    decisionKind: "owner_snapshot_later",
    titleRu: "Owner safety snapshot",
    titleEn: "Owner safety snapshot",
    descriptionRu: "Owner/Admin diagnostics может показывать readiness и blockers, но не выполнять модерацию, provider call или DB write.",
    descriptionEn: "Owner/Admin diagnostics may show readiness and blockers, but must not execute moderation, provider calls or DB writes.",
    gateAction: "submit_report_evidence",
    linkedRealtimeEventName: "admin.readiness_snapshot_requested",
    requiredBackendPieces: ["Read-only moderation snapshot", "No-secret response", "Auth smoke"],
    requiredProviderPieces: ["Provider status booleans only", "No credential exposure", "No AI call in snapshot"],
    requiredAdminPieces: ["Owner-only safety dashboard", "Review queue blocker list", "Rollback readiness"],
  },
];

export const STREAM_135H_MODERATION_ADMIN_PHASES: readonly Stream135HModerationAdminPhase[] = [
  "report_intent_local_only",
  "evidence_storage_blocked",
  "admin_review_required",
  "ai_moderation_provider_blocked",
  "age_gate_policy_required",
  "language_abuse_policy_required",
  "manual_action_blocked",
  "appeal_route_blocked",
  "audit_log_write_blocked",
  "owner_diagnostics_only",
  "rollback_required",
];

const buildModerationAdminPlan = (seed: ModerationAdminSeed): Stream135HModerationAdminPlan => ({
  version: "STREAM-CORE-135H",
  surface: seed.surface,
  phase: seed.phase,
  decisionKind: seed.decisionKind,
  titleRu: seed.titleRu,
  titleEn: seed.titleEn,
  descriptionRu: seed.descriptionRu,
  descriptionEn: seed.descriptionEn,
  gateAction: seed.gateAction,
  reportGate: getStream135CProviderGate("submit_report_evidence"),
  aiGate: getStream135CProviderGate("submit_ai_moderation_decision"),
  linkedRealtimeEventName: seed.linkedRealtimeEventName,
  requiredBackendPieces: seed.requiredBackendPieces,
  requiredProviderPieces: seed.requiredProviderPieces,
  requiredAdminPieces: seed.requiredAdminPieces,
  blockedByDefault: true,
  databaseWriteAllowedNow: false,
  providerCallAllowedNow: false,
  automaticPunishmentAllowedNow: false,
  fakeModerationSuccessAllowed: false,
});

export const STREAM_135H_MODERATION_ADMIN_REGISTRY: Stream135HModerationAdminRegistry = {
  version: "STREAM-CORE-135H",
  title: "Stream moderation and Admin foundation draft",
  summary: "Reports, evidence, 18+, abuse/profanity, AI risk signals, manual Admin review and appeals are mapped as safe-blocked foundation contracts.",
  sourceScope: "mobile_repository_contract_handoff_only",
  inheritedProviderGateRegistryVersion: STREAM_135C_PROVIDER_GATE_REGISTRY.version,
  inheritedPlaybackAnalyticsRegistryVersion: STREAM_135G_PLAYBACK_ANALYTICS_REGISTRY.version,
  plans: MODERATION_ADMIN_SEEDS.map(buildModerationAdminPlan),
  canonicalPhases: STREAM_135H_MODERATION_ADMIN_PHASES,
  moderationInvariants: [
    "Mobile UI may prepare local report/moderation intents, but real submission, evidence storage and decisions require backend/Admin routes.",
    "AI moderation outputs are risk signals for review and must not become automatic guilt decisions.",
    "18+, abuse, profanity and language policy must be auditable and reviewable before public launch.",
    "Manual Admin actions require role-based auth, audit log, rollback and appeal paths.",
    "Owner/Admin snapshots may expose readiness/blocker booleans, never secrets, provider keys or env values.",
    "Fake report success, fake moderation success and fake Admin decisions are forbidden.",
  ],
  requiredServerRuntime: [
    "Report submission route",
    "Evidence snapshot/storage contract",
    "Moderation review queue model",
    "AI signal handoff route later",
    "18+ policy route",
    "Language/abuse policy route",
    "Manual Admin decision route",
    "Appeal route",
    "Audit log and rollback route",
    "Read-only owner safety diagnostics",
  ],
  requiredAdminRuntime: [
    "Owner/Admin moderation dashboard",
    "Role-based review queue",
    "18+ and abuse policy controls",
    "AI signal review panel",
    "Appeal/restore controls",
    "No-secret readiness gate",
  ],
  requiredProviderRuntime: [
    "Optional AI/text/vision moderation provider later",
    "Evidence storage provider later",
    "Provider-not-configured state until server-side credentials exist",
    "No direct mobile provider credentials",
  ],
  nextExecutionStep: "STREAM-CORE-135I_SUPERAPP_FOUNDATION_HANDOFF_DRAFT",
  safety: {
    mobileUiChangedNow: false,
    backendRoutesMountedNow: false,
    moderationRouteMountedNow: false,
    adminRouteMountedNow: false,
    databaseWriteExecutedNow: false,
    providerCallExecutedNow: false,
    secretReadExecutedNow: false,
    fakeModerationAllowed: false,
    fakeReportSuccessAllowed: false,
    fakeAdminDecisionAllowed: false,
    automaticPunishmentAllowed: false,
  },
};

export function createStream135HModerationAdminIntent(args: {
  readonly ids: Stream135BIdentifier;
  readonly roomMode: Stream135BRoomMode;
  readonly surface: Stream135HModerationAdminSurface;
  readonly phase: Stream135HModerationAdminPhase;
  readonly decisionKind: Stream135HModerationDecisionKind;
  readonly requestedAtIso: string;
  readonly idempotencyKey: string;
}): Stream135HModerationAdminIntent {
  return {
    version: "STREAM-CORE-135H",
    ids: args.ids,
    roomMode: args.roomMode,
    surface: args.surface,
    phase: args.phase,
    decisionKind: args.decisionKind,
    requestedAtIso: args.requestedAtIso,
    idempotencyKey: args.idempotencyKey,
    reportGate: getStream135CProviderGate("submit_report_evidence"),
    aiGate: getStream135CProviderGate("submit_ai_moderation_decision"),
    linkedRealtimeEventName: args.phase === "language_abuse_policy_required" ? "chat.message_moderation_required" : "moderation.report_requested",
    payloadSchema: "moderation_admin_contract_placeholder",
    reportSubmissionAllowedNow: false,
    evidenceStorageAllowedNow: false,
    aiModerationAllowedNow: false,
    manualDecisionWriteAllowedNow: false,
    appealWriteAllowedNow: false,
    auditLogWriteAllowedNow: false,
    databaseWriteAllowedNow: false,
    providerCallAllowedNow: false,
    automaticPunishmentAllowedNow: false,
    fakeModerationSuccessAllowed: false,
  };
}

export function getStream135HModerationAdminPlan(
  phase: Stream135HModerationAdminPhase,
): Stream135HModerationAdminPlan | undefined {
  return STREAM_135H_MODERATION_ADMIN_REGISTRY.plans.find((plan) => plan.phase === phase);
}

export function blockStream135HModerationAdmin(
  action: Extract<Stream135CActionKey, "submit_ai_moderation_decision" | "submit_report_evidence">,
): Stream135CBlockedActionResult {
  return createStream135CBlockedActionResult(action);
}
