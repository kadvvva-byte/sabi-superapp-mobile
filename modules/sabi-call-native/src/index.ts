import { NativeModules, Platform } from "react-native";
import { requireNativeModule } from "expo-modules-core";

export type SabiNativeCallPayload = {
  callId: string;
  kind?: "audio" | "video" | string;
  type?: "audio" | "video" | string;
  callKind?: "audio" | "video" | string;
  callType?: "audio" | "video" | string;
  callerName?: string;
  callerPhone?: string;
  callerAvatarUrl?: string;
  avatarUrl?: string;
  fromUserId?: string;
  toUserId?: string;
  peerId?: string;
  routePath?: string;
  routeParams?: Record<string, string | number | boolean | null | undefined>;
  actionUrl?: string;
  actionToken?: string;
};

type NativeApi = {
  canShowSystemCallOverlay?: () => boolean;
  showIncomingCall?: (payload: SabiNativeCallPayload) => void;
  showSystemCallOverlay?: (payload: SabiNativeCallPayload) => void;
  showOngoingCall?: (payload: SabiNativeCallPayload) => void;
  updateSystemCallOverlay?: (payload: SabiNativeCallPayload) => void;
  hideSystemCallOverlay?: () => void;
  endCall?: () => void;
};

function getNativeApi(): NativeApi | undefined {
  if (Platform.OS === "web") return undefined;
  try {
    const expoModule = requireNativeModule<NativeApi>("SabiCallNativeModule");
    if (expoModule) return expoModule;
  } catch (_) {}
  return (NativeModules as any).SabiCallNativeModule as NativeApi | undefined;
}

function normalizePayload(payload: SabiNativeCallPayload): SabiNativeCallPayload {
  const kind = String(payload.kind || payload.callKind || payload.callType || payload.type || "audio").toLowerCase().includes("video")
    ? "video"
    : "audio";
  return {
    ...payload,
    kind,
    type: kind,
    callKind: kind,
    callType: kind,
    routePath: payload.routePath || (kind === "video" ? "/calls/video" : "/calls/audio"),
  };
}

export function canShowNativeIncomingCall() {
  if (Platform.OS === "web") return false;
  return Boolean(getNativeApi()?.canShowSystemCallOverlay?.());
}

export function showNativeIncomingCall(payload: SabiNativeCallPayload) {
  if (Platform.OS === "web") return;
  const api = getNativeApi();
  const normalized = normalizePayload(payload);
  api?.showIncomingCall?.(normalized);
  api?.showSystemCallOverlay?.(normalized);
}

export function showNativeOngoingCall(payload: SabiNativeCallPayload) {
  if (Platform.OS === "web") return;
  const normalized = normalizePayload(payload);
  const api = getNativeApi();
  api?.showOngoingCall?.(normalized);
  api?.updateSystemCallOverlay?.(normalized);
}

export function endNativeCall() {
  if (Platform.OS === "web") return;
  const api = getNativeApi();
  api?.endCall?.();
  api?.hideSystemCallOverlay?.();
}
