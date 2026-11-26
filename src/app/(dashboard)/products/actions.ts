"use server";

import { revalidatePath } from "next/cache";
import { api } from "@/lib/api";
import type { BulkVariantUpdate, ProductInput } from "@/lib/api/types";
import { requireSession } from "@/lib/auth";

export type SaveProductResult = { ok: true; id: string } | { ok: false; code: string; message: string };

/** Saves a product. Refusals from the API come back as a result (code + message) so the form can explain them. */
export async function saveProductAction(id: string | null, input: ProductInput): Promise<SaveProductResult> {
  const token = await requireSession();
  try {
    const p = await api.saveProduct(token, id, input);
    revalidatePath("/products");
    revalidatePath(`/products/${p.id}`);
    return { ok: true, id: p.id };
  } catch (e) {
    const err = e as { status?: number; code?: string; message?: string };
    if (err.status && err.status < 500) return { ok: false, code: err.code ?? `http_${err.status}`, message: err.message ?? "" };
    return { ok: false, code: "server", message: "" };
  }
}

export async function deleteProductAction(id: string) {
  await api.deleteProduct(await requireSession(), id);
  revalidatePath("/products");
}

export async function publishProductAction(id: string, isPublished: boolean) {
  await api.publishProducts(await requireSession(), [id], isPublished);
  revalidatePath("/products");
}

/** Uploads one (already browser-optimised) image and returns its URL. */
export async function uploadProductImageAction(form: FormData): Promise<{ url: string } | { error: true }> {
  const token = await requireSession();
  const file = form.get("file");
  if (!(file instanceof File) || file.size === 0 || file.size > 3 * 1024 * 1024 || !file.type.startsWith("image/")) return { error: true };
  try {
    return { url: await api.uploadImage(token, file) };
  } catch {
    return { error: true };
  }
}

export async function bulkUpdateAction(updates: BulkVariantUpdate[]): Promise<{ ok: true; updated: number } | { ok: false }> {
  const token = await requireSession();
  try {
    const updated = await api.bulkUpdateVariants(token, updates);
    revalidatePath("/products/inventory");
    revalidatePath("/products");
    return { ok: true, updated };
  } catch {
    return { ok: false };
  }
}
