import { getAuthSessionState } from "../../../core/kernel/auth/session.store";
import {
  hydratePublicProfileByAnyIdentifier,
  normalizePublicProfileSurface,
  savePublicProfile,
  type PublicProfileSurfaceMediaItem,
  type PublicProfileSurfaceSnapshot,
} from "./publicProfileRuntime";
import {
  isDownloadableUserProfileMediaUri,
  isLocalOnlyUserProfileMediaUri,
  resolveUserProfileMediaUrl,
  saveUserPublicProfileSurface,
} from "../../../shared/api/user-profile-api";

type ProfileAccountLike = {
  userId?: string | null;
  sabiDisplayId?: string | null;
  phone?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  username?: string | null;
  fullName?: string | null;
  bio?: string | null;
  subtitle?: string | null;
  birthday?: string | null;
  avatarUri?: string | null;
  coverUri?: string | null;
};

type ProfilePublicLike = {
  publicName?: string | null;
  publicUsername?: string | null;
  publicBio?: string | null;
  publicSubtitle?: string | null;
};

type ProfileMediaLike = {
  id?: string | null;
  uri?: string | null;
  type?: string | null;
  kind?: string | null;
  thumbnailUri?: string | null;
  mediaUri?: string | null;
  mimeType?: string | null;
  createdAt?: number | null;
  duration?: string | null;
  durationMs?: number | null;
  liked?: boolean | null;
};

type ProfileKernelStateLike = {
  account?: ProfileAccountLike | null;
  publicProfile?: ProfilePublicLike | null;
  avatarUri?: string | null;
  coverUri?: string | null;
  photos?: ProfileMediaLike[] | null;
  shortVideos?: ProfileMediaLike[] | null;
  likesCount?: number | null;
  giftsCount?: number | null;
};

function normalizeString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeUsername(value: unknown): string {
  const raw = normalizeString(value).replace(/^@+/, "");
  return raw ? `@${raw}` : "";
}

function normalizePhone(value: unknown): string {
  return normalizeString(value).replace(/[^\d+]/g, "");
}

function toNumber(value: unknown): number {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? Math.max(0, Math.floor(parsed)) : 0;
}

function normalizeLikedByUserIds(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  const seen = new Set<string>();
  const result: string[] = [];

  value.forEach((item) => {
    const normalized = normalizeString(item);
    if (!normalized || seen.has(normalized)) return;
    seen.add(normalized);
    result.push(normalized);
  });

  return result;
}

function countLikedMedia(photos?: PublicProfileSurfaceMediaItem[] | null, videos?: PublicProfileSurfaceMediaItem[] | null): number {
  return [
    ...(Array.isArray(photos) ? photos : []),
    ...(Array.isArray(videos) ? videos : []),
  ].filter((item) => Boolean(item?.liked)).length;
}

function buildDisplayName(account?: ProfileAccountLike | null, publicProfile?: ProfilePublicLike | null): string {
  const publicName = normalizeString(publicProfile?.publicName);
  if (publicName) return publicName;

  const fullName = normalizeString(account?.fullName);
  if (fullName) return fullName;

  const composed = [account?.firstName, account?.lastName]
    .map((value) => normalizeString(value))
    .filter(Boolean)
    .join(" ");
  if (composed) return composed;

  const username = normalizeString(account?.username).replace(/^@+/, "");
  if (username) return username;

  return normalizeString(account?.phone) || "";
}

function pickShareableMediaUri(...values: Array<string | null | undefined>) {
  for (const value of values) {
    const uri = normalizeString(value);
    if (!uri || isLocalOnlyUserProfileMediaUri(uri)) continue;
    if (isDownloadableUserProfileMediaUri(uri)) return uri;
  }

  return "";
}

