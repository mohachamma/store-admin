import type { Metadata, Viewport } from "next";
import { IBM_Plex_Sans_Arabic, Jost, Poppins } from "next/font/google";
import { cookies } from "next/headers";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getTranslations } from "next-intl/server";
import type { ReactNode } from "react";
import { brand } from "@/config/brand";
import { dirOf, type Locale } from "@/i18n/config";
import "./globals.css";

const latin = Jost({ subsets: ["latin"], variable: "--font-latin", display: "swap" });
const wordmark = Poppins({ subsets: ["latin"], weight: ["500", "600", "700"], variable: "--font-wordmark", display: "swap" });
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
  const theme = (await cookies()).get("theme")?.value === "light" ? "light" : "dark";
  return (
    <html lang={locale} dir={dirOf(locale)} data-theme={theme} className={`${latin.variable} ${wordmark.variable} ${arabic.variable}`}>
      <body className="min-h-svh">
        <NextIntlClientProvider>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
}
