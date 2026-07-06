import type { SabiMapLocation, SabiMapViewport } from "../domain/sabiMap.types";

export const SABI_MAP_DEFAULT_LOCATION: SabiMapLocation = {
  latitude: 41.311081,
  longitude: 69.240562,
  addressLabel: "Текущая локация",
  city: "Tashkent",
};

export const SABI_MAP_PREVIEW_VIEWPORT: SabiMapViewport = {
  center: SABI_MAP_DEFAULT_LOCATION,
  provider: "sabi_preview",
  markers: [],
};
