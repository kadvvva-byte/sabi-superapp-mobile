import {
  createStream135CBlockedActionResult,
  getStream135CProviderGate,
  STREAM_135C_PROVIDER_GATE_REGISTRY,
  type Stream135CActionKey,
  type Stream135CBlockedActionResult,
  type Stream135CProviderGate,
} from "./stream135cProviderGateLayerDraft";
import type {
  Stream135BEventKind,
  Stream135BIdentifier,
  Stream135BRoomMode,
} from "./stream135bBackendCoreContractsDraft";

export type Stream135DRealtimeChannelKind =
  | "room_lifecycle"
  | "viewer_presence"
  | "host_presence"
  | "chat"
  | "cohost"
  | "battle"
  | "moderation"
  | "business_stream"
  | "gift_intent"
  | "shorts_processing"
  | "admin_diagnostics";

export type Stream135DRealtimeEventName =
  | "room.draft_created"
  | "room.preflight_requested"
  | "room.provider_handoff_blocked"
  | "room.end_requested"
  | "viewer.join_requested"
  | "viewer.leave_requested"
  | "viewer.reconnect_requested"
  | "host.heartbeat_requested"
  | "chat.message_requested"
  | "chat.message_moderation_required"
  | "cohost.invite_requested"
  | "cohost.accept_requested"
  | "cohost.remove_requested"
  | "battle.invite_requested"
  | "battle.accept_requested"
  | "battle.end_requested"
  | "moderation.report_requested"
  | "moderation.restriction_requested"
  | "business.catalog_snapshot_requested"
  | "gift.quote_requested"
  | "gift.send_blocked"
  | "shorts.upload_requested"
  | "shorts.publish_blocked"
  | "admin.readiness_snapshot_requested";

export type Stream135DDeliveryScope =
  | "host_only"
  | "room_participants"
  | "room_viewers"
  | "admin_only"
  | "business_owner_only"
  | "creator_owner_only"
  | "audit_only";

export type Stream135DRealtimeEventPayload = {
  readonly version: "STREAM-CORE-135D";
  readonly eventName: Stream135DRealtimeEventName;
  readonly channelKind: Stream135DRealtimeChannelKind;
  readonly ids: Stream135BIdentifier;
  readonly roomMode: Stream135BRoomMode;
  readonly eventKind135B: Stream135BEventKind;
  readonly requestedAtIso: string;
  readonly idempotencyKey: string;
  readonly deliveryScope: Stream135DDeliveryScope;
  readonly payloadSchema: "backend_contract_placeholder";
  readonly persistAuditLogRequired: true;
  readonly realtimeProviderGate: Stream135CProviderGate;
  readonly emitAllowedNow: false;
  readonly broadcastAllowedNow: false;
  readonly backendMutationAllowedNow: false;
  readonly databaseWriteAllowedNow: false;
  readonly providerCallAllowedNow: false;
  readonly fakeDeliveryAllowed: false;
};

export type Stream135DRealtimeChannelPlan = {
  readonly version: "STREAM-CORE-135D";
  readonly channelKind: Stream135DRealtimeChannelKind;
  readonly descriptionRu: string;
  readonly descriptionEn: string;
  readonly deliveryScope: Stream135DDeliveryScope;
  readonly requiredBackendPieces: readonly string[];
  readonly requiredAdminPieces: readonly string[];
  readonly providerGate: Stream135CProviderGate;
  readonly blockedByDefault: true;
  readonly providerCallAllowedNow: false;
  readonly fakeDeliveryAllowed: false;
};