function mapMediaItem(item: ProfileMediaLike, kind: "photo" | "video"): PublicProfileSurfaceMediaItem | null {
  const mediaUri = pickShareableMediaUri(item.mediaUri, item.uri);
  const thumbnailUri = pickShareableMediaUri(item.thumbnailUri);
  const uri = kind === "video"
    ? thumbnailUri || mediaUri
    : pickShareableMediaUri(item.uri, item.mediaUri, item.thumbnailUri);
  const openUri = mediaUri || uri || thumbnailUri;

  if (!uri && !openUri) return null;

  return {
    id: normalizeString(item.id) || `${kind}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    uri: uri || openUri,
    kind,
    mediaUri: openUri || undefined,
    thumbnailUri: thumbnailUri || undefined,
    mimeType: normalizeString(item.mimeType) || undefined,
    duration: normalizeString(item.duration) || undefined,
    durationMs: typeof item.durationMs === "number" ? item.durationMs : undefined,
    liked: typeof item.liked === "boolean" ? item.liked : undefined,
  };
}

export function buildCurrentProfilePublicSurface(state?: ProfileKernelStateLike | null): PublicProfileSurfaceSnapshot | null {
  if (!state) return null;
  const account = state.account ?? {};
  const publicProfile = state.publicProfile ?? {};
  const userId = normalizeString(account.userId);
  const fallbackId = userId || normalizeString(account.sabiDisplayId) || normalizeString(account.phone);
  if (!fallbackId) return null;

  const displayName = buildDisplayName(account, publicProfile);
  const username = normalizeUsername(publicProfile.publicUsername || account.username);
  const phone = normalizePhone(account.phone);
  const session = getAuthSessionState();
  const avatarUri = normalizeString(state.avatarUri || account.avatarUri);
  const coverUri = normalizeString(state.coverUri || account.coverUri);
  const aliases = [
    userId,
    account.sabiDisplayId,
    account.phone,
    account.username,
    username,
    username.replace(/^@+/, ""),
  ].filter(Boolean) as string[];
  const existingSurface = hydratePublicProfileByAnyIdentifier(aliases);
  const existingLikedByUserIds = normalizeLikedByUserIds(existingSurface?.likedByUserIds);

  const publicationPhotos = Array.isArray(state.photos)
    ? state.photos
        .map((item) => mapMediaItem(item, "photo"))
        .filter((item): item is PublicProfileSurfaceMediaItem => item !== null)
        .map((item) => ({
          ...item,
          uri: resolveUserProfileMediaUrl(item.uri, session),
          mediaUri: item.mediaUri ? resolveUserProfileMediaUrl(item.mediaUri, session) : undefined,
          thumbnailUri: item.thumbnailUri ? resolveUserProfileMediaUrl(item.thumbnailUri, session) : undefined,
        }))
    : [];

  const publicationVideos = Array.isArray(state.shortVideos)
    ? state.shortVideos
        .map((item) => mapMediaItem(item, "video"))
        .filter((item): item is PublicProfileSurfaceMediaItem => item !== null)
        .map((item) => ({
          ...item,
          uri: resolveUserProfileMediaUrl(item.uri, session),
          mediaUri: item.mediaUri ? resolveUserProfileMediaUrl(item.mediaUri, session) : undefined,
          thumbnailUri: item.thumbnailUri ? resolveUserProfileMediaUrl(item.thumbnailUri, session) : undefined,
        }))
    : [];

  const preservedLikesCount = Math.max(
    toNumber(state.likesCount),
    toNumber(existingSurface?.likesCount),
    existingLikedByUserIds.length,
    countLikedMedia(publicationPhotos, publicationVideos),
    countLikedMedia(existingSurface?.publicationPhotos, existingSurface?.publicationVideos),
  );

  return normalizePublicProfileSurface(fallbackId, {
    chatId: userId || fallbackId,
    userId: userId || undefined,
    displayName: displayName || undefined,
    publicName: displayName || undefined,
    username: username || undefined,
    publicUsername: username || undefined,
    bio: normalizeString(publicProfile.publicBio || account.bio) || undefined,
    publicBio: normalizeString(publicProfile.publicBio || account.bio) || undefined,
    subtitle: normalizeString(publicProfile.publicSubtitle || account.subtitle) || undefined,
    publicSubtitle: normalizeString(publicProfile.publicSubtitle || account.subtitle) || undefined,
    phone: phone || undefined,
    birthday: normalizeString(account.birthday) || undefined,
    avatarUri: resolveUserProfileMediaUrl(pickShareableMediaUri(avatarUri), session),
    coverUri: resolveUserProfileMediaUrl(pickShareableMediaUri(coverUri), session),
    publicationPhotos,
    publicationVideos,
    publicGifts: [],
    likesCount: preservedLikesCount,
    publicGiftsCount: toNumber(state.giftsCount),
    likedByUserIds: existingLikedByUserIds,
    aliases,
  });
}

export function syncCurrentProfilePublicSurface(state?: ProfileKernelStateLike | null): PublicProfileSurfaceSnapshot | null {
  const surface = buildCurrentProfilePublicSurface(state);
  if (!surface) return null;

  savePublicProfile(surface.userId || surface.chatId, surface);
  surface.aliases.forEach((alias) => savePublicProfile(alias, surface));
  return surface;
}

export async function syncCurrentProfilePublicSurfaceToBackend(
  state?: ProfileKernelStateLike | null,
): Promise<PublicProfileSurfaceSnapshot | null> {
  const surface = syncCurrentProfilePublicSurface(state);
  if (!surface) return null;

  const session = getAuthSessionState();
  const userId = normalizeString(surface.userId || surface.chatId || session.currentUserId);
  if (!userId) return surface;

  const saved = await saveUserPublicProfileSurface(userId, surface, session);
  savePublicProfile(saved.userId || saved.chatId || userId, saved);
  saved.aliases?.forEach((alias) => savePublicProfile(alias, saved));
  return saved;
}
