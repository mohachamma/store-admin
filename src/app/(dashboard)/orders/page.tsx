import { Search } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Locale } from "@/i18n/config";
import { api, type OrderStatus } from "@/lib/api";
import { requireSession } from "@/lib/auth";
import { formatDZD } from "@/lib/format";
import { cn } from "@/lib/utils";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getTranslations("orders"))("title") };
}

export const statusVariant: Record<OrderStatus, "warning" | "info" | "secondary" | "success" | "danger"> = {
  pending: "warning", confirmed: "info", shipped: "info", delivered: "success", cancelled: "secondary", returned: "danger",
};
const STATUSES: OrderStatus[] = ["pending", "confirmed", "shipped", "delivered", "cancelled", "returned"];
const PAGE = 20;

export default async function OrdersPage({ searchParams }: { searchParams: Promise<{ status?: string; q?: string; page?: string }> }) {
  const sp = await searchParams;
  const status = STATUSES.includes(sp.status as OrderStatus) ? (sp.status as OrderStatus) : undefined;
  const q = sp.q?.trim() || undefined;
  const page = Math.max(1, Number(sp.page) || 1);
  const token = await requireSession();
  const locale = (await getLocale()) as Locale;
  const [t, ts, list] = await Promise.all([getTranslations("orders"), getTranslations("status"), api.listOrders(token, { status, q, limit: PAGE, offset: (page - 1) * PAGE }, locale)]);
  const href = (over: Record<string, string | undefined>) => {
    const p = new URLSearchParams();
    const merged = { status, q, ...over };
    for (const [k, v] of Object.entries(merged)) if (v) p.set(k, v);
    const s = p.toString();
    return `/orders${s ? `?${s}` : ""}`;
  };
  const date = (iso: string) => new Intl.DateTimeFormat(locale === "ar" ? "ar-DZ-u-nu-latn" : "fr-DZ", { dateStyle: "medium", timeStyle: "short" }).format(new Date(iso));
  const pages = Math.max(1, Math.ceil(list.total / PAGE));

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-3xl font-medium">{t("title")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t("subtitle")}</p>
      </div>

      <form action="/orders" className="flex gap-2">
        {status ? <input type="hidden" name="status" value={status} /> : null}
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute start-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input name="q" defaultValue={q} placeholder={t("search")} className="ps-11" dir="auto" />
        </div>
        <Button type="submit" variant="outline">{t("searchBtn")}</Button>
      </form>

      <nav className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 lg:mx-0 lg:px-0" aria-label={t("title")}>
        {[undefined, ...STATUSES].map((s) => (
          <Link key={s ?? "all"} href={href({ status: s, page: undefined })} className={cn("shrink-0 rounded-full border px-4 py-2 text-xs font-semibold transition", s === status ? "border-ink bg-ink text-paper" : "border-border hover:border-foreground")}>
            {s ? ts(s) : t("all")}
          </Link>
        ))}
      </nav>

      <p className="text-xs text-muted-foreground">{t("count", { count: list.total })}</p>

      {list.items.length === 0 ? (
        <p className="rounded-[var(--radius-card)] border border-dashed border-border py-16 text-center text-sm text-muted-foreground">{t("empty")}</p>
      ) : (
        <ul className="grid gap-3 lg:grid-cols-2">
          {list.items.map((o) => (
            <li key={o.id}>
              <Link href={`/orders/${o.id}`} className="block rounded-[var(--radius-card)] border border-border p-4 transition hover:border-foreground">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold" dir="ltr">#{o.orderNumber}</p>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                      {o.customerName ? `${o.customerName} · ` : ""}{o.wilaya} · {t("items", { count: o.itemCount })}
                    </p>
                  </div>
                  <Badge variant={statusVariant[o.status]}>{ts(o.status)}</Badge>
                </div>
                <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                  <span>{date(o.createdAt)}</span>
                  <span className="text-sm font-semibold text-foreground">{formatDZD(o.total, locale)}</span>
                </div>
              </Link>
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
