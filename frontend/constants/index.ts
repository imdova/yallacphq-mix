/**
 * App-wide constants.
 */

export const APP_NAME = "Yalla CPHQ";

/** Admin sidebar header: title (e.g. "Admin") and subtitle (e.g. app/brand name). */
export const ADMIN_SIDEBAR_BRANDING = {
  title: "Admin",
  subtitle: APP_NAME,
} as const;

/** Student sidebar header: title (e.g. app/brand name) and subtitle (e.g. "Student Portal"). */
export const STUDENT_SIDEBAR_BRANDING = {
  title: APP_NAME,
  subtitle: "Student Portal",
} as const;

export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  SIGNUP: "/signup",
  FORGOT_PASSWORD: "/forgot-password",
  SET_PASSWORD: "/set-password",
  DASHBOARD: "/dashboard",
  OFFERS: "/offers",
  CPHQ_REGISTER_1: "/offers/cphq-register-1",
  CPHQ_FREE_LECTURE: "/offers/cphq-free-lecture",
  CPHQ_OFFER: "/offers/cphq-offer",
  WEBINARS: "/webinars",
  CPHQ_WEBINAR_1: "/webinars/cphq-webinar-1",
  COURSE_DETAILS: "/course-details",
  CART: "/cart",
  CHECKOUT: "/checkout",
  PAY_CREDIT_PAYPAL: "/pay-credit-paypal1",
} as const;

export const OFFERS_DROPDOWN_ITEMS = [
  { href: "/offers/cphq-register-1", label: "Start your journey today" },
  { href: "/offers/cphq-free-lecture", label: "CPHQ Free Lecture" },
  { href: "/offers/cphq-offer", label: "CPHQ Offer" },
] as const;

export const WEBINARS_DROPDOWN_ITEMS = [
  { href: "/webinars/cphq-webinar-1", label: "CPHQ Webinar 1" },
] as const;

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [5, 10, 20, 50],
} as const;
