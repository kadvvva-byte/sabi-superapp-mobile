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

function cloneItems() {
  return items.map((item) => ({ ...item }));
}

function nowIso() {
  return new Date().toISOString();
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

function parseDateMs(value: unknown): number {
  const raw = text(value);
  if (!raw) return 0;
  const ms = new Date(raw).getTime();
  return Number.isFinite(ms) ? ms : 0;
}

function kind(value: unknown): MessengerCallKind {
  return String(value ?? "").toLowerCase().includes("video") ? "video" : "audio";
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
    callId: text(raw.callId) || id,
    chatId: text(raw.chatId) || null,
    peerId: text(raw.peerId, raw.peerUserId, raw.targetUserId, raw.toUserId) || null,
    userId: text(raw.userId, raw.currentUserId) || null,
    kind: kind(raw.kind ?? raw.type),
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
  return text(
    raw.avatarUrl,
    raw.avatarUri,
    raw.photoUrl,
    raw.callerAvatarUrl,
    raw.callerPhotoUrl,
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
    ? stored.map(normalizeStored).filter((item): item is MessengerCallHistoryItem => Boolean(item))
    : [];

  items = items
    .sort((a, b) => String(b.startedAt || b.endedAt || "").localeCompare(String(a.startedAt || a.endedAt || "")))
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
  const callId = text(raw.callId, raw.id);
  const chatId = text(raw.chatId, raw.roomId);
  const id = callId || text(raw.id) || [eventName, chatId, text(raw.peerId, raw.peerUserId, raw.fromUserId), Date.now()].filter(Boolean).join(":");

  if (!id) return null;

  await hydrateMessengerCallEvents();

  const existingIndex = findExistingIndex(callId, id);
  const previous = existingIndex >= 0 ? items[existingIndex] : null;

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

  const nextItem: MessengerCallHistoryItem = {
    id: previous?.id || id,
    callId: callId || previous?.callId || id,
    chatId: chatId || previous?.chatId || null,
    peerId:
      text(raw.peerId, raw.peerUserId, raw.targetUserId, raw.toUserId, raw.fromUserId, raw.senderUserId) ||
      previous?.peerId ||
      null,
    userId: selfUserId || previous?.userId || null,
    kind: kind(raw.kind ?? raw.type ?? previous?.kind),
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

  items = nextItems
    .sort((a, b) => String(b.startedAt || b.endedAt || "").localeCompare(String(a.startedAt || a.endedAt || "")))
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
