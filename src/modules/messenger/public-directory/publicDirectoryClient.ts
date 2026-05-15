import {
  getMessengerKernelFetch,
  requireMessengerKernelSessionSnapshot,
} from "../../../core/kernel/messenger/session/service";

export type SabiPublicDirectoryKind = "GROUP" | "CHANNEL" | "BOT";

export type SabiPublicDirectoryProfileSyncInput = {
  kind: SabiPublicDirectoryKind;
  id?: string | null;
  chatId?: string | null;
  roomId?: string | null;
  groupId?: string | null;
  channelId?: string | null;
  botId?: string | null;
  title?: string | null;
  name?: string | null;
  groupName?: string | null;
  channelName?: string | null;
  botName?: string | null;
  username?: string | null;
  description?: string | null;
  avatarUrl?: string | null;
  photoUrl?: string | null;
  webhookUrl?: string | null;
  coverUri?: string | null;
  coverUrl?: string | null;
  publicationPhotos?: unknown;
  publicationVideos?: unknown;
  publicPhotos?: unknown;
  publicVideos?: unknown;
  likesCount?: number | string | null;
  publicGiftsCount?: number | string | null;
  inviteLink?: string | null;
  adminControlled?: boolean;
  adminVisibilitySource?: "admin" | "profile" | string;
  approvalStatus?: string | null;
  listingStatus?: string | null;
  visibilityStatus?: string | null;
  promotionPlacement?: SabiPublicDirectoryPromotionPlacement | string | null;
  featuredRank?: number | null;
  searchBoostPct?: number;
  directoryBoostPct?: number;
  recommended?: boolean;
  qualityScore?: number;
  safetyScore?: number;
  promotionScore?: number;
  rawContentIncluded?: boolean;
  isPublic?: boolean | string | null;
  searchableInDirectory?: boolean | string | null;
  visibility?: string | null;
  hidden?: boolean | string | null;
  isHidden?: boolean | string | null;
};

export type SabiPublicDirectorySearchInput = {
  query: string;
  kind?: SabiPublicDirectoryKind | "ALL";
};

export type SabiPublicDirectoryListInput = {
  kind?: SabiPublicDirectoryKind | "ALL";
  limit?: number;
};

export type SabiPublicDirectoryProfileSyncBatchOptions = {
  replaceForOwner?: boolean;
  source?: "profile" | string;
  kinds?: SabiPublicDirectoryKind[];
};

export type SabiPublicDirectoryStatsInput = {
  kind?: SabiPublicDirectoryKind | "ALL";
};

export type SabiPublicDirectoryAuditInput = {
  kind?: SabiPublicDirectoryKind | "ALL";
  targetId?: string | null;
  action?: string | null;
  actorUserId?: string | null;
  limit?: number;
};

export type SabiPublicDirectoryHealthInput = {
  kind?: SabiPublicDirectoryKind | "ALL";
};

export type SabiPublicDirectoryRuntimeInput = {
  kind: SabiPublicDirectoryKind;
  id: string;
};

export type SabiPublicDirectoryReviewQueueInput = {
  kind?: SabiPublicDirectoryKind | "ALL";
  status?: SabiPublicDirectoryReviewStatus | string | null;
  limit?: number;
};


export type SabiPublicDirectoryReviewAction = "approve" | "hide" | "restrict" | "reject" | "restore";

export type SabiPublicDirectoryReviewActionInput = {
  kind: SabiPublicDirectoryKind;
  id: string;
  action: SabiPublicDirectoryReviewAction;
  reason?: string | null;
  qualityScore?: number | null;
  safetyScore?: number | null;
  promotionPlacement?: SabiPublicDirectoryPromotionPlacement | string | null;
  featuredRank?: number | null;
  searchBoostPct?: number | null;
  directoryBoostPct?: number | null;
  recommended?: boolean | null;
  promotionScore?: number | null;
};

export type SabiPublicDirectoryReviewActionResult = {
  ok: boolean;
  kind: SabiPublicDirectoryKind;
  id: string;
  action: SabiPublicDirectoryReviewAction;
  visibleInMobile: boolean;
  status: number;
  error?: string | null;
  data?: SabiPublicDirectoryItem | (Record<string, unknown> & { id?: string; kind?: string; type?: string }) | null;
  item?: SabiPublicDirectoryItem | null;
  adminControlled: boolean;
  rawContentIncluded: boolean;
  updatedAt?: string | null;
};

export type SabiPublicDirectoryKindStats = {
  total: number;
  visible: number;
  hidden: number;
  restricted: number;
  rejected: number;
  unsafe: number;
  pendingReview: number;
  profileRemoved: number;
  adminControlled: number;
  featured: number;
  boosted: number;
  recommended: number;
  approved: number;
  public: number;
  joined: number;
  subscribed: number;
  started: number;
};

export type SabiPublicDirectoryStatsSnapshot = {
  updatedAt: string | null;
  adminControlled: boolean;
  rawContentIncluded: boolean;
  currentUserId?: string | null;
  all: SabiPublicDirectoryKindStats;
  groups: SabiPublicDirectoryKindStats;
  channels: SabiPublicDirectoryKindStats;
  bots: SabiPublicDirectoryKindStats;
  selected: SabiPublicDirectoryKindStats;
  kind: SabiPublicDirectoryKind | "ALL";
};

export type SabiPublicDirectoryAuditAction =
  | "profile_sync_visible"
  | "profile_sync_hidden"
  | "profile_sync_restricted"
  | "profile_sync_blocked"
  | "profile_removed_hidden"
  | "admin_promotion_applied"
  | "admin_review_approve"
  | "admin_review_hide"
  | "admin_review_restrict"
  | "admin_review_reject"
  | "admin_review_restore"
  | "directory_action_blocked"
  | "group_join"
  | "channel_subscribe"
  | "bot_start"
  | "group_member_add"
  | "channel_member_add"
  | "group_invite"
  | "channel_invite"
  | string;

export type SabiPublicDirectoryAuditEntry = {
  id: string;
  at: string;
  action: SabiPublicDirectoryAuditAction;
  kind: SabiPublicDirectoryKind;
  targetId: string;
  actorUserId: string | null;
  targetUserId?: string | null;
  status: "success" | "blocked" | "visible" | "hidden" | "restricted" | "promoted" | string;
  code?: string | null;
  adminControlled: boolean;
  rawContentIncluded: boolean;
  visibilityStatus?: string | null;
  listingStatus?: string | null;
  approvalStatus?: string | null;
  promotionPlacement?: string | null;
  source?: string | null;
};

export type SabiPublicDirectoryAuditSnapshot = {
  updatedAt: string | null;
  adminControlled: boolean;
  rawContentIncluded: boolean;
  currentUserId?: string | null;
  kind: SabiPublicDirectoryKind | "ALL";
  count: number;
  entries: SabiPublicDirectoryAuditEntry[];
};

export type SabiPublicDirectoryReviewStatus =
  | "needs_review"
  | "restricted"
  | "hidden"
  | "rejected"
  | "unsafe"
  | "profile_removed"
  | string;

export type SabiPublicDirectoryReviewQueueEntry = {
  id: string;
  kind: SabiPublicDirectoryKind;
  title: string;
  name: string;
  username?: string | null;
  ownerUserId?: string | null;
  status: SabiPublicDirectoryReviewStatus;
  reason: string;
  visibilityStatus: string | null;
  listingStatus: string | null;
  approvalStatus: string | null;
  promotionPlacement: string | null;
  qualityScore: number;
  safetyScore: number;
  adminControlled: boolean;
  rawContentIncluded: boolean;
  updatedAt: string | null;
};

export type SabiPublicDirectoryReviewQueueSnapshot = {
  updatedAt: string | null;
  adminControlled: boolean;
  rawContentIncluded: boolean;
  forAdminReviewOnly: boolean;
  currentUserId?: string | null;
  kind: SabiPublicDirectoryKind | "ALL";
  count: number;
  entries: SabiPublicDirectoryReviewQueueEntry[];
};

export type SabiPublicDirectoryHealthFileState = {
  exists: boolean;
  loaded: boolean;
  validJson: boolean;
  sizeBytes: number;
  recordsCount: number;
  updatedAt: string | null;
  error: string | null;
};

export type SabiPublicDirectoryHealthSnapshot = {
  updatedAt: string | null;
  adminControlled: boolean;
  rawContentIncluded: boolean;
  currentUserId?: string | null;
  kind: SabiPublicDirectoryKind | "ALL";
  status: "ready" | "degraded" | "unavailable";
  persistence: {
    profileSync: SabiPublicDirectoryHealthFileState;
    actionState: SabiPublicDirectoryHealthFileState;
    auditLog: SabiPublicDirectoryHealthFileState;
    adminPromotion: SabiPublicDirectoryHealthFileState;
    adminApprovalVisibility: SabiPublicDirectoryHealthFileState;
  };
  stores: {
    memoryRecords: number;
    memoryVisibleRecords: number;
    groups: number;
    channels: number;
    bots: number;
    joinedGroups: number;
    subscribedChannels: number;
    startedBots: number;
    auditEntries: number;
  };
  checks: Record<string, boolean>;
  stats: SabiPublicDirectoryStatsSnapshot;
};

