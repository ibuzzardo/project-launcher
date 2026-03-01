import type { BuildLog } from "@/lib/types/project";

interface LogStreamProps {
  logs: BuildLog[];
}

function levelTone(level: BuildLog["level"]): string {
  if (level === "error") {
    return "text-rose-300 border-rose-400/40";
  }
  if (level === "warn") {
    return "text-amber-300 border-amber-400/40";
  }
  return "text-cyan-300 border-cyan-400/40";
}

export function LogStream({ logs }: LogStreamProps): JSX.Element {
  return (
    <div className="space-y-3" aria-live="polite" aria-relevant="additions">
      {logs.map((log): JSX.Element => {
        return (
          <article
            key={log.id}
            className="grid grid-cols-[auto_1fr] gap-3 rounded-lg border border-slate-800/80 bg-slate-950/55 p-3 text-sm text-slate-200 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-1"
          >
            <span
              className={`inline-flex h-fit items-center rounded-md border px-2 py-0.5 text-xs font-medium ${levelTone(log.level)}`}
            >
              {log.level.toUpperCase()}
            </span>
            <div className="min-w-0">
              <p className="break-words">{log.message}</p>
              <time className="mt-1 block text-xs text-slate-400">{new Date(log.timestamp).toLocaleTimeString()}</time>
            </div>
          </article>
        );
      })}
    </div>
  );
}
