import { appStorage } from "../../../shared/storage/app-storage";

export type PrivateChatLockMode = "none" | "pin" | "biometric" | "pin_or_biometric";
export type PrivateChatSafetyMode = "standard" | "strict";
export type PrivateChatDisappearingTimer =
  | "off"
  | "30_seconds"
  | "1_minute"
  | "5_minutes"
  | "1_hour"
  | "1_day"
  | "7_days";

export type PrivateChatProfile = {
  chatId: string;
  muted?: boolean;
  pinned?: boolean;
  unreadCount?: number;
  hiddenFromMain?: boolean;
  hiddenAt?: string | null;
  hiddenLockMode?: PrivateChatLockMode;
  requireUnlockOnOpen?: boolean;
  deleted?: boolean;
  deletedAt?: string | null;
  isBlocked?: boolean;
  blockedAt?: string | null;
  blockedByUserId?: string | null;
  disappearingEnabled?: boolean;
  disappearingTimer?: PrivateChatDisappearingTimer;
  contentProtectionEnabled?: boolean;
  screenshotAlertEnabled?: boolean;
  allowForwarding?: boolean;
  allowMediaSave?: boolean;
  safetyMode?: PrivateChatSafetyMode;
  lastReportedAt?: string | null;
  updatedAt?: string;
  roomType?: string;
  name?: string;
  avatarLetter?: string;
  phone?: string;
  username?: string;
  verified?: boolean;
  currentUserId?: string;
  peerUserId?: string;
  avatarUrl?: string;
  photoUrl?: string;
};

const STORAGE_KEY = "messenger_private_chat_profiles_v6";
const LEGACY_STORAGE_KEYS = ["messenger_private_chat_profiles_v5"];
let cache: Record<string, PrivateChatProfile> | null = null;

function nowIso() {
  return new Date().toISOString();
}

function normalizePhone(value?: string | null) {
  const digits = String(value ?? "").replace(/[^\d+]/g, "").trim();
  return digits || "";
}

function normalizeUsername(value?: string | null) {
  const raw = String(value ?? "").trim();
  if (!raw) return "";
  return raw.startsWith("@") ? raw : `@${raw}`;
}

function normalizeChatId(chatId: string) {
  return String(chatId || "").trim();
}

function normalizeLockMode(value: unknown): PrivateChatLockMode {
  if (value === "none" || value === "biometric" || value === "pin_or_biometric") return value;
  return "pin";
}

function normalizeSafetyMode(value: unknown): PrivateChatSafetyMode {
  return value === "strict" ? "strict" : "standard";
}

function normalizeDisappearingTimer(value: unknown): PrivateChatDisappearingTimer {
  switch (value) {
    case "30_seconds":
    case "1_minute":
    case "5_minutes":
    case "1_hour":
    case "1_day":
    case "7_days":
      return value;
    case "off":
    default:
      return "off";
  }
}

