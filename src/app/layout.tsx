import type { Metadata, Viewport } from "next";
import { Fraunces, Inter } from "next/font/google";
import "@/styles/globals.css";
import { LocaleProvider } from "@/lib/i18n/LocaleProvider";
import { CurrencyProvider } from "@/lib/CurrencyProvider";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import AuthModalRoot from "@/components/AuthModalRoot";

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-fraunces",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-inter",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // maximumScale intentionally left uncapped — pinch-zoom is an accessibility
  // need for low-vision users and should never be disabled site-wide.
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: {
    default: "AUVRENZA — Premium Korean Skincare",
    template: "%s | AUVRENZA",
  },
  description:
    "AUVRENZA is a premium destination for authentic Korean skincare — cleansers, serums, moisturizers, sunscreens and curated beauty routines.",
  openGraph: {
    title: "AUVRENZA — Premium Korean Skincare",
    description: "Premium Korean skincare, carefully selected for healthy, radiant skin.",
    siteName: "AUVRENZA",
    type: "website",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${inter.variable}`}>
      <body>
        <LocaleProvider>
          <CurrencyProvider>
            <Header />
            {children}
            <Footer />
            <CartDrawer />
            <AuthModalRoot />
          </CurrencyProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
