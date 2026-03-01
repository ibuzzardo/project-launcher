import * as React from "react";

import { cn } from "@/lib/utils";

interface ProgressProps {
  value: number;
  className?: string;
}

export function Progress({ value, className }: ProgressProps): JSX.Element {
  const boundedValue: number = Math.max(0, Math.min(100, value));

  return (
    <div className={cn("relative h-2 w-full overflow-hidden rounded-full bg-slate-800/80", className)}>
      <div className="h-full bg-sky-500 transition-all duration-500" style={{ width: `${boundedValue}%` }} />
    </div>
  );
}
