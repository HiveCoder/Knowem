import { useEffect, useState } from 'react'
import type { Socket } from 'socket.io-client'
import type { PlayedCardState } from './types'

type CardPlayedEvent = PlayedCardState & {
  roomCode: string
}

export function useCardPlaySync(socket: Socket | null, roomCode: string) {
  const [playedCard, setPlayedCard] = useState<PlayedCardState | null>(null)
  const [lastCardPlayedAt, setLastCardPlayedAt] = useState(0)

  useEffect(() => {
    if (!socket || !roomCode) {
      return
    }

    const handleCardPlayed = (payload: CardPlayedEvent) => {
      if (payload.roomCode !== roomCode) {
        return
      }

      setPlayedCard(payload)
      setLastCardPlayedAt(payload.playedAt)
    }

    socket.on('cardPlayed', handleCardPlayed)

    return () => {
      socket.off('cardPlayed', handleCardPlayed)
    }
  }, [roomCode, socket])

  const playCard = (cardType: 'primary' | 'wild') => {
    if (!socket || !roomCode) {
      return
    }

    socket.emit('card_played', {
      roomCode,
      cardType,
    })
  }

  return {
    playedCard,
    lastCardPlayedAt,
    playCard,
    setPlayedCard,
  }
}