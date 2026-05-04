import { useEffect, useState } from 'react'
import { Card } from './Card'
import type { HandCardItem } from './types'

type PlayerHandProps = {
  cards: HandCardItem[]
  flipKey?: string | number
  compact?: boolean
  emptyLabel?: string
  onCardClick?: (card: HandCardItem & { isFlipped: boolean }) => void
}

export function PlayerHand({ cards, flipKey, compact = false, emptyLabel = 'No cards', onCardClick }: PlayerHandProps) {
  const [localFlipState, setLocalFlipState] = useState<Record<string, boolean>>({})

  useEffect(() => {
    setLocalFlipState({})
  }, [flipKey, cards.map((card) => card.id).join('|')])

  if (!cards.length) {
    return (
      <div className="flex min-h-28 items-center justify-center rounded-[24px] border border-dashed border-white/10 bg-white/[0.03] px-4 text-sm text-slate-400">
        {emptyLabel}
      </div>
    )
  }

  const resolveFlipped = (card: HandCardItem) => localFlipState[card.id] ?? card.isFlipped ?? card.revealed

  const handleCardClick = (card: HandCardItem) => {
    if (!card.playable) {
      return
    }

    const nextFlipped = !resolveFlipped(card)
    setLocalFlipState((current) => ({
      ...current,
      [card.id]: nextFlipped,
    }))
    onCardClick?.({
      ...card,
      isFlipped: nextFlipped,
    })
  }

  return (
    <div className={[compact ? 'min-h-24 max-w-[320px]' : 'min-h-36 max-w-[560px]', 'mx-auto w-full'].join(' ')}>
      <div className="flex items-end justify-center gap-0">
        {cards.map((card, index) => (
          <div
            key={card.id}
            className={card.playable ? 'touch-manipulation transition-transform duration-200 hover:-translate-y-1' : ''}
            style={{ marginLeft: index === 0 ? 0 : compact ? '-1rem' : '-1.5rem', zIndex: index + 1 }}
          >
            <Card
              title={card.title}
              subtitle={card.subtitle}
              tone={card.tone}
              isFlipped={resolveFlipped(card)}
              isWild={card.isWild}
              isPlayed={card.isPlayed}
              interactive={card.playable}
              playAnimationKey={card.playAnimationKey}
              backLabel={card.backLabel}
              badgeLabel={card.badgeLabel}
              onActivate={() => handleCardClick(card)}
            />
          </div>
        ))}
      </div>
    </div>
  )
}