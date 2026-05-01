import type {
  AdjudicatorVotePayload,
  BotDifficulty,
  BotPersonalityId,
  BotSettings,
  ChatMessage,
  EffectiveRole,
  GameState,
  JoinRoomPayload,
  Player,
  PrimaryCard,
  PrivateState,
  PublicPlayer,
  RoomState,
  RoundResult,
  SubmitAnswerPayload,
  UpdateBotSettingsPayload,
  WildCard,
} from '../shared/game.js'
import { QUESTIONS } from './questions.js'

const MAX_CHAT_MESSAGES = 80
const BOT_NAMES = ['Velvet Echo', 'Static Bloom', 'Copper Ghost', 'Neon Finch', 'Paper Tiger', 'Quartz Fox']
const BOT_TRUE_ANSWERS = [
  'I still replay awkward conversations in my head like a director\'s cut no one asked for.',
  'My biggest regret is pretending I was fine when I really should have asked for help.',
  'I once sent a message to the wrong person and tried to act like it was intentional.',
  'I definitely act cooler in group chats than I do in real life.',
]
const BOT_FALSE_ANSWERS = [
  'I accidentally became the mayor of a tiny town during a layover and had to resign by fax.',
  'My most embarrassing moment was falling off a yacht while trying to teach a seagull my name.',
  'I keep a spreadsheet ranking every sandwich I have ever eaten by emotional impact.',
  'I once lied so hard in a trivia game that the host offered me a job.',
]
const BOT_JOIN_LINES = [
  'slid into the room and is already suspicious of everyone.',
  'joined the table and claims to be impossible to read.',
  'is here, caffeinated, and ready to bluff badly.',
]
const BOT_ROUND_LINES = [
  'This question is dangerous. I respect it.',
  'I am absolutely normal about this prompt.',
  'No pressure. Just emotional damage and scorekeeping.',
]
const BOT_LOCKED_LINES = [
  'Locked in. If this goes badly, I was hacked.',
  'Answer submitted. I regret nothing yet.',
  'Sent. Please read that with confidence and not suspicion.',
]
const BOT_REACTION_LINES = [
  'That is either very true or extremely committed.',
  'Strong answer. Disturbingly strong.',
  'I would like the record to show I noticed that.',
]
const BOT_RESULT_LINES = [
  'Justice was approximate, but I can live with it.',
  'I demand a recount and perhaps a snack.',
  'That round had a lot of confidence for very few facts.',
]
const BOT_DM_LINES = [
  'Off the record, that answer was bold.',
  'Private note: I am tracking your tells now.',
  'Between us, that round got weird fast.',
]
const BOT_DIFFICULTY_ACCURACY: Record<BotDifficulty, number> = {
  easy: 0.35,
  medium: 0.6,
  hard: 0.82,
}

const BOT_PERSONALITIES: Array<{
  id: BotPersonalityId
  label: string
  hint: string
  bluffBias: number
  overshareBias: number
  judgeAggression: number
}> = [
  {
    id: 'bluffer',
    label: 'Bluffer',
    hint: 'Leans into risky lies and confident reactions.',
    bluffBias: 0.8,
    overshareBias: 0.15,
    judgeAggression: 0.15,
  },
  {
    id: 'oversharer',
    label: 'Oversharer',
    hint: 'Adds too much detail and turns every answer into a story.',
    bluffBias: 0.35,
    overshareBias: 0.9,
    judgeAggression: -0.05,
  },
  {
    id: 'hawk',
    label: 'Hawk',
    hint: 'Calls out lies aggressively and reads the room hard.',
    bluffBias: 0.25,
    overshareBias: 0.2,
    judgeAggression: 0.45,
  },
]

interface Room {
  code: string
  name: string
  password?: string
  maxPlayers: number
  hostId: string
  botSettings: BotSettings
  players: Map<string, Player>
  game: GameState
  chat: ChatMessage[]
}

export class GameEngine {
  private readonly rooms = new Map<string, Room>()

