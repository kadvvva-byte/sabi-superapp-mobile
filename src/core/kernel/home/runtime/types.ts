import type {
  HomeAccountSnapshot,
  HomeCard,
  HomeDockItem,
  HomeFiatCurrencyCode,
  HomeKernelState,
  HomePersistedState,
  HomeRate,
  HomeThemeMode,
  MiniAppItem,
} from "../core/types";

export const HOME_KERNEL_STORAGE_KEY = "sabi.home.kernel.state.v1";
export const HOME_KERNEL_STORAGE_VERSION = 3;
export const LEGACY_HOME_BACKGROUND_KEY = "sabi_home_background";

export const DEFAULT_HOME_ACCOUNT: HomeAccountSnapshot = {
  userId: null,
  fullName: "Sabi User",
  username: "@sabi",
  sabiId: "SB0000000000",
  phone: "",
  avatarUri: null,
  avatarLetter: "S",
  firstName: "Sabi",
  lastName: "User",
};

export const DEFAULT_HOME_CARDS: HomeCard[] = [
  { id: "widget-messenger", title: "Messenger", type: "widget", kind: "messenger", removable: true },
  { id: "widget-sabipay", title: "SabiPay", type: "widget", kind: "sabipay", removable: true },
  { id: "widget-qr", title: "QR", type: "widget", kind: "qr", removable: true },
  { id: "widget-cards", title: "Cards", type: "widget", kind: "cards", removable: true },
  { id: "widget-notifications", title: "Alerts", type: "widget", kind: "notifications", removable: true },
  { id: "widget-ai", title: "AI", type: "widget", kind: "ai", removable: true },
  { id: "widget-ai-voice", title: "SABI Voice", type: "widget", kind: "ai_voice", visualKey: "ai_voice", removable: true },
  { id: "widget-gallery", title: "Gallery", type: "widget", kind: "gallery", removable: true },
  { id: "widget-games", title: "Game Center", type: "widget", kind: "games", removable: true },
  { id: "widget-marketplace", title: "Marketplace", type: "widget", kind: "marketplace", removable: true },
  { id: "widget-supermarket", title: "Supermarket", type: "widget", kind: "supermarket", removable: true },
  { id: "widget-hotels", title: "Hotels", type: "widget", kind: "hotels", visualKey: "hotels", removable: true },
  { id: "widget-food-delivery", title: "Food", type: "widget", kind: "food_delivery", visualKey: "food", removable: true },
  { id: "widget-wholesale-market", title: "Wholesale", type: "widget", kind: "wholesale_market", visualKey: "wholesale", removable: true },
  { id: "widget-taxi", title: "Taxi", type: "widget", kind: "taxi", removable: true },
  { id: "widget-stream", title: "Stream", type: "widget", kind: "stream", removable: true },
  { id: "widget-events", title: "Events", type: "widget", kind: "events", removable: true },
  { id: "widget-settings", title: "Settings", type: "widget", kind: "settings", removable: true },
  { id: "widget-cast", title: "Wi‑Fi Cast", type: "widget", kind: "cast", removable: true },
];

export const DEFAULT_HOME_ORDER = DEFAULT_HOME_CARDS.map((item) => item.id);

export const DEFAULT_DOCK_ITEMS: HomeDockItem[] = [
  { id: "dock-call", kind: "call" },
  { id: "dock-chat", kind: "chat" },
  { id: "dock-wallet", kind: "wallet" },
  { id: "dock-more", kind: "more" },
];

export const DEFAULT_PINNED_MINI_APPS: MiniAppItem[] = [];

export const SUPPORTED_HOME_FIAT_CODES: HomeFiatCurrencyCode[] = [
  "USD", "EUR", "GBP", "JPY", "CNY", "KRW", "CHF", "CAD", "AUD", "SGD", "AED", "TRY", "RUB", "INR", "UZS",
];

export const SUPPORTED_HOME_CRYPTO_CODES = [
  "BTC", "ETH", "SOL", "BNB", "XRP", "ADA", "DOGE", "TON", "TRX", "DOT", "AVAX", "USDT",
] as const;

export const DEFAULT_FIAT_RATES: HomeRate[] = SUPPORTED_HOME_FIAT_CODES.map((code) => ({ code, price: "—", change: "—" }));

export const DEFAULT_CRYPTO_RATES: HomeRate[] = SUPPORTED_HOME_CRYPTO_CODES.map((code) => ({ code, price: "—", change: "—" }));

export type HomeRuntimeStorage = Pick<
  typeof import("@react-native-async-storage/async-storage").default,
  "getItem" | "setItem" | "removeItem"
>;

function normalizeString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export function isShareableHomeBackgroundUri(value: unknown): value is string {
  const normalized = normalizeString(value).toLowerCase();
  return (
    normalized.startsWith("file://") ||
    normalized.startsWith("http://") ||
    normalized.startsWith("https://") ||
    normalized.startsWith("data:image/")
  );
}

