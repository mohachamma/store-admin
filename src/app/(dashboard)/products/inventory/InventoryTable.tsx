"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { AdminVariantRow, BulkVariantUpdate } from "@/lib/api/types";
import { cn } from "@/lib/utils";
import { bulkUpdateAction } from "../actions";

type Edit = { price?: string; compare?: string; stock?: string };
const digits = (s: string) => s.replace(/\D/g, "");
const cell = "h-9 w-full rounded-lg px-2 text-center";

/** Editable variants: change prices, compare-at prices and stock, then save everything in one request. */
export function InventoryTable({ rows }: { rows: AdminVariantRow[] }) {
  const t = useTranslations("inventory");
  const router = useRouter();
  const [pending, start] = useTransition();
  const [edits, setEdits] = useState<Record<string, Edit>>({});
  const [pct, setPct] = useState("");
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  const val = (r: AdminVariantRow) => ({
    price: edits[r.variantId]?.price ?? String(r.price),
    compare: edits[r.variantId]?.compare ?? (r.compareAtPrice ? String(r.compareAtPrice) : ""),
    stock: edits[r.variantId]?.stock ?? String(r.stock),
  });
  const set = (id: string, patch: Edit) => setEdits((e) => ({ ...e, [id]: { ...e[id], ...patch } }));

  const changes: BulkVariantUpdate[] = rows.flatMap((r) => {
    const v = val(r);
    const u: BulkVariantUpdate = { variantId: r.variantId };
    if (Number(v.price) !== r.price && Number(v.price) > 0) u.price = Number(v.price);
    const compare = v.compare.trim() ? Number(v.compare) : null;
    if (compare !== r.compareAtPrice) u.compareAtPrice = compare;
    if (v.stock !== "" && Number(v.stock) !== r.stock) u.stock = Number(v.stock);
    return Object.keys(u).length > 1 ? [u] : [];
  });

  /** Percentage discount: the current price becomes the compare-at price and the new price is lower. */
  function applyDiscount() {
    const p = Number(pct);
    if (!(p > 0 && p < 90)) return;
    setEdits((e) => {
      const next = { ...e };
      for (const r of rows) {
        const base = r.compareAtPrice ?? r.price;
        const price = Math.max(1, Math.round((base * (100 - p)) / 100 / 10) * 10 || 1);
        if (price < base) next[r.variantId] = { ...next[r.variantId], price: String(price), compare: String(base) };
      }
      return next;
    });
  }
  const clearDiscount = () => setEdits((e) => Object.fromEntries([...Object.entries(e), ...rows.map((r): [string, Edit] => [r.variantId, { ...e[r.variantId], compare: "" }])]));

  function save() {
    setMessage(null);
    start(async () => {
      const r = await bulkUpdateAction(changes);
      if (r.ok) {
        setEdits({});
        setMessage({ ok: true, text: t("saved", { n: r.updated }) });
        router.refresh();
      } else {
        setMessage({ ok: false, text: t("error") });
      }
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3 rounded-[var(--radius-card)] bg-secondary p-4">
        <div className="min-w-48 flex-1">
          <p className="text-xs font-semibold">{t("discount")}</p>
          <p className="text-[11px] text-muted-foreground">{t("discountHint")}</p>
        </div>
        <Input aria-label={t("percent")} placeholder={t("percent")} inputMode="numeric" dir="ltr" value={pct} onChange={(e) => setPct(digits(e.target.value))} className="h-10 w-28 bg-background text-center" />
        <Button type="button" variant="outline" size="sm" onClick={applyDiscount} disabled={!pct}>{t("apply")}</Button>
        <Button type="button" variant="ghost" size="sm" onClick={clearDiscount}>{t("clearDiscount")}</Button>
      </div>

      <ul className="divide-y divide-border rounded-[var(--radius-card)] border border-border">
        {rows.map((r) => {
          const v = val(r);
          const dirty = Boolean(edits[r.variantId]);
          return (
            <li key={r.variantId} className={cn("grid grid-cols-[1fr_auto] items-center gap-x-3 gap-y-2 p-3 md:grid-cols-[2fr_repeat(3,7rem)]", dirty && "bg-primary/10")}>
              <div className="flex min-w-0 items-center gap-3">
                <span className="grid size-11 shrink-0 place-items-center overflow-hidden rounded-xl bg-secondary p-1">
                  {r.image ? (
                    // eslint-disable-next-line @next/next/no-img-element -- admin thumbnails
                    <img src={r.image} alt="" className="size-full object-contain" />
                  ) : null}
                </span>
                <div className="min-w-0">
                  <p className="label truncate">{r.productName}</p>
                  <p className="text-xs text-muted-foreground" dir="ltr">{r.size}{r.color ? ` · ${r.color}` : ""}</p>
                </div>
              </div>
              <div className="col-span-2 grid grid-cols-3 gap-2 md:col-span-3">
                <Input aria-label="price" className={cell} dir="ltr" inputMode="numeric" value={v.price} onChange={(e) => set(r.variantId, { price: digits(e.target.value) })} />
                <Input aria-label="compare" className={cell} dir="ltr" inputMode="numeric" placeholder="—" value={v.compare} onChange={(e) => set(r.variantId, { compare: digits(e.target.value) })} />
                <Input aria-label="stock" className={cn(cell, Number(v.stock) <= 3 && "text-destructive")} dir="ltr" inputMode="numeric" value={v.stock} onChange={(e) => set(r.variantId, { stock: digits(e.target.value) })} />
              </div>
            </li>
          );
        })}
      </ul>

      <div className="sticky bottom-[calc(var(--bottombar-h)+env(safe-area-inset-bottom)+0.5rem)] z-10 flex items-center justify-between gap-3 rounded-full border border-border bg-background/95 p-2 ps-5 shadow-lg backdrop-blur lg:bottom-4">
        <span className={cn("text-xs", message ? (message.ok ? "text-emerald-400 light:text-emerald-700" : "text-destructive") : "text-muted-foreground")} role={message && !message.ok ? "alert" : undefined}>
          {message ? message.text : changes.length ? t("unsaved", { n: changes.length }) : ""}
        </span>
        <Button type="button" size="lg" onClick={save} disabled={pending || changes.length === 0}>
          {pending ? <Loader2 className="animate-spin" /> : null} {t("save")}
        </Button>
      </div>
    </div>
  );
}
