import type { Metadata, Viewport } from "next";
import { IBM_Plex_Sans_Arabic, Jost, Noto_Naskh_Arabic, Playfair_Display } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getTranslations } from "next-intl/server";
import type { ReactNode } from "react";
import { brand } from "@/config/brand";
import { dirOf, type Locale } from "@/i18n/config";
import "./globals.css";

const latin = Jost({ subsets: ["latin"], variable: "--font-latin", display: "swap" });
const wordmark = Playfair_Display({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-wordmark", display: "swap" });
const arabicDisplay = Noto_Naskh_Arabic({ subsets: ["arabic"], weight: ["500", "600", "700"], variable: "--font-arabic-display", display: "swap" });
const arabic = IBM_Plex_Sans_Arabic({ subsets: ["arabic"], weight: ["400", "500", "600", "700"], variable: "--font-arabic", display: "swap" });

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("meta");
  return {
    title: { default: `${t("title")} · ${brand.name}`, template: `%s · ${brand.name} ${brand.adminTag}` },
    // The dashboard must never be indexed.
    robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
  };
}

export const viewport: Viewport = { themeColor: brand.colors.paper, width: "device-width", initialScale: 1, viewportFit: "cover" };

export default async function RootLayout({ children }: { children: ReactNode }) {
  const locale = (await getLocale()) as Locale;
  return (
    <html lang={locale} dir={dirOf(locale)} className={`${latin.variable} ${wordmark.variable} ${arabic.variable} ${arabicDisplay.variable}`}>
      <body className="min-h-svh">
        <NextIntlClientProvider>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
}
