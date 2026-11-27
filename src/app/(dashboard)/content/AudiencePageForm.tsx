"use client";

import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useActionState } from "react";
import { I18nFields, SwitchField } from "@/components/form/fields";
import { ImageField } from "@/components/form/ImageField";
import { Button } from "@/components/ui/button";
import type { AdminWomenPage } from "@/lib/api/types";
import { saveMenPageAction, saveWomenPageAction } from "./home-actions";

/** Settings of the Women's or Men's page: visibility, title, subtitle, cover image. */
export function AudiencePageForm({ kind, value }: { kind: "women" | "men"; value: AdminWomenPage }) {
  const t = useTranslations(kind === "women" ? "womenPage" : "menPage");
  const [state, action, pending] = useActionState(kind === "women" ? saveWomenPageAction : saveMenPageAction, {});
  return (
    <form action={action} className="space-y-5">
      <SwitchField name="enabled" label={t("show")} defaultChecked={value.enabled} />
      <I18nFields name="title" label={t("pageTitle")} defaults={value.title} required />
      <I18nFields name="subtitle" label={t("pageSubtitle")} defaults={value.subtitle} />
      <ImageField name="hero" label={t("cover")} currentUrl={value.heroUrl} maxSize={1600} />
      {state.error ? <p role="alert" className="text-sm text-destructive">{state.error}</p> : null}
      {state.ok ? <p role="status" className="text-sm text-emerald-700">{t("saved")}</p> : null}
      <Button type="submit" disabled={pending}>{pending ? <Loader2 className="animate-spin" /> : null} {t("save")}</Button>
    </form>
  );
}
