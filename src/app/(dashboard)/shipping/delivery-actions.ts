"use server";

import { revalidatePath } from "next/cache";
import { api } from "@/lib/api";
import { requireSession } from "@/lib/auth";

export async function saveTrackingUrlsAction(urls: Record<string, string>): Promise<"ok" | "invalid" | "error"> {
  try {
    await api.setTrackingUrls(await requireSession(), urls);
    revalidatePath("/shipping");
    return "ok";
  } catch (e) {
    return (e as { status?: number }).status === 422 ? "invalid" : "error";
  }
}

export async function setDeliveryAction(provider: string): Promise<boolean> {
  try {
    await api.setDelivery(await requireSession(), provider);
    revalidatePath("/shipping");
    return true;
  } catch {
    return false;
  }
}
