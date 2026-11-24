"use server";

import { revalidatePath } from "next/cache";
import { getTranslations } from "next-intl/server";
import type { FormState } from "@/components/form/FormSheet";
import { readI18n } from "@/components/form/fields";
import { api } from "@/lib/api";
import { requireSession } from "@/lib/auth";

const MAX_IMAGE = 3 * 1024 * 1024;

async function uploadIfAny(token: string, form: FormData, field: string): Promise<string | null> {
  const file = form.get(field);
  if (file instanceof File && file.size > 0) {
    if (!file.type.startsWith("image/") || file.size > MAX_IMAGE) throw new Error("upload");
    return api.uploadImage(token, file);
  }
  return String(form.get(`${field}Url`) ?? "") || null;
}

export async function saveBrandAction(_prev: FormState, form: FormData): Promise<FormState> {
  const token = await requireSession();
  const t = await getTranslations();
  const name = String(form.get("name") ?? "").trim();
  if (!name) return { error: t("brands.nameRequired") };
  try {
    const logoUrl = await uploadIfAny(token, form, "logo");
    await api.saveBrand(token, {
      id: String(form.get("id") ?? "") || undefined,
      name,
      logoUrl,
      href: String(form.get("href") ?? "").trim() || null,
      isActive: form.get("isActive") === "on",
    });
  } catch (e) {
    return { error: (e as Error).message === "upload" ? t("form.uploadFailed") : t("form.saveFailed") };
  }
  revalidatePath("/brands");
  return { ok: true, at: Date.now() };
}

export async function deleteBrandAction(id: string) {
  await api.deleteBrand(await requireSession(), id);
  revalidatePath("/brands");
}

export async function moveBrandAction(id: string, direction: -1 | 1) {
  await api.moveBrand(await requireSession(), id, direction);
  revalidatePath("/brands");
}

export async function saveStripAction(_prev: FormState, form: FormData): Promise<FormState> {
  const token = await requireSession();
  const t = await getTranslations();
  const title = readI18n(form, "title");
  if (!title.ar) return { error: t("form.arRequired") };
  const speed = Math.min(120, Math.max(5, Number(form.get("speed")) || 30));
  try {
    await api.saveBrandsStrip(token, {
      enabled: form.get("enabled") === "on",
      animated: form.get("animated") === "on",
      speed,
      pauseOnHover: form.get("pauseOnHover") === "on",
      title,
    });
  } catch {
    return { error: t("form.saveFailed") };
  }
  revalidatePath("/brands");
  return { ok: true, at: Date.now() };
}
