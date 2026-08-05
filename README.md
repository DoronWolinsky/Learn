# VeloxLearn

A speed-reading trainer with built-in comprehension checks. Upload a text, read it at a configurable pace with a word-by-word reveal, then answer multiple-choice questions to test what you retained.

**Live:** [veloxlearn.com](https://veloxlearn.com)

## What it does

- **Speed-reading sessions** — text is streamed a few words at a time at a target words-per-minute pace, with everything outside the active window blurred out, so you train reading speed instead of skimming
- **Comprehension check** — after each session, answer a short multiple-choice quiz on the text and see your score
- **Progress tracking** — registered users get their scores saved per text, so previously-read texts show at a glance whether you passed
- **Roles** — every registered account is Individual, Teacher, and/or Student (you can be more than one, e.g. Teacher and Student, but not the same role twice), chosen once at sign-up
  - **Teachers** can upload texts (public, private, or shared with specific people), add students by email, assign a text to a student with custom reading settings (speed, chunk size, blur), and see each student's results
  - **Students** see texts assigned to them by their teacher(s), pre-filled with the settings the teacher chose
  - **Anonymous visitors** can read and take the quiz on any public text without signing in, with progress kept locally in the browser

## Stack

- **Frontend:** React, TypeScript, Vite, Tailwind CSS — deployed on Vercel
- **Backend:** none — this is a frontend-only app; all data and auth go through Firebase (Auth + Firestore) directly from the browser
- **Database:** Firestore, secured with a versioned `firestore.rules` (deployed via the Firebase CLI, not the console)

## Project Structure

```
veloxlearn/
├── frontend/          # React app (the entire client)
├── firestore.rules    # Firestore security rules
├── firebase.json       # Firebase CLI config (rules + indexes)
└── .firebaserc         # Firebase project alias
```

## Local Development

```bash
cd frontend
npm install
npm run dev
```

Runs on `http://localhost:5173`. No environment variables or `.env` files are needed — Firebase config is hardcoded in `frontend/firebase.config.ts` (public keys, safe to commit for Firebase web apps).

There are no automated tests in this project.
