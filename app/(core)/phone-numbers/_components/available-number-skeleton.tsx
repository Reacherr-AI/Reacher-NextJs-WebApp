import { Skeleton } from '@/components/ui/skeleton';

export function AvailableNumberSkeleton({ count }: { count: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={`available-number-skeleton-${index}`}
          className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-3 py-2"
        >
          <div className="space-y-2">
            <Skeleton className="h-3 w-28 bg-white/10" />
            <Skeleton className="h-3 w-16 bg-white/10" />
          </div>
          <Skeleton className="h-7 w-24 bg-white/10" />
        </div>
      ))}
    </div>
  );
}