export type SabiPublicDirectoryRuntimeSnapshot = {
  id: string;
  kind: SabiPublicDirectoryKind;
  roomType: "group" | "channel" | "bot";
  currentUserId?: string | null;
  visibleInMobile: boolean;
  joinedByCurrentUser: boolean;
  subscribedByCurrentUser: boolean;
  startedByCurrentUser: boolean;
  membershipStatus: "member" | "subscriber" | "started" | "none" | string;
  canSendMessages: boolean;
  canInvite: boolean;
  inviteAvailable: boolean;
  inviteLink: string | null;
  shareText: string | null;
  memberUserIds: string[];
  subscriberUserIds: string[];
  startedUserIds: string[];
  membersCount: number;
  subscribersCount: number;
  startedCount: number;
  adminControlled: boolean;
  rawContentIncluded: boolean;
  updatedAt: string | null;
};

export type SabiPublicDirectoryRuntimeResult = {
  ok: boolean;
  kind: SabiPublicDirectoryKind;
  id: string;
  item: SabiPublicDirectoryItem | null;
  runtime: SabiPublicDirectoryRuntimeSnapshot | null;
  status: number;
  error?: string | null;
  adminControlled: boolean;
  rawContentIncluded: boolean;
  updatedAt?: string | null;
};

export type SabiPublicDirectoryPromotionPlacement =
  | "featured"
  | "boosted"
  | "recommended"
  | "approved"
  | "public";

export type SabiPublicDirectoryItem = {
  id: string;
  chatId?: string | null;
  roomId?: string | null;
  groupId?: string | null;
  channelId?: string | null;
  botId?: string | null;
  title: string;
  name: string;
  username?: string | null;
  description?: string | null;
  avatarUrl?: string | null;
  avatarUri?: string | null;
  photoUrl?: string | null;
  ownerUserId?: string | null;
  createdBy?: string | null;
  kind: SabiPublicDirectoryKind;
  type: SabiPublicDirectoryKind;
  roomType: "group" | "channel" | "bot";
  isPublic: boolean;
  searchableInDirectory: boolean;
  joinMode?: "open" | "request" | "subscribe" | null;
  action?: "start" | null;
  updatedAt?: string | null;
  coverUri?: string | null;
  coverUrl?: string | null;
  publicationPhotos?: unknown;
  publicationVideos?: unknown;
  publicPhotos?: unknown;
  publicVideos?: unknown;
  likesCount?: number | string | null;
  publicGiftsCount?: number | string | null;
  inviteLink?: string | null;
  adminControlled?: boolean;
  adminVisibilitySource?: "admin" | "profile" | string;
  approvalStatus?: string | null;
  listingStatus?: string | null;
  visibilityStatus?: string | null;
  promotionPlacement?: SabiPublicDirectoryPromotionPlacement | string | null;
  featuredRank?: number | null;
  searchBoostPct?: number;
  directoryBoostPct?: number;
  recommended?: boolean;
  qualityScore?: number;
  safetyScore?: number;
  promotionScore?: number;
  rawContentIncluded?: boolean;
  visibility?: string | null;
  hidden?: boolean;
  isHidden?: boolean;
  runtime?: SabiPublicDirectoryRuntimeSnapshot | null;
  membershipStatus?: string | null;
  joinedByCurrentUser?: boolean;
  subscribedByCurrentUser?: boolean;
  startedByCurrentUser?: boolean;
  canSendMessages?: boolean | string | null;
  canInvite?: boolean | string | null;
  inviteAvailable?: boolean | string | null;
  shareText?: string | null;
  memberUserIds?: string[] | null;
  subscriberUserIds?: string[] | null;
  startedUserIds?: string[] | null;
  membersCount?: number | string | null;
  subscribersCount?: number | string | null;
  startedCount?: number | string | null;
};

async function readDirectorySession() {
  try {
    const session = await requireMessengerKernelSessionSnapshot();

    return {
      apiBaseUrl: session.apiBaseUrl.replace(/\/+$/, ""),
      accessToken: session.accessToken,
      currentUserId: session.currentUserId,
      fetchImpl: getMessengerKernelFetch(),
    };
  } catch (error) {
    console.warn("[sabi-public-directory] messenger_kernel_session_not_ready", error);
    return null;
  }
}

function buildDirectoryHeaders(
  session: {
    accessToken: string;
    currentUserId: string;
  },
  withJsonBody = false,
): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: "application/json",
    Authorization: `Bearer ${session.accessToken}`,
    "x-user-id": session.currentUserId,
    "x-current-user-id": session.currentUserId,
  };

  if (withJsonBody) {
    headers["Content-Type"] = "application/json";
  }

  return headers;
}

async function readJson(response: Response) {
  const text = await response.text();

  if (!text.trim()) return null;

  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function normalizeKind(value?: SabiPublicDirectoryKind | "ALL") {
  if (value === "GROUP" || value === "CHANNEL" || value === "BOT") return value;
  return "ALL";
}

function readSabiDirectoryString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function readSabiDirectoryNumber(value: unknown, fallback = 0) {
  const next = Number(value);
  return Number.isFinite(next) ? Math.max(0, Math.floor(next)) : fallback;
}

function readSabiDirectoryBoolean(value: unknown, fallback = false) {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (["1", "true", "yes", "on", "enabled", "recommended"].includes(normalized)) return true;
    if (["0", "false", "no", "off", "disabled"].includes(normalized)) return false;
  }
  return fallback;
}

function normalizePromotionPlacement(value: unknown): SabiPublicDirectoryPromotionPlacement {
  const raw = String(value || "").trim().toLowerCase();
  if (raw === "featured" || raw === "boosted" || raw === "recommended" || raw === "approved") return raw;
  return "public";
}

function readSabiPublicDirectoryFeaturedRank(value: unknown) {
  const next = Number(value);
  return Number.isFinite(next) && next > 0 ? Math.floor(next) : 999999;
}

function readSabiPublicDirectoryPromotionPlacementPriority(value: unknown) {
  const placement = normalizePromotionPlacement(value);

  if (placement === "featured") return 4;
  if (placement === "boosted") return 3;
  if (placement === "recommended") return 2;
  if (placement === "approved") return 1;

  return 0;
}

export function getSabiPublicDirectoryPromotionPriority(item?: Partial<SabiPublicDirectoryItem> | null) {
  if (!item || canShowSabiPublicDirectoryRecord(item) === false) return 0;

  const placementPriority = readSabiPublicDirectoryPromotionPlacementPriority(item.promotionPlacement);
  const featuredRank = readSabiPublicDirectoryFeaturedRank(item.featuredRank);

  if (featuredRank < 999999) return Math.max(4, placementPriority);
  if (item.recommended === true) return Math.max(2, placementPriority);

  return placementPriority;
}

export function getSabiPublicDirectoryPromotionScore(item?: Partial<SabiPublicDirectoryItem> | null) {
  if (!item || canShowSabiPublicDirectoryRecord(item) === false) return 0;

  return (
    readSabiDirectoryNumber(item.promotionScore, 0) +
    readSabiDirectoryNumber(item.directoryBoostPct, 0) +
    readSabiDirectoryNumber(item.searchBoostPct, 0)
  );
}

export function compareSabiPublicDirectoryPromotion(
  a?: Partial<SabiPublicDirectoryItem> | null,
  b?: Partial<SabiPublicDirectoryItem> | null,
) {
  const priorityA = getSabiPublicDirectoryPromotionPriority(a);
  const priorityB = getSabiPublicDirectoryPromotionPriority(b);

  if (priorityA !== priorityB) return priorityB - priorityA;

  if (priorityA > 0 || priorityB > 0) {
    const rankA = readSabiPublicDirectoryFeaturedRank(a?.featuredRank);
    const rankB = readSabiPublicDirectoryFeaturedRank(b?.featuredRank);
    if (rankA !== rankB) return rankA - rankB;

    const scoreA = getSabiPublicDirectoryPromotionScore(a);
    const scoreB = getSabiPublicDirectoryPromotionScore(b);
    if (scoreA !== scoreB) return scoreB - scoreA;

    return String(b?.updatedAt || "").localeCompare(String(a?.updatedAt || ""));
  }

  if (a && b) {
    return String(b.updatedAt || "").localeCompare(String(a.updatedAt || ""));
  }

  return 0;
}

const SABI_PUBLIC_DIRECTORY_BLOCKED_STATUSES = new Set([
  "hidden",
  "private",
  "restricted",
  "rejected",
  "unsafe",
  "blocked",
  "suspended",
  "disabled",
  "deleted",
  "removed",
  "archived",
  "paused",
  "pending",
  "pending_approval",
  "needs_review",
  "profile_hidden",
  "profile_removed",
]);

function normalizeSabiDirectoryStatus(value: unknown, fallback: string) {
  const normalized = String(value || fallback).trim().toLowerCase();
  return normalized || fallback;
}

