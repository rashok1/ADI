from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException

from ..core.security import get_current_user, CurrentUser
from ..core.supabase_client import get_supabase
from ..models.schemas import PomodoroStartRequest, PomodoroEndRequest

router = APIRouter(prefix="/pomodoro", tags=["pomodoro"])


def _owned_session_or_404(session_id: str, user: CurrentUser) -> dict:
    sb = get_supabase()
    res = (
        sb.table("pomodoro_sessions")
        .select("*")
        .eq("id", session_id)
        .eq("user_id", user.user_id)
        .maybe_single()
        .execute()
    )
    if not res.data:
        raise HTTPException(status_code=404, detail="Session not found")
    return res.data


@router.post("/start")
def start_session(payload: PomodoroStartRequest, user: CurrentUser = Depends(get_current_user)):
    sb = get_supabase()
    res = (
        sb.table("pomodoro_sessions")
        .insert({"user_id": user.user_id, "task_id": payload.task_id})
        .execute()
    )
    return res.data[0]


@router.post("/{session_id}/pause")
def pause_session(session_id: str, user: CurrentUser = Depends(get_current_user)):
    _owned_session_or_404(session_id, user)
    sb = get_supabase()
    sb.table("pomodoro_sessions").update(
        {"paused_at": datetime.utcnow().isoformat()}
    ).eq("id", session_id).execute()
    return {"ok": True}


@router.post("/{session_id}/end")
def end_session(session_id: str, payload: PomodoroEndRequest, user: CurrentUser = Depends(get_current_user)):
    _owned_session_or_404(session_id, user)
    sb = get_supabase()
    sb.table("pomodoro_sessions").update(
        {
            "ended_at": datetime.utcnow().isoformat(),
            "completed": payload.completed,
            "weeds_earned": payload.weeds_earned,
        }
    ).eq("id", session_id).execute()

    if payload.weeds_earned:
        current = (
            sb.table("user_currency").select("weeds").eq("user_id", user.user_id).maybe_single().execute()
        )
        new_total = (current.data["weeds"] if current.data else 0) + payload.weeds_earned
        sb.table("user_currency").update({"weeds": new_total}).eq("user_id", user.user_id).execute()

    return {"ok": True}
