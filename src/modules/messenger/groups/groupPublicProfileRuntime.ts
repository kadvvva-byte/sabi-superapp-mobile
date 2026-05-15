import AsyncStorage from "@react-native-async-storage/async-storage";

export type GroupPublicMediaItem = {
  id: string;
  uri: string;
  kind: "photo" | "video";
  thumbnailUri?: string;
  mediaUri?: string;
  mimeType?: string;
  views?: number;
  duration?: string;
  durationMs?: number;
  liked?: boolean;
};

export type GroupPublicGiftItem = {
  id: string;
  title?: string;
  emoji?: string;
  imageUri?: string;
};

export type GroupPublicProfileSnapshot = {
  chatId: string;
  displayName?: string;
  publicName?: string;
  username?: string;
  publicUsername?: string;
  bio?: string;
  publicBio?: string;
  subtitle?: string;
  publicSubtitle?: string;
  phone?: string;
  avatarUri: string;
  coverUri: string;
  publicationPhotos: GroupPublicMediaItem[];
  publicationVideos: GroupPublicMediaItem[];
  publicGifts: GroupPublicGiftItem[];
  likesCount: number;
  publicGiftsCount: number;
  aliases: string[];
  updatedAt: number;
};

type PersistedGroupPublicProfileState = {
  version: 2;
  profiles: Record<string, GroupPublicProfileSnapshot>;
  aliases: Record<string, string>;
};

const STORAGE_KEY = "sabi.messenger.groupPublicProfileSurface.v2";
const GROUP_PUBLIC_LOCAL_GROUP_COLLECTION_STORAGE_KEY = "sabi.profile.groups.collection.v1";
const LEGACY_STORAGE_KEYS = ["sabi.messenger.groupPublicProfileSurface.v1"];

const EMPTY_GROUP_PUBLIC_PROFILE: GroupPublicProfileSnapshot = {
  chatId: "",
  displayName: undefined,
  publicName: undefined,
  username: undefined,
  publicUsername: undefined,
  bio: undefined,
  publicBio: undefined,
  subtitle: undefined,
  publicSubtitle: undefined,
  phone: undefined,
  avatarUri: "",
  coverUri: "",
  publicationPhotos: [],
  publicationVideos: [],
  publicGifts: [],
  likesCount: 0,
  publicGiftsCount: 0,
  aliases: [],
  updatedAt: 0,
};

let hydrated = false;
let state: PersistedGroupPublicProfileState = {
  version: 2,
  profiles: {},
  aliases: {},
};

const listeners = new Set<() => void>();

function notifyGroupPublicProfiles() {
  listeners.forEach((listener) => listener());
}

function normalizeString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeIdentifier(value: unknown): string {
  return normalizeString(value);
}

function normalizeAlias(value: unknown): string {
  return normalizeString(value).replace(/^@+/, "").toLowerCase();
}

function uniqueAliases(values: unknown[]): string[] {
  const seen = new Set<string>();
  const aliases: string[] = [];

  values.forEach((value) => {
    const raw = normalizeString(value);
    const normalized = normalizeAlias(raw);
    if (!normalized || seen.has(normalized)) return;

    seen.add(normalized);
    aliases.push(normalized);

    if (raw.startsWith("@")) {
      const withoutAt = normalizeAlias(raw.slice(1));
      if (withoutAt && !seen.has(withoutAt)) {
        seen.add(withoutAt);
        aliases.push(withoutAt);
      }
    }
  });

  return aliases;
}

