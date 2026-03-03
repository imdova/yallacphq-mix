import type { Task, CreateTaskInput, UpdateTaskInput } from "@/types/task";
import { delay } from "./delay";

const store: Task[] = [
  {
    id: "1",
    title: "Setup project structure",
    description: "Initialize folders and config",
    status: "done",
    order: 0,
    createdAt: "2024-01-01T09:00:00Z",
    updatedAt: "2024-01-02T10:00:00Z",
  },
  {
    id: "2",
    title: "Implement auth flow",
    description: "Login and session handling",
    status: "in_progress",
    order: 1,
    createdAt: "2024-01-03T09:00:00Z",
    updatedAt: "2024-01-05T14:00:00Z",
  },
  {
    id: "3",
    title: "Dashboard layout",
    description: "Sidebar, header, main content",
    status: "todo",
    order: 2,
    createdAt: "2024-01-06T09:00:00Z",
    updatedAt: "2024-01-06T09:00:00Z",
  },
];

function clone<T>(data: T): T {
  return JSON.parse(JSON.stringify(data));
}

export async function getTasks(): Promise<Task[]> {
  await delay(250);
  return clone(store.sort((a, b) => a.order - b.order));
}

export async function getTaskById(id: string): Promise<Task | null> {
  await delay(120);
  const task = store.find((t) => t.id === id);
  return task ? clone(task) : null;
}

export async function createTask(data: CreateTaskInput): Promise<Task> {
  await delay(180);
  const order = data.order ?? Math.max(0, ...store.map((t) => t.order)) + 1;
  const newTask: Task = {
    id: String(Date.now()),
    title: data.title,
    description: data.description ?? "",
    status: data.status ?? "todo",
    order,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  store.push(newTask);
  return clone(newTask);
}

export async function updateTask(id: string, data: UpdateTaskInput): Promise<Task | null> {
  await delay(180);
  const index = store.findIndex((t) => t.id === id);
  if (index === -1) return null;
  const updated = { ...store[index], ...data, updatedAt: new Date().toISOString() };
  store[index] = updated;
  return clone(updated);
}

export async function deleteTask(id: string): Promise<boolean> {
  await delay(150);
  const index = store.findIndex((t) => t.id === id);
  if (index === -1) return false;
  store.splice(index, 1);
  return true;
}
