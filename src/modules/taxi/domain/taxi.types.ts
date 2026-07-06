export type TaxiLocale = "ru" | "en" | "uz" | "zh";

export type TaxiMode = "passenger" | "driver";
export type TaxiPassengerService = "ride" | "delivery";
export type TaxiTripKind = "city" | "intercity";
export type TaxiPassengerStage = "order" | "quote" | "search" | "live" | "history";
export type TaxiDriverStage = "balance" | "orders" | "navigation" | "documents";

export type TaxiRideTariffId = "economy" | "comfort" | "business" | "premium" | "intercity";
export type TaxiDeliveryTariffId = "delivery" | "courier" | "cargo" | "express";
export type TaxiTariffId = TaxiRideTariffId | TaxiDeliveryTariffId;

export type TaxiPointId =
  | "current"
  | "home"
  | "office"
  | "airport"
  | "station"
  | "market"
  | "hotel"
  | "restaurant"
  | "samarkand"
  | "bukhara";

export type TaxiVerificationStatus = "not_started" | "pending" | "approved" | "blocked";
export type TaxiDocumentStatus = "missing" | "pending" | "approved";
export type TaxiRuntimeStatus = "preview_only" | "locked_until_backend" | "ready_after_provider";

export interface TaxiPoint {
  id: TaxiPointId;
  titleKey: string;
  subtitleKey: string;
  distanceKm: number;
  intercity?: boolean;
}

export interface TaxiTariff {
  id: TaxiTariffId;
  service: TaxiPassengerService;
  titleKey: string;
  subtitleKey: string;
  priceCoin: number;
  etaMin: number;
  capacityLabelKey: string;
  recommended?: boolean;
  premium?: boolean;
  intercityReady?: boolean;
}

export interface TaxiRideOption {
  id: string;
  titleKey: string;
  subtitleKey: string;
}

export interface TaxiEstimate {
  from: TaxiPoint;
  to: TaxiPoint;
  tariff: TaxiTariff;
  tripKind: TaxiTripKind;
  distanceKm: number;
  durationMin: number;
  etaMin: number;
  quoteCoin: number;
  trafficLevel: "low" | "medium" | "high";
  averageSpeedKmh: number;
  driverCommissionCoin: number;
  driverNetCoin: number;
  runtimeStatus: TaxiRuntimeStatus;
}

export interface TaxiDriverOrder {
  id: string;
  service: TaxiPassengerService;
  fromKey: string;
  toKey: string;
  tariffId: TaxiTariffId;
  distanceKm: number;
  pickupMin: number;
  durationMin: number;
  quoteCoin: number;
  noteKey: string;
  trafficLevel: TaxiEstimate["trafficLevel"];
}

export interface TaxiDriverDocument {
  id: string;
  titleKey: string;
  descriptionKey: string;
  status: TaxiDocumentStatus;
}

export interface TaxiPassengerGate {
  allowed: boolean;
  reasonKey: string;
  kycRequired: boolean;
  walletRequired: boolean;
  providerRequired: boolean;
}

export interface TaxiDriverGate {
  onlineAllowed: boolean;
  acceptOrderAllowed: boolean;
  balanceTopUpRequired: boolean;
  reasonKey: string;
  verificationStatus: TaxiVerificationStatus;
  balanceCoin: number;
  minimumBalanceCoin: number;
  commissionRate: number;
  commissionPreviewCoin: number;
  netPreviewCoin: number;
}
