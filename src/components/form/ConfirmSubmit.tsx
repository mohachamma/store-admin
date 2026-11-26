"use client";

import type { ComponentProps } from "react";

/** A submit button that asks for confirmation first (for destructive actions inside a <form action>). */
export function ConfirmSubmit({ message, ...props }: { message: string } & ComponentProps<"button">) {
  return <button {...props} type="submit" onClick={(e) => { if (!window.confirm(message)) e.preventDefault(); }} />;
}
