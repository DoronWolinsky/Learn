# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Frontend (`cd frontend`)
```bash
npm run dev     # Start Vite dev server at localhost:5173
npm run build   # Type-check + Vite production build
npm run lint    # ESLint
npm run preview # Preview production build locally
```

There are no tests in this project.

## Environment

No `.env` files needed. Firebase config is hardcoded in `frontend/firebase.config.ts` (public keys — safe to commit for Firebase web apps).

## Architecture

This is a **frontend-only** React app. There is no backend server. All data and auth go through Firebase directly from the browser.

### Firebase services in use
- **Firebase Auth** — anonymous sign-in on first visit; Google sign-in to become a registered user
- **Firestore** — stores all app data (texts, user profiles)
- **Firebase Hosting** — serves the frontend (planned)
- **Cloud Functions** — planned for AI question generation and answer grading

### Frontend structure

- `firebase.config.ts` — initializes Firebase, exports `auth`, `db`, `googleProvider`
- `src/api/texts.ts` — all Firestore reads/writes for texts (list, get, upload)
- `src/context/AuthContext.tsx` — auth state; bootstraps anonymous user on first load, creates Firestore user doc on Google sign-in; exposes `user`, `loading`, `logout`
- `src/context/ThemeContext.tsx` — theme state
- `src/components/ProtectedRoute.tsx` — exports `RegisteredRoute` (blocks anonymous users, redirects to `/login`) and `PublicOnlyRoute` (redirects registered users away from `/login`)

### Auth tiers
- **Anonymous** — automatically signed in on first visit; can browse and read all public texts
- **Registered (Google)** — can also upload texts to the public `texts/` collection

### Firestore data model
```
texts/                        ← public texts collection
  {textId}/
    title, body, direction, wordCount, createdAt
    questions: [              ← embedded array
      { body, answers: [{ body, isCorrect }] }
    ]

users/                        ← registered users only (no anonymous docs)
  {uid}/
    name, email, isAnonymous, createdAt
```

### Reading flow (page sequence)
`HomePage` → `SetupPage` (pick text + configure session) → `ReaderPage` → `ComprehensionPage` → `ResultPage`

`UploadPage` is behind `RegisteredRoute` — registered users add texts to the public `texts/` collection.

## Deployment
- Frontend: Firebase Hosting (planned; currently on Vercel at veloxlearn.com)
- Database: Firestore (Firebase project: `veloxlearn`)
- No backend to deploy
