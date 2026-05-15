import { appStorage } from "../../../shared/storage/app-storage";

export type GroupRole = "owner" | "admin" | "member";
export type GroupMemberStatus = "active" | "invited" | "pending" | "removed";

export type GroupModerationRules = {
  adminOnlyMessaging: boolean;
  adminOnlyMedia: boolean;
  adminOnlyInvites: boolean;
  approveJoinRequests: boolean;
  autoDeleteAds: boolean;
  autoDeletePromoLeaflets: boolean;
  autoDeleteLinks: boolean;
  autoBanRepeatedSpam: boolean;
  blacklist: string[];
};

export type GroupMemberRecord = {
  userId: string;
  displayName?: string;
  role: GroupRole;
  status: GroupMemberStatus;
  invitedByUserId?: string;
  requestedAt?: string;
  joinedAt?: string;
  updatedAt: string;
};

export type GroupModerationState = {
  groupId: string;
  ownerUserId: string;
  roles: Record<string, GroupRole>;
  rules: GroupModerationRules;
  inviteLink: string;
  members: Record<string, GroupMemberRecord>;
  updatedAt: string;
};

const DEFAULT_RULES: GroupModerationRules = {
  adminOnlyMessaging: false,
  adminOnlyMedia: false,
  adminOnlyInvites: false,
  approveJoinRequests: false,
  autoDeleteAds: true,
  autoDeletePromoLeaflets: true,
  autoDeleteLinks: false,
  autoBanRepeatedSpam: true,
  blacklist: [],
};

const STORE = new Map<string, GroupModerationState>();

const STORAGE_KEY = "messenger_group_moderation_state_v2";
const LEGACY_STORAGE_KEY = "messenger_group_moderation_state_v1";
let hydratePromise: Promise<void> | null = null;

function normalizeId(value?: string | null) {
  return String(value ?? "").trim();
}

function normalizeEntry(value?: string | null) {
  return String(value ?? "").trim().toLowerCase();
}

function normalizeDisplayName(value?: string | null) {
  return String(value ?? "").trim();
}

function normalizeGroupRole(value?: unknown): GroupRole {
  return value === "owner" || value === "admin" || value === "member" ? value : "member";
}

function normalizeGroupMemberStatus(value?: unknown): GroupMemberStatus {
  return value === "active" || value === "invited" || value === "pending" || value === "removed"
    ? value
    : "active";
}

function buildInviteLink(groupId: string, seed?: string) {
  const safeId = normalizeId(groupId) || "group";
  const baseToken = safeId.replace(/[^a-zA-Z0-9]+/g, "").slice(0, 18) || "invite";
  const suffix = normalizeId(seed) || baseToken;
  return `https://sabi.app/join/group?id=${encodeURIComponent(safeId)}&token=${encodeURIComponent(suffix)}`;
}

function createInviteToken(groupId: string) {
  const base = (normalizeId(groupId) || "group").replace(/[^a-zA-Z0-9]+/g, "").slice(0, 12) || "group";
  const entropy = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
  return `${base}${entropy}`.slice(0, 28);
}

function normalizeRulesSnapshot(value: unknown): GroupModerationRules {
  const raw = value && typeof value === "object" ? (value as Partial<GroupModerationRules>) : {};

  return {
    adminOnlyMessaging: Boolean(raw.adminOnlyMessaging),
    adminOnlyMedia: Boolean(raw.adminOnlyMedia),
    adminOnlyInvites: Boolean(raw.adminOnlyInvites),
    approveJoinRequests: Boolean(raw.approveJoinRequests),
    autoDeleteAds: typeof raw.autoDeleteAds === "boolean" ? raw.autoDeleteAds : true,
    autoDeletePromoLeaflets:
      typeof raw.autoDeletePromoLeaflets === "boolean" ? raw.autoDeletePromoLeaflets : true,
    autoDeleteLinks: Boolean(raw.autoDeleteLinks),
    autoBanRepeatedSpam:
      typeof raw.autoBanRepeatedSpam === "boolean" ? raw.autoBanRepeatedSpam : true,
    blacklist: Array.isArray(raw.blacklist)
      ? Array.from(new Set(raw.blacklist.map((item) => normalizeEntry(item)).filter(Boolean)))
      : [],
  };
}

