import { MessengerKernelError } from "../core/errors";
import {
  getMessengerKernelFetch,
  requireMessengerKernelSessionSnapshot,
} from "../session/service";
import type {
  KernelMessengerCreateMessageInput,
  KernelMessengerMessagesQuery,
  KernelMessengerUpdateMessageInput,
} from "./types";

function normalizeRequiredId(value: string, fieldName: string) {
  const normalized = value.trim();

  if (!normalized) {
    throw new MessengerKernelError({
      code: "MESSENGER_KERNEL_INVALID_STATE",
      message: `Messenger ${fieldName} is required`,
    });
  }

  return normalized;
}

function buildMessagesQueryString(query: Omit<KernelMessengerMessagesQuery, "roomId">) {
  const params = new URLSearchParams();

  if (query.cursor?.trim()) {
    params.set("cursor", query.cursor.trim());
  }

  if (typeof query.limit === "number" && Number.isFinite(query.limit)) {
    params.set("limit", String(query.limit));
  }

  if (query.beforeMessageId?.trim()) {
    params.set("beforeMessageId", query.beforeMessageId.trim());
  }

  if (query.afterMessageId?.trim()) {
    params.set("afterMessageId", query.afterMessageId.trim());
  }

  const serialized = params.toString();
  return serialized ? `?${serialized}` : "";
}

function normalizeHeaders(
  accessToken: string,
  currentUserId: string,
  headers?: HeadersInit,
  withJsonBody = false,
): Record<string, string> {
  const normalized: Record<string, string> = {
    Accept: "application/json",
    Authorization: `Bearer ${accessToken}`,
    "x-user-id": currentUserId,
    "x-current-user-id": currentUserId,
  };

  if (withJsonBody) {
    normalized["Content-Type"] = "application/json";
  }

  if (!headers) {
    return normalized;
  }

  if (headers instanceof Headers) {
    headers.forEach((value, key) => {
      normalized[key] = value;
    });
    return normalized;
  }

  if (Array.isArray(headers)) {
    headers.forEach(([key, value]) => {
      normalized[key] = value;
    });
    return normalized;
  }

  return {
    ...normalized,
    ...headers,
  };
}

function normalizeMessengerPath(apiBaseUrl: string, path: string) {
  const base = apiBaseUrl.replace(/\/+$/, "");

  if (base.endsWith("/messenger") && path.startsWith("/messenger/")) {
    return path.replace(/^\/messenger/, "");
  }

  return path;
}

async function parseResponseBody(response: Response) {
  if (response.status === 204) {
    return null;
  }

  const contentType = response.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    return response.json();
  }

  return response.text();
}

function readPeerField(input: KernelMessengerCreateMessageInput, fieldName: string): string | null {
  const record = input as unknown as Record<string, unknown>;
  const metadata =
    input.metadata && typeof input.metadata === "object" && !Array.isArray(input.metadata)
      ? (input.metadata as Record<string, unknown>)
      : {};

  const direct = record[fieldName];
  if (typeof direct === "string" && direct.trim()) {
    return direct.trim();
  }

  const nested = metadata[fieldName];
  if (typeof nested === "string" && nested.trim()) {
    return nested.trim();
  }

  return null;
}

async function performMessengerMessagesRequest<TResponse>(
  path: string,
  init?: RequestInit,
): Promise<TResponse> {
  const session = await requireMessengerKernelSessionSnapshot();
  const fetchImpl = getMessengerKernelFetch();
  const normalizedBaseUrl = session.apiBaseUrl.replace(/\/+$/, "");
  const url = `${normalizedBaseUrl}${normalizeMessengerPath(normalizedBaseUrl, path)}`;

  const response = await fetchImpl(url, {
    ...init,
    headers: normalizeHeaders(
      session.accessToken,
      session.currentUserId,
      init?.headers,
      Boolean(init?.body),
    ),
  });

  const body = await parseResponseBody(response);

  if (!response.ok) {
    const backendMessage =
      body && typeof body === "object" && !Array.isArray(body)
        ? ((body as { message?: unknown; error?: { message?: unknown } }).error?.message ??
            (body as { message?: unknown }).message)
        : null;

    const fallbackMessage =
      typeof backendMessage === "string" && backendMessage.trim()
        ? backendMessage.trim()
        : typeof body === "string" && body.trim()
          ? body.trim()
          : `Messenger messages request failed with status ${response.status}`;

    throw new MessengerKernelError({
      code: "MESSENGER_KERNEL_REQUEST_FAILED",
      message: fallbackMessage,
      status: response.status,
      details: body,
    });
  }

  return body as TResponse;
}

