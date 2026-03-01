export const BUILD_STATUSES = ["queued", "running", "success", "failed"] as const;

export type BuildStatus = (typeof BUILD_STATUSES)[number];

export interface LaunchBuildInput {
  projectName: string;
  repositoryUrl: string;
  preset: "web-app" | "api-service" | "worker";
}

export interface BuildLogEntry {
  id: string;
  buildId: string;
  message: string;
  level: "info" | "warn" | "error";
  createdAt: string;
}

export interface BuildRecord {
  id: string;
  projectName: string;
  repositoryUrl: string;
  preset: "web-app" | "api-service" | "worker";
  status: BuildStatus;
  progress: number;
  createdAt: string;
  startedAt: string | null;
  completedAt: string | null;
  logs: BuildLogEntry[];
}

export interface ApiSuccess<T> {
  ok: true;
  data: T;
}

export interface ApiErrorResponse {
  ok: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, string[]>;
  };
}
