export type Currency = "USD" | "KRW" | "UZS";

// Static reference rates (base: 1 USD). Replace with a live FX API call
// (e.g. exchangerate.host) in production if rates need to stay current.
export const RATES: Record<Currency, number> = {
  USD: 1,
  KRW: 1320,
  UZS: 12700,
};

export const CURRENCY_LABEL: Record<Currency, string> = {
  USD: "$",
  KRW: "₩",
  UZS: "so'm",
};

export function convert(amountUsd: number, currency: Currency): number {
  return amountUsd * RATES[currency];
}

export function formatPrice(amountUsd: number, currency: Currency): string {
  const converted = convert(amountUsd, currency);
  if (currency === "USD") {
    return `$${converted.toFixed(2)}`;
  }
  if (currency === "KRW") {
    return `₩${Math.round(converted).toLocaleString("ko-KR")}`;
  }
  return `${Math.round(converted).toLocaleString("en-US")} so'm`;
}

export const CURRENCY_COOKIE = "avelis_currency";
