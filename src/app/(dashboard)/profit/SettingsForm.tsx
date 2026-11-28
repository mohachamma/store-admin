import { getTranslations } from "next-intl/server";
import { Field, SwitchField } from "@/components/form/fields";
import { Input } from "@/components/ui/input";
import type { ProfitSettings } from "@/lib/api/types";

export async function SettingsForm({ settings }: { settings: ProfitSettings }) {
  const t = await getTranslations("profit");
  return (
    <>
      <Field label={t("returnFee")} htmlFor="ps-return" hint={t("returnFeeHint")}>
        <Input id="ps-return" name="returnFee" dir="ltr" inputMode="numeric" defaultValue={settings.returnFee} />
      </Field>
      <SwitchField name="returnedItemsLost" label={t("itemsLost")} hint={t("itemsLostHint")} defaultChecked={settings.returnedItemsLost} />
      <Field label={t("cardFee")} htmlFor="ps-card" hint={t("cardFeeHint")}>
        <Input id="ps-card" name="cardFeePercent" dir="ltr" inputMode="decimal" defaultValue={settings.cardFeePercent} />
      </Field>
    </>
  );
}
