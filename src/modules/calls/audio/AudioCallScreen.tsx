import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

import { useI18n } from "../../../shared/i18n";
import { getSuperAppSocket } from "../../../shared/realtime/superapp-socket";
import {
  emitSabiCallTransportEvent,
  getSabiCallTransportSignalKind,
  joinSabiCallTransportScopes,
  leaveSabiCallTransportScopes,
  subscribeSabiCallTransportEvents,
} from "../callSignalTransport";
import { stopSabiCallToneForCall, stopSabiCallToneNow, useSabiCallTone } from "../useSabiCallTone";
import {
  createStandardCallPeer,
  isFromPeer,
  isRealCallEndPayload,
  logSabiCallDebug,
  makeCallPayload,
  makeSignalKey,
  parseStandardCallRoute,
  payloadMatches,
  summarizeSabiCallPayloadForDebug,
  type StandardCallPhase,
} from "./audioCallRuntime";

type PeerHandle = ReturnType<typeof createStandardCallPeer>;

function closeCallRoute() {
  try { router.replace("/tabs/chats" as never); return; } catch {}
  try { (router as any).replace("/(tabs)/chats"); return; } catch {}
  try { (router as any).replace("/"); } catch {}
}

function stopStream(stream: any | null | undefined) {
  try {
    stream?.getTracks?.().forEach((track: any) => {
      try { if (track && "enabled" in track) track.enabled = false; track?.stop?.(); } catch {}
    });
  } catch {}
}

function rememberActiveAudioPeer(callId: string, peer: PeerHandle | null) {
  try {
    const id = String(callId || "").trim();
    if (!id || !peer) return;
    const root = globalThis as any;
    const map = (root.__sabiActiveAudioPeers ||= {}) as Record<string, PeerHandle>;
    map[id] = peer;
  } catch {}
}

function closeActiveAudioPeer(callId: string, localPeer?: PeerHandle | null) {
  try {
    const id = String(callId || "").trim();
    if (!id) return;
    const root = globalThis as any;
    const map = (root.__sabiActiveAudioPeers || {}) as Record<string, PeerHandle>;
    const peer = map[id];
    delete map[id];
    if (peer && peer !== localPeer) {
      try { peer.close(); } catch {}
    }
  } catch {}
}

function markAudioCallGloballyActive(callId: string, reason = "active") {
  try {
    const id = String(callId || "").trim();
    if (!id) return;
    const root = globalThis as any;
    const map = (root.__sabiGloballyActiveAudioCalls ||= {}) as Record<string, { at: number; reason: string }>;
    map[id] = { at: Date.now(), reason };
  } catch {}
}

function isAudioCallGloballyActive(callId: string) {
  try {
    const id = String(callId || "").trim();
    if (!id) return false;
    const root = globalThis as any;
    const map = (root.__sabiGloballyActiveAudioCalls || {}) as Record<string, { at: number; reason: string }>;
    const at = Number(map[id]?.at || 0);
    return at > 0 && Date.now() - at < 6 * 60 * 60 * 1000;
  } catch {
    return false;
  }
}

function clearAudioCallGloballyActive(callId: string) {
  try {
    const id = String(callId || "").trim();
    if (!id) return;
    const root = globalThis as any;
    const map = (root.__sabiGloballyActiveAudioCalls || {}) as Record<string, { at: number; reason: string }>;
    delete map[id];
  } catch {}
}


const SABI_RECENTLY_FINISHED_CALL_SUPPRESS_MS = 1500;

function callLifecycleKey(route: { kind?: string; chatId?: string; roomId?: string; userId?: string; peerId?: string }) {
  return [
    route.kind || "audio",
    route.chatId || route.roomId || "direct",
    route.userId || "self",
    route.peerId || "peer",
  ].join("|");
}

function rememberFinishedCall(route: { kind?: string; chatId?: string; roomId?: string; userId?: string; peerId?: string }) {
  try {
    const root = globalThis as any;
    const map = (root.__sabiRecentlyFinishedCalls ||= {}) as Record<string, number>;
    map[callLifecycleKey(route)] = Date.now();
  } catch {}
}

function wasCallJustFinished(route: { kind?: string; chatId?: string; roomId?: string; userId?: string; peerId?: string }) {
  try {
    const root = globalThis as any;
    const map = (root.__sabiRecentlyFinishedCalls || {}) as Record<string, number>;
    const at = Number(map[callLifecycleKey(route)] || 0);
    return at > 0 && Date.now() - at < SABI_RECENTLY_FINISHED_CALL_SUPPRESS_MS;
  } catch {
    return false;
  }
}


const SABI_AUDIO_OUTGOING_SESSION_REUSE_MS = 90000;
const SABI_AUDIO_INCOMING_DUPLICATE_SUPPRESS_MS = 15000;

type SabiAudioCallRouteCore = {
  kind?: string;
  chatId?: string;
  roomId?: string;
  userId?: string;
  peerId?: string;
  callId?: string;
};

function audioCallSessionKey(route: SabiAudioCallRouteCore) {
  return [
    route.kind || "audio",
    route.chatId || route.roomId || "direct",
    route.userId || "self",
    route.peerId || "peer",
  ].join("|");
}

function getOrCreateStableOutgoingAudioCallId(route: SabiAudioCallRouteCore, fallbackRawCallId: string) {
  const key = audioCallSessionKey(route);
  const now = Date.now();
  const root = globalThis as any;
  const sessions = (root.__sabiStableOutgoingAudioSessions ||= {}) as Record<string, { callId: string; at: number }>;
  const finished = (root.__sabiRecentlyFinishedCalls || {}) as Record<string, number>;
  const existing = sessions[key];
  const finishedAt = Number(finished[key] || 0);

  if (existing?.callId) {
    const existingAt = Number(existing.at || 0);

    // AUDIO-REPEAT-2.8:
    // A previous finished timestamp can remain in global memory after the old
    // call is closed. The 2.7 logic deleted every new outgoing session whenever
    // that old finishedAt existed, so a fast React remount created two fresh
    // callIds within milliseconds. Reuse the current session when it was
    // created after the last finish; only delete sessions that are actually
    // older than the last hangup.
    if (finishedAt > 0 && finishedAt >= existingAt) {
      if (now - finishedAt < SABI_RECENTLY_FINISHED_CALL_SUPPRESS_MS) {
        existing.at = now;
        return existing.callId;
      }
      delete sessions[key];
    } else if (now - existingAt < SABI_AUDIO_OUTGOING_SESSION_REUSE_MS) {
      existing.at = now;
      return existing.callId;
    }
  }

  const next = [
    fallbackRawCallId || route.chatId || route.roomId || "audio-call",
    String(now),
    Math.random().toString(36).slice(2, 10),
  ].join(":");

  sessions[key] = { callId: next, at: now };
  return next;
}

function releaseStableOutgoingAudioCall(route: SabiAudioCallRouteCore) {
  try {
    const root = globalThis as any;
    const sessions = (root.__sabiStableOutgoingAudioSessions || {}) as Record<string, { callId: string; at: number }>;
    const key = audioCallSessionKey(route);
    if (!sessions[key]?.callId || sessions[key].callId === route.callId) delete sessions[key];
  } catch {}
}

function markOutgoingAudioPrewarmStarted(callId: string) {
  try {
    const id = String(callId || "").trim();
    if (!id) return false;
    const root = globalThis as any;
    const map = (root.__sabiOutgoingAudioPrewarmStarted ||= {}) as Record<string, number>;
    const now = Date.now();
    const last = Number(map[id] || 0);
    map[id] = now;
    return last > 0 && now - last < SABI_AUDIO_OUTGOING_SESSION_REUSE_MS;
  } catch {
    return false;
  }
}