function toNumber(value: unknown, fallback = 0): number {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? Math.max(0, Math.floor(parsed)) : fallback;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function pickMediaUri(record: Record<string, unknown>, keys: string[]): string {
  for (const key of keys) {
    const value = normalizeString(record[key]);
    if (value) return value;
  }
  return "";
}

function buildStablePublicMediaId(
  record: Record<string, unknown>,
  index: number,
  kind: "photo" | "video",
  fallbackUri?: string,
): string {
  const explicit =
    normalizeString(record.id) ||
    normalizeString(record.mediaId) ||
    normalizeString(record.assetId) ||
    normalizeString(record.fileId) ||
    normalizeString(record.storageKey);
  if (explicit) return explicit;

  const source =
    normalizeString(record.uri) ||
    normalizeString(record.mediaUri) ||
    normalizeString(record.videoUri) ||
    normalizeString(record.imageUri) ||
    normalizeString(record.thumbnailUri) ||
    normalizeString(record.posterUri) ||
    normalizeString(record.previewUri) ||
    normalizeString(record.downloadUrl) ||
    normalizeString(record.fileUrl) ||
    normalizeString(record.url) ||
    normalizeString(fallbackUri);

  if (source) {
    const clean = source.split("?")[0]?.split("#")[0] || source;
    const tail = decodeURIComponent(clean.split("/").filter(Boolean).pop() || clean);
    const normalized = tail
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9_.-]+/gi, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80);
    if (normalized) return `${kind}-${normalized}`;
  }

  return `${kind}-${index}`;
}

function normalizeGiftItems(value: unknown): GroupPublicGiftItem[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((item, index): GroupPublicGiftItem | null => {
      if (!isRecord(item)) return null;
      const id = normalizeString(item.id) || `gift-${index}`;
      const title = normalizeString(item.title) || undefined;
      const emoji = normalizeString(item.emoji) || undefined;
      const imageUri = pickMediaUri(item, ["imageUri", "thumbnailUri", "iconUri", "url", "downloadUrl", "fileUrl", "uri"]) || undefined;
      if (!id || (!title && !emoji && !imageUri)) return null;
      return { id, title, emoji, imageUri };
    })
    .filter((item): item is GroupPublicGiftItem => item !== null);
}

