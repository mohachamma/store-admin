import { Pencil, Plus } from "lucide-react";
import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { DeleteButton } from "@/components/form/DeleteButton";
import { FormSheet } from "@/components/form/FormSheet";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { api } from "@/lib/api";
import { requireSession } from "@/lib/auth";
import { withStatus, type OfferStatus } from "@/lib/offers";
import { cn } from "@/lib/utils";
import { deleteOfferAction, saveOfferAction } from "./actions";
import { OfferForm } from "./OfferForm";
import { SalePageForm } from "./SalePageForm";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getTranslations("offers"))("title") };
}

const statusVariant: Record<OfferStatus, "success" | "info" | "secondary" | "warning"> = {
  live: "success",
  scheduled: "info",
  expired: "secondary",
  off: "warning",
};

export default async function OffersPage() {
  const token = await requireSession();
  const [t, locale, raw, sale] = await Promise.all([getTranslations("offers"), getLocale() as Promise<"ar" | "fr">, api.listOffers(token), api.getSalePage(token)]);
  const offers = withStatus(raw);
  const fmt = (iso: string) => new Intl.DateTimeFormat(locale === "ar" ? "ar-DZ-u-nu-latn" : "fr-DZ", { dateStyle: "medium", timeStyle: "short" }).format(new Date(iso));
  const round = "grid size-9 place-items-center rounded-full transition hover:bg-secondary";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl uppercase tracking-[0.08em]">{t("title")}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t("subtitle")}</p>
        </div>
        <FormSheet
          trigger={<><Plus className="size-4" /> {t("add")}</>}
          triggerClassName={cn(buttonVariants())}
          title={t("add")}
          action={saveOfferAction}
        >
          <OfferForm />
        </FormSheet>
      </div>

      {offers.length === 0 ? (
        <p className="rounded-[var(--radius-card)] border border-dashed border-border py-16 text-center text-sm text-muted-foreground">{t("empty")}</p>
      ) : (
        <ul className="grid gap-4 md:grid-cols-2">
          {offers.map((o) => (
            <li key={o.id}>
              <Card className="overflow-hidden">
                <div className={cn("flex min-h-28 items-stretch", o.theme === "dark" ? "bg-ink text-paper" : "bg-secondary")}>
                  {o.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element -- admin preview of uploaded image
                    <img src={o.imageUrl} alt="" className="w-28 shrink-0 object-cover" />
                  ) : null}
                  <div className="min-w-0 flex-1 space-y-1 p-4">
                    {o.label[locale] || o.label.ar ? <p className="label opacity-70">{o.label[locale] || o.label.ar}</p> : null}
                    <p className="text-base font-semibold leading-snug">{o.title[locale] || o.title.ar}</p>
                    {o.subtitle.ar ? <p className="text-sm opacity-80">{o.subtitle[locale] || o.subtitle.ar}</p> : null}
                  </div>
                </div>
                <CardContent className="flex items-center justify-between gap-3 p-4">
                  <div className="min-w-0 space-y-1.5">
                    <Badge variant={statusVariant[o.status]}>{t(`status.${o.status}`)}</Badge>
                    {o.endsAt ? <p className="text-[11px] text-muted-foreground">{t("endsAt")}: {fmt(o.endsAt)}</p> : null}
                  </div>
                  <div className="flex items-center">
                    <FormSheet trigger={<Pencil className="size-4" strokeWidth={1.8} />} triggerClassName={round} title={t("edit")} action={saveOfferAction}>
                      <OfferForm offer={o} />
                    </FormSheet>
                    <form action={deleteOfferAction.bind(null, o.id)}>
                      <DeleteButton />
                    </form>
                  </div>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      )}

      <Card className="max-w-2xl">
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <h2 className="label">{t("salePageTitle")}</h2>
            <p className="text-sm text-muted-foreground">{t("salePageHint")}</p>
          </div>
          <SalePageForm settings={sale} />
        </CardContent>
      </Card>
    </div>
  );
}
