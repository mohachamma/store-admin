"use client";

import { Check, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { saveFreeShippingAction } from "./actions";

export function FreeShippingForm({ value }: { value: number | null }) {
  const t = useTranslations("shipping");
  const [text, setText] = useState(value ? String(value) : "");
  const [pending, start] = useTransition();
  const [state, setState] = useState<"idle" | "saved" | "error">("idle");
  return (
    <form
      className="flex flex-wrap items-end gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        setState("idle");
        start(async () => setState((await saveFreeShippingAction(text.trim() ? Number(text) : null)) ? "saved" : "error"));
      }}
    >
      <div className="min-w-48 flex-1 space-y-2">
        <label htmlFor="free" className="text-xs font-semibold text-foreground/80">{t("freeLabel")}</label>
        <Input id="free" dir="ltr" inputMode="numeric" placeholder={t("freePlaceholder")} value={text} onChange={(e) => { setText(e.target.value.replace(/\D/g, "")); setState("idle"); }} />
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? <Loader2 className="animate-spin" /> : state === "saved" ? <Check /> : null}
        {state === "saved" ? t("freeSaved") : t("freeSave")}
      </Button>
      {state === "error" ? <p role="alert" className="w-full text-sm text-destructive">{t("error")}</p> : null}
    </form>
  );
}
