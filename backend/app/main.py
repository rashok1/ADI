from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .core.config import get_settings
from .routers import tasks, pomodoro, mood, currency, settings as settings_router, record

settings = get_settings()

app = FastAPI(title="Adi API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(tasks.router)
app.include_router(pomodoro.router)
app.include_router(mood.router)
app.include_router(currency.router)
app.include_router(settings_router.router)
app.include_router(record.router)


@app.get("/health")
def health():
    return {"status": "ok"}
