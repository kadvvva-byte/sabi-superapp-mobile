import AsyncStorage from "@react-native-async-storage/async-storage";

import type { ProfileKernelSessionSnapshot } from "../session/types";
import {
  EMPTY_BOT_PROFILE_PREVIEW,
  EMPTY_CHANNEL_PROFILE_PREVIEW,
  EMPTY_GROUP_PROFILE_PREVIEW,
  EMPTY_PROFILE_COMPLETE_DRAFT,
  type BotProfilePreview,
  type ChannelProfilePreview,
  type GroupProfilePreview,
  type ProfileCompleteDraft,
  type ProfileKernelAutoDeleteState,
  type ProfileKernelDevicesState,
  type ProfileKernelEmailChangeState,
  type ProfileKernelEntityCollectionState,
  type ProfileKernelPhoneChangeState,
  type ProfileKernelPreferencesState,
  type ProfileKernelPrivacyRow,
  type ProfileKernelQrState,
  type ProfileKernelSecurityState,
  type ProfileKernelState,
  type ProfileLinkItem,
  type ProfileMediaItem,
  type ProfilePhotoEditState,
  type ProfilePersonRule,
  type ProfileVoiceNoteItem,
  type PublicProfileDraft,
  type UnifiedAccountProfileSnapshot,
} from "../core/types";
import {
  addProfileKernelLink,
  addProfileKernelPhoto,
  addProfileKernelShortVideo,
  addProfileKernelVoiceNote,
  bindProfileKernelSession,
  clearProfileKernelBotPreview,
  clearProfileKernelChannelPreview,
  clearProfileKernelCompleteDraft,
  clearProfileKernelGroupPreview,
  getProfileKernelState,
  hydrateProfileKernelState,
  incrementProfileKernelReaction,
  removeProfileKernelLink,
  removeProfileKernelPhoto,
  removeProfileKernelShortVideo,
  removeProfileKernelVoiceNote,
  resetProfileKernelStore,
  setProfileKernelAccount,
  setProfileKernelAutoDelete,
  setProfileKernelAvatar,
  setProfileKernelBlockedList,
  setProfileKernelBotPreview,
  setProfileKernelBotProfiles,
  setProfileKernelChannelPreview,
  setProfileKernelChannelProfiles,
  setProfileKernelCompleteDraft,
  setProfileKernelCover,
  setProfileKernelDevices,
  setProfileKernelEmailChange,
  setProfileKernelGiftsCount,
  setProfileKernelGroupPreview,
  setProfileKernelGroupProfiles,
  setProfileKernelLanguageCode,
  setProfileKernelLastError,
  setProfileKernelLikesCount,
  setProfileKernelLinks,
  setProfileKernelPhoneChange,
  setProfileKernelPhotos,
  setProfileKernelPreferences,
  setProfileKernelPrivacyDetailConfigs,
  setProfileKernelPrivacyRows,
  setProfileKernelPublicProfile,
  setProfileKernelQr,
  setProfileKernelReactionCounts,
  setProfileKernelReady,
  setProfileKernelRuntimeStatus,
  setProfileKernelSecurity,
  setProfileKernelShortVideos,
  setProfileKernelTrustedList,
  setProfileKernelVoiceNotes,
  updateProfileKernelPhoto,
} from "../core/store";
import type {
  ProfileKernelRuntimeConfig,
  ProfileKernelRuntimeExternalSnapshot,
  ProfileKernelStorageAdapter,
} from "./types";
import {
  PROFILE_APP_PREFERENCES_DEFAULTS,
  PROFILE_BLOCKED_LIST,
  PROFILE_DEVICE_SESSIONS,
  PROFILE_EMAIL_CHANGE_STATE,
  PROFILE_LANGUAGE_DEFAULTS,
  PROFILE_PHONE_CHANGE_STATE,
  PROFILE_QR_STATE,
  PROFILE_SECURITY_DEFAULTS,
  PROFILE_TRUSTED_LIST,
} from "../../../../modules/profile/data/profile";
import {
  PRIVACY_DETAIL_CONFIGS,
  PRIVACY_SECURITY_ROWS,
  PRIVACY_VISIBILITY_ROWS,
  type PrivacyDetailConfig,
} from "../../../../modules/profile/data/privacy";

