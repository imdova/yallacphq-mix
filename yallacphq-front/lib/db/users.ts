import type { User, CreateUserInput, UpdateUserInput } from "@/types/user";
import { delay } from "./delay";

const store: User[] = [
  {
    id: "1",
    email: "sarah@example.com",
    name: "Sarah Chen",
    role: "admin",
    enrolled: true,
    phone: "+20 100 123 4567",
    course: "CPHQ Exam Prep",
    country: "Egypt",
    speciality: "Quality Management",
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-01-15T10:00:00Z",
  },
  {
    id: "2",
    email: "omar@example.com",
    name: "Omar Hassan",
    role: "member",
    enrolled: true,
    phone: "+20 101 234 5678",
    course: "Quality Management",
    country: "Egypt",
    speciality: "Patient Safety",
    createdAt: "2024-02-01T12:00:00Z",
    updatedAt: "2024-02-01T12:00:00Z",
  },
  {
    id: "3",
    email: "lina@example.com",
    name: "Lina Al-Rashid",
    role: "viewer",
    enrolled: false,
    phone: "",
    course: "",
    country: "Saudi Arabia",
    speciality: "Compliance",
    createdAt: "2024-02-10T08:30:00Z",
    updatedAt: "2024-02-10T08:30:00Z",
  },
];

function clone<T>(data: T): T {
  return JSON.parse(JSON.stringify(data));
}

export async function getUsers(): Promise<User[]> {
  await delay(300);
  return clone(store);
}

export async function getUserById(id: string): Promise<User | null> {
  await delay(150);
  const user = store.find((u) => u.id === id);
  return user ? clone(user) : null;
}

export async function createUser(data: CreateUserInput): Promise<User> {
  await delay(200);
  const newUser: User = {
    id: String(store.length + 1),
    ...data,
    enrolled: (data as Partial<User>).enrolled ?? false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  store.push(newUser);
  return clone(newUser);
}

export async function updateUser(id: string, data: UpdateUserInput): Promise<User | null> {
  await delay(200);
  const index = store.findIndex((u) => u.id === id);
  if (index === -1) return null;
  const updated = { ...store[index], ...data, updatedAt: new Date().toISOString() };
  store[index] = updated;
  return clone(updated);
}

export async function deleteUser(id: string): Promise<boolean> {
  await delay(200);
  const index = store.findIndex((u) => u.id === id);
  if (index === -1) return false;
  store.splice(index, 1);
  return true;
}
