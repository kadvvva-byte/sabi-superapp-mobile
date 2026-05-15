import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type AppThemeMode = "dark" | "ocean";

export type SabiTheme = {
  mode: AppThemeMode;
  colors: {
    background: string;
    surface: string;
    card: string;
    cardSoft: string;
    text: string;
    textSecondary: string;
    border: string;
    accent: string;
    accentSoft: string;
    success: string;
    danger: string;
    warning: string;
    glow: string;
  };
  gradients: {
    screen: [string, string, string];
    card: [string, string];
    accent: [string, string];
  };
  radius: {
    sm: number;
    md: number;
    lg: number;
    xl: number;
    pill: number;
    full: number;
  };
};

const darkTheme: SabiTheme = {
  mode: "dark",
  colors: {
    background: "#070B11",
    surface: "#0B1220",
    card: "#0F1728",
    cardSoft: "#131D31",
    text: "#F8FAFC",
    textSecondary: "#94A3B8",
    border: "rgba(148,163,184,0.18)",
    accent: "#7CFF2B",
    accentSoft: "rgba(124,255,43,0.18)",
    success: "#22C55E",
    danger: "#EF4444",
    warning: "#F59E0B",
    glow: "rgba(124,255,43,0.30)",
  },
  gradients: {
    screen: ["#060A10", "#0A111A", "#0F1728"],
    card: ["#111827", "#0F1728"],
    accent: ["#B7FF66", "#7CFF2B"],
  },
  radius: {
    sm: 10,
    md: 14,
    lg: 18,
    xl: 24,
    pill: 999,
    full: 999,
  },
};

const oceanTheme: SabiTheme = {
  mode: "ocean",
  colors: {
    background: "#06111C",
    surface: "#0A1A2B",
    card: "#0E2238",
    cardSoft: "#14304D",
    text: "#F8FAFC",
    textSecondary: "#B6CCE6",
    border: "rgba(93,163,255,0.22)",
    accent: "#5DA3FF",
    accentSoft: "rgba(93,163,255,0.18)",
    success: "#22C55E",
    danger: "#EF4444",
    warning: "#F59E0B",
    glow: "rgba(93,163,255,0.30)",
  },
  gradients: {
    screen: ["#06111C", "#0A1A2B", "#102845"],
    card: ["#11253B", "#14304D"],
    accent: ["#8EC5FF", "#5DA3FF"],
  },
  radius: {
    sm: 10,
    md: 14,
    lg: 18,
    xl: 24,
    pill: 999,
    full: 999,
  },
};

type ThemeContextValue = {
  theme: SabiTheme;
  themeMode: AppThemeMode;
  setThemeMode: (mode: AppThemeMode) => void;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

type ThemeProviderProps = {
  children: ReactNode;
  initialMode?: AppThemeMode;
};

export function ThemeProvider({
  children,
  initialMode = "dark",
}: ThemeProviderProps) {
  const [themeMode, setThemeMode] = useState<AppThemeMode>(initialMode);

  const toggleTheme = useCallback(() => {
    setThemeMode((prev) => (prev === "dark" ? "ocean" : "dark"));
  }, []);

  const theme = useMemo<SabiTheme>(() => {
    return themeMode === "ocean" ? oceanTheme : darkTheme;
  }, [themeMode]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      themeMode,
      setThemeMode,
      toggleTheme,
    }),
    [theme, themeMode, toggleTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

function useThemeContext(): ThemeContextValue {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useSabiTheme must be used within ThemeProvider");
  }

  return context;
}

export function useSabiTheme(): SabiTheme {
  return useThemeContext().theme;
}

export function useSabiThemeController(): ThemeContextValue {
  return useThemeContext();
}

export const useThemeMode = useSabiThemeController;

export { darkTheme, oceanTheme };

export default ThemeProvider;