import { setSabiCallAudioMode } from "./sabiCallAudio";
import {
  RTCIceCandidate,
  RTCPeerConnection,
  RTCSessionDescription,
  mediaDevices,
} from "react-native-webrtc";

export type SabiGroupCallKind = "audio" | "video";
export type SabiGroupCallSignalKind = "offer" | "answer" | "ice" | "bye";

export type SabiGroupCallSocket = {
  emit: (eventName: string, payload?: unknown) => void;
  on?: (eventName: string, handler: (payload: unknown) => void) => void;
  off?: (eventName: string, handler: (payload: unknown) => void) => void;
};

export type SabiGroupCallSignalPayload = {
  event?: string;
  kind?: SabiGroupCallSignalKind | SabiGroupCallKind | string;
  signalKind?: SabiGroupCallSignalKind | string;
  callId: string;
  chatId?: string | null;
  roomId?: string | null;
  roomType?: string | null;
  groupCall?: boolean;
  senderUserId?: string | null;
  fromUserId?: string | null;
  callerUserId?: string | null;
  receiverUserId?: string | null;
  targetUserId?: string | null;
  toUserId?: string | null;
  peerId?: string | null;
  peerUserId?: string | null;
  participantId?: string | null;
  sdp?: unknown;
  candidate?: unknown;
  payload?: unknown;
};

export type SabiGroupPeerState = {
  peerUserId: string;
  connectionState: string;
  iceConnectionState: string;
};

export type CreateSabiGroupCallRuntimeInput = {
  callId: string;
  chatId?: string | null;
  selfUserId: string;
  kind: SabiGroupCallKind;
  socket: SabiGroupCallSocket;
  localStream?: any | null;
  onLocalStream?: (stream: any | null) => void;
  iceServers?: Array<Record<string, unknown>>;
  onRemoteStream?: (peerUserId: string, stream: any) => void;
  onPeerState?: (state: SabiGroupPeerState) => void;
  onError?: (message: string) => void;
};

type PeerSlot = {
  peerUserId: string;
  pc: any;
  makingOffer: boolean;
  closed: boolean;
  seenSignalKeys: Set<string>;
  lastOfferAt: number;
  pendingIceCandidates: any[];
  sendersByKind: Map<string, any>;
  remoteStreamSeen: boolean;
  lastAnswerAt: number;
};

function makeGroupSignalId() {
  return "group-signal:" + Date.now() + ":" + Math.random().toString(36).slice(2);
}

function smallHash(value: string) {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) | 0;
  }

  return String(hash);
}

function asObject(value: unknown): Record<string, any> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, any>)
    : {};
}

function text(...values: unknown[]): string {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) return value.trim();
    if (typeof value === "number" && Number.isFinite(value)) return String(value);
  }

  return "";
}

function resolveSender(payload: SabiGroupCallSignalPayload) {
  return text(
    payload.senderUserId,
    payload.fromUserId,
    payload.callerUserId,
    payload.peerUserId,
    payload.peerId,
    payload.participantId,
  );
}

function resolveTarget(payload: SabiGroupCallSignalPayload) {
  return text(payload.receiverUserId, payload.targetUserId, payload.toUserId);
}

function resolveSignalKind(payload: SabiGroupCallSignalPayload): SabiGroupCallSignalKind {
  const raw = text(payload.signalKind, payload.event, payload.kind).toLowerCase();

  if (raw.includes("answer")) return "answer";
  if (raw.includes("ice") || raw.includes("candidate")) return "ice";
  if (raw.includes("bye") || raw.includes("leave") || raw.includes("end")) return "bye";

  return "offer";
}

function normalizeSdp(value: unknown) {
  const body = asObject(value);

  if (body.type && body.sdp) return body;

  const payload = asObject(body.payload);
  if (payload.type && payload.sdp) return payload;

  return body;
}

