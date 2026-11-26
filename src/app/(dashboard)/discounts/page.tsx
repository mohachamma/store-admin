import { Pencil, Plus } from "lucide-react";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { DeleteButton } from "@/components/form/DeleteButton";
import { FormSheet } from "@/components/form/FormSheet";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { api } from "@/lib/api";
import { requireSession } from "@/lib/auth";
import { codesWithStatus, type CodeStatus } from "@/lib/statuses";
import { cn } from "@/lib/utils";
import { deleteDiscountAction, saveDiscountAction } from "./actions";
import { DiscountForm } from "./DiscountForm";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getTranslations("discounts"))("title") };
}

const variant: Record<CodeStatus, "success" | "info" | "secondary" | "warning"> = { live: "success", scheduled: "info", expired: "secondary", off: "warning" };

export default async function DiscountsPage() {
  const token = await requireSession();
  const [t, raw] = await Promise.all([getTranslations("discounts"), api.listDiscountCodes(token)]);
  const codes = codesWithStatus(raw);
  const round = "grid size-9 place-items-center rounded-full transition hover:bg-secondary";
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl uppercase tracking-[0.08em]">{t("title")}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t("subtitle")}</p>
        </div>
        <FormSheet trigger={<><Plus className="size-4" /> {t("add")}</>} triggerClassName={cn(buttonVariants())} title={t("add")} action={saveDiscountAction}>
          <DiscountForm />
        </FormSheet>
      </div>
      {codes.length === 0 ? (
        <p className="rounded-[var(--radius-card)] border border-dashed border-border py-16 text-center text-sm text-muted-foreground">{t("empty")}</p>
      ) : (
        <ul className="divide-y divide-border rounded-[var(--radius-card)] border border-border">
          {codes.map((c) => {
            const s = c.status;
            return (
              <li key={c.id} className="flex items-center gap-3 p-4">
                <div className="min-w-0 flex-1 space-y-1">
                  <p className="font-mono text-sm font-semibold" dir="ltr">{c.code}</p>
                  <p className="text-xs text-muted-foreground">
                    <span dir="ltr">{c.kind === "percent" ? `${c.value}%` : `${c.value} DA`}</span>
                    {" · "}
                    {c.maxUses !== null ? t("usedOf", { n: c.usedCount, max: c.maxUses }) : t("used", { n: c.usedCount })}
                  </p>
                </div>
                <Badge variant={variant[s]}>{t(s)}</Badge>
                <FormSheet trigger={<Pencil className="size-4" strokeWidth={1.8} />} triggerClassName={round} title={t("edit")} action={saveDiscountAction}>
                  <DiscountForm code={c} />
                </FormSheet>
                <form action={deleteDiscountAction.bind(null, c.id)}>
                  <DeleteButton />
                </form>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
