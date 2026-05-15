import type {
  HomeAccountSnapshot,
  HomeCard,
  HomeDockItem,
  HomeKernelState,
  HomeLayoutMode,
  HomeThemeMode,
  MiniAppItem,
} from "./types";

export function selectHomeKernelReady(state: HomeKernelState) {
  return state.isReady;
}

export function selectHomeKernelRuntimeStatus(state: HomeKernelState) {
  return state.runtimeStatus;
}

export function selectHomeKernelLastError(state: HomeKernelState) {
  return state.lastError;
}

export function selectHomeSettingsVisible(state: HomeKernelState) {
  return state.settingsVisible;
}

export function selectHomeEditMode(state: HomeKernelState) {
  return state.isEditMode;
}

export function selectHomeSelectedFiat(state: HomeKernelState) {
  return state.selectedFiat;
}

export function selectHomeSelectedCrypto(state: HomeKernelState) {
  return state.selectedCrypto;
}

export function selectHomeHiddenCardIds(state: HomeKernelState) {
  return state.hiddenCardIds;
}

export function selectHomeOrder(state: HomeKernelState) {
  return state.homeOrder;
}

export function selectHomeDockOrder(state: HomeKernelState) {
  return state.dockOrder;
}

export function selectHomeLayoutMode(state: HomeKernelState): HomeLayoutMode {
  return state.layoutMode;
}

export function selectHomePinnedMiniApps(state: HomeKernelState): MiniAppItem[] {
  return state.pinnedMiniApps;
}

export function selectHomeThemeMode(state: HomeKernelState): HomeThemeMode {
  return state.themeMode;
}

export function selectHomeImageBackground(state: HomeKernelState) {
  return state.imageBackground;
}

export function selectHomeBackgroundType(state: HomeKernelState) {
  return state.backgroundType;
}

export function selectHomeThemeLabel(state: HomeKernelState) {
  return state.themeLabel;
}

export function selectHomeAccount(state: HomeKernelState): HomeAccountSnapshot {
  return state.account;
}

export function selectHomeCards(state: HomeKernelState): HomeCard[] {
  return state.cards;
}

export function selectHomeDockItems(state: HomeKernelState): HomeDockItem[] {
  return state.dockItems;
}

export function selectHomeFiatRates(state: HomeKernelState) {
  return state.fiatRates;
}

export function selectHomeCryptoRates(state: HomeKernelState) {
  return state.cryptoRates;
}

export function selectHomeVisibleCards(state: HomeKernelState): HomeCard[] {
  return state.cards.filter((item) => !state.hiddenCardIds.includes(item.id));
}

export function selectHomeHiddenCards(state: HomeKernelState): HomeCard[] {
  return state.cards.filter((item) => state.hiddenCardIds.includes(item.id));
}

export function selectHomeOrderedCards(state: HomeKernelState): HomeCard[] {
  const map = new Map(state.cards.map((item) => [item.id, item]));
  return state.homeOrder.map((id) => map.get(id)).filter(Boolean) as HomeCard[];
}

export function selectHomeOrderedDockItems(state: HomeKernelState): HomeDockItem[] {
  const map = new Map(state.dockItems.map((item) => [item.id, item]));
  return state.dockOrder.map((id) => map.get(id)).filter(Boolean) as HomeDockItem[];
}
