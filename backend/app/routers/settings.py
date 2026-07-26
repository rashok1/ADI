from fastapi import APIRouter, Depends

from ..core.security import get_current_user, CurrentUser
from ..core.supabase_client import get_supabase
from ..models.schemas import SettingsUpdate

router = APIRouter(prefix="/settings", tags=["settings"])


@router.get("")
def get_settings_row(user: CurrentUser = Depends(get_current_user)):
    sb = get_supabase()
    res = sb.table("user_settings").select("*").eq("user_id", user.user_id).maybe_single().execute()
    return res.data


@router.patch("")
def update_settings_row(payload: SettingsUpdate, user: CurrentUser = Depends(get_current_user)):
    sb = get_supabase()
    patch = payload.model_dump(exclude_none=True)
    res = sb.table("user_settings").update(patch).eq("user_id", user.user_id).execute()
    return res.data[0]
