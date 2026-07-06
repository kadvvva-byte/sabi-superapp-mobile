// CALL-SPLIT-124.1: physical video runtime copy.
// Next step will simplify this runtime for video-only behavior.

import { resetSabiCallAudioMode as resetSabiCallAudioModeBridge, setSabiCallAudioMode } from "../sabiCallAudio";
import {
  RTCPeerConnection,
  RTCIceCandidate,
  RTCSessionDescription,
  mediaDevices,
} from "react-native-webrtc";

import { profileStore } from "../../profile/profile-store";
import { resolveSabiCallIceServers, summarizeSabiCallIceServersForDebug } from "../callIceServers";
import { emitSabiCallTransportEvent } from "../callSignalTransport";

export type StandardCallKind = "audio" | "video";
export type StandardCallPhase = "calling" | "ringing" | "connecting" | "active" | "ended";
export type StandardCameraFacing = "user" | "environment";

export type StandardCallRoute = {
  kind: StandardCallKind;
  incoming: boolean;
  callId: string;
  chatId: string;
  roomId: string;
  userId: string;
  peerId: string;
  name: string;
  avatarLetter: string;
  accent?: string;
  background?: string;
  avatarUrl?: string;
  photoUrl?: string;
};

type AnyRecord = Record<string, unknown>;

export function firstText(...values: unknown[]): string {
  for (const value of values) {
    if (Array.isArray(value)) {
      const nested = firstText(...value);
      if (nested) return nested;
      continue;
    }
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return "";
}

export function record(value: unknown): AnyRecord {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as AnyRecord) : {};
}


function sanitizeSabiCallDebugValue(value: unknown): unknown {
  if (value === null || value === undefined) return value;
  if (typeof value === "string") return value.length > 220 ? value.slice(0, 220) + "…" : value;
  if (typeof value === "number" || typeof value === "boolean") return value;
  if (Array.isArray(value)) return value.slice(0, 8).map(sanitizeSabiCallDebugValue);
  if (typeof value === "object") {
    const source = value as Record<string, unknown>;
    const out: Record<string, unknown> = {};
    const allowedKeys = [
      "event",
      "action",
      "status",
      "phase",
      "reason",
      "endReason",
      "signalKind",
      "type",
      "callId",
      "id",
      "kind",
      "incoming",
      "fromUserId",
      "senderUserId",
      "toUserId",
      "receiverUserId",
      "peerId",
      "userId",
      "descriptionType",
      "sdp",
      "candidate",
      "iceConnectionState",
      "connectionState",
      "signalingState",
      "tracks",
      "audio",
      "video",
      "videoEnabled",
      "videoMuted",
      "videoReadyState",
      "message",
      "error",
    ];

    allowedKeys.forEach((key) => {
      if (key in source) out[key] = sanitizeSabiCallDebugValue(source[key]);
    });

    return out;
  }
  return String(value);
}

export function summarizeSabiCallPayloadForDebug(payload: unknown): Record<string, unknown> {
  const body = record(payload);
  const description = record(body.description);
  const nestedPayload = record(body.payload);
  const candidate = body.candidate || body.iceCandidate || nestedPayload.candidate;
  const candidateRecord = record(candidate);

  return {
    callId: firstText(body.callId, body.id),
    event: firstText(body.event, body.action, body.phase, body.status),
    signalKind: firstText(body.signalKind, body.kind, body.type, description.type),
    fromUserId: firstText(body.fromUserId, body.senderUserId, body.userId, body.callerId),
    toUserId: firstText(body.toUserId, body.targetUserId, body.receiverUserId, body.peerId, body.peerUserId),
    descriptionType: firstText(description.type, body.descriptionType),
    sdp: firstText(description.sdp, body.sdp).slice(0, 96),
    candidate: firstText(candidateRecord.candidate).slice(0, 96),
    reason: firstText(body.reason, body.endReason),
  };
}

const SABI_VIDEO_NOISY_DEBUG_STAGES = new Set([
  "screen:signal:recv",
  "screen:answer:recv",
  "screen:ice:recv",
  "answer:recv",
  "ice:recv",
  "ice:queued",
  "ice:applied",
  "peer:state",
]);

function sabiVideoDebugDedupeKey(
  route: Pick<StandardCallRoute, "callId" | "kind" | "incoming" | "userId" | "peerId"> | null | undefined,
  stage: string,
  details: Record<string, unknown>,
): string {
  const callId = route?.callId || firstText(details.callId);
  const userId = route?.userId || firstText(details.userId);
  const peerId = route?.peerId || firstText(details.peerId);
  const signalKind = firstText(details.signalKind, details.event);

  // ICE candidates are naturally noisy. For logging we only need a compact
  // state pulse, not every candidate line. This does NOT drop or change ICE
  // processing; it only suppresses repeated console/debug lines.
  if (stage.includes("ice") || signalKind === "ice") {
    return [
      "ice-log-pulse",
      stage,
      callId,
      userId,
      peerId,
      firstText(details.iceConnectionState),
      firstText(details.connectionState),
      firstText(details.signalingState),
    ].join("|");
  }

  if (stage === "screen:signal:recv") {
    return [
      stage,
      callId,
      userId,
      peerId,
      signalKind,
      firstText(details.descriptionType),
      firstText(details.sdp).slice(0, 80),
    ].join("|");
  }

  return [
    stage,
    callId,
    userId,
    peerId,
    firstText(details.event),
    signalKind,
    firstText(details.descriptionType),
    firstText(details.sdp).slice(0, 120),
    firstText(details.candidate).slice(0, 80),
    firstText(details.iceConnectionState),
    firstText(details.connectionState),
    firstText(details.signalingState),
  ].join("|");
}

