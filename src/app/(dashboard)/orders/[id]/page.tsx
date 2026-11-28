import { ArrowRight, MessageCircle, Phone } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { ConfirmSubmit } from "@/components/form/ConfirmSubmit";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Locale } from "@/i18n/config";
import { api } from "@/lib/api";
import { requireSession } from "@/lib/auth";
import { formatDZD } from "@/lib/format";
import { cn } from "@/lib/utils";
import { refreshTrackingAction, setStatusAction } from "../actions";
import { statusVariant } from "../page";
import { ConfirmOrderForm } from "./ConfirmOrderForm";
import { PrintButton } from "./PrintButton";

export const metadata: Metadata = { title: "Order" };

export default async function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const token = await requireSession();
  const locale = (await getLocale()) as Locale;
  const [t, ts] = await Promise.all([getTranslations("orders"), getTranslations("status")]);
  const delivery = await api.getDelivery(token).catch(() => null);
  const active = delivery?.providers.find((p) => p.id === delivery.provider);
  const autoCompany = active && active.id !== "manual" && active.configured ? active.name : null;
  const o = await api.getOrder(token, id, locale).catch((e: { status?: number }) => {
    if (e.status === 404 || e.status === 422) notFound();
    throw e;
  });
  const money = (n: number) => formatDZD(n, locale);
  const when = new Intl.DateTimeFormat(locale === "ar" ? "ar-DZ-u-nu-latn" : "fr-DZ", { dateStyle: "medium", timeStyle: "short" }).format(new Date(o.createdAt));
  const next = { confirmed: ["shipped"], shipped: ["delivered", "returned"], delivered: ["returned"], pending: [], cancelled: [], returned: [] }[o.status] as ("shipped" | "delivered" | "returned")[];
  const label = { shipped: t("markShipped"), delivered: t("markDelivered"), returned: t("markReturned") };
  const canCancel = o.status === "pending" || o.status === "confirmed";

  return (
    <div className="space-y-5">
      <Link href="/orders" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground print:hidden">
        <ArrowRight className="size-3.5 ltr:rotate-180" /> {t("back")}
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl tracking-[0.06em]" dir="ltr">#{o.orderNumber}</h1>
          <p className="mt-1 text-xs text-muted-foreground">{when} · {o.wilaya} · {t(o.deliveryType)}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={statusVariant[o.status]}>{ts(o.status)}</Badge>
          <PrintButton label={t("print")} />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr] lg:items-start">
        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle>{t("products")}</CardTitle></CardHeader>
            <CardContent>
              <ul className="divide-y divide-border">
                {o.items.map((i) => (
                  <li key={i.id} className="flex items-center justify-between gap-3 py-3 first:pt-0">
                    <div className="min-w-0">
                      <p className="label truncate">{i.name}</p>
                      <p className="text-xs text-muted-foreground">{i.size}{i.color ? ` · ${i.color}` : ""} × {i.quantity} · {money(i.unitPrice)}</p>
                    </div>
                    <p className="text-sm font-semibold">{money(i.lineTotal)}</p>
                  </li>
                ))}
              </ul>
              <dl className="mt-3 space-y-2 border-t border-border pt-4 text-sm">
                <Line k={t("subtotal")} v={money(o.subtotal)} />
                <Line k={t("shipping")} v={o.shippingFee === 0 ? t("free") : money(o.shippingFee)} />
                {o.discountTotal > 0 ? <Line k={`${t("discount")}${o.discountCode ? ` (${o.discountCode})` : ""}`} v={`-${money(o.discountTotal)}`} /> : null}
                <div className="flex items-center justify-between border-t border-border pt-3 text-base font-semibold"><dt>{t("total")}</dt><dd>{money(o.total)}</dd></div>
                <Line k={t("payment")} v={`${t(o.paymentMethod)} · ${t(o.paymentStatus)}`} />
              </dl>
            </CardContent>
          </Card>

          {o.trackingNumber ? (
            <Card>
              <CardContent className="space-y-1 text-sm">
                <p><span className="text-muted-foreground">{t("company")}:</span> {o.deliveryCompany}</p>
                <p><span className="text-muted-foreground">{t("tracking")}:</span> <strong dir="ltr">{o.trackingNumber}</strong></p>
                {o.deliveryStatus ? <p><span className="text-muted-foreground">{t("deliveryStatus")}:</span> <span dir="ltr">{o.deliveryStatus}</span></p> : null}
                {o.deliveryCompany && o.deliveryCompany !== "manual" && ["confirmed", "shipped"].includes(o.status) ? (
                  <form action={refreshTrackingAction.bind(null, o.id)} className="pt-1 print:hidden">
                    <button type="submit" className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>{t("refreshTracking")}</button>
                  </form>
                ) : null}
              </CardContent>
            </Card>
          ) : null}
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle>{t("customer")}</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
              {o.customer ? (
                <>
                  <dl className="space-y-1.5">
                    <Line k={t("name")} v={o.customer.name} />
                    <Line k={t("phone")} v={<span dir="ltr">{o.customer.phone}</span>} />
                    <Line k={t("commune")} v={`${o.customer.commune}${o.customer.daira ? ` (${o.customer.daira})` : ""}`} />
                    <Line k={t("address")} v={o.customer.address} />
                  </dl>
                  <div className="flex flex-wrap gap-2 print:hidden">
                    <a href={o.customer.telUrl} className={cn(buttonVariants({ variant: "outline", size: "sm" }))}><Phone /> {t("call")}</a>
                    <a href={o.customer.whatsappAskUrl} target="_blank" rel="noopener noreferrer" className={cn(buttonVariants({ size: "sm" }), "bg-[#128c4a] text-white hover:bg-[#128c4a]/90")}><MessageCircle /> {t("whatsappAsk")}</a>
                  </div>
                  <p className="text-xs text-muted-foreground">{t("pendingHint")}</p>
                </>
              ) : (
                <p className="text-xs leading-relaxed text-muted-foreground">{t("customerHidden")}</p>
              )}
            </CardContent>
          </Card>

          {o.status === "pending" ? (
            <Card className="print:hidden">
              <CardHeader><CardTitle>{t("confirm")}</CardTitle></CardHeader>
              <CardContent><ConfirmOrderForm id={o.id} autoCompany={autoCompany} /></CardContent>
            </Card>
          ) : null}

          {next.length > 0 || canCancel ? (
            <Card className="print:hidden">
              <CardHeader><CardTitle>{t("actions")}</CardTitle></CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {next.map((s) => (
                  <form key={s} action={setStatusAction.bind(null, o.id, s)}>
                    <button type="submit" className={cn(buttonVariants({ size: "sm", variant: s === "returned" ? "outline" : "default" }))}>{label[s]}</button>
                  </form>
                ))}
                {canCancel ? (
                  <form action={setStatusAction.bind(null, o.id, "cancelled")}>
                    <ConfirmSubmit message={t("confirmCancel")} className={cn(buttonVariants({ size: "sm", variant: "outline" }), "text-destructive")}>{t("cancel")}</ConfirmSubmit>
                  </form>
                ) : null}
              </CardContent>
            </Card>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function Line({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="text-muted-foreground">{k}</dt>
      <dd className="text-end">{v}</dd>
    </div>
  );
}
