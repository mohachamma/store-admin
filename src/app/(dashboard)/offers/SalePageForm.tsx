"use client";

import { useTranslations } from "next-intl";
import { useActionState } from "react";
import { I18nFields, SwitchField } from "@/components/form/fields";
import { SaveButton } from "@/components/form/SaveButton";
import type { SalePageSettings } from "@/lib/api/types";
import { saveSalePageAction } from "./sale-actions";

export function SalePageForm({ settings }: { settings: SalePageSettings }) {
  const t = useTranslations("offers");
  const [state, action, pending] = useActionState(saveSalePageAction, {});
  return (
    <form action={action} className="space-y-5">
      <SwitchField name="enabled" label={t("salePageEnabled")} defaultChecked={settings.enabled} />
      <I18nFields name="title" label={t("saleTitle")} defaults={settings.title} required />
      <I18nFields name="subtitle" label={t("saleSubtitle")} defaults={settings.subtitle} />
      <div className="flex items-center gap-3">
        <SaveButton pending={pending} saved={state.ok} />
        {state.error ? (
          <p role="alert" className="text-sm text-destructive">
            {state.error}
          </p>
        ) : null}
      </div>
    </form>
  );
}
