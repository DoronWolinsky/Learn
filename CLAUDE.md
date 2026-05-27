# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Backend (`cd backend`)
```bash
npm run dev          # Start dev server with hot reload (tsx watch)
npm run build        # Compile TypeScript to dist/
npm start            # Run compiled output (production)
npm run db:migrate   # Run Prisma migrations (requires DIRECT_URL)
npm run db:generate  # Regenerate Prisma client after schema changes
npm run db:studio    # Open Prisma Studio GUI
```

### Frontend (`cd frontend`)
```bash
npm run dev     # Start Vite dev server at localhost:5173
npm run build   # Type-check + Vite production build
npm run lint    # ESLint
npm run preview # Preview production build locally
```

There are no tests in this project.

## Environment Variables

### Backend (`.env`)
| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL pooler connection string (Supabase) |
| `DIRECT_URL` | Direct PostgreSQL connection string (used by Prisma migrations only) |
| `API_KEY` | Secret key required in `x-api-key` header to upload texts |
| `JWT_SECRET` | Minimum 32 characters; signs user session tokens (30d expiry) |
| `RESEND_API_KEY` | Resend API key for sending verification emails |
| `FRONTEND_URL` | Allowed CORS origin (defaults to `http://localhost:5173`) |

The backend validates all env vars at startup via a Zod schema in `src/config/env.ts` and exits immediately if any are missing or invalid.

### Frontend
| Variable | Description |
|---|---|
| `VITE_API_URL` | Backend base URL (defaults to `http://localhost:3000/api`) |

## Architecture

### Backend — layered: routes → controllers → services → Prisma

- `src/app.ts` — Express setup, CORS, route mounting
- `src/index.ts` — server listen entry point
- `src/routes/` — defines route paths and which middleware to apply
- `src/controllers/` — parses/validates request, calls service, sends response
- `src/services/` — all business logic and Prisma queries
- `src/schemas/` — Zod schemas used for request validation in controllers
- `src/middleware/apiKey.ts` — guards text upload (`x-api-key` header)
- `src/middleware/requireAuth.ts` — guards user-facing routes (JWT Bearer token, attaches `req.user`)
- `src/lib/prisma.ts` — singleton Prisma client
- `src/lib/email.ts` — Resend email sending (email verification)
- `src/types/express.d.ts` — extends `Request` with `user` property

### API Routes
- `GET/POST /api/texts` — list texts (auth required) / create text (API key required)
- `GET /api/texts/:id` — get single text with questions and answers (auth required)
- `POST /api/auth/register` — create account + send verification email
- `POST /api/auth/login` — returns JWT + user object
- `GET /api/auth/me` — returns current user (auth required)
- `GET /api/auth/verify-email?token=...` — verifies email address

### Database Schema (Prisma / PostgreSQL on Supabase)
- `User` — id (cuid), email, passwordHash, name, role (enum), emailVerified, verificationToken
- `Text` — id (cuid), title, body, direction (ltr/rtl), wordCount, createdAt
- `Question` — belongs to Text (cascade delete)
- `Answer` — belongs to Question (cascade delete), has `isCorrect` flag
- `Role` enum: `PRIVATE | STUDENT | TEACHER | SCHOOL_ADMIN | SUPER_ADMIN`

### Frontend — React + React Router + Context

- `src/api/client.ts` — central fetch wrapper; reads JWT from `localStorage`, sets `Authorization: Bearer` header automatically
- `src/api/auth.ts` / `src/api/texts.ts` — typed wrappers around `apiClient`
- `src/context/AuthContext.tsx` — bootstraps auth state on mount by calling `/api/auth/me` with the stored token; exposes `user`, `loading`, `login(token, user)`, `logout()`
- `src/context/ThemeContext.tsx` — theme state
- `src/components/ProtectedRoute.tsx` — exports both `ProtectedRoute` (redirects to `/login` if unauthenticated) and `PublicOnlyRoute` (redirects to `/` if already authenticated)

### Reading flow (page sequence)
`HomePage` (pick text) → `SetupPage` (configure session) → `ReaderPage` (read text) → `ComprehensionPage` (answer questions) → `ResultPage` (score)

`UploadPage` is separate — for admins to upload new texts (sends `x-api-key` header).

## Deployment
- Frontend: Vercel
- Backend: Render
- Database: PostgreSQL on Supabase (pooler URL for runtime, direct URL for migrations)
