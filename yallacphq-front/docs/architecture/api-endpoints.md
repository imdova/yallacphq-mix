# API endpoints (BFF) and DAL mapping

This app uses **route handlers** under `app/api/*` as a Backend-for-Frontend (BFF).
Client UI calls the **DAL** (`lib/dal/*`), and DAL calls these endpoints via `lib/api/client.ts`.

## Authentication

| Endpoint | Method | Purpose | Used by |
|---|---|---|---|
| `/api/auth/me` | GET | Current user from session cookie | `AuthProvider` |
| `/api/auth/signup` | POST | Create account + set session | `/auth/signup` |
| `/api/auth/login` | POST | Login + set session | `/auth/login` |
| `/api/auth/logout` | POST | Clear session | `useAuth().logout()` |
| `/api/auth/forgot-password` | POST | Create reset token (dev returns token) | `/auth/forgot-password` |
| `/api/auth/reset-password` | POST | Reset password using token | `/auth/reset-password` |

## Admin (RBAC: admin only)

All admin endpoints are under `/api/admin/*` and are protected by middleware + server checks.

### Users

| DAL function | Endpoint | Methods |
|---|---|---|
| `fetchUsers()` | `/api/admin/users` | GET |
| `createUser()` | `/api/admin/users` | POST |
| `fetchUserById()` | `/api/admin/users/:id` | GET |
| `updateUser()` | `/api/admin/users/:id` | PATCH |
| `removeUser()` | `/api/admin/users/:id` | DELETE |

### Courses

| DAL function | Endpoint | Methods |
|---|---|---|
| `fetchCourses()` | `/api/admin/courses` | GET |
| `createCourse()` | `/api/admin/courses` | POST |
| `fetchCourseById()` | `/api/admin/courses/:id` | GET |
| `updateCourse()` | `/api/admin/courses/:id` | PATCH |
| `removeCourse()` | `/api/admin/courses/:id` | DELETE |

### Promo codes

| DAL function | Endpoint | Methods |
|---|---|---|
| `fetchPromoCodes()` | `/api/admin/promo-codes` | GET |
| `createPromoCode()` | `/api/admin/promo-codes` | POST |
| `getPromoCodeById()` | `/api/admin/promo-codes/:id` | GET |
| `updatePromoCode()` | `/api/admin/promo-codes/:id` | PATCH |
| `deletePromoCode()` | `/api/admin/promo-codes/:id` | DELETE |

### Orders

| DAL function | Endpoint | Methods |
|---|---|---|
| `fetchAdminOrders()` | `/api/admin/orders` | GET |
| `fetchAdminOrderById()` | `/api/admin/orders/:id` | GET |
| `updateAdminOrder()` | `/api/admin/orders/:id` | PATCH |
| `removeAdminOrder()` | `/api/admin/orders/:id` | DELETE |

## Student (authenticated)

| DAL function | Endpoint | Methods |
|---|---|---|
| `fetchMyOrders()` | `/api/orders` | GET |
| `createOrder()` | `/api/orders` | POST |

