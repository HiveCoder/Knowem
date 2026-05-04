export type SoundCue =
  | 'shuffle'
  | 'deal'
  | 'card-commit'
  | 'card-reveal'
  | 'wild-reveal'
  | 'results-open'
  | 'next-round'

type ToneSpec = {
  frequency: number
  durationMs: number
  gain: number
  type?: OscillatorType
  delayMs?: number
}

type SoundEventDetail = {
  name: SoundCue
}

let audioContext: AudioContext | null = null

function getAudioContext() {
  if (typeof window === 'undefined') {
    return null
  }

  if (!audioContext) {
    const AudioContextCtor = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!AudioContextCtor) {
      return null
    }
    audioContext = new AudioContextCtor()
  }

  return audioContext
}

function cueSequence(name: SoundCue): ToneSpec[] {
  switch (name) {
    case 'shuffle':
      return [
        { frequency: 180, durationMs: 70, gain: 0.022, type: 'triangle' },
        { frequency: 220, durationMs: 60, gain: 0.02, type: 'triangle', delayMs: 35 },
        { frequency: 160, durationMs: 55, gain: 0.018, type: 'triangle', delayMs: 78 },
      ]
    case 'deal':
      return [{ frequency: 470, durationMs: 42, gain: 0.018, type: 'square' }]
    case 'card-commit':
      return [
        { frequency: 320, durationMs: 52, gain: 0.02, type: 'triangle' },
        { frequency: 420, durationMs: 44, gain: 0.015, type: 'sine', delayMs: 42 },
      ]
    case 'card-reveal':
      return [
        { frequency: 460, durationMs: 64, gain: 0.022, type: 'triangle' },
        { frequency: 610, durationMs: 72, gain: 0.018, type: 'sine', delayMs: 48 },
      ]
    case 'wild-reveal':
      return [
        { frequency: 420, durationMs: 58, gain: 0.024, type: 'sawtooth' },
        { frequency: 620, durationMs: 86, gain: 0.024, type: 'triangle', delayMs: 36 },
        { frequency: 780, durationMs: 120, gain: 0.018, type: 'sine', delayMs: 90 },
      ]
    case 'results-open':
      return [
        { frequency: 280, durationMs: 90, gain: 0.018, type: 'triangle' },
        { frequency: 352, durationMs: 96, gain: 0.018, type: 'triangle', delayMs: 74 },
        { frequency: 470, durationMs: 110, gain: 0.016, type: 'sine', delayMs: 148 },
      ]
    case 'next-round':
      return [
        { frequency: 360, durationMs: 56, gain: 0.02, type: 'triangle' },
        { frequency: 540, durationMs: 62, gain: 0.018, type: 'triangle', delayMs: 46 },
      ]
  }
}

export function emitSound(name: SoundCue) {
  if (typeof window === 'undefined') {
    return
  }

  window.dispatchEvent(new CustomEvent<SoundEventDetail>('knowem:sound', { detail: { name } }))
}

export async function playSoundCue(name: SoundCue) {
  const context = getAudioContext()
  if (!context) {
    return
  }

  if (context.state === 'suspended') {
    try {
      await context.resume()
    } catch {
      return
    }
  }

  const startAt = context.currentTime
  for (const tone of cueSequence(name)) {
    const oscillator = context.createOscillator()
    const gainNode = context.createGain()
    const toneStartAt = startAt + (tone.delayMs ?? 0) / 1000
    const toneDuration = tone.durationMs / 1000

    oscillator.type = tone.type ?? 'sine'
    oscillator.frequency.setValueAtTime(tone.frequency, toneStartAt)

    gainNode.gain.setValueAtTime(0.0001, toneStartAt)
    gainNode.gain.exponentialRampToValueAtTime(tone.gain, toneStartAt + 0.012)
    gainNode.gain.exponentialRampToValueAtTime(0.0001, toneStartAt + toneDuration)

    oscillator.connect(gainNode)
    gainNode.connect(context.destination)

    oscillator.start(toneStartAt)
    oscillator.stop(toneStartAt + toneDuration + 0.02)
  }
}