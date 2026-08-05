# VeloxLearn — Frontend

React + TypeScript + Vite frontend for VeloxLearn. This is a frontend-only app — there is no backend server. All data and auth go through Firebase directly from the browser.

## Development

```bash
npm install
npm run dev
```

Runs on `http://localhost:5173`. No environment variables needed — Firebase config is hardcoded in `firebase.config.ts` (public keys, safe to commit for Firebase web apps).

## Build

```bash
npm run build
```
