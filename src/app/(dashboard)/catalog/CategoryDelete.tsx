"use client";

import { Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useTransition } from "react";
import { deleteCategoryAction } from "./actions";

export function CategoryDelete({ id }: { id: string }) {
  const t = useTranslations("form");
  const tc = useTranslations("catalog");
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      aria-label={t("delete")}
      title={t("delete")}
      className="grid size-9 place-items-center rounded-full text-destructive transition hover:bg-destructive/10 disabled:opacity-50"
      onClick={() => {
        if (!window.confirm(t("confirmDelete"))) return;
        start(async () => {
          if (!(await deleteCategoryAction(id))) window.alert(tc("notEmpty"));
        });
      }}
    >
      <Trash2 className="size-4" strokeWidth={1.8} />
    </button>
  );
}
