import type { SabiMapFilter, SabiMapMarker } from "../domain/sabiMap.types";

export function getVisibleSabiMarkers(markers: SabiMapMarker[], filters: SabiMapFilter[]): SabiMapMarker[] {
  return markers
    .filter((marker) => marker.verifiedBySabi && marker.activeInSabi)
    .filter((marker) => {
      if (filters.includes("open_now") && marker.status !== "open" && marker.status !== "closing_soon") return false;
      if (filters.includes("fast_delivery")) {
        const max = marker.deliveryMinutes?.[1] ?? 999;
        if (max > 35) return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (filters.includes("nearest")) return (a.distanceKm ?? 999) - (b.distanceKm ?? 999);
      return (b.rating ?? 0) - (a.rating ?? 0);
    });
}

export function formatDeliveryWindow(minutes?: [number, number]): string {
  if (!minutes) return "—";
  return `${minutes[0]}–${minutes[1]} мин`;
}

export function formatDistanceKm(distance?: number): string {
  if (distance === undefined) return "—";
  if (distance < 1) return `${Math.round(distance * 1000)} м`;
  return `${distance.toFixed(1)} км`;
}
