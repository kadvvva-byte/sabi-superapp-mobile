import React, { createContext, useContext, useMemo } from "react";
import { homeKernelFacade } from "../../core/kernel/home";
import { useHomeKernel } from "../../core/kernel/home/bindings";
import type { HomeLayoutMode, MiniAppItem } from "../../core/kernel/home";

export type { MiniAppItem } from "../../core/kernel/home";

type HomeLayoutContextType = {
  layoutMode: HomeLayoutMode;
  setLayoutMode: (mode: HomeLayoutMode) => void;
  pinnedMiniApps: MiniAppItem[];
  setPinnedMiniApps: (items: MiniAppItem[]) => void;
  reorderPinnedMiniApps: (items: MiniAppItem[]) => void;
  addPinnedMiniApp: (item: MiniAppItem) => void;
  removePinnedMiniApp: (id: string) => void;
};

const HomeLayoutContext = createContext<HomeLayoutContextType | undefined>(undefined);

export function HomeLayoutProvider({ children }: { children: React.ReactNode }) {
  const home = useHomeKernel();

  const value = useMemo<HomeLayoutContextType>(() => ({
    layoutMode: home.layoutMode,
    setLayoutMode: (mode) => {
      void homeKernelFacade.setLayoutMode(mode);
    },
    pinnedMiniApps: home.pinnedMiniApps,
    setPinnedMiniApps: (items) => {
      void homeKernelFacade.setPinnedMiniApps(items);
    },
    reorderPinnedMiniApps: (items) => {
      void homeKernelFacade.reorderPinnedMiniApps(items);
    },
    addPinnedMiniApp: (item) => {
      void homeKernelFacade.addPinnedMiniApp(item);
    },
    removePinnedMiniApp: (id) => {
      void homeKernelFacade.removePinnedMiniApp(id);
    },
  }), [home.layoutMode, home.pinnedMiniApps]);

  return <HomeLayoutContext.Provider value={value}>{children}</HomeLayoutContext.Provider>;
}

export function useHomeLayout() {
  const context = useContext(HomeLayoutContext);
  if (!context) {
    throw new Error("useHomeLayout must be used within HomeLayoutProvider");
  }
  return context;
}
