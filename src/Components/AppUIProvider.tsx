"use client";

import { createContext, useContext, useEffect, useState } from "react";

type ThemeMode = "dark" | "light";
type LanguageCode = "en" | "bn";

type AppUIContextValue = {
  theme: ThemeMode;
  language: LanguageCode;
  toggleTheme: () => void;
  toggleLanguage: () => void;
  t: (key: string, fallback: string) => string;
};

const AppUIContext = createContext<AppUIContextValue | null>(null);

export function AppUIProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const [theme, setTheme] = useState<ThemeMode>("dark");
  const [language, setLanguage] = useState<LanguageCode>("en");
  const [isPreferenceHydrated, setIsPreferenceHydrated] = useState(false);
  const [dictionary, setDictionary] = useState<Record<string, string>>({});

  useEffect(() => {
    const storedTheme = localStorage.getItem("portfolio-theme");
    const storedLanguage = localStorage.getItem("portfolio-language");

    const timer = window.setTimeout(() => {
      if (storedTheme === "light" || storedTheme === "dark") {
        setTheme(storedTheme);
      }

      if (storedLanguage === "en" || storedLanguage === "bn") {
        setLanguage(storedLanguage);
      }

      setIsPreferenceHydrated(true);
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    document.documentElement.classList.remove("dark", "light");
    document.documentElement.classList.add(theme);
    if (isPreferenceHydrated) {
      localStorage.setItem("portfolio-theme", theme);
    }
  }, [theme, isPreferenceHydrated]);

  useEffect(() => {
    let isActive = true;

    const loadDictionary = async () => {
      try {
        const response = await fetch(`/locales/${language}.json`, { cache: "no-store" });
        const resource = (await response.json()) as Record<string, string>;
        if (isActive) {
          setDictionary(resource);
        }
      } catch {
        if (isActive) {
          setDictionary({});
        }
      }
    };

    void loadDictionary();
    if (isPreferenceHydrated) {
      localStorage.setItem("portfolio-language", language);
      document.cookie = `portfolio-language=${language}; path=/; max-age=31536000; samesite=lax`;
    }

    return () => {
      isActive = false;
    };
  }, [language, isPreferenceHydrated]);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const contextValue: AppUIContextValue = {
    theme,
    language,
    toggleTheme: () => {
      setTheme((current) => (current === "dark" ? "light" : "dark"));
    },
    toggleLanguage: () => {
      setLanguage((current) => (current === "en" ? "bn" : "en"));
    },
    t: (key: string, fallback: string) => {
      const translated = dictionary[key];
      if (typeof translated !== "string" || translated.trim().length === 0) {
        return fallback;
      }

      return translated;
    },
  };

  return <AppUIContext.Provider value={contextValue}>{children}</AppUIContext.Provider>;
}

export function useAppUI() {
  const context = useContext(AppUIContext);

  if (!context) {
    throw new Error("useAppUI must be used within AppUIProvider");
  }

  return context;
}
