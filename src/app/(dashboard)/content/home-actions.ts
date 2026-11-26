"use server";

import { revalidatePath } from "next/cache";
import { getTranslations } from "next-intl/server";
import { readI18n } from "@/components/form/fields";
import type { FormState } from "@/components/form/FormSheet";
import { api } from "@/lib/api";
import type { AdminWhyUs } from "@/lib/api/types";
import { requireSession } from "@/lib/auth";
import { ICONS, WHY_SLOTS } from "./home-constants";

const MAX_IMAGE = 3 * 1024 * 1024;

const arabicMissing = (v: { ar: string; fr: string; en: string }) => !v.ar && !!(v.fr || v.en);

// ---- Why us -------------------------------------------------------------------------------------------------------
export async function saveWhyUsAction(_prev: FormState, form: FormData): Promise<FormState> {
  const token = await requireSession();
  const t = await getTranslations("homeSections");
  const tf = await getTranslations("form");
  const title = readI18n(form, "title");
  if (!title.ar) return { error: t("whyTitleRequired") };
  const items: AdminWhyUs["items"] = [];
  for (let i = 0; i < WHY_SLOTS; i++) {
    const itemTitle = readI18n(form, `item${i}title`);
    const text = readI18n(form, `item${i}text`);
    if (!itemTitle.ar && !itemTitle.fr && !itemTitle.en && !text.ar && !text.fr && !text.en) continue; // empty slot
    if (!itemTitle.ar || arabicMissing(text)) return { error: t("arabicNeeded") };
    const icon = String(form.get(`item${i}icon`) ?? "star");
    items.push({ icon: (ICONS as readonly string[]).includes(icon) ? (icon as AdminWhyUs["items"][number]["icon"]) : "star", title: itemTitle, text });
  }
  try {
    await api.saveWhyUs(token, { enabled: form.get("enabled") === "on", title, items });
  } catch {
    return { error: tf("saveFailed") };
  }
  revalidatePath("/content");
  return { ok: true, at: Date.now() };
}

// ---- Category cards -----------------------------------------------------------------------------------------------
export async function saveCardAction(_prev: FormState, form: FormData): Promise<FormState> {
  const token = await requireSession();
  const t = await getTranslations("homeSections");
  const tf = await getTranslations("form");
  const title = readI18n(form, "title");
  const subtitle = readI18n(form, "subtitle");
  if (!title.ar) return { error: t("cardTitleRequired") };
  if (arabicMissing(subtitle)) return { error: t("arabicNeeded") };
  try {
    let imageUrl = String(form.get("imageUrl") ?? "");
    const file = form.get("image");
    if (file instanceof File && file.size > 0) {
      if (!file.type.startsWith("image/") || file.size > MAX_IMAGE) return { error: tf("uploadFailed") };
      imageUrl = await api.uploadImage(token, file);
    }
    if (!imageUrl) return { error: t("imageRequired") };
    await api.saveHomeCard(token, String(form.get("id") ?? "") || null, {
      title,
      subtitle,
      imageUrl,
      href: String(form.get("href") ?? "").trim() || null,
      isActive: form.get("isActive") === "on",
    });
  } catch {
    return { error: tf("saveFailed") };
  }
  revalidatePath("/content");
  return { ok: true, at: Date.now() };
}
export async function deleteCardAction(id: string) {
  await api.deleteHomeCard(await requireSession(), id);
  revalidatePath("/content");
}
export async function moveCardAction(id: string, direction: -1 | 1) {
  await api.moveHomeCard(await requireSession(), id, direction);
  revalidatePath("/content");
}

// ---- Newsletter ---------------------------------------------------------------------------------------------------
export async function saveNewsletterAction(_prev: FormState, form: FormData): Promise<FormState> {
  const token = await requireSession();
  const t = await getTranslations("homeSections");
  const tf = await getTranslations("form");
  const title = readI18n(form, "title");
  const subtitle = readI18n(form, "subtitle");
  const button = readI18n(form, "button");
  if (!title.ar || !button.ar) return { error: t("newsletterRequired") };
  if (arabicMissing(subtitle)) return { error: t("arabicNeeded") };
  try {
    await api.saveNewsletter(token, { enabled: form.get("enabled") === "on", title, subtitle, button });
  } catch {
    return { error: tf("saveFailed") };
  }
  revalidatePath("/content");
  return { ok: true, at: Date.now() };
}
export async function deleteSubscriberAction(id: string) {
  await api.deleteSubscriber(await requireSession(), id);
  revalidatePath("/content");
}
