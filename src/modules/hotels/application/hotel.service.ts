import { HOTEL_PROPERTIES } from "../data/hotel.local";
import type { HotelBookingGate, HotelProperty, HotelPropertyId, HotelRoomId, HotelSearchFilters, HotelStayType } from "../domain/hotel.types";

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

export function getHotelProperties(): HotelProperty[] {
  return HOTEL_PROPERTIES;
}

export function findHotelProperty(id: HotelPropertyId | null | undefined): HotelProperty | undefined {
  if (!id) return undefined;
  return HOTEL_PROPERTIES.find((hotel) => hotel.id === id);
}

export function findHotelRoom(hotel: HotelProperty | undefined, roomId: HotelRoomId | null | undefined) {
  if (!hotel || !roomId) return undefined;
  return hotel.rooms.find((room) => room.id === roomId);
}

export function searchHotelProperties(filters: HotelSearchFilters): HotelProperty[] {
  const cityQuery = normalize(filters.cityQuery);

  return HOTEL_PROPERTIES.filter((hotel) => {
    const typeMatches = filters.stayType === "all" || hotel.type === filters.stayType;
    const queryMatches = !cityQuery || [hotel.titleKey, hotel.cityKey, hotel.areaKey, hotel.type].join(" ").toLowerCase().includes(cityQuery);
    return typeMatches && queryMatches;
  });
}

export function buildHotelBookingGate(hotel: HotelProperty | undefined): HotelBookingGate {
  if (!hotel) {
    return {
      bookingAllowed: false,
      paymentAllowed: false,
      providerConnected: false,
      merchantReady: false,
      blockedReasonKey: "gate.selectHotel",
    };
  }

  if (hotel.approvalStatus !== "approved") {
    return {
      bookingAllowed: false,
      paymentAllowed: false,
      providerConnected: false,
      merchantReady: false,
      blockedReasonKey: "gate.hotelApprovalPending",
    };
  }

  if (hotel.paymentStatus !== "coin_ready_later") {
    return {
      bookingAllowed: false,
      paymentAllowed: false,
      providerConnected: true,
      merchantReady: false,
      blockedReasonKey: "gate.merchantPending",
    };
  }

  return {
    bookingAllowed: true,
    paymentAllowed: true,
    providerConnected: true,
    merchantReady: true,
    blockedReasonKey: "gate.ready",
  };
}

export function getHotelStayTypes(): Array<HotelStayType | "all"> {
  return ["all", "business", "family", "premium", "boutique", "resort"];
}