export type Stream135DRealtimeSignalingRegistry = {
  readonly version: "STREAM-CORE-135D";
  readonly title: string;
  readonly summary: string;
  readonly sourceScope: "mobile_repository_contract_handoff_only";
  readonly inheritedProviderGateRegistryVersion: typeof STREAM_135C_PROVIDER_GATE_REGISTRY.version;
  readonly channels: readonly Stream135DRealtimeChannelPlan[];
  readonly canonicalEvents: readonly Stream135DRealtimeEventName[];
  readonly requiredServerRuntime: readonly string[];
  readonly requiredAdminRuntime: readonly string[];
  readonly nextExecutionStep: "STREAM-CORE-135E_MEDIA_LIFECYCLE_FOUNDATION_DRAFT";
  readonly safety: {
    readonly mobileUiChangedNow: false;
    readonly backendRoutesMountedNow: false;
    readonly socketServerStartedNow: false;
    readonly databaseWriteExecutedNow: false;
    readonly providerCallExecutedNow: false;
    readonly fakeRealtimeAllowed: false;
    readonly fakeViewerCountAllowed: false;
    readonly fakeChatDeliveryAllowed: false;
    readonly fakeCohostAllowed: false;
    readonly fakeBattleAllowed: false;
    readonly fakeModerationAllowed: false;
    readonly fakeGiftAllowed: false;
  };
};

type ChannelSeed = {
  readonly channelKind: Stream135DRealtimeChannelKind;
  readonly descriptionRu: string;
  readonly descriptionEn: string;
  readonly deliveryScope: Stream135DDeliveryScope;
  readonly gateAction: Stream135CActionKey;
  readonly requiredBackendPieces: readonly string[];
  readonly requiredAdminPieces: readonly string[];
};

