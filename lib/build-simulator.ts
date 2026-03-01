import { appendLog, getBuild, updateBuildStatus } from "@/lib/store/build-store";

const runningTimers: Map<string, NodeJS.Timeout[]> = new Map<string, NodeJS.Timeout[]>();

function schedule(buildId: string, delayMs: number, job: () => void): void {
  const timer: NodeJS.Timeout = setTimeout(job, delayMs);
  const existing: NodeJS.Timeout[] = runningTimers.get(buildId) ?? [];
  existing.push(timer);
  runningTimers.set(buildId, existing);
}

export function stopBuildSimulation(buildId: string): void {
  const timers: NodeJS.Timeout[] | undefined = runningTimers.get(buildId);
  if (!timers) {
    return;
  }
  for (const timer of timers) {
    clearTimeout(timer);
  }
  runningTimers.delete(buildId);
}

export function startBuildSimulation(buildId: string): void {
  const build = getBuild(buildId);
  if (!build) {
    return;
  }
  stopBuildSimulation(buildId);

  schedule(buildId, 250, () => {
    updateBuildStatus(buildId, "running", 10);
    appendLog(buildId, "Initializing build environment", "info");
  });

  schedule(buildId, 1000, () => {
    updateBuildStatus(buildId, "running", 35);
    appendLog(buildId, "Installing dependencies", "info");
  });

  schedule(buildId, 2000, () => {
    updateBuildStatus(buildId, "running", 65);
    appendLog(buildId, "Running quality checks", "info");
  });

  schedule(buildId, 3000, () => {
    updateBuildStatus(buildId, "running", 85);
    appendLog(buildId, "Preparing deployment artifact", "info");
  });

  schedule(buildId, 4000, () => {
    updateBuildStatus(buildId, "success", 100);
    appendLog(buildId, "Build finished successfully", "info");
    stopBuildSimulation(buildId);
  });
}
