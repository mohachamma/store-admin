import { AlertTriangle, Pencil, Plus, Settings2 } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { DeleteButton } from "@/components/form/DeleteButton";
import { FormSheet } from "@/components/form/FormSheet";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Locale } from "@/i18n/config";
import { api } from "@/lib/api";
import { requireSession } from "@/lib/auth";
import { formatDZD } from "@/lib/format";
import { PERIODS, rangeOf, ymd, type Period } from "@/lib/periods";
import { cn } from "@/lib/utils";
import { deleteExpenseAction, saveExpenseAction, saveProfitSettingsAction } from "./actions";
import { ExpenseForm } from "./ExpenseForm";
import { SettingsForm } from "./SettingsForm";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getTranslations("profit"))("title") };
}

export default async function ProfitPage({ searchParams }: { searchParams: Promise<{ period?: string; from?: string; to?: string }> }) {
  const token = await requireSession();
  const locale = (await getLocale()) as Locale;
  const sp = await searchParams;
  const today = ymd(new Date());
  const period: Period = PERIODS.includes(sp.period as Period) ? (sp.period as Period) : "month";
  const range = rangeOf(period, today, sp.from, sp.to);
  const [t, report, expenses, settings] = await Promise.all([getTranslations("profit"), api.getProfit(token, range, locale), api.listExpenses(token, range), api.getProfitSettings(token)]);
  const money = (n: number) => formatDZD(n, locale);
  const d = report.delivered;
  const r = report.returned;
  const ads = report.expenses.byCategory.find((c) => c.category === "ads")?.amount ?? 0;
  const otherExpenses = report.expenses.total - ads;
  const returnLoss = r.deliveryLoss + r.returnFees + r.lostGoods;
  const revenue = d.sales + d.shippingCollected;
  const totalCosts = d.productCost + d.deliveryCost + d.cardFees + returnLoss + report.expenses.total;
  const loss = report.netProfit < 0;
  const margin = revenue > 0 ? Math.round((report.netProfit / revenue) * 100) : null;
  const round = "grid size-9 place-items-center rounded-full transition hover:bg-secondary";

  const lines: { label: string; value: number; sign: "+" | "-"; hint?: string }[] = [
    { label: t("lineSales"), value: d.sales, sign: "+", hint: t("ordersDelivered", { n: d.orders }) },
    { label: t("lineShippingIn"), value: d.shippingCollected, sign: "+" },
    { label: t("lineProductCost"), value: d.productCost, sign: "-" },
    { label: t("lineDeliveryCost"), value: d.deliveryCost, sign: "-" },
    ...(d.cardFees ? [{ label: t("lineCardFees"), value: d.cardFees, sign: "-" as const }] : []),
    { label: t("lineReturns"), value: returnLoss, sign: "-", hint: t("ordersReturned", { n: r.orders, pct: report.returnRatePercent }) },
    { label: t("lineAds"), value: ads, sign: "-" },
    { label: t("lineOther"), value: otherExpenses, sign: "-" },
  ];

  const href = (p: Period) => `/profit?period=${p}`;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-medium">{t("title")}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t("subtitle")}</p>
        </div>
        <FormSheet trigger={<><Settings2 className="size-4" /> {t("settings")}</>} triggerClassName={cn(buttonVariants({ variant: "outline" }))} title={t("settings")} description={t("settingsHint")} action={saveProfitSettingsAction}>
          <SettingsForm settings={settings} />
        </FormSheet>
      </div>

      {/* Period */}
      <div className="space-y-3">
        <div className="no-scrollbar flex gap-2 overflow-x-auto">
          {PERIODS.filter((p) => p !== "custom").map((p) => (
            <Link key={p} href={href(p)} className={cn("shrink-0 rounded-full border px-4 py-2 text-xs font-semibold transition", p === period ? "border-ink bg-ink text-paper" : "border-border hover:border-foreground")}>
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

      {/* Warnings that make the number less reliable */}
      {report.warnings.itemsWithoutCost > 0 || report.warnings.activeWilayasWithoutDeliveryCost > 0 ? (
        <div className="space-y-2 rounded-[var(--radius-card)] border border-amber-400/40 bg-amber-400/10 p-4 text-sm">
          <p className="flex items-center gap-2 font-semibold"><AlertTriangle className="size-4" /> {t("warnTitle")}</p>
          {report.warnings.itemsWithoutCost > 0 ? (
            <p className="text-xs">
              {t("warnCost", { n: report.warnings.itemsWithoutCost })} <Link href="/products/inventory" className="font-semibold underline">{t("warnCostLink")}</Link>
            </p>
          ) : null}
          {report.warnings.activeWilayasWithoutDeliveryCost > 0 ? (
            <p className="text-xs">
              {t("warnDelivery", { n: report.warnings.activeWilayasWithoutDeliveryCost })} <Link href="/shipping" className="font-semibold underline">{t("warnDeliveryLink")}</Link>
            </p>
          ) : null}
        </div>
      ) : null}

      {/* Headline numbers */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        <div className={cn("blob col-span-2 flex flex-col justify-between gap-3 p-6 shadow-[var(--shadow-card)]", loss ? "bg-gradient-to-br from-[#d9604f] to-[#a63a2c] text-white light:bg-none light:bg-destructive" : "bg-gradient-to-br from-[#f98b3a] to-[#d4600f] text-paper shadow-[0_14px_40px_rgb(244_122_32/0.3)] light:bg-none light:bg-ink light:shadow-none")}>
          <p className="label opacity-70">{t("netProfit")}</p>
          <p className="font-display text-4xl tabular-nums lg:text-5xl" dir="ltr">{loss ? "−" : ""}{money(Math.abs(report.netProfit))}</p>
          <p className="text-xs opacity-75">{margin !== null ? t("margin", { pct: margin }) : t("noSales")}</p>
        </div>
        <Mini label={t("revenue")} value={money(revenue)} />
        <Mini label={t("totalCosts")} value={money(totalCosts)} />
      </div>

      {/* How it is calculated */}
      <Card>
        <CardHeader>
          <CardTitle>{t("howTitle")}</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="divide-y divide-border">
            {lines.map((l) => (
              <li key={l.label} className="flex items-center justify-between gap-3 py-3 first:pt-0">
                <div className="min-w-0">
                  <p className="text-sm font-medium">{l.label}</p>
                  {l.hint ? <p className="text-xs text-muted-foreground">{l.hint}</p> : null}
                </div>
                <p className={cn("shrink-0 text-sm font-semibold tabular-nums", l.sign === "+" ? "text-emerald-400 light:text-emerald-700" : l.value === 0 ? "text-muted-foreground" : "")} dir="ltr">
                  {l.sign === "+" ? "+" : l.value === 0 ? "" : "−"}{money(l.value)}
                </p>
              </li>
            ))}
            <li className="flex items-center justify-between gap-3 pb-0 pt-4">
              <p className="font-display text-lg">{t("netProfit")}</p>
              <p className={cn("font-display text-xl tabular-nums", loss ? "text-destructive" : "")} dir="ltr">{loss ? "−" : ""}{money(Math.abs(report.netProfit))}</p>
            </li>
          </ul>
          <p className="mt-4 text-[11px] text-muted-foreground">{t("rule")}</p>
        </CardContent>
      </Card>

      {/* Profit per product: the return cost stays with the product, also when it is resold later */}
      <section className="space-y-3">
        <div>
          <h2 className="font-display text-xl font-medium">{t("byProduct")}</h2>
          <p className="text-xs text-muted-foreground">{t("byProductHint")}</p>
        </div>
        {report.byProduct.length === 0 ? (
          <p className="rounded-[var(--radius-card)] border border-dashed border-border py-10 text-center text-sm text-muted-foreground">{t("noProducts")}</p>
        ) : (
          <ul className="divide-y divide-border rounded-[var(--radius-card)] border border-border">
            {report.byProduct.map((p) => (
              <li key={p.key} className="space-y-1 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="min-w-0 truncate text-sm font-semibold">{p.name}</p>
                  <p className={cn("shrink-0 text-sm font-semibold tabular-nums", p.profit < 0 ? "text-destructive" : "text-emerald-400 light:text-emerald-700")} dir="ltr">
                    {p.profit < 0 ? "−" : "+"}{money(Math.abs(p.profit))}
                  </p>
                </div>
                <p className="text-xs text-muted-foreground">
                  {t("productLine", { sold: p.unitsSold, returned: p.unitsReturned, sales: money(p.sales), cost: money(p.productCost), delivery: money(p.deliveryCost), loss: money(p.returnLoss) })}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Expenses */}
      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-display text-xl font-medium">{t("expenses")}</h2>
          <FormSheet trigger={<><Plus className="size-4" /> {t("addExpense")}</>} triggerClassName={cn(buttonVariants({ size: "sm" }))} title={t("addExpense")} action={saveExpenseAction}>
            <ExpenseForm today={today} />
          </FormSheet>
        </div>
        {expenses.length === 0 ? (
          <p className="rounded-[var(--radius-card)] border border-dashed border-border py-10 text-center text-sm text-muted-foreground">{t("noExpenses")}</p>
        ) : (
          <ul className="divide-y divide-border rounded-[var(--radius-card)] border border-border">
            {expenses.map((e) => (
              <li key={e.id} className="flex items-center gap-3 p-4">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">
                    {t(`cat.${e.category}`)}
                    {e.platform ? <span className="text-muted-foreground"> · {e.platform}</span> : null}
                  </p>
                  <p className="truncate text-xs text-muted-foreground"><span dir="ltr">{e.spentOn}</span>{e.note ? ` · ${e.note}` : ""}</p>
                </div>
                <p className="text-sm font-semibold tabular-nums" dir="ltr">{money(e.amount)}</p>
                <FormSheet trigger={<Pencil className="size-4" strokeWidth={1.8} />} triggerClassName={round} title={t("editExpense")} action={saveExpenseAction}>
                  <ExpenseForm expense={e} today={today} />
                </FormSheet>
                <form action={deleteExpenseAction.bind(null, e.id)}>
                  <DeleteButton />
                </form>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col justify-between gap-2 rounded-[var(--radius-card)] bg-card px-5 py-4 shadow-[var(--shadow-card)] backdrop-blur-xl light:border light:border-border">
      <p className="label text-muted-foreground">{label}</p>
      <p className="text-lg font-semibold tabular-nums" dir="ltr">{value}</p>
    </div>
  );
}
