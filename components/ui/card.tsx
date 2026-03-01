import * as React from "react";

import { cn } from "@/lib/utils";

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>): JSX.Element {
  return (
    <div
      className={cn(
        "rounded-2xl border border-slate-700/60 bg-slate-900/55 p-4 md:p-6 backdrop-blur-xl shadow-[0_10px_30px_rgba(2,6,23,0.45)] transition-colors",
        className
      )}
      {...props}
    />
  );
}
