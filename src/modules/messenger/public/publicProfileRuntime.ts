import AsyncStorage from "@react-native-async-storage/async-storage";

export type PublicProfileSurfaceMediaKind = "photo" | "video";

export type PublicProfileSurfaceMediaItem = {
  id: string;
  uri: string;
  kind: PublicProfileSurfaceMediaKind;
  thumbnailUri?: string;
  mediaUri?: string;
  mimeType?: string;
  views?: number;
  duration?: string;
  durationMs?: number;
  liked?: boolean;
};

export type PublicProfileSurfaceGiftItem = {
  id: string;
  title?: string;
  emoji?: string;
  imageUri?: string;
};

export type PublicProfileSurfaceSnapshot = {
  chatId: string;
  userId?: string;
  displayName?: string;
  publicName?: string;
  username?: string;
  publicUsername?: string;
  bio?: string;
  publicBio?: string;
  subtitle?: string;
  publicSubtitle?: string;
  phone?: string;
  birthday?: string;
  avatarUri: string;
  coverUri: string;
  publicationPhotos: PublicProfileSurfaceMediaItem[];
  publicationVideos: PublicProfileSurfaceMediaItem[];
  publicGifts: PublicProfileSurfaceGiftItem[];
  likesCount: number;
  publicGiftsCount: number;
  likedByUserIds: string[];
  aliases: string[];
  updatedAt: number;
};

export type SharedPublicMediaItem = PublicProfileSurfaceMediaItem;
export type SharedPublicProfileSnapshot = PublicProfileSurfaceSnapshot;

const EMPTY_PUBLIC_PROFILE: PublicProfileSurfaceSnapshot = {
  chatId: "",
  userId: undefined,
  displayName: undefined,
  publicName: undefined,
  username: undefined,
  publicUsername: undefined,
  bio: undefined,
  publicBio: undefined,
  subtitle: undefined,
  publicSubtitle: undefined,
  phone: undefined,
  birthday: undefined,
  avatarUri: "",
  coverUri: "",
  publicationPhotos: [],
  publicationVideos: [],
  publicGifts: [],
  likesCount: 0,
  publicGiftsCount: 0,
  likedByUserIds: [],
  aliases: [],
  updatedAt: 0,
};

type PersistedPublicProfileState = {
  version: 2;
  profiles: Record<string, PublicProfileSurfaceSnapshot>;
  aliases: Record<string, string>;
};

const STORAGE_KEY = "sabi.messenger.publicProfileSurface.v2";
const LEGACY_STORAGE_KEYS = [
  "sabi.messenger.publicProfileSurface.v1",
  "sabi.public.profiles.v1",
];

let hydrated = false;
let state: PersistedPublicProfileState = {
  version: 2,
  profiles: {},
  aliases: {},
};

const listeners = new Set<() => void>();

function notifyPublicProfiles() {
  for (const listener of listeners) {
    listener();
  }
}

function normalizeString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeIdentifier(value: unknown): string {
  return normalizeString(value);
}

function normalizePhone(value: unknown): string {
  return normalizeString(value).replace(/[^\d+]/g, "");
}

export function normalizePublicProfileUsername(value: unknown): string {
  const raw = normalizeString(value).replace(/^@+/, "");
  return raw ? `@${raw}` : "";
}

function normalizePublicProfileUsernameBare(value: unknown): string {
  return normalizeString(value).replace(/^@+/, "").toLowerCase();
}

function normalizeAlias(value: unknown): string {
  const raw = normalizeString(value).toLowerCase();
  if (!raw) return "";
  return raw;
}

