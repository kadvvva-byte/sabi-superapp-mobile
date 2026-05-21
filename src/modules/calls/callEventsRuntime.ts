import { appStorage } from "../../shared/storage/app-storage";

export type MessengerCallKind = "audio" | "video";
export type MessengerCallDirection = "incoming" | "outgoing" | "missed";
export type MessengerCallStatus =
  | "calling"
  | "ringing"
  | "connecting"
  | "connected"
  | "ended"
  | "missed"
  | "declined"
  | "failed"
  | "busy"
  | "unknown";

export type MessengerCallHistoryItem = {
  id: string;
  callId?: string | null;
  chatId?: string | null;
  peerId?: string | null;
  userId?: string | null;
  kind: MessengerCallKind;
  direction: MessengerCallDirection;
  status: MessengerCallStatus;
  roomType?: string | null;
  counterpartyName: string;
  avatarLetter?: string | null;
  avatarUrl?: string | null;
  verified?: boolean;
  startedAt: string;
  answeredAt?: string | null;
  endedAt?: string | null;
  durationSeconds: number;
  durationLabel?: string | null;
  unread?: boolean;
  missedNotificationId?: string | null;
  source?: "session" | "realtime" | "manual";
  raw?: unknown;
};

type Listener = (items: MessengerCallHistoryItem[]) => void;
type AnyRecord = Record<string, unknown>;

const STORAGE_KEY = "sabi_messenger_call_history_v2";
const MAX_ITEMS = 160;

let hydrated = false;
let items: MessengerCallHistoryItem[] = [];
const listeners = new Set<Listener>();
const rememberedKindByCallId = new Map<string, MessengerCallKind>();

function cloneItems() {
  return items.map((item) => ({ ...item }));
}

function nowIso() {
  return new Date().toISOString();
}

function rememberCallKind(callId: string, nextKind: MessengerCallKind | null | undefined) {
  if (!nextKind) return;
  const safeCallId = text(callId);
  if (safeCallId) rememberedKindByCallId.set(safeCallId, nextKind);
}

function recallCallKind(callId: string): MessengerCallKind | null {
  const safeCallId = text(callId);
  if (safeCallId && rememberedKindByCallId.has(safeCallId)) {
    return rememberedKindByCallId.get(safeCallId) || null;
  }

  return null;
}

function asRecord(value: unknown): AnyRecord {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as AnyRecord) : {};
}

function text(...values: unknown[]): string {
  for (const value of values) {
    if (Array.isArray(value)) {
      const nested = text(...value);
      if (nested) return nested;
      continue;
    }

    if (typeof value === "string" && value.trim()) return value.trim();
    if (typeof value === "number" && Number.isFinite(value)) return String(value);
    if (typeof value === "boolean") return value ? "true" : "false";
  }

  return "";
}

function bool(value: unknown): boolean {
  return value === true || value === "1" || value === "true";
}

const CALL_KIND_FIELD_NAMES = new Set([
  "kind",
  "type",
  "callkind",
  "calltype",
  "mediakind",
  "callmediakind",
  "mediatype",
  "callmode",
  "mode",
  "routekind",
  "routetype",
  "routepath",
  "pathname",
  "path",
  "screen",
  "href",
  "url",
]);

function collectCallKindCandidates(
  value: unknown,
  output: unknown[] = [],
  depth = 0,
  seen = new Set<object>(),
): unknown[] {
  if (depth > 5 || value == null) return output;

  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    const raw = String(value).toLowerCase();
    if (raw.includes("/calls/video") || raw.includes("calls/video") || raw.includes("video_call") || raw.includes("video-call")) {
      output.push(value);
    }
    if (raw.includes("/calls/audio") || raw.includes("calls/audio") || raw.includes("audio_call") || raw.includes("audio-call")) {
      output.push(value);
    }
    return output;
  }

  if (Array.isArray(value)) {
    for (const item of value) collectCallKindCandidates(item, output, depth + 1, seen);
    return output;
  }

  if (typeof value !== "object") return output;
  if (seen.has(value)) return output;
  seen.add(value);

  for (const [key, nested] of Object.entries(value as AnyRecord)) {
    const normalizedKey = key.toLowerCase().replace(/[^a-z0-9]/g, "");
    if (CALL_KIND_FIELD_NAMES.has(normalizedKey)) {
      output.push(nested);
    }
    collectCallKindCandidates(nested, output, depth + 1, seen);
  }

  return output;
}

