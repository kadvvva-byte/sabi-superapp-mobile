import {
  createStream135CBlockedActionResult,
  getStream135CProviderGate,
  STREAM_135C_PROVIDER_GATE_REGISTRY,
  type Stream135CActionKey,
  type Stream135CBlockedActionResult,
  type Stream135CProviderGate,
} from "./stream135cProviderGateLayerDraft";
import type { Stream135BIdentifier } from "./stream135bBackendCoreContractsDraft";
import {
  STREAM_135D_REALTIME_SIGNALING_REGISTRY,
  type Stream135DRealtimeEventName,
} from "./stream135dRealtimeSignalingFoundationDraft";
import {
  STREAM_135E_MEDIA_LIFECYCLE_REGISTRY,
  type Stream135EMediaAssetKind,
  type Stream135EMediaLifecyclePhase,
} from "./stream135eMediaLifecycleFoundationDraft";

export type Stream135FShortsDraftSource =
  | "camera_recording"
  | "gallery_video"
  | "imported_clip"
  | "screen_capture_clip"
  | "business_product_clip"
  | "creator_template_clip";

export type Stream135FShortsMetadataAsset =
  | "raw_source_video"
  | "audio_track_reference"
  | "effect_overlay_metadata"
  | "caption_overlay_metadata"
  | "cover_frame"
  | "thumbnail_asset"
  | "encoded_short"
  | "moderation_evidence_snapshot"
  | "published_short_record"
  | "feed_index_record"
  | "analytics_event";

export type Stream135FShortsPipelinePhase =
  | "local_draft_created"
  | "source_validation_required"
  | "upload_storage_blocked"
  | "virus_scan_blocked"
  | "moderation_preflight_blocked"
  | "copyright_review_required"
  | "transcoding_pipeline_blocked"
  | "thumbnail_generation_blocked"
  | "publish_review_blocked"
  | "feed_index_blocked"
  | "playback_manifest_blocked"
  | "analytics_write_blocked"
  | "rollback_required"
  | "admin_diagnostics_only";

export type Stream135FShortsPublishVisibility =
  | "private_draft"
  | "followers_later"
  | "public_later"
  | "business_catalog_later"
  | "admin_review_later";

export type Stream135FShortsUploadIntent = {
  readonly version: "STREAM-CORE-135F";
  readonly ids: Stream135BIdentifier;
  readonly source: Stream135FShortsDraftSource;
  readonly asset: Stream135FShortsMetadataAsset;
  readonly phase: Stream135FShortsPipelinePhase;
  readonly requestedVisibility: Stream135FShortsPublishVisibility;
  readonly requestedAtIso: string;
  readonly idempotencyKey: string;
  readonly uploadGate: Stream135CProviderGate;
  readonly transcodeGate: Stream135CProviderGate;
  readonly publishGate: Stream135CProviderGate;
  readonly linkedRealtimeEventName: Stream135DRealtimeEventName;
  readonly linkedMediaAssetKind: Stream135EMediaAssetKind;
  readonly linkedMediaPhase: Stream135EMediaLifecyclePhase;
  readonly payloadSchema: "shorts_upload_publish_contract_placeholder";
  readonly localDraftAllowedNow: true;
  readonly serverUploadAllowedNow: false;
  readonly objectStorageWriteAllowedNow: false;
  readonly virusScanAllowedNow: false;
  readonly moderationAiAllowedNow: false;
  readonly transcodeAllowedNow: false;
  readonly publishAllowedNow: false;
  readonly feedIndexWriteAllowedNow: false;
  readonly playbackManifestAllowedNow: false;
  readonly analyticsWriteAllowedNow: false;
  readonly databaseWriteAllowedNow: false;
  readonly providerCallAllowedNow: false;
  readonly fakeUploadSuccessAllowed: false;
  readonly fakePublishSuccessAllowed: false;
};

