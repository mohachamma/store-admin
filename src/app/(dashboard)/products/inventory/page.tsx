import type { Metadata } from "next";
import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Locale } from "@/i18n/config";
import { api } from "@/lib/api";
import { requireSession } from "@/lib/auth";
import { InventoryTable } from "./InventoryTable";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getTranslations("inventory"))("title") };
}

const PAGE = 100;

export default async function InventoryPage({ searchParams }: { searchParams: Promise<{ q?: string; low?: string; page?: string }> }) {
  const sp = await searchParams;
  const q = sp.q?.trim() || undefined;
  const low = sp.low === "1";
  const page = Math.max(1, Number(sp.page) || 1);
  const token = await requireSession();
  const locale = (await getLocale()) as Locale;
  const [t, tp, list] = await Promise.all([getTranslations("inventory"), getTranslations("products"), api.listVariants(token, { q, lowStock: low, limit: PAGE, offset: (page - 1) * PAGE }, locale)]);
  const pages = Math.max(1, Math.ceil(list.total / PAGE));
  const href = (over: Record<string, string | undefined>) => {
    const p = new URLSearchParams();
    for (const [k, v] of Object.entries({ q, low: low ? "1" : undefined, ...over })) if (v) p.set(k, v);
    return `/products/inventory${p.toString() ? `?${p}` : ""}`;
  };

  return (
    <div className="space-y-5">
      <div>
        <Link href="/products" className="text-xs text-muted-foreground hover:text-foreground">← {tp("back")}</Link>
        <h1 className="mt-2 font-display text-3xl font-medium">{t("title")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t("subtitle")}</p>
      </div>
      <form action="/products/inventory" className="flex flex-wrap items-center gap-3">
        <Input name="q" defaultValue={q} placeholder={t("search")} className="min-w-52 flex-1" dir="auto" />
        <label className="flex items-center gap-2 text-xs font-medium">
          <input type="checkbox" name="low" value="1" defaultChecked={low} className="size-4 accent-ink" /> {t("lowOnly")}
        </label>
        <Button type="submit" variant="outline">{tp("search").split(" ")[0]}</Button>
      </form>
      {list.items.length === 0 ? (
        <p className="rounded-[var(--radius-card)] border border-dashed border-border py-16 text-center text-sm text-muted-foreground">{t("empty")}</p>
      ) : (
        <InventoryTable key={`${q}-${low}-${page}`} rows={list.items} />
      )}
      {pages > 1 ? (
        <div className="flex items-center justify-between pt-2 text-xs">
          {page > 1 ? <Link href={href({ page: String(page - 1) })} className="rounded-full border border-border px-4 py-2 font-semibold">{tp("prev")}</Link> : <span />}
          <span className="text-muted-foreground">{page} / {pages}</span>
          {page < pages ? <Link href={href({ page: String(page + 1) })} className="rounded-full border border-border px-4 py-2 font-semibold">{tp("next")}</Link> : <span />}
        </div>
      ) : null}
    </div>
  );
}
