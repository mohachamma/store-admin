"use server";

import { revalidatePath } from "next/cache";
import { getLocale, getTranslations } from "next-intl/server";
import type { FormState } from "@/components/form/FormSheet";
import { api } from "@/lib/api";
import { requireSession } from "@/lib/auth";

const fail = async (e: unknown): Promise<FormState> => {
  const t = await getTranslations("orders.errors");
  const status = (e as { status?: number }).status;
  return { error: status === 409 ? t("conflict") : status === 502 ? t("deliveryFailed") : t("generic") };
};

/** Confirm a pending order: saves the tracking number and erases the customer's personal data. */
export async function confirmOrderAction(id: string, _prev: FormState, form: FormData): Promise<FormState> {
  const token = await requireSession();
  // With a delivery company set up the form sends no tracking number: the server creates the parcel itself.
  const auto = form.get("auto") === "1";
  const tracking = String(form.get("trackingNumber") ?? "").trim();
  if (!auto && !tracking) return { error: (await getTranslations("orders.errors"))("trackingRequired") };
  try {
    await api.confirmOrder(token, id, auto ? { company: "auto" } : { company: String(form.get("company") ?? "").trim() || "manual", trackingNumber: tracking }, await getLocale());
  } catch (e) {
    return fail(e);
  }
  revalidatePath(`/orders/${id}`);
  revalidatePath("/orders");
  return { ok: true, at: Date.now() };
}

export async function setStatusAction(id: string, status: "shipped" | "delivered" | "returned" | "cancelled") {
  const token = await requireSession();
  await api.setOrderStatus(token, id, status, await getLocale());
  revalidatePath(`/orders/${id}`);
  revalidatePath("/orders");
  revalidatePath("/");
}

export async function refreshTrackingAction(id: string) {
  await api.refreshTracking(await requireSession(), id);
  revalidatePath(`/orders/${id}`);
}

// Notifications (polled from the browser through these actions: the token never leaves the server).
export async function eventsAction() {
  return api.getEvents(await requireSession());
}
export async function readEventsAction() {
  await api.markEventsRead(await requireSession());
}
