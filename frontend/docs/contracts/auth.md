# Auth API contract (Phase 0)

This document defines the **frontend contract** for authentication-related endpoints.
Implementation lives in `app/api/auth/*` (BFF).

## Error shape (all endpoints)

Errors should return:

```json
{
  "message": "Human readable message",
  "code": "OPTIONAL_MACHINE_CODE",
  "issues": [
    { "path": ["fieldName"], "message": "Validation error" }
  ]
}
```

Helpers:
- `lib/api/route-helpers.ts` (`jsonError`, `zodIssues`)
- `lib/api/contracts/common.ts` (`apiErrorSchema`)

## Endpoints

### `GET /api/auth/me`

- **Request**: no body
- **Response**: `authMeResponseSchema`

```ts
{ user: ApiUser | null }
```

### `POST /api/auth/signup`

- **Request**: `signupBodySchema`

```ts
{ name: string; email: string; password: string }
```

- **Response**: `authUserResponseSchema`

```ts
{ user: ApiUser }
```

### `POST /api/auth/login`

- **Request**: `loginBodySchema`

```ts
{ email: string; password: string; rememberMe?: boolean }
```

- **Response**: `authUserResponseSchema`

```ts
{ user: ApiUser }
```

### `POST /api/auth/logout`

- **Request**: no body
- **Response**: `authLogoutResponseSchema`

```ts
{ ok: true }
```

### `POST /api/auth/forgot-password`

- **Request**: `forgotPasswordBodySchema`

```ts
{ email: string }
```

- **Response**: `forgotPasswordResponseSchema`

```ts
{ success: true; token?: string }
```

Notes:
- In production, `token` should be omitted (sent via email).
- In development, `token` may be returned to enable local UX testing.

### `POST /api/auth/reset-password`

- **Request**: `resetPasswordBodySchema`

```ts
{ token: string; newPassword: string }
```

- **Response**: `resetPasswordResponseSchema`

```ts
{ ok: true }
```

## Source of truth

- Schemas: `lib/api/contracts/auth.ts`
- Shared types: `lib/api/contracts/user.ts` (`userSchema`)

