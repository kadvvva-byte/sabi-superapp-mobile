import {
  createStream135CBlockedActionResult,
  getStream135CProviderGate,
  STREAM_135C_PROVIDER_GATE_REGISTRY,
  type Stream135CActionKey,
  type Stream135CBlockedActionResult,
  type Stream135CProviderGate,
} from "./stream135cProviderGateLayerDraft";
import type {
  Stream135BIdentifier,
  Stream135BRoomMode,
  Stream135BSourceKind,
} from "./stream135bBackendCoreContractsDraft";
import {
  STREAM_135D_REALTIME_SIGNALING_REGISTRY,
  type Stream135DRealtimeEventName,
} from "./stream135dRealtimeSignalingFoundationDraft";

export type Stream135EMediaLifecyclePhase =
  | "source_intent_created"
  | "capability_preflight_required"
  | "provider_handoff_blocked"
  | "live_transport_blocked"
  | "recording_storage_blocked"
  | "shorts_upload_storage_blocked"
  | "transcoding_pipeline_blocked"
  | "playback_cdn_blocked"
  | "analytics_write_blocked"
  | "session_close_or_rollback_required"
  | "admin_diagnostics_only";

export type Stream135EMediaSurface =
  | "single_live_camera"
  | "group_live_camera"
  | "audio_live_microphone"
  | "game_broadcast_screen"
  | "video_file_broadcast"
  | "business_stream_showcase"
  | "shorts_creator_source"
  | "recording_archive"
  | "playback_viewer"
  | "admin_media_diagnostics";

export type Stream135EMediaAssetKind =
  | "live_transport_session"
  | "audio_transport_session"
  | "screen_capture_session"
  | "video_file_source"
  | "short_video_source"
  | "recording_file"
  | "playback_manifest"
  | "thumbnail_or_cover"
  | "analytics_event"
  | "admin_diagnostic_snapshot";

export type Stream135EMediaLifecycleIntent = {
  readonly version: "STREAM-CORE-135E";
  readonly ids: Stream135BIdentifier;
  readonly mode: Stream135BRoomMode;
  readonly sourceKind: Stream135BSourceKind;
  readonly surface: Stream135EMediaSurface;
  readonly assetKind: Stream135EMediaAssetKind;
  readonly requestedAtIso: string;
  readonly idempotencyKey: string;
  readonly lifecyclePhase: Stream135EMediaLifecyclePhase;
  readonly providerGate: Stream135CProviderGate;
  readonly linkedRealtimeEventName: Stream135DRealtimeEventName;
  readonly payloadSchema: "media_lifecycle_contract_placeholder";
  readonly auditRequired: true;
  readonly adminReviewRequiredBeforeActivation: true;
  readonly liveTransportAllowedNow: false;
  readonly recordingAllowedNow: false;
  readonly objectStorageWriteAllowedNow: false;
  readonly transcodingAllowedNow: false;
  readonly playbackCdnAllowedNow: false;
  readonly analyticsWriteAllowedNow: false;
  readonly databaseWriteAllowedNow: false;
  readonly providerCallAllowedNow: false;
  readonly fakeMediaSuccessAllowed: false;
};

export type Stream135EMediaLifecyclePlan = {
  readonly version: "STREAM-CORE-135E";
  readonly surface: Stream135EMediaSurface;
  readonly assetKind: Stream135EMediaAssetKind;
  readonly phase: Stream135EMediaLifecyclePhase;
  readonly titleRu: string;
  readonly titleEn: string;
  readonly descriptionRu: string;
  readonly descriptionEn: string;
  readonly mode: Stream135BRoomMode;
  readonly sourceKind: Stream135BSourceKind;
  readonly gateAction: Stream135CActionKey;
  readonly linkedRealtimeEventName: Stream135DRealtimeEventName;
  readonly providerGate: Stream135CProviderGate;
  readonly requiredBackendPieces: readonly string[];
  readonly requiredProviderPieces: readonly string[];
  readonly requiredAdminPieces: readonly string[];
  readonly blockedByDefault: true;
  readonly providerCallAllowedNow: false;
  readonly databaseWriteAllowedNow: false;
  readonly fakeMediaSuccessAllowed: false;
};

