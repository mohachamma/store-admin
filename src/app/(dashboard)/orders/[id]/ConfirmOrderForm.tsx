"use client";

import { useTranslations } from "next-intl";
import { useActionState } from "react";
import { SaveButton } from "@/components/form/SaveButton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { confirmOrderAction } from "../actions";

export function ConfirmOrderForm({ id }: { id: string }) {
  const t = useTranslations("orders");
  const [state, action, pending] = useActionState(confirmOrderAction.bind(null, id), {});
  return (
    <form action={action} className="space-y-3">
      <p className="text-xs text-muted-foreground">{t("confirmHint")}</p>
      <div className="space-y-2">
        <Label htmlFor="company">{t("company")}</Label>
        <Input id="company" name="company" defaultValue="Yalidine" dir="ltr" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="trackingNumber">{t("tracking")}</Label>
        <Input id="trackingNumber" name="trackingNumber" required dir="ltr" placeholder={t("trackingPlaceholder")} />
      </div>
      {state.error ? <p role="alert" className="text-sm text-destructive">{state.error}</p> : null}
      <SaveButton pending={pending} saved={state.ok} />
      <span className="sr-only">{t("confirmBtn")}</span>
    </form>
  );
}