function uniqueStrings(items: unknown[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  items.forEach((item) => {
    const value = normalizeString(item);
    if (!value || seen.has(value)) return;
    seen.add(value);
    result.push(value);
  });

  return result;
}

export function resolveThemeLabel(themeMode: HomeThemeMode): string {
  switch (themeMode) {
    case "wallet":
      return "Wallet";
    case "ai":
      return "AI";
    case "messenger":
      return "Messenger";
    default:
      return "Sabi";
  }
}

export function resolveBackgroundType(imageBackground: string | null, themeMode: HomeThemeMode): string {
  return imageBackground ? "Custom background" : resolveThemeLabel(themeMode);
}

export function cloneMiniApps(items: MiniAppItem[]): MiniAppItem[] {
  return items.map((item) => ({ ...item }));
}

function normalizeMiniAppItem(value: unknown): MiniAppItem | null {
  if (!value || typeof value !== "object") return null;
  const source = value as Record<string, unknown>;
  const id = normalizeString(source.id);
  const title = normalizeString(source.title);
  const kind = normalizeString(source.kind);

  if (!id || !title || !kind) return null;

  return {
    id,
    title,
    kind,
    ...(normalizeString(source.subtitle) ? { subtitle: normalizeString(source.subtitle) } : {}),
    ...(normalizeString(source.category) ? { category: normalizeString(source.category) } : {}),
    ...(normalizeString(source.visualKey) ? { visualKey: normalizeString(source.visualKey) } : {}),
    ...(normalizeString(source.route) ? { route: normalizeString(source.route) } : {}),
    ...(normalizeString(source.iconKey) ? { iconKey: normalizeString(source.iconKey) } : {}),
    ...(typeof source.removable === "boolean" ? { removable: source.removable } : {}),
    ...(typeof source.pinnedToHome === "boolean" ? { pinnedToHome: source.pinnedToHome } : {}),
    ...(typeof source.enabled === "boolean" ? { enabled: source.enabled } : {}),
  };
}

export function normalizeMiniApps(value: unknown): MiniAppItem[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const seen = new Set<string>();
  const result: MiniAppItem[] = [];

  value.forEach((item) => {
    const app = normalizeMiniAppItem(item);
    if (!app || seen.has(app.id)) return;
    seen.add(app.id);
    result.push(app);
  });

  return result;
}

export function normalizeHomePersistedState(value: unknown): HomePersistedState {
  const source = value && typeof value === "object" ? (value as Record<string, unknown>) : {};
  const selectedFiat = normalizeString(source.selectedFiat);
  const selectedCrypto = normalizeString(source.selectedCrypto);
  const themeMode = normalizeString(source.themeMode);
  const imageBackgroundRaw = source.imageBackground;

  return {
    storageVersion: typeof source.storageVersion === "number" ? source.storageVersion : undefined,
    ownerUserId: normalizeString(source.ownerUserId) || undefined,
    updatedAt: normalizeString(source.updatedAt) || undefined,
    selectedFiat: SUPPORTED_HOME_FIAT_CODES.includes(selectedFiat as HomeFiatCurrencyCode)
      ? (selectedFiat as HomeFiatCurrencyCode)
      : undefined,
    selectedCrypto: selectedCrypto || undefined,
    hiddenCardIds: Array.isArray(source.hiddenCardIds) ? uniqueStrings(source.hiddenCardIds) : undefined,
    homeOrder: Array.isArray(source.homeOrder) ? uniqueStrings(source.homeOrder) : undefined,
    dockOrder: Array.isArray(source.dockOrder) ? uniqueStrings(source.dockOrder) : undefined,
    layoutMode: source.layoutMode === "compact" ? "compact" : source.layoutMode === "grid" ? "grid" : undefined,
    pinnedMiniApps: normalizeMiniApps(source.pinnedMiniApps),
    themeMode: ["brand", "wallet", "ai", "messenger"].includes(themeMode)
      ? (themeMode as HomeThemeMode)
      : undefined,
    imageBackground:
      typeof imageBackgroundRaw === "string"
        ? isShareableHomeBackgroundUri(imageBackgroundRaw)
          ? normalizeString(imageBackgroundRaw)
          : null
        : imageBackgroundRaw === null
          ? null
          : undefined,
  };
}

export function buildHomeCards(miniApps: MiniAppItem[]): HomeCard[] {
  const staticKinds = new Set(DEFAULT_HOME_CARDS.map((item) => item.kind));
  const miniCards: HomeCard[] = miniApps
    .filter((app) => !staticKinds.has(app.kind))
    .map((app) => ({
      id: `miniapp-${app.id}`,
      title: app.title,
      type: "miniapp",
      kind: app.kind,
      visualKey: app.visualKey,
      removable: app.removable !== false,
    }));
  return [...DEFAULT_HOME_CARDS, ...miniCards];
}

export function normalizeHomeOrder(order: unknown[] | undefined, cards: HomeCard[], hiddenCardIds: string[]): string[] {
  const allCardIds = cards.map((item) => item.id);
  const visibleCardIds = allCardIds.filter((id) => !hiddenCardIds.includes(id));
  const candidate = uniqueStrings(order ?? []).filter((id) => visibleCardIds.includes(id));
  const missing = visibleCardIds.filter((id) => !candidate.includes(id));
  return [...candidate, ...missing];
}

export function normalizeDockOrder(order: unknown[] | undefined, dockItems: HomeDockItem[] = DEFAULT_DOCK_ITEMS): string[] {
  const allDockIds = dockItems.map((item) => item.id);
  const candidate = uniqueStrings(order ?? []).filter((id) => allDockIds.includes(id));
  const missing = allDockIds.filter((id) => !candidate.includes(id));
  return [...candidate, ...missing];
}

export function toPersistedHomeState(state: HomeKernelState): HomePersistedState {
  return {
    storageVersion: HOME_KERNEL_STORAGE_VERSION,
    ownerUserId: state.account.userId ?? undefined,
    updatedAt: new Date().toISOString(),
    selectedFiat: state.selectedFiat,
    selectedCrypto: state.selectedCrypto,
    hiddenCardIds: [...state.hiddenCardIds],
    homeOrder: [...state.homeOrder],
    dockOrder: [...state.dockOrder],
    layoutMode: state.layoutMode,
    pinnedMiniApps: cloneMiniApps(state.pinnedMiniApps),
    themeMode: state.themeMode,
    imageBackground: isShareableHomeBackgroundUri(state.imageBackground) ? state.imageBackground : null,
  };
}
