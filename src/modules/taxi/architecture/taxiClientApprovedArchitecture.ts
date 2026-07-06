export type TaxiClientApprovedScreenId =
  | "entry_home"
  | "destination_search"
  | "saved_addresses"
  | "map_mode"
  | "tariffs"
  | "ride_preferences"
  | "order_details"
  | "searching_driver"
  | "driver_found"
  | "driver_delayed"
  | "driver_arrived"
  | "trip_started"
  | "trip_stop_waiting"
  | "change_address_trip"
  | "live_navigation"
  | "road_safety_overlay"
  | "client_profile"
  | "completion_rating"
  | "sabi_stars_contest"
  | "driver_chat"
  | "driver_call"
  | "sos"
  | "cancel_reason"
  | "trip_history_receipts"
  | "day_night_map"
  | "auto_lighting"
  | "delivery_order"
  | "cargo_order"
  | "intercity_order"
  | "active_order_details"
  | "share_trip_sabi"
  | "receipt_shield"
  | "payment_wallet_bridge"
  | "edit_profile"
  | "kyc_status"
  | "invite_referral"
  | "help_center"
  | "delivery_hub"
  | "business_control_hooks"
  | "future_environment_info";

export type TaxiClientImplementationStatus =
  | "missing"
  | "partial"
  | "implemented_or_scaffolded";

export const TAXI_CLIENT_APPROVED_FLOW: TaxiClientApprovedScreenId[] = [
  "entry_home",
  "destination_search",
  "saved_addresses",
  "map_mode",
  "tariffs",
  "ride_preferences",
  "order_details",
  "searching_driver",
  "driver_found",
  "driver_delayed",
  "driver_arrived",
  "trip_started",
  "trip_stop_waiting",
  "change_address_trip",
  "live_navigation",
  "road_safety_overlay",
  "client_profile",
  "completion_rating",
  "sabi_stars_contest",
  "driver_chat",
  "driver_call",
  "sos",
  "cancel_reason",
  "trip_history_receipts",
  "day_night_map",
  "auto_lighting",
  "delivery_order",
  "cargo_order",
  "intercity_order",
  "active_order_details",
  "share_trip_sabi",
  "receipt_shield",
  "payment_wallet_bridge",
  "edit_profile",
  "kyc_status",
  "invite_referral",
  "help_center",
  "delivery_hub",
  "business_control_hooks",
  "future_environment_info",
];

export const TAXI_CLIENT_TEXT_POLICY = {
  reportsAndMatrixAsciiOnly: true,
  uiTextOnlyFromI18n25: true,
  noMojibakeAllowed: true,
  noMixedHardcodedUiLanguage: true,
  globalProfileLanguageOnly: true,
  everyNewUiTextMustExistIn25Languages: true,
} as const;

export const TAXI_CLIENT_APPROVED_GUARDRAILS = {
  taxiClientOnly: true,
  noGoAgentInsideTaxiClient: true,
  noSeparateTaxiWallet: true,
  globalWalletOnly: true,
  globalKycOnly: true,
  noFakeDrivers: true,
  noFakeSuccess: true,
  staticMapPreviewUntilFinalBuild: true,
  liveMapFinalBuildOnly: true,
  weatherUvAirLater: true,
} as const;
