import {
  STREAM_135B_CONTRACT_BOUNDARY,
  STREAM_135B_DEFAULT_PROVIDER_GATE,
  type Stream135BContractBoundary,
  type Stream135BProviderGate,
} from "./stream135bBackendCoreContractsDraft";

export type Stream135CProviderKind =
  | "realtime_signaling"
  | "media_transport"
  | "media_recording"
  | "object_storage"
  | "playback_cdn"
  | "transcoding_pipeline"
  | "analytics_pipeline"
  | "moderation_ai"
  | "wallet_gift_rail"
  | "business_catalog"
  | "creator_verification"
  | "notification_push";

export type Stream135CActionKey =
  | "start_live_room"
  | "join_live_room"
  | "emit_realtime_event"
  | "open_media_transport"
  | "record_live_session"
  | "upload_short_video"
  | "transcode_short_video"
  | "publish_short_video"
  | "load_playback_manifest"
  | "write_view_analytics"
  | "submit_ai_moderation_decision"
  | "submit_report_evidence"
  | "send_gift"
  | "debit_coin"
  | "credit_creator_earning"
  | "sync_business_catalog"
  | "approve_creator_badge"
  | "send_live_notification";

export type Stream135CGateReason =
  | "provider_not_configured"
  | "credentials_missing"
  | "backend_route_missing"
  | "admin_gate_required"
  | "owner_approval_required"
  | "wallet_boundary_required"
  | "merchant_or_creator_verification_required"
  | "compliance_review_required"
  | "media_storage_not_configured"
  | "realtime_engine_not_configured";

export type Stream135CGateSeverity = "blocked" | "review_required" | "future_ready";

export type Stream135CProviderGate = {
  readonly version: "STREAM-CORE-135C";
  readonly providerKind: Stream135CProviderKind;
  readonly actionKey: Stream135CActionKey;
  readonly severity: Stream135CGateSeverity;
  readonly reason: Stream135CGateReason;
  readonly inherited135BGate: Stream135BProviderGate;
  readonly userVisibleStatusRu: string;
  readonly userVisibleStatusEn: string;
  readonly adminStatusCode:
    | "STREAM_PROVIDER_NOT_CONFIGURED"
    | "STREAM_BACKEND_REQUIRED"
    | "STREAM_ADMIN_GATE_REQUIRED"
    | "STREAM_WALLET_BOUNDARY_REQUIRED"
    | "STREAM_COMPLIANCE_REVIEW_REQUIRED";
  readonly allowedNow: false;
  readonly providerCallAllowedNow: false;
  readonly backendMutationAllowedNow: false;
  readonly databaseWriteAllowedNow: false;
  readonly secretReadAllowedNow: false;
  readonly userBalanceMutationAllowedNow: false;
  readonly creatorBalanceMutationAllowedNow: false;
  readonly fakeSuccessAllowed: false;
  readonly retryCreatesSideEffect: false;
};

export type Stream135CBlockedActionResult = {
  readonly version: "STREAM-CORE-135C";
  readonly ok: false;
  readonly blocked: true;
  readonly gate: Stream135CProviderGate;
  readonly safeClientMessageRu: string;
  readonly safeClientMessageEn: string;
  readonly auditRequired: true;
  readonly notifyUserAboutInternalReview: false;
};

export type Stream135CProviderGateRegistry = {
  readonly version: "STREAM-CORE-135C";
  readonly title: string;
  readonly summary: string;
  readonly sourceScope: "mobile_repository_contract_handoff_only";
  readonly inheritedBoundary: Stream135BContractBoundary;
  readonly defaultGate: Stream135CProviderGate;
  readonly gates: readonly Stream135CProviderGate[];
  readonly actionMap: Readonly<Record<Stream135CActionKey, Stream135CProviderKind>>;
  readonly nextBackendRequirements: readonly string[];
  readonly nextAdminRequirements: readonly string[];
  readonly nextExecutionStep: "STREAM-CORE-135D_REALTIME_SIGNALING_FOUNDATION_DRAFT";
  readonly safety: {
    readonly mobileUiChangedNow: false;
    readonly backendRoutesMountedNow: false;
    readonly databaseWriteExecutedNow: false;
    readonly providerCallExecutedNow: false;
    readonly walletTouchedNow: false;
    readonly messengerTouchedNow: false;
    readonly fakeLiveAllowed: false;
    readonly fakeRealtimeAllowed: false;
    readonly fakeProviderAllowed: false;
    readonly fakeUploadAllowed: false;
    readonly fakePublishAllowed: false;
    readonly fakePlaybackAllowed: false;
    readonly fakeAnalyticsAllowed: false;
    readonly fakeModerationAllowed: false;
    readonly fakeVerificationAllowed: false;
    readonly fakeBusinessOrderAllowed: false;
    readonly fakePaymentAllowed: false;
    readonly fakeGiftSendingAllowed: false;
  };
};

