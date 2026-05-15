export type HomeThemeMode = "brand" | "wallet" | "ai" | "messenger";

export type HomeLayoutMode = "grid" | "compact";

export type HomeRuntimeStatus = "idle" | "booting" | "ready" | "error";

export type HomeFiatCurrencyCode =
  | "USD"
  | "EUR"
  | "GBP"
  | "JPY"
  | "CNY"
  | "KRW"
  | "CHF"
  | "CAD"
  | "AUD"
  | "SGD"
  | "AED"
  | "TRY"
  | "RUB"
  | "INR"
  | "UZS";

export type HomeRate = {
  code: string;
  price: string;
  change: string;
};

export type HomeCardType = "widget" | "miniapp";

export type HomeCard = {
  id: string;
  title: string;
  type: HomeCardType;
  kind: string;
  visualKey?: string;
  removable?: boolean;
};

export type HomeDockKind = "call" | "chat" | "wallet" | "more";

export type HomeDockItem = {
  id: string;
  kind: HomeDockKind;
};

export type MiniAppCategory =
  | "core"
  | "tools"
  | "media"
  | "commerce"
  | "mobility"
  | "system"
  | (string & {});

export type MiniAppItem = {
  id: string;
  title: string;
  kind: string;
  subtitle?: string;
  category?: MiniAppCategory;
  visualKey?: string;
  route?: string;
  removable?: boolean;
  iconKey?: string;
  pinnedToHome?: boolean;
  enabled?: boolean;
};

export type HomeAccountSnapshot = {
  userId: string | null;
  fullName: string;
  username: string;
  sabiId: string;
  phone: string;
  avatarUri: string | null;
  avatarLetter: string;
  firstName?: string;
  lastName?: string;
};

export type HomePersistedState = {
  storageVersion?: number;
  ownerUserId?: string;
  updatedAt?: string;
  selectedFiat?: HomeFiatCurrencyCode;
  selectedCrypto?: string;
  hiddenCardIds?: string[];
  homeOrder?: string[];
  dockOrder?: string[];
  layoutMode?: HomeLayoutMode;
  pinnedMiniApps?: MiniAppItem[];
  themeMode?: HomeThemeMode;
  imageBackground?: string | null;
};

export type HomeKernelState = {
  isReady: boolean;
  runtimeStatus: HomeRuntimeStatus;
  lastError: string | null;
  settingsVisible: boolean;
  isEditMode: boolean;
  selectedFiat: HomeFiatCurrencyCode;
  selectedCrypto: string;
  hiddenCardIds: string[];
  homeOrder: string[];
  dockOrder: string[];
  layoutMode: HomeLayoutMode;
  pinnedMiniApps: MiniAppItem[];
  cards: HomeCard[];
  dockItems: HomeDockItem[];
  fiatRates: HomeRate[];
  cryptoRates: HomeRate[];
  themeMode: HomeThemeMode;
  imageBackground: string | null;
  backgroundType: string;
  themeLabel: string;
  account: HomeAccountSnapshot;
};

export type HomeKernelStoreListener = (state: HomeKernelState) => void;
