import * as FileSystem from "expo-file-system/legacy";
import { resolveSabiApiBaseUrl } from "../../../../shared/network/sabiApiBaseUrl";

import type {
  MessengerKernelAnimatedPayload,
  MessengerKernelMessageRecord,
  MessengerKernelParticipantRecord,
  MessengerKernelRoomRecord,
  MessengerKernelSessionSnapshot,
} from "../core/types";
import type {
  MessengerKernelHydrateRoomGraphInput,
  MessengerKernelRuntimeConfig,
  MessengerKernelRuntimeContext,
  MessengerKernelSendMessageInput,
  MessengerKernelUpdateMessageInput,
  MessengerKernelUploadMediaInput,
  MessengerKernelUploadMediaResult,
} from "./types";

type RemoteMessagePayload = Record<string, unknown>;

type UploadedMediaCacheEntry = {
  remoteUrl: string;
  originalName?: string | null;
  mimeType?: string | null;
  size?: number | null;
};

const uploadedMediaByLocalUri = new Map<string, UploadedMediaCacheEntry>();

function normalizeString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
}

function normalizeNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function normalizeAnimatedPayload(value: unknown): MessengerKernelAnimatedPayload | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as MessengerKernelAnimatedPayload;
}

function normalizeBaseUrl(value: unknown): string {
  const resolved = resolveSabiApiBaseUrl(value);
  if (!resolved) {
    throw new Error("Messenger runtime apiBaseUrl is not configured.");
  }

  return resolved;
}

function normalizeMessageType(value: unknown): string {
  const normalized = normalizeString(value)?.toUpperCase() ?? "TEXT";
  if (normalized === "AUDIO") return "VOICE";
  if (normalized === "FILE") return "DOCUMENT";
  return normalized;
}

function inferRemoteMessageType(input: {
  type?: unknown;
  messageType?: unknown;
  kind?: unknown;
  mediaType?: unknown;
  mimeType?: unknown;
  mediaUri?: unknown;
  fileName?: unknown;
  content?: unknown;
}) {
  const direct = normalizeMessageType(input.type ?? input.messageType ?? input.kind ?? input.mediaType);
  if (direct !== "TEXT") return direct;

  const joined = [input.mediaType, input.mimeType, input.mediaUri, input.fileName, input.content]
    .map((item) => String(item ?? "").trim().toLowerCase())
    .filter(Boolean)
    .join(" ");

  if (!joined) return "TEXT";
  if (/\b(image|photo|jpeg|jpg|png|webp|heic|gif|bmp|tiff|svg)\b/.test(joined) || joined.includes("image/")) return "IMAGE";
  if (/\b(video|mp4|mov|m4v|webm|mkv|avi|3gp|3g2|mpeg|mpg|wmv|flv|ogv|m3u8)\b/.test(joined) || joined.includes("video/")) return "VIDEO";
  if (/\b(voice|audio|m4a|aac|mp3|wav|ogg|oga|caf|amr)\b/.test(joined) || joined.includes("audio/")) return "VOICE";
  if (/\b(pdf|doc|docx|xls|xlsx|ppt|pptx|txt|csv|zip|rar|7z|file|document)\b/.test(joined)) return "DOCUMENT";
  return "TEXT";
}

function endpointMessageType(value: unknown): "text" | "voice" | "video" | "image" | "file" | "location" {
  const type = normalizeMessageType(value);

  if (type === "VOICE") return "voice";
  if (type === "VIDEO") return "video";
  if (type === "IMAGE") return "image";
  if (type === "DOCUMENT" || type === "FILE") return "file";
  if (type === "LOCATION") return "location";

  return "text";
}

