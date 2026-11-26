"use server";

import { revalidatePath } from "next/cache";
import { getTranslations } from "next-intl/server";
import { readI18n } from "@/components/form/fields";
import type { FormState } from "@/components/form/FormSheet";
import { api } from "@/lib/api";
import { requireSession } from "@/lib/auth";

const MAX_IMAGE = 3 * 1024 * 1024;

async function imageFrom(token: string, form: FormData, field: string): Promise<string | null> {
  const file = form.get(field);
  if (file instanceof File && file.size > 0) {
    if (!file.type.startsWith("image/") || file.size > MAX_IMAGE) throw new Error("upload");
    return api.uploadImage(token, file);
  }
  return String(form.get(`${field}Url`) ?? "") || null;
}

export async function saveCategoryAction(_prev: FormState, form: FormData): Promise<FormState> {
  const token = await requireSession();
  const t = await getTranslations("form");
  const name = readI18n(form, "name");
  if (!name.ar) return { error: t("arRequired") };
  try {
    await api.saveCategory(token, String(form.get("id") ?? "") || null, { name, imageUrl: await imageFrom(token, form, "image"), isActive: form.get("isActive") === "on" });
  } catch (e) {
    return { error: (e as Error).message === "upload" ? t("uploadFailed") : t("saveFailed") };
  }
  revalidatePath("/catalog");
  return { ok: true, at: Date.now() };
}

/** Returns false when the category still has products (the API refuses). */
export async function deleteCategoryAction(id: string): Promise<boolean> {
  try {
    await api.deleteCategory(await requireSession(), id);
  } catch (e) {
    if ((e as { status?: number }).status === 409) return false;
    throw e;
  }
  revalidatePath("/catalog");
  return true;
}

export async function moveCategoryAction(id: string, direction: -1 | 1) {
  await api.moveCategory(await requireSession(), id, direction);
  revalidatePath("/catalog");
}

export async function saveCollectionAction(_prev: FormState, form: FormData): Promise<FormState> {
  const token = await requireSession();
  const t = await getTranslations("form");
  const title = readI18n(form, "title");
  if (!title.ar) return { error: t("arRequired") };
  try {
    await api.saveCollection(token, String(form.get("id") ?? "") || null, {
      title, subtitle: readI18n(form, "subtitle"), heroUrl: await imageFrom(token, form, "hero"), isPublished: form.get("isPublished") === "on", productIds: form.getAll("productIds").map(String),
    });
  } catch (e) {
    return { error: (e as Error).message === "upload" ? t("uploadFailed") : t("saveFailed") };
  }
  revalidatePath("/catalog");
  return { ok: true, at: Date.now() };
}

export async function deleteCollectionAction(id: string) {
  await api.deleteCollection(await requireSession(), id);
  revalidatePath("/catalog");
}

export async function moveCollectionAction(id: string, direction: -1 | 1) {
  await api.moveCollection(await requireSession(), id, direction);
  revalidatePath("/catalog");
}
