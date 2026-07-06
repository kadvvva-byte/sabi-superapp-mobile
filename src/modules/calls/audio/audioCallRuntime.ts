import { NativeModules, Platform } from "react-native";
import { setSabiCallAudioMode } from "../sabiCallAudio";
import { emitSabiCallTransportEvent } from "../callSignalTransport";
import { resolveSabiCallIceServers, summarizeSabiCallIceServersForDebug } from "../callIceServers";
import {
  RTCPeerConnection,
  RTCIceCandidate,
  RTCSessionDescription,
  mediaDevices,
} from "react-native-webrtc";

export type StandardCallKind = "audio" | "video";
export type StandardCallPhase = "calling" | "ringing" | "connecting" | "active" | "ended";

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

type AnyRecord = Record<string, any>;

type SpeakerRouteNativeModule = {
  setSpeakerEnabled?: (enabled: boolean) => unknown;
  setSpeakerphoneOn?: (enabled: boolean) => unknown;
  setForceSpeakerphoneOn?: (enabled: boolean) => unknown;
  setAudioRoute?: (route: "speaker" | "earpiece") => unknown;
  chooseAudioRoute?: (route: "speaker" | "earpiece") => unknown;
};

function getSpeakerRouteNativeModules(): SpeakerRouteNativeModule[] {
  if (Platform.OS !== "android") return [];
  const modules = NativeModules as Record<string, SpeakerRouteNativeModule | undefined>;
  return [
    modules.SabiCallNativeModule,
    modules.SabiAudioRouteModule,
    modules.RNInCallManager,
    modules.InCallManager,
    modules.AudioManager,
    modules.WebRTCAudioManager,
  ].filter(Boolean) as SpeakerRouteNativeModule[];
}

async function applyNativeSpeakerRoute(enabled: boolean): Promise<number> {
  let calls = 0;
  const route = enabled ? "speaker" : "earpiece";
  for (const nativeModule of getSpeakerRouteNativeModules()) {
    const entries: Array<[keyof SpeakerRouteNativeModule, unknown[]]> = [
      ["setSpeakerEnabled", [enabled]],
      ["setSpeakerphoneOn", [enabled]],
      ["setForceSpeakerphoneOn", [enabled]],
      ["setAudioRoute", [route]],
      ["chooseAudioRoute", [route]],
    ];
    for (const [methodName, args] of entries) {
      const method = nativeModule?.[methodName];
      if (typeof method !== "function") continue;
      try {
        const invoke = (method as unknown as (...invokeArgs: unknown[]) => unknown).bind(nativeModule);
        await Promise.resolve(invoke(...args));
        calls += 1;
      } catch {}
    }
  }
  return calls;
}

function asRecord(value: unknown): AnyRecord {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as AnyRecord) : {};
}

function payloadRecords(payload: unknown): AnyRecord[] {
  const body = asRecord(payload);
  const nested = asRecord(body.payload);
  const data = asRecord(body.data);
  const message = asRecord(body.message);
  return [body, nested, data, message].filter((record) => Object.keys(record).length > 0);
}

function firstPayloadText(payload: unknown, ...keys: string[]): string {
  for (const record of payloadRecords(payload)) {
    for (const key of keys) {
      const value = record[key];
      if (typeof value === "string" && value.trim()) return value.trim();
      if (typeof value === "number" && Number.isFinite(value)) return String(value);
      if (typeof value === "boolean") return value ? "true" : "false";
    }
  }
  return "";
}

export function firstText(...values: unknown[]): string {
  for (const value of values) {
    if (Array.isArray(value)) {
      const nested = firstText(...value);
      if (nested) return nested;
      continue;
    }
    if (typeof value === "string" && value.trim()) return value.trim();
    if (typeof value === "number" && Number.isFinite(value)) return String(value);
    if (typeof value === "boolean") return value ? "true" : "false";
  }
  return "";
}

function boolText(value: unknown): boolean {
  const text = firstText(value).toLowerCase();
  return text === "1" || text === "true" || text === "yes" || text === "incoming";
}