function buildApiUrl(session: MessengerKernelSessionSnapshot, path: string): string {
  const base = normalizeBaseUrl(session.apiBaseUrl);
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalizedPath}`;
}

function buildMessengerUrl(session: MessengerKernelSessionSnapshot, path: string): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return buildApiUrl(session, `/api/v2/messenger${normalizedPath}`);
}

function buildAuthHeaders(
  session: MessengerKernelSessionSnapshot,
  options?: { json?: boolean },
): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: "application/json",
  };

  if (options?.json !== false) {
    headers["Content-Type"] = "application/json";
  }

  const accessToken = normalizeString(session.accessToken);
  if (accessToken) {
    const scheme = session.authScheme === "raw" ? "" : `${session.authScheme || "Bearer"} `;
    headers.Authorization = `${scheme}${accessToken}`.trim();
  }

  const currentUserId = normalizeString(session.currentUserId);
  if (currentUserId) {
    headers["x-user-id"] = currentUserId;
  }

  return headers;
}

async function parseJsonSafe(response: Response): Promise<unknown> {
  const text = await response.text();

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function readPayload(value: unknown): unknown {
  if (value && typeof value === "object" && "data" in (value as Record<string, unknown>)) {
    return (value as Record<string, unknown>).data;
  }

  return value;
}

function toErrorMessage(payload: unknown, fallback: string) {
  if (payload && typeof payload === "object") {
    const source = payload as Record<string, unknown>;
    return (
      normalizeString(source.message) ||
      normalizeString(source.error) ||
      normalizeString(source.code) ||
      fallback
    );
  }

  if (typeof payload === "string" && payload.trim()) {
    return payload.trim();
  }

  return fallback;
}

async function requestJson<T>(
  session: MessengerKernelSessionSnapshot,
  path: string,
  options?: {
    method?: "GET" | "POST" | "PATCH" | "DELETE";
    body?: Record<string, unknown> | null;
    messenger?: boolean;
  },
): Promise<T> {
  const method = options?.method ?? "GET";
  const url = options?.messenger === false
    ? buildApiUrl(session, path)
    : buildMessengerUrl(session, path);

  const response = await fetch(url, {
    method,
    headers: buildAuthHeaders(session, { json: method !== "GET" }),
    body: method === "GET" ? undefined : JSON.stringify(options?.body ?? {}),
  });

  const json = await parseJsonSafe(response);

  if (!response.ok) {
    throw new Error(
      toErrorMessage(
        readPayload(json),
        `${method} ${path} failed with status ${response.status}.`,
      ),
    );
  }

  return readPayload(json) as T;
}

function absolutizeMediaUrl(session: MessengerKernelSessionSnapshot, value: unknown): string | null {
  const url = normalizeString(value);
  if (!url) return null;

  if (/^https?:\/\//i.test(url) || /^file:\/\//i.test(url) || /^content:\/\//i.test(url)) {
    return url;
  }

  const base = normalizeBaseUrl(session.apiBaseUrl);

  if (/^\/?uploads\//i.test(url)) {
    const filename = encodeURIComponent(url.replace(/^\/?uploads\//i, "").split("/").pop() || "");
    return filename ? `${base}/api/v2/media/files/${filename}` : `${base}${url.startsWith("/") ? url : `/${url}`}`;
  }

  return `${base}${url.startsWith("/") ? url : `/${url}`}`;
}

function buildFilePart(input: {
  uri: string;
  name: string;
  mimeType: string;
}) {
  return {
    uri: input.uri,
    name: input.name,
    type: input.mimeType,
  } as unknown as Blob;
}

const VIDEO_UPLOAD_EXTENSION_BY_MIME: Record<string, string> = {
  "video/mp4": "mp4",
  "video/x-m4v": "m4v",
  "video/quicktime": "mov",
  "video/webm": "webm",
  "video/x-matroska": "mkv",
  "video/x-msvideo": "avi",
  "video/avi": "avi",
  "video/3gpp": "3gp",
  "video/3gpp2": "3g2",
  "video/mpeg": "mpeg",
  "video/x-ms-wmv": "wmv",
  "video/x-flv": "flv",
  "video/ogg": "ogv",
  "application/vnd.apple.mpegurl": "m3u8",
  "application/x-mpegurl": "m3u8",
};

function extensionFromName(value?: string | null) {
  const clean = String(value ?? "").split("?")[0].split("#")[0].trim().toLowerCase();
  const match = clean.match(/\.([a-z0-9]{1,12})$/i);
  return match?.[1]?.toLowerCase() ?? "";
}

function extensionFromMime(mimeType?: string | null) {
  const normalized = String(mimeType ?? "").trim().toLowerCase();
  if (!normalized) return "";
  if (VIDEO_UPLOAD_EXTENSION_BY_MIME[normalized]) return VIDEO_UPLOAD_EXTENSION_BY_MIME[normalized];
  if (normalized === "image/jpeg") return "jpg";
  if (normalized === "image/png") return "png";
  if (normalized === "image/webp") return "webp";
  if (normalized === "image/heic") return "heic";
  if (normalized === "audio/mp4") return "m4a";
  if (normalized === "audio/mpeg") return "mp3";
  if (normalized === "audio/aac") return "aac";
  if (normalized === "audio/wav") return "wav";
  return "";
}

function sanitizeUploadName(value: string, fallbackExtension: string) {
  const trimmed = value.trim();
  const safeBase = trimmed
    .replace(/[\/:*?"<>|]+/g, "-")
    .replace(/\s+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90);

  const base = safeBase || `media-${Date.now()}`;
  const currentExtension = extensionFromName(base);
  return currentExtension || !fallbackExtension ? base : `${base}.${fallbackExtension}`;
}

async function prepareUploadFile(input: {
  uri: string;
  name: string;
  mimeType: string;
}) {
  const fallbackExtension =
    extensionFromName(input.name) ||
    extensionFromName(input.uri) ||
    extensionFromMime(input.mimeType) ||
    "bin";
  const safeName = sanitizeUploadName(input.name, fallbackExtension);
  const shouldCopy =
    /^content:/i.test(input.uri) ||
    /^asset:/i.test(input.uri) ||
    /^assets-library:/i.test(input.uri) ||
    /^ph:/i.test(input.uri) ||
    (/^file:/i.test(input.uri) && !extensionFromName(input.uri) && Boolean(fallbackExtension));

  if (!shouldCopy) {
    return { uri: input.uri, name: safeName, mimeType: input.mimeType };
  }

  const cacheRoot = FileSystem.cacheDirectory || FileSystem.documentDirectory;
  if (!cacheRoot) {
    return { uri: input.uri, name: safeName, mimeType: input.mimeType };
  }

  const target = `${cacheRoot}sabi-upload-${Date.now()}-${safeName}`;
  try {
    await FileSystem.copyAsync({ from: input.uri, to: target });
    return { uri: target, name: safeName, mimeType: input.mimeType };
  } catch {
    return { uri: input.uri, name: safeName, mimeType: input.mimeType };
  }
}

function cacheUploadAlias(localUri: string, result: MessengerKernelUploadMediaResult) {
  const source = result as Record<string, unknown>;
  const remoteUrl = normalizeString(source.mediaUri) ?? normalizeString(source.url) ?? normalizeString(source.fileUrl);

  if (!remoteUrl) return;

  uploadedMediaByLocalUri.set(localUri, {
    remoteUrl,
    originalName: normalizeString(source.originalName),
    mimeType: normalizeString(source.mimeType),
    size: normalizeNumber(source.size),
  });
}

function shouldUseBase64UploadFallback(input: MessengerKernelUploadMediaInput, mimeType: string) {
  const type = normalizeString(input.type)?.toUpperCase();
  const normalizedMimeType = mimeType.toLowerCase();
  return (
    type === "VOICE" ||
    type === "DOCUMENT" ||
    type === "IMAGE" ||
    type === "VIDEO" ||
    normalizedMimeType.startsWith("audio/") ||
    normalizedMimeType.startsWith("image/") ||
    normalizedMimeType.startsWith("video/") ||
    normalizedMimeType === "application/octet-stream"
  );
}

function normalizeUploadPayload(
  source: Record<string, unknown>,
  input: {
    session: MessengerKernelSessionSnapshot;
    localUri: string;
    fallbackName: string;
    fallbackMimeType: string;
  },
): MessengerKernelUploadMediaResult {
  const remoteUrl =
    absolutizeMediaUrl(input.session, source.url) ||
    absolutizeMediaUrl(input.session, source.fileUrl) ||
    absolutizeMediaUrl(input.session, source.downloadUrl) ||
    absolutizeMediaUrl(input.session, source.mediaUri) ||
    absolutizeMediaUrl(input.session, source.attachmentUrl) ||
    absolutizeMediaUrl(input.session, source.publicUrl) ||
    absolutizeMediaUrl(input.session, source.uri) ||
    absolutizeMediaUrl(input.session, source.path);

  if (!remoteUrl) {
    throw new Error("Media upload response does not contain a usable file URL.");
  }

  const cacheEntry: UploadedMediaCacheEntry = {
    remoteUrl,
    originalName: normalizeString(source.originalName) ?? input.fallbackName,
    mimeType: normalizeString(source.mimeType) ?? input.fallbackMimeType,
    size: normalizeNumber(source.size),
  };

  uploadedMediaByLocalUri.set(input.localUri, cacheEntry);

  return {
    ...source,
    url: remoteUrl,
    mediaUri: remoteUrl,
    fileUrl: remoteUrl,
    attachmentUrl: remoteUrl,
    downloadUrl: remoteUrl,
    mimeType: cacheEntry.mimeType,
    originalName: cacheEntry.originalName,
    size: cacheEntry.size,
  };
}

async function uploadMediaWithFormData(
  input: MessengerKernelUploadMediaInput,
  context: MessengerKernelRuntimeContext,
  normalized: { uri: string; name: string; mimeType: string },
): Promise<MessengerKernelUploadMediaResult> {
  const uploadFile = await prepareUploadFile(normalized);
  const formData = new FormData();
  formData.append("file", buildFilePart(uploadFile));

  const response = await fetch(buildApiUrl(context.session, "/api/v2/media/upload"), {
    method: "POST",
    headers: buildAuthHeaders(context.session, { json: false }),
    body: formData,
  });

  const json = await parseJsonSafe(response);

  if (!response.ok) {
    throw new Error(
      toErrorMessage(
        readPayload(json),
        `Media upload failed with status ${response.status}.`,
      ),
    );
  }

  const payload = readPayload(json);
  const source = payload && typeof payload === "object" ? (payload as Record<string, unknown>) : {};
  const result = normalizeUploadPayload(source, {
    session: context.session,
    localUri: normalized.uri,
    fallbackName: uploadFile.name,
    fallbackMimeType: uploadFile.mimeType,
  });

  cacheUploadAlias(uploadFile.uri, result);
  cacheUploadAlias(normalized.uri, result);
  return result;
}

async function uploadMediaWithBase64(
  input: MessengerKernelUploadMediaInput,
  context: MessengerKernelRuntimeContext,
  normalized: { uri: string; name: string; mimeType: string },
): Promise<MessengerKernelUploadMediaResult> {
  const base64 = await FileSystem.readAsStringAsync(normalized.uri, {
    encoding: FileSystem.EncodingType.Base64,
  });

  const response = await fetch(buildApiUrl(context.session, "/api/v2/media/upload-base64"), {
    method: "POST",
    headers: buildAuthHeaders(context.session, { json: true }),
    body: JSON.stringify({
      fileName: normalized.name,
      name: normalized.name,
      mimeType: normalized.mimeType,
      type: normalizeString(input.type),
      data: base64,
    }),
  });

  const json = await parseJsonSafe(response);

  if (!response.ok) {
    throw new Error(
      toErrorMessage(
        readPayload(json),
        `Media upload failed with status ${response.status}.`,
      ),
    );
  }

  const payload = readPayload(json);
  const source = payload && typeof payload === "object" ? (payload as Record<string, unknown>) : {};

  return normalizeUploadPayload(source, {
    session: context.session,
    localUri: normalized.uri,
    fallbackName: normalized.name,
    fallbackMimeType: normalized.mimeType,
  });
}

async function uploadMediaFile(
  input: MessengerKernelUploadMediaInput,
  context: MessengerKernelRuntimeContext,
): Promise<MessengerKernelUploadMediaResult> {
  const uri = normalizeString(input.uri);
  const name = normalizeString(input.name) ?? `media-${Date.now()}`;
  const mimeType = normalizeString(input.mimeType) ?? "application/octet-stream";

  if (!uri) {
    throw new Error("Media uri is required.");
  }

  const cached = uploadedMediaByLocalUri.get(uri);
  if (cached?.remoteUrl) {
    return {
      url: cached.remoteUrl,
      mediaUri: cached.remoteUrl,
      fileUrl: cached.remoteUrl,
      attachmentUrl: cached.remoteUrl,
      mimeType: cached.mimeType ?? mimeType,
      originalName: cached.originalName ?? name,
      size: cached.size ?? null,
    };
  }

  const normalized = { uri, name, mimeType };

  try {
    return await uploadMediaWithFormData(input, context, normalized);
  } catch (error) {
    if (shouldUseBase64UploadFallback(input, mimeType)) {
      const uploadFile = await prepareUploadFile(normalized).catch(() => normalized);
      const result = await uploadMediaWithBase64(input, context, uploadFile);
      cacheUploadAlias(uri, result);
      cacheUploadAlias(uploadFile.uri, result);
      return result;
    }

    throw error;
  }
}

function resolveUploadedMediaUri(
  session: MessengerKernelSessionSnapshot,
  value: unknown,
): string | null {
  const raw = normalizeString(value);
  if (!raw) return null;

  const cached = uploadedMediaByLocalUri.get(raw);
  if (cached?.remoteUrl) {
    return cached.remoteUrl;
  }

  return absolutizeMediaUrl(session, raw);
}

function mapRemoteMessage(
  session: MessengerKernelSessionSnapshot,
  value: unknown,
  fallbackChatId?: string | null,
): MessengerKernelMessageRecord | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const source = value as RemoteMessagePayload;
  const id =
    normalizeString(source.id) ??
    normalizeString(source.messageId) ??
    normalizeString(source.clientId);
  const chatId =
    normalizeString(source.chatId) ??
    normalizeString(source.roomId) ??
    normalizeString(fallbackChatId);

  if (!id || !chatId) {
    return null;
  }

  const sourceMeta =
    source.meta && typeof source.meta === "object" ? (source.meta as Record<string, unknown>) : {};
  const sourceAttachment =
    source.attachment && typeof source.attachment === "object"
      ? (source.attachment as Record<string, unknown>)
      : {};
  const sourceFile =
    source.file && typeof source.file === "object" ? (source.file as Record<string, unknown>) : {};

  const mediaUri =
    resolveUploadedMediaUri(session, source.mediaUri) ??
    resolveUploadedMediaUri(session, source.remoteUri) ??
    resolveUploadedMediaUri(session, source.mediaUrl) ??
    resolveUploadedMediaUri(session, source.url) ??
    resolveUploadedMediaUri(session, source.fileUrl) ??
    resolveUploadedMediaUri(session, source.attachmentUrl) ??
    resolveUploadedMediaUri(session, source.assetUrl) ??
    resolveUploadedMediaUri(session, source.downloadUrl) ??
    resolveUploadedMediaUri(session, source.uploadedUri) ??
    resolveUploadedMediaUri(session, source.cdnUrl) ??
    resolveUploadedMediaUri(session, sourceAttachment.mediaUri) ??
    resolveUploadedMediaUri(session, sourceAttachment.url) ??
    resolveUploadedMediaUri(session, sourceAttachment.fileUrl) ??
    resolveUploadedMediaUri(session, sourceAttachment.downloadUrl) ??
    resolveUploadedMediaUri(session, sourceFile.mediaUri) ??
    resolveUploadedMediaUri(session, sourceFile.url) ??
    resolveUploadedMediaUri(session, sourceFile.fileUrl) ??
    resolveUploadedMediaUri(session, sourceFile.downloadUrl) ??
    resolveUploadedMediaUri(session, sourceMeta.mediaUri) ??
    resolveUploadedMediaUri(session, sourceMeta.url);

  const fileName =
    normalizeString(source.fileName) ??
    normalizeString(source.name) ??
    normalizeString(sourceAttachment.fileName) ??
    normalizeString(sourceFile.fileName);
  const content = normalizeString(source.content) ?? normalizeString(source.text);
  const resolvedMimeType =
    normalizeString(source.mimeType) ??
    normalizeString(source.contentType) ??
    normalizeString(sourceAttachment.mimeType) ??
    normalizeString(sourceFile.mimeType);
  const resolvedMediaType =
    normalizeString(source.mediaType) ??
    normalizeString(source.messageType) ??
    normalizeString(source.kind) ??
    normalizeString(sourceAttachment.mediaType) ??
    normalizeString(sourceFile.mediaType) ??
    normalizeString(sourceMeta.mediaType);
  const type = inferRemoteMessageType({
    type: source.type,
    messageType: source.messageType,
    kind: source.kind,
    mediaType: resolvedMediaType,
    mimeType: resolvedMimeType,
    mediaUri,
    fileName,
    content,
  });

  return {
    ...source,
    id,
    chatId,
    roomId: normalizeString(source.roomId) ?? chatId,
    userId:
      normalizeString(source.userId) ??
      normalizeString(source.senderId) ??
      normalizeString(source.authorId) ??
      null,
    type,
    content,
    text: content,
    createdAt:
      normalizeString(source.createdAt) ??
      normalizeString(source.sentAt) ??
      normalizeString(source.occurredAt) ??
      new Date().toISOString(),
    deliveredAt: normalizeString(source.deliveredAt),
    receivedAt: normalizeString(source.receivedAt),
    readAt: normalizeString(source.readAt),
    seenAt: normalizeString(source.seenAt),
    editedAt:
      normalizeString(source.editedAt) ??
      normalizeString(source.updatedAt),
    updatedAt:
      normalizeString(source.updatedAt) ??
      normalizeString(source.editedAt),
    deletedAt: normalizeString(source.deletedAt),
    deletedByUserId: normalizeString(source.deletedByUserId),
    deletedForEveryone:
      typeof source.deletedForEveryone === "boolean" ? source.deletedForEveryone : undefined,
    isDeleted:
      typeof source.isDeleted === "boolean" ? source.isDeleted : undefined,
    replyToMessageId: normalizeString(source.replyToMessageId),
    forwardedFromMessageId:
      normalizeString(source.forwardedFromMessageId) ??
      normalizeString(source.originalMessageId),
    forwardedFromChatId: normalizeString(source.forwardedFromChatId),
    forwardedFromUserId: normalizeString(source.forwardedFromUserId),
    forwardedFromLabel: normalizeString(source.forwardedFromLabel),
    originalMessageId:
      normalizeString(source.originalMessageId) ??
      normalizeString(source.forwardedFromMessageId),
    previewTitle:
      normalizeString(source.previewTitle) ??
      normalizeString(source.title) ??
      normalizeString(source.contactName) ??
      fileName ??
      null,
    previewSubtitle:
      normalizeString(source.previewSubtitle) ??
      normalizeString(source.subtitle) ??
      normalizeString(source.contactPhone) ??
      (typeof source.fileSize === "number" ? `${source.fileSize} bytes` : null),
    fileLabel:
      normalizeString(source.fileLabel) ??
      normalizeString(source.label) ??
      fileName ??
      null,
    mimeType: resolvedMimeType,
    mediaType: resolvedMediaType,
    mediaUri,
    remoteUri: mediaUri,
    uri: mediaUri,
    url: mediaUri,
    fileUrl: mediaUri,
    thumbnailUri:
      normalizeString(source.thumbnailUri) ??
      normalizeString(source.thumbUri) ??
      normalizeString(source.thumbnailUrl) ??
      normalizeString(sourceAttachment.thumbnailUri) ??
      normalizeString(sourceAttachment.thumbnailUrl),
    fileName,
    fileSizeLabel:
      normalizeString(source.fileSizeLabel) ??
      normalizeString(source.sizeLabel) ??
      normalizeString(sourceAttachment.fileSizeLabel) ??
      normalizeString(sourceFile.fileSizeLabel),
    latitude: normalizeNumber(source.latitude),
    longitude: normalizeNumber(source.longitude),
    durationMs: normalizeNumber(source.durationMs),
    durationLabel: normalizeString(source.durationLabel),
  };
}

function mapMessages(
  session: MessengerKernelSessionSnapshot,
  value: unknown,
  fallbackChatId: string,
): MessengerKernelMessageRecord[] {
  const payload = readPayload(value);
  const rawMessages =
    Array.isArray(payload)
      ? payload
      : payload && typeof payload === "object" && Array.isArray((payload as Record<string, unknown>).messages)
        ? ((payload as Record<string, unknown>).messages as unknown[])
        : [];

  return rawMessages
    .map((item) => mapRemoteMessage(session, item, fallbackChatId))
    .filter((item): item is MessengerKernelMessageRecord => Boolean(item))
    .sort((a, b) => String(a.createdAt || "").localeCompare(String(b.createdAt || "")));
}

function buildRoomRecord(
  input: MessengerKernelHydrateRoomGraphInput,
  messages: MessengerKernelMessageRecord[],
  participants: MessengerKernelParticipantRecord[],
): MessengerKernelRoomRecord {
  const chatId = input.chatId;

  return {
    id: chatId,
    chatId,
    title: chatId,
    name: chatId,
    type: "direct",
    roomType: "direct",
    currentUserId: input.currentUserId ?? null,
    hydratedAt: new Date().toISOString(),
    updatedAt: messages[messages.length - 1]?.createdAt ?? new Date().toISOString(),
    messageIds: messages.map((message) => message.id),
    participantIds: participants.map((participant) => participant.id),
  };
}

function buildParticipants(
  chatId: string,
  currentUserId: string | null | undefined,
  messages: MessengerKernelMessageRecord[],
): MessengerKernelParticipantRecord[] {
  const userIds = new Set<string>();

  const current = normalizeString(currentUserId);
  if (current) {
    userIds.add(current);
  }

  for (const message of messages) {
    const userId = normalizeString(message.userId);
    if (userId) {
      userIds.add(userId);
    }
  }

  return Array.from(userIds).map((userId) => ({
    id: `${chatId}:${userId}`,
    chatId,
    roomId: chatId,
    userId,
    participantUserId: userId,
    role: userId === current ? "member:self" : "member",
    state: "active",
  }));
}

function buildSendBody(
  input: MessengerKernelSendMessageInput,
  context: MessengerKernelRuntimeContext,
): Record<string, unknown> {
  const userId =
    normalizeString(input.userId) ??
    normalizeString(context.session.currentUserId);

  if (!userId) {
    throw new Error("Current userId is required to send messenger message.");
  }

  const body: Record<string, unknown> = {
    chatId: input.chatId,
    userId,
    type: normalizeMessageType(input.type),
    peerUserId: normalizeString(input.peerUserId) ?? normalizeString(input.peerId) ?? normalizeString(input.partnerId) ?? normalizeString(input.targetUserId) ?? null,
  };

  const type = endpointMessageType(input.type);
  const normalizedInputType = normalizeMessageType(input.type);
  const content = normalizeString(input.content) ?? normalizeString(input.text);

  if (type === "text") {
    if (!content) {
      throw new Error("Message text is required.");
    }

    body.content = content;
  }

  if (type === "location") {
    const latitude = normalizeNumber(input.latitude);
    const longitude = normalizeNumber(input.longitude);

    if (latitude === null || longitude === null) {
      throw new Error("Latitude and longitude are required for location message.");
    }

    body.latitude = latitude;
    body.longitude = longitude;
    body.content = content ?? "";
  }

  if (type === "voice" || type === "video" || type === "image" || type === "file") {
    const mediaUrl = resolveUploadedMediaUri(context.session, input.mediaUri);

    if (!mediaUrl) {
      throw new Error("Uploaded media URL is required before sending media message.");
    }

    body.mediaUrl = mediaUrl;
    body.content = content ?? "";
    body.fileName =
      normalizeString(input.fileLabel) ??
      normalizeString(input.previewTitle) ??
      `message-${Date.now()}`;
  }

  if (normalizeString(input.replyToMessageId)) {
    body.replyToMessageId = normalizeString(input.replyToMessageId);
  }

  if (normalizeString(input.forwardedFromMessageId)) {
    body.forwardedFromMessageId = normalizeString(input.forwardedFromMessageId);
  }

  if (normalizeString(input.forwardedFromChatId)) {
    body.forwardedFromChatId = normalizeString(input.forwardedFromChatId);
  }

  if (normalizeString(input.forwardedFromUserId)) {
    body.forwardedFromUserId = normalizeString(input.forwardedFromUserId);
  }

  if (normalizeString(input.forwardedFromLabel)) {
    body.forwardedFromLabel = normalizeString(input.forwardedFromLabel);
  }

  if (normalizeString(input.originalMessageId)) {
    body.originalMessageId = normalizeString(input.originalMessageId);
  }

  if (normalizeString(input.previewTitle)) {
    body.previewTitle = normalizeString(input.previewTitle);
  }

  if (normalizeString(input.previewSubtitle)) {
    body.previewSubtitle = normalizeString(input.previewSubtitle);
  }

  if (normalizeString(input.mimeType)) {
    body.mimeType = normalizeString(input.mimeType);
  }

  if (normalizeNumber(input.durationMs) !== null) {
    body.durationMs = normalizeNumber(input.durationMs);
  }

  if (normalizeString(input.durationLabel)) {
    body.durationLabel = normalizeString(input.durationLabel);
  }

  if (normalizedInputType === "CONTACT") {
    body.contactName = normalizeString(input.previewTitle);
    body.contactPhone = normalizeString(input.previewSubtitle);
    body.content = content ?? normalizeString(input.previewTitle) ?? "";
  }

  return body;
}

async function sendMessage(
  input: MessengerKernelSendMessageInput,
  context: MessengerKernelRuntimeContext,
): Promise<MessengerKernelMessageRecord> {
  const type = normalizeMessageType(input.type);

  if (type === "GIFT" || type === "ANIMATED_REACTION" || type === "ANIMATED_EMOJI") {
    throw new Error(
      `${type} messages require a dedicated backend route before launch. Fake sending is disabled.`,
    );
  }

  const endpoint = endpointMessageType(type);
  const body = buildSendBody(input, context);

  const payload = await requestJson<unknown>(context.session, `/messages/${endpoint}`, {
    method: "POST",
    body,
  });

  const message = mapRemoteMessage(context.session, payload, input.chatId);

  if (!message) {
    throw new Error("Messenger send response does not contain a valid message.");
  }

  return {
    ...input,
    ...message,
    type: normalizeMessageType(input.type ?? message.type),
    content: normalizeString(message.content) ?? normalizeString(input.content) ?? normalizeString(input.text),
    text: normalizeString(message.text) ?? normalizeString(message.content) ?? normalizeString(input.content) ?? normalizeString(input.text),
    previewTitle: normalizeString(message.previewTitle) ?? normalizeString(input.previewTitle),
    previewSubtitle: normalizeString(message.previewSubtitle) ?? normalizeString(input.previewSubtitle),
    fileLabel: normalizeString(message.fileLabel) ?? normalizeString(input.fileLabel),
    mimeType: normalizeString(message.mimeType) ?? normalizeString(input.mimeType),
    mediaUri:
      resolveUploadedMediaUri(context.session, message.mediaUri) ??
      resolveUploadedMediaUri(context.session, input.mediaUri),
    remoteUri:
      resolveUploadedMediaUri(context.session, message.remoteUri) ??
      resolveUploadedMediaUri(context.session, message.mediaUri) ??
      resolveUploadedMediaUri(context.session, input.mediaUri),
    durationMs: normalizeNumber(message.durationMs) ?? normalizeNumber(input.durationMs),
    durationLabel: normalizeString(message.durationLabel) ?? normalizeString(input.durationLabel),
    latitude: normalizeNumber(message.latitude) ?? normalizeNumber(input.latitude),
    longitude: normalizeNumber(message.longitude) ?? normalizeNumber(input.longitude),
    animatedPayload:
      normalizeAnimatedPayload(message.animatedPayload) ?? normalizeAnimatedPayload(input.animatedPayload),
  };
}

export function createMessengerKernelHttpRuntimeConfig(): MessengerKernelRuntimeConfig {
  return {
    async hydrateRoomGraph(input, context) {
      if (!normalizeString(input.chatId)) {
        throw new Error("chatId is required to hydrate messenger room graph.");
      }

      const payload = await requestJson<unknown>(
        context.session,
        `/chats/${encodeURIComponent(input.chatId)}/messages`,
        { method: "GET" },
      );

      const messages = mapMessages(context.session, payload, input.chatId);
      const participants = buildParticipants(
        input.chatId,
        input.currentUserId ?? context.session.currentUserId,
        messages,
      );

      return {
        room: buildRoomRecord(input, messages, participants),
        messages,
        participants,
      };
    },

    sendMessage,

    async updateMessage(input, context) {
      const messageId =
        normalizeString(input.messageId) ??
        normalizeString(input.id);

      if (!messageId) {
        throw new Error("messageId is required to update messenger message.");
      }

      const content = normalizeString(input.content) ?? normalizeString(input.text);

      if (!content) {
        throw new Error("Message content is required.");
      }

      const payload = await requestJson<unknown>(
        context.session,
        `/messages/${encodeURIComponent(messageId)}/text`,
        {
          method: "PATCH",
          body: {
            content,
          },
        },
      );

      const message = mapRemoteMessage(context.session, payload, input.chatId ?? null);

      if (!message) {
        throw new Error("Messenger update response does not contain a valid message.");
      }

      return message;
    },

    async deleteMessage(input, context) {
      const messageId =
        normalizeString(input.messageId) ??
        normalizeString(input.id);

      if (!messageId) {
        throw new Error("messageId is required to delete messenger message.");
      }

      return requestJson<unknown>(
        context.session,
        `/messages/${encodeURIComponent(messageId)}`,
        {
          method: "DELETE",
          body: {},
        },
      );
    },

    async markMessageRead(messageId, context) {
      const normalizedMessageId = normalizeString(messageId);

      if (!normalizedMessageId) {
        throw new Error("messageId is required to mark message as read.");
      }

      return requestJson<unknown>(
        context.session,
        `/messages/${encodeURIComponent(normalizedMessageId)}/read`,
        {
          method: "PATCH",
          body: {},
        },
      );
    },

    async uploadMedia(input, context) {
      return uploadMediaFile(input, context);
    },
  };
}
