export type SabiCallSocketLike = {
  connected?: boolean;
  connect?: () => void;
  emit: (eventName: string, payload?: unknown) => void;
  on?: (eventName: string, handler: (...args: unknown[]) => void) => void;
  off?: (eventName: string, handler: (...args: unknown[]) => void) => void;
};

type AnyRecord = Record<string, unknown>;
type MediaKind = "audio" | "video";
type SignalKind = "incoming" | "accepted" | "offer" | "answer" | "ice" | "connected" | "ended" | "";

export type RelayAttemptResult = {
  ok: boolean;
  url: string;
  status?: number;
  statusText?: string;
  errorName?: string;
  errorMessage?: string;
};

export type RelayFailureRecord = {
  callId?: string;
  fromUserId?: string;
  toUserId?: string;
  signalKind?: string;
  endpoints: RelayAttemptResult[];
  at: string;
};

type SubscribeOptions = {
  currentUserId?: string | null;
  callId?: string | null;
};

function record(value: unknown): AnyRecord {
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

function unique(values: string[]) {
  return Array.from(new Set(values.map((value) => value.trim()).filter(Boolean)));
}

const SABI_CALL_RELAY_DIAGNOSTIC_LIMIT = 20;

function getRelayDiagnosticsStore(): RelayFailureRecord[] {
  const root = globalThis as AnyRecord;
  const existing = root.__SABI_CALL_RELAY_DIAGNOSTICS__;
  if (Array.isArray(existing)) return existing as RelayFailureRecord[];
  const next: RelayFailureRecord[] = [];
  root.__SABI_CALL_RELAY_DIAGNOSTICS__ = next;
  return next;
}

function rememberRelayFailure(record: RelayFailureRecord) {
  const store = getRelayDiagnosticsStore();
  store.unshift(record);
  if (store.length > SABI_CALL_RELAY_DIAGNOSTIC_LIMIT) store.splice(SABI_CALL_RELAY_DIAGNOSTIC_LIMIT);
  (globalThis as AnyRecord).__SABI_CALL_RELAY_LAST_FAILURE__ = record;
}

function warnRelayFailure(message: string, details: unknown) {
  try { console.warn(message, details); } catch {}
}

export function getSabiCallRelayLastFailure(): RelayFailureRecord | null {
  const value = (globalThis as AnyRecord).__SABI_CALL_RELAY_LAST_FAILURE__;
  return value && typeof value === "object" ? (value as RelayFailureRecord) : null;
}

export function getSabiCallRelayDiagnostics(): RelayFailureRecord[] {
  return getRelayDiagnosticsStore().slice();
}

function nestedRecords(body: AnyRecord): AnyRecord[] {
  return [body, record(body.payload), record(body.data), record(body.message)];
}

function fieldOf(payload: unknown, keys: string[]) {
  const body = record(payload);
  for (const source of nestedRecords(body)) {
    for (const key of keys) {
      const value = text(source[key]);
      if (value) return value;
    }
  }
  return "";
}

function callIdOf(payload: unknown) {
  return fieldOf(payload, ["callId", "callID", "id"]);
}

function chatIdOf(payload: unknown) {
  return fieldOf(payload, ["chatId", "roomId", "conversationId"]);
}

function fromUserIdOf(payload: unknown) {
  return fieldOf(payload, ["fromUserId", "senderUserId", "sourceUserId", "callerId", "callerUserId"]);
}

function toUserIdOf(payload: unknown) {
  return fieldOf(payload, ["toUserId", "targetUserId", "receiverUserId", "recipientId", "invitedUserId"]);
}

function normalizeMediaKind(payload: unknown): MediaKind {
  const body = record(payload);
  const raw = [
    fieldOf(body, ["callKind", "callType", "mediaKind", "kind", "type"]),
    text(body.routePath),
  ].join(" ").toLowerCase();
  return raw.includes("video") ? "video" : "audio";
}

export function getSabiCallTransportSignalKind(eventName: string, payload: unknown): SignalKind {
  const body = record(payload);
  const description = record(body.description);
  const nested = record(body.payload);
  const data = record(body.data);
  const message = record(body.message);
  const nestedDescription = record(nested.description);
  const dataDescription = record(data.description);
  const messageDescription = record(message.description);

  const raw = [
    eventName,
    text(body.signalKind), text(body.event), text(body.action), text(body.status), text(body.phase), text(body.descriptionType), text(description.type),
    text(nested.signalKind), text(nested.event), text(nested.action), text(nested.status), text(nested.phase), text(nested.descriptionType), text(nestedDescription.type),
    text(data.signalKind), text(data.event), text(data.action), text(data.status), text(data.phase), text(data.descriptionType), text(dataDescription.type),
    text(message.signalKind), text(message.event), text(message.action), text(message.status), text(message.phase), text(message.descriptionType), text(messageDescription.type),
  ].join(" ").toLowerCase();

  if (body.candidate || body.iceCandidate || nested.candidate || data.candidate || message.candidate || raw.includes(" ice") || raw.includes("candidate")) return "ice";
  if (raw.includes("answer")) return "answer";
  if (raw.includes("offer")) return "offer";
  if (raw.includes("accept")) return "accepted";
  if (raw.includes("connected") || raw.includes(" active")) return "connected";
  if (raw.includes("incoming") || raw.includes("ringing") || raw.includes("call:start") || raw.includes("call_incoming")) return "incoming";
  if (raw.includes("ended") || raw.includes(" end") || raw.includes("declined") || raw.includes("missed") || raw.includes("cancel") || raw.includes("busy") || raw.includes("hangup")) return "ended";
  return "";
}

function normalizePayload(payload: unknown, eventName = ""): AnyRecord {
  const body = record(payload);
  const mediaKind = normalizeMediaKind(body);
  const signalKind = getSabiCallTransportSignalKind(eventName, body) || text(body.signalKind, body.event, body.action) || "signal";
  const fromUserId = fromUserIdOf(body);
  const toUserId = toUserIdOf(body);
  const callId = callIdOf(body);
  const chatId = chatIdOf(body);

  return {
    ...body,
    id: text(body.id, callId) || undefined,
    callId: callId || undefined,
    chatId: chatId || undefined,
    roomId: text(body.roomId, chatId) || undefined,
    kind: mediaKind,
    type: mediaKind,
    callKind: mediaKind,
    callType: mediaKind,
    signalKind,
    event: text(body.event, body.action, signalKind) || signalKind,
    action: text(body.action, body.event, signalKind) || signalKind,
    fromUserId: fromUserId || undefined,
    senderUserId: text(body.senderUserId, fromUserId) || undefined,
    callerId: text(body.callerId, fromUserId) || undefined,
    toUserId: toUserId || undefined,
    targetUserId: text(body.targetUserId, toUserId) || undefined,
    receiverUserId: text(body.receiverUserId, toUserId) || undefined,
    peerId: text(body.peerId, toUserId) || undefined,
    peerUserId: text(body.peerUserId, toUserId) || undefined,
    callerName: text(body.callerName, body.fromName, body.senderName, body.name, body.contactName) || undefined,
    callerPhone: text(body.callerPhone, body.phone, body.fromPhone, body.senderPhone, body.msisdn, body.number) || undefined,
    actionUrl: text(body.actionUrl) || `${apiBaseUrl()}/api/v2/calls/signal`,
    at: text(body.at) || new Date().toISOString(),
  };
}

function eventsFor(mediaKind: MediaKind, signalKind: SignalKind, eventName: string): string[] {
  const mediaPrefix = mediaKind === "video" ? "video" : "audio";
  const mediaDash = mediaKind === "video" ? "video-call" : "audio-call";

  switch (signalKind) {
    case "incoming":
      return [eventName, "call:incoming", "call:start", "call:ringing", "sabi-call:incoming", `${mediaDash}:incoming`, `${mediaDash}:ringing`, `${mediaPrefix}:call:incoming`, "call:signal", `${mediaPrefix}:call:signal`];
    case "accepted":
      return [eventName, "call:accepted", "call:accept", "sabi-call:accepted", "sabi-call:accept", `${mediaDash}:accepted`, `${mediaPrefix}:call:accept`, "call:signal", `${mediaPrefix}:call:signal`];
    case "offer":
      return [eventName, "call:webrtc:offer", "call:signal", `${mediaPrefix}:call:signal`, `${mediaDash}:signal`];
    case "answer":
      return [eventName, "call:webrtc:answer", "call:signal", `${mediaPrefix}:call:signal`, `${mediaDash}:signal`];
    case "ice":
      return [eventName, "call:webrtc:ice", "call:signal", `${mediaPrefix}:call:signal`, `${mediaDash}:signal`];
    case "connected":
      return [eventName, "call:connected", "call:active", "sabi-call:connected", `${mediaDash}:connected`];
    case "ended":
      return [eventName, "call:end", "call:ended", "call:declined", "sabi-call:end", "sabi-call:ended", `${mediaDash}:ended`, `${mediaPrefix}:call:end`, "call:signal", `${mediaPrefix}:call:signal`];
    default:
      return [eventName];
  }
}

function makeEnvelope(eventName: string, payload: AnyRecord): AnyRecord {
  const toUserId = toUserIdOf(payload);
  const fromUserId = fromUserIdOf(payload);
  const callId = callIdOf(payload);
  const chatId = chatIdOf(payload);

  return {
    eventName,
    name: eventName,
    event: eventName,
    type: "sabi_call_event",
    payload,
    data: payload,
    message: payload,
    callId: callId || undefined,
    chatId: chatId || undefined,
    roomId: text(payload.roomId, chatId) || undefined,
    fromUserId: fromUserId || undefined,
    senderUserId: fromUserId || undefined,
    toUserId: toUserId || undefined,
    targetUserId: toUserId || undefined,
    receiverUserId: toUserId || undefined,
    userId: toUserId || undefined,
    channel: toUserId ? `user:${toUserId}` : undefined,
    callChannel: callId ? `call:${callId}` : undefined,
    at: new Date().toISOString(),
  };
}

function apiBaseUrl() {
  const env = (typeof process !== "undefined" ? (process as any).env : undefined) || {};
  const raw = text(env.EXPO_PUBLIC_API_BASE_URL, env.EXPO_PUBLIC_AUTH_API_BASE_URL, env.EXPO_PUBLIC_SOCKET_BASE_URL, "https://sabi-superapp-api-7srquvexva-ew.a.run.app");
  return raw.replace(/\/+$/, "");
}

const SABI_CALL_RELAY_TIMEOUT_MS = 10000;

function httpRelayEndpoints(_payload: AnyRecord, _signalKind: SignalKind): string[] {
  // CALL-RELAY-16: live backend currently exposes the universal signal route.
  // /api/v2/calls/invite returns 404 and /:callId/accept|decline|end returns 400,
  // so mobile must not try those routes before/after /signal.
  return ["/api/v2/calls/signal"];
}

async function postJsonWithTimeout(url: string, body: string): Promise<RelayAttemptResult> {
  const fetchFn = typeof fetch === "function" ? fetch : null;
  if (!fetchFn) {
    return { ok: false, url, errorName: "fetch_unavailable", errorMessage: "fetch is not available in this runtime" };
  }

  let timeout: ReturnType<typeof setTimeout> | undefined;
  try {
    const controller = typeof AbortController !== "undefined" ? new AbortController() : null;
    if (controller) {
      timeout = setTimeout(() => controller.abort(), SABI_CALL_RELAY_TIMEOUT_MS);
    }

    const response = await fetchFn(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      signal: controller?.signal,
    });

    const status = typeof response?.status === "number" ? response.status : undefined;
    const statusText = text(response?.statusText);
    const ok = !!response && response.ok !== false;
    const result: RelayAttemptResult = { ok, url, status, statusText: statusText || undefined };
    if (!ok) warnRelayFailure("[sabi-call:relay] backend returned non-ok response", result);
    return result;
  } catch (error) {
    const err = error instanceof Error ? error : null;
    const result: RelayAttemptResult = {
      ok: false,
      url,
      errorName: text(err?.name, "relay_error") || "relay_error",
      errorMessage: text(err?.message, String(error)) || "Unknown call relay error",
    };
    warnRelayFailure("[sabi-call:relay] http relay failed", result);
    return result;
  } finally {
    if (timeout) clearTimeout(timeout);
  }
}

