import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Image,
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { RTCView } from "react-native-webrtc";

import { useI18n } from "../../../shared/i18n";
import { getSuperAppSocket } from "../../../shared/realtime/superapp-socket";
import {
  emitSabiCallTransportEvent,
  joinSabiCallTransportScopes,
  leaveSabiCallTransportScopes,
  subscribeSabiCallTransportEvents,
} from "../callSignalTransport";
import { recordMessengerCallRealtimeEvent } from "../callEventsRuntime";
import {
  clock,
  createStandardCallPeer,
  isFromPeer,
  isRealCallEndPayload,
  logSabiCallDebug,
  makeCallPayload,
  makeSignalKey,
  parseStandardCallRoute,
  payloadMatches,
  summarizeSabiCallPayloadForDebug,
  type StandardCallKind,
  type StandardCallPhase,
} from "./videoCallRuntime";
import { stopSabiCallToneForCall, stopSabiCallToneNow, useSabiCallTone } from "../useSabiCallTone";

type PeerHandle = ReturnType<typeof createStandardCallPeer>;
type IconName = keyof typeof MaterialCommunityIcons.glyphMap;

const TEXTS = {
  en: {
    video: "Sabi Video",
    incoming: "Incoming call",
    calling: "Calling",
    connecting: "Connecting",
    connected: "Connected",
    ended: "Ended",
    secure: "Sabi secure call",
    waitingVideo: "Waiting for video",
    videoCall: "Video call",
    accept: "Accept",
    decline: "Decline",
    end: "End",
    mic: "Microphone",
    speaker: "Speaker",
    camera: "Camera",
    presentation: "Presentation",
    aiTranslate: "AI translation",
    minimize: "Minimize",
    swap: "Swap",
    more: "More",
  },
  ru: {
    video: "Sabi Video",
    incoming: "Входящий вызов",
    calling: "Вызов",
    connecting: "Соединение",
    connected: "Подключено",
    ended: "Завершено",
    secure: "Защищённая связь Sabi",
    waitingVideo: "Ожидание видео",
    videoCall: "Видео вызов",
    accept: "Принять",
    decline: "Отклонить",
    end: "Завершить",
    mic: "Микрофон",
    speaker: "Громкая связь",
    camera: "Камера",
    presentation: "Презентация",
    aiTranslate: "AI перевод",
    minimize: "Свернуть",
    swap: "Сменить",
    more: "Ещё",
  },
  uz: {
    video: "Sabi Video",
    incoming: "Kiruvchi qo‘ng‘iroq",
    calling: "Qo‘ng‘iroq qilinmoqda",
    connecting: "Ulanmoqda",
    connected: "Ulangan",
    ended: "Yakunlandi",
    secure: "Sabi himoyalangan aloqa",
    waitingVideo: "Video kutilmoqda",
    videoCall: "Video qo‘ng‘iroq",
    accept: "Qabul qilish",
    decline: "Rad etish",
    end: "Yakunlash",
    mic: "Mikrofon",
    speaker: "Ovoz",
    camera: "Kamera",
    presentation: "Prezentatsiya",
    aiTranslate: "AI tarjima",
    minimize: "Kichraytirish",
    swap: "Almashtirish",
    more: "Yana",
  },
} as const;

type TextKey = keyof typeof TEXTS.en;

type SabiCallEndMeta = {
  event: "ended" | "declined" | "missed" | "cancelled" | "busy";
  status: "ended" | "declined" | "missed" | "cancelled" | "busy";
  historyEvent: "call:ended" | "call:declined" | "call:missed" | "call:cancelled" | "call:busy";
  endReason: string;
};

const SABI_VIDEO_INCOMING_NO_ANSWER_TIMEOUT_MS = 30000;
const SABI_VIDEO_OUTGOING_NO_ANSWER_TIMEOUT_MS = 30000;
const SABI_VIDEO_INCOMING_PREWARM_DELAY_MS = 220;
const SABI_VIDEO_INVITE_RETRY_DELAYS_MS: readonly number[] = [420, 950, 1500] as const;

function sabiPayloadText(...values: unknown[]): string {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) return value.trim();
    if (typeof value === "number" && Number.isFinite(value)) return String(value);
    if (typeof value === "boolean") return value ? "true" : "false";
  }

  return "";
}

function getSabiCallPayloadEvent(payload: unknown): string {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) return "";

  const body = payload as Record<string, unknown>;

  return [
    sabiPayloadText(body.event),
    sabiPayloadText(body.action),
    sabiPayloadText(body.signalKind),
    sabiPayloadText(body.phase),
    sabiPayloadText(body.status),
  ]
    .join(" ")
    .toLowerCase();
}

function isSabiCameraOffSignal(payload: unknown): boolean {
  const text = getSabiCallPayloadEvent(payload);
  return text.includes("camera_off") || text.includes("video_off");
}

function isSabiCameraOnSignal(payload: unknown): boolean {
  const text = getSabiCallPayloadEvent(payload);
  return text.includes("camera_on") || text.includes("video_on");
}

function sabiVideoPayloadRecords(payload: unknown): Record<string, unknown>[] {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) return [];
  const body = payload as Record<string, unknown>;
  const nested = body.payload && typeof body.payload === "object" && !Array.isArray(body.payload) ? (body.payload as Record<string, unknown>) : null;
  const data = body.data && typeof body.data === "object" && !Array.isArray(body.data) ? (body.data as Record<string, unknown>) : null;
  const message = body.message && typeof body.message === "object" && !Array.isArray(body.message) ? (body.message as Record<string, unknown>) : null;
  return [body, nested, data, message].filter(Boolean) as Record<string, unknown>[];
}

function hasSabiSessionDescription(payload: unknown): boolean {
  for (const source of sabiVideoPayloadRecords(payload)) {
    const description =
      source.description && typeof source.description === "object" && !Array.isArray(source.description)
        ? (source.description as Record<string, unknown>)
        : null;

    const sdp = sabiPayloadText(source.sdp, description?.sdp);
    const type = sabiPayloadText(source.descriptionType, description?.type, source.signalKind, source.event, source.action).toLowerCase();
    if (sdp.startsWith("v=") && (type.includes("offer") || type.includes("answer") || !type)) return true;
  }
  return false;
}

function getSabiWebrtcSignalKind(payload: unknown): "offer" | "answer" | "ice" | "" {
  const sources = sabiVideoPayloadRecords(payload);
  if (!sources.length) return "";

  for (const source of sources) {
    const description =
      source.description && typeof source.description === "object" && !Array.isArray(source.description)
        ? (source.description as Record<string, unknown>)
        : null;

    if (source.candidate || source.iceCandidate) return "ice";

    const descriptionType = sabiPayloadText(description?.type, source.descriptionType).toLowerCase();
    if (descriptionType === "offer" || descriptionType === "answer") return descriptionType;

    const text = [
      sabiPayloadText(source.signalKind),
      sabiPayloadText(source.event),
      sabiPayloadText(source.action),
      sabiPayloadText(source.type),
      sabiPayloadText(source.kind),
    ]
      .join(" ")
      .toLowerCase();

    if (text.includes("ice")) return "ice";
    if (text.includes("answer")) return "answer";
    if (text.includes("offer")) return "offer";

    if (sabiPayloadText(source.sdp, description?.sdp).startsWith("v=")) {
      if (text.includes("answer")) return "answer";
      return "offer";
    }
  }

  return "";
}

function hasSabiRenderableVideoTrack(stream: any | null | undefined): boolean {
  try {
    const videoTracks = stream?.getVideoTracks?.() || [];

    return videoTracks.some((track: any) => {
      if (!track || track.readyState === "ended") return false;
      if (track.enabled === false) return false;
      return true;
    });
  } catch {
    return false;
  }
}

function stopSabiMediaStream(stream: any | null | undefined) {
  try {
    stream?.getTracks?.().forEach((track: any) => {
      try {
        if (track && "enabled" in track) track.enabled = false;
        track?.stop?.();
      } catch {}
    });
  } catch {}
}

function closeCallRoute() {
  // SABI_CALL_STRICT_210_IMMEDIATE_CLOSE:
  // Call end/decline must leave the call screen immediately. No delayed back stack
  // behavior, because stale call routes were keeping the user in a dead call state.
  try {
    router.replace("/tabs/chats" as never);
    return;
  } catch {}

  try {
    (router as any).replace("/tabs/chats");
    return;
  } catch {}

  try {
    (router as any).replace("/(tabs)/chats");
    return;
  } catch {}

  try {
    (router as any).replace("/");
  } catch {}
}

function makeTheme(accent?: string, background?: string) {
  return {
    bg: background || "#07130F",
    accent: accent || "#25D366",
    danger: "#FF1744",
    dock: "rgba(8,17,20,0.95)",
    control: "rgba(20,32,36,0.96)",
    border: "rgba(255,255,255,0.16)",
    text: "#FFFFFF",
    muted: "rgba(255,255,255,0.68)",
  };
}

function clampSabiMiniPreviewPosition(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min;
  if (max < min) return min;
  return Math.min(Math.max(value, min), max);
}

function normalizeSabiLocalCallEnd(reason: string, phase: StandardCallPhase, incoming: boolean): SabiCallEndMeta {
  const normalized = String(reason || "ended").trim().toLowerCase();
  const beforeConnect = phase === "calling" || phase === "ringing" || phase === "connecting";

  if (normalized.includes("declin")) {
    return { event: "declined", status: "declined", historyEvent: "call:declined", endReason: "declined" };
  }

  if (normalized.includes("busy")) {
    return { event: "busy", status: "busy", historyEvent: "call:busy", endReason: "busy" };
  }

  if (normalized.includes("missed") || normalized.includes("no_answer") || normalized.includes("timeout")) {
    return { event: "missed", status: "missed", historyEvent: "call:missed", endReason: "no_answer" };
  }

  if (beforeConnect && !incoming && (normalized.includes("local_end") || normalized.includes("cancel"))) {
    return { event: "cancelled", status: "cancelled", historyEvent: "call:cancelled", endReason: "cancelled" };
  }

  return { event: "ended", status: "ended", historyEvent: "call:ended", endReason: normalized || "ended" };
}

function normalizeSabiRemoteCallEnd(payload: unknown, missedBeforeAccept: boolean): SabiCallEndMeta {
  const text = [
    getSabiCallPayloadEvent(payload),
    payload && typeof payload === "object" ? sabiPayloadText((payload as Record<string, unknown>).endReason) : "",
    payload && typeof payload === "object" ? sabiPayloadText((payload as Record<string, unknown>).reason) : "",
    payload && typeof payload === "object" ? sabiPayloadText((payload as Record<string, unknown>).signalState) : "",
  ]
    .join(" ")
    .toLowerCase();

  if (text.includes("declin")) {
    return { event: "declined", status: "declined", historyEvent: "call:declined", endReason: "declined" };
  }

  if (text.includes("busy")) {
    return { event: "busy", status: "busy", historyEvent: "call:busy", endReason: "busy" };
  }

  if (missedBeforeAccept || text.includes("missed") || text.includes("no_answer") || text.includes("timeout")) {
    return { event: "missed", status: "missed", historyEvent: "call:missed", endReason: "missed" };
  }

  if (text.includes("cancel")) {
    return { event: "cancelled", status: "cancelled", historyEvent: "call:cancelled", endReason: "cancelled" };
  }

  return { event: "ended", status: "ended", historyEvent: "call:ended", endReason: "remote_end" };
}




const SABI_RECENTLY_FINISHED_CALL_SUPPRESS_MS = 12000;
const SABI_VIDEO_PREACCEPT_OFFER_DELAY_MS = 0;
const SABI_VIDEO_REPEAT_PREACCEPT_OFFER_DELAY_MS = 0;
const SABI_VIDEO_STALE_INCOMING_ROUTE_CLOSE_MS = 45000;

