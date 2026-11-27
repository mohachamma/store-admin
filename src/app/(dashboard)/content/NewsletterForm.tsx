"use client";

import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useActionState } from "react";
import { I18nFields, SwitchField } from "@/components/form/fields";
import { Button } from "@/components/ui/button";
import type { AdminNewsletter } from "@/lib/api/types";
import { saveNewsletterAction } from "./home-actions";

export function NewsletterForm({ value }: { value: AdminNewsletter }) {
  const t = useTranslations("homeSections");
  const [state, action, pending] = useActionState(saveNewsletterAction, {});
  return (
    <form action={action} className="space-y-5">
      <SwitchField name="enabled" label={t("show")} defaultChecked={value.enabled} />
      <I18nFields name="title" label={t("sectionTitle")} defaults={value.title} required />
      <I18nFields name="subtitle" label={t("newsletterSubtitle")} defaults={value.subtitle} />
      <I18nFields name="button" label={t("newsletterButton")} defaults={value.button} required />
      {state.error ? <p role="alert" className="text-sm text-destructive">{state.error}</p> : null}
      {state.ok ? <p role="status" className="text-sm text-emerald-400 light:text-emerald-700">{t("saved")}</p> : null}
      <Button type="submit" disabled={pending}>{pending ? <Loader2 className="animate-spin" /> : null} {t("save")}</Button>
    </form>
  );
}