type Runtime = {
  configure(config: ProfileKernelRuntimeConfig): void;
  bindSession(session: ProfileKernelSessionSnapshot): void;
  hydrate(): Promise<ProfileKernelState>;
  refresh(): Promise<ProfileKernelState>;
  updateProfile(payload: Partial<UnifiedAccountProfileSnapshot>): Promise<ProfileKernelState>;
  updatePublicProfile(payload: Partial<PublicProfileDraft>): Promise<ProfileKernelState>;
  updateDraft(payload: Partial<ProfileCompleteDraft>): Promise<ProfileKernelState>;
  clearDraft(): Promise<ProfileKernelState>;
  setAvatar(uri: string | null): Promise<ProfileKernelState>;
  setCover(uri: string | null): Promise<ProfileKernelState>;
  addPhoto(item: Omit<ProfileMediaItem, "type">): Promise<ProfileKernelState>;
  updatePhotoEdit(photoId: string, edit: ProfilePhotoEditState): Promise<ProfileKernelState>;
  removePhoto(photoId: string): Promise<ProfileKernelState>;
  addShortVideo(item: Omit<ProfileMediaItem, "type">): Promise<ProfileKernelState>;
  removeShortVideo(videoId: string): Promise<ProfileKernelState>;
  addLink(url: string, label?: string): Promise<ProfileKernelState>;
  removeLink(linkId: string): Promise<ProfileKernelState>;
  addReaction(emoji: string, amount?: number): Promise<ProfileKernelState>;
  setReactionCount(emoji: string, value: number): Promise<ProfileKernelState>;
  addVoiceNote(note: ProfileVoiceNoteItem): Promise<ProfileKernelState>;
  removeVoiceNote(noteId: string): Promise<ProfileKernelState>;
  setLikesCount(value: number): Promise<ProfileKernelState>;
  setGiftsCount(value: number): Promise<ProfileKernelState>;
  saveGroupPreview(payload: Partial<GroupProfilePreview> | null): Promise<ProfileKernelState>;
  saveChannelPreview(payload: Partial<ChannelProfilePreview> | null): Promise<ProfileKernelState>;
  saveBotPreview(payload: Partial<BotProfilePreview> | null): Promise<ProfileKernelState>;
  saveGroupProfiles(payload: { items: Record<string, unknown>[]; selectedId: string | null }): Promise<ProfileKernelState>;
  saveChannelProfiles(payload: { items: Record<string, unknown>[]; selectedId: string | null }): Promise<ProfileKernelState>;
  saveBotProfiles(payload: { items: Record<string, unknown>[]; selectedId: string | null }): Promise<ProfileKernelState>;
  updateQr(payload: Partial<ProfileKernelQrState>): Promise<ProfileKernelState>;
  updateSecurity(payload: Partial<ProfileKernelSecurityState>): Promise<ProfileKernelState>;
  updateEmailChange(payload: Partial<ProfileKernelEmailChangeState>): Promise<ProfileKernelState>;
  updatePhoneChange(payload: Partial<ProfileKernelPhoneChangeState>): Promise<ProfileKernelState>;
  setTrustedList(payload: ProfilePersonRule[]): Promise<ProfileKernelState>;
  setBlockedList(payload: ProfilePersonRule[]): Promise<ProfileKernelState>;
  moveTrustedToBlocked(personId: string): Promise<ProfileKernelState>;
  restoreBlockedToTrusted(personId: string): Promise<ProfileKernelState>;
  removeBlockedPerson(personId: string): Promise<ProfileKernelState>;
  updatePreferences(payload: Partial<ProfileKernelPreferencesState>): Promise<ProfileKernelState>;
  updateLanguageCode(code: string): Promise<ProfileKernelState>;
  setDevices(payload: ProfileKernelDevicesState): Promise<ProfileKernelState>;
  revokeDeviceSession(id: string): Promise<ProfileKernelState>;
  endAllOtherSessions(): Promise<ProfileKernelState>;
  updateSessionTimeout(value: string): Promise<ProfileKernelState>;
  updateAutoDelete(payload: Partial<ProfileKernelAutoDeleteState>): Promise<ProfileKernelState>;
  signOut(): Promise<ProfileKernelState>;
  deleteAccount(): Promise<ProfileKernelState>;
};

const KERNEL_PROFILE_STATE_KEY = "sabi.kernel.profile.state.v2";
const LEGACY_KERNEL_PROFILE_STATE_KEY = "sabi.kernel.profile.state.v1";
const PUBLIC_PROFILE_INFO_STORAGE_KEY = "sabi.profile.public.info.v1";
const LEGACY_UNIFIED_ACCOUNT_STORAGE_KEY = "sabi_unified_account_profile_v1";
const UNIFIED_ACCOUNT_STORAGE_KEY = "sabi_unified_account_profile_cache_v2";
const PROFILE_DRAFT_STORAGE_KEY = "sabi_profile_complete_draft_v1";
const PROFILE_GROUP_STORAGE_KEYS = [
  "sabi.profile.group.settings.v4",
  "sabi.profile.group.settings.v3",
  "sabi.profile.group.settings.v1",
];
const PROFILE_CHANNEL_STORAGE_KEYS = ["sabi.profile.channel.settings.v1"];
const PROFILE_BOT_STORAGE_KEYS = ["sabi.profile.bot.settings.v1"];

function normalizeString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeNullableString(value: unknown): string | null {
  const normalized = normalizeString(value);
  return normalized ? normalized : null;
}

function toNumber(value: unknown): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function toBoolean(value: unknown): boolean {
  return Boolean(value);
}

