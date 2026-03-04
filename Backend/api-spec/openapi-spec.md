# Backend API Spec (from Zod contracts)

This document is generated from the frontend **Zod contracts** in:

- `api-spec/contracts/*` (copied from `lib/api/contracts/*`)

It is intended to be used to implement a production backend in a separate repository.

## Conventions

- **Base path**: all endpoints are shown relative to the web origin (e.g. `POST /api/auth/login`).
- **Auth**:
  - `public`: no session required
  - `session`: requires valid session cookie
  - `admin`: requires session with admin role
- **Headers**:
  - Clients send `x-request-id` (string). If not provided, server should generate one.
  - Server should echo `x-request-id` back in responses.
- **Errors**:
  - All non-2xx should return `ApiErrorPayload` (see `apiErrorSchema`).

## Shared schemas

### Error payload

- **Schema**: `apiErrorSchema`
- **Type**: `ApiErrorPayload`
- **Shape**:

```json
{
  "message": "string",
  "code": "string (optional)",
  "issues": [
    { "path": ["field"], "message": "string" }
  ]
}
```

---

## Authentication (`/api/auth/*`)

### GET `/api/auth/me`

- **Auth**: `public` (may return `null` user)
- **Request**: none
- **Response schema**: `authMeResponseSchema` (`AuthMeResponse`)

```json
{ "user": null }
```

### POST `/api/auth/signup`

- **Auth**: `public`
- **Request schema**: `signupBodySchema` (`SignupBody`)
- **Response schema**: `authUserResponseSchema` (`AuthUserResponse`)

### POST `/api/auth/login`

- **Auth**: `public`
- **Request schema**: `loginBodySchema` (`LoginBody`)
- **Response schema**: `authUserResponseSchema` (`AuthUserResponse`)

### POST `/api/auth/logout`

- **Auth**: `session`
- **Request**: none
- **Response schema**: `authLogoutResponseSchema` (`AuthLogoutResponse`)

### POST `/api/auth/forgot-password`

- **Auth**: `public`
- **Request schema**: `forgotPasswordBodySchema` (`ForgotPasswordBody`)
- **Response schema**: `forgotPasswordResponseSchema` (`ForgotPasswordResponse`)

### POST `/api/auth/reset-password`

- **Auth**: `public`
- **Request schema**: `resetPasswordBodySchema` (`ResetPasswordBody`)
- **Response schema**: `resetPasswordResponseSchema` (`ResetPasswordResponse`)

---

## Current user (`/api/me`)

### GET `/api/me`

- **Auth**: `session`
- **Request**: none
- **Response schema**: `currentUserResponseSchema` (`CurrentUserResponse`)

### PATCH `/api/me`

- **Auth**: `session`
- **Request schema**: `updateCurrentUserBodySchema` (`UpdateCurrentUserBody`)
- **Response schema**: `currentUserResponseSchema` (`CurrentUserResponse`)

---

## Public courses (`/api/courses/*`)

### GET `/api/courses`

- **Auth**: `public`
- **Request**: none
- **Response schema**: `publicCoursesResponseSchema` (`PublicCoursesResponse`)

### GET `/api/courses/:id`

- **Auth**: `public`
- **Request**: none
- **Response schema**: `publicCourseResponseSchema` (`PublicCourseResponse`)

### POST `/api/courses/:id/enroll`

- **Auth**: `session`
- **Request schema**: `enrollCourseBodySchema` (`EnrollCourseBody`)
- **Response schema**: `enrollCourseResponseSchema` (`EnrollCourseResponse`)

---

## Promo validation (`/api/promo-codes/*`)

### POST `/api/promo-codes/validate`

- **Auth**: `public`
- **Request schema**: `validatePromoCodeBodySchema` (`ValidatePromoCodeBody`)
- **Response schema**: `validatePromoCodeResponseSchema` (`ValidatePromoCodeResponse`)

---

## Student orders (`/api/orders`)

### GET `/api/orders`

- **Auth**: `session`
- **Request**: none
- **Response schema**: `listOrdersResponseSchema` (`ListOrdersResponse`)

### POST `/api/orders`

- **Auth**: `session`
- **Request schema**: `createOrderBodySchema` (`CreateOrderBody`)
- **Response schema**: `orderResponseSchema` (`OrderResponse`)

---

## Checkout (`/api/checkout/*`)

### POST `/api/checkout/session`

- **Auth**: `session`
- **Request schema**: `createPaymentSessionBodySchema` (`CreatePaymentSessionBody`)
- **Response schema**: `createPaymentSessionResponseSchema` (`CreatePaymentSessionResponse`)

### POST `/api/checkout/confirm`

- **Auth**: `session`
- **Request schema**: `confirmPaymentBodySchema` (`ConfirmPaymentBody`)
- **Response schema**: `confirmPaymentResponseSchema` (`ConfirmPaymentResponse`)

---

## Leads (`/api/leads/*`)

### POST `/api/leads/cphq`

- **Auth**: `public`
- **Request schema**: `leadCreateBodySchema` (`LeadCreateBody`)
- **Response schema**: `leadSubmitResponseSchema` (`LeadSubmitResponse`)

### POST `/api/leads/webinar`