export type Stream135FShortsPipelinePlan = {
  readonly version: "STREAM-CORE-135F";
  readonly titleRu: string;
  readonly titleEn: string;
  readonly descriptionRu: string;
  readonly descriptionEn: string;
  readonly source: Stream135FShortsDraftSource;
  readonly asset: Stream135FShortsMetadataAsset;
  readonly phase: Stream135FShortsPipelinePhase;
  readonly requestedVisibility: Stream135FShortsPublishVisibility;
  readonly gateAction: Stream135CActionKey;
  readonly providerGate: Stream135CProviderGate;
  readonly linkedRealtimeEventName: Stream135DRealtimeEventName;
  readonly linkedMediaAssetKind: Stream135EMediaAssetKind;
  readonly linkedMediaPhase: Stream135EMediaLifecyclePhase;
  readonly requiredBackendPieces: readonly string[];
  readonly requiredProviderPieces: readonly string[];
  readonly requiredAdminPieces: readonly string[];
  readonly blockedByDefault: true;
  readonly localDraftAllowedNow: boolean;
  readonly serverMutationAllowedNow: false;
  readonly databaseWriteAllowedNow: false;
  readonly providerCallAllowedNow: false;
  readonly fakeUploadSuccessAllowed: false;
  readonly fakePublishSuccessAllowed: false;
};

export type Stream135FShortsFoundationRegistry = {
  readonly version: "STREAM-CORE-135F";
  readonly title: string;
  readonly summary: string;
  readonly sourceScope: "mobile_repository_contract_handoff_only";
  readonly inheritedProviderGateRegistryVersion: typeof STREAM_135C_PROVIDER_GATE_REGISTRY.version;
  readonly inheritedRealtimeRegistryVersion: typeof STREAM_135D_REALTIME_SIGNALING_REGISTRY.version;
  readonly inheritedMediaLifecycleRegistryVersion: typeof STREAM_135E_MEDIA_LIFECYCLE_REGISTRY.version;
  readonly plans: readonly Stream135FShortsPipelinePlan[];
  readonly canonicalPhases: readonly Stream135FShortsPipelinePhase[];
  readonly publishInvariants: readonly string[];
  readonly requiredServerRuntime: readonly string[];
  readonly requiredProviderRuntime: readonly string[];
  readonly requiredAdminRuntime: readonly string[];
  readonly nextExecutionStep: "STREAM-CORE-135G_PLAYBACK_ANALYTICS_FOUNDATION_DRAFT";
  readonly safety: {
    readonly mobileUiChangedNow: false;
    readonly backendRoutesMountedNow: false;
    readonly uploadRouteMountedNow: false;
    readonly publishRouteMountedNow: false;
    readonly databaseWriteExecutedNow: false;
    readonly objectStorageWriteExecutedNow: false;
    readonly providerCallExecutedNow: false;
    readonly secretReadExecutedNow: false;
    readonly fakeUploadAllowed: false;
    readonly fakeTranscodingAllowed: false;
    readonly fakeModerationAllowed: false;
    readonly fakePublishAllowed: false;
    readonly fakeFeedIndexAllowed: false;
    readonly fakePlaybackAllowed: false;
    readonly fakeAnalyticsAllowed: false;
  };
};

type ShortsPipelineSeed = {
  readonly titleRu: string;
  readonly titleEn: string;
  readonly descriptionRu: string;
  readonly descriptionEn: string;
  readonly source: Stream135FShortsDraftSource;
  readonly asset: Stream135FShortsMetadataAsset;
  readonly phase: Stream135FShortsPipelinePhase;
  readonly requestedVisibility: Stream135FShortsPublishVisibility;
  readonly gateAction: Stream135CActionKey;
  readonly linkedRealtimeEventName: Stream135DRealtimeEventName;
  readonly linkedMediaAssetKind: Stream135EMediaAssetKind;
  readonly linkedMediaPhase: Stream135EMediaLifecyclePhase;
  readonly requiredBackendPieces: readonly string[];
  readonly requiredProviderPieces: readonly string[];
  readonly requiredAdminPieces: readonly string[];
  readonly localDraftAllowedNow?: boolean;
};

