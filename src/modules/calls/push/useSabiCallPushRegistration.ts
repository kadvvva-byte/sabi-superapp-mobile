import { useEffect, useRef } from "react";
import { AppState, Platform } from "react-native";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import { router } from "expo-router";

import {
  getAuthSessionState,
  isAuthenticatedSessionReady,
  subscribeAuthSessionState,
} from "../../../core/kernel/auth/session.store";

let sabiCallNotificationHandlerInstalled = false;

const SABI_INCOMING_CALL_CHANNEL_ID = "sabi_calls_neon_v1";
const SABI_INCOMING_CALL_CATEGORY_ID = "sabi_incoming_call";
const SABI_CALL_ACCEPT_ACTION_ID = "sabi_call_accept";
const SABI_CALL_DECLINE_ACTION_ID = "sabi_call_decline";

function normalizeNotificationText(value: unknown): string {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

function isSabiIncomingCallNotificationData(data: Record<string, unknown>): boolean {
  const typeText = [
    data.sabiType,
    data.notificationType,
    data.type,
    data.kind,
    data.category,
    data.event,
    data.action,
    data.status,
    data.signalKind,
  ]
    .map(normalizeNotificationText)
    .join("|");

  return (
    typeText.includes("incoming_call") ||
    typeText.includes("call_incoming") ||
    typeText.includes("call:incoming") ||
    typeText.includes("audio-call:incoming") ||
    typeText.includes("video-call:incoming")
  );
}

function isSabiMissedCallNotificationData(data: Record<string, unknown>): boolean {
  const typeText = [
    data.sabiType,
    data.notificationType,
    data.type,
    data.kind,
    data.category,
    data.event,
    data.action,
    data.status,
    data.reason,
    data.endReason,
    data.signalKind,
  ]
    .map(normalizeNotificationText)
    .join("|");

  return typeText.includes("missed") || typeText.includes("no_answer") || typeText.includes("unanswered");
}

function isSabiActiveCallPath(): boolean {
  const path = normalizeNotificationText((globalThis as any).__sabiCurrentPathname);
  return path === "/calls/audio" || path === "/calls/video" || path === "/audio-call" || path === "/video-call";
}

function shouldSuppressForegroundIncomingCallNotification(data: Record<string, unknown>): boolean {
  if (!isSabiIncomingCallNotificationData(data)) return false;
  if (isSabiMissedCallNotificationData(data)) return false;

  const appState = normalizeNotificationText((globalThis as any).__sabiAppState) || normalizeNotificationText(AppState.currentState);
  if (appState && appState !== "active") return false;

  return true;
}

function installSabiCallNotificationHandler() {
  if (sabiCallNotificationHandlerInstalled) return;
  sabiCallNotificationHandlerInstalled = true;

  Notifications.setNotificationHandler({
    handleNotification: async (notification) => {
      const data = (notification.request.content.data || {}) as Record<string, unknown>;

      // Incoming calls are represented by the call screen/overlay while the app
      // is active. A normal notification is shown only for missed/unanswered
      // call pushes. Messages and all other modules always use system banners.
      const suppressIncomingCall = shouldSuppressForegroundIncomingCallNotification(data);

      return ({
        shouldPlaySound: !suppressIncomingCall,
        shouldSetBadge: true,
        shouldShowBanner: !suppressIncomingCall,
        shouldShowList: !suppressIncomingCall,
      }) as Notifications.NotificationBehavior;
    },
  });
}

function readString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function readProjectId(): string {
  return (
    readString((Constants as any).easConfig?.projectId) ||
    readString((Constants as any).expoConfig?.extra?.eas?.projectId) ||
    readString((Constants as any).manifest2?.extra?.eas?.projectId)
  );
}

async function ensureSabiCallNotificationActions() {
  await Notifications.setNotificationCategoryAsync(SABI_INCOMING_CALL_CATEGORY_ID, [
    {
      identifier: SABI_CALL_ACCEPT_ACTION_ID,
      buttonTitle: "Принять",
      options: {
        opensAppToForeground: true,
        isDestructive: false,
        isAuthenticationRequired: false,
      },
    },
    {
      identifier: SABI_CALL_DECLINE_ACTION_ID,
      buttonTitle: "Отклонить",
      options: {
        opensAppToForeground: true,
        isDestructive: true,
        isAuthenticationRequired: false,
      },
    },
  ]);
}
async function ensureSabiCallAndroidChannel() {
  if (Platform.OS !== "android") return;

  await Notifications.setNotificationChannelAsync(SABI_INCOMING_CALL_CHANNEL_ID, {
    name: "Sabi Incoming Calls",
    importance: Notifications.AndroidImportance.MAX,
    sound: "sabi_call_neon.wav",
    vibrationPattern: [0, 700, 300, 700, 300, 700],
    enableVibrate: true,
    showBadge: true,
  });

  await Notifications.setNotificationChannelAsync("sabi_calls", {
    name: "Sabi Calls",
    importance: Notifications.AndroidImportance.HIGH,
    sound: "default",
    vibrationPattern: [0, 250, 250, 250],
    enableVibrate: true,
    showBadge: true,
  });
}

function parseRouteParams(value: unknown): Record<string, string> {
  if (!value) return {};

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value) as unknown;
      return parseRouteParams(parsed);
    } catch {
      return {};
    }
  }

  if (typeof value !== "object" || Array.isArray(value)) return {};

  const result: Record<string, string> = {};
  Object.entries(value as Record<string, unknown>).forEach(([key, item]) => {
    if (item === null || item === undefined) return;
    result[key] = String(item);
  });
  return result;
}