function isSabiPublicDirectoryMobileVisible(record: Record<string, unknown>) {
  const visibilityStatus = normalizeSabiDirectoryStatus(record.visibilityStatus || record.visibility, "visible");
  const listingStatus = normalizeSabiDirectoryStatus(record.listingStatus, "public");
  const approvalStatus = normalizeSabiDirectoryStatus(record.approvalStatus, "not_required");

  if (readSabiDirectoryBoolean(record.isPublic, true) === false) return false;
  if (readSabiDirectoryBoolean(record.searchableInDirectory, true) === false) return false;
  if (readSabiDirectoryBoolean(record.hidden, false) === true) return false;
  if (readSabiDirectoryBoolean(record.isHidden, false) === true) return false;
  if (readSabiDirectoryBoolean(record.deleted, false) === true) return false;
  if (readSabiDirectoryBoolean(record.unsafe, false) === true) return false;
  if (readSabiDirectoryBoolean(record.restricted, false) === true) return false;
  if (SABI_PUBLIC_DIRECTORY_BLOCKED_STATUSES.has(visibilityStatus)) return false;
  if (SABI_PUBLIC_DIRECTORY_BLOCKED_STATUSES.has(listingStatus)) return false;
  if (SABI_PUBLIC_DIRECTORY_BLOCKED_STATUSES.has(approvalStatus)) return false;

  return true;
}

export function canShowSabiPublicDirectoryRecord(value: unknown) {
  if (!value || typeof value !== "object") return false;
  return isSabiPublicDirectoryMobileVisible(value as Record<string, unknown>);
}

export function canShowSabiPublicDirectoryItem(item: SabiPublicDirectoryItem) {
  return canShowSabiPublicDirectoryRecord(item);
}


const sabiPublicDirectoryBlockedItemKeys = new Set<string>();

function buildSabiPublicDirectoryBlockKey(kind: SabiPublicDirectoryKind | "ALL" | string | null | undefined, id: string | null | undefined) {
  const safeKind = String(kind || "ALL").trim().toUpperCase() || "ALL";
  const safeId = String(id || "").trim();
  return safeId ? `${safeKind}:${safeId}` : "";
}

export function rememberSabiPublicDirectoryBlockedItem(kind: SabiPublicDirectoryKind, id: string) {
  const key = buildSabiPublicDirectoryBlockKey(kind, id);
  if (key) sabiPublicDirectoryBlockedItemKeys.add(key);
}

export function forgetSabiPublicDirectoryBlockedItem(kind: SabiPublicDirectoryKind, id: string) {
  const key = buildSabiPublicDirectoryBlockKey(kind, id);
  if (key) sabiPublicDirectoryBlockedItemKeys.delete(key);
}

export function isSabiPublicDirectoryBlockedItem(kind: SabiPublicDirectoryKind | "ALL" | string | null | undefined, id: string | null | undefined) {
  const key = buildSabiPublicDirectoryBlockKey(kind, id);
  if (!key) return false;
  if (sabiPublicDirectoryBlockedItemKeys.has(key)) return true;
  const allKey = buildSabiPublicDirectoryBlockKey("ALL", id);
  return Boolean(allKey && sabiPublicDirectoryBlockedItemKeys.has(allKey));
}

function fallbackEndpointForProfileSync(kind: SabiPublicDirectoryKind) {
  if (kind === "GROUP") return "/api/v2/messenger/groups/profile-sync";
  if (kind === "CHANNEL") return "/api/v2/messenger/channels/profile-sync";
  return "/api/v2/messenger/bots/profile-sync";
}

function commonEndpointForProfileSync() {
  return "/api/v2/messenger/directory/profile-sync";
}

function endpointForSearch(kind?: SabiPublicDirectoryKind | "ALL") {
  const normalized = normalizeKind(kind);

  if (normalized === "GROUP") return "/api/v2/messenger/groups/search";
  if (normalized === "CHANNEL") return "/api/v2/messenger/channels/search";
  if (normalized === "BOT") return "/api/v2/messenger/bots/search";

  return "/api/v2/messenger/directory/search";
}

function endpointForStats(kind?: SabiPublicDirectoryKind | "ALL") {
  const normalized = normalizeKind(kind);

  if (normalized === "GROUP") return "/api/v2/messenger/groups/stats";
  if (normalized === "CHANNEL") return "/api/v2/messenger/channels/stats";
  if (normalized === "BOT") return "/api/v2/messenger/bots/stats";

  return "/api/v2/messenger/directory/stats";
}

function endpointForAudit(kind?: SabiPublicDirectoryKind | "ALL") {
  const normalized = normalizeKind(kind);

  if (normalized === "GROUP") return "/api/v2/messenger/groups/audit";
  if (normalized === "CHANNEL") return "/api/v2/messenger/channels/audit";
  if (normalized === "BOT") return "/api/v2/messenger/bots/audit";

  return "/api/v2/messenger/directory/audit";
}

function endpointForHealth(kind?: SabiPublicDirectoryKind | "ALL") {
  const normalized = normalizeKind(kind);

  if (normalized === "GROUP") return "/api/v2/messenger/groups/health";
  if (normalized === "CHANNEL") return "/api/v2/messenger/channels/health";
  if (normalized === "BOT") return "/api/v2/messenger/bots/health";

  return "/api/v2/messenger/directory/health";
}

function endpointForRuntime(kind: SabiPublicDirectoryKind, id: string) {
  const encoded = encodeURIComponent(id.trim());
  if (kind === "GROUP") return `/api/v2/messenger/groups/${encoded}/runtime`;
  if (kind === "CHANNEL") return `/api/v2/messenger/channels/${encoded}/runtime`;
  return `/api/v2/messenger/bots/${encoded}/runtime`;
}

function endpointForReviewQueue(kind?: SabiPublicDirectoryKind | "ALL") {
  const normalized = normalizeKind(kind);

  if (normalized === "GROUP") return "/api/v2/messenger/groups/review-queue";
  if (normalized === "CHANNEL") return "/api/v2/messenger/channels/review-queue";
  if (normalized === "BOT") return "/api/v2/messenger/bots/review-queue";

  return "/api/v2/messenger/directory/review-queue";
}


function endpointForReviewAction(kind: SabiPublicDirectoryKind) {
  if (kind === "GROUP") return "/api/v2/messenger/groups";
  if (kind === "CHANNEL") return "/api/v2/messenger/channels";
  return "/api/v2/messenger/bots";
}

function hasSabiDirectoryMediaPayload(value: unknown): boolean {
  if (Array.isArray(value)) return value.length > 0;

  if (typeof value === "string" && value.trim()) {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed.length > 0 : Boolean(value.trim());
    } catch {
      return value.trim() !== "[]";
    }
  }

  return false;
}

function pickSabiDirectoryMediaPayload(primary: unknown, fallback: unknown): unknown {
  return hasSabiDirectoryMediaPayload(primary) ? primary : fallback;
}

function normalizeSabiDirectoryMediaPayload(value: unknown, fallbackKind: "photo" | "video"): unknown {
  const rows = Array.isArray(value)
    ? value
    : typeof value === "string" && value.trim()
      ? (() => {
          try {
            const parsed = JSON.parse(value);
            return Array.isArray(parsed) ? parsed : [];
          } catch {
            return [];
          }
        })()
      : [];

  return rows
    .map((raw, index) => {
      const item = (raw ?? {}) as Record<string, unknown>;
      const uri = String(item.uri || item.mediaUri || item.thumbnailUri || "").trim();
      if (!uri) return null;
      const kind = String(item.kind || item.mediaKind || item.type || fallbackKind).toLowerCase() === "video" ? "video" : fallbackKind;
      const mediaUri = String(item.mediaUri || item.uri || uri).trim();
      const thumbnailUri = String(item.thumbnailUri || (kind === "photo" ? uri : "")).trim();

      return {
        ...item,
        id: String(item.id || `${kind}-${index}`),
        uri,
        mediaUri: mediaUri || uri,
        thumbnailUri: thumbnailUri || undefined,
        kind,
        mediaKind: kind,
        type: kind,
      };
    })
    .filter(Boolean);
}

function normalizeSabiDirectoryCount(value: unknown) {
  const next = Number(value);
  return Number.isFinite(next) ? Math.max(0, Math.floor(next)) : 0;
}