function normalizeIce(value: unknown) {
  const body = asObject(value);

  if (body.candidate && typeof body.candidate === "string") return body;

  const candidate = asObject(body.candidate);
  if (candidate.candidate) return candidate;

  const payload = asObject(body.payload);
  if (payload.candidate) return payload;

  return body;
}

function makeSignalDedupeKey(payload: SabiGroupCallSignalPayload) {
  const body = asObject(payload);
  const explicitId = text(body.signalId, body.messageId, body.id);

  if (explicitId) return "id:" + explicitId;

  const signalKind = resolveSignalKind(payload);
  const sender = resolveSender(payload);
  const target = resolveTarget(payload);
  const callId = text(payload.callId);

  if (signalKind === "ice") {
    const ice = normalizeIce(payload.candidate || payload.payload || payload);

    return [
      "ice",
      callId,
      sender,
      target,
      text(ice.candidate),
      text(ice.sdpMid),
      text(ice.sdpMLineIndex),
    ].join("|");
  }

  const sdp = normalizeSdp(payload.sdp || payload.payload || payload);

  return [
    signalKind,
    callId,
    sender,
    target,
    text(sdp.type),
    smallHash(text(sdp.sdp)),
  ].join("|");
}

function enableSabiGroupTracks(stream: any | null | undefined) {
  try {
    const tracks = stream?.getTracks?.() || [];

    for (const track of tracks) {
      if (track && "enabled" in track) {
        track.enabled = true;
      }
    }
  } catch {}
}

function hasLiveSabiGroupTracks(stream: any | null | undefined) {
  try {
    const tracks = stream?.getTracks?.() || [];
    return tracks.some((track: any) => track?.readyState !== "ended");
  } catch {
    return false;
  }
}

function getSabiStreamStableKey(stream: any | null | undefined) {
  if (!stream) return "";

  try {
    const url = typeof stream.toURL === "function" ? String(stream.toURL() || "") : "";
    if (url) return url;
  } catch {}

  try {
    return String(stream.id || "");
  } catch {
    return "";
  }
}