const CHANNEL_SEEDS: readonly ChannelSeed[] = [
  {
    channelKind: "room_lifecycle",
    descriptionRu: "События создания, preflight, provider-block и завершения комнаты Stream.",
    descriptionEn: "Stream room creation, preflight, provider-blocked and end-request events.",
    deliveryScope: "room_participants",
    gateAction: "emit_realtime_event",
    requiredBackendPieces: [
      "Room lifecycle state machine",
      "Idempotent room event append",
      "Provider-not-configured response mapper",
    ],
    requiredAdminPieces: ["Read-only room lifecycle snapshot", "Owner/Admin activation gate"],
  },
  {
    channelKind: "viewer_presence",
    descriptionRu: "Join/leave/reconnect события зрителя без fake онлайн-счётчиков.",
    descriptionEn: "Viewer join/leave/reconnect events without fake online counters.",
    deliveryScope: "room_viewers",
    gateAction: "join_live_room",
    requiredBackendPieces: ["Viewer session model", "Reconnect token boundary", "Presence TTL cleanup"],
    requiredAdminPieces: ["Presence diagnostics", "Abuse/velocity guard view"],
  },
  {
    channelKind: "host_presence",
    descriptionRu: "Heartbeat и состояние ведущего, без имитации активного эфира.",
    descriptionEn: "Host heartbeat and state without simulated live activity.",
    deliveryScope: "host_only",
    gateAction: "emit_realtime_event",
    requiredBackendPieces: ["Host session model", "Heartbeat timeout policy", "Safe end-state mapper"],
    requiredAdminPieces: ["Host health snapshot", "Manual restriction gate"],
  },
  {
    channelKind: "chat",
    descriptionRu: "Chat message requested / moderation required, без fake доставки сообщений.",
    descriptionEn: "Chat message requested / moderation required, without fake message delivery.",
    deliveryScope: "room_participants",
    gateAction: "emit_realtime_event",
    requiredBackendPieces: ["Chat message intent route", "Moderation precheck", "Room broadcast adapter"],
    requiredAdminPieces: ["Chat moderation queue", "Reported message evidence view"],
  },
  {
    channelKind: "cohost",
    descriptionRu: "Invite/accept/remove события соведущих через backend gate.",
    descriptionEn: "Co-host invite/accept/remove events through the backend gate.",
    deliveryScope: "room_participants",
    gateAction: "emit_realtime_event",
    requiredBackendPieces: ["Cohost invitation model", "Role transition guard", "Room participant sync"],
    requiredAdminPieces: ["Cohost abuse controls", "Host action audit"],
  },
  {
    channelKind: "battle",
    descriptionRu: "Battle invite/accept/end события, без fake рейтинга и fake победы.",
    descriptionEn: "Battle invite/accept/end events without fake ranking or fake winner state.",
    deliveryScope: "room_participants",
    gateAction: "emit_realtime_event",
    requiredBackendPieces: ["Battle session model", "Scoring provider boundary", "Safe end-state contract"],
    requiredAdminPieces: ["Battle abuse review", "Score integrity diagnostics"],
  },
  {
    channelKind: "moderation",
    descriptionRu: "Жалобы, 18+ и ограничения проходят через Admin/compliance review.",
    descriptionEn: "Reports, 18+ checks and restrictions pass through Admin/compliance review.",
    deliveryScope: "admin_only",
    gateAction: "submit_report_evidence",
    requiredBackendPieces: ["Report evidence intake", "Safety hold mapper", "Audit append"],
    requiredAdminPieces: ["Report review queue", "18+ and abuse policy controls"],
  },
  {
    channelKind: "business_stream",
    descriptionRu: "Business Stream события каталога и витрины без fake заказов/оплаты.",
    descriptionEn: "Business Stream catalog/showcase events without fake orders/payments.",
    deliveryScope: "business_owner_only",
    gateAction: "sync_business_catalog",
    requiredBackendPieces: ["Business catalog snapshot", "Merchant readiness gate", "Checkout blocked mapper"],
    requiredAdminPieces: ["Merchant KYB/KYC readiness", "Catalog compliance review"],
  },
  {
    channelKind: "gift_intent",
    descriptionRu: "Gift quote/send intents только как blocked boundary до Wallet/COIN ledger.",
    descriptionEn: "Gift quote/send intents are blocked boundaries until Wallet/COIN ledger integration.",
    deliveryScope: "creator_owner_only",
    gateAction: "send_gift",
    requiredBackendPieces: ["Gift quote route", "COIN ledger atomic debit", "Creator earning credit guard"],
    requiredAdminPieces: ["Wallet risk approval gate", "Gift fraud/velocity diagnostics"],
  },
  {
    channelKind: "shorts_processing",
    descriptionRu: "Shorts upload/publish events остаются закрыты до storage/transcoding/CDN.",
    descriptionEn: "Shorts upload/publish events stay locked until storage/transcoding/CDN are connected.",
    deliveryScope: "creator_owner_only",
    gateAction: "publish_short_video",
    requiredBackendPieces: ["Object storage adapter", "Transcoding job queue", "Publish state machine"],
    requiredAdminPieces: ["Media policy review", "Copyright/rights diagnostics"],
  },
  {
    channelKind: "admin_diagnostics",
    descriptionRu: "Read-only Admin snapshots для provider/readiness без секретов и активации.",
    descriptionEn: "Read-only Admin snapshots for provider/readiness without secrets or activation.",
    deliveryScope: "admin_only",
    gateAction: "emit_realtime_event",
    requiredBackendPieces: ["Protected read-only snapshot route", "No-secret response mapper", "Owner approval status"],
    requiredAdminPieces: ["Owner-only visibility", "Provider activation blocker panel"],
  },
] as const;

const EVENT_NAMES: readonly Stream135DRealtimeEventName[] = [
  "room.draft_created",
  "room.preflight_requested",
  "room.provider_handoff_blocked",
  "room.end_requested",
  "viewer.join_requested",
  "viewer.leave_requested",
  "viewer.reconnect_requested",
  "host.heartbeat_requested",
  "chat.message_requested",
  "chat.message_moderation_required",
  "cohost.invite_requested",
  "cohost.accept_requested",
  "cohost.remove_requested",
  "battle.invite_requested",
  "battle.accept_requested",
  "battle.end_requested",
  "moderation.report_requested",
  "moderation.restriction_requested",
  "business.catalog_snapshot_requested",
  "gift.quote_requested",
  "gift.send_blocked",
  "shorts.upload_requested",
  "shorts.publish_blocked",
  "admin.readiness_snapshot_requested",
] as const;

