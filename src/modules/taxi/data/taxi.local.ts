import type { TaxiDriverDocument, TaxiDriverOrder, TaxiPoint, TaxiRideOption, TaxiTariff } from "../domain/taxi.types";

export const TAXI_ADMIN_COMMISSION_RATE_PREVIEW = 0.17; // fallback preview only; real rate is Admin-configured.
export const TAXI_DRIVER_COMMISSION_RATE = TAXI_ADMIN_COMMISSION_RATE_PREVIEW;
export const TAXI_DRIVER_BALANCE_COIN = 8;
export const TAXI_DRIVER_MINIMUM_BALANCE_COIN = 25;

export const taxiPoints: TaxiPoint[] = [
  { id: "current", titleKey: "point.current.title", subtitleKey: "point.current.subtitle", distanceKm: 0 },
  { id: "home", titleKey: "point.home.title", subtitleKey: "point.home.subtitle", distanceKm: 4.2 },
  { id: "office", titleKey: "point.office.title", subtitleKey: "point.office.subtitle", distanceKm: 5.4 },
  { id: "airport", titleKey: "point.airport.title", subtitleKey: "point.airport.subtitle", distanceKm: 13.6 },
  { id: "station", titleKey: "point.station.title", subtitleKey: "point.station.subtitle", distanceKm: 6.1 },
  { id: "market", titleKey: "point.market.title", subtitleKey: "point.market.subtitle", distanceKm: 7.7 },
  { id: "hotel", titleKey: "point.hotel.title", subtitleKey: "point.hotel.subtitle", distanceKm: 3.8 },
  { id: "restaurant", titleKey: "point.restaurant.title", subtitleKey: "point.restaurant.subtitle", distanceKm: 2.6 },
  { id: "samarkand", titleKey: "point.samarkand.title", subtitleKey: "point.samarkand.subtitle", distanceKm: 306, intercity: true },
  { id: "bukhara", titleKey: "point.bukhara.title", subtitleKey: "point.bukhara.subtitle", distanceKm: 575, intercity: true },
];

export const rideTariffs: TaxiTariff[] = [
  { id: "economy", service: "ride", titleKey: "tariff.economy.title", subtitleKey: "tariff.economy.subtitle", priceCoin: 14, etaMin: 2, capacityLabelKey: "capacity.four" },
  { id: "comfort", service: "ride", titleKey: "tariff.comfort.title", subtitleKey: "tariff.comfort.subtitle", priceCoin: 22, etaMin: 3, capacityLabelKey: "capacity.four", recommended: true },
  { id: "business", service: "ride", titleKey: "tariff.business.title", subtitleKey: "tariff.business.subtitle", priceCoin: 38, etaMin: 6, capacityLabelKey: "capacity.four", premium: true },
  { id: "premium", service: "ride", titleKey: "tariff.premium.title", subtitleKey: "tariff.premium.subtitle", priceCoin: 58, etaMin: 8, capacityLabelKey: "capacity.premium", premium: true },
  { id: "intercity", service: "ride", titleKey: "tariff.intercity.title", subtitleKey: "tariff.intercity.subtitle", priceCoin: 220, etaMin: 18, capacityLabelKey: "capacity.intercity", premium: true, intercityReady: true },
];

export const deliveryTariffs: TaxiTariff[] = [
  { id: "delivery", service: "delivery", titleKey: "delivery.delivery.title", subtitleKey: "delivery.delivery.subtitle", priceCoin: 12, etaMin: 5, capacityLabelKey: "capacity.package", recommended: true },
  { id: "courier", service: "delivery", titleKey: "delivery.courier.title", subtitleKey: "delivery.courier.subtitle", priceCoin: 16, etaMin: 4, capacityLabelKey: "capacity.package" },
  { id: "cargo", service: "delivery", titleKey: "delivery.cargo.title", subtitleKey: "delivery.cargo.subtitle", priceCoin: 30, etaMin: 9, capacityLabelKey: "capacity.box" },
  { id: "express", service: "delivery", titleKey: "delivery.express.title", subtitleKey: "delivery.express.subtitle", priceCoin: 26, etaMin: 3, capacityLabelKey: "capacity.urgent", premium: true },
];

export const rideOptions: TaxiRideOption[] = [
  { id: "quiet", titleKey: "option.quiet.title", subtitleKey: "option.quiet.subtitle" },
  { id: "childSeat", titleKey: "option.childSeat.title", subtitleKey: "option.childSeat.subtitle" },
  { id: "baggage", titleKey: "option.baggage.title", subtitleKey: "option.baggage.subtitle" },
  { id: "pet", titleKey: "option.pet.title", subtitleKey: "option.pet.subtitle" },
  { id: "fastPickup", titleKey: "option.fastPickup.title", subtitleKey: "option.fastPickup.subtitle" },
];

export const deliveryOptions: TaxiRideOption[] = [
  { id: "recipient", titleKey: "delivery.option.recipient.title", subtitleKey: "delivery.option.recipient.subtitle" },
  { id: "photo", titleKey: "delivery.option.photo.title", subtitleKey: "delivery.option.photo.subtitle" },
  { id: "fragile", titleKey: "delivery.option.fragile.title", subtitleKey: "delivery.option.fragile.subtitle" },
  { id: "door", titleKey: "delivery.option.door.title", subtitleKey: "delivery.option.door.subtitle" },
  { id: "thermal", titleKey: "delivery.option.thermal.title", subtitleKey: "delivery.option.thermal.subtitle" },
];

export const driverOrders: TaxiDriverOrder[] = [
  {
    id: "taxi-order-preview-1",
    service: "ride",
    fromKey: "point.hotel.title",
    toKey: "point.airport.title",
    tariffId: "comfort",
    distanceKm: 12.8,
    pickupMin: 3,
    durationMin: 24,
    quoteCoin: 22,
    trafficLevel: "medium",
    noteKey: "driver.order.note.ride",
  },
  {
    id: "taxi-order-preview-2",
    service: "delivery",
    fromKey: "point.restaurant.title",
    toKey: "point.home.title",
    tariffId: "delivery",
    distanceKm: 4.9,
    pickupMin: 2,
    durationMin: 17,
    quoteCoin: 12,
    trafficLevel: "low",
    noteKey: "driver.order.note.delivery",
  },
];

export const driverDocuments: TaxiDriverDocument[] = [
  { id: "kyc", titleKey: "doc.kyc.title", descriptionKey: "doc.kyc.description", status: "approved" },
  { id: "license", titleKey: "doc.license.title", descriptionKey: "doc.license.description", status: "pending" },
  { id: "car", titleKey: "doc.car.title", descriptionKey: "doc.car.description", status: "pending" },
  { id: "insurance", titleKey: "doc.insurance.title", descriptionKey: "doc.insurance.description", status: "missing" },
  { id: "admin", titleKey: "doc.admin.title", descriptionKey: "doc.admin.description", status: "pending" },
];
