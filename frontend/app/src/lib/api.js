// Data access layer. Every Supabase call in the app goes through here.
//
// NOTE on architecture: the project's system design says the React frontend
// should never talk to Supabase directly for app data — it should call a
// FastAPI backend, which is the only thing that talks to Supabase and Claude.
// FastAPI isn't built yet, so these functions call Supabase directly for now
// to get a working, testable app end to end. When FastAPI exists, swap the
// bodies of these functions to `fetch('/api/...')` calls — nothing outside
// this file should need to change.

import { supabase } from './supabaseClient'

// ---------- tasks ----------

const URGENCY_RANK = { high: 0, medium: 1, low: 2 }

// Local calendar date (YYYY-MM-DD), not UTC — new Date().toISOString()
// shifts to tomorrow's date in the evening for anyone west of UTC.
export function todayLocal() {
  const d = new Date()
  const offset = d.getTimezoneOffset() * 60000
  return new Date(d.getTime() - offset).toISOString().slice(0, 10)
}

// Surfaces exactly one task — the core "only one task at a time" rule.
// Sorted client-side because Postgres would order urgency alphabetically
// (high, low, medium) rather than by actual priority.
export async function getTodayTask(userId) {
  const today = todayLocal()
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', userId)
    .is('parent_task_id', null)
    .neq('status', 'completed')
    .neq('status', 'removed')
    .lte('scheduled_for', today)
    .order('created_at', { ascending: true })

  if (error) throw error
  if (!data || data.length === 0) return null

  return data.sort((a, b) => URGENCY_RANK[a.urgency] - URGENCY_RANK[b.urgency])[0]
}

export async function listTasks(userId) {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []).sort((a, b) => URGENCY_RANK[a.urgency] - URGENCY_RANK[b.urgency])
}

export async function createTask(userId, payload) {
  const { data, error } = await supabase
    .from('tasks')
    .insert({ user_id: userId, ...payload })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateTask(taskId, patch) {
  const { data, error } = await supabase
    .from('tasks')
    .update(patch)
    .eq('id', taskId)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function postponeTask(taskId, newScheduledFor) {
  const { data: current, error: fetchErr } = await supabase
    .from('tasks')
    .select('postpone_count')
    .eq('id', taskId)
    .single()
  if (fetchErr) throw fetchErr

  return updateTask(taskId, {
    scheduled_for: newScheduledFor,
    postpone_count: (current?.postpone_count ?? 0) + 1
  })
}

export async function completeTask(taskId) {
  return updateTask(taskId, { status: 'completed', completed_at: new Date().toISOString() })
}

// "Feels too much" — breaks a task into subtasks. Until the Claude API route
// exists on FastAPI, the caller supplies the step titles (e.g. from a small
// form); this just persists them as rows pointing back at the parent.
export async function createSubtasks(parentTask, stepTitles) {
  const rows = stepTitles
    .filter((t) => t.trim().length > 0)
    .map((title) => ({
      user_id: parentTask.user_id,
      parent_task_id: parentTask.id,
      title: title.trim(),
      urgency: parentTask.urgency,
      scheduled_for: parentTask.scheduled_for
    }))
  if (rows.length === 0) return []
  const { data, error } = await supabase.from('tasks').insert(rows).select()
  if (error) throw error
  return data
}

export async function getSubtasks(parentTaskId) {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('parent_task_id', parentTaskId)
    .order('created_at', { ascending: true })
  if (error) throw error
  return data
}

// ---------- mood ----------

export async function logMood(userId, mood, medicated) {
  const today = todayLocal()
  const { data, error } = await supabase
    .from('mood_logs')
    .upsert(
      { user_id: userId, log_date: today, mood, medicated },
      { onConflict: 'user_id,log_date' }
    )
    .select()
    .single()
  if (error) throw error
  return data
}

// ---------- pomodoro sessions ----------

export async function startPomodoroSession(userId, taskId) {
  const { data, error } = await supabase
    .from('pomodoro_sessions')
    .insert({ user_id: userId, task_id: taskId })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function pausePomodoroSession(sessionId) {
  const { error } = await supabase
    .from('pomodoro_sessions')
    .update({ paused_at: new Date().toISOString() })
    .eq('id', sessionId)
  if (error) throw error
}

export async function endPomodoroSession(sessionId, { completed, weedsEarned }) {
  const { error } = await supabase
    .from('pomodoro_sessions')
    .update({
      ended_at: new Date().toISOString(),
      completed,
      weeds_earned: weedsEarned
    })
    .eq('id', sessionId)
  if (error) throw error
}

// ---------- currency + shop ----------

export async function getCurrency(userId) {
  const { data, error } = await supabase
    .from('user_currency')
    .select('weeds')
    .eq('user_id', userId)
    .maybeSingle()
  if (error) throw error
  return data?.weeds ?? 0
}

export async function addWeeds(userId, amount) {
  const current = await getCurrency(userId)
  const { data, error } = await supabase
    .from('user_currency')
    .update({ weeds: current + amount, updated_at: new Date().toISOString() })
    .eq('user_id', userId)
    .select('weeds')
    .single()
  if (error) throw error
  return data.weeds
}

export async function getInventory(userId) {
  const { data, error } = await supabase
    .from('user_inventory')
    .select('item_key')
    .eq('user_id', userId)
  if (error) throw error
  return (data ?? []).map((r) => r.item_key)
}

export async function buyItem(userId, itemKey, cost) {
  const current = await getCurrency(userId)
  if (current < cost) throw new Error('Not enough duckweed')

  const { error: insertErr } = await supabase
    .from('user_inventory')
    .insert({ user_id: userId, item_key: itemKey })
  if (insertErr) throw insertErr

  return addWeeds(userId, -cost)
}

// ---------- settings ----------

export async function getSettings(userId) {
  const { data, error } = await supabase
    .from('user_settings')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()
  if (error) throw error
  return data
}

export async function updateSettings(userId, patch) {
  const { data, error } = await supabase
    .from('user_settings')
    .update(patch)
    .eq('user_id', userId)
    .select()
    .single()
  if (error) throw error
  return data
}

// ---------- weekly record ----------

export async function getWeeklyRecord(userId) {
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

  const [{ data: completedTasks, error: taskErr }, { data: sessions, error: sessionErr }] =
    await Promise.all([
      supabase
        .from('tasks')
        .select('id, completed_at')
        .eq('user_id', userId)
        .eq('status', 'completed')
        .gte('completed_at', weekAgo),
      supabase
        .from('pomodoro_sessions')
        .select('id, weeds_earned, completed, started_at')
        .eq('user_id', userId)
        .gte('started_at', weekAgo)
    ])

  if (taskErr) throw taskErr
  if (sessionErr) throw sessionErr

  const weedsEarned = (sessions ?? []).reduce((sum, s) => sum + (s.weeds_earned || 0), 0)

  return {
    tasksCompleted: completedTasks?.length ?? 0,
    weedsEarned,
    sessions: sessions ?? []
  }
}
