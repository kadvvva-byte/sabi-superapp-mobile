import {
  createStream135CBlockedActionResult,
  getStream135CProviderGate,
  STREAM_135C_PROVIDER_GATE_REGISTRY,
  type Stream135CActionKey,
  type Stream135CBlockedActionResult,
  type Stream135CProviderGate,
} from "./stream135cProviderGateLayerDraft";
import type { Stream135BIdentifier, Stream135BRoomMode } from "./stream135bBackendCoreContractsDraft";
import { STREAM_135F_SHORTS_UPLOAD_PUBLISH_REGISTRY } from "./stream135fShortsUploadPublishFoundationDraft";
import type { Stream135EMediaAssetKind } from "./stream135eMediaLifecycleFoundationDraft";
import type { Stream135DRealtimeEventName } from "./stream135dRealtimeSignalingFoundationDraft";

export type Stream135GPlaybackAnalyticsSurface =
  | "live_room_playback"
  | "shorts_feed_playback"
  | "business_stream_playback"
  | "creator_profile_video_grid"
  | "recording_archive_playback"
  | "viewer_watch_progress"
  | "engagement_counters"
  | "creator_dashboard_metrics"
  | "fraud_abuse_signals"
  | "admin_analytics_snapshot";

export type Stream135GPlaybackAnalyticsPhase =
  | "playback_manifest_blocked"
  | "cdn_token_blocked"
  | "viewer_session_required"
  | "watch_progress_write_blocked"
  | "view_counter_write_blocked"
  | "engagement_write_blocked"
  | "quality_metric_write_blocked"
  | "fraud_signal_review_required"
  | "creator_metric_write_blocked"
  | "admin_diagnostics_only"
  | "rollback_required";

export type Stream135GAnalyticsMetricKind =
  | "playback_manifest"
  | "watch_progress"
  | "deduped_view"
  | "like_event"
  | "share_event"
  | "save_event"
  | "comment_event"
  | "playback_quality"
  | "creator_reach"
  | "business_lead_signal"
  | "fraud_abuse_signal";

export type Stream135GPlaybackAnalyticsIntent = {
  readonly version: "STREAM-CORE-135G";
  readonly ids: Stream135BIdentifier;
  readonly roomMode: Stream135BRoomMode;
  readonly surface: Stream135GPlaybackAnalyticsSurface;
  readonly phase: Stream135GPlaybackAnalyticsPhase;
  readonly metricKind: Stream135GAnalyticsMetricKind;
  readonly requestedAtIso: string;
  readonly idempotencyKey: string;
  readonly playbackGate: Stream135CProviderGate;
  readonly analyticsGate: Stream135CProviderGate;
  readonly linkedRealtimeEventName: Stream135DRealtimeEventName;
  readonly linkedMediaAssetKind: Stream135EMediaAssetKind;
  readonly payloadSchema: "playback_analytics_contract_placeholder";
  readonly playbackManifestAllowedNow: false;
  readonly cdnTokenAllowedNow: false;
  readonly watchProgressWriteAllowedNow: false;
  readonly viewCounterWriteAllowedNow: false;
  readonly engagementWriteAllowedNow: false;
  readonly creatorMetricWriteAllowedNow: false;
  readonly fraudSignalAutoPunishmentAllowedNow: false;
  readonly databaseWriteAllowedNow: false;
  readonly providerCallAllowedNow: false;
  readonly fakePlaybackSuccessAllowed: false;
  readonly fakeViewCounterAllowed: false;
  readonly fakeAnalyticsSuccessAllowed: false;
};

export type Stream135GPlaybackAnalyticsPlan = {
  readonly version: "STREAM-CORE-135G";
  readonly surface: Stream135GPlaybackAnalyticsSurface;
  readonly phase: Stream135GPlaybackAnalyticsPhase;
  readonly metricKind: Stream135GAnalyticsMetricKind;
  readonly titleRu: string;
  readonly titleEn: string;
  readonly descriptionRu: string;
  readonly descriptionEn: string;
  readonly gateAction: Stream135CActionKey;
  readonly playbackGate: Stream135CProviderGate;
  readonly analyticsGate: Stream135CProviderGate;
  readonly linkedRealtimeEventName: Stream135DRealtimeEventName;
  readonly linkedMediaAssetKind: Stream135EMediaAssetKind;
  readonly requiredBackendPieces: readonly string[];
  readonly requiredProviderPieces: readonly string[];
  readonly requiredAdminPieces: readonly string[];
  readonly blockedByDefault: true;
  readonly databaseWriteAllowedNow: false;
  readonly providerCallAllowedNow: false;
  readonly fakePlaybackSuccessAllowed: false;
  readonly fakeAnalyticsSuccessAllowed: false;
};

