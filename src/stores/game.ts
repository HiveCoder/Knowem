import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { getSocket, getSocketUrl } from '@/services/socket'
import type {
  AdjudicatorVotePayload,
  BotDifficulty,
  ChatMessage,
  ChatPayload,
  JoinRoomPayload,
  PrivateState,
  RoomState,
  SubmitAnswerPayload,
  UpdateBotSettingsPayload,
} from '@/types/game'

type ConnectionState = 'connecting' | 'connected' | 'reconnecting' | 'offline'

export const useGameStore = defineStore('game', () => {
  let socket = null as ReturnType<typeof getSocket> | null
  const room = ref<RoomState | null>(null)
  const privateState = ref<PrivateState | null>(null)
  const roomCode = ref('')
  const playerId = ref('')
  const latestError = ref('')
  const lastDealtAt = ref(0)
  const connectionState = ref<ConnectionState>('connecting')
  const reconnectNotice = ref('')
  const backendStatusMessage = ref('')
  const backendUrl = ref(getSocketUrl())

  try {
    socket = getSocket()
  } catch (error) {
    connectionState.value = 'offline'
    backendStatusMessage.value = error instanceof Error ? error.message : 'Unable to initialize realtime connection.'
    latestError.value = backendStatusMessage.value
  }

  if (socket && !socket.hasListeners('room_state')) {
    socket.on('joined_room', ({ roomCode: joinedRoomCode, playerId: joinedPlayerId }) => {
      roomCode.value = joinedRoomCode
      playerId.value = joinedPlayerId
    })

    socket.on('room_state', (snapshot: RoomState) => {
      room.value = snapshot
    })

    socket.on('private_state', (snapshot: PrivateState) => {
      privateState.value = snapshot
    })

    socket.on('deal_cards', () => {
      lastDealtAt.value = Date.now()
    })

    socket.on('room_error', (message: string) => {
      latestError.value = message
    })

    socket.on('connect', () => {
      connectionState.value = 'connected'
      backendStatusMessage.value = ''
    })

    socket.on('disconnect', (reason: string) => {
      connectionState.value = reason === 'io client disconnect' ? 'offline' : 'reconnecting'
      backendStatusMessage.value =
        reason === 'io client disconnect'
          ? 'Realtime connection closed.'
          : 'Realtime backend disconnected. Attempting to reconnect.'
    })

    socket.on('connect_error', () => {
      connectionState.value = 'reconnecting'
      backendStatusMessage.value = `Live backend unreachable${backendUrl.value ? ` at ${backendUrl.value}` : ''}.`
    })

    socket.io.on('reconnect_attempt', () => {
      connectionState.value = 'reconnecting'
      backendStatusMessage.value = 'Reconnecting to live backend...'
    })

    socket.io.on('reconnect', () => {
      connectionState.value = 'connected'
      backendStatusMessage.value = ''
      reconnectNotice.value = 'Reconnected to the live backend.'
    })

    socket.on('chat_message', (message: ChatMessage) => {
      if (!room.value) {
        return
      }
      room.value = {
        ...room.value,
        chat: [...room.value.chat, message],
      }
    })
  }

  const self = computed(() => room.value?.players.find((entry) => entry.id === playerId.value) ?? null)
  const isHost = computed(() => room.value?.hostId === playerId.value)
  const isBackendReachable = computed(() => connectionState.value !== 'offline')
  const isConnecting = computed(() => connectionState.value === 'connecting' || connectionState.value === 'reconnecting')
  const canStart = computed(() => {
    if (!room.value || !isHost.value) {
      return false
    }
    const connectedPlayers = room.value.players.filter((entry) => entry.connected)
    return connectedPlayers.length >= 2 && connectedPlayers.every((entry) => entry.ready)
  })

  function clearError() {
    latestError.value = ''
  }

  function clearReconnectNotice() {
    reconnectNotice.value = ''
  }

  function withSocket(action: (instance: NonNullable<typeof socket>) => void) {
    if (!socket) {
      latestError.value = backendStatusMessage.value || 'Realtime backend is unavailable.'
      return
    }
    action(socket)
  }

  function createRoom(payload: JoinRoomPayload) {
    clearError()
    withSocket((instance) => {
      instance.emit('join_room', {
        ...payload,
        roomCode: payload.roomCode.toUpperCase(),
        create: true,
      })
    })
  }

  function joinRoom(payload: JoinRoomPayload) {
    clearError()
    withSocket((instance) => {
      instance.emit('join_room', {
        ...payload,
        roomCode: payload.roomCode.toUpperCase(),
      })
    })
  }

  function leaveRoom() {
    if (!roomCode.value) {
      return
    }
    withSocket((instance) => {
      instance.emit('leave_room', { roomCode: roomCode.value })
    })
    room.value = null
    privateState.value = null
    roomCode.value = ''
    playerId.value = ''
  }

  function toggleReady() {
    if (!roomCode.value) {
      return
    }
    withSocket((instance) => {
      instance.emit('toggle_ready', { roomCode: roomCode.value })
    })
  }

  function startGame() {
    if (!roomCode.value) {
      return
    }
    withSocket((instance) => {
      instance.emit('start_game', { roomCode: roomCode.value })
    })
  }

  function addBot() {
    if (!roomCode.value) {
      return
    }
    withSocket((instance) => {
      instance.emit('add_bot', { roomCode: roomCode.value })
    })
  }

  function autofillBots() {
    if (!roomCode.value) {
      return
    }
    withSocket((instance) => {
      instance.emit('autofill_bots', { roomCode: roomCode.value })
    })
  }

  function updateBotSettings(settings: { difficulty?: BotDifficulty; targetPlayerCount?: number; allowBotDirectMessages?: boolean }) {
    if (!roomCode.value) {
      return
    }
    const payload: UpdateBotSettingsPayload = {
      roomCode: roomCode.value,
      ...settings,
    }
    withSocket((instance) => {
      instance.emit('update_bot_settings', payload)
    })
  }

  function submitAnswer(answer: string) {
    if (!roomCode.value) {
      return
    }
    const payload: SubmitAnswerPayload = {
      roomCode: roomCode.value,
      answer,
    }
    withSocket((instance) => {
      instance.emit('submit_answer', payload)
    })
  }

  function submitVote(guesses: Record<string, 'truth' | 'false'>) {
    if (!roomCode.value) {
      return
    }
    const payload: AdjudicatorVotePayload = {
      roomCode: roomCode.value,
      guesses,
    }
    withSocket((instance) => {
      instance.emit('adjudicator_vote', payload)
    })
  }

  function nextRound() {
    if (!roomCode.value) {
      return
    }
    withSocket((instance) => {
      instance.emit('next_round', { roomCode: roomCode.value })
    })
  }

  function sendChatMessage(message: string, toPlayerId?: string) {
    if (!roomCode.value) {
      return
    }
    const payload: ChatPayload = {
      roomCode: roomCode.value,
      message,
      toPlayerId,
    }
    withSocket((instance) => {
      instance.emit('chat_message', payload)
    })
  }

  return {
    room,
    privateState,
    roomCode,
    playerId,
    self,
    isHost,
    isBackendReachable,
    isConnecting,
    connectionState,
    backendStatusMessage,
    backendUrl,
    reconnectNotice,
    canStart,
    latestError,
    lastDealtAt,
    createRoom,
    joinRoom,
    leaveRoom,
    toggleReady,
    startGame,
    addBot,
    autofillBots,
    updateBotSettings,
    submitAnswer,
    submitVote,
    nextRound,
    sendChatMessage,
    clearError,
    clearReconnectNotice,
  }
})
