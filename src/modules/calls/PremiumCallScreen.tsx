import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { activateKeepAwakeAsync, deactivateKeepAwake } from "expo-keep-awake";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Animated, DeviceEventEmitter, FlatList, Image, PanResponder, Pressable, StyleSheet, Text, TextInput, useWindowDimensions, View } from "react-native";
import { RTCView } from "react-native-webrtc";

const SABI_VIDEO_CALL_KEEP_AWAKE_TAG = "sabi-video-call-screen";

import { useI18n } from "../../shared/i18n";
import { getSuperAppSocket } from "../../shared/realtime/superapp-socket";
import { recordMessengerCallRealtimeEvent } from "./callEventsRuntime";
import { isSabiCallInviteTarget, listSabiCallInviteContacts } from "./sabiCallContactSource";
import {
  clock,
  createStandardCallPeer,
  isFromPeer,
  isRealCallEndPayload,
  logSabiCallDebug,
  makeCallPayload,
  makeSignalKey,
  parseStandardCallRoute,
  summarizeSabiCallPayloadForDebug,
  payloadMatches,
  type StandardCallKind,
  type StandardCallPhase,
} from "./standardCallRuntime";
import { useSabiCallTone } from "./useSabiCallTone";
import { useSabiGroupCallBridge } from "./useSabiGroupCallBridge";

const SABI_FINAL_ACCEPTED_ONCE_LOCKS = new Map<string, number>();

type PeerHandle = ReturnType<typeof createStandardCallPeer>;
type IconName = keyof typeof MaterialCommunityIcons.glyphMap;

type CallContactCandidate = {
  id: string;
  name: string;
  phone: string;
  userId?: string;
  avatarLetter: string;
};

type GroupCallTile = {
  id: string;
  name: string;
  avatarLetter: string;
  avatarUrl?: string;
  stream?: any | null;
  isSelf?: boolean;
  isRemote?: boolean;
  status?: "active" | "invited" | "connecting";
};

const CALL_TEXT_KEYS = [
  "audio",
  "video",
  "incoming",
  "calling",
  "connecting",
  "connected",
  "ended",
  "secure",
  "waitingVideo",
  "videoCall",
  "accept",
  "decline",
  "end",
  "mic",
  "speaker",
  "camera",
  "presentation",
  "aiTranslate",
  "minimize",
  "swap",
  "more",
  "add",
] as const;

type TextKey = (typeof CALL_TEXT_KEYS)[number];

function normalizeContactPhone(value: unknown): string {
  return String(value || "")
    .replace(/[^+\d]/g, "")
    .trim();
}

function describeSabiMediaStreamForDebug(stream: any) {
  try {
    const audioTracks = stream?.getAudioTracks?.() || [];
    const videoTracks = stream?.getVideoTracks?.() || [];
    const allTracks = stream?.getTracks?.() || [];

    return {
      url: typeof stream?.toURL === "function" ? String(stream.toURL()) : "",
      tracks: allTracks.length,
      audio: audioTracks.length,
      video: videoTracks.length,
      videoEnabled: videoTracks.map((track: any) => Boolean(track?.enabled)).join(","),
      videoMuted: videoTracks.map((track: any) => Boolean(track?.muted)).join(","),
      videoReadyState: videoTracks.map((track: any) => String(track?.readyState || "")).join(","),
    };
  } catch (error) {
    return { error: String(error) };
  }
}

function markSabiCallAsActiveGroup(callId: unknown) {
  const id = String(callId || "").trim();
  if (!id) return;

  const activeGroupIds =
    (((globalThis as any).__sabiActiveGroupCallIds ||= new Set<string>()) as Set<string>);

  activeGroupIds.add(id);
}


function getSabiGroupParticipantsRegistry() {
  return (((globalThis as any).__sabiGroupCallParticipants ||= new Map<string, Set<string>>()) as Map<string, Set<string>>);
}

function normalizeSabiGroupParticipantIds(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .flatMap((item) => normalizeSabiGroupParticipantIds(item))
      .filter(Boolean);
  }

  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    return normalizeSabiGroupParticipantIds(
      record.userId || record.id || record.peerId || record.peerUserId || record.participantId,
    );
  }

  const raw = String(value || "").trim();
  if (!raw) return [];

  return raw
    .split(/[|,;\s]+/g)
    .map((item) => item.trim())
    .filter(Boolean);
}

function extractSabiGroupParticipantIds(payload: Record<string, unknown> | null | undefined): string[] {
  if (!payload) return [];

  return Array.from(
    new Set([
      ...normalizeSabiGroupParticipantIds(payload.participantIds),
      ...normalizeSabiGroupParticipantIds(payload.groupParticipantIds),
      ...normalizeSabiGroupParticipantIds(payload.participants),
      ...normalizeSabiGroupParticipantIds(payload.memberIds),
      ...normalizeSabiGroupParticipantIds(payload.members),
      ...normalizeSabiGroupParticipantIds(payload.existingParticipantIds),
      ...normalizeSabiGroupParticipantIds(payload.existingParticipants),
    ]),
  );
}

function callContactAvatarLetter(name: string): string {
  const match = name.match(/[A-Za-z\u0410-\u042F\u0430-\u044F\u0401\u04510-9]/u);
  return String(match?.[0] || name[0] || "S").toUpperCase();
}


function sabiParamText(params: Record<string, unknown>, key: string): string {
  const value = params[key];
  if (Array.isArray(value)) return typeof value[0] === "string" ? value[0].trim() : "";
  return typeof value === "string" ? value.trim() : "";
}

function isSabiGroupCallParams(params: Record<string, unknown>): boolean {
  const roomType = sabiParamText(params, "roomType").toLowerCase();
  const groupCall = sabiParamText(params, "groupCall").toLowerCase();
  const isGroupCall = sabiParamText(params, "isGroupCall").toLowerCase();
  const routeText = [
    sabiParamText(params, "event"),
    sabiParamText(params, "action"),
    sabiParamText(params, "direction"),
  ]
    .join("|")
    .toLowerCase();

  return (
    roomType === "group_call" ||
    groupCall === "1" ||
    groupCall === "true" ||
    isGroupCall === "1" ||
    isGroupCall === "true" ||
    routeText.includes("group_handoff") ||
    routeText.includes("handoff")
  );
}

function getSabiGroupScreenCache() {
  const root = globalThis as any;
  return ((root.__sabiGroupCallScreenCache ||= new Map<string, {
    localStream: any | null;
    startedAt: number;
  }>()) as Map<string, { localStream: any | null; startedAt: number }>);
}

function sabiGroupScreenCacheKey(callId: string, userId: string) {
  return [String(callId || ""), String(userId || "")].join("|");
}

function isSabiUserInsideCallId(callId: string, userId: string) {
  const callIdText = String(callId || "").trim();
  const userIdText = String(userId || "").trim();

  return Boolean(callIdText && userIdText && callIdText.includes(userIdText));
}

function isSabiInvitedGroupParticipant(callId: string, userId: string, isGroupCall: boolean) {
  if (!isGroupCall) return false;

  const callIdText = String(callId || "").trim();
  const userIdText = String(userId || "").trim();

  return Boolean(callIdText.startsWith("call:") && userIdText && !callIdText.includes(userIdText));
}

function hasLiveSabiTracks(stream: any | null | undefined): boolean {
  try {
    const tracks = stream?.getTracks?.() || [];
    return tracks.some((track: any) => track && track.readyState !== "ended");
  } catch {
    return false;
  }
}

function hasLiveSabiVideoTracks(stream: any | null | undefined): boolean {
  try {
    const videoTracks = stream?.getVideoTracks?.() || [];
    return videoTracks.some((track: any) => {
      if (!track || track.readyState === "ended") return false;
      if (track.enabled === false) return false;
      if (track.muted === true) return false;
      return true;
    });
  } catch {
    return false;
  }
}

function pickSabiPreferredStream(primary: any | null | undefined, fallback: any | null | undefined) {
  if (hasLiveSabiVideoTracks(primary)) return primary;
  if (hasLiveSabiVideoTracks(fallback)) return fallback;
  if (hasLiveSabiTracks(primary)) return primary;
  if (hasLiveSabiTracks(fallback)) return fallback;
  return primary || fallback || null;
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

function enableSabiScreenTracks(stream: any | null | undefined) {
  try {
    const tracks = stream?.getTracks?.() || [];
    tracks.forEach((track: any) => {
      if (track && "enabled" in track) track.enabled = true;
    });
  } catch {}
}

function sabiPayloadText(...values: unknown[]): string {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) return value.trim();
    if (typeof value === "number" && Number.isFinite(value)) return String(value);
    if (typeof value === "boolean") return value ? "true" : "false";
  }
  return "";
}

function isExplicitSabiGroupPayload(payload: unknown): boolean {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) return false;

  const body = payload as Record<string, unknown>;
  const roomType = sabiPayloadText(body.roomType, body.type, body.callType).toLowerCase();
  const event = sabiPayloadText(body.event, body.action, body.signalKind).toLowerCase();
  const groupCall = sabiPayloadText(body.groupCall, body.isGroupCall).toLowerCase();

  return (
    roomType === "group_call" ||
    roomType === "group" ||
    groupCall === "1" ||
    groupCall === "true" ||
    event.includes("group") ||
    Array.isArray(body.participants) ||
    Boolean(sabiPayloadText(body.participantIds, body.groupParticipantIds))
  );
}

function isExplicitSabiGroupEndPayload(payload: unknown): boolean {
  if (!isExplicitSabiGroupPayload(payload)) return false;
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) return false;

  const body = payload as Record<string, unknown>;
  const event = sabiPayloadText(body.event, body.action, body.status, body.phase).toLowerCase();
  const reason = sabiPayloadText(body.endReason, body.reason, body.signalState).toLowerCase();

  return (
    event.includes("ended") ||
    event.includes("declined") ||
    event.includes("cancel") ||
    reason.includes("local_end") ||
    reason.includes("remote_end") ||
    reason.includes("declined") ||
    reason.includes("cancel") ||
    reason.includes("busy")
  );
}

function getSabiPayloadCallId(payload: unknown): string {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) return "";

  const body = payload as Record<string, unknown>;
  return sabiPayloadText(body.callId, body.id, body.roomId);
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

function hasSabiSessionDescription(payload: unknown): boolean {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) return false;

  const body = payload as Record<string, unknown>;
  const description =
    body.description && typeof body.description === "object" && !Array.isArray(body.description)
      ? (body.description as Record<string, unknown>)
      : null;

  return Boolean(
    sabiPayloadText(body.sdp) ||
      sabiPayloadText(description?.sdp) ||
      sabiPayloadText(description?.type),
  );
}

function getSabiWebrtcSignalKind(payload: unknown): "offer" | "answer" | "ice" | "" {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) return "";

  const body = payload as Record<string, unknown>;
  const description =
    body.description && typeof body.description === "object" && !Array.isArray(body.description)
      ? (body.description as Record<string, unknown>)
      : null;
  const payloadRecord =
    body.payload && typeof body.payload === "object" && !Array.isArray(body.payload)
      ? (body.payload as Record<string, unknown>)
      : null;

  if (body.candidate || body.iceCandidate || payloadRecord?.candidate) return "ice";

  const descriptionType = sabiPayloadText(description?.type, body.descriptionType).toLowerCase();
  if (descriptionType === "offer" || descriptionType === "answer") return descriptionType;

  const text = [
    sabiPayloadText(body.signalKind),
    sabiPayloadText(body.event),
    sabiPayloadText(body.action),
    sabiPayloadText(body.type),
    sabiPayloadText(body.kind),
  ].join(" ").toLowerCase();

  if (text.includes("ice")) return "ice";
  if (text.includes("answer")) return "answer";
  if (text.includes("offer")) return "offer";

  if (sabiPayloadText(body.sdp)) {
    if (text.includes("answer")) return "answer";
    return "offer";
  }

  return "";
}

function hasSabiRenderableVideoTrack(stream: any | null | undefined): boolean {
  try {
    const videoTracks = stream?.getVideoTracks?.() || [];
    return videoTracks.some((track: any) => {
      if (!track || track.readyState === "ended") return false;
      if (track.enabled === false) return false;
      // Do not treat transient Android rn-webrtc `muted=true` as camera-off.
      // The remote side explicitly sends camera_off/camera_on during real toggles.
      return true;
    });
  } catch {
    return false;
  }
}

function isSabiActiveGroupCall(callId: unknown): boolean {
  const id = String(callId || "").trim();
  if (!id) return false;

  try {
    return Boolean(
      (((globalThis as any).__sabiActiveGroupCallIds || new Set<string>()) as Set<string>).has(id),
    );
  } catch {
    return false;
  }
}


