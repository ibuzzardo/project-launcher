"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { Card } from "@/components/ui/card";
import { LogStream } from "@/components/project-launcher/log-stream";
import { cn } from "@/lib/utils";
import type { BuildRecord } from "@/lib/types/project";

interface BuildStatusClientProps {
  initialBuild: BuildRecord;
}

export function BuildStatusClient({ initialBuild }: BuildStatusClientProps): JSX.Element {
  const [build, setBuild] = useState<BuildRecord>(initialBuild);
  const retryRef = useRef<number>(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect((): (() => void) => {
    let closed = false;
    let source: EventSource | null = null;

    const connect = (): void => {
      if (closed) {
        return;
      }

      source = new EventSource(`/api/projects/${initialBuild.id}/events`);

      source.addEventListener("build.updated", (event: MessageEvent<string>): void => {
        try {
          const parsed = JSON.parse(event.data) as BuildRecord;
          setBuild(parsed);
          retryRef.current = 0;
        } catch {
          // ignore malformed event payloads
        }
      });

      source.onerror = (): void => {
        if (closed) {
          return;
        }

        source?.close();
        const attempt = retryRef.current + 1;
        retryRef.current = attempt;
        const delay = Math.min(1000 * 2 ** attempt, 30000);

        timerRef.current = setTimeout((): void => {
          connect();
        }, delay);
      };
    };

    connect();

    return (): void => {
      closed = true;
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      source?.close();
    };
  }, [initialBuild.id]);

  const statusTone = useMemo((): string => {
    if (build.status === "success") {
      return "bg-emerald-500/20 text-emerald-300 ring-emerald-400/40";
    }
    if (build.status === "failed") {
      return "bg-rose-500/20 text-rose-300 ring-rose-400/40";
    }
    if (build.status === "running") {
      return "bg-cyan-500/20 text-cyan-300 ring-cyan-400/40";
    }
    return "bg-slate-500/20 text-slate-300 ring-slate-400/40";
  }, [build.status]);

  return (
    <section className="grid grid-cols-1 xl:grid-cols-12 gap-6">
      <aside className="xl:col-span-4 space-y-4">
        <Card>
          <h2 className="text-lg font-semibold">{build.projectName}</h2>
          <p className="text-sm text-slate-300 mt-1 break-all">{build.repositoryUrl}</p>
          <p className="text-sm text-slate-400 mt-1">Branch: {build.branch}</p>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-300">Status</span>
            <span className={cn("inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium ring-1 transition-colors", statusTone)}>
              {build.status.toUpperCase()}
            </span>
          </div>
          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-800/90">
            <div className="h-full rounded-full bg-cyan-400 transition-all" style={{ width: `${build.progress}%` }} />
          </div>
          <p className="mt-2 text-xs text-slate-400">{build.progress}% complete</p>
        </Card>
      </aside>

      <div className="xl:col-span-8">
        <Card>
          <h3 className="text-sm font-medium text-slate-300 mb-3">Live Logs</h3>
          <LogStream logs={build.logs} />
        </Card>
      </div>
    </section>
  );
}
