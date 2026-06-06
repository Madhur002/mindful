import { cn } from "@/lib/utils";

type LoadingSkeletonProps = {
  label?: string;
  className?: string;
};

export const LoadingSkeleton = ({
  label = "Loading",
  className
}: LoadingSkeletonProps): JSX.Element => (
  <div
    className={cn("space-y-3 rounded-lg border bg-card p-5", className)}
    role="status"
    aria-label={label}
    aria-busy="true"
  >
    <div className="h-4 w-1/3 animate-pulse rounded bg-muted" />
    <div className="h-20 animate-pulse rounded bg-muted" />
    <div className="grid gap-3 sm:grid-cols-2">
      <div className="h-16 animate-pulse rounded bg-muted" />
      <div className="h-16 animate-pulse rounded bg-muted" />
    </div>
  </div>
);