function explicitKindFromCandidates(candidates: unknown[]): MessengerCallKind | null {
  const values = candidates
    .flatMap((value) => Array.isArray(value) ? value : [value])
    .map((value) => String(value ?? "").trim().toLowerCase())
    .filter(Boolean);

  for (const value of values) {
    if (value === "audio" || value === "voice" || value === "audio-call" || value === "audio_call") return "audio";
    if (value === "video" || value === "video-call" || value === "video_call") return "video";
    if (value.includes("/calls/audio") || value.includes("calls/audio")) return "audio";
    if (value.includes("/calls/video") || value.includes("calls/video")) return "video";
  }

  const rawText = values.join(" ");
  if (rawText.includes("audio") || rawText.includes("voice")) return "audio";
  if (rawText.includes("video")) return "video";
  return null;
}

function parseDateMs(value: unknown): number {
  const raw = text(value);
  if (!raw) return 0;
  const ms = new Date(raw).getTime();
  return Number.isFinite(ms) ? ms : 0;
}

function kind(value: unknown): MessengerCallKind {
  return String(value ?? "").toLowerCase().includes("video") ? "video" : "audio";
}

function callKindSources(raw: AnyRecord): AnyRecord[] {
  const payload = asRecord(raw.payload);
  const data = asRecord(raw.data);
  const message = asRecord(raw.message);
  const body = asRecord(raw.body);

  const storedRaw = asRecord(raw.raw);

  return [
    raw,
    storedRaw,
    payload,
    data,
    message,
    body,
    asRecord(payload.payload),
    asRecord(payload.data),
    asRecord(payload.message),
    asRecord(data.payload),
    asRecord(data.data),
    asRecord(data.message),
    asRecord(message.payload),
    asRecord(message.data),
    asRecord(message.message),
    asRecord(body.payload),
    asRecord(body.data),
  ];
}

function resolveCallKind(
  raw: AnyRecord,
  previous?: MessengerCallHistoryItem | null,
  eventName?: string,
): MessengerCallKind {
  const explicit = resolveExplicitCallKind(raw, eventName);
  if (explicit) return explicit;
  if (previous?.kind) return previous.kind;
  return "audio";
}

function resolveExplicitCallKind(raw: AnyRecord, eventName?: string): MessengerCallKind | null {
  const eventKind = explicitKindFromCandidates([eventName]);
  if (eventKind) return eventKind;

  for (const source of callKindSources(raw)) {
    const directKind = explicitKindFromCandidates([
      source.kind,
      source.type,
      source.callKind,
      source.callType,
      source.mediaKind,
      source.callMediaKind,
      source.mediaType,
      source.callMode,
      source.mode,
      source.routeKind,
      source.routeType,
      source.routePath,
      source.pathname,
      source.path,
      source.screen,
    ]);

    if (directKind) return directKind;
  }

  const candidates: unknown[] = [];
  collectCallKindCandidates(raw, candidates);

  return explicitKindFromCandidates(candidates);
}

function hasFullCallRouteId(value: unknown): boolean {
  return Boolean(extractCallRouteParts(value));
}

