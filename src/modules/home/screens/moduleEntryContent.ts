import type { SabiHomeProgramCode } from "../programs/programFoundation.types";

export type SabiModuleEntryCode =
  | "marketplace"
  | "wholesale"
  | "supermarket"
  | "hotels"
  | "food"
  | "taxi"
  | "delivery"
  | "stream"
  | "events"
  | "notifications"
  | "games"
  | "business"
  | "merchant"
  | "documents"
  | "camera"
  | "cast";

export type SabiModuleLocale = "en" | "ru" | "uz";

export type SabiModuleActionContent = {
  label: string;
  route: string;
  tone?: "primary" | "secondary";
};

export type SabiModuleEntryContent = {
  icon: SabiModuleEntryCode;
  programCode: SabiHomeProgramCode;
  title: string;
  subtitle: string;
  stage: string;
  description: string;
  statuses: { label: string; value: string }[];
  policyNotes: string[];
  actions: SabiModuleActionContent[];
};

export function resolveSabiModuleLocale(language?: string | null): SabiModuleLocale {
  const normalized = String(language || "").trim().toLowerCase();
  if (normalized.startsWith("ru")) return "ru";
  if (normalized.startsWith("uz")) return "uz";
  return "en";
}

type ModuleSeed = {
  title: string;
  route: string;
  icon: SabiModuleEntryCode;
  programCode: SabiHomeProgramCode;
};

const MODULE_SEEDS: Record<SabiModuleEntryCode, ModuleSeed> = {
  marketplace: { title: "SilkRoad", route: "/marketplace", icon: "marketplace", programCode: "marketplace" },
  wholesale: { title: "Wholesale Market", route: "/wholesale-market", icon: "wholesale", programCode: "wholesale_market" },
  supermarket: { title: "Supermarket", route: "/supermarket", icon: "supermarket", programCode: "supermarket" },
  hotels: { title: "Hotels", route: "/hotels", icon: "hotels", programCode: "hotels" },
  food: { title: "Food Delivery", route: "/food-delivery", icon: "food", programCode: "food_delivery" },
  taxi: { title: "Taxi", route: "/taxi", icon: "taxi", programCode: "taxi" },
  delivery: { title: "Delivery", route: "/delivery", icon: "delivery", programCode: "delivery" },
  stream: { title: "Stream", route: "/stream", icon: "stream", programCode: "stream" },
  events: { title: "Events", route: "/events", icon: "events", programCode: "events" },
  notifications: { title: "Alerts", route: "/notifications", icon: "notifications", programCode: "notifications" },
  games: { title: "Game Center", route: "/network-game-center", icon: "games", programCode: "network_game_center" },
  business: { title: "Business", route: "/business", icon: "business", programCode: "business" },
  merchant: { title: "Merchant", route: "/merchant", icon: "merchant", programCode: "merchant" },
  documents: { title: "Documents", route: "/documents", icon: "documents", programCode: "documents" },
  camera: { title: "Camera", route: "/camera", icon: "camera", programCode: "gallery" },
  cast: { title: "Wi‑Fi Cast", route: "/wifi-cast", icon: "cast", programCode: "wifi_cast" },
};

const UI = {
  stage: {
    en: "Ready",
    ru: "Готово",
    uz: "Tayyor",
  },
  statusRoute: { en: "Route", ru: "Route", uz: "Route" },
  statusFoundation: { en: "Foundation", ru: "Основа", uz: "Asos" },
  statusProvider: { en: "Provider/API", ru: "Provider/API", uz: "Provider/API" },
  statusReady: { en: "Connected", ru: "Подключено", uz: "Ulangan" },
  statusProviderValue: { en: "Required", ru: "Требуется", uz: "Kerak" },
  actionHome: { en: "Home", ru: "Home", uz: "Home" },
};

export function getSabiModuleEntryContent(code: SabiModuleEntryCode, language?: string | null): SabiModuleEntryContent {
  const locale = resolveSabiModuleLocale(language);
  const seed = MODULE_SEEDS[code];

  return {
    icon: seed.icon,
    programCode: seed.programCode,
    title: seed.title,
    subtitle: "",
    stage: UI.stage[locale],
    description: "",
    statuses: [
      { label: UI.statusRoute[locale], value: seed.route },
      { label: UI.statusFoundation[locale], value: UI.statusReady[locale] },
      { label: UI.statusProvider[locale], value: UI.statusProviderValue[locale] },
    ],
    policyNotes: [],
    actions: [
      { label: UI.actionHome[locale], route: "/", tone: "primary" },
    ],
  };
}

export function getSabiModuleSectionLabels(language?: string | null) {
  const locale = resolveSabiModuleLocale(language);
  return {
    connection: { en: "Status", ru: "Статус", uz: "Holat" }[locale],
    eyebrow: { en: "Sabi", ru: "Sabi", uz: "Sabi" }[locale],
    loading: { en: "Loading", ru: "Загрузка", uz: "Yuklanmoqda" }[locale],
  };
}
