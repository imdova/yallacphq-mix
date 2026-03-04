/**
 * Data Access Layer (DAL).
 * Single entry point for all data operations.
 * UI and Server Components import from here only — never from /lib/db.
 *
 * Migration to real API:
 * 1. Replace implementation in each dal/*.ts file with fetch("/api/...") or server actions.
 * 2. Keep the same function signatures and return types.
 * 3. Validate API responses with Zod schemas (e.g. in api handlers) before returning.
 * No UI refactor required.
 */

export * from "./user";
export * from "./task";
export * from "./courses";
export * from "./promo-codes";
export * from "./orders";
export * from "./auth";
export * from "./leads";