const SHORTS_PIPELINE_SEEDS: readonly ShortsPipelineSeed[] = [
  {
    titleRu: "Локальный черновик Shorts",
    titleEn: "Local Shorts draft",
    descriptionRu: "Редактор может хранить только локальное состояние черновика. Серверная загрузка, feed и публикация закрыты до backend/provider этапа.",
    descriptionEn: "The editor may hold local draft state only. Server upload, feed indexing and publishing stay locked until the backend/provider stage.",
    source: "camera_recording",
    asset: "raw_source_video",
    phase: "local_draft_created",
    requestedVisibility: "private_draft",
    gateAction: "upload_short_video",
    linkedRealtimeEventName: "shorts.upload_requested",
    linkedMediaAssetKind: "short_video_source",
    linkedMediaPhase: "source_intent_created",
    requiredBackendPieces: ["Draft intent route", "Idempotency key registry", "Local-to-server draft mapper"],
    requiredProviderPieces: ["None for local draft", "Storage remains server-side only later", "No direct mobile provider credentials"],
    requiredAdminPieces: ["Owner approval before real upload activation", "Admin visibility of provider-not-configured blocker"],
    localDraftAllowedNow: true,
  },
  {
    titleRu: "Проверка источника видео",
    titleEn: "Shorts source validation",
    descriptionRu: "Галерея, камера, звук, эффекты и обложка требуют backend validation contract перед любой загрузкой.",
    descriptionEn: "Gallery, camera, audio, effects and cover metadata require a backend validation contract before any upload.",
    source: "gallery_video",
    asset: "raw_source_video",
    phase: "source_validation_required",
    requestedVisibility: "private_draft",
    gateAction: "upload_short_video",
    linkedRealtimeEventName: "shorts.upload_requested",
    linkedMediaAssetKind: "short_video_source",
    linkedMediaPhase: "capability_preflight_required",
    requiredBackendPieces: ["Source validation route", "Allowed MIME/duration/size policy", "Checksum/idempotency validation"],
    requiredProviderPieces: ["Object storage pre-signed upload policy later", "Server-side credentials only", "Provider quota/readiness snapshot"],
    requiredAdminPieces: ["Upload rules panel", "Blocked reason display", "Abuse/copyright policy handoff"],
  },
  {
    titleRu: "Загрузка в хранилище",
    titleEn: "Object storage upload",
    descriptionRu: "Реальная загрузка Shorts остаётся закрытой до object storage, virus scan, quota и owner-approved provider gate.",
    descriptionEn: "Real Shorts upload remains locked until object storage, virus scan, quota and an owner-approved provider gate exist.",
    source: "imported_clip",
    asset: "raw_source_video",
    phase: "upload_storage_blocked",
    requestedVisibility: "private_draft",
    gateAction: "upload_short_video",
    linkedRealtimeEventName: "shorts.upload_requested",
    linkedMediaAssetKind: "short_video_source",
    linkedMediaPhase: "shorts_upload_storage_blocked",
    requiredBackendPieces: ["Upload intent route", "Pre-signed upload mapper", "Upload completion webhook verifier"],
    requiredProviderPieces: ["Object storage bucket", "Server-side storage credentials", "Upload quota and retention policy"],
    requiredAdminPieces: ["Storage provider readiness gate", "Upload abuse audit", "Emergency upload disable switch"],
  },
  {
    titleRu: "Проверка безопасности файла",
    titleEn: "File safety scan",
    descriptionRu: "После загрузки нужен серверный scan pipeline. UI не должен показывать успешную загрузку без реального scan status.",
    descriptionEn: "After upload, a server-side scan pipeline is required. UI must not show successful upload without a real scan status.",
    source: "gallery_video",
    asset: "moderation_evidence_snapshot",
    phase: "virus_scan_blocked",
    requestedVisibility: "admin_review_later",
    gateAction: "upload_short_video",
    linkedRealtimeEventName: "shorts.upload_requested",
    linkedMediaAssetKind: "admin_diagnostic_snapshot",
    linkedMediaPhase: "admin_diagnostics_only",
    requiredBackendPieces: ["Scan job state model", "Quarantine state", "Safe failure/rollback response mapper"],
    requiredProviderPieces: ["Malware/virus scan provider or internal scanner", "Quarantine storage boundary", "Webhook verification"],
    requiredAdminPieces: ["Unsafe upload review queue", "Evidence retention policy", "Admin-only scan diagnostics"],
  },
  {
    titleRu: "Модерация перед публикацией",
    titleEn: "Pre-publish moderation",
    descriptionRu: "Публикация Shorts требует moderation/Admin contract. Автоматическое наказание или fake approve запрещены.",
    descriptionEn: "Shorts publishing requires a moderation/Admin contract. Automatic punishment or fake approval is forbidden.",
    source: "camera_recording",
    asset: "moderation_evidence_snapshot",
    phase: "moderation_preflight_blocked",
    requestedVisibility: "admin_review_later",
    gateAction: "submit_ai_moderation_decision",
    linkedRealtimeEventName: "moderation.report_requested",
    linkedMediaAssetKind: "admin_diagnostic_snapshot",
    linkedMediaPhase: "admin_diagnostics_only",
    requiredBackendPieces: ["Moderation preflight route", "Evidence snapshot model", "Review-required response mapper"],
    requiredProviderPieces: ["Moderation AI provider later", "No mobile-side final decision", "Provider confidence/audit fields"],
    requiredAdminPieces: ["18+ / abuse review queue", "Human/Admin override", "Do-not-accuse user-facing copy policy"],
  },
  {
    titleRu: "Проверка прав на звук и контент",
    titleEn: "Audio/content rights review",
    descriptionRu: "MP3/звук, эффекты, шаблоны и бизнес-контент требуют rights/compliance layer перед публичной публикацией.",
    descriptionEn: "MP3/audio, effects, templates and business content require a rights/compliance layer before public publishing.",
    source: "creator_template_clip",
    asset: "audio_track_reference",
    phase: "copyright_review_required",
    requestedVisibility: "admin_review_later",
    gateAction: "submit_report_evidence",
    linkedRealtimeEventName: "moderation.report_requested",
    linkedMediaAssetKind: "admin_diagnostic_snapshot",
    linkedMediaPhase: "admin_diagnostics_only",
    requiredBackendPieces: ["Rights metadata contract", "Audio license status", "Content takedown state"],
    requiredProviderPieces: ["Rights database/provider later", "Audio asset storage boundary", "License verification webhook"],
    requiredAdminPieces: ["Rights review panel", "Takedown audit log", "Business/creator dispute workflow"],
  },
  {
    titleRu: "Транскодинг Shorts",
    titleEn: "Shorts transcoding",
    descriptionRu: "Обработка видео, cover frame и preview manifest закрыты до transcode pipeline. Fake processed state запрещён.",
    descriptionEn: "Video processing, cover frame and preview manifest stay locked until the transcode pipeline exists. Fake processed state is forbidden.",
    source: "gallery_video",
    asset: "encoded_short",
    phase: "transcoding_pipeline_blocked",
    requestedVisibility: "private_draft",
    gateAction: "transcode_short_video",
    linkedRealtimeEventName: "shorts.upload_requested",
    linkedMediaAssetKind: "short_video_source",
    linkedMediaPhase: "transcoding_pipeline_blocked",
    requiredBackendPieces: ["Transcode job route", "Job status polling contract", "Failure/rollback mapper"],
    requiredProviderPieces: ["Transcoding workers/provider", "Profile ladder policy", "Thumbnail extraction"],
    requiredAdminPieces: ["Transcode health diagnostics", "Queue backlog panel", "Provider cost/limit control"],
  },
  {
    titleRu: "Обложка и миниатюра",
    titleEn: "Cover and thumbnail generation",
    descriptionRu: "Выбор cover frame в UI остаётся локальным до server-side thumbnail generation и storage write.",
    descriptionEn: "Cover frame selection remains local until server-side thumbnail generation and storage write are available.",
    source: "camera_recording",
    asset: "cover_frame",
    phase: "thumbnail_generation_blocked",
    requestedVisibility: "private_draft",
    gateAction: "transcode_short_video",
    linkedRealtimeEventName: "shorts.upload_requested",
    linkedMediaAssetKind: "thumbnail_or_cover",
    linkedMediaPhase: "transcoding_pipeline_blocked",
    requiredBackendPieces: ["Cover frame contract", "Thumbnail storage reference", "Atomic asset association"],
    requiredProviderPieces: ["Image/thumbnail generator", "Object storage write", "CDN invalidation later"],
    requiredAdminPieces: ["Thumbnail moderation", "Unsafe image review", "Manual cover reset control"],
  },
  {
    titleRu: "Публикация Shorts",
    titleEn: "Shorts publishing",
    descriptionRu: "Кнопка публикации должна оставаться закрытой до backend publish route, moderation pass, feed index and provider readiness.",
    descriptionEn: "The publish button must remain locked until the backend publish route, moderation pass, feed index and provider readiness exist.",
    source: "gallery_video",
    asset: "published_short_record",
    phase: "publish_review_blocked",
    requestedVisibility: "public_later",
    gateAction: "publish_short_video",
    linkedRealtimeEventName: "shorts.publish_blocked",
    linkedMediaAssetKind: "playback_manifest",
    linkedMediaPhase: "playback_cdn_blocked",
    requiredBackendPieces: ["Publish route", "Moderation pass validator", "Atomic publish state transition"],
    requiredProviderPieces: ["Playback manifest provider", "CDN distribution", "Provider health gate"],
    requiredAdminPieces: ["Publish activation gate", "Content takedown control", "Audit trail"],
  },
  {
    titleRu: "Индексация в ленте",
    titleEn: "Feed indexing",
    descriptionRu: "Shorts не попадают в ленту без backend feed index. Fake views/likes/trending запрещены.",
    descriptionEn: "Shorts do not enter the feed without a backend feed index. Fake views, likes and trending are forbidden.",
    source: "business_product_clip",
    asset: "feed_index_record",
    phase: "feed_index_blocked",
    requestedVisibility: "business_catalog_later",
    gateAction: "publish_short_video",
    linkedRealtimeEventName: "shorts.publish_blocked",
    linkedMediaAssetKind: "analytics_event",
    linkedMediaPhase: "analytics_write_blocked",
    requiredBackendPieces: ["Feed indexing worker", "Ranking input contract", "Business/creator ownership binding"],
    requiredProviderPieces: ["Search/recommendation provider later", "No client-side trending", "Provider diagnostics"],
    requiredAdminPieces: ["Feed safety controls", "Business content review", "Manual de-index action"],
  },
  {
    titleRu: "Playback manifest после публикации",
    titleEn: "Post-publish playback manifest",
    descriptionRu: "Воспроизведение опубликованного Shorts требует manifest/CDN; UI не должен показывать provider playback без реальной ссылки.",
    descriptionEn: "Published Shorts playback requires a manifest/CDN; UI must not show provider playback without a real URL.",
    source: "gallery_video",
    asset: "encoded_short",
    phase: "playback_manifest_blocked",
    requestedVisibility: "public_later",
    gateAction: "load_playback_manifest",
    linkedRealtimeEventName: "shorts.publish_blocked",
    linkedMediaAssetKind: "playback_manifest",
    linkedMediaPhase: "playback_cdn_blocked",
    requiredBackendPieces: ["Playback manifest route", "Signed playback policy", "Missing-provider state mapper"],
    requiredProviderPieces: ["CDN/playback provider", "Signed URL or token policy", "Provider failover status"],
    requiredAdminPieces: ["Playback diagnostics", "Access restriction controls", "Region/copyright controls"],
  },
  {
    titleRu: "Аналитика Shorts",
    titleEn: "Shorts analytics",
    descriptionRu: "Views, likes, saves, shares and retention must come from backend analytics; fake counters are forbidden.",
    descriptionEn: "Views, likes, saves, shares and retention must come from backend analytics; fake counters are forbidden.",
    source: "camera_recording",
    asset: "analytics_event",
    phase: "analytics_write_blocked",
    requestedVisibility: "public_later",
    gateAction: "write_view_analytics",
    linkedRealtimeEventName: "admin.readiness_snapshot_requested",
    linkedMediaAssetKind: "analytics_event",
    linkedMediaPhase: "analytics_write_blocked",
    requiredBackendPieces: ["Analytics event route", "Deduplication/idempotency", "Creator dashboard aggregate mapper"],
    requiredProviderPieces: ["Analytics pipeline/storage", "Privacy-safe aggregation", "Abuse-resistant counters"],
    requiredAdminPieces: ["Metric integrity diagnostics", "Suspicious engagement review", "Counter correction policy"],
  },
];