function postHttpRelay(payload: AnyRecord, signalKind: SignalKind) {
  if (!signalKind || !payload.callId || !payload.fromUserId || !payload.toUserId) {
    const missing = {
      signalKind: signalKind || undefined,
      callId: text(payload.callId) || undefined,
      fromUserId: text(payload.fromUserId) || undefined,
      toUserId: text(payload.toUserId) || undefined,
    };
    warnRelayFailure("[sabi-call:relay] skipped because required payload fields are missing", missing);
    return;
  }
  const canonicalEvent = signalKind === "accepted" ? "accepted" : signalKind === "ended" ? (text(payload.event, payload.action).toLowerCase().includes("declin") ? "declined" : "ended") : text(payload.event, payload.action, signalKind) || signalKind;
  const body = JSON.stringify({
    ...payload,
    signalKind,
    event: canonicalEvent,
    action: canonicalEvent,
    relayTransport: "http",
    relayAt: new Date().toISOString(),
  });
  const baseUrl = apiBaseUrl();
  const endpoints = httpRelayEndpoints(payload, signalKind);

  void (async () => {
    const attempts: RelayAttemptResult[] = [];
    for (const endpoint of endpoints) {
      const result = await postJsonWithTimeout(`${baseUrl}${endpoint}`, body);
      attempts.push(result);
      if (result.ok) return;
    }

    const failure: RelayFailureRecord = {
      callId: text(payload.callId) || undefined,
      fromUserId: text(payload.fromUserId) || undefined,
      toUserId: text(payload.toUserId) || undefined,
      signalKind: signalKind || undefined,
      endpoints: attempts,
      at: new Date().toISOString(),
    };
    rememberRelayFailure(failure);
    warnRelayFailure("[sabi-call:relay] all backend relay endpoints failed", failure);
  })();
}

