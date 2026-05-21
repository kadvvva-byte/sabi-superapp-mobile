import { Stack, router, usePathname } from "expo-router";
import * as Notifications from "expo-notifications";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  AppState,
  DeviceEventEmitter,
  InteractionManager,
  Platform,
  StyleSheet,
  View,
  type AppStateStatus,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "react-native-reanimated";
import { restoreAuthenticatedSessionFromStorage } from "../src/core/kernel/auth/session.actions";
import {
  getAuthSessionState,
  isAuthenticatedSessionReady,
  subscribeAuthSessionState,
} from "../src/core/kernel/auth/session.store";
import { homeKernelFacade } from "../src/core/kernel/home";
import {
  bootMessengerKernel,
  configureMessengerRuntime,
  configureMessengerSession,
  setMessengerKernelPresenceActive,
  shutdownMessengerKernel,
} from "../src/core/kernel/messenger/facade";
import { createMessengerKernelHttpRuntimeConfig } from "../src/core/kernel/messenger/runtime";
import { subscribeMessengerRealtimeService } from "../src/core/kernel/messenger/realtime/service";
import {
  configureProfileRuntime,
  configureProfileSession,
  profileKernelFacade,
  shutdownProfileKernel,
} from "../src/core/kernel/profile";
import useSuperappLiveBootstrap from "../src/hooks/use-superapp-live-bootstrap";
import { fetchUserProfileById } from "../src/shared/api/user-profile-api";
import { buildSabiDisplayId } from "../src/shared/account/unified-account-profile";
import AppProviders from "../src/modules/app/ui/AppProviders";
import SabiPlatformStabilityProvider from "../src/shared/platform/SabiPlatformStabilityProvider";
import { HomeEditModeProvider } from "../src/modules/home/HomeEditModeProvider";
import { HomeLayoutProvider } from "../src/modules/home/HomeLayoutProvider";
import {
  getSuperAppSocket,
  joinRealtimeChannel,
  joinWalletCoreChannel,
  leaveRealtimeChannel,
  leaveWalletCoreChannel,
} from "../src/shared/realtime/superapp-socket";
import { useSabiMessengerSmsTone } from "../src/modules/messenger/sound/useSabiMessengerSmsTone";
import AppBackground from "../src/theme/AppBackground";
import { AppearanceProvider } from "../src/theme/AppearanceProvider";
import { ThemeProvider } from "../src/theme/ThemeProvider";
import { useSabiCallPushRegistration } from "../src/modules/calls/push/useSabiCallPushRegistration";
import { getPrivateChatProfile } from "../src/modules/messenger/private/privateChatRuntime";
import { listCustomMessengerContacts } from "../src/modules/messenger/contacts/messengerContactsRuntime";

let appKernelsConfigured = false;


function shouldSkipSabiDirectGroupShadowRoute(route: unknown): boolean {
  const params = (((route as any) || {}).params || {}) as Record<string, any>;

  const callId = String(params.callId || params.id || "");
  const userId = String(
    params.userId ||
      params.currentUserId ||
      params.receiverUserId ||
      params.targetUserId ||
      params.toUserId ||
      ""
  );

  const roomType = String(params.roomType || "").toLowerCase();
  const groupCall = String(params.groupCall || params.isGroupCall || "");

  return Boolean(
    roomType !== "group_call" &&
      groupCall !== "1" &&
      callId.startsWith("call:") &&
      userId &&
      !callId.includes(userId)
  );
}

function sleep(ms: number) {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });
}

function getAuthenticatedSessionKey(): string | null {
  const auth = getAuthSessionState();

  if (
    !isAuthenticatedSessionReady() ||
    auth.status !== "authenticated" ||
    !auth.apiBaseUrl ||
    !auth.accessToken ||
    !auth.currentUserId
  ) {
    return null;
  }

  return [auth.apiBaseUrl, auth.accessToken, auth.currentUserId].join("|");
}

function getAuthenticatedSessionSnapshot() {
  const auth = getAuthSessionState();

  if (
    isAuthenticatedSessionReady() &&
    auth.status === "authenticated" &&
    auth.apiBaseUrl &&
    auth.accessToken &&
    auth.currentUserId
  ) {
    return {
      apiBaseUrl: auth.apiBaseUrl,
      accessToken: auth.accessToken,
      currentUserId: auth.currentUserId,
      phone: auth.phoneNumber,
      socketUrl: auth.apiBaseUrl,
      socketPath: process.env.EXPO_PUBLIC_SOCKET_PATH ?? "/socket.io",
      authScheme: "Bearer" as const,
      query: {
        userId: auth.currentUserId,
      },
      headers: {},
    };
  }

  return null;
}

function normalizePathname(value?: string | null) {
  const path = String(value || "").trim() || "/";
  return path.length > 1 ? path.replace(/\/+$/, "") : path;
}

function isMessengerPresencePath(pathname?: string | null) {
  const path = normalizePathname(pathname).toLowerCase();

  if (path === "/tabs") return true;
  if (path === "/private-chats") return true;
  if (path === "/private-chat-settings") return true;
  if (path === "/chat-partner-info") return true;
  if (path === "/chat-report") return true;
  if (path === "/chat-tool") return true;
  if (path === "/messenger-theme") return true;
  if (path === "/bots-probe") return true;
  if (path.startsWith("/qr/messenger")) return true;

  const messengerTabPrefixes = [
    "/tabs/chats",
    "/tabs/chat",
    "/tabs/calls",
    "/tabs/contacts",
    "/tabs/groups",
    "/tabs/bots",
    "/tabs/bot-owner",
    "/tabs/channels",
    "/tabs/business",
    "/profile/group",
    "/profile/channels",
    "/profile/bot",
  ];

  return messengerTabPrefixes.some((prefix) => path === prefix || path.startsWith(`${prefix}/`));
}

