import type { HomeCard, MiniAppCategory, MiniAppItem } from "../core/types";

export type SabiHomeWidgetStatus =
  | "ready"
  | "foundation_ready"
  | "provider_not_configured"
  | "coming_soon";

export type SabiHomeWidgetKind =
  | "messenger"
  | "wallet"
  | "sabipay"
  | "qr"
  | "cards"
  | "notifications"
  | "events"
  | "ai"
  | "gallery"
  | "game_center"
  | "marketplace"
  | "taxi"
  | "supermarket"
  | "food_delivery"
  | "wholesale_market"
  | "settings"
  | "cast";

export type SabiHomeWidgetDefinition = {
  id: string;
  kind: SabiHomeWidgetKind;
  title: string;
  subtitle: string;
  category: MiniAppCategory;
  route: string;
  pinnedToHome: boolean;
  enabled: boolean;
  status: SabiHomeWidgetStatus;
  removable: boolean;
  visualKey?: string;
  notificationHook?: string;
  aiEntry?: boolean;
};

export const SABI_HOME_WIDGET_REGISTRY: readonly SabiHomeWidgetDefinition[] = [
  {
    id: "messenger",
    kind: "messenger",
    title: "Sabi Messenger",
    subtitle: "",
    category: "core",
    route: "/tabs/chats",
    pinnedToHome: true,
    enabled: true,
    status: "ready",
    removable: true,
    notificationHook: "messenger",
  },
  {
    id: "wallet",
    kind: "wallet",
    title: "Sabi Wallet",
    subtitle: "",
    category: "core",
    route: "/wallet/home",
    pinnedToHome: true,
    enabled: true,
    status: "ready",
    removable: true,
    notificationHook: "wallet",
  },
  {
    id: "sabipay",
    kind: "sabipay",
    title: "Sabi Pay",
    subtitle: "",
    category: "core",
    route: "/wallet/send-internal",
    pinnedToHome: true,
    enabled: true,
    status: "ready",
    removable: true,
    notificationHook: "wallet",
  },
  {
    id: "qr",
    kind: "qr",
    title: "QR",
    subtitle: "",
    category: "tools",
    route: "/qr",
    pinnedToHome: true,
    enabled: true,
    status: "ready",
    removable: true,
    notificationHook: "qr",
  },
  {
    id: "cards",
    kind: "cards",
    title: "Cards",
    subtitle: "",
    category: "core",
    route: "/wallet/cards",
    pinnedToHome: true,
    enabled: true,
    status: "ready",
    removable: true,
    notificationHook: "wallet",
  },
  {
    id: "notifications",
    kind: "notifications",
    title: "Alerts",
    subtitle: "",
    category: "system",
    route: "/notifications",
    pinnedToHome: true,
    enabled: true,
    status: "foundation_ready",
    removable: true,
    notificationHook: "home_alerts",
  },
  {
    id: "events",
    kind: "events",
    title: "Events",
    subtitle: "",
    category: "system",
    route: "/events",
    pinnedToHome: true,
    enabled: true,
    status: "foundation_ready",
    removable: true,
    notificationHook: "events",
  },
  {
    id: "ai",
    kind: "ai",
    title: "Sabi AI",
    subtitle: "",
    category: "core",
    route: "/ai",
    pinnedToHome: true,
    enabled: true,
    status: "foundation_ready",
    removable: true,
    notificationHook: "ai",
    aiEntry: true,
  },
  {
    id: "gallery",
    kind: "gallery",
    title: "Gallery",
    subtitle: "",
    category: "media",
    route: "/gallery",
    pinnedToHome: true,
    enabled: true,
    status: "foundation_ready",
    removable: true,
  },
  {
    id: "game-center",
    kind: "game_center",
    title: "Game Center",
    subtitle: "",
    category: "media",
    route: "/network-game-center",
    pinnedToHome: true,
    enabled: true,
    status: "foundation_ready",
    removable: true,
  },
  {
    id: "marketplace",
    kind: "marketplace",
    title: "Marketplace",
    subtitle: "",
    category: "commerce",
    route: "/marketplace",
    pinnedToHome: true,
    enabled: true,
    status: "foundation_ready",
    removable: true,
    notificationHook: "marketplace",
  },
  {
    id: "taxi",
    kind: "taxi",
    title: "Taxi",
    subtitle: "",
    category: "mobility",
    route: "/taxi",
    pinnedToHome: false,
    enabled: true,
    status: "foundation_ready",
    removable: true,
    notificationHook: "taxi",
  },
  {
    id: "supermarket",
    kind: "supermarket",
    title: "Supermarket",
    subtitle: "",
    category: "commerce",
    route: "/supermarket",
    pinnedToHome: false,
    enabled: true,
    status: "foundation_ready",
    removable: true,
    notificationHook: "delivery",
  },
  {
    id: "food-delivery",
    kind: "food_delivery",
    title: "Food Delivery",
    subtitle: "",
    category: "commerce",
    route: "/food-delivery",
    pinnedToHome: false,
    enabled: true,
    status: "foundation_ready",
    removable: true,
    notificationHook: "delivery",
  },
  {
    id: "wholesale-market",
    kind: "wholesale_market",
    title: "Wholesale",
    subtitle: "",
    category: "commerce",
    route: "/wholesale-market",
    pinnedToHome: false,
    enabled: true,
    status: "foundation_ready",
    removable: true,
    notificationHook: "wholesale_market",
  },
  {
    id: "settings",
    kind: "settings",
    title: "Settings",
    subtitle: "",
    category: "system",
    route: "/mini-apps",
    pinnedToHome: false,
    enabled: true,
    status: "ready",
    removable: true,
  },
  {
    id: "cast",
    kind: "cast",
    title: "Wi-Fi Cast",
    subtitle: "",
    category: "tools",
    route: "/wifi-cast",
    pinnedToHome: false,
    enabled: true,
    status: "foundation_ready",
    removable: true,
  },
] as const;

