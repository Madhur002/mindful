import { ClipboardList } from "lucide-react";
import { cn } from "@/lib/utils";

type EmptyStateProps = {
  title: string;
  description: string;
  className?: string;
};

export const EmptyState = ({
  title,
  description,
  className
}: EmptyStateProps): JSX.Element => (
  <div
    className={cn(
      "flex min-h-40 flex-col items-center justify-center rounded-lg border border-dashed p-6 text-center",
      className
    )}
  >
    <ClipboardList aria-hidden="true" className="mb-3 h-8 w-8 text-muted-foreground" />
    <p className="font-semibold">{title}</p>
    <p className="mt-1 max-w-md text-sm text-muted-foreground">{description}</p>
  </div>
);
