import { Platform } from "react-native";

export type SabiCameraFacing = "front" | "back";

export function normalizeSabiCameraFacing(value?: string | null, fallback: SabiCameraFacing = "back"): SabiCameraFacing {
  return value === "front" || value === "back" ? value : fallback;
}

export function toggleSabiCameraFacing(value: SabiCameraFacing): SabiCameraFacing {
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
  return [args.scope, args.facing, args.mode ?? "default", String(args.version ?? 0)].join(":");
}

export function normalizeSabiCameraMountError(value: unknown, fallback = "Camera unavailable") {
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
