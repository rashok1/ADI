from datetime import datetime, timedelta
from fastapi import APIRouter, Depends

from ..core.security import get_current_user, CurrentUser
from ..core.supabase_client import get_supabase

router = APIRouter(prefix="/record", tags=["record"])


@router.get("/weekly")
def weekly_record(user: CurrentUser = Depends(get_current_user)):
    sb = get_supabase()
    week_ago = (datetime.utcnow() - timedelta(days=7)).isoformat()

    tasks_res = (
        sb.table("tasks")
        .select("id, completed_at")
        .eq("user_id", user.user_id)
        .eq("status", "completed")
        .gte("completed_at", week_ago)
        .execute()
    )
    sessions_res = (
        sb.table("pomodoro_sessions")
        .select("id, weeds_earned, completed, started_at")
        .eq("user_id", user.user_id)
        .gte("started_at", week_ago)
        .execute()
    )

    sessions = sessions_res.data or []
    weeds_earned = sum(s.get("weeds_earned") or 0 for s in sessions)

    return {
        "tasks_completed": len(tasks_res.data or []),
        "weeds_earned": weeds_earned,
        "sessions": sessions,
    }