function normalizeDirectoryItem(
  raw: unknown,
  fallbackKind?: SabiPublicDirectoryKind,
): SabiPublicDirectoryItem | null {
  if (!raw || typeof raw !== "object") return null;

  const record = raw as Record<string, unknown>;

  const id = String(
    record.chatId ||
      record.roomId ||
      record.groupId ||
      record.channelId ||
      record.botId ||
      record.id ||
      "",
  ).trim();

  const title = String(
    record.title ||
      record.name ||
      record.groupName ||
      record.channelName ||
      record.botName ||
      "",
  ).trim();

  const rawKind = String(record.kind || record.type || fallbackKind || "GROUP").toUpperCase();
  const kind: SabiPublicDirectoryKind =
    rawKind === "CHANNEL" ? "CHANNEL" : rawKind === "BOT" ? "BOT" : "GROUP";

  if (!id || !title) return null;

  const avatarUrl =
    typeof record.avatarUrl === "string"
      ? record.avatarUrl
      : typeof record.avatarUri === "string"
        ? record.avatarUri
        : typeof record.photoUrl === "string"
          ? record.photoUrl
          : null;

  return {
    id,
    chatId: typeof record.chatId === "string" ? record.chatId : kind === "BOT" ? null : id,
    roomId: typeof record.roomId === "string" ? record.roomId : kind === "BOT" ? null : id,
    groupId: kind === "GROUP" ? id : null,
    channelId: kind === "CHANNEL" ? id : null,
    botId: kind === "BOT" ? id : null,
    title,
    name: title,
    username: typeof record.username === "string" ? record.username : null,
    description: typeof record.description === "string" ? record.description : null,
    avatarUrl,
    avatarUri: avatarUrl,
    photoUrl: avatarUrl,
    ownerUserId: typeof record.ownerUserId === "string" ? record.ownerUserId : null,
    createdBy: typeof record.createdBy === "string" ? record.createdBy : null,
    kind,
    type: kind,
    roomType: kind === "GROUP" ? "group" : kind === "CHANNEL" ? "channel" : "bot",
    isPublic: readSabiDirectoryBoolean(record.isPublic, true),
    searchableInDirectory: readSabiDirectoryBoolean(record.searchableInDirectory, true),
    joinMode: kind === "GROUP" ? "open" : kind === "CHANNEL" ? "subscribe" : null,
    action: kind === "BOT" ? "start" : null,
    updatedAt: typeof record.updatedAt === "string" ? record.updatedAt : null,
    coverUri: typeof record.coverUri === "string" ? record.coverUri : typeof record.coverUrl === "string" ? record.coverUrl : null,
    coverUrl: typeof record.coverUrl === "string" ? record.coverUrl : typeof record.coverUri === "string" ? record.coverUri : null,
    publicationPhotos: normalizeSabiDirectoryMediaPayload(pickSabiDirectoryMediaPayload(record.publicationPhotos, record.publicPhotos), "photo"),
    publicationVideos: normalizeSabiDirectoryMediaPayload(pickSabiDirectoryMediaPayload(record.publicationVideos, record.publicVideos), "video"),
    publicPhotos: normalizeSabiDirectoryMediaPayload(pickSabiDirectoryMediaPayload(record.publicPhotos, record.publicationPhotos), "photo"),
    publicVideos: normalizeSabiDirectoryMediaPayload(pickSabiDirectoryMediaPayload(record.publicVideos, record.publicationVideos), "video"),
    likesCount: normalizeSabiDirectoryCount(record.likesCount),
    publicGiftsCount: normalizeSabiDirectoryCount(record.publicGiftsCount),
    inviteLink: typeof record.inviteLink === "string" ? record.inviteLink : null,
    adminControlled: readSabiDirectoryBoolean(record.adminControlled, false),
    adminVisibilitySource: readSabiDirectoryString(record.adminVisibilitySource) || undefined,
    approvalStatus: readSabiDirectoryString(record.approvalStatus),
    listingStatus: readSabiDirectoryString(record.listingStatus),
    visibilityStatus: readSabiDirectoryString(record.visibilityStatus),
    promotionPlacement: normalizePromotionPlacement(record.promotionPlacement),
    featuredRank: readSabiDirectoryNumber(record.featuredRank, 0) || null,
    searchBoostPct: readSabiDirectoryNumber(record.searchBoostPct, 0),
    directoryBoostPct: readSabiDirectoryNumber(record.directoryBoostPct, 0),
    recommended: readSabiDirectoryBoolean(record.recommended, false),
    qualityScore: readSabiDirectoryNumber(record.qualityScore, 0),
    safetyScore: readSabiDirectoryNumber(record.safetyScore, 0),
    promotionScore: readSabiDirectoryNumber(record.promotionScore, 0),
    rawContentIncluded: readSabiDirectoryBoolean(record.rawContentIncluded, false),
    visibility: readSabiDirectoryString(record.visibility),
    hidden: readSabiDirectoryBoolean(record.hidden, false),
    isHidden: readSabiDirectoryBoolean(record.isHidden, false),
    runtime: record.runtime ? normalizeSabiPublicDirectoryRuntimeSnapshot(record.runtime, kind, id) : null,
    membershipStatus: readSabiDirectoryString(record.membershipStatus),
    joinedByCurrentUser: readSabiDirectoryBoolean(record.joinedByCurrentUser, false),
    subscribedByCurrentUser: readSabiDirectoryBoolean(record.subscribedByCurrentUser, false),
    startedByCurrentUser: readSabiDirectoryBoolean(record.startedByCurrentUser, false),
    canSendMessages: record.canSendMessages as boolean | string | null | undefined,
    canInvite: record.canInvite as boolean | string | null | undefined,
    inviteAvailable: record.inviteAvailable as boolean | string | null | undefined,
    shareText: readSabiDirectoryString(record.shareText),
    memberUserIds: normalizeSabiPublicDirectoryStringArray(record.memberUserIds),
    subscriberUserIds: normalizeSabiPublicDirectoryStringArray(record.subscriberUserIds),
    startedUserIds: normalizeSabiPublicDirectoryStringArray(record.startedUserIds),
    membersCount: readSabiDirectoryNumber(record.membersCount, 0),
    subscribersCount: readSabiDirectoryNumber(record.subscribersCount, 0),
    startedCount: readSabiDirectoryNumber(record.startedCount, 0),
  };
}

function preserveSabiDirectoryPublicBoolean(value: unknown, fallback = true) {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value !== 0;
  if (typeof value === "string") {
    const raw = value.trim().toLowerCase();
    if (["1", "true", "yes", "on", "public", "visible", "enabled"].includes(raw)) return true;
    if (["0", "false", "no", "off", "private", "hidden", "disabled"].includes(raw)) return false;
  }

  return fallback;
}

function normalizeRows(payload: unknown, fallbackKind?: SabiPublicDirectoryKind) {
  const rawRows =
    Array.isArray(payload)
      ? payload
      : Array.isArray((payload as any)?.data)
        ? (payload as any).data
        : Array.isArray((payload as any)?.items)
          ? (payload as any).items
          : Array.isArray((payload as any)?.rows)
            ? (payload as any).rows
            : Array.isArray((payload as any)?.data?.items)
              ? (payload as any).data.items
              : [];

  return rawRows
    .map((item: unknown) => normalizeDirectoryItem(item, fallbackKind))
    .filter((item: SabiPublicDirectoryItem | null): item is SabiPublicDirectoryItem => {
      if (!item || !canShowSabiPublicDirectoryItem(item)) return false;
      const itemId = String(item.chatId || item.roomId || item.groupId || item.channelId || item.botId || item.id || "").trim();
      return !isSabiPublicDirectoryBlockedItem(item.kind, itemId);
    })
    .sort(compareSabiPublicDirectoryPromotion);
}

function emptySabiPublicDirectoryKindStats(): SabiPublicDirectoryKindStats {
  return {
    total: 0,
    visible: 0,
    hidden: 0,
    restricted: 0,
    rejected: 0,
    unsafe: 0,
    pendingReview: 0,
    profileRemoved: 0,
    adminControlled: 0,
    featured: 0,
    boosted: 0,
    recommended: 0,
    approved: 0,
    public: 0,
    joined: 0,
    subscribed: 0,
    started: 0,
  };
}

function normalizeSabiPublicDirectoryKindStats(value: unknown): SabiPublicDirectoryKindStats {
  const record = value && typeof value === "object" ? value as Record<string, unknown> : {};

  return {
    total: readSabiDirectoryNumber(record.total, 0),
    visible: readSabiDirectoryNumber(record.visible, 0),
    hidden: readSabiDirectoryNumber(record.hidden, 0),
    restricted: readSabiDirectoryNumber(record.restricted, 0),
    rejected: readSabiDirectoryNumber(record.rejected, 0),
    unsafe: readSabiDirectoryNumber(record.unsafe, 0),
    pendingReview: readSabiDirectoryNumber(record.pendingReview, 0),
    profileRemoved: readSabiDirectoryNumber(record.profileRemoved, 0),
    adminControlled: readSabiDirectoryNumber(record.adminControlled, 0),
    featured: readSabiDirectoryNumber(record.featured, 0),
    boosted: readSabiDirectoryNumber(record.boosted, 0),
    recommended: readSabiDirectoryNumber(record.recommended, 0),
    approved: readSabiDirectoryNumber(record.approved, 0),
    public: readSabiDirectoryNumber(record.public, 0),
    joined: readSabiDirectoryNumber(record.joined, 0),
    subscribed: readSabiDirectoryNumber(record.subscribed, 0),
    started: readSabiDirectoryNumber(record.started, 0),
  };
}

function pickSabiPublicDirectoryStatsBucket(
  stats: Pick<SabiPublicDirectoryStatsSnapshot, "all" | "groups" | "channels" | "bots">,
  kind: SabiPublicDirectoryKind | "ALL",
) {
  if (kind === "GROUP") return stats.groups;
  if (kind === "CHANNEL") return stats.channels;
  if (kind === "BOT") return stats.bots;
  return stats.all;
}

