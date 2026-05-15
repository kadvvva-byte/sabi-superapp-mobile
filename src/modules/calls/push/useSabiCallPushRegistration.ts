import { useEffect, useRef } from "react";
import { Platform } from "react-native";
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

function installSabiCallNotificationHandler() {
  if (sabiCallNotificationHandlerInstalled) return;
  sabiCallNotificationHandlerInstalled = true;

  Notifications.setNotificationHandler({
    handleNotification: async () =>
      ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
      }) as Notifications.NotificationBehavior,
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

async function ensureSabiCallAndroidChannel() {
  if (Platform.OS !== "android") return;

  await Notifications.setNotificationChannelAsync("sabi_calls", {
    name: "Sabi Calls",
    importance: Notifications.AndroidImportance.MAX,
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

function openSabiIncomingCallNotification(data: Record<string, unknown>, lastOpenKeyRef: React.MutableRefObject<string>) {
  if (readString(data.sabiType) !== "incoming_call") return;

  const callId = readString(data.callId) || String(Date.now());
  const routePath = readString(data.routePath) || (readString(data.kind) === "video" ? "/calls/video" : "/calls/audio");
  const params = parseRouteParams(data.routeParams);

  const openKey = `${callId}:${routePath}`;
  if (lastOpenKeyRef.current === openKey) return;
  lastOpenKeyRef.current = openKey;

  router.push({
    pathname: routePath as never,
    params: {
      ...params,
      callId,
      incoming: "1",
      incomingCall: "1",
      action: "incoming",
      direction: "incoming",
      phase: "ringing",
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

    const responseSubscription = Notifications.addNotificationResponseReceivedListener((response) => {
      openSabiIncomingCallNotification(
        (response.notification.request.content.data || {}) as Record<string, unknown>,
        lastOpenKeyRef,
      );
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
