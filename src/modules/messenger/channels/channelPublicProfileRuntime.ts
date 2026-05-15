import AsyncStorage from "@react-native-async-storage/async-storage";

export type ChannelPublicMediaItem = {
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

export type ChannelPublicGiftItem = {
  id: string;
  title?: string;
  emoji?: string;
  imageUri?: string;
};

export type ChannelPublicProfileSnapshot = {
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
  publicationPhotos: ChannelPublicMediaItem[];
  publicationVideos: ChannelPublicMediaItem[];
  publicGifts: ChannelPublicGiftItem[];
  likesCount: number;
  publicGiftsCount: number;
  subscribersCount: number;
  aliases: string[];
  updatedAt: number;
};

type PersistedChannelPublicProfileState = {
  version: 1;
  profiles: Record<string, ChannelPublicProfileSnapshot>;
  aliases: Record<string, string>;
};

const STORAGE_KEY = "sabi.messenger.channelPublicProfileSurface.v1";
const CHANNEL_PUBLIC_LOCAL_COLLECTION_STORAGE_KEY = "sabi.profile.channel.settings.v1";

const EMPTY_CHANNEL_PUBLIC_PROFILE: ChannelPublicProfileSnapshot = {
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
  subscribersCount: 0,
  aliases: [],
  updatedAt: 0,
};

let hydrated = false;
let state: PersistedChannelPublicProfileState = {
  version: 1,
  profiles: {},
  aliases: {},
};

const listeners = new Set<() => void>();

function notifyChannelPublicProfiles() {
  listeners.forEach((listener) => listener());
}

function normalizeString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
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
    if (!normalized) return;

    const variants = [
      normalized,
      normalized.startsWith("channel:") ? normalized.slice("channel:".length) : "channel:" + normalized,
    ].filter(Boolean);

    variants.forEach((alias) => {
      if (!alias || seen.has(alias)) return;
      seen.add(alias);
      aliases.push(alias);
    });
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

function normalizeGiftItems(value: unknown): ChannelPublicGiftItem[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((item, index): ChannelPublicGiftItem | null => {
      if (!isRecord(item)) return null;
      const id = normalizeString(item.id) || `gift-${index}`;
      const title = normalizeString(item.title) || undefined;
      const emoji = normalizeString(item.emoji) || undefined;
      const imageUri = pickMediaUri(item, ["imageUri", "thumbnailUri", "iconUri", "url", "downloadUrl", "fileUrl", "uri"]) || undefined;
      if (!id || (!title && !emoji && !imageUri)) return null;
      return { id, title, emoji, imageUri };
    })
    .filter((item): item is ChannelPublicGiftItem => item !== null);
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

function normalizeMediaItems(value: unknown, fallbackKind: "photo" | "video"): ChannelPublicMediaItem[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((item, index): ChannelPublicMediaItem | null => {
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
    .filter((item): item is ChannelPublicMediaItem => item !== null);
}

function normalizeSnapshot(
  fallbackChatId: string,
  value?: Partial<ChannelPublicProfileSnapshot> | null,
  extraAliases?: Array<string | null | undefined> | null,
): ChannelPublicProfileSnapshot {
  const source = value ?? {};
  const chatId = normalizeString(source.chatId) || normalizeString(fallbackChatId);

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
    subscribersCount: toNumber(source.subscribersCount),
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

function emptySnapshot(chatId: string): ChannelPublicProfileSnapshot {
  return {
    ...EMPTY_CHANNEL_PUBLIC_PROFILE,
    chatId,
    aliases: chatId ? uniqueAliases([chatId]) : [],
  };
}

function getProfileKey(identifier: string): string {
  const normalizedAlias = normalizeAlias(identifier);
  return state.aliases[normalizedAlias] || normalizeString(identifier);
}

function registerAliases(snapshot: ChannelPublicProfileSnapshot, extraAliases?: Array<string | null | undefined> | null) {
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

async function persistChannelPublicProfileState() {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function hydrateFromRecord(record: Record<string, unknown> | null): PersistedChannelPublicProfileState | null {
  if (!record) return null;

  const profiles: Record<string, ChannelPublicProfileSnapshot> = {};
  const aliases: Record<string, string> = {};
  const rawProfiles = isRecord(record.profiles) ? record.profiles : record;
  const rawAliases = isRecord(record.aliases) ? record.aliases : {};

  Object.entries(rawProfiles).forEach(([key, value]) => {
    if (!isRecord(value)) return;

    const snapshot = normalizeSnapshot(key, value as Partial<ChannelPublicProfileSnapshot>);
    if (!snapshot.chatId) return;

    profiles[snapshot.chatId] = snapshot;
    snapshot.aliases.forEach((alias) => {
      if (alias) aliases[alias] = snapshot.chatId;
    });
  });

  Object.entries(rawAliases).forEach(([alias, key]) => {
    const normalizedAlias = normalizeAlias(alias);
    const normalizedKey = normalizeString(key);
    if (normalizedAlias && normalizedKey) aliases[normalizedAlias] = normalizedKey;
  });

  return { version: 1, profiles, aliases };
}

export async function hydrateChannelPublicProfileStorage(): Promise<PersistedChannelPublicProfileState> {
  if (hydrated) return state;

  const current = hydrateFromRecord(parseJsonRecord(await AsyncStorage.getItem(STORAGE_KEY)));
  if (current) {
    state = current;
    hydrated = true;
    return state;
  }

  hydrated = true;
  return state;
}


export async function refreshChannelPublicProfileStorage(): Promise<PersistedChannelPublicProfileState> {
  const previous = state;
  hydrated = false;
  state = { version: 1, profiles: {}, aliases: {} };

  try {
    const next = await hydrateChannelPublicProfileStorage();
    notifyChannelPublicProfiles();
    return next;
  } catch {
    state = previous;
    hydrated = true;
    notifyChannelPublicProfiles();
    return state;
  }
}

export function subscribeChannelPublicProfiles(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function hydrateChannelPublicProfile(chatId: string): ChannelPublicProfileSnapshot {
  const key = normalizeString(chatId);
  if (!key) return emptySnapshot("");

  const storedKey = getProfileKey(key);
  const current = state.profiles[storedKey];
  if (!current) return emptySnapshot(key);

  return normalizeSnapshot(storedKey, current);
}

export function getChannelPublicProfileSnapshot(chatId: string): ChannelPublicProfileSnapshot {
  return hydrateChannelPublicProfile(chatId);
}

function countChannelPublicLikedMedia(snapshot: ChannelPublicProfileSnapshot): number {
  const photos = Array.isArray(snapshot.publicationPhotos) ? snapshot.publicationPhotos : [];
  const videos = Array.isArray(snapshot.publicationVideos) ? snapshot.publicationVideos : [];
  return [...photos, ...videos].filter((item) => Boolean(item?.liked)).length;
}

function collectChannelPublicMetricKeys(values: unknown[]): Set<string> {
  const keys = new Set<string>();

  values.forEach((value) => {
    if (!isRecord(value)) return;

    [
      value.id,
      value.uri,
      value.mediaUri,
      value.thumbnailUri,
      value.channelId,
      value.linkedChatId,
      value.linkedPublicationId,
      value.username,
      value.channelName,
      value.inviteLink,
    ].forEach((item) => {
      const key = normalizeString(item).replace(/^@+/, "").toLowerCase();
      if (key) keys.add(key);
      if (key && !key.startsWith("channel:")) keys.add(`channel:${key}`);
    });
  });

  return keys;
}

function channelPublicSnapshotMatchesLocalChannel(snapshot: ChannelPublicProfileSnapshot, channel: Record<string, unknown>): boolean {
  const snapshotKeys = collectChannelPublicMetricKeys([
    snapshot,
    ...(Array.isArray(snapshot.publicationPhotos) ? snapshot.publicationPhotos : []),
    ...(Array.isArray(snapshot.publicationVideos) ? snapshot.publicationVideos : []),
    ...(Array.isArray(snapshot.aliases) ? snapshot.aliases.map((alias) => ({ id: alias })) : []),
  ]);

  const channelKeys = collectChannelPublicMetricKeys([
    channel,
    ...(Array.isArray(channel.publicationPhotos) ? channel.publicationPhotos : []),
    ...(Array.isArray(channel.publicationVideos) ? channel.publicationVideos : []),
  ]);

  for (const key of snapshotKeys) {
    if (channelKeys.has(key)) return true;
  }

  return false;
}

async function syncChannelPublicMetricsToLocalChannelCollection(snapshot: ChannelPublicProfileSnapshot): Promise<void> {
  try {
    const raw = await AsyncStorage.getItem(CHANNEL_PUBLIC_LOCAL_COLLECTION_STORAGE_KEY);
    const parsed = parseJsonRecord(raw);
    if (!parsed) return;

    const sourceItems = Array.isArray(parsed.channels)
      ? parsed.channels
      : Array.isArray(parsed.items)
        ? parsed.items
        : [];

    if (!sourceItems.length) return;

    const likesCount = Math.max(toNumber(snapshot.likesCount), countChannelPublicLikedMedia(snapshot));
    const publicGiftsCount = toNumber(snapshot.publicGiftsCount);
    const subscribersCount = toNumber(snapshot.subscribersCount);
    let changed = false;

    const channels = sourceItems.map((item: unknown) => {
      if (!isRecord(item) || !channelPublicSnapshotMatchesLocalChannel(snapshot, item)) return item;

      changed = true;
      return {
        ...item,
        displayName: snapshot.displayName || item.displayName,
        publicName: snapshot.publicName || snapshot.displayName || item.publicName,
        channelName: snapshot.publicName || snapshot.displayName || item.channelName,
        username: snapshot.username || snapshot.publicUsername || item.username,
        publicUsername: snapshot.publicUsername || snapshot.username || item.publicUsername,
        bio: snapshot.bio || snapshot.publicBio || item.bio,
        publicBio: snapshot.publicBio || snapshot.bio || item.publicBio,
        subtitle: snapshot.subtitle || snapshot.publicSubtitle || item.subtitle,
        publicationPhotos: snapshot.publicationPhotos.length ? snapshot.publicationPhotos : item.publicationPhotos,
        publicationVideos: snapshot.publicationVideos.length ? snapshot.publicationVideos : item.publicationVideos,
        publicGifts: snapshot.publicGifts.length ? snapshot.publicGifts : item.publicGifts,
        likesCount: Math.max(toNumber(item.likesCount), likesCount),
        publicGiftsCount: Math.max(toNumber(item.publicGiftsCount), publicGiftsCount),
        subscribersCount: Math.max(toNumber(item.subscribersCount), subscribersCount),
        lastUpdatedAt: Date.now(),
      };
    });

    if (!changed) return;

    await AsyncStorage.setItem(
      CHANNEL_PUBLIC_LOCAL_COLLECTION_STORAGE_KEY,
      JSON.stringify({
        ...parsed,
        channels,
        items: channels,
        updatedAt: Date.now(),
      }),
    );

    notifyChannelPublicProfiles();
  } catch {}
}

export function saveChannelPublicProfile(
  chatId: string,
  patch: Partial<ChannelPublicProfileSnapshot>,
  extraAliases?: Array<string | null | undefined> | null,
): ChannelPublicProfileSnapshot {
  const key = normalizeString(chatId || patch.chatId);
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
    subscribersCount: Math.max(toNumber(current.subscribersCount), toNumber(patch.subscribersCount)),
    updatedAt: Date.now(),
  }, extraAliases);

  state.profiles[next.chatId] = next;
  registerAliases(next, extraAliases);
  void persistChannelPublicProfileState();
  void syncChannelPublicMetricsToLocalChannelCollection(next);
  notifyChannelPublicProfiles();

  return next;
}

export function clearChannelPublicProfile(chatId: string): void {
  const key = normalizeString(chatId);
  if (!key) return;

  const storedKey = getProfileKey(key);
  delete state.profiles[storedKey];

  Object.entries(state.aliases).forEach(([alias, value]) => {
    if (value === storedKey || alias === normalizeAlias(key)) {
      delete state.aliases[alias];
    }
  });

  void persistChannelPublicProfileState();
  notifyChannelPublicProfiles();
}

export function hydrateAllChannelPublicProfiles(): ChannelPublicProfileSnapshot[] {
  return Object.values(state.profiles)
    .map((item) => hydrateChannelPublicProfile(item.chatId))
    .sort((a, b) => b.updatedAt - a.updatedAt);
}
