export const locales = ["ar", "fr"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "ar";
export const LOCALE_COOKIE = "ADMIN_LOCALE";
export const dirOf = (l: Locale) => (l === "ar" ? "rtl" : "ltr");
export const isLocale = (v: unknown): v is Locale => locales.includes(v as Locale);
