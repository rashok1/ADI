from datetime import date, timedelta
from fastapi import APIRouter, Depends

from ..core.security import get_current_user, CurrentUser
from ..core.supabase_client import get_supabase
from ..models.schemas import MoodCheckIn, RearrangeResponse
from ..services.claude_service import generate_rearrangement

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


@router.post("/rearrange", response_model=RearrangeResponse)
def rearrange_week(payload: MoodCheckIn, user: CurrentUser = Depends(get_current_user)):
    """
    Called right after a mood check-in. Pulls the user's upcoming top-level
    tasks, asks Claude for a kinder schedule given how they're feeling today,
    and applies whatever reschedules it proposes.
    """
    sb = get_supabase()
    today = date.today().isoformat()
    horizon = (date.today() + timedelta(days=30)).isoformat()

    tasks_res = (
        sb.table("tasks")
        .select("id, title, urgency, hours_needed, scheduled_for, due_date, big_task_mode")
        .eq("user_id", user.user_id)
        .is_("parent_task_id", "null")
        .not_.in_("status", ["completed", "removed"])
        .gte("scheduled_for", today)
        .lte("scheduled_for", horizon)
        .execute()
    )
    tasks = tasks_res.data or []

    result = generate_rearrangement(payload.mood, payload.medicated, tasks)

    changed_ids = []
    for change in result["changes"]:
        task_id = change.get("id")
        if not task_id:
            continue
        patch = {k: v for k, v in change.items() if k != "id" and v is not None}
        if not patch:
            continue
        updated = (
            sb.table("tasks")
            .update(patch)
            .eq("id", task_id)
            .eq("user_id", user.user_id)
            .execute()
        )
        if updated.data:
            changed_ids.append(task_id)

    sb.table("ai_interactions").insert(
        {
            "user_id": user.user_id,
            "interaction_type": "mood_rearrange",
            "request_payload": {"mood": payload.mood, "medicated": payload.medicated, "task_count": len(tasks)},
            "response_payload": result,
        }
    ).execute()

    return RearrangeResponse(
        summary=result["summary"],
        changed_task_ids=changed_ids,
        breakdown_suggested_ids=result["breakdown_suggested_ids"],
    )
