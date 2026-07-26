from datetime import date
from fastapi import APIRouter, Depends

from ..core.security import get_current_user, CurrentUser
from ..core.supabase_client import get_supabase
from ..models.schemas import MoodCheckIn

router = APIRouter(prefix="/mood", tags=["mood"])


@router.post("")
def log_mood(payload: MoodCheckIn, user: CurrentUser = Depends(get_current_user)):
    sb = get_supabase()
    today = date.today().isoformat()
    res = (
        sb.table("mood_logs")
        .upsert(
            {
                "user_id": user.user_id,
                "log_date": today,
                "mood": payload.mood,
                "medicated": payload.medicated,
            },
            on_conflict="user_id,log_date",
        )
        .execute()
    )
    return res.data[0]