export type Stream135GPlaybackAnalyticsRegistry = {
  readonly version: "STREAM-CORE-135G";
  readonly title: string;
  readonly summary: string;
  readonly sourceScope: "mobile_repository_contract_handoff_only";
  readonly inheritedProviderGateRegistryVersion: typeof STREAM_135C_PROVIDER_GATE_REGISTRY.version;
  readonly inheritedShortsRegistryVersion: typeof STREAM_135F_SHORTS_UPLOAD_PUBLISH_REGISTRY.version;
  readonly plans: readonly Stream135GPlaybackAnalyticsPlan[];
  readonly canonicalPhases: readonly Stream135GPlaybackAnalyticsPhase[];
  readonly analyticsInvariants: readonly string[];
  readonly requiredServerRuntime: readonly string[];
  readonly requiredProviderRuntime: readonly string[];
  readonly requiredAdminRuntime: readonly string[];
  readonly nextExecutionStep: "STREAM-CORE-135H_MODERATION_ADMIN_FOUNDATION_DRAFT";
  readonly safety: {
    readonly mobileUiChangedNow: false;
    readonly backendRoutesMountedNow: false;
    readonly playbackRouteMountedNow: false;
    readonly analyticsWorkerStartedNow: false;
    readonly databaseWriteExecutedNow: false;
    readonly providerCallExecutedNow: false;
    readonly secretReadExecutedNow: false;
    readonly fakePlaybackAllowed: false;
    readonly fakeViewsAllowed: false;
    readonly fakeEngagementAllowed: false;
    readonly fakeAnalyticsAllowed: false;
    readonly fakeCreatorEarningsAllowed: false;
  };
};

type PlaybackAnalyticsSeed = {
  readonly surface: Stream135GPlaybackAnalyticsSurface;
  readonly phase: Stream135GPlaybackAnalyticsPhase;
  readonly metricKind: Stream135GAnalyticsMetricKind;
  readonly titleRu: string;
  readonly titleEn: string;
  readonly descriptionRu: string;
  readonly descriptionEn: string;
  readonly gateAction: Stream135CActionKey;
  readonly linkedRealtimeEventName: Stream135DRealtimeEventName;
  readonly linkedMediaAssetKind: Stream135EMediaAssetKind;
  readonly requiredBackendPieces: readonly string[];
  readonly requiredProviderPieces: readonly string[];
  readonly requiredAdminPieces: readonly string[];
};

