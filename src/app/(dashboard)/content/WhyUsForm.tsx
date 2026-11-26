"use client";

import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useActionState } from "react";
import { I18nFields, SwitchField } from "@/components/form/fields";
import { Button } from "@/components/ui/button";
import type { AdminWhyUs } from "@/lib/api/types";
import { saveWhyUsAction } from "./home-actions";
import { ICONS, WHY_SLOTS } from "./home-constants";

export function WhyUsForm({ value }: { value: AdminWhyUs }) {
  const t = useTranslations("homeSections");
  const [state, action, pending] = useActionState(saveWhyUsAction, {});
  return (
    <form action={action} className="space-y-5">
      <SwitchField name="enabled" label={t("show")} defaultChecked={value.enabled} />
      <I18nFields name="title" label={t("sectionTitle")} defaults={value.title} required />
      {Array.from({ length: WHY_SLOTS }, (_, i) => {
        const it = value.items[i];
        return (
          <fieldset key={i} className="space-y-3 rounded-2xl border border-border p-4">
            <legend className="px-1 text-xs font-semibold">{t("feature", { n: i + 1 })}</legend>
            <select name={`item${i}icon`} defaultValue={it?.icon ?? ICONS[i % ICONS.length]} aria-label={t("icon")} className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm">
              {ICONS.map((ic) => (
                <option key={ic} value={ic}>{t(`icons.${ic}`)}</option>
              ))}
            </select>
            <I18nFields name={`item${i}title`} label={t("featureTitle")} defaults={it?.title} />
            <I18nFields name={`item${i}text`} label={t("featureText")} defaults={it?.text} />
          </fieldset>
        );
      })}
      <p className="text-[11px] text-muted-foreground">{t("emptySlotHint")}</p>
      {state.error ? <p role="alert" className="text-sm text-destructive">{state.error}</p> : null}
      {state.ok ? <p role="status" className="text-sm text-emerald-700">{t("saved")}</p> : null}
      <Button type="submit" disabled={pending}>{pending ? <Loader2 className="animate-spin" /> : null} {t("save")}</Button>
    </form>
  );
}
