import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-flare",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-flare/20 text-flare border border-flare/30",
        lime:
          "border-transparent bg-lime/20 text-lime border border-lime/30",
        secondary:
          "border-transparent bg-bg-elev-2 text-text border border-border",
        outline:
          "text-text-muted border border-border",
        danger:
          "border-transparent bg-danger/20 text-danger border border-danger/30",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
