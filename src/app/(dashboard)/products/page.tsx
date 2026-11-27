import { Eye, EyeOff, Package, Plus, Search, Warehouse } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Locale } from "@/i18n/config";
import { api } from "@/lib/api";
import { requireSession } from "@/lib/auth";
import { formatDZD } from "@/lib/format";
import { cn } from "@/lib/utils";
import { AudienceSelect } from "./AudienceSelect";
import { publishProductAction } from "./actions";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getTranslations("products"))("title") };
}

const PAGE = 20;

export default async function ProductsPage({ searchParams }: { searchParams: Promise<{ q?: string; status?: string; page?: string }> }) {
  const sp = await searchParams;
  const status = sp.status === "published" || sp.status === "draft" ? sp.status : undefined;
  const q = sp.q?.trim() || undefined;
  const page = Math.max(1, Number(sp.page) || 1);
  const token = await requireSession();
  const locale = (await getLocale()) as Locale;
  const [t, list] = await Promise.all([getTranslations("products"), api.listProducts(token, { q, status, limit: PAGE, offset: (page - 1) * PAGE }, locale)]);
  const href = (over: Record<string, string | undefined>) => {
    const p = new URLSearchParams();
    for (const [k, v] of Object.entries({ q, status, ...over })) if (v) p.set(k, v);
    const s = p.toString();
    return `/products${s ? `?${s}` : ""}`;
  };
  const pages = Math.max(1, Math.ceil(list.total / PAGE));

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl uppercase tracking-[0.08em]">{t("title")}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t("subtitle")}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/products/inventory" className={cn(buttonVariants({ variant: "outline" }))}><Warehouse /> {t("inventory")}</Link>
          <Link href="/products/new" className={cn(buttonVariants())}><Plus /> {t("add")}</Link>
        </div>
      </div>

      <form action="/products" className="flex gap-2">
        {status ? <input type="hidden" name="status" value={status} /> : null}
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute start-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input name="q" defaultValue={q} placeholder={t("search")} className="ps-11" dir="auto" />
        </div>
        <Button type="submit" variant="outline">{t("search").split(" ")[0]}</Button>
      </form>

      <nav className="flex gap-2" aria-label={t("title")}>
        {([undefined, "published", "draft"] as const).map((s) => (
          <Link key={s ?? "all"} href={href({ status: s, page: undefined })} className={cn("rounded-full border px-4 py-2 text-xs font-semibold transition", s === status ? "border-ink bg-ink text-paper" : "border-border hover:border-foreground")}>
            {s ? t(s) : t("all")}
          </Link>
        ))}
      </nav>
      <p className="text-xs text-muted-foreground">{t("count", { count: list.total })}</p>

      {list.items.length === 0 ? (
        <p className="rounded-[var(--radius-card)] border border-dashed border-border py-16 text-center text-sm text-muted-foreground">{t("empty")}</p>
      ) : (
        <ul className="grid gap-3 lg:grid-cols-2">
          {list.items.map((p) => (
            <li key={p.id} className="flex items-center gap-3 rounded-[var(--radius-card)] border border-border p-3">
              <Link href={`/products/${p.id}`} className="grid size-20 shrink-0 place-items-center overflow-hidden rounded-2xl bg-secondary p-1.5">
                {p.image ? (
                  // eslint-disable-next-line @next/next/no-img-element -- admin thumbnails of uploaded photos
                  <img src={p.image} alt="" className="size-full object-contain" />
                ) : (
                  <Package className="size-6 text-muted-foreground" strokeWidth={1.5} />
                )}
              </Link>
              <Link href={`/products/${p.id}`} className="min-w-0 flex-1">
                <p className="label truncate">{p.name}</p>
                <p className="mt-0.5 truncate text-xs text-muted-foreground">{p.categoryName}</p>
                <p className="mt-1 text-sm font-semibold">
                  {p.price === null ? t("noVariants") : formatDZD(p.price, locale)}
                  {p.compareAtPrice ? <s className="ms-2 text-xs font-normal text-muted-foreground">{formatDZD(p.compareAtPrice, locale)}</s> : null}
                </p>
                <p className="text-[11px] text-muted-foreground">{t("variants", { n: p.variantCount })} · {t("stock", { n: p.totalStock })}</p>
              </Link>
              <div className="flex shrink-0 flex-col items-end gap-2">
                <AudienceSelect id={p.id} value={p.audience} />
                <Badge variant={p.isPublished ? "success" : "secondary"}>{p.isPublished ? t("published") : t("draft")}</Badge>
                <form action={publishProductAction.bind(null, p.id, !p.isPublished)}>
                  <button type="submit" className="flex items-center gap-1 rounded-full px-2 py-1 text-[11px] text-muted-foreground transition hover:bg-secondary hover:text-foreground">
                    {p.isPublished ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                    {p.isPublished ? t("hide") : t("publish")}
                  </button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}

      {pages > 1 ? (
        <div className="flex items-center justify-between pt-2 text-xs">
          {page > 1 ? <Link href={href({ page: String(page - 1) })} className="rounded-full border border-border px-4 py-2 font-semibold">{t("prev")}</Link> : <span />}
          <span className="text-muted-foreground">{page} / {pages}</span>
          {page < pages ? <Link href={href({ page: String(page + 1) })} className="rounded-full border border-border px-4 py-2 font-semibold">{t("next")}</Link> : <span />}
        </div>
      ) : null}
    </div>
  );
}