export function logSabiCallDebug(
  route: Pick<StandardCallRoute, "callId" | "kind" | "incoming" | "userId" | "peerId"> | null | undefined,
  stage: string,
  details: Record<string, unknown> = {},
) {
  try {
    const safeDetails = sanitizeSabiCallDebugValue(details) as Record<string, unknown>;

    if (SABI_VIDEO_NOISY_DEBUG_STAGES.has(stage)) {
      const root = globalThis as any;
      const seen = (root.__sabiVideoDebugDedupe ||= {}) as Record<string, number>;
      const key = sabiVideoDebugDedupeKey(route, stage, safeDetails);
      const now = Date.now();
      const previousAt = Number(seen[key] || 0);
      if (previousAt > 0 && now - previousAt < 1800) return;
      seen[key] = now;

      const keys = Object.keys(seen);
      if (keys.length > 600) {
        for (const staleKey of keys.slice(0, 250)) delete seen[staleKey];
      }
    }

    const entry = {
      at: new Date().toISOString(),
      stage,
      callId: route?.callId || firstText(details.callId),
      kind: route?.kind,
      incoming: route?.incoming,
      userId: route?.userId,
      peerId: route?.peerId,
      ...safeDetails,
    };

    const globalDebug = globalThis as unknown as {
      __sabiCallDebugLog?: Array<Record<string, unknown>>;
    };

    const buffer = globalDebug.__sabiCallDebugLog || [];
    buffer.push(entry);
    globalDebug.__sabiCallDebugLog = buffer.slice(-180);

    console.log("[sabi-call:debug]", JSON.stringify(entry));
  } catch {}
}

function safeColor(value: string | undefined, fallback: string): string {
  return value && /^#[0-9A-Fa-f]{6}$/.test(value) ? value : fallback;
}


function readRouteUsersFromCallId(callId: string): { fromUserId: string; toUserId: string } {
  const parts = String(callId || "").split(":");
  if (parts.length >= 6 && parts[0] === "call") {
    return { fromUserId: parts[2] || "", toUserId: parts[3] || "" };
  }
  return { fromUserId: "", toUserId: "" };
}

function buildFullCallId(chatId: string, userId: string, peerId: string, provided?: string) {
  const raw = firstText(provided);
  const parts = raw.split(":");
  if (raw.startsWith("call:") && parts.length >= 6 && parts[2] && parts[3]) return raw;
  const safeChatId = firstText(chatId, "direct").replace(/:/g, "_");
  return ["call", safeChatId, userId || "self", peerId || "peer", Date.now(), Math.random().toString(36).slice(2, 10)].join(":");
}

export function parseStandardCallRoute(params: unknown, fallbackKind: StandardCallKind): StandardCallRoute {
  const p = record(params);
  const rawKind = firstText(p.kind, p.type, p.callKind, p.callType).toLowerCase();
  const kind = rawKind.includes("video") ? "video" : fallbackKind;

  const rawDirection = firstText(p.incoming, p.direction, p.action, p.event).toLowerCase();
  const incoming =
    rawDirection === "1" ||
    rawDirection === "true" ||
    rawDirection === "yes" ||
    rawDirection === "incoming";

  const providedCallId = firstText(p.callId, p.id);
  const callUsers = readRouteUsersFromCallId(providedCallId);
  const chatId = firstText(p.chatId, p.roomId) || "direct";
  const roomId = firstText(p.roomId) || chatId;
  let userId = incoming
    ? firstText(p.currentUserId, p.selfId, p.toUserId, p.receiverUserId, p.userId, callUsers.toUserId)
    : firstText(p.userId, p.currentUserId, p.selfId, p.fromUserId, p.senderUserId, callUsers.fromUserId);
  let peerId = incoming
    ? firstText(p.peerId, p.peerUserId, p.partnerId, p.fromUserId, p.callerId, p.senderUserId, callUsers.fromUserId)
    : firstText(p.peerId, p.peerUserId, p.partnerId, p.targetUserId, p.toUserId, p.receiverUserId, callUsers.toUserId);
  if (userId && peerId && userId === peerId) {
    const fallbackPeer = incoming ? callUsers.fromUserId : callUsers.toUserId;
    if (fallbackPeer && fallbackPeer !== userId) peerId = fallbackPeer;
  }

  const callId = buildFullCallId(chatId, userId, peerId, providedCallId);
  const name = firstText(p.name, p.contactName, p.callerName, p.roomTitle) || "Sabi";
  const avatarLetter =
    firstText(p.avatarLetter) ||
    name.replace(/^\\+/, "").match(/[A-Za-z\\u0410-\\u042F\\u0430-\\u044F\\u0401\\u04510-9]/u)?.[0]?.toUpperCase() ||
    "S";

  const accent = safeColor(firstText(p.themeAccent, p.accent, p.accentColor, p.chatAccent), "#25D366");
  const background = safeColor(firstText(p.themeBackground, p.background, p.chatBackground), "#07130F");

  const avatarUrl = firstText(p.avatarUrl, p.photoUrl, p.avatarUri, p.profilePhotoUrl);
  const photoUrl = firstText(p.photoUrl, p.avatarUrl, p.avatarUri, p.profilePhotoUrl);

  return { kind, incoming, callId, chatId, roomId, userId, peerId, name, avatarLetter, accent, background, avatarUrl, photoUrl };
}

function currentSabiCallerProfile() {
  try {
    const user = profileStore.getState().user;
    const name = firstText(user?.fullName, user?.username, user?.phone);
    const avatarLetter = firstText(user?.avatarLetter) ||
      name.replace(/^\+/, "").match(/[A-Za-z\u0410-\u042F\u0430-\u044F\u0401\u04510-9]/u)?.[0]?.toUpperCase() ||
      "S";
    const avatarUrl = firstText(user?.avatarUri);

    return { name, avatarLetter, avatarUrl };
  } catch {
    return { name: "", avatarLetter: "", avatarUrl: "" };
  }
}

function makePayloadDisplayFields(route: StandardCallRoute, patch: AnyRecord) {
  const eventText = firstText(patch.event, patch.action, patch.phase, patch.status).toLowerCase();
  const isOutgoingIncomingInvite = !route.incoming && (
    eventText.includes("incoming") ||
    eventText.includes("ringing") ||
    eventText.includes("start")
  );

  if (!isOutgoingIncomingInvite) {
    return {
      name: route.name,
      contactName: route.name,
      callerName: firstText(patch.callerName),
      targetName: firstText(patch.targetName) || route.name,
      avatarLetter: route.avatarLetter,
      avatarUrl: route.avatarUrl || route.photoUrl || undefined,
      photoUrl: route.photoUrl || route.avatarUrl || undefined,
    };
  }

  const caller = currentSabiCallerProfile();
  const callerName = firstText(patch.callerName, caller.name, route.userId) || "Sabi";
  const callerAvatarLetter = firstText(patch.callerAvatarLetter, caller.avatarLetter) ||
    callerName.replace(/^\+/, "").match(/[A-Za-z\u0410-\u042F\u0430-\u044F\u0401\u04510-9]/u)?.[0]?.toUpperCase() ||
    "S";
  const callerAvatarUrl = firstText(patch.callerAvatarUrl, caller.avatarUrl);

  return {
    name: callerName,
    contactName: callerName,
    callerName,
    targetName: firstText(patch.targetName) || route.name,
    calleeName: firstText(patch.calleeName) || route.name,
    avatarLetter: callerAvatarLetter,
    callerAvatarLetter,
    avatarUrl: callerAvatarUrl || undefined,
    photoUrl: callerAvatarUrl || undefined,
  };
}

