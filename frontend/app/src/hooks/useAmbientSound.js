import { useCallback, useRef, useState } from 'react'

// Generates white noise / water / fire ambience with the Web Audio API —
// no audio files needed, works fully offline.
export function useAmbientSound() {
  const [active, setActive] = useState('off')
  const ctxRef = useRef(null)
  const sourceRef = useRef(null)
  const extraNodesRef = useRef([])

  const ensureCtx = () => {
    if (!ctxRef.current) {
      ctxRef.current = new (window.AudioContext || window.webkitAudioContext)()
    }
    return ctxRef.current
  }

  const makeNoiseBuffer = (ctx) => {
    const size = 2 * ctx.sampleRate
    const buffer = ctx.createBuffer(1, size, ctx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < size; i++) data[i] = Math.random() * 2 - 1
    return buffer
  }

  const stop = useCallback(() => {
    if (sourceRef.current) {
      try {
        sourceRef.current.stop()
      } catch {
        // already stopped
      }
      sourceRef.current = null
    }
    extraNodesRef.current.forEach((n) => {
      try {
        n.stop()
      } catch {
        // already stopped
      }
    })
    extraNodesRef.current = []
  }, [])

  const play = useCallback(
    (type) => {
      stop()
      if (type === 'off') {
        setActive('off')
        return
      }
      const ctx = ensureCtx()
      const src = ctx.createBufferSource()
      src.buffer = makeNoiseBuffer(ctx)
      src.loop = true
      const gain = ctx.createGain()

      if (type === 'white') {
        gain.gain.value = 0.05
        src.connect(gain)
      } else if (type === 'water') {
        const filter = ctx.createBiquadFilter()
        filter.type = 'bandpass'
        filter.frequency.value = 700
        filter.Q.value = 0.5
        const lfo = ctx.createOscillator()
        lfo.frequency.value = 0.3
        const lfoGain = ctx.createGain()
        lfoGain.gain.value = 250
        lfo.connect(lfoGain)
        lfoGain.connect(filter.frequency)
        lfo.start()
        extraNodesRef.current.push(lfo)
        gain.gain.value = 0.08
        src.connect(filter)
        filter.connect(gain)
      } else if (type === 'fire') {
        const filter = ctx.createBiquadFilter()
        filter.type = 'lowpass'
        filter.frequency.value = 350
        gain.gain.value = 0.09
        src.connect(filter)
        filter.connect(gain)
      }

      gain.connect(ctx.destination)
      src.start()
      sourceRef.current = src
      setActive(type)
    },
    [stop]
  )

  const toggle = useCallback(
    (type) => {
      if (active === type) {
        stop()
        setActive('off')
      } else {
        play(type)
      }
    },
    [active, play, stop]
  )

  return { active, toggle }
}
