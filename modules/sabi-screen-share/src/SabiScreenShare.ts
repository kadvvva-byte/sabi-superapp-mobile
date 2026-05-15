import { requireNativeModule } from 'expo-modules-core';

export type SabiScreenShareAvailability =
  | 'supported'
  | 'unsupported'
  | 'native-module-required'
  | 'extension-required';

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

export default requireNativeModule<SabiScreenShareNativeModule>('SabiScreenShare');