function sabiVideoCallIdCreatedAtMs(callId?: string | null): number {
  const parts = String(callId || "").split(":");
  for (const part of parts) {
    const value = Number(part);
    if (Number.isFinite(value) && value > 1000000000000 && value < 9999999999999) return value;
  }
  return 0;
}

function isStaleIncomingVideoRoute(route: { incoming?: boolean; callId?: string | null }, maxAgeMs = SABI_VIDEO_STALE_INCOMING_ROUTE_CLOSE_MS): boolean {
  if (!route.incoming) return false;
  const createdAt = sabiVideoCallIdCreatedAtMs(route.callId);
  return createdAt > 0 && Date.now() - createdAt > maxAgeMs;
}

function callLifecycleKey(route: { kind?: string; chatId?: string; roomId?: string; userId?: string; peerId?: string; callId?: string }) {
  return [
    route.kind || "video",
    route.chatId || route.roomId || "direct",
    route.userId || "self",
    route.peerId || "peer",
    route.callId || "no-call-id",
  ].join("|");
}

function callPairLifecycleKey(route: { kind?: string; chatId?: string; roomId?: string; userId?: string; peerId?: string }) {
  return [
    route.kind || "video",
    route.chatId || route.roomId || "direct",
    route.userId || "self",
    route.peerId || "peer",
  ].join("|");
}

function rememberFinishedCall(route: { kind?: string; chatId?: string; roomId?: string; userId?: string; peerId?: string; callId?: string }) {
  try {
    const root = globalThis as any;
    const map = (root.__sabiRecentlyFinishedCalls ||= {}) as Record<string, number>;
    map[callLifecycleKey(route)] = Date.now();
    const pairMap = (root.__sabiRecentlyFinishedVideoCallPairs ||= {}) as Record<string, number>;
    pairMap[callPairLifecycleKey(route)] = Date.now();
  } catch {}
}

function wasCallJustFinished(route: { kind?: string; chatId?: string; roomId?: string; userId?: string; peerId?: string; callId?: string }) {
  try {
    const root = globalThis as any;
    const map = (root.__sabiRecentlyFinishedCalls || {}) as Record<string, number>;
    const at = Number(map[callLifecycleKey(route)] || 0);
    return at > 0 && Date.now() - at < SABI_RECENTLY_FINISHED_CALL_SUPPRESS_MS;
  } catch {
    return false;
  }
}

function wasVideoPairJustFinished(route: { kind?: string; chatId?: string; roomId?: string; userId?: string; peerId?: string }, windowMs = 120000) {
  try {
    const root = globalThis as any;
    const map = (root.__sabiRecentlyFinishedVideoCallPairs || {}) as Record<string, number>;
    const at = Number(map[callPairLifecycleKey(route)] || 0);
    return at > 0 && Date.now() - at < windowMs;
  } catch {
    return false;
  }
}

type SabiVideoCallVisibleState = {
  acceptedAt?: number;
  activeAt?: number;
};

function getSabiVideoCallVisibleStates(): Record<string, SabiVideoCallVisibleState> {
  const root = globalThis as any;
  return (root.__sabiVideoCallVisibleStates ||= {}) as Record<string, SabiVideoCallVisibleState>;
}

function rememberVideoAcceptedOrActive(
  route: { kind?: string; chatId?: string; roomId?: string; userId?: string; peerId?: string; callId?: string },
  status: "accepted" | "active",
) {
  try {
    const states = getSabiVideoCallVisibleStates();
    const key = callLifecycleKey(route);
    const now = Date.now();
    const state = (states[key] ||= {});
    if (status === "accepted" && !state.acceptedAt) state.acceptedAt = now;
    if (status === "active") {
      if (!state.acceptedAt) state.acceptedAt = now;
      state.activeAt = now;
    }
  } catch {}
}

function wasVideoAcceptedOrActive(
  route: { kind?: string; chatId?: string; roomId?: string; userId?: string; peerId?: string; callId?: string },
) {
  try {
    const state = getSabiVideoCallVisibleStates()[callLifecycleKey(route)];
    if (!state) return false;
    const now = Date.now();
    const acceptedAt = Number(state.acceptedAt || 0);
    const activeAt = Number(state.activeAt || 0);
    return Boolean(
      (acceptedAt > 0 && now - acceptedAt < 90000) ||
        (activeAt > 0 && now - activeAt < 90000),
    );
  } catch {
    return false;
  }
}

function clearVideoAcceptedOrActive(
  route: { kind?: string; chatId?: string; roomId?: string; userId?: string; peerId?: string; callId?: string },
) {
  try {
    delete getSabiVideoCallVisibleStates()[callLifecycleKey(route)];
  } catch {}
}

function isSoftNoAnswerReason(reason: string) {
  const normalized = String(reason || "").toLowerCase();
  return normalized.includes("missed") || normalized.includes("no_answer") || normalized.includes("timeout");
}

function sabiVideoPayloadTimeMs(payload: unknown): number {
  try {
    const body = payload && typeof payload === "object" ? (payload as Record<string, unknown>) : {};
    const nested = body.payload && typeof body.payload === "object" ? (body.payload as Record<string, unknown>) : {};
    const data = body.data && typeof body.data === "object" ? (body.data as Record<string, unknown>) : {};
    const message = body.message && typeof body.message === "object" ? (body.message as Record<string, unknown>) : {};
    const raw = body.timestamp ?? body.sentAt ?? body.at ?? body.relayAt ?? nested.timestamp ?? nested.sentAt ?? nested.at ?? data.timestamp ?? data.sentAt ?? data.at ?? message.timestamp ?? message.sentAt ?? message.at;
    if (typeof raw === "number" && Number.isFinite(raw)) return raw;
    if (typeof raw === "string" && raw.trim()) {
      const numeric = Number(raw);
      if (Number.isFinite(numeric) && numeric > 1000000000) return numeric;
      const parsed = Date.parse(raw);
      if (Number.isFinite(parsed)) return parsed;
    }
  } catch {}
  return 0;
}

function isStaleSabiVideoSignal(payload: unknown, maxAgeMs = 12000): boolean {
  const at = sabiVideoPayloadTimeMs(payload);
  return at > 0 && Date.now() - at > maxAgeMs;
}

type SabiOutgoingVideoCallLock = {
  callId: string;
  createdAt: number;
  finished?: boolean;
};

function sabiOutgoingVideoBaseKey(route: { chatId?: string; roomId?: string; userId?: string; peerId?: string }) {
  return [
    route.chatId || route.roomId || "direct",
    route.userId || "self",
    route.peerId || "peer",
    "video",
  ].join("|");
}

function getStableOutgoingVideoCallId(route: { chatId?: string; roomId?: string; userId?: string; peerId?: string }) {
  const root = globalThis as any;
  const locks = ((root.__sabiVideoOutgoingCallLocks ||= {}) as Record<string, SabiOutgoingVideoCallLock>);
  const key = sabiOutgoingVideoBaseKey(route);
  const now = Date.now();
  const existing = locks[key];

  if (existing && !existing.finished && now - existing.createdAt < 45000 && existing.callId) {
    return existing.callId;
  }

  const nonce = Math.random().toString(36).slice(2, 10);
  const callId = [
    "call",
    route.chatId || route.roomId || "direct",
    route.userId || "self",
    route.peerId || "peer",
    now,
    nonce,
  ].join(":");

  locks[key] = { callId, createdAt: now, finished: false };
  return callId;
}

function releaseStableOutgoingVideoCallId(route: { chatId?: string; roomId?: string; userId?: string; peerId?: string; callId?: string }) {
  try {
    const root = globalThis as any;
    const locks = (root.__sabiVideoOutgoingCallLocks || {}) as Record<string, SabiOutgoingVideoCallLock>;
    const key = sabiOutgoingVideoBaseKey(route);
    const lock = locks[key];
    if (lock && (!route.callId || lock.callId === route.callId)) {
      lock.finished = true;
      delete locks[key];
    }
  } catch {}
}

