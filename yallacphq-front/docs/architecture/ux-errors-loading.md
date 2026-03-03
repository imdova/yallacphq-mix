# UX standards: loading, empty, error (admin + dashboard)

## Goals

- Keep UX consistent across screens (tables, modals, forms).
- Make backend/API integration predictable (same error shape, same UI behavior).

## API error contract

All API routes should return errors in this JSON shape:

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
- `lib/api/error.ts` (`getErrorMessage`, `isApiError`)

## Screen-level patterns

### Loading

- **Initial load**: show a skeleton/placeholder inside the card/table container (not a full-page spinner).
- **Refetch**: keep existing data visible; show a subtle “Refreshing…” indicator on the action that triggered it.

### Empty

- If filters/search are applied: “No results match your filters” + “Clear filters” CTA.
- If no data exists yet: “No X yet” + primary CTA (create/add).

### Error

- Show a **single** inline error banner at the top of the screen when initial load fails.
- For mutations (create/update/delete): show a compact inline error near the submit button or inside the modal footer.

### Mutations

- Disable submit while request is in flight.
- On success: close modal and update local state optimistically (current pattern), then optionally refetch.
- On failure: keep modal open and show error message (derived from `getErrorMessage()`).