function clearOutgoingAudioPrewarmStarted(callId: string) {
  try {
    const id = String(callId || "").trim();
    if (!id) return;
    const root = globalThis as any;
    const map = (root.__sabiOutgoingAudioPrewarmStarted || {}) as Record<string, number>;
    delete map[id];
  } catch {}
}

function markIncomingAudioPrewarmStarted(callId: string) {
  try {
    const id = String(callId || "").trim();
    if (!id) return false;
    const root = globalThis as any;
    const map = (root.__sabiIncomingAudioPrewarmStarted ||= {}) as Record<string, number>;
    const now = Date.now();
    const last = Number(map[id] || 0);
    map[id] = now;
    return last > 0 && now - last < SABI_AUDIO_OUTGOING_SESSION_REUSE_MS;
  } catch {
    return false;
  }
}

function clearIncomingAudioPrewarmStarted(callId: string) {
  try {
    const id = String(callId || "").trim();
    if (!id) return;
    const root = globalThis as any;
    const map = (root.__sabiIncomingAudioPrewarmStarted || {}) as Record<string, number>;
    delete map[id];
  } catch {}
}

function markOutgoingAudioInviteSent(callId: string) {
  try {
    const id = String(callId || "").trim();
    if (!id) return false;
    const root = globalThis as any;
    const sent = (root.__sabiOutgoingAudioInviteSent ||= {}) as Record<string, number>;
    const now = Date.now();
    const last = Number(sent[id] || 0);
    sent[id] = now;
    return last > 0 && now - last < SABI_AUDIO_OUTGOING_SESSION_REUSE_MS;
  } catch {
    return false;
  }
}

function clearOutgoingAudioInviteSent(callId: string) {
  try {
    const id = String(callId || "").trim();
    if (!id) return;
    const root = globalThis as any;
    const sent = (root.__sabiOutgoingAudioInviteSent || {}) as Record<string, number>;
    delete sent[id];
  } catch {}
}

function shouldCloseDuplicateIncomingAudioRoute(route: SabiAudioCallRouteCore) {
  if (!route.callId) return false;
  try {
    const key = audioCallSessionKey(route);
    const now = Date.now();
    const root = globalThis as any;
    const incoming = (root.__sabiActiveIncomingAudioRoutes ||= {}) as Record<string, { callId: string; at: number }>;
    const finished = (root.__sabiRecentlyFinishedCalls || {}) as Record<string, number>;
    const existing = incoming[key];
    const finishedAt = Number(finished[key] || 0);

    // If the previous incoming call was already ended, do not let the old
    // duplicate-route guard block a legitimate immediate second call.
    if (existing?.callId && finishedAt > 0 && finishedAt >= Number(existing.at || 0)) {
      delete incoming[key];
    }

    const current = incoming[key];
    if (current?.callId && current.callId !== route.callId && now - Number(current.at || 0) < SABI_AUDIO_INCOMING_DUPLICATE_SUPPRESS_MS) {
      return true;
    }

    incoming[key] = { callId: String(route.callId), at: now };
    return false;
  } catch {
    return false;
  }
}

function releaseIncomingAudioRoute(route: SabiAudioCallRouteCore) {
  try {
    const root = globalThis as any;
    const incoming = (root.__sabiActiveIncomingAudioRoutes || {}) as Record<string, { callId: string; at: number }>;
    const key = audioCallSessionKey(route);
    if (incoming[key]?.callId === route.callId) delete incoming[key];
  } catch {}
}


const SABI_AUDIO_ACCEPTED_MEMORY_MS = 60000;
const SABI_AUDIO_OFFER_LOCK_MS = 30000;

function rememberIncomingAudioAccepted(route: SabiAudioCallRouteCore) {
  try {
    const id = String(route.callId || "").trim();
    if (!id) return;
    const root = globalThis as any;
    const map = (root.__sabiAcceptedIncomingAudioCalls ||= {}) as Record<string, number>;
    map[id] = Date.now();
  } catch {}
}

function wasIncomingAudioAccepted(route: SabiAudioCallRouteCore) {
  try {
    const id = String(route.callId || "").trim();
    if (!id) return false;
    const root = globalThis as any;
    const map = (root.__sabiAcceptedIncomingAudioCalls || {}) as Record<string, number>;
    const at = Number(map[id] || 0);
    return at > 0 && Date.now() - at < SABI_AUDIO_ACCEPTED_MEMORY_MS;
  } catch {
    return false;
  }
}

function clearIncomingAudioAccepted(route: SabiAudioCallRouteCore) {
  try {
    const id = String(route.callId || "").trim();
    if (!id) return;
    const root = globalThis as any;
    const map = (root.__sabiAcceptedIncomingAudioCalls || {}) as Record<string, number>;
    delete map[id];
  } catch {}
}

function claimIncomingAudioOfferOnce(route: SabiAudioCallRouteCore) {
  try {
    const id = String(route.callId || "").trim();
    if (!id) return true;
    const root = globalThis as any;
    const map = (root.__sabiIncomingAudioOfferLocks ||= {}) as Record<string, number>;
    const now = Date.now();
    const last = Number(map[id] || 0);
    if (last > 0 && now - last < SABI_AUDIO_OFFER_LOCK_MS) return false;
    map[id] = now;
    return true;
  } catch {
    return true;
  }
}

function clearIncomingAudioOfferLock(route: SabiAudioCallRouteCore) {
  try {
    const id = String(route.callId || "").trim();
    if (!id) return;
    const root = globalThis as any;
    const map = (root.__sabiIncomingAudioOfferLocks || {}) as Record<string, number>;
    delete map[id];
  } catch {}
}

function claimIncomingAudioPeerOwner(route: SabiAudioCallRouteCore, ownerId: string, force = false) {
  try {
    const id = String(route.callId || "").trim();
    if (!id || !ownerId) return true;
    const root = globalThis as any;
    const map = (root.__sabiIncomingAudioPeerOwners ||= {}) as Record<string, { ownerId: string; at: number }>;
    const now = Date.now();
    const current = map[id];
    if (!force && current?.ownerId && current.ownerId !== ownerId && now - Number(current.at || 0) < SABI_AUDIO_OFFER_LOCK_MS) {
      return false;
    }
    map[id] = { ownerId, at: now };
    return true;
  } catch {
    return true;
  }
}

function isIncomingAudioPeerOwner(route: SabiAudioCallRouteCore, ownerId: string) {
  try {
    const id = String(route.callId || "").trim();
    if (!id || !ownerId) return true;
    const root = globalThis as any;
    const map = (root.__sabiIncomingAudioPeerOwners || {}) as Record<string, { ownerId: string; at: number }>;
    return map[id]?.ownerId === ownerId;
  } catch {
    return true;
  }
}

function releaseIncomingAudioPeerOwner(route: SabiAudioCallRouteCore, ownerId: string) {
  try {
    const id = String(route.callId || "").trim();
    if (!id || !ownerId) return;
    const root = globalThis as any;
    const map = (root.__sabiIncomingAudioPeerOwners || {}) as Record<string, { ownerId: string; at: number }>;
    if (map[id]?.ownerId === ownerId) delete map[id];
  } catch {}
}

function baseCallId(callId: string) {
  const parts = String(callId || "").split(":");
  return parts.length >= 5 && parts[0] === "call" ? parts.slice(0, 5).join(":") : String(callId || "");
}