export function makeCallPayload(route: StandardCallRoute, patch: AnyRecord = {}): AnyRecord {
  const display = makePayloadDisplayFields(route, patch);

  return {
    ...patch,
    id: route.callId,
    callId: route.callId,
    chatId: route.chatId,
    roomId: route.roomId,
    kind: route.kind,
    type: route.kind,
    callKind: route.kind,
    callType: route.kind,
    signalKind: firstText(patch.signalKind, patch.event, patch.action),
    userId: route.userId,
    currentUserId: route.userId,
    fromUserId: route.userId,
    senderUserId: route.userId,
    peerId: route.peerId,
    peerUserId: route.peerId,
    targetUserId: route.peerId,
    toUserId: route.peerId,
    receiverUserId: route.peerId,
    name: display.name,
    contactName: display.contactName,
    callerName: display.callerName || undefined,
    targetName: display.targetName || undefined,
    calleeName: display.calleeName || undefined,
    avatarLetter: display.avatarLetter,
    callerAvatarLetter: display.callerAvatarLetter || undefined,
    avatarUrl: display.avatarUrl || undefined,
    photoUrl: display.photoUrl || undefined,
    at: new Date().toISOString(),
  };
}

export function payloadMatches(route: StandardCallRoute, payload: unknown): boolean {
  const body = record(payload);
  const callId = firstText(body.callId, body.id);

  if (callId && callId !== route.callId) return false;

  const from = firstText(body.fromUserId, body.senderUserId, body.userId, body.callerId);
  const to = firstText(body.toUserId, body.targetUserId, body.receiverUserId, body.peerId, body.peerUserId);

  if (from && from !== route.userId && from !== route.peerId) return false;
  if (to && to !== route.userId && to !== route.peerId) return false;

  return Boolean(callId || from || to);
}

export function isFromPeer(route: StandardCallRoute, payload: unknown): boolean {
  const body = record(payload);
  const from = firstText(body.fromUserId, body.senderUserId, body.userId, body.callerId);
  return Boolean(route.peerId && from && from === route.peerId);
}

export function isRealCallEndPayload(payload: unknown): boolean {
  const body = record(payload);
  const raw = [
    firstText(body.event),
    firstText(body.status),
    firstText(body.phase),
    firstText(body.signalState),
    firstText(body.endReason),
    firstText(body.reason),
  ].join(" ").toLowerCase();

  return (
    raw.includes("ended") ||
    raw.includes("declined") ||
    raw.includes("local_end") ||
    raw.includes("remote_end") ||
    raw.includes("cancel") ||
    raw.includes("busy")
  );
}

export function makeSignalKey(eventName: string, payload: unknown): string {
  const sources = sabiCallPayloadRecords(payload);
  const body = sources[0] || {};
  const description = record(body.description);
  const candidate = sabiCallCandidate(payload);
  const sdp = firstText(
    description.sdp,
    body.sdp,
    ...sources.map((source) => firstText(record(source.description).sdp, source.sdp)),
  );

  return [
    eventName,
    firstText(...sources.map((source) => firstText(source.callId, source.id))),
    firstText(...sources.map((source) => firstText(source.fromUserId, source.senderUserId, source.userId, source.callerId))),
    firstText(...sources.map((source) => firstText(record(source.description).type, source.descriptionType, source.signalKind, source.type, source.kind, source.event))),
    sdp.slice(0, 240),
    sabiCallCandidateKey(candidate).slice(0, 240),
  ].join("|");
}

export function clock(seconds: number): string {
  const m = Math.floor(seconds / 60).toString().padStart(2, "0");
  const s = Math.floor(seconds % 60).toString().padStart(2, "0");
  return m + ":" + s;
}

type SocketLike = {
  emit: (eventName: string, payload?: unknown) => void;
};

const SABI_CALL_INITIAL_OFFER_LOCKS = new Set<string>();
const SABI_CALL_INITIAL_ANSWER_LOCKS = new Set<string>();

function callLockKey(route: StandardCallRoute, side: "offer" | "answer"): string {
  return [
    route.callId,
    side,
    route.userId,
    route.peerId,
    route.incoming ? "incoming" : "outgoing",
  ].join("|");
}

function clearCallLocks(route: StandardCallRoute) {
  const directPrefix = route.callId + "|";

  for (const key of Array.from(SABI_CALL_INITIAL_OFFER_LOCKS)) {
    if (key.startsWith(directPrefix)) SABI_CALL_INITIAL_OFFER_LOCKS.delete(key);
  }

  for (const key of Array.from(SABI_CALL_INITIAL_ANSWER_LOCKS)) {
    if (key.startsWith(directPrefix)) SABI_CALL_INITIAL_ANSWER_LOCKS.delete(key);
  }
}

function normalizeRemoteSdp(value: unknown): string {
  const raw = firstText(value);
  if (!raw) return "";
  const normalized = raw
    .replace(/\\r\\n/g, "\r\n")
    .replace(/\\n/g, "\n")
    .replace(/\r?\n/g, "\r\n")
    .replace(/^\uFEFF/, "");
  return normalized.endsWith("\r\n") ? normalized : normalized + "\r\n";
}

function sabiCallPayloadRecords(payload: unknown): AnyRecord[] {
  const body = record(payload);
  const nested = record(body.payload);
  const data = record(body.data);
  const message = record(body.message);
  return [body, nested, data, message];
}

function sabiCallDescription(payload: unknown, fallbackType: "offer" | "answer") {
  const sources = sabiCallPayloadRecords(payload);
  for (const source of sources) {
    const description = record(source.description);
    const sdp = normalizeRemoteSdp(firstText(
      description.sdp,
      source.sdp,
      record(source.payload).sdp,
      record(source.data).sdp,
      record(source.message).sdp,
    ));

    if (!sdp || !sdp.startsWith("v=")) continue;

    const rawType = firstText(
      description.type,
      source.descriptionType,
      source.signalKind,
      source.event,
      source.action,
      fallbackType,
    ).toLowerCase();

    const type = rawType.includes("answer") ? "answer" : rawType.includes("offer") ? "offer" : fallbackType;
    return {
      ...(Object.keys(description).length > 0 ? description : {}),
      type: type as "offer" | "answer",
      sdp,
    };
  }

  return null;
}