const ACTION_PROVIDER_MAP: Readonly<Record<Stream135CActionKey, Stream135CProviderKind>> = {
  start_live_room: "media_transport",
  join_live_room: "realtime_signaling",
  emit_realtime_event: "realtime_signaling",
  open_media_transport: "media_transport",
  record_live_session: "media_recording",
  upload_short_video: "object_storage",
  transcode_short_video: "transcoding_pipeline",
  publish_short_video: "object_storage",
  load_playback_manifest: "playback_cdn",
  write_view_analytics: "analytics_pipeline",
  submit_ai_moderation_decision: "moderation_ai",
  submit_report_evidence: "moderation_ai",
  send_gift: "wallet_gift_rail",
  debit_coin: "wallet_gift_rail",
  credit_creator_earning: "wallet_gift_rail",
  sync_business_catalog: "business_catalog",
  approve_creator_badge: "creator_verification",
  send_live_notification: "notification_push",
};

const PROVIDER_ADMIN_CODES: Readonly<Record<Stream135CProviderKind, Stream135CProviderGate["adminStatusCode"]>> = {
  realtime_signaling: "STREAM_PROVIDER_NOT_CONFIGURED",
  media_transport: "STREAM_PROVIDER_NOT_CONFIGURED",
  media_recording: "STREAM_PROVIDER_NOT_CONFIGURED",
  object_storage: "STREAM_PROVIDER_NOT_CONFIGURED",
  playback_cdn: "STREAM_PROVIDER_NOT_CONFIGURED",
  transcoding_pipeline: "STREAM_PROVIDER_NOT_CONFIGURED",
  analytics_pipeline: "STREAM_PROVIDER_NOT_CONFIGURED",
  moderation_ai: "STREAM_COMPLIANCE_REVIEW_REQUIRED",
  wallet_gift_rail: "STREAM_WALLET_BOUNDARY_REQUIRED",
  business_catalog: "STREAM_ADMIN_GATE_REQUIRED",
  creator_verification: "STREAM_ADMIN_GATE_REQUIRED",
  notification_push: "STREAM_BACKEND_REQUIRED",
};

const PROVIDER_REASONS: Readonly<Record<Stream135CProviderKind, Stream135CGateReason>> = {
  realtime_signaling: "realtime_engine_not_configured",
  media_transport: "provider_not_configured",
  media_recording: "media_storage_not_configured",
  object_storage: "media_storage_not_configured",
  playback_cdn: "provider_not_configured",
  transcoding_pipeline: "backend_route_missing",
  analytics_pipeline: "backend_route_missing",
  moderation_ai: "compliance_review_required",
  wallet_gift_rail: "wallet_boundary_required",
  business_catalog: "merchant_or_creator_verification_required",
  creator_verification: "admin_gate_required",
  notification_push: "backend_route_missing",
};

