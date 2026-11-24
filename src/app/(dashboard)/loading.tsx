import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-48" />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Skeleton className="col-span-2 h-40 rounded-[var(--radius-card)]" />
        <Skeleton className="h-40 rounded-[var(--radius-card)]" />
        <Skeleton className="h-40 rounded-[var(--radius-card)]" />
      </div>
      <Skeleton className="h-48 rounded-[var(--radius-card)]" />
    </div>
  );
}
