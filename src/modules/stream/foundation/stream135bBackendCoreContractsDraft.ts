export type Stream135BExecutionStatus =
  | "contract_draft_only"
  | "backend_required"
  | "provider_not_configured"
  | "admin_gate_required"
  | "wallet_boundary_required";

export type Stream135BProviderStatus =
  | "provider_not_configured"
  | "credentials_missing"
  | "owner_approval_required"
  | "admin_gate_required"
  | "ready_later_only";

export type Stream135BRoomMode =
  | "single_live"
  | "group_live"
  | "audio_live"
  | "game_broadcast"
  | "video_file_broadcast"
  | "business_stream"
  | "short_video";

export type Stream135BRoomLifecycleStatus =
  | "draft"
  | "preflight_required"
  | "provider_handoff_blocked"
  | "admin_review_required"
  | "ready_later_only"
  | "ended";

export type Stream135BSourceKind =
  | "camera"
  | "microphone"
  | "screen"
  | "game_capture"
  | "video_file"
  | "rtmp_later"
  | "business_catalog"
  | "shorts_source";

export type Stream135BEventKind =
  | "room_created"
  | "room_updated"
  | "preflight_requested"
  | "provider_handoff_blocked"
  | "viewer_join_requested"
  | "viewer_leave_requested"
  | "chat_message_requested"
  | "cohost_invite_requested"
  | "battle_invite_requested"
  | "moderation_report_requested"
  | "shorts_upload_requested"
  | "shorts_publish_blocked"
  | "business_lead_requested"
  | "gift_quote_blocked"
  | "room_end_requested";

export type Stream135BIdentifier = {
  readonly userId: string;
  readonly roomId?: string;
  readonly streamId?: string;
  readonly requestId: string;
  readonly idempotencyKey: string;
};

export type Stream135BProviderGate = {
  readonly status: Stream135BProviderStatus;
  readonly reasonCode:
    | "stream_provider_not_configured"
    | "media_provider_not_configured"
    | "upload_provider_not_configured"
    | "playback_provider_not_configured"
    | "analytics_provider_not_configured"
    | "moderation_provider_not_configured"
    | "wallet_provider_not_configured"
    | "owner_approval_required"
    | "admin_gate_required";
  readonly userVisibleCode:
    | "provider_not_configured"
    | "admin_review_required"
    | "available_after_foundation"
    | "wallet_integration_later";
  readonly safeMessageRu: string;
  readonly safeMessageEn: string;
  readonly retryAllowed: false;
  readonly fakeSuccessAllowed: false;
  readonly providerCallAllowedNow: false;
  readonly secretValuesReturned: false;
};

export type Stream135BRoomDraftContract = {
  readonly version: "STREAM-CORE-135B";
  readonly ids: Stream135BIdentifier;
  readonly mode: Stream135BRoomMode;
  readonly lifecycleStatus: Stream135BRoomLifecycleStatus;
  readonly sourceKind: Stream135BSourceKind;
  readonly title?: string;
  readonly description?: string;
  readonly locale?: string;
  readonly ageGateRequired: boolean;
  readonly moderationRequired: boolean;
  readonly businessAccountRequired: boolean;
  readonly officialCreatorRequired: boolean;
  readonly providerGate: Stream135BProviderGate;
};

export type Stream135BRealtimeEventContract = {
  readonly version: "STREAM-CORE-135B";
  readonly eventId: string;
  readonly kind: Stream135BEventKind;
  readonly ids: Stream135BIdentifier;
  readonly occurredAtIso: string;
  readonly payloadSchema: "backend_contract_placeholder";
  readonly persistAuditLog: true;
  readonly broadcastToRoomAllowedNow: false;
  readonly realtimeProviderCallAllowedNow: false;
};