const PROVIDER_MESSAGES_RU: Readonly<Record<Stream135CProviderKind, string>> = {
  realtime_signaling: "Realtime-основа Stream ещё не подключена. Действие закрыто до backend/provider этапа.",
  media_transport: "Медиа-провайдер Stream ещё не подключён. Запуск эфира остаётся закрытым.",
  media_recording: "Запись эфира и хранение медиа ещё не подключены. Запись остаётся закрытой.",
  object_storage: "Хранилище видео ещё не подключено. Загрузка и публикация остаются закрытыми.",
  playback_cdn: "Playback/CDN ещё не подключены. Воспроизведение provider-контента остаётся закрытым.",
  transcoding_pipeline: "Транскодинг ещё не подключён. Обработка видео остаётся закрытой.",
  analytics_pipeline: "Аналитика Stream ещё не подключена. Метрики остаются только UI-preview.",
  moderation_ai: "Модерация требует backend/Admin review. Автоматическое наказание не выполняется.",
  wallet_gift_rail: "GIFT/COIN/Wallet интеграция будет отдельно. Списание и начисление закрыты.",
  business_catalog: "Business Stream требует backend, merchant readiness и Admin gate.",
  creator_verification: "Официальный статус автора требует Admin approval. Badge не выдаётся автоматически.",
  notification_push: "Push/напоминания требуют backend. Отправка уведомлений закрыта.",
};

const PROVIDER_MESSAGES_EN: Readonly<Record<Stream135CProviderKind, string>> = {
  realtime_signaling: "The Stream realtime foundation is not connected yet. The action stays locked until the backend/provider stage.",
  media_transport: "The Stream media provider is not connected yet. Live start remains locked.",
  media_recording: "Live recording and media storage are not connected yet. Recording remains locked.",
  object_storage: "Video storage is not connected yet. Upload and publish remain locked.",
  playback_cdn: "Playback/CDN are not connected yet. Provider content playback remains locked.",
  transcoding_pipeline: "The transcoding pipeline is not connected yet. Video processing remains locked.",
  analytics_pipeline: "Stream analytics are not connected yet. Metrics remain UI-preview only.",
  moderation_ai: "Moderation requires backend/Admin review. Automatic punishment is not executed.",
  wallet_gift_rail: "GIFT/COIN/Wallet integration is separate. Debit and credit operations remain locked.",
  business_catalog: "Business Stream requires backend, merchant readiness and an Admin gate.",
  creator_verification: "Official creator status requires Admin approval. Badges are not granted automatically.",
  notification_push: "Push/reminders require backend. Notification sending remains locked.",
};

function createGate(actionKey: Stream135CActionKey): Stream135CProviderGate {
  const providerKind = ACTION_PROVIDER_MAP[actionKey];
  const reason = PROVIDER_REASONS[providerKind];
  const adminStatusCode = PROVIDER_ADMIN_CODES[providerKind];
  const userVisibleCode = providerKind === "wallet_gift_rail" ? "wallet_integration_later" : "provider_not_configured";

  return {
    version: "STREAM-CORE-135C",
    providerKind,
    actionKey,
    severity: reason === "compliance_review_required" || reason === "admin_gate_required" ? "review_required" : "blocked",
    reason,
    inherited135BGate: {
      ...STREAM_135B_DEFAULT_PROVIDER_GATE,
      reasonCode: providerKind === "wallet_gift_rail" ? "wallet_provider_not_configured" : STREAM_135B_DEFAULT_PROVIDER_GATE.reasonCode,
      userVisibleCode,
      safeMessageRu: PROVIDER_MESSAGES_RU[providerKind],
      safeMessageEn: PROVIDER_MESSAGES_EN[providerKind],
    },
    userVisibleStatusRu: PROVIDER_MESSAGES_RU[providerKind],
    userVisibleStatusEn: PROVIDER_MESSAGES_EN[providerKind],
    adminStatusCode,
    allowedNow: false,
    providerCallAllowedNow: false,
    backendMutationAllowedNow: false,
    databaseWriteAllowedNow: false,
    secretReadAllowedNow: false,
    userBalanceMutationAllowedNow: false,
    creatorBalanceMutationAllowedNow: false,
    fakeSuccessAllowed: false,
    retryCreatesSideEffect: false,
  };
}

