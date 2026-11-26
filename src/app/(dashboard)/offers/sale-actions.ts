"use server";

import { revalidatePath } from "next/cache";
import { getTranslations } from "next-intl/server";
import { readI18n } from "@/components/form/fields";
import type { FormState } from "@/components/form/FormSheet";
import { api } from "@/lib/api";
import { requireSession } from "@/lib/auth";

export async function saveSalePageAction(_prev: FormState, form: FormData): Promise<FormState> {
  const token = await requireSession();
  const t = await getTranslations("form");
  const title = readI18n(form, "title");
  if (!title.ar) return { error: t("arRequired") };
  try {
    await api.saveSalePage(token, { enabled: form.get("enabled") === "on", title, subtitle: readI18n(form, "subtitle") });
  } catch {
    return { error: t("saveFailed") };
  }
  revalidatePath("/offers");
  return { ok: true, at: Date.now() };
}
