import type { AdminOffer } from "./api/types";

export type OfferStatus = "live" | "scheduled" | "expired" | "off";

/** Where an offer is in its life, as the storefront would see it right now. */
export function offerStatus(o: AdminOffer, now: number): OfferStatus {
  if (!o.isActive) return "off";
  if (o.startsAt && new Date(o.startsAt).getTime() > now) return "scheduled";
  if (o.endsAt && new Date(o.endsAt).getTime() <= now) return "expired";
  return "live";
}

export function withStatus(offers: AdminOffer[]): (AdminOffer & { status: OfferStatus })[] {
  const now = Date.now();
  return offers.map((o) => ({ ...o, status: offerStatus(o, now) }));
}
