import { resolveSabiCallIceServers, summarizeSabiCallIceServersForDebug } from "./callIceServers";
import { Audio } from "expo-av";
import {
  RTCPeerConnection,
  RTCIceCandidate,
  RTCSessionDescription,
  mediaDevices,
} from "react-native-webrtc";

import { profileStore } from "../profile/profile-store";

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
  if (typeof value === "string") return value.length > 220 ? value.slice(0, 220) + "вЂ¦" : value;
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

export function logSabiCallDebug(
  route: Pick<StandardCallRoute, "callId" | "kind" | "incoming" | "userId" | "peerId"> | null | undefined,
  stage: string,
  details: Record<string, unknown> = {},
) {
  try {
    const safeDetails = sanitizeSabiCallDebugValue(details) as Record<string, unknown>;
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

  const chatId = firstText(p.chatId, p.id, p.roomId) || "direct";
  const roomId = firstText(p.roomId) || chatId;
  const userId = firstText(p.userId, p.currentUserId, p.selfId, p.toUserId, p.receiverUserId);
  const peerId = firstText(
    p.peerId,
    p.peerUserId,
    p.partnerId,
    p.targetUserId,
    p.fromUserId,
    p.callerId,
    p.senderUserId,
  );

  const callId = firstText(p.callId) || "call:" + chatId + ":" + userId + ":" + peerId;
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
  const body = record(payload);
  const description = record(body.description);
  const candidate = record(body.candidate);

  return [
    eventName,
    firstText(body.callId, body.id),
    firstText(body.fromUserId, body.senderUserId, body.userId, body.callerId),
    firstText(description.type, body.type, body.kind),
    firstText(description.sdp, body.sdp).slice(0, 160),
    firstText(candidate.candidate).slice(0, 160),
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

function sabiCallDescription(payload: unknown, fallbackType: "offer" | "answer") {
  return makeSabiRtcDescriptionInit(payload, fallbackType);
}

function sabiCallCandidate(payload: unknown) {
  const body = record(payload);
  return body.candidate || body.iceCandidate || record(body.payload).candidate || null;
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

async function withSabiCallTimeout<T>(label: string, promise: Promise<T>, timeoutMs = 4000): Promise<T> {
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

type SabiRtcDescriptionType = "offer" | "answer";

type SabiRtcDescriptionInit = {
  type: SabiRtcDescriptionType;
  sdp: string;
};

function normalizeSabiCallSdp(value: unknown): string {
  const raw = firstText(value);
  if (!raw) return "";

  // Some socket/backend bridges can double-escape SDP newlines. Native WebRTC
  // then receives an invalid/null session description on Android. Always pass
  // a clean SDP string to react-native-webrtc and keep the final CRLF that
  // Android's SessionDescription parser expects on some devices.
  const normalized = raw
    .replace(/\\r\\n/g, "\r\n")
    .replace(/\\n/g, "\n")
    .replace(/\r?\n/g, "\r\n")
    .replace(/^\uFEFF/, "");

  return normalized.endsWith("\r\n") ? normalized : normalized + "\r\n";
}

function makeSabiRtcDescriptionInit(
  value: unknown,
  fallbackType: SabiRtcDescriptionType,
): SabiRtcDescriptionInit | null {
  const body = record(value);
  const nested = record(body.description);
  const rawType = firstText(nested.type, body.descriptionType, body.signalKind, body.type).toLowerCase();
  const type: SabiRtcDescriptionType = rawType === "answer" || rawType === "offer" ? rawType : fallbackType;
  const sdp = normalizeSabiCallSdp(firstText(nested.sdp, body.sdp, (value as AnyRecord)?.sdp));

  if (!sdp || !sdp.startsWith("v=")) return null;

  return { type, sdp };
}

async function setSabiRemoteDescription(
  connection: any,
  description: SabiRtcDescriptionInit,
  label: string,
) {
  const plainDescription = { type: description.type, sdp: description.sdp };

  // react-native-webrtc on Android can throw "SessionDescription is NULL"
  // when it receives an RTCSessionDescription wrapper produced from a payload
  // object that passed through Socket.IO. Passing a clean plain init object
  // first is the most stable path; wrapper fallback keeps old builds compatible.
  try {
    await withSabiCallTimeout(label, connection.setRemoteDescription(plainDescription as any), 4000);
    return;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (!message.toLowerCase().includes("sessiondescription is null")) throw error;
  }

  await withSabiCallTimeout(
    label + "_wrapped",
    connection.setRemoteDescription(new RTCSessionDescription(plainDescription as any)), 4000,
  );
}

async function setSabiLocalDescription(
  connection: any,
  description: SabiRtcDescriptionInit,
  label: string,
) {
  const plainDescription = { type: description.type, sdp: description.sdp };

  try {
    await withSabiCallTimeout(label, connection.setLocalDescription(plainDescription as any), 4000);
    return;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (!message.toLowerCase().includes("sessiondescription is null")) throw error;
  }

  await withSabiCallTimeout(
    label + "_wrapped",
    connection.setLocalDescription(new RTCSessionDescription(plainDescription as any)), 4000,
  );
}

async function setSabiNativeLocalDescription(
  connection: any,
  nativeDescription: unknown,
  fallbackType: SabiRtcDescriptionType,
  label: string,
): Promise<SabiRtcDescriptionInit> {
  const normalizedBefore = makeSabiRtcDescriptionInit(nativeDescription, fallbackType);
  if (!normalizedBefore || normalizedBefore.type !== fallbackType) {
    throw new Error("invalid_local_" + fallbackType);
  }

  // SABI_CALLS_100_3_ANDROID_NATIVE_LOCAL_DESCRIPTION:
  // react-native-webrtc 124 on Android can throw "SessionDescription is NULL"
  // when setLocalDescription receives a normalized plain object. The object
  // returned by createOffer/createAnswer is the native-backed description and
  // must be tried first. After WebRTC accepts it, read pc.localDescription for
  // the exact SDP that should be sent to the peer.
  try {
    await withSabiCallTimeout(label + "_native", connection.setLocalDescription(nativeDescription as any), 4000);
  } catch (nativeError) {
    const nativeMessage = nativeError instanceof Error ? nativeError.message : String(nativeError);
    if (!nativeMessage.toLowerCase().includes("sessiondescription is null")) throw nativeError;

    try {
      await setSabiLocalDescription(connection, normalizedBefore, label + "_normalized");
    } catch (normalizedError) {
      const normalizedMessage = normalizedError instanceof Error ? normalizedError.message : String(normalizedError);
      if (!normalizedMessage.toLowerCase().includes("sessiondescription is null")) throw normalizedError;

      // Last compatibility path for react-native-webrtc builds that support the
      // browser-style no-arg setLocalDescription after createOffer/createAnswer.
      await withSabiCallTimeout(label + "_implicit", connection.setLocalDescription(), 4000);
    }
  }

  const normalizedAfter = makeSabiRtcDescriptionInit(
    connection.localDescription || connection.currentLocalDescription || connection.pendingLocalDescription || nativeDescription,
    fallbackType,
  );

  if (!normalizedAfter || normalizedAfter.type !== fallbackType) {
    return normalizedBefore;
  }

  return normalizedAfter;
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
      maxBitrate: 1600000,
      maxFramerate: 30,
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
  try {
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
    });
  } catch {}
}

function videoConstraints(facing: StandardCameraFacing) {
  return {
    facingMode: facing,
    width: 960,
    height: 540,
    frameRate: 30,
  };
}

export function createStandardCallPeer(options: {
  route: StandardCallRoute;
  socket: SocketLike;
  initialVideoEnabled?: boolean;
  initialCameraFacing?: StandardCameraFacing;
  canStartCaller: () => boolean;
  onLocalStream?: (stream: any | null) => void;
  onRemoteStream?: (stream: any | null) => void;
  onConnected: () => void;
  onError: (message: string) => void;
}) {
  let pc: any | null = null;
  let localStream: any | null = null;
  let localVideoTrack: any | null = null;
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
  let lastRemoteTrackSignature = "";
  let connectedEmitted = false;
  const SABI_DIRECT_ICE_FAILURE_GRACE_MS = 8000;
  let iceFailureTimer: ReturnType<typeof setTimeout> | null = null;
  const pendingIceCandidates: unknown[] = [];
  let lastLocalAnswerDescription: AnyRecord | null = null;
  let lastRemoteAnswerSdp = "";

  const debug = (stage: string, details: Record<string, unknown> = {}) => {
    logSabiCallDebug(options.route, stage, {
      signalingState: pc?.signalingState,
      iceConnectionState: pc?.iceConnectionState,
      connectionState: pc?.connectionState,
      pendingIce: pendingIceCandidates.length,
      ...details,
    });
  };

  debug("peer:create", {
    initialVideoEnabled: options.initialVideoEnabled,
    initialCameraFacing: options.initialCameraFacing,
  });

  const applyAudioMode = async () => {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldDuckAndroid: false,
        // Audio calls default to earpiece to reduce echo. Video calls default to speaker.
        // Manual speaker toggle still works through setSpeakerEnabled().
        playThroughEarpieceAndroid: !speakerEnabled,
      });
    } catch {}
  };

  const emit = (eventName: string, payload: AnyRecord) => {
    const richPayload = makeCallPayload(options.route, payload);
    debug("emit:" + eventName, summarizeSabiCallPayloadForDebug(richPayload));
    options.socket.emit(eventName, richPayload);

    // SABI_CALLS_FINAL_B_SIGNAL_ALIASES:
    // Some realtime gateways relay generic call signal events while others relay
    // the explicit call:webrtc:* events. Emit both shapes with the same callId so
    // the receiver can de-duplicate by makeSignalKey().
    if (eventName === "call:webrtc:offer" || eventName === "call:webrtc:answer" || eventName === "call:webrtc:ice") {
      const signalKind = eventName.endsWith(":offer")
        ? "offer"
        : eventName.endsWith(":answer")
          ? "answer"
          : "ice";
      const signalPayload = {
        ...richPayload,
        signalKind,
        event: firstText(richPayload.event) || signalKind,
        action: firstText(richPayload.action) || signalKind,
      };

      options.socket.emit("call:signal", signalPayload);
      options.socket.emit("call_signal", signalPayload);
      options.socket.emit("call:webrtc:signal", signalPayload);
      options.socket.emit("sabi-call:signal", signalPayload);
    }

    if (eventName === "call:connected") {
      const connectedPayload = {
        ...richPayload,
        event: "connected",
        action: "connected",
        phase: "active",
        status: "active",
        connectedAt: new Date().toISOString(),
      };

      // SABI_CALLS_FINAL_D_CONNECTED_ALIASES:
      // Different gateway versions relay either call:connected, call:active or
      // sabi-call:* events. Emit all safe lifecycle aliases so the other phone
      // can stop ringback and start the connected timer exactly once.
      options.socket.emit("call:active", connectedPayload);
      options.socket.emit("sabi-call:connected", connectedPayload);
      options.socket.emit("sabi-call:active", connectedPayload);
    }
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

  const negotiate = async (event = "renegotiate_offer") => {
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

    makingOffer = true;
    lastNegotiationAt = now;

    try {
      debug("offer:create:start", { event });
      const rawOffer = await pc.createOffer();
      const previewOffer = makeSabiRtcDescriptionInit(rawOffer, "offer");
      if (!previewOffer) throw new Error("invalid_local_offer");
      if (closed) return;

      debug("offer:setLocal:start", { event, sdp: previewOffer.sdp.slice(0, 96) });
      const offer = await setSabiNativeLocalDescription(pc, rawOffer, "offer", "set_local_offer");
      if (closed) return;

      debug("offer:setLocal:done", { event, sdp: offer.sdp.slice(0, 96), signalingState: sabiSignalingState(pc) });
      debug("offer:send", { event, sdp: offer.sdp.slice(0, 96) });
      emit("call:webrtc:offer", {
        event,
        signalKind: "offer",
        descriptionType: "offer",
        description: offer,
        sdp: offer.sdp,
      });
    } catch (error) {
      debug("offer:error", { message: error instanceof Error ? error.message : String(error) });
      if (!closed) options.onError(error instanceof Error ? error.message : "connection_error");
    } finally {
      makingOffer = false;
    }
  };

  const ensureLocalStream = async () => {
    if (localStream) return localStream;

    // SABI_CALLS_100_2_FAST_MEDIA_START:
    // On real Android devices Audio.setAudioModeAsync can block for several
    // seconds while the other side already accepted the call. Do not let audio
    // routing delay getUserMedia/offer creation; apply the audio route in the
    // background before and after media capture.
    void applyAudioMode();
    debug("media:getUserMedia:start", { videoWanted, speakerEnabled, cameraFacing });

    localStream = await mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
        // Android WebRTC accepts these legacy constraints on many devices.
        // Unsupported keys are ignored, but supported devices get stronger
        // acoustic echo/noise processing for 1:1 calls.
        googEchoCancellation: true,
        googAutoGainControl: true,
        googNoiseSuppression: true,
        googHighpassFilter: true,
        googTypingNoiseDetection: true,
      },
      video: videoWanted ? videoConstraints(cameraFacing) : false,
    } as any);

    if (closed) {
      try {
        localStream?.getTracks?.().forEach((track: any) => track.stop?.());
      } catch {}
      throw new Error("peer_closed");
    }

    localVideoTrack = localStream.getVideoTracks?.()[0] ?? null;

    debug("media:getUserMedia:success", {
      tracks: localStream.getTracks?.()?.length ?? 0,
      audio: localStream.getAudioTracks?.()?.length ?? 0,
      video: localStream.getVideoTracks?.()?.length ?? 0,
    });

    publishLocal();
    void applyAudioMode();
    return localStream;
  };

  const ensurePeer = async () => {
    if (closed) throw new Error("peer_closed");
    if (pc) return pc;

    const iceServers = await resolveSabiCallIceServers();

    const nextPc: any = new RTCPeerConnection({
      iceServers,
    } as any);

    pc = nextPc;
    debug("peer:created", {
  iceServers: summarizeSabiCallIceServersForDebug(iceServers),
  hasTurn: iceServers.some((server: any) => {
    const urls = Array.isArray(server?.urls) ? server.urls : [server?.urls];
    return urls.some((url: unknown) => String(url || "").startsWith("turn:") || String(url || "").startsWith("turns:"));
  }),
});

    nextPc.onicecandidate = (event: any) => {
      if (closed || !event?.candidate) return;

      debug("ice:local", { candidate: String(event.candidate?.candidate || "").slice(0, 96) });
      emit("call:webrtc:ice", {
        event: "ice",
        candidate: event.candidate,
      });
    };

    nextPc.ontrack = (event: any) => {
      const stream = event?.streams?.[0];
      const track = event?.track;
      if (!stream) {
        debug("track:remote_empty", { trackKind: track?.kind, trackId: track?.id });
        return;
      }

      try {
        if (track) track.enabled = true;
        stream.getTracks?.().forEach((nextTrack: any) => {
          nextTrack.enabled = true;
        });
      } catch {}

      // VIDEO-100.4:
      // rn-webrtc often fires ontrack twice for video calls: first audio, then
      // video, but both events can point to the same MediaStream URL. The old
      // guard published the stream only when the URL changed, so the UI kept the
      // audio-only snapshot and the call looked connected without video. For
      // video calls we republish the same stream when the track set changes and
      // also schedule short refreshes because Android may attach the video track
      // a few frames after the ontrack callback.
      const publishRemoteStream = (reason: string) => {
        try {
          stream.getTracks?.().forEach((nextTrack: any) => {
            nextTrack.enabled = true;
          });
        } catch {}

        const audioCount = stream.getAudioTracks?.()?.length ?? 0;
        const videoTracks = stream.getVideoTracks?.() ?? [];
        const videoCount = videoTracks.length;
        const streamTracks = stream.getTracks?.() ?? [];
        const streamUrl =
          typeof stream.toURL === "function"
            ? String(stream.toURL())
            : String((stream as any).id || "");
        const currentSignature = [
          streamUrl,
          streamTracks.length,
          audioCount,
          videoCount,
          track?.kind || "",
          track?.id || "",
          track?.readyState || "",
          videoTracks.map((videoTrack: any) => [
            videoTrack?.id || "",
            videoTrack?.readyState || "",
            videoTrack?.enabled === false ? "disabled" : "enabled",
            videoTrack?.muted === true ? "muted" : "live",
          ].join(":" )).join(","),
        ].join("|");

        const isVideoCall = options.route.kind === "video";
        const shouldPublish =
          !streamUrl ||
          streamUrl !== lastRemoteStreamUrl ||
          (isVideoCall && (
            currentSignature !== lastRemoteTrackSignature ||
            track?.kind === "video" ||
            videoCount > 0
          ));

        if (!shouldPublish) return;

        lastRemoteStreamUrl = streamUrl;
        lastRemoteTrackSignature = currentSignature;
        debug("track:remote_stream", {
          reason,
          url: streamUrl,
          trackKind: track?.kind,
          trackId: track?.id,
          tracks: streamTracks.length,
          audio: audioCount,
          video: videoCount,
          videoEnabled: videoTracks.some((videoTrack: any) => videoTrack?.enabled !== false),
          videoMuted: videoTracks.some((videoTrack: any) => videoTrack?.muted === true),
          videoReadyState: firstText(...videoTracks.map((videoTrack: any) => videoTrack?.readyState)),
        });
        options.onRemoteStream?.(stream);
      };

      void applyAudioMode();
      publishRemoteStream("ontrack");

      if (options.route.kind === "video") {
        setTimeout(() => {
          if (!closed) publishRemoteStream("video_delayed_120ms");
        }, 120);
        setTimeout(() => {
          if (!closed) publishRemoteStream("video_delayed_450ms");
        }, 450);
        setTimeout(() => {
          if (!closed) publishRemoteStream("video_delayed_900ms");
        }, 900);
      }

      if (!connectedEmitted) {
        connectedEmitted = true;
        // SABI_DIRECT_CONNECTED_ON_REMOTE_STREAM:
        // Remote media means the 1:1 call is already connected.
        // Notify backend immediately so old ringing/no-answer watchdogs
        // do not close a live connected call after 10-25 seconds.
        emit("call:connected", { event: "connected", phase: "active", status: "active", connectedAt: new Date().toISOString() });
        options.onConnected();
      }
    };

    const onState = () => {
      const ice = String(nextPc.iceConnectionState || "");
      const connection = String(nextPc.connectionState || "");
      debug("peer:state", { iceConnectionState: ice, connectionState: connection, signalingState: nextPc.signalingState });

      if (ice === "connected" || ice === "completed" || connection === "connected") {
        if (iceFailureTimer) {
          clearTimeout(iceFailureTimer);
          iceFailureTimer = null;
        }

        void applyAudioMode();
        if (!connectedEmitted) {
          connectedEmitted = true;
          emit("call:connected", { event: "connected", phase: "active", status: "active", connectedAt: new Date().toISOString() });
          options.onConnected();
        }
        return;
      }

      const isIceStillWorking =
        ice === "new" ||
        ice === "checking" ||
        connection === "new" ||
        connection === "connecting";

      if (isIceStillWorking) {
        return;
      }

      const isTransientFailure =
        ice === "disconnected" ||
        ice === "failed" ||
        connection === "disconnected" ||
        connection === "failed";

      if (isTransientFailure && !iceFailureTimer && !connectedEmitted) {
        // SABI_DIRECT_ICE_FAILURE_GRACE:
        // Android/WebRTC can briefly report failed/disconnected while ICE is still recovering.
        // Do not end a 1:1 call immediately; give the peer time before surfacing connection_failed.
        iceFailureTimer = setTimeout(() => {
          iceFailureTimer = null;
          if (closed || connectedEmitted) return;

          const latestIce = String(nextPc.iceConnectionState || "");
          const latestConnection = String(nextPc.connectionState || "");
          if (latestIce === "connected" || latestIce === "completed" || latestConnection === "connected") return;

          debug("peer:failure_grace_expired", {
            iceConnectionState: latestIce,
            connectionState: latestConnection,
          });
          options.onError("connection_failed");
        }, SABI_DIRECT_ICE_FAILURE_GRACE_MS);
      }
    };

    nextPc.oniceconnectionstatechange = onState;
    nextPc.onconnectionstatechange = onState;

    const stream = await ensureLocalStream();

    if (closed || pc !== nextPc) throw new Error("peer_closed");

    for (const track of stream.getTracks()) {
      if (closed || pc !== nextPc) throw new Error("peer_closed");
      const sender = nextPc.addTrack(track, stream);
      if (track.kind === "video") {
        videoSender = sender;
        localVideoTrack = track;
        void stabilizeVideoSender(videoSender);
      }
    }

    return nextPc;
  };

  const addIceCandidateSafe = async (connection: any, candidate: unknown) => {
    if (!connection || !candidate || closed) return;
    await withSabiCallTimeout("add_ice_candidate", connection.addIceCandidate(new RTCIceCandidate(candidate as any)), 5000);
  };

  const flushPendingIceCandidates = async () => {
    const connection = pc;
    if (!connection || closed || !sabiHasRemoteDescription(connection)) return;

    const queue = pendingIceCandidates.splice(0, pendingIceCandidates.length);
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
          if (shouldNegotiate) {
            await negotiate("renegotiate_offer");
          }
        }
      }

      publishLocal();
      return cameraFacing;
    } finally {
      upgradingVideo = false;
    }
  };

  return {
    async prepareCallee() {
      try {
        debug("prepareCallee:start");
        await ensurePeer();
      } catch (error) {
        if (!closed) options.onError(error instanceof Error ? error.message : "connection_error");
      }
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
          debug("offer:ignored_no_description", summarizeSabiCallPayloadForDebug(payload));
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
              signalKind: "answer",
              descriptionType: "answer",
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

        await setSabiRemoteDescription(connection, offer, "set_remote_offer");
        if (closed) return;
        debug("offer:setRemote:done", { signalingState: sabiSignalingState(connection) });

        await flushPendingIceCandidates();
        if (closed) return;

        debug("answer:create:start");
        const rawAnswer = await withSabiCallTimeout(
          "create_answer",
          connection.createAnswer(),
          9000,
        );
        const previewAnswer = makeSabiRtcDescriptionInit(rawAnswer, "answer");
        if (!previewAnswer) throw new Error("invalid_local_answer");
        if (closed) return;

        const answer = await setSabiNativeLocalDescription(connection, rawAnswer, "answer", "set_local_answer");
        if (closed) return;
        debug("answer:setLocal:done", { signalingState: sabiSignalingState(connection), sdp: answer.sdp.slice(0, 96) });

        lastLocalAnswerDescription = answer;

        emit("call:webrtc:answer", {
          event: "answer",
          signalKind: "answer",
          descriptionType: "answer",
          description: answer,
          sdp: answer.sdp,
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
          debug("answer:ignored_no_description", summarizeSabiCallPayloadForDebug(payload));
          return;
        }

        const answerSdp = firstText(answer.sdp);
        if (answerSdp && answerSdp === lastRemoteAnswerSdp && sabiHasRemoteDescription(connection)) {
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

        await setSabiRemoteDescription(connection, answer, "set_remote_answer");

        lastRemoteAnswerSdp = answerSdp;
        debug("answer:setRemote:done", { signalingState: sabiSignalingState(connection), pendingIce: pendingIceCandidates.length });
        await flushPendingIceCandidates();
      } catch (error) {
        debug("answer:handle:error", { message: error instanceof Error ? error.message : String(error) });
        if (!closed) options.onError(error instanceof Error ? error.message : "connection_error");
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

        const connection = pc;
        if (!connection || closed || !sabiHasRemoteDescription(connection)) {
          pendingIceCandidates.push(candidate);
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
            if (pc) {
              void negotiate("camera_on");
            }
            return;
          }

          await addOrReplaceVideoTrack(Boolean(pc));
          if (pc) {
            void negotiate("camera_on");
          }
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

        if (pc) {
          void negotiate("camera_off");
        }
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
          await negotiate("renegotiate_offer");
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

    close() {
      debug("peer:close");
      closed = true;

      if (iceFailureTimer) {
        clearTimeout(iceFailureTimer);
        iceFailureTimer = null;
      }

      try {
        pc?.close?.();
      } catch {}

      pc = null;
      videoSender = null;

      clearCallLocks(options.route);

      try {
        localStream?.getTracks?.().forEach((track: any) => track.stop?.());
      } catch {}

      localVideoTrack = null;
      localStream = null;
      lastRemoteStreamUrl = "";
      lastRemoteTrackSignature = "";
      connectedEmitted = false;
      pendingIceCandidates.splice(0, pendingIceCandidates.length);
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






