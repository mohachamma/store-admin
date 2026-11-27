"use client";

import { Moon, Sun } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { cn } from "@/lib/utils";

export type Theme = "dark" | "light";

/** Switches between the dark glass look and the light (black & white) look; the choice is kept in a cookie. */
export function ThemeToggle({ initial, className }: { initial: Theme; className?: string }) {
  const t = useTranslations("nav");
  const [theme, setTheme] = useState<Theme>(initial);
  const next: Theme = theme === "dark" ? "light" : "dark";

  function toggle() {
    document.documentElement.dataset.theme = next;
    document.cookie = `theme=${next}; path=/; max-age=31536000; samesite=lax`;
    setTheme(next);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      title={next === "light" ? t("themeLight") : t("themeDark")}
      aria-label={next === "light" ? t("themeLight") : t("themeDark")}
      className={cn("relative grid size-10 place-items-center rounded-full transition hover:bg-secondary", className)}
    >
      {theme === "dark" ? <Sun className="size-5" strokeWidth={1.8} /> : <Moon className="size-5" strokeWidth={1.8} />}
    </button>
  );
}
