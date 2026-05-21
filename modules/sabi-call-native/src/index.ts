import { NativeModules, Platform } from "react-native";

export type SabiNativeCallPayload = {
  callId: string;
  kind?: "audio" | "video" | string;
  callerName?: string;
  callerAvatarUrl?: string;
  fromUserId?: string;
  toUserId?: string;
  routePath?: string;
  routeParams?: Record<string, string | number | boolean | null | undefined>;
};

type NativeApi = {
  showIncomingCall?: (payload: SabiNativeCallPayload) => void;
  showOngoingCall?: (payload: SabiNativeCallPayload) => void;
  endCall?: () => void;
};

const nativeApi = (NativeModules as any).SabiCallNativeModule as NativeApi | undefined;

export function showNativeIncomingCall(payload: SabiNativeCallPayload) {
  if (Platform.OS === "web") return;
  nativeApi?.showIncomingCall?.(payload);
}

export function showNativeOngoingCall(payload: SabiNativeCallPayload) {
  if (Platform.OS === "web") return;
  nativeApi?.showOngoingCall?.(payload);
}

export function endNativeCall() {
  if (Platform.OS === "web") return;
  nativeApi?.endCall?.();
}