  joinRoom(payload: JoinRoomPayload, socketId: string) {
    const roomCode = payload.roomCode.trim().toUpperCase()

    if (payload.create) {
      if (this.rooms.has(roomCode)) {
        throw new Error('Room code already exists.')
      }

      const room = this.createRoom(roomCode, payload)
      const player = this.createPlayer(payload, socketId)
      room.players.set(player.id, player)
      room.hostId = player.id
      this.rooms.set(roomCode, room)
      return { roomCode, playerId: player.id }
    }

    const room = this.rooms.get(roomCode)
    if (!room) {
      throw new Error('Room not found.')
    }

    if (room.password && room.password !== payload.password) {
      throw new Error('Incorrect room password.')
    }

    const reconnecting = [...room.players.values()].find((player) => player.sessionId === payload.sessionId)
    if (reconnecting) {
      reconnecting.socketId = socketId
      reconnecting.connected = true
      reconnecting.username = payload.username.trim() || reconnecting.username
      return { roomCode, playerId: reconnecting.id }
    }

    if (room.players.size >= room.maxPlayers) {
      throw new Error('Room is full.')
    }

    const player = this.createPlayer(payload, socketId)
    room.players.set(player.id, player)
    return { roomCode, playerId: player.id }
  }

  addBot(roomCode: string, playerId: string) {
    const room = this.requireRoom(roomCode)
    if (room.hostId !== playerId) {
      throw new Error('Only the host can add bots.')
    }
    if (room.game.started) {
      throw new Error('Bots can only be added before the game starts.')
    }
    if (room.players.size >= room.maxPlayers) {
      throw new Error('Room is full.')
    }

    const bot = this.createBot(room)
    room.players.set(bot.id, bot)
    this.pushSystemLikeBotMessage(room, bot, `${bot.username} ${sample(BOT_JOIN_LINES)}`)
    return bot.id
  }

  autofillBots(roomCode: string, playerId: string) {
    const room = this.requireRoom(roomCode)
    if (room.hostId !== playerId) {
      throw new Error('Only the host can autofill bots.')
    }
    if (room.game.started) {
      throw new Error('Bots can only be autofilled before the game starts.')
    }

    const desiredCount = clampTargetCount(room.botSettings.targetPlayerCount, room.maxPlayers)
    while (room.players.size < desiredCount) {
      const bot = this.createBot(room)
      room.players.set(bot.id, bot)
      this.pushSystemLikeBotMessage(room, bot, `${bot.username} ${sample(BOT_JOIN_LINES)}`)
    }
  }

  updateBotSettings(roomCode: string, playerId: string, payload: UpdateBotSettingsPayload) {
    const room = this.requireRoom(roomCode)
    if (room.hostId !== playerId) {
      throw new Error('Only the host can change bot settings.')
    }
    if (room.game.started) {
      throw new Error('Bot settings can only change before the game starts.')
    }

    if (payload.difficulty) {
      room.botSettings.difficulty = payload.difficulty
    }

    if (payload.targetPlayerCount) {
      room.botSettings.targetPlayerCount = clampTargetCount(payload.targetPlayerCount, room.maxPlayers)
    }

    if (typeof payload.allowBotDirectMessages === 'boolean') {
      room.botSettings.allowBotDirectMessages = payload.allowBotDirectMessages
    }
  }

  toggleReady(roomCode: string, playerId: string) {
    const room = this.requireRoom(roomCode)
    const player = this.requirePlayer(room, playerId)
    if (player.isBot) {
      throw new Error('Bots are always ready.')
    }
    if (room.game.started) {
      throw new Error('Game already started.')
    }
    player.ready = !player.ready
  }

  leaveRoom(roomCode: string, playerId: string) {
    const room = this.rooms.get(roomCode)
    if (!room) {
      return false
    }

    room.players.delete(playerId)

    if (room.players.size === 0 || ![...room.players.values()].some((player) => !player.isBot)) {
      this.rooms.delete(roomCode)
      return true
    }

    if (room.hostId === playerId) {
      const nextHost = [...room.players.values()].find((player) => !player.isBot) ?? room.players.values().next().value
      if (!nextHost) {
        throw new Error('Unable to assign a new host.')
      }
      room.hostId = nextHost.id
    }

    if (room.game.adjudicatorId === playerId) {
      room.game.adjudicatorId = null
    }

    return true
  }

  hasRoom(roomCode: string) {
    return this.rooms.has(roomCode.toUpperCase())
  }

  markDisconnected(socketId: string) {
    for (const room of this.rooms.values()) {
      const player = [...room.players.values()].find((entry) => entry.socketId === socketId)
      if (player) {
        player.connected = false
        return room.code
      }
    }

    return null
  }

