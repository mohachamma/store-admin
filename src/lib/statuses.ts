import type { AdminDiscountCode, AdminSlide } from "./api/types";

export type CodeStatus = "live" | "scheduled" | "expired" | "off";
export type SlideStatus = "showing" | "scheduled" | "off";

export function codesWithStatus(codes: AdminDiscountCode[]): (AdminDiscountCode & { status: CodeStatus })[] {
  const now = Date.now();
  return codes.map((c) => {
    let status: CodeStatus = "live";
    if (!c.isActive) status = "off";
    else if (c.startsAt && new Date(c.startsAt).getTime() > now) status = "scheduled";
    else if ((c.endsAt && new Date(c.endsAt).getTime() <= now) || (c.maxUses !== null && c.usedCount >= c.maxUses)) status = "expired";
    return { ...c, status };
  });
}

export function slidesWithStatus(slides: AdminSlide[]): (AdminSlide & { status: SlideStatus })[] {
  const now = Date.now();
  return slides.map((s) => {
    let status: SlideStatus = "showing";
    if (!s.isActive || (s.endsAt && new Date(s.endsAt).getTime() <= now)) status = "off";
    else if (s.startsAt && new Date(s.startsAt).getTime() > now) status = "scheduled";
    return { ...s, status };
  });
}
