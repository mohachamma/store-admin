import type { ReactNode } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { I18n } from "@/lib/api/types";

const LANGS = [
  { key: "ar", label: "AR", dir: "rtl" },
  { key: "fr", label: "FR", dir: "ltr" },
  { key: "en", label: "EN", dir: "ltr" },
] as const;

/** Three inputs (Arabic required, French/English optional) posted as `${name}.ar`, `${name}.fr`, `${name}.en`. */
export function I18nFields({
  name,
  label,
  defaults,
  required = false,
  hint,
}: {
  name: string;
  label: string;
  defaults?: Partial<I18n>;
  required?: boolean;
  hint?: string;
}) {
  return (
    <fieldset className="space-y-2">
      <legend className="text-xs font-semibold text-foreground/80">{label}</legend>
      {hint ? <p className="text-[11px] text-muted-foreground">{hint}</p> : null}
      <div className="space-y-2">
        {LANGS.map((l) => (
          <div key={l.key} className="flex items-center gap-2">
            <span className="w-7 shrink-0 text-center text-[10px] font-bold text-muted-foreground">{l.label}</span>
            <Input name={`${name}.${l.key}`} dir={l.dir} defaultValue={defaults?.[l.key] ?? ""} required={required && l.key === "ar"} aria-label={`${label} (${l.label})`} />
          </div>
        ))}
      </div>
    </fieldset>
  );
}

/** Reads the three translations posted by <I18nFields>. */
export function readI18n(form: FormData, name: string): I18n {
  const get = (k: string) => String(form.get(`${name}.${k}`) ?? "").trim();
  return { ar: get("ar"), fr: get("fr"), en: get("en") };
}

/** A real checkbox styled as a switch (works without JavaScript; posts "on" when checked). */
export function SwitchField({
  name,
  label,
  hint,
  defaultChecked,
  className,
}: {
  name: string;
  label: string;
  hint?: string;
  defaultChecked?: boolean;
  className?: string;
}) {
  return (
    <label className={cn("flex cursor-pointer items-center justify-between gap-4", className)}>
      <span className="min-w-0">
        <span className="block text-sm font-medium">{label}</span>
        {hint ? <span className="block text-xs text-muted-foreground">{hint}</span> : null}
      </span>
      <input type="checkbox" name={name} defaultChecked={defaultChecked} className="peer sr-only" />
      <span
        aria-hidden
        className="relative h-6 w-11 shrink-0 rounded-full bg-border transition peer-checked:bg-ink peer-focus-visible:ring-[3px] peer-focus-visible:ring-ring/40 after:absolute after:start-0.5 after:top-0.5 after:size-5 after:rounded-full after:bg-paper after:shadow after:transition-all peer-checked:after:translate-x-5 rtl:peer-checked:after:-translate-x-5"
      />
    </label>
  );
}

export function Field({ label, htmlFor, hint, children }: { label: string; htmlFor?: string; hint?: string; children: ReactNode }) {
  return (
    <div className="space-y-2">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {hint ? <p className="text-[11px] text-muted-foreground">{hint}</p> : null}
    </div>
  );
}
