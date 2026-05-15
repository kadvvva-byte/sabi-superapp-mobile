import { requireSabiApiBaseUrl } from "../network/sabiApiBaseUrl";
import type { PublicProfileSurfaceMediaItem, PublicProfileSurfaceMediaKind, PublicProfileSurfaceSnapshot } from "../../modules/messenger/public/publicProfileRuntime";

export type UserProfileApiSession = {
  apiBaseUrl?: string | null;
  accessToken?: string | null;
  currentUserId?: string | null;
  phoneNumber?: string | null;
  timeoutMs?: number | null;
};

export type UserProfileApiSnapshot = {
  userId: string;
  phone?: string;
  email?: string;
  firstName: string;
  lastName: string;
  username: string;
  displayName: string;
  bio?: string;
  avatarUri?: string | null;
  coverUri?: string;
  profileCompleted: boolean;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
};

export type UploadableProfileMediaFile = {
  uri: string;
  name?: string | null;
  fileName?: string | null;
  mimeType?: string | null;
  type?: string | null;
};

function normalizeString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeBoolean(value: unknown): boolean {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value > 0;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    return normalized === "true" || normalized === "1" || normalized === "yes";
  }
  return false;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : null;
}

function pickRecordString(source: Record<string, unknown> | null | undefined, keys: string[]): string {
  if (!source) return "";
  for (const key of keys) {
    const value = normalizeString(source[key]);
    if (value) return value;
  }
  return "";
}

function toSafeCount(value: unknown, fallback = 0): number {
  const parsed = typeof value === "number" ? value : typeof value === "string" && value.trim() ? Number(value) : NaN;
  return Number.isFinite(parsed) ? Math.max(0, Math.floor(parsed)) : fallback;
}

