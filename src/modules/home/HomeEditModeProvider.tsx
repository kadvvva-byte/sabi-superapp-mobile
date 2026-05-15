import React, { createContext, useContext, useMemo } from "react";
import { homeKernelFacade } from "../../core/kernel/home";
import { useHomeKernel } from "../../core/kernel/home/bindings";

type HomeEditModeContextType = {
  isHomeEditMode: boolean;
  setIsHomeEditMode: (value: boolean) => void;
};

const HomeEditModeContext = createContext<HomeEditModeContextType | undefined>(undefined);

export function HomeEditModeProvider({ children }: { children: React.ReactNode }) {
  const home = useHomeKernel();
  const value = useMemo<HomeEditModeContextType>(() => ({
    isHomeEditMode: home.isEditMode,
    setIsHomeEditMode: (value) => {
      void homeKernelFacade.setEditMode(value);
    },
  }), [home.isEditMode]);

  return <HomeEditModeContext.Provider value={value}>{children}</HomeEditModeContext.Provider>;
}

export function useHomeEditMode() {
  const context = useContext(HomeEditModeContext);
  if (!context) {
    throw new Error("useHomeEditMode must be used within HomeEditModeProvider");
  }
  return context;
}
