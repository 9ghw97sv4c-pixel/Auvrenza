"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { CURRENCY_COOKIE, formatPrice, type Currency } from "./currency";

interface CurrencyContextValue {
  currency: Currency;
  setCurrency: (c: Currency) => void;
  format: (amountUsd: number) => string;
}

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>("USD");

  useEffect(() => {
    const match = document.cookie.match(/avelis_currency=(USD|KRW|UZS)/);
    if (match) setCurrencyState(match[1] as Currency);
  }, []);

  function setCurrency(c: Currency) {
    setCurrencyState(c);
    document.cookie = `${CURRENCY_COOKIE}=${c}; path=/; max-age=31536000`;
  }

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, format: (v) => formatPrice(v, currency) }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error("useCurrency must be used within CurrencyProvider");
  return ctx;
}
