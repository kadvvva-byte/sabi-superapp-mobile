import { Platform } from "react-native";

export type SabiCameraFacing = "front" | "back";

export function normalizeSabiCameraFacing(
  value?: string | null,
  fallback: SabiCameraFacing = "back",
): SabiCameraFacing {
  return value === "front" || value === "back" ? value : fallback;
}

export function toggleSabiCameraFacing(
  value: SabiCameraFacing,
): SabiCameraFacing {
  return value === "front" ? "back" : "front";
}

export function getSabiCameraRemountDelayMs() {
  return Platform.OS === "android" ? 220 : 90;
}

export function getSabiCameraRetryDelayMs() {
  return Platform.OS === "android" ? 360 : 160;
}

export function buildSabiCameraMountKey(args: {
  scope: string;
  facing: SabiCameraFacing;
  mode?: string | null;
  version?: number | string | null;
}) {
  return [
    args.scope,
    args.facing,
    args.mode ?? "default",
    String(args.version ?? 0),
  ].join(":");
}

export function normalizeSabiCameraMountError(
  value: unknown,
  fallback = "Camera unavailable",
) {
  const raw =
    typeof value === "string"
      ? value
      : value && typeof value === "object"
        ? String(
            (value as any)?.nativeEvent?.message ??
              (value as any)?.message ??
              (value as any)?.error ??
              fallback,
          )
        : fallback;

  const trimmed = raw.trim();
  return trimmed || fallback;
}

export type SabiCameraAutofocusMode = "on" | "off";

export function getSabiQrScannerAutofocusPulseMs() {
  return Platform.OS === "android" ? 1800 : 2200;
}

export function getSabiQrScannerAutofocusResetMs() {
  return Platform.OS === "android" ? 90 : 120;
}

export function getSabiQrScannerZoom(facing: SabiCameraFacing) {
  if (facing !== "back") return 0;
  return Platform.OS === "android" ? 0.08 : 0.04;
}
export function canUseSabiQrScannerTorch(facing: SabiCameraFacing) {
  return facing === "back";
}

export function getSabiQrScannerDuplicateWindowMs() {
  return Platform.OS === "android" ? 2800 : 2200;
}

export function getSabiQrScannerErrorUnlockDelayMs() {
  return Platform.OS === "android" ? 520 : 360;
}
