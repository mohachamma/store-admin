import { ArrowDown, ArrowUp, Pencil, Plus, Trash2 } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import { DeleteButton } from "@/components/form/DeleteButton";
import { FormSheet } from "@/components/form/FormSheet";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { CardForm } from "./CardForm";
import { deleteCardAction, deleteSubscriberAction, moveCardAction, saveCardAction } from "./home-actions";
import { NewsletterForm } from "./NewsletterForm";
import { WhyUsForm } from "./WhyUsForm";
import { WomenPageForm } from "./WomenPageForm";

/** The three home-page sections below the hero: category cards, "why us" and the newsletter (with its subscribers). */
export async function HomeSections({ token }: { token: string }) {
  const [t, tw, locale, cards, whyUs, newsletter, subs, women] = await Promise.all([
    getTranslations("homeSections"),
    getTranslations("womenPage"),
    getLocale() as Promise<"ar" | "fr">,
    api.listHomeCards(token),
    api.getWhyUs(token),
    api.getNewsletter(token),
    api.listSubscribers(token),
    api.getWomenPage(token),
  ]);
  const round = "grid size-9 place-items-center rounded-full transition hover:bg-secondary disabled:opacity-30";
  return (
    <>
      <section className="space-y-4">
        <div>
          <h2 className="font-display text-lg uppercase tracking-[0.08em]">{tw("title")}</h2>
          <p className="mt-1 max-w-xl text-sm text-muted-foreground">{tw("hint")}</p>
        </div>
        <Card className="max-w-2xl">
          <CardContent>
            <WomenPageForm value={women} />
          </CardContent>
        </Card>
      </section>

      <section className="space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="font-display text-lg uppercase tracking-[0.08em]">{t("cardsTitle")}</h2>
            <p className="mt-1 max-w-xl text-sm text-muted-foreground">{t("cardsHint")}</p>
          </div>
          <FormSheet trigger={<><Plus className="size-4" /> {t("addCard")}</>} triggerClassName={cn(buttonVariants())} title={t("addCard")} action={saveCardAction}>
            <CardForm />
          </FormSheet>
        </div>
        {cards.length === 0 ? (
          <p className="rounded-[var(--radius-card)] border border-dashed border-border py-10 text-center text-sm text-muted-foreground">{t("noCards")}</p>
        ) : (
          <ul className="divide-y divide-border rounded-[var(--radius-card)] border border-border">
            {cards.map((c, i) => (
              <li key={c.id} className="flex items-center gap-3 p-3">
                {/* eslint-disable-next-line @next/next/no-img-element -- admin preview of uploaded image */}
                <img src={c.imageUrl} alt="" className="size-14 shrink-0 rounded-xl bg-secondary object-cover" />
                <div className="min-w-0 flex-1 space-y-1">
                  <p className="truncate text-sm font-semibold">{c.title[locale] || c.title.ar}</p>
                  {!c.isActive ? <Badge variant="secondary">{t("hidden")}</Badge> : <p className="truncate text-[11px] text-muted-foreground" dir="ltr">{c.href ?? "—"}</p>}
                </div>
                <div className="flex items-center">
                  <form action={moveCardAction.bind(null, c.id, -1)}>
                    <button type="submit" disabled={i === 0} aria-label="↑" className={round}><ArrowUp className="size-4" strokeWidth={1.8} /></button>
                  </form>
                  <form action={moveCardAction.bind(null, c.id, 1)}>
                    <button type="submit" disabled={i === cards.length - 1} aria-label="↓" className={round}><ArrowDown className="size-4" strokeWidth={1.8} /></button>
                  </form>
                  <FormSheet trigger={<Pencil className="size-4" strokeWidth={1.8} />} triggerClassName={round} title={t("editCard")} action={saveCardAction}>
                    <CardForm card={c} />
                  </FormSheet>
                  <form action={deleteCardAction.bind(null, c.id)}>
                    <DeleteButton />
                  </form>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="font-display text-lg uppercase tracking-[0.08em]">{t("whyTitle")}</h2>
          <p className="mt-1 max-w-xl text-sm text-muted-foreground">{t("whyHint")}</p>
        </div>
        <Card className="max-w-2xl">
          <CardContent>
            <WhyUsForm value={whyUs} />
          </CardContent>
        </Card>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="font-display text-lg uppercase tracking-[0.08em]">{t("newsletterTitle")}</h2>
          <p className="mt-1 max-w-xl text-sm text-muted-foreground">{t("newsletterHint")}</p>
        </div>
        <Card className="max-w-2xl">
          <CardContent>
            <NewsletterForm value={newsletter} />
          </CardContent>
        </Card>
        <div className="max-w-2xl space-y-2">
          <h3 className="label">{t("subscribers", { n: subs.total })}</h3>
          {subs.items.length === 0 ? (
            <p className="rounded-[var(--radius-card)] border border-dashed border-border py-8 text-center text-sm text-muted-foreground">{t("noSubscribers")}</p>
          ) : (
            <ul className="divide-y divide-border rounded-[var(--radius-card)] border border-border">
              {subs.items.map((s) => (
                <li key={s.id} className="flex items-center gap-3 px-4 py-2.5">
                  <span className="min-w-0 flex-1 truncate text-sm" dir="ltr">{s.email}</span>
                  <span className="shrink-0 text-[11px] text-muted-foreground">{new Intl.DateTimeFormat(locale === "ar" ? "ar-DZ-u-nu-latn" : "fr-DZ", { dateStyle: "medium" }).format(new Date(s.createdAt))}</span>
                  <form action={deleteSubscriberAction.bind(null, s.id)}>
                    <DeleteButton className="grid size-8 place-items-center rounded-full text-destructive transition hover:bg-destructive/10" />
                  </form>
                </li>
              ))}
            </ul>
          )}
          <p className="text-[11px] text-muted-foreground"><Trash2 className="me-1 inline size-3" />{t("subscribersHint")}</p>
        </div>
      </section>
    </>
  );
}
