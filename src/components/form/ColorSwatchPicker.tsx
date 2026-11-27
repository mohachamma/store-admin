"use client";

import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";

/** Common colors: `key` is stored as the variant's color name (the storefront translates it), `hex` is the round dot. */
export const COLOR_PRESETS = [
  { key: "black", hex: "#111111" },
  { key: "white", hex: "#ffffff" },
  { key: "cream", hex: "#f1e9d8" },
  { key: "beige", hex: "#d9c7a6" },
  { key: "sand", hex: "#c9ad82" },
  { key: "stone", hex: "#bdb3a2" },
  { key: "grey", hex: "#8a8a8a" },
  { key: "charcoal", hex: "#3a3a3a" },
  { key: "navy", hex: "#1f2a44" },
  { key: "blue", hex: "#2f5fa7" },
  { key: "denim", hex: "#4a6fa5" },
  { key: "red", hex: "#c0392b" },
  { key: "burgundy", hex: "#6d1f2e" },
  { key: "pink", hex: "#e8a7b6" },
  { key: "orange", hex: "#e07b2f" },
  { key: "yellow", hex: "#e6c437" },
  { key: "green", hex: "#3d7a4a" },
  { key: "olive", hex: "#6b6b3a" },
  { key: "brown", hex: "#6b4a2f" },
  { key: "purple", hex: "#6f4a8e" },
] as const;

export const presetByName = (name: string) => COLOR_PRESETS.find((p) => p.key === name.trim().toLowerCase());

/** A small round color dot. Tap it to choose from common colors or pick any exact color. */
export function ColorSwatchPicker({ value, onChange }: { value: string; onChange: (hex: string, presetKey?: string) => void }) {
  const t = useTranslations("colors");
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: PointerEvent) => !box.current?.contains(e.target as Node) && setOpen(false);
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [open]);

  return (
    <div ref={box} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={t("choose")}
        aria-expanded={open}
        title={t("choose")}
        className="grid size-10 place-items-center rounded-full border border-border"
      >
        <span className="size-6 rounded-full border border-black/15" style={value ? { background: value } : { background: "repeating-conic-gradient(#e5e5e5 0% 25%, #fff 0% 50%) 50% / 8px 8px" }} />
      </button>
      {open ? (
        <div className="absolute start-0 top-12 z-30 w-60 space-y-3 rounded-2xl border border-border bg-background p-3 shadow-xl">
          <ul className="grid grid-cols-5 gap-2.5">
            {COLOR_PRESETS.map((p) => (
              <li key={p.key} className="grid place-items-center">
                <button
                  type="button"
                  onClick={() => { onChange(p.hex, p.key); setOpen(false); }}
                  aria-label={t(p.key)}
                  title={t(p.key)}
                  className={`size-8 rounded-full border ${value.toLowerCase() === p.hex ? "ring-2 ring-ink ring-offset-2" : "border-black/15"}`}
                  style={{ background: p.hex }}
                />
              </li>
            ))}
          </ul>
          <label className="flex items-center justify-between gap-3 text-xs font-semibold">
            {t("custom")}
            <input type="color" value={value || "#999999"} onChange={(e) => onChange(e.target.value)} className="h-9 w-14 cursor-pointer rounded-lg border border-border bg-transparent p-0.5" />
          </label>
        </div>
      ) : null}
    </div>
  );
}
