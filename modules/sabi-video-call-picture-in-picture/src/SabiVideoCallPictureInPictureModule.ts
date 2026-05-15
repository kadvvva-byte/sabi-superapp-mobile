import { NativeModulesProxy, requireNativeModule } from "expo-modules-core";

export type SabiVideoCallPictureInPictureNativeResult =
  | boolean
  | void
  | null
  | undefined
  | {
      ok?: boolean;
      success?: boolean;
      enabled?: boolean;
      message?: string;
    };

export type SabiVideoCallPictureInPictureNativeModule = {
  __isFallback?: boolean;
  isSupported?: () => boolean | Promise<boolean>;
  enterPictureInPicture?: (
    payload?: Record<string, unknown>,
  ) => SabiVideoCallPictureInPictureNativeResult | Promise<SabiVideoCallPictureInPictureNativeResult>;
  startPictureInPicture?: (
    payload?: Record<string, unknown>,
  ) => SabiVideoCallPictureInPictureNativeResult | Promise<SabiVideoCallPictureInPictureNativeResult>;
  enter?: (
    payload?: Record<string, unknown>,
  ) => SabiVideoCallPictureInPictureNativeResult | Promise<SabiVideoCallPictureInPictureNativeResult>;

  exitPictureInPicture?: () => SabiVideoCallPictureInPictureNativeResult | Promise<SabiVideoCallPictureInPictureNativeResult>;
  stopPictureInPicture?: () => SabiVideoCallPictureInPictureNativeResult | Promise<SabiVideoCallPictureInPictureNativeResult>;
  exit?: () => SabiVideoCallPictureInPictureNativeResult | Promise<SabiVideoCallPictureInPictureNativeResult>;

  updatePictureInPictureMetadata?: (
    payload: Record<string, unknown>,
  ) => void | Promise<void>;
  updateMetadata?: (payload: Record<string, unknown>) => void | Promise<void>;
  setMetadata?: (payload: Record<string, unknown>) => void | Promise<void>;
};

const fallbackModule: SabiVideoCallPictureInPictureNativeModule = {
  __isFallback: true,
  isSupported: async () => false,
  enterPictureInPicture: async () => ({
    ok: false,
    message: "Native picture-in-picture module is not installed in this build.",
  }),
  startPictureInPicture: async () => ({
    ok: false,
    message: "Native picture-in-picture module is not installed in this build.",
  }),
  enter: async () => ({
    ok: false,
    message: "Native picture-in-picture module is not installed in this build.",
  }),
  exitPictureInPicture: async () => ({ ok: true }),
  stopPictureInPicture: async () => ({ ok: true }),
  exit: async () => ({ ok: true }),
  updatePictureInPictureMetadata: async () => undefined,
  updateMetadata: async () => undefined,
  setMetadata: async () => undefined,
};

function resolveNativeModule(): SabiVideoCallPictureInPictureNativeModule {
  try {
    return requireNativeModule<SabiVideoCallPictureInPictureNativeModule>(
      "SabiVideoCallPictureInPicture",
    );
  } catch {
    // safe fallback
  }

  const proxy = (NativeModulesProxy as Record<string, unknown>)
    .SabiVideoCallPictureInPicture as
    | SabiVideoCallPictureInPictureNativeModule
    | undefined;

  return proxy ?? fallbackModule;
}

const SabiVideoCallPictureInPictureModule = resolveNativeModule();

export default SabiVideoCallPictureInPictureModule;