function buildShortsPipelinePlan(seed: ShortsPipelineSeed): Stream135FShortsPipelinePlan {
  return {
    version: "STREAM-CORE-135F",
    titleRu: seed.titleRu,
    titleEn: seed.titleEn,
    descriptionRu: seed.descriptionRu,
    descriptionEn: seed.descriptionEn,
    source: seed.source,
    asset: seed.asset,
    phase: seed.phase,
    requestedVisibility: seed.requestedVisibility,
    gateAction: seed.gateAction,
    providerGate: getStream135CProviderGate(seed.gateAction),
    linkedRealtimeEventName: seed.linkedRealtimeEventName,
    linkedMediaAssetKind: seed.linkedMediaAssetKind,
    linkedMediaPhase: seed.linkedMediaPhase,
    requiredBackendPieces: seed.requiredBackendPieces,
    requiredProviderPieces: seed.requiredProviderPieces,
    requiredAdminPieces: seed.requiredAdminPieces,
    blockedByDefault: true,
    localDraftAllowedNow: seed.localDraftAllowedNow === true,
    serverMutationAllowedNow: false,
    databaseWriteAllowedNow: false,
    providerCallAllowedNow: false,
    fakeUploadSuccessAllowed: false,
    fakePublishSuccessAllowed: false,
  };
}

