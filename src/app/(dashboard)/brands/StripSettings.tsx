"use client";

import { useLocale, useTranslations } from "next-intl";
import { useActionState, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { I18nFields, SwitchField } from "@/components/form/fields";
import { SaveButton } from "@/components/form/SaveButton";
import type { BrandsStripSettings } from "@/lib/api/types";
import { cn } from "@/lib/utils";
import { saveStripAction } from "./actions";

/** Strip settings with a live preview that moves exactly as the storefront strip will. */
export function StripSettings({ settings, logos }: { settings: BrandsStripSettings; logos: { id: string; name: string; url: string | null }[] }) {
  const t = useTranslations("brands");
  const locale = useLocale() as "ar" | "fr" | "en";
  const [state, action, pending] = useActionState(saveStripAction, {});
  const [enabled, setEnabled] = useState(settings.enabled);
  const [animated, setAnimated] = useState(settings.animated);
  const [pauseOnHover, setPauseOnHover] = useState(settings.pauseOnHover);
  const [speed, setSpeed] = useState(settings.speed);

  const repeats = Math.max(1, Math.ceil(8 / Math.max(1, logos.length)));
  const half = Array.from({ length: repeats }, () => logos).flat();
  const list = (hidden: boolean) => (
    <ul className="flex shrink-0 items-center gap-10 pe-10" aria-hidden={hidden || undefined}>
      {half.map((l, i) => (
        <li key={`${l.id}-${i}`} className="shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element -- admin preview of uploaded logos */}
          {l.url ? <img src={l.url} alt={hidden ? "" : l.name} className="h-9 w-auto max-w-[120px] object-contain opacity-70 grayscale" /> : <span className="text-xs font-bold">{l.name}</span>}
        </li>
      ))}
    </ul>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("stripTitle")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <form action={action} className="space-y-5">
          <div onChange={(e) => {
            const el = e.target as unknown as HTMLInputElement;
            if (el.name === "enabled") setEnabled(el.checked);
            if (el.name === "animated") setAnimated(el.checked);
            if (el.name === "pauseOnHover") setPauseOnHover(el.checked);
          }} className="space-y-4">
            <SwitchField name="enabled" label={t("enabled")} hint={t("enabledHint")} defaultChecked={settings.enabled} />
            <SwitchField name="animated" label={t("animated")} hint={t("animatedHint")} defaultChecked={settings.animated} />
            <SwitchField name="pauseOnHover" label={t("pauseOnHover")} defaultChecked={settings.pauseOnHover} />
          </div>

          <div className={cn("space-y-2", !animated && "opacity-40")}>
            <label htmlFor="speed" className="flex items-center justify-between text-sm font-medium">
              {t("speed")}
              <span className="text-xs tabular-nums text-muted-foreground" dir="ltr">{speed}s</span>
            </label>
            <input
              id="speed"
              name="speed"
              type="range"
              min={5}
              max={120}
              step={5}
              value={speed}
              disabled={!animated}
              onChange={(e) => setSpeed(Number(e.target.value))}
              className="w-full accent-ink"
              dir="rtl"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>{t("speedSlow")}</span>
              <span>{t("speedFast")}</span>
            </div>
          </div>

          <I18nFields name="title" label={t("stripHeading")} defaults={settings.title} required />

          <div className="space-y-2">
            <p className="text-xs font-semibold text-foreground/80">{t("preview")}</p>
            <div className={cn("rounded-2xl border border-border bg-background py-4 transition", !enabled && "opacity-30")}>
              <p className="mb-3 px-4 text-sm font-semibold">{settings.title[locale] || settings.title.ar}</p>
              {logos.length === 0 ? null : animated ? (
                <div className="group overflow-hidden [mask-image:linear-gradient(to_right,transparent,#000_8%,#000_92%,transparent)]">
                  <div
                    key={speed}
                    className={cn("marquee-track flex w-max", pauseOnHover && "group-hover:[animation-play-state:paused]")}
                    style={{ animationDuration: `${Math.max(5, speed)}s` }}
                  >
                    {list(false)}
                    {list(true)}
                  </div>
                </div>
              ) : (
                <div className="no-scrollbar overflow-x-auto px-4">{list(false)}</div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <SaveButton pending={pending} saved={state.ok} />
            {state.error ? <p role="alert" className="text-sm text-destructive">{state.error}</p> : null}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