function declineSabiIncomingCallNotification(data: Record<string, unknown>) {
  const auth = getAuthSessionState();
  const callId = readString(data.callId);
  if (!callId || !auth.apiBaseUrl) return;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (auth.accessToken) headers.Authorization = `Bearer ${auth.accessToken}`;
  if (auth.currentUserId) headers["X-User-Id"] = auth.currentUserId;

  void fetch(`${auth.apiBaseUrl.replace(/\/+$/, "")}/api/v2/calls/signal`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      callId,
      userId: auth.currentUserId,
      fromUserId: auth.currentUserId,
      event: "declined",
      action: "declined",
      status: "declined",
      signalKind: "ended",
      endReason: "declined",
      source: "notification_action",
    }),
  }).catch((error) => {
    console.warn("[sabi-call:push] decline action failed", error instanceof Error ? error.message : error);
  });
}

function openSabiIncomingCallNotification(data: Record<string, unknown>, lastOpenKeyRef: React.MutableRefObject<string>) {
  if (readString(data.sabiType) !== "incoming_call") return;

  const auth = getAuthSessionState();

  const callId = readString(data.callId) || String(Date.now());
  const kindText = [
    readString(data.kind),
    readString(data.callType),
    readString(data.type),
  ].join(" ").toLowerCase();

  const kind = kindText.includes("video") ? "video" : "audio";
  const routePath = readString(data.routePath) || (kind === "video" ? "/calls/video" : "/calls/audio");
  const params = parseRouteParams(data.routeParams);

  const currentUserId =
    readString(params.userId) ||
    readString(params.selfId) ||
    readString(params.toUserId) ||
    readString(params.receiverUserId) ||
    readString(params.targetUserId) ||
    readString(data.toUserId) ||
    readString(data.receiverUserId) ||
    readString(data.targetUserId) ||
    readString(data.userId) ||
    readString(auth.currentUserId);

  const peerId =
    readString(params.peerId) ||
    readString(params.peerUserId) ||
    readString(params.partnerId) ||
    readString(params.fromUserId) ||
    readString(data.fromUserId) ||
    readString(data.callerId) ||
    readString(data.senderUserId) ||
    readString(data.peerId);

  const chatId =
    readString(params.chatId) ||
    readString(params.id) ||
    readString(data.chatId) ||
    readString(data.contextId) ||
    callId;

  const name =
    readString(params.name) ||
    readString(params.callerName) ||
    readString(data.callerName) ||
    readString(data.fromName) ||
    readString(data.senderName) ||
    readString(data.name) ||
    peerId ||
    "Sabi";

  const avatarLetter =
    readString(params.avatarLetter) ||
    readString(data.callerAvatarLetter) ||
    readString(data.avatarLetter) ||
    name.replace(/^\+/, "").match(/[\p{L}\p{N}]/u)?.[0]?.toUpperCase() ||
    "S";

  const avatarUrl =
    readString(params.avatarUrl) ||
    readString(params.photoUrl) ||
    readString(data.callerAvatarUrl) ||
    readString(data.avatarUrl) ||
    readString(data.photoUrl);

  const openKey = `${callId}:${routePath}`;
  if (lastOpenKeyRef.current === openKey) return;
  lastOpenKeyRef.current = openKey;

  router.push({
    pathname: routePath as never,
    params: {
      ...params,
      id: chatId,
      chatId,
      roomId: readString(params.roomId) || chatId,
      callId,
      incoming: "1",
      incomingCall: "1",
      action: "incoming",
      direction: "incoming",
      phase: "ringing",
      kind,
      type: kind,
      callKind: kind,
      callType: kind,
      mediaKind: kind,
      userId: currentUserId,
      selfId: currentUserId,
      currentUserId,
      peerId,
      peerUserId: peerId,
      partnerId: peerId,
      targetUserId: peerId,
      fromUserId: peerId,
      callerId: peerId,
      name,
      callerName: name,
      fromName: name,
      roomTitle: name,
      avatarLetter,
      avatarUrl: avatarUrl || undefined,
      photoUrl: avatarUrl || undefined,
      status: kind === "video" ? "Incoming video call" : "Incoming audio call",
    } as never,
  });
}

