import { getTranslations } from "next-intl/server";
import { DateTimeField } from "@/components/form/DateTimeField";
import { Field, SwitchField } from "@/components/form/fields";
import { Input } from "@/components/ui/input";
import type { AdminDiscountCode } from "@/lib/api/types";

export async function DiscountForm({ code }: { code?: AdminDiscountCode }) {
  const t = await getTranslations("discounts");
  const radio = "flex h-11 flex-1 cursor-pointer items-center justify-center rounded-xl border border-border text-sm font-medium transition has-[:checked]:border-ink has-[:checked]:bg-ink has-[:checked]:text-paper";
  return (
    <>
      {code ? <input type="hidden" name="id" value={code.id} /> : null}
      <Field label={t("code")} htmlFor="dc-code" hint={t("codeHint")}>
        <Input id="dc-code" name="code" dir="ltr" required maxLength={32} className="uppercase" defaultValue={code?.code} autoCapitalize="characters" />
      </Field>
      <fieldset className="space-y-2">
        <legend className="text-xs font-semibold text-foreground/80">{t("kind")}</legend>
        <div className="flex gap-2">
          <label className={radio}><input type="radio" name="kind" value="percent" defaultChecked={(code?.kind ?? "percent") === "percent"} className="sr-only" />{t("percent")}</label>
          <label className={radio}><input type="radio" name="kind" value="fixed" defaultChecked={code?.kind === "fixed"} className="sr-only" />{t("fixed")}</label>
        </div>
      </fieldset>
      <Field label={t("value")} htmlFor="dc-value" hint={`${t("valuePercent")} / ${t("valueFixed")}`}>
        <Input id="dc-value" name="value" dir="ltr" inputMode="numeric" required defaultValue={code?.value} />
      </Field>
      <Field label={t("min")} htmlFor="dc-min">
        <Input id="dc-min" name="minSubtotal" dir="ltr" inputMode="numeric" defaultValue={code?.minSubtotal ?? 0} />
      </Field>
      <Field label={t("maxUses")} htmlFor="dc-max" hint={t("maxUsesHint")}>
        <Input id="dc-max" name="maxUses" dir="ltr" inputMode="numeric" defaultValue={code?.maxUses ?? ""} />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <DateTimeField name="startsAt" label={t("startsAt")} defaultValue={code?.startsAt ?? null} />
        <DateTimeField name="endsAt" label={t("endsAt")} defaultValue={code?.endsAt ?? null} />
      </div>
      <SwitchField name="isActive" label={t("active")} defaultChecked={code?.isActive ?? true} />
    </>
  );
}
