from fastapi import APIRouter, Depends, HTTPException

from ..core.security import get_current_user, CurrentUser
from ..core.supabase_client import get_supabase
from ..models.schemas import BuyItemRequest

router = APIRouter(tags=["currency"])


@router.get("/currency")
def get_currency(user: CurrentUser = Depends(get_current_user)):
    sb = get_supabase()
    res = sb.table("user_currency").select("weeds").eq("user_id", user.user_id).maybe_single().execute()
    return {"weeds": res.data["weeds"] if res.data else 0}


@router.get("/inventory")
def get_inventory(user: CurrentUser = Depends(get_current_user)):
    sb = get_supabase()
    res = sb.table("user_inventory").select("item_key").eq("user_id", user.user_id).execute()
    return [row["item_key"] for row in (res.data or [])]


@router.post("/shop/buy")
def buy_item(payload: BuyItemRequest, user: CurrentUser = Depends(get_current_user)):
    sb = get_supabase()

    current = sb.table("user_currency").select("weeds").eq("user_id", user.user_id).maybe_single().execute()
    balance = current.data["weeds"] if current.data else 0
    if balance < payload.cost:
        raise HTTPException(status_code=400, detail="Not enough duckweed")

    owned = (
        sb.table("user_inventory")
        .select("item_key")
        .eq("user_id", user.user_id)
        .eq("item_key", payload.item_key)
        .maybe_single()
        .execute()
    )
    if owned.data:
        raise HTTPException(status_code=400, detail="Already owned")

    sb.table("user_inventory").insert({"user_id": user.user_id, "item_key": payload.item_key}).execute()
    new_balance = balance - payload.cost
    sb.table("user_currency").update({"weeds": new_balance}).eq("user_id", user.user_id).execute()

    return {"weeds": new_balance}