function normalizeSabiPublicDirectoryStatsPayload(payload: unknown, kind: SabiPublicDirectoryKind | "ALL"): SabiPublicDirectoryStatsSnapshot {
  const root = payload && typeof payload === "object" ? payload as Record<string, unknown> : {};
  const statsRoot = root.stats && typeof root.stats === "object" ? root.stats as Record<string, unknown> : root;
  const selectedRaw = root.data && typeof root.data === "object" ? root.data : null;
  const all = normalizeSabiPublicDirectoryKindStats(statsRoot.all);
  const groups = normalizeSabiPublicDirectoryKindStats(statsRoot.groups);
  const channels = normalizeSabiPublicDirectoryKindStats(statsRoot.channels);
  const bots = normalizeSabiPublicDirectoryKindStats(statsRoot.bots);
  const selected = selectedRaw
    ? normalizeSabiPublicDirectoryKindStats(selectedRaw)
    : pickSabiPublicDirectoryStatsBucket({ all, groups, channels, bots }, kind);

  return {
    updatedAt: readSabiDirectoryString(root.updatedAt) || readSabiDirectoryString(statsRoot.updatedAt),
    adminControlled: readSabiDirectoryBoolean(root.adminControlled ?? statsRoot.adminControlled, true),
    rawContentIncluded: readSabiDirectoryBoolean(root.rawContentIncluded ?? statsRoot.rawContentIncluded, false),
    currentUserId: readSabiDirectoryString(statsRoot.currentUserId),
    all,
    groups,
    channels,
    bots,
    selected,
    kind,
  };
}

function normalizeSabiPublicDirectoryAuditKind(value: unknown): SabiPublicDirectoryKind {
  const raw = String(value || "").trim().toUpperCase();
  if (raw === "CHANNEL") return "CHANNEL";
  if (raw === "BOT") return "BOT";
  return "GROUP";
}

function normalizeSabiPublicDirectoryAuditRows(payload: unknown): SabiPublicDirectoryAuditEntry[] {
  const root = payload && typeof payload === "object" ? payload as Record<string, unknown> : {};
  const rows = Array.isArray(payload)
    ? payload
    : Array.isArray(root.data)
      ? root.data
      : Array.isArray(root.items)
        ? root.items
        : Array.isArray(root.entries)
          ? root.entries
          : [];

  return rows
    .map((item: unknown) => {
      if (!item || typeof item !== "object") return null;
      const record = item as Record<string, unknown>;
      const targetId = readSabiDirectoryString(record.targetId) || readSabiDirectoryString(record.id);
      const at = readSabiDirectoryString(record.at) || readSabiDirectoryString(record.createdAt) || readSabiDirectoryString(record.updatedAt);
      const action = readSabiDirectoryString(record.action);

      if (!targetId || !at || !action) return null;

      return {
        id: readSabiDirectoryString(record.id) || `${at}:${targetId}:${action}`,
        at,
        action,
        kind: normalizeSabiPublicDirectoryAuditKind(record.kind || record.type),
        targetId,
        actorUserId: readSabiDirectoryString(record.actorUserId),
        targetUserId: readSabiDirectoryString(record.targetUserId),
        status: readSabiDirectoryString(record.status) || "visible",
        code: readSabiDirectoryString(record.code),
        adminControlled: readSabiDirectoryBoolean(record.adminControlled, true),
        rawContentIncluded: readSabiDirectoryBoolean(record.rawContentIncluded, false),
        visibilityStatus: readSabiDirectoryString(record.visibilityStatus),
        listingStatus: readSabiDirectoryString(record.listingStatus),
        approvalStatus: readSabiDirectoryString(record.approvalStatus),
        promotionPlacement: readSabiDirectoryString(record.promotionPlacement),
        source: readSabiDirectoryString(record.source),
      } as SabiPublicDirectoryAuditEntry;
    })
    .filter((item): item is SabiPublicDirectoryAuditEntry => Boolean(item));
}

function normalizeSabiPublicDirectoryAuditPayload(payload: unknown, kind: SabiPublicDirectoryKind | "ALL"): SabiPublicDirectoryAuditSnapshot {
  const root = payload && typeof payload === "object" ? payload as Record<string, unknown> : {};
  const entries = normalizeSabiPublicDirectoryAuditRows(payload);

  return {
    updatedAt: readSabiDirectoryString(root.updatedAt),
    adminControlled: readSabiDirectoryBoolean(root.adminControlled, true),
    rawContentIncluded: readSabiDirectoryBoolean(root.rawContentIncluded, false),
    currentUserId: readSabiDirectoryString(root.currentUserId),
    kind,
    count: readSabiDirectoryNumber(root.count, entries.length),
    entries,
  };
}

function normalizeSabiPublicDirectoryReviewStatus(value: unknown): SabiPublicDirectoryReviewStatus {
  const raw = String(value || "needs_review").trim().toLowerCase();
  if (raw === "restricted" || raw === "hidden" || raw === "rejected" || raw === "unsafe" || raw === "profile_removed") return raw;
  return raw || "needs_review";
}

function normalizeSabiPublicDirectoryReviewQueueRows(payload: unknown): SabiPublicDirectoryReviewQueueEntry[] {
  const root = payload && typeof payload === "object" ? payload as Record<string, unknown> : {};
  const rows = Array.isArray(payload)
    ? payload
    : Array.isArray(root.data)
      ? root.data
      : Array.isArray(root.items)
        ? root.items
        : Array.isArray(root.entries)
          ? root.entries
          : [];

  return rows
    .map((item: unknown) => {
      if (!item || typeof item !== "object") return null;
      const record = item as Record<string, unknown>;
      const id = readSabiDirectoryString(record.id) || readSabiDirectoryString(record.targetId);
      const title = readSabiDirectoryString(record.title) || readSabiDirectoryString(record.name);

      if (!id || !title) return null;

      return {
        id,
        kind: normalizeSabiPublicDirectoryAuditKind(record.kind || record.type),
        title,
        name: title,
        username: readSabiDirectoryString(record.username),
        ownerUserId: readSabiDirectoryString(record.ownerUserId),
        status: normalizeSabiPublicDirectoryReviewStatus(record.status),
        reason: readSabiDirectoryString(record.reason) || "pending_admin_review",
        visibilityStatus: readSabiDirectoryString(record.visibilityStatus),
        listingStatus: readSabiDirectoryString(record.listingStatus),
        approvalStatus: readSabiDirectoryString(record.approvalStatus),
        promotionPlacement: readSabiDirectoryString(record.promotionPlacement),
        qualityScore: readSabiDirectoryNumber(record.qualityScore, 0),
        safetyScore: readSabiDirectoryNumber(record.safetyScore, 0),
        adminControlled: readSabiDirectoryBoolean(record.adminControlled, true),
        rawContentIncluded: readSabiDirectoryBoolean(record.rawContentIncluded, false),
        updatedAt: readSabiDirectoryString(record.updatedAt),
      } as SabiPublicDirectoryReviewQueueEntry;
    })
    .filter((item): item is SabiPublicDirectoryReviewQueueEntry => Boolean(item));
}

function normalizeSabiPublicDirectoryReviewQueuePayload(payload: unknown, kind: SabiPublicDirectoryKind | "ALL"): SabiPublicDirectoryReviewQueueSnapshot {
  const root = payload && typeof payload === "object" ? payload as Record<string, unknown> : {};
  const entries = normalizeSabiPublicDirectoryReviewQueueRows(payload);

  return {
    updatedAt: readSabiDirectoryString(root.updatedAt),
    adminControlled: readSabiDirectoryBoolean(root.adminControlled, true),
    rawContentIncluded: readSabiDirectoryBoolean(root.rawContentIncluded, false),
    forAdminReviewOnly: readSabiDirectoryBoolean(root.forAdminReviewOnly, true),
    currentUserId: readSabiDirectoryString(root.currentUserId),
    kind,
    count: readSabiDirectoryNumber(root.count, entries.length),
    entries,
  };
}

function emptySabiPublicDirectoryHealthFileState(): SabiPublicDirectoryHealthFileState {
  return {
    exists: false,
    loaded: false,
    validJson: false,
    sizeBytes: 0,
    recordsCount: 0,
    updatedAt: null,
    error: null,
  };
}

function normalizeSabiPublicDirectoryHealthFileState(value: unknown): SabiPublicDirectoryHealthFileState {
  const record = value && typeof value === "object" ? value as Record<string, unknown> : {};

  return {
    exists: readSabiDirectoryBoolean(record.exists, false),
    loaded: readSabiDirectoryBoolean(record.loaded, false),
    validJson: readSabiDirectoryBoolean(record.validJson, false),
    sizeBytes: readSabiDirectoryNumber(record.sizeBytes, 0),
    recordsCount: readSabiDirectoryNumber(record.recordsCount, 0),
    updatedAt: readSabiDirectoryString(record.updatedAt),
    error: readSabiDirectoryString(record.error),
  };
}

function normalizeSabiPublicDirectoryHealthStores(value: unknown): SabiPublicDirectoryHealthSnapshot["stores"] {
  const record = value && typeof value === "object" ? value as Record<string, unknown> : {};

  return {
    memoryRecords: readSabiDirectoryNumber(record.memoryRecords, 0),
    memoryVisibleRecords: readSabiDirectoryNumber(record.memoryVisibleRecords, 0),
    groups: readSabiDirectoryNumber(record.groups, 0),
    channels: readSabiDirectoryNumber(record.channels, 0),
    bots: readSabiDirectoryNumber(record.bots, 0),
    joinedGroups: readSabiDirectoryNumber(record.joinedGroups, 0),
    subscribedChannels: readSabiDirectoryNumber(record.subscribedChannels, 0),
    startedBots: readSabiDirectoryNumber(record.startedBots, 0),
    auditEntries: readSabiDirectoryNumber(record.auditEntries, 0),
  };
}

