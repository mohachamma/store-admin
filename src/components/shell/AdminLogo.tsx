import Link from "next/link";
import { brand } from "@/config/brand";
import { cn } from "@/lib/utils";

/** Store wordmark + gold "ADMIN" pill: same identity as the storefront, clearly the dashboard. */
export function AdminLogo({ className }: { className?: string }) {
  return (
    <Link href="/" dir="ltr" className={cn("inline-flex items-center gap-2", className)} aria-label={`${brand.name} ${brand.adminTag}`}>
      <span className="font-display text-xl font-semibold uppercase leading-none tracking-[0.2em]">{brand.wordmark}</span>
      <span className="rounded-full border border-gold/60 bg-gold-soft px-2 py-0.5 text-[9px] font-bold tracking-[0.18em] text-gold">{brand.adminTag}</span>
    </Link>
  );
}
