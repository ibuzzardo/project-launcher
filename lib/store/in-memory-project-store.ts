import type { BuildEvent, BuildLog, BuildRecord, CreateProjectInput } from "@/lib/types/project";

type Listener = (event: BuildEvent) => void;

class InMemoryProjectStore {
  private readonly builds: Map<string, BuildRecord> = new Map<string, BuildRecord>();
  private readonly listeners: Map<string, Set<Listener>> = new Map<string, Set<Listener>>();

  public createBuild(input: CreateProjectInput): BuildRecord {
    const now = new Date().toISOString();
    const id = crypto.randomUUID();
    const build: BuildRecord = {
      id,
      projectName: input.projectName,
      repositoryUrl: input.repositoryUrl,
      branch: input.branch,
      status: "queued",
      progress: 3,
      createdAt: now,
      updatedAt: now,
      logs: [this.createLog("info", "Build queued")]
    };

    this.builds.set(id, build);
    this.emit(id, build);
    this.startLifecycle(id);
    return build;
  }

  public getBuild(id: string): BuildRecord | null {
    const build = this.builds.get(id);
    return build ? { ...build, logs: [...build.logs] } : null;
  }

  public subscribe(buildId: string, listener: Listener): () => void {
    const set = this.listeners.get(buildId) ?? new Set<Listener>();
    set.add(listener);
    this.listeners.set(buildId, set);

    return (): void => {
      const nextSet = this.listeners.get(buildId);
      if (!nextSet) {
        return;
      }
      nextSet.delete(listener);
      if (nextSet.size === 0) {
        this.listeners.delete(buildId);
      }
    };
  }

  private startLifecycle(id: string): void {
    const steps: Array<{ delayMs: number; message: string; progress: number; status?: BuildRecord["status"] }> = [
      { delayMs: 1000, message: "Preparing environment", progress: 15, status: "running" },
      { delayMs: 2000, message: "Installing dependencies", progress: 40 },
      { delayMs: 3000, message: "Running build", progress: 70 },
      { delayMs: 4500, message: "Uploading artifacts", progress: 92 },
      { delayMs: 5500, message: "Build complete", progress: 100, status: "success" }
    ];

    for (const step of steps) {
      setTimeout((): void => {
        this.updateBuild(id, {
          progress: step.progress,
          status: step.status,
          log: this.createLog("info", step.message)
        });
      }, step.delayMs);
    }
  }

  private updateBuild(
    id: string,
    update: { progress?: number; status?: BuildRecord["status"]; log?: BuildLog }
  ): void {
    const existing = this.builds.get(id);
    if (!existing) {
      return;
    }

    const updated: BuildRecord = {
      ...existing,
      progress: update.progress ?? existing.progress,
      status: update.status ?? existing.status,
      updatedAt: new Date().toISOString(),
      logs: update.log ? [...existing.logs, update.log] : existing.logs
    };

    this.builds.set(id, updated);
    this.emit(id, updated);
  }

  private createLog(level: BuildLog["level"], message: string): BuildLog {
    return {
      id: crypto.randomUUID(),
      level,
      message,
      timestamp: new Date().toISOString()
    };
  }

  private emit(buildId: string, payload: BuildRecord): void {
    const buildListeners = this.listeners.get(buildId);
    if (!buildListeners || buildListeners.size === 0) {
      return;
    }

    const event: BuildEvent = {
      type: "build.updated",
      payload
    };

    for (const listener of buildListeners) {
      listener(event);
    }
  }
}

const globalStore = globalThis as typeof globalThis & { __projectStore?: InMemoryProjectStore };

export const inMemoryProjectStore: InMemoryProjectStore =
  globalStore.__projectStore ?? (globalStore.__projectStore = new InMemoryProjectStore());
