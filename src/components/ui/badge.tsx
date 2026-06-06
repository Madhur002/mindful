import * as React from "react";
import { cn } from "@/lib/utils";

type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  tone?: "default" | "calm" | "warning" | "success";
};

const toneClass: Record<NonNullable<BadgeProps["tone"]>, string> = {
  default: "bg-secondary text-secondary-foreground",
  calm: "bg-sky-100 text-sky-950",
  warning: "bg-amber-100 text-amber-950",
  success: "bg-emerald-100 text-emerald-950"
};

export const Badge = ({
  className,
  tone = "default",
  ...props
}: BadgeProps): JSX.Element => (
  <span
    className={cn(
      "inline-flex items-center rounded-md px-2.5 py-1 text-xs font-semibold",
      toneClass[tone],
      className
    )}
    {...props}
  />
);
