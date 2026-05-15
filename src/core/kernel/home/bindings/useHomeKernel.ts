import { useEffect, useMemo, useState } from "react";
import { homeKernelFacade } from "../facade";
import type { HomeKernelState } from "../core/types";

export async function ensureHomeKernelBoot() {
  try {
    await homeKernelFacade.boot();
  } catch {}
  return homeKernelFacade.getState();
}

export function useHomeKernelState() {
  const [state, setState] = useState<HomeKernelState>(homeKernelFacade.getState());

  useEffect(() => {
    let active = true;
    const unsubscribe = homeKernelFacade.subscribe((next) => {
      if (!active) return;
      setState(next);
    });

    void ensureHomeKernelBoot().then(() => {
      if (!active) return;
      setState(homeKernelFacade.getState());
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  return state;
}

function normalizeDisplayText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeDisplayUsername(value: unknown): string {
  const raw = normalizeDisplayText(value);
  if (!raw) return "@sabi";
  return raw.startsWith("@") ? raw : `@${raw}`;
}

function normalizeAvatarLetter(value: unknown): string {
  const raw = normalizeDisplayText(value);
  const match = raw.match(/\p{L}/u);
  return match ? match[0].toUpperCase() : "S";
}

export function useHomeKernel() {
  const state = useHomeKernelState();

  return useMemo(() => {
    const account = state.account ?? {
      fullName: "Sabi User",
      username: "@sabi",
      sabiId: "SB0000000000",
      phone: "",
      avatarUri: null,
      avatarLetter: "S",
    };

    const displayName = normalizeDisplayText(account.fullName) || "Sabi User";
    const displayUsername = normalizeDisplayUsername(account.username);
    const displaySabiId = normalizeDisplayText(account.sabiId) || "SB0000000000";
    const displayPhone = normalizeDisplayText(account.phone);
    const avatarUri = normalizeDisplayText(account.avatarUri) || null;
    const avatarLetter =
      normalizeAvatarLetter(account.avatarLetter) ||
      normalizeAvatarLetter(displayName) ||
      normalizeAvatarLetter(displayUsername);

    return {
      state,
      facade: homeKernelFacade,
      refresh: () => homeKernelFacade.refresh(),
      isReady: state.isReady,
      runtimeStatus: state.runtimeStatus,
      lastError: state.lastError,
      settingsVisible: state.settingsVisible,
      isEditMode: state.isEditMode,
      selectedFiat: state.selectedFiat,
      selectedCrypto: state.selectedCrypto,
      hiddenCardIds: state.hiddenCardIds,
      homeOrder: state.homeOrder,
      dockOrder: state.dockOrder,
      layoutMode: state.layoutMode,
      pinnedMiniApps: state.pinnedMiniApps,
      cards: state.cards,
      dockItems: state.dockItems,
      fiatRates: state.fiatRates,
      cryptoRates: state.cryptoRates,
      themeMode: state.themeMode,
      imageBackground: state.imageBackground,
      backgroundType: state.backgroundType,
      themeLabel: state.themeLabel,
      account: state.account,
      displayName,
      displayUsername,
      displaySabiId,
      displayPhone,
      avatarLetter,
      avatarUri,
      visibleCards: homeKernelFacade.selectors.visibleCards(),
      hiddenCards: homeKernelFacade.selectors.hiddenCards(),
      orderedCards: homeKernelFacade.selectors.orderedCards(),
      orderedDockItems: homeKernelFacade.selectors.orderedDockItems(),
    };
  }, [state]);
}