  startGame(roomCode: string, playerId: string) {
    const room = this.requireRoom(roomCode)
    if (room.hostId !== playerId) {
      throw new Error('Only the host can start the game.')
    }

    this.autofillBots(roomCode, playerId)

    const connectedPlayers = [...room.players.values()].filter((player) => player.connected)
    if (connectedPlayers.length < 2) {
      throw new Error('At least 2 connected players are required.')
    }

    const unreadyPlayers = connectedPlayers.filter((player) => !player.ready)
    if (unreadyPlayers.length > 0) {
      throw new Error('All connected players must be ready.')
    }

    room.game.started = true
    room.game.round = 0
    this.nextRound(roomCode)
  }

  nextRound(roomCode: string) {
    const room = this.requireRoom(roomCode)
    const players = [...room.players.values()].filter((player) => player.connected)

    if (players.length < 2) {
      throw new Error('Not enough players to continue.')
    }

    room.game.round += 1
    room.game.phase = 'question_reveal'
    room.game.question = sample(QUESTIONS)
    room.game.results = []
    room.game.turnEndsAt = Date.now() + 75_000
    room.game.adjudicatorId = this.pickNextAdjudicator(room, players)
    const question = room.game.question ?? 'Tell the story.'

    for (const player of players) {
      player.answer = undefined
      if (player.id === room.game.adjudicatorId) {
        player.primaryCard = null
        player.wildCard = null
        continue
      }

      player.primaryCard = Math.random() > 0.5 ? 'truth' : 'false'
      player.wildCard = this.rollWildCard()
    }

    for (const player of players) {
      if (player.isBot) {
        this.pushBotChat(room, player, this.generateQuestionComment(question, player))
      }
    }

    this.progressBots(room)
  }

  submitAnswer(playerId: string, payload: SubmitAnswerPayload) {
    const room = this.requireRoom(payload.roomCode)
    if (room.game.phase !== 'question_reveal' && room.game.phase !== 'answer_phase') {
      throw new Error('Answers are closed.')
    }

    const player = this.requirePlayer(room, playerId)
    if (player.id === room.game.adjudicatorId) {
      throw new Error('Adjudicator cannot submit an answer.')
    }

    const effectiveRole: EffectiveRole = player.wildCard === 'forced_truth' ? 'truth' : (player.primaryCard ?? 'truth')

    player.answer = {
      text: payload.answer.trim(),
      submittedAt: Date.now(),
      effectiveRole,
    }

    room.game.phase = 'answer_phase'

    const pending = [...room.players.values()].filter(
      (entry) => entry.id !== room.game.adjudicatorId && entry.connected && !entry.answer,
    )

    if (pending.length === 0) {
      room.game.phase = 'judging_phase'
      room.game.turnEndsAt = Date.now() + 45_000
    }

    if (!player.isBot) {
      const reactors = this.pickBotSpeakers(room, 1)
      for (const reactor of reactors) {
        this.pushBotChat(room, reactor, this.generateAnswerReaction(room.game.question ?? 'that prompt', player.username))
      }
    }

    this.progressBots(room)
  }

  adjudicatorVote(playerId: string, payload: AdjudicatorVotePayload) {
    const room = this.requireRoom(payload.roomCode)
    if (room.game.adjudicatorId !== playerId) {
      throw new Error('Only the adjudicator can vote.')
    }
    if (room.game.phase !== 'judging_phase') {
      throw new Error('The room is not ready for judging.')
    }

    const adjudicator = this.requirePlayer(room, playerId)
    this.applyAdjudicatorVote(room, adjudicator, payload.guesses)
  }

  addChatMessage(roomCode: string, playerId: string, message: string, toPlayerId?: string) {
    const room = this.requireRoom(roomCode)
    const player = this.requirePlayer(room, playerId)

    const entry: ChatMessage = {
      id: randomId(),
      fromPlayerId: player.id,
      fromUsername: player.username,
      message: message.trim(),
      createdAt: Date.now(),
      toPlayerId,
    }

    room.chat = [...room.chat.slice(-(MAX_CHAT_MESSAGES - 1)), entry]
    if (!player.isBot) {
      this.queueBotChatResponse(room, player, toPlayerId)
    }
    return entry
  }

  getRoomState(roomCode: string): RoomState {
    const room = this.requireRoom(roomCode)
    return this.toRoomState(room)
  }

  getPrivateState(roomCode: string, playerId: string): PrivateState {
    const room = this.requireRoom(roomCode)
    const player = this.requirePlayer(room, playerId)

    return {
      playerId,
      roomCode,
      primaryCard: player.primaryCard,
      wildCard: player.wildCard,
    }
  }

