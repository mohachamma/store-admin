"use client";

import { ChevronLeft, ChevronRight, ImagePlus, Loader2, Plus, Trash2, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useRef, useState, useTransition } from "react";
import { ColorSwatchPicker, presetByName } from "@/components/form/ColorSwatchPicker";
import { I18nFields, readI18n, SwitchField } from "@/components/form/fields";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { AdminBrand, AdminCategory, AdminProduct, ProductInput } from "@/lib/api/types";
import { optimizeImage } from "@/lib/image-optimize";
import { cn } from "@/lib/utils";
import { deleteProductAction, saveProductAction, uploadProductImageAction } from "./actions";

interface Row {
  key: string;
  id?: string;
  size: string;
  color: string;
  /** Exact swatch color "#rrggbb" ("" = not chosen). */
  colorHex: string;
  sku: string;
  stock: string;
  price: string;
  compare: string;
  cost: string;
}

const MAX_IMAGES = 10;
const SIZE_SETS = [["XS", "S", "M", "L", "XL"], ["40", "41", "42", "43", "44"]];
const select = "h-11 w-full rounded-xl bg-secondary px-4 text-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring/15";
const cell = "h-10 rounded-lg px-2.5 text-center";

let seq = 0;
const newKey = () => `r${++seq}`;
const toRow = (v: AdminProduct["variants"][number]): Row => ({ key: newKey(), id: v.id, size: v.size, color: v.color, colorHex: v.colorHex ?? "", sku: v.sku ?? "", stock: String(v.stock), price: String(v.price), compare: v.compareAtPrice ? String(v.compareAtPrice) : "", cost: v.costPrice === null || v.costPrice === undefined ? "" : String(v.costPrice) });