export async function fetchMessengerMessagesPayload(
  query: KernelMessengerMessagesQuery,
) {
  const roomId = normalizeRequiredId(query.roomId, "roomId");

  return performMessengerMessagesRequest<unknown>(
    `/messenger/rooms/${encodeURIComponent(roomId)}/messages${buildMessagesQueryString(
      query,
    )}`,
    {
      method: "GET",
    },
  );
}

export async function fetchMessengerMessagePayload(messageId: string) {
  return performMessengerMessagesRequest<unknown>(
    `/messenger/messages/${encodeURIComponent(
      normalizeRequiredId(messageId, "messageId"),
    )}`,
    {
      method: "GET",
    },
  );
}

export async function createMessengerMessagePayload(
  input: KernelMessengerCreateMessageInput,
) {
  const roomId = normalizeRequiredId(input.roomId, "roomId");

  return performMessengerMessagesRequest<unknown>(
    `/messenger/rooms/${encodeURIComponent(roomId)}/messages`,
    {
      method: "POST",
      body: JSON.stringify({
        text: input.text ?? null,
        content: input.text ?? null,
        kind: input.kind ?? "text",
        type: input.kind ?? "text",
        replyToMessageId: input.replyToMessageId ?? null,
        clientMessageId: input.clientMessageId ?? null,
        peerUserId: readPeerField(input, "peerUserId"),
        peerId: readPeerField(input, "peerId"),
        targetUserId: readPeerField(input, "targetUserId"),
        partnerId: readPeerField(input, "partnerId"),
        contactId: readPeerField(input, "contactId"),
        peerPhone: readPeerField(input, "peerPhone"),
        peerUsername: readPeerField(input, "peerUsername"),
        peerEmail: readPeerField(input, "peerEmail"),
        metadata: input.metadata ?? {},
      }),
    },
  );
}

export async function updateMessengerMessagePayload(
  input: KernelMessengerUpdateMessageInput,
) {
  const messageId = normalizeRequiredId(input.messageId, "messageId");

  return performMessengerMessagesRequest<unknown>(
    `/messenger/messages/${encodeURIComponent(messageId)}`,
    {
      method: "PATCH",
      body: JSON.stringify({
        text: input.text ?? null,
        content: input.text ?? null,
        metadata: input.metadata ?? {},
      }),
    },
  );
}

export async function deleteMessengerMessagePayload(messageId: string) {
  return performMessengerMessagesRequest<unknown>(
    `/messenger/messages/${encodeURIComponent(
      normalizeRequiredId(messageId, "messageId"),
    )}`,
    {
      method: "DELETE",
    },
  );
}

export async function markMessengerMessageDeliveredPayload(messageId: string) {
  return performMessengerMessagesRequest<unknown>(
    `/messenger/messages/${encodeURIComponent(
      normalizeRequiredId(messageId, "messageId"),
    )}/delivered`,
    {
      method: "POST",
    },
  );
}

export async function markMessengerMessageReadPayload(messageId: string) {
  return performMessengerMessagesRequest<unknown>(
    `/messenger/messages/${encodeURIComponent(
      normalizeRequiredId(messageId, "messageId"),
    )}/read`,
    {
      method: "POST",
    },
  );
}
