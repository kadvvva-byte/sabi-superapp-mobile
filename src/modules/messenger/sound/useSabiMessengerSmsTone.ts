import { Audio } from "expo-av";
import { useEffect, useRef } from "react";
import { AppState, DeviceEventEmitter, type AppStateStatus } from "react-native";

import { getAuthSessionState, isAuthenticatedSessionReady } from "../../../core/kernel/auth/session.store";
import { messengerKernelFacade } from "../../../core/kernel/messenger/facade";
import { resolveSabiSoundForKind } from "../../notifications/sounds/sabiSoundPreferences";
import { getSuperAppSocket } from "../../../shared/realtime/superapp-socket";

type MessengerSmsToneParams = {
  enabled: boolean;
  pathname?: string | null;
};

type UnknownRecord = Record<string, unknown>;

const MESSAGE_EVENTS = [
  "message:new",
  "new_message",
  "chat:message",
  "chat:message:new",
  "message.created",
  "message.sent",
  "message:created",
  "message:sent",
  "messenger:message:new",
  "messenger:message",
  "sabi-messenger:message:new",
  "sabi-messenger:sms:new",
  "post.created",
  "post:created",
  "channel.message.new",
  "channel.message",
  "channel.post",
  "channel:message:new",
  "channel:message",
  "channel:post",
];

function normalizeString(value: unknown): string {
  if (typeof value === "string" && value.trim()) return value.trim();
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return "";
}

function normalizeRecord(value: unknown): UnknownRecord {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return value as UnknownRecord;
}

function unwrapMessagePayload(payload: unknown): UnknownRecord {
  const root = normalizeRecord(payload);
  const rootData = normalizeRecord(root.data);
  const rootPayload = normalizeRecord(root.payload);

  const candidates = [
    root.message,
    root.post,
    root.entity,
    rootData.message,
    rootData.post,
    rootPayload.message,
    rootPayload.post,
    rootPayload.data,
    root.data,
    root.payload,
  ];

  for (const candidate of candidates) {
    const record = normalizeRecord(candidate);
    if (Object.keys(record).length > 0) return record;
  }

  return root;
}

function getMessageId(payload: unknown): string {
  const root = normalizeRecord(payload);
  const message = unwrapMessagePayload(payload);

  return (
    normalizeString(message.id) ||
    normalizeString(message.messageId) ||
    normalizeString(message.clientMessageId) ||
    normalizeString(message.tempId) ||
    normalizeString(root.id) ||
    normalizeString(root.messageId) ||
    normalizeString(root.clientMessageId)
  );
}

function getRoomId(payload: unknown): string {
  const root = normalizeRecord(payload);
  const message = unwrapMessagePayload(payload);

  return (
    normalizeString(message.roomId) ||
    normalizeString(message.chatId) ||
    normalizeString(message.conversationId) ||
    normalizeString(root.roomId) ||
    normalizeString(root.chatId) ||
    normalizeString(root.conversationId)
  );
}

function getSenderUserId(payload: unknown): string {
  const root = normalizeRecord(payload);
  const message = unwrapMessagePayload(payload);

  return (
    normalizeString(message.senderUserId) ||
    normalizeString(message.senderId) ||
    normalizeString(message.fromUserId) ||
    normalizeString(message.authorUserId) ||
    normalizeString(message.authorId) ||
    normalizeString(message.userId) ||
    normalizeString(root.senderUserId) ||
    normalizeString(root.senderId) ||
    normalizeString(root.fromUserId) ||
    normalizeString(root.authorUserId) ||
    normalizeString(root.authorId) ||
    normalizeString(root.userId)
  );
}

function getRecipientUserId(payload: unknown): string {
  const root = normalizeRecord(payload);
  const message = unwrapMessagePayload(payload);

  return (
    normalizeString(message.receiverUserId) ||
    normalizeString(message.recipientUserId) ||
    normalizeString(message.toUserId) ||
    normalizeString(root.receiverUserId) ||
    normalizeString(root.recipientUserId) ||
    normalizeString(root.toUserId)
  );
}


function getSourceEventName(payload: unknown): string {
  const root = normalizeRecord(payload);
  const message = unwrapMessagePayload(payload);

  return (
    normalizeString(message.sourceEventName) ||
    normalizeString(message.eventName) ||
    normalizeString(root.sourceEventName) ||
    normalizeString(root.eventName) ||
    normalizeString(root.type)
  ).toLowerCase();
}

