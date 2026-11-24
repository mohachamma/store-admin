"use client";

import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useActionState, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

export type FormState = { ok?: boolean; error?: string; at?: number };

/** A slide-up sheet with a form; closes itself when the server action succeeds. */
export function FormSheet({
  trigger,
  triggerClassName,
  title,
  description,
  action,
  children,
}: {
  trigger: ReactNode;
  triggerClassName?: string;
  title: string;
  description?: string;
  action: (prev: FormState, form: FormData) => Promise<FormState>;
  children: ReactNode;
}) {
  const t = useTranslations("form");
  const tc = useTranslations("common");
  const [open, setOpen] = useState(false);
  // Close the sheet from inside the action when the save succeeded (no effect needed).
  const [state, formAction, pending] = useActionState(async (prev: FormState, form: FormData) => {
    const next = await action(prev, form);
    if (next.ok) setOpen(false);
    return next;
  }, {});

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger className={triggerClassName}>{trigger}</SheetTrigger>
      <SheetContent closeLabel={tc("close")} className="max-h-[92svh] overflow-y-auto lg:inset-x-auto lg:start-1/2 lg:bottom-auto lg:top-1/2 lg:w-[34rem] lg:-translate-y-1/2 lg:rounded-[28px] lg:ltr:-translate-x-1/2 lg:rtl:translate-x-1/2">
        <SheetTitle>{title}</SheetTitle>
        <SheetDescription className={description ? "" : "sr-only"}>{description ?? title}</SheetDescription>
        <form action={formAction} className="space-y-5">
          {children}
          {state.error ? (
            <p role="alert" className="text-sm text-destructive">
              {state.error}
            </p>
          ) : null}
          <Button type="submit" size="lg" className="w-full" disabled={pending}>
            {pending ? <Loader2 className="animate-spin" /> : null}
            {t("save")}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