export type Stream135BMediaSessionContract = {
  readonly version: "STREAM-CORE-135B";
  readonly ids: Stream135BIdentifier;
  readonly sourceKind: Stream135BSourceKind;
  readonly requestedMode: Stream135BRoomMode;
  readonly providerGate: Stream135BProviderGate;
  readonly recordingAllowedNow: false;
  readonly cdnPlaybackAllowedNow: false;
  readonly storageWriteAllowedNow: false;
  readonly liveTransportAllowedNow: false;
};

export type Stream135BShortsPublishContract = {
  readonly version: "STREAM-CORE-135B";
  readonly ids: Stream135BIdentifier;
  readonly uploadIntentAllowedNow: false;
  readonly objectStorageWriteAllowedNow: false;
  readonly transcodeAllowedNow: false;
  readonly publishAllowedNow: false;
  readonly fakeProcessingAllowed: false;
  readonly providerGate: Stream135BProviderGate;
};

export type Stream135BModerationContract = {
  readonly version: "STREAM-CORE-135B";
  readonly ids: Stream135BIdentifier;
  readonly reportSubmissionRequiresBackend: true;
  readonly evidenceStorageRequiresBackend: true;
  readonly adminReviewRequired: true;
  readonly automaticPunishmentAllowedNow: false;
  readonly fakeReportSuccessAllowed: false;
  readonly auditRequired: true;
};

export type Stream135BCreatorVerificationContract = {
  readonly version: "STREAM-CORE-135B";
  readonly ids: Stream135BIdentifier;
  readonly applicationDraftAllowed: true;
  readonly approvalRequiresAdmin: true;
  readonly badgeGrantAllowedNow: false;
  readonly monetizationGrantAllowedNow: false;
  readonly fakeVerificationAllowed: false;
};

export type Stream135BBusinessStreamContract = {
  readonly version: "STREAM-CORE-135B";
  readonly ids: Stream135BIdentifier;
  readonly businessAccountRequired: true;
  readonly merchantReadinessRequired: true;
  readonly catalogSnapshotRequiresBackend: true;
  readonly orderIntentAllowedNow: false;
  readonly checkoutAllowedNow: false;
  readonly settlementAllowedNow: false;
};

export type Stream135BGiftWalletBoundaryContract = {
  readonly version: "STREAM-CORE-135B";
  readonly ids: Stream135BIdentifier;
  readonly giftCatalogRequiresBackend: true;
  readonly quoteRequiresBackend: true;
  readonly walletLedgerRequired: true;
  readonly coinDebitAllowedNow: false;
  readonly giftSendAllowedNow: false;
  readonly creatorEarningCreditAllowedNow: false;
  readonly fakeGiftSuccessAllowed: false;
};

export type Stream135BAdminDiagnosticsContract = {
  readonly version: "STREAM-CORE-135B";
  readonly protectedAdminRouteRequired: true;
  readonly ownerOnlyRequired: true;
  readonly noSecretValuesInResponse: true;
  readonly readOnlySnapshotFirst: true;
  readonly providerActivationAllowedNow: false;
  readonly databaseMutationAllowedNow: false;
};

export type Stream135BContractBoundary = {
  readonly sourceScope: "mobile_repository_contract_handoff_only";
  readonly mobileUiChangedNow: false;
  readonly backendSourceAvailableInThisPackage: false;
  readonly backendRoutesMountedNow: false;
  readonly databaseWriteExecutedNow: false;
  readonly providerCallExecutedNow: false;
  readonly realtimeProviderActivatedNow: false;
  readonly mediaProviderActivatedNow: false;
  readonly uploadProviderActivatedNow: false;
  readonly playbackProviderActivatedNow: false;
  readonly analyticsProviderActivatedNow: false;
  readonly walletTouchedNow: false;
  readonly messengerTouchedNow: false;
  readonly paymentsTouchedNow: false;
  readonly giftsRuntimeTouchedNow: false;
  readonly fakeLiveAllowed: false;
  readonly fakeRealtimeAllowed: false;
  readonly fakeProviderAllowed: false;
  readonly fakeUploadAllowed: false;
  readonly fakePublishAllowed: false;
  readonly fakePlaybackAllowed: false;
  readonly fakeViewsAllowed: false;
  readonly fakeAnalyticsAllowed: false;
  readonly fakeModerationAllowed: false;
  readonly fakeVerificationAllowed: false;
  readonly fakeBusinessOrderAllowed: false;
  readonly fakePaymentAllowed: false;
  readonly fakeGiftSendingAllowed: false;
};

