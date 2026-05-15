import { NativeEventEmitter, NativeModules, Platform } from "react-native";

export type NativeScreenShareStartParams = {
  ownerUserId: string;
  ownerName: string;
  withSystemAudio?: boolean;
};

export type NativeScreenShareStartResult = {
  ok: boolean;
  sessionId?: string | null;
  sourceLabel?: string | null;
  message?: string;
};

export type NativeScreenShareStopResult = {
  ok: boolean;
  message?: string;
};

export type NativeScreenShareEventName =
  | "SabiScreenShareDidStart"
  | "SabiScreenShareDidStop"
  | "SabiScreenShareDidFail";

export type NativeScreenShareEventPayload = {
  sessionId?: string | null;
  sourceLabel?: string | null;
  message?: string;
};

export type NativeScreenShareAvailability =
  | "supported"
  | "native-module-required"
  | "unsupported";

type NativeAvailabilityResponse =
  | NativeScreenShareAvailability
  | {
      availability?: string | null;
      reason?: string | null;
      message?: string | null;
      ok?: boolean | null;
      supported?: boolean | null;
    };

type NativeScreenShareModuleShape = {
  isAvailableAsync?: () => Promise<NativeAvailabilityResponse>;
  startScreenShare?: (
    params: NativeScreenShareStartParams,
  ) => Promise<NativeScreenShareStartResult>;
  stopScreenShare?: () => Promise<NativeScreenShareStopResult>;
};

const nativeModule =
  (NativeModules.SabiScreenShare as NativeScreenShareModuleShape | undefined) ??
  undefined;

const nativeEmitter = nativeModule
  ? new NativeEventEmitter(NativeModules.SabiScreenShare)
  : null;

let resolvedAvailability: NativeScreenShareAvailability | null = null;
let availabilityProbe: Promise<NativeScreenShareAvailability> | null = null;

function normalizeAvailabilityValue(value: unknown): NativeScreenShareAvailability {
  const normalized = typeof value === "string" ? value.trim().toLowerCase() : "";

  if (
    normalized === "native-module-required" ||
    normalized === "extension-required" ||
    normalized === "module-required"
  ) {
    return "native-module-required";
  }

  if (normalized === "unsupported") {
    return "unsupported";
  }

  return "supported";
}

function baseAvailability(): NativeScreenShareAvailability {
  if (Platform.OS === "web") return "unsupported";
  if (!nativeModule?.startScreenShare || !nativeModule?.stopScreenShare) {
    return "native-module-required";
  }
  return "supported";
}

async function ensureNativeAvailability(): Promise<NativeScreenShareAvailability> {
  const base = baseAvailability();

  if (base !== "supported") {
    resolvedAvailability = base;
    return base;
  }

  if (resolvedAvailability) {
    return resolvedAvailability;
  }

  if (availabilityProbe) {
    return availabilityProbe;
  }

  availabilityProbe = (async () => {
    try {
      const result = await nativeModule?.isAvailableAsync?.();

      if (typeof result === "string") {
        resolvedAvailability = normalizeAvailabilityValue(result);
        return resolvedAvailability;
      }

      if (result && typeof result === "object") {
        if (typeof result.supported === "boolean") {
          resolvedAvailability = result.supported ? "supported" : "unsupported";
          return resolvedAvailability;
        }

        if (typeof result.ok === "boolean" && result.ok === false) {
          resolvedAvailability = "native-module-required";
          return resolvedAvailability;
        }

        resolvedAvailability = normalizeAvailabilityValue(result.availability);
        return resolvedAvailability;
      }

      resolvedAvailability = "supported";
      return resolvedAvailability;
    } catch {
      resolvedAvailability = "supported";
      return resolvedAvailability;
    } finally {
      availabilityProbe = null;
    }
  })();

  return availabilityProbe;
}

export function getNativeScreenShareAvailability(): NativeScreenShareAvailability {
  const base = baseAvailability();

  if (base !== "supported") {
    resolvedAvailability = base;
    return base;
  }

  void ensureNativeAvailability();
  return resolvedAvailability ?? "supported";
}

export async function startNativeScreenShare(
  params: NativeScreenShareStartParams,
): Promise<NativeScreenShareStartResult> {
  const availability = await ensureNativeAvailability();

  if (availability !== "supported") {
    return {
      ok: false,
      message:
        availability === "unsupported"
          ? "Screen sharing is not supported on this platform."
          : "Native screen-share module is not installed on this build.",
    };
  }

  if (!nativeModule?.startScreenShare) {
    return {
      ok: false,
      message: "Native screen-share module is not installed on this build.",
    };
  }

  try {
    return await nativeModule.startScreenShare(params);
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error
          ? error.message
          : "Unable to start native screen share.",
    };
  }
}

export async function stopNativeScreenShare(): Promise<NativeScreenShareStopResult> {
  if (!nativeModule?.stopScreenShare) {
    return {
      ok: false,
      message: "Native screen-share module is not installed on this build.",
    };
  }

  try {
    return await nativeModule.stopScreenShare();
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error
          ? error.message
          : "Unable to stop native screen share.",
    };
  }
}

export function subscribeNativeScreenShareEvents(handlers: {
  onStart?: (payload: NativeScreenShareEventPayload) => void;
  onStop?: (payload: NativeScreenShareEventPayload) => void;
  onFail?: (payload: NativeScreenShareEventPayload) => void;
}) {
  void ensureNativeAvailability();

  if (!nativeEmitter) {
    return () => undefined;
  }

  const startSub = handlers.onStart
    ? nativeEmitter.addListener("SabiScreenShareDidStart", handlers.onStart)
    : null;
  const stopSub = handlers.onStop
    ? nativeEmitter.addListener("SabiScreenShareDidStop", handlers.onStop)
    : null;
  const failSub = handlers.onFail
    ? nativeEmitter.addListener("SabiScreenShareDidFail", handlers.onFail)
    : null;

  return () => {
    startSub?.remove();
    stopSub?.remove();
    failSub?.remove();
  };
}