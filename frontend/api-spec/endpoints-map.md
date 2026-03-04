# Endpoints map (contracts + DAL usage)

Source of truth for schemas:

- `api-spec/contracts/*` (Zod)

DAL usage:

- `lib/dal/*`

Error shape for non-2xx:

- `apiErrorSchema` (`ApiErrorPayload`) from `api-spec/contracts/common.ts`

---

## Auth

### GET `/api/auth/me`

- **Request**: (none)
- **Response**: `authMeResponseSchema`
- **Used in**: `lib/dal/auth.ts -> authMe()`

### POST `/api/auth/signup`

- **Request**: `signupBodySchema`
- **Response**: `authUserResponseSchema`
- **Used in**: `lib/dal/auth.ts -> authSignup()`

### POST `/api/auth/login`

- **Request**: `loginBodySchema`
- **Response**: `authUserResponseSchema`
- **Used in**: `lib/dal/auth.ts -> authLogin()`

### POST `/api/auth/logout`

- **Request**: (none)
- **Response**: `authLogoutResponseSchema`
- **Used in**: `lib/dal/auth.ts -> authLogout()`

### POST `/api/auth/forgot-password`

- **Request**: `forgotPasswordBodySchema`
- **Response**: `forgotPasswordResponseSchema`
- **Used in**: `lib/dal/auth.ts -> authForgotPassword()`

### POST `/api/auth/reset-password`

- **Request**: `resetPasswordBodySchema`
- **Response**: `resetPasswordResponseSchema`
- **Used in**: `lib/dal/auth.ts -> authResetPassword()`

---

## Current user

### GET `/api/me`

- **Request**: (none)
- **Response**: `currentUserResponseSchema`
- **Used in**: `lib/dal/user.ts -> getCurrentUser()`

### PATCH `/api/me`

- **Request**: `updateCurrentUserBodySchema`
- **Response**: `currentUserResponseSchema`
- **Used in**: `lib/dal/user.ts -> updateCurrentUser()`

---

## Public courses

### GET `/api/courses`

- **Request**: (none)
- **Response**: `publicCoursesResponseSchema`
- **Used in**: `lib/dal/courses.ts -> getPublicCourses()`

### GET `/api/courses/:id`

- **Request**: (none)
- **Response**: `publicCourseResponseSchema`
- **Used in**: `lib/dal/courses.ts -> getPublicCourse()`

### POST `/api/courses/:id/enroll`

- **Request**: `enrollCourseBodySchema`
- **Response**: `enrollCourseResponseSchema`
- **Used in**: `lib/dal/courses.ts -> enrollCourse()`

---

## Promo codes (public)

### POST `/api/promo-codes/validate`

- **Request**: `validatePromoCodeBodySchema`
- **Response**: `validatePromoCodeResponseSchema`
- **Used in**: `lib/dal/promo-codes.ts -> validatePromoCode()`

---

## Student orders

### GET `/api/orders`

- **Request**: (none)
- **Response**: `listOrdersResponseSchema`
- **Used in**: `lib/dal/orders.ts -> getUserOrders()`

### POST `/api/orders`

- **Request**: `createOrderBodySchema`
- **Response**: `orderResponseSchema`
- **Used in**: `lib/dal/orders.ts -> createOrder()`

---

## Checkout

### POST `/api/checkout/session`

- **Request**: `createPaymentSessionBodySchema`
- **Response**: `createPaymentSessionResponseSchema`
- **Used in**: `lib/dal/orders.ts -> createPaymentSession()`

### POST `/api/checkout/confirm`

- **Request**: `confirmPaymentBodySchema`
- **Response**: `confirmPaymentResponseSchema`
- **Used in**: `lib/dal/orders.ts -> confirmPayment()`

---

## Leads

### POST `/api/leads/cphq`

- **Request**: `leadCreateBodySchema`
- **Response**: `leadSubmitResponseSchema`
- **Used in**: `lib/dal/leads.ts -> registerOffer()`

### POST `/api/leads/webinar`

- **Request**: `leadCreateBodySchema`
- **Response**: `leadSubmitResponseSchema`
- **Used in**: `lib/dal/leads.ts -> registerWebinar()`

---

## Admin: users

### GET `/api/admin/users`

- **Request**: (none)
- **Response**: `listUsersResponseSchema`
- **Used in**:
  - `lib/dal/user.ts -> getUsers()`
  - `lib/dal/user.ts -> fetchUsers()` (wrapper)

### POST `/api/admin/users`

- **Request**: `createUserBodySchema`
- **Response**: `adminUserResponseSchema`
- **Used in**: `lib/dal/user.ts -> createUser()`

### GET `/api/admin/users/:id`

- **Request**: (none)
- **Response**: `adminUserNullableResponseSchema` *(DAL expects nullable user)*
- **Used in**: `lib/dal/user.ts -> fetchUserById()`

### PATCH `/api/admin/users/:id`

