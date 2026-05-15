import {
  getHomeKernelState,
  patchHomeKernelState,
  resetHomeKernelState,
  subscribeHomeKernelStore,
} from "./core/store";
import {
  selectHomeAccount,
  selectHomeBackgroundType,
  selectHomeCards,
  selectHomeCryptoRates,
  selectHomeDockItems,
  selectHomeDockOrder,
  selectHomeEditMode,
  selectHomeFiatRates,
  selectHomeHiddenCardIds,
  selectHomeImageBackground,
  selectHomeKernelLastError,
  selectHomeKernelReady,
  selectHomeKernelRuntimeStatus,
  selectHomeLayoutMode,
  selectHomeOrderedCards,
  selectHomeOrderedDockItems,
  selectHomePinnedMiniApps,
  selectHomeSelectedCrypto,
  selectHomeSelectedFiat,
  selectHomeSettingsVisible,
  selectHomeThemeLabel,
  selectHomeThemeMode,
  selectHomeVisibleCards,
  selectHomeHiddenCards,
} from "./core/selectors";
import type {
  HomeFiatCurrencyCode,
  HomeKernelStoreListener,
  HomeThemeMode,
  MiniAppItem,
} from "./core/types";
import {
  bootHomeKernelRuntime,
  persistHomeKernelRuntime,
  refreshHomeKernelAccount,
} from "./runtime/service";
import {
  DEFAULT_DOCK_ITEMS,
  DEFAULT_HOME_ORDER,
  SUPPORTED_HOME_FIAT_CODES,
  buildHomeCards,
  cloneMiniApps,
  normalizeDockOrder,
  normalizeHomeOrder,
  normalizeMiniApps,
  resolveBackgroundType,
  resolveThemeLabel,
} from "./runtime/types";

async function patchAndPersist(patch: Parameters<typeof patchHomeKernelState>[0]) {
  const next = patchHomeKernelState(patch);
  await persistHomeKernelRuntime();
  return next;
}

function normalizeFiatCode(code: unknown): HomeFiatCurrencyCode {
  const value = typeof code === "string" ? code.trim().toUpperCase() : "";
  return SUPPORTED_HOME_FIAT_CODES.includes(value as HomeFiatCurrencyCode)
    ? (value as HomeFiatCurrencyCode)
    : "USD";
}

function normalizeCryptoCode(code: unknown): string {
  const value = typeof code === "string" ? code.trim().toUpperCase() : "";
  return value || "BTC";
}

function areStringArraysEqual(left: string[], right: string[]) {
  if (left.length !== right.length) return false;
  return left.every((item, index) => item === right[index]);
}

function knownCardIds() {
  return getHomeKernelState().cards.map((item) => item.id);
}