export type Stream135BContractRegistry = {
  readonly version: "STREAM-CORE-135B";
  readonly title: string;
  readonly summary: string;
  readonly executionStatus: Stream135BExecutionStatus;
  readonly boundary: Stream135BContractBoundary;
  readonly requiredBackendContracts: readonly string[];
  readonly requiredProviderAdapters: readonly string[];
  readonly requiredAdminGates: readonly string[];
  readonly requiredPersistenceModels: readonly string[];
  readonly safeDefaultProviderGate: Stream135BProviderGate;
  readonly nextExecutionStep: "STREAM-CORE-135C_PROVIDER_GATE_LAYER_DRAFT";
};

export const STREAM_135B_CONTRACT_BOUNDARY: Stream135BContractBoundary = {
  sourceScope: "mobile_repository_contract_handoff_only",
  mobileUiChangedNow: false,
  backendSourceAvailableInThisPackage: false,
  backendRoutesMountedNow: false,
  databaseWriteExecutedNow: false,
  providerCallExecutedNow: false,
  realtimeProviderActivatedNow: false,
  mediaProviderActivatedNow: false,
  uploadProviderActivatedNow: false,
  playbackProviderActivatedNow: false,
  analyticsProviderActivatedNow: false,
  walletTouchedNow: false,
  messengerTouchedNow: false,
  paymentsTouchedNow: false,
  giftsRuntimeTouchedNow: false,
  fakeLiveAllowed: false,
  fakeRealtimeAllowed: false,
  fakeProviderAllowed: false,
  fakeUploadAllowed: false,
  fakePublishAllowed: false,
  fakePlaybackAllowed: false,
  fakeViewsAllowed: false,
  fakeAnalyticsAllowed: false,
  fakeModerationAllowed: false,
  fakeVerificationAllowed: false,
  fakeBusinessOrderAllowed: false,
  fakePaymentAllowed: false,
  fakeGiftSendingAllowed: false,
};

export const STREAM_135B_DEFAULT_PROVIDER_GATE: Stream135BProviderGate = {
  status: "provider_not_configured",
  reasonCode: "stream_provider_not_configured",
  userVisibleCode: "provider_not_configured",
  safeMessageRu: "Провайдер Stream ещё не подключён. Действие останется закрытым до backend/Admin/provider этапа.",
  safeMessageEn: "The Stream provider is not connected yet. This action stays locked until the backend/Admin/provider stage.",
  retryAllowed: false,
  fakeSuccessAllowed: false,
  providerCallAllowedNow: false,
  secretValuesReturned: false,
};