function normalizeIsoOrNull(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function safeParse(value?: string | null): Record<string, PrivateChatProfile> {
  if (!value) return {};
  try {
    const parsed = JSON.parse(value);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
    return parsed as Record<string, PrivateChatProfile>;
  } catch {
    return {};
  }
}

async function readStorageMap(key: string) {
  try {
    const raw = await Promise.resolve(appStorage.getString(key) as unknown);
    return safeParse(typeof raw === "string" ? raw : "");
  } catch {
    return {};
  }
}

function normalizeProfile(
  chatId: string,
  input?: Partial<PrivateChatProfile> | null,
): PrivateChatProfile {
  const hiddenFromMain = Boolean(input?.hiddenFromMain);
  const deleted = Boolean(input?.deleted);
  const isBlocked = Boolean(input?.isBlocked);
  const disappearingTimer = normalizeDisappearingTimer(input?.disappearingTimer);
  const disappearingEnabled = Boolean(input?.disappearingEnabled) || disappearingTimer !== "off";
  const roomType = typeof input?.roomType === "string" && input.roomType.trim() ? input.roomType.trim() : undefined;

  return {
    chatId,
    muted: Boolean(input?.muted),
    pinned: Boolean(input?.pinned),
    unreadCount:
      typeof input?.unreadCount === "number" && Number.isFinite(input.unreadCount)
        ? Math.max(0, Math.floor(input.unreadCount))
        : 0,
    hiddenFromMain,
    hiddenAt: hiddenFromMain ? normalizeIsoOrNull(input?.hiddenAt) ?? nowIso() : null,
    hiddenLockMode: normalizeLockMode(input?.hiddenLockMode),
    requireUnlockOnOpen: input?.requireUnlockOnOpen === false ? false : hiddenFromMain,
    deleted,
    deletedAt: deleted ? normalizeIsoOrNull(input?.deletedAt) ?? nowIso() : null,
    isBlocked,
    blockedAt: isBlocked ? normalizeIsoOrNull(input?.blockedAt) ?? nowIso() : null,
    blockedByUserId: isBlocked
      ? typeof input?.blockedByUserId === "string" && input.blockedByUserId.trim()
        ? input.blockedByUserId.trim()
        : null
      : null,
    disappearingEnabled,
    disappearingTimer: disappearingEnabled ? disappearingTimer === "off" ? "1_day" : disappearingTimer : "off",
    contentProtectionEnabled: input?.contentProtectionEnabled === false ? false : true,
    screenshotAlertEnabled: Boolean(input?.screenshotAlertEnabled),
    allowForwarding: input?.allowForwarding === false ? false : true,
    allowMediaSave: input?.allowMediaSave === false ? false : true,
    safetyMode: normalizeSafetyMode(input?.safetyMode),
    lastReportedAt: normalizeIsoOrNull(input?.lastReportedAt),
    updatedAt: typeof input?.updatedAt === "string" ? input.updatedAt : nowIso(),
    roomType,
    name: typeof input?.name === "string" && input.name.trim() ? input.name.trim() : undefined,
    avatarLetter: typeof input?.avatarLetter === "string" && input.avatarLetter.trim() ? input.avatarLetter.trim() : undefined,
    phone: normalizePhone(input?.phone) || undefined,
    username: normalizeUsername(input?.username) || undefined,
    verified: Boolean(input?.verified),
    currentUserId:
      typeof input?.currentUserId === "string" && input.currentUserId.trim()
        ? input.currentUserId.trim()
        : undefined,
    peerUserId:
      typeof input?.peerUserId === "string" && input.peerUserId.trim()
        ? input.peerUserId.trim()
        : undefined,
    avatarUrl:
      typeof input?.avatarUrl === "string" && input.avatarUrl.trim()
        ? input.avatarUrl.trim()
        : typeof input?.photoUrl === "string" && input.photoUrl.trim()
          ? input.photoUrl.trim()
          : undefined,
    photoUrl:
      typeof input?.photoUrl === "string" && input.photoUrl.trim()
        ? input.photoUrl.trim()
        : typeof input?.avatarUrl === "string" && input.avatarUrl.trim()
          ? input.avatarUrl.trim()
          : undefined,
  };
}

function normalizeProfileMap(input: Record<string, PrivateChatProfile>) {
  const next: Record<string, PrivateChatProfile> = {};

  Object.entries(input).forEach(([key, value]) => {
    const chatId = normalizeChatId(value?.chatId || key);
    if (!chatId) return;
    next[chatId] = normalizeProfile(chatId, value);
  });

  return next;
}

async function loadMap() {
  if (cache) return cache;

  const current = await readStorageMap(STORAGE_KEY);
  if (Object.keys(current).length > 0) {
    cache = normalizeProfileMap(current);
    return cache;
  }

  for (const legacyKey of LEGACY_STORAGE_KEYS) {
    const legacy = await readStorageMap(legacyKey);
    if (Object.keys(legacy).length > 0) {
      cache = normalizeProfileMap(legacy);
      await persistMap(cache);
      return cache;
    }
  }

  cache = {};
  return cache;
}

async function persistMap(next: Record<string, PrivateChatProfile>) {
  cache = normalizeProfileMap(next);
  try {
    await Promise.resolve(appStorage.setString(STORAGE_KEY, JSON.stringify(cache)) as unknown);
  } catch {
    // Storage failure must not block Messenger startup.
  }
}

async function mutateProfile(
  chatId: string,
  updater: (current: PrivateChatProfile) => PrivateChatProfile,
) {
  const normalizedChatId = normalizeChatId(chatId);
  if (!normalizedChatId) return undefined;

  const currentMap = await loadMap();
  const currentProfile = normalizeProfile(normalizedChatId, currentMap[normalizedChatId]);
  const nextProfile = normalizeProfile(
    normalizedChatId,
    updater({
      ...currentProfile,
      chatId: normalizedChatId,
    }),
  );

  const nextMap: Record<string, PrivateChatProfile> = {
    ...currentMap,
    [normalizedChatId]: nextProfile,
  };

  await persistMap(nextMap);
  return nextProfile;
}

export async function getPrivateChatProfileMap() {
  const currentMap = await loadMap();
  return { ...currentMap };
}

export async function getPrivateChatProfile(chatId: string) {
  const currentMap = await loadMap();
  const normalizedChatId = normalizeChatId(chatId);
  if (!normalizedChatId) return undefined;
  const current = currentMap[normalizedChatId];
  return current ? { ...current } : undefined;
}

export async function upsertPrivateChatProfile(input: PrivateChatProfile) {
  const normalizedChatId = normalizeChatId(input.chatId);
  if (!normalizedChatId) return undefined;

  const currentMap = await loadMap();
  const nextProfile = normalizeProfile(normalizedChatId, {
    ...currentMap[normalizedChatId],
    ...input,
    chatId: normalizedChatId,
    updatedAt: input.updatedAt ?? nowIso(),
  });

  const nextMap: Record<string, PrivateChatProfile> = {
    ...currentMap,
    [normalizedChatId]: nextProfile,
  };

  await persistMap(nextMap);
  return nextProfile;
}

export function isChatHiddenFromMain(profile?: Partial<PrivateChatProfile> | null) {
  return Boolean(profile?.hiddenFromMain);
}

export function isChatDeleted(profile?: Partial<PrivateChatProfile> | null) {
  return Boolean(profile?.deleted);
}

export function isChatBlocked(profile?: Partial<PrivateChatProfile> | null) {
  return Boolean(profile?.isBlocked);
}

export async function markPrivateChatRead(chatId: string) {
  return mutateProfile(chatId, (current) => ({
    ...current,
    unreadCount: 0,
    updatedAt: nowIso(),
  }));
}

export async function markPrivateChatUnread(chatId: string, unreadCount = 1) {
  return mutateProfile(chatId, (current) => ({
    ...current,
    unreadCount: Math.max(1, Math.floor(unreadCount)),
    updatedAt: nowIso(),
  }));
}

export async function incrementPrivateChatUnread(chatId: string, amount = 1) {
  return mutateProfile(chatId, (current) => ({
    ...current,
    deleted: false,
    deletedAt: null,
    unreadCount: Math.max(0, (current.unreadCount || 0) + Math.max(0, Math.floor(amount))),
    updatedAt: nowIso(),
  }));
}

export async function setPrivateChatMuted(chatId: string, muted: boolean) {
  return mutateProfile(chatId, (current) => ({
    ...current,
    muted,
    updatedAt: nowIso(),
  }));
}

export async function setPrivateChatPinned(chatId: string, pinned: boolean) {
  return mutateProfile(chatId, (current) => ({
    ...current,
    pinned,
    updatedAt: nowIso(),
  }));
}

export async function setPrivateChatHiddenFromMain(
  chatId: string,
  hiddenFromMain: boolean,
  options?: Partial<Pick<PrivateChatProfile, "hiddenLockMode" | "requireUnlockOnOpen">>,
) {
  return mutateProfile(chatId, (current) => ({
    ...current,
    hiddenFromMain,
    hiddenAt: hiddenFromMain ? current.hiddenAt ?? nowIso() : null,
    hiddenLockMode: options?.hiddenLockMode ?? current.hiddenLockMode ?? "pin",
    requireUnlockOnOpen: options?.requireUnlockOnOpen ?? (hiddenFromMain ? true : false),
    updatedAt: nowIso(),
  }));
}

export async function setPrivateChatDeleted(chatId: string, deleted: boolean) {
  return mutateProfile(chatId, (current) => ({
    ...current,
    deleted,
    deletedAt: deleted ? current.deletedAt ?? nowIso() : null,
    updatedAt: nowIso(),
  }));
}

export async function setPrivateChatBlocked(
  chatId: string,
  isBlocked: boolean,
  blockedByUserId?: string | null,
) {
  return mutateProfile(chatId, (current) => ({
    ...current,
    isBlocked,
    blockedAt: isBlocked ? current.blockedAt ?? nowIso() : null,
    blockedByUserId: isBlocked ? blockedByUserId ?? current.blockedByUserId ?? null : null,
    muted: isBlocked ? true : current.muted,
    updatedAt: nowIso(),
  }));
}

export async function setPrivateChatDisappearingTimer(
  chatId: string,
  disappearingTimer: PrivateChatDisappearingTimer,
) {
  const nextTimer = normalizeDisappearingTimer(disappearingTimer);
  return mutateProfile(chatId, (current) => ({
    ...current,
    disappearingTimer: nextTimer,
    disappearingEnabled: nextTimer !== "off",
    updatedAt: nowIso(),
  }));
}

export async function setPrivateChatSafetyMode(
  chatId: string,
  safetyMode: PrivateChatSafetyMode,
) {
  return mutateProfile(chatId, (current) => ({
    ...current,
    safetyMode: normalizeSafetyMode(safetyMode),
    updatedAt: nowIso(),
  }));
}

export async function patchPrivateChatPrivacy(
  chatId: string,
  patch: Partial<Pick<
    PrivateChatProfile,
    | "contentProtectionEnabled"
    | "screenshotAlertEnabled"
    | "allowForwarding"
    | "allowMediaSave"
    | "safetyMode"
    | "disappearingEnabled"
    | "disappearingTimer"
    | "lastReportedAt"
  >>,
) {
  return mutateProfile(chatId, (current) => ({
    ...current,
    ...patch,
    updatedAt: nowIso(),
  }));
}
