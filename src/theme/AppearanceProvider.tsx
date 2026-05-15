import React, { createContext, useContext, useMemo } from "react";
import { homeKernelFacade } from "../core/kernel/home";
import { useHomeKernel } from "../core/kernel/home/bindings";
import type { HomeThemeMode } from "../core/kernel/home";

export type AppThemeMode = HomeThemeMode;

type AppearanceContextValue = {
  themeMode: AppThemeMode;
  setThemeMode: (mode: AppThemeMode) => void;
  cycleThemeMode: () => void;
  imageBackground: string | null;
  setImageBackground: (uri: string | null) => void;
  clearImageBackground: () => void;
  backgroundType: string;
  themeLabel: string;
};

const AppearanceContext = createContext<AppearanceContextValue | undefined>(undefined);

export function AppearanceProvider({ children }: { children: React.ReactNode }) {
  const home = useHomeKernel();
  const value = useMemo<AppearanceContextValue>(() => ({
    themeMode: home.themeMode,
    setThemeMode: (mode) => { void homeKernelFacade.setThemeMode(mode); },
    cycleThemeMode: () => { void homeKernelFacade.cycleThemeMode(); },
    imageBackground: home.imageBackground,
    setImageBackground: (uri) => { void homeKernelFacade.setImageBackground(uri); },
    clearImageBackground: () => { void homeKernelFacade.clearImageBackground(); },
    backgroundType: home.backgroundType,
    themeLabel: home.themeLabel,
  }), [home.themeMode, home.imageBackground, home.backgroundType, home.themeLabel]);

  return <AppearanceContext.Provider value={value}>{children}</AppearanceContext.Provider>;
}

export function useAppearance() {
  const context = useContext(AppearanceContext);
  if (!context) throw new Error("useAppearance must be used inside AppearanceProvider");
  return context;
}