function parseJsonRecord(value: string | null): Record<string, unknown> | null {
  if (!value) return null;

  try {
    const parsed = JSON.parse(value) as unknown;
    return isRecord(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function normalizeMediaItems(value: unknown, fallbackKind: "photo" | "video"): GroupPublicMediaItem[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((item, index): GroupPublicMediaItem | null => {
      if (!isRecord(item)) return null;

      const kind = item.kind === "video" || item.mediaKind === "video" || item.type === "video" || fallbackKind === "video" ? "video" : "photo";
      const thumbnailUri = pickMediaUri(item, ["thumbnailUri", "posterUri", "previewUri", "imageUri", "coverUri"]);
      const mediaUri = pickMediaUri(item, ["mediaUri", "videoUri", "playbackUri", "sourceUri", "downloadUrl", "fileUrl", "url", "uri"]);
      const photoUri = pickMediaUri(item, ["uri", "imageUri", "mediaUri", "downloadUrl", "fileUrl", "url", "thumbnailUri"]);
      const uri = kind === "video" ? thumbnailUri || mediaUri : photoUri || thumbnailUri || mediaUri;
      const openUri = mediaUri || photoUri || uri || thumbnailUri;

      if (!uri && !openUri) return null;

      return {
        id: buildStablePublicMediaId(item, index, kind, openUri || uri),
        uri: uri || openUri,
        kind,
        thumbnailUri: thumbnailUri || undefined,
        mediaUri: openUri || undefined,
        mimeType: normalizeString(item.mimeType) || normalizeString(item.type) || undefined,
        views: toNumber(item.views),
        duration: normalizeString(item.duration) || undefined,
        durationMs: typeof item.durationMs === "number" && Number.isFinite(item.durationMs) ? Math.max(0, Math.floor(item.durationMs)) : undefined,
        liked: typeof item.liked === "boolean" ? item.liked : undefined,
      };
    })
    .filter((item): item is GroupPublicMediaItem => item !== null);
}

function normalizeSnapshot(
  fallbackChatId: string,
  value?: Partial<GroupPublicProfileSnapshot> | null,
  extraAliases?: Array<string | null | undefined> | null,
): GroupPublicProfileSnapshot {
  const source = value ?? {};
  const chatId = normalizeIdentifier(source.chatId) || normalizeIdentifier(fallbackChatId);

  const primaryGifts = normalizeGiftItems(source.publicGifts);
  const publicationGifts = normalizeGiftItems((source as Record<string, unknown>).publicationGifts);
  const legacyGifts = normalizeGiftItems((source as Record<string, unknown>).gifts);
  const publicGifts = primaryGifts.length ? primaryGifts : publicationGifts.length ? publicationGifts : legacyGifts;

  return {
    chatId,
    displayName: normalizeString(source.displayName) || normalizeString(source.publicName) || undefined,
    publicName: normalizeString(source.publicName) || normalizeString(source.displayName) || undefined,
    username: normalizeString(source.username) || normalizeString(source.publicUsername) || undefined,
    publicUsername: normalizeString(source.publicUsername) || normalizeString(source.username) || undefined,
    bio: normalizeString(source.bio) || normalizeString(source.publicBio) || undefined,
    publicBio: normalizeString(source.publicBio) || normalizeString(source.bio) || undefined,
    subtitle: normalizeString(source.subtitle) || normalizeString(source.publicSubtitle) || undefined,
    publicSubtitle: normalizeString(source.publicSubtitle) || normalizeString(source.subtitle) || undefined,
    phone: normalizeString(source.phone) || undefined,
    avatarUri: normalizeString(source.avatarUri),
    coverUri: normalizeString(source.coverUri),
    publicationPhotos: normalizeMediaItems(source.publicationPhotos, "photo"),
    publicationVideos: normalizeMediaItems(source.publicationVideos, "video"),
    publicGifts,
    likesCount: toNumber(source.likesCount),
    publicGiftsCount: Math.max(toNumber(source.publicGiftsCount), publicGifts.length),
    aliases: uniqueAliases([
      chatId,
      source.displayName,
      source.publicName,
      source.username,
      source.publicUsername,
      ...(Array.isArray(source.aliases) ? source.aliases : []),
      ...(Array.isArray(extraAliases) ? extraAliases : []),
    ]),
    updatedAt: toNumber(source.updatedAt, Date.now()),
  };
}

function emptySnapshot(chatId: string): GroupPublicProfileSnapshot {
  return {
    ...EMPTY_GROUP_PUBLIC_PROFILE,
    chatId,
    aliases: chatId ? uniqueAliases([chatId]) : [],
  };
}

function getProfileKey(identifier: string): string {
  const normalizedAlias = normalizeAlias(identifier);
  return state.aliases[normalizedAlias] || normalizeIdentifier(identifier);
}

function registerAliases(snapshot: GroupPublicProfileSnapshot, extraAliases?: Array<string | null | undefined> | null) {
  uniqueAliases([
    snapshot.chatId,
    snapshot.username,
    snapshot.publicUsername,
    snapshot.displayName,
    snapshot.publicName,
    ...snapshot.aliases,
    ...(Array.isArray(extraAliases) ? extraAliases : []),
  ]).forEach((alias) => {
    if (alias) state.aliases[alias] = snapshot.chatId;
  });
}

async function persistGroupPublicProfileState() {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function hydrateFromRecord(record: Record<string, unknown> | null): PersistedGroupPublicProfileState | null {
  if (!record) return null;

  const profiles: Record<string, GroupPublicProfileSnapshot> = {};
  const aliases: Record<string, string> = {};
  const rawProfiles = isRecord(record.profiles) ? record.profiles : record;
  const rawAliases = isRecord(record.aliases) ? record.aliases : {};

  Object.entries(rawProfiles).forEach(([key, value]) => {
    if (!isRecord(value)) return;

    const snapshot = normalizeSnapshot(key, value as Partial<GroupPublicProfileSnapshot>);
    if (!snapshot.chatId) return;

    profiles[snapshot.chatId] = snapshot;
    snapshot.aliases.forEach((alias) => {
      if (alias) aliases[alias] = snapshot.chatId;
    });
  });

  Object.entries(rawAliases).forEach(([alias, key]) => {
    const normalizedAlias = normalizeAlias(alias);
    const normalizedKey = normalizeIdentifier(key);
    if (normalizedAlias && normalizedKey) aliases[normalizedAlias] = normalizedKey;
  });

  return { version: 2, profiles, aliases };
}

export async function hydrateGroupPublicProfileStorage(): Promise<PersistedGroupPublicProfileState> {
  if (hydrated) return state;

  const current = hydrateFromRecord(parseJsonRecord(await AsyncStorage.getItem(STORAGE_KEY)));
  if (current) {
    state = current;
    hydrated = true;
    return state;
  }

  for (const key of LEGACY_STORAGE_KEYS) {
    const legacy = hydrateFromRecord(parseJsonRecord(await AsyncStorage.getItem(key)));
    if (legacy) {
      state = legacy;
      hydrated = true;
      await persistGroupPublicProfileState();
      return state;
    }
  }

  hydrated = true;
  return state;
}


export async function refreshGroupPublicProfileStorage(): Promise<PersistedGroupPublicProfileState> {
  const previous = state;
  hydrated = false;
  state = { version: 2, profiles: {}, aliases: {} };

  try {
    const next = await hydrateGroupPublicProfileStorage();
    notifyGroupPublicProfiles();
    return next;
  } catch {
    state = previous;
    hydrated = true;
    notifyGroupPublicProfiles();
    return state;
  }
}

export function subscribeGroupPublicProfiles(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function hydrateGroupPublicProfile(chatId: string): GroupPublicProfileSnapshot {
  const key = normalizeIdentifier(chatId);
  if (!key) return emptySnapshot("");

  const storedKey = getProfileKey(key);
  const current = state.profiles[storedKey];
  if (!current) return emptySnapshot(key);

  return normalizeSnapshot(storedKey, current);
}

export function getGroupPublicProfileSnapshot(chatId: string): GroupPublicProfileSnapshot {
  return hydrateGroupPublicProfile(chatId);
}

function countGroupPublicLikedMedia(snapshot: GroupPublicProfileSnapshot): number {
  const photos = Array.isArray(snapshot.publicationPhotos) ? snapshot.publicationPhotos : [];
  const videos = Array.isArray(snapshot.publicationVideos) ? snapshot.publicationVideos : [];
  return [...photos, ...videos].filter((item) => Boolean(item?.liked)).length;
}

function collectGroupPublicMetricKeys(values: unknown[]): Set<string> {
  const keys = new Set<string>();

  values.forEach((value) => {
    if (!isRecord(value)) return;

    [
      value.id,
      value.uri,
      value.mediaUri,
      value.thumbnailUri,
      value.groupId,
      value.linkedChatId,
      value.linkedPublicationId,
      value.username,
      value.groupName,
      value.inviteLink,
    ].forEach((item) => {
      const key = normalizeString(item).replace(/^@+/, "").toLowerCase();
      if (key) keys.add(key);
      if (key && !key.startsWith("group:")) keys.add(`group:${key}`);
    });
  });

  return keys;
}

function groupPublicSnapshotMatchesLocalGroup(snapshot: GroupPublicProfileSnapshot, group: Record<string, unknown>): boolean {
  const snapshotKeys = collectGroupPublicMetricKeys([
    snapshot,
    ...(Array.isArray(snapshot.publicationPhotos) ? snapshot.publicationPhotos : []),
    ...(Array.isArray(snapshot.publicationVideos) ? snapshot.publicationVideos : []),
    ...(Array.isArray(snapshot.aliases) ? snapshot.aliases.map((alias) => ({ id: alias })) : []),
  ]);

  const groupKeys = collectGroupPublicMetricKeys([
    group,
    ...(Array.isArray(group.publicationPhotos) ? group.publicationPhotos : []),
    ...(Array.isArray(group.publicationVideos) ? group.publicationVideos : []),
  ]);

  for (const key of snapshotKeys) {
    if (groupKeys.has(key)) return true;
  }

  return false;
}

async function syncGroupPublicMetricsToLocalGroupCollection(snapshot: GroupPublicProfileSnapshot): Promise<void> {
  try {
    const raw = await AsyncStorage.getItem(GROUP_PUBLIC_LOCAL_GROUP_COLLECTION_STORAGE_KEY);
    const parsed = parseJsonRecord(raw);
    if (!parsed || !Array.isArray(parsed.groups)) return;

    const likesCount = Math.max(toNumber(snapshot.likesCount), countGroupPublicLikedMedia(snapshot));
    const publicGiftsCount = toNumber(snapshot.publicGiftsCount);
    let changed = false;

    const groups = parsed.groups.map((item: unknown) => {
      if (!isRecord(item) || !groupPublicSnapshotMatchesLocalGroup(snapshot, item)) return item;

      const nextLikesCount = Math.max(toNumber(item.likesCount), likesCount);
      const nextPublicGiftsCount = Math.max(toNumber(item.publicGiftsCount), publicGiftsCount);

      if (
        nextLikesCount === toNumber(item.likesCount) &&
        nextPublicGiftsCount === toNumber(item.publicGiftsCount)
      ) {
        return item;
      }

      changed = true;
      return {
        ...item,
        displayName: snapshot.displayName || item.displayName,
        publicName: snapshot.publicName || snapshot.displayName || item.publicName,
        groupName: snapshot.publicName || snapshot.displayName || item.groupName,
        username: snapshot.username || snapshot.publicUsername || item.username,
        publicUsername: snapshot.publicUsername || snapshot.username || item.publicUsername,
        bio: snapshot.bio || snapshot.publicBio || item.bio,
        publicBio: snapshot.publicBio || snapshot.bio || item.publicBio,
        subtitle: snapshot.subtitle || snapshot.publicSubtitle || item.subtitle,
        publicationPhotos: snapshot.publicationPhotos.length ? snapshot.publicationPhotos : item.publicationPhotos,
        publicationVideos: snapshot.publicationVideos.length ? snapshot.publicationVideos : item.publicationVideos,
        publicGifts: snapshot.publicGifts.length ? snapshot.publicGifts : item.publicGifts,
        likesCount: nextLikesCount,
        publicGiftsCount: nextPublicGiftsCount,
        lastUpdatedAt: Date.now(),
      };
    });

    if (!changed) return;

    await AsyncStorage.setItem(
      GROUP_PUBLIC_LOCAL_GROUP_COLLECTION_STORAGE_KEY,
      JSON.stringify({
        ...parsed,
        groups,
        updatedAt: Date.now(),
      }),
    );

    notifyGroupPublicProfiles();
  } catch {}
}

export function saveGroupPublicProfile(
  chatId: string,
  patch: Partial<GroupPublicProfileSnapshot>,
  extraAliases?: Array<string | null | undefined> | null,
): GroupPublicProfileSnapshot {
  const key = normalizeIdentifier(chatId || patch.chatId);
  if (!key) return emptySnapshot("");

  const existingKey = getProfileKey(key);
  const current = state.profiles[existingKey] ?? emptySnapshot(key);

  const next = normalizeSnapshot(current.chatId || key, {
    ...current,
    ...patch,
    chatId: current.chatId || key,
    aliases: uniqueAliases([
      key,
      ...(current.aliases ?? []),
      ...(Array.isArray(patch.aliases) ? patch.aliases : []),
      ...(Array.isArray(extraAliases) ? extraAliases : []),
    ]),
    publicationPhotos: Array.isArray(patch.publicationPhotos) ? patch.publicationPhotos : current.publicationPhotos,
    publicationVideos: Array.isArray(patch.publicationVideos) ? patch.publicationVideos : current.publicationVideos,
    publicGifts: Array.isArray(patch.publicGifts) ? patch.publicGifts : current.publicGifts,
    likesCount: Math.max(toNumber(current.likesCount), toNumber(patch.likesCount)),
    publicGiftsCount: Math.max(toNumber(current.publicGiftsCount), toNumber(patch.publicGiftsCount), Array.isArray(patch.publicGifts) ? patch.publicGifts.length : 0, current.publicGifts.length),
    updatedAt: Date.now(),
  }, extraAliases);

  state.profiles[next.chatId] = next;
  registerAliases(next, extraAliases);
  void persistGroupPublicProfileState();
  void syncGroupPublicMetricsToLocalGroupCollection(next);
  notifyGroupPublicProfiles();

  return next;
}

export function clearGroupPublicProfile(chatId: string): void {
  const key = normalizeIdentifier(chatId);
  if (!key) return;

  const storedKey = getProfileKey(key);
  delete state.profiles[storedKey];

  Object.entries(state.aliases).forEach(([alias, value]) => {
    if (value === storedKey || alias === normalizeAlias(key)) {
      delete state.aliases[alias];
    }
  });

  void persistGroupPublicProfileState();
  notifyGroupPublicProfiles();
}

export function hydrateAllGroupPublicProfiles(): GroupPublicProfileSnapshot[] {
  return Object.values(state.profiles)
    .map((item) => hydrateGroupPublicProfile(item.chatId))
    .sort((a, b) => b.updatedAt - a.updatedAt);
}
