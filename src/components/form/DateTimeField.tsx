"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";

const toLocalInput = (iso: string | null) => {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

/** Date + time picker in the admin's own time zone; posts an ISO (UTC) string as `name` ("" = none). */
export function DateTimeField({ name, label, defaultValue }: { name: string; label: string; defaultValue: string | null }) {
  const [local, setLocal] = useState(toLocalInput(defaultValue));
  const iso = local ? new Date(local).toISOString() : "";
  return (
    <div className="space-y-2">
      <label htmlFor={`${name}-local`} className="text-xs font-semibold text-foreground/80">
        {label}
      </label>
      <Input id={`${name}-local`} type="datetime-local" dir="ltr" value={local} onChange={(e) => setLocal(e.target.value)} />
      <input type="hidden" name={name} value={iso} readOnly />
    </div>
  );
}