function getRoomType(payload: unknown): string {
  const root = normalizeRecord(payload);
  const message = unwrapMessagePayload(payload);

  return (
    normalizeString(message.roomType) ||
    normalizeString(message.type) ||
    normalizeString(message.kind) ||
    normalizeString(root.roomType) ||
    normalizeString(root.type) ||
    normalizeString(root.kind)
  ).toLowerCase();
}

function isSabiChannelMessagePayload(payload: unknown): boolean {
  const sourceEventName = getSourceEventName(payload);
  const roomType = getRoomType(payload);
  const roomId = getRoomId(payload).toLowerCase();

  return (
    sourceEventName === "channel:post" ||
    sourceEventName === "channel.post" ||
    sourceEventName.includes("channel:message") ||
    sourceEventName.includes("channel.message") ||
    roomType === "channel" ||
    roomType === "channel_post" ||
    roomType === "post" ||
    roomId.startsWith("channel:")
  );
}

function isSabiSmsToneMessageEventName(eventName: unknown): boolean {
  const lower = normalizeString(eventName).toLowerCase();
  if (!lower) return false;

  if (
    lower.includes("read") ||
    lower.includes("seen") ||
    lower.includes("delivered") ||
    lower.includes("typing") ||
    lower.includes("presence") ||
    lower.includes("deleted") ||
    lower.includes("removed") ||
    lower.includes("reaction") ||
    lower.includes("call")
  ) {
    return false;
  }

  return (
    MESSAGE_EVENTS.includes(lower) ||
    lower.includes("message:new") ||
    lower.includes("message:created") ||
    lower.includes("message.created") ||
    lower.includes("chat:message") ||
    lower === "new_message" ||
    lower === "channel:post" ||
    lower === "channel.post" ||
    lower.includes("channel:message") ||
    lower.includes("channel.message")
  );
}

function buildSabiSmsTonePayloadFromKernelEvent(event: unknown): unknown | null {
  const record = normalizeRecord(event);
  const eventName =
    normalizeString(record.eventName) ||
    normalizeString(record.name) ||
    normalizeString(record.type);

  const sourcePayload =
    record.payload ??
    record.data ??
    record.message ??
    record.post ??
    event;

  const payloadRecord = normalizeRecord(sourcePayload);
  const payloadEventName =
    normalizeString(payloadRecord.sourceEventName) ||
    normalizeString(payloadRecord.eventName) ||
    eventName;

  if (!isSabiSmsToneMessageEventName(eventName) && !isSabiSmsToneMessageEventName(payloadEventName)) {
    return null;
  }

  return {
    ...payloadRecord,
    sourceEventName: payloadEventName,
    eventName,
  };
}

function getMessageKind(payload: unknown): string {
  const root = normalizeRecord(payload);
  const message = unwrapMessagePayload(payload);

  return (
    normalizeString(message.kind) ||
    normalizeString(message.type) ||
    normalizeString(message.messageType) ||
    normalizeString(root.kind) ||
    normalizeString(root.type)
  ).toLowerCase();
}

function isSystemOnlyMessage(payload: unknown): boolean {
  const kind = getMessageKind(payload);

  return (
    kind.includes("read") ||
    kind.includes("delivered") ||
    kind.includes("typing") ||
    kind.includes("presence") ||
    kind.includes("deleted") ||
    kind.includes("removed") ||
    kind.includes("reaction") ||
    kind.includes("call")
  );
}

function makeDedupeKey(payload: unknown): string {
  const message = unwrapMessagePayload(payload);
  const messageId = getMessageId(payload);
  const roomId = getRoomId(payload);
  const senderId = getSenderUserId(payload);

  if (messageId) return ["message", roomId, messageId].join(":");

  return [
    "fallback",
    roomId,
    senderId,
    normalizeString(message.text).slice(0, 40),
    normalizeString(message.createdAt) || normalizeString(message.sentAt),
  ].join(":");
}

function pruneDedupeMap(map: Map<string, number>, now: number) {
  for (const [key, value] of map.entries()) {
    if (now - value > 15000) map.delete(key);
  }
}

