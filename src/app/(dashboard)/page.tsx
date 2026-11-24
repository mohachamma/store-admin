import { ArrowUpRight, PackagePlus, TrendingUp } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { Sparkbars } from "@/components/overview/Sparkbars";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Locale } from "@/i18n/config";
import { api, type OrderStatus } from "@/lib/api";
import { requireSession } from "@/lib/auth";
import { formatDZD } from "@/lib/format";
import { cn } from "@/lib/utils";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getTranslations("overview"))("title") };
}

const statusOrder: OrderStatus[] = ["pending", "confirmed", "shipped", "delivered", "cancelled", "returned"];
const statusColor: Record<OrderStatus, string> = {
  pending: "bg-amber-400",
  confirmed: "bg-sky-500",
  shipped: "bg-indigo-500",
  delivered: "bg-ink",
  cancelled: "bg-neutral-300",
  returned: "bg-red-400",
};

export default async function OverviewPage() {
  const token = await requireSession();
  const [t, ts, locale, data] = await Promise.all([
    getTranslations("overview"),
    getTranslations("status"),
    getLocale() as Promise<Locale>,
    api.getOverview(token),
  ]);
  const totalOrders = statusOrder.reduce((n, s) => n + data.ordersByStatus[s], 0);
  const money = (n: number) => formatDZD(n, locale);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl uppercase tracking-[0.08em]">{t("title")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t("subtitle")}</p>
      </div>

      {/* KPI row — the black card mirrors the storefront's black pill CTA. */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        <div className="col-span-2 flex flex-col justify-between gap-4 rounded-[var(--radius-card)] bg-ink p-5 text-paper">
          <div className="flex items-start justify-between">
            <div>
              <p className="label text-paper/60">
                {t("revenue")} · {t("today")}
              </p>
              <p className="mt-2 font-display text-3xl tracking-wide lg:text-4xl">{money(data.revenue.today)}</p>
            </div>
            <span className="grid size-9 place-items-center rounded-full bg-paper/10">
              <TrendingUp className="size-4" />
            </span>
          </div>
          <Sparkbars values={data.revenueLast7Days} />
        </div>
        <Kpi label={t("newOrdersToday")} value={String(data.newOrdersToday)} hint={t("pendingHint", { count: data.ordersByStatus.pending })} icon={<PackagePlus className="size-4" />} href="/orders" />
        <div className="grid gap-3 lg:gap-4">
          <MiniKpi label={t("week")} value={money(data.revenue.week)} />
          <MiniKpi label={t("month")} value={money(data.revenue.month)} />
        </div>
      </div>

      {/* Orders by status */}
      <Card>
        <CardHeader>
          <CardTitle>{t("ordersByStatus")}</CardTitle>
          <Link href="/orders" className="text-xs text-muted-foreground hover:text-foreground">
            {t("viewAll")}
          </Link>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex h-2.5 overflow-hidden rounded-full bg-secondary" aria-hidden>
            {statusOrder.map((s) => (
              <div key={s} className={statusColor[s]} style={{ width: `${(data.ordersByStatus[s] / totalOrders) * 100}%` }} />
            ))}
          </div>
          <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
            {statusOrder.map((s) => (
              <li key={s} className="rounded-2xl bg-secondary px-3 py-2.5">
                <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  <span className={cn("size-2 rounded-full", statusColor[s])} />
                  {ts(s)}
                </div>
                <p className="mt-1 text-lg font-semibold tabular-nums">{data.ordersByStatus[s]}</p>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t("topProducts")}</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="divide-y divide-border">
              {data.topProducts.map((p, i) => (
                <li key={p.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                  <span className="w-4 text-center text-xs font-semibold text-muted-foreground">{i + 1}</span>
                  <Thumb src={p.image} />
                  <div className="min-w-0 flex-1">
                    <p className="label truncate">{p.name}</p>
                    <p className="text-xs text-muted-foreground">{t("sold", { count: p.unitsSold })}</p>
                  </div>
                  <p className="text-sm font-semibold">{money(p.revenue)}</p>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("lowStock")}</CardTitle>
            <Link href="/products" className="text-xs text-muted-foreground hover:text-foreground">
              {t("viewAll")}
            </Link>
          </CardHeader>
          <CardContent>
            <ul className="divide-y divide-border">
              {data.lowStock.map((v) => (
                <li key={v.variantId} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                  <Thumb src={v.image} />
                  <div className="min-w-0 flex-1">
                    <p className="label truncate">{v.productName}</p>
                    <p className="text-xs text-muted-foreground">{t("size", { size: v.size })}</p>
                  </div>
                  <Badge variant={v.stock === 0 ? "danger" : "warning"}>{v.stock === 0 ? t("outOfStock") : t("left", { count: v.stock })}</Badge>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Kpi({ label, value, hint, icon, href }: { label: string; value: string; hint: string; icon: React.ReactNode; href: string }) {
  return (
    <Link href={href} className="group flex flex-col justify-between gap-3 rounded-[var(--radius-card)] bg-secondary p-5 transition hover:bg-secondary/70">
      <div className="flex items-start justify-between gap-2">
        <p className="label leading-snug text-muted-foreground">{label}</p>
        <span className="grid size-8 shrink-0 place-items-center rounded-full bg-background">{icon}</span>
      </div>
      <div>
        <p className="font-display text-4xl">{value}</p>
        <p className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground">
          {hint}
          <ArrowUpRight className="size-3 rtl:-scale-x-100" />
        </p>
      </div>
    </Link>
  );
}

function MiniKpi({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[var(--radius-card)] border border-border px-4 py-3">
      <p className="label text-muted-foreground">{label}</p>
      <p className="mt-1 text-lg font-semibold">{value}</p>
    </div>
  );
}

function Thumb({ src }: { src: string }) {
  return (
    <span className="grid size-12 shrink-0 place-items-center overflow-hidden rounded-xl bg-secondary p-1.5">
      {/* eslint-disable-next-line @next/next/no-img-element -- small placeholder thumbnails; switch to next/image with real photos */}
      <img src={src} alt="" className="size-full object-contain" />
    </span>
  );
}
