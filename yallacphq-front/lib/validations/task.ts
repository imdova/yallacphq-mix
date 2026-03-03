import { z } from "zod";

const statusEnum = z.enum(["todo", "in_progress", "done"]);

export const createTaskSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().max(2000).optional(),
  status: statusEnum.optional(),
  order: z.number().int().min(0).optional(),
});

export const updateTaskSchema = createTaskSchema.partial();

export type CreateTaskSchema = z.infer<typeof createTaskSchema>;
export type UpdateTaskSchema = z.infer<typeof updateTaskSchema>;