const PLAYBACK_ANALYTICS_SEEDS: readonly PlaybackAnalyticsSeed[] = [
  {
    surface: "live_room_playback",
    phase: "playback_manifest_blocked",
    metricKind: "playback_manifest",
    titleRu: "Live playback manifest",
    titleEn: "Live playback manifest",
    descriptionRu: "Эфир не может показывать реальный playback manifest без backend/provider токена, CDN policy и rollback path.",
    descriptionEn: "Live playback cannot expose a real playback manifest without backend/provider token, CDN policy and rollback path.",
    gateAction: "load_playback_manifest",
    linkedRealtimeEventName: "viewer.join_requested",
    linkedMediaAssetKind: "playback_manifest",
    requiredBackendPieces: ["Playback manifest route", "Viewer session binding", "Provider-not-configured response mapper"],
    requiredProviderPieces: ["CDN/playback provider", "Signed manifest policy", "Provider health snapshot"],
    requiredAdminPieces: ["Playback diagnostics", "Emergency playback disable", "No-secret route evidence"],
  },
  {
    surface: "shorts_feed_playback",
    phase: "cdn_token_blocked",
    metricKind: "playback_manifest",
    titleRu: "Shorts feed playback",
    titleEn: "Shorts feed playback",
    descriptionRu: "Shorts feed должен получать media URL только через backend manifest/token, без прямого provider URL из mobile.",
    descriptionEn: "The Shorts feed must receive media URLs only through backend manifest/token flow, never direct provider URLs from mobile.",
    gateAction: "load_playback_manifest",
    linkedRealtimeEventName: "shorts.publish_blocked",
    linkedMediaAssetKind: "playback_manifest",
    requiredBackendPieces: ["Published asset lookup", "Playback token route", "Public/private visibility guard"],
    requiredProviderPieces: ["CDN token signer", "Thumbnail/manifest storage", "Expiration and revocation policy"],
    requiredAdminPieces: ["Takedown/deindex switch", "Copyright/abuse review state", "Playback provider readiness gate"],
  },
  {
    surface: "viewer_watch_progress",
    phase: "watch_progress_write_blocked",
    metricKind: "watch_progress",
    titleRu: "Watch progress",
    titleEn: "Watch progress",
    descriptionRu: "Watch progress нужен для качества и рекомендаций, но запись событий запрещена до analytics ingestion и dedupe.",
    descriptionEn: "Watch progress is needed for quality and recommendations, but event writes are blocked until analytics ingestion and dedupe exist.",
    gateAction: "write_view_analytics",
    linkedRealtimeEventName: "host.heartbeat_requested",
    linkedMediaAssetKind: "analytics_event",
    requiredBackendPieces: ["Progress event ingestion", "Session/device dedupe", "Retention policy"],
    requiredProviderPieces: ["Analytics pipeline/storage", "Backpressure and retry controls", "Anomaly detection hook"],
    requiredAdminPieces: ["Analytics health dashboard", "Data retention controls", "Fraud review report"],
  },
  {
    surface: "engagement_counters",
    phase: "engagement_write_blocked",
    metricKind: "like_event",
    titleRu: "Likes/share/save counters",
    titleEn: "Likes/share/save counters",
    descriptionRu: "Лайки, share и save в UI не должны превращаться в fake counters; нужны backend events, limits и anti-fraud.",
    descriptionEn: "Likes, shares and saves in UI must not become fake counters; backend events, limits and anti-fraud are required.",
    gateAction: "write_view_analytics",
    linkedRealtimeEventName: "chat.message_requested",
    linkedMediaAssetKind: "analytics_event",
    requiredBackendPieces: ["Engagement event route", "Per-user idempotency", "Counter projection job"],
    requiredProviderPieces: ["Analytics queue", "Rate limit store", "Counter projection storage"],
    requiredAdminPieces: ["Suspicious engagement review", "Counter rollback controls", "Creator metric audit"],
  },
  {
    surface: "creator_dashboard_metrics",
    phase: "creator_metric_write_blocked",
    metricKind: "creator_reach",
    titleRu: "Creator metrics",
    titleEn: "Creator metrics",
    descriptionRu: "Охват, удержание и доход автора нельзя показывать как реальные до backend analytics и Wallet/earnings boundary.",
    descriptionEn: "Reach, retention and creator earnings must not be shown as real until backend analytics and Wallet/earnings boundaries exist.",
    gateAction: "write_view_analytics",
    linkedRealtimeEventName: "admin.readiness_snapshot_requested",
    linkedMediaAssetKind: "analytics_event",
    requiredBackendPieces: ["Creator analytics snapshot", "Metric aggregation job", "Wallet/earnings boundary flags"],
    requiredProviderPieces: ["Analytics warehouse later", "Aggregation worker", "Fraud-safe metric pipeline"],
    requiredAdminPieces: ["Creator analytics diagnostics", "Suspicious metrics hold", "No earnings claim until Wallet integration"],
  },
  {
    surface: "fraud_abuse_signals",
    phase: "fraud_signal_review_required",
    metricKind: "fraud_abuse_signal",
    titleRu: "Fraud/abuse analytics signals",
    titleEn: "Fraud/abuse analytics signals",
    descriptionRu: "Сигналы накрутки и abuse являются risk signals для review, не автоматическое наказание пользователя.",
    descriptionEn: "Fraud and abuse signals are review signals, not automatic user punishment.",
    gateAction: "write_view_analytics",
    linkedRealtimeEventName: "moderation.report_requested",
    linkedMediaAssetKind: "admin_diagnostic_snapshot",
    requiredBackendPieces: ["Risk signal event model", "Review queue handoff", "False-positive evidence notes"],
    requiredProviderPieces: ["Fraud detection pipeline later", "Velocity/anomaly store", "Manual review integration"],
    requiredAdminPieces: ["Risk review queue", "No automatic guilt decision", "Appeal/evidence policy"],
  },
  {
    surface: "admin_analytics_snapshot",
    phase: "admin_diagnostics_only",
    metricKind: "playback_quality",
    titleRu: "Admin analytics diagnostics",
    titleEn: "Admin analytics diagnostics",
    descriptionRu: "Admin snapshot может показывать readiness/blockers, но не запускать analytics worker или provider call.",
    descriptionEn: "Admin snapshot may show readiness/blockers, but must not start analytics workers or provider calls.",
    gateAction: "write_view_analytics",
    linkedRealtimeEventName: "admin.readiness_snapshot_requested",
    linkedMediaAssetKind: "admin_diagnostic_snapshot",
    requiredBackendPieces: ["Read-only analytics snapshot", "Provider readiness booleans", "No-secret response"],
    requiredProviderPieces: ["Provider status probe later", "No credential exposure", "Read-only health metadata"],
    requiredAdminPieces: ["Owner-only analytics readiness panel", "Unauth/auth smoke", "Rollback report"],
  },
];

