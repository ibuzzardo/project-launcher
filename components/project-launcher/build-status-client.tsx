"use client";

import { useEffect, useMemo, useState } from "react";

import { Progress } from "@/components/ui/progress";
import type { BuildRecord } from "@/lib/types/build";
import { buildPayloadSchema } from "@/lib/validation/build-schema";

interface BuildStatusClientProps {
  initialBuild: BuildRecord;
}

interface BuildEventPayload {
  event: string;
  data: BuildRecord;
}

function parseBuildData(raw: unknown): BuildRecord | null {
  const parsed = buildPayloadSchema.safeParse(raw);
  if (!parsed.success) {
    return null;
  }
  return parsed.data;
}

export function BuildStatusClient({ initialBuild }: BuildStatusClientProps): JSX.Element {
  const [build, setBuild] = useState<BuildRecord>(initialBuild);
  const [connectionState, setConnectionState] = useState<"connecting" | "open" | "closed">("connecting");

  useEffect(() => {
    const source: EventSource = new EventSource(`/api/builds/${initialBuild.id}/logs`);

    const onBuild = (event: MessageEvent<string>): void => {
      try {
        const parsed: unknown = JSON.parse(event.data);
        const nextBuild: BuildRecord | null = parseBuildData(parsed);
        if (nextBuild) {
          setBuild(nextBuild);
        }
      } catch {
        // ignore malformed event payloads
      }
    };

    const onSnapshot = (event: MessageEvent<string>): void => {
      try {
        const parsed: unknown = JSON.parse(event.data);
        const candidate: unknown = (parsed as { build?: unknown }).build;
        const nextBuild: BuildRecord | null = parseBuildData(candidate);
        if (nextBuild) {
          setBuild(nextBuild);
        }
      } catch {
        // ignore malformed event payloads
      }
    };

    source.onopen = (): void => {
      setConnectionState("open");
    };

    source.addEventListener("build", onBuild as EventListener);
    source.addEventListener("snapshot", onSnapshot as EventListener);

    source.onerror = (): void => {
      setConnectionState("closed");
      source.close();
    };

    return (): void => {
      setConnectionState("closed");
      source.close();
    };
  }, [initialBuild.id]);

  const statusTone: string = useMemo((): string => {
    switch (build.status) {
      case "queued":
        return "border-slate-500/60 bg-slate-700/30 text-slate-200";
      case "running":
        return "border-sky-500/60 bg-sky-500/20 text-sky-200";
      case "success":
        return "border-emerald-500/60 bg-emerald-500/20 text-emerald-200";
      case "failed":
        return "border-red-500/60 bg-red-500/20 text-red-200";
      default:
        return "border-slate-500/60 bg-slate-700/30 text-slate-200";
    }
  }, [build.status]);

  return (
    <div className="space-y-4">
      <div className="inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold tracking-wide transition-colors ${statusTone}">
        {build.status.toUpperCase()}
      </div>
      <Progress value={build.progress} />
      <div className="text-sm text-slate-300">Connection: {connectionState}</div>
      <div className="log-stream-panel">
        {build.logs.map((log) => (
          <p key={log.id} className="animate-log-pop">
            [{new Date(log.createdAt).toLocaleTimeString()}] {log.message}
          </p>
        ))}
      </div>
    </div>
  );
}
