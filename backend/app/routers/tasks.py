from datetime import date
from fastapi import APIRouter, Depends, HTTPException

from ..core.security import get_current_user, CurrentUser
from ..core.supabase_client import get_supabase
from ..models.schemas import TaskCreate, TaskUpdate, PostponeRequest
from ..services.claude_service import generate_breakdown, generate_reframe

router = APIRouter(prefix="/tasks", tags=["tasks"])

URGENCY_RANK = {"high": 0, "medium": 1, "low": 2}


def _owned_task_or_404(task_id: str, user: CurrentUser) -> dict:
    sb = get_supabase()
    res = sb.table("tasks").select("*").eq("id", task_id).eq("user_id", user.user_id).maybe_single().execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Task not found")
    return res.data


@router.get("/today")
def get_today_task(user: CurrentUser = Depends(get_current_user)):
    """Surfaces exactly one task — the core 'only one task at a time' rule."""
    sb = get_supabase()
    today = date.today().isoformat()
    res = (
        sb.table("tasks")
        .select("*")
        .eq("user_id", user.user_id)
        .is_("parent_task_id", "null")
        .not_.in_("status", ["completed", "removed"])
        .lte("scheduled_for", today)
        .order("created_at")
        .execute()
    )
    tasks = res.data or []
    if not tasks:
        return None
    tasks.sort(key=lambda t: URGENCY_RANK.get(t["urgency"], 1))
    return tasks[0]


@router.get("/under-five")
def get_quick_tasks(user: CurrentUser = Depends(get_current_user)):
    """"Under 5" filter — tasks small enough to knock out in under 5 minutes."""
    sb = get_supabase()
    res = (
        sb.table("tasks")
        .select("*")
        .eq("user_id", user.user_id)
        .not_.in_("status", ["completed", "removed"])
        .lte("hours_needed", 0.08)
        .execute()
    )
    return res.data or []


@router.get("")
def list_tasks(user: CurrentUser = Depends(get_current_user)):
    sb = get_supabase()
    res = (
        sb.table("tasks")
        .select("*")
        .eq("user_id", user.user_id)
        .order("created_at", desc=True)
        .execute()
    )
    tasks = res.data or []
    tasks.sort(key=lambda t: URGENCY_RANK.get(t["urgency"], 1))
    return tasks


@router.post("")
def create_task(payload: TaskCreate, user: CurrentUser = Depends(get_current_user)):
    sb = get_supabase()
    row = payload.model_dump(mode="json", exclude_none=True)
    row["user_id"] = user.user_id
    res = sb.table("tasks").insert(row).execute()
    return res.data[0]


@router.patch("/{task_id}")
def update_task(task_id: str, payload: TaskUpdate, user: CurrentUser = Depends(get_current_user)):
    _owned_task_or_404(task_id, user)
    sb = get_supabase()
    patch = payload.model_dump(mode="json", exclude_none=True)
    res = sb.table("tasks").update(patch).eq("id", task_id).execute()
    return res.data[0]


@router.post("/{task_id}/postpone")
def postpone_task(task_id: str, payload: PostponeRequest, user: CurrentUser = Depends(get_current_user)):
    task = _owned_task_or_404(task_id, user)
    sb = get_supabase()
    res = (
        sb.table("tasks")
        .update(
            {
                "scheduled_for": payload.new_scheduled_for.isoformat(),
                "postpone_count": (task.get("postpone_count") or 0) + 1,
            }
        )
        .eq("id", task_id)
        .execute()
    )
    return res.data[0]


@router.post("/{task_id}/complete")
def complete_task(task_id: str, user: CurrentUser = Depends(get_current_user)):
    from datetime import datetime

    _owned_task_or_404(task_id, user)
    sb = get_supabase()
    res = (
        sb.table("tasks")
        .update({"status": "completed", "completed_at": datetime.utcnow().isoformat()})
        .eq("id", task_id)
        .execute()
    )
    return res.data[0]


@router.get("/{task_id}/subtasks")
def get_subtasks(task_id: str, user: CurrentUser = Depends(get_current_user)):
    _owned_task_or_404(task_id, user)
    sb = get_supabase()
    res = (
        sb.table("tasks")
        .select("*")
        .eq("parent_task_id", task_id)
        .order("created_at")
        .execute()
    )
    return res.data or []


@router.post("/{task_id}/breakdown")
def breakdown_task(task_id: str, user: CurrentUser = Depends(get_current_user)):
    """
    'Feels too much' pressed. Calls Claude for 2-3 tiny steps, saves them as
    subtask rows pointing back at the parent, and logs the interaction.
    """
    task = _owned_task_or_404(task_id, user)
    sb = get_supabase()

    steps = generate_breakdown(task["title"])

    rows = [
        {
            "user_id": user.user_id,
            "parent_task_id": task_id,
            "title": step,
            "urgency": task["urgency"],
            "scheduled_for": task.get("scheduled_for"),
        }
        for step in steps
    ]
    inserted = sb.table("tasks").insert(rows).execute().data if rows else []

    sb.table("ai_interactions").insert(
        {
            "user_id": user.user_id,
            "task_id": task_id,
            "interaction_type": "feels_too_much",
            "request_payload": {"title": task["title"]},
            "response_payload": {"steps": steps},
        }
    ).execute()

    return inserted


@router.post("/{task_id}/reframe")
def reframe_task(task_id: str, user: CurrentUser = Depends(get_current_user)):
    """'Just 2 minutes' pressed — a single reframed sentence, no new rows."""
    task = _owned_task_or_404(task_id, user)
    sb = get_supabase()

    message = generate_reframe(task["title"])

    sb.table("ai_interactions").insert(
        {
            "user_id": user.user_id,
            "task_id": task_id,
            "interaction_type": "just_two_min",
            "request_payload": {"title": task["title"]},
            "response_payload": {"message": message},
        }
    ).execute()

    return {"message": message}