async function registerSabiCallPushTokenOnce(lastRegisteredKeyRef: React.MutableRefObject<string>) {
  if (Platform.OS === "web") return;
  if (!Device.isDevice) return;
  if (!isAuthenticatedSessionReady()) return;

  const auth = getAuthSessionState();

  if (
    auth.status !== "authenticated" ||
    !auth.apiBaseUrl ||
    !auth.accessToken ||
    !auth.currentUserId
  ) {
    return;
  }

  await ensureSabiCallAndroidChannel();
  await ensureSabiCallNotificationActions();

  const currentPermission = await Notifications.getPermissionsAsync();
  let finalStatus = currentPermission.status;

  if (finalStatus !== "granted") {
    const requested = await Notifications.requestPermissionsAsync();
    finalStatus = requested.status;
  }

  if (finalStatus !== "granted") {
    console.warn("[sabi-call:push] notification permission not granted");
    return;
  }

  const projectId = readProjectId();

  if (!projectId) {
    console.warn("[sabi-call:push] EAS projectId is missing");
    return;
  }

  const tokenResult = await Notifications.getExpoPushTokenAsync({ projectId });
  const token = readString(tokenResult.data);

  if (!token) return;

  const registerKey = `${auth.currentUserId}:${token}`;
  if (lastRegisteredKeyRef.current === registerKey) return;
  lastRegisteredKeyRef.current = registerKey;

  const response = await fetch(`${auth.apiBaseUrl.replace(/\/+$/, "")}/api/v2/calls/push-token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${auth.accessToken}`,
      "X-User-Id": auth.currentUserId,
    },
    body: JSON.stringify({
      userId: auth.currentUserId,
      token,
      expoPushToken: token,
      platform: Platform.OS,
      deviceId: `${Platform.OS}:${Device.osBuildId || Device.modelId || Device.modelName || "device"}`,
      deviceName: Device.deviceName || Device.modelName || null,
      appVersion: readString((Constants as any).expoConfig?.version),
    }),
  });

  if (!response.ok) {
    throw new Error(`push_token_register_failed_${response.status}`);
  }

  console.log("[sabi-call:push] token registered");
}

export function useSabiCallPushRegistration(enabled: boolean) {
  const lastRegisteredKeyRef = useRef("");
  const lastOpenKeyRef = useRef("");

  useEffect(() => {
    installSabiCallNotificationHandler();

    const receivedSubscription = Notifications.addNotificationReceivedListener((notification) => {
      const data = (notification.request.content.data || {}) as Record<string, unknown>;

      if (!shouldSuppressForegroundIncomingCallNotification(data)) return;
      if (isSabiActiveCallPath()) return;

      openSabiIncomingCallNotification(data, lastOpenKeyRef);
    });

    const responseSubscription = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = (response.notification.request.content.data || {}) as Record<string, unknown>;

      if (response.actionIdentifier === SABI_CALL_DECLINE_ACTION_ID) {
        declineSabiIncomingCallNotification(data);
        return;
      }

      openSabiIncomingCallNotification(data, lastOpenKeyRef);
    });

    void Notifications.getLastNotificationResponseAsync()
      .then((response) => {
        if (!response) return;
        openSabiIncomingCallNotification(
          (response.notification.request.content.data || {}) as Record<string, unknown>,
          lastOpenKeyRef,
        );
      })
      .catch(() => undefined);

    return () => {
      receivedSubscription.remove();
      responseSubscription.remove();
    };
  }, []);

  useEffect(() => {
    if (!enabled) return undefined;

    const run = () => {
      void registerSabiCallPushTokenOnce(lastRegisteredKeyRef).catch((error) => {
        console.warn("[sabi-call:push] token registration skipped", error instanceof Error ? error.message : error);
      });
    };

    run();

    const unsubscribe = subscribeAuthSessionState(() => run());

    return () => {
      unsubscribe();
    };
  }, [enabled]);
}






