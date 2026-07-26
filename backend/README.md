# Adi backend (FastAPI)

The gatekeeper between the React frontend, Supabase, and Claude — per the
project's system design, the frontend never talks to Supabase or Claude
directly for app data. This is the only thing that does.

## 1. Set up a virtual environment and install dependencies

```bash
cd backend
python3 -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

## 2. Environment variables

```bash
cp .env.example .env
```

Fill in:
- `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` — Supabase dashboard →
  Project Settings → API. **Service role key, not the anon key** — this
  backend intentionally bypasses RLS and enforces ownership in code (every
  query is filtered by the authenticated user's id from their JWT).
- `SUPABASE_JWT_SECRET` — same API settings page, further down. Used to
  verify the token the frontend sends.
- `ANTHROPIC_API_KEY` — console.anthropic.com → API keys. Powers the
  "feels too much" breakdown and "just 2 minutes" reframe routes.
- `FRONTEND_ORIGINS` — comma-separated list of allowed origins. Defaults to
  the Vite dev server (`http://localhost:5173`); add your Vercel URL once
  deployed.

## 3. Run it

```bash
uvicorn app.main:app --reload
```

Open `http://localhost:8000/docs` — FastAPI's auto-generated Swagger UI,
the fastest way to try every route by hand before wiring the frontend to it.

## Auth

Every route (except `/health`) requires `Authorization: Bearer <token>`,
where `<token>` is the `access_token` from the frontend's Supabase session
(`supabase.auth.getSession()`). `core/security.py` verifies it and extracts
the user id — routes then filter every query by that id, so one user can
never read or write another's data even though the service-role key itself
has no such restriction.

## Routes

| Route | What it does |
|---|---|
| `GET /tasks/today` | The one task to show right now, urgency-sorted |
| `GET /tasks/under-five` | Tasks small enough for the "Under 5" filter |
| `GET /tasks` | All of the user's tasks |
| `POST /tasks` | Create a task |
| `PATCH /tasks/{id}` | Edit a task |
| `POST /tasks/{id}/postpone` | Reschedule, `postpone_count += 1` |
| `POST /tasks/{id}/complete` | Mark done |
| `POST /tasks/{id}/breakdown` | "Feels too much" → Claude generates subtasks |
| `POST /tasks/{id}/reframe` | "Just 2 minutes" → Claude generates one reframe sentence |
| `POST /pomodoro/start` | Start a focus session |
| `POST /pomodoro/{id}/pause` | Pause it |
| `POST /pomodoro/{id}/end` | End it, award duckweed |
| `POST /mood` | Log today's mood + medication check-in |
| `GET /currency`, `GET /inventory`, `POST /shop/buy` | Duckweed + shop |
| `GET /settings`, `PATCH /settings` | User settings |
| `GET /record/weekly` | Weekly tasks-done / duckweed-earned summary |

## Connecting the frontend

The React app's `src/lib/api.js` currently calls Supabase directly (see its
top comment). To point it at this backend instead: replace each function
body with a `fetch()` call to the matching route above, sending
`Authorization: Bearer ${session.access_token}` from the Supabase session
already held in `AuthContext`. No other file in the frontend needs to
change — that's the whole reason `api.js` is the single access point.

## Deploying

Per the project's tech stack: this backend goes to Railway, the frontend to
Vercel. Railway needs the same four env vars from `.env`, plus
`FRONTEND_ORIGINS` set to the deployed Vercel URL.