- **Request**: `adminUpdateUserBodySchema`
- **Response**: `adminUserResponseSchema`
- **Used in**: `lib/dal/user.ts -> updateUser()`

### DELETE `/api/admin/users/:id`

- **Request**: (none)
- **Response**: `adminDeleteUserResponseSchema`
- **Used in**: `lib/dal/user.ts -> deleteUser()`

---

## Admin: courses

### GET `/api/admin/courses`

- **Request**: (none)
- **Response**: `listCoursesResponseSchema`
- **Used in**:
  - `lib/dal/courses.ts -> getCourses()`
  - `lib/dal/courses.ts -> fetchCourses()` (wrapper)

### POST `/api/admin/courses`

- **Request**: `createCourseBodySchema`
- **Response**: `adminCourseResponseSchema`
- **Used in**: `lib/dal/courses.ts -> createCourse()`

### GET `/api/admin/courses/:id`

- **Request**: (none)
- **Response**: `adminCourseNullableResponseSchema` *(DAL expects nullable course)*
- **Used in**:
  - `lib/dal/courses.ts -> getCourse()`
  - `lib/dal/courses.ts -> fetchCourseById()` (wrapper)

### PATCH `/api/admin/courses/:id`

- **Request**: `updateCourseBodySchema`
- **Response**: `adminCourseResponseSchema`
- **Used in**: `lib/dal/courses.ts -> updateCourse()`

### DELETE `/api/admin/courses/:id`

- **Request**: (none)
- **Response**: `adminDeleteCourseResponseSchema`
- **Used in**:
  - `lib/dal/courses.ts -> deleteCourse()`
  - `lib/dal/courses.ts -> removeCourse()` (wrapper)

---

## Admin: promo codes

### GET `/api/admin/promo-codes`

- **Request**: (none)
- **Response**: `listPromoCodesResponseSchema`
- **Used in**:
  - `lib/dal/promo-codes.ts -> getPromoCodes()`
  - `lib/dal/promo-codes.ts -> fetchPromoCodes()` (wrapper)

### POST `/api/admin/promo-codes`

- **Request**: `createPromoCodeBodySchema`
- **Response**: `promoCodeResponseSchema`
- **Used in**: `lib/dal/promo-codes.ts -> createPromoCode()`

### GET `/api/admin/promo-codes/:id`

- **Request**: (none)
- **Response**: `promoCodeNullableResponseSchema` *(DAL expects nullable promo)*
- **Used in**:
  - `lib/dal/promo-codes.ts -> getPromoCode()`
  - `lib/dal/promo-codes.ts -> getPromoCodeById()` (wrapper)

### PATCH `/api/admin/promo-codes/:id`

- **Request**: `updatePromoCodeBodySchema`
- **Response**: `promoCodeResponseSchema`
- **Used in**: `lib/dal/promo-codes.ts -> updatePromoCode()`

### DELETE `/api/admin/promo-codes/:id`

- **Request**: (none)
- **Response**: `adminDeletePromoCodeResponseSchema`
- **Used in**:
  - `lib/dal/promo-codes.ts -> deletePromoCodeById()`
  - `lib/dal/promo-codes.ts -> deletePromoCode()` (wrapper)

---

## Admin: orders

### GET `/api/admin/orders`

- **Request**: (none)
- **Response**: `listOrdersResponseSchema`
- **Used in**:
  - `lib/dal/orders.ts -> getAdminOrders()`
  - `lib/dal/orders.ts -> fetchAdminOrders()` (wrapper)

### POST `/api/admin/orders`

- **Request**: `createOrderBodySchema`
- **Response**: `orderResponseSchema`
- **Used in**: *(not currently used by DAL/UI)*

### GET `/api/admin/orders/:id`

- **Request**: (none)
- **Response**: `orderNullableResponseSchema` *(DAL expects nullable order)*
- **Used in**: `lib/dal/orders.ts -> fetchAdminOrderById()`

### PATCH `/api/admin/orders/:id`

- **Request**: `updateOrderBodySchema`
- **Response**: `orderResponseSchema`
- **Used in**:
  - `lib/dal/orders.ts -> updateAdminOrder()`
  - `lib/dal/orders.ts -> updateOrderStatus()` (wrapper)

### DELETE `/api/admin/orders/:id`

- **Request**: (none)
- **Response**: `adminDeleteOrderResponseSchema`
- **Used in**: `lib/dal/orders.ts -> removeAdminOrder()`

---

## Legacy lead capture (compat)

These exist in `app/api/*` but are not currently called from the DAL.

### POST `/api/register-cphq`

- **Request**: `registerCphqBodySchema`
- **Response**: `registerCphqResponseSchema`
- **Used in**: *(not currently used by DAL/UI)*

### POST `/api/webinar-register`

- **Request**: `webinarRegisterBodySchema`
- **Response**: `webinarRegisterResponseSchema`
- **Used in**: *(not currently used by DAL/UI)*

