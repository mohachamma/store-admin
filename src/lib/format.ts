import type { Locale } from "@/i18n/config";

/** Integer DZD → "8 900 دج" / "8 900 DA". Narrow no-break spaces keep the number intact in RTL. */
export function formatDZD(amount: number, locale: Locale): string {
  const n = Math.round(amount)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return locale === "ar" ? `${n} دج` : `${n} DA`;
}
