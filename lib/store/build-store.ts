import type { BuildLogEntry, BuildRecord, BuildStatus, LaunchBuildInput } from "@/lib/types/build";

type BuildSubscriber = (build: BuildRecord, log: BuildLogEntry | null) => void;

interface BuildStoreState {
  builds: Map<string, BuildRecord>;
  subscribers: Map<string, Set<BuildSubscriber>>;
  buildCounter: number;
  logCounter: number;
}

declare global {
  var __projectLauncherStore: BuildStoreState | undefined;
}

function nowIso(): string {
  return new Date().toISOString();
}

function getState(): BuildStoreState {
  if (!globalThis.__projectLauncherStore) {
    globalThis.__projectLauncherStore = {
      builds: new Map<string, BuildRecord>(),
      subscribers: new Map<string, Set<BuildSubscriber>>(),
      buildCounter: 0,
      logCounter: 0
    };
  }
  return globalThis.__projectLauncherStore;
}

function emit(buildId: string, log: BuildLogEntry | null): void {
  const state: BuildStoreState = getState();
  const build: BuildRecord | undefined = state.builds.get(buildId);
  if (!build) {
    return;
  }
  const callbacks: Set<BuildSubscriber> | undefined = state.subscribers.get(buildId);
  if (!callbacks) {
    return;
  }
  for (const callback of callbacks) {
    callback(build, log);
  }
}

export function createBuild(input: LaunchBuildInput): BuildRecord {
  const state: BuildStoreState = getState();
  state.buildCounter += 1;
  const id: string = `bld_${String(state.buildCounter).padStart(6, "0")}`;
  const createdAt: string = nowIso();
  const build: BuildRecord = {
    id,
    projectName: input.projectName,
    repositoryUrl: input.repositoryUrl,
    preset: input.preset,
    status: "queued",
    progress: 0,
    createdAt,
    startedAt: null,
    completedAt: null,
    logs: []
  };
  state.builds.set(id, build);
  emit(id, null);
  return build;
}

export function listBuilds(): BuildRecord[] {
  return Array.from(getState().builds.values()).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getBuild(id: string): BuildRecord | null {
  return getState().builds.get(id) ?? null;
}

export function updateBuildStatus(id: string, status: BuildStatus, progress: number): BuildRecord | null {
  const state: BuildStoreState = getState();
  const build: BuildRecord | undefined = state.builds.get(id);
  if (!build) {
    return null;
  }
  build.status = status;
  build.progress = Math.max(0, Math.min(100, progress));
  if (status === "running" && !build.startedAt) {
    build.startedAt = nowIso();
  }
  if ((status === "success" || status === "failed") && !build.completedAt) {
    build.completedAt = nowIso();
    build.progress = 100;
  }
  emit(id, null);
  return build;
}

export function appendLog(id: string, message: string, level: "info" | "warn" | "error" = "info"): BuildLogEntry | null {
  const state: BuildStoreState = getState();
  const build: BuildRecord | undefined = state.builds.get(id);
  if (!build) {
    return null;
  }
  state.logCounter += 1;
  const entry: BuildLogEntry = {
    id: `log_${String(state.logCounter).padStart(6, "0")}`,
    buildId: id,
    message,
    level,
    createdAt: nowIso()
  };
  build.logs.push(entry);
  emit(id, entry);
  return entry;
}

export function subscribeToBuild(id: string, callback: BuildSubscriber): () => void {
  const state: BuildStoreState = getState();
  let set: Set<BuildSubscriber> | undefined = state.subscribers.get(id);
  if (!set) {
    set = new Set<BuildSubscriber>();
    state.subscribers.set(id, set);
  }
  set.add(callback);

  return (): void => {
    const current: Set<BuildSubscriber> | undefined = state.subscribers.get(id);
    if (!current) {
      return;
    }
    current.delete(callback);
    if (current.size === 0) {
      state.subscribers.delete(id);
    }
  };
}
