import { useCallback, useEffect, useRef, useState } from 'react'
import {
  startPomodoroSession,
  pausePomodoroSession,
  endPomodoroSession,
  addWeeds,
  completeTask
} from '../lib/api'

const SESSION_MINUTES = 25
const TICK_MS = 260 // sped-up demo tick; swap to 1000 for a real per-second timer
const WEED_INTERVAL_MS = 1500

// Drives the whole Pomodoro state machine: welcome -> active -> resting (pause)
// -> active -> celebrate -> welcome. Talks to Supabase so sessions and
// duckweed rewards persist for real.
export function usePomodoro({ userId, taskId, onWeedsChange, onTaskComplete }) {
  const [scene, setScene] = useState('welcome') // welcome | active | resting | celebrate
  const [remaining, setRemaining] = useState(SESSION_MINUTES)
  const [duckDip, setDuckDip] = useState(false)
  const [weedSprite, setWeedSprite] = useState({ left: '-10%', opacity: 0 })

  const tickRef = useRef(null)
  const weedRef = useRef(null)
  const sessionIdRef = useRef(null)
  const weedsThisSessionRef = useRef(0)
  const completingRef = useRef(false)

  const clearTimers = useCallback(() => {
    if (tickRef.current) clearInterval(tickRef.current)
    if (weedRef.current) clearInterval(weedRef.current)
    tickRef.current = null
    weedRef.current = null
  }, [])

  const spawnWeed = useCallback(() => {
    setWeedSprite({ left: '-8%', opacity: 1 })
    setTimeout(() => setWeedSprite({ left: '48%', opacity: 1 }), 20)
    setTimeout(async () => {
      setWeedSprite({ left: '48%', opacity: 0 })
      setDuckDip(true)
      setTimeout(() => setDuckDip(false), 400)
      weedsThisSessionRef.current += 1
      const total = await addWeeds(userId, 1)
      onWeedsChange?.(total)
    }, 1600)
  }, [userId, onWeedsChange])

  const finishSession = useCallback(
    async (completed) => {
      clearTimers()
      if (sessionIdRef.current) {
        await endPomodoroSession(sessionIdRef.current, {
          completed,
          weedsEarned: weedsThisSessionRef.current
        })
      }
      if (completed && taskId) {
        await completeTask(taskId)
        onTaskComplete?.(taskId)
      }
      sessionIdRef.current = null
      weedsThisSessionRef.current = 0
    },
    [clearTimers, taskId, onTaskComplete]
  )

  // Pure: just decrements. The actual "session finished" side effects
  // (ending the session, changing scene) live in the effect below, so they
  // can't accidentally fire twice from a state-updater being re-invoked
  // (e.g. under React.StrictMode's dev-only double-invoke checks).
  const tick = useCallback(() => {
    setRemaining((prev) => Math.max(prev - 1, 0))
  }, [])

  useEffect(() => {
    if (scene !== 'active' || remaining > 0 || completingRef.current) return
    completingRef.current = true
    clearTimers()
    finishSession(true)
    setScene('celebrate')
    const celebrateTimer = setTimeout(() => {
      setScene('welcome')
      setRemaining(SESSION_MINUTES)
      completingRef.current = false
    }, 1800)
    return () => clearTimeout(celebrateTimer)
  }, [scene, remaining, clearTimers, finishSession])

  const start = useCallback(async () => {
    const session = await startPomodoroSession(userId, taskId)
    sessionIdRef.current = session.id
    weedsThisSessionRef.current = 0
    completingRef.current = false
    setScene('active')
    setRemaining(SESSION_MINUTES)
    tickRef.current = setInterval(tick, TICK_MS)
    weedRef.current = setInterval(spawnWeed, WEED_INTERVAL_MS)
  }, [userId, taskId, tick, spawnWeed])

  const pause = useCallback(async () => {
    clearTimers()
    if (sessionIdRef.current) await pausePomodoroSession(sessionIdRef.current)
    setScene('resting')
  }, [clearTimers])

  const resume = useCallback(() => {
    setScene('active')
    tickRef.current = setInterval(tick, TICK_MS)
    weedRef.current = setInterval(spawnWeed, WEED_INTERVAL_MS)
  }, [tick, spawnWeed])

  const stop = useCallback(async () => {
    await finishSession(false)
    setScene('welcome')
    setRemaining(SESSION_MINUTES)
  }, [finishSession])

  useEffect(() => clearTimers, [clearTimers])

  return { scene, remaining, duckDip, weedSprite, start, pause, resume, stop }
}
