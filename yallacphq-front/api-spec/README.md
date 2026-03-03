# API Spec (Frontend Contracts)

This folder contains the **official API contracts** that the backend must implement.

- All schemas are **Zod-based** and live in `api-spec/contracts/`.
- The backend can import all exported schemas/types from `api-spec/index.ts`.

Notes:

- These contracts are the source of truth for request/response payload shapes.
- Backend implementations should return errors matching the shared error schema (`apiErrorSchema`).

