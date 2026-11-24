"use server";

import { revalidatePath } from "next/cache";
import { getTranslations } from "next-intl/server";
import { readI18n } from "@/components/form/fields";
import type { FormState } from "@/components/form/FormSheet";
import { api } from "@/lib/api";
import { requireSession } from "@/lib/auth";

const MAX_IMAGE = 3 * 1024 * 1024;

export async function saveOfferAction(_prev: FormState, form: FormData): Promise<FormState> {
  const token = await requireSession();
  const t = await getTranslations("offers");
  const tf = await getTranslations("form");

  const title = readI18n(form, "title");
  if (!title.ar) return { error: t("titleRequired") };
  const startsAt = String(form.get("startsAt") ?? "") || null;
  const endsAt = String(form.get("endsAt") ?? "") || null;
  const showCountdown = form.get("showCountdown") === "on";
  if (showCountdown && !endsAt) return { error: t("countdownNeedsEnd") };
  if (startsAt && endsAt && new Date(endsAt) <= new Date(startsAt)) return { error: t("endBeforeStart") };

  try {
    let imageUrl: string | null = String(form.get("imageUrl") ?? "") || null;
    const file = form.get("image");
    if (file instanceof File && file.size > 0) {
      if (!file.type.startsWith("image/") || file.size > MAX_IMAGE) return { error: tf("uploadFailed") };
      imageUrl = await api.uploadImage(token, file);
    }
    await api.saveOffer(token, {
      id: String(form.get("id") ?? "") || undefined,
      label: readI18n(form, "label"),
      title,
      subtitle: readI18n(form, "subtitle"),
      ctaLabel: readI18n(form, "ctaLabel"),
      href: String(form.get("href") ?? "").trim() || null,
      imageUrl,
      theme: form.get("theme") === "light" ? "light" : "dark",
      showCountdown,
      startsAt,
      endsAt,
      isActive: form.get("isActive") === "on",
    });
  } catch {
    return { error: tf("saveFailed") };
  }
  revalidatePath("/offers");
  return { ok: true, at: Date.now() };
}

export async function deleteOfferAction(id: string) {
  await api.deleteOffer(await requireSession(), id);
  revalidatePath("/offers");
}
