"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { cn } from "@/lib/utils";

type BuildStatus = "queued" | "running" | "success" | "failed";

interface BuildLog {
  id: string;
  message: string;
  level: "info" | "warn" | "error";
  createdAt: string;
}

interface BuildSnapshot {
  id: string;
  status: BuildStatus;
  progress: number;
  logs: BuildLog[];
}

interface BuildStatusClientProps {
  buildId: string;
}

interface RetryState {
  attempt: number;
  isReconnecting: boolean;
}

function parseEventData<T>(data: string): T | null {
  try {
    return JSON.parse(data) as T;
  } catch {
    return null;
  }
}

function getBackoffDelayMs(attempt: number): number {
  const baseMs = 500;
  const maxMs = 10000;
  const next = baseMs * 2 ** Math.max(0, attempt - 1);
  return Math.min(next, maxMs);
}

export function BuildStatusClient({ buildId }: BuildStatusClientProps): JSX.Element {
  const [snapshot, setSnapshot] = useState<BuildSnapshot | null>(null);
  const [retryState, setRetryState] = useState<RetryState>({
    attempt: 0,
    isReconnecting: false
  });

  const sourceRef = useRef<EventSource | null>(null);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closedRef = useRef<boolean>(false);

  const statusTone = useMemo((): string => {
    const status = snapshot?.status ?? "queued";
    if (status === "success") {
      return "bg-secondary/10 text-secondary ring-secondary/20";
    }
    if (status === "failed") {
      return "bg-destructive/10 text-destructive ring-destructive/20";
    }
    if (status === "running") {
      return "bg-primary/10 text-primary ring-primary/20";
    }
    return "bg-muted text-foreground ring-foreground/15";
  }, [snapshot?.status]);

  const closeSource = useCallback((): void => {
    if (sourceRef.current) {
      sourceRef.current.close();
      sourceRef.current = null;
    }
  }, []);

  const clearReconnectTimer = useCallback((): void => {
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
  }, []);

  const connect = useCallback((): void => {
    if (closedRef.current) {
      return;
    }

    closeSource();

    const source = new EventSource(`/api/projects/${buildId}/events`);
    sourceRef.current = source;

    source.addEventListener("snapshot", (event: MessageEvent<string>): void => {
      const data = parseEventData<BuildSnapshot>(event.data);
      if (!data) {
        return;
      }
      setSnapshot(data);
      setRetryState({ attempt: 0, isReconnecting: false });
    });

    source.addEventListener("build", (event: MessageEvent<string>): void => {
      const data = parseEventData<BuildSnapshot>(event.data);
      if (!data) {
        return;
      }
      setSnapshot(data);
    });

    source.addEventListener("error", (): void => {
      if (closedRef.current) {
        return;
      }

      closeSource();

      setRetryState((current): RetryState => {
        const nextAttempt = current.attempt + 1;
        const delayMs = getBackoffDelayMs(nextAttempt);
        clearReconnectTimer();
        reconnectTimerRef.current = setTimeout((): void => {
          connect();
        }, delayMs);

        return {
          attempt: nextAttempt,
          isReconnecting: true
        };
      });
    });

    source.onopen = (): void => {
      setRetryState({ attempt: 0, isReconnecting: false });
      clearReconnectTimer();
    };
  }, [buildId, clearReconnectTimer, closeSource]);

  useEffect((): (() => void) => {
    closedRef.current = false;
    connect();

    return (): void => {
      closedRef.current = true;
      clearReconnectTimer();
      closeSource();
    };
  }, [clearReconnectTimer, closeSource, connect]);

  return (
    <div className="space-y-3">
      {retryState.isReconnecting ? (
        <div className="w-full rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
          Connection lost. Reconnecting...
        </div>
      ) : null}

      <div className="glass-surface p-4 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-lg font-semibold">Build Status</h3>
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset transition-colors",
              statusTone
            )}
          >
            {(snapshot?.status ?? "queued").toUpperCase()}
          </span>
        </div>

        <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${snapshot?.progress ?? 0}%` }}
          />
        </div>

        <div className="mt-4 max-h-64 space-y-2 overflow-y-auto rounded-lg border border-white/50 bg-white/50 p-3">
          {(snapshot?.logs ?? []).slice(-8).map((entry): JSX.Element => {
            return (
              <p key={entry.id} className="text-xs text-foreground/80">
                {entry.message}
              </p>
            );
          })}
        </div>
      </div>
    </div>
  );
}
