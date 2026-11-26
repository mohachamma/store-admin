"use server";

import { revalidatePath } from "next/cache";
import { api } from "@/lib/api";
import { requireSession } from "@/lib/auth";

export async function setDeliveryAction(provider: string): Promise<boolean> {
  try {
    await api.setDelivery(await requireSession(), provider);
    revalidatePath("/shipping");
    return true;
  } catch {
    return false;
  }
}
