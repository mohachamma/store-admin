"use client";

import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import type { WhatsappMessages } from "@/lib/api/types";
import { saveWhatsappMessagesAction } from "./actions";

const KEYS = ["ask", "confirm", "tracking"] as const;
const LANGS = ["ar", "fr", "en"] as const;

/** The three WhatsApp message texts, in the three languages. {name} {number} {total} {tracking} {link} are filled in automatically. */
export function WhatsappMessagesForm({ value }: { value: WhatsappMessages }) {
  const t = useTranslations("pagesAdmin");
  const [state, action, pending] = useActionState(saveWhatsappMessagesAction, {});
  return (
    <form action={action} className="space-y-6">
      {KEYS.map((k) => (
        <fieldset key={k} className="space-y-3">
          <legend className="text-sm font-semibold">{t(`wa.${k}`)}</legend>
          <p className="text-xs text-muted-foreground">{t(`wa.${k}Hint`)}</p>
          {LANGS.map((l) => (
            <label key={l} className="block space-y-1">
              <span className="text-[11px] font-semibold text-muted-foreground">{l === "ar" ? "العربية" : l === "fr" ? "Français" : "English"}</span>
              <textarea
                name={`${k}_${l}`}
                rows={3}
                maxLength={700}
                dir={l === "ar" ? "rtl" : "ltr"}
                defaultValue={value[k][l]}
                className="w-full rounded-xl border border-transparent bg-secondary px-4 py-3 text-sm outline-none transition focus-visible:border-foreground/20 focus-visible:ring-[3px] focus-visible:ring-ring/15"
              />
            </label>
          ))}
        </fieldset>
      ))}
      <p className="text-xs text-muted-foreground">{t("wa.placeholders")}</p>
      {state.error ? <p role="alert" className="text-sm text-destructive">{state.error}</p> : null}
      {state.ok ? <p role="status" className="text-sm text-emerald-400 light:text-emerald-700">{t("saved")}</p> : null}
      <Button type="submit" disabled={pending}>{pending ? <Loader2 className="animate-spin" /> : null} {t("save")}</Button>
    </form>
  );
}
