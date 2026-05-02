export type Phase = 'waiting' | 'question_reveal' | 'answer_phase' | 'judging_phase' | 'results'

export type PrimaryCard = 'truth' | 'false'
export type WildCard = 'forced_truth' | 'counter' | null
export type EffectiveRole = 'truth' | 'false'
export type BotDifficulty = 'easy' | 'medium' | 'hard'
export type BotPersonalityId = 'bluffer' | 'oversharer' | 'hawk'

export interface BotSettings {
  difficulty: BotDifficulty
  targetPlayerCount: number
  allowBotDirectMessages: boolean
}

export interface ChatMessage {
  id: string
  fromPlayerId: string
  fromUsername: string
  message: string
  createdAt: number
  toPlayerId?: string
}

export interface PlayerAnswer {
  text: string
  submittedAt: number
  effectiveRole: EffectiveRole
}

export interface Player {
  id: string
  sessionId: string
  socketId: string
  username: string
  avatarSeed: string
  isBot: boolean
  botPersonalityId?: BotPersonalityId
  botPersonalityLabel?: string
  botPersonalityHint?: string
  ready: boolean
  connected: boolean
  score: number
  primaryCard: PrimaryCard | null
  wildCard: WildCard
  answer?: PlayerAnswer
}

export interface PublicPlayer {
  id: string
  username: string
  avatarSeed: string
  isBot: boolean
  botPersonalityId?: BotPersonalityId
  botPersonalityLabel?: string
  botPersonalityHint?: string
  ready: boolean
  connected: boolean
  score: number
  isAdjudicator: boolean
  hasAnswered: boolean
  answerText?: string
  primaryCardKnown?: PrimaryCard
  wildCardKnown?: WildCard
}

export interface RoundResult {
  playerId: string
  username: string
  guessedRole: EffectiveRole
  actualRole: EffectiveRole
  awardedToAdjudicator: number
  awardedToPlayer: number
}

export interface GameState {
  started: boolean
  round: number
  phase: Phase
  adjudicatorId: string | null
  question: string | null
  turnEndsAt: number | null
  results: RoundResult[]
}

export interface RoomState {
  code: string
  name: string
  passwordProtected: boolean
  maxPlayers: number
  hostId: string
  botSettings: BotSettings
  players: PublicPlayer[]
  game: GameState
  chat: ChatMessage[]
}

export interface PrivateState {
  playerId: string
  roomCode: string
  primaryCard: PrimaryCard | null
  wildCard: WildCard
}

export interface JoinRoomPayload {
  sessionId: string
  username: string
  roomCode: string
  roomName?: string
  password?: string
  create?: boolean
}

export interface SubmitAnswerPayload {
  roomCode: string
  answer: string
}

export interface AdjudicatorVotePayload {
  roomCode: string
  guesses: Record<string, EffectiveRole>
}

export interface ChatPayload {
  roomCode: string
  message: string
  toPlayerId?: string
}

export interface ChatTypingPayload {
  roomCode: string
  isTyping: boolean
  toPlayerId?: string
}

export interface ChatTypingEvent {
  roomCode: string
  fromPlayerId: string
  fromUsername: string
  isTyping: boolean
  toPlayerId?: string
}

export interface UpdateBotSettingsPayload {
  roomCode: string
  difficulty?: BotDifficulty
  targetPlayerCount?: number
  allowBotDirectMessages?: boolean
}
