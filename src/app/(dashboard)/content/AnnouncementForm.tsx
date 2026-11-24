"use client";

import { useLocale, useTranslations } from "next-intl";
import { useActionState, useState } from "react";
import { I18nFields } from "@/components/form/fields";
import { SaveButton } from "@/components/form/SaveButton";
import type { SiteContent } from "@/lib/api/types";
import { saveSiteContentAction } from "./actions";

export function AnnouncementForm({ content }: { content: SiteContent }) {
  const t = useTranslations("content");
  const locale = useLocale() as "ar" | "fr";
  const [state, action, pending] = useActionState(saveSiteContentAction, {});
  const [text, setText] = useState(content.announcement);

  return (
    <form
      action={action}
      className="space-y-5"
      onChange={(e) => {
        const el = e.target as unknown as HTMLInputElement;
        const m = /^announcement\.(ar|fr|en)$/.exec(el.name);
        if (m) setText((prev) => ({ ...prev, [m[1]!]: el.value }));
      }}
    >
      <I18nFields name="announcement" label={t("announcement")} hint={t("announcementHint")} defaults={content.announcement} />
      <div className="space-y-2">
        <p className="text-xs font-semibold text-foreground/80">{t("preview")}</p>
        {text[locale] || text.ar ? (
          <div className="rounded-xl bg-ink px-4 py-2 text-center text-[11px] font-medium text-paper">{text[locale] || text.ar}</div>
        ) : (
          <div className="rounded-xl border border-dashed border-border px-4 py-2 text-center text-[11px] text-muted-foreground">—</div>
        )}
      </div>
      <div className="flex items-center gap-3">
        <SaveButton pending={pending} saved={state.ok} />
        {state.error ? <p role="alert" className="text-sm text-destructive">{state.error}</p> : null}
      </div>
    </form>
  );
}