export function emitSabiCallTransportEvent(socket: SabiCallSocketLike, eventName: string, payload: unknown) {
  const body = normalizePayload(payload, eventName);
  const signalKind = getSabiCallTransportSignalKind(eventName, body);
  const mediaKind = normalizeMediaKind(body);
  const events = unique(eventsFor(mediaKind, signalKind, eventName));

  try { if (!socket.connected) socket.connect?.(); } catch {}

  const direct = {
    ...body,
    payload: body,
    data: body,
    message: body,
    urgent: true,
    relayAt: new Date().toISOString(),
  };

  for (const event of events) {
    try { socket.emit(event, direct); } catch {}
    try { socket.emit(event, body); } catch {}
  }

  const relayEvents = unique(["realtime:event", "messenger:realtime:event", "call:realtime:event"]);
  for (const wrappedEvent of relayEvents) {
    try { socket.emit(wrappedEvent, makeEnvelope("call:signal", { ...body, relayEvent: "call:signal" })); } catch {}
  }

  postHttpRelay(body, signalKind);
}

export function joinSabiCallTransportScopes(socket: SabiCallSocketLike, payload: unknown) {
  const body = normalizePayload(payload, "join");
  const userId = text(body.userId, body.currentUserId, body.fromUserId);
  const callId = callIdOf(body);
  const chatId = chatIdOf(body);
  const scopes = unique([
    userId ? `user:${userId}` : "",
    callId ? `call:${callId}` : "",
    chatId ? `chat:${chatId}` : "",
    chatId ? `room:${chatId}` : "",
  ]);

  try { if (!socket.connected) socket.connect?.(); } catch {}

  const joinPayload = { ...body, event: "join", action: "join", userId, currentUserId: userId, scopes };
  for (const eventName of unique(["call:room:join", "call.room.join", "video:call:join", "audio:call:join", "realtime:channel:join", "channel:join", "messenger:channel:join"])) {
    try { socket.emit(eventName, joinPayload); } catch {}
  }

  for (const scope of scopes) {
    try { socket.emit("realtime:channel:join", { channel: scope, roomId: chatId, chatId, callId, userId, at: new Date().toISOString() }); } catch {}
    try { socket.emit("channel:join", { channel: scope, roomId: chatId, chatId, callId, userId, at: new Date().toISOString() }); } catch {}
  }
}

