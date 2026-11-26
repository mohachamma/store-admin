"use client";

import { Check } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { cn } from "@/lib/utils";

/** Tap products to add / remove them; the order of selection is the order in the collection (posted as repeated `productIds`). */
export function ProductPicker({ products, selected }: { products: { id: string; name: string; image: string | null }[]; selected: string[] }) {
  const t = useTranslations("catalog");
  const [ids, setIds] = useState<string[]>(selected);
  const toggle = (id: string) => setIds((l) => (l.includes(id) ? l.filter((x) => x !== id) : [...l, id]));
  return (
    <fieldset className="space-y-2">
      <legend className="text-xs font-semibold text-foreground/80">{t("pickProducts")} ({ids.length})</legend>
      <p className="text-[11px] text-muted-foreground">{t("pickHint")}</p>
      {ids.map((id) => (
        <input key={id} type="hidden" name="productIds" value={id} />
      ))}
      <ul className="grid max-h-72 grid-cols-3 gap-2 overflow-y-auto pe-1">
        {products.map((p) => {
          const pos = ids.indexOf(p.id);
          return (
            <li key={p.id}>
              <button type="button" onClick={() => toggle(p.id)} aria-pressed={pos >= 0} className={cn("relative w-full rounded-xl border p-1.5 text-start transition", pos >= 0 ? "border-ink bg-secondary" : "border-border")}>
                <span className="grid aspect-[4/5] place-items-center overflow-hidden rounded-lg bg-background">
                  {p.image ? (
                    // eslint-disable-next-line @next/next/no-img-element -- admin thumbnails
                    <img src={p.image} alt="" className="size-full object-contain p-1" />
                  ) : null}
                </span>
                <span className="mt-1 line-clamp-2 block text-[10px] font-medium leading-tight">{p.name}</span>
                {pos >= 0 ? (
                  <span className="absolute end-1 top-1 grid size-5 place-items-center rounded-full bg-ink text-[10px] font-bold text-paper">{pos + 1 < 10 ? pos + 1 : <Check className="size-3" />}</span>
                ) : null}
              </button>
            </li>
          );
        })}
      </ul>
    </fieldset>
  );
}
