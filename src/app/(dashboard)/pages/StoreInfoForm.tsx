"use client";

import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useActionState } from "react";
import { Field, I18nFields } from "@/components/form/fields";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { AdminStoreInfo } from "@/lib/api/types";
import { saveStoreInfoAction } from "./actions";

export function StoreInfoForm({ value }: { value: AdminStoreInfo }) {
  const t = useTranslations("pagesAdmin");
  const [state, action, pending] = useActionState(saveStoreInfoAction, {});
  return (
    <form action={action} className="space-y-5">
      <Field label={t("phone")} htmlFor="si-phone">
        <Input id="si-phone" name="phone" dir="ltr" inputMode="tel" defaultValue={value.phone} />
      </Field>
      <Field label={t("whatsapp")} htmlFor="si-wa" hint={t("whatsappHint")}>
        <Input id="si-wa" name="whatsapp" dir="ltr" inputMode="tel" defaultValue={value.whatsapp} />
      </Field>
      <Field label={t("email")} htmlFor="si-email">
        <Input id="si-email" name="email" type="email" dir="ltr" defaultValue={value.email} />
      </Field>
      <I18nFields name="address" label={t("address")} defaults={value.address} />
      <I18nFields name="hours" label={t("hours")} defaults={value.hours} />
      <I18nFields name="siteTitle" label={t("siteTitle")} hint={t("siteTitleHint")} defaults={value.siteTitle} />
      <I18nFields name="siteDescription" label={t("siteDescription")} hint={t("siteDescriptionHint")} defaults={value.siteDescription} />
      {state.error ? <p role="alert" className="text-sm text-destructive">{state.error}</p> : null}
      {state.ok ? <p role="status" className="text-sm text-emerald-700">{t("saved")}</p> : null}
      <Button type="submit" disabled={pending}>{pending ? <Loader2 className="animate-spin" /> : null} {t("save")}</Button>
    </form>
  );
}
