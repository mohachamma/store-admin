import type { LucideIcon } from "lucide-react";
import { getTranslations } from "next-intl/server";

export async function ComingSoon({ title, icon: Icon, phase }: { title: string; icon: LucideIcon; phase: number }) {
  const t = await getTranslations("common");
  return (
    <>
      <h1 className="font-display text-2xl uppercase tracking-[0.08em]">{title}</h1>
      <div className="mt-6 flex flex-col items-center gap-3 rounded-[var(--radius-card)] border border-dashed border-border px-6 py-20 text-center">
        <span className="grid size-14 place-items-center rounded-full bg-secondary">
          <Icon className="size-6" strokeWidth={1.6} />
        </span>
        <p className="text-sm font-semibold">{t("comingSoon")}</p>
        <p className="text-xs text-muted-foreground">{t("phase", { phase })}</p>
      </div>
    </>
  );
}
