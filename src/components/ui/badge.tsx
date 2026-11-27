import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

const badgeVariants = cva("inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold whitespace-nowrap", {
  variants: {
    variant: {
      default: "bg-primary text-primary-foreground",
      secondary: "bg-secondary text-secondary-foreground",
      outline: "border border-border",
      warning: "bg-amber-400/15 text-amber-300 light:bg-amber-100 light:text-amber-900",
      success: "bg-emerald-400/15 text-emerald-300 light:bg-emerald-100 light:text-emerald-900",
      danger: "bg-red-400/15 text-red-300 light:bg-red-100 light:text-red-800",
      info: "bg-white/10 text-stone-200 light:bg-sky-100 light:text-sky-900",
    },
  },
  defaultVariants: { variant: "default" },
});

function Badge({ className, variant, ...props }: ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return <span data-slot="badge" className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