function sabiCallCandidate(payload: unknown) {
  for (const source of sabiCallPayloadRecords(payload)) {
    const candidate = source.candidate || source.iceCandidate || record(source.payload).candidate || record(source.data).candidate || record(source.message).candidate;
    if (!candidate) continue;
    if (typeof candidate === "string") return { candidate };
    if (typeof candidate === "object") return candidate;
  }
  return null;
}

function sabiCallCandidateKey(candidate: unknown): string {
  const body = record(candidate);
  return firstText(body.candidate, candidate).slice(0, 240);
}

async function setRemoteDescriptionCompat(connection: any, description: { type: "offer" | "answer"; sdp: string }, label: string) {
  const clean = { type: description.type, sdp: normalizeRemoteSdp(description.sdp) };
  if (!clean.sdp || !clean.sdp.startsWith("v=")) throw new Error("invalid_remote_" + description.type);

  try {
    return await withSabiCallTimeout(label, connection.setRemoteDescription(clean as any), 7000);
  } catch (firstError) {
    try {
      const cloned = JSON.parse(JSON.stringify(clean));
      return await withSabiCallTimeout(label + "_clone", connection.setRemoteDescription(cloned as any), 7000);
    } catch (secondError) {
      try {
        const ctorDescription = new RTCSessionDescription(clean as any);
        return await withSabiCallTimeout(label + "_ctor", connection.setRemoteDescription(ctorDescription as any), 7000);
      } catch {
        throw secondError || firstError;
      }
    }
  }
}

function sabiHasRemoteDescription(connection: any): boolean {
  try {
    return Boolean(connection?.remoteDescription || connection?.currentRemoteDescription || connection?.pendingRemoteDescription);
  } catch {
    return false;
  }
}

function sabiSignalingState(connection: any): string {
  try {
    return String(connection?.signalingState || "stable");
  } catch {
    return "stable";
  }
}

