export interface User {
  id: string;
  email: string;
  name: string;
  role: "admin" | "student";
  enrolled?: boolean;
  phone?: string;
  course?: string;
  country?: string;
  speciality?: string;
  profileImageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserInput {
  email: string;
  name: string;
  role: User["role"];
  phone?: string;
  course?: string;
  country?: string;
  speciality?: string;
}

export interface UpdateUserInput {
  email?: string;
  name?: string;
  role?: User["role"];
  phone?: string;
  course?: string;
  country?: string;
  speciality?: string;
  enrolled?: boolean;
}