function normalizeBaseCallId(callId: string): string {
  const parts = String(callId || "").split(":");
  if (parts.length >= 6 && parts[0] === "call") return parts.slice(0, 6).join(":");
  return String(callId || "");
}

function readRouteUsersFromCallId(callId: string): { fromUserId: string; toUserId: string } {
  const parts = String(callId || "").split(":");
  if (parts.length >= 6 && parts[0] === "call") {
    return { fromUserId: parts[2] || "", toUserId: parts[3] || "" };
  }
  return { fromUserId: "", toUserId: "" };
}

function buildFullCallId(kind: StandardCallKind, chatId: string, userId: string, peerId: string, provided?: string) {
  const raw = firstText(provided);
  const parts = raw.split(":");
  if (raw.startsWith("call:") && parts.length >= 6 && parts[2] && parts[3]) return raw;
  const safeChatId = firstText(chatId, "direct").replace(/:/g, "_");
  return ["call", safeChatId, userId || "self", peerId || "peer", Date.now(), Math.random().toString(36).slice(2, 10)].join(":");
}

export function parseStandardCallRoute(params: Record<string, unknown>, kind: StandardCallKind): StandardCallRoute {
  const incoming = boolText(params.incoming) || firstText(params.direction, params.callDirection, params.callMode).toLowerCase() === "incoming";

  // Incoming call payloads usually arrive as fromUserId=caller and
  // toUserId=current user. The old order could swap user/peer on the
  // callee, so accept/offer/answer were emitted back with the wrong
  // from/to pair and the other phone ignored them. Keep outgoing behavior,
  // but make incoming identity explicit and stable.
  const providedCallId = firstText(params.callId, params.callID, params.id);
  const callUsers = readRouteUsersFromCallId(providedCallId);

  let userId = incoming
    ? firstText(params.currentUserId, params.me, params.localUserId, params.toUserId, params.receiverId, params.receiverUserId, params.recipientId, params.userId, callUsers.toUserId) || "self"
    : firstText(params.userId, params.currentUserId, params.me, params.localUserId, params.fromUserId, params.senderId, callUsers.fromUserId) || "self";

  let peerId = incoming
    ? firstText(params.peerId, params.peerUserId, params.fromUserId, params.senderId, params.callerId, callUsers.fromUserId, params.user, params.withUserId) || "peer"
    : firstText(params.peerId, params.peerUserId, params.toUserId, params.targetUserId, params.receiverId, params.receiverUserId, params.recipientId, callUsers.toUserId, params.user, params.withUserId) || "peer";

  if (userId && peerId && userId === peerId) {
    const fallbackPeer = incoming ? callUsers.fromUserId : callUsers.toUserId;
    if (fallbackPeer && fallbackPeer !== userId) peerId = fallbackPeer;
  }

  const chatId = firstText(params.chatId, params.roomId) || ["direct", userId, peerId].join(":");
  const callId = buildFullCallId(kind, chatId, userId, peerId, providedCallId);
  const name = firstText(params.name, params.peerName, params.callerName, params.fromName, params.title) || "Sabi";
  const avatarLetter = (firstText(params.avatarLetter, name).trim()[0] || "S").toUpperCase();

  return {
    kind,
    incoming,
    callId,
    chatId,
    roomId: firstText(params.roomId, chatId) || chatId,
    userId,
    peerId,
    name,
    avatarLetter,
    accent: firstText(params.accent),
    background: firstText(params.background),
    avatarUrl: firstText(params.avatarUrl),
    photoUrl: firstText(params.photoUrl),
  };
}

export function makeCallPayload(route: StandardCallRoute, extra: AnyRecord = {}): AnyRecord {
  const event = firstText(extra.event, extra.action, "signal");
  return {
    ...extra,
    callId: route.callId,
    baseCallId: normalizeBaseCallId(route.callId),
    kind: "audio",
    type: "audio",
    callKind: "audio",
    callType: "audio",
    signalKind: firstText(extra.signalKind, extra.event, extra.action),
    event,
    action: firstText(extra.action, event),
    phase: firstText(extra.phase),
    status: firstText(extra.status),
    chatId: route.chatId,
    roomId: route.roomId,
    fromUserId: route.userId,
    toUserId: route.peerId,
    userId: route.userId,
    peerId: route.peerId,
    timestamp: Date.now(),
    sentAt: new Date().toISOString(),
  };
}