export const STREAM_135G_PLAYBACK_ANALYTICS_PHASES: readonly Stream135GPlaybackAnalyticsPhase[] = [
  "playback_manifest_blocked",
  "cdn_token_blocked",
  "viewer_session_required",
  "watch_progress_write_blocked",
  "view_counter_write_blocked",
  "engagement_write_blocked",
  "quality_metric_write_blocked",
  "fraud_signal_review_required",
  "creator_metric_write_blocked",
  "admin_diagnostics_only",
  "rollback_required",
];

const buildPlaybackAnalyticsPlan = (seed: PlaybackAnalyticsSeed): Stream135GPlaybackAnalyticsPlan => ({
  version: "STREAM-CORE-135G",
  surface: seed.surface,
  phase: seed.phase,
  metricKind: seed.metricKind,
  titleRu: seed.titleRu,
  titleEn: seed.titleEn,
  descriptionRu: seed.descriptionRu,
  descriptionEn: seed.descriptionEn,
  gateAction: seed.gateAction,
  playbackGate: getStream135CProviderGate("load_playback_manifest"),
  analyticsGate: getStream135CProviderGate("write_view_analytics"),
  linkedRealtimeEventName: seed.linkedRealtimeEventName,
  linkedMediaAssetKind: seed.linkedMediaAssetKind,
  requiredBackendPieces: seed.requiredBackendPieces,
  requiredProviderPieces: seed.requiredProviderPieces,
  requiredAdminPieces: seed.requiredAdminPieces,
  blockedByDefault: true,
  databaseWriteAllowedNow: false,
  providerCallAllowedNow: false,
  fakePlaybackSuccessAllowed: false,
  fakeAnalyticsSuccessAllowed: false,
});

