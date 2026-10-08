"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { defaultLocale, isLocale, type Locale } from "./config";
import { getDictionary, dictionaries } from "./dictionaries";

const COOKIE = "auvrenza_locale";
type Dictionary = (typeof dictionaries)["en"];

interface LocaleContextValue {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: Dictionary;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(defaultLocale);

  useEffect(() => {
    const match = document.cookie.match(/auvrenza_locale=([a-z]{2})/);
    if (match && isLocale(match[1])) setLocaleState(match[1]);
  }, []);

  function setLocale(l: Locale) {
    setLocaleState(l);
    document.cookie = `${COOKIE}=${l}; path=/; max-age=31536000`;
  }

  return (
    <LocaleContext.Provider value={{ locale, setLocale, t: getDictionary(locale) }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale must be used within LocaleProvider");
  return ctx;
}
