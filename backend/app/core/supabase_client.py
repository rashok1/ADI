from functools import lru_cache
from supabase import create_client, Client
from .config import get_settings


@lru_cache
def get_supabase() -> Client:
    """
    Service-role client — bypasses Row Level Security. This is safe because
    every query in this codebase is manually filtered by the authenticated
    user_id pulled from the verified JWT (see core/security.py). RLS still
    protects the database if anything ever queries it directly with the
    anon key (e.g. a future admin tool).
    """
    settings = get_settings()
    return create_client(settings.supabase_url, settings.supabase_service_role_key)
