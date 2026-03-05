import { z } from "zod";
export declare const userRoleSchema: z.ZodEnum<{
    admin: "admin";
    member: "member";
    viewer: "viewer";
}>;
export declare const userSchema: z.ZodObject<{
    id: z.ZodString;
    email: z.ZodString;
    name: z.ZodString;
    role: z.ZodEnum<{
        admin: "admin";
        member: "member";
        viewer: "viewer";
    }>;
    enrolled: z.ZodOptional<z.ZodBoolean>;
    phone: z.ZodOptional<z.ZodString>;
    course: z.ZodOptional<z.ZodString>;
    country: z.ZodOptional<z.ZodString>;
    speciality: z.ZodOptional<z.ZodString>;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
}, z.core.$strip>;
export type ApiUser = z.infer<typeof userSchema>;
export declare const createUserBodySchema: z.ZodObject<{
    email: z.ZodString;
    name: z.ZodString;
    role: z.ZodEnum<{
        admin: "admin";
        member: "member";
        viewer: "viewer";
    }>;
    phone: z.ZodOptional<z.ZodString>;
    course: z.ZodOptional<z.ZodString>;
    country: z.ZodOptional<z.ZodString>;
    speciality: z.ZodOptional<z.ZodString>;
    enrolled: z.ZodOptional<z.ZodBoolean>;
}, z.core.$strip>;
export type CreateUserBody = z.infer<typeof createUserBodySchema>;
export declare const updateUserBodySchema: z.ZodObject<{
    email: z.ZodOptional<z.ZodString>;
    name: z.ZodOptional<z.ZodString>;
    role: z.ZodOptional<z.ZodEnum<{
        admin: "admin";
        member: "member";
        viewer: "viewer";
    }>>;
    phone: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    course: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    country: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    speciality: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    enrolled: z.ZodOptional<z.ZodOptional<z.ZodBoolean>>;
}, z.core.$strip>;
export declare const adminUpdateUserBodySchema: z.ZodObject<{
    email: z.ZodOptional<z.ZodString>;
    name: z.ZodOptional<z.ZodString>;
    role: z.ZodOptional<z.ZodEnum<{
        admin: "admin";
        member: "member";
        viewer: "viewer";
    }>>;
    phone: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    course: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    country: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    speciality: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    enrolled: z.ZodOptional<z.ZodBoolean>;
}, z.core.$strip>;
export type UpdateUserBody = z.infer<typeof updateUserBodySchema>;
export type AdminUpdateUserBody = z.infer<typeof adminUpdateUserBodySchema>;
export declare const listUsersResponseSchema: z.ZodObject<{
    items: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        email: z.ZodString;
        name: z.ZodString;
        role: z.ZodEnum<{
            admin: "admin";
            member: "member";
            viewer: "viewer";
        }>;
        enrolled: z.ZodOptional<z.ZodBoolean>;
        phone: z.ZodOptional<z.ZodString>;
        course: z.ZodOptional<z.ZodString>;
        country: z.ZodOptional<z.ZodString>;
        speciality: z.ZodOptional<z.ZodString>;
        createdAt: z.ZodString;
        updatedAt: z.ZodString;
    }, z.core.$strip>>;
}, z.core.$strip>;
export type ListUsersResponse = z.infer<typeof listUsersResponseSchema>;
export declare const adminUserResponseSchema: z.ZodObject<{
    user: z.ZodObject<{
        id: z.ZodString;
        email: z.ZodString;
        name: z.ZodString;
        role: z.ZodEnum<{
            admin: "admin";
            member: "member";
            viewer: "viewer";
        }>;
        enrolled: z.ZodOptional<z.ZodBoolean>;
        phone: z.ZodOptional<z.ZodString>;
        course: z.ZodOptional<z.ZodString>;
        country: z.ZodOptional<z.ZodString>;
        speciality: z.ZodOptional<z.ZodString>;
        createdAt: z.ZodString;
        updatedAt: z.ZodString;
    }, z.core.$strip>;
}, z.core.$strip>;
export type AdminUserResponse = z.infer<typeof adminUserResponseSchema>;
export declare const adminUserNullableResponseSchema: z.ZodObject<{
    user: z.ZodNullable<z.ZodObject<{
        id: z.ZodString;
        email: z.ZodString;
        name: z.ZodString;
        role: z.ZodEnum<{
            admin: "admin";
            member: "member";
            viewer: "viewer";
        }>;
        enrolled: z.ZodOptional<z.ZodBoolean>;
        phone: z.ZodOptional<z.ZodString>;
        course: z.ZodOptional<z.ZodString>;
        country: z.ZodOptional<z.ZodString>;
        speciality: z.ZodOptional<z.ZodString>;
        createdAt: z.ZodString;
        updatedAt: z.ZodString;
    }, z.core.$strip>>;
}, z.core.$strip>;
export type AdminUserNullableResponse = z.infer<typeof adminUserNullableResponseSchema>;
export declare const adminDeleteUserResponseSchema: z.ZodObject<{
    ok: z.ZodLiteral<true>;
}, z.core.$strip>;
export type AdminDeleteUserResponse = z.infer<typeof adminDeleteUserResponseSchema>;
export declare const currentUserResponseSchema: z.ZodObject<{
    user: z.ZodObject<{
        id: z.ZodString;
        email: z.ZodString;
        name: z.ZodString;
        role: z.ZodEnum<{
            admin: "admin";
            member: "member";
            viewer: "viewer";
        }>;
        enrolled: z.ZodOptional<z.ZodBoolean>;
        phone: z.ZodOptional<z.ZodString>;
        course: z.ZodOptional<z.ZodString>;
        country: z.ZodOptional<z.ZodString>;
        speciality: z.ZodOptional<z.ZodString>;
        createdAt: z.ZodString;
        updatedAt: z.ZodString;
    }, z.core.$strip>;
}, z.core.$strip>;
export type CurrentUserResponse = z.infer<typeof currentUserResponseSchema>;
export declare const updateCurrentUserBodySchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    phone: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    course: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    country: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    speciality: z.ZodOptional<z.ZodOptional<z.ZodString>>;
}, z.core.$strip>;
export type UpdateCurrentUserBody = z.infer<typeof updateCurrentUserBodySchema>;
