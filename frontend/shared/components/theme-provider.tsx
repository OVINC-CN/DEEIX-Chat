"use client";

import * as React from "react";

type ThemeContextValue = {
  resolvedTheme: "light" | "dark";
};

const ThemeContext = React.createContext<ThemeContextValue | null>(null);

function resolveSystemTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applySystemTheme(systemTheme: "light" | "dark") {
  const root = document.documentElement;
  root.classList.remove("light", "dark");
  root.classList.add(systemTheme);
  delete root.dataset.theme;
  root.style.colorScheme = systemTheme;
}

export function ThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [systemTheme, setSystemTheme] = React.useState<"light" | "dark">("light");

  React.useEffect(() => {
    const initialSystemTheme = resolveSystemTheme();
    setSystemTheme(initialSystemTheme);
    window.localStorage.removeItem("theme");
    window.localStorage.removeItem("theme-preset");
    applySystemTheme(initialSystemTheme);

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleSystemThemeChange = () => {
      const nextSystemTheme = resolveSystemTheme();
      setSystemTheme(nextSystemTheme);
      applySystemTheme(nextSystemTheme);
    };
    mediaQuery.addEventListener("change", handleSystemThemeChange);
    return () => mediaQuery.removeEventListener("change", handleSystemThemeChange);
  }, []);

  const value = React.useMemo<ThemeContextValue>(
    () => ({
      resolvedTheme: systemTheme,
    }),
    [systemTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = React.useContext(ThemeContext);
  if (!context) {
    return {
      resolvedTheme: "light" as const,
    };
  }
  return context;
}