function normalizeMemberSnapshot(userId: string, value: unknown): GroupMemberRecord | null {
  const safeUserId = normalizeId(userId);
  if (!safeUserId) return null;

  const raw = value && typeof value === "object" ? (value as Partial<GroupMemberRecord>) : {};
  const status = normalizeGroupMemberStatus(raw.status);
  const role = normalizeGroupRole(raw.role);
  const updatedAt =
    typeof raw.updatedAt === "string" && raw.updatedAt.trim()
      ? raw.updatedAt.trim()
      : new Date().toISOString();

  return {
    userId: safeUserId,
    displayName: normalizeDisplayName(raw.displayName) || undefined,
    role,
    status,
    invitedByUserId: normalizeId(raw.invitedByUserId) || undefined,
    requestedAt: normalizeId(raw.requestedAt) || undefined,
    joinedAt: normalizeId(raw.joinedAt) || (status === "active" ? updatedAt : undefined),
    updatedAt,
  };
}

function normalizeMembersSnapshot(value: unknown, roles: Record<string, GroupRole>, ownerUserId: string) {
  const members: Record<string, GroupMemberRecord> = {};

  if (value && typeof value === "object") {
    Object.entries(value as Record<string, unknown>).forEach(([key, snapshot]) => {
      const member = normalizeMemberSnapshot(key, snapshot);
      if (!member || member.status === "removed") return;
      const roleFromMap = roles[member.userId];
      const nextRole = member.userId === ownerUserId ? "owner" : roleFromMap || member.role;
      members[member.userId] = { ...member, role: nextRole };
    });
  }

  Object.entries(roles).forEach(([userId, role]) => {
    const safeUserId = normalizeId(userId);
    if (!safeUserId) return;
    if (!members[safeUserId]) {
      members[safeUserId] = {
        userId: safeUserId,
        role,
        status: "active",
        joinedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    } else {
      members[safeUserId] = { ...members[safeUserId], role };
    }
  });

  if (ownerUserId) {
    members[ownerUserId] = {
      ...(members[ownerUserId] || {
        userId: ownerUserId,
        status: "active" as GroupMemberStatus,
        joinedAt: new Date().toISOString(),
      }),
      userId: ownerUserId,
      role: "owner",
      status: members[ownerUserId]?.status === "removed" ? "active" : members[ownerUserId]?.status || "active",
      updatedAt: new Date().toISOString(),
    };
  }

  return members;
}

function normalizeStateSnapshot(groupId: string, value: unknown): GroupModerationState {
  const raw = value && typeof value === "object" ? (value as Partial<GroupModerationState>) : {};
  const safeGroupId = normalizeId(raw.groupId) || normalizeId(groupId) || "group";
  const rawRoles = raw.roles && typeof raw.roles === "object" ? raw.roles : {};
  const roles: Record<string, GroupRole> = {};

  Object.entries(rawRoles).forEach(([userId, role]) => {
    const safeUserId = normalizeId(userId);
    if (!safeUserId) return;
    roles[safeUserId] = normalizeGroupRole(role);
  });

  const ownerUserId = normalizeId(raw.ownerUserId);
  if (ownerUserId) {
    roles[ownerUserId] = "owner";
  }

  const members = normalizeMembersSnapshot(raw.members, roles, ownerUserId);

  return {
    groupId: safeGroupId,
    ownerUserId,
    roles,
    rules: normalizeRulesSnapshot(raw.rules),
    inviteLink:
      typeof raw.inviteLink === "string" && raw.inviteLink.trim()
        ? raw.inviteLink.trim()
        : buildInviteLink(safeGroupId),
    members,
    updatedAt:
      typeof raw.updatedAt === "string" && raw.updatedAt.trim()
        ? raw.updatedAt.trim()
        : new Date().toISOString(),
  };
}

function parsePersistedStore(value: unknown): Array<[string, GroupModerationState]> {
  if (Array.isArray(value)) {
    return value
      .map((entry): [string, GroupModerationState] | null => {
        if (!Array.isArray(entry) || entry.length < 2) return null;
        const key = normalizeId(entry[0]);
        if (!key) return null;
        return [key, normalizeStateSnapshot(key, entry[1])];
      })
      .filter((entry): entry is [string, GroupModerationState] => Boolean(entry));
  }

  if (value && typeof value === "object") {
    return Object.entries(value as Record<string, unknown>)
      .map(([key, snapshot]): [string, GroupModerationState] | null => {
        const safeKey = normalizeId(key);
        if (!safeKey) return null;
        return [safeKey, normalizeStateSnapshot(safeKey, snapshot)];
      })
      .filter((entry): entry is [string, GroupModerationState] => Boolean(entry));
  }

  return [];
}

function serializeStore() {
  return Array.from(STORE.entries()).map(([groupId, state]) => [
    groupId,
    {
      ...state,
      roles: { ...state.roles },
      members: { ...state.members },
      rules: {
        ...state.rules,
        blacklist: Array.from(new Set(state.rules.blacklist.map((item) => normalizeEntry(item)).filter(Boolean))),
      },
    },
  ]);
}

async function persistStore() {
  try {
    await appStorage.setString(STORAGE_KEY, JSON.stringify(serializeStore()));
  } catch {
    // Storage can fail on web/native boot. Runtime state still remains in memory.
  }
}

function schedulePersistStore() {
  void persistStore();
}

async function readPersistedModerationStore() {
  const primary = await appStorage.getString(STORAGE_KEY);
  if (primary) return primary;
  return appStorage.getString(LEGACY_STORAGE_KEY);
}

export async function hydrateGroupModerationRuntime() {
  if (hydratePromise) return hydratePromise;

  hydratePromise = (async () => {
    try {
      const raw = await readPersistedModerationStore();
      if (!raw) return;

      const parsed = JSON.parse(raw);
      const entries = parsePersistedStore(parsed);

      entries.forEach(([groupId, state]) => {
        STORE.set(groupId, state);
      });

      if (entries.length) {
        schedulePersistStore();
      }
    } catch {
      // Corrupted local moderation cache should not block Messenger startup.
    }
  })();

  return hydratePromise;
}

function ensureState(groupId: string): GroupModerationState {
  const safeGroupId = normalizeId(groupId) || "group";
  const existing = STORE.get(safeGroupId);
  if (existing) return existing;

  const next: GroupModerationState = {
    groupId: safeGroupId,
    ownerUserId: "",
    roles: {},
    rules: { ...DEFAULT_RULES, blacklist: [] },
    inviteLink: buildInviteLink(safeGroupId),
    members: {},
    updatedAt: new Date().toISOString(),
  };
  STORE.set(safeGroupId, next);
  return next;
}

function touchState(state: GroupModerationState) {
  state.updatedAt = new Date().toISOString();
  STORE.set(state.groupId, state);
  schedulePersistStore();
  return state;
}

export function ensureGroupModerationState(args: {
  groupId: string;
  ownerUserId?: string | null;
  ownerDisplayName?: string | null;
  promoteOwnerIfMissing?: boolean;
}) {
  const groupId = normalizeId(args.groupId);
  if (!groupId) {
    return {
      groupId: "",
      ownerUserId: "",
      roles: {},
      rules: { ...DEFAULT_RULES, blacklist: [] },
      inviteLink: buildInviteLink("group"),
      members: {},
      updatedAt: new Date().toISOString(),
    } satisfies GroupModerationState;
  }

  const state = ensureState(groupId);
  const ownerUserId = normalizeId(args.ownerUserId);

  if (ownerUserId && (args.promoteOwnerIfMissing || !state.ownerUserId)) {
    state.ownerUserId = ownerUserId;
    state.roles[ownerUserId] = "owner";
    state.members[ownerUserId] = {
      ...(state.members[ownerUserId] || {}),
      userId: ownerUserId,
      displayName: normalizeDisplayName(args.ownerDisplayName) || state.members[ownerUserId]?.displayName,
      role: "owner",
      status: "active",
      joinedAt: state.members[ownerUserId]?.joinedAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    touchState(state);
  }

  return state;
}

export function getGroupModerationState(groupId?: string | null) {
  const safeId = normalizeId(groupId);
  if (!safeId) return null;
  return ensureState(safeId);
}

export function updateGroupModerationRules(
  groupId: string,
  patch: Partial<GroupModerationRules>,
) {
  const state = ensureState(groupId);
  const nextBlacklist = Array.isArray(patch.blacklist)
    ? Array.from(new Set(patch.blacklist.map((item) => normalizeEntry(item)).filter(Boolean)))
    : state.rules.blacklist;

  state.rules = {
    ...state.rules,
    ...patch,
    blacklist: nextBlacklist,
  };
  return touchState(state);
}

export function setGroupRole(groupId: string, userId: string, role: GroupRole, displayName?: string | null) {
  const safeGroupId = normalizeId(groupId);
  const safeUserId = normalizeId(userId);
  if (!safeGroupId || !safeUserId) return null;

  const state = ensureState(safeGroupId);
  state.roles[safeUserId] = role;
  if (role === "owner") {
    state.ownerUserId = safeUserId;
  }
  const existingMember = state.members[safeUserId];
  state.members[safeUserId] = {
    ...(existingMember || {}),
    userId: safeUserId,
    displayName: normalizeDisplayName(displayName) || existingMember?.displayName,
    role,
    status: existingMember?.status === "invited" || existingMember?.status === "pending" ? existingMember.status : "active",
    joinedAt: existingMember?.joinedAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  return touchState(state);
}

export function resolveGroupRole(groupId?: string | null, userId?: string | null): GroupRole {
  const state = getGroupModerationState(groupId);
  const safeUserId = normalizeId(userId);
  if (!state || !safeUserId) return "member";
  if (state.ownerUserId && state.ownerUserId === safeUserId) return "owner";
  return state.roles[safeUserId] || state.members[safeUserId]?.role || "member";
}

export function isGroupOwner(groupId?: string | null, userId?: string | null) {
  return resolveGroupRole(groupId, userId) === "owner";
}

export function canInviteToGroup(groupId?: string | null, userId?: string | null) {
  const state = getGroupModerationState(groupId);
  if (!state) return false;
  const role = resolveGroupRole(groupId, userId);
  if (role === "owner" || role === "admin") return true;
  return !state.rules.adminOnlyInvites;
}

export function listGroupMembers(groupId?: string | null, statuses?: GroupMemberStatus[]) {
  const state = getGroupModerationState(groupId);
  if (!state) return [];
  const allowed = statuses?.length ? new Set(statuses) : null;
  return Object.values(state.members)
    .filter((member) => member.userId && member.status !== "removed")
    .filter((member) => (allowed ? allowed.has(member.status) : member.status === "active"))
    .sort((first, second) => {
      const rank: Record<GroupRole, number> = { owner: 0, admin: 1, member: 2 };
      const roleRank = rank[first.role] - rank[second.role];
      if (roleRank !== 0) return roleRank;
      return (first.displayName || first.userId).localeCompare(second.displayName || second.userId);
    });
}

export function upsertGroupMember(args: {
  groupId: string;
  userId: string;
  displayName?: string | null;
  role?: GroupRole;
  status?: GroupMemberStatus;
  invitedByUserId?: string | null;
}) {
  const groupId = normalizeId(args.groupId);
  const userId = normalizeId(args.userId);
  if (!groupId || !userId) return null;

  const state = ensureState(groupId);
  const existing = state.members[userId];
  const role = args.role || existing?.role || state.roles[userId] || "member";
  const status = args.status || existing?.status || "active";

  if (status !== "pending" && status !== "invited") {
    state.roles[userId] = role;
  }

  if (role === "owner") {
    state.ownerUserId = userId;
    state.roles[userId] = "owner";
  }

  state.members[userId] = {
    ...(existing || {}),
    userId,
    displayName: normalizeDisplayName(args.displayName) || existing?.displayName,
    role,
    status,
    invitedByUserId: normalizeId(args.invitedByUserId) || existing?.invitedByUserId,
    joinedAt: status === "active" ? existing?.joinedAt || new Date().toISOString() : existing?.joinedAt,
    requestedAt: status === "pending" ? existing?.requestedAt || new Date().toISOString() : existing?.requestedAt,
    updatedAt: new Date().toISOString(),
  };

  return touchState(state);
}

export function inviteGroupMember(args: {
  groupId: string;
  userId: string;
  displayName?: string | null;
  invitedByUserId?: string | null;
}) {
  return upsertGroupMember({
    groupId: args.groupId,
    userId: args.userId,
    displayName: args.displayName,
    role: "member",
    status: "invited",
    invitedByUserId: args.invitedByUserId,
  });
}

export function activateGroupMember(args: {
  groupId: string;
  userId: string;
  displayName?: string | null;
  role?: GroupRole;
}) {
  return upsertGroupMember({
    groupId: args.groupId,
    userId: args.userId,
    displayName: args.displayName,
    role: args.role || "member",
    status: "active",
  });
}

export function removeGroupMember(groupId: string, userId: string) {
  const safeGroupId = normalizeId(groupId);
  const safeUserId = normalizeId(userId);
  if (!safeGroupId || !safeUserId) return null;

  const state = ensureState(safeGroupId);
  if (state.ownerUserId === safeUserId) return state;

  delete state.roles[safeUserId];
  if (state.members[safeUserId]) {
    state.members[safeUserId] = {
      ...state.members[safeUserId],
      role: "member",
      status: "removed",
      updatedAt: new Date().toISOString(),
    };
  }
  return touchState(state);
}

export function createGroupJoinRequest(args: {
  groupId: string;
  userId: string;
  displayName?: string | null;
}) {
  return upsertGroupMember({
    groupId: args.groupId,
    userId: args.userId,
    displayName: args.displayName,
    role: "member",
    status: "pending",
  });
}

export function approveGroupJoinRequest(groupId: string, userId: string) {
  const state = getGroupModerationState(groupId);
  const existing = state?.members[normalizeId(userId)];
  return activateGroupMember({
    groupId,
    userId,
    displayName: existing?.displayName,
    role: existing?.role === "admin" || existing?.role === "owner" ? existing.role : "member",
  });
}

export function rejectGroupJoinRequest(groupId: string, userId: string) {
  return removeGroupMember(groupId, userId);
}

export function addGroupBlacklistEntry(groupId: string, entry: string) {
  const state = ensureState(groupId);
  const normalized = normalizeEntry(entry);
  if (!normalized) return state;
  if (!state.rules.blacklist.includes(normalized)) {
    state.rules.blacklist = [...state.rules.blacklist, normalized];
    return touchState(state);
  }
  return state;
}

export function removeGroupBlacklistEntry(groupId: string, entry: string) {
  const state = ensureState(groupId);
  const normalized = normalizeEntry(entry);
  state.rules.blacklist = state.rules.blacklist.filter((item) => normalizeEntry(item) !== normalized);
  return touchState(state);
}

export function getGroupInviteLink(groupId?: string | null) {
  const state = getGroupModerationState(groupId);
  return state?.inviteLink || buildInviteLink(normalizeId(groupId) || "group");
}

export function regenerateGroupInviteLink(groupId?: string | null) {
  const safeGroupId = normalizeId(groupId);
  if (!safeGroupId) return buildInviteLink("group", createInviteToken("group"));
  const state = ensureState(safeGroupId);
  state.inviteLink = buildInviteLink(safeGroupId, createInviteToken(safeGroupId));
  touchState(state);
  return state.inviteLink;
}

export function isUserBlacklistedForGroup(
  groupId?: string | null,
  value?: string | null,
) {
  const state = getGroupModerationState(groupId);
  const normalized = normalizeEntry(value);
  if (!state || !normalized) return false;
  return state.rules.blacklist.some((item) => normalizeEntry(item) === normalized);
}

function hasExternalLink(text: string) {
  return /(https?:\/\/|www\.|t\.me\/|telegram\.me\/|instagram\.com\/|facebook\.com\/|wa\.me\/|whatsapp\.com\/|youtube\.com\/|youtu\.be\/)/i.test(text);
}

function looksLikeAdText(text: string) {
  return /(buy now|sale|discount|promo|promotion|advert|advertising|marketing|catalog|catalogue|buklet|booklet|brochure|offer|limited deal|subscribe now|shop now|price list|coupon|скидк|акция|реклам|буклет|каталог|распродаж|промо|chegirma|aksiya|reklama|buklet|katalog|sotib oling)/i.test(text);
}

export function shouldRestrictGroupOutgoingMessage(args: {
  groupId: string;
  userId?: string | null;
  kind?: string | null;
  text?: string | null;
  previewTitle?: string | null;
  previewSubtitle?: string | null;
  fileLabel?: string | null;
}) {
  const state = getGroupModerationState(args.groupId);
  if (!state) return { blocked: false as const };

  const role = resolveGroupRole(args.groupId, args.userId);
  const text = [args.text, args.previewTitle, args.previewSubtitle, args.fileLabel]
    .map((item) => String(item ?? "").trim())
    .filter(Boolean)
    .join(" ");
  const kind = String(args.kind ?? "").trim().toLowerCase();

  if (isUserBlacklistedForGroup(args.groupId, args.userId)) {
    return { blocked: true as const, code: "blacklist" as const };
  }

  const isMediaLike = ["image", "video", "document", "audio", "contact", "location"].includes(kind);

  if (role === "member" && state.rules.adminOnlyMessaging && kind !== "reaction" && kind !== "emoji" && kind !== "gift") {
    return { blocked: true as const, code: "admin_only_messaging" as const };
  }

  if (role === "member" && state.rules.adminOnlyMedia && isMediaLike) {
    return { blocked: true as const, code: "admin_only_media" as const };
  }

  if (state.rules.autoDeleteAds && looksLikeAdText(text)) {
    return { blocked: true as const, code: "ads_blocked" as const };
  }

  if ((state.rules.autoDeleteLinks || state.rules.autoDeleteAds) && hasExternalLink(text)) {
    return { blocked: true as const, code: "links_blocked" as const };
  }

  return { blocked: false as const };
}

export function shouldHideIncomingGroupMessage(args: {
  groupId: string;
  senderUserId?: string | null;
  text?: string | null;
  previewTitle?: string | null;
  previewSubtitle?: string | null;
  fileLabel?: string | null;
}) {
  const state = getGroupModerationState(args.groupId);
  if (!state) return false;

  if (isUserBlacklistedForGroup(args.groupId, args.senderUserId)) {
    return true;
  }

  const text = [args.text, args.previewTitle, args.previewSubtitle, args.fileLabel]
    .map((item) => String(item ?? "").trim())
    .filter(Boolean)
    .join(" ");

  if (state.rules.autoDeleteAds && looksLikeAdText(text)) {
    return true;
  }

  if ((state.rules.autoDeleteLinks || state.rules.autoDeleteAds) && hasExternalLink(text)) {
    return true;
  }

  return false;
}