export function summarizeSabiCallPayloadForDebug(payload: unknown): AnyRecord {
  const body = asRecord(payload);
  const description = asRecord(body.description);
  const candidate = asRecord(body.candidate);
  return {
    event: firstText(body.event, body.action),
    reason: firstText(body.reason, body.endReason),
    signalKind: firstText(body.signalKind, body.kind),
    fromUserId: firstText(body.fromUserId, body.from, body.senderId),
    toUserId: firstText(body.toUserId, body.to, body.receiverId),
    descriptionType: firstText(description.type, body.descriptionType),
    sdp: firstText(description.sdp, body.sdp).slice(0, 120),
    candidate: firstText(candidate.candidate, body.candidate).slice(0, 120),
  };
}

export function logSabiCallDebug(route: StandardCallRoute, stage: string, details: AnyRecord = {}) {
  try {
    console.log("[sabi-call:debug]", JSON.stringify({
      at: new Date().toISOString(),
      stage,
      callId: route.callId,
      kind: "audio",
      incoming: route.incoming,
      userId: route.userId,
      peerId: route.peerId,
      ...details,
    }));
  } catch {}
}

export function makeSignalKey(eventName: string, payload: unknown): string {
  const body = asRecord(payload);
  const nested = asRecord(body.payload);
  const data = asRecord(body.data);
  const message = asRecord(body.message);
  const desc = asRecord(body.description || nested.description || data.description || message.description);
  const cand = asRecord(body.candidate || nested.candidate || data.candidate || message.candidate);
  return [
    eventName,
    firstPayloadText(payload, "callId", "baseCallId", "callID", "id"),
    firstPayloadText(payload, "fromUserId", "from", "senderId", "senderUserId", "callerId"),
    firstPayloadText(payload, "toUserId", "to", "receiverId", "receiverUserId", "peerId"),
    firstPayloadText(payload, "signalKind", "event", "action", "type", "kind"),
    firstText(desc.type, firstPayloadText(payload, "descriptionType")),
    firstText(desc.sdp, firstPayloadText(payload, "sdp")).slice(0, 96),
    firstText(cand.candidate, firstPayloadText(payload, "candidate")).slice(0, 96),
  ].join("|");
}

export function payloadMatches(route: StandardCallRoute, payload: unknown): boolean {
  const callId = firstPayloadText(payload, "callId", "callID", "id", "baseCallId");
  if (!callId) return true;
  return callId === route.callId || normalizeBaseCallId(callId) === normalizeBaseCallId(route.callId);
}

export function isFromPeer(route: StandardCallRoute, payload: unknown): boolean {
  const from = firstPayloadText(payload, "fromUserId", "from", "senderId", "senderUserId", "callerId", "userId");
  if (!from) return true;
  return from === route.peerId;
}

