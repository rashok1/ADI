import json
from anthropic import Anthropic
from ..core.config import get_settings

_client: Anthropic | None = None


def _get_client() -> Anthropic:
    global _client
    if _client is None:
        _client = Anthropic(api_key=get_settings().anthropic_api_key)
    return _client


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

    text = response.content[0].text.strip()
    try:
        steps = json.loads(text)
        if isinstance(steps, list) and all(isinstance(s, str) for s in steps):
            return steps[:3]
    except json.JSONDecodeError:
        pass

    # Fallback if the model doesn't return clean JSON — still usable, just less precise.
    lines = [line.strip("-• ").strip() for line in text.splitlines() if line.strip()]
    return lines[:3] if lines else [f"Spend 2 minutes starting: {task_title}"]


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