// SABI_VIDEO_ONLY_SCREEN:
// This file keeps the existing 1:1 video-call design and buttons.
// It removes participant-list / mesh-call code.
export default function VideoCallScreen() {
  const kind: StandardCallKind = "video";
  const { t, language } = useI18n();
  const params = useLocalSearchParams();

  const parsedRoute = useMemo(
    () => parseStandardCallRoute(params as Record<string, unknown>, kind),
    [params],
  );

  const outgoingVideoCallIdRef = useRef("");
  if (!parsedRoute.incoming && !outgoingVideoCallIdRef.current) {
    outgoingVideoCallIdRef.current = getStableOutgoingVideoCallId(parsedRoute);
  }

  const stableParsedRoute = useMemo(
    () => parsedRoute.incoming ? parsedRoute : { ...parsedRoute, callId: outgoingVideoCallIdRef.current },
    [parsedRoute],
  );

  const parsedRouteKey = [
    stableParsedRoute.callId,
    stableParsedRoute.chatId,
    stableParsedRoute.roomId,
    stableParsedRoute.userId,
    stableParsedRoute.peerId,
    stableParsedRoute.kind,
    stableParsedRoute.incoming ? "in" : "out",
  ].join("|");

  const routeRef = useRef(stableParsedRoute);
  const routeKeyRef = useRef(parsedRouteKey);

  if (routeKeyRef.current !== parsedRouteKey) {
    routeKeyRef.current = parsedRouteKey;
    routeRef.current = stableParsedRoute;
  }

  const route = routeRef.current;
  const routeKey = routeKeyRef.current;

  const callDebug = useCallback((stage: string, details: Record<string, unknown> = {}) => {
    logSabiCallDebug(routeRef.current, "screen:" + stage, details);
  }, []);

  const theme = useMemo(() => makeTheme(route.accent, route.background), [route.accent, route.background]);
  const styles = useMemo(() => createStyles(theme), [theme]);

  const text = useCallback(
    (key: TextKey) => {
      const i18nKey = "calls." + key;
      const translated = t(i18nKey);
      if (translated && translated !== i18nKey) return translated;

      const lang = String(language).startsWith("ru")
        ? "ru"
        : String(language).startsWith("uz")
          ? "uz"
          : "en";

      return TEXTS[lang][key];
    },
    [language, t],
  );

  const socket = useMemo(() => getSuperAppSocket(route.userId || undefined), [route.userId]);
  const autoAcceptFromNotification = useMemo(() => {
    const raw = String(
      (params as Record<string, unknown>).autoAccept ||
        (params as Record<string, unknown>).notificationAction ||
        ""
    ).toLowerCase();

    return raw === "1" || raw === "true" || raw === "accept" || raw === "sabi_call_accept";
  }, [params]);
  const rawRouteParams = useLocalSearchParams<Record<string, string | string[]>>();

  const rawRouteText = useCallback(
    (key: string) => {
      const value = rawRouteParams[key];
      return Array.isArray(value) ? String(value[0] || "") : String(value || "");
    },
    [rawRouteParams],
  );

  const routeAvatarUrl = useMemo(() => {
    return (
      rawRouteText("avatarUrl") ||
      rawRouteText("photoUrl") ||
      rawRouteText("avatarUri") ||
      rawRouteText("profilePhotoUrl") ||
      String((route as any).avatarUrl || (route as any).photoUrl || "")
    ).trim();
  }, [rawRouteText, route]);

  const [phase, setPhase] = useState<StandardCallPhase>(route.incoming ? "ringing" : "calling");
  const [statusKey, setStatusKey] = useState<TextKey>(route.incoming ? "incoming" : "calling");
  const [seconds, setSeconds] = useState(0);
  const activeStartedAtRef = useRef<number | null>(null);
  const phaseRef = useRef<StandardCallPhase>(route.incoming ? "ringing" : "calling");

  const [localStream, setLocalStreamState] = useState<any | null>(null);
  const [remoteStream, setRemoteStream] = useState<any | null>(null);
  const [stableRemoteVideoStream, setStableRemoteVideoStream] = useState<any | null>(null);
  const [stableRemoteVideoUrl, setStableRemoteVideoUrl] = useState("");
  const [remoteCameraOff, setRemoteCameraOff] = useState(false);

  const [micEnabled, setMicEnabledState] = useState(true);
  const initialVideoActive = !route.incoming;
  const [speakerEnabled, setSpeakerEnabledState] = useState(() => initialVideoActive);
  const [cameraEnabled, setCameraEnabledState] = useState(initialVideoActive);
  const [videoLayoutEnabled, setVideoLayoutEnabled] = useState(initialVideoActive);
  const [cameraFacing, setCameraFacing] = useState<"user" | "environment">("user");
  const [presentationEnabled, setPresentationEnabledState] = useState(false);
  const [aiEnabled, setAiEnabledState] = useState(false);
  const [compact, setCompact] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [remoteMain, setRemoteMainState] = useState(true);

  const setRemoteMain = useCallback((next: boolean | ((value: boolean) => boolean)) => {
    setRemoteMainState((current) => {
      const resolved = typeof next === "function" ? (next as (value: boolean) => boolean)(current) : next;
      preferredRemoteMainRef.current = resolved;
      return resolved;
    });
  }, []);

  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const miniPreviewWidth = 128;
  const miniPreviewHeight = 184;
  const miniPreviewMargin = 12;
  const miniPreviewTopLimit = 96;
  const miniPreviewBottomLimit = 112;
  const miniPreviewPositionRef = useRef({
    x: Math.max(miniPreviewMargin, windowWidth - miniPreviewWidth - 18),
    y: Math.max(miniPreviewTopLimit, windowHeight - miniPreviewHeight - miniPreviewBottomLimit),
  });
  const miniPreviewPan = useRef(new Animated.ValueXY(miniPreviewPositionRef.current)).current;

  const settleMiniPreviewPosition = useCallback(
    (rawX: number, rawY: number) => {
      const next = {
        x: clampSabiMiniPreviewPosition(
          rawX,
          miniPreviewMargin,
          windowWidth - miniPreviewWidth - miniPreviewMargin,
        ),
        y: clampSabiMiniPreviewPosition(
          rawY,
          miniPreviewTopLimit,
          windowHeight - miniPreviewHeight - miniPreviewBottomLimit,
        ),
      };

      miniPreviewPositionRef.current = next;
      Animated.spring(miniPreviewPan, {
        toValue: next,
        useNativeDriver: false,
        bounciness: 0,
        speed: 18,
      }).start();
    },
    [miniPreviewPan, windowHeight, windowWidth],
  );

  useEffect(() => {
    miniPreviewPan.stopAnimation((value: { x: number; y: number }) => {
      settleMiniPreviewPosition(value?.x ?? miniPreviewPositionRef.current.x, value?.y ?? miniPreviewPositionRef.current.y);
    });
  }, [miniPreviewPan, settleMiniPreviewPosition, windowHeight, windowWidth]);

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  const miniPreviewPanResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gestureState) => {
          return Math.abs(gestureState.dx) > 4 || Math.abs(gestureState.dy) > 4;
        },
        onPanResponderGrant: () => {
          miniPreviewPan.stopAnimation((value: { x: number; y: number }) => {
            const current = {
              x: Number.isFinite(value?.x) ? value.x : miniPreviewPositionRef.current.x,
              y: Number.isFinite(value?.y) ? value.y : miniPreviewPositionRef.current.y,
            };

            miniPreviewPositionRef.current = current;
            miniPreviewPan.setOffset(current);
            miniPreviewPan.setValue({ x: 0, y: 0 });
          });
        },
        onPanResponderMove: Animated.event([null, { dx: miniPreviewPan.x, dy: miniPreviewPan.y }], {
          useNativeDriver: false,
        }),
        onPanResponderRelease: () => {
          miniPreviewPan.flattenOffset();
          miniPreviewPan.stopAnimation((value: { x: number; y: number }) => {
            settleMiniPreviewPosition(value?.x ?? miniPreviewPositionRef.current.x, value?.y ?? miniPreviewPositionRef.current.y);
          });
        },
        onPanResponderTerminate: () => {
          miniPreviewPan.flattenOffset();
          miniPreviewPan.stopAnimation((value: { x: number; y: number }) => {
            settleMiniPreviewPosition(value?.x ?? miniPreviewPositionRef.current.x, value?.y ?? miniPreviewPositionRef.current.y);
          });
        },
      }),
    [miniPreviewPan, settleMiniPreviewPosition],
  );

  const peerRef = useRef<PeerHandle | null>(null);
  const startedRef = useRef(false);
  const acceptedRef = useRef(false);
  const handlingOfferRef = useRef(false);
  const acceptedVideoWantedRef = useRef(false);
  const mountedRef = useRef(true);
  const seenSignalsRef = useRef(new Set<string>());
  const pendingOfferPayloadRef = useRef<unknown | null>(null);
  const pendingRemoteIcePayloadsRef = useRef<unknown[]>([]);
  const preacceptOfferTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inviteRetryTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const incomingPrewarmTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const incomingPrewarmStartedRef = useRef(false);
  const outgoingPrewarmStartedRef = useRef(false);
  const preferredRemoteMainRef = useRef(true);
  const endedCallIdsRef = useRef<Set<string>>(new Set<string>());
  const remoteVideoLostAtRef = useRef(0);
  const remoteCameraOffRef = useRef(false);
  const callHistoryStartedAtRef = useRef(new Date().toISOString());
  const callHistoryAnsweredAtRef = useRef<string | null>(null);
  const callHistoryFinalKeyRef = useRef("");
  const speakerRetryTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearSpeakerRetryTimers = useCallback(() => {
    const timers = speakerRetryTimersRef.current.splice(0, speakerRetryTimersRef.current.length);
    timers.forEach((timer) => clearTimeout(timer));
  }, []);

  const clearInviteRetryTimers = useCallback(() => {
    const timers = inviteRetryTimersRef.current.splice(0, inviteRetryTimersRef.current.length);
    timers.forEach((timer) => clearTimeout(timer));
  }, []);

  const clearIncomingPrewarmTimer = useCallback(() => {
    if (incomingPrewarmTimerRef.current) {
      clearTimeout(incomingPrewarmTimerRef.current);
      incomingPrewarmTimerRef.current = null;
    }
  }, []);

  const setProtectedLocalStream = useCallback((nextStream: any | null) => {
    if (nextStream) {
      try {
        nextStream?.getTracks?.().forEach((track: any) => {
          if (track && "enabled" in track) track.enabled = true;
        });
      } catch {}
    }

    setLocalStreamState(nextStream);
  }, []);

  const closePeer = useCallback(() => {
    clearSpeakerRetryTimers();
    peerRef.current?.close();
    peerRef.current = null;
  }, [clearSpeakerRetryTimers]);

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

  const shouldProcessSignal = useCallback((eventName: string, payload: unknown) => {
    const key = makeSignalKey(eventName, payload);
    if (seenSignalsRef.current.has(key)) return false;
    seenSignalsRef.current.add(key);
    return true;
  }, []);

  const recordCallHistory = useCallback(
    (eventName: string, patch: Record<string, unknown> = {}) => {
      const now = new Date().toISOString();
      const eventText = [
        String(eventName || ""),
        String(patch.event || ""),
        String(patch.status || ""),
        String(patch.phase || ""),
        String(patch.endReason || ""),
        String(patch.reason || ""),
      ]
        .join(" ")
        .toLowerCase();

      const isConnected =
        eventText.includes("connected") ||
        eventText.includes("active");
      const isMissed = eventText.includes("missed") || eventText.includes("no_answer") || eventText.includes("timeout");
      const isFinal =
        isMissed ||
        eventText.includes("ended") ||
        eventText.includes("declined") ||
        eventText.includes("busy") ||
        eventText.includes("failed") ||
        eventText.includes("local_end") ||
        eventText.includes("remote_end") ||
        eventText.includes("cancel");

      if (isConnected && !callHistoryAnsweredAtRef.current) {
        callHistoryAnsweredAtRef.current = now;
      }

      const finalKey = isFinal
        ? [route.callId, eventName, patch.status, patch.endReason, patch.reason].join("|")
        : "";

      if (finalKey && callHistoryFinalKeyRef.current === finalKey) return;
      if (finalKey) callHistoryFinalKeyRef.current = finalKey;

      const startedAt = callHistoryStartedAtRef.current || now;
      const answeredAt = callHistoryAnsweredAtRef.current;
      const durationSeconds =
        isFinal && answeredAt ? Math.max(0, Math.floor((Date.now() - new Date(answeredAt).getTime()) / 1000)) : 0;
      const status = isMissed
        ? "missed"
        : String(patch.status || patch.phase || "").trim() ||
          (isConnected ? "connected" : isFinal ? "ended" : route.incoming ? "ringing" : "calling");

      const payload = makeCallPayload(route, {
        ...patch,
        event: patch.event || eventName,
        status,
        phase: status === "connected" ? "active" : patch.phase || status,
        direction: isMissed ? "missed" : route.incoming ? "incoming" : "outgoing",
        counterpartyName: route.name,
        name: route.name,
        contactName: route.name,
        avatarLetter: route.avatarLetter,
        avatarUrl: routeAvatarUrl || (route as any).avatarUrl || (route as any).photoUrl || undefined,
        photoUrl: routeAvatarUrl || (route as any).photoUrl || (route as any).avatarUrl || undefined,
        startedAt,
        answeredAt: answeredAt || undefined,
        endedAt: isFinal ? now : undefined,
        durationSeconds,
      });

      void recordMessengerCallRealtimeEvent(eventName, payload, {
        currentUserId: route.userId || null,
      }).catch(() => undefined);
    },
    [route, routeAvatarUrl, routeKey],
  );

  const ensurePeer = useCallback(() => {
    if (peerRef.current) return peerRef.current;

    peerRef.current = createStandardCallPeer({
      route,
      socket,
      // VIDEO-CALLS-1.5_REPEAT_FAST_SAFE:
      // On a repeat incoming video call, answer first with audio/peer only and
      // attach camera immediately after Accept/answer. This removes the repeat
      // answer delay without opening the callee camera before Accept.
      initialVideoEnabled: route.kind === "video" ? true : (cameraEnabled || acceptedVideoWantedRef.current),
      initialCameraFacing: cameraFacing,
      // VIDEO-CALLS-2.0_REPEAT_OUTGOING_FAST_OFFER:
      // Repeat video calls must not wait on Android camera/microphone before
      // sending the first SDP offer. Defer local media on both sides only for
      // repeat calls; camera still starts after Accept / answer.
      deferInitialLocalMedia: false,
      localMediaBeforeAnswerTimeoutMs: 7000,
      canStartCaller: () => Boolean(!endedCallIdsRef.current.has(route.callId)),
      onLocalStream: setProtectedLocalStream,
      onRemoteStream: (stream) => {
        try {
          stream?.getTracks?.().forEach((track: any) => {
            if (track && "enabled" in track) track.enabled = true;
          });
        } catch {}

        callDebug("remoteStream:set", {
          url: typeof stream?.toURL === "function" ? String(stream.toURL()) : "",
          tracks: stream?.getTracks?.()?.length || 0,
          video: stream?.getVideoTracks?.()?.length || 0,
        });
        setRemoteStream(stream);

        try {
          const hasVideo = hasSabiRenderableVideoTrack(stream);

          if (remoteCameraOffRef.current) {
            remoteVideoLostAtRef.current = Date.now();
            setStableRemoteVideoStream(null);
            setStableRemoteVideoUrl("");
            setRemoteMain(true);
            setVideoLayoutEnabled(Boolean(cameraEnabled || localStream?.getVideoTracks?.()?.length));
          } else if (hasVideo && typeof stream?.toURL === "function") {
            remoteVideoLostAtRef.current = 0;
            const nextUrl = String(stream.toURL());

            setStableRemoteVideoUrl((currentUrl) => {
              if (currentUrl && currentUrl === nextUrl) return currentUrl;
              return nextUrl;
            });

            setStableRemoteVideoStream((currentStream: any | null) => {
              if (currentStream && typeof currentStream.toURL === "function") {
                const currentUrl = String(currentStream.toURL());
                if (currentUrl === nextUrl) return currentStream;
              }

              return stream;
            });
          } else if (!hasVideo) {
            remoteVideoLostAtRef.current = Date.now();
            setStableRemoteVideoStream(null);
            setStableRemoteVideoUrl("");
          }
        } catch {}

        if (stream && mountedRef.current && !endedCallIdsRef.current.has(route.callId) && phase !== "ended") {
          // Render remote media immediately, but do not start call timer here.
          // Timer/active state starts only from local WebRTC peer connected.
          void stopSabiCallToneNow();
        }
      },
      onConnected: () => {
        if (!mountedRef.current || endedCallIdsRef.current.has(route.callId)) return;
        void stopSabiCallToneNow();
        rememberVideoAcceptedOrActive(route, "active");
        acceptedRef.current = true;
        if (!activeStartedAtRef.current) activeStartedAtRef.current = Date.now();
        phaseRef.current = "active";
        setPhase("active");
        setStatusKey("connected");
        recordCallHistory("call:connected", { event: "connected", status: "connected", phase: "active" });
      },
      onError: (message) => {
        callDebug("peer:error", { message });
        if (!mountedRef.current) return;
        if (phaseRef.current !== "active") setStatusKey("connecting");
      },
    });

    void peerRef.current.setSpeakerEnabled(speakerEnabled);
    peerRef.current.setMicEnabled(micEnabled);

    return peerRef.current;
  }, [
    callDebug,
    cameraEnabled,
    cameraFacing,
    localStream,
    micEnabled,
    recordCallHistory,
    route,
    setProtectedLocalStream,
    socket,
    speakerEnabled,
  ]);

  const startIncomingPrewarm = useCallback((reason: string) => {
    if (!route.incoming) return;
    if (incomingPrewarmStartedRef.current || acceptedRef.current || endedCallIdsRef.current.has(route.callId)) return;
    incomingPrewarmStartedRef.current = true;
    acceptedVideoWantedRef.current = true;
    callDebug("incoming:prewarm:start", { reason });
    void (ensurePeer() as any).prepareLocalMedia?.(reason)
      .then(() => {
        if (!mountedRef.current || endedCallIdsRef.current.has(route.callId)) return;
        callDebug("incoming:prewarm:ready", { reason });
        flushPendingRemoteIcePayloads("incoming_prewarm_ready");
      })
      .catch((error: unknown) => {
        incomingPrewarmStartedRef.current = false;
        callDebug("incoming:prewarm:error", { reason, message: error instanceof Error ? error.message : String(error) });
      });
  }, [callDebug, ensurePeer, flushPendingRemoteIcePayloads, route]);


  const startOutgoingPrewarm = useCallback((reason: string) => {
    if (route.incoming) return;
    if (outgoingPrewarmStartedRef.current || endedCallIdsRef.current.has(route.callId)) return;
    outgoingPrewarmStartedRef.current = true;
    acceptedVideoWantedRef.current = true;
    callDebug("outgoing:prewarm:start", { reason });

    void (ensurePeer() as any).prepareLocalMedia?.(reason)
      .then(() => {
        if (!mountedRef.current || endedCallIdsRef.current.has(route.callId)) return;
        callDebug("outgoing:prewarm:ready", { reason });
        flushPendingRemoteIcePayloads("outgoing_prewarm_ready");
      })
      .catch((error: unknown) => {
        outgoingPrewarmStartedRef.current = false;
        callDebug("outgoing:prewarm:error", { reason, message: error instanceof Error ? error.message : String(error) });
      });
  }, [callDebug, ensurePeer, flushPendingRemoteIcePayloads, route]);

  const enableAcceptedIncomingCamera = useCallback((reason: string) => {
    if (!route.incoming || endedCallIdsRef.current.has(route.callId)) return;
    acceptedVideoWantedRef.current = true;
    setCameraEnabledState(true);
    setVideoLayoutEnabled(true);

    const peer = peerRef.current;
    if (!peer || typeof (peer as any).setCameraEnabled !== "function") return;

    callDebug("incoming:camera_after_accept:start", { reason });
    void (peer as any).setCameraEnabled(true)
      .then(() => {
        if (!mountedRef.current || endedCallIdsRef.current.has(route.callId)) return;
        callDebug("incoming:camera_after_accept:ready", { reason });
      })
      .catch((error: unknown) => {
        callDebug("incoming:camera_after_accept:error", { reason, message: error instanceof Error ? error.message : String(error) });
      });
  }, [callDebug, route.callId, route.incoming]);

  const makeStableIncomingPayload = useCallback(() => {
    const payload = makeCallPayload(route, {
      event: "incoming",
      signalKind: "incoming",
      phase: "ringing",
      status: "ringing",
      inviteBurst: wasVideoPairJustFinished(route),
    });

    const createdAtMs = sabiVideoCallIdCreatedAtMs(route.callId);
    const stableAt = createdAtMs > 0 ? new Date(createdAtMs).toISOString() : route.callId;
    (payload as any).at = stableAt;
    (payload as any).createdAt = stableAt;
    (payload as any).startedAt = stableAt;
    (payload as any).inviteInstanceKey = route.callId;
    return payload;
  }, [route]);

  useSabiCallTone({
    enabled: phase === "calling" || phase === "ringing",
    mode: phase === "ringing" ? "incoming" : phase === "calling" ? "outgoing" : "none",
    callId: route.callId,
  });

  useEffect(() => {
    mountedRef.current = true;
    acceptedRef.current = false;
    handlingOfferRef.current = false;
    startedRef.current = false;
    incomingPrewarmStartedRef.current = false;
    outgoingPrewarmStartedRef.current = false;
    seenSignalsRef.current.clear();
    callHistoryStartedAtRef.current = new Date().toISOString();
    callHistoryAnsweredAtRef.current = null;
    activeStartedAtRef.current = null;
    callHistoryFinalKeyRef.current = "";
    remoteCameraOffRef.current = false;

    recordCallHistory(route.incoming ? "call:incoming" : "call:start", {
      event: route.incoming ? "incoming" : "start",
      status: route.incoming ? "ringing" : "calling",
      phase: route.incoming ? "ringing" : "calling",
    });

    callDebug("route:init", {
      phase: route.incoming ? "ringing" : "calling",
      videoOnly: true,
    });

    pendingOfferPayloadRef.current = null;
    pendingRemoteIcePayloadsRef.current = [];
    clearSpeakerRetryTimers();
    clearInviteRetryTimers();
    clearIncomingPrewarmTimer();
    peerRef.current?.close();
    peerRef.current = null;
    closePeer();

    setSeconds(0);
    phaseRef.current = route.incoming ? "ringing" : "calling";
    setPhase(route.incoming ? "ringing" : "calling");
    setStatusKey(route.incoming ? "incoming" : "calling");
    setRemoteStream(null);
    setStableRemoteVideoStream(null);
    setStableRemoteVideoUrl("");
    setRemoteCameraOff(false);
    setProtectedLocalStream(null);
    preferredRemoteMainRef.current = true;

    const nextInitialVideoActive = !route.incoming;
    acceptedVideoWantedRef.current = false;
    setCameraEnabledState(nextInitialVideoActive);
    setVideoLayoutEnabled(nextInitialVideoActive);
    setCameraFacing("user");
    setMoreOpen(false);

    return () => {
      mountedRef.current = false;
      clearSpeakerRetryTimers();
      clearInviteRetryTimers();
      clearIncomingPrewarmTimer();
      outgoingPrewarmStartedRef.current = false;
      if (preacceptOfferTimerRef.current) {
        clearTimeout(preacceptOfferTimerRef.current);
        preacceptOfferTimerRef.current = null;
      }
      pendingOfferPayloadRef.current = null;
      pendingRemoteIcePayloadsRef.current = [];
      releaseStableOutgoingVideoCallId(route);
      closePeer();
    };
  }, [callDebug, clearInviteRetryTimers, clearIncomingPrewarmTimer, clearSpeakerRetryTimers, closePeer, recordCallHistory, route.callId, route.incoming, routeKey, setProtectedLocalStream]);

  useEffect(() => {
    if (route.incoming && isStaleIncomingVideoRoute(route)) {
      callDebug("incoming:close:stale_route_after_cancel", { callId: route.callId });
      endedCallIdsRef.current.add(route.callId);
      pendingOfferPayloadRef.current = null;
      pendingRemoteIcePayloadsRef.current = [];
      phaseRef.current = "ended";
      setPhase("ended");
      setStatusKey("ended");
      closeCallRoute();
      return undefined;
    }

    if (!route.incoming && wasCallJustFinished(route)) {
      callDebug("invite:skip:recently_finished", { callId: route.callId, suppressMs: SABI_RECENTLY_FINISHED_CALL_SUPPRESS_MS });
      endedCallIdsRef.current.add(route.callId);
      phaseRef.current = "ended";
      setPhase("ended");
      setStatusKey("ended");
      closeCallRoute();
      return undefined;
    }

    if (!socket.connected) socket.connect();

    callDebug("room:join:emit", { socketConnected: Boolean(socket.connected) });
    joinSabiCallTransportScopes(socket, makeCallPayload(route, { event: "join" }));

    // VIDEO-CALLS-1.4_REPEAT_SAFE:
    // Do not open camera/mic on the callee while the call is still ringing.
    // The user explicitly rejected early camera activation before Accept.
    // Media is prepared only after Accept, so the second phone never shows
    // camera activity before the user accepts the video call.

    if (!route.incoming && !startedRef.current) {
      startedRef.current = true;

      const makeIncomingPayload = makeStableIncomingPayload;

      const payload = makeIncomingPayload();
      callDebug("invite:start:emit", summarizeSabiCallPayloadForDebug(payload));
      emitSabiCallTransportEvent(socket, "call:incoming", payload);

      // Start caller camera/mic immediately after the invite is emitted, before
      // startCaller/createOffer. startCaller reuses the same localStreamPromise,
      // so the first normal video offer still contains real audio+video and no
      // split-offer camera upgrade path is not introduced.
      startOutgoingPrewarm("before_preaccept_offer");

      clearInviteRetryTimers();
      const retryDelays = wasVideoPairJustFinished(route) ? SABI_VIDEO_INVITE_RETRY_DELAYS_MS : [];
      retryDelays.forEach((delayMs) => {
        const timer = setTimeout(() => {
          if (!mountedRef.current || route.incoming || acceptedRef.current || endedCallIdsRef.current.has(route.callId)) return;
          const retryPayload = makeIncomingPayload();
          callDebug("invite:retry:emit", { delayMs });
          emitSabiCallTransportEvent(socket, "call:incoming", retryPayload);
        }, delayMs);
        inviteRetryTimersRef.current.push(timer);
      });

      recordCallHistory("call:start", { event: "start", status: "calling", phase: "calling" });

      // VIDEO-CALLS-1.4_REPEAT_SAFE:
      // Keep the first-call flow and only prepare the caller offer after the
      // invite is sent. No incoming camera prewarm and no invite burst here:
      // duplicate incoming routes were closing the accepted repeat call.
      if (preacceptOfferTimerRef.current) clearTimeout(preacceptOfferTimerRef.current);
      const preacceptDelayMs = wasVideoPairJustFinished(route) ? SABI_VIDEO_REPEAT_PREACCEPT_OFFER_DELAY_MS : SABI_VIDEO_PREACCEPT_OFFER_DELAY_MS;
      preacceptOfferTimerRef.current = setTimeout(() => {
        preacceptOfferTimerRef.current = null;
        if (!mountedRef.current || route.incoming || endedCallIdsRef.current.has(route.callId) || acceptedRef.current) return;
        callDebug("preaccept:offer:start", { reason: "repeat_deferred_media_offer_no_camera_block", delayMs: preacceptDelayMs });
        void ensurePeer().startCaller().finally(() => flushPendingRemoteIcePayloads("preaccept_offer"));
      }, preacceptDelayMs);
    }

    return () => {
      clearInviteRetryTimers();
      clearIncomingPrewarmTimer();
      if (preacceptOfferTimerRef.current) {
        clearTimeout(preacceptOfferTimerRef.current);
        preacceptOfferTimerRef.current = null;
      }
      leaveSabiCallTransportScopes(socket, makeCallPayload(route, { event: "leave" }));
    };
  }, [callDebug, clearIncomingPrewarmTimer, clearInviteRetryTimers, ensurePeer, flushPendingRemoteIcePayloads, makeStableIncomingPayload, recordCallHistory, route, routeKey, socket, startIncomingPrewarm, startOutgoingPrewarm]);

  useEffect(() => {
    if (phase !== "active") {
      if (phase === "calling" || phase === "ringing" || phase === "ended") {
        activeStartedAtRef.current = null;
      }
      return undefined;
    }

    if (!activeStartedAtRef.current) activeStartedAtRef.current = Date.now();

    const updateConnectedSeconds = () => {
      const startedAt = activeStartedAtRef.current || Date.now();
      setSeconds(Math.max(0, Math.floor((Date.now() - startedAt) / 1000)));
    };

    updateConnectedSeconds();
    const timer = setInterval(updateConnectedSeconds, 1000);

    return () => clearInterval(timer);
  }, [phase, routeKey]);

  useEffect(() => {
    if (phase !== "connecting" && phase !== "active") return undefined;

    let cancelled = false;

    const applyRemoteMedia = () => {
      if (cancelled) return;

      try {
        const tracks = remoteStream?.getAudioTracks?.() ?? [];
        tracks.forEach((track: any) => {
          track.enabled = true;
        });
      } catch {}

      void peerRef.current?.setSpeakerEnabled(speakerEnabled);
      peerRef.current?.setMicEnabled(micEnabled);
    };

    applyRemoteMedia();
    const timer = setInterval(applyRemoteMedia, 1200);

    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [micEnabled, phase, remoteStream, speakerEnabled]);

  useEffect(() => {
    if (phase === "ended") return undefined;

    const verifyRemoteVideo = () => {
      if (!remoteStream) {
        remoteVideoLostAtRef.current = 0;
        setStableRemoteVideoStream(null);
        setStableRemoteVideoUrl("");
        setVideoLayoutEnabled(Boolean(cameraEnabled));
        return;
      }

      const hasRenderableTrack = hasSabiRenderableVideoTrack(remoteStream);

      if (!hasRenderableTrack || remoteCameraOffRef.current) {
        if (!remoteVideoLostAtRef.current) remoteVideoLostAtRef.current = Date.now();

        setStableRemoteVideoStream(null);
        setStableRemoteVideoUrl("");
        setRemoteMain(true);
        setVideoLayoutEnabled(Boolean(cameraEnabled));
        return;
      }

      remoteVideoLostAtRef.current = 0;

      if (typeof remoteStream.toURL === "function") {
        setStableRemoteVideoStream(remoteStream);
        setStableRemoteVideoUrl(String(remoteStream.toURL()));
        setVideoLayoutEnabled(true);
      }
    };

    verifyRemoteVideo();
    const timer = setInterval(verifyRemoteVideo, 900);

    return () => clearInterval(timer);
  }, [cameraEnabled, phase, remoteCameraOff, remoteStream, setRemoteMain]);

  const finishLocal = useCallback(
    (reason: string) => {
      if (phase === "ended" || endedCallIdsRef.current.has(route.callId)) return;
      if (isSoftNoAnswerReason(reason) && wasVideoAcceptedOrActive(route)) {
        callDebug("finish:skip_no_answer_after_accept_or_connected", { reason });
        return;
      }

      endedCallIdsRef.current.add(route.callId);
      clearVideoAcceptedOrActive(route);
      rememberFinishedCall(route);
      clearSpeakerRetryTimers();
      clearInviteRetryTimers();
      clearIncomingPrewarmTimer();
      if (preacceptOfferTimerRef.current) {
        clearTimeout(preacceptOfferTimerRef.current);
        preacceptOfferTimerRef.current = null;
      }
      pendingOfferPayloadRef.current = null;
      pendingRemoteIcePayloadsRef.current = [];
      void stopSabiCallToneForCall(route.callId);

      const endMeta = normalizeSabiLocalCallEnd(reason, phase, route.incoming);
      const payload = makeCallPayload(route, {
        event: endMeta.event,
        action: endMeta.event,
        phase: "ended",
        status: endMeta.status,
        endReason: endMeta.endReason,
      });

      recordCallHistory(endMeta.historyEvent, {
        event: endMeta.event,
        status: endMeta.status,
        phase: "ended",
        endReason: endMeta.endReason,
      });

      emitSabiCallTransportEvent(socket, "call:end", payload);
      releaseStableOutgoingVideoCallId(route);

      if (endMeta.event !== "ended") {
        emitSabiCallTransportEvent(socket, `call:${endMeta.event}`, payload);
      }

      closePeer();
      stopSabiMediaStream(localStream);
      stopSabiMediaStream(remoteStream);

      setRemoteStream(null);
      setStableRemoteVideoStream(null);
      setStableRemoteVideoUrl("");
      setProtectedLocalStream(null);
      phaseRef.current = "ended";
      setPhase("ended");
      setStatusKey("ended");

      closeCallRoute();
    },
    [
      clearIncomingPrewarmTimer,
      clearInviteRetryTimers,
      clearSpeakerRetryTimers,
      closePeer,
      localStream,
      phase,
      recordCallHistory,
      remoteStream,
      route,
      socket,
      setProtectedLocalStream,
    ],
  );

  useEffect(() => {
    if (phase !== "calling" && phase !== "ringing") return undefined;
    if (acceptedRef.current || endedCallIdsRef.current.has(route.callId) || wasVideoAcceptedOrActive(route)) return undefined;

    const timeoutMs = route.incoming
      ? SABI_VIDEO_INCOMING_NO_ANSWER_TIMEOUT_MS
      : SABI_VIDEO_OUTGOING_NO_ANSWER_TIMEOUT_MS;
    const timer = setTimeout(() => {
      if (acceptedRef.current || endedCallIdsRef.current.has(route.callId) || wasVideoAcceptedOrActive(route)) return;
      finishLocal(route.incoming ? "missed" : "no_answer");
    }, timeoutMs);

    return () => clearTimeout(timer);
  }, [finishLocal, phase, route.callId, route.incoming]);

  const markVideoAcceptedConnecting = useCallback((reason: string) => {
    if (!mountedRef.current || endedCallIdsRef.current.has(route.callId)) return;
    rememberVideoAcceptedOrActive(route, "accepted");

    // VIDEO-CALLS-1.9_STABLE_RESET:
    // Late duplicate answer / camera renegotiation must not move an already
    // connected video call back to connecting. This keeps the timer alive.
    if (phaseRef.current === "active" || activeStartedAtRef.current) {
      callDebug("accepted:connecting:skip_active", { reason, currentPhase: phaseRef.current });
      return;
    }

    callDebug("accepted:connecting", { reason });
    phaseRef.current = "connecting";
    setPhase("connecting");
    setStatusKey("connecting");
  }, [callDebug, route]);

  const accept = useCallback(() => {
    if (!route.incoming || acceptedRef.current) return;

    acceptedRef.current = true;
    clearInviteRetryTimers();
    clearIncomingPrewarmTimer();
    if (preacceptOfferTimerRef.current) {
      clearTimeout(preacceptOfferTimerRef.current);
      preacceptOfferTimerRef.current = null;
    }
    markVideoAcceptedConnecting("local_accept");
    recordCallHistory("call:accepted", { event: "accepted", status: "connecting", phase: "connecting" });

    acceptedVideoWantedRef.current = true;
    setCameraEnabledState(true);
    setVideoLayoutEnabled(true);

    const payload = makeCallPayload(route, {
      event: "accepted",
      signalKind: "accepted",
      phase: "connecting",
      status: "connecting" as const,
    });

    callDebug("accept:emit", summarizeSabiCallPayloadForDebug(payload));
    emitSabiCallTransportEvent(socket, "call:accepted", payload);

    const pendingOfferPayload = pendingOfferPayloadRef.current;
    pendingOfferPayloadRef.current = null;

    if (pendingOfferPayload && hasSabiSessionDescription(pendingOfferPayload)) {
      if (!handlingOfferRef.current) {
        handlingOfferRef.current = true;
        void ensurePeer().handleOffer(pendingOfferPayload).then(() => {
          enableAcceptedIncomingCamera("local_accept_pending_offer_answered");
        }).finally(() => {
          handlingOfferRef.current = false;
          flushPendingRemoteIcePayloads("local_accept_pending_offer");
        });
      }
      return;
    }

    if (wasVideoPairJustFinished(route)) {
      callDebug("incoming:prepare_after_accept:start", { reason: "repeat_waiting_offer" });
      void (ensurePeer() as any).prepareLocalMedia?.("repeat_waiting_offer_after_accept")
        .then(() => {
          if (!mountedRef.current || endedCallIdsRef.current.has(route.callId)) return;
          callDebug("incoming:prepare_after_accept:ready", { reason: "repeat_waiting_offer" });
          flushPendingRemoteIcePayloads("local_accept_prepare_ready");
        })
        .catch((error: unknown) => {
          callDebug("incoming:prepare_after_accept:error", { message: error instanceof Error ? error.message : String(error) });
        });
    }

    flushPendingRemoteIcePayloads("local_accept");
    // CALL-LOCKED-RELAY-16: incoming side only confirms accept.
    // The outgoing caller creates the first WebRTC offer after accepted is received.
  }, [callDebug, clearIncomingPrewarmTimer, clearInviteRetryTimers, enableAcceptedIncomingCamera, ensurePeer, flushPendingRemoteIcePayloads, markVideoAcceptedConnecting, recordCallHistory, route, socket]);

  useEffect(() => {
    // CALL-PUSH-AUTO-ACCEPT:
    // Notification Accept opens the existing video call screen and triggers the
    // same accept handler once. UI, buttons and layout stay unchanged.
    if (!autoAcceptFromNotification || !route.incoming || acceptedRef.current || endedCallIdsRef.current.has(route.callId)) {
      return undefined;
    }

    const timer = setTimeout(() => {
      if (!acceptedRef.current && !endedCallIdsRef.current.has(route.callId)) accept();
    }, 120);

    return () => clearTimeout(timer);
  }, [accept, autoAcceptFromNotification, route.callId, route.incoming]);

  const toggleMic = useCallback(() => {
    if (endedCallIdsRef.current.has(route.callId) || phase === "ended") return;
    const next = !micEnabled;
    setMicEnabledState(next);
    peerRef.current?.setMicEnabled(next);
  }, [micEnabled, phase, route.callId]);

  const toggleSpeaker = useCallback(() => {
    if (endedCallIdsRef.current.has(route.callId) || phase === "ended") return;
    const next = !speakerEnabled;
    setSpeakerEnabledState(next);
    clearSpeakerRetryTimers();
    void peerRef.current?.setSpeakerEnabled(next);
    speakerRetryTimersRef.current.push(setTimeout(() => void peerRef.current?.setSpeakerEnabled(next), 250));
    speakerRetryTimersRef.current.push(setTimeout(() => void peerRef.current?.setSpeakerEnabled(next), 900));
    speakerRetryTimersRef.current.push(setTimeout(() => void peerRef.current?.setSpeakerEnabled(next), 1600));
  }, [clearSpeakerRetryTimers, phase, route.callId, speakerEnabled]);

  const toggleCamera = useCallback(() => {
    if (endedCallIdsRef.current.has(route.callId) || phase === "ended") return;
    const next = !cameraEnabled;
    acceptedVideoWantedRef.current = next;

    const remoteVideoStillLive = Boolean(
      !remoteCameraOff &&
        (hasSabiRenderableVideoTrack(stableRemoteVideoStream) || hasSabiRenderableVideoTrack(remoteStream)),
    );

    setCameraEnabledState(next);
    setVideoLayoutEnabled(next || remoteVideoStillLive);

    if (!next) setRemoteMain(true);

    if (phase === "connecting" || phase === "active") {
      const mediaStatePayload = makeCallPayload(route, {
        event: next ? "camera_on" : "camera_off",
        action: next ? "camera_on" : "camera_off",
        signalKind: next ? "camera_on" : "camera_off",
        phase,
        status: phase,
        cameraEnabled: next,
        videoEnabled: next,
        mediaState: next ? "camera_on" : "camera_off",
      });

      emitSabiCallTransportEvent(socket, "call:media:state", mediaStatePayload);
      emitSabiCallTransportEvent(socket, "call:camera:state", mediaStatePayload);

      void ensurePeer().setCameraEnabled(next);
    }
  }, [
    cameraEnabled,
    ensurePeer,
    phase,
    remoteCameraOff,
    remoteStream,
    route,
    setRemoteMain,
    socket,
    stableRemoteVideoStream,
  ]);

  const switchCamera = useCallback(() => {
    if (endedCallIdsRef.current.has(route.callId) || phase === "ended") return;
    acceptedVideoWantedRef.current = true;
    setCameraEnabledState(true);
    setVideoLayoutEnabled(true);

    if (phase === "connecting" || phase === "active") {
      void ensurePeer().switchCamera().then((nextFacing) => {
        setCameraFacing(nextFacing);
      });
    } else {
      setCameraFacing((value) => (value === "user" ? "environment" : "user"));
    }
  }, [ensurePeer, phase, route.callId]);

  const togglePresentation = useCallback(() => {
    const next = !presentationEnabled;
    setPresentationEnabledState(next);

    emitSabiCallTransportEvent(
      socket,
      next ? "sabi-call:presentation:start" : "sabi-call:presentation:stop",
      makeCallPayload(route, {
        event: next ? "presentation_start" : "presentation_stop",
      }),
    );
  }, [presentationEnabled, route, socket]);

  const toggleAi = useCallback(() => {
    const next = !aiEnabled;
    setAiEnabledState(next);

    emitSabiCallTransportEvent(
      socket,
      next ? "sabi-call:translation:start" : "sabi-call:translation:stop",
      makeCallPayload(route, {
        event: next ? "translation_start" : "translation_stop",
        sourceLanguage: "auto",
        targetLanguage: language,
      }),
    );
  }, [aiEnabled, language, route, socket]);

  useEffect(() => {
    const handleAccepted = (payload: unknown) => {
      if (route.incoming || endedCallIdsRef.current.has(route.callId) || phase === "ended" || wasCallJustFinished(route)) return;
      if (!payloadMatches(route, payload)) return;
      if (!isFromPeer(route, payload)) return;
      if (isStaleSabiVideoSignal(payload)) {
        callDebug("accepted:ignored_stale", summarizeSabiCallPayloadForDebug(payload));
        return;
      }
      if (!shouldProcessSignal("call:accepted", payload)) return;
      if (acceptedRef.current) return;
      callDebug("accepted:recv", summarizeSabiCallPayloadForDebug(payload));

      acceptedRef.current = true;
      clearInviteRetryTimers();
      if (preacceptOfferTimerRef.current) {
        clearTimeout(preacceptOfferTimerRef.current);
        preacceptOfferTimerRef.current = null;
      }
      markVideoAcceptedConnecting("remote_accept");
      recordCallHistory("call:accepted", { event: "accepted", status: "connecting", phase: "connecting" });

      void stopSabiCallToneNow();
      const peer = ensurePeer();
      void peer.startCaller().finally(() => flushPendingRemoteIcePayloads("after_start_caller"));
      // VIDEO-CALLS-2.0: if the repeat outgoing offer was sent without local
      // camera/mic to avoid the Android repeat getUserMedia stall, attach media
      // after Accept. If the peer is not stable yet, the runtime will skip a
      // premature renegotiate and the next answer/peer-state path will keep the
      // call connected instead of blocking the invite.
      if (wasVideoPairJustFinished(route)) {
        void peer.setCameraEnabled(true).catch((error: unknown) => {
          callDebug("outgoing:camera_after_accept:error", { message: error instanceof Error ? error.message : String(error) });
        });
      }
    };

    const handleOffer = (payload: unknown, alreadyDeduped = false) => {
      if (endedCallIdsRef.current.has(route.callId) || phase === "ended") return;
      if (!payloadMatches(route, payload)) return;
      if (!isFromPeer(route, payload)) return;

      const isCameraOffSignal = isSabiCameraOffSignal(payload);
      const isCameraOnSignal = isSabiCameraOnSignal(payload);
      const hasDescription = hasSabiSessionDescription(payload);

      callDebug("offer:recv", summarizeSabiCallPayloadForDebug(payload));
      if (!route.incoming && !acceptedRef.current) {
        acceptedRef.current = true;
        markVideoAcceptedConnecting("remote_offer");
      }
      if (route.incoming && !acceptedRef.current) {
        if (wasVideoAcceptedOrActive(route)) {
          callDebug("offer:ignored_duplicate_visible_owner", summarizeSabiCallPayloadForDebug(payload));
          if (hasDescription && !pendingOfferPayloadRef.current) pendingOfferPayloadRef.current = payload;
          return;
        }
        if (hasDescription) pendingOfferPayloadRef.current = payload;
        return;
      }

      if (isCameraOffSignal) {
        remoteCameraOffRef.current = true;
        setRemoteCameraOff(true);
        setStableRemoteVideoStream(null);
        setStableRemoteVideoUrl("");
        setRemoteMain(true);
        setVideoLayoutEnabled(Boolean(cameraEnabled || localStream?.getVideoTracks?.()?.length));
      } else if (isCameraOnSignal) {
        remoteCameraOffRef.current = false;
        setRemoteCameraOff(false);
      }

      if (!hasDescription && (isCameraOffSignal || isCameraOnSignal)) return;
      if (!alreadyDeduped && !shouldProcessSignal("call:webrtc:offer", payload)) return;

      if (handlingOfferRef.current) {
        callDebug("offer:ignored_already_handling", summarizeSabiCallPayloadForDebug(payload));
        return;
      }

      if (phaseRef.current !== "active" && !activeStartedAtRef.current) {
        phaseRef.current = "connecting";
        setPhase("connecting");
        setStatusKey("connecting");
      }

      // Do not close the accepted incoming peer on every offer. The previous
      // close/recreate path allowed duplicate offer deliveries to close the peer
      // while setLocalDescription(answer) was still running, leaving both sides
      // in closed/new states. Keep one peer per call and only let the runtime
      // handle the SDP offer once.
      handlingOfferRef.current = true;
      void ensurePeer().handleOffer(payload).then(() => {
        if (route.incoming && acceptedRef.current) {
          enableAcceptedIncomingCamera("offer_answered");
        }
      }).finally(() => {
        handlingOfferRef.current = false;
        flushPendingRemoteIcePayloads("after_handle_offer");
      });
    };

    const handleAnswer = (payload: unknown, alreadyDeduped = false) => {
      if (endedCallIdsRef.current.has(route.callId) || phase === "ended") return;
      if (!payloadMatches(route, payload)) return;
      if (!isFromPeer(route, payload)) return;
      if (!alreadyDeduped && !shouldProcessSignal("call:webrtc:answer", payload)) return;
      callDebug("answer:recv", summarizeSabiCallPayloadForDebug(payload));

      if (!peerRef.current) {
        callDebug("answer:ignored_no_peer", summarizeSabiCallPayloadForDebug(payload));
        return;
      }

      if (phaseRef.current !== "active" && !activeStartedAtRef.current) {
        markVideoAcceptedConnecting("remote_answer");
      }

      void peerRef.current.handleAnswer(payload).then(() => {
        if (!route.incoming && wasVideoPairJustFinished(route) && acceptedRef.current && !endedCallIdsRef.current.has(route.callId)) {
          void peerRef.current?.setCameraEnabled(true).catch((error: unknown) => {
            callDebug("outgoing:camera_after_answer:error", { message: error instanceof Error ? error.message : String(error) });
          });
        }
      }).finally(() => flushPendingRemoteIcePayloads("after_handle_answer"));
    };

    const handleIce = (payload: unknown, alreadyDeduped = false) => {
      if (endedCallIdsRef.current.has(route.callId) || phase === "ended") return;
      if (!payloadMatches(route, payload)) return;
      if (!isFromPeer(route, payload)) return;
      if (!alreadyDeduped && !shouldProcessSignal("call:webrtc:ice", payload)) return;
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

    const handleConnected = (payload: unknown) => {
      if (endedCallIdsRef.current.has(route.callId) || phase === "ended") return;
      if (!payloadMatches(route, payload)) return;
      if (!isFromPeer(route, payload)) return;
      if (!shouldProcessSignal("call:connected", payload)) return;
      callDebug("connected:recv", summarizeSabiCallPayloadForDebug(payload));

      acceptedRef.current = true;
      void stopSabiCallToneNow();
      rememberVideoAcceptedOrActive(route, "accepted");
      setStatusKey((current) => (current === "connected" ? current : "connecting"));
      // Do not start phase/timer from remote socket connected. Runtime starts
      // active state only from local WebRTC connected/completed peer state.
    };

    const handleEnded = (payload: unknown) => {
      if (endedCallIdsRef.current.has(route.callId)) return;
      callDebug("ended:recv", summarizeSabiCallPayloadForDebug(payload));
      if (!payloadMatches(route, payload)) return;
      if (!isFromPeer(route, payload)) return;
      if (!isRealCallEndPayload(payload)) return;
      if (!shouldProcessSignal("call:ended", payload)) return;

      const remoteEndText = [
        getSabiCallPayloadEvent(payload),
        payload && typeof payload === "object" ? sabiPayloadText((payload as Record<string, unknown>).endReason) : "",
        payload && typeof payload === "object" ? sabiPayloadText((payload as Record<string, unknown>).reason) : "",
        payload && typeof payload === "object" ? sabiPayloadText((payload as Record<string, unknown>).signalState) : "",
      ]
        .join(" ")
        .toLowerCase();

      if (isSoftNoAnswerReason(remoteEndText) && wasVideoAcceptedOrActive(route)) {
        callDebug("ended:ignored_no_answer_after_accept_or_connected", summarizeSabiCallPayloadForDebug(payload));
        return;
      }

      const hasLiveDirectMedia = Boolean(
        phase === "active" ||
          remoteStream ||
          stableRemoteVideoUrl ||
          stableRemoteVideoStream,
      );

      const explicitUserEnd =
        remoteEndText.includes("declined") ||
        remoteEndText.includes("local_end") ||
        remoteEndText.includes("remote_end") ||
        remoteEndText.includes("cancel") ||
        remoteEndText.includes("busy") ||
        remoteEndText.includes("hangup") ||
        remoteEndText.includes("hang_up");

      if (hasLiveDirectMedia && !explicitUserEnd) return;

      const missedBeforeAccept = Boolean(route.incoming && !acceptedRef.current && phase !== "active");
      const remoteEndMeta = normalizeSabiRemoteCallEnd(payload, missedBeforeAccept);
      recordCallHistory(remoteEndMeta.historyEvent, {
        event: remoteEndMeta.event,
        status: remoteEndMeta.status,
        phase: "ended",
        endReason: remoteEndMeta.endReason,
      });

      endedCallIdsRef.current.add(route.callId);
      clearVideoAcceptedOrActive(route);
      rememberFinishedCall(route);
      clearSpeakerRetryTimers();
      pendingOfferPayloadRef.current = null;
      pendingRemoteIcePayloadsRef.current = [];
      void stopSabiCallToneForCall(route.callId);

      closePeer();
      stopSabiMediaStream(localStream);
      stopSabiMediaStream(remoteStream);
      setRemoteStream(null);
      setStableRemoteVideoStream(null);
      setStableRemoteVideoUrl("");
      remoteCameraOffRef.current = false;
      setRemoteCameraOff(false);
      setProtectedLocalStream(null);
      phaseRef.current = "ended";
      setPhase("ended");
      setStatusKey("ended");

      closeCallRoute();
    };

    const handleSignal = (payload: unknown) => {
      const signalKind = getSabiWebrtcSignalKind(payload);
      if (!signalKind) return;

      const canonicalEvent = signalKind === "offer"
        ? "call:webrtc:offer"
        : signalKind === "answer"
          ? "call:webrtc:answer"
          : "call:webrtc:ice";

      if (!shouldProcessSignal(canonicalEvent, payload)) {
        return;
      }

      callDebug("signal:recv", { signalKind, ...summarizeSabiCallPayloadForDebug(payload) });

      if (signalKind === "offer") {
        handleOffer(payload, true);
        return;
      }

      if (signalKind === "answer") {
        handleAnswer(payload, true);
        return;
      }

      if (signalKind === "ice") {
        handleIce(payload, true);
      }
    };

    const acceptedEvents = [
      "call:accepted",
      "call:accept",
      "sabi-call:accepted",
      "sabi-call:accept",
    ];
    const signalEvents = [
      "call:webrtc:offer",
      "call:webrtc:answer",
      "call:webrtc:ice",
      "call:signal",
      "call_signal",
      "call:webrtc:signal",
      "sabi-call:signal",
      "video:call:signal",
      "video-call:signal",
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
      "sabi-call:declined",
      "sabi-call:missed",
      "sabi-call:cancelled",
      "sabi-call:busy",
    ];

    const unsubscribeAccepted = subscribeSabiCallTransportEvents(
      socket,
      acceptedEvents,
      handleAccepted,
      { currentUserId: route.userId, callId: route.callId },
    );
    const unsubscribeSignal = subscribeSabiCallTransportEvents(
      socket,
      signalEvents,
      handleSignal,
      { currentUserId: route.userId, callId: route.callId },
    );
    const unsubscribeConnected = subscribeSabiCallTransportEvents(
      socket,
      connectedEvents,
      handleConnected,
      { currentUserId: route.userId, callId: route.callId },
    );
    const unsubscribeEnded = subscribeSabiCallTransportEvents(
      socket,
      endedEvents,
      handleEnded,
      { currentUserId: route.userId, callId: route.callId },
    );

    return () => {
      unsubscribeAccepted();
      unsubscribeSignal();
      unsubscribeConnected();
      unsubscribeEnded();
    };
  }, [
    callDebug,
    cameraEnabled,
    clearSpeakerRetryTimers,
    closePeer,
    ensurePeer,
    flushPendingRemoteIcePayloads,
    localStream,
    remoteStream,
    recordCallHistory,
    phase,
    route,
    routeKey,
    setProtectedLocalStream,
    shouldProcessSignal,
    socket,
    stableRemoteVideoStream,
    stableRemoteVideoUrl,
    markVideoAcceptedConnecting,
  ]);

  useEffect(() => {
    if (!socket || !route.callId) return undefined;

    const handleMediaState = (payload: unknown) => {
      if (!payloadMatches(route, payload)) return;
      if (!isFromPeer(route, payload)) return;

      if (isSabiCameraOffSignal(payload)) {
        remoteCameraOffRef.current = true;
        setRemoteCameraOff(true);
        setStableRemoteVideoStream(null);
        setStableRemoteVideoUrl("");
        setRemoteMain(true);
        setVideoLayoutEnabled(Boolean(cameraEnabled || localStream?.getVideoTracks?.()?.length));
        return;
      }

      if (isSabiCameraOnSignal(payload)) {
        remoteCameraOffRef.current = false;
        setRemoteCameraOff(false);
      }
    };

    const unsubscribeMediaState = subscribeSabiCallTransportEvents(
      socket,
      ["call:media:state", "call:camera:state", "call:signal", "call_signal", "call:webrtc:signal", "sabi-call:signal"],
      handleMediaState,
      { currentUserId: route.userId, callId: route.callId },
    );

    return () => {
      unsubscribeMediaState();
    };
  }, [cameraEnabled, localStream, route, setRemoteMain, socket]);

  const showAccept = route.incoming && phase === "ringing";
  const active = phase === "active";
  const remoteHasLiveVideo = Boolean(
    !remoteCameraOff &&
      (hasSabiRenderableVideoTrack(stableRemoteVideoStream) || hasSabiRenderableVideoTrack(remoteStream)),
  );
  const remoteHasVideo = Boolean(remoteHasLiveVideo && (stableRemoteVideoUrl || stableRemoteVideoStream || remoteStream));
  const localHasVideo = Boolean(
    localStream?.getVideoTracks?.()?.some(
      (track: any) => track.readyState !== "ended" && track.enabled !== false,
    ),
  );

  const showingVideo = videoLayoutEnabled || cameraEnabled || remoteHasVideo || localHasVideo;

  const remoteVideoStream = remoteHasVideo ? stableRemoteVideoStream || remoteStream : null;
  const localVideoStream = localHasVideo ? localStream : null;

  const mainStream = showingVideo
    ? remoteMain
      ? remoteVideoStream
      : localVideoStream || remoteVideoStream
    : null;

  const miniStream =
    showingVideo && localVideoStream
      ? remoteMain
        ? localVideoStream
        : remoteVideoStream
      : null;

  const mainStreamUrl = useMemo(() => {
    if (remoteMain) {
      if (remoteHasVideo && stableRemoteVideoUrl) return stableRemoteVideoUrl;
      if (remoteHasVideo && remoteVideoStream && typeof remoteVideoStream.toURL === "function") {
        return String(remoteVideoStream.toURL());
      }
      return "";
    }

    if (mainStream === localVideoStream && !localHasVideo) return "";
    if (mainStream === remoteVideoStream && !remoteHasVideo) return "";

    return mainStream && typeof mainStream.toURL === "function" ? String(mainStream.toURL()) : "";
  }, [localHasVideo, localVideoStream, mainStream, remoteHasVideo, remoteMain, remoteVideoStream, stableRemoteVideoUrl]);

  const miniStreamUrl = useMemo(
    () => (miniStream && typeof miniStream.toURL === "function" ? String(miniStream.toURL()) : ""),
    [miniStream],
  );

  const hiddenRemoteMediaUrl = useMemo(
    () => (remoteStream && typeof remoteStream.toURL === "function" ? String(remoteStream.toURL()) : ""),
    [remoteStream],
  );

  const shouldRenderHiddenRemoteMedia = Boolean(
    hiddenRemoteMediaUrl && (!remoteHasVideo || !mainStreamUrl),
  );

  const compactVideoUrl = useMemo(() => {
    if (!showingVideo) return "";

    if (remoteHasVideo) {
      if (stableRemoteVideoUrl) return stableRemoteVideoUrl;
      if (remoteVideoStream && typeof remoteVideoStream.toURL === "function") {
        return String(remoteVideoStream.toURL());
      }
    }

    if (localHasVideo && localVideoStream && typeof localVideoStream.toURL === "function") {
      return String(localVideoStream.toURL());
    }

    return "";
  }, [localHasVideo, localVideoStream, remoteHasVideo, remoteVideoStream, showingVideo, stableRemoteVideoUrl]);

  const compactShowsLocalVideo = Boolean(compactVideoUrl && !remoteHasVideo && localHasVideo);
  const compactVideoMirror = compactShowsLocalVideo && cameraFacing === "user";
  const compactVideoMode = Boolean(showingVideo);

  if (compact) {
    return (
      <View style={styles.compactRoot} pointerEvents="box-none">
        {shouldRenderHiddenRemoteMedia ? (
          <RTCView
            streamURL={hiddenRemoteMediaUrl}
            style={styles.hiddenRemoteMedia}
            objectFit="cover"
          />
        ) : null}

        {compactVideoMode ? (
          <Pressable style={styles.compactVideoCard} onPress={() => setCompact(false)}>
            {compactVideoUrl ? (
              <RTCView
                key={compactVideoUrl}
                streamURL={compactVideoUrl}
                style={styles.compactVideoFull}
                objectFit="cover"
                mirror={compactVideoMirror}
                zOrder={20}
              />
            ) : routeAvatarUrl ? (
              <Image source={{ uri: routeAvatarUrl }} style={styles.compactVideoFallbackPhoto} />
            ) : (
              <View style={styles.compactVideoFallback}>
                <Text style={styles.compactVideoFallbackText}>{route.avatarLetter}</Text>
              </View>
            )}

            <View style={styles.compactVideoShade} />

            <View style={styles.compactVideoFooter}>
              <View style={styles.compactVideoTextBox}>
                <Text style={styles.compactVideoName} numberOfLines={1}>
                  {route.name}
                </Text>
                <Text style={styles.compactVideoStatus} numberOfLines={1}>
                  {active ? clock(seconds) : text(statusKey)}
                </Text>
              </View>

              <Pressable
                style={styles.compactVideoEnd}
                onPress={(event) => {
                  event.stopPropagation?.();
                  finishLocal("local_end");
                }}
              >
                <MaterialCommunityIcons name="phone-hangup" size={20} color="#FFFFFF" />
              </Pressable>
            </View>
          </Pressable>
        ) : (
          <Pressable style={styles.compactCard} onPress={() => setCompact(false)}>
            {routeAvatarUrl ? (
              <Image source={{ uri: routeAvatarUrl }} style={styles.compactAvatarPhoto} />
            ) : (
              <View style={styles.compactAvatar}>
                <Text style={styles.compactAvatarText}>{route.avatarLetter}</Text>
              </View>
            )}

            <View style={styles.compactTextBox}>
              <Text style={styles.compactName} numberOfLines={1}>
                {route.name}
              </Text>
              <Text style={styles.compactStatus} numberOfLines={1}>
                {active ? clock(seconds) : text(statusKey)}
              </Text>
            </View>

            <Pressable
              style={styles.compactEnd}
              onPress={(event) => {
                event.stopPropagation?.();
                finishLocal("local_end");
              }}
            >
              <MaterialCommunityIcons name="phone-hangup" size={20} color="#FFFFFF" />
            </Pressable>
          </Pressable>
        )}
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      {shouldRenderHiddenRemoteMedia ? (
        <RTCView
          streamURL={hiddenRemoteMediaUrl}
          style={styles.hiddenRemoteMedia}
          objectFit="cover"
        />
      ) : null}

      {showingVideo && mainStreamUrl ? (
        <RTCView
          streamURL={mainStreamUrl}
          style={styles.fullVideo}
          objectFit="cover"
          mirror={!remoteMain && cameraFacing === "user"}
          zOrder={0}
        />
      ) : (
        <View style={styles.waitingBackdrop}>
          <View style={styles.patternOne} />
          <View style={styles.patternTwo} />
          <View style={styles.avatarImage}>
            {routeAvatarUrl ? (
              <Image source={{ uri: routeAvatarUrl }} style={styles.avatarPhoto} />
            ) : (
              <Text style={styles.avatarText}>{route.avatarLetter}</Text>
            )}
          </View>
        </View>
      )}

      <View style={styles.topBar}>
        <Pressable style={styles.topCircle} onPress={() => setCompact(true)}>
          <MaterialCommunityIcons name="arrow-collapse-all" size={24} color="#FFFFFF" />
        </Pressable>

        <View style={styles.titleBox}>
          <Text style={styles.name} numberOfLines={1}>
            {route.name}
          </Text>
          <Text style={styles.secure} numberOfLines={1}>
            <MaterialCommunityIcons name="lock" size={13} color={theme.muted} />{" "}
            {showingVideo ? (active ? clock(seconds) : text(statusKey)) : text("secure")}
          </Text>
        </View>

        <View style={styles.topCircle} pointerEvents="none" />
      </View>

      {showingVideo ? (
        <>
          {miniStreamUrl ? (
            <Animated.View
              style={[
                styles.selfPreview,
                {
                  left: miniPreviewPan.x,
                  top: miniPreviewPan.y,
                  right: undefined,
                  bottom: undefined,
                },
              ]}
              {...miniPreviewPanResponder.panHandlers}
            >
              <Pressable style={styles.selfPreviewPressable} onPress={() => setRemoteMain((value) => !value)}>
                <RTCView
                  streamURL={miniStreamUrl}
                  style={styles.selfVideo}
                  objectFit="cover"
                  mirror={remoteMain && cameraFacing === "user"}
                  zOrder={1}
                />
              </Pressable>
            </Animated.View>
          ) : null}

          <View style={styles.rightRail}>
            <SideButton icon="camera-flip" active onPress={switchCamera} />
          </View>
        </>
      ) : (
        <View style={styles.statusBox}>
          <Text style={styles.statusText}>{active ? clock(seconds) : text(statusKey)}</Text>
        </View>
      )}

      {moreOpen ? (
        <View style={styles.morePanel}>
          <Pressable
            style={[styles.moreItem, presentationEnabled ? styles.moreItemActive : null]}
            onPress={() => {
              togglePresentation();
              setMoreOpen(false);
            }}
          >
            <View style={styles.moreIcon}>
              <MaterialCommunityIcons name="presentation-play" size={22} color="#FFFFFF" />
            </View>
            <Text style={styles.moreText}>{text("presentation")}</Text>
          </Pressable>

          <Pressable
            style={[styles.moreItem, aiEnabled ? styles.moreItemActive : null]}
            onPress={() => {
              toggleAi();
              setMoreOpen(false);
            }}
          >
            <View style={styles.moreIcon}>
              <MaterialCommunityIcons name="translate" size={22} color="#FFFFFF" />
            </View>
            <Text style={styles.moreText}>{text("aiTranslate")}</Text>
          </Pressable>
        </View>
      ) : null}

      {showAccept ? (
        <View style={styles.acceptLayer}>
          <Pressable style={styles.acceptButton} onPress={accept}>
            <MaterialCommunityIcons name="phone" size={28} color="#FFFFFF" />
            <Text style={styles.acceptText}>{text("accept")}</Text>
          </Pressable>
        </View>
      ) : null}

      <View style={styles.dock}>
        <DockButton icon="dots-horizontal" active={moreOpen} onPress={() => setMoreOpen((value) => !value)} />
        <DockButton icon={cameraEnabled ? "video" : "video-off"} active={cameraEnabled} onPress={toggleCamera} />
        <DockButton icon="volume-high" active={speakerEnabled} light onPress={toggleSpeaker} />
        <DockButton icon={micEnabled ? "microphone" : "microphone-off"} active={micEnabled} onPress={toggleMic} />
        <DockButton icon="phone-hangup" danger onPress={() => finishLocal(showAccept ? "declined" : "local_end")} />
      </View>
    </View>
  );
}

function DockButton(props: {
  icon: IconName;
  active?: boolean;
  danger?: boolean;
  light?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={[
        baseStyles.dockButton,
        props.light ? baseStyles.dockButtonLight : null,
        props.danger ? baseStyles.dockButtonDanger : null,
        props.active === false ? baseStyles.dockButtonDim : null,
      ]}
      onPress={props.onPress}
    >
      <MaterialCommunityIcons name={props.icon} size={25} color={props.light ? "#071011" : "#FFFFFF"} />
    </Pressable>
  );
}

function SideButton(props: {
  icon: IconName;
  active?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={[baseStyles.sideButton, props.active ? baseStyles.sideButtonActive : null]}
      onPress={props.onPress}
    >
      <MaterialCommunityIcons name={props.icon} size={25} color="#FFFFFF" />
    </Pressable>
  );
}

const baseStyles = StyleSheet.create({
  dockButton: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "rgba(22,35,38,0.96)",
    alignItems: "center",
    justifyContent: "center",
  },
  dockButtonLight: {
    backgroundColor: "rgba(255,255,255,0.96)",
  },
  dockButtonDanger: {
    backgroundColor: "#FF1744",
  },
  dockButtonDim: {
    opacity: 0.48,
  },
  sideButton: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "rgba(20,32,36,0.95)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  sideButtonActive: {
    backgroundColor: "rgba(37,211,102,0.72)",
  },
});