  listRoomPlayers(roomCode: string) {
    const room = this.requireRoom(roomCode)
    return [...room.players.values()]
  }

  private applyAdjudicatorVote(room: Room, adjudicator: Player, guesses: Record<string, EffectiveRole>) {
    const results: RoundResult[] = []

    for (const player of room.players.values()) {
      if (player.id === adjudicator.id || !player.answer) {
        continue
      }

      const guessedRole = guesses[player.id] ?? 'truth'
      const actualRole = player.answer.effectiveRole
      const correct = guessedRole === actualRole
      const awardedToAdjudicator = correct ? 2 : 0
      const awardedToPlayer = actualRole === 'false' && !correct ? 3 : actualRole === 'truth' && correct ? 1 : 0

      adjudicator.score += awardedToAdjudicator
      player.score += awardedToPlayer

      results.push({
        playerId: player.id,
        username: player.username,
        guessedRole,
        actualRole,
        awardedToAdjudicator,
        awardedToPlayer,
      })
    }

    room.game.phase = 'results'
    room.game.results = results
    room.game.turnEndsAt = null

    for (const player of room.players.values()) {
      if (player.isBot) {
        this.pushBotChat(room, player, this.generateResultComment(player, room.game.question ?? 'that question', results))
      }
    }
  }

  private createRoom(roomCode: string, payload: JoinRoomPayload): Room {
    return {
      code: roomCode,
      name: payload.roomName?.trim() || 'Untitled Room',
      password: payload.password?.trim() || undefined,
      maxPlayers: 8,
      hostId: '',
      botSettings: {
        difficulty: 'medium',
        targetPlayerCount: 4,
        allowBotDirectMessages: true,
      },
      players: new Map(),
      chat: [],
      game: {
        started: false,
        round: 0,
        phase: 'waiting',
        adjudicatorId: null,
        question: null,
        turnEndsAt: null,
        results: [],
      },
    }
  }

  private createPlayer(payload: JoinRoomPayload, socketId: string): Player {
    return {
      id: randomId(),
      sessionId: payload.sessionId,
      socketId,
      username: payload.username.trim().slice(0, 20),
      avatarSeed: payload.username.trim().slice(0, 2).toUpperCase(),
      isBot: false,
      botPersonalityId: undefined,
      botPersonalityLabel: undefined,
      botPersonalityHint: undefined,
      ready: false,
      connected: true,
      score: 0,
      primaryCard: null,
      wildCard: null,
    }
  }

  private createBot(room: Room): Player {
    const id = randomId()
    const username = this.nextBotName(room)
    const personality = this.pickBotPersonality(room)
    return {
      id,
      sessionId: `bot:${id}`,
      socketId: `bot:${id}`,
      username,
      avatarSeed: username.slice(0, 2).toUpperCase(),
      isBot: true,
      botPersonalityId: personality.id,
      botPersonalityLabel: personality.label,
      botPersonalityHint: personality.hint,
      ready: true,
      connected: true,
      score: 0,
      primaryCard: null,
      wildCard: null,
    }
  }

  private nextBotName(room: Room) {
    const taken = new Set([...room.players.values()].map((player) => player.username))
    for (const name of BOT_NAMES) {
      if (!taken.has(name)) {
        return name
      }
    }
    return `Bot ${room.players.size + 1}`
  }

  private pickBotPersonality(room: Room) {
    const botCount = [...room.players.values()].filter((player) => player.isBot).length
    return BOT_PERSONALITIES[botCount % BOT_PERSONALITIES.length]
  }

  private pickNextAdjudicator(room: Room, players: Player[]) {
    if (!room.game.adjudicatorId) {
      return players[0].id
    }

    const currentIndex = players.findIndex((player) => player.id === room.game.adjudicatorId)
    return players[(currentIndex + 1) % players.length].id
  }

