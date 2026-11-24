"use client";

import { Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";

/** Delete button inside a <form action={serverAction}>; asks for confirmation first. */
export function DeleteButton({ className }: { className?: string }) {
  const t = useTranslations("form");
  return (
    <button
      type="submit"
      aria-label={t("delete")}
      title={t("delete")}
      className={className ?? "grid size-9 place-items-center rounded-full text-destructive transition hover:bg-destructive/10"}
      onClick={(e) => {
        if (!window.confirm(t("confirmDelete"))) e.preventDefault();
      }}
    >
      <Trash2 className="size-4" strokeWidth={1.8} />
    </button>
  );
}
