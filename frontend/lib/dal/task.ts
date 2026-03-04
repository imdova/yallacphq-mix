import * as db from "@/lib/db/tasks";
import type { Task, CreateTaskInput, UpdateTaskInput } from "@/types/task";

/**
 * Data Access Layer: Task.
 * UI must use these functions only. Replace with API calls when backend is ready.
 */

export async function fetchTasks(): Promise<Task[]> {
  return db.getTasks();
}

export async function fetchTaskById(id: string): Promise<Task | null> {
  return db.getTaskById(id);
}

export async function createTask(data: CreateTaskInput): Promise<Task> {
  return db.createTask(data);
}

export async function updateTask(id: string, data: UpdateTaskInput): Promise<Task | null> {
  return db.updateTask(id, data);
}

export async function removeTask(id: string): Promise<boolean> {
  return db.deleteTask(id);
}