function shouldIgnoreAmbiguousCallHistoryEvent(
  eventName: string,
  raw: AnyRecord,
  callId: string,
  previous?: MessengerCallHistoryItem | null,
): boolean {
  if (previous) return false;
  if (resolveExplicitCallKind(raw, eventName)) return false;

  const eventText = text(
    eventName,
    raw.event,
    raw.status,
    raw.phase,
    raw.signalKind,
    raw.action,
  ).toLowerCase();

  return (
    eventText.includes("history") ||
    eventText.includes("connected") ||
    eventText.includes("accepted") ||
    eventText.includes("ended") ||
    eventText.includes("missed") ||
    eventText.includes("declined") ||
    eventText.includes("busy") ||
    hasFullCallRouteId(callId)
  );
}

function extractCallRouteParts(value: unknown): { callId: string; fromUserId: string; toUserId: string } | null {
  const raw = text(value);
  if (!raw) return null;
  const parts = raw.split(":").filter(Boolean);

  if (parts[0] === "call" && parts.length >= 5) {
    return {
      callId: raw,
      fromUserId: parts[2] || "",
      toUserId: parts[3] || "",
    };
  }

  return null;
}

function extractDirectRoutePeer(value: unknown, currentUserId?: string | null): string {
  const raw = text(value);
  if (!raw) return "";
  const parts = raw.split(":").filter(Boolean);

  if (parts[0] === "direct" && parts.length >= 3) {
    const peer = parts.slice(1).find((part) => part && part !== currentUserId);
    return peer || "";
  }

  const call = extractCallRouteParts(raw);
  if (call) {
    if (call.fromUserId && call.fromUserId !== currentUserId) return call.fromUserId;
    if (call.toUserId && call.toUserId !== currentUserId) return call.toUserId;
  }

  return "";
}

function resolveFullCallId(raw: AnyRecord, previous?: MessengerCallHistoryItem | null): string {
  for (const source of callKindSources(raw)) {
    const full = text(source.callId, source.callID, source.id, source.sessionId);
    if (extractCallRouteParts(full)) return full;
  }

  const previousCallId = text(previous?.callId);
  if (extractCallRouteParts(previousCallId)) return previousCallId;

  return text(raw.callId, raw.callID, previous?.callId, raw.id, previous?.id);
}

function resolveCounterpartyId(
  raw: AnyRecord,
  direction: MessengerCallDirection,
  currentUserId?: string | null,
  previous?: MessengerCallHistoryItem | null,
): string {
  const preferredOutgoing = text(raw.peerId, raw.peerUserId, raw.targetUserId, raw.toUserId, raw.receiverUserId, raw.calleeId);
  const preferredIncoming = text(raw.peerId, raw.peerUserId, raw.fromUserId, raw.senderUserId, raw.callerId);
  const direct = direction === "outgoing" ? preferredOutgoing : preferredIncoming;
  if (direct && direct !== currentUserId) return direct;

  const previousPeer = text(previous?.peerId);
  if (previousPeer && previousPeer !== currentUserId) return previousPeer;

  for (const source of callKindSources(raw)) {
    const inferred =
      extractDirectRoutePeer(source.callId, currentUserId) ||
      extractDirectRoutePeer(source.id, currentUserId) ||
      extractDirectRoutePeer(source.chatId, currentUserId) ||
      extractDirectRoutePeer(source.roomId, currentUserId);
    if (inferred && inferred !== currentUserId) return inferred;
  }

  const previousInferred =
    extractDirectRoutePeer(previous?.callId, currentUserId) ||
    extractDirectRoutePeer(previous?.id, currentUserId) ||
    extractDirectRoutePeer(previous?.chatId, currentUserId);

  return previousInferred && previousInferred !== currentUserId ? previousInferred : "";
}

function isUsefulHistoryItem(item: MessengerCallHistoryItem) {
  return Boolean(text(item.peerId) || text(item.chatId) || extractCallRouteParts(item.callId) || extractCallRouteParts(item.id));
}