function sabiCallPayloadTimeMs(payload: unknown): number {
  try {
    const body = payload && typeof payload === "object" ? (payload as Record<string, unknown>) : {};
    const nested = body.payload && typeof body.payload === "object" ? (body.payload as Record<string, unknown>) : {};
    const data = body.data && typeof body.data === "object" ? (body.data as Record<string, unknown>) : {};
    const message = body.message && typeof body.message === "object" ? (body.message as Record<string, unknown>) : {};
    const raw = body.timestamp ?? body.sentAt ?? body.at ?? body.relayAt ?? nested.timestamp ?? nested.sentAt ?? nested.at ?? data.timestamp ?? data.sentAt ?? data.at ?? message.timestamp ?? message.sentAt ?? message.at;
    if (typeof raw === "number" && Number.isFinite(raw)) return raw;
    if (typeof raw === "string" && raw.trim()) {
      const parsed = Number(raw);
      if (Number.isFinite(parsed) && parsed > 1000000000) return parsed;
      const time = Date.parse(raw);
      if (Number.isFinite(time)) return time;
    }
  } catch {}
  return 0;
}

function isStaleSabiCallSignal(payload: unknown, maxAgeMs = 12000): boolean {
  const at = sabiCallPayloadTimeMs(payload);
  return at > 0 && Date.now() - at > maxAgeMs;
}


function sabiAudioAsRecord(value: unknown): Record<string, any> {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, any>) : {};
}

function sabiAudioPayloadRecords(payload: unknown): Record<string, any>[] {
  const body = sabiAudioAsRecord(payload);
  const nested = sabiAudioAsRecord(body.payload);
  const data = sabiAudioAsRecord(body.data);
  const message = sabiAudioAsRecord(body.message);
  return [body, nested, data, message].filter((item) => Object.keys(item).length > 0);
}

function sabiAudioFirstPayloadText(payload: unknown, ...keys: string[]) {
  for (const record of sabiAudioPayloadRecords(payload)) {
    for (const key of keys) {
      const value = record[key];
      if (typeof value === "string" && value.trim()) return value.trim();
      if (typeof value === "number" && Number.isFinite(value)) return String(value);
      if (typeof value === "boolean") return value ? "true" : "false";
    }
  }
  return "";
}

function sabiAudioRemoteSignalDedupeKey(route: { callId?: string }, kind: string, payload: unknown) {
  const body = sabiAudioAsRecord(payload);
  const nested = sabiAudioAsRecord(body.payload);
  const data = sabiAudioAsRecord(body.data);
  const message = sabiAudioAsRecord(body.message);
  const description = sabiAudioAsRecord(body.description || nested.description || data.description || message.description);
  const candidate = sabiAudioAsRecord(body.candidate || nested.candidate || data.candidate || message.candidate);
  const callId = sabiAudioFirstPayloadText(payload, "callId", "callID", "id", "baseCallId") || String(route.callId || "");
  const from = sabiAudioFirstPayloadText(payload, "fromUserId", "from", "senderId", "senderUserId", "callerId", "userId");
  const to = sabiAudioFirstPayloadText(payload, "toUserId", "to", "receiverId", "receiverUserId", "peerId");
  const sdp = String(description.sdp || sabiAudioFirstPayloadText(payload, "sdp") || "").slice(0, 220);
  const candidateText = String(candidate.candidate || sabiAudioFirstPayloadText(payload, "candidate") || "").slice(0, 220);
  return [kind, baseCallId(callId), from, to, String(description.type || ""), sdp, candidateText].join("|");
}


function stableAudioParamsKey(params: Record<string, unknown>) {
  try {
    return Object.keys(params || {})
      .sort()
      .map((key) => {
        const value = (params as Record<string, unknown>)[key];
        const normalized = Array.isArray(value) ? value.join(",") : String(value ?? "");
        return `${key}=${normalized}`;
      })
      .join("&");
  } catch {
    return "";
  }
}

const AUDIO_EVENTS = [
  "call:accepted", "call:accept", "sabi-call:accept", "sabi-call:accepted", "audio:call:accept", "audio-call:accepted",
  "call:webrtc:offer", "call:webrtc:answer", "call:webrtc:ice", "call:signal", "call_signal", "call:webrtc:signal", "sabi-call:signal", "audio:call:signal", "audio-call:signal", "call.signal",
  "call:ended", "call:end", "call:declined", "call:missed", "call:cancelled", "call:busy", "sabi-call:ended", "sabi-call:end", "sabi-call:declined", "sabi-call:missed", "sabi-call:cancelled", "sabi-call:busy",
  "call:connected", "call:active", "sabi-call:connected", "sabi-call:active",
];

