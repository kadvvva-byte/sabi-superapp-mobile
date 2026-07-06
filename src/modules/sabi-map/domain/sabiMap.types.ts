export type SabiMapProvider = "yandex_base" | "sabi_preview";

export type SabiMapLocation = {
  latitude: number;
  longitude: number;
  addressLabel: string;
  city?: string;
};

export type SabiMapMarkerKind =
  | "supermarket"
  | "grocery"
  | "household"
  | "household_chemicals"
  | "home_goods"
  | "mixed"
  | "alcohol_restricted"
  | "tobacco_restricted"
  | "taxi"
  | "wifi"
  | "hotel"
  | "delivery";

export type SabiMapMarkerStatus = "open" | "closing_soon" | "closed" | "pending";

export type SabiMapMarker = {
  id: string;
  kind: SabiMapMarkerKind;
  title: string;
  subtitle?: string;
  status: SabiMapMarkerStatus;
  rating?: number;
  likes?: number;
  distanceKm?: number;
  deliveryMinutes?: [number, number];
  x: number;
  y: number;
  verifiedBySabi: boolean;
  activeInSabi: boolean;
  deliveryRadiusKm?: number;
};

export type SabiMapViewport = {
  center: SabiMapLocation;
  provider: SabiMapProvider;
  markers: SabiMapMarker[];
};

export type SabiMapFilter = "nearest" | "open_now" | "fast_delivery" | "has_needed_products";
