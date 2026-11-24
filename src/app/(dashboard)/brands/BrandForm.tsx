import { getTranslations } from "next-intl/server";
import { Field, SwitchField } from "@/components/form/fields";
import { ImageField } from "@/components/form/ImageField";
import { Input } from "@/components/ui/input";
import type { AdminBrand } from "@/lib/api/types";

export async function BrandForm({ brand }: { brand?: AdminBrand }) {
  const t = await getTranslations("brands");
  return (
    <>
      {brand ? <input type="hidden" name="id" value={brand.id} /> : null}
      <Field label={t("name")} htmlFor="brand-name">
        <Input id="brand-name" name="name" defaultValue={brand?.name ?? ""} required />
      </Field>
      <ImageField name="logo" label={t("logo")} currentUrl={brand?.logoUrl ?? null} contain />
      <p className="-mt-3 text-[11px] text-muted-foreground">{t("logoHint")}</p>
      <Field label={t("link")} htmlFor="brand-href" hint={t("linkHint")}>
        <Input id="brand-href" name="href" dir="ltr" defaultValue={brand?.href ?? ""} />
      </Field>
      <SwitchField name="isActive" label={t("active")} defaultChecked={brand?.isActive ?? true} />
    </>
  );
}
