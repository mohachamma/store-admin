"use server";

import { revalidatePath } from "next/cache";
import { getTranslations } from "next-intl/server";
import { readI18n } from "@/components/form/fields";
import type { FormState } from "@/components/form/FormSheet";
import { api } from "@/lib/api";
import { requireSession } from "@/lib/auth";

export async function saveSiteContentAction(_prev: FormState, form: FormData): Promise<FormState> {
  const token = await requireSession();
  const t = await getTranslations("form");
  try {
    await api.saveSiteContent(token, { announcement: readI18n(form, "announcement") });
  } catch {
    return { error: t("saveFailed") };
  }
  revalidatePath("/content");
  return { ok: true, at: Date.now() };
}