function compactHistoryItems(list: MessengerCallHistoryItem[]) {
  const byKey = new Map<string, MessengerCallHistoryItem>();
  const order: string[] = [];

  for (const item of list) {
    if (!isUsefulHistoryItem(item)) continue;
    const key = text(item.callId) || text(item.id) || [item.userId, item.peerId, item.startedAt, item.kind].join(":");
    const existing = byKey.get(key);

    if (!existing) {
      byKey.set(key, item);
      order.push(key);
      continue;
    }

    byKey.set(key, {
      ...existing,
      ...item,
      kind: item.kind || existing.kind,
      peerId: text(item.peerId) || text(existing.peerId) || null,
      callId: text(item.callId) || text(existing.callId) || null,
      chatId: text(item.chatId) || text(existing.chatId) || null,
      avatarUrl: text(item.avatarUrl) || text(existing.avatarUrl) || null,
      counterpartyName: text(item.counterpartyName) || text(existing.counterpartyName) || "Sabi",
      raw: item.raw ?? existing.raw,
    });
  }

  return order.map((key) => byKey.get(key)).filter((item): item is MessengerCallHistoryItem => Boolean(item));
}

function isFinalStatus(value: MessengerCallStatus) {
  return value === "ended" || value === "missed" || value === "declined" || value === "failed" || value === "busy";
}

function status(value: unknown, eventName?: string): MessengerCallStatus {
  const source = String(String(value ?? "") + " " + String(eventName ?? "")).toLowerCase();

  if (source.includes("missed") || source.includes("no_answer") || source.includes("timeout")) return "missed";
  if (source.includes("declined") || source.includes("reject")) return "declined";
  if (source.includes("busy")) return "busy";
  if (source.includes("failed") || source.includes("error")) return "failed";
  if (source.includes("connected") || source.includes("active")) return "connected";
  if (source.includes("connecting") || source.includes("accepted") || source.includes("answer")) return "connecting";
  if (source.includes("ringing")) return "ringing";
  if (source.includes("ended") || source.includes("end") || source.includes("hangup") || source.includes("hang_up") || source.includes("local_end") || source.includes("remote_end") || source.includes("cancel")) return "ended";
  if (source.includes("calling") || source.includes("incoming") || source.includes("start")) return "calling";

  return "unknown";
}

function directionFromPayload(
  rawDirection: unknown,
  st: MessengerCallStatus,
  currentUserId?: string | null,
  fromUserId?: string | null,
  toUserId?: string | null,
): MessengerCallDirection {
  const explicit = String(rawDirection ?? "").trim().toLowerCase();

  if (st === "missed" || explicit === "missed") return "missed";
  if (explicit === "incoming" || explicit === "in") return "incoming";
  if (explicit === "outgoing" || explicit === "out") return "outgoing";

  const self = text(currentUserId);
  const from = text(fromUserId);
  const to = text(toUserId);

  if (self && from && self === from) return "outgoing";
  if (self && to && self === to) return "incoming";
  if (self && from && self !== from) return "incoming";

  return "outgoing";
}

function avatarLetter(name?: string | null, fallback?: string | null): string {
  const source = text(name, fallback, "S").replace(/^\+/, "");
  const match = source.match(/[A-Za-z\u0410-\u042F\u0430-\u044F\u0401\u04510-9]/u);
  return String(match?.[0] || source[0] || "S").toUpperCase();
}

function durationLabel(seconds: number): string | null {
  if (!seconds) return null;
  const safe = Math.max(0, Math.floor(seconds));
  const hh = Math.floor(safe / 3600);
  const mm = Math.floor((safe % 3600) / 60);
  const ss = safe % 60;

  if (hh > 0) {
    return [hh, mm, ss].map((part) => String(part).padStart(2, "0")).join(":");
  }

  return [mm, ss].map((part) => String(part).padStart(2, "0")).join(":");
}

function calculateDurationSeconds(startedAt?: string | null, answeredAt?: string | null, endedAt?: string | null) {
  const endMs = parseDateMs(endedAt) || Date.now();
  const startMs = parseDateMs(answeredAt) || parseDateMs(startedAt);
  if (!startMs || endMs <= startMs) return 0;
  return Math.max(0, Math.floor((endMs - startMs) / 1000));
}