function createStyles(theme: ReturnType<typeof makeTheme>) {
  return StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: theme.bg,
    },
    fullVideo: {
      ...StyleSheet.absoluteFillObject,
    },
    waitingBackdrop: {
      flex: 1,
      backgroundColor: theme.bg,
      alignItems: "center",
      justifyContent: "center",
    },
    patternOne: {
      position: "absolute",
      width: 360,
      height: 360,
      borderRadius: 180,
      backgroundColor: theme.accent + "18",
      top: -120,
      right: -120,
    },
    patternTwo: {
      position: "absolute",
      width: 420,
      height: 420,
      borderRadius: 210,
      backgroundColor: "rgba(39,151,255,0.10)",
      bottom: -150,
      left: -160,
    },
    avatarImage: {
      width: 214,
      height: 214,
      borderRadius: 107,
      backgroundColor: "rgba(255,255,255,0.16)",
      borderWidth: 2,
      borderColor: "rgba(255,255,255,0.26)",
      alignItems: "center",
      justifyContent: "center",
    },
    avatarText: {
      color: theme.text,
      fontSize: 76,
      fontWeight: "900",
    },
    avatarPhoto: {
      width: "100%",
      height: "100%",
      borderRadius: 107,
    },
    topBar: {
      position: "absolute",
      top: 42,
      left: 18,
      right: 18,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      zIndex: 30,
      elevation: 30,
    },
    topCircle: {
      width: 58,
      height: 58,
      borderRadius: 29,
      backgroundColor: "rgba(20,32,36,0.95)",
      alignItems: "center",
      justifyContent: "center",
    },
    titleBox: {
      flex: 1,
      alignItems: "center",
      paddingHorizontal: 14,
    },
    name: {
      color: theme.text,
      fontSize: 20,
      fontWeight: "800",
    },
    secure: {
      color: theme.muted,
      fontSize: 14,
      fontWeight: "700",
      marginTop: 4,
    },
    selfPreview: {
      position: "absolute",
      right: 18,
      bottom: 112,
      width: 128,
      height: 184,
      borderRadius: 22,
      overflow: "hidden",
      backgroundColor: "#111",
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.32)",
      zIndex: 20,
      elevation: 20,
    },
    selfPreviewPressable: {
      flex: 1,
    },
    selfVideo: {
      flex: 1,
    },
    rightRail: {
      position: "absolute",
      top: 132,
      right: 18,
      zIndex: 5,
    },
    statusBox: {
      position: "absolute",
      left: 0,
      right: 0,
      bottom: 136,
      alignItems: "center",
    },
    statusText: {
      color: theme.muted,
      fontSize: 17,
      fontWeight: "800",
    },
    acceptLayer: {
      position: "absolute",
      left: 0,
      right: 0,
      bottom: 122,
      alignItems: "center",
      zIndex: 8,
    },
    acceptButton: {
      minWidth: 132,
      height: 62,
      borderRadius: 31,
      backgroundColor: theme.accent,
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "row",
      paddingHorizontal: 20,
      gap: 8,
    },
    acceptText: {
      color: theme.text,
      fontSize: 15,
      fontWeight: "900",
    },
    morePanel: {
      position: "absolute",
      left: 18,
      right: 18,
      bottom: 118,
      borderRadius: 26,
      backgroundColor: "rgba(8,17,20,0.96)",
      borderWidth: 1,
      borderColor: theme.border,
      padding: 12,
      zIndex: 10,
      flexDirection: "row",
      justifyContent: "space-between",
      gap: 10,
    },
    moreItem: {
      flex: 1,
      minHeight: 78,
      borderRadius: 22,
      backgroundColor: "rgba(255,255,255,0.10)",
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.12)",
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 10,
    },
    moreItemActive: {
      backgroundColor: theme.accent,
      borderColor: theme.accent,
    },
    moreIcon: {
      width: 38,
      height: 38,
      borderRadius: 19,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "rgba(255,255,255,0.12)",
      marginBottom: 7,
    },
    moreText: {
      color: theme.text,
      fontSize: 12,
      fontWeight: "900",
      textAlign: "center",
    },
    dock: {
      position: "absolute",
      left: 18,
      right: 18,
      bottom: 26,
      minHeight: 82,
      borderRadius: 22,
      backgroundColor: theme.dock,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-around",
      paddingHorizontal: 12,
      zIndex: 30,
      elevation: 30,
    },
    hiddenRemoteMedia: {
      position: "absolute",
      width: 1,
      height: 1,
      opacity: 0,
    },
    compactRoot: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: "transparent",
      alignItems: "flex-end",
      justifyContent: "flex-start",
      paddingTop: 54,
      paddingHorizontal: 12,
      zIndex: 1000,
      elevation: 1000,
    },
    compactCard: {
      width: 248,
      maxWidth: "92%",
      minHeight: 74,
      borderRadius: 24,
      padding: 10,
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "rgba(5,14,10,0.94)",
      borderWidth: 1,
      borderColor: theme.border,
      shadowColor: "#000",
      shadowOpacity: 0.26,
      shadowRadius: 18,
      shadowOffset: { width: 0, height: 10 },
      elevation: 24,
    },
    compactVideoCard: {
      width: 164,
      height: 238,
      borderRadius: 26,
      overflow: "hidden",
      backgroundColor: "rgba(5,14,10,0.96)",
      borderWidth: 1,
      borderColor: theme.border,
      shadowColor: "#000",
      shadowOpacity: 0.3,
      shadowRadius: 18,
      shadowOffset: { width: 0, height: 10 },
      elevation: 24,
    },
    compactVideoFull: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: "#050E0A",
    },
    compactVideoFallbackPhoto: {
      ...StyleSheet.absoluteFillObject,
      width: "100%",
      height: "100%",
      backgroundColor: "rgba(255,255,255,0.08)",
    },
    compactVideoFallback: {
      ...StyleSheet.absoluteFillObject,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.accent,
    },
    compactVideoFallbackText: {
      color: theme.text,
      fontSize: 44,
      fontWeight: "900",
    },
    compactVideoShade: {
      position: "absolute",
      left: 0,
      right: 0,
      bottom: 0,
      height: 86,
      backgroundColor: "rgba(0,0,0,0.36)",
    },
    compactVideoFooter: {
      position: "absolute",
      left: 10,
      right: 10,
      bottom: 10,
      minHeight: 44,
      flexDirection: "row",
      alignItems: "center",
    },
    compactVideoTextBox: {
      flex: 1,
      minWidth: 0,
      paddingRight: 8,
    },
    compactVideoName: {
      color: "#FFFFFF",
      fontSize: 13,
      fontWeight: "900",
    },
    compactVideoStatus: {
      color: "rgba(255,255,255,0.78)",
      fontSize: 11,
      fontWeight: "800",
      marginTop: 2,
    },
    compactVideoEnd: {
      width: 38,
      height: 38,
      borderRadius: 19,
      backgroundColor: theme.danger,
      alignItems: "center",
      justifyContent: "center",
    },
    compactAvatarPhoto: {
      width: 54,
      height: 54,
      borderRadius: 18,
      backgroundColor: "rgba(255,255,255,0.08)",
    },
    compactAvatar: {
      width: 54,
      height: 54,
      borderRadius: 18,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.accent,
    },
    compactAvatarText: {
      color: theme.text,
      fontSize: 18,
      fontWeight: "900",
    },
    compactTextBox: {
      flex: 1,
      marginHorizontal: 10,
      minWidth: 0,
    },
    compactName: {
      color: theme.text,
      fontSize: 14,
      fontWeight: "900",
    },
    compactStatus: {
      color: theme.muted,
      fontSize: 12,
      fontWeight: "800",
      marginTop: 2,
    },
    compactEnd: {
      width: 38,
      height: 38,
      borderRadius: 19,
      backgroundColor: theme.danger,
      alignItems: "center",
      justifyContent: "center",
    },
  });
}