export type Stream135EMediaLifecycleRegistry = {
  readonly version: "STREAM-CORE-135E";
  readonly title: string;
  readonly summary: string;
  readonly sourceScope: "mobile_repository_contract_handoff_only";
  readonly inheritedProviderGateRegistryVersion: typeof STREAM_135C_PROVIDER_GATE_REGISTRY.version;
  readonly inheritedRealtimeRegistryVersion: typeof STREAM_135D_REALTIME_SIGNALING_REGISTRY.version;
  readonly plans: readonly Stream135EMediaLifecyclePlan[];
  readonly lifecyclePhases: readonly Stream135EMediaLifecyclePhase[];
  readonly requiredServerRuntime: readonly string[];
  readonly requiredProviderRuntime: readonly string[];
  readonly requiredAdminRuntime: readonly string[];
  readonly nextExecutionStep: "STREAM-CORE-135F_SHORTS_UPLOAD_PUBLISH_FOUNDATION_DRAFT";
  readonly safety: {
    readonly mobileUiChangedNow: false;
    readonly backendRoutesMountedNow: false;
    readonly mediaServerStartedNow: false;
    readonly storageBucketCreatedNow: false;
    readonly databaseWriteExecutedNow: false;
    readonly providerCallExecutedNow: false;
    readonly secretReadExecutedNow: false;
    readonly fakeLiveAllowed: false;
    readonly fakeRecordingAllowed: false;
    readonly fakeUploadAllowed: false;
    readonly fakeTranscodingAllowed: false;
    readonly fakePlaybackAllowed: false;
    readonly fakeAnalyticsAllowed: false;
    readonly fakeCdnAllowed: false;
  };
};

type MediaLifecycleSeed = {
  readonly surface: Stream135EMediaSurface;
  readonly assetKind: Stream135EMediaAssetKind;
  readonly phase: Stream135EMediaLifecyclePhase;
  readonly titleRu: string;
  readonly titleEn: string;
  readonly descriptionRu: string;
  readonly descriptionEn: string;
  readonly mode: Stream135BRoomMode;
  readonly sourceKind: Stream135BSourceKind;
  readonly gateAction: Stream135CActionKey;
  readonly linkedRealtimeEventName: Stream135DRealtimeEventName;
  readonly requiredBackendPieces: readonly string[];
  readonly requiredProviderPieces: readonly string[];
  readonly requiredAdminPieces: readonly string[];
};

