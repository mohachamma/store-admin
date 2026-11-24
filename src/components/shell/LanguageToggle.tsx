"use client";

import { Languages } from "lucide-react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useTransition } from "react";
import { setLocale } from "@/i18n/actions";
import { cn } from "@/lib/utils";

/** Switches between العربية and Français (stored in a cookie). */
export function LanguageToggle({ className }: { className?: string }) {
  const t = useTranslations("nav");
  const locale = useLocale();
  const router = useRouter();
  const [pending, start] = useTransition();
  const next = locale === "ar" ? "fr" : "ar";

  return (
    <button
      type="button"
      title={t("language")}
      disabled={pending}
      onClick={() =>
        start(async () => {
          await setLocale(next);
          router.refresh();
        })
      }
      className={cn("flex h-9 items-center gap-1.5 rounded-full px-3 text-xs font-semibold transition hover:bg-secondary disabled:opacity-50", className)}
    >
      <Languages className="size-4" strokeWidth={1.8} />
      {next === "ar" ? "العربية" : "Français"}
    </button>
  );
}
