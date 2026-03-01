import * as React from "react";

import { cn } from "@/lib/utils";

function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>): JSX.Element {
  return (
    <div
      className={cn(
        "rounded-2xl border border-slate-700/50 bg-slate-900/45 p-4 shadow-[0_12px_40px_rgba(2,6,23,0.45)] backdrop-blur-xl md:p-6 xl:p-8",
        className
      )}
      {...props}
    />
  );
}

export { Card };
