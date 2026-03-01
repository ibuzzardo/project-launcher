import { isApiFailureResponse } from "@/lib/api/response";
import type { ApiProjectResponse } from "@/lib/types/project";

const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";

async function parseJson<T>(response: Response): Promise<T> {
  const data = (await response.json()) as T;
  return data;
}

function extractErrorMessage(payload: unknown): string {
  if (isApiFailureResponse(payload)) {
    return payload.error.message;
  }

  if (payload && typeof payload === "object") {
    const fallback = payload as { error?: { message?: unknown } };
    if (typeof fallback.error?.message === "string") {
      return fallback.error.message;
    }
  }

  return "Unknown client error";
}

export async function createProject(payload: {
  projectName: string;
  repositoryUrl: string;
  branch: string;
}): Promise<ApiProjectResponse> {
  try {
    const response = await fetch(`${baseUrl}/api/projects`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const json = await parseJson<unknown>(response);

    if (!response.ok) {
      throw new Error(extractErrorMessage(json));
    }

    return json as ApiProjectResponse;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Unknown client error");
  }
}