export default function AudioCallScreen() {
  const { t } = useI18n();
  const params = useLocalSearchParams();
  const paramsKey = stableAudioParamsKey(params as Record<string, unknown>);
  const parsedRoute = useMemo(() => parseStandardCallRoute(params as Record<string, unknown>, "audio"), [paramsKey]);

  const outgoingSessionCallIdRef = useRef<string | null>(null);
  const route = useMemo(() => {
    if (parsedRoute.incoming) return parsedRoute;

    const rawCallId = String(parsedRoute.callId || "").trim();

    // AUDIO-ONE-SESSION-LOCK:
    // Some navigation/remount paths already pass a freshly generated callId.
    // Do not trust every new outgoing route callId. During one active 1v1
    // audio attempt we must keep exactly one callId, otherwise the caller
    // emits several incoming events and the callee hears several melodies.
    const stableCallId = getOrCreateStableOutgoingAudioCallId(parsedRoute, rawCallId);
    outgoingSessionCallIdRef.current = stableCallId;
    return { ...parsedRoute, callId: stableCallId };
  }, [parsedRoute]);

  const socket = useMemo(() => getSuperAppSocket(route.userId || undefined), [route.userId]);

  const routeShouldAutoClose = useMemo(() => {
    // CALLS-3.3:
    // Do not auto-close incoming routes here. The previous duplicate-route guard
    // could close the real visible incoming screen and make the call fall
    // immediately. Incoming duplicates are handled by signal/offer locks instead.
    if (!route.incoming && wasCallJustFinished(route)) return true;
    return false;
  }, [route]);

  const [phase, setPhase] = useState<StandardCallPhase>(routeShouldAutoClose ? "ended" : route.incoming ? "ringing" : "calling");
  const [seconds, setSeconds] = useState(0);
  const [micEnabled, setMicEnabled] = useState(true);
  const [speakerEnabled, setSpeakerEnabled] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [localStream, setLocalStream] = useState<any | null>(null);
  const [remoteStream, setRemoteStream] = useState<any | null>(null);

  const peerRef = useRef<PeerHandle | null>(null);
  const incomingPeerOwnerIdRef = useRef(`audio-owner-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`);
  const mountedRef = useRef(true);
  const finishedRef = useRef(false);
  const acceptedRef = useRef(false);
  const inviteSentRef = useRef(false);
  const offerStartedRef = useRef(false);
  const handlingOfferRef = useRef(false);
  const roomJoinSentRef = useRef(false);
  const activeStartedAtRef = useRef<number | null>(null);
  const seenRef = useRef(new Set<string>());
  const remoteSignalDedupeRef = useRef(new Set<string>());
  const prewarmStartedRef = useRef(false);
  const pendingOfferRef = useRef<unknown | null>(null);
  const pendingRemoteIcePayloadsRef = useRef<unknown[]>([]);
  const acceptedFallbackOfferTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const postAcceptFlushTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useSabiCallTone({
    enabled: !routeShouldAutoClose && !finishedRef.current && (phase === "calling" || phase === "ringing"),
    mode: phase === "calling" ? "outgoing" : phase === "ringing" ? "incoming" : "none",
    callId: route.callId,
  });

  const callDebug = useCallback((stage: string, details: Record<string, unknown> = {}) => {
    logSabiCallDebug(route, "screen:" + stage, details);
  }, [route]);

  const shouldProcess = useCallback((eventName: string, payload: unknown) => {
    const key = makeSignalKey(eventName, payload);
    if (!key || seenRef.current.has(key)) return false;
    seenRef.current.add(key);
    if (seenRef.current.size > 160) seenRef.current = new Set(Array.from(seenRef.current).slice(-80));
    return true;
  }, []);

  const shouldProcessRemoteSignal = useCallback((kind: string, payload: unknown) => {
    const key = sabiAudioRemoteSignalDedupeKey(route, kind, payload);
    if (!key || remoteSignalDedupeRef.current.has(key)) return false;
    remoteSignalDedupeRef.current.add(key);
    if (remoteSignalDedupeRef.current.size > 220) {
      remoteSignalDedupeRef.current = new Set(Array.from(remoteSignalDedupeRef.current).slice(-120));
    }
    return true;
  }, [route]);

  const emitFast = useCallback((eventName: string, payload: Record<string, unknown>) => {
    const body = makeCallPayload(route, payload);
    emitSabiCallTransportEvent(socket, eventName, body);
  }, [route, socket]);

  const ensurePeer = useCallback(() => {
    if (peerRef.current) return peerRef.current;
    callDebug("peer:create");
    peerRef.current = createStandardCallPeer({
      route,
      socket,
      initialVideoEnabled: false,
      initialCameraFacing: "user",
      canStartCaller: () => !finishedRef.current,
      onLocalStream: setLocalStream,
      onRemoteStream: (stream) => {
        if (finishedRef.current) return;
        setRemoteStream(stream);
        if (stream) {
          markAudioCallGloballyActive(route.callId, "remote_stream");
          activeStartedAtRef.current ||= Date.now();
          void stopSabiCallToneNow();
          setPhase("active");
        }
      },
      onConnected: () => {
        if (!mountedRef.current || finishedRef.current) return;
        markAudioCallGloballyActive(route.callId, "peer_connected");
        activeStartedAtRef.current ||= Date.now();
        void stopSabiCallToneNow();
        setPhase("active");
      },
      onError: (message) => {
        callDebug("peer:error", { message });
        if (!finishedRef.current) setPhase("connecting");
      },
    });
    rememberActiveAudioPeer(route.callId, peerRef.current);
    void peerRef.current.setSpeakerEnabled(speakerEnabled);
    void peerRef.current.setMicEnabled(micEnabled);
    return peerRef.current;
  }, [callDebug, micEnabled, route, socket, speakerEnabled]);

  const flushPendingRemoteIcePayloads = useCallback((reason: string) => {
    const peer = peerRef.current;
    const queue = pendingRemoteIcePayloadsRef.current.splice(0, pendingRemoteIcePayloadsRef.current.length);
    if (!queue.length) return;

    if (!peer) {
      pendingRemoteIcePayloadsRef.current.unshift(...queue.slice(-40));
      callDebug("ice:flush_waiting_peer", { reason, count: queue.length });
      return;
    }

    callDebug("ice:flush_screen_queue", { reason, count: queue.length });
    queue.forEach((payload) => {
      try { void peer.handleIce(payload); } catch {}
    });
  }, [callDebug]);

  const startOfferOnce = useCallback((reason = "start", options: { keepTone?: boolean } = {}) => {
    if (finishedRef.current || offerStartedRef.current) return;
    offerStartedRef.current = true;
    setPhase(options.keepTone ? "calling" : "connecting");
    callDebug("startOfferOnce", { reason, keepTone: Boolean(options.keepTone) });
    if (!options.keepTone) void stopSabiCallToneNow();
    void ensurePeer().startCaller();
  }, [callDebug, ensurePeer]);

  const clearAcceptedFallbackOfferTimer = useCallback(() => {
    const timer = acceptedFallbackOfferTimerRef.current;
    if (!timer) return;
    acceptedFallbackOfferTimerRef.current = null;
    clearTimeout(timer);
  }, []);

  const clearPostAcceptFlushTimer = useCallback(() => {
    const timer = postAcceptFlushTimerRef.current;
    if (!timer) return;
    postAcceptFlushTimerRef.current = null;
    clearTimeout(timer);
  }, []);

  const schedulePostAcceptFlush = useCallback((reason: string) => {
    clearPostAcceptFlushTimer();
    postAcceptFlushTimerRef.current = setTimeout(() => {
      postAcceptFlushTimerRef.current = null;
      if (finishedRef.current) return;
      flushPendingRemoteIcePayloads(reason);
    }, 0);
  }, [clearPostAcceptFlushTimer, flushPendingRemoteIcePayloads]);

  const scheduleOutgoingAcceptedFallbackOffer = useCallback((reason = "accepted_without_peer_offer") => {
    if (route.incoming || finishedRef.current || offerStartedRef.current) return;
    clearAcceptedFallbackOfferTimer();
    acceptedFallbackOfferTimerRef.current = setTimeout(() => {
      acceptedFallbackOfferTimerRef.current = null;
      if (route.incoming || finishedRef.current || offerStartedRef.current || peerRef.current) return;
      callDebug("accepted:fallback_offer:start", { reason });
      startOfferOnce("accepted_outgoing_fallback_offer", { keepTone: false });
    }, 350);
  }, [callDebug, clearAcceptedFallbackOfferTimer, route.incoming, startOfferOnce]);

  const finishLocal = useCallback((reason: string) => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    rememberFinishedCall(route);
    if (route.incoming) {
      releaseIncomingAudioRoute(route);
      releaseIncomingAudioPeerOwner(route, incomingPeerOwnerIdRef.current);
      clearIncomingAudioPrewarmStarted(route.callId);
    }
    clearIncomingAudioAccepted(route);
    clearIncomingAudioOfferLock(route);
    if (!route.incoming) {
      clearOutgoingAudioInviteSent(route.callId);
      clearOutgoingAudioPrewarmStarted(route.callId);
      releaseStableOutgoingAudioCall(route);
    }
    clearAcceptedFallbackOfferTimer();
    clearPostAcceptFlushTimer();
    pendingOfferRef.current = null;
    pendingRemoteIcePayloadsRef.current = [];
    clearAudioCallGloballyActive(route.callId);
    void stopSabiCallToneForCall(route.callId);
    setPhase("ended");
    setMinimized(false);
    callDebug("finish", { reason });

    const payload = makeCallPayload(route, {
      event: reason === "declined" ? "declined" : "ended",
      action: reason === "declined" ? "declined" : "ended",
      phase: "ended",
      status: reason === "declined" ? "declined" : "ended",
      endReason: reason,
      signalKind: "ended",
    });

    emitSabiCallTransportEvent(socket, "call:end", payload);

    closeActiveAudioPeer(route.callId, peerRef.current);
    peerRef.current?.close();
    peerRef.current = null;
    stopStream(localStream);
    stopStream(remoteStream);
    setLocalStream(null);
    setRemoteStream(null);
    closeCallRoute();
  }, [callDebug, clearAcceptedFallbackOfferTimer, clearPostAcceptFlushTimer, localStream, remoteStream, route, socket]);

  const accept = useCallback(() => {
    if (!route.incoming || acceptedRef.current || finishedRef.current) return;
    acceptedRef.current = true;
    rememberIncomingAudioAccepted(route);
    void stopSabiCallToneNow();
    setPhase("connecting");
    if (route.incoming) {
      // CALLS-3.8 DELAY-ONLY-SAFE:
      // On repeat calls Android can keep a hidden duplicate incoming route alive.
      // The visible route that the user accepts becomes the only WebRTC owner,
      // so we do not create pc2 + pc3 and we do not wait on two getUserMedia calls.
      const wasOwner = isIncomingAudioPeerOwner(route, incomingPeerOwnerIdRef.current);
      if (!wasOwner) closeActiveAudioPeer(route.callId, null);
      claimIncomingAudioPeerOwner(route, incomingPeerOwnerIdRef.current, true);
    }

    const payload = makeCallPayload(route, {
      event: "accepted",
      action: "accepted",
      phase: "connecting",
      status: "connecting",
      signalKind: "accepted",
    });

    callDebug("accept:emit", summarizeSabiCallPayloadForDebug(payload));
    emitSabiCallTransportEvent(socket, "call:accepted", payload);
    // AUDIO-FAST-ACCEPT: generic call:signal is the same fast path used by
    // WebRTC offer/answer/ice. Send accepted there too; dedupe keeps it one
    // logical accept, but the caller does not wait several seconds for the
    // slower accepted alias on some devices.
    emitSabiCallTransportEvent(socket, "call:signal", payload);

    const pendingOffer = pendingOfferRef.current;
    pendingOfferRef.current = null;
    if (pendingOffer) {
      if (!isIncomingAudioPeerOwner(route, incomingPeerOwnerIdRef.current)) {
        callDebug("accept:pending_offer_wait_global_owner");
        return;
      }
      if (!peerRef.current && !claimIncomingAudioOfferOnce(route)) {
        callDebug("accept:pending_offer_ignored_duplicate_owner");
        return;
      }
      handlingOfferRef.current = true;
      void ensurePeer().handleOffer(pendingOffer).then(() => {
        if (finishedRef.current) return;
        markAudioCallGloballyActive(route.callId, "accepted_pending_offer_answered");
        activeStartedAtRef.current ||= Date.now();
        void stopSabiCallToneNow();
        setPhase("active");
      }).finally(() => {
        handlingOfferRef.current = false;
        flushPendingRemoteIcePayloads("after_accept_pending_offer");
      });
      return;
    }

    // AUDIO-GLARE-LOCK:
    // The callee must not create its own offer immediately after Accept.
    // Only the caller creates the initial offer after it receives accepted.
    // This prevents double-offer glare and keeps one ringtone / one session.
  }, [callDebug, ensurePeer, flushPendingRemoteIcePayloads, route, socket]);

  const toggleMic = useCallback(() => {
    if (finishedRef.current || phase === "ended") return;
    const next = !micEnabled;
    setMicEnabled(next);
    void peerRef.current?.setMicEnabled(next);
  }, [micEnabled, phase]);

  const toggleSpeaker = useCallback(() => {
    if (finishedRef.current || phase === "ended") return;
    const next = !speakerEnabled;
    setSpeakerEnabled(next);
    // audioCallRuntime already applies the native audio route and performs
    // its own short retry. Do not schedule extra screen-level retries here:
    // repeated route changes were delaying audio path activation and could
    // make audio feel one-sided on some Android devices.
    void peerRef.current?.setSpeakerEnabled(next);
  }, [phase, speakerEnabled]);

  const prewarmOutgoingAudio = useCallback((reason: string) => {
    if (route.incoming || finishedRef.current || prewarmStartedRef.current) return;
    if (markOutgoingAudioPrewarmStarted(route.callId)) {
      callDebug("audio:prewarm:skip:already_started", { reason, callId: route.callId });
      return;
    }
    prewarmStartedRef.current = true;
    callDebug("audio:prewarm:start", { reason });
    void ensurePeer().prepareAudio().then(() => {
      // CALLS-3.4: create/send the first offer during ringback after the
      // microphone is ready. The callee queues the offer until Accept. This
      // removes the accepted -> offer delivery delay on both first and repeat
      // calls without creating a second offer after Accept.
      if (!route.incoming && !finishedRef.current && !acceptedRef.current && !offerStartedRef.current) {
        startOfferOnce("ringback_preaccept_offer", { keepTone: true });
      }
    }).catch(() => {});
  }, [callDebug, ensurePeer, route.callId, route.incoming, startOfferOnce]);

  const prewarmIncomingAudio = useCallback((reason: string) => {
    if (!route.incoming || finishedRef.current || prewarmStartedRef.current || acceptedRef.current) return;
    if (!claimIncomingAudioPeerOwner(route, incomingPeerOwnerIdRef.current, false)) {
      callDebug("audio:incoming_prewarm:skip:not_owner", { reason, callId: route.callId });
      return;
    }
    if (markIncomingAudioPrewarmStarted(route.callId)) {
      callDebug("audio:incoming_prewarm:skip:already_started", { reason, callId: route.callId });
      return;
    }
    prewarmStartedRef.current = true;
    callDebug("audio:incoming_prewarm:start", { reason });
    // CALLS-3.7: prepare only the incoming microphone/peer while the phone is
    // ringing. Do not accept the call and do not send answer before the user
    // taps Accept. This removes the Accept -> getUserMedia delay without
    // changing WebRTC signaling or route ownership.
    void ensurePeer().prepareAudio().then(() => {
      if (!finishedRef.current) callDebug("audio:incoming_prewarm:ready", { reason });
    }).catch(() => {});
  }, [callDebug, ensurePeer, route, route.callId, route.incoming]);

  useEffect(() => {
    mountedRef.current = true;
    finishedRef.current = false;
    acceptedRef.current = false;
    inviteSentRef.current = false;
    offerStartedRef.current = false;
    handlingOfferRef.current = false;
    roomJoinSentRef.current = false;
    activeStartedAtRef.current = null;
    seenRef.current.clear();
    remoteSignalDedupeRef.current.clear();
    prewarmStartedRef.current = false;
    pendingOfferRef.current = null;
    pendingRemoteIcePayloadsRef.current = [];
    clearAcceptedFallbackOfferTimer();
    setPhase(routeShouldAutoClose ? "ended" : route.incoming ? "ringing" : "calling");
    setSeconds(0);
    setLocalStream(null);
    setRemoteStream(null);
    return () => {
      mountedRef.current = false;
      clearAcceptedFallbackOfferTimer();
      clearPostAcceptFlushTimer();
      pendingOfferRef.current = null;
      pendingRemoteIcePayloadsRef.current = [];
      void stopSabiCallToneNow();
      if (route.incoming) releaseIncomingAudioPeerOwner(route, incomingPeerOwnerIdRef.current);
      closeActiveAudioPeer(route.callId, peerRef.current);
      peerRef.current?.close();
      peerRef.current = null;
    };
  }, [clearAcceptedFallbackOfferTimer, clearPostAcceptFlushTimer, route.callId, route.incoming, routeShouldAutoClose]);

  useEffect(() => {
    if (routeShouldAutoClose) {
      callDebug(route.incoming ? "incoming:skip:duplicate_route" : "invite:skip:recently_finished", { callId: route.callId });
      void stopSabiCallToneForCall(route.callId);
      finishedRef.current = true;
      if (!route.incoming) {
        clearOutgoingAudioInviteSent(route.callId);
        clearOutgoingAudioPrewarmStarted(route.callId);
        releaseStableOutgoingAudioCall(route);
      }
      setPhase("ended");
      closeCallRoute();
      return undefined;
    }

    try { if (!socket.connected) socket.connect?.(); } catch {}

    const joinPayload = makeCallPayload(route, { event: "join", signalKind: "audio" });
    if (!roomJoinSentRef.current) {
      roomJoinSentRef.current = true;
      callDebug("room:join:emit", summarizeSabiCallPayloadForDebug(joinPayload));
      joinSabiCallTransportScopes(socket, joinPayload);
    }

    if (route.incoming && !finishedRef.current && !acceptedRef.current) {
      prewarmIncomingAudio("incoming_ringing_prepare_microphone_immediate");
    }

    if (!route.incoming && !inviteSentRef.current) {
      inviteSentRef.current = true;
      const alreadySentInvite = markOutgoingAudioInviteSent(route.callId);
      if (alreadySentInvite) {
        callDebug("invite:skip:already_sent", { callId: route.callId });
        setPhase("calling");
      } else {
        const payload = makeCallPayload(route, {
          event: "incoming",
          action: "incoming",
          phase: "ringing",
          status: "ringing",
          signalKind: "incoming",
        });
        callDebug("invite:start:emit", summarizeSabiCallPayloadForDebug(payload));
        emitSabiCallTransportEvent(socket, "call:incoming", payload);
        setPhase("calling");
        if (!finishedRef.current && !acceptedRef.current) {
          prewarmOutgoingAudio("ringback_prepare_microphone_immediate");
        }
      }
      // AUDIO-REPEAT-2.9:
      // A duplicate outgoing route for the same audio call must not start its
      // own microphone/peer prewarm. The accepted handler can still create the
      // offer when this screen is the visible one, but repeated screens will no
      // longer create parallel peers or several delayed WebRTC attempts.
      // CALLS-3.4: prewarm may create one pre-accept offer after microphone is ready.
      // The callee stores it until Accept; accepted handler only resends if needed.
    }

    return () => {
      leaveSabiCallTransportScopes(socket, makeCallPayload(route, { event: "leave", signalKind: "audio" }));
    };
  }, [callDebug, prewarmIncomingAudio, prewarmOutgoingAudio, route, routeShouldAutoClose, socket]);

  useEffect(() => {
    const handleAccepted = (payload: unknown, eventName = "call:accepted") => {
      if (route.incoming || finishedRef.current || wasCallJustFinished(route)) return;
      if (!payloadMatches(route, payload) || !isFromPeer(route, payload)) return;
      if (isStaleSabiCallSignal(payload)) {
        callDebug("accepted:ignored_stale", summarizeSabiCallPayloadForDebug(payload));
        return;
      }
      if (!shouldProcess(eventName, payload)) return;
      if (acceptedRef.current) return;
      callDebug("accepted:recv", summarizeSabiCallPayloadForDebug(payload));
      acceptedRef.current = true;
      void stopSabiCallToneNow();
      setPhase("connecting");
      if (offerStartedRef.current && peerRef.current) {
        // CALLS-3.5:
        // The pre-accept offer was already sent during ringback. Re-sending the
        // same local offer after Accept caused duplicate offer handling on the
        // callee and left the visible incoming screen in connecting on some
        // devices. Do not resend immediately; the callee already has the offer
        // queued or will receive the canonical call:webrtc:offer.
        callDebug("accepted:preoffer_already_sent_no_resend");
        schedulePostAcceptFlush("after_accepted_preoffer_no_resend");
        return;
      }
      startOfferOnce("accepted_outgoing_offer", { keepTone: false });
      schedulePostAcceptFlush("after_accepted_start_offer");
    };

    const handleOffer = (payload: unknown, alreadyDeduped = false) => {
      if (finishedRef.current) return;
      if (!payloadMatches(route, payload) || !isFromPeer(route, payload)) return;
      if (!alreadyDeduped && !shouldProcessRemoteSignal("offer", payload)) return;
      callDebug("offer:recv", summarizeSabiCallPayloadForDebug(payload));
      clearAcceptedFallbackOfferTimer();

      // Same rule as stable video-call: if the callee has not pressed Accept yet,
      // keep the offer pending. Do not start WebRTC/media before Accept. If the
      // incoming screen remounted after Accept, restore the accepted state by
      // callId so a late offer still creates exactly one answer.
      if (route.incoming && !acceptedRef.current && wasIncomingAudioAccepted(route)) {
        acceptedRef.current = true;
        callDebug("offer:accepted_restored", summarizeSabiCallPayloadForDebug(payload));
      }

      if (route.incoming && !acceptedRef.current) {
        pendingOfferRef.current = payload;
        return;
      }

      if (route.incoming && !peerRef.current && !isIncomingAudioPeerOwner(route, incomingPeerOwnerIdRef.current)) {
        callDebug("offer:ignored_not_peer_owner", summarizeSabiCallPayloadForDebug(payload));
        return;
      }

      if (route.incoming && !peerRef.current && !handlingOfferRef.current && !claimIncomingAudioOfferOnce(route)) {
        callDebug("offer:ignored_duplicate_owner", summarizeSabiCallPayloadForDebug(payload));
        return;
      }

      if (!route.incoming && !acceptedRef.current) {
        acceptedRef.current = true;
      }

      // Do not close a fresh/stable incoming audio peer. Old audio logic closed
      // the peer too aggressively and could restart microphone/signaling. Only
      // reset real stale glare states, same as the fixed video-call flow.
      if (route.incoming && acceptedRef.current && offerStartedRef.current) {
        const currentState = String(peerRef.current?.getSignalingState?.() || "");
        if (currentState === "have-local-offer" || currentState === "have-remote-pranswer") {
          offerStartedRef.current = false;
          try { peerRef.current?.close(); } catch {}
          peerRef.current = null;
        }
      }

      acceptedRef.current = true;
      void stopSabiCallToneNow();
      setPhase("connecting");
      if (handlingOfferRef.current) return;
      handlingOfferRef.current = true;
      void ensurePeer().handleOffer(payload).then(() => {
        if (finishedRef.current) return;
        // CALLS-3.6: after the callee successfully creates/sends answer, mark
        // this call globally active too. If a duplicate visible incoming route
        // is still mounted, it will sync its UI from this owner and leave the
        // "connecting" state.
        markAudioCallGloballyActive(route.callId, "offer_answered");
        activeStartedAtRef.current ||= Date.now();
        void stopSabiCallToneNow();
        setPhase("active");
      }).finally(() => {
        handlingOfferRef.current = false;
        flushPendingRemoteIcePayloads("after_handle_offer");
      });
    };

    const handleAnswer = (payload: unknown, alreadyDeduped = false) => {
      if (finishedRef.current) return;
      if (!payloadMatches(route, payload) || !isFromPeer(route, payload)) return;
      if (!alreadyDeduped && !shouldProcessRemoteSignal("answer", payload)) return;
      callDebug("answer:recv", summarizeSabiCallPayloadForDebug(payload));
      void stopSabiCallToneNow();
      if (!peerRef.current) {
        callDebug("answer:ignored_no_peer", summarizeSabiCallPayloadForDebug(payload));
        return;
      }
      const answerSignalingState = String(peerRef.current?.getSignalingState?.() || "");
      if (answerSignalingState === "stable") {
        // Duplicate answer can arrive after the first answer already applied.
        // Do not call setRemoteDescription again in stable state; it creates
        // the noisy "Called in wrong state: stable" error and can delay repeat calls.
        callDebug("answer:ignored_already_stable", summarizeSabiCallPayloadForDebug(payload));
        markAudioCallGloballyActive(route.callId, "duplicate_answer_stable");
        activeStartedAtRef.current ||= Date.now();
        void stopSabiCallToneNow();
        setPhase("active");
        return;
      }

      void peerRef.current.handleAnswer(payload).then(() => {
        if (finishedRef.current) return;
        markAudioCallGloballyActive(route.callId, "answer_applied");
        activeStartedAtRef.current ||= Date.now();
        void stopSabiCallToneNow();
        setPhase("active");
      }).finally(() => flushPendingRemoteIcePayloads("after_handle_answer"));
    };

    const handleIce = (payload: unknown, alreadyDeduped = false) => {
      if (finishedRef.current) return;
      if (!payloadMatches(route, payload) || !isFromPeer(route, payload)) return;
      if (!alreadyDeduped && !shouldProcessRemoteSignal("ice", payload)) return;
      callDebug("ice:recv", summarizeSabiCallPayloadForDebug(payload));
      const peer = peerRef.current;
      if (!peer) {
        pendingRemoteIcePayloadsRef.current.push(payload);
        if (pendingRemoteIcePayloadsRef.current.length > 40) {
          pendingRemoteIcePayloadsRef.current.splice(0, pendingRemoteIcePayloadsRef.current.length - 40);
        }
        callDebug("ice:queued_before_peer", { pendingIce: pendingRemoteIcePayloadsRef.current.length });
        return;
      }

      void peer.handleIce(payload);
    };

    const handleEnded = (payload: unknown, eventName = "call:end") => {
      if (finishedRef.current) return;
      if (!payloadMatches(route, payload) || !isFromPeer(route, payload)) return;
      if (!isRealCallEndPayload(payload)) return;
      if (!shouldProcess(eventName, payload)) return;
      callDebug("ended:recv", summarizeSabiCallPayloadForDebug(payload));
      finishedRef.current = true;
      rememberFinishedCall(route);
      if (route.incoming) {
        releaseIncomingAudioRoute(route);
        releaseIncomingAudioPeerOwner(route, incomingPeerOwnerIdRef.current);
        clearIncomingAudioPrewarmStarted(route.callId);
      }
      clearIncomingAudioAccepted(route);
      clearIncomingAudioOfferLock(route);
      if (!route.incoming) {
        clearOutgoingAudioInviteSent(route.callId);
      }
      clearAcceptedFallbackOfferTimer();
      clearPostAcceptFlushTimer();
      pendingOfferRef.current = null;
      pendingRemoteIcePayloadsRef.current = [];
      clearAudioCallGloballyActive(route.callId);
      void stopSabiCallToneForCall(route.callId);
      closeActiveAudioPeer(route.callId, peerRef.current);
      peerRef.current?.close();
      peerRef.current = null;
      stopStream(localStream);
      stopStream(remoteStream);
      setLocalStream(null);
      setRemoteStream(null);
      setPhase("ended");
      setMinimized(false);
      closeCallRoute();
    };

    const handleConnected = (payload: unknown, eventName = "call:connected") => {
      if (finishedRef.current) return;
      if (!payloadMatches(route, payload) || !isFromPeer(route, payload)) return;
      if (!shouldProcess(eventName, payload)) return;
      callDebug("connected:recv", summarizeSabiCallPayloadForDebug(payload));
      clearAcceptedFallbackOfferTimer();
      void stopSabiCallToneNow();
      markAudioCallGloballyActive(route.callId, "connected_signal");
      activeStartedAtRef.current ||= Date.now();
      setPhase("active");
    };

    const handleSignal = (payload: unknown, eventName = "call:signal") => {
      const kind = getSabiCallTransportSignalKind(eventName, payload);
      if (kind === "accepted") {
        if (!shouldProcessRemoteSignal("accepted", payload)) return;
        callDebug("signal:recv", { signalKind: "accepted", ...summarizeSabiCallPayloadForDebug(payload) });
        handleAccepted(payload, "call:signal:accepted");
        return;
      }
      if (kind === "offer") {
        if (!shouldProcessRemoteSignal("offer", payload)) return;
        callDebug("signal:recv", { signalKind: "offer", ...summarizeSabiCallPayloadForDebug(payload) });
        handleOffer(payload, true);
        return;
      }
      if (kind === "answer") {
        if (!shouldProcessRemoteSignal("answer", payload)) return;
        callDebug("signal:recv", { signalKind: "answer", ...summarizeSabiCallPayloadForDebug(payload) });
        handleAnswer(payload, true);
        return;
      }
      if (kind === "ice") {
        if (!shouldProcessRemoteSignal("ice", payload)) return;
        callDebug("signal:recv", { signalKind: "ice", ...summarizeSabiCallPayloadForDebug(payload) });
        handleIce(payload, true);
      }
    };

    const acceptedEvents = [
      "call:accepted",
      "call:accept",
      "sabi-call:accepted",
      "sabi-call:accept",
      "audio:call:accept",
      "audio-call:accepted",
    ];
    const signalEvents = [
      "call:webrtc:offer",
      "call:webrtc:answer",
      "call:webrtc:ice",
      "call:signal",
      "call_signal",
      "sabi-call:signal",
      "audio:call:signal",
      "audio-call:signal",
      "call.signal",
    ];
    const connectedEvents = [
      "call:connected",
      "call:active",
      "sabi-call:connected",
      "sabi-call:active",
    ];
    const endedEvents = [
      "call:ended",
      "call:end",
      "call:declined",
      "call:missed",
      "call:cancelled",
      "call:busy",
      "sabi-call:ended",
      "sabi-call:end",
      "sabi-call:declined",
      "sabi-call:missed",
      "sabi-call:cancelled",
      "sabi-call:busy",
    ];

    const unsubscribeAccepted = subscribeSabiCallTransportEvents(
      socket,
      acceptedEvents,
      (payload, eventName) => handleAccepted(payload, eventName),
      { currentUserId: route.userId, callId: route.callId },
    );
    const unsubscribeSignal = subscribeSabiCallTransportEvents(
      socket,
      signalEvents,
      (payload, eventName) => handleSignal(payload, eventName),
      { currentUserId: route.userId, callId: route.callId },
    );
    const unsubscribeConnected = subscribeSabiCallTransportEvents(
      socket,
      connectedEvents,
      (payload, eventName) => handleConnected(payload, eventName),
      { currentUserId: route.userId, callId: route.callId },
    );
    const unsubscribeEnded = subscribeSabiCallTransportEvents(
      socket,
      endedEvents,
      (payload, eventName) => handleEnded(payload, eventName),
      { currentUserId: route.userId, callId: route.callId },
    );

    return () => {
      unsubscribeAccepted();
      unsubscribeSignal();
      unsubscribeConnected();
      unsubscribeEnded();
    };
  }, [callDebug, clearAcceptedFallbackOfferTimer, clearPostAcceptFlushTimer, ensurePeer, flushPendingRemoteIcePayloads, localStream, remoteStream, route, schedulePostAcceptFlush, shouldProcess, shouldProcessRemoteSignal, socket, startOfferOnce]);

  useEffect(() => {
    if (phase === "active" || phase === "ended" || finishedRef.current) return undefined;

    const applyGlobalActive = () => {
      if (finishedRef.current) return;
      if (!isAudioCallGloballyActive(route.callId)) return;
      callDebug("active:sync_from_global_owner");
      activeStartedAtRef.current ||= Date.now();
      void stopSabiCallToneNow();
      setPhase("active");
    };

    applyGlobalActive();
    const timer = setInterval(applyGlobalActive, 150);
    return () => clearInterval(timer);
  }, [callDebug, phase, route.callId]);

  useEffect(() => {
    if (phase !== "active") return undefined;
    activeStartedAtRef.current ||= Date.now();
    const timer = setInterval(() => {
      const startedAt = activeStartedAtRef.current || Date.now();
      setSeconds(Math.max(0, Math.floor((Date.now() - startedAt) / 1000)));
    }, 1000);
    return () => clearInterval(timer);
  }, [phase]);

  const title = route.name || "Sabi";
  const avatarUrl = String((route as any).avatarUrl || (route as any).photoUrl || "").trim();
  const avatarLetter = String(route.avatarLetter || title[0] || "S").slice(0, 1).toUpperCase();
  const timeLabel = `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
  const statusText = phase === "active"
    ? timeLabel
    : phase === "ringing"
      ? t("calls.incoming")
      : phase === "connecting"
        ? t("calls.connecting")
        : phase === "ended"
          ? t("calls.ended")
          : t("calls.calling");

  if (routeShouldAutoClose) {
    return <View style={styles.silentCloseScreen} />;
  }

  if (minimized) {
    return (
      <View style={styles.minimizedScreen}>
        <Pressable style={styles.miniCard} onPress={() => setMinimized(false)}>
          <View style={styles.miniAvatar}>
            {avatarUrl ? <Image source={{ uri: avatarUrl }} style={styles.miniAvatarPhoto} /> : <Text style={styles.miniAvatarText}>{avatarLetter}</Text>}
          </View>
          <View style={styles.miniTextBox}>
            <Text style={styles.miniName} numberOfLines={1}>{title}</Text>
            <Text style={styles.miniStatus} numberOfLines={1}>{statusText}</Text>
          </View>
          <Pressable style={styles.miniHangup} onPress={() => finishLocal("local_end")}>
            <MaterialCommunityIcons name="phone-hangup" size={22} color="#FFFFFF" />
          </Pressable>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <View style={styles.waitingBackdrop}>
        <View style={styles.patternOne} />
        <View style={styles.patternTwo} />
        <View style={styles.avatarImage}>
          {avatarUrl ? <Image source={{ uri: avatarUrl }} style={styles.avatarPhoto} /> : <Text style={styles.avatarText}>{avatarLetter}</Text>}
        </View>
      </View>

      <View style={styles.topBar}>
        <Pressable style={styles.topCircle} onPress={() => setMinimized(true)}>
          <MaterialCommunityIcons name="arrow-collapse-all" size={24} color="#FFFFFF" />
        </Pressable>
        <View style={styles.titleBox}>
          <Text style={styles.name} numberOfLines={1}>{title}</Text>
          <Text style={styles.secure} numberOfLines={1}>
            <MaterialCommunityIcons name="lock" size={13} color="rgba(255,255,255,0.70)" /> {statusText}
          </Text>
        </View>
        <View style={styles.topCircle} pointerEvents="none" />
      </View>

      <View style={styles.statusBox}>
        <Text style={styles.statusText}>{statusText}</Text>
      </View>

      {route.incoming && phase === "ringing" ? (
        <View style={styles.acceptLayer}>
          <Pressable style={styles.acceptButton} onPress={accept}>
            <MaterialCommunityIcons name="phone" size={28} color="#FFFFFF" />
            <Text style={styles.acceptText}>{t("calls.accept")}</Text>
          </Pressable>
          <Pressable style={styles.declineButton} onPress={() => finishLocal("declined")}>
            <MaterialCommunityIcons name="phone-hangup" size={28} color="#FFFFFF" />
            <Text style={styles.acceptText}>{t("calls.decline")}</Text>
          </Pressable>
        </View>
      ) : null}

      <View style={styles.dock}>
        <Pressable style={[styles.dockButton, !micEnabled ? styles.dockButtonDim : null]} onPress={toggleMic}>
          <MaterialCommunityIcons name={micEnabled ? "microphone" : "microphone-off"} size={24} color="#FFFFFF" />
        </Pressable>
        <Pressable style={[styles.dockButton, styles.dockButtonLight, speakerEnabled ? null : styles.dockButtonDim]} onPress={toggleSpeaker}>
          <MaterialCommunityIcons name="volume-high" size={24} color="#FFFFFF" />
        </Pressable>
        <Pressable style={[styles.dockButton, styles.dockButtonDanger]} onPress={() => finishLocal(route.incoming && phase === "ringing" ? "declined" : "local_end")}>
          <MaterialCommunityIcons name="phone-hangup" size={26} color="#FFFFFF" />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  silentCloseScreen: { flex: 1, backgroundColor: "transparent" },
  screen: { flex: 1, backgroundColor: "#05070F", overflow: "hidden" },
  waitingBackdrop: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#07130F",
  },
  patternOne: {
    position: "absolute",
    width: 360,
    height: 360,
    borderRadius: 180,
    backgroundColor: "rgba(37,211,102,0.16)",
    top: 72,
    right: -110,
  },
  patternTwo: {
    position: "absolute",
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: "rgba(74,144,226,0.12)",
    bottom: 88,
    left: -120,
  },
  avatarImage: {
    width: 178,
    height: 178,
    borderRadius: 89,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.14)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.22)",
    overflow: "hidden",
  },
  avatarPhoto: { width: "100%", height: "100%" },
  avatarText: { color: "#FFFFFF", fontSize: 70, fontWeight: "900" },
  topBar: {
    position: "absolute",
    top: 42,
    left: 18,
    right: 18,
    height: 58,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    zIndex: 12,
  },
  topCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.34)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  titleBox: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 14 },
  name: { color: "#FFFFFF", fontSize: 20, fontWeight: "900", maxWidth: "100%" },
  secure: { color: "rgba(255,255,255,0.72)", fontSize: 13, fontWeight: "800", marginTop: 4 },
  statusBox: {
    position: "absolute",
    top: "58%",
    left: 24,
    right: 24,
    alignItems: "center",
    zIndex: 11,
  },
  statusText: { color: "#FFFFFF", fontSize: 18, fontWeight: "900", textAlign: "center" },
  acceptLayer: {
    position: "absolute",
    left: 24,
    right: 24,
    bottom: 132,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 32,
    zIndex: 20,
  },
  acceptButton: {
    minWidth: 96,
    height: 76,
    borderRadius: 38,
    backgroundColor: "#25D366",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  declineButton: {
    minWidth: 96,
    height: 76,
    borderRadius: 38,
    backgroundColor: "#FF1744",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  acceptText: { color: "#FFFFFF", fontSize: 12, fontWeight: "900", marginTop: 3 },
  dock: {
    position: "absolute",
    left: 18,
    right: 18,
    bottom: 28,
    height: 82,
    borderRadius: 28,
    backgroundColor: "rgba(8,17,20,0.92)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 18,
    zIndex: 18,
  },
  dockButton: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "rgba(255,255,255,0.14)",
    alignItems: "center",
    justifyContent: "center",
  },
  dockButtonLight: { backgroundColor: "rgba(255,255,255,0.22)" },
  dockButtonDim: { opacity: 0.52 },
  dockButtonDanger: { backgroundColor: "#FF1744" },
  minimizedScreen: { flex: 1, backgroundColor: "rgba(0,0,0,0.2)", justifyContent: "flex-start", paddingTop: 54, paddingHorizontal: 18 },
  miniCard: {
    minHeight: 76,
    borderRadius: 24,
    backgroundColor: "rgba(8,17,20,0.98)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    gap: 12,
  },
  miniAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(37,211,102,0.35)",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  miniAvatarPhoto: { width: "100%", height: "100%" },
  miniAvatarText: { color: "#FFFFFF", fontSize: 20, fontWeight: "900" },
  miniTextBox: { flex: 1, minWidth: 0 },
  miniName: { color: "#FFFFFF", fontSize: 16, fontWeight: "900" },
  miniStatus: { color: "rgba(255,255,255,0.68)", fontSize: 13, fontWeight: "800", marginTop: 2 },
  miniHangup: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#FF1744",
    alignItems: "center",
    justifyContent: "center",
  },
});