function resolveMessengerRoomIdFromPath(pathname?: string | null) {
  const path = normalizePathname(pathname);
  const match = path.match(/^\/tabs\/chat\/([^/?#]+)/i);
  return match?.[1] ? decodeURIComponent(match[1]) : null;
}

type IncomingMessengerCallPayload = Record<string, unknown>;

function normalizeIncomingCallString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : "";
}

const SABI_MESSENGER_SYSTEM_NOTIFICATION_DEDUPE_MS = 2500;
const sabiMessengerSystemNotificationDedupe = new Map<string, number>();
const sabiSystemNotificationDedupe = new Map<string, number>();
let sabiMessengerNotificationChannelReady = false;
let sabiWalletNotificationChannelReady = false;
let sabiGeneralNotificationChannelReady = false;

function normalizeSabiMessengerNotificationText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeSabiMessengerNotificationLower(value: unknown): string {
  return normalizeSabiMessengerNotificationText(value).toLowerCase();
}

function normalizeSabiNotificationIdentity(value: unknown): string {
  return normalizeSabiMessengerNotificationText(value).toLowerCase();
}

function readSabiMessengerNotificationObject(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function pickSabiNestedObject(...values: unknown[]): Record<string, unknown> {
  for (const value of values) {
    const record = readSabiMessengerNotificationObject(value);
    if (Object.keys(record).length > 0) return record;
  }
  return {};
}

function pickSabiMessengerPayload(event: unknown): Record<string, unknown> {
  const record = readSabiMessengerNotificationObject(event);
  const payload = readSabiMessengerNotificationObject(record.payload);
  const data = readSabiMessengerNotificationObject(record.data);
  const message = readSabiMessengerNotificationObject(record.message);

  const sender = pickSabiNestedObject(
    record.sender,
    record.from,
    record.author,
    payload.sender,
    payload.from,
    payload.author,
    data.sender,
    data.from,
    data.author,
    message.sender,
    message.from,
    message.author,
    message.user,
  );

  const recipient = pickSabiNestedObject(
    record.recipient,
    record.receiver,
    record.to,
    record.target,
    payload.recipient,
    payload.receiver,
    payload.to,
    payload.target,
    data.recipient,
    data.receiver,
    data.to,
    data.target,
    message.recipient,
    message.receiver,
    message.to,
    message.target,
  );

  const room = pickSabiNestedObject(
    record.chat,
    record.room,
    record.group,
    record.channel,
    record.bot,
    payload.chat,
    payload.room,
    payload.group,
    payload.channel,
    payload.bot,
    data.chat,
    data.room,
    data.group,
    data.channel,
    data.bot,
    message.chat,
    message.room,
    message.group,
    message.channel,
    message.bot,
  );

  return {
    ...record,
    ...payload,
    ...data,
    ...message,
    senderId:
      normalizeSabiMessengerNotificationText(message.senderId) ||
      normalizeSabiMessengerNotificationText(message.authorId) ||
      normalizeSabiMessengerNotificationText(message.fromUserId) ||
      normalizeSabiMessengerNotificationText(message.userId) ||
      normalizeSabiMessengerNotificationText(sender.id) ||
      normalizeSabiMessengerNotificationText(sender.userId) ||
      normalizeSabiMessengerNotificationText(sender.senderId) ||
      normalizeSabiMessengerNotificationText(sender.authorId) ||
      normalizeSabiMessengerNotificationText(sender.fromUserId) ||
      normalizeSabiMessengerNotificationText(data.senderId) ||
      normalizeSabiMessengerNotificationText(payload.senderId) ||
      normalizeSabiMessengerNotificationText(record.senderId) ||
      normalizeSabiMessengerNotificationText(record.fromUserId) ||
      normalizeSabiMessengerNotificationText(record.userId),
    senderName:
      normalizeSabiMessengerNotificationText(message.senderName) ||
      normalizeSabiMessengerNotificationText(message.authorName) ||
      normalizeSabiMessengerNotificationText(message.fromName) ||
      normalizeSabiMessengerNotificationText(sender.name) ||
      normalizeSabiMessengerNotificationText(sender.displayName) ||
      normalizeSabiMessengerNotificationText(sender.fullName) ||
      normalizeSabiMessengerNotificationText(sender.username) ||
      normalizeSabiMessengerNotificationText(data.senderName) ||
      normalizeSabiMessengerNotificationText(payload.senderName) ||
      normalizeSabiMessengerNotificationText(record.senderName),
    senderPhone:
      normalizeSabiMessengerNotificationText(message.senderPhone) ||
      normalizeSabiMessengerNotificationText(message.authorPhone) ||
      normalizeSabiMessengerNotificationText(message.fromPhone) ||
      normalizeSabiMessengerNotificationText(sender.phone) ||
      normalizeSabiMessengerNotificationText(sender.phoneNumber) ||
      normalizeSabiMessengerNotificationText(sender.msisdn) ||
      normalizeSabiMessengerNotificationText(data.senderPhone) ||
      normalizeSabiMessengerNotificationText(payload.senderPhone) ||
      normalizeSabiMessengerNotificationText(record.senderPhone),
    recipientUserId:
      normalizeSabiMessengerNotificationText(message.recipientUserId) ||
      normalizeSabiMessengerNotificationText(message.receiverUserId) ||
      normalizeSabiMessengerNotificationText(message.toUserId) ||
      normalizeSabiMessengerNotificationText(message.targetUserId) ||
      normalizeSabiMessengerNotificationText(recipient.id) ||
      normalizeSabiMessengerNotificationText(recipient.userId) ||
      normalizeSabiMessengerNotificationText(recipient.recipientUserId) ||
      normalizeSabiMessengerNotificationText(recipient.receiverUserId) ||
      normalizeSabiMessengerNotificationText(recipient.toUserId) ||
      normalizeSabiMessengerNotificationText(data.recipientUserId) ||
      normalizeSabiMessengerNotificationText(payload.recipientUserId) ||
      normalizeSabiMessengerNotificationText(record.recipientUserId) ||
      normalizeSabiMessengerNotificationText(record.receiverUserId) ||
      normalizeSabiMessengerNotificationText(record.toUserId),
    recipientPhone:
      normalizeSabiMessengerNotificationText(message.recipientPhone) ||
      normalizeSabiMessengerNotificationText(message.receiverPhone) ||
      normalizeSabiMessengerNotificationText(message.toPhone) ||
      normalizeSabiMessengerNotificationText(recipient.phone) ||
      normalizeSabiMessengerNotificationText(recipient.phoneNumber) ||
      normalizeSabiMessengerNotificationText(recipient.msisdn),
    chatTitle:
      normalizeSabiMessengerNotificationText(message.chatTitle) ||
      normalizeSabiMessengerNotificationText(room.title) ||
      normalizeSabiMessengerNotificationText(room.name) ||
      normalizeSabiMessengerNotificationText(data.chatTitle) ||
      normalizeSabiMessengerNotificationText(payload.chatTitle) ||
      normalizeSabiMessengerNotificationText(record.chatTitle),
    roomTitle:
      normalizeSabiMessengerNotificationText(message.roomTitle) ||
      normalizeSabiMessengerNotificationText(room.title) ||
      normalizeSabiMessengerNotificationText(room.name) ||
      normalizeSabiMessengerNotificationText(data.roomTitle) ||
      normalizeSabiMessengerNotificationText(payload.roomTitle) ||
      normalizeSabiMessengerNotificationText(record.roomTitle),
  };
}

function isSabiMessengerMessageEvent(event: unknown): boolean {
  const record = readSabiMessengerNotificationObject(event);
  const payload = pickSabiMessengerPayload(event);
  const marker = [
    record.type,
    record.eventName,
    record.sourceEventName,
    record.roomType,
    record.chatType,
    payload.type,
    payload.kind,
    payload.event,
    payload.eventName,
    payload.sourceEventName,
    payload.notificationType,
    payload.sabiType,
    payload.roomType,
    payload.chatType,
  ]
    .map(normalizeSabiMessengerNotificationLower)
    .join("|");

  if (marker.includes("typing") || marker.includes("presence") || marker.includes("read") || marker.includes("delivered")) {
    return false;
  }

  return (
    marker.includes("message:new") ||
    marker.includes("new_message") ||
    marker.includes("chat:message") ||
    marker.includes("messenger") ||
    marker.includes("group") ||
    marker.includes("channel") ||
    marker.includes("bot") ||
    marker.includes("message") ||
    Boolean(
      normalizeSabiMessengerNotificationText(payload.chatId || payload.roomId) &&
        (normalizeSabiMessengerNotificationText(payload.content) ||
          normalizeSabiMessengerNotificationText(payload.text) ||
          normalizeSabiMessengerNotificationText(payload.body) ||
          normalizeSabiMessengerNotificationText(payload.previewTitle) ||
          normalizeSabiMessengerNotificationText(payload.mediaUri) ||
          normalizeSabiMessengerNotificationText(payload.attachmentUrl) ||
          normalizeSabiMessengerNotificationText(payload.fileName)),
    )
  );
}

function pickSabiMessengerSenderId(payload: Record<string, unknown>): string {
  return (
    normalizeSabiMessengerNotificationText(payload.senderId) ||
    normalizeSabiMessengerNotificationText(payload.authorId) ||
    normalizeSabiMessengerNotificationText(payload.fromUserId) ||
    normalizeSabiMessengerNotificationText(payload.userId)
  );
}

function pickSabiMessengerTargetIds(payload: Record<string, unknown>): string[] {
  return Array.from(
    new Set(
      [
        payload.recipientUserId,
        payload.receiverUserId,
        payload.toUserId,
        payload.targetUserId,
        payload.ownerUserId,
        payload.participantUserId,
      ]
        .map(normalizeSabiNotificationIdentity)
        .filter(Boolean),
    ),
  );
}

function shouldShowSabiMessengerNotificationForCurrentUser(payload: Record<string, unknown>): boolean {
  const auth = getAuthSessionState();
  const currentUserId = normalizeSabiNotificationIdentity(auth.currentUserId);
  const currentPhone = normalizeSabiNotificationIdentity(auth.phoneNumber);

  if (!currentUserId && !currentPhone) return false;

  const ownFlags = [payload.isOwn, payload.own, payload.fromMe, payload.isFromMe, payload.outgoing, payload.sentByMe];
  if (ownFlags.some((value) => value === true || value === "true" || value === "1")) return false;

  const direction = normalizeSabiMessengerNotificationLower(payload.direction || payload.messageDirection || payload.deliveryDirection);
  if (direction === "outgoing" || direction === "sent") return false;

  const senderIds = [
    pickSabiMessengerSenderId(payload),
    payload.senderUserId,
    payload.authorUserId,
    payload.fromUserId,
    payload.createdByUserId,
  ]
    .map(normalizeSabiNotificationIdentity)
    .filter(Boolean);
  const senderPhones = [payload.senderPhone, payload.authorPhone, payload.fromPhone, payload.phone]
    .map(normalizeSabiNotificationIdentity)
    .filter(Boolean);

  if (currentUserId && senderIds.includes(currentUserId)) return false;
  if (currentPhone && senderPhones.includes(currentPhone)) return false;

  const targetIds = pickSabiMessengerTargetIds(payload);
  const targetPhones = [payload.recipientPhone, payload.receiverPhone, payload.toPhone, payload.targetPhone]
    .map(normalizeSabiNotificationIdentity)
    .filter(Boolean);

  if (targetIds.length > 0) return currentUserId ? targetIds.includes(currentUserId) : false;
  if (targetPhones.length > 0) return currentPhone ? targetPhones.includes(currentPhone) : false;

  // If backend did not send an explicit recipient but it is clearly not my own
  // message, allow it. If sender is also missing, suppress it to avoid showing
  // generic notifications on the sender device.
  return senderIds.length > 0 || senderPhones.length > 0;
}

function pickSabiNotificationNameOrPhone(payload: Record<string, unknown>): string {
  return (
    normalizeSabiMessengerNotificationText(payload.senderName) ||
    normalizeSabiMessengerNotificationText(payload.authorName) ||
    normalizeSabiMessengerNotificationText(payload.displayName) ||
    normalizeSabiMessengerNotificationText(payload.contactName) ||
    normalizeSabiMessengerNotificationText(payload.fromName) ||
    normalizeSabiMessengerNotificationText(payload.callerName) ||
    normalizeSabiMessengerNotificationText(payload.name) ||
    normalizeSabiMessengerNotificationText(payload.senderPhone) ||
    normalizeSabiMessengerNotificationText(payload.authorPhone) ||
    normalizeSabiMessengerNotificationText(payload.fromPhone) ||
    normalizeSabiMessengerNotificationText(payload.callerPhone) ||
    normalizeSabiMessengerNotificationText(payload.phone) ||
    normalizeSabiMessengerNotificationText(payload.msisdn) ||
    normalizeSabiMessengerNotificationText(payload.mobile) ||
    normalizeSabiMessengerNotificationText(payload.username)
  );
}

function pickSabiRoomNotificationTitle(payload: Record<string, unknown>): string {
  return (
    normalizeSabiMessengerNotificationText(payload.chatTitle) ||
    normalizeSabiMessengerNotificationText(payload.roomTitle) ||
    normalizeSabiMessengerNotificationText(payload.groupTitle) ||
    normalizeSabiMessengerNotificationText(payload.groupName) ||
    normalizeSabiMessengerNotificationText(payload.channelTitle) ||
    normalizeSabiMessengerNotificationText(payload.channelName) ||
    normalizeSabiMessengerNotificationText(payload.botTitle) ||
    normalizeSabiMessengerNotificationText(payload.botName)
  );
}

function trimSabiNotificationBody(value: string, maxLength = 72): string {
  const text = value.replace(/\s+/g, " ").trim();
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 1).trim()}…`;
}

function pickSabiMessengerMessagePreview(payload: Record<string, unknown>): string {
  const marker = [
    payload.type,
    payload.kind,
    payload.messageType,
    payload.mediaType,
    payload.attachmentType,
    payload.mimeType,
    payload.sabiType,
    payload.notificationType,
    payload.giftId,
    payload.giftType,
    payload.animatedPayload,
  ]
    .map(normalizeSabiMessengerNotificationLower)
    .join("|");

  const caption =
    normalizeSabiMessengerNotificationText(payload.caption) ||
    normalizeSabiMessengerNotificationText(payload.previewSubtitle);
  const plainText =
    normalizeSabiMessengerNotificationText(payload.content) ||
    normalizeSabiMessengerNotificationText(payload.text) ||
    normalizeSabiMessengerNotificationText(payload.body) ||
    normalizeSabiMessengerNotificationText(payload.previewTitle) ||
    normalizeSabiMessengerNotificationText(payload.message);

  if (marker.includes("gift")) return "🎁 Подарок";
  if (marker.includes("sticker")) return "Стикер";
  if (marker.includes("location") || marker.includes("geo") || payload.latitude || payload.longitude) return "📍 Локация";
  if (marker.includes("voice") || marker.includes("audio")) return "🎙 Голосовое сообщение";
  if (marker.includes("video")) return caption ? trimSabiNotificationBody(`🎥 Видео: ${caption}`) : "🎥 Видео";
  if (marker.includes("photo") || marker.includes("image") || marker.includes("picture")) return caption ? trimSabiNotificationBody(`📷 Фото: ${caption}`) : "📷 Фото";
  if (marker.includes("contact")) return "Контакт";
  if (plainText) return trimSabiNotificationBody(plainText, 96);

  const fileName = normalizeSabiMessengerNotificationText(payload.fileName) || normalizeSabiMessengerNotificationText(payload.name);
  if (fileName) return trimSabiNotificationBody(`📎 ${fileName}`, 72);
  if (payload.mediaUri || payload.url || payload.attachmentUrl) return "📎 Медиа";
  return "Новое сообщение";
}

function isSabiGroupChannelOrBotPayload(payload: Record<string, unknown>): boolean {
  const marker = [
    payload.roomType,
    payload.chatType,
    payload.type,
    payload.kind,
    payload.event,
    payload.eventName,
    payload.sourceEventName,
    payload.notificationType,
    payload.sabiType,
  ]
    .map(normalizeSabiMessengerNotificationLower)
    .join("|");

  return marker.includes("group") || marker.includes("channel") || marker.includes("bot");
}

type SabiMessengerBuiltNotification = {
  title: string;
  body: string;
  channelId: string;
  payload: Record<string, unknown>;
  data: Record<string, unknown>;
};

function buildSabiMessengerSystemNotification(event: unknown): SabiMessengerBuiltNotification | null {
  if (!isSabiMessengerMessageEvent(event)) return null;

  const payload = pickSabiMessengerPayload(event);
  if (!shouldShowSabiMessengerNotificationForCurrentUser(payload)) return null;

  const chatId =
    normalizeSabiMessengerNotificationText(payload.chatId) ||
    normalizeSabiMessengerNotificationText(payload.roomId) ||
    normalizeSabiMessengerNotificationText(payload.conversationId) ||
    normalizeSabiMessengerNotificationText(payload.channelId) ||
    normalizeSabiMessengerNotificationText(payload.groupId) ||
    normalizeSabiMessengerNotificationText(payload.botId);
  const messageId =
    normalizeSabiMessengerNotificationText(payload.id) ||
    normalizeSabiMessengerNotificationText(payload.messageId) ||
    normalizeSabiMessengerNotificationText(payload.clientMessageId) ||
    normalizeSabiMessengerNotificationText(payload.localId);

  const senderId = pickSabiMessengerSenderId(payload);
  const senderLabel = pickSabiNotificationNameOrPhone(payload) || senderId || "Пользователь";
  const roomTitle = pickSabiRoomNotificationTitle(payload);
  const isRoomNotification = Boolean(roomTitle && isSabiGroupChannelOrBotPayload(payload));
  const title = isRoomNotification ? roomTitle : senderLabel || roomTitle || "Sabi Messenger";
  const preview = pickSabiMessengerMessagePreview(payload);
  const body = isRoomNotification && senderLabel ? trimSabiNotificationBody(`${senderLabel}: ${preview}`, 110) : preview;

  const dedupeKey = messageId || `${chatId}:${senderId}:${title}:${body}`;
  const now = Date.now();
  const lastAt = sabiMessengerSystemNotificationDedupe.get(dedupeKey) || 0;
  if (now - lastAt < SABI_MESSENGER_SYSTEM_NOTIFICATION_DEDUPE_MS) return null;
  sabiMessengerSystemNotificationDedupe.set(dedupeKey, now);

  Array.from(sabiMessengerSystemNotificationDedupe.entries()).forEach(([key, at]) => {
    if (now - at > 60_000) sabiMessengerSystemNotificationDedupe.delete(key);
  });

  return {
    title,
    body,
    channelId: "sabi_messenger",
    payload,
    data: {
      sabiType: "messenger_message",
      notificationType: "messenger_message",
      chatId,
      roomId: chatId,
      messageId,
      senderId,
      senderName: senderLabel,
      route: chatId ? `/tabs/chat/${encodeURIComponent(chatId)}` : "/tabs/chats",
    },
  };
}

async function resolveSabiMessengerNotificationLabel(notification: SabiMessengerBuiltNotification): Promise<string> {
  const payload = notification.payload;
  const auth = getAuthSessionState();
  const ownerUserId = normalizeSabiMessengerNotificationText(auth.currentUserId);
  const chatId =
    normalizeSabiMessengerNotificationText(payload.chatId) ||
    normalizeSabiMessengerNotificationText(payload.roomId) ||
    normalizeSabiMessengerNotificationText(payload.conversationId);
  const senderId = pickSabiMessengerSenderId(payload);
  const senderPhone =
    normalizeSabiMessengerNotificationText(payload.senderPhone) ||
    normalizeSabiMessengerNotificationText(payload.authorPhone) ||
    normalizeSabiMessengerNotificationText(payload.fromPhone) ||
    normalizeSabiMessengerNotificationText(payload.phone);
  const senderUsername = normalizeSabiMessengerNotificationText(payload.senderUsername) || normalizeSabiMessengerNotificationText(payload.username);

  try {
    if (chatId) {
      const profile = await getPrivateChatProfile(chatId);
      if (profile?.peerUserId && senderId && profile.peerUserId !== senderId) {
        // Ignore a mismatched cached profile.
      } else {
        const profileLabel =
          normalizeSabiMessengerNotificationText(profile?.name) ||
          normalizeSabiMessengerNotificationText(profile?.phone) ||
          normalizeSabiMessengerNotificationText(profile?.username);
        if (profileLabel) return profileLabel;
      }
    }
  } catch {
    // Local profile cache is optional for notifications.
  }

  try {
    const contacts = await listCustomMessengerContacts(ownerUserId || undefined);
    const normalizedSenderPhone = normalizeSabiNotificationIdentity(senderPhone);
    const normalizedSenderUsername = normalizeSabiNotificationIdentity(senderUsername);
    const contact = contacts.find((item) => {
      const contactPeerId = normalizeSabiNotificationIdentity(item.peerUserId);
      const contactChatId = normalizeSabiNotificationIdentity(item.chatId);
      const contactPhone = normalizeSabiNotificationIdentity(item.phone);
      const contactUsername = normalizeSabiNotificationIdentity(item.username);
      return Boolean(
        (senderId && contactPeerId && contactPeerId === normalizeSabiNotificationIdentity(senderId)) ||
          (chatId && contactChatId && contactChatId === normalizeSabiNotificationIdentity(chatId)) ||
          (normalizedSenderPhone && contactPhone && contactPhone === normalizedSenderPhone) ||
          (normalizedSenderUsername && contactUsername && contactUsername === normalizedSenderUsername),
      );
    });

    if (contact?.name) return contact.name;
    if (contact?.phone) return contact.phone;
  } catch {
    // Contacts are optional for notifications.
  }

  return pickSabiNotificationNameOrPhone(payload) || senderPhone || senderUsername || senderId || notification.title;
}

async function ensureSabiSystemNotificationPermission() {
  const current = await Notifications.getPermissionsAsync();
  if (current.granted || current.status === "granted") return true;
  if (current.canAskAgain === false) return false;
  const requested = await Notifications.requestPermissionsAsync();
  return Boolean(requested.granted || requested.status === "granted");
}

async function ensureSabiMessengerNotificationChannel() {
  await ensureSabiSystemNotificationPermission();
  if (sabiMessengerNotificationChannelReady) return;
  sabiMessengerNotificationChannelReady = true;
  if (Platform.OS !== "android") return;

  await Notifications.setNotificationChannelAsync("sabi_messenger", {
    name: "Sabi Messenger",
    importance: Notifications.AndroidImportance.HIGH,
    sound: "default",
    vibrationPattern: [0, 180, 120, 180],
    enableVibrate: true,
    showBadge: true,
  });
}

async function ensureSabiWalletNotificationChannel() {
  await ensureSabiSystemNotificationPermission();
  if (sabiWalletNotificationChannelReady) return;
  sabiWalletNotificationChannelReady = true;
  if (Platform.OS !== "android") return;

  await Notifications.setNotificationChannelAsync("sabi_wallet", {
    name: "Sabi Wallet",
    importance: Notifications.AndroidImportance.HIGH,
    sound: "default",
    vibrationPattern: [0, 180, 120, 180],
    enableVibrate: true,
    showBadge: true,
  });
}

async function ensureSabiGeneralNotificationChannel() {
  await ensureSabiSystemNotificationPermission();
  if (sabiGeneralNotificationChannelReady) return;
  sabiGeneralNotificationChannelReady = true;
  if (Platform.OS !== "android") return;

  await Notifications.setNotificationChannelAsync("sabi_general", {
    name: "Sabi",
    importance: Notifications.AndroidImportance.HIGH,
    sound: "default",
    vibrationPattern: [0, 180, 120, 180],
    enableVibrate: true,
    showBadge: true,
  });
}

async function showSabiMessengerSystemNotification(event: unknown) {
  const notification = buildSabiMessengerSystemNotification(event);
  if (!notification) return;

  try {
    const senderLabel = await resolveSabiMessengerNotificationLabel(notification);
    const roomTitle = pickSabiRoomNotificationTitle(notification.payload);
    const isRoomNotification = Boolean(roomTitle && isSabiGroupChannelOrBotPayload(notification.payload));
    const preview = pickSabiMessengerMessagePreview(notification.payload);
    const title = isRoomNotification ? notification.title : senderLabel || notification.title;
    const body = isRoomNotification && senderLabel
      ? trimSabiNotificationBody(`${senderLabel}: ${preview}`, 110)
      : trimSabiNotificationBody(notification.body, 110);

    await ensureSabiMessengerNotificationChannel();
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: true,
        data: {
          ...notification.data,
          senderName: senderLabel || notification.data.senderName,
        },
      },
      trigger: Platform.OS === "android" ? { channelId: notification.channelId } : null,
    });
  } catch (error) {
    console.warn(
      "[messenger-notification] system notification skipped",
      error instanceof Error ? error.message : error,
    );
  }
}

function buildSabiWalletNotification(eventName: string, event: unknown) {
  const payload = pickSabiMessengerPayload({ eventName, payload: event });
  const markerText = [
    eventName,
    payload.type,
    payload.kind,
    payload.event,
    payload.eventName,
    payload.notificationType,
    payload.sabiType,
    payload.category,
  ]
    .map(normalizeSabiMessengerNotificationLower)
    .join("|");

  if (!markerText.includes("wallet") && !markerText.includes("payment") && !markerText.includes("transfer") && !markerText.includes("transaction")) {
    return null;
  }

  const actor =
    normalizeSabiMessengerNotificationText(payload.merchantName) ||
    normalizeSabiMessengerNotificationText(payload.businessName) ||
    normalizeSabiMessengerNotificationText(payload.senderName) ||
    normalizeSabiMessengerNotificationText(payload.receiverName) ||
    normalizeSabiMessengerNotificationText(payload.counterpartyName) ||
    normalizeSabiMessengerNotificationText(payload.fromName) ||
    normalizeSabiMessengerNotificationText(payload.toName) ||
    normalizeSabiMessengerNotificationText(payload.phone) ||
    normalizeSabiMessengerNotificationText(payload.fromPhone) ||
    normalizeSabiMessengerNotificationText(payload.toPhone);

  const amount =
    normalizeSabiMessengerNotificationText(payload.amount) ||
    normalizeSabiMessengerNotificationText(payload.totalAmount) ||
    normalizeSabiMessengerNotificationText(payload.value);
  const currency =
    normalizeSabiMessengerNotificationText(payload.currency) ||
    normalizeSabiMessengerNotificationText(payload.asset) ||
    normalizeSabiMessengerNotificationText(payload.token) ||
    normalizeSabiMessengerNotificationText(payload.coin);
  const status =
    normalizeSabiMessengerNotificationText(payload.status) ||
    normalizeSabiMessengerNotificationText(payload.state) ||
    normalizeSabiMessengerNotificationText(payload.result);
  const operation =
    normalizeSabiMessengerNotificationText(payload.operationTitle) ||
    normalizeSabiMessengerNotificationText(payload.title) ||
    normalizeSabiMessengerNotificationText(payload.operationType) ||
    normalizeSabiMessengerNotificationText(payload.type) ||
    normalizeSabiMessengerNotificationText(payload.event) ||
    "Wallet";
  const body =
    normalizeSabiMessengerNotificationText(payload.body) ||
    normalizeSabiMessengerNotificationText(payload.message) ||
    [operation, amount && currency ? `${amount} ${currency}` : amount || currency, status]
      .filter(Boolean)
      .join(" · ") ||
    "Sabi Wallet";

  return {
    title: actor ? `${actor} · Sabi Wallet` : "Sabi Wallet",
    body,
    channelId: "sabi_wallet",
    data: {
      sabiType: "wallet_notification",
      notificationType: "wallet",
      sourceEventName: eventName,
      route: "/tabs/wallet",
    },
  };
}

function buildSabiMissedCallNotification(eventName: string, event: unknown) {
  const payload = pickSabiMessengerPayload({ eventName, payload: event });
  const markerText = [
    eventName,
    payload.type,
    payload.kind,
    payload.event,
    payload.action,
    payload.status,
    payload.reason,
    payload.endReason,
    payload.signalKind,
    payload.notificationType,
    payload.sabiType,
  ]
    .map(normalizeSabiMessengerNotificationLower)
    .join("|");

  if (!markerText.includes("call")) return null;
  const missed = markerText.includes("missed") || markerText.includes("no_answer") || markerText.includes("unanswered");
  if (!missed) return null;

  const caller = pickSabiNotificationNameOrPhone(payload) || "Sabi Call";
  const isVideo = markerText.includes("video");
  return {
    title: caller,
    body: isVideo ? "Пропущенный видеозвонок" : "Пропущенный аудиозвонок",
    channelId: "sabi_calls",
    data: {
      sabiType: "missed_call",
      notificationType: "missed_call",
      sourceEventName: eventName,
      route: "/tabs/calls",
    },
  };
}

function buildSabiGeneralSystemNotification(eventName: string, event: unknown) {
  const messengerNotification = buildSabiMessengerSystemNotification({ eventName, payload: event });
  if (messengerNotification) return messengerNotification;

  const missedCallNotification = buildSabiMissedCallNotification(eventName, event);
  if (missedCallNotification) return missedCallNotification;

  const walletNotification = buildSabiWalletNotification(eventName, event);
  if (walletNotification) return walletNotification;

  const payload = pickSabiMessengerPayload({ eventName, payload: event });
  const title =
    normalizeSabiMessengerNotificationText(payload.title) ||
    pickSabiNotificationNameOrPhone(payload) ||
    "Sabi";
  const body =
    normalizeSabiMessengerNotificationText(payload.body) ||
    normalizeSabiMessengerNotificationText(payload.message) ||
    normalizeSabiMessengerNotificationText(payload.text) ||
    normalizeSabiMessengerNotificationText(payload.content);

  if (!body) return null;

  return {
    title,
    body,
    channelId: "sabi_general",
    data: {
      sabiType: "system_notification",
      notificationType: "system",
      sourceEventName: eventName,
      route: normalizeSabiMessengerNotificationText(payload.route) || "/notifications",
    },
  };
}

async function showSabiGeneralSystemNotification(eventName: string, event: unknown) {
  const notification = buildSabiGeneralSystemNotification(eventName, event);
  if (!notification) return;

  const dedupeKey = `${notification.channelId}:${notification.title}:${notification.body}:${normalizeSabiMessengerNotificationText((notification.data as Record<string, unknown>).sourceEventName)}`;
  const now = Date.now();
  const lastAt = sabiSystemNotificationDedupe.get(dedupeKey) || 0;
  if (now - lastAt < SABI_MESSENGER_SYSTEM_NOTIFICATION_DEDUPE_MS) return;
  sabiSystemNotificationDedupe.set(dedupeKey, now);
  for (const [key, at] of sabiSystemNotificationDedupe) {
    if (now - at > 60_000) sabiSystemNotificationDedupe.delete(key);
  }

  try {
    if (notification.channelId === "sabi_messenger") await ensureSabiMessengerNotificationChannel();
    else if (notification.channelId === "sabi_wallet") await ensureSabiWalletNotificationChannel();
    else await ensureSabiGeneralNotificationChannel();

    await Notifications.scheduleNotificationAsync({
      content: {
        title: notification.title,
        body: notification.body,
        sound: true,
        data: notification.data,
      },
      trigger: Platform.OS === "android" ? { channelId: notification.channelId } : null,
    });
  } catch (error) {
    console.warn("[sabi-notification] system notification skipped", error instanceof Error ? error.message : error);
  }
}

function normalizeIncomingCallBoolean(value: unknown) {
  return value === true || value === "1" || value === "true";
}

const SABI_VIDEO_INCOMING_INVITE_TTL_MS = 15000;

function parseSabiCallTimeMs(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value > 100000000000 ? value : 0;
  }

  if (typeof value === "string" && value.trim()) {
    const raw = value.trim();
    const numeric = Number(raw);
    if (Number.isFinite(numeric) && numeric > 100000000000) return numeric;
    const parsed = Date.parse(raw);
    if (Number.isFinite(parsed)) return parsed;
  }

  return 0;
}

function parseSabiCallTimeFromCallId(callId: unknown): number {
  const parts = String(callId || "").split(":");
  for (const part of parts) {
    const numeric = Number(part);
    if (Number.isFinite(numeric) && numeric > 100000000000) return numeric;
  }
  return 0;
}

function getSabiIncomingCallCreatedAtMs(payload: IncomingMessengerCallPayload, callId?: unknown): number {
  return (
    parseSabiCallTimeMs((payload as any).at) ||
    parseSabiCallTimeMs((payload as any).createdAt) ||
    parseSabiCallTimeMs((payload as any).startedAt) ||
    parseSabiCallTimeMs((payload as any).sentAt) ||
    parseSabiCallTimeMs((payload as any).timestamp) ||
    parseSabiCallTimeMs((payload as any).relayAt) ||
    parseSabiCallTimeFromCallId((payload as any).callId || (payload as any).id || callId)
  );
}

function isStaleSabiVideoIncomingInvite(payload: IncomingMessengerCallPayload, callId?: unknown): boolean {
  const kind = normalizeIncomingCallKind(payload);
  if (kind !== "video") return false;

  const createdAtMs = getSabiIncomingCallCreatedAtMs(payload, callId);
  if (!createdAtMs) return false;

  return Date.now() - createdAtMs > SABI_VIDEO_INCOMING_INVITE_TTL_MS;
}


function normalizeIncomingParticipantIds(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.flatMap((item) => normalizeIncomingParticipantIds(item)).filter(Boolean);
  }

  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    return normalizeIncomingParticipantIds(
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

function extractIncomingParticipantIds(payload: IncomingMessengerCallPayload): string[] {
  return Array.from(
    new Set([
      ...normalizeIncomingParticipantIds(payload.participantIds),
      ...normalizeIncomingParticipantIds(payload.groupParticipantIds),
      ...normalizeIncomingParticipantIds(payload.participants),
      ...normalizeIncomingParticipantIds(payload.memberIds),
      ...normalizeIncomingParticipantIds(payload.members),
      ...normalizeIncomingParticipantIds(payload.existingParticipantIds),
      ...normalizeIncomingParticipantIds(payload.existingParticipants),
    ]),
  );
}

function normalizeIncomingCallKind(payload: IncomingMessengerCallPayload) {
  const raw = [
    String((payload as any).callKind ?? ""),
    String((payload as any).callType ?? ""),
    String(payload.kind ?? ""),
    String(payload.type ?? ""),
    String((payload as any).routePath ?? ""),
  ].join(" ").trim().toLowerCase();
  return raw.includes("video") ? "video" : "audio";
}

function buildIncomingCallRouteParams(
  payload: IncomingMessengerCallPayload,
  currentUserId: string,
) {
  const kind = normalizeIncomingCallKind(payload);
  const isGroupHandoff =
    normalizeIncomingCallString(payload.event).toLowerCase().includes("handoff") ||
    normalizeIncomingCallString(payload.action).toLowerCase().includes("handoff") ||
    normalizeIncomingCallString(payload.direction).toLowerCase().includes("handoff");

  // SABI_GROUP_HANDOFF_ROUTE_MODE
  const isIncomingGroupCall =
    isGroupHandoff ||
    normalizeIncomingCallBoolean(payload.groupCall) ||
    normalizeIncomingCallString(payload.roomType).toLowerCase() === "group_call" ||
    normalizeIncomingCallString(payload.event).toLowerCase().includes("participant") ||
    normalizeIncomingCallString(payload.event).toLowerCase().includes("group") ||
    normalizeIncomingCallString(payload.roomType).toLowerCase().includes("group") ||
    normalizeIncomingCallString(payload.signalKind).toLowerCase().includes("group");

  if (isIncomingGroupCall) {
    console.log("[sabi-call:group-disabled] skip incoming group call route");
    return null;
  }
  const callId =
    normalizeIncomingCallString(payload.callId) ||
    normalizeIncomingCallString(payload.id) ||
    normalizeIncomingCallString(payload.roomId) ||
    normalizeIncomingCallString(payload.chatId) ||
    `call:${Date.now()}`;
  const chatId =
    normalizeIncomingCallString(payload.chatId) ||
    normalizeIncomingCallString(payload.roomId) ||
    callId;
  const incomingParticipantIds = extractIncomingParticipantIds(payload);
  const incomingParticipantIdsText = incomingParticipantIds.join(",");
  const toUserId =
    normalizeIncomingCallString(payload.toUserId) ||
    normalizeIncomingCallString(payload.receiverUserId) ||
    normalizeIncomingCallString(payload.targetUserId) ||
    normalizeIncomingCallString(payload.invitedUserId);

  if (!toUserId || !currentUserId || toUserId !== currentUserId) return null;

  const peerCandidate = normalizeIncomingCallString(payload.peerId);
  const fromUserId =
    normalizeIncomingCallString(payload.fromUserId) ||
    normalizeIncomingCallString(payload.senderUserId) ||
    normalizeIncomingCallString(payload.callerUserId) ||
    normalizeIncomingCallString(payload.inviterUserId) ||
    normalizeIncomingCallString(payload.existingPeerId) ||
    (peerCandidate && peerCandidate !== currentUserId ? peerCandidate : "");

  if (!currentUserId || !fromUserId || fromUserId === currentUserId) return null;

  // SABI_BLOCK_DIRECT_ROUTE_FOR_GROUP_INVITE
  // Group invite can first arrive as a wrong direct shadow event.
  // Real direct callId contains the receiver user id. Group invite callId contains original call peers,
  // so if current user is not inside callId, do not open direct route.
  const incomingRouteCallId =
    normalizeIncomingCallString(payload.callId) ||
    normalizeIncomingCallString(payload.id) ||
    "";

  if (
    !isIncomingGroupCall &&
    incomingRouteCallId.startsWith("call:") &&
    currentUserId &&
    !incomingRouteCallId.includes(currentUserId)
  ) {
    console.log(
      "[sabi-call:incoming-route] skip direct group shadow:",
      "callId=" + incomingRouteCallId,
      "user=" + currentUserId,
    );
    return null;
  }
  if (toUserId && toUserId !== currentUserId) return null;

  const name =
    normalizeIncomingCallString(payload.callerName) ||
    normalizeIncomingCallString(payload.fromName) ||
    normalizeIncomingCallString(payload.senderName) ||
    normalizeIncomingCallString(payload.callerDisplayName) ||
    normalizeIncomingCallString(payload.contactName) ||
    normalizeIncomingCallString(payload.name) ||
    (kind === "video" ? "Video call" : "Audio call");
  const avatarLetter =
    normalizeIncomingCallString(payload.callerAvatarLetter) ||
    normalizeIncomingCallString(payload.avatarLetter) ||
    name.replace(/^\+/, "").match(/[\p{L}\p{N}]/u)?.[0]?.toUpperCase() ||
    (kind === "video" ? "V" : "A");
  const avatarUrl =
    normalizeIncomingCallString(payload.callerAvatarUrl) ||
    normalizeIncomingCallString(payload.avatarUrl) ||
    normalizeIncomingCallString(payload.photoUrl);
  const statusText =
    normalizeIncomingCallString(payload.statusText) ||
    (kind === "video" ? "Incoming video call" : "Incoming audio call");
  const callInstanceAt =
    normalizeIncomingCallString(payload.at) ||
    normalizeIncomingCallString(payload.createdAt) ||
    normalizeIncomingCallString(payload.startedAt) ||
    String(Date.now());

  
  // SABI_SKIP_DIRECT_GROUP_SHADOW_IN_BUILDER
  const hardShadowCallId =
    normalizeIncomingCallString(payload.callId) ||
    normalizeIncomingCallString(payload.id) ||
    "";
  const hardShadowTargetUserId = toUserId || currentUserId || "";

  if (
    !isIncomingGroupCall &&
    hardShadowCallId.startsWith("call:") &&
    hardShadowTargetUserId &&
    !hardShadowCallId.includes(hardShadowTargetUserId)
  ) {
    console.log(
      "[sabi-call:incoming-route] SKIP direct group shadow:",
      "callId=" + hardShadowCallId,
      "target=" + hardShadowTargetUserId,
    );
    return null;
  }

return {
    pathname: kind === "video" ? "/calls/video" : "/calls/audio",
    params: {
      id: chatId,
      incoming: isGroupHandoff ? "0" : "1",
      chatId,
      callId,
      action: isGroupHandoff ? "group_handoff" : "incoming",
      direction: isGroupHandoff ? "handoff" : "incoming",
      phase: isGroupHandoff ? "active" : "ringing",
      incomingCall: isGroupHandoff ? "0" : "1",
      event: isGroupHandoff ? "group_handoff" : "incoming",
      userId: currentUserId,
      selfId: currentUserId,
      peerId: fromUserId,
      peerUserId: fromUserId,
      partnerId: fromUserId,
      targetUserId: fromUserId,
      roomId: normalizeIncomingCallString(payload.roomId) || chatId,
      roomType: isIncomingGroupCall ? "group_call" : normalizeIncomingCallString(payload.roomType) || "direct",
      groupCall: isIncomingGroupCall ? "1" : "0",
      isGroupCall: isIncomingGroupCall ? "1" : "0",
      participantIds: incomingParticipantIdsText,
      groupParticipantIds: incomingParticipantIdsText,
      participants: incomingParticipantIdsText,
      name,
      roomTitle: name,
      avatarLetter,
      avatarUrl: avatarUrl || undefined,
      photoUrl: avatarUrl || undefined,
      verified: normalizeIncomingCallBoolean(payload.verified) ? "1" : "0",
      status: statusText,
      kind,
      type: kind,
      callKind: kind,
      callType: kind,
      signalKind: "incoming",
      at: callInstanceAt,
      createdAt: callInstanceAt,
    },
  } as const;
}

async function waitForMessengerAuthenticatedSession() {
  const maxAttempts = 100;

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const snapshot = getAuthenticatedSessionSnapshot();

    if (snapshot) {
      return snapshot;
    }

    const auth = getAuthSessionState();

    if (auth.isReady && auth.isHydrated && auth.status !== "authenticated") {
      throw new Error("Messenger kernel session is not authenticated");
    }

    await sleep(100);
  }

  throw new Error("Messenger kernel session is not ready");
}

async function waitForProfileAuthenticatedSession() {
  const maxAttempts = 100;

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const snapshot = getAuthenticatedSessionSnapshot();

    if (snapshot) {
      return {
        apiBaseUrl: snapshot.apiBaseUrl,
        accessToken: snapshot.accessToken,
        currentUserId: snapshot.currentUserId,
        phone: snapshot.phone,
        headers: {},
        query: snapshot.query,
      };
    }

    const auth = getAuthSessionState();

    if (auth.isReady && auth.isHydrated && auth.status !== "authenticated") {
      return {
        apiBaseUrl: null,
        accessToken: null,
        currentUserId: null,
        phone: null,
        headers: {},
        query: {},
      };
    }

    await sleep(100);
  }

  throw new Error("Profile kernel session is not ready");
}

function buildProfileRuntimeExternalSnapshot(apiProfile: Awaited<ReturnType<typeof fetchUserProfileById>>) {
  const sabiDisplayId = buildSabiDisplayId({
    firstName: apiProfile.firstName,
    lastName: apiProfile.lastName,
    username: apiProfile.username,
    userId: apiProfile.userId,
  });
  const fullName = [apiProfile.firstName, apiProfile.lastName].filter(Boolean).join(" ").trim() || apiProfile.displayName;

  return {
    account: {
      userId: apiProfile.userId,
      phone: apiProfile.phone || "",
      email: apiProfile.email || "",
      firstName: apiProfile.firstName,
      lastName: apiProfile.lastName,
      username: apiProfile.username,
      fullName,
      bio: apiProfile.bio || "",
      avatarUri: apiProfile.avatarUri,
      sabiDisplayId,
      profileCompleted: apiProfile.profileCompleted,
      createdAt: apiProfile.createdAt,
      updatedAt: apiProfile.updatedAt,
    },
    publicProfile: {
      publicName: apiProfile.displayName,
      publicUsername: apiProfile.username,
      publicBio: apiProfile.bio || "",
      publicSubtitle: sabiDisplayId,
    },
    avatarUri: apiProfile.avatarUri,
  };
}

let lastProfileApiWarning: string | null = null;

async function loadAuthenticatedProfileExternalSnapshot() {
  const auth = getAuthSessionState();

  if (
    !isAuthenticatedSessionReady() ||
    auth.status !== "authenticated" ||
    !auth.currentUserId
  ) {
    return null;
  }

  try {
    const apiProfile = await fetchUserProfileById(auth.currentUserId, {
      apiBaseUrl: auth.apiBaseUrl,
      accessToken: auth.accessToken,
      currentUserId: auth.currentUserId,
    });

    lastProfileApiWarning = null;
    return buildProfileRuntimeExternalSnapshot(apiProfile);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error ?? "unknown");

    if (lastProfileApiWarning !== message) {
      console.warn("[profile-kernel] external profile sync skipped", message);
      lastProfileApiWarning = message;
    }

    return null;
  }
}

function ensureAppKernelsConfigured() {
  if (appKernelsConfigured) return;

  configureMessengerSession({
    resolveSession: async () => waitForMessengerAuthenticatedSession(),
  });

  configureMessengerRuntime(createMessengerKernelHttpRuntimeConfig());

  configureProfileRuntime({
    loadExternalSnapshot: loadAuthenticatedProfileExternalSnapshot,
  });

  configureProfileSession({
    resolveSession: async () => waitForProfileAuthenticatedSession(),
  });

  appKernelsConfigured = true;
}

ensureAppKernelsConfigured();

async function bindProfileAndHomeToAuthenticatedSession() {
  const auth = getAuthSessionState();

  if (!isAuthenticatedSessionReady() || !auth.currentUserId) {
    await shutdownProfileKernel();
    homeKernelFacade.reset();
    return;
  }

  let profileReady = false;

  try {
    await profileKernelFacade.boot();
    await profileKernelFacade.refresh();
    profileReady = true;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error ?? "unknown");

    if (lastProfileApiWarning !== message) {
      console.warn("[profile-kernel] local profile fallback activated", message);
      lastProfileApiWarning = message;
    }
  }

  if (profileReady) {
    const account = profileKernelFacade.selectors.account();
    const accountUserId = typeof account?.userId === "string" ? account.userId.trim() : "";
    const accountPhone = typeof account?.phone === "string" ? account.phone.trim() : "";
    const nextPhone = auth.phoneNumber?.trim() || accountPhone;

    if (accountUserId !== auth.currentUserId || accountPhone !== nextPhone) {
      await profileKernelFacade.updateProfile({
        userId: auth.currentUserId,
        phone: nextPhone,
        updatedAt: new Date().toISOString(),
        createdAt: account?.createdAt || new Date().toISOString(),
        profileCompleted: Boolean(account?.firstName && account?.lastName && account?.username),
      } as any);
    }
  }

  try {
    await homeKernelFacade.boot();
    await homeKernelFacade.syncAccountSnapshot();
  } catch (error) {
    console.warn(
      "[home-kernel] account snapshot sync skipped",
      error instanceof Error ? error.message : error,
    );
  }
}

function RootBootstrap() {
  const pathname = usePathname();
  const [isReady, setIsReady] = useState(false);
  useSabiCallPushRegistration(isReady);
  const aliveRef = useRef(true);
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);
  const lastMessengerPresenceKeyRef = useRef<string | null>(null);
  const lastIncomingCallKeyRef = useRef<string | null>(null);
  const pendingIncomingCallTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingIncomingCallKeyRef = useRef<string | null>(null);
  const activeGroupCallIdsRef = useRef<Set<string>>(
    (((globalThis as any).__sabiActiveGroupCallIds ||= new Set<string>()) as Set<string>)
  );
  const messengerKernelBootedRef = useRef(false);
  const kernelSessionKeyRef = useRef<string | null>(null);
  const syncInFlightRef = useRef(false);
  const syncPendingRef = useRef(false);
  const lastSyncErrorRef = useRef<string | null>(null);
  const uiReadyRef = useRef(false);
  const kernelSyncTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useSabiMessengerSmsTone({
    enabled: isReady,
    pathname,
  });

  useEffect(() => {
    if (!isReady) return undefined;

    const unsubscribe = subscribeMessengerRealtimeService((event) => {
      void showSabiMessengerSystemNotification(event);
    });

    return () => {
      unsubscribe();
    };
  }, [isReady]);

  useEffect(() => {
    if (!isReady) return undefined;

    const auth = getAuthSessionState();
    const currentUserId = typeof auth.currentUserId === "string" ? auth.currentUserId.trim() : "";
    if (!currentUserId) return undefined;

    const socket = getSuperAppSocket(currentUserId);
    const notificationChannel = `notification:user:${currentUserId}`;
    const walletChannel = `wallet-core:user:${currentUserId}`;

    joinRealtimeChannel(notificationChannel, currentUserId);
    joinWalletCoreChannel(walletChannel, currentUserId);

    const notificationEvents = [
      "notification:new",
      "notifications:new",
      "notification",
      "push:notification",
      "message:new",
      "new_message",
      "chat:message",
      "messenger:message:new",
      "messenger:new_message",
      "messenger:group:message",
      "group:message",
      "group:post",
      "messenger:channel:post",
      "channel:post",
      "channel:message",
      "messenger:bot:message",
      "bot:message",
      "bot:reply",
      "wallet:balance.updated",
      "wallet:history.changed",
      "wallet:operation.updated",
      "wallet-core:event",
      "wallet.operation.completed",
      "wallet.business.transfer.completed",
      "wallet.business.transfer.received",
      "wallet.merchant.payment.completed",
      "wallet.merchant.settlement.completed",
      "realtime:event",
      "call:missed",
      "missed_call",
    ];

    const handlers = notificationEvents.map((eventName) => {
      const handler = (payload: unknown) => {
        void showSabiGeneralSystemNotification(eventName, payload);
      };
      socket.on(eventName, handler);
      return { eventName, handler };
    });

    if (!socket.connected) socket.connect();

    return () => {
      handlers.forEach(({ eventName, handler }) => socket.off(eventName, handler));
      leaveRealtimeChannel(notificationChannel);
      leaveWalletCoreChannel(walletChannel);
    };
  }, [isReady]);

  useEffect(() => {
    (globalThis as any).__sabiCurrentPathname = pathname || "";
    (globalThis as any).__sabiAppState = AppState.currentState;
  }, [pathname]);

  const syncAppKernelsWithAuth = useCallback(async () => {
    if (syncInFlightRef.current) {
      syncPendingRef.current = true;
      return;
    }

    syncInFlightRef.current = true;

    try {
      do {
        syncPendingRef.current = false;
        const nextSessionKey = getAuthenticatedSessionKey();

        if (!nextSessionKey) {
          lastSyncErrorRef.current = null;

          if (messengerKernelBootedRef.current) {
            await shutdownMessengerKernel();
            messengerKernelBootedRef.current = false;
            kernelSessionKeyRef.current = null;
          }

          await bindProfileAndHomeToAuthenticatedSession();
          continue;
        }

        await bindProfileAndHomeToAuthenticatedSession();

        if (!messengerKernelBootedRef.current) {
          await bootMessengerKernel();
          messengerKernelBootedRef.current = true;
          kernelSessionKeyRef.current = nextSessionKey;
          lastSyncErrorRef.current = null;
          continue;
        }

        if (kernelSessionKeyRef.current !== nextSessionKey) {
          await shutdownMessengerKernel();
          messengerKernelBootedRef.current = false;
          kernelSessionKeyRef.current = null;

          await bootMessengerKernel();
          messengerKernelBootedRef.current = true;
          kernelSessionKeyRef.current = nextSessionKey;
          lastSyncErrorRef.current = null;
        }
      } while (syncPendingRef.current);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : String(error ?? "unknown");

      if (
        message !== "Messenger kernel session is not authenticated" &&
        lastSyncErrorRef.current !== message
      ) {
        console.warn("[app-kernel] auth sync failed", message);
      }

      lastSyncErrorRef.current = message;
    } finally {
      syncInFlightRef.current = false;
    }
  }, []);

  const markUiReady = useCallback(() => {
    if (uiReadyRef.current) return;
    uiReadyRef.current = true;

    if (aliveRef.current) {
      setIsReady(true);
    }
  }, []);

  const scheduleAppKernelSync = useCallback(
    (delayMs = 700) => {
      if (kernelSyncTimerRef.current) {
        clearTimeout(kernelSyncTimerRef.current);
      }

      kernelSyncTimerRef.current = setTimeout(() => {
        kernelSyncTimerRef.current = null;

        InteractionManager.runAfterInteractions(() => {
          if (!aliveRef.current) return;
          void syncAppKernelsWithAuth();
        });
      }, delayMs);
    },
    [syncAppKernelsWithAuth],
  );

  useEffect(() => {
    aliveRef.current = true;

    return () => {
      aliveRef.current = false;

      if (kernelSyncTimerRef.current) {
        clearTimeout(kernelSyncTimerRef.current);
        kernelSyncTimerRef.current = null;
      }


      if (messengerKernelBootedRef.current) {
        void shutdownMessengerKernel().catch((error) => {
          console.warn(
            "[messenger-kernel] failed to shutdown on root unmount",
            error instanceof Error ? error.message : error,
          );
        });
      }

      void shutdownProfileKernel().catch((error) => {
        console.warn(
          "[profile-kernel] failed to shutdown on root unmount",
          error instanceof Error ? error.message : error,
        );
      });
    };
  }, []);

  useEffect(() => {
    const fallbackTimer = setTimeout(() => {
      markUiReady();
      scheduleAppKernelSync(900);
    }, 900);

    return () => clearTimeout(fallbackTimer);
  }, [markUiReady, scheduleAppKernelSync]);

  useSuperappLiveBootstrap({
    onBootstrap: async () => {
      try {
        await restoreAuthenticatedSessionFromStorage();
      } catch (error) {
        console.warn(
          "[app-kernel] bootstrap restore failed",
          error instanceof Error ? error.message : error,
        );
      } finally {
        markUiReady();
        scheduleAppKernelSync(650);
      }
    },
  });

  useEffect(() => {
    if (!isReady) return undefined;

    const unsubscribe = subscribeAuthSessionState(() => {
      scheduleAppKernelSync(450);
    });

    scheduleAppKernelSync(900);

    return unsubscribe;
  }, [isReady, scheduleAppKernelSync]);

  useEffect(() => {
    if (!isReady) return undefined;

    const auth = getAuthSessionState();
    const currentUserId = typeof auth.currentUserId === "string" ? auth.currentUserId.trim() : "";
    if (!currentUserId) return undefined;

    const socket = getSuperAppSocket(currentUserId);

    const handleIncomingCall = (payload: unknown) => {
      if (!payload || typeof payload !== "object") return;

      // SABI_IGNORE_NON_NAVIGABLE_CALL_STATE_PAYLOADS
      const rawIncomingPayload = payload as Record<string, any>;
      const rawIncomingText = [
        rawIncomingPayload.event,
        rawIncomingPayload.action,
        rawIncomingPayload.phase,
        rawIncomingPayload.status,
        rawIncomingPayload.signalKind,
        rawIncomingPayload.kind,
      ]
        .map((value) => String(value || "").toLowerCase())
        .join("|");

      const isAllowedIncomingNavigationPayload =
        rawIncomingText.includes("incoming") ||
        rawIncomingText.includes("ringing") ||
        rawIncomingText.includes("start") ||
        rawIncomingText.includes("invite") ||
        rawIncomingText.includes("handoff");

      const isCallStateOrSignalPayload =
        rawIncomingText.includes("participant_accepted") ||
        rawIncomingText.includes("accepted") ||
        rawIncomingText.includes("join") ||
        rawIncomingText.includes("signal") ||
        rawIncomingText.includes("offer") ||
        rawIncomingText.includes("answer") ||
        rawIncomingText.includes("ice") ||
        rawIncomingText.includes("candidate") ||
        rawIncomingText.includes("bye") ||
        rawIncomingText.includes("ended") ||
        rawIncomingText.includes("end");

      if (isCallStateOrSignalPayload && !isAllowedIncomingNavigationPayload) {
        return;
      }

      // SABI_EARLY_BLOCK_DIRECT_ROUTE_FOR_ACTIVE_GROUP
      const rawPayloadForGroupBlock = payload as Record<string, any>;
      const rawGroupBlockCallId =
        normalizeIncomingCallString(rawPayloadForGroupBlock.callId) ||
        normalizeIncomingCallString(rawPayloadForGroupBlock.id) ||
        "";
      const rawGroupBlockRoomType = normalizeIncomingCallString(rawPayloadForGroupBlock.roomType).toLowerCase();
      const rawGroupBlockGroupCall = normalizeIncomingCallString(rawPayloadForGroupBlock.groupCall);
      const rawGroupBlockEventText = [
        rawPayloadForGroupBlock.event,
        rawPayloadForGroupBlock.action,
        rawPayloadForGroupBlock.direction,
        rawPayloadForGroupBlock.phase,
        rawPayloadForGroupBlock.status,
      ]
        .map((value) => String(value || "").toLowerCase())
        .join("|");

      const rawIsGroupNavigation =
        rawGroupBlockRoomType === "group_call" ||
        rawGroupBlockGroupCall === "1" ||
        rawGroupBlockGroupCall === "true" ||
        rawGroupBlockEventText.includes("group") ||
        rawGroupBlockEventText.includes("handoff");

      if (rawIsGroupNavigation) {
        console.log("[sabi-call:group-disabled] skip group call navigation event");
        return;
      }

      if (
        rawGroupBlockCallId &&
        activeGroupCallIdsRef.current.has(rawGroupBlockCallId) &&
        !rawIsGroupNavigation
      ) {
        console.log(
          "[sabi-call:incoming-route] EARLY BLOCK direct route for active group call",
          "callId=" + rawGroupBlockCallId,
          "from=" + normalizeIncomingCallString(rawPayloadForGroupBlock.fromUserId || rawPayloadForGroupBlock.senderUserId || rawPayloadForGroupBlock.peerId),
        );
        return;
      }

      const route = buildIncomingCallRouteParams(payload as IncomingMessengerCallPayload, currentUserId);
      if (!route) return;

      // SABI_VIDEO_ROUTE_DELAY_FIX_18:
      // A direct video invite must open only while it is fresh.
      // Delayed/stale relay delivery after decline/end must not wake the second
      // phone later and must not recreate an already cancelled video call.
      if (isStaleSabiVideoIncomingInvite(payload as IncomingMessengerCallPayload, route.params.callId)) {
        console.log(
          "[sabi-call:incoming-route] SKIP stale video invite",
          "callId=" + String(route.params.callId || ""),
          "from=" + String(route.params.peerId || ""),
        );
        return;
      }

      const currentPath = normalizePathname(pathname).toLowerCase();

      if (String((route.params as any).event || "") === "group_handoff") {
        console.log(
          "[sabi-call:incoming-route] group handoff route",
          "callId=" + String(route.params.callId || ""),
          "user=" + String((route.params as any).userId || ""),
          "peer=" + String(route.params.peerId || ""),
        );
      }

      // SABI_FORCE_REPLACE_GROUP_HANDOFF_BEFORE_DUPLICATE_GUARD
      const forceHandoffEvent =
        String((route.params as any).event || "").toLowerCase().includes("handoff") ||
        String((route.params as any).action || "").toLowerCase().includes("handoff") ||
        String((route.params as any).direction || "").toLowerCase().includes("handoff");

      if (forceHandoffEvent) {
        (route.params as any).roomType = "group_call";
        (route.params as any).groupCall = "1";
        (route.params as any).isGroupCall = "1";
        (route.params as any).incoming = "0";
        (route.params as any).incomingCall = "0";
        (route.params as any).event = "group_handoff";
        (route.params as any).action = "group_handoff";
        (route.params as any).direction = "handoff";
        (route.params as any).phase = "active";

        if (pendingIncomingCallTimerRef.current) {
          clearTimeout(pendingIncomingCallTimerRef.current);
          pendingIncomingCallTimerRef.current = null;
        }

        pendingIncomingCallKeyRef.current = null;

        const handoffKey = [
          "handoff",
          String(route.params.callId || ""),
          String((route.params as any).userId || currentUserId || ""),
        ].join("|");

        const handoffPayload = {
          ...(route.params as Record<string, unknown>),
          callId: String(route.params.callId || ""),
          userId: String((route.params as any).userId || currentUserId || ""),
          peerId: String(route.params.peerId || ""),
          roomType: "group_call",
          groupCall: "1",
          isGroupCall: "1",
          event: "group_handoff",
          action: "group_handoff",
          direction: "handoff",
          phase: "active",
        };

        // If the call screen is already open, never route-replace it. Replacing
        // the route creates a second timer and drops the live direct video before
        // the group mesh can reuse it. The screen will dedupe repeated handoff
        // events by callId/userId/peerId.
        if (currentPath === "/calls/audio" || currentPath === "/calls/video") {
          if (String(route.params.callId || "")) {
            activeGroupCallIdsRef.current.add(String(route.params.callId || ""));
          }

          DeviceEventEmitter.emit("sabi-call:group-handoff", handoffPayload);
          lastIncomingCallKeyRef.current = handoffKey;

          console.log(
            "[sabi-call:incoming-route] APPLY group handoff in active call screen",
            "callId=" + String(route.params.callId || ""),
            "user=" + String((route.params as any).userId || currentUserId || ""),
            "peer=" + String(route.params.peerId || ""),
          );
          return;
        }

        if (lastIncomingCallKeyRef.current !== handoffKey) {
          lastIncomingCallKeyRef.current = handoffKey;

          // SABI_MARK_GROUP_CALL_ID_ON_FORCE_HANDOFF
          if (String(route.params.callId || "")) {
            activeGroupCallIdsRef.current.add(String(route.params.callId || ""));
          }

          console.log(
            "[sabi-call:incoming-route] ROUTE group handoff",
            "callId=" + String(route.params.callId || ""),
            "user=" + String((route.params as any).userId || currentUserId || ""),
            "peer=" + String(route.params.peerId || ""),
          );

          router.replace(route as never);
        }

        return;
      }

      const callKey = String(route.params.callId || route.params.chatId || "").trim();
      const callInstanceKey = String(
        (route.params as any).at ||
          (route.params as any).createdAt ||
          (route.params as any).startedAt ||
          ""
      ).trim();
      const nextKey = `${callKey}:${route.params.kind}:${route.params.peerId}:${callInstanceKey}`;
      if (lastIncomingCallKeyRef.current === nextKey) return;

      // CALL-AUDIO-140.2_ALLOW_FRESH_SECOND_CALL:
      // Do not block a new fresh callId only because the previous call screen
      // is still mounted/closing. Block only exact duplicate same nextKey.
      const activeCallScreen =
        currentPath === "/calls/audio" || currentPath === "/calls/video";

      if (activeCallScreen && lastIncomingCallKeyRef.current === nextKey) return;

      const routeIsGroupCall = String((route.params as any).groupCall || "") === "1";

      // SABI_BLOCK_DIRECT_NAV_FOR_ACTIVE_GROUP_CALL
      if (routeIsGroupCall && callKey) {
        activeGroupCallIdsRef.current.add(callKey);
      }

      if (!routeIsGroupCall && callKey && activeGroupCallIdsRef.current.has(callKey)) {
        console.log(
          "[sabi-call:incoming-route] BLOCK direct route for active group call",
          "callId=" + callKey,
          "from=" + String(route.params.peerId || ""),
        );
        return;
      }

      // SABI_BLOCK_DIRECT_ROUTE_AFTER_HANDOFF
      const lastIncomingKeyText = String(lastIncomingCallKeyRef.current || "");
      const isPlainDirectForSameActiveCall =
        !routeIsGroupCall &&
        callKey &&
        lastIncomingKeyText.includes(callKey) &&
        (currentPath === "/calls/audio" || currentPath === "/calls/video");

      if (isPlainDirectForSameActiveCall) {
        // AUDIO-1400: duplicate direct incoming/signal packets for the already
        // open call screen must be ignored silently. Logging and processing the
        // same duplicate dozens of times caused visible route lag and console spam.
        return;
      }
      const pushIncomingRoute = () => {
        // SABI_FINAL_SKIP_DIRECT_SHADOW_PUSH
        const shadowParams = ((route as any).params || {}) as Record<string, any>;
        const shadowCallId = String(shadowParams.callId || "");
        const shadowUserId = String(
          shadowParams.userId ||
            shadowParams.currentUserId ||
            shadowParams.receiverUserId ||
            currentUserId ||
            ""
        );
        const shadowRoomType = String(shadowParams.roomType || "").toLowerCase();
        const shadowGroupCall = String(shadowParams.groupCall || "");

        if (
          shadowRoomType !== "group_call" &&
          shadowGroupCall !== "1" &&
          shadowCallId.startsWith("call:") &&
          shadowUserId &&
          !shadowCallId.includes(shadowUserId)
        ) {
          console.log(
            "[sabi-call:incoming-route] FINAL skip direct group shadow:",
            "callId=" + shadowCallId,
            "user=" + shadowUserId,
          );
          return;
        }
        lastIncomingCallKeyRef.current = nextKey;
        // SABI_HARD_SKIP_DIRECT_GROUP_SHADOW_BEFORE_PUSH
      const hardRouteRoomType = String(route.params.roomType || "").toLowerCase();
      const hardRouteGroupCall = String((route.params as any).groupCall || "");
      const hardRouteCallId = String(route.params.callId || "");
      const hardCurrentUserId = String(currentUserId || "");

      if (
        hardRouteRoomType !== "group_call" &&
        hardRouteGroupCall !== "1" &&
        hardRouteCallId.startsWith("call:") &&
        hardCurrentUserId &&
        !hardRouteCallId.includes(hardCurrentUserId)
      ) {
        console.log(
          "[sabi-call:incoming-route] HARD skip direct group shadow:",
          "callId=" + hardRouteCallId,
          "user=" + hardCurrentUserId,
        );
        return;
      }

      // SABI_ROUTE_USER_DIRECT_SHADOW_FIX
      const routeCallIdForShadow = String(route.params.callId || "");
      const routeRoomTypeForShadow = String(route.params.roomType || "").toLowerCase();
      const routeGroupForShadow = String((route.params as any).groupCall || "");
      const routeUserForShadow =
        String((route.params as any).userId || "") ||
        String((route.params as any).currentUserId || "") ||
        String(currentUserId || "");

      if (
        routeRoomTypeForShadow !== "group_call" &&
        routeGroupForShadow !== "1" &&
        routeCallIdForShadow.startsWith("call:") &&
        routeUserForShadow &&
        !routeCallIdForShadow.includes(routeUserForShadow)
      ) {
        console.log(
          "[sabi-call:incoming-route] CONVERT direct shadow to group:",
          "callId=" + routeCallIdForShadow,
          "user=" + routeUserForShadow,
        );

        (route.params as any).roomType = "group_call";
        (route.params as any).groupCall = "1";
        (route.params as any).isGroupCall = "1";
      }

      // SABI_FINAL_ROUTE_SHADOW_CONVERT_BEFORE_LOG
      const finalShadowParams = ((route as any).params || {}) as Record<string, any>;
      const finalShadowCallId = String(finalShadowParams.callId || "");
      const finalShadowUserId = String(finalShadowParams.userId || currentUserId || "");
      const finalShadowRoomType = String(finalShadowParams.roomType || "").toLowerCase();
      const finalShadowGroupCall = String(finalShadowParams.groupCall || "");

      if (
        finalShadowRoomType !== "group_call" &&
        finalShadowGroupCall !== "1" &&
        finalShadowCallId.startsWith("call:") &&
        finalShadowUserId &&
        !finalShadowCallId.includes(finalShadowUserId)
      ) {
        console.log(
          "[sabi-call:incoming-route] FINAL convert direct shadow to group:",
          "callId=" + finalShadowCallId,
          "user=" + finalShadowUserId,
        );

        finalShadowParams.roomType = "group_call";
        finalShadowParams.groupCall = "1";
        finalShadowParams.isGroupCall = "1";
      }

      // SABI_BUILT_ROUTE_BLOCK_DIRECT_FOR_ACTIVE_GROUP
      const builtGroupBlockCallId = String(route.params.callId || "");
      const builtGroupBlockIsGroup =
        String((route.params as any).roomType || "").toLowerCase() === "group_call" ||
        String((route.params as any).groupCall || "") === "1" ||
        String((route.params as any).isGroupCall || "") === "1" ||
        String((route.params as any).event || "").toLowerCase().includes("handoff") ||
        String((route.params as any).action || "").toLowerCase().includes("handoff");

      if (builtGroupBlockCallId && builtGroupBlockIsGroup) {
        activeGroupCallIdsRef.current.add(builtGroupBlockCallId);
      }

      if (
        builtGroupBlockCallId &&
        activeGroupCallIdsRef.current.has(builtGroupBlockCallId) &&
        !builtGroupBlockIsGroup
      ) {
        console.log(
          "[sabi-call:incoming-route] BUILT BLOCK direct route for active group call",
          "callId=" + builtGroupBlockCallId,
          "from=" + String(route.params.peerId || ""),
        );
        return;
      }

      console.log(
          "[sabi-call:incoming-route]",
          "callId=" + String(route.params.callId || ""),
          "from=" + String(route.params.peerId || ""),
          "roomType=" + String(route.params.roomType || ""),
          "groupCall=" + String((route.params as any).groupCall || ""),
        );
        if (String((route.params as any).groupCall || "") === "1") {
          lastIncomingCallKeyRef.current = nextKey;
          if (shouldSkipSabiDirectGroupShadowRoute(route)) {
          console.log("[sabi-call:incoming-route] SABI_NAV_SKIP_DIRECT_GROUP_SHADOW_REPLACE");
          return;
        }
        router.replace(route as never);
        } else {
          if (shouldSkipSabiDirectGroupShadowRoute(route)) {
          console.log("[sabi-call:incoming-route] SABI_NAV_SKIP_DIRECT_GROUP_SHADOW_PUSH");
          return;
        }
        router.push(route as never);
        }
      };

      if (routeIsGroupCall) {
        if (pendingIncomingCallTimerRef.current) {
          clearTimeout(pendingIncomingCallTimerRef.current);
          pendingIncomingCallTimerRef.current = null;
        }
        pendingIncomingCallKeyRef.current = null;

        // SABI_GROUP_NO_REPLACE_WHILE_CALL_SCREEN_ACTIVE
        // Once a call screen is already open, group_call/participant events must
        // NOT router.replace the screen. Replacing the route remounts the call UI,
        // closes the previous RTCPeerConnection objects and clears local media.
        // The screen consumes this event and updates its participant registry in place.
        if (currentPath === "/calls/audio" || currentPath === "/calls/video") {
          if (callKey) activeGroupCallIdsRef.current.add(callKey);

          DeviceEventEmitter.emit("sabi-call:group-handoff", {
            ...(route.params as Record<string, unknown>),
            callId: String(route.params.callId || ""),
            userId: String((route.params as any).userId || currentUserId || ""),
            peerId: String(route.params.peerId || ""),
            roomType: "group_call",
            groupCall: "1",
            isGroupCall: "1",
            event: "group_handoff",
            action: "group_handoff",
            direction: "handoff",
            phase: "active",
          });

          lastIncomingCallKeyRef.current = `${callKey}:${route.params.kind}:${route.params.peerId}`;
          console.log(
            "[sabi-call:incoming-route] KEEP active group call screen",
            "callId=" + callKey,
            "user=" + String((route.params as any).userId || currentUserId || ""),
            "peer=" + String(route.params.peerId || ""),
          );
          return;
        }

        pushIncomingRoute();
        return;
      }

      // Direct invite can arrive before the real group invite for the same callId.
      // Delay direct route briefly so group_call can replace it.
      if (pendingIncomingCallTimerRef.current) {
        clearTimeout(pendingIncomingCallTimerRef.current);
        pendingIncomingCallTimerRef.current = null;
      }

      // AUDIO-1400: direct audio/video invites must route immediately.
      // The 350ms group-shadow wait made the second phone ring late and produced
      // a visible time gap before accept/connect. Group calls are handled above.
      pendingIncomingCallKeyRef.current = null;
      pendingIncomingCallTimerRef.current = null;
      pushIncomingRoute();
    };

    const handleCallFinished = (payload: unknown) => {
      if (!payload || typeof payload !== "object") return;

      const record = payload as Record<string, unknown>;
      const callId =
        normalizeIncomingCallString(record.callId) ||
        normalizeIncomingCallString(record.id) ||
        normalizeIncomingCallString(record.roomId);

      if (!callId) return;

      if (pendingIncomingCallTimerRef.current) {
        clearTimeout(pendingIncomingCallTimerRef.current);
        pendingIncomingCallTimerRef.current = null;
      }

      pendingIncomingCallKeyRef.current = null;

      const currentKey = String(lastIncomingCallKeyRef.current || "");
      if (!currentKey || currentKey.includes(callId) || currentKey.startsWith(callId)) {
        lastIncomingCallKeyRef.current = null;
      }

      activeGroupCallIdsRef.current.delete(callId);

      // CALL-AUDIO-141.1_CLEAR_ROUTE_LOCKS_ON_ENDED:
      // Direct audio calls must be able to receive a fresh second call after
      // first call ends. Clear stale incoming-route key after ended/declined.
      try {
        lastIncomingCallKeyRef.current = null;
        pendingIncomingCallKeyRef.current = null;
        if (pendingIncomingCallTimerRef.current) {
          clearTimeout(pendingIncomingCallTimerRef.current);
          pendingIncomingCallTimerRef.current = null;
        }
      } catch {}
    };

    const incomingEvents = [
      "call:incoming",
      "call_incoming",
      "call:ringing",
      "call:start",
      "audio-call:incoming",
      "audio_call_incoming",
      "audio-call:ringing",
      "video-call:incoming",
      "video_call_incoming",
      "video-call:ringing",
      "sabi-call:incoming",
      "sabi-call:start",
      "messenger:call:incoming",
      "messenger:call:start",
    ];

    const finishEvents = [
      "call:end",
      "call:ended",
      "sabi-call:ended",
      "sabi-call:end",
      "audio-call:ended",
      "video-call:ended",
    ];

    incomingEvents.forEach((eventName) => socket.on(eventName, handleIncomingCall));
    finishEvents.forEach((eventName) => socket.on(eventName, handleCallFinished));
    if (!socket.connected) socket.connect();

    return () => {
      incomingEvents.forEach((eventName) => socket.off(eventName, handleIncomingCall));
      finishEvents.forEach((eventName) => socket.off(eventName, handleCallFinished));
      if (pendingIncomingCallTimerRef.current) {
        clearTimeout(pendingIncomingCallTimerRef.current);
        pendingIncomingCallTimerRef.current = null;
      }
      pendingIncomingCallKeyRef.current = null;
    };
  }, [isReady, pathname]);

  useEffect(() => {
    if (!isReady) return undefined;

    const syncMessengerPresenceScope = (nextAppState: AppStateStatus = appStateRef.current) => {
      appStateRef.current = nextAppState;
      (globalThis as any).__sabiAppState = nextAppState;
      (globalThis as any).__sabiCurrentPathname = pathname || "";
      const routeIsMessenger = isMessengerPresencePath(pathname);
      const appIsActive = nextAppState === "active";
      const active = Boolean(routeIsMessenger && appIsActive);
      const roomId = active ? resolveMessengerRoomIdFromPath(pathname) : null;
      const nextKey = `${active ? "1" : "0"}:${roomId || ""}:${pathname || ""}:${nextAppState}`;

      if (lastMessengerPresenceKeyRef.current === nextKey) return;
      lastMessengerPresenceKeyRef.current = nextKey;

      void setMessengerKernelPresenceActive(active, {
        roomId,
        reason: active ? "messenger_route_active" : "messenger_route_inactive",
        force: !active,
      }).catch((error: unknown) => {
        console.warn(
          "[messenger-presence] scope sync failed",
          error instanceof Error ? error.message : error,
        );
      });
    };

    syncMessengerPresenceScope(AppState.currentState);

    const subscription = AppState.addEventListener("change", syncMessengerPresenceScope);

    return () => {
      subscription.remove();
      void setMessengerKernelPresenceActive(false, {
        roomId: null,
        reason: "root_presence_scope_cleanup",
      }).catch(() => undefined);
    };
  }, [isReady, pathname]);

  if (!isReady) {
    return (
      <View
        style={styles.bootstrapHost}
      >
        <ActivityIndicator size="large" color="#77E28C" />
      </View>
    );
  }

  return (
    <>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: styles.stackContent,
          animation: Platform.OS === "web" ? "none" : "default",
        }}
      >
        <Stack.Screen
          name="calls/audio"
          options={{
            presentation: Platform.OS === "web" ? "card" : "transparentModal",
            animation: Platform.OS === "web" ? "none" : "fade",
            contentStyle: styles.transparentStackContent,
          }}
        />
        <Stack.Screen
          name="calls/video"
          options={{
            presentation: Platform.OS === "web" ? "card" : "transparentModal",
            animation: Platform.OS === "web" ? "none" : "fade",
            contentStyle: styles.transparentStackContent,
          }}
        />
        <Stack.Screen
          name="audio-call"
          options={{
            presentation: Platform.OS === "web" ? "card" : "transparentModal",
            animation: Platform.OS === "web" ? "none" : "fade",
            contentStyle: styles.transparentStackContent,
          }}
        />
        <Stack.Screen
          name="video-call"
          options={{
            presentation: Platform.OS === "web" ? "card" : "transparentModal",
            animation: Platform.OS === "web" ? "none" : "fade",
            contentStyle: styles.transparentStackContent,
          }}
        />
      </Stack>
    </>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  bootstrapHost: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  stackContent: {
    flex: 1,
    backgroundColor: "transparent",
  },
  transparentStackContent: {
    flex: 1,
    backgroundColor: "transparent",
  },
});

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <SabiPlatformStabilityProvider>
      <AppearanceProvider>
        <ThemeProvider>
          <AppProviders>
            <HomeLayoutProvider>
              <HomeEditModeProvider>
                <AppBackground>
                  <RootBootstrap />
                </AppBackground>
              </HomeEditModeProvider>
            </HomeLayoutProvider>
          </AppProviders>
        </ThemeProvider>
      </AppearanceProvider>
      </SabiPlatformStabilityProvider>
    </GestureHandlerRootView>
  );
}




