export type AppOverlayNotificationKind =
  | "message"
  | "missed_call"
  | "wallet"
  | "security"
  | "system"
  | "ai";

export type AppOverlayNotification = {
  id: string;
  kind: AppOverlayNotificationKind;
  title: string;
  message: string;
  createdAt: string;
  route?: string;
  referenceId?: string;
  counterparty?: string;
  amount?: number;
  currency?: string;
  priority?: "low" | "medium" | "high" | "critical";
  dedupeKey?: string;
};

export type AppOverlayNotificationState = {
  unreadMessages: number;
  missedCalls: number;
  moneyEvents: number;
  criticalEvents: number;
  items: AppOverlayNotification[];
};

const MAX_ITEMS = 6;
const DEDUPE_TTL_MS = 2500;

let state: AppOverlayNotificationState = {
  unreadMessages: 0,
  missedCalls: 0,
  moneyEvents: 0,
  criticalEvents: 0,
  items: [],
};

const listeners = new Set<() => void>();
const lastDedupeAt = new Map<string, number>();

function emitChange() {
  listeners.forEach((listener) => listener());
}

function normalizeId(value?: string | null) {
  const normalized = String(value || "").trim();
  return normalized || `overlay:${Date.now()}:${Math.random().toString(36).slice(2)}`;
}

function normalizeMessage(value?: string | null) {
  return String(value || "").trim();
}

function shouldSkipByDedupe(item: AppOverlayNotification) {
  const key = item.dedupeKey || item.id;
  if (!key) return false;

  const now = Date.now();
  const lastAt = lastDedupeAt.get(key) || 0;
  if (now - lastAt < DEDUPE_TTL_MS) return true;

  lastDedupeAt.set(key, now);

  Array.from(lastDedupeAt.entries()).forEach(([entryKey, at]) => {
    if (now - at > 60_000) lastDedupeAt.delete(entryKey);
  });

  return false;
}

export function getAppOverlayNotificationState() {
  return state;
}

export function subscribeAppOverlayNotificationState(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function pushAppOverlayNotification(input: Omit<AppOverlayNotification, "id" | "createdAt"> & {
  id?: string;
  createdAt?: string;
}) {
  const item: AppOverlayNotification = {
    ...input,
    id: normalizeId(input.id),
    title: normalizeMessage(input.title),
    message: normalizeMessage(input.message),
    createdAt: normalizeMessage(input.createdAt) || new Date().toISOString(),
  };

  if (!item.title && !item.message) return;
  if (shouldSkipByDedupe(item)) return;

  const unreadMessages = state.unreadMessages + (item.kind === "message" ? 1 : 0);
  const missedCalls = state.missedCalls + (item.kind === "missed_call" ? 1 : 0);
  const moneyEvents = state.moneyEvents + (item.kind === "wallet" ? 1 : 0);
  const criticalEvents = state.criticalEvents + (item.priority === "critical" ? 1 : 0);

  state = {
    unreadMessages,
    missedCalls,
    moneyEvents,
    criticalEvents,
    items: [item, ...state.items.filter((existing) => existing.id !== item.id)].slice(0, MAX_ITEMS),
  };

  emitChange();
}

export function clearAppOverlayNotificationCounters(kind?: AppOverlayNotificationKind | "all") {
  if (!kind || kind === "all") {
    state = {
      unreadMessages: 0,
      missedCalls: 0,
      moneyEvents: 0,
      criticalEvents: 0,
      items: [],
    };
    emitChange();
    return;
  }

  state = {
    unreadMessages: kind === "message" ? 0 : state.unreadMessages,
    missedCalls: kind === "missed_call" ? 0 : state.missedCalls,
    moneyEvents: kind === "wallet" ? 0 : state.moneyEvents,
    criticalEvents: kind === "security" || kind === "system" || kind === "ai" ? 0 : state.criticalEvents,
    items: state.items.filter((item) => item.kind !== kind),
  };
  emitChange();
}
