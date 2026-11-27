"use client";

import { ExternalLink } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { brand } from "@/config/brand";
import { isActive, navItems } from "@/config/nav";
import { cn } from "@/lib/utils";
import { AdminLogo } from "./AdminLogo";

/** Desktop sidebar (hidden on mobile, where BottomBar takes over). */
export function Sidebar() {
  const t = useTranslations("nav");
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 hidden h-svh print:hidden w-32 shrink-0 flex-col items-stretch overflow-y-auto rounded-e-[2.5rem] bg-sidebar px-3 py-6 lg:flex">
      <AdminLogo className="flex-col !items-start gap-1.5 px-2" />
      <nav aria-label={t("menu")} className="mt-8 flex flex-1 flex-col gap-1.5">
        {navItems.map(({ key, href, icon: Icon }) => {
          const active = isActive(pathname, href);
          return (
            <Link
              key={key}
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex flex-col items-center gap-1.5 rounded-2xl px-1 py-2.5 text-center text-[11.5px] font-medium leading-tight transition",
                active ? "bg-surface text-foreground shadow-[var(--shadow-card)]" : "text-foreground/65 hover:bg-surface/60 hover:text-foreground",
              )}
            >
              <Icon className={cn("size-5", active && "text-gold")} strokeWidth={1.6} />
              {t(key)}
            </Link>
          );
        })}
      </nav>
      <a
        href={brand.storefrontUrl}
        target="_blank"
        rel="noreferrer"
        className="mt-2 flex flex-col items-center gap-1.5 rounded-2xl px-1 py-2.5 text-center text-[11.5px] text-muted-foreground transition hover:bg-surface/60 hover:text-foreground"
      >
        <ExternalLink className="size-5" strokeWidth={1.6} />
        {t("openStore")}
      </a>
    </aside>
  );
}
