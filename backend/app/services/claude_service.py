import json
import re
from anthropic import Anthropic
from ..core.config import get_settings

_client: Anthropic | None = None

_CODE_FENCE = re.compile(r"^```(?:json)?\s*|\s*```$", re.MULTILINE)


def _get_client() -> Anthropic:
    global _client
    if _client is None:
        _client = Anthropic(api_key=get_settings().anthropic_api_key)
    return _client


def _strip_code_fence(text: str) -> str:
    """Claude sometimes wraps JSON replies in a ```json ... ``` fence despite instructions not to."""
    return _CODE_FENCE.sub("", text).strip()


def generate_breakdown(task_title: str) -> list[str]:
    """
    "Feels too much" — ask Claude for 2-3 concrete, tiny next steps for a
    task. Kept deliberately small and literal (no motivational fluff here;
    the encouragement lives in the UI copy, not the AI's mouth).
    """
    prompt = (
        "A person with ADHD is stuck on this task and it feels too big to start:\n\n"
        f'"{task_title}"\n\n'
        "Break it into 2-3 tiny, concrete first steps. Each step should be small enough "
        "to start in under 2 minutes and require no decisions. "
        'Reply with ONLY a JSON array of strings, e.g. ["Open the document", "Write one sentence"]. '
        "No other text."
    )

    response = _get_client().messages.create(
        model="claude-haiku-4-5-20251001",
        max_tokens=200,
        messages=[{"role": "user", "content": prompt}],
    )

    text = _strip_code_fence(response.content[0].text)
    try:
        steps = json.loads(text)
        if isinstance(steps, list) and all(isinstance(s, str) for s in steps):
            return steps[:3]
    except json.JSONDecodeError:
        pass

    # Fallback if the model doesn't return clean JSON — still usable, just less precise.
    lines = [line.strip("-• ").strip() for line in text.splitlines() if line.strip()]
    return lines[:3] if lines else [f"Spend 2 minutes starting: {task_title}"]


def generate_rearrangement(mood: str, medicated: bool | None, tasks: list[dict]) -> dict:
    """
    Mood check-in triggers this: given today's mood and the user's upcoming
    tasks (this week, plus any longer-horizon ones), ask Claude to propose a
    lighter/heavier schedule and flag big tasks that should get broken down.
    Returns {"summary": str, "changes": [{"id", "scheduled_for"?, "urgency"?}],
    "breakdown_suggested_ids": [str]}. Callers apply "changes" as DB updates;
    nothing here touches the database directly.
    """
    task_lines = "\n".join(
        f'- id={t["id"]} title="{t["title"]}" urgency={t["urgency"]} '
        f'hours_needed={t.get("hours_needed")} scheduled_for={t.get("scheduled_for")} '
        f'due_date={t.get("due_date")} big_task_mode={t.get("big_task_mode")}'
        for t in tasks
    )
    medicated_note = (
        "took their medication today" if medicated is True
        else "did not take their medication today" if medicated is False
        else "didn't say whether they took medication"
    )

    prompt = (
        f"A person with ADHD just checked in feeling '{mood}' and {medicated_note}.\n\n"
        "Here are their upcoming tasks (today and the rest of this week/month):\n"
        f"{task_lines if task_lines else '(no upcoming tasks)'}\n\n"
        "Suggest a kinder schedule for the rest of the week:\n"
        "- On a 'low' mood day: move non-urgent tasks later, keep at most one "
        "high-urgency task per day, never delete anything.\n"
        "- On 'okay': light touch, small rebalancing only.\n"
        "- On 'good': it's fine to leave things mostly as-is, maybe pull a task "
        "or two earlier if the week looks front-loaded.\n"
        "- Any task with hours_needed >= 3 or big_task_mode set should be flagged "
        "for breakdown into smaller steps rather than rescheduled whole.\n"
        "Only propose scheduled_for changes within the next 30 days, never in the past.\n\n"
        "Reply with ONLY this JSON shape, no other text:\n"
        '{"summary": "one warm sentence explaining what changed and why", '
        '"changes": [{"id": "...", "scheduled_for": "YYYY-MM-DD"}], '
        '"breakdown_suggested_ids": ["..."]}'
    )

    response = _get_client().messages.create(
        model="claude-haiku-4-5-20251001",
        max_tokens=1000,
        messages=[{"role": "user", "content": prompt}],
    )

    text = _strip_code_fence(response.content[0].text)
    try:
        result = json.loads(text)
    except json.JSONDecodeError:
        return {"summary": "Mood logged — couldn't rework the schedule this time.", "changes": [], "breakdown_suggested_ids": []}

    if not isinstance(result, dict):
        return {"summary": "Mood logged — couldn't rework the schedule this time.", "changes": [], "breakdown_suggested_ids": []}

    return {
        "summary": result.get("summary") or "Mood logged.",
        "changes": result.get("changes") or [],
        "breakdown_suggested_ids": result.get("breakdown_suggested_ids") or [],
    }


def generate_reframe(task_title: str) -> str:
    """"Just 2 minutes" — a single gentle reframe sentence, not a step list."""
    prompt = (
        f'Reframe this task as something that only takes 2 minutes: "{task_title}". '
        "Reply with ONE short, warm sentence. No guilt, no exclamation points, no pep-talk clichés."
    )
    response = _get_client().messages.create(
        model="claude-haiku-4-5-20251001",
        max_tokens=80,
        messages=[{"role": "user", "content": prompt}],
    )
    return response.content[0].text.strip()
