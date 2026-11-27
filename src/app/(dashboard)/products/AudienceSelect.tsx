"use client";

import { useTranslations } from "next-intl";
import { useTransition } from "react";
import type { Audience } from "@/lib/api/types";
import { setAudienceAction } from "./actions";

/** One-tap "who is this for" on each product row. */
export function AudienceSelect({ id, value }: { id: string; value: Audience }) {
  const t = useTranslations("products");
  const [pending, start] = useTransition();
  return (
    <select
      aria-label={t("audience")}
      value={value}
      disabled={pending}
      onChange={(e) => start(() => setAudienceAction(id, e.target.value as Audience))}
      className="h-7 rounded-full border border-border bg-background px-2 text-[11px] text-muted-foreground disabled:opacity-50"
    >
      <option value="unisex">{t("audienceUnisex")}</option>
      <option value="women">{t("audienceWomen")}</option>
      <option value="men">{t("audienceMen")}</option>
    </select>
  );
}
