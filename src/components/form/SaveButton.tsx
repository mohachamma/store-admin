"use client";

import { Check, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

/** Submit button with a spinner while pending and a confirmation after a successful save. */
export function SaveButton({ pending, saved }: { pending: boolean; saved?: boolean }) {
  const t = useTranslations("form");
  return (
    <Button type="submit" disabled={pending}>
      {pending ? <Loader2 className="animate-spin" /> : saved ? <Check /> : null}
      {saved && !pending ? t("saved") : t("save")}
    </Button>
  );
}
