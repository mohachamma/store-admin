import { Pencil } from "lucide-react";
import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { FormSheet } from "@/components/form/FormSheet";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { api } from "@/lib/api";
import { requireSession } from "@/lib/auth";
import { savePageAction } from "./actions";
import { PageForm } from "./PageForm";
import { StoreInfoForm } from "./StoreInfoForm";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getTranslations("pagesAdmin"))("title") };
}

export default async function PagesAdminPage() {
  const token = await requireSession();
  const [t, locale, pages, info] = await Promise.all([getTranslations("pagesAdmin"), getLocale() as Promise<"ar" | "fr">, api.listPages(token), api.getStoreInfo(token)]);
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl uppercase tracking-[0.08em]">{t("title")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t("subtitle")}</p>
      </div>

      <section className="space-y-4">
        <div>
          <h2 className="font-display text-lg uppercase tracking-[0.08em]">{t("legalTitle")}</h2>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{t("legalHint")}</p>
        </div>
        <ul className="divide-y divide-border rounded-[var(--radius-card)] border border-border">
          {pages.map((p) => (
            <li key={p.slug} className="flex items-center gap-3 p-4">
              <div className="min-w-0 flex-1 space-y-1.5">
                <p className="truncate text-sm font-semibold">{p.title[locale] || p.title.ar}</p>
                <div className="flex flex-wrap gap-1.5">
                  <Badge variant={p.isPublished ? "success" : "secondary"}>{p.isPublished ? t("published") : t("hidden")}</Badge>
                  <Badge variant={p.isDraft ? "warning" : "info"}>{p.isDraft ? t("draft") : t("reviewed")}</Badge>
                </div>
              </div>
              <FormSheet
                trigger={<Pencil className="size-4" strokeWidth={1.8} />}
                triggerClassName="grid size-9 place-items-center rounded-full transition hover:bg-secondary"
                title={t("edit")}
                action={savePageAction.bind(null, p.slug)}
              >
                <PageForm page={p} />
              </FormSheet>
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="font-display text-lg uppercase tracking-[0.08em]">{t("contactTitle")}</h2>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{t("contactHint")}</p>
        </div>
        <Card className="max-w-2xl">
          <CardContent>
            <StoreInfoForm value={info} />
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