function normalizeSabiPublicDirectoryHealthChecks(value: unknown): Record<string, boolean> {
  const record = value && typeof value === "object" ? value as Record<string, unknown> : {};
  const checks: Record<string, boolean> = {};

  for (const [key, raw] of Object.entries(record)) {
    checks[key] = readSabiDirectoryBoolean(raw, false);
  }

  return checks;
}

function emptySabiPublicDirectoryHealthSnapshot(kind: SabiPublicDirectoryKind | "ALL", status: "unavailable" | "degraded" = "unavailable"): SabiPublicDirectoryHealthSnapshot {
  const emptyFile = emptySabiPublicDirectoryHealthFileState();

  return {
    updatedAt: null,
    adminControlled: true,
    rawContentIncluded: false,
    kind,
    status,
    persistence: {
      profileSync: emptyFile,
      actionState: emptySabiPublicDirectoryHealthFileState(),
      auditLog: emptySabiPublicDirectoryHealthFileState(),
      adminPromotion: emptySabiPublicDirectoryHealthFileState(),
      adminApprovalVisibility: emptySabiPublicDirectoryHealthFileState(),
    },
    stores: normalizeSabiPublicDirectoryHealthStores(null),
    checks: {},
    stats: normalizeSabiPublicDirectoryStatsPayload(null, kind),
  };
}

function normalizeSabiPublicDirectoryHealthPayload(payload: unknown, kind: SabiPublicDirectoryKind | "ALL"): SabiPublicDirectoryHealthSnapshot {
  const root = payload && typeof payload === "object" ? payload as Record<string, unknown> : {};
  const data = root.data && typeof root.data === "object"
    ? root.data as Record<string, unknown>
    : root.health && typeof root.health === "object"
      ? root.health as Record<string, unknown>
      : root;
  const persistence = data.persistence && typeof data.persistence === "object" ? data.persistence as Record<string, unknown> : {};
  const rawStatus = String(data.status || root.status || "degraded").trim().toLowerCase();
  const status: SabiPublicDirectoryHealthSnapshot["status"] = rawStatus === "ready" ? "ready" : rawStatus === "unavailable" ? "unavailable" : "degraded";

  return {
    updatedAt: readSabiDirectoryString(data.updatedAt) || readSabiDirectoryString(root.updatedAt),
    adminControlled: readSabiDirectoryBoolean(data.adminControlled ?? root.adminControlled, true),
    rawContentIncluded: readSabiDirectoryBoolean(data.rawContentIncluded ?? root.rawContentIncluded, false),
    currentUserId: readSabiDirectoryString(data.currentUserId),
    kind,
    status,
    persistence: {
      profileSync: normalizeSabiPublicDirectoryHealthFileState(persistence.profileSync),
      actionState: normalizeSabiPublicDirectoryHealthFileState(persistence.actionState),
      auditLog: normalizeSabiPublicDirectoryHealthFileState(persistence.auditLog),
      adminPromotion: normalizeSabiPublicDirectoryHealthFileState(persistence.adminPromotion),
      adminApprovalVisibility: normalizeSabiPublicDirectoryHealthFileState(persistence.adminApprovalVisibility),
    },
    stores: normalizeSabiPublicDirectoryHealthStores(data.stores),
    checks: normalizeSabiPublicDirectoryHealthChecks(data.checks),
    stats: normalizeSabiPublicDirectoryStatsPayload({
      updatedAt: data.updatedAt,
      adminControlled: data.adminControlled,
      rawContentIncluded: data.rawContentIncluded,
      stats: data.stats,
    }, kind),
  };
}

function normalizeSabiPublicDirectoryStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  const seen = new Set<string>();
  const rows: string[] = [];

  for (const item of value) {
    const text = readSabiDirectoryString(item);
    if (!text || seen.has(text)) continue;
    seen.add(text);
    rows.push(text);
  }

  return rows;
}

function normalizeSabiPublicDirectoryRuntimeKind(value: unknown, fallback: SabiPublicDirectoryKind): SabiPublicDirectoryKind {
  const raw = String(value || fallback).trim().toUpperCase();
  if (raw === "CHANNEL") return "CHANNEL";
  if (raw === "BOT") return "BOT";
  return "GROUP";
}

function emptySabiPublicDirectoryRuntimeSnapshot(kind: SabiPublicDirectoryKind, id: string): SabiPublicDirectoryRuntimeSnapshot {
  return {
    id,
    kind,
    roomType: kind === "GROUP" ? "group" : kind === "CHANNEL" ? "channel" : "bot",
    currentUserId: null,
    visibleInMobile: false,
    joinedByCurrentUser: false,
    subscribedByCurrentUser: false,
    startedByCurrentUser: false,
    membershipStatus: "none",
    canSendMessages: false,
    canInvite: false,
    inviteAvailable: false,
    inviteLink: null,
    shareText: null,
    memberUserIds: [],
    subscriberUserIds: [],
    startedUserIds: [],
    membersCount: 0,
    subscribersCount: 0,
    startedCount: 0,
    adminControlled: true,
    rawContentIncluded: false,
    updatedAt: null,
  };
}

function normalizeSabiPublicDirectoryRuntimeSnapshot(
  value: unknown,
  fallbackKind: SabiPublicDirectoryKind,
  fallbackId: string,
): SabiPublicDirectoryRuntimeSnapshot {
  const record = value && typeof value === "object" ? value as Record<string, unknown> : {};
  const kind = normalizeSabiPublicDirectoryRuntimeKind(record.kind, fallbackKind);
  const id = readSabiDirectoryString(record.id) || fallbackId;
  const memberUserIds = normalizeSabiPublicDirectoryStringArray(record.memberUserIds);
  const subscriberUserIds = normalizeSabiPublicDirectoryStringArray(record.subscriberUserIds);
  const startedUserIds = normalizeSabiPublicDirectoryStringArray(record.startedUserIds);

  return {
    id,
    kind,
    roomType: kind === "GROUP" ? "group" : kind === "CHANNEL" ? "channel" : "bot",
    currentUserId: readSabiDirectoryString(record.currentUserId),
    visibleInMobile: readSabiDirectoryBoolean(record.visibleInMobile, false),
    joinedByCurrentUser: readSabiDirectoryBoolean(record.joinedByCurrentUser, false),
    subscribedByCurrentUser: readSabiDirectoryBoolean(record.subscribedByCurrentUser, false),
    startedByCurrentUser: readSabiDirectoryBoolean(record.startedByCurrentUser, false),
    membershipStatus: readSabiDirectoryString(record.membershipStatus) || "none",
    canSendMessages: readSabiDirectoryBoolean(record.canSendMessages, false),
    canInvite: readSabiDirectoryBoolean(record.canInvite, false),
    inviteAvailable: readSabiDirectoryBoolean(record.inviteAvailable, false),
    inviteLink: readSabiDirectoryString(record.inviteLink),
    shareText: readSabiDirectoryString(record.shareText),
    memberUserIds,
    subscriberUserIds,
    startedUserIds,
    membersCount: readSabiDirectoryNumber(record.membersCount, memberUserIds.length),
    subscribersCount: readSabiDirectoryNumber(record.subscribersCount, subscriberUserIds.length),
    startedCount: readSabiDirectoryNumber(record.startedCount, startedUserIds.length),
    adminControlled: readSabiDirectoryBoolean(record.adminControlled, true),
    rawContentIncluded: readSabiDirectoryBoolean(record.rawContentIncluded, false),
    updatedAt: readSabiDirectoryString(record.updatedAt),
  };
}

function normalizeSabiPublicDirectoryRuntimeResult(
  payload: unknown,
  kind: SabiPublicDirectoryKind,
  id: string,
  status: number,
): SabiPublicDirectoryRuntimeResult {
  const root = payload && typeof payload === "object" ? payload as Record<string, unknown> : {};
  const data = root.data && typeof root.data === "object" ? root.data as Record<string, unknown> : null;
  const runtimeSource = root.runtime || data?.runtime || null;
  const runtime = runtimeSource ? normalizeSabiPublicDirectoryRuntimeSnapshot(runtimeSource, kind, id) : null;
  const item = data ? normalizeDirectoryItem(data, kind) : null;

  return {
    ok: Boolean(root.ok) && status >= 200 && status < 300,
    kind,
    id,
    item,
    runtime,
    status,
    error: readSabiDirectoryString(root.error) || readSabiDirectoryString(data?.error) || null,
    adminControlled: readSabiDirectoryBoolean(root.adminControlled ?? data?.adminControlled, true),
    rawContentIncluded: readSabiDirectoryBoolean(root.rawContentIncluded ?? data?.rawContentIncluded, false),
    updatedAt: readSabiDirectoryString(root.updatedAt) || readSabiDirectoryString(data?.updatedAt) || runtime?.updatedAt || null,
  };
}

