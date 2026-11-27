import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "flex h-11 w-full min-w-0 rounded-xl border border-transparent bg-secondary px-4 text-sm outline-none transition placeholder:text-muted-foreground focus-visible:border-foreground/20 focus-visible:bg-black/30 focus-visible:ring-[3px] focus-visible:ring-ring/15 aria-invalid:border-destructive disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