export function isRealCallEndPayload(payload: unknown): boolean {
  const text = payloadRecords(payload)
    .flatMap((body) => [body.event, body.action, body.status, body.phase, body.reason, body.endReason])
    .map((value) => firstText(value).toLowerCase())
    .join(" ");
  return /ended|end|declined|missed|cancelled|canceled|busy|hangup|local_end|remote_end/.test(text);
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

function getDescription(payload: unknown, wanted: "offer" | "answer") {
  const body = asRecord(payload);
  const nested = asRecord(body.payload);
  const data = asRecord(body.data);
  const message = asRecord(body.message);
  const description = asRecord(body.description || nested.description || data.description || message.description);
  const sdp = normalizeRemoteSdp(firstText(description.sdp, body.sdp, nested.sdp, data.sdp, message.sdp));
  const type = firstText(description.type, body.descriptionType, nested.descriptionType, data.descriptionType, message.descriptionType, wanted).toLowerCase();
  if (!sdp || !sdp.startsWith("v=")) return null;
  return { type: (type === "answer" ? "answer" : type === "offer" ? "offer" : wanted) as "offer" | "answer", sdp };
}

async function setRemoteDescriptionCompat(connection: any, description: { type: "offer" | "answer"; sdp: string }, label: string) {
  const clean = { type: description.type, sdp: normalizeRemoteSdp(description.sdp) };
  if (!clean.sdp || !clean.sdp.startsWith("v=")) throw new Error("invalid_remote_" + description.type);
  try {
    return await timeout(label, connection.setRemoteDescription(clean as any), 5000);
  } catch (firstError) {
    try {
      const ctorDescription = new RTCSessionDescription(clean as any);
      return await timeout(label + "_ctor", connection.setRemoteDescription(ctorDescription as any), 5000);
    } catch (secondError) {
      try {
        const cloned = JSON.parse(JSON.stringify(clean));
        return await timeout(label + "_clone", connection.setRemoteDescription(cloned as any), 5000);
      } catch {
        throw secondError || firstError;
      }
    }
  }
}

function getCandidate(payload: unknown) {
  const body = asRecord(payload);
  const nested = asRecord(body.payload);
  const data = asRecord(body.data);
  const message = asRecord(body.message);
  const candidate = body.candidate || nested.candidate || data.candidate || message.candidate;
  if (!candidate) return null;
  if (typeof candidate === "string") return { candidate };
  if (typeof candidate === "object") return candidate;
  return null;
}

async function timeout<T>(label: string, promise: Promise<T>, ms: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | null = null;
  try {
    return await Promise.race([
      promise,
      new Promise<T>((_, reject) => {
        timer = setTimeout(() => reject(new Error(label + "_timeout")), ms);
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

export type SabiAudioPeer = ReturnType<typeof createStandardCallPeer>;

export function createStandardCallPeer(options: {
  route: StandardCallRoute;
  socket: any;
  initialVideoEnabled?: boolean;
  initialCameraFacing?: "user" | "environment";
  canStartCaller?: () => boolean;
  onLocalStream?: (stream: any | null) => void;
  onRemoteStream?: (stream: any | null) => void;
  onConnected?: () => void;
  onError?: (message: string) => void;
}) {
  let pc: any | null = null;
  let localStream: any | null = null;
  let localStreamPromise: Promise<any> | null = null;
  let closed = false;
  let makingOffer = false;
  let connected = false;
  let speakerEnabled = false;
  let audioTransceiverAdded = false;
  const pendingIce: any[] = [];
  const seenRemoteIceCandidates = new Set<string>();
  let lastAppliedSpeakerEnabled: boolean | null = null;
  let lastAudioRouteAppliedAt = 0;
  let audioRouteVersion = 0;

  const debug = (stage: string, details: AnyRecord = {}) => {
    try {
      logSabiCallDebug(options.route, stage, {
        ...details,
        iceConnectionState: pc?.iceConnectionState || "new",
        connectionState: pc?.connectionState || "new",
        signalingState: pc?.signalingState || "stable",
      });
    } catch {}
  };

  const emit = (eventName: string, payload: AnyRecord) => {
    const rich = makeCallPayload(options.route, payload);
    debug("emit:" + eventName, summarizeSabiCallPayloadForDebug(rich));

    // IMPORTANT:
    // AudioCallScreen subscribes through callSignalTransport.
    // Sending WebRTC offer/answer/ice only with raw socket.emit can be lost on
    // the opposite phone when backend expects the transport envelope/scopes.
    // Always use the same transport emitter for runtime signaling too.
    try { emitSabiCallTransportEvent(options.socket, eventName, rich); } catch {
      try { options.socket?.emit?.(eventName, rich); } catch {}
    }

    // CALLS-3.5:
    // Do not mirror WebRTC offer/answer/ice into the generic call:signal lane.
    // 3.4 used that as a speed fallback, but real device logs showed every
    // offer/ice reaching the callee twice. The duplicate offer made one route
    // own the peer while the visible incoming screen stayed in connecting,
    // producing one-sided connection / “second phone is thinking”. Accepted still
    // has its fast call:signal path from the screen; WebRTC payloads stay on
    // their canonical call:webrtc:* events only.
  };

  const applyAudioMode = async (reason = "audio_mode") => {
    const targetSpeakerEnabled = speakerEnabled;
    const now = Date.now();
    const isRetry = String(reason || "").includes("retry");

    // Avoid hammering Android audio routing with the same target route. The
    // screen already calls setSpeakerEnabled on user tap and this runtime also
    // retries once; without this guard the same route was applied many times in
    // a few seconds, delaying actual audio output on some devices.
    if (
      lastAppliedSpeakerEnabled === targetSpeakerEnabled &&
      now - lastAudioRouteAppliedAt < (isRetry ? 1200 : 180)
    ) {
      return;
    }

    const version = ++audioRouteVersion;
    try {
      await Promise.race([
        setSabiCallAudioMode({
          allowsRecording: true,
          speakerEnabled: targetSpeakerEnabled,
          shouldPlayInBackground: true,
          duckOthers: false,
        }),
        new Promise((resolve) => setTimeout(resolve, 120)),
      ]);

      if (closed || (version !== audioRouteVersion && targetSpeakerEnabled !== speakerEnabled)) return;

      lastAppliedSpeakerEnabled = targetSpeakerEnabled;
      lastAudioRouteAppliedAt = Date.now();

      // Do not block WebRTC/media startup on slow Android native audio-route
      // modules. Apply native route in the background and log once. This removes
      // several seconds from accepted -> offer on devices where native routing is
      // slow, while keeping the final speaker/earpiece state correct.
      void applyNativeSpeakerRoute(targetSpeakerEnabled)
        .then((nativeCalls) => {
          if (!closed && version === audioRouteVersion) {
            debug("audio:route:applied", { reason, speakerEnabled: targetSpeakerEnabled, nativeCalls });
          }
        })
        .catch((error) => {
          debug("audio:route:error", { reason, speakerEnabled: targetSpeakerEnabled, message: error instanceof Error ? error.message : String(error) });
        });
    } catch (error) {
      debug("audio:route:error", { reason, speakerEnabled: targetSpeakerEnabled, message: error instanceof Error ? error.message : String(error) });
    }
  };

  const markConnected = () => {
    if (connected || closed) return;
    connected = true;
    debug("connected");
    emit("call:connected", { event: "connected", signalKind: "connected", phase: "active", status: "active" });
    options.onConnected?.();
  };

  const ensurePeer = async () => {
    if (closed) throw new Error("peer_closed");
    if (pc) return pc;

    const iceServers = await timeout(
      "resolve_ice_servers",
      resolveSabiCallIceServers(),
      250,
    ).catch(() => [{ urls: "stun:stun.l.google.com:19302" }]);
    pc = new RTCPeerConnection({ iceServers } as any);
    debug("peer:created", { iceServers: summarizeSabiCallIceServersForDebug(iceServers) || "stun" });

    pc.onicecandidate = (event: any) => {
      if (closed || !event?.candidate) return;
      debug("ice:local", { candidate: String(event.candidate?.candidate || "").slice(0, 120) });
      emit("call:webrtc:ice", { event: "ice", signalKind: "ice", candidate: event.candidate });
    };

    const acceptRemoteStream = (stream: any, source: string) => {
      if (!stream || closed) return;
      try {
        stream.getAudioTracks?.().forEach((track: any) => { track.enabled = true; });
      } catch {}
      debug("track:remote_stream", {
        source,
        tracks: stream.getTracks?.()?.length ?? 0,
        audio: stream.getAudioTracks?.()?.length ?? 0,
        video: stream.getVideoTracks?.()?.length ?? 0,
      });
      options.onRemoteStream?.(stream);
      markConnected();
    };

    pc.ontrack = (event: any) => {
      const stream = event?.streams?.[0];
      if (stream) acceptRemoteStream(stream, "ontrack");
    };

    // react-native-webrtc versions/devices may still deliver remote audio
    // through onaddstream. Keep this fallback so the remote audio track is not
    // silently lost when event.streams is empty.
    pc.onaddstream = (event: any) => {
      acceptRemoteStream(event?.stream, "onaddstream");
    };

    const onState = () => {
      debug("peer:state");
      const ice = String(pc?.iceConnectionState || "");
      const state = String(pc?.connectionState || "");
      if (ice === "connected" || ice === "completed" || state === "connected") markConnected();
      if (ice === "failed" || state === "failed") options.onError?.("connection_failed");
    };
    pc.oniceconnectionstatechange = onState;
    pc.onconnectionstatechange = onState;

    return pc;
  };

  const ensureAudioTransceiver = (connection = pc) => {
    if (!connection || audioTransceiverAdded) return;
    try {
      if (typeof connection.addTransceiver === "function") {
        connection.addTransceiver("audio", { direction: "sendrecv" } as any);
        audioTransceiverAdded = true;
        debug("audio:transceiver:add");
      }
    } catch (error) {
      debug("audio:transceiver:error", { message: error instanceof Error ? error.message : String(error) });
    }
  };

  const ensureLocalAudio = async () => {
    if (localStream) return localStream;
    if (localStreamPromise) return localStreamPromise;
    if (closed) throw new Error("peer_closed");

    localStreamPromise = (async () => {
      debug("media:getUserMedia:start", { audioOnly: true });
      // CALLS-3.3: do not block microphone startup on Android audio-route work.
      // The route is still applied, but getUserMedia starts immediately.
      void applyAudioMode();

      const stream = await timeout(
        "get_user_media_audio",
        mediaDevices.getUserMedia({ audio: true, video: false } as any),
        6000
      );

      try {
        stream.getAudioTracks?.().forEach((track: any) => {
          track.enabled = true;
        });
      } catch {}

      if (closed) {
        try { stream?.getTracks?.().forEach((track: any) => track.stop?.()); } catch {}
        throw new Error("peer_closed");
      }

      localStream = stream;
      debug("media:getUserMedia:success", {
        tracks: localStream.getTracks?.()?.length ?? 0,
        audio: localStream.getAudioTracks?.()?.length ?? 0,
        video: localStream.getVideoTracks?.()?.length ?? 0,
      });
      options.onLocalStream?.(localStream);
      return localStream;
    })();

    try {
      return await localStreamPromise;
    } finally {
      localStreamPromise = null;
    }
  };

  const attachLocalAudio = async (connection = pc) => {
    if (!connection || closed) throw new Error("peer_closed");

    const stream = await ensureLocalAudio();
    const track = stream.getAudioTracks?.()[0];
    if (!track) throw new Error("no_audio_track");

    try { track.enabled = true; } catch {}

    const senders = Array.isArray(connection.getSenders?.()) ? connection.getSenders() : [];
    const existingAudio = senders.find((sender: any) => sender?.track?.kind === "audio");
    const emptySender = senders.find((sender: any) => sender?.track == null);

    if (existingAudio?.track === track) {
      debug("audio:track:already_attached", { audioEnabled: true });
    } else if (existingAudio?.replaceTrack) {
      await existingAudio.replaceTrack(track);
      debug("audio:track:replaced", { audioEnabled: true });
    } else if (emptySender?.replaceTrack) {
      await emptySender.replaceTrack(track);
      debug("audio:track:replaced_empty_sender", { audioEnabled: true });
    } else {
      connection.addTrack(track, stream);
      debug("audio:track:added", { audioEnabled: true });
    }

    options.onLocalStream?.(stream);
    debug("audio:track:attached", { audioEnabled: true });
  };

  const flushIce = async () => {
    if (!pc || !pc.remoteDescription) return;
    const queue = pendingIce.splice(0, pendingIce.length);
    if (queue.length) debug("ice:flush", { count: queue.length });
    for (const candidate of queue) {
      try { await timeout("add_ice", pc.addIceCandidate(new RTCIceCandidate(candidate as any)), 2500); } catch {}
    }
  };

  return {
    async prepareAudio() {
      try {
        const connection = await ensurePeer();
        await attachLocalAudio(connection);
      } catch (error) {
        debug("audio:prepare:error", { message: error instanceof Error ? error.message : String(error) });
        if (!closed) options.onError?.(error instanceof Error ? error.message : "audio_prepare_error");
      }
    },

    async startCaller() {
      if (closed || makingOffer || (options.canStartCaller && !options.canStartCaller())) {
        debug("startCaller:blocked");
        return;
      }
      makingOffer = true;
      try {
        debug("startCaller:start");
        const connection = await ensurePeer();
        // AUDIO-1600: startCaller is used only after Accept on the incoming side.
        // Open the real microphone track first, then create offer. Do not create
        // a transceiver-only offer during ringback; that is the 10+ second hang
        // shown in the latest device log.
        await attachLocalAudio(connection);
        if (closed) return;
        debug("offer:create:start");
        const offer = await timeout("create_offer", connection.createOffer(), 4000) as AnyRecord;
        if (closed) return;
        debug("offer:setLocal:start", { sdp: firstText(offer.sdp).slice(0, 120) });
        await timeout("set_local_offer", connection.setLocalDescription(offer as any), 4000);
        if (closed) return;
        debug("offer:setLocal:done", { sdp: firstText(offer.sdp).slice(0, 120) });
        emit("call:webrtc:offer", { event: "offer", signalKind: "offer", descriptionType: "offer", description: offer, sdp: firstText(offer.sdp) });
      } catch (error) {
        debug("offer:error", { message: error instanceof Error ? error.message : String(error) });
        if (!closed) options.onError?.(error instanceof Error ? error.message : "connection_error");
      } finally {
        makingOffer = false;
      }
    },

    async resendLocalOffer(reason = "resend_local_offer") {
      try {
        if (!pc || closed) {
          debug("offer:resend:ignored_no_peer", { reason });
          return;
        }
        const description = pc.localDescription as AnyRecord | null | undefined;
        const sdp = firstText(description?.sdp);
        const type = firstText(description?.type);
        if (type !== "offer" || !sdp) {
          debug("offer:resend:ignored_no_offer", { reason, signalingState: pc.signalingState });
          return;
        }
        debug("offer:resend", { reason, sdp: sdp.slice(0, 120) });
        emit("call:webrtc:offer", { event: "offer", signalKind: "offer", descriptionType: "offer", description, sdp });
      } catch (error) {
        debug("offer:resend:error", { reason, message: error instanceof Error ? error.message : String(error) });
      }
    },

    async handleOffer(payload: unknown) {
      try {
        debug("offer:recv", summarizeSabiCallPayloadForDebug(payload));
        const offer = getDescription(payload, "offer");
        if (!offer) return;
        const connection = await ensurePeer();
        if (closed) return;
        // AUDIO-2WAY-28:
        // Attach the callee microphone BEFORE applying the remote offer.
        // On some Android rn-webrtc builds, replacing an empty sender after
        // setRemoteDescription produced one-way audio: caller -> callee worked,
        // but callee -> caller stayed silent. This mirrors the stable video-call
        // order: prepare local media first, then answer the offer.
        await attachLocalAudio(connection);
        if (closed) return;
        debug("offer:apply:start");
        await setRemoteDescriptionCompat(connection, offer, "set_remote_offer");
        debug("offer:setRemote:done");
        await flushIce();
        debug("answer:create:start");
        const answer = await timeout("create_answer", connection.createAnswer(), 4000) as AnyRecord;
        await timeout("set_local_answer", connection.setLocalDescription(answer as any), 5000);
        debug("answer:setLocal:done", { sdp: firstText(answer.sdp).slice(0, 120) });
        emit("call:webrtc:answer", { event: "answer", signalKind: "answer", descriptionType: "answer", description: answer, sdp: firstText(answer.sdp) });
      } catch (error) {
        debug("offer:handle:error", { message: error instanceof Error ? error.message : String(error) });
        if (!closed) options.onError?.(error instanceof Error ? error.message : "connection_error");
      }
    },

    async handleAnswer(payload: unknown) {
      try {
        debug("answer:recv", summarizeSabiCallPayloadForDebug(payload));
        const answer = getDescription(payload, "answer");
        if (!answer || !pc || closed) return;
        if (pc.signalingState !== "have-local-offer") {
          debug("answer:ignored_bad_state", { signalingState: pc.signalingState });
          return;
        }
        await setRemoteDescriptionCompat(pc, answer, "set_remote_answer");
        debug("answer:setRemote:done");
        await attachLocalAudio(pc);
        await flushIce();
      } catch (error) {
        debug("answer:handle:error", { message: error instanceof Error ? error.message : String(error) });
        if (!closed) options.onError?.(error instanceof Error ? error.message : "connection_error");
      }
    },

    async handleIce(payload: unknown) {
      try {
        const candidate = getCandidate(payload);
        if (!candidate || closed) return;
        const candidateText = firstText((candidate as AnyRecord).candidate, candidate).slice(0, 220);
        if (candidateText && seenRemoteIceCandidates.has(candidateText)) return;
        if (candidateText) {
          seenRemoteIceCandidates.add(candidateText);
          if (seenRemoteIceCandidates.size > 120) {
            const keep = Array.from(seenRemoteIceCandidates).slice(-60);
            seenRemoteIceCandidates.clear();
            keep.forEach((item) => seenRemoteIceCandidates.add(item));
          }
        }
        if (!pc || !pc.remoteDescription) {
          pendingIce.push(candidate);
          debug("ice:queued", { pendingIce: pendingIce.length });
          return;
        }
        await timeout("add_ice", pc.addIceCandidate(new RTCIceCandidate(candidate as any)), 1500);
        debug("ice:applied");
      } catch (error) {
        debug("ice:error", { message: error instanceof Error ? error.message : String(error) });
      }
    },

    getSignalingState() {
      return String(pc?.signalingState || "");
    },

    getConnectionSnapshot() {
      return {
        iceConnectionState: String(pc?.iceConnectionState || ""),
        connectionState: String(pc?.connectionState || ""),
        signalingState: String(pc?.signalingState || ""),
      };
    },

    setMicEnabled(enabled: boolean) {
      try { localStream?.getAudioTracks?.().forEach((track: any) => { track.enabled = enabled; }); } catch {}
    },

    async setSpeakerEnabled(enabled: boolean) {
      const changed = speakerEnabled !== enabled;
      speakerEnabled = enabled;
      await applyAudioMode("speaker_toggle");
      if (changed) {
        setTimeout(() => { if (!closed && speakerEnabled === enabled) void applyAudioMode("speaker_toggle_retry_1"); }, 160);
      }
    },

    async setCameraEnabled() { return; },
    async switchCamera() { return "user" as const; },

    close() {
      const connection = pc;
      closed = true;

      try {
        if (connection) {
          connection.onicecandidate = null;
          connection.ontrack = null;
          connection.onaddstream = null;
          connection.oniceconnectionstatechange = null;
          connection.onconnectionstatechange = null;
        }
      } catch {}

      try {
        connection?.getSenders?.()?.forEach((sender: any) => {
          try { void sender?.replaceTrack?.(null); } catch {}
        });
      } catch {}

      try { connection?.close?.(); } catch {}
      try { localStream?.getTracks?.().forEach((track: any) => track.stop?.()); } catch {}

      pendingIce.splice(0, pendingIce.length);
      seenRemoteIceCandidates.clear();
      pc = null;
      localStream = null;
      localStreamPromise = null;
      makingOffer = false;
      connected = false;
      audioTransceiverAdded = false;

      options.onLocalStream?.(null);
      options.onRemoteStream?.(null);
      debug("peer:close");
    },
  };
}

export const clock = {
  now: () => Date.now(),
};
