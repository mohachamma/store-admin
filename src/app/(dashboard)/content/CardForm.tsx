import { getTranslations } from "next-intl/server";
import { Field, I18nFields, SwitchField } from "@/components/form/fields";
import { ImageField } from "@/components/form/ImageField";
import { Input } from "@/components/ui/input";
import type { AdminHomeCard } from "@/lib/api/types";

export async function CardForm({ card }: { card?: AdminHomeCard }) {
  const t = await getTranslations("homeSections");
  return (
    <>
      {card ? <input type="hidden" name="id" value={card.id} /> : null}
      <ImageField name="image" label={t("cardImage")} currentUrl={card?.imageUrl ?? null} maxSize={1000} />
      <I18nFields name="title" label={t("cardTitle")} defaults={card?.title} required />
      <I18nFields name="subtitle" label={t("cardSubtitle")} defaults={card?.subtitle} />
      <Field label={t("cardLink")} htmlFor="card-href" hint={t("cardLinkHint")}>
        <Input id="card-href" name="href" dir="ltr" defaultValue={card?.href ?? ""} />
      </Field>
      <SwitchField name="isActive" label={t("active")} defaultChecked={card?.isActive ?? true} />
    </>
  );
}