async function postSabiPublicDirectoryProfilePayload(params: {
  endpoint: string;
  payload: unknown;
  fallbackKind?: SabiPublicDirectoryKind;
}) {
  const session = await readDirectorySession();

  if (!session) {
    return { ok: false as const, status: 0, data: null, endpoint: params.endpoint, error: "messenger_kernel_session_not_ready" };
  }

  try {
    const response = await session.fetchImpl(`${session.apiBaseUrl}${params.endpoint}`, {
      method: "POST",
      headers: buildDirectoryHeaders(session, true),
      body: JSON.stringify(params.payload),
    });

    const json = await readJson(response as Response);

    if (!response.ok) {
      return {
        ok: false as const,
        status: response.status,
        data: json,
        endpoint: params.endpoint,
        error: typeof (json as any)?.error === "string" ? (json as any).error : `http_${response.status}`,
      };
    }

    return { ok: true as const, status: response.status, data: json, endpoint: params.endpoint, error: null };
  } catch (error) {
    return {
      ok: false as const,
      status: 0,
      data: null,
      endpoint: params.endpoint,
      error: error instanceof Error ? error.message : "network_error",
    };
  }
}

export async function syncSabiPublicDirectoryProfile(input: SabiPublicDirectoryProfileSyncInput) {
  const payload = {
    ...input,
    isPublic: preserveSabiDirectoryPublicBoolean(input.isPublic, true),
    searchableInDirectory: preserveSabiDirectoryPublicBoolean(input.searchableInDirectory, true),
  };

  const endpoints = [
    commonEndpointForProfileSync(),
    fallbackEndpointForProfileSync(input.kind),
  ];

  let lastError: unknown = null;

  for (const endpoint of endpoints) {
    const result = await postSabiPublicDirectoryProfilePayload({ endpoint, payload, fallbackKind: input.kind });

    if (!result.ok) {
      lastError = result;
      console.warn("[sabi-public-directory] profile_sync_failed", {
        status: result.status,
        endpoint: result.endpoint,
        body: result.data,
        fallbackWillRun: endpoint === endpoints[0],
      });
      continue;
    }

    console.log("[sabi-public-directory] profile_sync_ok", {
      kind: input.kind,
      endpoint,
      id: input.id || input.chatId || input.roomId || input.botId,
    });

    return normalizeDirectoryItem((result.data as any)?.data ?? result.data, input.kind);
  }

  console.warn("[sabi-public-directory] profile_sync_all_endpoints_failed", lastError);
  return null;
}

function normalizeSabiPublicDirectoryBatchKinds(
  rows: SabiPublicDirectoryProfileSyncInput[],
  options: SabiPublicDirectoryProfileSyncBatchOptions,
): SabiPublicDirectoryKind[] {
  const set = new Set<SabiPublicDirectoryKind>();

  for (const kind of options.kinds ?? []) {
    if (kind === "GROUP" || kind === "CHANNEL" || kind === "BOT") set.add(kind);
  }

  for (const item of rows) {
    if (item.kind === "GROUP" || item.kind === "CHANNEL" || item.kind === "BOT") set.add(item.kind);
  }

  return Array.from(set);
}

export async function syncSabiPublicDirectoryProfilesBatch(
  inputs: SabiPublicDirectoryProfileSyncInput[],
  options: SabiPublicDirectoryProfileSyncBatchOptions = {},
): Promise<SabiPublicDirectoryItem[]> {
  const rows = inputs.filter((item) => item && item.kind);
  const kinds = normalizeSabiPublicDirectoryBatchKinds(rows, options);

  if (!rows.length && !kinds.length) return [];

  const payload = {
    source: options.source || "profile",
    replaceForOwner: options.replaceForOwner === true,
    kinds,
    items: rows.map((item) => ({
      ...item,
      isPublic: preserveSabiDirectoryPublicBoolean(item.isPublic, true),
      searchableInDirectory: preserveSabiDirectoryPublicBoolean(item.searchableInDirectory, true),
    })),
  };

  const common = await postSabiPublicDirectoryProfilePayload({
    endpoint: commonEndpointForProfileSync(),
    payload,
  });

  if (common.ok) {
    return normalizeRows(common.data, undefined);
  }

  console.warn("[sabi-public-directory] profile_batch_sync_common_failed_fallback_to_single", {
    status: common.status,
    endpoint: common.endpoint,
    body: common.data,
  });

  const synced = await Promise.all(rows.map((item) => syncSabiPublicDirectoryProfile(item)));
  return synced.filter((item): item is SabiPublicDirectoryItem => Boolean(item));
}

async function fetchSabiPublicDirectoryRows(params: {
  query?: string;
  kind?: SabiPublicDirectoryKind | "ALL";
  list?: boolean;
  limit?: number;
}): Promise<SabiPublicDirectoryItem[]> {
  const session = await readDirectorySession();

  if (!session) return [];

  const endpoint = endpointForSearch(params.kind);
  const query = String(params.query || "").trim();
  const search = new URLSearchParams();
  search.set("q", query);
  search.set("query", query);
  search.set("mobile", "1");
  search.set("adminControlled", "1");
  if (params.list) search.set("list", "1");
  if (params.limit && params.limit > 0) search.set("limit", String(Math.floor(params.limit)));

  try {
    const response = await session.fetchImpl(`${session.apiBaseUrl}${endpoint}?${search.toString()}`, {
      method: "GET",
      headers: buildDirectoryHeaders(session, false),
    });

    const json = await readJson(response as Response);

    if (!response.ok) {
      console.warn("[sabi-public-directory] fetch_failed", {
        status: response.status,
        endpoint,
        body: json,
      });

      return [];
    }

    return normalizeRows(json, params.kind === "ALL" ? undefined : params.kind).slice(0, params.limit || 80);
  } catch (error) {
    console.warn("[sabi-public-directory] fetch_network_error", error);
    return [];
  }
}

export async function listSabiPublicDirectory(input: SabiPublicDirectoryListInput = {}): Promise<SabiPublicDirectoryItem[]> {
  return fetchSabiPublicDirectoryRows({
    kind: input.kind || "ALL",
    list: true,
    limit: input.limit || 80,
  });
}

export async function fetchSabiPublicDirectoryStats(
  input: SabiPublicDirectoryStatsInput = {},
): Promise<SabiPublicDirectoryStatsSnapshot> {
  const kind = normalizeKind(input.kind || "ALL");
  const session = await readDirectorySession();

  if (!session) {
    const empty = emptySabiPublicDirectoryKindStats();
    return {
      updatedAt: null,
      adminControlled: true,
      rawContentIncluded: false,
      all: empty,
      groups: emptySabiPublicDirectoryKindStats(),
      channels: emptySabiPublicDirectoryKindStats(),
      bots: emptySabiPublicDirectoryKindStats(),
      selected: empty,
      kind,
    };
  }

  const endpoint = endpointForStats(kind);

  try {
    const search = new URLSearchParams();
    search.set("adminControlled", "1");
    search.set("mobile", "1");

    const response = await session.fetchImpl(`${session.apiBaseUrl}${endpoint}?${search.toString()}`, {
      method: "GET",
      headers: buildDirectoryHeaders(session, false),
    });

    const json = await readJson(response as Response);

    if (!response.ok) {
      console.warn("[sabi-public-directory] stats_failed", {
        status: response.status,
        endpoint,
        body: json,
      });

      return normalizeSabiPublicDirectoryStatsPayload(null, kind);
    }

    return normalizeSabiPublicDirectoryStatsPayload(json, kind);
  } catch (error) {
    console.warn("[sabi-public-directory] stats_network_error", error);
    return normalizeSabiPublicDirectoryStatsPayload(null, kind);
  }
}

export async function fetchSabiPublicDirectoryAudit(
  input: SabiPublicDirectoryAuditInput = {},
): Promise<SabiPublicDirectoryAuditSnapshot> {
  const kind = normalizeKind(input.kind || "ALL");
  const session = await readDirectorySession();

  if (!session) {
    return {
      updatedAt: null,
      adminControlled: true,
      rawContentIncluded: false,
      kind,
      count: 0,
      entries: [],
    };
  }

  const endpoint = endpointForAudit(kind);

  try {
    const search = new URLSearchParams();
    search.set("adminControlled", "1");
    search.set("mobile", "1");
    if (input.targetId) search.set("targetId", input.targetId);
    if (input.action) search.set("action", input.action);
    if (input.actorUserId) search.set("actorUserId", input.actorUserId);
    if (input.limit && input.limit > 0) search.set("limit", String(Math.floor(input.limit)));

    const response = await session.fetchImpl(`${session.apiBaseUrl}${endpoint}?${search.toString()}`, {
      method: "GET",
      headers: buildDirectoryHeaders(session, false),
    });

    const json = await readJson(response as Response);

    if (!response.ok) {
      console.warn("[sabi-public-directory] audit_failed", {
        status: response.status,
        endpoint,
        body: json,
      });

      return normalizeSabiPublicDirectoryAuditPayload(null, kind);
    }

    return normalizeSabiPublicDirectoryAuditPayload(json, kind);
  } catch (error) {
    console.warn("[sabi-public-directory] audit_network_error", error);
    return normalizeSabiPublicDirectoryAuditPayload(null, kind);
  }
}

