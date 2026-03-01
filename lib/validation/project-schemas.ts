import { z } from "zod";

export const createProjectSchema = z.object({
  projectName: z.string().min(2, "projectName must be at least 2 characters").max(100, "projectName is too long"),
  repositoryUrl: z.string().url("repositoryUrl must be a valid URL"),
  branch: z.string().min(1, "branch is required").max(100, "branch is too long")
});

export const projectIdSchema = z.object({
  id: z
    .string()
    .min(3, "id is required")
    .max(64, "id is too long")
    .regex(/^[a-zA-Z0-9-]+$/, "id contains invalid characters")
});

export type CreateProjectBody = z.infer<typeof createProjectSchema>;
