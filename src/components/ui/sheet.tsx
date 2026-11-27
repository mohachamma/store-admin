"use client";

import { XIcon } from "lucide-react";
import { Dialog as SheetPrimitive } from "radix-ui";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

const Sheet = (props: ComponentProps<typeof SheetPrimitive.Root>) => <SheetPrimitive.Root data-slot="sheet" {...props} />;
const SheetTrigger = (props: ComponentProps<typeof SheetPrimitive.Trigger>) => <SheetPrimitive.Trigger data-slot="sheet-trigger" {...props} />;
const SheetClose = (props: ComponentProps<typeof SheetPrimitive.Close>) => <SheetPrimitive.Close data-slot="sheet-close" {...props} />;

function SheetContent({
  className,
  children,
  side = "bottom",
  closeLabel,
  ...props
}: ComponentProps<typeof SheetPrimitive.Content> & { side?: "bottom" | "start"; closeLabel: string }) {
  return (
    <SheetPrimitive.Portal>
      <SheetPrimitive.Overlay className="fixed inset-0 z-50 bg-black/50 data-[state=open]:animate-[fade-in_.2s_ease]" />
      <SheetPrimitive.Content
        className={cn(
          "fixed z-50 flex flex-col gap-4 border border-border/60 bg-popover p-5 shadow-2xl outline-none",
          side === "bottom" && "inset-x-0 bottom-0 max-h-[85svh] rounded-t-[28px] pb-[calc(1.25rem+env(safe-area-inset-bottom))] data-[state=open]:animate-[sheet-up_.25s_ease]",
          side === "start" && "inset-y-0 start-0 w-80 max-w-[85vw]",
          className,
        )}
        {...props}
      >
        {side === "bottom" ? <div className="mx-auto h-1 w-10 rounded-full bg-border" aria-hidden /> : null}
        {children}
        <SheetPrimitive.Close className="absolute end-4 top-4 grid size-9 place-items-center rounded-full hover:bg-secondary">
          <XIcon className="size-4" />
          <span className="sr-only">{closeLabel}</span>
        </SheetPrimitive.Close>
      </SheetPrimitive.Content>
    </SheetPrimitive.Portal>
  );
}

const SheetTitle = ({ className, ...props }: ComponentProps<typeof SheetPrimitive.Title>) => (
  <SheetPrimitive.Title className={cn("label", className)} {...props} />
);
const SheetDescription = ({ className, ...props }: ComponentProps<typeof SheetPrimitive.Description>) => (
  <SheetPrimitive.Description className={cn("text-xs text-muted-foreground", className)} {...props} />
);

export { Sheet, SheetClose, SheetContent, SheetDescription, SheetTitle, SheetTrigger };