export async function fetchSabiPublicDirectoryHealth(
  input: SabiPublicDirectoryHealthInput = {},
): Promise<SabiPublicDirectoryHealthSnapshot> {
  const kind = normalizeKind(input.kind || "ALL");
  const session = await readDirectorySession();

  if (!session) return emptySabiPublicDirectoryHealthSnapshot(kind, "unavailable");

  const endpoint = endpointForHealth(kind);

  try {
    const search = new URLSearchParams();
    search.set("adminControlled", "1");
    search.set("mobile", "1");

    const response = await session.fetchImpl(`${session.apiBaseUrl}${endpoint}?${search.toString()}`, {
      method: "GET",
      headers: buildDirectoryHeaders(session, false),
    });

    const json = await readJson(response as Response);

    if (!response.ok) {
      console.warn("[sabi-public-directory] health_failed", {
        status: response.status,
        endpoint,
        body: json,
      });

      return normalizeSabiPublicDirectoryHealthPayload(json, kind);
    }

    return normalizeSabiPublicDirectoryHealthPayload(json, kind);
  } catch (error) {
    console.warn("[sabi-public-directory] health_network_error", error);
    return emptySabiPublicDirectoryHealthSnapshot(kind, "unavailable");
  }
}

export async function fetchSabiPublicDirectoryRuntime(
  input: SabiPublicDirectoryRuntimeInput,
): Promise<SabiPublicDirectoryRuntimeResult> {
  const kind = normalizeKind(input.kind);
  const id = input.id.trim();
  const session = await readDirectorySession();

  if (!session || kind === "ALL" || !id) {
    return {
      ok: false,
      kind: kind === "ALL" ? input.kind : kind,
      id,
      item: null,
      runtime: id ? emptySabiPublicDirectoryRuntimeSnapshot(input.kind, id) : null,
      status: 0,
      error: !session ? "messenger_session_required" : !id ? "directory_runtime_id_required" : "directory_kind_required",
      adminControlled: true,
      rawContentIncluded: false,
      updatedAt: null,
    };
  }

  const endpoint = endpointForRuntime(kind, id);

  try {
    const search = new URLSearchParams();
    search.set("adminControlled", "1");
    search.set("mobile", "1");

    const response = await session.fetchImpl(`${session.apiBaseUrl}${endpoint}?${search.toString()}`, {
      method: "GET",
      headers: buildDirectoryHeaders(session, false),
    });

    const json = await readJson(response as Response);

    if (!response.ok) {
      console.warn("[sabi-public-directory] runtime_failed", {
        status: response.status,
        endpoint,
        body: json,
      });
    }

    return normalizeSabiPublicDirectoryRuntimeResult(json, kind, id, response.status);
  } catch (error) {
    console.warn("[sabi-public-directory] runtime_network_error", error);
    return {
      ok: false,
      kind,
      id,
      item: null,
      runtime: emptySabiPublicDirectoryRuntimeSnapshot(kind, id),
      status: 0,
      error: "network_error",
      adminControlled: true,
      rawContentIncluded: false,
      updatedAt: null,
    };
  }
}

export async function fetchSabiPublicDirectoryReviewQueue(
  input: SabiPublicDirectoryReviewQueueInput = {},
): Promise<SabiPublicDirectoryReviewQueueSnapshot> {
  const kind = normalizeKind(input.kind || "ALL");
  const session = await readDirectorySession();

  if (!session) {
    return {
      updatedAt: null,
      adminControlled: true,
      rawContentIncluded: false,
      forAdminReviewOnly: true,
      kind,
      count: 0,
      entries: [],
    };
  }

  const endpoint = endpointForReviewQueue(kind);

  try {
    const search = new URLSearchParams();
    search.set("adminControlled", "1");
    search.set("forAdminReviewOnly", "1");
    if (input.status) search.set("status", String(input.status));
    if (input.limit && input.limit > 0) search.set("limit", String(Math.floor(input.limit)));

    const response = await session.fetchImpl(`${session.apiBaseUrl}${endpoint}?${search.toString()}`, {
      method: "GET",
      headers: buildDirectoryHeaders(session, false),
    });

    const json = await readJson(response as Response);

    if (!response.ok) {
      console.warn("[sabi-public-directory] review_queue_failed", {
        status: response.status,
        endpoint,
        body: json,
      });

      return normalizeSabiPublicDirectoryReviewQueuePayload(json, kind);
    }

    return normalizeSabiPublicDirectoryReviewQueuePayload(json, kind);
  } catch (error) {
    console.warn("[sabi-public-directory] review_queue_network_error", error);
    return normalizeSabiPublicDirectoryReviewQueuePayload(null, kind);
  }
}


function normalizeSabiPublicDirectoryReviewActionResult(
  payload: unknown,
  input: SabiPublicDirectoryReviewActionInput,
  status: number,
): SabiPublicDirectoryReviewActionResult {
  const root = payload && typeof payload === "object" ? payload as Record<string, unknown> : {};
  const dataRoot = root.data && typeof root.data === "object" ? root.data as Record<string, unknown> : {};
  const itemRoot = root.item && typeof root.item === "object" ? root.item as Record<string, unknown> : null;
  const item = itemRoot ? normalizeDirectoryItem(itemRoot, input.kind) : null;

  return {
    ok: Boolean(root.ok) && status >= 200 && status < 300,
    kind: input.kind,
    id: input.id,
    action: input.action,
    visibleInMobile: readSabiDirectoryBoolean(root.visibleInMobile ?? dataRoot.visibleInMobile, false),
    status,
    error: readSabiDirectoryString(root.error) || readSabiDirectoryString(dataRoot.error) || null,
    data: normalizeDirectoryItem(dataRoot, input.kind) || dataRoot || null,
    item,
    adminControlled: readSabiDirectoryBoolean(root.adminControlled ?? dataRoot.adminControlled, true),
    rawContentIncluded: readSabiDirectoryBoolean(root.rawContentIncluded ?? dataRoot.rawContentIncluded, false),
    updatedAt: readSabiDirectoryString(root.updatedAt) || readSabiDirectoryString(dataRoot.updatedAt) || null,
  };
}

export async function applySabiPublicDirectoryReviewAction(
  input: SabiPublicDirectoryReviewActionInput,
): Promise<SabiPublicDirectoryReviewActionResult> {
  const id = input.id.trim();
  const kind = normalizeKind(input.kind);
  const session = await readDirectorySession();

  if (!session || !id || kind === "ALL") {
    return {
      ok: false,
      kind: input.kind,
      id,
      action: input.action,
      visibleInMobile: false,
      status: 0,
      error: !session ? "messenger_session_required" : !id ? "directory_target_id_required" : "directory_kind_required",
      data: null,
      item: null,
      adminControlled: true,
      rawContentIncluded: false,
      updatedAt: null,
    };
  }

  const base = endpointForReviewAction(kind);
  const idParam = encodeURIComponent(id);
  const endpoint = `${base}/${idParam}/review-action`;

  try {
    const body: Record<string, unknown> = {
      id,
      targetId: id,
      kind,
      type: kind,
      action: input.action,
      adminControlled: true,
      rawContentIncluded: false,
    };

    if (input.reason) body.reason = input.reason;
    if (typeof input.qualityScore === "number") body.qualityScore = input.qualityScore;
    if (typeof input.safetyScore === "number") body.safetyScore = input.safetyScore;
    if (input.promotionPlacement) body.promotionPlacement = input.promotionPlacement;
    if (typeof input.featuredRank === "number") body.featuredRank = input.featuredRank;
    if (typeof input.searchBoostPct === "number") body.searchBoostPct = input.searchBoostPct;
    if (typeof input.directoryBoostPct === "number") body.directoryBoostPct = input.directoryBoostPct;
    if (typeof input.recommended === "boolean") body.recommended = input.recommended;
    if (typeof input.promotionScore === "number") body.promotionScore = input.promotionScore;

    const response = await session.fetchImpl(`${session.apiBaseUrl}${endpoint}`, {
      method: "POST",
      headers: buildDirectoryHeaders(session, true),
      body: JSON.stringify(body),
    });

    const json = await readJson(response as Response);

    if (!response.ok) {
      console.warn("[sabi-public-directory] review_action_failed", {
        status: response.status,
        endpoint,
        body: json,
      });
    }

    return normalizeSabiPublicDirectoryReviewActionResult(json, input, response.status);
  } catch (error) {
    console.warn("[sabi-public-directory] review_action_network_error", error);
    return {
      ok: false,
      kind,
      id,
      action: input.action,
      visibleInMobile: false,
      status: 0,
      error: "network_error",
      data: null,
      item: null,
      adminControlled: true,
      rawContentIncluded: false,
      updatedAt: null,
    };
  }
}

export async function searchSabiPublicDirectory(input: SabiPublicDirectorySearchInput): Promise<SabiPublicDirectoryItem[]> {
  const query = input.query.trim();

  if (!query) {
    return listSabiPublicDirectory({ kind: input.kind, limit: 80 });
  }

  const rows = await fetchSabiPublicDirectoryRows({
    query,
    kind: input.kind,
    list: false,
    limit: 80,
  });

  console.log("[sabi-public-directory] search_ok", {
    query,
    count: rows.length,
  });

  return rows;
}