export const homeKernelFacade = {
  async boot() {
    return bootHomeKernelRuntime();
  },
  async refresh() {
    await refreshHomeKernelAccount();
    await persistHomeKernelRuntime();
    return getHomeKernelState();
  },
  getState() {
    return getHomeKernelState();
  },
  subscribe(listener: HomeKernelStoreListener) {
    return subscribeHomeKernelStore(listener);
  },
  async setSettingsVisible(value: boolean) {
    return patchAndPersist({ settingsVisible: value });
  },
  async setEditMode(value: boolean) {
    return patchAndPersist({ isEditMode: value });
  },
  async setSelectedFiat(code: HomeFiatCurrencyCode) {
    return patchAndPersist({ selectedFiat: normalizeFiatCode(code) });
  },
  async setSelectedCrypto(code: string) {
    return patchAndPersist({ selectedCrypto: normalizeCryptoCode(code) });
  },
  async setHiddenCardIds(ids: string[]) {
    const allCardIds = knownCardIds();
    const hiddenCardIds = Array.from(new Set(ids.map((item) => String(item).trim()).filter(Boolean)))
      .filter((id) => allCardIds.includes(id));
    const homeOrder = normalizeHomeOrder(getHomeKernelState().homeOrder, getHomeKernelState().cards, hiddenCardIds);
    return patchAndPersist({ hiddenCardIds, homeOrder });
  },
  async hideCard(cardId: string) {
    const id = String(cardId).trim();
    const current = getHomeKernelState();
    if (!id || !current.cards.some((card) => card.id === id)) return current;
    if (current.hiddenCardIds.includes(id)) return current;
    return this.setHiddenCardIds([...current.hiddenCardIds, id]);
  },
  async restoreCard(cardId: string) {
    const id = String(cardId).trim();
    const current = getHomeKernelState();
    if (!id || !current.cards.some((card) => card.id === id)) return current;
    const hiddenCardIds = current.hiddenCardIds.filter((entry) => entry !== id);
    const homeOrder = normalizeHomeOrder([...current.homeOrder, id], current.cards, hiddenCardIds);
    return patchAndPersist({ hiddenCardIds, homeOrder });
  },
  async restoreAllCards() {
    const current = getHomeKernelState();
    return patchAndPersist({
      hiddenCardIds: [],
      homeOrder: normalizeHomeOrder(current.cards.map((item) => item.id), current.cards, []),
    });
  },
  async setHomeOrder(ids: string[]) {
    const current = getHomeKernelState();
    const homeOrder = normalizeHomeOrder(ids, current.cards, current.hiddenCardIds);
    if (areStringArraysEqual(current.homeOrder, homeOrder)) return current;
    return patchAndPersist({ homeOrder });
  },
  async setDockOrder(ids: string[]) {
    const current = getHomeKernelState();
    const dockOrder = normalizeDockOrder(ids, DEFAULT_DOCK_ITEMS);
    if (areStringArraysEqual(current.dockOrder, dockOrder)) return current;
    return patchAndPersist({ dockOrder });
  },
  async setLayoutMode(mode: "grid" | "compact") {
    return patchAndPersist({ layoutMode: mode === "compact" ? "compact" : "grid" });
  },
  async setPinnedMiniApps(items: MiniAppItem[]) {
    const pinnedMiniApps = cloneMiniApps(normalizeMiniApps(items) ?? []);
    const cards = buildHomeCards(pinnedMiniApps);
    const current = getHomeKernelState();
    const allCardIds = cards.map((item) => item.id);
    const hiddenCardIds = current.hiddenCardIds.filter((id) => allCardIds.includes(id));
    const homeOrder = normalizeHomeOrder(current.homeOrder, cards, hiddenCardIds);
    return patchAndPersist({ pinnedMiniApps, cards, hiddenCardIds, homeOrder });
  },
  async reorderPinnedMiniApps(items: MiniAppItem[]) {
    return this.setPinnedMiniApps(items);
  },
  async addPinnedMiniApp(item: MiniAppItem) {
    const current = getHomeKernelState();
    const existing = current.pinnedMiniApps.some((entry) => entry.id === item.id);
    if (existing) {
      return this.restoreCard(`miniapp-${item.id}`);
    }
    return this.setPinnedMiniApps([...current.pinnedMiniApps, item]);
  },
  async removePinnedMiniApp(id: string) {
    const current = getHomeKernelState();
    return this.setPinnedMiniApps(current.pinnedMiniApps.filter((item) => item.id !== id));
  },
  async setThemeMode(mode: HomeThemeMode) {
    const nextMode: HomeThemeMode = ["brand", "wallet", "ai", "messenger"].includes(mode) ? mode : "brand";
    return patchAndPersist({
      themeMode: nextMode,
      themeLabel: resolveThemeLabel(nextMode),
      backgroundType: resolveBackgroundType(getHomeKernelState().imageBackground, nextMode),
    });
  },
  async cycleThemeMode() {
    const order: HomeThemeMode[] = ["brand", "wallet", "ai", "messenger"];
    const current = getHomeKernelState().themeMode;
    const index = order.indexOf(current);
    const next = index === -1 ? order[0] : order[(index + 1) % order.length];
    return this.setThemeMode(next);
  },
  async setImageBackground(uri: string | null) {
    const imageBackground = uri && String(uri).trim() ? String(uri).trim() : null;
    const themeMode = getHomeKernelState().themeMode;
    return patchAndPersist({ imageBackground, backgroundType: resolveBackgroundType(imageBackground, themeMode) });
  },
  async clearImageBackground() {
    return this.setImageBackground(null);
  },
  async syncAccountSnapshot() {
    await refreshHomeKernelAccount();
    await persistHomeKernelRuntime();
    return getHomeKernelState();
  },
  async resetLayout() {
    const current = getHomeKernelState();
    return patchAndPersist({
      hiddenCardIds: [],
      homeOrder: normalizeHomeOrder(DEFAULT_HOME_ORDER, current.cards, []),
      dockOrder: normalizeDockOrder(DEFAULT_DOCK_ITEMS.map((item) => item.id), DEFAULT_DOCK_ITEMS),
      settingsVisible: false,
      isEditMode: false,
      layoutMode: "grid",
    });
  },
  reset() {
    return resetHomeKernelState();
  },
  selectors: {
    isReady: () => selectHomeKernelReady(getHomeKernelState()),
    runtimeStatus: () => selectHomeKernelRuntimeStatus(getHomeKernelState()),
    lastError: () => selectHomeKernelLastError(getHomeKernelState()),
    settingsVisible: () => selectHomeSettingsVisible(getHomeKernelState()),
    isEditMode: () => selectHomeEditMode(getHomeKernelState()),
    selectedFiat: () => selectHomeSelectedFiat(getHomeKernelState()),
    selectedCrypto: () => selectHomeSelectedCrypto(getHomeKernelState()),
    hiddenCardIds: () => selectHomeHiddenCardIds(getHomeKernelState()),
    homeOrder: () => getHomeKernelState().homeOrder,
    dockOrder: () => selectHomeDockOrder(getHomeKernelState()),
    layoutMode: () => selectHomeLayoutMode(getHomeKernelState()),
    pinnedMiniApps: () => selectHomePinnedMiniApps(getHomeKernelState()),
    themeMode: () => selectHomeThemeMode(getHomeKernelState()),
    imageBackground: () => selectHomeImageBackground(getHomeKernelState()),
    backgroundType: () => selectHomeBackgroundType(getHomeKernelState()),
    themeLabel: () => selectHomeThemeLabel(getHomeKernelState()),
    account: () => selectHomeAccount(getHomeKernelState()),
    cards: () => selectHomeCards(getHomeKernelState()),
    dockItems: () => selectHomeDockItems(getHomeKernelState()),
    fiatRates: () => selectHomeFiatRates(getHomeKernelState()),
    cryptoRates: () => selectHomeCryptoRates(getHomeKernelState()),
    visibleCards: () => selectHomeVisibleCards(getHomeKernelState()),
    hiddenCards: () => selectHomeHiddenCards(getHomeKernelState()),
    orderedCards: () => selectHomeOrderedCards(getHomeKernelState()),
    orderedDockItems: () => selectHomeOrderedDockItems(getHomeKernelState()),
  },
};
