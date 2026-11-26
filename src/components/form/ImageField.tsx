"use client";

import { ImagePlus, Loader2, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { formatBytes, optimizeImage } from "@/lib/image-optimize";
import { cn } from "@/lib/utils";

/**
 * Image picker (gallery or camera on a phone). The picked picture is resized and converted to WebP in the browser,
 * then posted as `${name}` (a File) with the current URL as `${name}Url` (empty string = removed).
 *
 * maxSize: longest side in px — logos ~600, offer/banner images ~1400, product photos ~1600.
 */
export function ImageField({
  name,
  label,
  currentUrl,
  contain = false,
  maxSize = 1400,
}: {
  name: string;
  label: string;
  currentUrl: string | null;
  contain?: boolean;
  maxSize?: number;
}) {
  const t = useTranslations("form");
  const input = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(currentUrl);
  const [removed, setRemoved] = useState(false);
  const [busy, setBusy] = useState(false);
  const [info, setInfo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onPick(file: File | undefined) {
    const el = input.current;
    if (!file || !el) return;
    setError(null);
    setInfo(null);
    setBusy(true);
    el.setCustomValidity(t("optimizing")); // blocks submitting until the optimised file is ready
    try {
      const r = await optimizeImage(file, { maxSize });
      // Swap the picked file for the optimised one, so the form posts the small version.
      const dt = new DataTransfer();
      dt.items.add(r.file);
      el.files = dt.files;
      setPreview(URL.createObjectURL(r.file));
      setRemoved(false);
      setInfo(t("optimized", { before: formatBytes(r.originalBytes), after: formatBytes(r.file.size), size: `${r.width}×${r.height}` }));
    } catch {
      el.value = "";
      setError(t("imageError"));
    } finally {
      el.setCustomValidity("");
      setBusy(false);
    }
  }

  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold text-foreground/80">{label}</p>
      <div className="flex items-center gap-3">
        <div className={cn("grid size-20 shrink-0 place-items-center overflow-hidden rounded-2xl bg-secondary", contain && "p-2")}>
          {busy ? (
            <Loader2 className="size-5 animate-spin text-muted-foreground" />
          ) : preview ? (
            // eslint-disable-next-line @next/next/no-img-element -- local preview / admin-uploaded URL
            <img src={preview} alt="" className={cn("size-full", contain ? "object-contain" : "object-cover")} />
          ) : (
            <ImagePlus className="size-6 text-muted-foreground" strokeWidth={1.5} />
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" size="sm" disabled={busy} onClick={() => input.current?.click()}>
            {preview ? t("changeImage") : t("chooseImage")}
          </Button>
          {preview ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={busy}
              onClick={() => {
                setPreview(null);
                setRemoved(true);
                setInfo(null);
                if (input.current) input.current.value = "";
              }}
            >
              <Trash2 /> {t("removeImage")}
            </Button>
          ) : null}
        </div>
      </div>
      {busy ? <p className="text-[11px] text-muted-foreground">{t("optimizing")}</p> : null}
      {info ? <p className="text-[11px] text-emerald-700">{info}</p> : null}
      {error ? (
        <p role="alert" className="text-[11px] text-destructive">
          {error}
        </p>
      ) : null}
      <input
        ref={input}
        type="file"
        name={name}
        accept="image/png,image/jpeg,image/webp,image/gif"
        className="sr-only"
        tabIndex={-1}
        onChange={(e) => void onPick(e.target.files?.[0])}
      />
      <input type="hidden" name={`${name}Url`} value={removed ? "" : (currentUrl ?? "")} readOnly />
    </div>
  );
}