export function leaveSabiCallTransportScopes(socket: SabiCallSocketLike, payload: unknown) {
  const body = normalizePayload(payload, "leave");
  const userId = text(body.userId, body.currentUserId, body.fromUserId);
  const callId = callIdOf(body);
  const chatId = chatIdOf(body);
  const scopes = unique([callId ? `call:${callId}` : "", chatId ? `chat:${chatId}` : "", chatId ? `room:${chatId}` : ""]);
  const leavePayload = { ...body, event: "leave", action: "leave", userId, currentUserId: userId, scopes };
  for (const eventName of unique(["call:room:leave", "call.room.leave", "video:call:leave", "audio:call:leave", "realtime:channel:leave", "channel:leave", "messenger:channel:leave"])) {
    try { socket.emit(eventName, leavePayload); } catch {}
  }
}

function unwrapEnvelope(value: unknown): { eventName: string; payload: unknown } | null {
  const body = record(value);
  const payload = body.payload ?? body.data ?? body.message ?? null;
  if (!payload || typeof payload !== "object") return null;
  const eventName = text(body.eventName, body.name, body.event, body.type, record(payload).relayEvent, "call:signal");
  return { eventName, payload };
}

function eventMatchesWanted(eventName: string, payload: unknown, wanted: Set<string>) {
  if (wanted.has(eventName)) return true;
  const kind = getSabiCallTransportSignalKind(eventName, payload);
  if (kind === "offer" && wanted.has("call:webrtc:offer")) return true;
  if (kind === "answer" && wanted.has("call:webrtc:answer")) return true;
  if (kind === "ice" && wanted.has("call:webrtc:ice")) return true;
  if (kind === "accepted" && (wanted.has("call:accepted") || wanted.has("call:accept"))) return true;
  if (kind === "connected" && (wanted.has("call:connected") || wanted.has("call:active"))) return true;
  if (kind === "incoming" && (wanted.has("call:incoming") || wanted.has("call:start"))) return true;
  if (kind === "ended" && (wanted.has("call:ended") || wanted.has("call:end"))) return true;
  return false;
}

