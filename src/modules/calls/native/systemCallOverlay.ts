import { NativeModules, Platform } from "react-native";
import { requireNativeModule } from "expo";

export type SystemCallOverlayPayload = {
  contactName: string;
  avatarLetter: string;
  subtitle: string;
  callUrl: string;
  endUrl: string;
  callId?: string;
  kind?: "audio" | "video" | string;
  fromUserId?: string;
  toUserId?: string;
  callerName?: string;
  callerAvatarUrl?: string;
  routePath?: string;
  routeParams?: Record<string, string | number | boolean | null | undefined>;
};

type NativeSystemCallOverlayModule = {
  canShowSystemCallOverlay: () => boolean;
  showSystemCallOverlay: (payload: SystemCallOverlayPayload) => void;
  updateSystemCallOverlay: (payload: SystemCallOverlayPayload) => void;
  hideSystemCallOverlay: () => void;
};

const fallbackModule: NativeSystemCallOverlayModule = {
  canShowSystemCallOverlay: () => false,
  showSystemCallOverlay: () => {},
  updateSystemCallOverlay: () => {},
  hideSystemCallOverlay: () => {},
};

function loadNativeModule(): NativeSystemCallOverlayModule {
  if (Platform.OS !== "android") return fallbackModule;

  const reactNativeModule =
    (NativeModules as any).SabiCallNativeModule ||
    (NativeModules as any).SystemCallOverlayModule;

  if (reactNativeModule) {
    return {
      canShowSystemCallOverlay: () => {
        try {
          return Boolean(
            reactNativeModule.canShowSystemCallOverlay?.() ??
              reactNativeModule.canShowIncomingCallOverlay?.() ??
              true,
          );
        } catch {
          return false;
        }
      },
      showSystemCallOverlay: (payload) => {
        if (typeof reactNativeModule.showSystemCallOverlay === "function") {
          reactNativeModule.showSystemCallOverlay(payload);
          return;
        }
        if (typeof reactNativeModule.showIncomingCall === "function") {
          reactNativeModule.showIncomingCall(payload);
        }
      },
      updateSystemCallOverlay: (payload) => {
        if (typeof reactNativeModule.updateSystemCallOverlay === "function") {
          reactNativeModule.updateSystemCallOverlay(payload);
          return;
        }
        if (typeof reactNativeModule.showOngoingCall === "function") {
          reactNativeModule.showOngoingCall(payload);
          return;
        }
        if (typeof reactNativeModule.showSystemCallOverlay === "function") {
          reactNativeModule.showSystemCallOverlay(payload);
        }
      },
      hideSystemCallOverlay: () => {
        if (typeof reactNativeModule.hideSystemCallOverlay === "function") {
          reactNativeModule.hideSystemCallOverlay();
          return;
        }
        if (typeof reactNativeModule.endCall === "function") {
          reactNativeModule.endCall();
        }
      },
    };
  }

  try {
    return requireNativeModule<NativeSystemCallOverlayModule>("SystemCallOverlayModule");
  } catch {
    return fallbackModule;
  }
}

const SystemCallOverlayModule = loadNativeModule();

export async function canShowSystemCallOverlay() {
  if (Platform.OS !== "android") return false;
  try {
    return Boolean(SystemCallOverlayModule.canShowSystemCallOverlay());
  } catch {
    return false;
  }
}

export async function showSystemCallOverlay(payload: SystemCallOverlayPayload) {
  if (Platform.OS !== "android") return;
  try {
    SystemCallOverlayModule.showSystemCallOverlay(payload);
  } catch {
    // no-op fallback
  }
}

export async function updateSystemCallOverlay(payload: SystemCallOverlayPayload) {
  if (Platform.OS !== "android") return;
  try {
    SystemCallOverlayModule.updateSystemCallOverlay(payload);
  } catch {
    // no-op fallback
  }
}

export async function hideSystemCallOverlay() {
  if (Platform.OS !== "android") return;
  try {
    SystemCallOverlayModule.hideSystemCallOverlay();
  } catch {
    // no-op fallback
  }
}
