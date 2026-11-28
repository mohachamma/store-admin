"use client";

import { Check, Copy } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { brand } from "@/config/brand";

const PLATFORMS = ["facebook", "instagram", "tiktok", "google", "snapchat", "youtube", "whatsapp", "other"] as const;
const clean = (v: string) => v.toLowerCase().replace(/[^\p{L}\p{N}_\- ]/gu, "").replace(/\s+/g, "_").trim();

/** Builds the link to put in an ad. Every order that comes through it remembers the platform and the campaign. */
export function LinkBuilder() {
  const t = useTranslations("ads");
  const [platform, setPlatform] = useState<(typeof PLATFORMS)[number]>("facebook");
  const [other, setOther] = useState("");
  const [campaign, setCampaign] = useState("");
  const [content, setContent] = useState("");
  const [path, setPath] = useState("/");
  const [copied, setCopied] = useState(false);

  const source = platform === "other" ? clean(other) : platform;
  const ready = Boolean(source && clean(campaign));
  const base = brand.storefrontUrl.replace(/\/$/, "");
  const p = path.startsWith("/") ? path : `/${path}`;
  const q = new URLSearchParams({ utm_source: source, utm_medium: "paid", utm_campaign: clean(campaign) });
  if (clean(content)) q.set("utm_content", clean(content));
  const url = ready ? `${base}${p}${p.includes("?") ? "&" : "?"}${q.toString()}` : "";

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* the link stays selectable below */
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>{t("platform")}</Label>
        <div className="flex flex-wrap gap-2">
          {PLATFORMS.map((x) => (
            <button
              key={x}
              type="button"
              onClick={() => setPlatform(x)}
              aria-pressed={platform === x}
              className={`rounded-full border px-4 py-2 text-xs font-semibold transition ${platform === x ? "border-ink bg-ink text-paper" : "border-border hover:border-foreground"}`}
            >
              {x === "other" ? t("otherPlatform") : x[0]!.toUpperCase() + x.slice(1)}
            </button>
          ))}
        </div>
        {platform === "other" ? <Input value={other} onChange={(e) => setOther(e.target.value)} placeholder={t("otherPlaceholder")} dir="ltr" maxLength={40} /> : null}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="lb-campaign">{t("campaign")}</Label>
          <Input id="lb-campaign" value={campaign} onChange={(e) => setCampaign(e.target.value)} placeholder="eid_sale" dir="ltr" maxLength={60} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lb-content">{t("content")}</Label>
          <Input id="lb-content" value={content} onChange={(e) => setContent(e.target.value)} placeholder="video_1" dir="ltr" maxLength={60} />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="lb-path">{t("page")}</Label>
        <Input id="lb-path" value={path} onChange={(e) => setPath(e.target.value.trim())} placeholder="/ar" dir="ltr" />
        <p className="text-[11px] text-muted-foreground">{t("pageHint")}</p>
      </div>
      <div className="space-y-2">
        <Label>{t("link")}</Label>
        <div className="flex items-start gap-2">
          <p dir="ltr" className="min-h-11 flex-1 break-all rounded-xl bg-secondary px-4 py-3 text-xs">{url || t("fillFirst")}</p>
          <Button type="button" onClick={copy} disabled={!ready} aria-label={t("copy")}>
            {copied ? <Check /> : <Copy />} {copied ? t("copied") : t("copy")}
          </Button>
        </div>
      </div>
    </div>
  );
}
