
import { Platform } from "react-native";
import { requireNativeModule } from "expo";

export type SystemCallOverlayPayload = {
  contactName: string;
  avatarLetter: string;
  subtitle: string;
  callUrl: string;
  endUrl: string;
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
