import type { ApiErrorResponse, ApiProjectResponse } from "@/lib/types/project";

const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";

async function parseJson<T>(response: Response): Promise<T> {
  const data = (await response.json()) as T;
  return data;
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

    if (!response.ok) {
      const error = await parseJson<ApiErrorResponse>(response);
      throw new Error(error.error.message);
    }

    return parseJson<ApiProjectResponse>(response);
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Unknown client error");
  }
}
