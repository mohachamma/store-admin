import { getTranslations } from "next-intl/server";
import { DateTimeField } from "@/components/form/DateTimeField";
import { Field, I18nFields, SwitchField } from "@/components/form/fields";
import { ImageField } from "@/components/form/ImageField";
import { Input } from "@/components/ui/input";
import type { AdminOffer } from "@/lib/api/types";

export async function OfferForm({ offer }: { offer?: AdminOffer }) {
  const t = await getTranslations("offers");
  const radio = "flex h-11 flex-1 cursor-pointer items-center justify-center rounded-xl border border-border text-sm font-medium transition has-[:checked]:border-ink has-[:checked]:bg-ink has-[:checked]:text-paper";
  return (
    <>
      {offer ? <input type="hidden" name="id" value={offer.id} /> : null}
      <I18nFields name="label" label={t("label")} hint={t("labelHint")} defaults={offer?.label} />
      <I18nFields name="title" label={t("titleField")} defaults={offer?.title} required />
      <I18nFields name="subtitle" label={t("subtitleField")} defaults={offer?.subtitle} />
      <I18nFields name="ctaLabel" label={t("cta")} defaults={offer?.ctaLabel} />
      <Field label={t("link")} htmlFor="offer-href" hint={t("linkHint")}>
        <Input id="offer-href" name="href" dir="ltr" defaultValue={offer?.href ?? "/sale"} />
      </Field>
      <ImageField name="image" label={t("image")} currentUrl={offer?.imageUrl ?? null} />
      <fieldset className="space-y-2">
        <legend className="text-xs font-semibold text-foreground/80">{t("theme")}</legend>
        <div className="flex gap-2">
          <label className={radio}>
            <input type="radio" name="theme" value="dark" defaultChecked={(offer?.theme ?? "dark") === "dark"} className="sr-only" />
            {t("themeDark")}
          </label>
          <label className={radio}>
            <input type="radio" name="theme" value="light" defaultChecked={offer?.theme === "light"} className="sr-only" />
            {t("themeLight")}
          </label>
        </div>
      </fieldset>
      <div className="grid gap-4 sm:grid-cols-2">
        <DateTimeField name="startsAt" label={t("startsAt")} defaultValue={offer?.startsAt ?? null} />
        <DateTimeField name="endsAt" label={t("endsAt")} defaultValue={offer?.endsAt ?? null} />
      </div>
      <SwitchField name="showCountdown" label={t("countdown")} hint={t("countdownHint")} defaultChecked={offer?.showCountdown ?? false} />
      <SwitchField name="isActive" label={t("active")} defaultChecked={offer?.isActive ?? true} />
    </>
  );
}
