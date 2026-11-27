import { ArrowDown, ArrowUp, Pencil, Plus } from "lucide-react";
import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { DeleteButton } from "@/components/form/DeleteButton";
import { I18nFields, SwitchField } from "@/components/form/fields";
import { FormSheet } from "@/components/form/FormSheet";
import { ImageField } from "@/components/form/ImageField";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Locale } from "@/i18n/config";
import { api } from "@/lib/api";
import type { AdminCategory, AdminCollection } from "@/lib/api/types";
import { requireSession } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { CategoryDelete } from "./CategoryDelete";
import { deleteCollectionAction, moveCategoryAction, moveCollectionAction, saveCategoryAction, saveCollectionAction } from "./actions";
import { ProductPicker } from "./ProductPicker";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getTranslations("catalog"))("title") };
}

export default async function CatalogPage() {
  const token = await requireSession();
  const locale = (await getLocale()) as Locale;
  const [t, categories, collections, products] = await Promise.all([
    getTranslations("catalog"),
    api.listCategories(token),
    api.listCollections(token),
    api.listProducts(token, { limit: 100 }, locale),
  ]);
  const pickable = products.items.map((p) => ({ id: p.id, name: p.name, image: p.image }));
  const round = "grid size-9 place-items-center rounded-full transition hover:bg-secondary disabled:opacity-30";
  const name = (n: { ar: string; fr: string }) => (locale === "fr" && n.fr ? n.fr : n.ar);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-medium">{t("title")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t("subtitle")}</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2 lg:items-start">
        <Card>
          <CardHeader>
            <CardTitle>{t("categories")}</CardTitle>
            <FormSheet trigger={<><Plus className="size-4" /> {t("addCategory")}</>} triggerClassName={cn(buttonVariants({ size: "sm" }))} title={t("addCategory")} action={saveCategoryAction}>
              <CategoryForm />
            </FormSheet>
          </CardHeader>
          <CardContent>
            {categories.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">{t("noCategories")}</p>
            ) : (
              <ul className="divide-y divide-border">
                {categories.map((c, i) => (
                  <li key={c.id} className="flex items-center gap-2 py-3 first:pt-0 last:pb-0">
                    <div className="min-w-0 flex-1">
                      <p className="label truncate">{name(c.name)}</p>
                      <p className="text-xs text-muted-foreground">{t("productsCount", { count: c.productCount })}</p>
                      {!c.isActive ? <Badge variant="secondary" className="mt-1">{t("hidden")}</Badge> : null}
                    </div>
                    <form action={moveCategoryAction.bind(null, c.id, -1)}><button type="submit" disabled={i === 0} aria-label={t("moveUp")} title={t("moveUp")} className={round}><ArrowUp className="size-4" /></button></form>
                    <form action={moveCategoryAction.bind(null, c.id, 1)}><button type="submit" disabled={i === categories.length - 1} aria-label={t("moveDown")} title={t("moveDown")} className={round}><ArrowDown className="size-4" /></button></form>
                    <FormSheet trigger={<Pencil className="size-4" strokeWidth={1.8} />} triggerClassName={round} title={t("editCategory")} action={saveCategoryAction}>
                      <CategoryForm category={c} />
                    </FormSheet>
                    <CategoryDelete id={c.id} />
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("collections")}</CardTitle>
            <FormSheet trigger={<><Plus className="size-4" /> {t("addCollection")}</>} triggerClassName={cn(buttonVariants({ size: "sm" }))} title={t("addCollection")} action={saveCollectionAction}>
              <CollectionForm products={pickable} />
            </FormSheet>
          </CardHeader>
          <CardContent>
            {collections.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">{t("noCollections")}</p>
            ) : (
              <ul className="divide-y divide-border">
                {collections.map((c, i) => (
                  <li key={c.id} className="flex items-center gap-2 py-3 first:pt-0 last:pb-0">
                    <span className="grid size-12 shrink-0 place-items-center overflow-hidden rounded-xl bg-secondary">
                      {c.heroUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element -- admin thumbnails
                        <img src={c.heroUrl} alt="" className="size-full object-cover" />
                      ) : null}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="label truncate">{name(c.title)}</p>
                      <p className="text-xs text-muted-foreground">{t("productsCount", { count: c.productIds.length })}</p>
                      <Badge variant={c.isPublished ? "success" : "secondary"} className="mt-1">{c.isPublished ? t("published") : t("draft")}</Badge>
                    </div>
                    <form action={moveCollectionAction.bind(null, c.id, -1)}><button type="submit" disabled={i === 0} aria-label={t("moveUp")} title={t("moveUp")} className={round}><ArrowUp className="size-4" /></button></form>
                    <form action={moveCollectionAction.bind(null, c.id, 1)}><button type="submit" disabled={i === collections.length - 1} aria-label={t("moveDown")} title={t("moveDown")} className={round}><ArrowDown className="size-4" /></button></form>
                    <FormSheet trigger={<Pencil className="size-4" strokeWidth={1.8} />} triggerClassName={round} title={t("editCollection")} action={saveCollectionAction}>
                      <CollectionForm collection={c} products={pickable} />
                    </FormSheet>
                    <form action={deleteCollectionAction.bind(null, c.id)}><DeleteButton /></form>
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

async function CategoryForm({ category }: { category?: AdminCategory }) {
  const t = await getTranslations("catalog");
  return (
    <>
      {category ? <input type="hidden" name="id" value={category.id} /> : null}
      <I18nFields name="name" label={t("name")} defaults={category?.name} required />
      <ImageField name="image" label={t("image")} currentUrl={category?.imageUrl ?? null} maxSize={1000} />
      <SwitchField name="isActive" label={t("active")} defaultChecked={category?.isActive ?? true} />
    </>
  );
}

async function CollectionForm({ collection, products }: { collection?: AdminCollection; products: { id: string; name: string; image: string | null }[] }) {
  const t = await getTranslations("catalog");
  return (
    <>
      {collection ? <input type="hidden" name="id" value={collection.id} /> : null}
      <I18nFields name="title" label={t("titleField")} defaults={collection?.title} required />
      <I18nFields name="subtitle" label={t("subtitleField")} defaults={collection?.subtitle} />
      <ImageField name="hero" label={t("hero")} currentUrl={collection?.heroUrl ?? null} maxSize={1600} />
      <ProductPicker products={products} selected={collection?.productIds ?? []} />
      <SwitchField name="isPublished" label={t("published")} defaultChecked={collection?.isPublished ?? false} />
    </>
  );
}