export const STREAM_135B_CONTRACT_REGISTRY: Stream135BContractRegistry = {
  version: "STREAM-CORE-135B",
  title: "Stream backend/core contracts draft",
  summary:
    "Defines the first safe backend/core contract handoff for Stream rooms, realtime, media, Shorts, moderation, creator verification, Business Stream and gifts/Wallet boundaries. This file does not mount routes, mutate data or activate providers.",
  executionStatus: "contract_draft_only",
  boundary: STREAM_135B_CONTRACT_BOUNDARY,
  requiredBackendContracts: [
    "RoomDraftContract",
    "RoomLifecycleContract",
    "RealtimeEventContract",
    "MediaSessionContract",
    "ShortsUploadPublishContract",
    "PlaybackAnalyticsContract",
    "ModerationReportContract",
    "CreatorVerificationContract",
    "BusinessStreamContract",
    "GiftWalletBoundaryContract",
    "AdminDiagnosticsSnapshotContract",
  ],
  requiredProviderAdapters: [
    "RealtimeAdapter with provider_not_configured default",
    "MediaSessionAdapter with provider_not_configured default",
    "ObjectStorageAdapter with provider_not_configured default",
    "PlaybackCdnAdapter with provider_not_configured default",
    "AnalyticsAdapter with provider_not_configured default",
    "ModerationAiAdapter optional and blocked by default",
  ],
  requiredAdminGates: [
    "Owner-only diagnostics route before activation",
    "Provider credential presence check without secrets",
    "Room launch approval gate",
    "18+/report/moderation review gate",
    "Official streamer approval gate",
    "Business Stream merchant readiness gate",
    "Wallet/gift financial approval gate later",
  ],
  requiredPersistenceModels: [
    "StreamRoom",
    "StreamRoomEvent",
    "StreamParticipantSession",
    "StreamChatMessage",
    "StreamMediaSession",
    "StreamShortVideoAsset",
    "StreamModerationReport",
    "StreamCreatorApplication",
    "StreamBusinessShowcaseSnapshot",
    "StreamProviderGate",
    "StreamAdminAuditLog",
  ],
  safeDefaultProviderGate: STREAM_135B_DEFAULT_PROVIDER_GATE,
  nextExecutionStep: "STREAM-CORE-135C_PROVIDER_GATE_LAYER_DRAFT",
};

export function getStream135BContractRegistry(): Stream135BContractRegistry {
  return STREAM_135B_CONTRACT_REGISTRY;
}

export function createStream135BProviderGate(
  reasonCode: Stream135BProviderGate["reasonCode"],
  safeMessageRu: string,
  safeMessageEn: string,
): Stream135BProviderGate {
  return {
    ...STREAM_135B_DEFAULT_PROVIDER_GATE,
    reasonCode,
    userVisibleCode: reasonCode === "wallet_provider_not_configured" ? "wallet_integration_later" : "provider_not_configured",
    safeMessageRu,
    safeMessageEn,
  };
}

export function createStream135BRoomDraftContract(input: {
  readonly ids: Stream135BIdentifier;
  readonly mode: Stream135BRoomMode;
  readonly sourceKind: Stream135BSourceKind;
  readonly title?: string;
  readonly description?: string;
  readonly locale?: string;
  readonly ageGateRequired?: boolean;
  readonly moderationRequired?: boolean;
  readonly businessAccountRequired?: boolean;
  readonly officialCreatorRequired?: boolean;
  readonly providerGate?: Stream135BProviderGate;
}): Stream135BRoomDraftContract {
  return {
    version: "STREAM-CORE-135B",
    ids: input.ids,
    mode: input.mode,
    lifecycleStatus: "provider_handoff_blocked",
    sourceKind: input.sourceKind,
    title: input.title,
    description: input.description,
    locale: input.locale,
    ageGateRequired: input.ageGateRequired ?? false,
    moderationRequired: input.moderationRequired ?? true,
    businessAccountRequired: input.businessAccountRequired ?? input.mode === "business_stream",
    officialCreatorRequired: input.officialCreatorRequired ?? false,
    providerGate: input.providerGate ?? STREAM_135B_DEFAULT_PROVIDER_GATE,
  };
}

export function createStream135BRealtimeEventContract(input: {
  readonly eventId: string;
  readonly kind: Stream135BEventKind;
  readonly ids: Stream135BIdentifier;
  readonly occurredAtIso: string;
}): Stream135BRealtimeEventContract {
  return {
    version: "STREAM-CORE-135B",
    eventId: input.eventId,
    kind: input.kind,
    ids: input.ids,
    occurredAtIso: input.occurredAtIso,
    payloadSchema: "backend_contract_placeholder",
    persistAuditLog: true,
    broadcastToRoomAllowedNow: false,
    realtimeProviderCallAllowedNow: false,
  };
}

export function isStream135BBackendExecutionAllowed(): false {
  return false;
}

export function isStream135BFakeSuccessAllowed(): false {
  return false;
}
