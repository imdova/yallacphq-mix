import { Role } from '../../common/auth/role';
import type { ApiUser } from '../../contracts';
import type { UserDocument } from './schemas/user.schema';

export function toApiUserRole(role: Role): ApiUser['role'] {
  return role === Role.admin ? 'admin' : 'student';
}

export function toApiUser(user: UserDocument): ApiUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: toApiUserRole(user.role),
    enrolled: user.enrolled,
    phone: user.phone,
    course: user.course,
    country: user.country,
    speciality: user.speciality,
    profileImageUrl: user.profileImageUrl,
    createdAt: user.createdAt?.toISOString?.() ?? new Date().toISOString(),
    updatedAt: user.updatedAt?.toISOString?.() ?? new Date().toISOString(),
  };
}