function uniqueStrings(values: unknown[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  values.forEach((value) => {
    const normalized = normalizeAlias(value);
    if (!normalized || seen.has(normalized)) return;

    seen.add(normalized);
    result.push(normalized);

    if (normalized.startsWith("@")) {
      const withoutAt = normalized.slice(1);
      if (withoutAt && !seen.has(withoutAt)) {
        seen.add(withoutAt);
        result.push(withoutAt);
      }
    } else if (/^[a-z0-9_.-]+$/i.test(normalized)) {
      const withAt = `@${normalized}`;
      if (!seen.has(withAt)) {
        seen.add(withAt);
        result.push(withAt);
      }
    }
  });

  return result;
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

function parseJsonRecord(value: string | null): Record<string, unknown> | null {
  if (!value) return null;
  try {
    const parsed = JSON.parse(value) as unknown;
    return isRecord(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function normalizeLikedByUserIds(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  const seen = new Set<string>();
  const result: string[] = [];

  value.forEach((item) => {
    const normalized = normalizeIdentifier(item);
    if (!normalized || seen.has(normalized)) return;
    seen.add(normalized);
    result.push(normalized);
  });

  return result;
}

function normalizeMediaItems(value: unknown, fallbackKind: PublicProfileSurfaceMediaKind): PublicProfileSurfaceMediaItem[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((item, index): PublicProfileSurfaceMediaItem | null => {
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
        durationMs: typeof item.durationMs === "number" ? item.durationMs : undefined,
        liked: typeof item.liked === "boolean" ? item.liked : undefined,
      };
    })
    .filter((item): item is PublicProfileSurfaceMediaItem => item !== null);
}

function normalizeGiftItems(value: unknown): PublicProfileSurfaceGiftItem[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((item, index): PublicProfileSurfaceGiftItem | null => {
      if (!isRecord(item)) return null;
      const id = normalizeString(item.id) || `gift-${index}`;
      const title = normalizeString(item.title) || undefined;
      const emoji = normalizeString(item.emoji) || undefined;
      const imageUri = pickMediaUri(item, ["imageUri", "thumbnailUri", "iconUri", "url", "downloadUrl", "fileUrl", "uri"]) || undefined;
      if (!id || (!title && !emoji && !imageUri)) return null;
      return { id, title, emoji, imageUri };
    })
    .filter((item): item is PublicProfileSurfaceGiftItem => item !== null);
}

function countLikedMedia(photos: PublicProfileSurfaceMediaItem[], videos: PublicProfileSurfaceMediaItem[]): number {
  return [...photos, ...videos].filter((item) => Boolean(item.liked)).length;
}

export function hasMeaningfulPublicProfileSurface(value?: Partial<PublicProfileSurfaceSnapshot> | null): boolean {
  if (!value) return false;
  return Boolean(
    normalizeString(value.displayName || value.publicName) ||
      normalizeString(value.username || value.publicUsername) ||
      normalizeString(value.bio || value.publicBio) ||
      normalizeString(value.subtitle || value.publicSubtitle) ||
      normalizeString(value.phone) ||
      normalizeString(value.birthday) ||
      normalizeString(value.avatarUri) ||
      normalizeString(value.coverUri) ||
      Number(value.likesCount || 0) > 0 ||
      Number(value.publicGiftsCount || 0) > 0 ||
      (Array.isArray(value.publicationPhotos) && value.publicationPhotos.length > 0) ||
      (Array.isArray(value.publicationVideos) && value.publicationVideos.length > 0) ||
      (Array.isArray(value.publicGifts) && value.publicGifts.length > 0),
  );
}

export function normalizePublicProfileSurface(
  fallbackId: string,
  value?: Partial<PublicProfileSurfaceSnapshot> | null,
): PublicProfileSurfaceSnapshot {
  const record = value ?? {};
  const chatId =
    normalizeIdentifier(record.chatId) ||
    normalizeIdentifier(record.userId) ||
    normalizeIdentifier(fallbackId);
  const username = normalizePublicProfileUsername(record.username || record.publicUsername);
  const publicUsername = normalizePublicProfileUsername(record.publicUsername || record.username) || username;
  const phone = normalizePhone(record.phone);
  const publicationPhotos = normalizeMediaItems(record.publicationPhotos, "photo");
  const publicationVideos = normalizeMediaItems(record.publicationVideos, "video");
  const likedByUserIds = normalizeLikedByUserIds(record.likedByUserIds);
  const likedMediaCount = countLikedMedia(publicationPhotos, publicationVideos);
  const likesCount = Math.max(toNumber(record.likesCount), likedByUserIds.length, likedMediaCount);

  return {
    chatId,
    userId: normalizeIdentifier(record.userId) || undefined,
    displayName: normalizeIdentifier(record.displayName) || normalizeIdentifier(record.publicName) || undefined,
    publicName: normalizeIdentifier(record.publicName) || normalizeIdentifier(record.displayName) || undefined,
    username: username || undefined,
    publicUsername: publicUsername || undefined,
    bio: normalizeIdentifier(record.bio) || normalizeIdentifier(record.publicBio) || undefined,
    publicBio: normalizeIdentifier(record.publicBio) || normalizeIdentifier(record.bio) || undefined,
    subtitle: normalizeIdentifier(record.subtitle) || normalizeIdentifier(record.publicSubtitle) || undefined,
    publicSubtitle: normalizeIdentifier(record.publicSubtitle) || normalizeIdentifier(record.subtitle) || undefined,
    phone: phone || undefined,
    birthday: normalizeIdentifier(record.birthday) || undefined,
    avatarUri: normalizeIdentifier(record.avatarUri),
    coverUri: normalizeIdentifier(record.coverUri),
    publicationPhotos,
    publicationVideos,
    publicGifts: normalizeGiftItems(record.publicGifts),
    likesCount,
    publicGiftsCount: Math.max(toNumber(record.publicGiftsCount), normalizeGiftItems(record.publicGifts).length),
    likedByUserIds,
    aliases: uniqueStrings([
      chatId,
      record.userId,
      record.chatId,
      record.displayName,
      username,
      publicUsername,
      phone,
      ...(Array.isArray(record.aliases) ? record.aliases : []),
    ]),
    updatedAt: toNumber(record.updatedAt, Date.now()),
  };
}

function getProfileKey(identifier: string): string {
  const normalized = normalizeAlias(identifier);
  return state.aliases[normalized] || normalizeIdentifier(identifier);
}

function registerAliases(snapshot: PublicProfileSurfaceSnapshot) {
  uniqueStrings([
    snapshot.chatId,
    snapshot.userId,
    snapshot.username,
    snapshot.publicUsername,
    snapshot.phone,
    ...snapshot.aliases,
  ]).forEach((alias) => {
    if (alias) state.aliases[alias] = snapshot.chatId;
  });
}

async function persistPublicProfileState() {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function hydrateFromRecord(record: Record<string, unknown> | null): PersistedPublicProfileState | null {
  if (!record) return null;

  const profiles: Record<string, PublicProfileSurfaceSnapshot> = {};
  const aliases: Record<string, string> = {};
  const rawProfiles = isRecord(record.profiles) ? record.profiles : record;
  const rawAliases = isRecord(record.aliases) ? record.aliases : {};

  Object.entries(rawProfiles).forEach(([key, value]) => {
    if (!isRecord(value)) return;
    const snapshot = normalizePublicProfileSurface(key, value as Partial<PublicProfileSurfaceSnapshot>);
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

export async function hydratePublicProfileStorage(): Promise<PersistedPublicProfileState> {
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
      await persistPublicProfileState();
      return state;
    }
  }

  hydrated = true;
  return state;
}


export async function refreshPublicProfileStorage(): Promise<PersistedPublicProfileState> {
  const previous = state;
  hydrated = false;
  state = { version: 2, profiles: {}, aliases: {} };

  try {
    const next = await hydratePublicProfileStorage();
    notifyPublicProfiles();
    return next;
  } catch {
    state = previous;
    hydrated = true;
    notifyPublicProfiles();
    return state;
  }
}

export function subscribePublicProfiles(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function hydratePublicProfileNullable(identifier?: string | null): PublicProfileSurfaceSnapshot | null {
  const normalized = normalizeIdentifier(identifier);
  if (!normalized) return null;
  const key = getProfileKey(normalized);
  return state.profiles[key] ?? null;
}

export function hydratePublicProfile(identifier?: string | null): PublicProfileSurfaceSnapshot {
  return hydratePublicProfileNullable(identifier) ?? EMPTY_PUBLIC_PROFILE;
}

export function hydratePublicProfileByAnyIdentifier(
  identifiers?: Array<string | null | undefined> | string | null,
): PublicProfileSurfaceSnapshot | null {
  const values = Array.isArray(identifiers) ? identifiers : [identifiers];

  for (const value of values) {
    const snapshot = hydratePublicProfileNullable(value);
    if (snapshot) return snapshot;

    const username = normalizePublicProfileUsername(value);
    if (username) {
      const byUsername = hydratePublicProfileNullable(username) || hydratePublicProfileNullable(username.slice(1));
      if (byUsername) return byUsername;
    }
  }

  return null;
}

export function listPublicProfiles(): PublicProfileSurfaceSnapshot[] {
  return Object.values(state.profiles).sort((a, b) => b.updatedAt - a.updatedAt);
}

export function hydrateAllPublicProfiles(): SharedPublicProfileSnapshot[] {
  return listPublicProfiles();
}

export function resolvePublicProfileAvatarUri(
  identifiers?: Array<string | null | undefined> | string | null,
): string {
  const snapshot = hydratePublicProfileByAnyIdentifier(identifiers);
  const avatar = normalizeString(snapshot?.avatarUri);
  if (avatar) return avatar;
  const cover = normalizeString(snapshot?.coverUri);
  return cover || "";
}

export function savePublicProfile(
  identifier: string,
  value: Partial<PublicProfileSurfaceSnapshot>,
  extraAliases?: Array<string | null | undefined> | null,
): PublicProfileSurfaceSnapshot {
  const normalizedIdentifier = normalizeIdentifier(identifier || value.userId || value.chatId);
  if (!normalizedIdentifier) {
    throw new Error("public_profile_identifier_required");
  }

  const existingKey = getProfileKey(normalizedIdentifier);
  const existing = state.profiles[existingKey];
  const incomingPhotos = Array.isArray(value.publicationPhotos) ? value.publicationPhotos : existing?.publicationPhotos ?? [];
  const incomingVideos = Array.isArray(value.publicationVideos) ? value.publicationVideos : existing?.publicationVideos ?? [];
  const mergedLikedByUserIds = normalizeLikedByUserIds([
    ...(existing?.likedByUserIds ?? []),
    ...(Array.isArray(value.likedByUserIds) ? value.likedByUserIds : []),
  ]);
  const preservedLikesCount = Math.max(
    toNumber(existing?.likesCount),
    toNumber(value.likesCount),
    mergedLikedByUserIds.length,
    countLikedMedia(incomingPhotos, incomingVideos),
    countLikedMedia(existing?.publicationPhotos ?? [], existing?.publicationVideos ?? []),
  );

  const next = normalizePublicProfileSurface(existing?.chatId || normalizedIdentifier, {
    ...existing,
    ...value,
    likedByUserIds: mergedLikedByUserIds,
    likesCount: preservedLikesCount,
    aliases: uniqueStrings([
      normalizedIdentifier,
      ...(existing?.aliases ?? []),
      ...(Array.isArray(value.aliases) ? value.aliases : []),
      ...(Array.isArray(extraAliases) ? extraAliases : []),
    ]),
    updatedAt: Date.now(),
  });

  state.profiles[next.chatId] = next;
  registerAliases(next);
  void persistPublicProfileState();
  notifyPublicProfiles();

  return next;
}

export async function savePublicProfileAsync(
  identifier: string,
  value: Partial<PublicProfileSurfaceSnapshot>,
): Promise<PublicProfileSurfaceSnapshot> {
  const snapshot = savePublicProfile(identifier, value);
  await persistPublicProfileState();
  return snapshot;
}

export function isPublicProfileLikedBy(identifier: string, userId?: string | null): boolean {
  const currentUserId = normalizeIdentifier(userId);
  if (!currentUserId) return false;
  const snapshot = hydratePublicProfile(identifier);
  return Boolean(snapshot?.likedByUserIds.includes(currentUserId));
}

export function markPublicProfileLiked(
  identifier: string,
  userId?: string | null,
  incoming?: Partial<PublicProfileSurfaceSnapshot> | null,
): PublicProfileSurfaceSnapshot {
  const currentUserId = normalizeIdentifier(userId);
  const existing = hydratePublicProfile(identifier);
  const likedByUserIds = normalizeLikedByUserIds([
    ...(existing?.likedByUserIds ?? []),
    ...(Array.isArray(incoming?.likedByUserIds) ? incoming.likedByUserIds : []),
    currentUserId,
  ]);

  return savePublicProfile(identifier, {
    ...existing,
    ...incoming,
    likedByUserIds,
    likesCount: Math.max(toNumber(existing?.likesCount), toNumber(incoming?.likesCount), likedByUserIds.length),
  });
}

export function clearPublicProfileRuntimeForTests() {
  state = { version: 2, profiles: {}, aliases: {} };
  hydrated = false;
  notifyPublicProfiles();
}
