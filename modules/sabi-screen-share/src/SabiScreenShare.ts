import { NativeModulesProxy, requireNativeModule } from "expo-modules-core";

export type SabiScreenShareAvailability =
  | "supported"
  | "unsupported"
  | "native-module-required"
  | "extension-required";

export type SabiScreenShareNativeModule = {
  isAvailableAsync(): Promise<{
    availability: SabiScreenShareAvailability;
    reason?: string;
  }>;
  startAsync(options: { withSystemAudio: boolean }): Promise<{
    ok: boolean;
    sourceLabel?: string;
    message?: string;
    availability?: SabiScreenShareAvailability;
  }>;
  stopAsync(): Promise<{
    ok: boolean;
    message?: string;
  }>;
};

const fallbackModule: SabiScreenShareNativeModule = {
  async isAvailableAsync() {
    return {
      availability: "native-module-required",
      reason: "Native screen-share module is not installed in this build.",
    };
  },
  async startAsync() {
    return {
      ok: false,
      message: "Native screen-share module is not installed in this build.",
      availability: "native-module-required",
    };
  },
  async stopAsync() {
    return {
      ok: true,
    };
  },
};

function resolveNativeModule(): SabiScreenShareNativeModule {
  try {
    return requireNativeModule<SabiScreenShareNativeModule>("SabiScreenShare");
  } catch {
    // safe fallback
  }

  const proxy = (NativeModulesProxy as Record<string, unknown>).SabiScreenShare as
    | SabiScreenShareNativeModule
    | undefined;

  return proxy ?? fallbackModule;
}

export default resolveNativeModule();
