"use server";

import { revalidatePath } from "next/cache";
import { getTranslations } from "next-intl/server";
import type { FormState } from "@/components/form/FormSheet";
import { api } from "@/lib/api";
import type { ExpenseCategory } from "@/lib/api/types";
import { requireSession } from "@/lib/auth";

const CATEGORIES: ExpenseCategory[] = ["ads", "packaging", "salaries", "rent", "other"];

export async function saveExpenseAction(_prev: FormState, form: FormData): Promise<FormState> {
  const token = await requireSession();
  const t = await getTranslations("profit");
  const amount = Number(String(form.get("amount") ?? "").replace(/\s/g, ""));
  const spentOn = String(form.get("spentOn") ?? "");
  const category = String(form.get("category") ?? "") as ExpenseCategory;
  if (!Number.isInteger(amount) || amount < 1 || !/^\d{4}-\d{2}-\d{2}$/.test(spentOn) || !CATEGORIES.includes(category)) return { error: t("errors.expense") };
  try {
    await api.saveExpense(token, String(form.get("id") ?? "") || null, {
      spentOn,
      category,
      platform: String(form.get("platform") ?? "").trim() || null,
      amount,
      note: String(form.get("note") ?? "").trim() || null,
    });
  } catch {
    return { error: t("errors.generic") };
  }
  revalidatePath("/profit");
  return { ok: true, at: Date.now() };
}

export async function deleteExpenseAction(id: string) {
  await api.deleteExpense(await requireSession(), id);
  revalidatePath("/profit");
}

export async function saveProfitSettingsAction(_prev: FormState, form: FormData): Promise<FormState> {
  const token = await requireSession();
  const t = await getTranslations("profit");
  const returnFee = Number(String(form.get("returnFee") ?? "0").trim() || 0);
  const cardFeePercent = Number(String(form.get("cardFeePercent") ?? "0").replace(",", ".").trim() || 0);
  if (!Number.isInteger(returnFee) || returnFee < 0 || !(cardFeePercent >= 0 && cardFeePercent <= 20)) return { error: t("errors.settings") };
  try {
    await api.saveProfitSettings(token, { returnFee, returnedItemsLost: form.get("returnedItemsLost") === "on", cardFeePercent });
  } catch {
    return { error: t("errors.generic") };
  }
  revalidatePath("/profit");
  return { ok: true, at: Date.now() };
}
