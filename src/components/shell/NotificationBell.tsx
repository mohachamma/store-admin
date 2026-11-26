"use client";

import { Bell } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { eventsAction, readEventsAction } from "@/app/(dashboard)/orders/actions";
import { Sheet, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import type { AdminEvents } from "@/lib/api/types";
import { formatDZD } from "@/lib/format";
import { useLocale } from "next-intl";
import type { Locale } from "@/i18n/config";

const POLL_MS = 20_000;

/** Two short beeps (no audio file needed). Browsers may block sound until the page has been interacted with. */
function beep() {
  try {
    const ctx = new AudioContext();
    [0, 0.22].forEach((delay) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.frequency.value = 880;
      g.gain.setValueAtTime(0.0001, ctx.currentTime + delay);
      g.gain.exponentialRampToValueAtTime(0.25, ctx.currentTime + delay + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + delay + 0.16);
      o.connect(g).connect(ctx.destination);
      o.start(ctx.currentTime + delay);
      o.stop(ctx.currentTime + delay + 0.18);
    });
    setTimeout(() => void ctx.close(), 700);
  } catch {
    /* audio not available */
  }
}

/** Bell with a live unread badge: checks for new orders every 20 s and beeps when one arrives. */
export function NotificationBell() {
  const t = useTranslations("notifications");
  const tc = useTranslations("common");
  const tn = useTranslations("nav");
  const locale = useLocale() as Locale;
  const [data, setData] = useState<AdminEvents | null>(null);
  const [open, setOpen] = useState(false);
  const last = useRef<number | null>(null);

  // Store a fresh answer; beep when the unread count went up since the last check.
  function apply(d: AdminEvents) {
    if (last.current !== null && d.unreadCount > last.current) beep();
    last.current = d.unreadCount;
    setData(d);
  }

  useEffect(() => {
    let alive = true;
    const poll = () =>
      eventsAction()
        .then((d) => alive && apply(d))
        .catch(() => {
          /* offline or session expired: try again next time */
        });
    const first = setTimeout(poll, 0);
    const id = setInterval(poll, POLL_MS);
    return () => {
      alive = false;
      clearTimeout(first);
      clearInterval(id);
    };
  }, []);

  const unread = data?.unreadCount ?? 0;

  return (
    <Sheet
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (v && unread > 0) void readEventsAction().then(() => eventsAction()).then(apply);
      }}
    >
      <SheetTrigger className="relative grid size-10 place-items-center rounded-full transition hover:bg-secondary" aria-label={tn("notifications")}>
        <Bell className="size-5" strokeWidth={1.8} />
        {unread > 0 ? (
          <span className="absolute end-1 top-1 grid min-w-4 place-items-center rounded-full bg-destructive px-1 text-[10px] font-bold leading-4 text-white ring-2 ring-background" aria-label={String(unread)}>
            {unread > 9 ? "9+" : unread}
          </span>
        ) : null}
      </SheetTrigger>
      <SheetContent closeLabel={tc("close")}>
        <SheetTitle>{t("title")}</SheetTitle>
        <SheetDescription className="sr-only">{t("title")}</SheetDescription>
        {data && data.items.length > 0 ? (
          <ul className="max-h-[60svh] divide-y divide-border overflow-y-auto">
            {data.items.map((e) => (
              <li key={e.id}>
                <Link href={e.orderId ? `/orders/${e.orderId}` : "/orders"} onClick={() => setOpen(false)} className="flex items-center justify-between gap-3 py-3">
                  <div>
                    <p className="text-sm font-semibold">{t("newOrder", { n: e.orderNumber ?? "" })}</p>
                    <p className="text-xs text-muted-foreground">{new Intl.DateTimeFormat(locale === "ar" ? "ar-DZ-u-nu-latn" : "fr-DZ", { dateStyle: "short", timeStyle: "short" }).format(new Date(e.createdAt))}</p>
                  </div>
                  <span className="text-sm font-semibold">{e.total !== null ? formatDZD(e.total, locale) : ""}</span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="py-8 text-center text-sm text-muted-foreground">{t("none")}</p>
        )}
      </SheetContent>
    </Sheet>
  );
}
