"use client";

import { Loader2, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { AdminWilaya, WilayaUpdate } from "@/lib/api/types";
import { cn } from "@/lib/utils";
import { saveWilayasAction } from "./actions";

type Edit = { home?: string; desk?: string; active?: boolean };
const digits = (s: string) => s.replace(/\D/g, "");
const cell = "h-9 w-full rounded-lg px-2 text-center";

/** The 58 wilayas, editable in place. Change as many as you like, then save once. */
export function ShippingTable({ wilayas }: { wilayas: AdminWilaya[] }) {
  const t = useTranslations("shipping");
  const locale = useLocale();
  const router = useRouter();
  const [pending, start] = useTransition();
  const [edits, setEdits] = useState<Record<number, Edit>>({});
  const [q, setQ] = useState("");
  const [bulkHome, setBulkHome] = useState("");
  const [bulkDesk, setBulkDesk] = useState("");
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  const name = (w: AdminWilaya) => (locale === "fr" ? w.nameFr : w.nameAr);
  const visible = wilayas.filter((w) => !q.trim() || `${w.code} ${w.nameAr} ${w.nameFr}`.toLowerCase().includes(q.trim().toLowerCase()));
  const val = (w: AdminWilaya) => ({ home: edits[w.code]?.home ?? String(w.homeFee), desk: edits[w.code]?.desk ?? String(w.deskFee), active: edits[w.code]?.active ?? w.active });
  const set = (code: number, patch: Edit) => setEdits((e) => ({ ...e, [code]: { ...e[code], ...patch } }));

  const changes: WilayaUpdate[] = wilayas.flatMap((w) => {
    const v = val(w);
    const u: WilayaUpdate = { code: w.code };
    if (v.home !== "" && Number(v.home) !== w.homeFee) u.homeFee = Number(v.home);
    if (v.desk !== "" && Number(v.desk) !== w.deskFee) u.deskFee = Number(v.desk);
    if (v.active !== w.active) u.active = v.active;
    return Object.keys(u).length > 1 ? [u] : [];
  });

  function applyBulk() {
    setEdits((e) => {
      const next = { ...e };
      for (const w of visible) next[w.code] = { ...next[w.code], ...(bulkHome !== "" && { home: bulkHome }), ...(bulkDesk !== "" && { desk: bulkDesk }) };
      return next;
    });
  }

  function save() {
    setMessage(null);
    start(async () => {
      const r = await saveWilayasAction(changes);
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
      <div className="relative">
        <Search className="pointer-events-none absolute start-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("search")} className="ps-11" dir="auto" />
      </div>

      <div className="flex flex-wrap items-end gap-3 rounded-[var(--radius-card)] bg-secondary p-4">
        <div className="min-w-48 flex-1">
          <p className="text-xs font-semibold">{t("bulk")}</p>
          <p className="text-[11px] text-muted-foreground">{t("bulkHint")}</p>
        </div>
        <Input aria-label={t("home")} placeholder={t("home")} inputMode="numeric" dir="ltr" value={bulkHome} onChange={(e) => setBulkHome(digits(e.target.value))} className="h-10 w-28 bg-background text-center" />
        <Input aria-label={t("desk")} placeholder={t("desk")} inputMode="numeric" dir="ltr" value={bulkDesk} onChange={(e) => setBulkDesk(digits(e.target.value))} className="h-10 w-28 bg-background text-center" />
        <Button type="button" variant="outline" size="sm" onClick={applyBulk} disabled={!bulkHome && !bulkDesk}>{t("apply")} ({visible.length})</Button>
      </div>

      <div className="hidden grid-cols-[3rem_1fr_7rem_7rem_4.5rem] gap-3 px-3 text-[10px] font-semibold text-muted-foreground md:grid">
        <span>#</span><span>{t("wilaya")}</span><span className="text-center">{t("home")}</span><span className="text-center">{t("desk")}</span><span className="text-center">{t("active")}</span>
      </div>
      <ul className="divide-y divide-border rounded-[var(--radius-card)] border border-border">
        {visible.map((w) => {
          const v = val(w);
          return (
            <li key={w.code} className={cn("grid grid-cols-[1fr_auto] items-center gap-x-3 gap-y-2 p-3 md:grid-cols-[3rem_1fr_7rem_7rem_4.5rem]", edits[w.code] && "bg-primary/10", !v.active && "opacity-60")}>
              <span className="hidden text-xs tabular-nums text-muted-foreground md:block" dir="ltr">{String(w.code).padStart(2, "0")}</span>
              <span className="text-sm font-medium"><span className="text-xs text-muted-foreground md:hidden" dir="ltr">{String(w.code).padStart(2, "0")} · </span>{name(w)}</span>
              <label className="flex items-center justify-end gap-2 text-xs md:order-last md:justify-center">
                <input type="checkbox" checked={v.active} onChange={(e) => set(w.code, { active: e.target.checked })} className="size-4 accent-ink" aria-label={t("active")} />
                <span className="md:hidden">{t("active")}</span>
              </label>
              <div className="col-span-2 grid grid-cols-2 gap-2 md:col-span-2 md:grid-cols-2">
                <Input aria-label={t("home")} className={cell} dir="ltr" inputMode="numeric" value={v.home} onChange={(e) => set(w.code, { home: digits(e.target.value) })} />
                <Input aria-label={t("desk")} className={cell} dir="ltr" inputMode="numeric" value={v.desk} onChange={(e) => set(w.code, { desk: digits(e.target.value) })} />
              </div>
            </li>
          );
        })}
      </ul>

      <div className="sticky bottom-[calc(var(--bottombar-h)+env(safe-area-inset-bottom)+0.5rem)] z-10 flex items-center justify-between gap-3 rounded-full border border-border bg-background/95 p-2 ps-5 shadow-lg backdrop-blur lg:bottom-4">
        <span className={cn("text-xs", message ? (message.ok ? "text-emerald-400" : "text-destructive") : "text-muted-foreground")} role={message && !message.ok ? "alert" : undefined}>
          {message ? message.text : changes.length ? t("unsaved", { n: changes.length }) : ""}
        </span>
        <Button type="button" size="lg" onClick={save} disabled={pending || changes.length === 0}>
          {pending ? <Loader2 className="animate-spin" /> : null} {t("save")}
        </Button>
      </div>
    </div>
  );
}