  private toRoomState(room: Room): RoomState {
    return {
      code: room.code,
      name: room.name,
      passwordProtected: Boolean(room.password),
      maxPlayers: room.maxPlayers,
      hostId: room.hostId,
      botSettings: room.botSettings,
      players: [...room.players.values()].map((player): PublicPlayer => ({
        id: player.id,
        username: player.username,
        avatarSeed: player.avatarSeed,
        isBot: player.isBot,
        botPersonalityId: player.botPersonalityId,
        botPersonalityLabel: player.botPersonalityLabel,
        botPersonalityHint: player.botPersonalityHint,
        ready: player.ready,
        connected: player.connected,
        score: player.score,
        isAdjudicator: room.game.adjudicatorId === player.id,
        hasAnswered: Boolean(player.answer),
        answerText:
          room.game.phase === 'judging_phase' || room.game.phase === 'results'
            ? player.answer?.text
            : undefined,
        primaryCardKnown: room.game.phase === 'results' ? player.primaryCard ?? undefined : undefined,
        wildCardKnown: room.game.phase === 'results' ? player.wildCard : undefined,
      })),
      game: room.game,
      chat: room.chat,
    }
  }

  private requireRoom(roomCode: string) {
    const room = this.rooms.get(roomCode.toUpperCase())
    if (!room) {
      throw new Error('Room not found.')
    }
    return room
  }

  private requirePlayer(room: Room, playerId: string) {
    const player = room.players.get(playerId)
    if (!player) {
      throw new Error('Player not found.')
    }
    return player
  }

  private rollWildCard(): WildCard {
    const roll = Math.random()
    if (roll > 0.83) {
      return 'forced_truth'
    }
    if (roll > 0.68) {
      return 'counter'
    }
    return null
  }

  private progressBots(room: Room) {
    if (!room.game.started) {
      return
    }

    if (room.game.phase === 'question_reveal' || room.game.phase === 'answer_phase') {
      for (const player of room.players.values()) {
        if (!player.isBot || player.id === room.game.adjudicatorId || !player.connected || player.answer) {
          continue
        }

        const effectiveRole: EffectiveRole = player.wildCard === 'forced_truth' ? 'truth' : (player.primaryCard ?? 'truth')
        player.answer = {
          text: this.generateBotAnswer(player, room.game.question ?? 'Tell the story.', effectiveRole),
          submittedAt: Date.now(),
          effectiveRole,
        }
        room.game.phase = 'answer_phase'
        this.pushBotChat(room, player, this.generateLockInComment(player))
      }

      const pending = [...room.players.values()].filter(
        (entry) => entry.id !== room.game.adjudicatorId && entry.connected && !entry.answer,
      )

      if (pending.length === 0) {
        room.game.phase = 'judging_phase'
        room.game.turnEndsAt = Date.now() + 45_000
      }
    }

    if (room.game.phase === 'judging_phase') {
      const adjudicator = room.game.adjudicatorId ? room.players.get(room.game.adjudicatorId) : null
      if (!adjudicator?.isBot) {
        return
      }

      const adjudicatorPersonality = this.getPersonality(adjudicator)
      const guesses: Record<string, EffectiveRole> = {}
      for (const player of room.players.values()) {
        if (player.id === adjudicator.id || !player.answer) {
          continue
        }

        const baseAccuracy = BOT_DIFFICULTY_ACCURACY[room.botSettings.difficulty]
        const aggression = adjudicatorPersonality.judgeAggression
        const adjustedAccuracy = clampProbability(baseAccuracy + aggression * 0.1)
        const preferredRole = aggression > 0.2 ? 'false' : player.answer.effectiveRole
        guesses[player.id] = Math.random() < adjustedAccuracy ? player.answer.effectiveRole : preferredRole === 'false' ? 'false' : oppositeRole(player.answer.effectiveRole)
      }

      this.applyAdjudicatorVote(room, adjudicator, guesses)
    }
  }

  private generateBotAnswer(player: Player, question: string, role: EffectiveRole) {
    const lead = question.replace(/[?!.]+$/, '')
    const personality = this.getPersonality(player)
    const response = role === 'truth' ? sample(BOT_TRUE_ANSWERS) : sample(BOT_FALSE_ANSWERS)
    const embellished = personality.overshareBias > 0.6
      ? `${response} Also, I am aware that is too much information, but here we are.`
      : personality.bluffBias > 0.6 && role === 'false'
        ? `${response} And yes, I am saying that with a completely steady voice.`
        : response
    return `${lead}: ${embellished}`
  }

  private generateQuestionComment(question: string, player: Player) {
    const trimmedQuestion = question.replace(/[?!.]+$/, '')
    const opener = sample(BOT_ROUND_LINES)
    const personality = this.getPersonality(player)
    if (personality.id === 'oversharer') {
      return `${opener} About "${trimmedQuestion}", I already have three paragraphs and no restraint.`
    }
    if (personality.id === 'hawk') {
      return `${opener} About "${trimmedQuestion}", I am watching every eyebrow in this room.`
    }
    return `${opener} About "${trimmedQuestion}", I could absolutely bluff my way through this.`
  }

