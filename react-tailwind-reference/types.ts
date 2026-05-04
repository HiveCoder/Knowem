export type CardTone = 'truth' | 'false' | 'wild' | 'question' | 'neutral'
export type PlayedCardType = 'primary' | 'wild'

export interface PlayedCardState {
  id: string
  playerId: string
  username: string
  cardType: PlayedCardType
  isWild: boolean
  title: string
  subtitle?: string
  tone: CardTone
  playedAt: number
}

export interface HandCardItem {
  id: string
  title: string
  subtitle?: string
  tone: CardTone
  revealed: boolean
  isFlipped?: boolean
  isWild?: boolean
  isPlayed?: boolean
  playable?: boolean
  cardType?: PlayedCardType
  playAnimationKey?: string | number
  backLabel?: string
  badgeLabel?: string
}

export interface PublicPlayer {
  id: string
  username: string
  connected: boolean
  isAdjudicator: boolean
  hasAnswered: boolean
  score: number
}

export interface PrivateState {
  playerId: string
  roomCode: string
  primaryCard: 'truth' | 'false' | null
  wildCard: string | null
}

export interface RoomSnapshot {
  code: string
  players: PublicPlayer[]
  game: {
    round: number
    phase: string
    question: string | null
    playedCard: PlayedCardState | null
  }
}