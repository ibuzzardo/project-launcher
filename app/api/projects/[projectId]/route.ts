import { badRequest, fromUnknownError, notFound, ok } from "@/lib/http/response";
import { projectStore } from "@/lib/store/in-memory-project-store";

interface ProjectRouteContext {
  params: {
    projectId: string;
  };
}

export async function GET(
  _request: Request,
  context: ProjectRouteContext
): Promise<Response> {
  try {
    const projectId = context.params.projectId?.trim();

    if (!projectId) {
      return badRequest("Project id is required", { projectId: ["Project id is required"] });
    }

    const build = projectStore.getBuild(projectId);
    if (!build) {
      return notFound(`Build '${projectId}' was not found`);
    }

    return ok(build);
  } catch (error: unknown) {
    return fromUnknownError(error);
  }
}