- **Auth**: `public`
- **Request schema**: `leadCreateBodySchema` (`LeadCreateBody`)
- **Response schema**: `leadSubmitResponseSchema` (`LeadSubmitResponse`)

---

## Legacy lead capture (kept for compatibility)

### POST `/api/register-cphq`

- **Auth**: `public`
- **Request schema**: `registerCphqBodySchema` (`RegisterCphqBody`) (requires `specialty`)
- **Response schema**: `registerCphqResponseSchema` (`RegisterCphqResponse`)

### POST `/api/webinar-register`

- **Auth**: `public`
- **Request schema**: `webinarRegisterBodySchema` (`WebinarRegisterBody`) (requires `specialty`)
- **Response schema**: `webinarRegisterResponseSchema` (`WebinarRegisterResponse`)

---

## Admin API (`/api/admin/*`) (RBAC: admin)

### Users

#### GET `/api/admin/users`

- **Auth**: `admin`
- **Request**: none
- **Response schema**: `listUsersResponseSchema` (`ListUsersResponse`)

#### POST `/api/admin/users`

- **Auth**: `admin`
- **Request schema**: `createUserBodySchema` (`CreateUserBody`)
- **Response schema**: `adminUserResponseSchema` (`AdminUserResponse`)

#### GET `/api/admin/users/:id`

- **Auth**: `admin`
- **Request**: none
- **Response schema**: `adminUserResponseSchema` (`AdminUserResponse`)

#### PATCH `/api/admin/users/:id`

- **Auth**: `admin`
- **Request schema**: `adminUpdateUserBodySchema` (`AdminUpdateUserBody`)
- **Response schema**: `adminUserResponseSchema` (`AdminUserResponse`)

#### DELETE `/api/admin/users/:id`

- **Auth**: `admin`
- **Request**: none
- **Response schema**: `adminDeleteUserResponseSchema` (`AdminDeleteUserResponse`)

### Courses

#### GET `/api/admin/courses`

- **Auth**: `admin`
- **Request**: none
- **Response schema**: `listCoursesResponseSchema` (`ListCoursesResponse`)

#### POST `/api/admin/courses`

- **Auth**: `admin`
- **Request schema**: `createCourseBodySchema` (`CreateCourseBody`)
- **Response schema**: `adminCourseResponseSchema` (`AdminCourseResponse`)

#### GET `/api/admin/courses/:id`

- **Auth**: `admin`
- **Request**: none
- **Response schema**: `adminCourseResponseSchema` (`AdminCourseResponse`)

#### PATCH `/api/admin/courses/:id`

- **Auth**: `admin`
- **Request schema**: `updateCourseBodySchema` (`UpdateCourseBody`)
- **Response schema**: `adminCourseResponseSchema` (`AdminCourseResponse`)

#### DELETE `/api/admin/courses/:id`

- **Auth**: `admin`
- **Request**: none
- **Response schema**: `adminDeleteCourseResponseSchema` (`AdminDeleteCourseResponse`)

### Promo codes

#### GET `/api/admin/promo-codes`

- **Auth**: `admin`
- **Request**: none
- **Response schema**: `listPromoCodesResponseSchema` (`ListPromoCodesResponse`)

#### POST `/api/admin/promo-codes`

- **Auth**: `admin`
- **Request schema**: `createPromoCodeBodySchema` (`CreatePromoCodeBody`)
- **Response schema**: `promoCodeResponseSchema` (`PromoCodeResponse`)

#### GET `/api/admin/promo-codes/:id`

- **Auth**: `admin`
- **Request**: none
- **Response schema**: `promoCodeResponseSchema` (`PromoCodeResponse`)

#### PATCH `/api/admin/promo-codes/:id`

- **Auth**: `admin`
- **Request schema**: `updatePromoCodeBodySchema` (`UpdatePromoCodeBody`)
- **Response schema**: `promoCodeResponseSchema` (`PromoCodeResponse`)

#### DELETE `/api/admin/promo-codes/:id`

- **Auth**: `admin`
- **Request**: none
- **Response schema**: `adminDeletePromoCodeResponseSchema` (`AdminDeletePromoCodeResponse`)

### Orders

#### GET `/api/admin/orders`

- **Auth**: `admin`
- **Request**: none
- **Response schema**: `listOrdersResponseSchema` (`ListOrdersResponse`)

#### POST `/api/admin/orders`

- **Auth**: `admin`
- **Request schema**: `createOrderBodySchema` (`CreateOrderBody`)
- **Response schema**: `orderResponseSchema` (`OrderResponse`)

#### GET `/api/admin/orders/:id`

- **Auth**: `admin`
- **Request**: none
- **Response schema**: `orderResponseSchema` (`OrderResponse`)

#### PATCH `/api/admin/orders/:id`

- **Auth**: `admin`
- **Request schema**: `updateOrderBodySchema` (`UpdateOrderBody`)
- **Response schema**: `orderResponseSchema` (`OrderResponse`)

#### DELETE `/api/admin/orders/:id`

- **Auth**: `admin`
- **Request**: none
- **Response schema**: `adminDeleteOrderResponseSchema` (`AdminDeleteOrderResponse`)

