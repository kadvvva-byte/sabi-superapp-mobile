import { NativeModules, Platform } from "react-native";

export type SabiPresentationDisplay = {
  id: number;
  name: string;
  isDefault: boolean;
  isExternal: boolean;
  rotation: number;
  width: number;
  height: number;
};

export type SabiPresentationStatus = {
  nativeAvailable: boolean;
  displayCount: number;
  presentationDisplayCount: number;
  externalDisplayConnected: boolean;
  networkConnected: boolean;
  displays: SabiPresentationDisplay[];
};

export type SabiPresentationOpenResult = {
  opened: boolean;
  action: string;
  error?: string;
};

export type SabiWifiDirectStatus = {
  nativeAvailable: boolean;
  wifiDirectSupported: boolean;
  permissionsGranted: boolean;
  requiredPermissions: string[];
  missingPermissions: string[];
  androidSdk: number;
  requestStarted?: boolean;
  requestError?: string;
  allGrantedAfterRequest?: boolean;
};

export type SabiWifiDirectDevice = {
  deviceName: string;
  deviceAddress: string;
  primaryDeviceType: string;
  secondaryDeviceType: string;
  statusCode: number;
  statusText: string;
  modelFamily: string;
  looksLikeTv: boolean;
  connectable: boolean;
};

export type SabiWifiDirectScanResult = {
  nativeAvailable: boolean;
  scanStarted: boolean;
  error?: string;
  status: SabiWifiDirectStatus;
  devices: SabiWifiDirectDevice[];
};

export type SabiWifiDirectConnectResult = {
  nativeAvailable: boolean;
  connectStarted: boolean;
  deviceAddress: string;
  error?: string;
  note?: string;
  status?: SabiWifiDirectStatus;
};

type SabiPresentationNativeModule = {
  openCastPicker: () => Promise<SabiPresentationOpenResult>;
  openWifiSettings: () => Promise<SabiPresentationOpenResult>;
  openDisplaySettings: () => Promise<SabiPresentationOpenResult>;
  openSystemSettings: () => Promise<SabiPresentationOpenResult>;
  enterPresentationMode: (landscape: boolean) => Promise<{ applied: boolean; reason?: string }>;
  exitPresentationMode: () => Promise<{ applied: boolean; reason?: string }>;
  getPresentationStatus: () => Promise<SabiPresentationStatus>;
  getWifiDirectStatus: () => Promise<SabiWifiDirectStatus>;
  requestWifiDirectPermissions: () => Promise<SabiWifiDirectStatus>;
  scanWifiDirectDevices: (timeoutMs: number) => Promise<SabiWifiDirectScanResult>;
  connectWifiDirectDevice: (deviceAddress: string) => Promise<SabiWifiDirectConnectResult>;
};

const nativeModule = NativeModules.SabiPresentationNative as SabiPresentationNativeModule | undefined;

export const isSabiPresentationNativeAvailable = Platform.OS === "android" && Boolean(nativeModule);

const unavailableOpenResult: SabiPresentationOpenResult = {
  opened: false,
  action: "native_module_unavailable",
  error: "SabiPresentationNative is not available in this build",
};

const unavailableWifiStatus: SabiWifiDirectStatus = {
  nativeAvailable: false,
  wifiDirectSupported: false,
  permissionsGranted: false,
  requiredPermissions: [],
  missingPermissions: [],
  androidSdk: 0,
};

export async function openNativeCastPicker(): Promise<SabiPresentationOpenResult> {
  if (!nativeModule) return unavailableOpenResult;
  return nativeModule.openCastPicker();
}

export async function openNativeWifiSettings(): Promise<SabiPresentationOpenResult> {
  if (!nativeModule) return unavailableOpenResult;
  return nativeModule.openWifiSettings();
}

export async function openNativeDisplaySettings(): Promise<SabiPresentationOpenResult> {
  if (!nativeModule) return unavailableOpenResult;
  return nativeModule.openDisplaySettings();
}

export async function openNativeSystemSettings(): Promise<SabiPresentationOpenResult> {
  if (!nativeModule) return unavailableOpenResult;
  return nativeModule.openSystemSettings();
}

export async function enterNativePresentationMode(landscape: boolean): Promise<void> {
  if (!nativeModule) return;
  await nativeModule.enterPresentationMode(landscape);
}

export async function exitNativePresentationMode(): Promise<void> {
  if (!nativeModule) return;
  await nativeModule.exitPresentationMode();
}

export async function getNativePresentationStatus(): Promise<SabiPresentationStatus> {
  if (!nativeModule) {
    return {
      nativeAvailable: false,
      displayCount: 1,
      presentationDisplayCount: 0,
      externalDisplayConnected: false,
      networkConnected: false,
      displays: [],
    };
  }

  return nativeModule.getPresentationStatus();
}

export async function getNativeWifiDirectStatus(): Promise<SabiWifiDirectStatus> {
  if (!nativeModule) return unavailableWifiStatus;
  return nativeModule.getWifiDirectStatus();
}

export async function requestNativeWifiDirectPermissions(): Promise<SabiWifiDirectStatus> {
  if (!nativeModule) return unavailableWifiStatus;
  return nativeModule.requestWifiDirectPermissions();
}

export async function scanNativeWifiDirectDevices(timeoutMs = 3500): Promise<SabiWifiDirectScanResult> {
  if (!nativeModule) {
    return {
      nativeAvailable: false,
      scanStarted: false,
      error: "native_module_unavailable",
      status: unavailableWifiStatus,
      devices: [],
    };
  }

  return nativeModule.scanWifiDirectDevices(timeoutMs);
}

export async function connectNativeWifiDirectDevice(deviceAddress: string): Promise<SabiWifiDirectConnectResult> {
  if (!nativeModule) {
    return {
      nativeAvailable: false,
      connectStarted: false,
      deviceAddress,
      error: "native_module_unavailable",
    };
  }

  return nativeModule.connectWifiDirectDevice(deviceAddress);
}