function finalStatusFromEndReason(
  raw: AnyRecord,
  incomingDirection: MessengerCallDirection,
  previous?: MessengerCallHistoryItem | null,
  fallback: MessengerCallStatus = "ended",
): MessengerCallStatus {
  const reason = [
    text(raw.endReason),
    text(raw.reason),
    text(raw.signalState),
    text(raw.action),
    text(raw.event),
    text(raw.status),
    text(raw.phase),
  ].join(" ").toLowerCase();

  if (reason.includes("missed") || reason.includes("no_answer") || reason.includes("timeout")) return "missed";
  if (reason.includes("declined") || reason.includes("reject")) return "declined";
  if (reason.includes("busy")) return "busy";
  if (reason.includes("failed") || reason.includes("error")) return "failed";

  const wasAnswered = Boolean(previous?.answeredAt || previous?.status === "connected" || previous?.status === "ended" && previous.durationSeconds > 0);

  // Remote caller ended/cancelled before this device accepted: locally it is a missed call.
  if (
    !wasAnswered &&
    incomingDirection === "incoming" &&
    (reason.includes("local_end") || reason.includes("remote_end") || reason.includes("cancel") || reason.includes("ended") || reason.includes("end"))
  ) {
    return "missed";
  }

  return fallback;
}

function normalizeStored(value: unknown): MessengerCallHistoryItem | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const raw = value as AnyRecord;
  const id = text(raw.id, raw.callId);
  if (!id) return null;

  const startedAt = text(raw.startedAt, raw.createdAt, raw.at) || nowIso();
  const answeredAt = text(raw.answeredAt) || null;
  const endedAt = text(raw.endedAt) || null;
  const st = status(raw.status ?? raw.endReason ?? raw.phase);
  const seconds = Number(raw.durationSeconds);
  const durationSeconds = Number.isFinite(seconds) && seconds > 0
    ? Math.floor(seconds)
    : isFinalStatus(st)
      ? calculateDurationSeconds(startedAt, answeredAt, endedAt)
      : 0;
  const counterpartyName = text(raw.counterpartyName, raw.name, raw.title, raw.contactName) || "Sabi";
  const dir = directionFromPayload(raw.direction, st);

  return {
    id,
    callId: resolveFullCallId(raw),
    chatId: text(raw.chatId) || null,
    peerId: resolveCounterpartyId(raw, dir, text(raw.userId, raw.currentUserId), null) || null,
    userId: text(raw.userId, raw.currentUserId) || null,
    kind: resolveCallKind(raw),
    direction: st === "missed" ? "missed" : dir,
    status: st,
    roomType: text(raw.roomType) || null,
    counterpartyName,
    avatarLetter: avatarLetter(text(raw.avatarLetter), counterpartyName),
    avatarUrl: text(raw.avatarUrl, raw.avatarUri, raw.photoUrl, raw.callerAvatarUrl) || null,
    verified: bool(raw.verified),
    startedAt,
    answeredAt,
    endedAt,
    durationSeconds,
    durationLabel: text(raw.durationLabel) || durationLabel(durationSeconds),
    unread: st === "missed" || bool(raw.unread),
    missedNotificationId: text(raw.missedNotificationId) || null,
    source: raw.source === "session" || raw.source === "realtime" || raw.source === "manual" ? raw.source : "manual",
    raw,
  };
}

function findExistingIndex(callId: string, id: string) {
  return items.findIndex((item) => {
    const currentCallId = text(item.callId);
    const currentId = text(item.id);
    return Boolean(
      (callId && currentCallId && callId === currentCallId) ||
        (callId && currentId && callId === currentId) ||
        (id && currentId && id === currentId),
    );
  });
}

