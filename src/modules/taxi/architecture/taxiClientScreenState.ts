export type TaxiClientScreen =
  | "program_entry"
  | "entry_home"
  | "destination_search"
  | "saved_addresses"
  | "map_mode"
  | "tariffs"
  | "ride_preferences"
  | "order_details"
  | "searching_driver";

export const TAXI_CLIENT_SCREEN_ORDER: TaxiClientScreen[] = [
  "program_entry",
  "entry_home",
  "destination_search",
  "saved_addresses",
  "map_mode",
  "tariffs",
  "ride_preferences",
  "order_details",
  "searching_driver",
];

export const TAXI_CLIENT_SCREEN_RULES = {
  noTaxiLanguageSelector: true,
  languageFromGlobalSabiProfileOnly: true,
  everyNewTextMustExistIn25Languages: true,
  noFakeDriver: true,
  noFakeSuccess: true,
  staticMapPreviewUntilFinalBuild: true,
  liveMapFinalBuildOnly: true,
  globalWalletOnly: true,
  globalKycOnly: true,
} as const;