function isSabiExplicitDirectEndReason(payload: unknown): boolean {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) return false;

  const body = payload as Record<string, unknown>;
  const text = [
    sabiPayloadText(body.endReason),
    sabiPayloadText(body.reason),
    sabiPayloadText(body.signalState),
    sabiPayloadText(body.action),
    sabiPayloadText(body.status),
    sabiPayloadText(body.phase),
  ].join(" ").toLowerCase();

  return (
    text.includes("declined") ||
    text.includes("local_end") ||
    text.includes("remote_end") ||
    text.includes("cancel") ||
    text.includes("busy") ||
    text.includes("hangup") ||
    text.includes("hang_up")
  );
}
function sabiDirectEndText(payload: unknown): string {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) return "";

  const body = payload as Record<string, unknown>;
  return [
    sabiPayloadText(body.event),
    sabiPayloadText(body.action),
    sabiPayloadText(body.status),
    sabiPayloadText(body.phase),
    sabiPayloadText(body.endReason),
    sabiPayloadText(body.reason),
    sabiPayloadText(body.signalState),
  ].join(" ").toLowerCase();
}

type SabiCallEndMeta = {
  event: "ended" | "declined" | "missed" | "cancelled" | "busy";
  status: "ended" | "declined" | "missed" | "cancelled" | "busy";
  historyEvent: "call:ended" | "call:declined" | "call:missed" | "call:cancelled" | "call:busy";
  endReason: string;
};

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
  const text = sabiDirectEndText(payload);

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
function closeCallRoute() {
  const routerWithBack = router as unknown as {
    canGoBack?: () => boolean;
    back: () => void;
    replace: (href: never) => void;
  };

  if (typeof routerWithBack.canGoBack === "function" && routerWithBack.canGoBack()) {
    routerWithBack.back();
    return;
  }

  routerWithBack.replace("/" as never);
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

export default function PremiumCallScreen({ kind }: { kind: StandardCallKind }) {
  const { t, language } = useI18n();
  const params = useLocalSearchParams();

  const parsedRoute = parseStandardCallRoute(params as Record<string, unknown>, kind);
  const groupCallsEnabled = false;
  const parsedGroupCallRoute = groupCallsEnabled && isSabiGroupCallParams(params as Record<string, unknown>);

  // SABI_GROUP_ROUTE_STABLE_KEY
  // Group handoff and participant events can arrive with different peerId/action fields
  // for the same active call. The call screen must not reset timer/camera on those
  // same-call route updates. For group calls the stable key is callId + self user.
  const parsedRouteKey = parsedGroupCallRoute
    ? [
        parsedRoute.callId,
        parsedRoute.chatId,
        parsedRoute.roomId,
        parsedRoute.userId,
        parsedRoute.kind,
        "group_call",
      ].join("|")
    : [
        parsedRoute.callId,
        parsedRoute.chatId,
        parsedRoute.roomId,
        parsedRoute.userId,
        parsedRoute.peerId,
        parsedRoute.kind,
        parsedRoute.incoming ? "in" : "out",
      ].join("|");

  const routeRef = useRef(parsedRoute);
  const routeKeyRef = useRef(parsedRouteKey);

  if (routeKeyRef.current !== parsedRouteKey) {
    routeKeyRef.current = parsedRouteKey;
    routeRef.current = parsedRoute;
  }

  const route = routeRef.current;
  const routeKey = routeKeyRef.current;

  const callDebug = useCallback((stage: string, details: Record<string, unknown> = {}) => {
    logSabiCallDebug(routeRef.current, "screen:" + stage, details);
  }, []);
  const isInvitedGroupParticipantRoute = groupCallsEnabled && isSabiInvitedGroupParticipant(
    route.callId,
    route.userId,
    parsedGroupCallRoute,
  );
  const shouldAutoActivateGroupRoute = Boolean(
    groupCallsEnabled && parsedGroupCallRoute && isSabiUserInsideCallId(route.callId, route.userId),
  );

  const theme = useMemo(() => makeTheme(route.accent, route.background), [route.accent, route.background]);
  const styles = useMemo(() => createStyles(theme), [theme]);

  const text = useCallback(
    (key: TextKey) => {
      const i18nKey = "calls." + key;
      const translated = t(i18nKey);
      if (translated && translated !== i18nKey) return translated;

      return i18nKey;
    },
    [language, t],
  );

  const socket = useMemo(() => getSuperAppSocket(route.userId || undefined), [route.userId]);

  // SABI_GROUP_RAW_ROUTE_PARAMS_EARLY
  const rawGroupRouteParams = useLocalSearchParams<Record<string, string | string[]>>();

  const rawGroupRouteText = useCallback((key: string) => {
    const value = rawGroupRouteParams[key];
    return Array.isArray(value) ? String(value[0] || "") : String(value || "");
  }, [rawGroupRouteParams]);
  const routeAvatarUrl = useMemo(() => {
    return (
      rawGroupRouteText("avatarUrl") ||
      rawGroupRouteText("photoUrl") ||
      rawGroupRouteText("avatarUri") ||
      rawGroupRouteText("profilePhotoUrl") ||
      String((route as any).avatarUrl || (route as any).photoUrl || "")
    ).trim();
  }, [rawGroupRouteText, route]);

  const selfAvatarUrl = useMemo(() => {
    return (
      rawGroupRouteText("selfAvatarUrl") ||
      rawGroupRouteText("myAvatarUrl") ||
      rawGroupRouteText("currentUserAvatarUrl") ||
      ""
    ).trim();
  }, [rawGroupRouteText]);

const [phase, setPhase] = useState<StandardCallPhase>(
    route.incoming || isInvitedGroupParticipantRoute ? "ringing" : "calling",
  );
  const [statusKey, setStatusKey] = useState<TextKey>(
    route.incoming || isInvitedGroupParticipantRoute ? "incoming" : "calling",
  );
  const initialGroupCache = parsedGroupCallRoute
    ? getSabiGroupScreenCache().get(sabiGroupScreenCacheKey(parsedRoute.callId, parsedRoute.userId))
    : null;

  const [seconds, setSeconds] = useState(() => {
    if (parsedGroupCallRoute && initialGroupCache?.startedAt) {
      return Math.max(0, Math.floor((Date.now() - initialGroupCache.startedAt) / 1000));
    }

    return 0;
  });
  const activeStartedAtRef = useRef<number | null>(
    parsedGroupCallRoute && initialGroupCache?.startedAt ? initialGroupCache.startedAt : null,
  );
  const [localStream, setLocalStreamState] = useState<any | null>(() => {
    const cachedStream = initialGroupCache?.localStream ?? null;
    return hasLiveSabiTracks(cachedStream) ? cachedStream : null;
  });
  const [remoteStream, setRemoteStream] = useState<any | null>(null);
  const [stableRemoteVideoStream, setStableRemoteVideoStream] = useState<any | null>(null);
  const [stableRemoteVideoUrl, setStableRemoteVideoUrl] = useState("");
  const [remoteCameraOff, setRemoteCameraOff] = useState(false);

  const [micEnabled, setMicEnabledState] = useState(true);
  // SABI_ECHO_GUARD: audio calls start in earpiece mode to prevent acoustic echo.
  // The existing speaker button still enables loudspeaker manually.
  // SABI_CALLS_FINAL_A_MEDIA_START_POLICY:
  // Audio calls must never open camera/video. Incoming video calls must ring
  // without starting camera or loudspeaker until the user accepts the call.
  const initialVideoActive = route.kind === "video" && !route.incoming;
  const [speakerEnabled, setSpeakerEnabledState] = useState(() => initialVideoActive);
  const [cameraEnabled, setCameraEnabledState] = useState(initialVideoActive);
  const [videoLayoutEnabled, setVideoLayoutEnabled] = useState(initialVideoActive);
  const [cameraFacing, setCameraFacing] = useState<"user" | "environment">("user");
  const [presentationEnabled, setPresentationEnabledState] = useState(false);
  const [aiEnabled, setAiEnabledState] = useState(false);
  const [compact, setCompact] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [contactQuery, setContactQuery] = useState("");
  const [contactsLoading, setContactsLoading] = useState(false);
  const [contactCandidates, setContactCandidates] = useState<CallContactCandidate[]>([]);
  const [invitedParticipants, setInvitedParticipants] = useState<GroupCallTile[]>([]);

  const pendingInvitedParticipantIds = useMemo(() => {
    return new Set(
      invitedParticipants
        .filter((participant) => participant.status === "invited")
        .map((participant) => participant.id)
        .filter(Boolean),
    );
  }, [invitedParticipants]);

  const filteredCallContacts = useMemo(() => {
    const query = String(contactQuery || "").trim().toLowerCase();

    if (!query) return contactCandidates;

    return contactCandidates.filter((contact) => {
      return (
        String(contact.name || "").toLowerCase().includes(query) ||
        String(contact.phone || "").toLowerCase().includes(query) ||
        String(contact.userId || "").toLowerCase().includes(query)
      );
    });
  }, [contactCandidates, contactQuery]);

  const [remoteMain, setRemoteMainState] = useState(true);

  const setRemoteMain = useCallback((next: boolean | ((value: boolean) => boolean)) => {
    setRemoteMainState((current) => {
      const resolved = typeof next === "function" ? (next as (value: boolean) => boolean)(current) : next;
      preferredRemoteMainRef.current = resolved;
      return resolved;
    });
  }, []);

  // SABI_DIRECT_VIDEO_MINI_PREVIEW_DRAG:
  // Only the 1:1 local mini-preview is draggable. Group-call code is not touched.
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
  const acceptedVideoWantedRef = useRef(false);
  const mountedRef = useRef(true);
  const seenSignalsRef = useRef(new Set<string>());
  const preferredRemoteMainRef = useRef(true);
  const groupKnownParticipantIdsRef = useRef<Set<string>>(new Set<string>());
  const endedCallIdsRef = useRef<Set<string>>(new Set<string>());
  const remoteVideoLostAtRef = useRef(0);
  const remoteCameraOffRef = useRef(false);
  const callHistoryStartedAtRef = useRef(new Date().toISOString());
  const callHistoryAnsweredAtRef = useRef<string | null>(null);
  const callHistoryFinalKeyRef = useRef("");

  const rememberGroupParticipantIds = useCallback((ids: Array<unknown>) => {
    const registry = getSabiGroupParticipantsRegistry();
    const callId = String(route.callId || "").trim();
    const ownSet = groupKnownParticipantIdsRef.current;
    const registeredSet = callId ? registry.get(callId) || new Set<string>() : new Set<string>();

    const add = (value: unknown) => {
      for (const id of normalizeSabiGroupParticipantIds(value)) {
        if (!id) continue;
        ownSet.add(id);
        registeredSet.add(id);
      }
    };

    add(route.userId);
    add(route.peerId);
    ids.forEach(add);

    if (callId) registry.set(callId, registeredSet);

    return Array.from(new Set([...ownSet, ...registeredSet])).filter(Boolean).sort();
  }, [route.callId, route.peerId, route.userId]);

  const [localGroupHandoff, setLocalGroupHandoff] = useState<Record<string, string> | null>(null);

  const localGroupHandoffActive = Boolean(
    localGroupHandoff &&
      String(localGroupHandoff.callId || "") === String(route.callId || "") &&
      String(localGroupHandoff.userId || "") === String(route.userId || ""),
  );

  const standardRuntimeBlocked = Boolean(parsedGroupCallRoute || localGroupHandoffActive);

  useEffect(() => {
    const subscription = DeviceEventEmitter.addListener(
      "sabi-call:group-handoff",
      (_payload: Record<string, unknown>) => {
        return;

      },
    );

    return () => subscription.remove();
  }, [localStream, rememberGroupParticipantIds, route.callId, route.peerId, route.userId]);

  const setProtectedLocalStream = useCallback((nextStream: any | null) => {
    const cacheKey = sabiGroupScreenCacheKey(route.callId, route.userId);
    const cache = getSabiGroupScreenCache();

    if (nextStream && hasLiveSabiTracks(nextStream)) {
      enableSabiScreenTracks(nextStream);

      const current = cache.get(cacheKey);
      cache.set(cacheKey, {
        localStream: nextStream,
        startedAt: current?.startedAt || Date.now(),
      });

      setLocalStreamState((currentStream: any | null) => {
        if (currentStream && typeof currentStream.toURL === "function" && typeof nextStream?.toURL === "function") {
          if (String(currentStream.toURL()) === String(nextStream.toURL())) return currentStream;
        }
        return nextStream;
      });
      return;
    }

    const cached = cache.get(cacheKey);
    if (cached?.localStream && hasLiveSabiTracks(cached.localStream)) {
      enableSabiScreenTracks(cached.localStream);
      setLocalStreamState((currentStream: any | null) => {
        if (currentStream && typeof currentStream.toURL === "function" && typeof cached.localStream?.toURL === "function") {
          if (String(currentStream.toURL()) === String(cached.localStream.toURL())) return currentStream;
        }
        return cached.localStream;
      });
      return;
    }

    setLocalStreamState(null);
  }, [parsedGroupCallRoute, route.callId, route.userId]);

  const closePeer = useCallback(() => {
    peerRef.current?.close();
    peerRef.current = null;
  }, []);

  const shouldProcessSignal = useCallback((eventName: string, payload: unknown) => {
    const key = makeSignalKey(eventName, payload);
    if (seenSignalsRef.current.has(key)) return false;
    seenSignalsRef.current.add(key);
    return true;
  }, []);

  const recordCallHistory = useCallback((eventName: string, patch: Record<string, unknown> = {}) => {
    const now = new Date().toISOString();
    const eventText = [
      String(eventName || ""),
      String(patch.event || ""),
      String(patch.status || ""),
      String(patch.phase || ""),
      String(patch.endReason || ""),
      String(patch.reason || ""),
    ].join(" ").toLowerCase();
    const isConnected =
      eventText.includes("connected") ||
      eventText.includes("active") ||
      eventText.includes("accepted") ||
      eventText.includes("answer");
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

    if (finalKey && callHistoryFinalKeyRef.current === finalKey) {
      return;
    }

    if (finalKey) {
      callHistoryFinalKeyRef.current = finalKey;
    }

    const startedAt = callHistoryStartedAtRef.current || now;
    const answeredAt = callHistoryAnsweredAtRef.current;
    const durationSeconds = isFinal && answeredAt
      ? Math.max(0, Math.floor((Date.now() - new Date(answeredAt).getTime()) / 1000))
      : 0;
    const status = isMissed
      ? "missed"
      : String(patch.status || patch.phase || "").trim() || (isConnected ? "connected" : isFinal ? "ended" : route.incoming ? "ringing" : "calling");

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
  }, [route, routeAvatarUrl, routeKey]);

  const ensurePeer = useCallback(() => {
    if (peerRef.current) return peerRef.current;

    peerRef.current = createStandardCallPeer({
      route,
      socket,
      initialVideoEnabled: route.kind === "video" && (cameraEnabled || acceptedVideoWantedRef.current),
      initialCameraFacing: cameraFacing,
      canStartCaller: () => Boolean(acceptedRef.current && !route.incoming),
      onLocalStream: setProtectedLocalStream,
      onRemoteStream: (stream) => {
        try {
          stream?.getTracks?.().forEach((track: any) => {
            track.enabled = true;
          });
        } catch {}

        callDebug("remoteStream:set", describeSabiMediaStreamForDebug(stream));
        setRemoteStream(stream);

        try {
          const hasVideo = hasSabiRenderableVideoTrack(stream);

          if (remoteCameraOffRef.current) {
            // SABI_REMOTE_CAMERA_OFF_INFO_PANEL:
            // A stopped remote camera must render the contact/info panel, never
            // the last frozen RTC frame. Keep remote audio through hidden RTCView.
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
            // No live/enabled video track: fall back to info panel and keep audio.
            remoteVideoLostAtRef.current = Date.now();
            setStableRemoteVideoStream(null);
            setStableRemoteVideoUrl("");
          }
        } catch {}

        if (stream && mountedRef.current) {
          if (!activeStartedAtRef.current) activeStartedAtRef.current = Date.now();
          setPhase("active");
          setStatusKey("connected");
          recordCallHistory("call:connected", { event: "connected", status: "connected", phase: "active" });
        }
      },
      onConnected: () => {
        if (!mountedRef.current) return;
        if (!activeStartedAtRef.current) activeStartedAtRef.current = Date.now();
        setPhase("active");
        setStatusKey("connected");
        recordCallHistory("call:connected", { event: "connected", status: "connected", phase: "active" });
      },
      onError: (message) => {
        callDebug("peer:error", { message });
        if (!mountedRef.current) return;
        setStatusKey("connecting");
      },
    });

    void peerRef.current.setSpeakerEnabled(speakerEnabled);
    peerRef.current.setMicEnabled(micEnabled);

    return peerRef.current;
  }, [callDebug, cameraEnabled, cameraFacing, micEnabled, recordCallHistory, routeKey, setProtectedLocalStream, socket, speakerEnabled]);

  // SABI_CALL_LOAD_CONTACTS_FOR_INVITE
  useEffect(() => {
    if (!addOpen) return undefined;

    let cancelled = false;

    async function loadSabiContacts() {
      setContactsLoading(true);

      try {
        const result = await listSabiCallInviteContacts({
          currentUserId: route.userId,
          currentPeerId: route.peerId,
          query: contactQuery,
        });

        if (cancelled) return;

        console.log("[sabi-call:add-contact] Sabi-only contacts:", result.length);

        setContactCandidates(result as CallContactCandidate[]);
      } catch {
        if (!cancelled) setContactCandidates([]);
      } finally {
        if (!cancelled) setContactsLoading(false);
      }
    }

    void loadSabiContacts();

    return () => {
      cancelled = true;
    };
  }, [addOpen, contactQuery, route.peerId, route.userId]);

  useSabiCallTone({
    enabled: phase === "calling" || phase === "ringing",
    mode: phase === "ringing" ? "incoming" : phase === "calling" ? "outgoing" : "none",
    callId: route.callId,
  });

  useEffect(() => {
    mountedRef.current = true;

    const routeIsGroup = Boolean(parsedGroupCallRoute || localGroupHandoffActive);

    if (routeIsGroup) {
      markSabiCallAsActiveGroup(route.callId);
    }

    acceptedRef.current = Boolean(routeIsGroup && !isInvitedGroupParticipantRoute);
    startedRef.current = false;
    seenSignalsRef.current.clear();
    callHistoryStartedAtRef.current = new Date().toISOString();
    callHistoryAnsweredAtRef.current = null;
    activeStartedAtRef.current = parsedGroupCallRoute && initialGroupCache?.startedAt ? initialGroupCache.startedAt : null;
    callHistoryFinalKeyRef.current = "";
    recordCallHistory(route.incoming || isInvitedGroupParticipantRoute ? "call:incoming" : "call:start", {
      event: route.incoming || isInvitedGroupParticipantRoute ? "incoming" : "start",
      status: route.incoming || isInvitedGroupParticipantRoute ? "ringing" : "calling",
      phase: route.incoming || isInvitedGroupParticipantRoute ? "ringing" : "calling",
    });

    callDebug("route:init", {
      phase: route.incoming || isInvitedGroupParticipantRoute ? "ringing" : routeIsGroup ? "active" : "calling",
      routeIsGroup,
      groupCallsEnabled,
      isInvitedGroupParticipantRoute,
      standardRuntimeBlocked,
    });

    // For direct -> group handoff, close only the old 1:1 peer object. The
    // standard runtime sees the active group id and preserves camera/mic tracks.
    peerRef.current?.close();
    peerRef.current = null;
    closePeer();

    setSeconds(0);
    setPhase(route.incoming || isInvitedGroupParticipantRoute ? "ringing" : routeIsGroup ? "active" : "calling");
    setStatusKey(route.incoming || isInvitedGroupParticipantRoute ? "incoming" : routeIsGroup ? "connected" : "calling");

    // Do not clear streams on a group route replay. Route replacement / replay
    // was wiping self preview and then every tile became url:"",tracks:0 after
    // the mesh had already reached tiles=3 remote=2.
    if (!routeIsGroup) {
      setRemoteStream(null);
      setStableRemoteVideoStream(null);
      setStableRemoteVideoUrl("");
      remoteCameraOffRef.current = false;
      setRemoteCameraOff(false);
      setProtectedLocalStream(null);
      preferredRemoteMainRef.current = true;
    } else {
      const cached = getSabiGroupScreenCache().get(sabiGroupScreenCacheKey(route.callId, route.userId));
      if (cached?.localStream && hasLiveSabiTracks(cached.localStream)) {
        setProtectedLocalStream(cached.localStream);
      }
    }

    const nextInitialVideoActive = route.kind === "video" && !route.incoming && !isInvitedGroupParticipantRoute;
    acceptedVideoWantedRef.current = Boolean(route.kind === "video" && routeIsGroup && !isInvitedGroupParticipantRoute);
    setCameraEnabledState(nextInitialVideoActive);
    setVideoLayoutEnabled(nextInitialVideoActive);
    setCameraFacing("user");
    setMoreOpen(false);
    setAddOpen(false);
    setContactQuery("");

    return () => {
      mountedRef.current = false;
      // Never tear down live group media from a route cleanup. Only the red
      // hangup button / explicit group ended event is allowed to close group media.
      if (!routeIsGroup) closePeer();
    };
  }, [callDebug, closePeer, isInvitedGroupParticipantRoute, localGroupHandoffActive, parsedGroupCallRoute, recordCallHistory, route.callId, route.kind, route.userId, routeKey, setProtectedLocalStream, standardRuntimeBlocked]);

  // SABI_GROUP_ROUTE_START_TIMER
  useEffect(() => {
    const groupRouteForTimer =
      localGroupHandoffActive ||
      String((route as any).roomType || "").toLowerCase() === "group_call" ||
      String((route as any).groupCall || "") === "1" ||
      String((route as any).isGroupCall || "") === "1" ||
      String((route as any).event || "").toLowerCase().includes("handoff") ||
      String((route as any).action || "").toLowerCase().includes("handoff") ||
      String((route as any).direction || "").toLowerCase().includes("handoff");

    if (!groupRouteForTimer || !route.callId || !route.userId) return;
    if (endedCallIdsRef.current.has(route.callId)) return;
    if (!shouldAutoActivateGroupRoute && !localGroupHandoffActive) return;

    acceptedRef.current = true;

    const cacheKey = sabiGroupScreenCacheKey(route.callId, route.userId);
    const cache = getSabiGroupScreenCache();
    const current = cache.get(cacheKey);
    const startedAt = current?.startedAt || Date.now();

    cache.set(cacheKey, {
      localStream: current?.localStream ?? localStream ?? null,
      startedAt,
    });

    activeStartedAtRef.current = startedAt;
    setSeconds(Math.max(0, Math.floor((Date.now() - startedAt) / 1000)));
    setPhase("active");
    setStatusKey("connected");

    console.log(
      "[sabi-call:group] timer active:",
      "callId=" + String(route.callId || ""),
      "user=" + String(route.userId || ""),
    );
  }, [
    route.callId,
    route.userId,
    localStream,
    (route as any).roomType,
    (route as any).groupCall,
    (route as any).isGroupCall,
    (route as any).event,
    (route as any).action,
    (route as any).direction,
    shouldAutoActivateGroupRoute,
    localGroupHandoffActive,
  ]);

  useEffect(() => {
    if (!socket.connected) socket.connect();

    callDebug("room:join:emit", { socketConnected: Boolean(socket.connected) });
    socket.emit("call:room:join", makeCallPayload(route, { event: "join" }));

    if (!route.incoming && !isInvitedGroupParticipantRoute && !startedRef.current) {
      startedRef.current = true;

      const payload = makeCallPayload(route, {
        event: "incoming",
        phase: "ringing",
        status: "ringing",
      });

      callDebug("invite:start:emit", summarizeSabiCallPayloadForDebug(payload));
      socket.emit("call:start", payload);
      socket.emit("call:incoming", payload);
      socket.emit("sabi-call:start", payload);
      socket.emit("sabi-call:incoming", payload);
      recordCallHistory("call:start", { event: "start", status: "calling", phase: "calling" });
    }

    return () => {
      socket.emit("call:room:leave", makeCallPayload(route, { event: "leave" }));
    };
  }, [callDebug, isInvitedGroupParticipantRoute, recordCallHistory, routeKey, socket]);

  useEffect(() => {
    if (phase !== "active") {
      if (phase === "calling" || phase === "ringing" || phase === "ended") {
        activeStartedAtRef.current = parsedGroupCallRoute && initialGroupCache?.startedAt ? initialGroupCache.startedAt : null;
      }
      return undefined;
    }

    if (!activeStartedAtRef.current) {
      activeStartedAtRef.current = Date.now();
    }

    const updateConnectedSeconds = () => {
      const startedAt = activeStartedAtRef.current || Date.now();
      setSeconds(Math.max(0, Math.floor((Date.now() - startedAt) / 1000)));
    };

    updateConnectedSeconds();
    const timer = setInterval(updateConnectedSeconds, 1000);

    return () => clearInterval(timer);
  }, [initialGroupCache?.startedAt, parsedGroupCallRoute, phase, routeKey]);

  // SABI_VIDEO_REMOTE_AUDIO_KEEPALIVE:
  // In video calls Android can receive video while remote audio becomes silent
  // if the audio route changes after RTCView/render updates. Keep remote audio
  // tracks enabled and re-apply the speaker route while the call is connecting/active.
  useEffect(() => {
    if (phase !== "connecting" && phase !== "active") return undefined;

    let cancelled = false;

    const applyRemoteAudio = () => {
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

    applyRemoteAudio();

    const timer = setInterval(applyRemoteAudio, 1200);

    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [micEnabled, phase, remoteStream, speakerEnabled]);

  // SABI_DIRECT_VIDEO_LIVENESS_MONITOR:
  // Android rn-webrtc can briefly report remote video track.muted=true during
  // normal network/render changes. That must not be interpreted as camera off,
  // otherwise the video view appears to switch off/on by itself. Only an
  // explicit camera_off/camera_on signaling event changes the remote camera UI.
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

  useEffect(() => {
    if (phase !== "connecting" && phase !== "active") return undefined;

    let cancelled = false;

    const applyGroupRemoteAudio = () => {
      if (cancelled) return;

      try {
        Object.values(groupRemoteStreamsByPeerRef.current).forEach((stream: any) => {
          stream?.getAudioTracks?.().forEach((track: any) => {
            if (track && "enabled" in track) track.enabled = true;
          });
        });
      } catch {}

      void peerRef.current?.setSpeakerEnabled(speakerEnabled);
    };

    applyGroupRemoteAudio();
    const timer = setInterval(applyGroupRemoteAudio, 1200);

    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [phase, speakerEnabled]);

  const groupBridgeCloseAllRef = useRef<((notify?: boolean) => void) | null>(null);
  const groupRemoteStreamsByPeerRef = useRef<Record<string, any>>({});
  const groupBridgeStartLocalMediaRef = useRef<(() => Promise<any | null>) | null>(null);
  const groupBridgeInviteParticipantRef = useRef<((peerUserId: string, options?: { force?: boolean }) => Promise<void>) | null>(null);

  const finishLocal = useCallback((reason: string) => {
    if (phase === "ended") return;
    endedCallIdsRef.current.add(route.callId);

    const participantIds = rememberGroupParticipantIds([
      route.userId,
      route.peerId,
      rawGroupRouteText("peerId"),
      rawGroupRouteText("partnerId"),
      rawGroupRouteText("participantIds"),
      rawGroupRouteText("groupParticipantIds"),
      rawGroupRouteText("participants"),
      ...Object.keys(groupRemoteStreamsByPeerRef.current),
    ]);

    const shouldEndAsGroupCall = Boolean(
      parsedGroupCallRoute ||
        localGroupHandoffActive ||
        rawGroupRouteText("roomType").toLowerCase() === "group_call" ||
        rawGroupRouteText("groupCall") === "1" ||
        rawGroupRouteText("isGroupCall") === "1" ||
        String((route as any).roomType || "").toLowerCase() === "group_call" ||
        String((route as any).groupCall || "").toLowerCase() === "true" ||
        String((route as any).groupCall || "") === "1",
    );

    const endMeta = normalizeSabiLocalCallEnd(reason, phase, route.incoming);
    const payload = makeCallPayload(route, {
      event: endMeta.event,
      action: endMeta.event,
      phase: "ended",
      status: endMeta.status,
      endReason: endMeta.endReason,
      roomType: shouldEndAsGroupCall ? "group_call" : (route as any).roomType,
      groupCall: shouldEndAsGroupCall ? true : (route as any).groupCall,
      participantIds: participantIds.join(","),
      groupParticipantIds: participantIds.join(","),
      participants: participantIds,
    });

    recordCallHistory(endMeta.historyEvent, {
      event: endMeta.event,
      status: endMeta.status,
      phase: "ended",
      endReason: endMeta.endReason,
    });

    socket.emit("call:end", payload);
    socket.emit("call:ended", payload);
    socket.emit("sabi-call:ended", payload);

    if (endMeta.event !== "ended") {
      socket.emit(`call:${endMeta.event}`, payload);
      socket.emit(`sabi-call:${endMeta.event}`, payload);
    }

    if (shouldEndAsGroupCall) {
      const groupEndTargets = participantIds.filter(
        (participantId) => participantId && participantId !== route.userId,
      );

      if (!groupEndTargets.length) {
        socket.emit("sabi-call:group:ended", payload);
      } else {
        groupEndTargets.forEach((participantId) => {
          socket.emit("sabi-call:group:ended", {
            ...payload,
            peerId: participantId,
            peerUserId: participantId,
            receiverUserId: participantId,
            targetUserId: participantId,
            toUserId: participantId,
          });
        });
      }
    }

    try {
      groupBridgeCloseAllRef.current?.(true);
    } catch {}

    try {
      (((globalThis as any).__sabiActiveGroupCallIds || new Set<string>()) as Set<string>).delete(route.callId);
    } catch {}

    closePeer();
    stopSabiMediaStream(localStream);
    stopSabiMediaStream(remoteStream);
    Object.values(groupRemoteStreamsByPeerRef.current).forEach(stopSabiMediaStream);

    setGroupRemoteStreamsByPeer({});
    setRemoteStream(null);
    setStableRemoteVideoStream(null);
    setStableRemoteVideoUrl("");
    setProtectedLocalStream(null);
    setPhase("ended");
    setStatusKey("ended");

    setTimeout(closeCallRoute, 250);
  }, [
    closePeer,
    groupBridgeCloseAllRef,
    groupRemoteStreamsByPeerRef,
    localGroupHandoffActive,
    localStream,
    phase,
    parsedGroupCallRoute,
    rawGroupRouteText,
    recordCallHistory,
    rememberGroupParticipantIds,
    remoteStream,
    route,
    socket,
    setProtectedLocalStream,
  ]);

  // SABI_CALLS_FINAL_D_NO_ANSWER_WATCHDOG:
  // Keep the lifecycle deterministic on two real phones. A ringing call must not
  // stay forever when the other device disconnects, ignores the call, or the
  // gateway drops the final no-answer event.
  useEffect(() => {
    if (standardRuntimeBlocked) return undefined;
    if (phase !== "calling" && phase !== "ringing") return undefined;
    if (acceptedRef.current || endedCallIdsRef.current.has(route.callId)) return undefined;

    const timeoutMs = route.incoming ? 60000 : 65000;
    const timer = setTimeout(() => {
      if (acceptedRef.current || endedCallIdsRef.current.has(route.callId)) return;
      finishLocal(route.incoming ? "missed" : "no_answer");
    }, timeoutMs);

    return () => clearTimeout(timer);
  }, [finishLocal, phase, route.callId, route.incoming, standardRuntimeBlocked]);

  useEffect(() => {
    // SABI_DIRECT_CALLER_PREWARM_MEDIA:
    // For 1:1 outgoing calls prepare RTCPeerConnection + local mic/camera while ringing.
    // The offer is still sent only after remote accept, but startCaller no longer waits
    // for getUserMedia at accept time.
    if (standardRuntimeBlocked) return;
    if (route.incoming) return;
    if (parsedGroupCallRoute || isInvitedGroupParticipantRoute) return;
    if (acceptedRef.current || endedCallIdsRef.current.has(route.callId)) return;

    void ensurePeer()
      .prepareCallee()
      .catch((error) => {
        callDebug("caller:prewarm:error", {
          message: error instanceof Error ? error.message : String(error),
        });
      });
  }, [
    callDebug,
    ensurePeer,
    isInvitedGroupParticipantRoute,
    parsedGroupCallRoute,
    route.callId,
    route.incoming,
    standardRuntimeBlocked,
  ]);

  const accept = useCallback(() => {
    const isGroupInviteAccept = isInvitedGroupParticipantRoute;

    if ((!route.incoming && !isGroupInviteAccept) || acceptedRef.current) return;

    acceptedRef.current = true;

    if (isGroupInviteAccept) {
      markSabiCallAsActiveGroup(route.callId);
      activeStartedAtRef.current = Date.now();
      setSeconds(0);
      setPhase("active");
      setStatusKey("connected");
      setVideoLayoutEnabled(route.kind === "video");
      setCameraEnabledState(route.kind === "video");

      void (async () => {
        const stream = await groupBridgeStartLocalMediaRef.current?.();
        if (stream && hasLiveSabiTracks(stream)) {
          setProtectedLocalStream(stream);
        }

        const acceptedParticipantIds = rememberGroupParticipantIds([
          route.userId,
          route.peerId,
          ...extractSabiGroupParticipantIds(rawGroupRouteParams as Record<string, unknown>),
        ]);

        const groupAcceptedPayload = makeCallPayload(route, {
          roomType: "group_call",
          groupCall: true,
          isGroupCall: true,
          participantIds: acceptedParticipantIds.join(","),
          groupParticipantIds: acceptedParticipantIds.join(","),
          participants: acceptedParticipantIds,
          event: "participant_accepted",
          action: "accepted",
          direction: "accepted",
          phase: "active",
          status: "active",
          senderUserId: route.userId,
          fromUserId: route.userId,
          participantId: route.userId,
          peerUserId: route.userId,
          peerId: route.userId,
          receiverUserId: route.peerId,
          targetUserId: route.peerId,
          toUserId: route.peerId,
        });

        socket.emit("sabi-call:participant:accepted", groupAcceptedPayload);

        acceptedParticipantIds
          .filter((participantId) => participantId && participantId !== route.userId)
          .forEach((participantId) => {
            void groupBridgeInviteParticipantRef.current?.(participantId, { force: true });
          });
      })();
      return;
    }

    setPhase("connecting");
    setStatusKey("connecting");
    recordCallHistory("call:accepted", { event: "accepted", status: "connecting", phase: "connecting" });

    if (route.kind === "video") {
      acceptedVideoWantedRef.current = true;
      setCameraEnabledState(true);
      setVideoLayoutEnabled(true);
    } else {
      acceptedVideoWantedRef.current = false;
      setCameraEnabledState(false);
      setVideoLayoutEnabled(false);
    }

    // SABI_CALLS_100_2_ACCEPT_PREPARE_MEDIA:
    // The callee must open local mic/camera immediately after accepting, but
    // must not create an offer. This keeps the screen alive while waiting for
    // the caller's offer and prevents a zero-track disconnect after accept.
    void ensurePeer().prepareCallee();

    const payload = makeCallPayload(route, {
      event: "accepted",
      phase: "connecting",
      status: "connecting" as const,
    });

    callDebug("accept:emit", summarizeSabiCallPayloadForDebug(payload));
    socket.emit("call:accept", payload);
    socket.emit("call:accepted", payload);
    socket.emit("sabi-call:accept", payload);
    socket.emit("sabi-call:accepted", payload);

    const acceptedSignalPayload = {
      ...payload,
      event: "accepted",
      action: "accepted",
      signalKind: "accepted",
      status: "connecting",
      phase: "connecting",
    };

    socket.emit("call:signal", acceptedSignalPayload);
    socket.emit("call_signal", acceptedSignalPayload);
    socket.emit("call:webrtc:signal", acceptedSignalPayload);
    socket.emit("sabi-call:signal", acceptedSignalPayload);
  }, [callDebug, ensurePeer, isInvitedGroupParticipantRoute, rawGroupRouteParams, recordCallHistory, rememberGroupParticipantIds, route, setProtectedLocalStream, socket]);

  const toggleMic = useCallback(() => {
    const next = !micEnabled;
    setMicEnabledState(next);
    peerRef.current?.setMicEnabled(next);
  }, [micEnabled]);

  const toggleSpeaker = useCallback(() => {
    const next = !speakerEnabled;
    setSpeakerEnabledState(next);
    void peerRef.current?.setSpeakerEnabled(next);
  }, [speakerEnabled]);

  const toggleCamera = useCallback(() => {
    if (route.kind === "audio") {
      acceptedVideoWantedRef.current = false;
      setCameraEnabledState(false);
      setVideoLayoutEnabled(false);
      void peerRef.current?.setCameraEnabled(false);
      return;
    }

    const next = !cameraEnabled;
    acceptedVideoWantedRef.current = next;
    const remoteVideoStillLive = Boolean(
      !remoteCameraOff &&
        (hasSabiRenderableVideoTrack(stableRemoteVideoStream) || hasSabiRenderableVideoTrack(remoteStream)),
    );

    setCameraEnabledState(next);
    setVideoLayoutEnabled(next || remoteVideoStillLive);

    if (!next) {
      // Keep remote video as main when local camera is disabled.
      setRemoteMain(true);
    }

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

      // SABI_DIRECT_CAMERA_STATE_SIGNAL:
      // Send an immediate lightweight state signal before WebRTC renegotiation.
      // This prevents the other phone from keeping the last video frame as a photo.
      socket.emit("call:webrtc:offer", mediaStatePayload);
      socket.emit("call:media:state", mediaStatePayload);
      socket.emit("call:camera:state", mediaStatePayload);

      void ensurePeer().setCameraEnabled(next);
    }
  }, [cameraEnabled, ensurePeer, phase, remoteCameraOff, remoteStream, route, setRemoteMain, socket, stableRemoteVideoStream]);

  const switchCamera = useCallback(() => {
    if (route.kind === "audio") return;

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
  }, [ensurePeer, phase]);

  const inviteContact = useCallback((_contact: CallContactCandidate) => {
    // Group calls are disabled for the first launch. They will be added in the second update.
    setContactQuery("");
    setAddOpen(false);
  }, []);

  const togglePresentation = useCallback(() => {
    const next = !presentationEnabled;
    setPresentationEnabledState(next);

    socket.emit(next ? "sabi-call:presentation:start" : "sabi-call:presentation:stop", makeCallPayload(route, {
      event: next ? "presentation_start" : "presentation_stop",
    }));
  }, [presentationEnabled, routeKey, socket]);

  const toggleAi = useCallback(() => {
    const next = !aiEnabled;
    setAiEnabledState(next);

    socket.emit(next ? "sabi-call:translation:start" : "sabi-call:translation:stop", makeCallPayload(route, {
      event: next ? "translation_start" : "translation_stop",
      sourceLanguage: "auto",
      targetLanguage: language,
    }));
  }, [aiEnabled, language, routeKey, socket]);

  useEffect(() => {
    if (standardRuntimeBlocked) {
      return undefined;
    }

    const handleAccepted = (payload: unknown) => {
      callDebug("accepted:recv", summarizeSabiCallPayloadForDebug(payload));
      // SABI_IGNORE_ACCEPTED_ON_DIRECT_SHADOW
      if (isDirectGroupShadowRoute) return;
      if (route.incoming) return;
      if (!payloadMatches(route, payload)) return;
      if (!isFromPeer(route, payload)) return;
      if (!shouldProcessSignal("call:accepted", payload)) return;
      if (acceptedRef.current) return;

      acceptedRef.current = true;
      setPhase("connecting");
      setStatusKey("connecting");
      recordCallHistory("call:accepted", { event: "accepted", status: "connecting", phase: "connecting" });

      void ensurePeer().startCaller();
    };

    const handleOffer = (payload: unknown) => {
      callDebug("offer:recv", summarizeSabiCallPayloadForDebug(payload));
      if (!route.incoming && !acceptedRef.current) return;
      if (route.incoming && !acceptedRef.current) return;
      if (!payloadMatches(route, payload)) return;
      if (!isFromPeer(route, payload)) return;

      const isCameraOffSignal = isSabiCameraOffSignal(payload);
      const isCameraOnSignal = isSabiCameraOnSignal(payload);
      const hasDescription = hasSabiSessionDescription(payload);

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
        // Do not render the old frozen frame here. Wait for the real new
        // WebRTC video stream/ontrack before showing video again.
      }

      if (!hasDescription && (isCameraOffSignal || isCameraOnSignal)) {
        return;
      }

      if (!shouldProcessSignal("call:webrtc:offer", payload)) return;

      setPhase("connecting");
      setStatusKey("connecting");

      void ensurePeer().handleOffer(payload);
    };

    const handleAnswer = (payload: unknown) => {
      callDebug("answer:recv", summarizeSabiCallPayloadForDebug(payload));
      if (route.incoming) return;
      if (!payloadMatches(route, payload)) return;
      if (!isFromPeer(route, payload)) return;
      if (!shouldProcessSignal("call:webrtc:answer", payload)) return;

      void peerRef.current?.handleAnswer(payload);
    };

    const handleIce = (payload: unknown) => {
      callDebug("ice:recv", summarizeSabiCallPayloadForDebug(payload));
      if (!payloadMatches(route, payload)) return;
      if (!isFromPeer(route, payload)) return;
      if (!shouldProcessSignal("call:webrtc:ice", payload)) return;

      void peerRef.current?.handleIce(payload);
    };

    const handleConnected = (payload: unknown) => {
      callDebug("connected:recv", summarizeSabiCallPayloadForDebug(payload));
      if (isDirectGroupShadowRoute) return;
      if (!payloadMatches(route, payload)) return;
      if (!isFromPeer(route, payload)) return;
      if (!shouldProcessSignal("call:connected", payload)) return;

      acceptedRef.current = true;
      if (!activeStartedAtRef.current) activeStartedAtRef.current = Date.now();
      setPhase("active");
      setStatusKey("connected");
      recordCallHistory("call:connected", { event: "connected", status: "connected", phase: "active" });
    };

    const handleEnded = (payload: unknown) => {
      callDebug("ended:recv", summarizeSabiCallPayloadForDebug(payload));
      if (!payloadMatches(route, payload)) return;
      if (!isFromPeer(route, payload)) return;
      if (!isRealCallEndPayload(payload)) return;
      if (!shouldProcessSignal("call:ended", payload)) return;

      // During direct РІвЂ вЂ™ group handoff the legacy direct peer can emit/receive a
      // normal call:end for the old 1:1 leg. call:end/call:ended must never
      // terminate an active group mesh. Group termination is handled only by
      // sabi-call:group:ended with an explicit end reason.
      if (isGroupCallRoute || localGroupHandoffActive) return;
      if (isSabiActiveGroupCall(route.callId) && isExplicitSabiGroupPayload(payload)) return;
      if (standardRuntimeBlocked && !isExplicitSabiGroupPayload(payload)) return;

      // SABI_IGNORE_STALE_DIRECT_END_AFTER_CONNECTED:
      // Backend/no-answer watchdogs can emit call:end/call:ended late after
      // remote stream has already arrived. In a live direct call, close only
      // explicit user actions: decline, hangup, cancel, busy.
      const hasLiveDirectMedia = Boolean(
        phase === "active" ||
          remoteStream ||
          stableRemoteVideoUrl ||
          stableRemoteVideoStream,
      );

      if (
        hasLiveDirectMedia &&
        !isGroupCallRoute &&
        !localGroupHandoffActive &&
        !isExplicitSabiGroupPayload(payload) &&
        !isSabiExplicitDirectEndReason(payload)
      ) {
        return;
      }

      const remoteEndText = getSabiCallPayloadEvent(payload).toLowerCase();
      const softTimeoutEnd =
        remoteEndText.includes("missed") ||
        remoteEndText.includes("no_answer") ||
        remoteEndText.includes("timeout");
      const explicitUserEnd =
        remoteEndText.includes("decline") ||
        remoteEndText.includes("declined") ||
        remoteEndText.includes("hangup") ||
        remoteEndText.includes("hang_up") ||
        remoteEndText.includes("cancel") ||
        remoteEndText.includes("cancelled") ||
        remoteEndText.includes("busy");

      // SABI_DIRECT_IGNORE_ACCEPTED_SOFT_TIMEOUT:
      // Backend/no-answer watchdogs can arrive while WebRTC is still ICE checking.
      // After a 1:1 call is accepted, ignore only soft timeout/missed/no_answer ends.
      // Explicit user actions still close the call.
      if (
        !standardRuntimeBlocked &&
        !parsedGroupCallRoute &&
        acceptedRef.current &&
        phase !== "ended" &&
        softTimeoutEnd &&
        !explicitUserEnd
      ) {
        callDebug("end:ignored_accepted_soft_timeout", {
          event: remoteEndText,
          phase,
        });
        return;
      }

      const missedBeforeAccept = Boolean(route.incoming && !acceptedRef.current && phase !== "active");
      const remoteEndMeta = normalizeSabiRemoteCallEnd(payload, missedBeforeAccept);
      recordCallHistory(remoteEndMeta.historyEvent, {
        event: remoteEndMeta.event,
        status: remoteEndMeta.status,
        phase: "ended",
        endReason: remoteEndMeta.endReason,
      });

      endedCallIdsRef.current.add(route.callId);

      try {
        groupBridgeCloseAllRef.current?.(true);
      } catch {}

      try {
        (((globalThis as any).__sabiActiveGroupCallIds || new Set<string>()) as Set<string>).delete(route.callId);
      } catch {}

      closePeer();
      stopSabiMediaStream(localStream);
      stopSabiMediaStream(remoteStream);
      Object.values(groupRemoteStreamsByPeerRef.current).forEach(stopSabiMediaStream);
      setGroupRemoteStreamsByPeer({});
      setRemoteStream(null);
      setStableRemoteVideoStream(null);
      setStableRemoteVideoUrl("");
      remoteCameraOffRef.current = false;
      setRemoteCameraOff(false);
      setProtectedLocalStream(null);
      setPhase("ended");
      setStatusKey("ended");

      setTimeout(closeCallRoute, 250);
    };

    const handleSignal = (payload: unknown) => {
      const signalKind = getSabiWebrtcSignalKind(payload);
      const lifecycleText = getSabiCallPayloadEvent(payload);
      callDebug("signal:recv", { signalKind, ...summarizeSabiCallPayloadForDebug(payload) });

      if (lifecycleText.includes("accepted") || lifecycleText.includes("accept")) {
        handleAccepted(payload);
        return;
      }

      if (signalKind === "offer") {
        handleOffer(payload);
        return;
      }

      if (signalKind === "answer") {
        handleAnswer(payload);
        return;
      }

      if (signalKind === "ice") {
        handleIce(payload);
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

    acceptedEvents.forEach((eventName) => socket.on(eventName, handleAccepted));
    signalEvents.forEach((eventName) => socket.on(eventName, handleSignal));
    connectedEvents.forEach((eventName) => socket.on(eventName, handleConnected));
    endedEvents.forEach((eventName) => socket.on(eventName, handleEnded));

    return () => {
      acceptedEvents.forEach((eventName) => socket.off(eventName, handleAccepted));
      signalEvents.forEach((eventName) => socket.off(eventName, handleSignal));
      connectedEvents.forEach((eventName) => socket.off(eventName, handleConnected));
      endedEvents.forEach((eventName) => socket.off(eventName, handleEnded));
    };
  }, [
    callDebug,
    cameraEnabled,
    closePeer,
    ensurePeer,
    groupBridgeCloseAllRef,
    groupRemoteStreamsByPeerRef,
    localStream,
    remoteStream,
    recordCallHistory,
    phase,
    route.callId,
    routeKey,
    setProtectedLocalStream,
    shouldProcessSignal,
    socket,
    standardRuntimeBlocked,
  ]);


  // SABI_DIRECT_MEDIA_STATE_LISTENERS:
  // These listeners are direct 1:1 call camera-state guards. They do not change
  // group-call behavior. When the peer turns camera off, show info panel instead
  // of leaving the last RTC video frame on screen.
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

    socket.on("call:media:state", handleMediaState);
    socket.on("call:camera:state", handleMediaState);

    return () => {
      socket.off("call:media:state", handleMediaState);
      socket.off("call:camera:state", handleMediaState);
    };
  }, [cameraEnabled, localStream, route, setRemoteMain, socket]);


  // SABI_GROUP_END_CLEANUP: stop all media and group peers on remote hangup.
  useEffect(() => {
    if (!socket || !route.callId) return undefined;

    const handleGroupEnded = (payload: unknown) => {
      const payloadCallId = getSabiPayloadCallId(payload);
      if (payloadCallId && payloadCallId !== route.callId) return;
      if (!payloadCallId && !payloadMatches(route, payload)) return;
      if (!isExplicitSabiGroupEndPayload(payload)) return;
      if (phase === "ended") return;

      endedCallIdsRef.current.add(route.callId);

      try {
        groupBridgeCloseAllRef.current?.(true);
      } catch {}

      try {
        (((globalThis as any).__sabiActiveGroupCallIds || new Set<string>()) as Set<string>).delete(route.callId);
      } catch {}

      closePeer();
      stopSabiMediaStream(localStream);
      stopSabiMediaStream(remoteStream);
      Object.values(groupRemoteStreamsByPeerRef.current).forEach(stopSabiMediaStream);
      setGroupRemoteStreamsByPeer({});
      setRemoteStream(null);
      setStableRemoteVideoStream(null);
      setStableRemoteVideoUrl("");
      remoteCameraOffRef.current = false;
      setRemoteCameraOff(false);
      setProtectedLocalStream(null);
      setPhase("ended");
      setStatusKey("ended");

      setTimeout(closeCallRoute, 250);
    };

    socket.on?.("sabi-call:group:ended", handleGroupEnded);

    return () => {
      socket.off?.("sabi-call:group:ended", handleGroupEnded);
    };
  }, [
    closePeer,
    groupBridgeCloseAllRef,
    groupRemoteStreamsByPeerRef,
    localStream,
    phase,
    remoteStream,
    route,
    socket,
    setProtectedLocalStream,
  ]);

  const showAccept = (route.incoming || isInvitedGroupParticipantRoute) && phase === "ringing";
  const active = phase === "active";

  // SABI_VIDEO_CALL_KEEP_AWAKE:
  // During video calls Android must not turn the screen off after 30 seconds.
  useEffect(() => {
    if (route.kind !== "video" || phase === "ended") return undefined;

    void activateKeepAwakeAsync(SABI_VIDEO_CALL_KEEP_AWAKE_TAG).catch(() => undefined);

    return () => {
      deactivateKeepAwake(SABI_VIDEO_CALL_KEEP_AWAKE_TAG);
    };
  }, [phase, route.kind, route.callId]);
  // SABI_AUDIO_CALL_NO_VIDEO_BUTTON:
  // Audio calls must stay audio-only for launch. Do not show camera controls in
  // the audio route. VideoCall/Premium video route remains unchanged.
  const cameraControlsAllowed = route.kind !== "audio";
  const remoteHasLiveVideo = Boolean(
    !remoteCameraOff &&
      (hasSabiRenderableVideoTrack(stableRemoteVideoStream) || hasSabiRenderableVideoTrack(remoteStream)),
  );
  const remoteHasVideo = Boolean(remoteHasLiveVideo && (stableRemoteVideoUrl || stableRemoteVideoStream || remoteStream));
  // SABI_LOCAL_HAS_VIDEO_REQUIRES_ENABLED_TRACK:
  // Disabled/stopped camera must not keep the local mini preview visible.
  const localHasVideo = Boolean(
    localStream?.getVideoTracks?.()?.some(
      (track: any) => track.readyState !== "ended" && track.enabled !== false,
    ),
  );

  const showingVideo = videoLayoutEnabled || cameraEnabled || remoteHasVideo || localHasVideo;

  const remoteVideoStream = remoteHasVideo ? stableRemoteVideoStream || remoteStream : null;
  const localVideoStream = localHasVideo ? localStream : null;

  // Stable rule:
  // - before remote video arrives, show waiting/avatar screen, not local fullscreen;
  // - when remote video arrives, keep it fullscreen and do not remount it on every ontrack;
  // - local camera stays in mini-preview.
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
    // Never render an old stable URL after the remote camera becomes muted/off.
    // This is the direct-call black-screen fix: visible RTCView is allowed only
    // when the corresponding stream still has a live, enabled, unmuted video track.
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

  const hiddenRemoteAudioUrl = useMemo(
    () => (remoteStream && typeof remoteStream.toURL === "function" ? String(remoteStream.toURL()) : ""),
    [remoteStream],
  );

  const shouldRenderHiddenRemoteAudio = Boolean(
    hiddenRemoteAudioUrl && (!remoteHasVideo || !mainStreamUrl),
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
  const compactVideoMode = Boolean(route.kind === "video" && showingVideo);

  const groupTiles = useMemo<GroupCallTile[]>(() => {
    const tiles: GroupCallTile[] = [];

    if (remoteVideoStream || remoteStream) {
      tiles.push({
        id: route.peerId || "remote",
        name: route.name,
        avatarLetter: route.avatarLetter,
        avatarUrl: routeAvatarUrl,
        stream: remoteVideoStream || remoteStream,
        isRemote: true,
        status: active ? "active" : "connecting",
      });
    }

    if (localVideoStream || localStream) {
      tiles.push({
        id: route.userId || "self",
        name: "Sabi",
        avatarLetter: "S",
        avatarUrl: selfAvatarUrl,
        stream: localVideoStream || localStream,
        isSelf: true,
        status: active ? "active" : "connecting",
      });
    }

    for (const participant of invitedParticipants) {
      if (!tiles.some((tile) => tile.id === participant.id)) {
        tiles.push(participant);
      }
    }

    return tiles.slice(0, 9);
  }, [
    active,
    invitedParticipants,
    localStream,
    localVideoStream,
    remoteStream,
    remoteVideoStream,
    route.avatarLetter,
    route.name,
    route.peerId,
    route.userId,
    routeAvatarUrl,
    selfAvatarUrl,
    localStream,
    localVideoStream,
  ]);

  const groupMode = groupTiles.length >= 3;

  // SABI_GROUP_CALL_BRIDGE_CONNECT
  const [groupRemoteStreamsByPeer, setGroupRemoteStreamsByPeer] = useState<Record<string, any>>({});
  const [groupGridLatched, setGroupGridLatched] = useState(false);
  const groupAcceptedEmitKeyRef = useRef("");
  const groupAcceptedReceiveKeyRef = useRef<Record<string, number>>({});
  const groupLocalMediaStartKeyRef = useRef("");
  const groupExistingPeerInviteKeyRef = useRef("");
  const groupVideoRepairKeyRef = useRef<Record<string, number>>({});

  const isGroupCallRoute = false;

    // SABI_DIRECT_GROUP_SHADOW_ROUTE
  const isGroupHandoffRoute = false;

  // SABI_GROUP_HANDOFF_MARK_ACTIVE
  useEffect(() => {
    if (!isGroupHandoffRoute || isInvitedGroupParticipantRoute) return;

    acceptedRef.current = true;
    setPhase("active");
    setStatusKey("connected");
  }, [isGroupHandoffRoute, isInvitedGroupParticipantRoute]);

  // SABI_GROUP_PARTICIPANT_REGISTRY_FROM_ROUTE
  useEffect(() => {
    if (!isGroupCallRoute && !isGroupHandoffRoute) return;

    rememberGroupParticipantIds([
      route.userId,
      route.peerId,
      rawGroupRouteText("peerId"),
      rawGroupRouteText("partnerId"),
      rawGroupRouteText("participantIds"),
      rawGroupRouteText("groupParticipantIds"),
      rawGroupRouteText("participants"),
    ]);
  }, [
    isGroupCallRoute,
    isGroupHandoffRoute,
    parsedGroupCallRoute,
    rawGroupRouteText,
    rememberGroupParticipantIds,
    route.peerId,
    route.userId,
    routeAvatarUrl,
    selfAvatarUrl,
  ]);

  const isDirectGroupShadowRoute =
    !isGroupCallRoute &&
    String(route.callId || "").startsWith("call:") &&
    Boolean(route.userId) &&
    !String(route.callId || "").includes(String(route.userId || ""));

  const groupBridge = useSabiGroupCallBridge({
    enabled: Boolean(
      route.callId &&
        route.userId &&
        socket &&
        !isDirectGroupShadowRoute &&
        isGroupCallRoute &&
        (!isInvitedGroupParticipantRoute || phase === "active")
    ),
    callId: route.callId,
    chatId: route.chatId || (route as any).id || route.callId,
    selfUserId: route.userId,
    kind: String((route as any).kind || "").toLowerCase().includes("audio") ? "audio" : "video",
    socket,
    localStream: localVideoStream || localStream || null,
    // SABI_GROUP_BRIDGE_LOCAL_STREAM_TO_UI
    onLocalStream: setProtectedLocalStream,
    onRemoteStream: (peerUserId, stream) => {
      console.log("[sabi-call:group] remote stream:", peerUserId);
      try {
        stream?.getTracks?.().forEach((track: any) => {
          if (track && "enabled" in track) track.enabled = true;
        });
      } catch {}
      setInvitedParticipants((current) =>
        current.map((participant) =>
          participant.id === peerUserId ? { ...participant, status: "active" as const } : participant,
        ),
      );

      setGroupRemoteStreamsByPeer((current) => {
        const currentStream = current[peerUserId];
        const currentUrl = typeof currentStream?.toURL === "function" ? String(currentStream.toURL()) : "";
        const nextUrl = typeof stream?.toURL === "function" ? String(stream.toURL()) : "";

        if (currentUrl && nextUrl && currentUrl === nextUrl) return current;
        if (hasLiveSabiVideoTracks(currentStream) && !hasLiveSabiVideoTracks(stream)) return current;

        return {
          ...current,
          [peerUserId]: stream,
        };
      });
    },
    onError: (message) => {
      console.log("[sabi-call:group] error:", message);
    },
  });

  groupBridgeCloseAllRef.current = groupBridge.closeAll;
  groupBridgeStartLocalMediaRef.current = groupBridge.startLocalMedia;
  groupBridgeInviteParticipantRef.current = groupBridge.inviteParticipant;
  groupRemoteStreamsByPeerRef.current = groupRemoteStreamsByPeer;

  // SABI_GROUP_ROUTE_START_LOCAL_MEDIA
  useEffect(() => {
    if (!isGroupCallRoute || !route.callId || !route.userId || !groupBridge.ready) return;
    if (endedCallIdsRef.current.has(route.callId)) return;
    if (isInvitedGroupParticipantRoute && !acceptedRef.current && phase !== "active") return;

    if (!isInvitedGroupParticipantRoute) {
      acceptedRef.current = true;
      setPhase((current) => (current === "active" ? current : "active"));
      setStatusKey((current) => (current === "connected" ? current : "connected"));
    }

    const startKey = [route.callId, route.userId, String((route as any).kind || route.kind || "video")].join("|");

    if (groupLocalMediaStartKeyRef.current === startKey && hasLiveSabiTracks(localVideoStream || localStream)) {
      return;
    }

    groupLocalMediaStartKeyRef.current = startKey;
    void groupBridge.startLocalMedia();
  }, [
    isGroupCallRoute,
    isInvitedGroupParticipantRoute,
    phase,
    route.callId,
    route.userId,
    route.kind,
    (route as any).kind,
    groupBridge.ready,
    groupBridge.startLocalMedia,
    localStream,
    localVideoStream,
  ]);


  // SABI_GROUP_INVITE_ALL_KNOWN_PEERS_ON_HANDOFF
  // Full mesh is required for the 3rd phone to hear/see every participant.
  // A new invite route only contains the inviter as peerId, so we also use the
  // synchronized participant list and connect to every known member except self.
  useEffect(() => {
    if (!isGroupCallRoute || !groupBridge.ready || !active) return;
    if (endedCallIdsRef.current.has(route.callId)) return;

    const participantIds = rememberGroupParticipantIds([
      route.peerId,
      rawGroupRouteText("peerId"),
      rawGroupRouteText("partnerId"),
      rawGroupRouteText("participantIds"),
      rawGroupRouteText("groupParticipantIds"),
      rawGroupRouteText("participants"),
      ...Object.keys(groupRemoteStreamsByPeerRef.current),
    ]).filter((id) => id && id !== route.userId && !pendingInvitedParticipantIds.has(id));

    if (!participantIds.length) return;

    const key = [route.callId, route.userId, participantIds.join(",")].join("|");
    if (groupExistingPeerInviteKeyRef.current === key) return;

    groupExistingPeerInviteKeyRef.current = key;

    participantIds.forEach((peerUserId) => {
      void groupBridge.inviteParticipant(peerUserId);
    });
  }, [
    active,
    groupBridge.ready,
    groupBridge.inviteParticipant,
    groupRemoteStreamsByPeer,
    isGroupCallRoute,
    parsedGroupCallRoute,
    pendingInvitedParticipantIds,
    rawGroupRouteText,
    rememberGroupParticipantIds,
    route.callId,
    route.peerId,
    route.userId,
  ]);

  useEffect(() => {
    if (!socket || !route.callId || !route.userId) return undefined;

    const handleAccepted = (payload: unknown) => {
      if (!payload || typeof payload !== "object") return;
      if (endedCallIdsRef.current.has(route.callId)) return;

      if (route.incoming && !isGroupCallRoute) {
        return;
      }

      if (route.incoming && !isGroupCallRoute) {
        return;
      }

      const record = payload as Record<string, any>;
      const callId = String(record.callId || record.id || "").trim();

      if (callId !== route.callId) return;

      const peerUserId = String(
        record.senderUserId ||
          record.fromUserId ||
          record.participantId ||
          record.peerUserId ||
          record.peerId ||
          "",
      ).trim();

      if (!peerUserId || peerUserId === route.userId) return;

      setInvitedParticipants((current) =>
        current.map((participant) =>
          participant.id === peerUserId ? { ...participant, status: "connecting" as const } : participant,
        ),
      );

      const sabiAcceptedLocks =
        (((globalThis as any).__sabiGroupAcceptedOnceLocks ||= {}) as Record<string, number>);
      const sabiAcceptedKey = [route.callId, peerUserId].join("|");
      const sabiAcceptedNow = Date.now();
      const sabiAcceptedLast = sabiAcceptedLocks[sabiAcceptedKey] || 0;

      if (sabiAcceptedNow - sabiAcceptedLast < 30000) {
        return;
      }

      sabiAcceptedLocks[sabiAcceptedKey] = sabiAcceptedNow;

      const participantIds = rememberGroupParticipantIds([
        peerUserId,
        route.peerId,
        ...extractSabiGroupParticipantIds(record),
      ]).filter((id) => id && id !== route.userId);

      console.log("[sabi-call:group] participant accepted:", peerUserId);

      if (route.incoming && !isGroupCallRoute) {
        return;
      }

      participantIds.forEach((participantId) => {
        void groupBridge.inviteParticipant(participantId, { force: true });
      });
    };

    const events = [
      "sabi-call:participant:accepted",
    ];

    events.forEach((eventName) => socket.on?.(eventName, handleAccepted));

    return () => {
      events.forEach((eventName) => socket.off?.(eventName, handleAccepted));
    };
  }, [
    socket,
    route.callId,
    route.userId,
    route.incoming,
    isGroupCallRoute,
    groupBridge.inviteParticipant,
    rememberGroupParticipantIds,
  ]);

  useEffect(() => {
    if (!isGroupCallRoute || !socket || !route.callId || !route.userId) return;
    if (endedCallIdsRef.current.has(route.callId)) return;

    // SABI_MARK_ACTIVE_GROUP_ON_ROUTE_MOUNT
    markSabiCallAsActiveGroup(route.callId);

    console.log(
      "[sabi-call:group] route mounted:",
      "callId=" + String(route.callId || ""),
      "user=" + String(route.userId || ""),
      "peer=" + String(route.peerId || rawGroupRouteText("peerId") || ""),
      "roomType=" + String(isGroupCallRoute ? "group_call" : rawGroupRouteText("roomType") || (route as any).roomType || ""),
      "groupCall=" + String(isGroupCallRoute ? "1" : rawGroupRouteText("groupCall") || (route as any).groupCall || ""),
    );

    if (isInvitedGroupParticipantRoute && !acceptedRef.current) return;

    const hasGroupLocalMedia = Boolean(localVideoStream || localStream);
    if (!active && !hasGroupLocalMedia) return;

    const currentParticipantIds = rememberGroupParticipantIds([
      route.userId,
      route.peerId,
      rawGroupRouteText("peerId"),
      rawGroupRouteText("partnerId"),
      rawGroupRouteText("participantIds"),
      rawGroupRouteText("groupParticipantIds"),
      rawGroupRouteText("participants"),
      ...Object.keys(groupRemoteStreamsByPeerRef.current),
    ]);

    const key = [route.callId, route.userId].join("|");

    const globalAcceptedEmitLocks =
      (((globalThis as any).__sabiGroupAcceptedEmitLocks ||= {}) as Record<string, number>);
    const acceptedEmitNow = Date.now();
    const acceptedEmitLast = globalAcceptedEmitLocks[key] || 0;

    if (groupAcceptedEmitKeyRef.current === key || acceptedEmitNow - acceptedEmitLast < 60000) return;

    groupAcceptedEmitKeyRef.current = key;
    globalAcceptedEmitLocks[key] = acceptedEmitNow;

    const payload = {
      callId: route.callId,
      chatId: route.chatId || (route as any).id || route.callId,
      roomId: route.chatId || (route as any).id || route.callId,
      roomType: "group_call",
      groupCall: true,
      event: "participant_accepted",
      phase: "active",
      status: "active",
      kind: String((route as any).kind || "").toLowerCase().includes("audio") ? "audio" : "video",
      participantIds: currentParticipantIds.join(","),
      groupParticipantIds: currentParticipantIds.join(","),
      participants: currentParticipantIds,
      senderUserId: route.userId,
      fromUserId: route.userId,
      participantId: route.userId,
      peerUserId: route.userId,
      peerId: route.userId,
      receiverUserId: route.peerId || rawGroupRouteText("peerId") || rawGroupRouteText("partnerId"),
      targetUserId: route.peerId || rawGroupRouteText("peerId") || rawGroupRouteText("partnerId"),
      toUserId: route.peerId || rawGroupRouteText("peerId") || rawGroupRouteText("partnerId"),
    };

    console.log("[sabi-call:group] emit participant accepted:", route.userId);

    socket.emit("sabi-call:participant:accepted", payload);
  }, [
    active,
    isGroupCallRoute,
    isInvitedGroupParticipantRoute,
    socket,
    route.callId,
    route.chatId,
    (route as any).id,
route.peerId,
    route.userId,
  ]);

  // SABI_GROUP_VIDEO_REPAIR_EFFECT
  // If a stale peer connection closes, rn-webrtc can mutate an already-rendered
  // remote stream to videoMuted=true. Remove that stale stream and ask the mesh
  // runtime to renegotiate with that participant once, instead of keeping a black
  // RTCView on screen.
  useEffect(() => {
    if (!isGroupCallRoute || !groupBridge.ready) return undefined;
    if (endedCallIdsRef.current.has(route.callId)) return undefined;

    const timer = setInterval(() => {
      const stalePeerIds: string[] = [];

      setGroupRemoteStreamsByPeer((current) => {
        let changed = false;
        const next = { ...current };

        for (const [peerUserId, stream] of Object.entries(current)) {
          if (!stream) continue;
          if (hasLiveSabiVideoTracks(stream)) continue;
          if (!hasLiveSabiTracks(stream)) continue;

          stalePeerIds.push(peerUserId);
          delete next[peerUserId];
          changed = true;
        }

        return changed ? next : current;
      });

      const now = Date.now();
      for (const peerUserId of stalePeerIds) {
        const repairKey = [route.callId, route.userId, peerUserId].join("|");
        const lastRepairAt = groupVideoRepairKeyRef.current[repairKey] || 0;
        if (now - lastRepairAt < 12000) continue;
        groupVideoRepairKeyRef.current[repairKey] = now;
        void groupBridge.inviteParticipant(peerUserId);
      }
    }, 1800);

    return () => clearInterval(timer);
  }, [groupBridge, isGroupCallRoute, route.callId, route.userId]);

  // SABI_GROUP_STREAM_GRID_DATA
  const groupStreamTiles = useMemo(() => {
    if (!isGroupCallRoute) return [];

    const tiles: Array<{
      id: string;
      name: string;
      avatarUrl?: string;
      stream: any | null;
      isSelf: boolean;
      placeholder: boolean;
    }> = [];

    const seen = new Set<string>();

    const pushTile = (
      id: string,
      name: string,
      avatarUrl: string | undefined,
      stream: any | null,
      isSelf: boolean,
      forcePlaceholder = false,
    ) => {
      const key = String(id || name || "").trim();
      if (!key || seen.has(key)) return;

      const hasStream = Boolean(stream && typeof stream.toURL === "function");

      if (!hasStream && !forcePlaceholder) return;

      seen.add(key);
      tiles.push({
        id: key,
        name: name || "Sabi",
        avatarUrl: avatarUrl || undefined,
        stream: hasStream ? stream : null,
        isSelf,
        placeholder: !hasStream,
      });
    };

    // 1) Real group mesh streams must win over old direct-call streams.
    for (const [peerUserId, stream] of Object.entries(groupRemoteStreamsByPeer)) {
      pushTile(
        peerUserId,
        String(peerUserId || "").slice(0, 8) || "Sabi",
        undefined,
        stream,
        false,
      );
    }

    // 2) Existing 1:1 remote participant is only a fallback until mesh stream arrives.
    pushTile(
      route.peerId || "remote",
      route.name || "Sabi",
      routeAvatarUrl,
      pickSabiPreferredStream(remoteVideoStream, remoteStream),
      false,
    );

    // 3) Self tile must always exist in group grid.
    pushTile(
      route.userId || "self",
      "Sabi",
      selfAvatarUrl,
      pickSabiPreferredStream(localVideoStream, localStream),
      true,
      true,
    );

    console.log(
      "[sabi-call:group-grid]",
      "tiles=" + String(tiles.length),
      "remote=" + String(Object.keys(groupRemoteStreamsByPeer).length),
    );

    // SABI_GROUP_TILE_TRACK_DEBUG
    for (const tile of tiles) {
      console.log(
        "[sabi-call:group-tile-track]",
        "id=" + String(tile.id || ""),
        "self=" + String(Boolean(tile.isSelf)),
        JSON.stringify(describeSabiMediaStreamForDebug(tile.stream)),
      );
    }

    return tiles.slice(0, 9);
  }, [
    groupRemoteStreamsByPeer,
    localStream,
    localVideoStream,
    remoteStream,
    remoteVideoStream,
    route.name,
    route.peerId,
    route.userId,
    routeAvatarUrl,
    selfAvatarUrl,
  ]);

  // SABI_GROUP_GRID_LATCH_EFFECT
  useEffect(() => {
    if (!isGroupCallRoute) {
      setGroupGridLatched(false);
      return;
    }

    if (Object.keys(groupRemoteStreamsByPeer).length > 0) {
      setGroupGridLatched(true);
    }
  }, [groupRemoteStreamsByPeer, isGroupCallRoute]);

  const groupRemoteStreamCount = Object.keys(groupRemoteStreamsByPeer).length;
  const groupStreamGridEnabled = groupGridLatched || groupRemoteStreamCount > 0;

  const groupRenderableTiles = useMemo(() => {
    const seen = new Set<string>();
    const tiles: Array<{
      id: string;
      name: string;
      avatarLetter: string;
      avatarUrl?: string;
      stream: any | null;
      isSelf: boolean;
      placeholder: boolean;
    }> = [];

    const pushTile = (tile: {
      id: string;
      name: string;
      avatarLetter?: string;
      avatarUrl?: string;
      stream?: any | null;
      isSelf?: boolean;
      placeholder?: boolean;
    }) => {
      const id = String(tile.id || tile.name || "").trim();
      if (!id || seen.has(id)) return;

      const stream = tile.stream || null;
      const hasStream = Boolean(stream && typeof stream.toURL === "function");

      seen.add(id);
      tiles.push({
        id,
        name: tile.name || "Sabi",
        avatarLetter: String(tile.avatarLetter || tile.name || "S").slice(0, 1).toUpperCase(),
        avatarUrl: String(tile.avatarUrl || ""),
        stream: hasStream ? stream : null,
        isSelf: Boolean(tile.isSelf),
        placeholder: Boolean(tile.placeholder || !hasStream),
      });
    };

    groupStreamTiles.forEach((tile) => {
      pushTile({
        id: tile.id,
        name: tile.name,
        avatarUrl: tile.avatarUrl,
        stream: tile.stream,
        isSelf: tile.isSelf,
        placeholder: tile.placeholder,
      });
    });

    groupTiles.forEach((tile) => {
      pushTile({
        id: tile.id,
        name: tile.name,
        avatarLetter: tile.avatarLetter,
        avatarUrl: tile.avatarUrl,
        stream: tile.stream,
        isSelf: tile.isSelf,
        placeholder: !tile.stream,
      });
    });

    return tiles.slice(0, 9);
  }, [groupStreamTiles, groupTiles]);

  // SABI_GROUP_ACCEPT_FORCE_EMIT removed: one accepted event is enough.

  const renderGroupLayout = false;

  if (compact) {
    return (
      <View style={styles.compactRoot} pointerEvents="box-none">
        {shouldRenderHiddenRemoteAudio ? (
          <RTCView
            streamURL={hiddenRemoteAudioUrl}
            style={styles.hiddenRemoteAudio}
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
                <Text style={styles.compactVideoName} numberOfLines={1}>{route.name}</Text>
                <Text style={styles.compactVideoStatus} numberOfLines={1}>{active ? clock(seconds) : text(statusKey)}</Text>
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
              <Text style={styles.compactName} numberOfLines={1}>{route.name}</Text>
              <Text style={styles.compactStatus} numberOfLines={1}>{active ? clock(seconds) : text(statusKey)}</Text>
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
      {/* SABI_HIDDEN_REMOTE_AUDIO_VIEW */}
      {shouldRenderHiddenRemoteAudio ? (
        <RTCView
          streamURL={hiddenRemoteAudioUrl}
          style={styles.hiddenRemoteAudio}
          objectFit="cover"
        />
      ) : null}

      {renderGroupLayout
        ? groupRenderableTiles
            .filter((tile) =>
              !tile.isSelf &&
              tile.stream &&
              typeof tile.stream.toURL === "function" &&
              !hasLiveSabiVideoTracks(tile.stream),
            )
            .map((tile) => (
              <RTCView
                key={"group-audio:" + String(tile.id) + ":" + String(tile.stream?.toURL?.() || "")}
                streamURL={String(tile.stream?.toURL?.() || "")}
                style={styles.hiddenRemoteAudio}
                objectFit="cover"
              />
            ))
        : null}

      {renderGroupLayout ? (
        <View style={styles.groupStreamGrid}>
          <View style={styles.groupTimerBadge}>
            <Text style={styles.groupTimerText}>
              {active ? clock(seconds) : text(statusKey)}
            </Text>
          </View>

          {groupRenderableTiles.map((tile) => {
            const streamUrl =
              tile.stream && typeof tile.stream.toURL === "function"
                ? String(tile.stream.toURL())
                : "";

            return (
              <View key={String(tile.id)} style={styles.groupStreamTile}>
                {streamUrl ? (
                  <RTCView
                    // SABI_GROUP_RTCVIEW_STRONG_RENDER
                    key={String(tile.id) + ":" + streamUrl}
                    streamURL={streamUrl}
                    style={styles.groupStreamVideo}
                    objectFit="cover"
                    mirror={Boolean(tile.isSelf)}
                    zOrder={tile.isSelf ? 1 : 2}
                  />
                ) : (
                  <View style={styles.groupStreamPlaceholder}>
                    {tile.avatarUrl ? (
                      <Image source={{ uri: tile.avatarUrl }} style={styles.groupStreamAvatarImage} />
                    ) : (
                      <Text style={styles.groupStreamPlaceholderText}>
                        {String(tile.avatarLetter || tile.name || "S").slice(0, 1).toUpperCase()}
                      </Text>
                    )}
                  </View>
                )}

                <View style={styles.groupStreamFooter}>
                  <Text style={styles.groupStreamName} numberOfLines={1}>
                    {tile.name}
                  </Text>
                  <Text style={styles.groupStreamTime} numberOfLines={1}>
                    {active ? text("connected") : text(statusKey)}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      ) : showingVideo && mainStreamUrl ? (
        <RTCView
          streamURL={mainStreamUrl}
          style={styles.fullVideo}
          objectFit="cover"
          mirror={!remoteMain && cameraFacing === "user"}
          zOrder={0}
        />
      ) : (
        <View style={styles.audioBackdrop}>
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

      {renderGroupLayout ? (
        <Pressable style={styles.groupSelfPreview} onPress={() => setRemoteMain((value) => !value)}>
          {localVideoStream && typeof localVideoStream.toURL === "function" ? (
            <RTCView
              streamURL={String(localVideoStream.toURL())}
              style={styles.groupSelfPreviewVideo}
              objectFit="cover"
              mirror={cameraFacing === "user"}
              zOrder={9}
            />
          ) : selfAvatarUrl ? (
            <Image source={{ uri: selfAvatarUrl }} style={styles.groupSelfPreviewImage} />
          ) : (
            <View style={styles.groupSelfPreviewFallback}>
              <Text style={styles.groupSelfPreviewText}>S</Text>
            </View>
          )}
        </Pressable>
      ) : null}


      <View style={styles.topBar}>
        <Pressable style={styles.topCircle} onPress={() => setCompact(true)}>
          <MaterialCommunityIcons name="arrow-collapse-all" size={24} color="#FFFFFF" />
        </Pressable>

        <View style={styles.titleBox}>
          <Text style={styles.name} numberOfLines={1}>{route.name}</Text>
          <Text style={styles.secure} numberOfLines={1}>
            <MaterialCommunityIcons name="lock" size={13} color={theme.muted} /> {renderGroupLayout ? text("secure") : showingVideo ? (active ? clock(seconds) : text(statusKey)) : text("secure")}
          </Text>
        </View>

        <View style={styles.topCircle} pointerEvents="none" />
      </View>

      {renderGroupLayout ? null : showingVideo && !groupMode ? (
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

          {cameraControlsAllowed ? (
            <View style={styles.rightRail}>
              <SideButton icon="camera-flip" active onPress={switchCamera} />
            </View>
          ) : null}
        </>
      ) : (
        <View style={styles.audioStatusBox}>
          <Text style={styles.audioStatus}>{active ? clock(seconds) : text(statusKey)}</Text>
        </View>
      )}

      {/* SABI_CALL_MORE_PANEL */}
      {/* SABI_CALL_ADD_PARTICIPANT_PANEL */}
      {addOpen ? (
        <View style={styles.addPanel}>
          <Text style={styles.addTitle}>{text("add")}</Text>

          <TextInput
            value={contactQuery}
            onChangeText={setContactQuery}
            placeholder={t("contacts.searchContacts")}
            placeholderTextColor="rgba(255,255,255,0.46)"
            autoCapitalize="none"
            autoCorrect={false}
            style={styles.addInput}
          />

          <FlatList
            data={filteredCallContacts.filter((contact) => isSabiCallInviteTarget(contact.userId))}
            keyExtractor={(item) => item.id + ":" + item.phone}
            style={styles.contactList}
            keyboardShouldPersistTaps="handled"
            ListEmptyComponent={
              <Text style={styles.contactEmpty}>
                {contactsLoading ? "..." : t("contacts.noContacts")}
              </Text>
            }
            renderItem={({ item }: { item: CallContactCandidate }) => (
              <Pressable style={styles.contactRow} onPress={() => inviteContact(item)}>
                <View style={styles.contactAvatar}>
                  <Text style={styles.contactAvatarText}>{item.avatarLetter}</Text>
                </View>

                <View style={styles.contactBody}>
                  <Text style={styles.contactName} numberOfLines={1}>{item.name}</Text>
                  <Text style={styles.contactPhone} numberOfLines={1}>{item.phone}</Text>
                </View>

                <View style={styles.contactInviteIcon}>
                  <MaterialCommunityIcons name="phone-plus" size={22} color="#FFFFFF" />
                </View>
              </Pressable>
            )}
          />

          <Pressable
            style={styles.addCloseButton}
            onPress={() => {
              setContactQuery("");
              setAddOpen(false);
            }}
          >
            <Text style={styles.addActionText}>{text("decline")}</Text>
          </Pressable>
        </View>
      ) : null}

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
        {cameraControlsAllowed ? (
          <DockButton icon={cameraEnabled ? "video" : "video-off"} active={cameraEnabled} onPress={toggleCamera} />
        ) : null}
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
    groupGrid: {
      flex: 1,
      paddingTop: 116,
      paddingHorizontal: 12,
      paddingBottom: 124,
      flexDirection: "row",
      flexWrap: "wrap",
      alignContent: "center",
      justifyContent: "center",
      gap: 10,
      backgroundColor: theme.bg,
    },
    groupTile: {
      width: "30%",
      minWidth: 104,
      maxWidth: 154,
      aspectRatio: 0.74,
      borderRadius: 24,
      overflow: "hidden",
      backgroundColor: "rgba(255,255,255,0.10)",
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.16)",
    },
    groupTileVideo: {
      ...StyleSheet.absoluteFillObject,
    },
    groupTileAvatarBox: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "rgba(255,255,255,0.08)",
    },
    groupTileAvatar: {
      width: 62,
      height: 62,
      borderRadius: 31,
      backgroundColor: theme.accent,
      alignItems: "center",
      justifyContent: "center",
    },
    groupTileAvatarText: {
      color: theme.text,
      fontSize: 24,
      fontWeight: "900",
    },
    groupTileFooter: {
      position: "absolute",
      left: 0,
      right: 0,
      bottom: 0,
      paddingHorizontal: 8,
      paddingVertical: 8,
      backgroundColor: "rgba(0,0,0,0.42)",
    },
    groupTileName: {
      color: theme.text,
      fontSize: 12,
      fontWeight: "900",
      textAlign: "center",
    },
    groupTileStatus: {
      color: theme.muted,
      fontSize: 10,
      fontWeight: "800",
      textAlign: "center",
      marginTop: 2,
    },
    groupStreamGrid: {
      flex: 1,
      paddingTop: 112,
      paddingHorizontal: 12,
      paddingBottom: 124,
      flexDirection: "row",
      flexWrap: "wrap",
      alignContent: "center",
      justifyContent: "center",
      gap: 10,
      backgroundColor: theme.bg,
    },
    groupTimerBadge: {
      position: "absolute",
      top: 62,
      alignSelf: "center",
      zIndex: 50,
      paddingHorizontal: 14,
      paddingVertical: 7,
      borderRadius: 999,
      backgroundColor: "rgba(0,0,0,0.52)",
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.18)",
    },
    groupTimerText: {
      color: "#FFFFFF",
      fontSize: 15,
      fontWeight: "900",
      letterSpacing: 0.4,
    },
    groupStreamTile: {
      // SABI_GROUP_TILE_VIDEO_CONTAINER
      width: "30%",
      minWidth: 104,
      maxWidth: 158,
      aspectRatio: 0.74,
      borderRadius: 24,
      overflow: "hidden",
      backgroundColor: "#050505",
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.16)",
    },
    groupStreamVideo: {
      // SABI_GROUP_VIDEO_LAYER_STYLE
      position: "absolute",
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
      width: "100%",
      height: "100%",
      zIndex: 2,
      opacity: 1,
      backgroundColor: "transparent",
    },
    groupStreamPlaceholder: {
      ...StyleSheet.absoluteFillObject,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "rgba(255,255,255,0.10)",
    },
    groupStreamPlaceholderText: {
      color: theme.text,
      fontSize: 34,
      fontWeight: "900",
    },
    groupStreamAvatarImage: {
      width: "100%",
      height: "100%",
    },
    groupStreamFooter: {
      position: "absolute",
      left: 0,
      right: 0,
      bottom: 0,
      paddingHorizontal: 8,
      paddingVertical: 8,
      backgroundColor: "rgba(0,0,0,0.42)",
    },
    groupStreamName: {
      color: theme.text,
      fontSize: 12,
      fontWeight: "900",
      textAlign: "center",
    },
    groupStreamTime: {
      color: theme.muted,
      fontSize: 10,
      fontWeight: "800",
      textAlign: "center",
      marginTop: 2,
    },
    audioBackdrop: {
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
    groupSelfPreview: {
      position: "absolute",
      right: 18,
      bottom: 112,
      width: 112,
      height: 154,
      borderRadius: 20,
      overflow: "hidden",
      backgroundColor: "#111",
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.32)",
      zIndex: 28,
      elevation: 28,
    },
    groupSelfPreviewVideo: {
      flex: 1,
    },
    groupSelfPreviewImage: {
      width: "100%",
      height: "100%",
    },
    groupSelfPreviewFallback: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "rgba(255,255,255,0.10)",
    },
    groupSelfPreviewText: {
      color: theme.text,
      fontSize: 32,
      fontWeight: "900",
    },
    topBar: {
      position: "absolute",
      top: 42,
      left: 18,
      right: 18,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      zIndex: 0,
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
    audioStatusBox: {
      position: "absolute",
      left: 0,
      right: 0,
      bottom: 136,
      alignItems: "center",
    },
    audioStatus: {
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
    topCircleActive: {
      backgroundColor: theme.accent,
    },
    addPanel: {
      position: "absolute",
      left: 18,
      right: 18,
      bottom: 118,
      borderRadius: 26,
      backgroundColor: "rgba(8,17,20,0.97)",
      borderWidth: 1,
      borderColor: theme.border,
      padding: 14,
      zIndex: 11,
      elevation: 31,
    },
    addTitle: {
      color: theme.text,
      fontSize: 16,
      fontWeight: "900",
      marginBottom: 10,
      textAlign: "center",
    },
    addInput: {
      height: 52,
      borderRadius: 18,
      backgroundColor: "rgba(255,255,255,0.10)",
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.13)",
      color: theme.text,
      fontSize: 15,
      fontWeight: "800",
      paddingHorizontal: 14,
    },
    addActions: {
      flexDirection: "row",
      gap: 10,
      marginTop: 12,
    },
    addActionButton: {
      flex: 1,
      height: 48,
      borderRadius: 18,
      alignItems: "center",
      justifyContent: "center",
    },
    addCancelButton: {
      backgroundColor: "rgba(255,255,255,0.12)",
    },
    addSendButton: {
      backgroundColor: theme.accent,
    },
    addActionText: {
      color: theme.text,
      fontSize: 14,
      fontWeight: "900",
    },
    contactList: {
      maxHeight: 292,
      marginTop: 12,
    },
    contactRow: {
      minHeight: 68,
      borderRadius: 20,
      backgroundColor: "rgba(255,255,255,0.09)",
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.11)",
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 12,
      marginBottom: 9,
    },
    contactAvatar: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: theme.accent,
      alignItems: "center",
      justifyContent: "center",
    },
    contactAvatarText: {
      color: theme.text,
      fontSize: 17,
      fontWeight: "900",
    },
    contactBody: {
      flex: 1,
      marginHorizontal: 12,
    },
    contactName: {
      color: theme.text,
      fontSize: 15,
      fontWeight: "900",
    },
    contactPhone: {
      color: theme.muted,
      fontSize: 12,
      fontWeight: "700",
      marginTop: 3,
    },
    contactInviteIcon: {
      width: 42,
      height: 42,
      borderRadius: 21,
      backgroundColor: "rgba(255,255,255,0.12)",
      alignItems: "center",
      justifyContent: "center",
    },
    contactEmpty: {
      color: theme.muted,
      fontSize: 14,
      fontWeight: "800",
      textAlign: "center",
      paddingVertical: 22,
    },
    addCloseButton: {
      height: 46,
      borderRadius: 18,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "rgba(255,255,255,0.12)",
      marginTop: 4,
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
    hiddenRemoteAudio: {
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






