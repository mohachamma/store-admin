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
    <aside className="sticky top-0 hidden h-svh w-64 shrink-0 flex-col border-e border-border bg-background px-4 py-6 lg:flex">
      <AdminLogo className="px-3" />
      <nav aria-label={t("menu")} className="mt-8 flex flex-1 flex-col gap-1">
        {navItems.map(({ key, href, icon: Icon }) => {
          const active = isActive(pathname, href);
          return (
            <Link
              key={key}
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex h-11 items-center gap-3 rounded-full px-4 text-sm font-medium transition",
                active ? "bg-ink text-paper" : "text-foreground/70 hover:bg-secondary hover:text-foreground",
              )}
            >
              <Icon className="size-[18px]" strokeWidth={1.8} />
              {t(key)}
            </Link>
          );
        })}
      </nav>
      <a
        href={brand.storefrontUrl}
        target="_blank"
        rel="noreferrer"
        className="flex h-11 items-center gap-3 rounded-full px-4 text-sm text-muted-foreground transition hover:bg-secondary hover:text-foreground"
      >
        <ExternalLink className="size-[18px]" strokeWidth={1.8} />
        {t("openStore")}
      </a>
    </aside>
  );
}