const EVENT_KIND_MAP: Readonly<Record<Stream135DRealtimeEventName, Stream135BEventKind>> = {
  "room.draft_created": "room_created",
  "room.preflight_requested": "preflight_requested",
  "room.provider_handoff_blocked": "provider_handoff_blocked",
  "room.end_requested": "room_end_requested",
  "viewer.join_requested": "viewer_join_requested",
  "viewer.leave_requested": "viewer_leave_requested",
  "viewer.reconnect_requested": "viewer_join_requested",
  "host.heartbeat_requested": "room_updated",
  "chat.message_requested": "chat_message_requested",
  "chat.message_moderation_required": "moderation_report_requested",
  "cohost.invite_requested": "cohost_invite_requested",
  "cohost.accept_requested": "cohost_invite_requested",
  "cohost.remove_requested": "room_updated",
  "battle.invite_requested": "battle_invite_requested",
  "battle.accept_requested": "battle_invite_requested",
  "battle.end_requested": "room_updated",
  "moderation.report_requested": "moderation_report_requested",
  "moderation.restriction_requested": "moderation_report_requested",
  "business.catalog_snapshot_requested": "business_lead_requested",
  "gift.quote_requested": "gift_quote_blocked",
  "gift.send_blocked": "gift_quote_blocked",
  "shorts.upload_requested": "shorts_upload_requested",
  "shorts.publish_blocked": "shorts_publish_blocked",
  "admin.readiness_snapshot_requested": "preflight_requested",
};

const EVENT_CHANNEL_MAP: Readonly<Record<Stream135DRealtimeEventName, Stream135DRealtimeChannelKind>> = {
  "room.draft_created": "room_lifecycle",
  "room.preflight_requested": "room_lifecycle",
  "room.provider_handoff_blocked": "room_lifecycle",
  "room.end_requested": "room_lifecycle",
  "viewer.join_requested": "viewer_presence",
  "viewer.leave_requested": "viewer_presence",
  "viewer.reconnect_requested": "viewer_presence",
  "host.heartbeat_requested": "host_presence",
  "chat.message_requested": "chat",
  "chat.message_moderation_required": "chat",
  "cohost.invite_requested": "cohost",
  "cohost.accept_requested": "cohost",
  "cohost.remove_requested": "cohost",
  "battle.invite_requested": "battle",
  "battle.accept_requested": "battle",
  "battle.end_requested": "battle",
  "moderation.report_requested": "moderation",
  "moderation.restriction_requested": "moderation",
  "business.catalog_snapshot_requested": "business_stream",
  "gift.quote_requested": "gift_intent",
  "gift.send_blocked": "gift_intent",
  "shorts.upload_requested": "shorts_processing",
  "shorts.publish_blocked": "shorts_processing",
  "admin.readiness_snapshot_requested": "admin_diagnostics",
};

const CHANNEL_DELIVERY_SCOPE_MAP: Readonly<Record<Stream135DRealtimeChannelKind, Stream135DDeliveryScope>> = CHANNEL_SEEDS.reduce(
  (acc, seed) => ({ ...acc, [seed.channelKind]: seed.deliveryScope }),
  {} as Record<Stream135DRealtimeChannelKind, Stream135DDeliveryScope>,
);

export const STREAM_135D_REALTIME_CHANNELS: readonly Stream135DRealtimeChannelPlan[] = CHANNEL_SEEDS.map((seed) => ({
  version: "STREAM-CORE-135D",
  channelKind: seed.channelKind,
  descriptionRu: seed.descriptionRu,
  descriptionEn: seed.descriptionEn,
  deliveryScope: seed.deliveryScope,
  requiredBackendPieces: seed.requiredBackendPieces,
  requiredAdminPieces: seed.requiredAdminPieces,
  providerGate: getStream135CProviderGate(seed.gateAction),
  blockedByDefault: true,
  providerCallAllowedNow: false,
  fakeDeliveryAllowed: false,
}));