export const STREAM_135F_SHORTS_PIPELINE_PHASES: readonly Stream135FShortsPipelinePhase[] = [
  "local_draft_created",
  "source_validation_required",
  "upload_storage_blocked",
  "virus_scan_blocked",
  "moderation_preflight_blocked",
  "copyright_review_required",
  "transcoding_pipeline_blocked",
  "thumbnail_generation_blocked",
  "publish_review_blocked",
  "feed_index_blocked",
  "playback_manifest_blocked",
  "analytics_write_blocked",
  "rollback_required",
  "admin_diagnostics_only",
];

export const STREAM_135F_SHORTS_UPLOAD_PUBLISH_REGISTRY: Stream135FShortsFoundationRegistry = {
  version: "STREAM-CORE-135F",
  title: "Shorts upload/publish foundation draft",
  summary:
    "Safe handoff contracts for Shorts source validation, upload, scan, moderation, rights, transcode, publish, feed index, playback and analytics. All server/provider side effects remain blocked by default.",
  sourceScope: "mobile_repository_contract_handoff_only",
  inheritedProviderGateRegistryVersion: STREAM_135C_PROVIDER_GATE_REGISTRY.version,
  inheritedRealtimeRegistryVersion: STREAM_135D_REALTIME_SIGNALING_REGISTRY.version,
  inheritedMediaLifecycleRegistryVersion: STREAM_135E_MEDIA_LIFECYCLE_REGISTRY.version,
  plans: SHORTS_PIPELINE_SEEDS.map(buildShortsPipelinePlan),
  canonicalPhases: STREAM_135F_SHORTS_PIPELINE_PHASES,
  publishInvariants: [
    "Local draft state may exist, but server upload must remain locked until object storage/provider/Admin gates are configured.",
    "A Shorts item may not become public without scan, moderation, rights and publish-state checks.",
    "Feed index, playback manifest, analytics counters and creator metrics must come from backend/provider data only.",
    "Mobile must not store provider credentials, upload secrets, CDN signing keys or final moderation decision keys.",
    "Retry must be idempotent and must not create duplicate upload, publish, feed index or analytics rows.",
    "Fake upload success, fake publish success, fake playback links and fake engagement counters are forbidden.",
  ],
  requiredServerRuntime: [
    "Shorts draft intent route",
    "Source validation and idempotency route",
    "Object storage upload intent and completion verification",
    "Scan/quarantine job model",
    "Moderation and rights preflight",
    "Transcode job queue and status route",
    "Atomic publish state transition",
    "Feed index worker",
    "Playback manifest route",
    "Analytics event ingestion with deduplication",
  ],
  requiredProviderRuntime: [
    "Object storage provider",
    "Virus/malware scanner",
    "Moderation/rights provider or Admin review workflow",
    "Transcoding workers/provider",
    "Playback/CDN provider",
    "Analytics storage/pipeline",
  ],
  requiredAdminRuntime: [
    "Provider-not-configured blocker panel",
    "Shorts upload/publish readiness gate",
    "18+ / abuse / copyright review queues",
    "Manual takedown and de-index controls",
    "Provider cost/health diagnostics",
    "Suspicious engagement review",
  ],
  nextExecutionStep: "STREAM-CORE-135G_PLAYBACK_ANALYTICS_FOUNDATION_DRAFT",
  safety: {
    mobileUiChangedNow: false,
    backendRoutesMountedNow: false,
    uploadRouteMountedNow: false,
    publishRouteMountedNow: false,
    databaseWriteExecutedNow: false,
    objectStorageWriteExecutedNow: false,
    providerCallExecutedNow: false,
    secretReadExecutedNow: false,
    fakeUploadAllowed: false,
    fakeTranscodingAllowed: false,
    fakeModerationAllowed: false,
    fakePublishAllowed: false,
    fakeFeedIndexAllowed: false,
    fakePlaybackAllowed: false,
    fakeAnalyticsAllowed: false,
  },
};