export const STREAM_135C_PROVIDER_GATES: readonly Stream135CProviderGate[] = [
  createGate("start_live_room"),
  createGate("join_live_room"),
  createGate("emit_realtime_event"),
  createGate("open_media_transport"),
  createGate("record_live_session"),
  createGate("upload_short_video"),
  createGate("transcode_short_video"),
  createGate("publish_short_video"),
  createGate("load_playback_manifest"),
  createGate("write_view_analytics"),
  createGate("submit_ai_moderation_decision"),
  createGate("submit_report_evidence"),
  createGate("send_gift"),
  createGate("debit_coin"),
  createGate("credit_creator_earning"),
  createGate("sync_business_catalog"),
  createGate("approve_creator_badge"),
  createGate("send_live_notification"),
] as const;

export const STREAM_135C_DEFAULT_PROVIDER_GATE: Stream135CProviderGate = STREAM_135C_PROVIDER_GATES[0];

export const STREAM_135C_PROVIDER_GATE_REGISTRY: Stream135CProviderGateRegistry = {
  version: "STREAM-CORE-135C",
  title: "Stream provider-gate layer draft",
  summary:
    "Defines safe blocked defaults for Stream realtime, media, upload, playback, analytics, moderation, creator verification, Business Stream and Wallet/GIFT boundaries. This file is a mobile repository contract handoff only and does not call providers or mount backend routes.",
  sourceScope: "mobile_repository_contract_handoff_only",
  inheritedBoundary: STREAM_135B_CONTRACT_BOUNDARY,
  defaultGate: STREAM_135C_DEFAULT_PROVIDER_GATE,
  gates: STREAM_135C_PROVIDER_GATES,
  actionMap: ACTION_PROVIDER_MAP,
  nextBackendRequirements: [
    "Create StreamProviderGate persistence model in backend repository",
    "Expose read-only owner/Admin provider gate snapshot before activation",
    "Add backend route guards that return controlled provider_not_configured responses",
    "Connect realtime/media/storage/playback adapters only after real provider credentials",
    "Keep secret values server-side only and never return them to mobile/Admin UI",
  ],
  nextAdminRequirements: [
    "Provider credential presence without secrets",
    "Owner approval gate for any provider activation",
    "Admin review queue for moderation/report/18+ cases",
    "Wallet/COIN financial approval gate before any gift sending",
    "Business merchant readiness gate before Business Stream checkout or settlement",
  ],
  nextExecutionStep: "STREAM-CORE-135D_REALTIME_SIGNALING_FOUNDATION_DRAFT",
  safety: {
    mobileUiChangedNow: false,
    backendRoutesMountedNow: false,
    databaseWriteExecutedNow: false,
    providerCallExecutedNow: false,
    walletTouchedNow: false,
    messengerTouchedNow: false,
    fakeLiveAllowed: false,
    fakeRealtimeAllowed: false,
    fakeProviderAllowed: false,
    fakeUploadAllowed: false,
    fakePublishAllowed: false,
    fakePlaybackAllowed: false,
    fakeAnalyticsAllowed: false,
    fakeModerationAllowed: false,
    fakeVerificationAllowed: false,
    fakeBusinessOrderAllowed: false,
    fakePaymentAllowed: false,
    fakeGiftSendingAllowed: false,
  },
};

export function getStream135CProviderGateRegistry(): Stream135CProviderGateRegistry {
  return STREAM_135C_PROVIDER_GATE_REGISTRY;
}

export function getStream135CProviderGate(actionKey: Stream135CActionKey): Stream135CProviderGate {
  return STREAM_135C_PROVIDER_GATES.find((gate) => gate.actionKey === actionKey) ?? STREAM_135C_DEFAULT_PROVIDER_GATE;
}

export function createStream135CBlockedActionResult(actionKey: Stream135CActionKey): Stream135CBlockedActionResult {
  const gate = getStream135CProviderGate(actionKey);

  return {
    version: "STREAM-CORE-135C",
    ok: false,
    blocked: true,
    gate,
    safeClientMessageRu: gate.userVisibleStatusRu,
    safeClientMessageEn: gate.userVisibleStatusEn,
    auditRequired: true,
    notifyUserAboutInternalReview: false,
  };
}

export function isStream135CProviderActionAllowed(): false {
  return false;
}

export function isStream135CAnyFakeSuccessAllowed(): false {
  return false;
}