function resolveCounterpartyName(raw: AnyRecord, dir: MessengerCallDirection, previous?: MessengerCallHistoryItem | null) {
  if (text(raw.counterpartyName)) return text(raw.counterpartyName);

  if (dir === "outgoing") {
    return text(raw.targetName, raw.calleeName, raw.peerName, raw.contactName, raw.name, previous?.counterpartyName, "Sabi");
  }

  return text(raw.callerName, raw.contactName, raw.name, raw.peerName, previous?.counterpartyName, "Sabi");
}

function resolveCounterpartyAvatar(raw: AnyRecord, previous?: MessengerCallHistoryItem | null) {
  const dir = String(raw.direction || "").toLowerCase();
  if (dir === "outgoing" || dir === "out" || dir === "calling") {
    return text(
      raw.targetAvatarUrl,
      raw.targetPhotoUrl,
      raw.calleeAvatarUrl,
      raw.calleePhotoUrl,
      raw.peerAvatarUrl,
      raw.peerPhotoUrl,
      raw.avatarUrl,
      raw.avatarUri,
      raw.photoUrl,
      previous?.avatarUrl,
    ) || null;
  }

  return text(
    raw.callerAvatarUrl,
    raw.callerPhotoUrl,
    raw.fromAvatarUrl,
    raw.fromPhotoUrl,
    raw.avatarUrl,
    raw.avatarUri,
    raw.photoUrl,
    previous?.avatarUrl,
  ) || null;
}

async function persist() {
  await appStorage.setJson(STORAGE_KEY, items.slice(0, MAX_ITEMS));
}

function emit() {
  const snapshot = cloneItems();
  listeners.forEach((listener) => listener(snapshot));
}

export async function hydrateMessengerCallEvents(): Promise<MessengerCallHistoryItem[]> {
  if (hydrated) return cloneItems();

  const stored = await appStorage.getJson<unknown[]>(STORAGE_KEY);
  items = Array.isArray(stored)
    ? compactHistoryItems(stored.map(normalizeStored).filter((item): item is MessengerCallHistoryItem => Boolean(item)))
    : [];

  items = items
    .sort((a, b) => String(b.endedAt || b.answeredAt || b.startedAt || "").localeCompare(String(a.endedAt || a.answeredAt || a.startedAt || "")))
    .slice(0, MAX_ITEMS);

  hydrated = true;
  emit();
  return cloneItems();
}

export function subscribeMessengerCallEvents(listener: Listener): () => void {
  listeners.add(listener);
  void hydrateMessengerCallEvents().then(listener);
  return () => {
    listeners.delete(listener);
  };
}

