import { MiniAppItem, MiniAppsSectionData } from "../types/miniApps.types";
import { isMiniAppKindVisibleForSabiPolicy } from "../../../../shared/policy/sabiMobilePolicy";

const MINI_APPS_ALL_SOURCE: MiniAppItem[] = [
  { id: "messenger", title: "Messenger", subtitle: "", category: "core", kind: "messenger", pinnedToHome: true, enabled: true, route: "/tabs/chats" },
  { id: "wallet", title: "Wallet", subtitle: "", category: "core", kind: "wallet", pinnedToHome: true, enabled: true, route: "/wallet/home" },
  { id: "qr", title: "QR", subtitle: "", category: "core", kind: "qr", pinnedToHome: true, enabled: true, route: "/qr" },
  { id: "notifications", title: "Alerts", subtitle: "", category: "core", kind: "notifications", visualKey: "notifications", pinnedToHome: true, enabled: true, route: "/notifications" },
  { id: "ai", title: "AI", subtitle: "", category: "core", kind: "ai", pinnedToHome: true, enabled: true, route: "/ai" },
  { id: "sabi-voice", title: "SABI Voice", subtitle: "", category: "core", kind: "ai_voice", visualKey: "ai_voice", pinnedToHome: true, enabled: true, route: "/ai/voice-control" },
  { id: "gallery", title: "Gallery", subtitle: "", category: "media", kind: "gallery", pinnedToHome: true, enabled: true, route: "/gallery" },
  { id: "network-games", title: "Game Center", subtitle: "", category: "media", kind: "games", visualKey: "games", pinnedToHome: true, enabled: true, route: "/network-game-center" },
  { id: "marketplace", title: "SilkRoad", subtitle: "", category: "commerce", kind: "marketplace", pinnedToHome: true, enabled: true, route: "/marketplace" },
  { id: "hotels", title: "Hotels", subtitle: "", category: "commerce", kind: "hotels", visualKey: "hotels", pinnedToHome: true, enabled: true, route: "/hotels" },
  { id: "supermarket", title: "Supermarket", subtitle: "", category: "commerce", kind: "supermarket", visualKey: "supermarket", pinnedToHome: true, enabled: true, route: "/supermarket" },
  { id: "food-delivery", title: "Food Delivery", subtitle: "", category: "commerce", kind: "food_delivery", visualKey: "food", enabled: true, route: "/food-delivery" },
  { id: "wholesale-market", title: "Wholesale", subtitle: "", category: "commerce", kind: "wholesale_market", visualKey: "wholesale", enabled: true, route: "/wholesale-market" },
  { id: "taxi", title: "Taxi", subtitle: "", category: "mobility", kind: "taxi", pinnedToHome: true, enabled: true, route: "/taxi" },
  { id: "delivery", title: "Delivery", subtitle: "", category: "mobility", kind: "delivery", visualKey: "delivery", enabled: true, route: "/delivery" },
  { id: "stream", title: "Stream", subtitle: "", category: "media", kind: "stream", visualKey: "stream", enabled: true, route: "/stream" },
  { id: "events", title: "Events", subtitle: "", category: "tools", kind: "events", visualKey: "events", enabled: true, route: "/events" },
  { id: "camera", title: "Camera", subtitle: "", category: "tools", kind: "camera", enabled: true, route: "/camera" },
  { id: "documents", title: "Documents", subtitle: "", category: "tools", kind: "documents", enabled: true, route: "/documents" },
  { id: "wifi-cast", title: "Wi‑Fi Cast", subtitle: "", category: "tools", kind: "cast", pinnedToHome: true, enabled: true, route: "/wifi-cast" },
  { id: "business", title: "Business", subtitle: "", category: "system", kind: "business", visualKey: "business", enabled: true, route: "/business" },
  { id: "merchant", title: "Merchant", subtitle: "", category: "system", kind: "merchant", visualKey: "merchant", enabled: true, route: "/merchant" },
  { id: "settings", title: "Settings", subtitle: "", category: "system", kind: "settings", enabled: true, route: "/mini-apps" },
  { id: "web", title: "Web", subtitle: "", category: "system", kind: "web", enabled: true, route: "/mini-apps/web" },
];

export const MINI_APPS_ALL: MiniAppItem[] = MINI_APPS_ALL_SOURCE.filter((item) => isMiniAppKindVisibleForSabiPolicy(item.kind));

export const MINI_APPS_SECTIONS: MiniAppsSectionData[] = [
  { id: "pinned", title: "Pinned", subtitle: "", items: MINI_APPS_ALL.filter((item) => item.pinnedToHome) },
  { id: "core", title: "Core services", subtitle: "", items: MINI_APPS_ALL.filter((item) => item.category === "core") },
  { id: "commerce", title: "Shopping and orders", subtitle: "", items: MINI_APPS_ALL.filter((item) => item.category === "commerce") },
  { id: "mobility", title: "Taxi and delivery", subtitle: "", items: MINI_APPS_ALL.filter((item) => item.category === "mobility") },
  { id: "media", title: "Media and content", subtitle: "", items: MINI_APPS_ALL.filter((item) => item.category === "media") },
  { id: "tools", title: "Tools", subtitle: "", items: MINI_APPS_ALL.filter((item) => item.category === "tools") },
  { id: "system", title: "System and business", subtitle: "", items: MINI_APPS_ALL.filter((item) => item.category === "system") },
];
