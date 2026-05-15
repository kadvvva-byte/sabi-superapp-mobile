import type { HomeKernelState, HomeKernelStoreListener } from "./types";
import {
  DEFAULT_CRYPTO_RATES,
  DEFAULT_DOCK_ITEMS,
  DEFAULT_FIAT_RATES,
  DEFAULT_HOME_ACCOUNT,
  DEFAULT_HOME_CARDS,
  DEFAULT_HOME_ORDER,
  DEFAULT_PINNED_MINI_APPS,
  resolveBackgroundType,
  resolveThemeLabel,
} from "../runtime/types";

const listeners = new Set<HomeKernelStoreListener>();

let state: HomeKernelState = {
  isReady: false,
  runtimeStatus: "idle",
  lastError: null,
  settingsVisible: false,
  isEditMode: false,
  selectedFiat: "USD",
  selectedCrypto: "BTC",
  hiddenCardIds: [],
  homeOrder: DEFAULT_HOME_ORDER,
  dockOrder: DEFAULT_DOCK_ITEMS.map((item) => item.id),
  layoutMode: "grid",
  pinnedMiniApps: DEFAULT_PINNED_MINI_APPS,
  cards: DEFAULT_HOME_CARDS,
  dockItems: DEFAULT_DOCK_ITEMS,
  fiatRates: DEFAULT_FIAT_RATES,
  cryptoRates: DEFAULT_CRYPTO_RATES,
  themeMode: "brand",
  imageBackground: null,
  backgroundType: resolveBackgroundType(null, "brand"),
  themeLabel: resolveThemeLabel("brand"),
  account: DEFAULT_HOME_ACCOUNT,
};

function emit() {
  const snapshot = state;
  listeners.forEach((listener) => listener(snapshot));
}

function areArraysEqual(left: unknown[], right: unknown[]) {
  if (left.length !== right.length) return false;
  return left.every((item, index) => Object.is(item, right[index]));
}

function arePatchValuesEqual(left: unknown, right: unknown) {
  if (Object.is(left, right)) return true;
  if (Array.isArray(left) && Array.isArray(right)) {
    return areArraysEqual(left, right);
  }
  return false;
}

function isPatchNoop(current: HomeKernelState, patch: Partial<HomeKernelState>) {
  const keys = Object.keys(patch) as Array<keyof HomeKernelState>;
  return keys.every((key) => arePatchValuesEqual(current[key], patch[key]));
}

export function getHomeKernelState(): HomeKernelState {
  return state;
}

export function setHomeKernelState(updater: HomeKernelState | ((current: HomeKernelState) => HomeKernelState)) {
  const next = typeof updater === "function" ? updater(state) : updater;
  if (next === state) return state;
  state = next;
  emit();
  return state;
}

export function patchHomeKernelState(patch: Partial<HomeKernelState>) {
  return setHomeKernelState((current) => {
    if (isPatchNoop(current, patch)) return current;
    return { ...current, ...patch };
  });
}

export function subscribeHomeKernelStore(listener: HomeKernelStoreListener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function bindHomeKernelRuntimeState(next: Partial<HomeKernelState>) {
  return setHomeKernelState((current) => {
    if (isPatchNoop(current, next)) return current;
    return { ...current, ...next };
  });
}

export function resetHomeKernelState() {
  return setHomeKernelState({
    ...state,
    isReady: false,
    runtimeStatus: "idle",
    lastError: null,
    settingsVisible: false,
    isEditMode: false,
    selectedFiat: "USD",
    selectedCrypto: "BTC",
    hiddenCardIds: [],
    homeOrder: DEFAULT_HOME_ORDER,
    dockOrder: DEFAULT_DOCK_ITEMS.map((item) => item.id),
    layoutMode: "grid",
    pinnedMiniApps: DEFAULT_PINNED_MINI_APPS,
    cards: DEFAULT_HOME_CARDS,
    dockItems: DEFAULT_DOCK_ITEMS,
    fiatRates: DEFAULT_FIAT_RATES,
    cryptoRates: DEFAULT_CRYPTO_RATES,
    themeMode: "brand",
    imageBackground: null,
    backgroundType: resolveBackgroundType(null, "brand"),
    themeLabel: resolveThemeLabel("brand"),
    account: DEFAULT_HOME_ACCOUNT,
  });
}
