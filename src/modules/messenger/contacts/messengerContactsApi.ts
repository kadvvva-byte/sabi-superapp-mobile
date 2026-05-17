import { resolveMessengerKernelSession } from "../../../core/kernel/messenger/session/service";

export type MessengerDirectoryUser = {
  userId: string;
  displayName: string;
  username: string | null;
  phone: string | null;
  avatarUrl: string | null;
  verified: boolean;
};

export type MessengerEnsuredRoom = {
  chatId: string;
  roomType: "direct" | "business";
  name?: string | null;
  subtitle?: string | null;
  peerUserId?: string | null;
  currentUserId?: string | null;
  avatarUrl?: string | null;
  photoUrl?: string | null;
  verified?: boolean;
};

type FetchMessengerUsersParams = {
  query?: string;
  currentUserId?: string;
  limit?: number;
  apiBaseUrl?: string;
  accessToken?: string;
  signal?: AbortSignal;
};

type EnsureMessengerDirectRoomParams = {
  peerUserId?: string | null;
  currentUserId?: string;
  displayName?: string | null;
  username?: string | null;
  phone?: string | null;
  avatarUrl?: string | null;
  apiBaseUrl?: string;
  accessToken?: string;
  signal?: AbortSignal;
};

type ResolvedRequestContext = {
  apiBaseUrl: string;
  currentUserId: string;
  accessToken: string;
};

function normalizeString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeApiBaseUrl(value: unknown) {
  return normalizeString(value).replace(/\/+$/, "");
}

async function resolveRequestContext(
  params: FetchMessengerUsersParams | EnsureMessengerDirectRoomParams,
): Promise<ResolvedRequestContext> {
  const directApiBaseUrl = normalizeApiBaseUrl(params.apiBaseUrl);
  const directCurrentUserId = normalizeString(params.currentUserId);
  const directAccessToken = normalizeString(params.accessToken);

  if (directApiBaseUrl && directCurrentUserId) {
    return { apiBaseUrl: directApiBaseUrl, currentUserId: directCurrentUserId, accessToken: directAccessToken };
  }

  const session = await resolveMessengerKernelSession();
  const apiBaseUrl = directApiBaseUrl || normalizeApiBaseUrl(session?.apiBaseUrl);
  const currentUserId = directCurrentUserId || normalizeString(session?.currentUserId);
  const accessToken = directAccessToken || normalizeString(session?.accessToken);

  if (!apiBaseUrl) throw new Error("Messenger API base URL is unavailable.");
  if (!currentUserId) throw new Error("Messenger current user id is unavailable.");

  return { apiBaseUrl, currentUserId, accessToken };
}

