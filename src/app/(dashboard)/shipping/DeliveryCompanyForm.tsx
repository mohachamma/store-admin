"use client";

import { Check, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import type { AdminDelivery } from "@/lib/api/types";
import { setDeliveryAction } from "./delivery-actions";

export function DeliveryCompanyForm({ delivery }: { delivery: AdminDelivery }) {
  const t = useTranslations("delivery");
  const [value, setValue] = useState(delivery.provider);
  const [state, setState] = useState<"idle" | "saved" | "error">("idle");
  const [pending, start] = useTransition();
  return (
    <form
      className="space-y-3"
      onSubmit={(e) => {
        e.preventDefault();
        start(async () => setState((await setDeliveryAction(value)) ? "saved" : "error"));
      }}
    >
      <ul className="space-y-2">
        {delivery.providers.map((p) => (
          <li key={p.id}>
            <label className={`flex items-center gap-3 rounded-xl border border-border p-3 text-sm ${p.configured ? "cursor-pointer has-[:checked]:border-ink" : "opacity-60"}`}>
              <input type="radio" name="provider" value={p.id} checked={value === p.id} disabled={!p.configured} onChange={() => { setValue(p.id); setState("idle"); }} className="size-4 accent-ink" />
              <span className="flex-1 font-medium">{p.id === "manual" ? t("manual") : p.name}</span>
              {!p.configured ? <span className="text-[11px] text-muted-foreground">{t("noKeys")}</span> : null}
            </label>
          </li>
        ))}
      </ul>
      <Button type="submit" disabled={pending || value === delivery.provider}>
        {pending ? <Loader2 className="animate-spin" /> : state === "saved" ? <Check /> : null}
        {state === "saved" ? t("saved") : t("save")}
      </Button>
      {state === "error" ? <p role="alert" className="text-sm text-destructive">{t("error")}</p> : null}
    </form>
  );
}
