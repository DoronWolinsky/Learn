# VeloxLearn

A reading comprehension app that lets you upload texts, read them, and test your understanding with multiple-choice questions.

**Live:** [veloxlearn.com](https://veloxlearn.com)

## What it does

1. Upload a text with a title and comprehension questions (multiple choice)
2. Read the text at your own pace
3. Answer the questions and see your score

## Stack

- **Frontend:** React, TypeScript, Vite, Tailwind CSS — deployed on Vercel
- **Backend:** none — all data and auth go through Firebase (Auth + Firestore) directly from the browser

## Project Structure

```
veloxlearn/
└── frontend/   # React app (the entire project)
```

## Local Development

```bash
cd frontend
npm install
npm run dev
```

Runs on `http://localhost:5173`. No environment variables or `.env` files are needed — Firebase config is hardcoded in `frontend/firebase.config.ts` (public keys, safe to commit for Firebase web apps).