export const STREAM_135D_REALTIME_SIGNALING_REGISTRY: Stream135DRealtimeSignalingRegistry = {
  version: "STREAM-CORE-135D",
  title: "Stream realtime/signaling foundation draft",
  summary:
    "Defines the canonical Stream realtime channels and event envelope for room lifecycle, viewer presence, host heartbeat, chat, cohost, battle, moderation, Business Stream, gifts, Shorts processing and Admin diagnostics. This is a mobile repository contract handoff only; it does not start a socket server, mount routes, write DB records or call providers.",
  sourceScope: "mobile_repository_contract_handoff_only",
  inheritedProviderGateRegistryVersion: STREAM_135C_PROVIDER_GATE_REGISTRY.version,
  channels: STREAM_135D_REALTIME_CHANNELS,
  canonicalEvents: EVENT_NAMES,
  requiredServerRuntime: [
    "Authenticated realtime gateway with room/user scopes",
    "Idempotent event append and delivery de-duplication",
    "Presence TTL and reconnect token handling",
    "Room lifecycle state machine connected to media/provider gates",
    "Moderation precheck and report evidence routing",
    "No-secret provider status snapshot for Admin/owner",
  ],
  requiredAdminRuntime: [
    "Read-only realtime health snapshot",
    "Room/channel event audit viewer",
    "Moderation/report review queue",
    "Provider activation blocker panel",
    "Owner approval gate before realtime provider activation",
  ],
  nextExecutionStep: "STREAM-CORE-135E_MEDIA_LIFECYCLE_FOUNDATION_DRAFT",
  safety: {
    mobileUiChangedNow: false,
    backendRoutesMountedNow: false,
    socketServerStartedNow: false,
    databaseWriteExecutedNow: false,
    providerCallExecutedNow: false,
    fakeRealtimeAllowed: false,
    fakeViewerCountAllowed: false,
    fakeChatDeliveryAllowed: false,
    fakeCohostAllowed: false,
    fakeBattleAllowed: false,
    fakeModerationAllowed: false,
    fakeGiftAllowed: false,
  },
};

export function getStream135DRealtimeSignalingRegistry(): Stream135DRealtimeSignalingRegistry {
  return STREAM_135D_REALTIME_SIGNALING_REGISTRY;
}

export function getStream135DRealtimeChannelPlan(
  channelKind: Stream135DRealtimeChannelKind,
): Stream135DRealtimeChannelPlan {
  return (
    STREAM_135D_REALTIME_CHANNELS.find((channel) => channel.channelKind === channelKind) ??
    STREAM_135D_REALTIME_CHANNELS[0]
  );
}

export function createStream135DRealtimeEventPayload(input: {
  readonly eventName: Stream135DRealtimeEventName;
  readonly ids: Stream135BIdentifier;
  readonly roomMode: Stream135BRoomMode;
  readonly requestedAtIso: string;
}): Stream135DRealtimeEventPayload {
  const channelKind = EVENT_CHANNEL_MAP[input.eventName];
  const channel = getStream135DRealtimeChannelPlan(channelKind);

  return {
    version: "STREAM-CORE-135D",
    eventName: input.eventName,
    channelKind,
    ids: input.ids,
    roomMode: input.roomMode,
    eventKind135B: EVENT_KIND_MAP[input.eventName],
    requestedAtIso: input.requestedAtIso,
    idempotencyKey: input.ids.idempotencyKey,
    deliveryScope: CHANNEL_DELIVERY_SCOPE_MAP[channelKind],
    payloadSchema: "backend_contract_placeholder",
    persistAuditLogRequired: true,
    realtimeProviderGate: channel.providerGate,
    emitAllowedNow: false,
    broadcastAllowedNow: false,
    backendMutationAllowedNow: false,
    databaseWriteAllowedNow: false,
    providerCallAllowedNow: false,
    fakeDeliveryAllowed: false,
  };
}

export function createStream135DRealtimeBlockedResult(
  actionKey: Stream135CActionKey = "emit_realtime_event",
): Stream135CBlockedActionResult {
  return createStream135CBlockedActionResult(actionKey);
}

export function isStream135DRealtimeEmitAllowed(): false {
  return false;
}

export function isStream135DRealtimeFakeDeliveryAllowed(): false {
  return false;
}
