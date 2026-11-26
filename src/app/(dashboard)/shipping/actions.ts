"use server";

import { revalidatePath } from "next/cache";
import { api } from "@/lib/api";
import type { WilayaUpdate } from "@/lib/api/types";
import { requireSession } from "@/lib/auth";

export async function saveWilayasAction(updates: WilayaUpdate[]): Promise<{ ok: true; updated: number } | { ok: false }> {
  try {
    const updated = await api.updateWilayas(await requireSession(), updates);
    revalidatePath("/shipping");
    return { ok: true, updated };
  } catch {
    return { ok: false };
  }
}

export async function saveFreeShippingAction(over: number | null): Promise<boolean> {
  try {
    await api.setFreeShipping(await requireSession(), over);
    revalidatePath("/shipping");
    return true;
  } catch {
    return false;
  }
}