function buildMessengerApiUrl(context: ResolvedRequestContext, path: string) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${context.apiBaseUrl}/api/v2/messenger${normalizedPath}`;
}

function buildHeaders(context: ResolvedRequestContext, json = false) {
  return {
    Accept: "application/json",
    ...(json ? { "Content-Type": "application/json" } : {}),
    ...(context.accessToken ? { Authorization: `Bearer ${context.accessToken}` } : {}),
    "x-user-id": context.currentUserId,
    "x-current-user-id": context.currentUserId,
  };
}

async function readJsonSafe(response: Response): Promise<unknown> {
  const raw = await response.text();
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return raw;
  }
}

function unwrapData(value: unknown) {
  if (value && typeof value === "object" && "data" in (value as Record<string, unknown>)) {
    return (value as Record<string, unknown>).data;
  }
  return value;
}

function normalizeDirectoryUsers(data: unknown): MessengerDirectoryUser[] {
  const payload = unwrapData(data);
  const source = Array.isArray(payload)
    ? payload
    : payload && typeof payload === "object" && Array.isArray((payload as Record<string, unknown>).users)
      ? ((payload as Record<string, unknown>).users as unknown[])
      : [];

  return source
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const record = item as Record<string, unknown>;
      const userId = normalizeString(record.userId ?? record.id);
      if (!userId) return null;

      return {
        userId,
        displayName:
          normalizeString(record.displayName) ||
          normalizeString(record.name) ||
          normalizeString(record.fullName) ||
          "Sabi User",
        username: normalizeString(record.username ?? record.handle) || null,
        phone: normalizeString(record.phone ?? record.phoneNumber) || null,
        avatarUrl:
          normalizeString(record.avatarUrl) ||
          normalizeString(record.avatarUri) ||
          normalizeString(record.photoUrl) ||
          null,
        verified: Boolean(record.verified),
      } satisfies MessengerDirectoryUser;
    })
    .filter((item): item is MessengerDirectoryUser => Boolean(item));
}

function normalizeEnsuredRoom(
  value: unknown,
  fallback: EnsureMessengerDirectRoomParams & { currentUserId: string },
): MessengerEnsuredRoom | null {
  const payload = unwrapData(value);
  if (!payload || typeof payload !== "object") return null;

  const record = payload as Record<string, unknown>;
  const nestedChat = record.chat && typeof record.chat === "object"
    ? (record.chat as Record<string, unknown>)
    : null;
  const chatId =
    normalizeString(record.chatId) ||
    normalizeString(record.roomId) ||
    normalizeString(record.conversationId) ||
    normalizeString(record.id) ||
    normalizeString(nestedChat?.id);

  if (!chatId) return null;

  return {
    chatId,
    roomType: "direct",
    name:
      normalizeString(record.name) ||
      normalizeString(record.title) ||
      normalizeString(nestedChat?.title) ||
      normalizeString(fallback.displayName) ||
      null,
    subtitle:
      normalizeString(record.subtitle) ||
      normalizeString(fallback.username) ||
      normalizeString(fallback.phone) ||
      null,
    peerUserId:
      normalizeString(record.peerUserId) ||
      normalizeString(record.peerId) ||
      normalizeString(record.targetUserId) ||
      normalizeString(fallback.peerUserId) || null,
    currentUserId:
      normalizeString(record.currentUserId) ||
      normalizeString(record.selfUserId) ||
      fallback.currentUserId,
    avatarUrl:
      normalizeString(record.avatarUrl) ||
      normalizeString(record.avatarUri) ||
      normalizeString(record.photoUrl) ||
      normalizeString(fallback.avatarUrl) ||
      null,
    photoUrl:
      normalizeString(record.photoUrl) ||
      normalizeString(record.avatarUrl) ||
      normalizeString(record.avatarUri) ||
      normalizeString(fallback.avatarUrl) ||
      null,
    verified: Boolean(record.verified),
  };
}

export async function fetchMessengerUsers(
  params: FetchMessengerUsersParams = {},
): Promise<MessengerDirectoryUser[]> {
  let context: ResolvedRequestContext;
  try {
    context = await resolveRequestContext(params);
  } catch {
    return [];
  }

  const url = new URL(buildMessengerApiUrl(context, "/users/search"));
  if (params.query?.trim()) url.searchParams.set("q", params.query.trim());
  url.searchParams.set("currentUserId", context.currentUserId);
  url.searchParams.set("limit", String(params.limit ?? 20));

  try {
    const response = await fetch(url.toString(), {
      method: "GET",
      headers: buildHeaders(context),
      signal: params.signal,
    });
    const payload = await readJsonSafe(response);
    if (!response.ok) return [];
    return normalizeDirectoryUsers(payload);
  } catch {
    return [];
  }
}

export async function ensureMessengerDirectRoom(
  params: EnsureMessengerDirectRoomParams,
): Promise<MessengerEnsuredRoom | null> {
  const peerUserId = normalizeString(params.peerUserId);
  const username = normalizeString(params.username);
  const phone = normalizeString(params.phone);

  if (!peerUserId && !username && !phone) return null;

  const context = await resolveRequestContext(params);
  const body = {
    user1: context.currentUserId,
    ...(peerUserId ? { user2: peerUserId } : {}),
    currentUserId: context.currentUserId,
    selfUserId: context.currentUserId,
    ...(peerUserId
      ? {
          peerUserId,
          peerId: peerUserId,
          partnerId: peerUserId,
          targetUserId: peerUserId,
        }
      : {}),
    displayName: normalizeString(params.displayName) || undefined,
    username: username || undefined,
    handle: username || undefined,
    peerUsername: username || undefined,
    phone: phone || undefined,
    peerPhone: phone || undefined,
    avatarUrl: normalizeString(params.avatarUrl) || undefined,
  };

  const endpoints = ["/chats/private", "/chats/direct", "/rooms/direct"];

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(buildMessengerApiUrl(context, endpoint), {
        method: "POST",
        headers: buildHeaders(context, true),
        body: JSON.stringify(body),
        signal: params.signal,
      });
      const payload = await readJsonSafe(response);
      if (!response.ok) continue;

      const room = normalizeEnsuredRoom(payload, { ...params, currentUserId: context.currentUserId, peerUserId: peerUserId || null });
      if (room) return room;
    } catch {
      continue;
    }
  }

  return null;
}
