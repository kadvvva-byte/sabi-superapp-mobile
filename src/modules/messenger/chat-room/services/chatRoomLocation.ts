import * as Location from "expo-location";

export type SabiChatRoomLocationPayload = {
  label?: string;
  address?: string;
  latitude: number;
  longitude: number;
  accuracy?: number | null;
  openUrl?: string;
  provider?: "yandex";
  live?: boolean;
  liveStartedAt?: string;
  liveUpdatedAt?: string;
  liveExpiresAt?: string;
};

export type SabiChatRoomResolvedLocation = {
  text: string;
  previewTitle: string;
  previewSubtitle: string;
  payload: SabiChatRoomLocationPayload;
};

function roundCoord(value: number): number {
  return Number(value.toFixed(6));
}

function buildYandexMapsOpenUrl(latitude: number, longitude: number): string {
  const lat = roundCoord(latitude);
  const lon = roundCoord(longitude);
  return `https://yandex.com/maps/?ll=${encodeURIComponent(`${lon},${lat}`)}&z=16&pt=${encodeURIComponent(`${lon},${lat},pm2rdm`)}`;
}

function resolvePosition(position: Location.LocationObject, live = false): SabiChatRoomResolvedLocation {
  const latitude = roundCoord(position.coords.latitude);
  const longitude = roundCoord(position.coords.longitude);
  const accuracy =
    typeof position.coords.accuracy === "number" && Number.isFinite(position.coords.accuracy)
      ? Math.round(position.coords.accuracy)
      : null;

  const previewTitle = live ? "📡" : "📍";
  const previewSubtitle = `${latitude}, ${longitude}`;
  const openUrl = buildYandexMapsOpenUrl(latitude, longitude);
  const now = new Date().toISOString();

  return {
    text: `${previewTitle} ${previewSubtitle}`,
    previewTitle,
    previewSubtitle,
    payload: {
      label: previewTitle,
      address: previewSubtitle,
      latitude,
      longitude,
      accuracy,
      openUrl,
      provider: "yandex",
      live,
      liveUpdatedAt: live ? now : undefined,
    },
  };
}

async function ensureForegroundLocationPermission(): Promise<void> {
  const permission = await Location.requestForegroundPermissionsAsync();

  if (permission.status !== "granted") {
    throw new Error("location_permission_denied");
  }
}

export async function resolveCurrentSabiChatLocation(): Promise<SabiChatRoomResolvedLocation> {
  await ensureForegroundLocationPermission();

  const position = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.Balanced,
  });

  return resolvePosition(position, false);
}

export async function watchSabiChatLiveLocation(
  onUpdate: (location: SabiChatRoomResolvedLocation) => void,
): Promise<{ remove: () => void }> {
  await ensureForegroundLocationPermission();

  return Location.watchPositionAsync(
    {
      accuracy: Location.Accuracy.Balanced,
      timeInterval: 15000,
      distanceInterval: 25,
    } as any,
    (position) => {
      onUpdate(resolvePosition(position, true));
    },
  );
}
