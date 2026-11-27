import { getTranslations } from "next-intl/server";
import { Field } from "@/components/form/fields";
import { Input } from "@/components/ui/input";
import type { Expense } from "@/lib/api/types";

const CATEGORIES = ["ads", "packaging", "salaries", "rent", "other"] as const;

export async function ExpenseForm({ expense, today }: { expense?: Expense; today: string }) {
  const t = await getTranslations("profit");
  const radio = "flex h-10 cursor-pointer items-center justify-center rounded-xl border border-border px-3 text-xs font-medium transition has-[:checked]:border-ink has-[:checked]:bg-ink has-[:checked]:text-paper";
  return (
    <>
      {expense ? <input type="hidden" name="id" value={expense.id} /> : null}
      <fieldset className="space-y-2">
        <legend className="text-xs font-semibold text-foreground/80">{t("category")}</legend>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <label key={c} className={radio}>
              <input type="radio" name="category" value={c} defaultChecked={(expense?.category ?? "ads") === c} className="sr-only" />
              {t(`cat.${c}`)}
            </label>
          ))}
        </div>
      </fieldset>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={t("amount")} htmlFor="ex-amount">
          <Input id="ex-amount" name="amount" dir="ltr" inputMode="numeric" required defaultValue={expense?.amount} />
        </Field>
        <Field label={t("date")} htmlFor="ex-date">
          <Input id="ex-date" name="spentOn" type="date" dir="ltr" required defaultValue={expense?.spentOn ?? today} />
        </Field>
      </div>
      <Field label={t("platform")} htmlFor="ex-platform" hint={t("platformHint")}>
        <Input id="ex-platform" name="platform" list="ex-platforms" maxLength={40} defaultValue={expense?.platform ?? ""} />
        <datalist id="ex-platforms">
          {["Facebook", "Instagram", "TikTok", "Google", "Snapchat", "YouTube"].map((p) => (
            <option key={p} value={p} />
          ))}
        </datalist>
      </Field>
      <Field label={t("note")} htmlFor="ex-note">
        <Input id="ex-note" name="note" maxLength={200} defaultValue={expense?.note ?? ""} />
      </Field>
    </>
  );
}