function shouldPlayIncomingSmsTone(payload: unknown, currentUserId: string, appState: AppStateStatus) {
  if (appState !== "active") return false;
  if (!currentUserId) return false;
  if (isSystemOnlyMessage(payload)) return false;

  const senderUserId = getSenderUserId(payload);
  const recipientUserId = getRecipientUserId(payload);

  if (senderUserId && senderUserId === currentUserId) return false;
  if (senderUserId && senderUserId !== currentUserId) return true;
  if (recipientUserId && recipientUserId === currentUserId) return true;

  // Channel posts often arrive as broadcast events without receiverUserId.
  // They still need normal message tone for subscribers/admins.
  if (isSabiChannelMessagePayload(payload)) return true;

  return false;
}

export function useSabiMessengerSmsTone({ enabled, pathname }: MessengerSmsToneParams) {
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);
  const soundRef = useRef<Audio.Sound | null>(null);
  const lastPlayAtRef = useRef(0);
  const seenRef = useRef<Map<string, number>>(new Map());
  const mountedRef = useRef(false);
  const pathnameRef = useRef(pathname || "");

  pathnameRef.current = pathname || "";

  useEffect(() => {
    mountedRef.current = true;

    const subscription = AppState.addEventListener("change", (nextState) => {
      appStateRef.current = nextState;
    });

    return () => {
      mountedRef.current = false;
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    if (!enabled) return undefined;

    const auth = getAuthSessionState();
    const currentUserId =
      isAuthenticatedSessionReady() && auth.status === "authenticated"
        ? normalizeString(auth.currentUserId)
        : "";

    if (!currentUserId) return undefined;

    let cancelled = false;
    const socket = getSuperAppSocket(currentUserId);

    async function createSelectedMessageSound() {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: false,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

      const selectedTone = await resolveSabiSoundForKind("message");
      const { sound } = await Audio.Sound.createAsync(selectedTone.source, {
        shouldPlay: false,
        volume: 0.86,
      });

      if (cancelled || !mountedRef.current) {
        await sound.unloadAsync().catch(() => undefined);
        return null;
      }

      return sound;
    }

    async function playTone() {
      const now = Date.now();
      if (now - lastPlayAtRef.current < 650) return;
      lastPlayAtRef.current = now;

      try {
        const previous = soundRef.current;
        soundRef.current = null;
        await previous?.unloadAsync().catch(() => undefined);

        const sound = await createSelectedMessageSound();
        if (!sound) return;

        soundRef.current = sound;
        await sound.stopAsync().catch(() => undefined);
        await sound.setPositionAsync(0).catch(() => undefined);
        await sound.playAsync();
      } catch (error) {
        console.warn(
          "[sabi-messenger:sms-tone] play failed",
          error instanceof Error ? error.message : error,
        );
      }
    }

    function acceptMessagePayload(payload: unknown) {
      if (!shouldPlayIncomingSmsTone(payload, currentUserId, appStateRef.current)) return;

      const key = makeDedupeKey(payload);
      const now = Date.now();
      pruneDedupeMap(seenRef.current, now);

      const lastSeenAt = seenRef.current.get(key) || 0;
      if (lastSeenAt && now - lastSeenAt < 2500) return;

      seenRef.current.set(key, now);
      void playTone();
    }

    const deviceSubscriptions = MESSAGE_EVENTS.map((eventName) =>
      DeviceEventEmitter.addListener(eventName, acceptMessagePayload),
    );

    MESSAGE_EVENTS.forEach((eventName) => socket.on(eventName, acceptMessagePayload));

    // SABI_CHANNEL_SMS_TONE_KERNEL_REALTIME:
    // Channel posts are delivered through messenger kernel realtime as custom message:new/channel:post events.
    const unsubscribeKernelRealtime = messengerKernelFacade.on("realtimeEvent", (event) => {
      const payload = buildSabiSmsTonePayloadFromKernelEvent(event);
      if (payload) acceptMessagePayload(payload);
    });

    if (!socket.connected) socket.connect();

    return () => {
      cancelled = true;
      deviceSubscriptions.forEach((subscription) => subscription.remove());
      MESSAGE_EVENTS.forEach((eventName) => socket.off(eventName, acceptMessagePayload));
      unsubscribeKernelRealtime();
    };
  }, [enabled]);

  useEffect(() => {
    if (enabled) return undefined;

    const sound = soundRef.current;
    soundRef.current = null;
    void sound?.unloadAsync().catch(() => undefined);

    return undefined;
  }, [enabled]);

  useEffect(() => {
    return () => {
      const sound = soundRef.current;
      soundRef.current = null;
      void sound?.unloadAsync().catch(() => undefined);
    };
  }, []);
}
