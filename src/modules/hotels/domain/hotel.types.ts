export type HotelLocale = "ru" | "en" | "uz" | "zh" | "tg" | "ky" | "kk" | "tr" | "ar";

export type HotelTab = "home" | "search" | "request" | "profile";

export type HotelStayType = "business" | "family" | "premium" | "boutique" | "resort";

export type HotelAmenity =
  | "wifi"
  | "breakfast"
  | "parking"
  | "airport"
  | "spa"
  | "pool"
  | "family"
  | "business"
  | "cityCenter"
  | "mountain";

export type HotelApprovalStatus = "approved" | "pending" | "provider_pending";

export type HotelPaymentStatus = "merchant_pending" | "wallet_pending" | "coin_ready_later";

export type HotelRoomId =
  | "standard_city"
  | "business_plus"
  | "family_suite"
  | "premium_suite"
  | "boutique_room"
  | "resort_villa";

export type HotelPropertyId =
  | "sabi_grand_tashkent"
  | "silk_city_business"
  | "family_garden_hotel"
  | "old_city_boutique"
  | "mountain_air_lodge";

export type HotelPhotoKey =
  | "city_hotel"
  | "lobby"
  | "business_room"
  | "suite_room"
  | "family_room"
  | "resort"
  | "boutique"
  | "mountain_lodge";

export type HotelRoom = {
  id: HotelRoomId;
  titleKey: string;
  subtitleKey: string;
  photoKey: HotelPhotoKey;
  capacityAdults: number;
  capacityChildren: number;
  bedKey: string;
  policyKey: string;
  termsKey: string;
  priceKey: string;
  availablePreview: boolean;
};

export type HotelProperty = {
  id: HotelPropertyId;
  titleKey: string;
  cityKey: string;
  areaKey: string;
  type: HotelStayType;
  heroPhotoKey: HotelPhotoKey;
  ratingLabel: string;
  distanceLabelKey: string;
  travelTimeKey: string;
  amenities: HotelAmenity[];
  approvalStatus: HotelApprovalStatus;
  paymentStatus: HotelPaymentStatus;
  rooms: HotelRoom[];
  messengerRoute: string;
  streamRoute: string;
  profileRoute: string;
};

export type HotelSearchFilters = {
  cityQuery: string;
  datesLabel: string;
  guests: number;
  rooms: number;
  stayType: HotelStayType | "all";
};

export type HotelRequestDraft = {
  hotelId: HotelPropertyId | null;
  roomId: HotelRoomId | null;
  guests: number;
  rooms: number;
  datesLabel: string;
  note: string;
};

export type HotelBookingGate = {
  bookingAllowed: boolean;
  paymentAllowed: boolean;
  providerConnected: boolean;
  merchantReady: boolean;
  blockedReasonKey: string;
};