async function stabilizeSabiGroupVideoSender(sender: any) {
  try {
    if (!sender || typeof sender.getParameters !== "function") return;

    const parameters = sender.getParameters() || {};

    parameters.encodings =
      Array.isArray(parameters.encodings) && parameters.encodings.length
        ? parameters.encodings
        : [{}];

    parameters.encodings[0] = {
      ...parameters.encodings[0],
      maxBitrate: 900000,
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

function shouldCreateOffer(selfUserId: string, peerUserId: string) {
  if (!selfUserId || !peerUserId || selfUserId === peerUserId) return false;

  /*
    Group call mesh rule:
    For every pair only one side is allowed to create offer.
    Otherwise 1↔2 works, but when 3rd participant joins,
    both old and new pairs can send duplicate offers and WebRTC fails with:
    "The order of m-lines in subsequent offer doesn't match order from previous offer/answer."
  */
  return selfUserId.localeCompare(peerUserId) < 0;
}

function hasAppliedRemoteDescriptionForPeer(slot: PeerSlot) {
  try {
    return Boolean(
      slot.pc?.remoteDescription ||
        slot.pc?.currentRemoteDescription ||
        slot.pc?.pendingRemoteDescription,
    );
  } catch {
    return false;
  }
}

function isSabiPeerEstablished(slot: PeerSlot) {
  try {
    const connectionState = String(slot.pc?.connectionState || "").toLowerCase();
    const iceState = String(slot.pc?.iceConnectionState || "").toLowerCase();
    const signalingState = String(slot.pc?.signalingState || "").toLowerCase();

    return Boolean(
      signalingState === "stable" &&
        hasAppliedRemoteDescriptionForPeer(slot) &&
        (slot.remoteStreamSeen ||
          connectionState === "connected" ||
          connectionState === "completed" ||
          iceState === "connected" ||
          iceState === "completed"),
    );
  } catch {
    return false;
  }
}

export function createSabiGroupCallRuntime(input: CreateSabiGroupCallRuntimeInput) {
  const peers = new Map<string, PeerSlot>();

  let localStream: any | null = input.localStream ?? null;
  let ownsLocalStream = false;
  let closed = false;
  let publishedLocalStreamKey = getSabiStreamStableKey(localStream);

  const emitEvents = ["sabi-call:group:signal"];

  function emitSignal(
    peerUserId: string,
    signalKind: SabiGroupCallSignalKind,
    data: Record<string, unknown>,
  ) {
    const payload = {
      ...data,
      signalId: makeGroupSignalId(),
      callId: input.callId,
      chatId: input.chatId ?? undefined,
      roomId: input.chatId ?? input.callId,
      roomType: "group_call",
      groupCall: true,
      signalKind,
      event: signalKind,
      kind: input.kind,
      senderUserId: input.selfUserId,
      fromUserId: input.selfUserId,
      peerId: input.selfUserId,
      peerUserId: input.selfUserId,
      receiverUserId: peerUserId,
      targetUserId: peerUserId,
      toUserId: peerUserId,
      participantId: peerUserId,
    };

    for (const eventName of emitEvents) {
      try { input.socket.emit(eventName, payload); } catch {}
    }

    const envelope = {
      eventName: "sabi-call:group:signal",
      name: "sabi-call:group:signal",
      event: "sabi-call:group:signal",
      type: "sabi_group_call_event",
      payload,
      data: payload,
      message: payload,
      callId: input.callId,
      chatId: input.chatId ?? undefined,
      roomId: input.chatId ?? input.callId,
      fromUserId: input.selfUserId,
      senderUserId: input.selfUserId,
      toUserId: peerUserId,
      targetUserId: peerUserId,
      receiverUserId: peerUserId,
      userId: peerUserId,
      channel: `user:${peerUserId}`,
      callChannel: `call:${input.callId}`,
      at: new Date().toISOString(),
    };

    for (const eventName of ["realtime:event", "messenger:realtime:event", "sabi:realtime:event", "user:realtime:event"]) {
      try { input.socket.emit(eventName, envelope); } catch {}
    }
  }

  function reportPeer(slot: PeerSlot) {
    input.onPeerState?.({
      peerUserId: slot.peerUserId,
      connectionState: String(slot.pc?.connectionState ?? ""),
      iceConnectionState: String(slot.pc?.iceConnectionState ?? ""),
    });
  }

  function addLocalTracks(slot: PeerSlot) {
    const stream = localStream;

    if (!stream || !slot.pc || slot.closed) return;

    enableSabiGroupTracks(stream);

    const tracks = typeof stream.getTracks === "function" ? stream.getTracks() : [];

    for (const track of tracks || []) {
      const kind = String(track?.kind || "");

      if (!kind || track?.readyState === "ended") continue;

      const senders = typeof slot.pc.getSenders === "function" ? slot.pc.getSenders() : [];
      const mappedSender = slot.sendersByKind.get(kind);

      const existing =
        mappedSender ||
        senders.find((sender: any) => String(sender?.track?.kind || "") === kind) ||
        senders.find((sender: any) => !sender?.track && slot.sendersByKind.get(kind) === sender);

      if (existing?.replaceTrack) {
        slot.sendersByKind.set(kind, existing);

        void existing.replaceTrack(track).catch(() => undefined);

        if (kind === "video") {
          void stabilizeSabiGroupVideoSender(existing);
        }

        continue;
      }

      if (!slot.sendersByKind.has(kind) && typeof slot.pc.addTrack === "function") {
        const sender = slot.pc.addTrack(track, stream);

        if (sender) {
          slot.sendersByKind.set(kind, sender);

          if (kind === "video") {
            void stabilizeSabiGroupVideoSender(sender);
          }
        }
      }
    }
  }

  function ensurePeer(peerUserId: string): PeerSlot {
    const existing = peers.get(peerUserId);

    if (existing && !existing.closed) return existing;

    const pc = new (RTCPeerConnection as any)({
      iceServers:
        input.iceServers && input.iceServers.length
          ? input.iceServers
          : [{ urls: "stun:stun.l.google.com:19302" }],
    });

    const slot: PeerSlot = {
      peerUserId,
      pc,
      makingOffer: false,
      closed: false,
      seenSignalKeys: new Set<string>(),
      lastOfferAt: 0,
      pendingIceCandidates: [],
      sendersByKind: new Map<string, any>(),
      remoteStreamSeen: false,
      lastAnswerAt: 0,
    };

    pc.onicecandidate = (event: any) => {
      const candidate = event?.candidate;

      if (!candidate || slot.closed || closed) return;

      emitSignal(peerUserId, "ice", { candidate });
    };

    pc.ontrack = (event: any) => {
      const stream = event?.streams?.[0];

      if (!stream) return;

      enableSabiGroupTracks(stream);
      slot.remoteStreamSeen = true;

      input.onRemoteStream?.(peerUserId, stream);
      reportPeer(slot);
    };

    pc.onconnectionstatechange = () => reportPeer(slot);
    pc.oniceconnectionstatechange = () => reportPeer(slot);

    addLocalTracks(slot);
    peers.set(peerUserId, slot);

    return slot;
  }

  function hasAppliedRemoteDescription(slot: PeerSlot) {
    return hasAppliedRemoteDescriptionForPeer(slot);
  }

  async function addIceCandidateOrQueue(slot: PeerSlot, candidate: any) {
    if (!candidate?.candidate || slot.closed || closed) return;

    if (!hasAppliedRemoteDescription(slot)) {
      slot.pendingIceCandidates.push(candidate);

      if (slot.pendingIceCandidates.length > 80) {
        slot.pendingIceCandidates.splice(0, slot.pendingIceCandidates.length - 80);
      }

      return;
    }

    try {
      await slot.pc.addIceCandidate(new (RTCIceCandidate as any)(candidate));
    } catch {}
  }

  async function flushPendingIceCandidates(slot: PeerSlot) {
    if (!slot.pendingIceCandidates.length || !hasAppliedRemoteDescription(slot)) return;

    const pending = slot.pendingIceCandidates.splice(0);

    for (const candidate of pending) {
      await addIceCandidateOrQueue(slot, candidate);
    }
  }

  function publishLocalStreamIfChanged(stream: any | null) {
    if (!stream || !hasLiveSabiGroupTracks(stream)) return;

    const nextKey = getSabiStreamStableKey(stream);

    if (nextKey && publishedLocalStreamKey === nextKey) {
      return;
    }

    publishedLocalStreamKey = nextKey;
    input.onLocalStream?.(stream);
  }

  async function prepareSabiGroupAudioSession() {
    try {
      await setSabiCallAudioMode({
        allowsRecording: true,
        speakerEnabled: true,
        shouldPlayInBackground: true,
        duckOthers: false,
      });
    } catch {}
  }

  async function startLocalMedia(kind: SabiGroupCallKind = input.kind) {
    if (localStream && hasLiveSabiGroupTracks(localStream)) {
      enableSabiGroupTracks(localStream);
      publishLocalStreamIfChanged(localStream);
      return localStream;
    }

    await prepareSabiGroupAudioSession();

    localStream = await (mediaDevices as any).getUserMedia({
      audio: true,
      video:
        kind === "video"
          ? {
              facingMode: "user",
              width: 640,
              height: 360,
              frameRate: 24,
            }
          : false,
    });

    ownsLocalStream = true;

    enableSabiGroupTracks(localStream);
    publishLocalStreamIfChanged(localStream);

    for (const slot of peers.values()) {
      addLocalTracks(slot);
    }

    return localStream;
  }

  async function invitePeer(peerUserId: string, options?: { force?: boolean }) {
    if (closed || !peerUserId || peerUserId === input.selfUserId) return;

    const slot = ensurePeer(peerUserId);

    if (slot.makingOffer || slot.closed) return;

    await startLocalMedia(input.kind);
    addLocalTracks(slot);

    if (!shouldCreateOffer(input.selfUserId, peerUserId)) {
      return;
    }

    const state = String(slot.pc?.signalingState || "");
    const now = Date.now();
    const forceOffer = Boolean(options?.force);

    /*
      Critical group video fix:
      When 3rd participant joins, old participants receive the same accepted event.
      Old stable pairs must not receive a new offer.
      Only missing peer pairs should be negotiated.
    */
    if (isSabiPeerEstablished(slot)) return;

    if (state !== "stable") return;
    if (!forceOffer && now - slot.lastOfferAt < 15000) return;
    if (forceOffer && now - slot.lastOfferAt < 900) return;

    slot.lastOfferAt = now;
    slot.makingOffer = true;

    try {
      await startLocalMedia(input.kind);
      addLocalTracks(slot);

      if (isSabiPeerEstablished(slot)) return;
      if (String(slot.pc?.signalingState || "") !== "stable") return;

      const offer = await slot.pc.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: input.kind === "video",
      });

      if (String(slot.pc?.signalingState || "") !== "stable") return;

      await slot.pc.setLocalDescription(offer);

      emitSignal(peerUserId, "offer", {
        sdp: slot.pc.localDescription || offer,
        payload: slot.pc.localDescription || offer,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "group_offer_failed";
      const normalized = String(message).toLowerCase();

      if (
        !normalized.includes("wrong state") &&
        !normalized.includes("m-lines") &&
        !normalized.includes("m line")
      ) {
        input.onError?.(message);
      }
    } finally {
      slot.makingOffer = false;
    }
  }

  async function handleOffer(payload: SabiGroupCallSignalPayload) {
    const peerUserId = resolveSender(payload);

    if (!peerUserId || peerUserId === input.selfUserId) return;

    const slot = ensurePeer(peerUserId);

    try {
      const description = normalizeSdp(payload.sdp || payload.payload || payload);

      const currentRemoteSdp = String(slot.pc?.remoteDescription?.sdp || "");
      const nextRemoteSdp = String(description?.sdp || "");

      if (currentRemoteSdp && nextRemoteSdp && currentRemoteSdp === nextRemoteSdp) {
        return;
      }

      const state = String(slot.pc?.signalingState || "");

      /*
        If this side is deterministic offer owner,
        incoming offer from the other side is duplicate/stale.
        Drop it and let this side create the correct offer.
      */
      if (shouldCreateOffer(input.selfUserId, peerUserId) && !hasAppliedRemoteDescription(slot)) {
        void invitePeer(peerUserId);
        return;
      }

      /*
        Drop duplicate glare offers.
        This prevents "m-lines order" and wrong-state errors.
      */
      if (state !== "stable") {
        return;
      }

      await startLocalMedia(input.kind);
      addLocalTracks(slot);

      if (String(slot.pc?.signalingState || "") !== state) {
        return;
      }

      await slot.pc.setRemoteDescription(new (RTCSessionDescription as any)(description));
      await flushPendingIceCandidates(slot);

      const afterRemoteState = String(slot.pc?.signalingState || "");

      if (afterRemoteState !== "have-remote-offer") {
        return;
      }

      const answer = await slot.pc.createAnswer();

      await slot.pc.setLocalDescription(answer);

      slot.lastAnswerAt = Date.now();

      emitSignal(peerUserId, "answer", {
        sdp: slot.pc.localDescription || answer,
        payload: slot.pc.localDescription || answer,
      });
    } catch (error) {
      input.onError?.(error instanceof Error ? error.message : "group_answer_failed");
    }
  }

  async function handleAnswer(payload: SabiGroupCallSignalPayload) {
    const peerUserId = resolveSender(payload);

    if (!peerUserId || peerUserId === input.selfUserId) return;

    const slot = ensurePeer(peerUserId);

    try {
      const state = String(slot.pc?.signalingState || "");

      if (state !== "have-local-offer") {
        return;
      }

      const description = normalizeSdp(payload.sdp || payload.payload || payload);

      await slot.pc.setRemoteDescription(new (RTCSessionDescription as any)(description));
      await flushPendingIceCandidates(slot);
      reportPeer(slot);
    } catch (error) {
      input.onError?.(error instanceof Error ? error.message : "group_set_answer_failed");
    }
  }

  async function handleIce(payload: SabiGroupCallSignalPayload) {
    const peerUserId = resolveSender(payload);

    if (!peerUserId || peerUserId === input.selfUserId) return;

    const slot = ensurePeer(peerUserId);

    try {
      const candidate = normalizeIce(payload.candidate || payload.payload || payload);

      if (candidate?.candidate) {
        await addIceCandidateOrQueue(slot, candidate);
      }
    } catch {}
  }

  function closePeer(peerUserId: string, notify = true) {
    const slot = peers.get(peerUserId);

    if (!slot) return;

    slot.closed = true;

    try {
      slot.pc.close();
    } catch {}

    peers.delete(peerUserId);

    if (notify) {
      emitSignal(peerUserId, "bye", {});
    }
  }

  async function handleSignal(payload: SabiGroupCallSignalPayload) {
    if (closed) return;

    const target = resolveTarget(payload);

    if (target && target !== input.selfUserId) return;

    const peerUserId = resolveSender(payload);

    if (!peerUserId || peerUserId === input.selfUserId) return;

    const slot = ensurePeer(peerUserId);
    const dedupeKey = makeSignalDedupeKey(payload);

    if (slot.seenSignalKeys.has(dedupeKey)) {
      return;
    }

    slot.seenSignalKeys.add(dedupeKey);

    if (slot.seenSignalKeys.size > 300) {
      slot.seenSignalKeys.clear();
      slot.seenSignalKeys.add(dedupeKey);
    }

    const signalKind = resolveSignalKind(payload);

    if (signalKind === "offer") return handleOffer(payload);
    if (signalKind === "answer") return handleAnswer(payload);
    if (signalKind === "ice") return handleIce(payload);

    if (signalKind === "bye") {
      /*
        Do not close the whole group mesh from old direct-call bye/end packets.
        Screen hangup calls closeAll(true).
      */
      return;
    }
  }

  function closeAll(notify = false) {
    /*
      React cleanup / route replay / direct->group handoff must not kill active group call.
      In your log, group handoff caused pc.close() and then tiles returned to 1.
    */
    if (!notify) {
      return;
    }

    closed = true;

    for (const peerUserId of Array.from(peers.keys())) {
      closePeer(peerUserId, false);
    }

    if (ownsLocalStream) {
      try {
        const tracks = localStream?.getTracks?.() || [];
        tracks.forEach((track: any) => track?.stop?.());
      } catch {}
    }

    localStream = null;
    publishedLocalStreamKey = "";
    ownsLocalStream = false;
    input.onLocalStream?.(null);
  }

  function setLocalStream(nextStream: any | null) {
    /*
      Temporary null from render must not erase active group stream.
    */
    if (!nextStream) return;
    if (!hasLiveSabiGroupTracks(nextStream)) return;

    const currentKey = getSabiStreamStableKey(localStream);
    const nextKey = getSabiStreamStableKey(nextStream);

    if (currentKey && nextKey && currentKey === nextKey) {
      enableSabiGroupTracks(localStream);
      return;
    }

    localStream = nextStream;
    publishedLocalStreamKey = nextKey;
    ownsLocalStream = false;

    enableSabiGroupTracks(localStream);

    for (const slot of peers.values()) {
      addLocalTracks(slot);
    }
  }

  return {
    startLocalMedia,
    setLocalStream,
    invitePeer,
    handleSignal,
    closePeer,
    closeAll,
    getPeerIds: () => Array.from(peers.keys()),
    getLocalStream: () => localStream,
  };
}

export type SabiGroupCallRuntime = ReturnType<typeof createSabiGroupCallRuntime>;