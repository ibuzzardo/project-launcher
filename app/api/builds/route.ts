import { type NextRequest } from "next/server";
import { ZodError } from "zod";

import { startBuildSimulation } from "@/lib/build-simulator";
import { fromUnknownError, fromZodError, ok } from "@/lib/http/response";
import { createBuild, listBuilds } from "@/lib/store/build-store";
import type { LaunchBuildInput } from "@/lib/types/build";
import { createBuildSchema } from "@/lib/validation/build-schema";

export async function GET(): Promise<Response> {
  try {
    const builds = listBuilds();
    return ok({ builds });
  } catch (cause: unknown) {
    return fromUnknownError(cause);
  }
}

export async function POST(request: NextRequest): Promise<Response> {
  try {
    let rawBody: unknown;
    try {
      rawBody = await request.json();
    } catch (parseCause: unknown) {
      return fromUnknownError(parseCause);
    }

    const payload: LaunchBuildInput = createBuildSchema.parse(rawBody);
    const build = createBuild(payload);
    startBuildSimulation(build.id);

    return ok({ build }, 201);
  } catch (cause: unknown) {
    if (cause instanceof ZodError) {
      return fromZodError(cause);
    }
    return fromUnknownError(cause);
  }
}