const MEDIA_LIFECYCLE_SEEDS: readonly MediaLifecycleSeed[] = [
  {
    surface: "single_live_camera",
    assetKind: "live_transport_session",
    phase: "live_transport_blocked",
    titleRu: "Одиночный эфир с камеры",
    titleEn: "Single camera live session",
    descriptionRu: "Камера может готовить intent, но реальный транспорт эфира закрыт до media provider и Admin gate.",
    descriptionEn: "The camera can prepare an intent, but real live transport stays locked until the media provider and Admin gate exist.",
    mode: "single_live",
    sourceKind: "camera",
    gateAction: "open_media_transport",
    linkedRealtimeEventName: "room.provider_handoff_blocked",
    requiredBackendPieces: ["Media session intent route", "Room lifecycle state binding", "Provider handoff response mapper"],
    requiredProviderPieces: ["Live transport adapter", "Credentials held server-side only", "Provider health/readiness snapshot"],
    requiredAdminPieces: ["Owner activation approval", "18+ / safety gate", "Provider-not-configured blocker panel"],
  },
  {
    surface: "group_live_camera",
    assetKind: "live_transport_session",
    phase: "provider_handoff_blocked",
    titleRu: "Групповой эфир",
    titleEn: "Group live session",
    descriptionRu: "Группа и соведущие требуют backend room roles, realtime sync и media transport; fake group-live запрещён.",
    descriptionEn: "Group and co-host live require backend room roles, realtime sync and media transport; fake group-live is forbidden.",
    mode: "group_live",
    sourceKind: "camera",
    gateAction: "start_live_room",
    linkedRealtimeEventName: "cohost.invite_requested",
    requiredBackendPieces: ["Room participant role model", "Cohost state machine", "Idempotent start/preflight route"],
    requiredProviderPieces: ["Multi-participant media routing", "Realtime presence adapter", "Safe disconnect/recover policy"],
    requiredAdminPieces: ["Cohost abuse controls", "Room restriction hold", "Audit trail for role transitions"],
  },
  {
    surface: "audio_live_microphone",
    assetKind: "audio_transport_session",
    phase: "live_transport_blocked",
    titleRu: "Аудио-эфир",
    titleEn: "Audio live session",
    descriptionRu: "Аудио-эфир остаётся intent-only до media provider, realtime rooms и moderation gates.",
    descriptionEn: "Audio live remains intent-only until the media provider, realtime rooms and moderation gates are connected.",
    mode: "audio_live",
    sourceKind: "microphone",
    gateAction: "open_media_transport",
    linkedRealtimeEventName: "room.preflight_requested",
    requiredBackendPieces: ["Audio session contract", "Speaker/listener role mapping", "Moderation precheck"],
    requiredProviderPieces: ["Audio transport adapter", "Mute/kick provider boundary", "Provider reconnect policy"],
    requiredAdminPieces: ["Voice abuse report queue", "18+ or adult-content gate", "Host safety controls"],
  },
  {
    surface: "game_broadcast_screen",
    assetKind: "screen_capture_session",
    phase: "capability_preflight_required",
    titleRu: "Трансляция игры/экрана",
    titleEn: "Game/screen broadcast",
    descriptionRu: "Захват экрана требует platform permission, backend preflight и provider adapter; запись/эфир не имитируются.",
    descriptionEn: "Screen capture requires platform permission, backend preflight and provider adapter; recording/live state is not simulated.",
    mode: "game_broadcast",
    sourceKind: "game_capture",
    gateAction: "open_media_transport",
    linkedRealtimeEventName: "room.preflight_requested",
    requiredBackendPieces: ["Screen source capability contract", "Preflight risk/safety response", "Source rollback route"],
    requiredProviderPieces: ["Screen ingest adapter", "Bitrate/resolution policy", "Provider failure fallback state"],
    requiredAdminPieces: ["Copyright/game content policy", "Abuse reporting", "Provider diagnostics"],
  },
  {
    surface: "video_file_broadcast",
    assetKind: "video_file_source",
    phase: "shorts_upload_storage_blocked",
    titleRu: "Видео-файл для эфира",
    titleEn: "Video file broadcast source",
    descriptionRu: "Видео-файл не может стать эфиром без storage/transcode/media pipeline; fake upload/publish запрещены.",
    descriptionEn: "A video file cannot become a broadcast without storage/transcode/media pipeline; fake upload/publish is forbidden.",
    mode: "video_file_broadcast",
    sourceKind: "video_file",
    gateAction: "upload_short_video",
    linkedRealtimeEventName: "shorts.upload_requested",
    requiredBackendPieces: ["Upload intent route", "Object metadata model", "Content review status"],
    requiredProviderPieces: ["Object storage bucket", "Signed upload policy", "Virus/format scan later"],
    requiredAdminPieces: ["Media review queue", "Copyright/rights marker", "Restricted content review"],
  },
  {
    surface: "business_stream_showcase",
    assetKind: "thumbnail_or_cover",
    phase: "admin_diagnostics_only",
    titleRu: "Business Stream витрина",
    titleEn: "Business Stream showcase",
    descriptionRu: "Витрина товара может быть отображена только после business/merchant readiness; fake заказ/оплата запрещены.",
    descriptionEn: "Product showcase can be displayed only after business/merchant readiness; fake order/payment is forbidden.",
    mode: "business_stream",
    sourceKind: "business_catalog",
    gateAction: "sync_business_catalog",
    linkedRealtimeEventName: "business.catalog_snapshot_requested",
    requiredBackendPieces: ["Business account binding", "Catalog snapshot contract", "Checkout-blocked response"],
    requiredProviderPieces: ["Marketplace/SilkRoad catalog boundary", "Merchant provider gate", "No payment provider call from Stream"],
    requiredAdminPieces: ["Merchant KYB/KYC status", "Catalog compliance review", "Business risk hold controls"],
  },
  {
    surface: "shorts_creator_source",
    assetKind: "short_video_source",
    phase: "transcoding_pipeline_blocked",
    titleRu: "Shorts источник автора",
    titleEn: "Creator Shorts source",
    descriptionRu: "Shorts может подготовить источник локально, но upload/transcode/publish закрыты до provider foundation.",
    descriptionEn: "Shorts can prepare a local source, but upload/transcode/publish stay locked until provider foundation exists.",
    mode: "short_video",
    sourceKind: "shorts_source",
    gateAction: "transcode_short_video",
    linkedRealtimeEventName: "shorts.publish_blocked",
    requiredBackendPieces: ["Shorts processing state machine", "Transcode job contract", "Publish review status"],
    requiredProviderPieces: ["Transcoding queue/worker", "Object storage", "Playback manifest generation"],
    requiredAdminPieces: ["Content safety review", "Copyright review", "Creator strike/appeal path"],
  },
  {
    surface: "recording_archive",
    assetKind: "recording_file",
    phase: "recording_storage_blocked",
    titleRu: "Запись и архив эфира",
    titleEn: "Live recording archive",
    descriptionRu: "Запись эфира требует recording policy, storage, retention и Admin controls; fake archive запрещён.",
    descriptionEn: "Live recording requires recording policy, storage, retention and Admin controls; fake archive is forbidden.",
    mode: "single_live",
    sourceKind: "camera",
    gateAction: "record_live_session",
    linkedRealtimeEventName: "room.end_requested",
    requiredBackendPieces: ["Recording policy model", "Retention/delete contract", "Room-end recording handoff"],
    requiredProviderPieces: ["Recording provider adapter", "Secure object storage", "CDN publish blocker until review"],
    requiredAdminPieces: ["Retention policy control", "Evidence/legal hold", "Creator archive permission"],
  },
  {
    surface: "playback_viewer",
    assetKind: "playback_manifest",
    phase: "playback_cdn_blocked",
    titleRu: "Просмотр и Playback/CDN",
    titleEn: "Viewer playback and CDN",
    descriptionRu: "Просмотр provider-контента требует manifest/token/CDN; fake просмотры и fake playback запрещены.",
    descriptionEn: "Provider content playback requires manifest/token/CDN; fake views and fake playback are forbidden.",
    mode: "single_live",
    sourceKind: "camera",
    gateAction: "load_playback_manifest",
    linkedRealtimeEventName: "viewer.join_requested",
    requiredBackendPieces: ["Playback token route", "Access policy", "Watch progress event contract"],
    requiredProviderPieces: ["CDN manifest adapter", "Signed playback URL", "Geo/device policy later"],
    requiredAdminPieces: ["Playback diagnostics", "Fraud/view-dedupe review", "Rights restriction controls"],
  },
  {
    surface: "admin_media_diagnostics",
    assetKind: "admin_diagnostic_snapshot",
    phase: "admin_diagnostics_only",
    titleRu: "Admin media diagnostics",
    titleEn: "Admin media diagnostics",
    descriptionRu: "Admin может видеть read-only blocker snapshot, но не активирует provider и не читает секреты.",
    descriptionEn: "Admin can view a read-only blocker snapshot, but does not activate providers or read secrets.",
    mode: "single_live",
    sourceKind: "camera",
    gateAction: "emit_realtime_event",
    linkedRealtimeEventName: "admin.readiness_snapshot_requested",
    requiredBackendPieces: ["Protected read-only diagnostics route", "No-secret response mapper", "Provider gate summary"],
    requiredProviderPieces: ["Server-side provider env binding later", "No mobile secrets", "Activation remains owner-approved"],
    requiredAdminPieces: ["Owner-only panel", "Provider activation checklist", "Audit log for activation attempts"],
  },
] as const;

