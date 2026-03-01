import { fromUnknownError, notFound, ok } from "@/lib/http/response";
import { getBuild } from "@/lib/store/build-store";

interface BuildRouteContext {
  params: {
    id: string;
  };
}

export async function GET(_request: Request, context: BuildRouteContext): Promise<Response> {
  try {
    const id: string = context.params.id;
    const build = getBuild(id);
    if (!build) {
      return notFound(`Build ${id} was not found`);
    }
    return ok({ build });
  } catch (cause: unknown) {
    return fromUnknownError(cause);
  }
}
