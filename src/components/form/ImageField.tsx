"use client";

import { ImagePlus, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Image picker. Posts the new file as `${name}` and the current URL as `${name}Url`
 * (empty string = the image was removed).
 */
export function ImageField({ name, label, currentUrl, contain = false }: { name: string; label: string; currentUrl: string | null; contain?: boolean }) {
  const t = useTranslations("form");
  const input = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(currentUrl);
  const [removed, setRemoved] = useState(false);

  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold text-foreground/80">{label}</p>
      <div className="flex items-center gap-3">
        <div className={cn("grid size-20 shrink-0 place-items-center overflow-hidden rounded-2xl bg-secondary", contain && "p-2")}>
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element -- local preview / admin-uploaded URL
            <img src={preview} alt="" className={cn("size-full", contain ? "object-contain" : "object-cover")} />
          ) : (
            <ImagePlus className="size-6 text-muted-foreground" strokeWidth={1.5} />
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => input.current?.click()}>
            {preview ? t("changeImage") : t("chooseImage")}
          </Button>
          {preview ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setPreview(null);
                setRemoved(true);
                if (input.current) input.current.value = "";
              }}
            >
              <Trash2 /> {t("removeImage")}
            </Button>
          ) : null}
        </div>
      </div>
      <input
        ref={input}
        type="file"
        name={name}
        accept="image/*"
        className="sr-only"
        tabIndex={-1}
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) {
            setPreview(URL.createObjectURL(f));
            setRemoved(false);
          }
        }}
      />
      <input type="hidden" name={`${name}Url`} value={removed ? "" : (currentUrl ?? "")} readOnly />
    </div>
  );
}