export const STREAM_135E_MEDIA_LIFECYCLE_PHASES: readonly Stream135EMediaLifecyclePhase[] = [
  "source_intent_created",
  "capability_preflight_required",
  "provider_handoff_blocked",
  "live_transport_blocked",
  "recording_storage_blocked",
  "shorts_upload_storage_blocked",
  "transcoding_pipeline_blocked",
  "playback_cdn_blocked",
  "analytics_write_blocked",
  "session_close_or_rollback_required",
  "admin_diagnostics_only",
] as const;

export const STREAM_135E_MEDIA_LIFECYCLE_PLANS: readonly Stream135EMediaLifecyclePlan[] = MEDIA_LIFECYCLE_SEEDS.map((seed) => ({
  version: "STREAM-CORE-135E",
  surface: seed.surface,
  assetKind: seed.assetKind,
  phase: seed.phase,
  titleRu: seed.titleRu,
  titleEn: seed.titleEn,
  descriptionRu: seed.descriptionRu,
  descriptionEn: seed.descriptionEn,
  mode: seed.mode,
  sourceKind: seed.sourceKind,
  gateAction: seed.gateAction,
  linkedRealtimeEventName: seed.linkedRealtimeEventName,
  providerGate: getStream135CProviderGate(seed.gateAction),
  requiredBackendPieces: seed.requiredBackendPieces,
  requiredProviderPieces: seed.requiredProviderPieces,
  requiredAdminPieces: seed.requiredAdminPieces,
  blockedByDefault: true,
  providerCallAllowedNow: false,
  databaseWriteAllowedNow: false,
  fakeMediaSuccessAllowed: false,
}));

