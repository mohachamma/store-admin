"use server";

import { revalidatePath } from "next/cache";
import { getTranslations } from "next-intl/server";
import { readI18n } from "@/components/form/fields";
import type { FormState } from "@/components/form/FormSheet";
import { api } from "@/lib/api";
import { requireSession } from "@/lib/auth";

export async function savePageAction(slug: string, _prev: FormState, form: FormData): Promise<FormState> {
  const token = await requireSession();
  const t = await getTranslations("pagesAdmin");
  const title = readI18n(form, "title");
  const raw = (k: string) => String(form.get(`body.${k}`) ?? "").replace(/\r\n/g, "\n").trim();
  const body = { ar: raw("ar"), fr: raw("fr"), en: raw("en") };
  if (!title.ar || !body.ar) return { error: t("arabicNeeded") };
  try {
    await api.savePage(token, slug, { title, body, isPublished: form.get("isPublished") === "on", isDraft: form.get("isDraft") === "on" });
  } catch {
    return { error: t("errors.generic") };
  }
  revalidatePath("/pages");
  return { ok: true, at: Date.now() };
}

export async function saveStoreInfoAction(_prev: FormState, form: FormData): Promise<FormState> {
  const token = await requireSession();
  const t = await getTranslations("pagesAdmin");
  const address = readI18n(form, "address");
  const hours = readI18n(form, "hours");
  const siteTitle = readI18n(form, "siteTitle");
  const siteDescription = readI18n(form, "siteDescription");
  for (const v of [address, hours, siteTitle, siteDescription]) if ((v.fr || v.en) && !v.ar) return { error: t("arabicNeeded") };
  try {
    await api.saveStoreInfo(token, {
      phone: String(form.get("phone") ?? "").trim(),
      whatsapp: String(form.get("whatsapp") ?? "").trim(),
      email: String(form.get("email") ?? "").trim(),
      address,
      hours,
      siteTitle,
      siteDescription,
    });
  } catch (e) {
    const msg = (e as { message?: string }).message ?? "";
    return { error: /whatsapp/i.test(msg) ? t("errors.whatsapp") : /email/i.test(msg) ? t("errors.email") : t("errors.generic") };
  }
  revalidatePath("/pages");
  return { ok: true, at: Date.now() };
}