export function ProductForm({ product, categories, brands }: { product?: AdminProduct; categories: AdminCategory[]; brands: AdminBrand[] }) {
  const t = useTranslations("products");
  const router = useRouter();
  const [pending, start] = useTransition();
  const fileInput = useRef<HTMLInputElement>(null);

  // Each photo may belong to one color ("" = shown for every color).
  const [images, setImages] = useState<{ url: string; color: string }[]>(product?.images.map((i) => ({ url: i.url, color: i.color ?? "" })) ?? []);
  const [uploading, setUploading] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [rows, setRows] = useState<Row[]>(product?.variants.map(toRow) ?? []);
  const [error, setError] = useState<string | null>(null);

  // The distinct color names of the variants (used to link photos to colors).
  const colorNames = [...new Set(rows.map((r) => r.color.trim()).filter(Boolean))];
  const setRow = (key: string, patch: Partial<Row>) => setRows((rs) => rs.map((r) => (r.key === key ? { ...r, ...patch } : r)));
  const addSizes = (sizes: string[]) =>
    setRows((rs) => {
      const have = new Set(rs.map((r) => `${r.size.toLowerCase()}|${r.color.toLowerCase()}`));
      const template = rs[0];
      const added = sizes.filter((s) => !have.has(`${s.toLowerCase()}|${(template?.color ?? "").toLowerCase()}`)).map((size): Row => ({ key: newKey(), size, color: template?.color ?? "", colorHex: template?.colorHex ?? "", sku: "", stock: "0", price: template?.price ?? "", compare: template?.compare ?? "", cost: template?.cost ?? "" }));
      return [...rs, ...added];
    });

  async function onFiles(files: FileList | null) {
    if (!files?.length) return;
    setImageError(false);
    setUploading(true);
    const urls: string[] = [];
    for (const file of Array.from(files).slice(0, MAX_IMAGES - images.length)) {
      try {
        const { file: small } = await optimizeImage(file, { maxSize: 1600 }); // resized + WebP in the browser first
        const form = new FormData();
        form.append("file", small);
        const r = await uploadProductImageAction(form);
        if ("url" in r) urls.push(r.url);
        else setImageError(true);
      } catch {
        setImageError(true);
      }
    }
    setImages((prev) => [...prev, ...urls.map((url) => ({ url, color: "" }))].slice(0, MAX_IMAGES));
    setUploading(false);
    if (fileInput.current) fileInput.current.value = "";
  }
  const moveImage = (i: number, d: -1 | 1) =>
    setImages((list) => {
      const j = i + d;
      if (j < 0 || j >= list.length) return list;
      const next = [...list];
      [next[i], next[j]] = [next[j]!, next[i]!];
      return next;
    });

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const name = readI18n(f, "name");
    const description = readI18n(f, "description");
    const categoryId = String(f.get("categoryId") ?? "");
    const isPublished = f.get("isPublished") === "on";
    if (!name.ar) return setError(t("errors.nameRequired"));
    if (!categoryId) return setError(t("errors.categoryRequired"));

    const variants: ProductInput["variants"] = [];
    const seen = new Set<string>();
    for (const r of rows) {
      const price = Number(r.price);
      const compare = r.compare.trim() ? Number(r.compare) : null;
      if (!r.size.trim()) continue;
      if (!Number.isInteger(price) || price < 1) return setError(t("errors.price"));
      if (compare !== null && (!Number.isInteger(compare) || compare <= price)) return setError(t("errors.compare"));
      const k = `${r.size.trim().toLowerCase()}|${r.color.trim().toLowerCase()}`;
      if (seen.has(k)) return setError(t("errors.duplicate"));
      seen.add(k);
      variants.push({ id: r.id, size: r.size.trim(), color: r.color.trim(), colorHex: r.colorHex || null, sku: r.sku.trim() || null, stock: Math.max(0, Math.floor(Number(r.stock) || 0)), price, compareAtPrice: compare, costPrice: r.cost.trim() ? Number(r.cost) : null });
    }
    if (isPublished && variants.length === 0) return setError(t("errors.needVariant"));
    if (isPublished && images.length === 0) return setError(t("errors.needImage"));

    setError(null);
    start(async () => {
      const r = await saveProductAction(product?.id ?? null, {
        name, description, categoryId, brandId: String(f.get("brandId") ?? "") || null, isPublished, isNew: f.get("isNew") === "on", audience: (["women", "men"].includes(String(f.get("audience"))) ? String(f.get("audience")) : "unisex") as "women" | "men" | "unisex", images: images.map((i) => i.url), imageColors: images.map((i) => i.color || null), variants,
      });
      if (r.ok) return router.push("/products");
      setError(r.code === "conflict" ? t("errors.sku") : `${t("errors.generic")}${r.message ? ` (${r.message})` : ""}`);
    });
  }

  return (
    <form onSubmit={submit} className="mx-auto max-w-3xl space-y-4">
      <Link href="/products" className="text-xs text-muted-foreground hover:text-foreground">← {t("back")}</Link>
      <h1 className="font-display text-3xl font-medium">{product ? t("editTitle") : t("newTitle")}</h1>

      <Card>
        <CardHeader><CardTitle>{t("basic")}</CardTitle></CardHeader>
        <CardContent className="space-y-5">
          <I18nFields name="name" label={t("name")} defaults={product?.name} required />
          <I18nFields name="description" label={t("description")} defaults={product?.description} />
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2 text-xs font-semibold text-foreground/80">
              {t("category")}
              <select name="categoryId" defaultValue={product?.categoryId ?? ""} required className={select}>
                <option value="">{t("chooseCategory")}</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name.ar}{c.name.fr ? ` · ${c.name.fr}` : ""}</option>
                ))}
              </select>
            </label>
            <label className="space-y-2 text-xs font-semibold text-foreground/80">
              {t("brand")}
              <select name="brandId" defaultValue={product?.brandId ?? ""} className={select}>
                <option value="">{t("noBrand")}</option>
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </label>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>{t("images")}</CardTitle>
            <p className="mt-1 text-[11px] text-muted-foreground">{t("imagesHint")}</p>
          </div>
          <Button type="button" variant="outline" size="sm" disabled={uploading || images.length >= MAX_IMAGES} onClick={() => fileInput.current?.click()}>
            {uploading ? <Loader2 className="animate-spin" /> : <ImagePlus />} {t("addImages")}
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          <input ref={fileInput} type="file" multiple accept="image/png,image/jpeg,image/webp,image/gif" className="sr-only" tabIndex={-1} onChange={(e) => void onFiles(e.target.files)} />
          {images.length === 0 && !uploading ? (
            <button type="button" onClick={() => fileInput.current?.click()} className="grid w-full place-items-center gap-2 rounded-2xl border border-dashed border-border py-10 text-sm text-muted-foreground">
              <ImagePlus className="size-6" strokeWidth={1.5} /> {t("addImages")}
            </button>
          ) : (
            <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4">
              {images.map(({ url, color }, i) => (
                <li key={url} className="space-y-1.5">
                  <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-secondary">
                    {/* eslint-disable-next-line @next/next/no-img-element -- admin preview of uploaded photos */}
                    <img src={url} alt="" className="size-full object-contain p-1" />
                    {i === 0 ? <span className="absolute start-1 top-1 rounded-full bg-ink px-2 py-0.5 text-[9px] font-bold text-paper">{t("cover")}</span> : null}
                    <button type="button" onClick={() => setImages((l) => l.filter((_, k) => k !== i))} aria-label={t("removeImage")} title={t("removeImage")} className="absolute end-1 top-1 grid size-6 place-items-center rounded-full bg-background/90 shadow">
                      <X className="size-3.5" />
                    </button>
                  </div>
                  <div className="flex justify-center gap-1">
                    <button type="button" disabled={i === 0} onClick={() => moveImage(i, -1)} aria-label={t("moveEarlier")} title={t("moveEarlier")} className="grid size-8 place-items-center rounded-full hover:bg-secondary disabled:opacity-30"><ChevronLeft className="size-4 rtl:rotate-180" /></button>
                    <button type="button" disabled={i === images.length - 1} onClick={() => moveImage(i, 1)} aria-label={t("moveLater")} title={t("moveLater")} className="grid size-8 place-items-center rounded-full hover:bg-secondary disabled:opacity-30"><ChevronRight className="size-4 rtl:rotate-180" /></button>
                  </div>
                  {colorNames.length > 0 ? (
                    <select value={color} onChange={(e) => setImages((l) => l.map((x, k) => (k === i ? { ...x, color: e.target.value } : x)))} aria-label={t("imageColor")} className="h-8 w-full rounded-lg bg-secondary px-2 text-[11px]">
                      <option value="">{t("allColors")}</option>
                      {colorNames.map((n) => (
                        <option key={n} value={n}>{n}</option>
                      ))}
                    </select>
                  ) : null}
                </li>
              ))}
              {uploading ? <li className="grid aspect-[4/5] place-items-center rounded-xl bg-secondary"><Loader2 className="size-5 animate-spin text-muted-foreground" /></li> : null}
            </ul>
          )}
          {uploading ? <p className="text-[11px] text-muted-foreground">{t("uploading")}</p> : null}
          {imageError ? <p role="alert" className="text-[11px] text-destructive">{t("uploadFailed")}</p> : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("variantsTitle")}</CardTitle>
          <Button type="button" variant="outline" size="sm" onClick={() => setRows((rs) => [...rs, { key: newKey(), size: "", color: rs[0]?.color ?? "", colorHex: rs[0]?.colorHex ?? "", sku: "", stock: "0", price: rs[0]?.price ?? "", compare: rs[0]?.compare ?? "", cost: rs[0]?.cost ?? "" }])}>
            <Plus /> {t("addVariant")}
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] text-muted-foreground">{t("quickSizes")}:</span>
            {SIZE_SETS.map((set) => (
              <button key={set[0]} type="button" onClick={() => addSizes(set)} className="rounded-full border border-border px-3 py-1 text-xs font-semibold transition hover:border-foreground" dir="ltr">
                {set[0]}–{set[set.length - 1]}
              </button>
            ))}
          </div>
          {rows.length === 0 ? (
            <p className="rounded-xl bg-secondary px-4 py-6 text-center text-xs text-muted-foreground">{t("noVariantsHint")}</p>
          ) : (
            <div className="space-y-2">
              <div className="hidden grid-cols-[1fr_1fr_1.2fr_.8fr_1fr_1fr_1fr_2rem] gap-2 px-1 text-[10px] font-semibold text-muted-foreground md:grid">
                <span>{t("size")}</span><span>{t("color")}</span><span>{t("sku")}</span><span>{t("stockLabel")}</span><span>{t("price")}</span><span>{t("compare")}</span><span>{t("cost")}</span><span />
              </div>
              {rows.map((r) => (
                <div key={r.key} className="grid grid-cols-3 gap-2 rounded-2xl border border-border p-2 md:grid-cols-[1fr_1fr_1.2fr_.8fr_1fr_1fr_1fr_2rem] md:border-0 md:p-0">
                  <Field label={t("size")}><Input className={cell} dir="ltr" value={r.size} maxLength={10} onChange={(e) => setRow(r.key, { size: e.target.value })} /></Field>
                  <Field label={t("color")}>
                    <div className="flex items-center gap-1.5">
                      <ColorSwatchPicker
                        value={r.colorHex}
                        onChange={(hex, preset) =>
                          // One color has one dot: apply it to every row with the same color name (and name the color when a preset is chosen).
                          setRows((rs) => {
                            const name = r.color.trim() || preset || "";
                            return rs.map((x) => (x.key === r.key || (name && x.color.trim().toLowerCase() === name.toLowerCase()) ? { ...x, color: x.key === r.key ? name : x.color, colorHex: hex } : x));
                          })
                        }
                      />
                      <Input
                        className={cn(cell, "min-w-0 flex-1")}
                        value={r.color}
                        maxLength={40}
                        onChange={(e) => {
                          const name = e.target.value;
                          const known = presetByName(name);
                          setRow(r.key, { color: name, ...(known && !r.colorHex ? { colorHex: known.hex } : {}) });
                        }}
                      />
                    </div>
                  </Field>
                  <Field label={t("sku")}><Input className={cell} dir="ltr" value={r.sku} maxLength={40} onChange={(e) => setRow(r.key, { sku: e.target.value })} /></Field>
                  <Field label={t("stockLabel")}><Input className={cell} dir="ltr" inputMode="numeric" value={r.stock} onChange={(e) => setRow(r.key, { stock: e.target.value.replace(/\D/g, "") })} /></Field>
                  <Field label={t("price")}><Input className={cell} dir="ltr" inputMode="numeric" value={r.price} onChange={(e) => setRow(r.key, { price: e.target.value.replace(/\D/g, "") })} /></Field>
                  <Field label={t("compare")}><Input className={cell} dir="ltr" inputMode="numeric" value={r.compare} onChange={(e) => setRow(r.key, { compare: e.target.value.replace(/\D/g, "") })} /></Field>
                  <Field label={t("cost")}><Input className={cell} dir="ltr" inputMode="numeric" value={r.cost} onChange={(e) => setRow(r.key, { cost: e.target.value.replace(/\D/g, "") })} /></Field>
                  <button type="button" onClick={() => setRows((rs) => rs.filter((x) => x.key !== r.key))} aria-label={t("removeVariant")} title={t("removeVariant")} className="grid h-10 place-items-center rounded-full text-destructive hover:bg-destructive/10">
                    <Trash2 className="size-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>{t("flags")}</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <SwitchField name="isPublished" label={t("isPublished")} hint={t("isPublishedHint")} defaultChecked={product?.isPublished ?? false} />
          <SwitchField name="isNew" label={t("isNew")} defaultChecked={product?.isNew ?? false} />
          <div className="space-y-2">
            <label htmlFor="audience" className="text-xs font-semibold text-foreground/80">{t("audience")}</label>
            <select id="audience" name="audience" defaultValue={product?.audience ?? "unisex"} className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm">
              <option value="unisex">{t("audienceUnisex")}</option>
              <option value="women">{t("audienceWomen")}</option>
              <option value="men">{t("audienceMen")}</option>
            </select>
            <p className="text-[11px] text-muted-foreground">{t("audienceHint")}</p>
          </div>
        </CardContent>
      </Card>

      {error ? <p role="alert" className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</p> : null}
      <div className="sticky bottom-[calc(var(--bottombar-h)+env(safe-area-inset-bottom)+0.5rem)] z-10 flex items-center justify-between gap-3 rounded-full border border-border bg-background/95 p-2 shadow-lg backdrop-blur lg:bottom-4">
        {product ? (
          <button
            type="button"
            disabled={pending}
            onClick={() => {
              if (window.confirm(t("confirmDelete"))) start(async () => { await deleteProductAction(product.id); router.push("/products"); });
            }}
            className="flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="size-4" /> {t("delete")}
          </button>
        ) : <span />}
        <Button type="submit" size="lg" disabled={pending || uploading} className={cn("min-w-40")}>
          {pending ? <Loader2 className="animate-spin" /> : null}
          {pending ? t("saving") : t("save")}
        </Button>
      </div>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1 md:space-y-0">
      <span className="text-[10px] font-semibold text-muted-foreground md:sr-only">{label}</span>
      {children}
    </label>
  );
}