export const STREAM_135E_MEDIA_LIFECYCLE_REGISTRY: Stream135EMediaLifecycleRegistry = {
  version: "STREAM-CORE-135E",
  title: "Stream media lifecycle foundation draft",
  summary:
    "Defines the safe media lifecycle boundary for live camera/audio/screen/video, Business Stream showcase, Shorts source, recording archive, playback/CDN and Admin media diagnostics. This is a mobile repository contract handoff only; it does not mount backend routes, create storage buckets, start media servers, write databases or call providers.",
  sourceScope: "mobile_repository_contract_handoff_only",
  inheritedProviderGateRegistryVersion: STREAM_135C_PROVIDER_GATE_REGISTRY.version,
  inheritedRealtimeRegistryVersion: STREAM_135D_REALTIME_SIGNALING_REGISTRY.version,
  plans: STREAM_135E_MEDIA_LIFECYCLE_PLANS,
  lifecyclePhases: STREAM_135E_MEDIA_LIFECYCLE_PHASES,
  requiredServerRuntime: [
    "Media session intent and preflight routes",
    "Room lifecycle binding for media handoff and rollback",
    "Object metadata model for uploaded video sources and recordings",
    "Playback token contract and watch-progress event contract",
    "Idempotency keys for every media lifecycle request",
    "No-secret provider status response mapper",
  ],
  requiredProviderRuntime: [
    "Server-side live media transport adapter",
    "Server-side object storage adapter",
    "Server-side transcoding/processing worker",
    "Server-side Playback/CDN adapter",
    "Recording and retention provider policy",
    "Provider health/readiness snapshot without exposing secrets",
  ],
  requiredAdminRuntime: [
    "Owner-only media provider activation gate",
    "18+ and safety review before provider activation",
    "Rights/copyright and restricted-content review queues",
    "Recording retention/legal hold controls",
    "Read-only media lifecycle diagnostics",
    "Audit log for every activation or blocked media attempt",
  ],
  nextExecutionStep: "STREAM-CORE-135F_SHORTS_UPLOAD_PUBLISH_FOUNDATION_DRAFT",
  safety: {
    mobileUiChangedNow: false,
    backendRoutesMountedNow: false,
    mediaServerStartedNow: false,
    storageBucketCreatedNow: false,
    databaseWriteExecutedNow: false,
    providerCallExecutedNow: false,
    secretReadExecutedNow: false,
    fakeLiveAllowed: false,
    fakeRecordingAllowed: false,
    fakeUploadAllowed: false,
    fakeTranscodingAllowed: false,
    fakePlaybackAllowed: false,
    fakeAnalyticsAllowed: false,
    fakeCdnAllowed: false,
  },
};

export function getStream135EMediaLifecycleRegistry(): Stream135EMediaLifecycleRegistry {
  return STREAM_135E_MEDIA_LIFECYCLE_REGISTRY;
}

export function getStream135EMediaLifecyclePlan(surface: Stream135EMediaSurface): Stream135EMediaLifecyclePlan {
  return STREAM_135E_MEDIA_LIFECYCLE_PLANS.find((plan) => plan.surface === surface) ?? STREAM_135E_MEDIA_LIFECYCLE_PLANS[0];
}

export function createStream135EMediaLifecycleIntent(input: {
  readonly ids: Stream135BIdentifier;
  readonly surface: Stream135EMediaSurface;
  readonly requestedAtIso: string;
}): Stream135EMediaLifecycleIntent {
  const plan = getStream135EMediaLifecyclePlan(input.surface);

  return {
    version: "STREAM-CORE-135E",
    ids: input.ids,
    mode: plan.mode,
    sourceKind: plan.sourceKind,
    surface: plan.surface,
    assetKind: plan.assetKind,
    requestedAtIso: input.requestedAtIso,
    idempotencyKey: input.ids.idempotencyKey,
    lifecyclePhase: plan.phase,
    providerGate: plan.providerGate,
    linkedRealtimeEventName: plan.linkedRealtimeEventName,
    payloadSchema: "media_lifecycle_contract_placeholder",
    auditRequired: true,
    adminReviewRequiredBeforeActivation: true,
    liveTransportAllowedNow: false,
    recordingAllowedNow: false,
    objectStorageWriteAllowedNow: false,
    transcodingAllowedNow: false,
    playbackCdnAllowedNow: false,
    analyticsWriteAllowedNow: false,
    databaseWriteAllowedNow: false,
    providerCallAllowedNow: false,
    fakeMediaSuccessAllowed: false,
  };
}

export function createStream135EMediaBlockedResult(
  actionKey: Stream135CActionKey = "open_media_transport",
): Stream135CBlockedActionResult {
  return createStream135CBlockedActionResult(actionKey);
}

export function isStream135EMediaProviderExecutionAllowed(): false {
  return false;
}

export function isStream135EFakeMediaSuccessAllowed(): false {
  return false;
}
