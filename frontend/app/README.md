# Adi frontend (React)

The real React build of Adi — replaces the HTML prototypes in
`frontend/prototypes/` with actual components, routing, and a live
Supabase connection. Built with Vite + React + Tailwind + React Router.

## 1. Install dependencies

```bash
cd frontend/app
npm install
```

## 2. Set up Supabase

1. In your Supabase project, open **SQL Editor → New query**, paste the
   contents of `supabase/schema.sql`, and run it. This creates every table
   (`tasks`, `user_settings`, `mood_logs`, `pomodoro_sessions`,
   `ai_interactions`, `user_currency`, `user_inventory`), turns on Row Level
   Security so users can only see their own rows, and adds a trigger that
   creates a `user_settings` + `user_currency` row automatically when
   someone signs up.
2. In **Project settings → API**, copy your Project URL and anon public key.
3. Copy `.env.example` to `.env` and fill in those two values:

```bash
cp .env.example .env
```

## 3. Run it

```bash
npm run dev
```

Opens at `http://localhost:5173`. Sign up with any email/password (Supabase
Auth handles this) — the trigger creates your settings/currency rows, then
you land on the Home tab. Add a task, and it'll surface as the one task of
the day, ready to start a focus session on.

## Architecture notes

- **`src/lib/api.js`** is the only file that talks to Supabase. Every page
  and hook goes through it. This matters because the project's system
  design (see the project doc) has the frontend calling a FastAPI backend
  for everything, never Supabase directly — FastAPI is the single gatekeeper
  to Supabase and the Claude API. FastAPI doesn't exist yet, so `api.js`
  calls Supabase directly for now to get a working app end to end. When
  FastAPI is built, swap the *bodies* of the functions in `api.js` to
  `fetch('/api/...')` calls — nothing in the pages or hooks needs to change.
- **`src/hooks/usePomodoro.js`** owns the whole focus-session state machine
  (welcome → active → resting → celebrate) and persists sessions to
  `pomodoro_sessions`, awarding duckweed via `user_currency` on completion.
- **`src/hooks/useAmbientSound.js`** generates white noise / water / fire
  ambience with the Web Audio API — no audio files, works offline.
- **`src/components/PomodoroScene.jsx`** renders the four pond illustrations
  (matching the HTML prototype) purely off the `variant` prop from the hook.
- **`"feels too much"` breakdown** currently lets you type the small steps
  yourself (`BreakdownPage.jsx`, `createSubtasks` in `api.js`). Once FastAPI
  + Claude exist, replace the manual form with a call to
  `POST /tasks/breakdown` that returns 2–3 AI-generated steps.

## What's next

- Build the FastAPI backend (auth verification, task routes, the Claude
  "feels too much" / "just 2 min" routes) and swap `api.js` over to it.
- Add Slack + Calendar integration (Phase 2).
- Deploy: this app to Vercel, FastAPI to Railway, per the project's tech
  stack doc.