export async function recordMessengerCallRealtimeEvent(
  eventName: string,
  payload?: unknown,
  options?: { currentUserId?: string | null },
): Promise<MessengerCallHistoryItem | null> {
  const raw = asRecord(payload);
  const callId = resolveFullCallId(raw);
  const chatId = text(raw.chatId, raw.roomId);
  const id = callId || text(raw.id) || [eventName, chatId, text(raw.peerId, raw.peerUserId, raw.fromUserId), Date.now()].filter(Boolean).join(":");

  if (!id) return null;

  await hydrateMessengerCallEvents();

  const existingIndex = findExistingIndex(callId, id);
  const previous = existingIndex >= 0 ? items[existingIndex] : null;

  if (shouldIgnoreAmbiguousCallHistoryEvent(eventName, raw, callId, previous)) {
    return null;
  }

  const eventStatus = status(raw.status ?? raw.phase ?? raw.signalState ?? raw.endReason ?? raw.reason ?? raw.event, eventName);
  const fromUserId = text(raw.fromUserId, raw.senderUserId, raw.callerId, raw.userId);
  const toUserId = text(raw.toUserId, raw.targetUserId, raw.receiverUserId, raw.peerId, raw.peerUserId);
  const selfUserId = text(options?.currentUserId, raw.currentUserId);
  const baseDirection = directionFromPayload(raw.direction, eventStatus, selfUserId, fromUserId, toUserId);

  const finalStatus = isFinalStatus(eventStatus)
    ? finalStatusFromEndReason(raw, previous?.direction === "missed" ? "incoming" : baseDirection, previous, eventStatus)
    : eventStatus;
  const nextDirection = finalStatus === "missed" ? "missed" : previous?.direction === "missed" && !isFinalStatus(finalStatus) ? baseDirection : baseDirection;

  const now = nowIso();
  const explicitStartedAt = text(raw.startedAt, raw.createdAt);
  const startedAt = previous?.startedAt || explicitStartedAt || text(raw.at) || now;
  const explicitAnsweredAt = text(raw.answeredAt);
  const answeredAt =
    previous?.answeredAt ||
    explicitAnsweredAt ||
    (finalStatus === "connected" || finalStatus === "ended" && previous?.status === "connected" ? now : null);
  const endedAt = isFinalStatus(finalStatus) ? text(raw.endedAt) || now : previous?.endedAt || null;
  const durationFromPayload = Number(raw.durationSeconds);
  const durationSeconds = isFinalStatus(finalStatus)
    ? Number.isFinite(durationFromPayload) && durationFromPayload > 0
      ? Math.floor(durationFromPayload)
      : calculateDurationSeconds(startedAt, answeredAt, endedAt)
    : previous?.durationSeconds || 0;
  const counterpartyName = resolveCounterpartyName(raw, nextDirection, previous);
  const avatarUrl = resolveCounterpartyAvatar(raw, previous);
  const explicitKind = resolveExplicitCallKind(raw, eventName);
  const peerId = resolveCounterpartyId(raw, nextDirection, selfUserId, previous) || null;
  const recalledKind = recallCallKind(callId || id);
  const resolvedKind = explicitKind || recalledKind || previous?.kind || resolveCallKind(raw, previous, eventName);
  const finalKind = explicitKind || resolvedKind || previous?.kind || "audio";
  rememberCallKind(callId || id, finalKind);

  const nextItem: MessengerCallHistoryItem = {
    id: previous?.id || id,
    callId: callId || previous?.callId || id,
    chatId: chatId || previous?.chatId || null,
    peerId,
    userId: selfUserId || previous?.userId || null,
    kind: finalKind,
    direction: nextDirection,
    status: finalStatus === "unknown" ? previous?.status || "unknown" : finalStatus,
    roomType: text(raw.roomType) || previous?.roomType || null,
    counterpartyName,
    avatarLetter: avatarLetter(text(raw.avatarLetter, raw.callerAvatarLetter), counterpartyName),
    avatarUrl,
    verified: typeof raw.verified === "undefined" ? previous?.verified : bool(raw.verified),
    startedAt,
    answeredAt,
    endedAt,
    durationSeconds,
    durationLabel: text(raw.durationLabel) || durationLabel(durationSeconds),
    unread: finalStatus === "missed" ? true : finalStatus === "connected" || finalStatus === "ended" || finalStatus === "declined" ? false : Boolean(previous?.unread),
    missedNotificationId: text(raw.missedNotificationId) || previous?.missedNotificationId || null,
    source: "realtime",
    raw: payload,
  };

  const nextItems = existingIndex >= 0
    ? [nextItem, ...items.filter((_, index) => index !== existingIndex)]
    : [nextItem, ...items];

  items = compactHistoryItems(nextItems)
    .sort((a, b) => String(b.endedAt || b.answeredAt || b.startedAt || "").localeCompare(String(a.endedAt || a.answeredAt || a.startedAt || "")))
    .slice(0, MAX_ITEMS);

  await persist();
  emit();

  return nextItem;
}

export async function markMessengerCallEventsRead(callId?: string | null): Promise<void> {
  await hydrateMessengerCallEvents();

  const target = text(callId);
  items = items.map((item) => {
    if (!target || item.callId === target || item.id === target) {
      return { ...item, unread: false };
    }
    return item;
  });

  await persist();
  emit();
}

export async function clearMessengerCallEvents(): Promise<void> {
  items = [];
  hydrated = true;
  await persist();
  emit();
}
