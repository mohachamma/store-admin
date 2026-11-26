"use server";

import { revalidatePath } from "next/cache";
import { getTranslations } from "next-intl/server";
import { readI18n } from "@/components/form/fields";
import type { FormState } from "@/components/form/FormSheet";
import { api } from "@/lib/api";
import { requireSession } from "@/lib/auth";

const MAX_IMAGE = 3 * 1024 * 1024;

export async function saveSlideAction(_prev: FormState, form: FormData): Promise<FormState> {
  const token = await requireSession();
  const t = await getTranslations("slides");
  const tf = await getTranslations("form");
  const title = readI18n(form, "title");
  const subtitle = readI18n(form, "subtitle");
  for (const v of [title, subtitle]) if ((v.fr || v.en) && !v.ar) return { error: t("arabicNeeded") };
  const startsAt = String(form.get("startsAt") ?? "") || null;
  const endsAt = String(form.get("endsAt") ?? "") || null;
  if (startsAt && endsAt && new Date(endsAt) <= new Date(startsAt)) return { error: tf("saveFailed") };
  try {
    let imageUrl = String(form.get("imageUrl") ?? "");
    const file = form.get("image");
    if (file instanceof File && file.size > 0) {
      if (!file.type.startsWith("image/") || file.size > MAX_IMAGE) return { error: tf("uploadFailed") };
      imageUrl = await api.uploadImage(token, file);
    }
    if (!imageUrl) return { error: t("imageRequired") };
    const collectionId = String(form.get("collectionId") ?? "") || null;
    await api.saveSlide(token, String(form.get("id") ?? "") || null, {
      title,
      subtitle,
      imageUrl,
      collectionId,
      linkUrl: collectionId ? null : String(form.get("linkUrl") ?? "").trim() || null,
      isActive: form.get("isActive") === "on",
      startsAt,
      endsAt,
    });
  } catch {
    return { error: tf("saveFailed") };
  }
  revalidatePath("/content");
  return { ok: true, at: Date.now() };
}

export async function deleteSlideAction(id: string) {
  await api.deleteSlide(await requireSession(), id);
  revalidatePath("/content");
}

export async function moveSlideAction(id: string, direction: -1 | 1) {
  await api.moveSlide(await requireSession(), id, direction);
  revalidatePath("/content");
}
