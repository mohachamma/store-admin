"use server";

import { revalidatePath } from "next/cache";
import { getTranslations } from "next-intl/server";
import type { FormState } from "@/components/form/FormSheet";
import { api } from "@/lib/api";
import { requireSession } from "@/lib/auth";

export async function saveDiscountAction(_prev: FormState, form: FormData): Promise<FormState> {
  const token = await requireSession();
  const t = await getTranslations("discounts");
  const code = String(form.get("code") ?? "").trim().toUpperCase();
  if (!/^[A-Z0-9_-]{3,32}$/.test(code)) return { error: t("codeHint") };
  const kind = form.get("kind") === "fixed" ? "fixed" : "percent";
  const value = Number(form.get("value"));
  if (!Number.isInteger(value) || value < 1) return { error: t("errors.generic") };
  if (kind === "percent" && value > 100) return { error: t("errors.percent") };
  const startsAt = String(form.get("startsAt") ?? "") || null;
  const endsAt = String(form.get("endsAt") ?? "") || null;
  if (startsAt && endsAt && new Date(endsAt) <= new Date(startsAt)) return { error: t("errors.dates") };
  const maxRaw = String(form.get("maxUses") ?? "").trim();
  try {
    await api.saveDiscountCode(token, String(form.get("id") ?? "") || null, {
      code,
      kind,
      value,
      minSubtotal: Number(form.get("minSubtotal")) || 0,
      maxUses: maxRaw ? Number(maxRaw) : null,
      startsAt,
      endsAt,
      isActive: form.get("isActive") === "on",
    });
  } catch (e) {
    return { error: (e as { status?: number }).status === 409 ? t("errors.exists") : t("errors.generic") };
  }
  revalidatePath("/discounts");
  return { ok: true, at: Date.now() };
}

export async function deleteDiscountAction(id: string) {
  await api.deleteDiscountCode(await requireSession(), id);
  revalidatePath("/discounts");
}
