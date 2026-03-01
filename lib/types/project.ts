export type BuildStatus = "queued" | "running" | "success" | "failed";

export interface BuildLog {
  id: string;
  level: "info" | "warn" | "error";
  message: string;
  timestamp: string;
}

export interface BuildRecord {
  id: string;
  projectName: string;
  repositoryUrl: string;
  branch: string;
  status: BuildStatus;
  progress: number;
  createdAt: string;
  updatedAt: string;
  logs: BuildLog[];
}

export interface CreateProjectInput {
  projectName: string;
  repositoryUrl: string;
  branch: string;
}

export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
    details?: string[];
  };
}

export interface ApiProjectResponse {
  data: BuildRecord;
}

export interface BuildEvent {
  type: "build.updated";
  payload: BuildRecord;
}
