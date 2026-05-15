import {
  getMessengerKernelFetch,
  requireMessengerKernelSessionSnapshot,
} from "../../../core/kernel/messenger/session/service";
import type { SabiPublicDirectoryItem } from "./publicDirectoryClient";

export type SabiPublicDirectoryActionResult<T = unknown> = {
  ok: boolean;
  data: T | null;
  error?: string | null;
  code?: string | null;
  status?: number;
  endpoint?: string;
  blocked?: boolean;
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

function buildDirectoryHeaders(session: {
  accessToken: string;
  currentUserId: string;
}, withJsonBody = false): Record<string, string> {
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

  if (!text.trim()) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

const SABI_PUBLIC_DIRECTORY_ACTION_BLOCKED_ERRORS = new Set([
  "public_directory_item_not_visible",
  "directory_item_not_allowed",
  "directory_item_hidden",
  "directory_item_restricted",
  "directory_item_rejected",
  "directory_item_unsafe",
  "group_not_visible",
  "channel_not_visible",
  "bot_not_visible",
]);

function readActionPayloadString(payload: unknown, key: "error" | "code" | "message") {
  if (!payload || typeof payload !== "object") return null;
  const value = (payload as Record<string, unknown>)[key];
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function normalizeDirectoryActionError(status: number, payload: unknown) {
  const code =
    readActionPayloadString(payload, "code") ||
    readActionPayloadString(payload, "error") ||
    (status === 403 ? "public_directory_item_not_visible" : `http_${status}`);
  const message = readActionPayloadString(payload, "message") || code;
  const blocked = status === 403 || SABI_PUBLIC_DIRECTORY_ACTION_BLOCKED_ERRORS.has(code);

  return { code, message, blocked };
}

async function postDirectoryAction<T = unknown>(
  path: string,
  body?: Record<string, unknown>,
): Promise<SabiPublicDirectoryActionResult<T>> {
  const session = await readDirectorySession();

  if (!session) {
    return {
      ok: false,
      data: null,
      error: "messenger_kernel_session_not_ready",
      code: "messenger_kernel_session_not_ready",
      status: 0,
      endpoint: path,
      blocked: false,
    };
  }

  try {
    const response = await session.fetchImpl(`${session.apiBaseUrl}${path}`, {
      method: "POST",
      headers: buildDirectoryHeaders(session, true),
      body: JSON.stringify(body ?? {}),
    });

    const payload = await readJson(response as Response);

    if (!response.ok) {
      const normalized = normalizeDirectoryActionError(response.status, payload);

      return {
        ok: false,
        data: null,
        error: normalized.message,
        code: normalized.code,
        status: response.status,
        endpoint: path,
        blocked: normalized.blocked,
      };
    }

    return {
      ok: true,
      data: (payload?.data ?? null) as T,
      error: null,
      code: null,
      status: response.status,
      endpoint: path,
      blocked: false,
    };
  } catch (error) {
    return {
      ok: false,
      data: null,
      error: error instanceof Error ? error.message : "network_error",
      code: "network_error",
      status: 0,
      endpoint: path,
      blocked: false,
    };
  }
}

function encodeId(value: string) {
  return encodeURIComponent(value.trim());
}

export async function joinSabiPublicGroup(roomId: string) {
  if (!roomId.trim()) {
    return {
      ok: false,
      data: null,
      error: "group_id_required",
    } satisfies SabiPublicDirectoryActionResult<SabiPublicDirectoryItem>;
  }

  return postDirectoryAction<SabiPublicDirectoryItem>(
    `/api/v2/messenger/groups/${encodeId(roomId)}/join`,
  );
}

export async function addSabiPublicGroupMember(roomId: string, userId: string) {
  if (!roomId.trim() || !userId.trim()) {
    return {
      ok: false,
      data: null,
      error: "group_or_user_id_required",
    } satisfies SabiPublicDirectoryActionResult;
  }

  return postDirectoryAction(`/api/v2/messenger/groups/${encodeId(roomId)}/members`, {
    userId: userId.trim(),
  });
}

export async function inviteSabiPublicGroup(roomId: string, inviteeUserId?: string | null) {
  if (!roomId.trim()) {
    return {
      ok: false,
      data: null,
      error: "group_id_required",
    } satisfies SabiPublicDirectoryActionResult;
  }

  return postDirectoryAction(`/api/v2/messenger/groups/${encodeId(roomId)}/invite`, {
    inviteeUserId: inviteeUserId?.trim() || null,
  });
}

export async function subscribeSabiPublicChannel(roomId: string) {
  if (!roomId.trim()) {
    return {
      ok: false,
      data: null,
      error: "channel_id_required",
    } satisfies SabiPublicDirectoryActionResult<SabiPublicDirectoryItem>;
  }

  return postDirectoryAction<SabiPublicDirectoryItem>(
    `/api/v2/messenger/channels/${encodeId(roomId)}/subscribe`,
  );
}

export async function addSabiPublicChannelSubscriber(roomId: string, userId: string) {
  if (!roomId.trim() || !userId.trim()) {
    return {
      ok: false,
      data: null,
      error: "channel_or_user_id_required",
    } satisfies SabiPublicDirectoryActionResult;
  }

  return postDirectoryAction(`/api/v2/messenger/channels/${encodeId(roomId)}/subscribers`, {
    userId: userId.trim(),
  });
}

export async function inviteSabiPublicChannel(roomId: string, inviteeUserId?: string | null) {
  if (!roomId.trim()) {
    return {
      ok: false,
      data: null,
      error: "channel_id_required",
    } satisfies SabiPublicDirectoryActionResult;
  }

  return postDirectoryAction(`/api/v2/messenger/channels/${encodeId(roomId)}/invite`, {
    inviteeUserId: inviteeUserId?.trim() || null,
  });
}

export async function startSabiPublicBot(botId: string) {
  if (!botId.trim()) {
    return {
      ok: false,
      data: null,
      error: "bot_id_required",
    } satisfies SabiPublicDirectoryActionResult<SabiPublicDirectoryItem>;
  }

  return postDirectoryAction<SabiPublicDirectoryItem>(
    `/api/v2/messenger/bots/${encodeId(botId)}/start`,
  );
}
