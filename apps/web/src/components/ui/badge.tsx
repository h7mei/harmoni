import * as React from "react";
import { cn } from "@/lib/utils.js";

const Badge = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { variant?: "default" | "secondary" | "outline" }
>(({ className, variant = "default", ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
      variant === "default" && "border-transparent bg-primary text-primary-foreground shadow",
      variant === "secondary" && "border-transparent bg-secondary text-secondary-foreground",
      variant === "outline" && "text-foreground",
      className
    )}
    {...props}
  />
));
Badge.displayName = "Badge";

export { Badge };
