import { z, ZodError } from "zod";

import { fromUnknownError, fromZodError, ok } from "@/lib/http/response";
import { projectStore } from "@/lib/store/in-memory-project-store";

const createProjectSchema = z.object({
  projectName: z.string().trim().min(1, "Project name is required"),
  repositoryUrl: z.string().url("Repository URL must be a valid URL"),
  branch: z.string().trim().min(1, "Branch is required")
});

export async function POST(request: Request): Promise<Response> {
  try {
    const body = await request.json();
    const parsed = createProjectSchema.parse(body);
    const createdBuild = projectStore.createBuild(parsed);
    return ok(createdBuild, 201);
  } catch (error: unknown) {
    if (error instanceof ZodError) {
      return fromZodError(error);
    }
    return fromUnknownError(error);
  }
}