  private generateAnswerReaction(question: string, username: string) {
    const trimmedQuestion = question.replace(/[?!.]+$/, '')
    const reaction = sample(BOT_REACTION_LINES)
    return `${username} answered "${trimmedQuestion}" and ${reaction.charAt(0).toLowerCase()}${reaction.slice(1)}`
  }

  private generateResultComment(player: Player, question: string, results: RoundResult[]) {
    const ownResult = results.find((entry) => entry.playerId === player.id)
    const trimmedQuestion = question.replace(/[?!.]+$/, '')

    if (!ownResult) {
      return `I watched everyone melt down over "${trimmedQuestion}". ${sample(BOT_RESULT_LINES)}`
    }

    if (ownResult.actualRole === 'false' && ownResult.guessedRole !== ownResult.actualRole) {
      return `On "${trimmedQuestion}", I sold the lie and got paid for it. ${sample(BOT_RESULT_LINES)}`
    }

    if (ownResult.actualRole === 'truth' && ownResult.guessedRole === ownResult.actualRole) {
      return `Apparently honesty worked on "${trimmedQuestion}". Suspicious, but useful.`
    }

    return `"${trimmedQuestion}" did not go in my favor. ${sample(BOT_RESULT_LINES)}`
  }

  private queueBotChatResponse(room: Room, author: Player, toPlayerId?: string) {
    const candidates = [...room.players.values()].filter((player) => {
      if (!player.isBot || !player.connected) {
        return false
      }
      if (toPlayerId) {
        return player.id === toPlayerId
      }
      return player.id !== author.id
    })

    if (candidates.length === 0) {
      return
    }

    const speaker = sample(candidates)
    const reaction = room.botSettings.allowBotDirectMessages && Math.random() > 0.5
      ? sample(BOT_DM_LINES)
      : sample(BOT_REACTION_LINES)
    const shouldDm = room.botSettings.allowBotDirectMessages && (Boolean(toPlayerId) || Math.random() > 0.7)

    const line = shouldDm
      ? `${author.username}, ${reaction.charAt(0).toLowerCase()}${reaction.slice(1)}`
      : toPlayerId
      ? `Replying directly: ${reaction}`
      : `${author.username}, ${reaction.charAt(0).toLowerCase()}${reaction.slice(1)}`
    this.pushBotChat(room, speaker, line, shouldDm ? author.id : undefined)
  }

  private generateLockInComment(player: Player) {
    const personality = this.getPersonality(player)
    if (personality.id === 'bluffer') {
      return 'Locked in. If anyone buys that, I deserve the points.'
    }
    if (personality.id === 'oversharer') {
      return 'Locked in. In hindsight that may have been too many details.'
    }
    return 'Locked in. I now have a shortlist of suspects and it is everyone.'
  }

  private getPersonality(player: Player) {
    return BOT_PERSONALITIES.find((entry) => entry.id === player.botPersonalityId) ?? BOT_PERSONALITIES[0]
  }

  private pushBotChat(room: Room, player: Player, message: string, toPlayerId?: string) {
    room.chat = [
      ...room.chat.slice(-(MAX_CHAT_MESSAGES - 1)),
      {
        id: randomId(),
        fromPlayerId: player.id,
        fromUsername: player.username,
        message,
        createdAt: Date.now(),
        toPlayerId,
      },
    ]
  }

  private pushSystemLikeBotMessage(room: Room, player: Player, message: string) {
    this.pushBotChat(room, player, message)
  }

  private pickBotSpeakers(room: Room, count: number) {
    return [...room.players.values()].filter((player) => player.isBot && player.connected).slice(0, count)
  }
}

function sample<T>(items: T[]) {
  if (items.length === 0) {
    throw new Error('Cannot sample from an empty array.')
  }
  return items[Math.floor(Math.random() * items.length)]
}

function randomId() {
  return Math.random().toString(36).slice(2, 10)
}

function oppositeRole(role: EffectiveRole): EffectiveRole {
  return role === 'truth' ? 'false' : 'truth'
}

function clampTargetCount(value: number, maxPlayers: number) {
  return Math.min(maxPlayers, Math.max(2, Math.floor(value)))
}

function clampProbability(value: number) {
  return Math.min(0.95, Math.max(0.05, value))
}
