import { getTranslations } from "next-intl/server";
import { I18nFields, SwitchField } from "@/components/form/fields";
import type { AdminInfoPage } from "@/lib/api/types";

const LANGS = [
  { key: "ar", dir: "rtl" },
  { key: "fr", dir: "ltr" },
  { key: "en", dir: "ltr" },
] as const;

export async function PageForm({ page }: { page: AdminInfoPage }) {
  const t = await getTranslations("pagesAdmin");
  return (
    <>
      <I18nFields name="title" label={t("title_field")} defaults={page.title} required />
      <fieldset className="space-y-2">
        <legend className="text-xs font-semibold text-foreground/80">{t("body")}</legend>
        <p className="text-[11px] text-muted-foreground">{t("bodyHint")}</p>
        {LANGS.map((l) => (
          <div key={l.key} className="space-y-1">
            <span className="text-[10px] font-bold uppercase text-muted-foreground">{l.key}</span>
            <textarea
              name={`body.${l.key}`}
              dir={l.dir}
              rows={10}
              required={l.key === "ar"}
              defaultValue={page.body[l.key]}
              maxLength={30000}
              aria-label={`${t("body")} (${l.key.toUpperCase()})`}
              className="w-full rounded-xl border border-border bg-background p-3 text-sm leading-relaxed outline-none focus:ring-2 focus:ring-ring/30"
            />
          </div>
        ))}
      </fieldset>
      <SwitchField name="isPublished" label={t("isPublished")} defaultChecked={page.isPublished} />
      <SwitchField name="isDraft" label={t("isDraft")} defaultChecked={page.isDraft} />
    </>
  );
}