export function createStream135FShortsUploadIntent(args: {
  readonly ids: Stream135BIdentifier;
  readonly source: Stream135FShortsDraftSource;
  readonly asset: Stream135FShortsMetadataAsset;
  readonly phase: Stream135FShortsPipelinePhase;
  readonly requestedVisibility?: Stream135FShortsPublishVisibility;
  readonly requestedAtIso: string;
  readonly idempotencyKey: string;
}): Stream135FShortsUploadIntent {
  const uploadGate = getStream135CProviderGate("upload_short_video");
  const transcodeGate = getStream135CProviderGate("transcode_short_video");
  const publishGate = getStream135CProviderGate("publish_short_video");

  return {
    version: "STREAM-CORE-135F",
    ids: args.ids,
    source: args.source,
    asset: args.asset,
    phase: args.phase,
    requestedVisibility: args.requestedVisibility ?? "private_draft",
    requestedAtIso: args.requestedAtIso,
    idempotencyKey: args.idempotencyKey,
    uploadGate,
    transcodeGate,
    publishGate,
    linkedRealtimeEventName: args.phase === "publish_review_blocked" ? "shorts.publish_blocked" : "shorts.upload_requested",
    linkedMediaAssetKind: args.asset === "encoded_short" ? "playback_manifest" : "short_video_source",
    linkedMediaPhase: args.phase === "transcoding_pipeline_blocked" ? "transcoding_pipeline_blocked" : "shorts_upload_storage_blocked",
    payloadSchema: "shorts_upload_publish_contract_placeholder",
    localDraftAllowedNow: true,
    serverUploadAllowedNow: false,
    objectStorageWriteAllowedNow: false,
    virusScanAllowedNow: false,
    moderationAiAllowedNow: false,
    transcodeAllowedNow: false,
    publishAllowedNow: false,
    feedIndexWriteAllowedNow: false,
    playbackManifestAllowedNow: false,
    analyticsWriteAllowedNow: false,
    databaseWriteAllowedNow: false,
    providerCallAllowedNow: false,
    fakeUploadSuccessAllowed: false,
    fakePublishSuccessAllowed: false,
  };
}

export function getStream135FShortsPipelinePlan(
  phase: Stream135FShortsPipelinePhase,
): Stream135FShortsPipelinePlan | undefined {
  return STREAM_135F_SHORTS_UPLOAD_PUBLISH_REGISTRY.plans.find((plan) => plan.phase === phase);
}

export function blockStream135FShortsUploadPublish(
  action: Extract<Stream135CActionKey, "upload_short_video" | "transcode_short_video" | "publish_short_video" | "load_playback_manifest" | "write_view_analytics">,
): Stream135CBlockedActionResult {
  return createStream135CBlockedActionResult(action);
}
