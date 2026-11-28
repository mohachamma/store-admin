"use client";

import { CheckCircle2, MessageCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useActionState, useEffect } from "react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SaveButton } from "@/components/form/SaveButton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { confirmOrderAction } from "../actions";

/** `autoCompany`: name of the delivery company the server sends parcels to (null = type the tracking number yourself). */
export function ConfirmOrderForm({ id, autoCompany }: { id: string; autoCompany: string | null }) {
  const t = useTranslations("orders");
  const router = useRouter();
  const [state, action, pending] = useActionState(confirmOrderAction.bind(null, id), {});
  // Without a WhatsApp message to offer, the page simply refreshes (the order is no longer pending).
  useEffect(() => {
    if (state.ok && !state.whatsappUrl) router.refresh();
  }, [state, router]);

  if (state.ok && state.whatsappUrl) {
    return (
      <div className="space-y-3">
        <p className="flex items-center gap-2 text-sm font-semibold text-emerald-400 light:text-emerald-700"><CheckCircle2 className="size-4" /> {t("approved")}</p>
        <p className="text-xs text-muted-foreground">{t("sendTrackingHint")}</p>
        <a href={state.whatsappUrl} target="_blank" rel="noopener noreferrer" className={cn(buttonVariants({ size: "lg" }), "w-full bg-[#128c4a] text-white hover:bg-[#128c4a]/90")}><MessageCircle /> {t("sendTracking")}</a>
        <button type="button" onClick={() => router.refresh()} className="w-full text-center text-xs text-muted-foreground underline">{t("doneWithoutSending")}</button>
      </div>
    );
  }
  return (
    <form action={action} className="space-y-3">
      {autoCompany ? (
        <>
          <input type="hidden" name="auto" value="1" />
          <p className="text-xs text-muted-foreground">{t("confirmAutoHint", { company: autoCompany })}</p>
        </>
      ) : (
        <>
          <p className="text-xs text-muted-foreground">{t("confirmHint")}</p>
          <div className="space-y-2">
            <Label htmlFor="company">{t("company")}</Label>
            <Input id="company" name="company" defaultValue="Yalidine" dir="ltr" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="trackingNumber">{t("tracking")}</Label>
            <Input id="trackingNumber" name="trackingNumber" required dir="ltr" placeholder={t("trackingPlaceholder")} />
          </div>
        </>
      )}
      {state.error ? <p role="alert" className="text-sm text-destructive">{state.error}</p> : null}
      <SaveButton pending={pending} saved={state.ok} />
      <span className="sr-only">{t("confirmBtn")}</span>
    </form>
  );
}
