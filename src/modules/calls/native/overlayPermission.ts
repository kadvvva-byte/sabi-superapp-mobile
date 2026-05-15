import { Platform } from "react-native";
import { requireNativeModule } from "expo";

type OverlayPermissionNativeModule = {
  canUseSystemOverlay: () => boolean;
  openOverlayPermissionSettings: () => void;
};

const fallbackModule: OverlayPermissionNativeModule = {
  canUseSystemOverlay: () => false,
  openOverlayPermissionSettings: () => {},
};

function loadNativeModule(): OverlayPermissionNativeModule {
  if (Platform.OS !== "android") {
    return fallbackModule;
  }

  try {
    return requireNativeModule<OverlayPermissionNativeModule>(
      "OverlayPermissionModule",
    );
  } catch {
    return fallbackModule;
  }
}

const OverlayPermissionModule = loadNativeModule();

export function isOverlayFeatureSupported() {
  return Platform.OS === "android";
}

export async function canUseSystemOverlay() {
  try {
    return Boolean(OverlayPermissionModule.canUseSystemOverlay());
  } catch {
    return false;
  }
}

export async function openOverlayPermissionSettings() {
  if (Platform.OS !== "android") return;

  try {
    OverlayPermissionModule.openOverlayPermissionSettings();
  } catch {
    // no-op fallback
  }
}