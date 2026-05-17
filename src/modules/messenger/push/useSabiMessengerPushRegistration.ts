import { useEffect, useRef } from "react";
import { Platform } from "react-native";
import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";

import {
  getAuthSessionState,
  isAuthenticatedSessionReady,
  subscribeAuthSessionState,
} from "../../../core/kernel/auth/session.store";

const SABI_MESSAGE_CHANNEL_ID = "sabi_messages_v1";
const SABI_MESSAGE_CATEGORY_ID = "sabi_message";
const SABI_MESSAGE_OPEN_ACTION_ID = "sabi_message_open";

function readString(value: unknown): string {
  return typeof value === "string" && value.trim() ? value.trim() : "";
}

function readProjectId(): string {
  return (
    readString((Constants as any).expoConfig?.extra?.eas?.projectId) ||
    readString((Constants as any).easConfig?.projectId)
  );
}

async function ensureSabiMessengerNotificationChannel() {
  await Notifications.setNotificationCategoryAsync(SABI_MESSAGE_CATEGORY_ID, [
    {
      identifier: SABI_MESSAGE_OPEN_ACTION_ID,
      buttonTitle: "Открыть",
      options: {
        opensAppToForeground: true,
        isDestructive: false,
        isAuthenticationRequired: false,
      },
    },
  ]);

  if (Platform.OS !== "android") return;

  await Notifications.setNotificationChannelAsync(SABI_MESSAGE_CHANNEL_ID, {
    name: "Sabi Messages",
    importance: Notifications.AndroidImportance.HIGH,
    sound: "sabi_msg_clean.wav",
    vibrationPattern: [0, 140, 90, 140],
    enableVibrate: true,
    showBadge: true,
  });
}

async function registerSabiMessengerPushTokenOnce(lastRegisteredKeyRef: React.MutableRefObject<string>) {
  const auth = getAuthSessionState();

  if (
    Platform.OS === "web" ||
    !Device.isDevice ||
    !isAuthenticatedSessionReady() ||
    auth.status !== "authenticated" ||
    !auth.apiBaseUrl ||
    !auth.accessToken ||
    !auth.currentUserId
  ) {
    return;
  }

  await ensureSabiMessengerNotificationChannel();

  const currentPermission = await Notifications.getPermissionsAsync();
  let finalStatus = currentPermission.status;

  if (finalStatus !== "granted") {
    const requested = await Notifications.requestPermissionsAsync();
    finalStatus = requested.status;
  }

  if (finalStatus !== "granted") {
    console.warn("[sabi-message:push] notification permission not granted");
    return;
  }

  const projectId = readProjectId();

  if (!projectId) {
    console.warn("[sabi-message:push] EAS projectId is missing");
    return;
  }

  const tokenResult = await Notifications.getExpoPushTokenAsync({ projectId });
  const token = readString(tokenResult.data);

  if (!token) return;

  const registerKey = `${auth.currentUserId}:${token}`;
  if (lastRegisteredKeyRef.current === registerKey) return;
  lastRegisteredKeyRef.current = registerKey;

  const response = await fetch(`${auth.apiBaseUrl.replace(/\/+$/, "")}/api/v2/messenger/push-token`, {
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
    throw new Error(`messenger_push_token_register_failed_${response.status}`);
  }

  console.log("[sabi-message:push] token registered");
}

export function useSabiMessengerPushRegistration(enabled: boolean) {
  const lastRegisteredKeyRef = useRef("");

  useEffect(() => {
    if (!enabled) return undefined;

    const run = () => {
      void registerSabiMessengerPushTokenOnce(lastRegisteredKeyRef).catch((error) => {
        console.warn("[sabi-message:push] token registration skipped", error instanceof Error ? error.message : error);
      });
    };

    run();

    const unsubscribe = subscribeAuthSessionState(() => run());

    return () => {
      unsubscribe();
    };
  }, [enabled]);
}