function buildStablePublicProfileMediaId(
  source: Record<string, unknown>,
  index: number,
  kind: PublicProfileSurfaceMediaKind,
  fallbackUri?: string,
): string {
  const explicit =
    normalizeString(source.id) ||
    normalizeString(source.mediaId) ||
    normalizeString(source.assetId) ||
    normalizeString(source.fileId) ||
    normalizeString(source.storageKey);
  if (explicit) return explicit;

  const rawUri =
    normalizeString(source.uri) ||
    normalizeString(source.mediaUri) ||
    normalizeString(source.videoUri) ||
    normalizeString(source.imageUri) ||
    normalizeString(source.thumbnailUri) ||
    normalizeString(source.posterUri) ||
    normalizeString(source.previewUri) ||
    normalizeString(source.downloadUrl) ||
    normalizeString(source.fileUrl) ||
    normalizeString(source.url) ||
    normalizeString(fallbackUri);

  if (rawUri) {
    const clean = rawUri.split("?")[0]?.split("#")[0] || rawUri;
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

function resolveApiBaseUrl(session?: UserProfileApiSession | null): string {
  return requireSabiApiBaseUrl(session?.apiBaseUrl ?? null).replace(/\/+$/, "");
}

function normalizeRelativePath(value: string): string {
  return value.startsWith("/") ? value : `/${value}`;
}

export function isLocalOnlyUserProfileMediaUri(uri?: string | null): boolean {
  const raw = normalizeString(uri);
  return Boolean(raw && /^(file:|content:|asset:|blob:|data:)/i.test(raw));
}

export function isDownloadableUserProfileMediaUri(uri?: string | null): boolean {
  const raw = normalizeString(uri);
  return Boolean(raw && (/^https?:/i.test(raw) || raw.startsWith("/")));
}

export function resolveUserProfileMediaUrl(uri?: string | null, session?: UserProfileApiSession | null): string {
  const raw = normalizeString(uri);
  if (!raw) return "";
  if (/^(https?:|file:|content:|asset:|blob:|data:)/i.test(raw)) return raw;
  return `${resolveApiBaseUrl(session)}${normalizeRelativePath(raw)}`;
}

function buildHeaders(session?: UserProfileApiSession | null, options?: { includeJson?: boolean; includeUser?: boolean }) {
  const headers: Record<string, string> = {};

  if (options?.includeJson !== false) {
    headers["Content-Type"] = "application/json";
  }

  const token = normalizeString(session?.accessToken);
  if (token) headers.Authorization = `Bearer ${token}`;

  const userId = normalizeString(session?.currentUserId);
  if (options?.includeUser !== false && userId) headers["X-User-Id"] = userId;

  return headers;
}

async function parseApiJson(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

function extractData(payload: unknown): unknown {
  const record = asRecord(payload);
  if (record && "data" in record) return record.data;
  if (record && "profile" in record) return record.profile;
  if (record && "user" in record) return record.user;
  return payload;
}

function resolvePublicProfileSurfaceMediaUrls(
  payload: unknown,
  session?: UserProfileApiSession | null,
  fallbackIdentifier?: string | null,
): PublicProfileSurfaceSnapshot {
  const record = (asRecord(payload) ?? {}) as Partial<PublicProfileSurfaceSnapshot> & Record<string, unknown>;
  const fallbackId = normalizeString(fallbackIdentifier || record.userId || record.chatId);

  const normalizeMedia = (value: unknown, fallbackKind: "photo" | "video"): PublicProfileSurfaceMediaItem[] => {
    if (!Array.isArray(value)) return [];

    return value
      .map((item, index) => {
        const raw = asRecord(item);
        if (!raw) return null;

        const kind: PublicProfileSurfaceMediaKind = raw.kind === "video" || raw.mediaKind === "video" || raw.type === "video" || fallbackKind === "video" ? "video" : "photo";
        const mediaUri = resolveUserProfileMediaUrl(pickRecordString(raw, [
          "mediaUri",
          "videoUri",
          "playbackUri",
          "sourceUri",
          "downloadUrl",
          "fileUrl",
          "url",
          "uri",
        ]), session);
        const thumbnailUri = resolveUserProfileMediaUrl(pickRecordString(raw, [
          "thumbnailUri",
          "posterUri",
          "previewUri",
          "imageUri",
          "coverUri",
        ]), session);
        const photoUri = resolveUserProfileMediaUrl(pickRecordString(raw, [
          "uri",
          "imageUri",
          "mediaUri",
          "downloadUrl",
          "fileUrl",
          "url",
          "thumbnailUri",
        ]), session);
        const uri = kind === "video" ? thumbnailUri || mediaUri : photoUri || thumbnailUri || mediaUri;
        const openUri = mediaUri || photoUri || uri || thumbnailUri;

        if (!uri && !openUri) return null;

        const mediaItem: PublicProfileSurfaceMediaItem = {
          id: buildStablePublicProfileMediaId(raw, index, kind, openUri || uri),
          uri: uri || openUri,
          kind,
          mediaUri: openUri || undefined,
          thumbnailUri: thumbnailUri || undefined,
          mimeType: normalizeString(raw.mimeType) || normalizeString(raw.type) || undefined,
          views: typeof raw.views === "number" && Number.isFinite(raw.views) ? Math.max(0, Math.floor(raw.views)) : 0,
          duration: normalizeString(raw.duration) || undefined,
          durationMs: typeof raw.durationMs === "number" && Number.isFinite(raw.durationMs) ? Math.max(0, Math.floor(raw.durationMs)) : undefined,
          liked: typeof raw.liked === "boolean" ? raw.liked : undefined,
        };
        return mediaItem;
      })
      .filter((item): item is PublicProfileSurfaceMediaItem => item !== null);
  };

  const rawPublicGifts = Array.isArray(record.publicGifts)
    ? record.publicGifts
    : Array.isArray(record.publicationGifts)
      ? record.publicationGifts
      : Array.isArray(record.gifts)
        ? record.gifts
        : [];

  const publicGifts = rawPublicGifts.map((item) => {
    const raw = asRecord(item);
    if (!raw) return item;
    return {
      ...raw,
      imageUri: resolveUserProfileMediaUrl(pickRecordString(raw, ["imageUri", "thumbnailUri", "iconUri", "url", "downloadUrl", "fileUrl", "uri"]), session) || undefined,
    };
  });

  const publicationPhotos = normalizeMedia(record.publicationPhotos, "photo");
  const publicationVideos = normalizeMedia(record.publicationVideos, "video");
  const likedByUserIds = Array.isArray(record.likedByUserIds) ? record.likedByUserIds.map((item) => normalizeString(item)).filter(Boolean) : [];
  const likedMediaCount = [...publicationPhotos, ...publicationVideos].filter((item) => Boolean(item?.liked)).length;
  const likesCount = Math.max(
    toSafeCount(record.likesCount),
    toSafeCount(record.publicLikesCount),
    toSafeCount(record.reactionsCount),
    likedByUserIds.length,
    likedMediaCount,
  );

  return {
    ...createEmptyPublicProfileSurface(fallbackId),
    ...record,
    chatId: normalizeString(record.chatId) || normalizeString(record.userId) || fallbackId,
    userId: normalizeString(record.userId) || fallbackId || undefined,
    avatarUri: resolveUserProfileMediaUrl(normalizeString(record.avatarUri), session),
    coverUri: resolveUserProfileMediaUrl(normalizeString(record.coverUri), session),
    publicationPhotos,
    publicationVideos,
    publicGifts: publicGifts as PublicProfileSurfaceSnapshot["publicGifts"],
    aliases: Array.isArray(record.aliases) ? record.aliases.map((item) => normalizeString(item)).filter(Boolean) : fallbackId ? [fallbackId] : [],
    likesCount,
    publicGiftsCount: Math.max(
      toSafeCount(record.publicGiftsCount),
      toSafeCount(record.publicationGiftsCount),
      toSafeCount(record.giftsCount),
      publicGifts.length,
    ),
    likedByUserIds,
    updatedAt: typeof record.updatedAt === "number" && Number.isFinite(record.updatedAt) ? record.updatedAt : Date.now(),
  } as PublicProfileSurfaceSnapshot;
}

function encodePath(value: string) {
  return encodeURIComponent(value).replace(/%40/g, "@");
}

function withTimeout(init: RequestInit | undefined, timeoutMs?: number | null): RequestInit {
  const ms = typeof timeoutMs === "number" && Number.isFinite(timeoutMs) && timeoutMs > 0 ? timeoutMs : 0;
  if (!ms || typeof AbortController === "undefined" || init?.signal) return init ?? {};

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  const next: RequestInit = { ...(init ?? {}), signal: controller.signal };

  const originalFetch = fetch;
  void originalFetch;
  (next as RequestInit & { __sabiTimeoutTimer?: ReturnType<typeof setTimeout> }).__sabiTimeoutTimer = timer;
  return next;
}

async function fetchWithOptionalTimeout(url: string, init?: RequestInit, timeoutMs?: number | null): Promise<Response> {
  const requestInit = withTimeout(init, timeoutMs) as RequestInit & { __sabiTimeoutTimer?: ReturnType<typeof setTimeout> };
  try {
    return await fetch(url, requestInit);
  } finally {
    if (requestInit.__sabiTimeoutTimer) clearTimeout(requestInit.__sabiTimeoutTimer);
  }
}

async function requestProfileEndpoint(
  path: string,
  session?: UserProfileApiSession | null,
  init?: RequestInit,
): Promise<unknown | null> {
  const response = await fetchWithOptionalTimeout(`${resolveApiBaseUrl(session)}${path}`, init, session?.timeoutMs);
  const payload = await parseApiJson(response);

  if (!response.ok) {
    const record = asRecord(payload);
    const error = normalizeString(record?.error) || normalizeString(record?.message) || `profile_api_${response.status}`;
    throw new Error(error);
  }

  return extractData(payload);
}

function normalizeUserProfileSnapshot(payload: unknown, fallbackUserId?: string | null): UserProfileApiSnapshot {
  const data = asRecord(payload) ?? {};
  const userId =
    normalizeString(data.userId) ||
    normalizeString(data.id) ||
    normalizeString(data._id) ||
    normalizeString(fallbackUserId);

  const firstName = normalizeString(data.firstName) || normalizeString(data.givenName);
  const lastName = normalizeString(data.lastName) || normalizeString(data.familyName);
  const usernameRaw = normalizeString(data.username) || normalizeString(data.publicUsername);
  const username = usernameRaw.replace(/^@+/, "");
  const displayName =
    normalizeString(data.displayName) ||
    normalizeString(data.fullName) ||
    [firstName, lastName].filter(Boolean).join(" ").trim() ||
    username ||
    normalizeString(data.phone) ||
    userId;

  return {
    ...data,
    userId,
    phone: normalizeString(data.phone) || normalizeString(data.phoneNumber),
    email: normalizeString(data.email),
    firstName,
    lastName,
    username,
    displayName,
    bio: normalizeString(data.bio) || normalizeString(data.publicBio),
    avatarUri: normalizeString(data.avatarUri) || normalizeString(data.avatarUrl) || normalizeString(data.photoUrl),
    coverUri: normalizeString(data.coverUri) || normalizeString(data.coverUrl),
    profileCompleted: normalizeBoolean(data.profileCompleted ?? data.isProfileCompleted ?? data.completed),
    createdAt: normalizeString(data.createdAt),
    updatedAt: normalizeString(data.updatedAt),
  };
}

export async function fetchUserProfileById(
  userId: string,
  session?: UserProfileApiSession | null,
): Promise<UserProfileApiSnapshot> {
  const target = normalizeString(userId || session?.currentUserId);
  if (!target) throw new Error("user_profile_id_required");

  const encoded = encodePath(target);
  const paths = [
    `/api/v2/users/${encoded}/profile`,
    `/api/v2/users/${encoded}`,
    `/api/users/${encoded}/profile`,
    `/api/users/${encoded}`,
    `/users/${encoded}/profile`,
  ];

  let lastError: unknown = null;
  for (const path of paths) {
    try {
      const data = await requestProfileEndpoint(path, session, {
        method: "GET",
        headers: buildHeaders(session, { includeJson: false, includeUser: true }),
      });
      return normalizeUserProfileSnapshot(data, target);
    } catch (error) {
      lastError = error;
      const message = error instanceof Error ? error.message : String(error ?? "");
      if (!/profile_api_404|user_not_found|profile_not_found|not_found/i.test(message)) throw error;
    }
  }

  throw lastError instanceof Error ? lastError : new Error("user_profile_not_found");
}

export async function saveUserProfileToApi(
  payload: Partial<UserProfileApiSnapshot> & { userId?: string | null },
  session?: UserProfileApiSession | null,
): Promise<UserProfileApiSnapshot> {
  const targetUserId = normalizeString(payload.userId || session?.currentUserId);
  if (!targetUserId) throw new Error("user_profile_id_required");

  const encoded = encodePath(targetUserId);
  const data = await requestProfileEndpoint(`/api/v2/users/${encoded}/profile`, session, {
    method: "PUT",
    headers: buildHeaders(session, { includeJson: true, includeUser: true }),
    body: JSON.stringify({ ...payload, userId: targetUserId }),
  });

  return normalizeUserProfileSnapshot(data, targetUserId);
}


function createEmptyPublicProfileSurface(identifier?: string | null): PublicProfileSurfaceSnapshot {
  const id = normalizeString(identifier);
  return {
    chatId: id,
    userId: id || undefined,
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
    aliases: id ? [id] : [],
    updatedAt: 0,
  };
}

export async function fetchUserPublicProfileSurface(
  identifier?: string | null,
  session?: UserProfileApiSession | null,
): Promise<PublicProfileSurfaceSnapshot> {
  const target = normalizeString(identifier);
  if (!target) return createEmptyPublicProfileSurface(identifier);

  const encoded = encodePath(target);
  const paths = [
    `/api/v2/users/public-profile/${encoded}`,
    `/api/users/public-profile/${encoded}`,
    `/users/public-profile/${encoded}`,
  ];

  for (const path of paths) {
    try {
      const data = await requestProfileEndpoint(path, session, {
        method: "GET",
        headers: buildHeaders(session, { includeJson: false, includeUser: false }),
      });
      return resolvePublicProfileSurfaceMediaUrls(data, session, target);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error ?? "");
      if (!/public_profile_not_found|profile_api_404|not_found/i.test(message)) {
        throw error;
      }
    }
  }

  return createEmptyPublicProfileSurface(target);
}

export async function saveUserPublicProfileSurface(
  userId: string,
  payload: Partial<PublicProfileSurfaceSnapshot>,
  session?: UserProfileApiSession | null,
): Promise<PublicProfileSurfaceSnapshot> {
  const targetUserId = normalizeString(userId || payload.userId || payload.chatId);
  if (!targetUserId) throw new Error("public_profile_user_id_required");

  const encoded = encodePath(targetUserId);
  const data = await requestProfileEndpoint(`/api/v2/users/${encoded}/public-profile`, session, {
    method: "PUT",
    headers: buildHeaders(session, { includeJson: true, includeUser: true }),
    body: JSON.stringify({ ...payload, userId: targetUserId }),
  });

  return resolvePublicProfileSurfaceMediaUrls(data, session, targetUserId);
}

export async function likeUserPublicProfileSurface(
  identifier: string,
  currentUserId?: string | null,
  session?: UserProfileApiSession | null,
  options?: {
    liked?: boolean;
    mediaId?: string | null;
    mediaKind?: "photo" | "video" | null;
  },
): Promise<PublicProfileSurfaceSnapshot> {
  const target = normalizeString(identifier);
  const actorUserId = normalizeString(currentUserId || session?.currentUserId);
  if (!target) throw new Error("public_profile_identifier_required");
  if (!actorUserId) throw new Error("public_profile_like_user_required");

  const encoded = encodePath(target);
  const data = await requestProfileEndpoint(`/api/v2/users/public-profile/${encoded}/like`, session, {
    method: "POST",
    headers: buildHeaders({ ...session, currentUserId: actorUserId }, { includeJson: true, includeUser: true }),
    body: JSON.stringify({
      actorUserId,
      currentUserId: actorUserId,
      liked: options?.liked !== false,
      mediaId: normalizeString(options?.mediaId),
      mediaKind: options?.mediaKind === "video" ? "video" : options?.mediaKind === "photo" ? "photo" : undefined,
    }),
  });

  return resolvePublicProfileSurfaceMediaUrls(data, session, target);
}

function extensionFromMimeType(mimeType?: string | null) {
  const value = normalizeString(mimeType).toLowerCase();
  switch (value) {
    case "image/png":
      return ".png";
    case "image/webp":
      return ".webp";
    case "image/gif":
      return ".gif";
    case "video/quicktime":
      return ".mov";
    case "video/webm":
      return ".webm";
    case "video/x-m4v":
      return ".m4v";
    case "video/3gpp":
      return ".3gp";
    case "video/3gpp2":
      return ".3g2";
    case "video/mpeg":
      return ".mpeg";
    case "video/mp4":
      return ".mp4";
    case "image/jpeg":
    default:
      return value.startsWith("video/") ? ".mp4" : ".jpg";
  }
}

function fileNameFromUri(uri: string, fallback: string) {
  const clean = uri.split("?")[0]?.split("#")[0] || uri;
  const last = decodeURIComponent(clean.split("/").filter(Boolean).pop() || "");
  return last && /\.[a-z0-9]{1,12}$/i.test(last) ? last : fallback;
}

function mimeFromName(name: string, explicit?: string | null) {
  const value = normalizeString(explicit);
  if (value) return value;
  const lower = name.toLowerCase();
  if (lower.endsWith(".png")) return "image/png";
  if (lower.endsWith(".webp")) return "image/webp";
  if (lower.endsWith(".gif")) return "image/gif";
  if (lower.endsWith(".mov")) return "video/quicktime";
  if (lower.endsWith(".webm")) return "video/webm";
  if (lower.endsWith(".m4v")) return "video/x-m4v";
  if (lower.endsWith(".3gp")) return "video/3gpp";
  if (lower.endsWith(".3g2")) return "video/3gpp2";
  if (lower.endsWith(".mpeg") || lower.endsWith(".mpg")) return "video/mpeg";
  if (lower.endsWith(".mp4")) return "video/mp4";
  return lower.match(/\.(mp4|mov|webm|m4v|3gp|3g2|mpeg|mpg)$/) ? "video/mp4" : "image/jpeg";
}

function ensureUploadFileName(rawName: string, mimeType: string) {
  const cleaned = normalizeString(rawName).replace(/[\\/]+/g, "-").replace(/\s+/g, "-");
  const fallback = `sabi-profile-media-${Date.now()}${extensionFromMimeType(mimeType)}`;
  const base = cleaned || fallback;
  return /\.[a-z0-9]{1,12}$/i.test(base) ? base : `${base}${extensionFromMimeType(mimeType)}`;
}

function parseDataUri(uri: string): { mimeType: string; data: string } | null {
  const match = /^data:([^;,]+)?(?:;charset=[^;,]+)?;base64,(.*)$/i.exec(uri);
  if (!match) return null;
  const data = normalizeString(match[2]);
  if (!data) return null;
  return {
    mimeType: normalizeString(match[1]) || "application/octet-stream",
    data,
  };
}

function extractUploadedMediaUri(payload: unknown) {
  const data = extractData(payload) as Record<string, unknown> | null;
  return (
    normalizeString(data?.mediaUri) ||
    normalizeString(data?.url) ||
    normalizeString(data?.fileUrl) ||
    normalizeString(data?.downloadUrl)
  );
}

async function uploadUserPublicProfileBase64MediaFile(
  file: UploadableProfileMediaFile,
  session?: UserProfileApiSession | null,
): Promise<string | null> {
  const uri = normalizeString(file.uri);
  const parsed = parseDataUri(uri);
  if (!parsed) return null;

  const mimeType = normalizeString(file.mimeType || file.type) || parsed.mimeType;
  const name = ensureUploadFileName(normalizeString(file.name || file.fileName), mimeType);
  const response = await fetchWithOptionalTimeout(`${resolveApiBaseUrl(session)}/api/v2/media/upload-base64`, {
    method: "POST",
    headers: buildHeaders(session, { includeJson: true, includeUser: true }),
    body: JSON.stringify({ data: parsed.data, fileName: name, name, mimeType }),
  }, session?.timeoutMs);
  const payload = await parseApiJson(response);

  if (!response.ok) {
    const record = asRecord(payload);
    throw new Error(normalizeString(record?.error) || normalizeString(record?.message) || `profile_media_upload_base64_${response.status}`);
  }

  const uploadedUri = extractUploadedMediaUri(payload);
  return uploadedUri ? resolveUserProfileMediaUrl(uploadedUri, session) : null;
}

export async function uploadUserPublicProfileMediaFile(
  file: UploadableProfileMediaFile,
  session?: UserProfileApiSession | null,
): Promise<string | null> {
  const uri = normalizeString(file.uri);
  if (!uri) return null;

  if (/^https?:/i.test(uri)) return uri;
  if (/^data:/i.test(uri)) return uploadUserPublicProfileBase64MediaFile(file, session);

  const explicitMimeType = normalizeString(file.mimeType || file.type);
  const fallbackName = `sabi-profile-media-${Date.now()}${extensionFromMimeType(explicitMimeType)}`;
  const rawName = normalizeString(file.name || file.fileName) || fileNameFromUri(uri, fallbackName);
  const mimeType = mimeFromName(rawName, explicitMimeType);
  const name = ensureUploadFileName(rawName, mimeType);

  const formData = new FormData();
  formData.append("file", {
    uri,
    name,
    type: mimeType,
  } as unknown as Blob);

  const response = await fetchWithOptionalTimeout(`${resolveApiBaseUrl(session)}/api/v2/media/upload`, {
    method: "POST",
    headers: buildHeaders(session, { includeJson: false, includeUser: true }),
    body: formData,
  }, session?.timeoutMs);
  const payload = await parseApiJson(response);

  if (!response.ok) {
    const record = asRecord(payload);
    throw new Error(normalizeString(record?.error) || normalizeString(record?.message) || `profile_media_upload_${response.status}`);
  }

  const uploadedUri = extractUploadedMediaUri(payload);
  return uploadedUri ? resolveUserProfileMediaUrl(uploadedUri, session) : null;
}