async function withSabiCallTimeout<T>(label: string, promise: Promise<T>, timeoutMs = 9000): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | null = null;

  try {
    return await Promise.race([
      promise,
      new Promise<T>((_, reject) => {
        timer = setTimeout(() => reject(new Error(label + "_timeout")), timeoutMs);
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

function isRenegotiatePayload(payload: unknown): boolean {
  const body = record(payload);
  const event = firstText(body.event).toLowerCase();
  return event.includes("renegotiate");
}

async function stabilizeVideoSender(sender: any) {
  try {
    if (!sender || typeof sender.getParameters !== "function") return;

    const parameters = sender.getParameters() || {};
    parameters.encodings = Array.isArray(parameters.encodings) && parameters.encodings.length
      ? parameters.encodings
      : [{}];

    parameters.encodings[0] = {
      ...parameters.encodings[0],
      maxBitrate: 850000,
      maxFramerate: 24,
    };

    if ("degradationPreference" in parameters) {
      parameters.degradationPreference = "maintain-framerate";
    }

    if (typeof sender.setParameters === "function") {
      await sender.setParameters(parameters);
    }
  } catch {}
}


async function resetSabiCallAudioMode() {
  await resetSabiCallAudioModeBridge();
}

function videoConstraints(facing: StandardCameraFacing) {
  // SABI-VIDEO-800_FAST_CONNECT:
  // Start with stable mobile constraints. Previous 640x360/24fps made
  // createOffer/setLocalDescription wait 5-20 seconds on Android.
  // Users need instant connection first; quality can be renegotiated later.
  return {
    facingMode: facing,
    width: 320,
    height: 240,
    frameRate: 15,
  };
}

export function createStandardCallPeer(options: {
  route: StandardCallRoute;
  socket: SocketLike;
  initialVideoEnabled?: boolean;
  initialCameraFacing?: StandardCameraFacing;
  // VIDEO-CALLS-1.6: repeat incoming calls answer the offer first, then
  // attach local mic/camera after Accept. This avoids the 3-4s Android
  // getUserMedia wait before answer, without opening camera before Accept.
  deferInitialLocalMedia?: boolean;
  localMediaBeforeAnswerTimeoutMs?: number;
  canStartCaller: () => boolean;
  onLocalStream?: (stream: any | null) => void;
  onRemoteStream?: (stream: any | null) => void;
  onConnected: () => void;
  onError: (message: string) => void;
}) {
  let pc: any | null = null;
  let peerPromise: Promise<any> | null = null;
  let localStream: any | null = null;
  let localStreamPromise: Promise<any> | null = null;
  let localVideoTrack: any | null = null;
  let localAudioSender: any | null = null;
  let videoSender: any | null = null;
  let closed = false;
  // SABI_ECHO_GUARD: audio calls must start through the earpiece.
  // Loudspeaker on a phone is the main reason the remote voice returns into
  // the microphone and creates echo. Video calls keep speaker by default;
  // audio calls can still enable speaker manually from the existing button.
  let speakerEnabled = options.route.kind === "video";
  let videoWanted = Boolean(options.initialVideoEnabled ?? options.route.kind === "video");
  let cameraFacing: StandardCameraFacing = options.initialCameraFacing ?? "user";
  let makingOffer = false;
  let lastNegotiationAt = 0;
  let upgradingVideo = false;
  let lastCameraSwitchAt = 0;
  let lastRemoteStreamUrl = "";
  let connectedEmitted = false;
  const pendingIceCandidates: unknown[] = [];
  const pendingIceCandidateKeys = new Set<string>();
  const appliedIceCandidateKeys = new Set<string>();
  let lastLocalAnswerDescription: AnyRecord | null = null;
  let lastRemoteAnswerSdp = "";
  let applyingRemoteAnswerSdp = "";

  const debug = (stage: string, details: Record<string, unknown> = {}) => {
    logSabiCallDebug(options.route, stage, {
      signalingState: pc?.signalingState,
      iceConnectionState: pc?.iceConnectionState,
      connectionState: pc?.connectionState,
      pendingIce: pendingIceCandidates.length,
      ...details,
    });
  };

  const isPeerClosedState = (targetPc: any | null = pc) => {
    const ice = String(targetPc?.iceConnectionState || "");
    const connection = String(targetPc?.connectionState || "");
    return closed || ice === "closed" || connection === "closed";
  };

  const isPeerConnectedState = (targetPc: any | null = pc) => {
    if (!targetPc || isPeerClosedState(targetPc)) return false;
    const ice = String(targetPc.iceConnectionState || "");
    const connection = String(targetPc.connectionState || "");
    return connection === "connected" || ice === "connected" || ice === "completed";
  };

  const emitConnectedOnce = (reason: string, targetPc: any | null = pc) => {
    if (connectedEmitted || !isPeerConnectedState(targetPc)) return;
    connectedEmitted = true;
    debug("connected:emit", { reason });
    emit("call:connected", { event: "connected", phase: "active", status: "active", connectedAt: new Date().toISOString() });
    options.onConnected();
  };


  debug("peer:create", {
    initialVideoEnabled: options.initialVideoEnabled,
    initialCameraFacing: options.initialCameraFacing,
  });

  const applyAudioMode = async () => {
    try {
      await setSabiCallAudioMode({
        allowsRecording: true,
        speakerEnabled,
        shouldPlayInBackground: true,
        duckOthers: false,
      });
    } catch {}
  };

  const emit = (eventName: string, payload: AnyRecord) => {
    const richPayload = makeCallPayload(options.route, payload);
    debug("emit:" + eventName, summarizeSabiCallPayloadForDebug(richPayload));
    // SABI-CALL-FINAL-200.1_RELIABLE_TARGET_TRANSPORT:
    // Plain socket.emit was not enough: accepted/offer/ice could stay in the
    // sender room and arrive 20+ seconds late. Every WebRTC/lifecycle signal is
    // now also wrapped for targetUserId user-channel delivery.
    emitSabiCallTransportEvent(options.socket, eventName, richPayload);
  };

  const publishLocal = () => {
    try {
      localStream?.getAudioTracks?.().forEach((track: any) => {
        track.enabled = true;
      });
      if (localVideoTrack && videoWanted) {
        localVideoTrack.enabled = true;
      }
    } catch {}

    options.onLocalStream?.(localStream);
  };

  const negotiate = async (event = "offer") => {
    if (!pc || closed || makingOffer) {
      debug("offer:skip", { event, hasPeer: Boolean(pc), closed, makingOffer });
      return;
    }

    const now = Date.now();
    const isInitialOffer = event === "offer";
    const isCameraToggleRenegotiate = event === "camera_off" || event === "camera_on";

    // SABI_CAMERA_OFF_FORCE_RENEGOTIATE:
    // Camera toggle must update the remote side immediately, not after the
    // normal anti-spam renegotiation delay.
    if (!isInitialOffer && !isCameraToggleRenegotiate && now - lastNegotiationAt < 5000) {
      return;
    }

    const state = String(pc.signalingState || "stable");
    if (state !== "stable") {
      debug("offer:skip_not_stable", { event, signalingState: state });
      return;
    }

    if (isInitialOffer) {
      const stream = await ensureLocalStream();
      if (closed || !pc) return;
      await attachLocalTracksToPeer(pc, stream);
      debug("media:offer_ready", {
        tracks: stream.getTracks?.()?.length ?? 0,
        audio: stream.getAudioTracks?.()?.length ?? 0,
        video: stream.getVideoTracks?.()?.length ?? 0,
      });
    }

    makingOffer = true;
    lastNegotiationAt = now;

    try {
      debug("offer:create:start", { event });
      const offer = (await withSabiCallTimeout(
        "create_offer",
        pc.createOffer({ offerToReceiveAudio: true, offerToReceiveVideo: true } as any),
        2500,
      )) as AnyRecord;
      if (closed) return;

      debug("offer:setLocal:start", { event, sdp: firstText((offer as AnyRecord).sdp).slice(0, 96) });
      const setLocalPromise = pc.setLocalDescription(offer as any);
      const setLocalFast = await Promise.race([
        setLocalPromise.then(() => true),
        new Promise<boolean>((resolve) => setTimeout(() => resolve(false), 900)),
      ]);
      if (closed) return;

      // Do not wait 10-20 seconds for Android video ICE gathering before
      // sending the offer. Trickle ICE will continue through onicecandidate.
      debug(setLocalFast ? "offer:setLocal:done" : "offer:setLocal:slow_send", { event, sdp: firstText((offer as AnyRecord).sdp).slice(0, 96) });
      debug("offer:send", { event, sdp: firstText((offer as AnyRecord).sdp).slice(0, 96) });
      emit("call:webrtc:offer", {
        event,
        signalKind: "offer",
        descriptionType: "offer",
        description: offer,
        sdp: firstText(offer.sdp),
      });

      if (!setLocalFast) {
        void setLocalPromise.catch((error: unknown) => {
          debug("offer:setLocal:late_error", { message: error instanceof Error ? error.message : String(error) });
        });
      }
    } catch (error) {
      debug("offer:error", { message: error instanceof Error ? error.message : String(error) });
      if (!closed) options.onError(error instanceof Error ? error.message : "connection_error");
    } finally {
      makingOffer = false;
    }
  };

  const ensureLocalStream = async () => {
    if (localStream) return localStream;
    if (localStreamPromise) return localStreamPromise;

    void applyAudioMode();
    debug("media:getUserMedia:start", { videoWanted, speakerEnabled, cameraFacing });

    localStreamPromise = mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
      video: videoWanted ? videoConstraints(cameraFacing) : false,
    } as any).catch(async (error: unknown) => {
      if (!videoWanted) throw error;
      debug("media:getUserMedia:video_retry_low", { message: error instanceof Error ? error.message : String(error) });
      return await mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
        video: { facingMode: cameraFacing, width: 320, height: 240, frameRate: 15 },
      } as any);
    }).then((stream: any) => {
      if (closed) {
        try {
          stream?.getTracks?.().forEach((track: any) => track.stop?.());
        } catch {}
        throw new Error("peer_closed");
      }

      localStream = stream;
      localVideoTrack = localStream.getVideoTracks?.()[0] ?? null;

      debug("media:getUserMedia:success", {
        tracks: localStream.getTracks?.()?.length ?? 0,
        audio: localStream.getAudioTracks?.()?.length ?? 0,
        video: localStream.getVideoTracks?.()?.length ?? 0,
      });

      publishLocal();
      return localStream;
    }).finally(() => {
      localStreamPromise = null;
    });

    return localStreamPromise;
  };

  const attachLocalTracksToPeer = async (connection: any, stream: any) => {
    if (!connection || !stream || closed) return;

    const senders = (() => {
      try {
        return (typeof connection.getSenders === "function" ? connection.getSenders() : []) as any[];
      } catch {
        return [] as any[];
      }
    })();

    const hasLiveSenderKind = (kind: string) =>
      senders.some((sender: any) => {
        const track = sender?.track;
        return track?.kind === kind && track.readyState !== "ended";
      });

    const audioTrack = stream.getAudioTracks?.()?.find((track: any) => track?.readyState !== "ended") ?? null;
    if (audioTrack && !localAudioSender && !hasLiveSenderKind("audio")) {
      try {
        audioTrack.enabled = true;
        localAudioSender = connection.addTrack(audioTrack, stream);
      } catch {}
    }

    const videoTrack = stream.getVideoTracks?.()?.find((track: any) => track?.readyState !== "ended") ?? null;
    if (videoTrack && !videoSender && !hasLiveSenderKind("video")) {
      try {
        videoTrack.enabled = videoWanted !== false;
        localVideoTrack = videoTrack;
        videoSender = connection.addTrack(videoTrack, stream);
        await stabilizeVideoSender(videoSender);
      } catch {}
    }
  };

  const createPeerConnection = async () => {
    const iceServers = (await withSabiCallTimeout(
      "resolve_ice_servers",
      resolveSabiCallIceServers(),
      350,
    ).catch(() => [{ urls: "stun:stun.l.google.com:19302" }])) as any[];
    const nextPc: any = new RTCPeerConnection({
      iceServers: iceServers.length ? iceServers : [{ urls: "stun:stun.l.google.com:19302" }],
      iceCandidatePoolSize: 0,
      bundlePolicy: "max-bundle",
      rtcpMuxPolicy: "require",
    } as any);

    pc = nextPc;
    debug("peer:created", { iceServers: summarizeSabiCallIceServersForDebug(iceServers) || "stun" });

    nextPc.onicecandidate = (event: any) => {
      if (closed || !event?.candidate) return;

      debug("ice:local", { candidate: String(event.candidate?.candidate || "").slice(0, 96) });
      emit("call:webrtc:ice", {
        event: "ice",
        signalKind: "ice",
        candidate: event.candidate,
      });
    };

    nextPc.ontrack = (event: any) => {
      const stream = event?.streams?.[0];
      if (!stream) {
        debug("track:remote_empty");
        return;
      }

      try {
        stream.getTracks?.().forEach((track: any) => {
          track.enabled = true;
        });
      } catch {}

      void applyAudioMode();

      const streamUrl =
        typeof stream.toURL === "function"
          ? String(stream.toURL())
          : String((stream as any).id || "");

      if (!streamUrl || streamUrl !== lastRemoteStreamUrl) {
        lastRemoteStreamUrl = streamUrl;
        debug("track:remote_stream", {
          url: streamUrl,
          tracks: stream.getTracks?.()?.length ?? 0,
          audio: stream.getAudioTracks?.()?.length ?? 0,
          video: stream.getVideoTracks?.()?.length ?? 0,
        });
        options.onRemoteStream?.(stream);
      }
    };

    const onState = () => {
      const ice = String(nextPc.iceConnectionState || "");
      const connection = String(nextPc.connectionState || "");
      debug("peer:state", { iceConnectionState: ice, connectionState: connection, signalingState: nextPc.signalingState });

      if (ice === "closed" || connection === "closed") {
        return;
      }

      if (ice === "connected" || ice === "completed" || connection === "connected") {
        void applyAudioMode();
        emitConnectedOnce("peer_state", nextPc);
      }

      if (ice === "failed" || connection === "failed") {
        options.onError("connection_failed");
      }
    };

    nextPc.oniceconnectionstatechange = onState;
    nextPc.onconnectionstatechange = onState;

    debug("media:peer_ready_without_camera_wait", { reason: "peer_created_before_media" });
    return nextPc;
  };

  const ensurePeer = async () => {
    if (closed) throw new Error("peer_closed");
    if (pc) return pc;
    if (peerPromise) return peerPromise;

    peerPromise = createPeerConnection().finally(() => {
      peerPromise = null;
    });
    return peerPromise;
  };

  const addIceCandidateSafe = async (connection: any, candidate: unknown) => {
    if (!connection || !candidate || closed) return;
    const key = sabiCallCandidateKey(candidate);
    if (key && appliedIceCandidateKeys.has(key)) return;
    await withSabiCallTimeout("add_ice_candidate", connection.addIceCandidate(new RTCIceCandidate(candidate as any)), 900);
    if (key) appliedIceCandidateKeys.add(key);
  };

  const flushPendingIceCandidates = async () => {
    const connection = pc;
    if (!connection || closed || !sabiHasRemoteDescription(connection)) return;

    const queue = pendingIceCandidates.splice(0, pendingIceCandidates.length);
    pendingIceCandidateKeys.clear();
    if (queue.length) debug("ice:flush", { count: queue.length });
    for (const candidate of queue) {
      try {
        await addIceCandidateSafe(connection, candidate);
      } catch {}
    }
  };

  const addOrReplaceVideoTrack = async (shouldNegotiate: boolean) => {
    if (upgradingVideo) return cameraFacing;

    upgradingVideo = true;

    try {
      videoWanted = true;

      const currentStream = await ensureLocalStream();
      if (pc) {
        await attachLocalTracksToPeer(pc, currentStream);
      }

      const existing = localVideoTrack ?? currentStream.getVideoTracks?.()[0];

      if (existing && existing.readyState !== "ended") {
        localVideoTrack = existing;
        localVideoTrack.enabled = true;
        publishLocal();
        return cameraFacing;
      }

      const videoStream = await mediaDevices.getUserMedia({
        audio: false,
        video: videoConstraints(cameraFacing),
      } as any);

      const nextTrack = videoStream.getVideoTracks?.()[0];
      if (!nextTrack) return cameraFacing;

      localVideoTrack = nextTrack;

      try {
        currentStream.addTrack?.(nextTrack);
      } catch {}

      if (pc) {
        if (videoSender && typeof videoSender.replaceTrack === "function") {
          await videoSender.replaceTrack(nextTrack);
          await stabilizeVideoSender(videoSender);
          await stabilizeVideoSender(videoSender);
        } else {
          videoSender = pc.addTrack(nextTrack, currentStream);
          await stabilizeVideoSender(videoSender);
        }
      }

      publishLocal();
      return cameraFacing;
    } finally {
      upgradingVideo = false;
    }
  };

  return {
    async prepareLocalMedia(reason = "prepare_local_media") {
      debug("media:prepare:start", { reason });
      const connection = await ensurePeer();
      const stream = await ensureLocalStream();
      if (!closed && connection) await attachLocalTracksToPeer(connection, stream);
      debug("media:prepare:ready", {
        reason,
        tracks: stream.getTracks?.()?.length ?? 0,
        audio: stream.getAudioTracks?.()?.length ?? 0,
        video: stream.getVideoTracks?.()?.length ?? 0,
      });
    },

    async startCaller() {
      if (!options.canStartCaller()) {
        debug("startCaller:blocked");
        return;
      }

      const offerLock = callLockKey(options.route, "offer");

      if (SABI_CALL_INITIAL_OFFER_LOCKS.has(offerLock)) {
        debug("startCaller:duplicate_lock");
        return;
      }

      SABI_CALL_INITIAL_OFFER_LOCKS.add(offerLock);

      try {
        debug("startCaller:start");
        await ensurePeer();
        if (closed || !options.canStartCaller()) {
          debug("startCaller:cancelled_after_peer", { closed });
          return;
        }
        await negotiate("offer");
      } catch (error) {
        SABI_CALL_INITIAL_OFFER_LOCKS.delete(offerLock);
        if (!closed) options.onError(error instanceof Error ? error.message : "connection_error");
      }
    },

    async handleOffer(payload: unknown) {
      debug("offer:recv", summarizeSabiCallPayloadForDebug(payload));
      const isRenegotiate = isRenegotiatePayload(payload);
      const answerLock = callLockKey(options.route, "answer");

      if (!isRenegotiate && SABI_CALL_INITIAL_ANSWER_LOCKS.has(answerLock)) {
        if (lastLocalAnswerDescription) {
          emit("call:webrtc:answer", {
            event: "answer",
            signalKind: "answer",
            descriptionType: "answer",
            description: lastLocalAnswerDescription,
            sdp: firstText(lastLocalAnswerDescription.sdp),
          });
        }
        return;
      }

      try {
        const offer = sabiCallDescription(payload, "offer");
        if (!offer || offer.type !== "offer") {
          debug("offer:ignored_no_valid_description", summarizeSabiCallPayloadForDebug(payload));
          return;
        }

        if (!isRenegotiate) {
          SABI_CALL_INITIAL_ANSWER_LOCKS.add(answerLock);
        }

        const connection = await ensurePeer();
        if (closed) return;

        const state = sabiSignalingState(connection);
        debug("offer:apply:start", { signalingState: state, isRenegotiate });
        if (state !== "stable" && state !== "have-remote-offer") {
          // A stale duplicate or glare offer should not freeze the call screen.
          // If we already produced an answer, re-send it; otherwise allow retry.
          if (lastLocalAnswerDescription) {
            emit("call:webrtc:answer", {
              event: "answer",
              description: lastLocalAnswerDescription,
              sdp: firstText(lastLocalAnswerDescription.sdp),
            });
            return;
          }

          if (!isRenegotiate) {
            SABI_CALL_INITIAL_ANSWER_LOCKS.delete(answerLock);
          }
          return;
        }

        await setRemoteDescriptionCompat(connection, offer, "set_remote_offer");
        if (closed) return;
        debug("offer:setRemote:done", { signalingState: sabiSignalingState(connection) });

        await flushPendingIceCandidates();
        if (closed) return;

        const mediaTimeoutMs = Math.max(1000, Number(options.localMediaBeforeAnswerTimeoutMs ?? 7000));
        const answerStream = await withSabiCallTimeout(
          "media_before_answer",
          ensureLocalStream(),
          mediaTimeoutMs,
        );
        if (closed) return;
        await attachLocalTracksToPeer(connection, answerStream);
        debug("media:before_answer:ready", {
          timeoutMs: mediaTimeoutMs,
          tracks: answerStream.getTracks?.()?.length ?? 0,
          audio: answerStream.getAudioTracks?.()?.length ?? 0,
          video: answerStream.getVideoTracks?.()?.length ?? 0,
        });

        debug("answer:create:start");
        const answer = (await withSabiCallTimeout(
          "create_answer",
          connection.createAnswer(),
          9000,
        )) as AnyRecord;
        if (closed) return;

        await withSabiCallTimeout("set_local_answer", connection.setLocalDescription(answer as any), 9000);
        if (closed) return;
        debug("answer:setLocal:done", { signalingState: sabiSignalingState(connection), sdp: firstText(answer.sdp).slice(0, 96) });

        lastLocalAnswerDescription = answer;

        emit("call:webrtc:answer", {
          event: "answer",
          signalKind: "answer",
          descriptionType: "answer",
          description: answer,
          sdp: firstText(answer.sdp),
        });
      } catch (error) {
        debug("offer:handle:error", { message: error instanceof Error ? error.message : String(error), isRenegotiate });
        if (!isRenegotiate) {
          SABI_CALL_INITIAL_ANSWER_LOCKS.delete(answerLock);
        }
        if (!closed) options.onError(error instanceof Error ? error.message : "connection_error");
      }
    },

    async handleAnswer(payload: unknown) {
      debug("answer:recv", summarizeSabiCallPayloadForDebug(payload));
      try {
        const connection = pc;
        if (!connection || closed) return;

        const answer = sabiCallDescription(payload, "answer");
        if (!answer || answer.type !== "answer") {
          debug("answer:ignored_no_valid_description", summarizeSabiCallPayloadForDebug(payload));
          return;
        }

        const answerSdp = firstText(answer.sdp);
        if (answerSdp && (answerSdp === lastRemoteAnswerSdp || answerSdp === applyingRemoteAnswerSdp)) {
          return;
        }

        const state = sabiSignalingState(connection);
        if (state === "stable" && sabiHasRemoteDescription(connection)) {
          return;
        }

        if (state !== "have-local-offer" && state !== "have-remote-pranswer") {
          debug("answer:ignored_bad_state", { signalingState: state, hasRemoteDescription: sabiHasRemoteDescription(connection) });
          return;
        }

        applyingRemoteAnswerSdp = answerSdp;
        await setRemoteDescriptionCompat(connection, answer, "set_remote_answer");

        lastRemoteAnswerSdp = answerSdp;
        debug("answer:setRemote:done", { signalingState: sabiSignalingState(connection), pendingIce: pendingIceCandidates.length });
        await flushPendingIceCandidates();
      } catch (error) {
        debug("answer:handle:error", { message: error instanceof Error ? error.message : String(error) });
        if (!closed) options.onError(error instanceof Error ? error.message : "connection_error");
      } finally {
        applyingRemoteAnswerSdp = "";
      }
    },

    async handleIce(payload: unknown) {
      debug("ice:recv", summarizeSabiCallPayloadForDebug(payload));
      try {
        const candidate = sabiCallCandidate(payload);
        if (!candidate) {
          debug("ice:ignored_no_candidate");
          return;
        }

        const candidateKey = sabiCallCandidateKey(candidate);
        if (candidateKey && (pendingIceCandidateKeys.has(candidateKey) || appliedIceCandidateKeys.has(candidateKey))) {
          debug("ice:ignored_duplicate", { pendingIce: pendingIceCandidates.length });
          return;
        }

        const connection = pc;
        if (!connection || closed || !sabiHasRemoteDescription(connection)) {
          pendingIceCandidates.push(candidate);
          if (candidateKey) pendingIceCandidateKeys.add(candidateKey);
          debug("ice:queued", { pendingIce: pendingIceCandidates.length, hasPeer: Boolean(connection), closed });
          return;
        }

        await addIceCandidateSafe(connection, candidate);
        debug("ice:applied", { pendingIce: pendingIceCandidates.length });
      } catch (error) {
        debug("ice:error", { message: error instanceof Error ? error.message : String(error) });
      }
    },

    setMicEnabled(enabled: boolean) {
      try {
        localStream?.getAudioTracks?.().forEach((track: any) => {
          track.enabled = enabled;
        });
      } catch {}
    },

    async setCameraEnabled(enabled: boolean) {
      videoWanted = enabled;

      try {
        if (enabled) {
          const hasVideoTrack = Boolean(
            localStream?.getVideoTracks?.()?.some(
              (track: any) => track.readyState !== "ended" && track.enabled !== false,
            ),
          );

          if (hasVideoTrack) {
            localStream?.getVideoTracks?.().forEach((track: any) => {
              track.enabled = true;
            });
            publishLocal();
            return;
          }

          await addOrReplaceVideoTrack(false);
          return;
        }

        // SABI_CAMERA_OFF_HARD_STOP:
        // track.enabled=false is not enough on Android. It can keep the real
        // hardware camera active. We remove/stop video tracks and detach sender.
        try {
          if (videoSender && typeof videoSender.replaceTrack === "function") {
            await videoSender.replaceTrack(null);
          }
        } catch {}

        try {
          const tracks = (localStream?.getVideoTracks?.() ?? []) as any[];

          tracks.forEach((track: any) => {
            try {
              track.enabled = false;
            } catch {}

            try {
              localStream?.removeTrack?.(track);
            } catch {}

            try {
              track.stop?.();
            } catch {}
          });

          if (localVideoTrack && !tracks.includes(localVideoTrack)) {
            try {
              localVideoTrack.enabled = false;
            } catch {}

            try {
              localVideoTrack.stop?.();
            } catch {}
          }

          localVideoTrack = null;
        } catch {}

        options.onLocalStream?.(null);

        setTimeout(() => {
          if (!closed) {
            publishLocal();
          }
        }, 0);

        // Camera state is sent through media-state events by the screen.
        // Do not renegotiate here: the first video offer already owns video.
      } catch {}
    },

    async switchCamera(): Promise<StandardCameraFacing> {
      const now = Date.now();

      if (now - lastCameraSwitchAt < 1400) {
        return cameraFacing;
      }

      lastCameraSwitchAt = now;
      cameraFacing = cameraFacing === "user" ? "environment" : "user";
      videoWanted = true;

      try {
        if (localVideoTrack && typeof localVideoTrack._switchCamera === "function") {
          localVideoTrack._switchCamera();
          publishLocal();
          return cameraFacing;
        }

        const oldTrack = localVideoTrack;

        const videoStream = await mediaDevices.getUserMedia({
          audio: false,
          video: videoConstraints(cameraFacing),
        } as any);

        const nextTrack = videoStream.getVideoTracks?.()[0];
        if (!nextTrack) return cameraFacing;

        localVideoTrack = nextTrack;

        if (!localStream) {
          localStream = videoStream;
        } else {
          try {
            if (oldTrack) {
              localStream.removeTrack?.(oldTrack);
            }
            localStream.addTrack?.(nextTrack);
          } catch {}
        }

        if (videoSender && typeof videoSender.replaceTrack === "function") {
          await videoSender.replaceTrack(nextTrack);
        } else if (pc) {
          videoSender = pc.addTrack(nextTrack, localStream);
          await stabilizeVideoSender(videoSender);
        }

        try {
          oldTrack?.stop?.();
        } catch {}

        publishLocal();
      } catch {}

      return cameraFacing;
    },

    async setSpeakerEnabled(enabled: boolean) {
      speakerEnabled = enabled;
      await applyAudioMode();
    },

    close(reason = "manual_close") {
      debug("peer:close", { reason });
      closed = true;
      connectedEmitted = true;

      try {
        pc?.close?.();
      } catch {}

      pc = null;
      localAudioSender = null;
      videoSender = null;

      clearCallLocks(options.route);

      try {
        localStream?.getTracks?.().forEach((track: any) => track.stop?.());
      } catch {}

      localVideoTrack = null;
      localStream = null;
      lastRemoteStreamUrl = "";
      pendingIceCandidates.splice(0, pendingIceCandidates.length);
      pendingIceCandidateKeys.clear();
      appliedIceCandidateKeys.clear();
      lastLocalAnswerDescription = null;
      lastRemoteAnswerSdp = "";
      makingOffer = false;
      upgradingVideo = false;
      videoWanted = Boolean(options.initialVideoEnabled ?? options.route.kind === "video");

      options.onLocalStream?.(null);
      options.onRemoteStream?.(null);
      void resetSabiCallAudioMode();
    },
  };
}




