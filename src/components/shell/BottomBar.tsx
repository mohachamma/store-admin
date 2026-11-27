"use client";

import { Ellipsis, ExternalLink, LogOut } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { logout } from "@/app/login/actions";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { brand } from "@/config/brand";
import { isActive, navItems } from "@/config/nav";
import { cn } from "@/lib/utils";
import { LanguageToggle } from "./LanguageToggle";

/** Mobile bottom bar: the 3 most used sections + "More" sheet with everything else. */
export function BottomBar() {
  const t = useTranslations("nav");
  const tc = useTranslations("common");
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const primary = navItems.filter((i) => i.primary);
  const secondary = navItems.filter((i) => !i.primary);
  const moreActive = secondary.some((i) => isActive(pathname, i.href));

  const cell = "flex flex-1 flex-col items-center justify-center gap-1 text-[10px] font-medium transition";

  return (
    <nav
      aria-label={t("menu")}
      className="fixed inset-x-0 bottom-0 z-40 print:hidden mx-3 mb-3 rounded-full border border-border bg-[#1c1714]/80 pb-0 shadow-[0_10px_36px_rgb(0_0_0/0.5)] backdrop-blur-xl lg:hidden"
    >
      <div className="flex h-16 items-stretch px-2">
        {primary.map(({ key, href, icon: Icon }) => {
          const active = isActive(pathname, href);
          return (
            <Link key={key} href={href} aria-current={active ? "page" : undefined} className={cn(cell, active ? "text-foreground" : "text-muted-foreground")}>
              <span className={cn("grid h-7 w-12 place-items-center rounded-full transition", active && "bg-ink text-paper shadow-[0_6px_18px_rgb(244_122_32/0.45)]")}>
                <Icon className="size-[18px]" strokeWidth={1.8} />
              </span>
              {t(key)}
            </Link>
          );
        })}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger className={cn(cell, moreActive ? "text-foreground" : "text-muted-foreground")}>
            <span className={cn("grid h-7 w-12 place-items-center rounded-full", moreActive && "bg-ink text-paper")}>
              <Ellipsis className="size-[18px]" strokeWidth={1.8} />
            </span>
            {t("more")}
          </SheetTrigger>
          <SheetContent closeLabel={tc("close")}>
            <SheetTitle>{t("more")}</SheetTitle>
            <div className="grid grid-cols-3 gap-2">
              {secondary.map(({ key, href, icon: Icon }) => (
                <Link
                  key={key}
                  href={href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex aspect-square flex-col items-center justify-center gap-2 rounded-2xl text-xs font-medium transition",
                    isActive(pathname, href) ? "bg-ink text-paper" : "bg-white/5 hover:bg-white/10",
                  )}
                >
                  <Icon className="size-5" strokeWidth={1.8} />
                  {t(key)}
                </Link>
              ))}
            </div>
            <div className="flex items-center justify-between gap-2 border-t border-border pt-4">
              <LanguageToggle />
              <a href={brand.storefrontUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <ExternalLink className="size-4" /> {t("openStore")}
              </a>
              <form action={logout}>
                <button type="submit" className="flex items-center gap-1.5 text-xs font-semibold text-destructive">
                  <LogOut className="size-4 rtl:-scale-x-100" /> {t("logout")}
                </button>
              </form>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
}
