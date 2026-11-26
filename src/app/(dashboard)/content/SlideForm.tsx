import { getTranslations } from "next-intl/server";
import { DateTimeField } from "@/components/form/DateTimeField";
import { Field, I18nFields, SwitchField } from "@/components/form/fields";
import { ImageField } from "@/components/form/ImageField";
import { Input } from "@/components/ui/input";
import type { AdminCollection, AdminSlide } from "@/lib/api/types";

export async function SlideForm({ slide, collections, locale }: { slide?: AdminSlide; collections: AdminCollection[]; locale: "ar" | "fr" }) {
  const t = await getTranslations("slides");
  return (
    <>
      {slide ? <input type="hidden" name="id" value={slide.id} /> : null}
      <ImageField name="image" label={t("image")} currentUrl={slide?.imageUrl ?? null} maxSize={1600} />
      <I18nFields name="title" label={t("titleField")} defaults={slide?.title} />
      <I18nFields name="subtitle" label={t("subtitleField")} defaults={slide?.subtitle} />
      <Field label={t("linkCollection")} htmlFor="slide-col">
        <select id="slide-col" name="collectionId" defaultValue={slide?.collectionId ?? ""} className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm">
          <option value="">{t("linkNone")}</option>
          {collections.map((c) => (
            <option key={c.id} value={c.id}>{c.title[locale] || c.title.ar}</option>
          ))}
        </select>
      </Field>
      <Field label={t("linkUrl")} htmlFor="slide-url" hint={t("linkUrlHint")}>
        <Input id="slide-url" name="linkUrl" dir="ltr" defaultValue={slide?.linkUrl ?? ""} />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <DateTimeField name="startsAt" label={t("startsAt")} defaultValue={slide?.startsAt ?? null} />
        <DateTimeField name="endsAt" label={t("endsAt")} defaultValue={slide?.endsAt ?? null} />
      </div>
      <SwitchField name="isActive" label={t("active")} defaultChecked={slide?.isActive ?? true} />
    </>
  );
}
