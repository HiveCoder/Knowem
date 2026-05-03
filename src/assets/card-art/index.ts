import truthFalseBack from './Back.png'
import counterFront from './Counter-Front.png'
import doubleBluffFront from './DoubleBluff-Front.png'
import echoFront from './Echo-Front.png'
import falseFront from './False-Front.png'
import forcedBluffFront from './ForcedBluff-Front.png'
import forcedTruthFront from './ForcedTruth-Front.png'
import misdirectFront from './Misdirect-Front.png'
import reverseReadFront from './ReverseRead-Front.png'
import safePassFront from './SafePass-Front.png'
import silencerFront from './Silencer-Front.png'
import spotlightFront from './Spotlight-Front.png'
import truthFront from './Truth-Front.png'
import wildBack from './Wild-Back.png'

const frontImageByTitle: Record<string, string> = {
  Truth: truthFront,
  'Truth Card': truthFront,
  False: falseFront,
  'False Card': falseFront,
  Counter: counterFront,
  'Counter Card': counterFront,
  'Double Bluff': doubleBluffFront,
  Echo: echoFront,
  'Forced Bluff': forcedBluffFront,
  'Forced Truth': forcedTruthFront,
  Misdirect: misdirectFront,
  'Reverse Read': reverseReadFront,
  'Safe Pass': safePassFront,
  Silencer: silencerFront,
  Spotlight: spotlightFront,
}

function normalize(value?: string) {
  return value?.trim() ?? ''
}

export function resolveCardFrontImage(title?: string) {
  const normalizedTitle = normalize(title)
  return frontImageByTitle[normalizedTitle] ?? null
}

export function resolveCardBackImage(options: { tone?: string; title?: string; backLabel?: string; badgeLabel?: string }) {
  const tone = normalize(options.tone).toLowerCase()
  const title = normalize(options.title).toLowerCase()
  const backLabel = normalize(options.backLabel).toLowerCase()
  const badgeLabel = normalize(options.badgeLabel).toLowerCase()

  if (tone === 'wild' || title.includes('wild') || backLabel.includes('wild') || badgeLabel.includes('wild')) {
    return wildBack
  }

  return truthFalseBack
}

export const deckBackImage = truthFalseBack