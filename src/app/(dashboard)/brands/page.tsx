import { ArrowDown, ArrowUp, Pencil, Plus } from "lucide-react";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { DeleteButton } from "@/components/form/DeleteButton";
import { FormSheet } from "@/components/form/FormSheet";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/lib/api";
import { requireSession } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { deleteBrandAction, moveBrandAction, saveBrandAction } from "./actions";
import { BrandForm } from "./BrandForm";
import { StripSettings } from "./StripSettings";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getTranslations("brands"))("title") };
}

export default async function BrandsPage() {
  const token = await requireSession();
  const [t, brands, strip] = await Promise.all([getTranslations("brands"), api.listBrands(token), api.getBrandsStrip(token)]);
  const round = "grid size-9 place-items-center rounded-full transition hover:bg-secondary disabled:opacity-30";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl uppercase tracking-[0.08em]">{t("title")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t("subtitle")}</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_1.1fr] lg:items-start">
        <StripSettings settings={strip} logos={brands.filter((b) => b.isActive).map((b) => ({ id: b.id, name: b.name, url: b.logoUrl }))} />

        <Card>
          <CardHeader>
            <div>
              <CardTitle>{t("list")}</CardTitle>
              <p className="mt-1 text-xs text-muted-foreground">{t("count", { count: brands.length })}</p>
            </div>
            <FormSheet
              trigger={<><Plus className="size-4" /> {t("add")}</>}
              triggerClassName={cn(buttonVariants({ size: "sm" }))}
              title={t("add")}
              action={saveBrandAction}
            >
              <BrandForm />
            </FormSheet>
          </CardHeader>
          <CardContent>
            {brands.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">{t("empty")}</p>
            ) : (
              <ul className="divide-y divide-border">
                {brands.map((b, i) => (
                  <li key={b.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                    <span className="grid h-12 w-20 shrink-0 place-items-center overflow-hidden rounded-xl bg-secondary p-2">
                      {/* eslint-disable-next-line @next/next/no-img-element -- admin list of uploaded logos */}
                      {b.logoUrl ? <img src={b.logoUrl} alt="" className="size-full object-contain" /> : null}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{b.name}</p>
                      {!b.isActive ? <Badge variant="secondary" className="mt-1">{t("hidden")}</Badge> : null}
                    </div>
                    <div className="flex items-center">
                      <form action={moveBrandAction.bind(null, b.id, -1)}>
                        <button type="submit" disabled={i === 0} aria-label={t("moveUp")} title={t("moveUp")} className={round}>
                          <ArrowUp className="size-4 rtl:rotate-0" strokeWidth={1.8} />
                        </button>
                      </form>
                      <form action={moveBrandAction.bind(null, b.id, 1)}>
                        <button type="submit" disabled={i === brands.length - 1} aria-label={t("moveDown")} title={t("moveDown")} className={round}>
                          <ArrowDown className="size-4" strokeWidth={1.8} />
                        </button>
                      </form>
                      <FormSheet
                        trigger={<Pencil className="size-4" strokeWidth={1.8} />}
                        triggerClassName={round}
                        title={t("edit")}
                        action={saveBrandAction}
                      >
                        <BrandForm brand={b} />
                      </FormSheet>
                      <form action={deleteBrandAction.bind(null, b.id)}>
                        <DeleteButton />
                      </form>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
