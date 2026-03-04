# Caching strategy (frontend ↔ BFF)

## Default today

- **Authenticated data** (admin + dashboard): **no-store**.
  - Rationale: sensitive data, per-user scoping, and frequent mutations.
  - Implementation:
    - `lib/api/client.ts` defaults server-side fetch to `cache: "no-store"`.
    - API route handlers export `dynamic = "force-dynamic"` where appropriate.

- **Client components** still own the UX cache:
  - Admin tables and dashboard views keep data in local React state (current pattern).
  - Refetch is controlled by the screen (e.g. Refresh button).

## Invalidation rules (when we introduce caching)

When the app moves to server-first data loading or adds a query cache, use these tag boundaries:

- **Admin**
  - `admin:users`
  - `admin:courses`
  - `admin:promoCodes`
  - `admin:orders`

- **Student**
  - `me`
  - `orders:me`
  - `enrollments:me` (future)

### Mutations should invalidate

- **User create/update/delete** → invalidate `admin:users`
- **Course create/update/delete** → invalidate `admin:courses`
- **Promo create/update/delete/toggle** → invalidate `admin:promoCodes`
- **Order refund/delete/status** → invalidate `admin:orders` and (if affected) `orders:me`

## Future options (choose one)

1) **Next.js fetch tags** (server-first rendering)\n
   - Use `fetch(url, { next: { tags: [...] } })` in server calls.\n
   - Use `revalidateTag()` in API route handlers after mutations.\n
\n
2) **TanStack Query** (client-first, complex admin UIs)\n
   - Centralizes caching/invalidation across screens.\n
   - Works well for admin tables and frequent filters.\n