export const STREAM_135G_PLAYBACK_ANALYTICS_REGISTRY: Stream135GPlaybackAnalyticsRegistry = {
  version: "STREAM-CORE-135G",
  title: "Stream playback and analytics foundation draft",
  summary: "Playback, CDN manifest, watch progress, engagement counters, creator metrics and fraud/abuse analytics are mapped as safe-blocked foundation contracts.",
  sourceScope: "mobile_repository_contract_handoff_only",
  inheritedProviderGateRegistryVersion: STREAM_135C_PROVIDER_GATE_REGISTRY.version,
  inheritedShortsRegistryVersion: STREAM_135F_SHORTS_UPLOAD_PUBLISH_REGISTRY.version,
  plans: PLAYBACK_ANALYTICS_SEEDS.map(buildPlaybackAnalyticsPlan),
  canonicalPhases: STREAM_135G_PLAYBACK_ANALYTICS_PHASES,
  analyticsInvariants: [
    "Playback URLs and CDN manifests must be produced by backend/provider contracts, never hardcoded in mobile.",
    "Views, likes, shares, saves, comments, reach and earnings must not be faked by local UI counters.",
    "Analytics writes require idempotency, dedupe, rate limits, retention policy and fraud/abuse review hooks.",
    "Creator earnings metrics remain claims-disabled until Wallet/ledger/settlement integration exists.",
    "Fraud and abuse signals are review signals and must not become automatic guilt decisions.",
    "Admin diagnostics may expose blocker/readiness booleans, never provider secrets or env values.",
  ],
  requiredServerRuntime: [
    "Playback manifest route",
    "Signed playback token flow",
    "Viewer session model",
    "Watch progress event ingestion",
    "Deduped view counter projection",
    "Engagement event ingestion",
    "Playback quality/QoE event ingestion",
    "Creator analytics snapshot",
    "Fraud/abuse signal review queue",
    "Read-only Admin analytics diagnostics",
  ],
  requiredProviderRuntime: [
    "CDN/playback provider",
    "Analytics event queue/storage",
    "Counter projection worker",
    "Fraud/anomaly detection pipeline later",
    "Provider health and quota diagnostics",
  ],
  requiredAdminRuntime: [
    "Provider-not-configured blocker panel",
    "Analytics readiness gate",
    "Fraud/abuse review queue",
    "Creator metrics audit",
    "Emergency playback disable controls",
  ],
  nextExecutionStep: "STREAM-CORE-135H_MODERATION_ADMIN_FOUNDATION_DRAFT",
  safety: {
    mobileUiChangedNow: false,
    backendRoutesMountedNow: false,
    playbackRouteMountedNow: false,
    analyticsWorkerStartedNow: false,
    databaseWriteExecutedNow: false,
    providerCallExecutedNow: false,
    secretReadExecutedNow: false,
    fakePlaybackAllowed: false,
    fakeViewsAllowed: false,
    fakeEngagementAllowed: false,
    fakeAnalyticsAllowed: false,
    fakeCreatorEarningsAllowed: false,
  },
};

export function createStream135GPlaybackAnalyticsIntent(args: {
  readonly ids: Stream135BIdentifier;
  readonly roomMode: Stream135BRoomMode;
  readonly surface: Stream135GPlaybackAnalyticsSurface;
  readonly phase: Stream135GPlaybackAnalyticsPhase;
  readonly metricKind: Stream135GAnalyticsMetricKind;
  readonly requestedAtIso: string;
  readonly idempotencyKey: string;
}): Stream135GPlaybackAnalyticsIntent {
  return {
    version: "STREAM-CORE-135G",
    ids: args.ids,
    roomMode: args.roomMode,
    surface: args.surface,
    phase: args.phase,
    metricKind: args.metricKind,
    requestedAtIso: args.requestedAtIso,
    idempotencyKey: args.idempotencyKey,
    playbackGate: getStream135CProviderGate("load_playback_manifest"),
    analyticsGate: getStream135CProviderGate("write_view_analytics"),
    linkedRealtimeEventName: args.surface === "fraud_abuse_signals" ? "moderation.report_requested" : "admin.readiness_snapshot_requested",
    linkedMediaAssetKind: args.metricKind === "playback_manifest" ? "playback_manifest" : "analytics_event",
    payloadSchema: "playback_analytics_contract_placeholder",
    playbackManifestAllowedNow: false,
    cdnTokenAllowedNow: false,
    watchProgressWriteAllowedNow: false,
    viewCounterWriteAllowedNow: false,
    engagementWriteAllowedNow: false,
    creatorMetricWriteAllowedNow: false,
    fraudSignalAutoPunishmentAllowedNow: false,
    databaseWriteAllowedNow: false,
    providerCallAllowedNow: false,
    fakePlaybackSuccessAllowed: false,
    fakeViewCounterAllowed: false,
    fakeAnalyticsSuccessAllowed: false,
  };
}

export function getStream135GPlaybackAnalyticsPlan(
  phase: Stream135GPlaybackAnalyticsPhase,
): Stream135GPlaybackAnalyticsPlan | undefined {
  return STREAM_135G_PLAYBACK_ANALYTICS_REGISTRY.plans.find((plan) => plan.phase === phase);
}

export function blockStream135GPlaybackAnalytics(
  action: Extract<Stream135CActionKey, "load_playback_manifest" | "write_view_analytics">,
): Stream135CBlockedActionResult {
  return createStream135CBlockedActionResult(action);
}
