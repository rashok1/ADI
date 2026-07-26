from datetime import date, datetime
from typing import Literal, Optional
from pydantic import BaseModel

Urgency = Literal["high", "medium", "low"]
TaskStatus = Literal["pending", "in_progress", "completed", "removed"]
BigTaskMode = Literal["single_session", "spread_week"]
Mood = Literal["low", "okay", "good"]
ItemKey = Literal["house", "hat", "scarf", "garden"]


class TaskCreate(BaseModel):
    title: str
    urgency: Urgency = "medium"
    hours_needed: Optional[float] = None
    scheduled_for: Optional[date] = None
    due_date: Optional[date] = None
    big_task_mode: Optional[BigTaskMode] = None


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    urgency: Optional[Urgency] = None
    hours_needed: Optional[float] = None
    scheduled_for: Optional[date] = None
    due_date: Optional[date] = None
    status: Optional[TaskStatus] = None
    big_task_mode: Optional[BigTaskMode] = None


class TaskOut(BaseModel):
    id: str
    user_id: str
    parent_task_id: Optional[str] = None
    title: str
    urgency: Urgency
    hours_needed: Optional[float] = None
    scheduled_for: Optional[date] = None
    due_date: Optional[date] = None
    status: TaskStatus
    postpone_count: int
    big_task_mode: Optional[BigTaskMode] = None
    completed_at: Optional[datetime] = None
    created_at: datetime


class PostponeRequest(BaseModel):
    new_scheduled_for: date


class BreakdownRequest(BaseModel):
    pass


class MoodCheckIn(BaseModel):
    mood: Mood
    medicated: Optional[bool] = None


class RearrangeChange(BaseModel):
    id: str
    scheduled_for: Optional[date] = None
    urgency: Optional[Urgency] = None


class RearrangeResponse(BaseModel):
    summary: str
    changed_task_ids: list[str]
    breakdown_suggested_ids: list[str]


class PomodoroStartRequest(BaseModel):
    task_id: Optional[str] = None


class PomodoroEndRequest(BaseModel):
    completed: bool
    weeds_earned: int = 0


class SettingsUpdate(BaseModel):
    medicated: Optional[bool] = None
    light_day_default: Optional[bool] = None


class BuyItemRequest(BaseModel):
    item_key: ItemKey
    cost: int
