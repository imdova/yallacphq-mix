# Routes inventory & ownership

This document is the canonical list of application routes and which components own them.

## Conventions

- **Router**: Next.js App Router (all routes live under `app/`).
- **Page owner**: the first “screen-level” component rendered by a route (often under `components/features/*`).
- **Data access**: UI should call the **Data Access Layer (DAL)** in `lib/dal/*` (never `lib/db/*` directly).

## Public platform

| Route | Source | Page owner |
|---|---|---|
| `/` | `app/page.tsx` | `components/features/home/*` (Home marketing sections) |
| `/courses` | `app/courses/page.tsx` | `components/features/courses/*` |
| `/course-details` | `app/course-details/page.tsx` | `components/features/course-details/CourseDetailsView.tsx` |
| `/offers` | `app/offers/(main)/page.tsx` | Offers index page (marketing) |
| `/offers/cphq-register-1` | `app/offers/(register)/cphq-register-1/page.tsx` | `components/features/offers/Register1Form.tsx` (posts `/api/register-cphq`) |
| `/offers/cphq-free-lecture` | `app/offers/(free-lecture)/cphq-free-lecture/page.tsx` | Free lecture offer page |
| `/offers/cphq-offer` | `app/offers/(main)/cphq-offer/page.tsx` | Offer page |
| `/webinars` | `app/webinars/page.tsx` | Webinars index |
| `/webinars/cphq-webinar-1` | `app/webinars/cphq-webinar-1/page.tsx` | `components/features/webinars/Webinar1SpotForm.tsx` (posts `/api/webinar-register`) |
| `/checkout` | `app/checkout/page.tsx` | `components/features/checkout/CheckoutView.tsx` |
| `/pay-credit-paypal1` | `app/pay-credit-paypal1/page.tsx` | `components/features/checkout/PayCreditPaypalView.tsx` |

### Public layouts (wrappers)

- Offers layouts:
  - `app/offers/layout.tsx` (pass-through)
  - `app/offers/(main)/layout.tsx` (wraps with `CoursesHeader` + `CoursesFooter`)
  - `app/offers/(register)/cphq-register-1/layout.tsx` (wraps with `Register1Header` + `Register1Footer`)
- Webinars layout:
  - `app/webinars/layout.tsx` (wraps with `WebinarsLayoutClient`)

## Authentication

| Route | Source | Notes |
|---|---|---|
| `/auth/login` | `app/auth/login/page.tsx` | Auth UX (client) |
| `/auth/signup` | `app/auth/signup/page.tsx` | Auth UX (client) |
| `/auth/forgot-password` | `app/auth/forgot-password/page.tsx` | Auth UX (client) |
| `/auth/reset-password` | `app/auth/reset-password/page.tsx` | Server wrapper + client component reads `?token=` |

### Legacy redirects (kept for compatibility)

| Route | Source | Redirects to |
|---|---|---|
| `/login` | `app/login/page.tsx` | `/auth/login` |
| `/signup` | `app/signup/page.tsx` | `/auth/signup` |
| `/forgot-password` | `app/forgot-password/page.tsx` | `/auth/forgot-password` |
| `/set-password` | `app/set-password/page.tsx` | `/auth/reset-password` |

## Student dashboard

| Route | Source | Page owner |
|---|---|---|
| `/dashboard` | `app/dashboard/page.tsx` | `components/features/dashboard/StudentDashboardView.tsx` |
| `/dashboard/profile` | `app/dashboard/profile/page.tsx` | `components/features/dashboard/StudentProfileView.tsx` |
| `/dashboard/courses` | `app/dashboard/courses/page.tsx` | `components/features/dashboard/MyCoursesView.tsx` |
| `/dashboard/courses/lesson` | `app/dashboard/courses/lesson/page.tsx` | `components/features/dashboard/LessonContentView.tsx` |
| `/dashboard/orders` | `app/dashboard/orders/page.tsx` | `components/features/dashboard/StudentOrdersView.tsx` |
| `/dashboard/settings` | `app/dashboard/settings/page.tsx` | `components/features/dashboard/StudentSettingsView.tsx` |
| `/dashboard/*` (other) | `app/dashboard/*/page.tsx` | Mostly placeholders today |

### Dashboard layout

- `app/dashboard/layout.tsx` → `components/features/layout/DashboardLayoutSwitcher.tsx` → `components/features/layout/StudentDashboardLayout.tsx`

## Admin panel

| Route | Source | Page owner |
|---|---|---|
| `/admin` | `app/admin/page.tsx` | `components/features/admin/AdminOverviewView.tsx` |
| `/admin/students` | `app/admin/students/page.tsx` | `components/features/admin/AdminStudentsView.tsx` |
| `/admin/users` | `app/admin/users/page.tsx` | Redirects to `/admin/students` |
| `/admin/courses` | `app/admin/courses/page.tsx` | `components/features/admin/AdminCoursesView.tsx` |
| `/admin/courses/new` | `app/admin/courses/new/page.tsx` | Course creation/edit form (client) |
| `/admin/courses/[id]` | `app/admin/courses/[id]/page.tsx` | `components/features/admin/AdminCourseDetailsView.tsx` |
| `/admin/orders` | `app/admin/orders/page.tsx` | `components/features/admin/AdminOrdersView.tsx` |
| `/admin/promo-codes` | `app/admin/promo-codes/page.tsx` | `components/features/admin/AdminPromoCodesView.tsx` |
| `/admin/promo-codes/new` | `app/admin/promo-codes/new/page.tsx` | Promo create/edit (query `?edit=` supported) |
| `/admin/promo-codes/[id]/edit` | `app/admin/promo-codes/[id]/edit/page.tsx` | Promo edit |
| `/admin/offers` | `app/admin/offers/page.tsx` | UI-only preview editor (no persistence) |
| `/admin/webinars` | `app/admin/webinars/page.tsx` | Placeholder |
| `/admin/settings` | `app/admin/settings/page.tsx` | Placeholder |

### Admin layout

- `app/admin/layout.tsx` → `components/features/admin/AdminLayout.tsx`

## API routes (BFF)

| Route | Source | Purpose |
|---|---|---|
| `/api/register-cphq` | `app/api/register-cphq/route.ts` | Marketing lead capture → webhook |
| `/api/webinar-register` | `app/api/webinar-register/route.ts` | Webinar lead capture → webhook |

