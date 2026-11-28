import type { Metadata } from "next";
import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Locale } from "@/i18n/config";
import { api } from "@/lib/api";
import { requireSession } from "@/lib/auth";
import { formatDZD } from "@/lib/format";
import { PERIODS, rangeOf, ymd, type Period } from "@/lib/periods";
import { cn } from "@/lib/utils";
import { LinkBuilder } from "./LinkBuilder";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getTranslations("ads"))("title") };
}

export default async function AdsPage({ searchParams }: { searchParams: Promise<{ period?: string; from?: string; to?: string }> }) {
  const token = await requireSession();
  const locale = (await getLocale()) as Locale;
  const sp = await searchParams;
  const period: Period = PERIODS.includes(sp.period as Period) ? (sp.period as Period) : "month";
  const range = rangeOf(period, ymd(new Date()), sp.from, sp.to);
  const [t, report] = await Promise.all([getTranslations("ads"), api.getAds(token, range)]);
  const money = (n: number) => formatDZD(n, locale);
  const signed = (n: number) => `${n < 0 ? "−" : ""}${money(Math.abs(n))}`;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-medium">{t("title")}</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{t("subtitle")}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("builderTitle")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-xs text-muted-foreground">{t("builderHint")}</p>
          <LinkBuilder />
        </CardContent>
      </Card>

      <section className="space-y-3">
        <h2 className="font-display text-xl font-medium">{t("resultsTitle")}</h2>
        <div className="space-y-3">
          <div className="no-scrollbar flex gap-2 overflow-x-auto">
            {PERIODS.filter((p) => p !== "custom").map((p) => (
              <Link key={p} href={`/ads?period=${p}`} className={cn("shrink-0 rounded-full border px-4 py-2 text-xs font-semibold transition", p === period ? "border-ink bg-ink text-paper" : "border-border hover:border-foreground")}>
                {t(`period.${p}`)}
              </Link>
            ))}
          </div>
          <form method="get" className="flex flex-wrap items-center gap-2 text-xs">
            <input type="hidden" name="period" value="custom" />
            <input type="date" name="from" dir="ltr" defaultValue={range.from} aria-label={t("from")} className="h-9 rounded-full border border-border bg-transparent px-3" />
            <span className="text-muted-foreground">→</span>
            <input type="date" name="to" dir="ltr" defaultValue={range.to} aria-label={t("to")} className="h-9 rounded-full border border-border bg-transparent px-3" />
            <button type="submit" className={cn("h-9 rounded-full border px-4 font-semibold transition", period === "custom" ? "border-ink bg-ink text-paper" : "border-border hover:border-foreground")}>
              {t("period.custom")}
            </button>
          </form>
        </div>

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Total label={t("totalSpend")} value={money(report.totals.spend)} />
          <Total label={t("totalSales")} value={money(report.totals.sales)} />
          <Total label={t("totalProfit")} value={signed(report.totals.profit)} />
          <Total label={t("totalNet")} value={signed(report.totals.netProfit)} strong negative={report.totals.netProfit < 0} />
        </div>

        {report.campaigns.length === 0 ? (
          <p className="rounded-[var(--radius-card)] border border-dashed border-border py-10 text-center text-sm text-muted-foreground">{t("empty")}</p>
        ) : (
          <ul className="divide-y divide-border rounded-[var(--radius-card)] border border-border">
            {report.campaigns.map((c) => {
              const direct = !c.source && !c.campaign;
              return (
                <li key={`${c.source}|${c.campaign}`} className="space-y-2 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="min-w-0 truncate text-sm font-semibold" dir="auto">
                      {direct ? t("direct") : [c.source, c.campaign].filter(Boolean).join(" · ")}
                    </p>
                    <p className={cn("shrink-0 text-sm font-semibold tabular-nums", c.netProfit < 0 ? "text-destructive" : "text-emerald-400 light:text-emerald-700")} dir="ltr">
                      {signed(c.netProfit)}
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {t("orderLine", { orders: c.orders, delivered: c.delivered, returned: c.returned, progress: c.inProgress })}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {t("moneyLine", { spend: money(c.spend), sales: money(c.sales), profit: signed(c.profit) })}
                    {c.roas !== null ? ` · ${t("roas", { n: c.roas })}` : ""}
                    {c.costPerOrder !== null ? ` · ${t("perOrder", { n: money(c.costPerOrder) })}` : ""}
                  </p>
                </li>
              );
            })}
          </ul>
        )}
        <p className="text-[11px] text-muted-foreground">{t("rule")}</p>
      </section>
    </div>
  );
}

function Total({ label, value, strong, negative }: { label: string; value: string; strong?: boolean; negative?: boolean }) {
  return (
    <div className="flex flex-col justify-between gap-2 rounded-[var(--radius-card)] bg-card px-5 py-4 shadow-[var(--shadow-card)] backdrop-blur-xl light:border light:border-border">
      <p className="label text-muted-foreground">{label}</p>
      <p className={cn("tabular-nums", strong ? "font-display text-2xl" : "text-lg font-semibold", negative && "text-destructive")} dir="ltr">{value}</p>
    </div>
  );
}