export function subscribeSabiCallTransportEvents(
  socket: SabiCallSocketLike,
  eventNames: string[],
  handler: (payload: unknown, eventName: string) => void,
  options: SubscribeOptions = {},
) {
  const wanted = new Set(unique(eventNames));
  const unsubscribers: Array<() => void> = [];

  const shouldDeliver = (payload: unknown) => {
    const body = normalizePayload(payload, "");
    const callId = text(options.callId);
    const currentUserId = text(options.currentUserId);
    const payloadCallId = callIdOf(body);
    if (callId && payloadCallId && payloadCallId !== callId) return false;

    if (currentUserId) {
      const fromUserId = fromUserIdOf(body);
      const toUserId = toUserIdOf(body);
      if (fromUserId && fromUserId === currentUserId) return false;
      if (toUserId && toUserId !== currentUserId) return false;
    }
    return true;
  };

  const add = (eventName: string, fn: (...args: unknown[]) => void) => {
    try {
      socket.on?.(eventName, fn);
      unsubscribers.push(() => { try { socket.off?.(eventName, fn); } catch {} });
    } catch {}
  };

  for (const eventName of wanted) {
    add(eventName, (payload) => {
      if (!shouldDeliver(payload)) return;
      handler(payload, eventName);
    });
  }

  for (const wrappedEvent of ["realtime:event", "messenger:realtime:event", "call:realtime:event", "sabi:realtime:event", "user:realtime:event"]) {
    add(wrappedEvent, (envelope) => {
      const unwrapped = unwrapEnvelope(envelope);
      if (!unwrapped) return;
      if (!eventMatchesWanted(unwrapped.eventName, unwrapped.payload, wanted)) return;
      if (!shouldDeliver(unwrapped.payload)) return;
      handler(unwrapped.payload, unwrapped.eventName);
    });
  }

  return () => {
    unsubscribers.splice(0).forEach((unsubscribe) => unsubscribe());
  };
}

