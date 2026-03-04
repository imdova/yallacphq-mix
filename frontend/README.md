# Yalla CPHQ

Production-grade Next.js SaaS starter with App Router, TypeScript (strict), Tailwind, shadcn/ui, TanStack Table, Tiptap, dnd-kit, Motion, Zustand, React Hook Form, and Zod.

## Quick start

```bash
# Install dependencies
npm install

# Run development server (Turbopack)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Use **Open Dashboard** to see the full dashboard (sidebar, data table, form modal, drag-and-drop cards, rich text editor).

## Tech stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS + CVA + shadcn/ui (Radix) |
| Tables | @tanstack/react-table (headless) |
| Editor | @tiptap/react (modular extensions) |
| Drag & drop | @dnd-kit (core + sortable) |
| Animation | Motion (framer-motion successor) |
| State | Zustand (slice pattern) |
| Forms | React Hook Form + Zod + @hookform/resolvers |

## Project structure

```
/app                 → App Router routes (Server Components by default)
/components
  /ui                → Reusable primitives (shadcn, CVA)
  /shared            → Shared composites (forms, DataTable, RichEditor, ThemeProvider)
  /features          → Feature-specific UI (layout, dashboard)
/lib
  /db                → Dummy DB (mock data, delay, CRUD) — do not import from UI
  /dal               → Data access layer (UI imports only from here)
  /validations       → Zod schemas
  utils.ts           → cn() etc.
/store               → Zustand store (slices)
/hooks               → useTheme, etc.
/constants           → App name, routes, pagination
/types               → Shared TypeScript types
/styles              → (optional) extra global styles
```

### Why each folder exists

- **app** – Next.js App Router; each route is a Server Component unless marked `"use client"`.
- **components/ui** – Isolated, reusable UI building blocks (Button, Card, Dialog, Input, etc.).
- **components/shared** – Composed patterns used across features (Form + FormField, DataTable, RichEditor).
- **components/features** – Screens and flows (DashboardLayout, Sidebar, Header, DashboardView, UserFormModal, SortableCards).
- **lib/db** – Mock data and CRUD for development; never imported by UI or API routes.
- **lib/dal** – Single place for “get/create/update/delete”;
  - UI and Server Components call only the DAL.
  - Swapping to a real API later = change DAL implementation only; no UI refactor.
- **lib/validations** – Zod schemas for forms and (later) API payloads.
- **store** – Global client state (UI slice, modal slice); use selectors to avoid re-renders.
- **hooks** – Client-only hooks (e.g. theme).
- **constants** – App-wide config (name, routes, page sizes).
- **types** – Shared domain and API types.

## Design system

- **Tailwind** – Theme uses CSS variables (`--background`, `--foreground`, `--primary`, etc.) in `app/globals.css`.
- **Theme** – Light/dark/system via `ThemeProvider` and `useTheme`; preference stored in `localStorage`.
- **Typography** – Utility classes: `text-display`, `text-heading`, `text-subheading`, `text-body`, `text-caption`.
- **Containers** – `container` in Tailwind is centered with responsive max-widths.

## Data flow and future API

1. **UI** imports only from **`/lib/dal`** (e.g. `fetchUsers`, `createUser`).
2. **DAL** today calls **`/lib/db`** (delay + deep clone + CRUD).
3. To switch to a real backend:
   - Replace the implementation inside each `lib/dal/*.ts` file with `fetch("/api/...")` or server actions.
   - Keep the same function names and return types.
   - Validate API responses with Zod (e.g. in API route handlers) and return typed data.
4. No UI or page code should need to change; only DAL implementation and API routes.

## Scripts

| Command | Description |
|--------|-------------|
| `npm run dev` | Start dev server (Turbopack) |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run format` | Format with Prettier |

## First page (dashboard)

The first real page is the **dashboard** (`/dashboard`):

- **Layout**: Collapsible sidebar + header with theme toggle.
- **Data table**: Users from DAL; sorting, pagination, row selection; “Add user” opens a modal.
- **Form modal**: React Hook Form + Zod; creates a user via DAL and appends to table.
- **Drag-and-drop**: Sortable cards (dnd-kit); order kept in local state.
- **Rich text**: Tiptap with toolbar; content is controlled.

All use shadcn/ui where possible, Motion for subtle animations, and are responsive.