function buildId(prefix: string) {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function parseJson(value: string | null) {
  if (!value) return null;
  try { return JSON.parse(value) as unknown; } catch { return null; }
}

function getBoundProfileUserId(): string {
  return normalizeString(getProfileKernelState().session.currentUserId);
}

function scopedStorageKey(key: string): string {
  const userId = getBoundProfileUserId();
  return userId ? `${key}:${userId}` : key;
}

async function readScopedJson(
  storage: ProfileKernelStorageAdapter,
  key: string,
  options?: { allowGlobalFallback?: boolean },
) {
  const userId = getBoundProfileUserId();
  const scopedValue = await storage.getItem(scopedStorageKey(key));
  if (scopedValue != null) return parseJson(scopedValue);

  if (!userId || options?.allowGlobalFallback === true) {
    return parseJson(await storage.getItem(key));
  }

  return null;
}

async function setScopedItem(
  storage: ProfileKernelStorageAdapter,
  key: string,
  value: string,
) {
  await storage.setItem(scopedStorageKey(key), value);
}

async function removeScopedItem(storage: ProfileKernelStorageAdapter, key: string) {
  await storage.removeItem(scopedStorageKey(key));
}

async function readFirstAvailable(storage: ProfileKernelStorageAdapter, keys: string[]) {
  for (const key of keys) {
    const value = await storage.getItem(key);
    if (value != null) return value;
  }
  return null;
}

function selectPreviewFromCollection<T extends Record<string, unknown>>(raw: unknown, collectionKey: string, selectedIdKey: string, idKey: string): T | null {
  if (!raw || typeof raw !== "object") return null;
  const record = raw as Record<string, unknown>;
  const collection = Array.isArray(record[collectionKey]) ? (record[collectionKey] as T[]) : null;
  if (!collection || collection.length === 0) return record as T;
  const selectedId = normalizeString(record[selectedIdKey]);
  if (selectedId) {
    const selected = collection.find((item) => normalizeString((item as Record<string, unknown>)[idKey]) === selectedId);
    if (selected) return selected;
  }
  return collection[0] ?? null;
}

function clonePrivacyDetailConfigs(input: PrivacyDetailConfig[]): PrivacyDetailConfig[] {
  return input.map((item) => ({
    ...item,
    preview: item.preview ? { ...item.preview } : item.preview,
    topToggles: item.topToggles?.map((value) => ({ ...value })),
    groups: item.groups.map((group) => ({ ...group, options: group.options.map((option) => ({ ...option })) })),
    exceptions: item.exceptions?.map((value) => ({ ...value })),
    toggles: item.toggles?.map((value) => ({ ...value })),
  }));
}

function normalizeAccount(raw?: Partial<UnifiedAccountProfileSnapshot> | Record<string, unknown> | null): UnifiedAccountProfileSnapshot {
  const record = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  const firstName = normalizeString(record.firstName ?? (raw as any)?.firstName);
  const lastName = normalizeString(record.lastName ?? (raw as any)?.lastName);
  const username = normalizeString(record.username ?? (raw as any)?.username);
  const fullName = normalizeString(record.fullName) || [firstName, lastName].filter(Boolean).join(" ").trim();
  return {
    userId: normalizeString(record.userId ?? (raw as any)?.userId),
    sabiDisplayId: normalizeString(record.sabiDisplayId ?? record.sabiId ?? (raw as any)?.sabiDisplayId),
    phone: normalizeString(record.phone ?? (raw as any)?.phone),
    email: normalizeString(record.email ?? (raw as any)?.email),
    firstName,
    lastName,
    username,
    fullName,
    bio: normalizeString(record.bio ?? (raw as any)?.bio),
    subtitle: normalizeString(record.subtitle ?? (raw as any)?.subtitle),
    birthday: normalizeString(record.birthday ?? (raw as any)?.birthday),
    avatarUri: normalizeNullableString(record.avatarUri ?? (raw as any)?.avatarUri),
    coverUri: normalizeNullableString(record.coverUri ?? (raw as any)?.coverUri),
    avatarLetter: normalizeString(record.avatarLetter),
    verificationStatus: ["verified", "pending", "rejected"].includes(normalizeString(record.verificationStatus)) ? (normalizeString(record.verificationStatus) as any) : "unverified",
    profileCompleted: toBoolean(record.profileCompleted ?? (raw as any)?.profileCompleted),
    createdAt: normalizeNullableString(record.createdAt ?? (raw as any)?.createdAt),
    updatedAt: normalizeNullableString(record.updatedAt ?? (raw as any)?.updatedAt),
    raw: record,
  };
}

function normalizePublicProfile(raw?: Partial<PublicProfileDraft> | null): PublicProfileDraft {
  return {
    publicName: normalizeString(raw?.publicName),
    publicUsername: normalizeString(raw?.publicUsername),
    publicBio: normalizeString(raw?.publicBio),
    publicSubtitle: normalizeString(raw?.publicSubtitle),
  };
}

function normalizeCompleteDraft(raw?: Partial<ProfileCompleteDraft> | null): ProfileCompleteDraft {
  return {
    firstName: normalizeString(raw?.firstName),
    lastName: normalizeString(raw?.lastName),
    username: normalizeString(raw?.username),
    phone: normalizeString(raw?.phone),
    userId: normalizeString(raw?.userId),
  };
}

function normalizeMediaItem(raw: unknown, type: ProfileMediaItem["type"]): ProfileMediaItem | null {
  if (!raw || typeof raw !== "object") return null;
  const record = raw as Record<string, unknown>;
  const uri = normalizeString(record.uri);
  if (!uri) return null;
  const editRaw = record.edit && typeof record.edit === "object" ? (record.edit as Record<string, unknown>) : null;
  const edit = editRaw ? { rotation: toNumber(editRaw.rotation), flipX: toBoolean(editRaw.flipX), flipY: toBoolean(editRaw.flipY), filter: (normalizeString(editRaw.filter) || "none") as ProfilePhotoEditState["filter"] } : null;
  return {
    id: normalizeString(record.id) || buildId(type),
    uri,
    type,
    createdAt: toNumber(record.createdAt) || Date.now(),
    durationMs: record.durationMs == null ? null : toNumber(record.durationMs),
    thumbnailUri: normalizeNullableString(record.thumbnailUri),
    width: record.width == null ? null : toNumber(record.width),
    height: record.height == null ? null : toNumber(record.height),
    edit,
  };
}

function normalizeMediaList(value: unknown, type: ProfileMediaItem["type"]): ProfileMediaItem[] {
  if (!Array.isArray(value)) return [];
  return value.map((item) => normalizeMediaItem(item, type)).filter((item): item is ProfileMediaItem => Boolean(item)).sort((a, b) => b.createdAt - a.createdAt);
}

function normalizeLinks(value: unknown): ProfileLinkItem[] {
  if (!Array.isArray(value)) return [];
  return value.map((item) => {
    if (!item || typeof item !== "object") return null;
    const record = item as Record<string, unknown>;
    const url = normalizeString(record.url);
    if (!url) return null;
    return { id: normalizeString(record.id) || buildId("link"), url, label: normalizeString(record.label) || url, createdAt: toNumber(record.createdAt) || Date.now() };
  }).filter((item): item is ProfileLinkItem => Boolean(item)).sort((a, b) => b.createdAt - a.createdAt);
}

function normalizeVoiceNotes(value: unknown): ProfileVoiceNoteItem[] {
  if (!Array.isArray(value)) return [];
  return value.map((item) => {
    if (!item || typeof item !== "object") return null;
    const record = item as Record<string, unknown>;
    const uri = normalizeString(record.uri);
    if (!uri) return null;
    return { id: normalizeString(record.id) || buildId("voice"), uri, durationMs: toNumber(record.durationMs), createdAt: toNumber(record.createdAt) || Date.now() };
  }).filter((item): item is ProfileVoiceNoteItem => Boolean(item)).sort((a, b) => b.createdAt - a.createdAt);
}

function normalizeReactionCounts(value: unknown): Record<string, number> {
  if (!value || typeof value !== "object") return {};
  return Object.fromEntries(Object.entries(value as Record<string, unknown>).map(([key, rawValue]) => [key, Math.max(0, toNumber(rawValue))]));
}

function normalizeGroupPreview(raw?: Partial<GroupProfilePreview> | Record<string, unknown> | null): GroupProfilePreview {
  const record = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  return {
    created: toBoolean(record.created ?? (raw as any)?.created),
    groupId: normalizeString(record.groupId ?? (raw as any)?.groupId),
    groupName: normalizeString(record.groupName ?? (raw as any)?.groupName),
    username: normalizeString(record.username ?? (raw as any)?.username),
    isPublic: toBoolean(record.isPublic ?? (raw as any)?.isPublic),
    isPublished: toBoolean(record.isPublished ?? (raw as any)?.isPublished),
    ownerUserId: normalizeString(record.ownerUserId ?? (raw as any)?.ownerUserId),
    linkedPublicationId: normalizeString(record.linkedPublicationId ?? (raw as any)?.linkedPublicationId),
    linkedChatId: normalizeString(record.linkedChatId ?? (raw as any)?.linkedChatId),
  };
}

function normalizeChannelPreview(raw?: Partial<ChannelProfilePreview> | Record<string, unknown> | null): ChannelProfilePreview {
  const record = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  return {
    created: toBoolean(record.created ?? (raw as any)?.created),
    channelId: normalizeString(record.channelId ?? (raw as any)?.channelId),
    channelName: normalizeString(record.channelName ?? (raw as any)?.channelName),
    username: normalizeString(record.username ?? (raw as any)?.username),
    isPublic: toBoolean(record.isPublic ?? (raw as any)?.isPublic),
    isPublished: toBoolean(record.isPublished ?? (raw as any)?.isPublished),
    ownerUserId: normalizeString(record.ownerUserId ?? (raw as any)?.ownerUserId),
    linkedPublicationId: normalizeString(record.linkedPublicationId ?? (raw as any)?.linkedPublicationId),
    linkedChatId: normalizeString(record.linkedChatId ?? (raw as any)?.linkedChatId),
  };
}

function normalizeBotPreview(raw?: Partial<BotProfilePreview> | Record<string, unknown> | null): BotProfilePreview {
  const record = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  return {
    created: toBoolean(record.created ?? (raw as any)?.created),
    botId: normalizeString(record.botId ?? (raw as any)?.botId),
    botName: normalizeString(record.botName ?? (raw as any)?.botName),
    username: normalizeString(record.username ?? (raw as any)?.username),
    botKind: normalizeString(record.botKind ?? (raw as any)?.botKind),
    isPublic: toBoolean(record.isPublic ?? (raw as any)?.isPublic),
    isPublished: toBoolean(record.isPublished ?? (raw as any)?.isPublished),
    ownerUserId: normalizeString(record.ownerUserId ?? (raw as any)?.ownerUserId),
    linkedChatId: normalizeString(record.linkedChatId ?? (raw as any)?.linkedChatId),
  };
}

function normalizeQr(raw?: Partial<ProfileKernelQrState> | null): ProfileKernelQrState {
  return {
    profileCode: normalizeString(raw?.profileCode),
    allowProfileQrScan: raw?.allowProfileQrScan !== false,
    allowQrShare: raw?.allowQrShare !== false,
  };
}

function normalizeSecurity(raw?: Partial<ProfileKernelSecurityState> | null): ProfileKernelSecurityState {
  return {
    biometricEnabled: toBoolean(raw?.biometricEnabled),
    appPinEnabled: toBoolean(raw?.appPinEnabled),
    twoFactorEnabled: toBoolean(raw?.twoFactorEnabled),
    trustedDeviceAlerts: raw?.trustedDeviceAlerts !== false,
    suspiciousLoginAlerts: raw?.suspiciousLoginAlerts !== false,
    sensitiveActionConfirmation: raw?.sensitiveActionConfirmation !== false,
    faceIdForPhoneChange: toBoolean(raw?.faceIdForPhoneChange),
    faceIdForEmailChange: toBoolean(raw?.faceIdForEmailChange),
    fallbackPinEnabled: toBoolean(raw?.fallbackPinEnabled),
  };
}

function normalizeEmailChange(raw?: Partial<ProfileKernelEmailChangeState> | null, fallbackEmail?: string): ProfileKernelEmailChangeState {
  return {
    currentEmail: normalizeString(raw?.currentEmail) || normalizeString(fallbackEmail),
    requiresCurrentEmailVerification: raw?.requiresCurrentEmailVerification !== false,
    requiresNewEmailVerification: raw?.requiresNewEmailVerification !== false,
  };
}

function normalizePhoneChange(raw?: Partial<ProfileKernelPhoneChangeState> | null, fallbackPhone?: string): ProfileKernelPhoneChangeState {
  return {
    currentPhone: normalizeString(raw?.currentPhone) || normalizeString(fallbackPhone),
    requiresOldPhoneVerification: raw?.requiresOldPhoneVerification !== false,
    requiresNewPhoneVerification: raw?.requiresNewPhoneVerification !== false,
  };
}

function normalizePersonList(value: ProfilePersonRule[] | unknown, fallback: ProfilePersonRule[]): ProfilePersonRule[] {
  const source = Array.isArray(value) ? value : fallback;
  return source.map((item) => ({
    id: normalizeString((item as any)?.id),
    name: normalizeString((item as any)?.name),
    username: normalizeString((item as any)?.username),
    note: normalizeString((item as any)?.note),
  })).filter((item) => item.id && item.name);
}

function normalizeEntityCollection<T extends Record<string, unknown>>(
  value: unknown,
  collectionKey: string,
  selectedKey: string,
  entityIdKey: string,
): ProfileKernelEntityCollectionState<T> {
  const source = value && typeof value === "object" ? (value as Record<string, unknown>) : null;
  const rawItems = Array.isArray(source?.[collectionKey]) ? (source?.[collectionKey] as unknown[]) : [];
  const items = rawItems.filter((item): item is T => {
    if (!item || typeof item !== "object") return false;
    const entityId = (item as Record<string, unknown>)[entityIdKey];
    return typeof entityId === "string" && entityId.trim().length > 0;
  });
  const rawSelected = source?.[selectedKey];
  const selectedId = typeof rawSelected === "string" && rawSelected.trim().length > 0
    ? rawSelected.trim()
    : (items[0] && typeof items[0][entityIdKey] === "string" ? String(items[0][entityIdKey]) : null);
  return { items: [...items], selectedId };
}

function normalizePreferences(raw?: Partial<ProfileKernelPreferencesState> | null): ProfileKernelPreferencesState {
  return {
    hapticsEnabled: raw?.hapticsEnabled !== false,
    soundEnabled: raw?.soundEnabled !== false,
    previewEnabled: raw?.previewEnabled !== false,
    compactMode: toBoolean(raw?.compactMode),
    smartInsightsEnabled: raw?.smartInsightsEnabled !== false,
  };
}

function normalizeDevices(raw?: Partial<ProfileKernelDevicesState> | null): ProfileKernelDevicesState {
  const sessions = Array.isArray(raw?.sessions)
    ? raw!.sessions.map((item) => ({
        id: normalizeString(item.id),
        title: normalizeString(item.title),
        platform: normalizeString(item.platform),
        location: normalizeString(item.location),
        lastSeen: normalizeString(item.lastSeen),
        trusted: toBoolean(item.trusted),
        web: toBoolean(item.web),
      })).filter((item) => item.id && item.title && item.platform)
    : [];
  return {
    sessionTimeout: normalizeString(raw?.sessionTimeout) || "1 year",
    sessions,
  };
}

function normalizeAutoDelete(raw?: Partial<ProfileKernelAutoDeleteState> | null): ProfileKernelAutoDeleteState {
  const preset = normalizeString(raw?.selectedPreset) as ProfileKernelAutoDeleteState["selectedPreset"] | "";
  return {
    selectedPreset: preset || "30_days",
    applyToNewChats: raw?.applyToNewChats !== false,
    applyToGroups: toBoolean(raw?.applyToGroups),
    applyToChannels: toBoolean(raw?.applyToChannels),
  };
}

async function persistState(storage: ProfileKernelStorageAdapter) {
  const current = getProfileKernelState();
  await setScopedItem(
    storage,
    KERNEL_PROFILE_STATE_KEY,
    JSON.stringify({
      account: current.account,
      publicProfile: current.publicProfile,
      completeDraft: current.completeDraft,
      avatarUri: current.avatarUri,
      coverUri: current.coverUri,
      photos: current.photos,
      shortVideos: current.shortVideos,
      links: current.links,
      reactionCounts: current.reactionCounts,
      voiceNotes: current.voiceNotes,
      likesCount: current.likesCount,
      giftsCount: current.giftsCount,
      groupPreview: current.groupPreview,
      channelPreview: current.channelPreview,
      botPreview: current.botPreview,
      qr: current.qr,
      security: current.security,
      emailChange: current.emailChange,
      phoneChange: current.phoneChange,
      trustedList: current.trustedList,
      blockedList: current.blockedList,
      preferences: current.preferences,
      languageCode: current.languageCode,
      devices: current.devices,
      autoDelete: current.autoDelete,
      privacySecurityRows: current.privacySecurityRows,
      privacyVisibilityRows: current.privacyVisibilityRows,
      privacyDetailConfigs: current.privacyDetailConfigs,
    }),
  );

  await setScopedItem(
    storage,
    UNIFIED_ACCOUNT_STORAGE_KEY,
    JSON.stringify(current.account),
  );
}

export function createProfileKernelRuntime(): Runtime {
  let config: ProfileKernelRuntimeConfig = {};

  function getStorage(): ProfileKernelStorageAdapter {
    return config.storage ?? AsyncStorage;
  }

  async function loadPersistedState() {
    const storage = getStorage();
    const hasBoundUser = Boolean(getBoundProfileUserId());
    const kernelRecord = ((await readScopedJson(storage, KERNEL_PROFILE_STATE_KEY)) ?? (!hasBoundUser ? parseJson(await storage.getItem(LEGACY_KERNEL_PROFILE_STATE_KEY)) : null)) as Record<string, unknown> | null;
    const unifiedRaw = ((await readScopedJson(storage, UNIFIED_ACCOUNT_STORAGE_KEY)) ?? (!hasBoundUser ? parseJson(await storage.getItem(LEGACY_UNIFIED_ACCOUNT_STORAGE_KEY)) : null)) as Record<string, unknown> | null;
    const publicRaw = (await readScopedJson(storage, PUBLIC_PROFILE_INFO_STORAGE_KEY)) as Record<string, unknown> | null;
    const completeDraftRaw = (await readScopedJson(storage, PROFILE_DRAFT_STORAGE_KEY)) as Record<string, unknown> | null;
    const groupRaw = selectPreviewFromCollection(parseJson(await readFirstAvailable(storage, PROFILE_GROUP_STORAGE_KEYS)), "groups", "selectedGroupId", "groupId");
    const channelRaw = selectPreviewFromCollection(parseJson(await readFirstAvailable(storage, PROFILE_CHANNEL_STORAGE_KEYS)), "channels", "selectedChannelId", "channelId");
    const botRaw = selectPreviewFromCollection(parseJson(await readFirstAvailable(storage, PROFILE_BOT_STORAGE_KEYS)), "bots", "selectedBotId", "botId");
    const external = (await config.loadExternalSnapshot?.()) as ProfileKernelRuntimeExternalSnapshot | null | undefined;

    const account = normalizeAccount(external?.account ?? unifiedRaw);
    const publicProfile = normalizePublicProfile(external?.publicProfile ?? publicRaw);
    const completeDraft = normalizeCompleteDraft(external?.completeDraft ?? completeDraftRaw);

    return {
      account,
      publicProfile,
      completeDraft,
      avatarUri: normalizeNullableString(external?.avatarUri) ?? normalizeNullableString(kernelRecord?.avatarUri) ?? account.avatarUri,
      coverUri: normalizeNullableString(external?.coverUri) ?? normalizeNullableString(kernelRecord?.coverUri) ?? account.coverUri,
      photos: normalizeMediaList(external?.photos ?? kernelRecord?.photos, "photo"),
      shortVideos: normalizeMediaList(external?.shortVideos ?? kernelRecord?.shortVideos, "video"),
      links: normalizeLinks(external?.links ?? kernelRecord?.links),
      reactionCounts: normalizeReactionCounts(external?.reactionCounts ?? kernelRecord?.reactionCounts),
      voiceNotes: normalizeVoiceNotes(external?.voiceNotes ?? kernelRecord?.voiceNotes),
      likesCount: external?.likesCount ?? toNumber(kernelRecord?.likesCount),
      giftsCount: external?.giftsCount ?? toNumber(kernelRecord?.giftsCount),
      groupPreview: external?.groupPreview ? normalizeGroupPreview(external.groupPreview) : groupRaw ? normalizeGroupPreview(groupRaw as any) : { ...EMPTY_GROUP_PROFILE_PREVIEW },
      channelPreview: external?.channelPreview ? normalizeChannelPreview(external.channelPreview) : channelRaw ? normalizeChannelPreview(channelRaw as any) : { ...EMPTY_CHANNEL_PROFILE_PREVIEW },
      botPreview: external?.botPreview ? normalizeBotPreview(external.botPreview) : botRaw ? normalizeBotPreview(botRaw as any) : { ...EMPTY_BOT_PROFILE_PREVIEW },
      groupProfiles: external?.groupProfiles ?? normalizeEntityCollection(parseJson(await readFirstAvailable(storage, PROFILE_GROUP_STORAGE_KEYS)), "groups", "selectedGroupId", "groupId"),
      channelProfiles: external?.channelProfiles ?? normalizeEntityCollection(parseJson(await readFirstAvailable(storage, PROFILE_CHANNEL_STORAGE_KEYS)), "channels", "selectedChannelId", "channelId"),
      botProfiles: external?.botProfiles ?? normalizeEntityCollection(parseJson(await readFirstAvailable(storage, PROFILE_BOT_STORAGE_KEYS)), "bots", "selectedBotId", "botId"),
      qr: normalizeQr(external?.qr ?? (kernelRecord as any)?.qr ?? PROFILE_QR_STATE),
      security: normalizeSecurity(external?.security ?? (kernelRecord as any)?.security ?? PROFILE_SECURITY_DEFAULTS),
      emailChange: normalizeEmailChange(external?.emailChange ?? (kernelRecord as any)?.emailChange ?? PROFILE_EMAIL_CHANGE_STATE, account.email),
      phoneChange: normalizePhoneChange(external?.phoneChange ?? (kernelRecord as any)?.phoneChange ?? PROFILE_PHONE_CHANGE_STATE, account.phone),
      trustedList: normalizePersonList(external?.trustedList ?? (kernelRecord as any)?.trustedList, PROFILE_TRUSTED_LIST),
      blockedList: normalizePersonList(external?.blockedList ?? (kernelRecord as any)?.blockedList, PROFILE_BLOCKED_LIST),
      preferences: normalizePreferences(external?.preferences ?? (kernelRecord as any)?.preferences ?? PROFILE_APP_PREFERENCES_DEFAULTS),
      languageCode: normalizeString(external?.languageCode ?? (kernelRecord as any)?.languageCode) || "en",
      devices: normalizeDevices(external?.devices ?? (kernelRecord as any)?.devices ?? { sessionTimeout: "1 year", sessions: PROFILE_DEVICE_SESSIONS.filter((item) => !item.current) }),
      autoDelete: normalizeAutoDelete(external?.autoDelete ?? (kernelRecord as any)?.autoDelete),
      privacySecurityRows: Array.isArray(external?.privacySecurityRows ?? (kernelRecord as any)?.privacySecurityRows) ? [...(external?.privacySecurityRows ?? (kernelRecord as any)?.privacySecurityRows)] : [...PRIVACY_SECURITY_ROWS],
      privacyVisibilityRows: Array.isArray(external?.privacyVisibilityRows ?? (kernelRecord as any)?.privacyVisibilityRows) ? [...(external?.privacyVisibilityRows ?? (kernelRecord as any)?.privacyVisibilityRows)] : [...PRIVACY_VISIBILITY_ROWS],
      privacyDetailConfigs: clonePrivacyDetailConfigs(
        Array.isArray(external?.privacyDetailConfigs ?? (kernelRecord as any)?.privacyDetailConfigs)
          ? ((external?.privacyDetailConfigs ?? (kernelRecord as any)?.privacyDetailConfigs) as PrivacyDetailConfig[])
          : Object.values(PRIVACY_DETAIL_CONFIGS),
      ),
    };
  }

  async function hydrateInternal() {
    setProfileKernelRuntimeStatus("booting");
    setProfileKernelLastError(null);
    try {
      const snapshot = await loadPersistedState();
      hydrateProfileKernelState(snapshot);
      setProfileKernelReady(true);
      setProfileKernelRuntimeStatus("ready");
      return getProfileKernelState();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Profile kernel hydrate failed";
      setProfileKernelLastError(message);
      throw error;
    }
  }

  async function persistAndReturn() {
    await persistState(getStorage());
    return getProfileKernelState();
  }

  return {
    configure(nextConfig) { config = { ...config, ...nextConfig }; },
    bindSession(session) { bindProfileKernelSession(session); },
    async hydrate() { return hydrateInternal(); },
    async refresh() { setProfileKernelRuntimeStatus("refreshing"); return hydrateInternal(); },
    async updateProfile(payload) { const account = normalizeAccount({ ...getProfileKernelState().account, ...payload }); setProfileKernelAccount(account); setProfileKernelEmailChange(normalizeEmailChange({ ...getProfileKernelState().emailChange, currentEmail: account.email }, account.email)); setProfileKernelPhoneChange(normalizePhoneChange({ ...getProfileKernelState().phoneChange, currentPhone: account.phone }, account.phone)); return persistAndReturn(); },
    async updatePublicProfile(payload) { const next = normalizePublicProfile({ ...getProfileKernelState().publicProfile, ...payload }); setProfileKernelPublicProfile(next); await setScopedItem(getStorage(), PUBLIC_PROFILE_INFO_STORAGE_KEY, JSON.stringify(next)); return persistAndReturn(); },
    async updateDraft(payload) { const next = normalizeCompleteDraft({ ...getProfileKernelState().completeDraft, ...payload }); setProfileKernelCompleteDraft(next); await setScopedItem(getStorage(), PROFILE_DRAFT_STORAGE_KEY, JSON.stringify(next)); return persistAndReturn(); },
    async clearDraft() { clearProfileKernelCompleteDraft(); await removeScopedItem(getStorage(), PROFILE_DRAFT_STORAGE_KEY); return persistAndReturn(); },
    async setAvatar(uri) { setProfileKernelAvatar(normalizeNullableString(uri)); return persistAndReturn(); },
    async setCover(uri) { setProfileKernelCover(normalizeNullableString(uri)); return persistAndReturn(); },
    async addPhoto(item) { addProfileKernelPhoto({ ...item, id: normalizeString(item.id) || buildId("photo"), uri: normalizeString(item.uri), type: "photo", createdAt: toNumber(item.createdAt) || Date.now(), durationMs: item.durationMs ?? null, thumbnailUri: normalizeNullableString(item.thumbnailUri), width: item.width ?? null, height: item.height ?? null, edit: item.edit ?? null }); return persistAndReturn(); },
    async updatePhotoEdit(photoId, edit) { const current = getProfileKernelState().photos.find((item) => item.id === photoId); if (!current) return getProfileKernelState(); updateProfileKernelPhoto({ ...current, edit }); return persistAndReturn(); },
    async removePhoto(photoId) { removeProfileKernelPhoto(photoId); return persistAndReturn(); },
    async addShortVideo(item) { addProfileKernelShortVideo({ ...item, id: normalizeString(item.id) || buildId("video"), uri: normalizeString(item.uri), type: "video", createdAt: toNumber(item.createdAt) || Date.now(), durationMs: item.durationMs ?? null, thumbnailUri: normalizeNullableString(item.thumbnailUri), width: item.width ?? null, height: item.height ?? null, edit: null }); return persistAndReturn(); },
    async removeShortVideo(videoId) { removeProfileKernelShortVideo(videoId); return persistAndReturn(); },
    async addLink(url, label) { addProfileKernelLink({ id: buildId("link"), url: normalizeString(url), label: normalizeString(label) || normalizeString(url), createdAt: Date.now() }); return persistAndReturn(); },
    async removeLink(linkId) { removeProfileKernelLink(linkId); return persistAndReturn(); },
    async addReaction(emoji, amount = 1) { incrementProfileKernelReaction(emoji, amount); return persistAndReturn(); },
    async setReactionCount(emoji, value) { setProfileKernelReactionCounts({ ...getProfileKernelState().reactionCounts, [emoji]: Math.max(0, Number(value) || 0) }); return persistAndReturn(); },
    async addVoiceNote(note) { addProfileKernelVoiceNote({ ...note, id: normalizeString(note.id) || buildId("voice"), uri: normalizeString(note.uri), durationMs: toNumber(note.durationMs), createdAt: toNumber(note.createdAt) || Date.now() }); return persistAndReturn(); },
    async removeVoiceNote(noteId) { removeProfileKernelVoiceNote(noteId); return persistAndReturn(); },
    async setLikesCount(value) { setProfileKernelLikesCount(value); return persistAndReturn(); },
    async setGiftsCount(value) { setProfileKernelGiftsCount(value); return persistAndReturn(); },
    async saveGroupPreview(payload) { if (!payload) clearProfileKernelGroupPreview(); else setProfileKernelGroupPreview(normalizeGroupPreview({ ...getProfileKernelState().groupPreview, ...payload })); return persistAndReturn(); },
    async saveChannelPreview(payload) { if (!payload) clearProfileKernelChannelPreview(); else setProfileKernelChannelPreview(normalizeChannelPreview({ ...getProfileKernelState().channelPreview, ...payload })); return persistAndReturn(); },
    async saveBotPreview(payload) { if (!payload) clearProfileKernelBotPreview(); else setProfileKernelBotPreview(normalizeBotPreview({ ...getProfileKernelState().botPreview, ...payload })); return persistAndReturn(); },
    async saveGroupProfiles(payload) { setProfileKernelGroupProfiles({ items: Array.isArray(payload?.items) ? payload.items : [], selectedId: typeof payload?.selectedId === "string" ? payload.selectedId : null }); return persistAndReturn(); },
    async saveChannelProfiles(payload) { setProfileKernelChannelProfiles({ items: Array.isArray(payload?.items) ? payload.items : [], selectedId: typeof payload?.selectedId === "string" ? payload.selectedId : null }); return persistAndReturn(); },
    async saveBotProfiles(payload) { setProfileKernelBotProfiles({ items: Array.isArray(payload?.items) ? payload.items : [], selectedId: typeof payload?.selectedId === "string" ? payload.selectedId : null }); return persistAndReturn(); },
    async updateQr(payload) { setProfileKernelQr(normalizeQr({ ...getProfileKernelState().qr, ...payload })); return persistAndReturn(); },
    async updateSecurity(payload) { setProfileKernelSecurity(normalizeSecurity({ ...getProfileKernelState().security, ...payload })); return persistAndReturn(); },
    async updateEmailChange(payload) { const next = normalizeEmailChange({ ...getProfileKernelState().emailChange, ...payload }, getProfileKernelState().account.email); setProfileKernelEmailChange(next); if (payload.currentEmail) setProfileKernelAccount(normalizeAccount({ ...getProfileKernelState().account, email: payload.currentEmail })); return persistAndReturn(); },
    async updatePhoneChange(payload) { const next = normalizePhoneChange({ ...getProfileKernelState().phoneChange, ...payload }, getProfileKernelState().account.phone); setProfileKernelPhoneChange(next); if (payload.currentPhone) setProfileKernelAccount(normalizeAccount({ ...getProfileKernelState().account, phone: payload.currentPhone })); return persistAndReturn(); },
    async setTrustedList(payload) { setProfileKernelTrustedList(normalizePersonList(payload, [])); return persistAndReturn(); },
    async setBlockedList(payload) { setProfileKernelBlockedList(normalizePersonList(payload, [])); return persistAndReturn(); },
    async moveTrustedToBlocked(personId) { const current = getProfileKernelState(); const person = current.trustedList.find((item) => item.id === personId); if (!person) return current; setProfileKernelTrustedList(current.trustedList.filter((item) => item.id !== personId)); if (!current.blockedList.some((item) => item.username === person.username)) { setProfileKernelBlockedList([...current.blockedList, { id: `blocked-from-trusted-${person.id}`, name: person.name, username: person.username, note: person.note }]); } return persistAndReturn(); },
    async restoreBlockedToTrusted(personId) { const current = getProfileKernelState(); const person = current.blockedList.find((item) => item.id === personId); if (!person) return current; setProfileKernelBlockedList(current.blockedList.filter((item) => item.id !== personId)); if (!current.trustedList.some((item) => item.username === person.username)) { setProfileKernelTrustedList([...current.trustedList, { id: `trusted-from-blocked-${person.id}`, name: person.name, username: person.username, note: person.note }]); } return persistAndReturn(); },
    async removeBlockedPerson(personId) { setProfileKernelBlockedList(getProfileKernelState().blockedList.filter((item) => item.id !== personId)); return persistAndReturn(); },
    async updatePreferences(payload) { setProfileKernelPreferences(normalizePreferences({ ...getProfileKernelState().preferences, ...payload })); return persistAndReturn(); },
    async updateLanguageCode(code) { setProfileKernelLanguageCode(normalizeString(code) || "en"); return persistAndReturn(); },
    async setDevices(payload) { setProfileKernelDevices(normalizeDevices(payload)); return persistAndReturn(); },
    async revokeDeviceSession(id) { setProfileKernelDevices({ ...getProfileKernelState().devices, sessions: getProfileKernelState().devices.sessions.filter((item) => item.id !== id) }); return persistAndReturn(); },
    async endAllOtherSessions() { setProfileKernelDevices({ ...getProfileKernelState().devices, sessions: [] }); return persistAndReturn(); },
    async updateSessionTimeout(value) { setProfileKernelDevices({ ...getProfileKernelState().devices, sessionTimeout: normalizeString(value) || "1 year" }); return persistAndReturn(); },
    async updateAutoDelete(payload) { setProfileKernelAutoDelete(normalizeAutoDelete({ ...getProfileKernelState().autoDelete, ...payload })); return persistAndReturn(); },
    async signOut() { await config.onSignOut?.(); resetProfileKernelStore(); return getProfileKernelState(); },
    async deleteAccount() { await config.onDeleteAccount?.(); resetProfileKernelStore(); return getProfileKernelState(); },
  };
}