const registryByKind = new Map<SabiHomeWidgetKind, SabiHomeWidgetDefinition>(
  SABI_HOME_WIDGET_REGISTRY.map((item) => [item.kind, item]),
);

function cloneDefinition(item: SabiHomeWidgetDefinition): SabiHomeWidgetDefinition {
  return { ...item };
}

export function getSabiHomeWidgetDefinition(kind: string) {
  return registryByKind.get(kind as SabiHomeWidgetKind) ?? null;
}

export function buildSabiHomeDefaultCards(): HomeCard[] {
  return SABI_HOME_WIDGET_REGISTRY.filter((item) => item.pinnedToHome).map((item) => ({
    id: `widget-${item.id}`,
    title: item.title,
    type: "widget",
    kind: item.kind,
    visualKey: item.visualKey ?? item.kind,
    removable: item.removable,
  }));
}

export function buildSabiHomeMiniApps(): MiniAppItem[] {
  return SABI_HOME_WIDGET_REGISTRY.map((item) => ({
    id: item.id,
    title: item.title,
    subtitle: item.subtitle,
    category: item.category,
    kind: item.kind,
    visualKey: item.visualKey ?? item.kind,
    route: item.route,
    pinnedToHome: item.pinnedToHome,
    enabled: item.enabled,
    removable: item.removable,
  }));
}

export function getSabiHomeWidgetRoute(kind: string): string | null {
  return getSabiHomeWidgetDefinition(kind)?.route ?? null;
}

export function getSabiHomePinnedDefinitions() {
  return SABI_HOME_WIDGET_REGISTRY.filter((item) => item.pinnedToHome).map(cloneDefinition);
}

export function getSabiHomeFoundationDefinitions() {
  return SABI_HOME_WIDGET_REGISTRY.map(cloneDefinition);
}

export function getSabiHomeSectionTitle(category: MiniAppCategory): string {
  switch (category) {
    case "core":
      return "Главные сервисы";
    case "tools":
      return "Инструменты";
    case "media":
      return "Медиа и игры";
    case "commerce":
      return "Торговля и доставка";
    case "mobility":
      return "Транспорт";
    case "system":
      return "Система";
    default:
      return "Дополнительно";
  }
}

export function getSabiHomeSectionSubtitle(category: MiniAppCategory): string {
  switch (category) {
    case "core":
      return "";
    case "tools":
      return "";
    case "media":
      return "";
    case "commerce":
      return "";
    case "mobility":
      return "";
    case "system":
      return "";
    default:
      return "";
  }
}
