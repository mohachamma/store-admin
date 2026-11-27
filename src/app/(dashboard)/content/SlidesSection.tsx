import { ArrowDown, ArrowUp, Pencil, Plus } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import { DeleteButton } from "@/components/form/DeleteButton";
import { FormSheet } from "@/components/form/FormSheet";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { api } from "@/lib/api";
import { slidesWithStatus } from "@/lib/statuses";
import { cn } from "@/lib/utils";
import { deleteSlideAction, moveSlideAction, saveSlideAction } from "./slide-actions";
import { SlideForm } from "./SlideForm";

export async function SlidesSection({ token }: { token: string }) {
  const [t, locale, rawSlides, collections] = await Promise.all([
    getTranslations("slides"),
    getLocale() as Promise<"ar" | "fr">,
    api.listSlides(token),
    api.listCollections(token),
  ]);
  const slides = slidesWithStatus(rawSlides);
  const round = "grid size-9 place-items-center rounded-full transition hover:bg-secondary disabled:opacity-30";
  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-medium">{t("title")}</h2>
          <p className="mt-1 max-w-xl text-sm text-muted-foreground">{t("hint")}</p>
        </div>
        <FormSheet trigger={<><Plus className="size-4" /> {t("add")}</>} triggerClassName={cn(buttonVariants())} title={t("add")} action={saveSlideAction}>
          <SlideForm collections={collections} locale={locale} />
        </FormSheet>
      </div>
      {slides.length === 0 ? (
        <p className="rounded-[var(--radius-card)] border border-dashed border-border py-12 text-center text-sm text-muted-foreground">{t("empty")}</p>
      ) : (
        <ul className="divide-y divide-border rounded-[var(--radius-card)] border border-border">
          {slides.map((s, i) => {
            const st = s.status;
            return (
              <li key={s.id} className="flex items-center gap-3 p-3">
                {/* eslint-disable-next-line @next/next/no-img-element -- admin preview of uploaded image */}
                <img src={s.imageUrl} alt="" className="h-16 w-12 shrink-0 rounded-xl bg-secondary object-cover" />
                <div className="min-w-0 flex-1 space-y-1">
                  <p className="truncate text-sm font-semibold">{s.title[locale] || s.title.ar || "—"}</p>
                  <Badge variant={st === "showing" ? "success" : st === "scheduled" ? "info" : "secondary"}>{t(st)}</Badge>
                </div>
                <div className="flex items-center">
                  <form action={moveSlideAction.bind(null, s.id, -1)}>
                    <button type="submit" disabled={i === 0} aria-label="↑" className={round}><ArrowUp className="size-4" strokeWidth={1.8} /></button>
                  </form>
                  <form action={moveSlideAction.bind(null, s.id, 1)}>
                    <button type="submit" disabled={i === slides.length - 1} aria-label="↓" className={round}><ArrowDown className="size-4" strokeWidth={1.8} /></button>
                  </form>
                  <FormSheet trigger={<Pencil className="size-4" strokeWidth={1.8} />} triggerClassName={round} title={t("edit")} action={saveSlideAction}>
                    <SlideForm slide={s} collections={collections} locale={locale} />
                  </FormSheet>
                  <form action={deleteSlideAction.bind(null, s.id)}>
                    <DeleteButton />
                  </form>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
