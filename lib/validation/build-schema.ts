import { z } from "zod";

import { BUILD_STATUSES } from "@/lib/types/build";

export const createBuildSchema = z.object({
  projectName: z
    .string({ required_error: "projectName is required" })
    .trim()
    .min(2, "projectName must be at least 2 characters")
    .max(80, "projectName must be 80 characters or fewer"),
  repositoryUrl: z
    .string({ required_error: "repositoryUrl is required" })
    .url("repositoryUrl must be a valid URL")
    .max(2048, "repositoryUrl is too long"),
  preset: z.enum(["web-app", "api-service", "worker"], {
    required_error: "preset is required"
  })
});

export const buildStatusSchema = z.enum(BUILD_STATUSES);

export const buildPayloadSchema = z.object({
  id: z.string().min(1),
  projectName: z.string().min(1),
  repositoryUrl: z.string().url(),
  preset: z.enum(["web-app", "api-service", "worker"]),
  status: buildStatusSchema,
  progress: z.number().min(0).max(100),
  createdAt: z.string().datetime(),
  startedAt: z.string().datetime().nullable(),
  completedAt: z.string().datetime().nullable(),
  logs: z.array(
    z.object({
      id: z.string().min(1),
      buildId: z.string().min(1),
      message: z.string().min(1),
      level: z.enum(["info", "warn", "error"]),
      createdAt: z.string().datetime()
    })
  )
});
