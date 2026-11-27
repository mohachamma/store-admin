"use client";

import { ExternalLink } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { brand } from "@/config/brand";
import { isActive, navItems } from "@/config/nav";
import { cn } from "@/lib/utils";

/** Desktop sidebar (hidden on mobile, where BottomBar takes over). */
export function Sidebar() {
  const t = useTranslations("nav");
  const pathname = usePathname();

  return (
    <aside className="sticky top-4 m-4 me-0 hidden h-[calc(100svh-2rem)] print:hidden w-[4.5rem] shrink-0 flex-col items-center overflow-y-auto rounded-full border border-border bg-sidebar px-2 py-4 shadow-[var(--shadow-card)] backdrop-blur-xl no-scrollbar lg:flex">
      <Link href="/" aria-label={`${brand.name} ${brand.adminTag}`} className="grid size-11 shrink-0 place-items-center rounded-full border border-gold/50 bg-gold-soft font-display text-sm font-semibold tracking-wider text-gold">
        {brand.monogram}
      </Link>
      <nav aria-label={t("menu")} className="mt-6 flex flex-1 flex-col items-center gap-2">
        {navItems.map(({ key, href, icon: Icon }) => {
          const active = isActive(pathname, href);
          return (
            <Link
              key={key}
              href={href}
              aria-current={active ? "page" : undefined}
              title={t(key)}
              className={cn(
                "grid size-11 place-items-center rounded-full transition",
                active ? "bg-ink text-paper shadow-[0_6px_18px_rgb(244_122_32/0.45)] light:shadow-none" : "text-foreground/70 hover:bg-secondary hover:text-foreground",
              )}
            >
              <Icon className="size-5" strokeWidth={1.7} />
              <span className="sr-only">{t(key)}</span>
            </Link>
          );
        })}
      </nav>
      <a
        href={brand.storefrontUrl}
        target="_blank"
        rel="noreferrer"
        title={t("openStore")}
        className="mt-2 grid size-11 place-items-center rounded-full text-muted-foreground transition hover:bg-secondary hover:text-foreground"
      >
        <ExternalLink className="size-5" strokeWidth={1.7} />
        <span className="sr-only">{t("openStore")}</span>
      </a>
    </aside>
  );
}
