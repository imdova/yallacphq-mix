## Yalla CPHQ Backend (NestJS + MongoDB)

Production-ready NestJS backend with:

- **MongoDB (Mongoose)** via `@nestjs/mongoose`
- **JWT authentication** via `@nestjs/jwt` + `passport-jwt`
- **Role-based access** (`admin`, `student`)
- **Zod validation** support (request body pipe)
- **Global config** + env validation (Zod)
- **Logging** via `nestjs-pino`
- **Payments-ready** module with provider interface + webhook raw-body support

### Modules

Implemented under `src/modules/`:

- `auth`
- `users`
- `courses`
- `orders`
- `payments`
- `promo-codes`
- `leads`
- `admin`

### Setup

- **Install**:

```bash
npm install
```

- **Env**:
  - Copy `.env.example` to `.env`
  - Set `MONGODB_URI` and `JWT_SECRET`

- **Run (dev)**:

```bash
npm run start:dev
```

API is served under the prefix **`/api`**.

### Auth endpoints

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me` (Bearer token)

### Admin health

- `GET /api/admin/health` (admin only)
