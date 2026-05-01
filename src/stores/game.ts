import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { getSocket } from '@/services/socket'
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

export const useGameStore = defineStore('game', () => {
  const socket = getSocket()
  const room = ref<RoomState | null>(null)
  const privateState = ref<PrivateState | null>(null)
  const roomCode = ref('')
  const playerId = ref('')
  const latestError = ref('')
  const lastDealtAt = ref(0)

  if (!socket.hasListeners('room_state')) {
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

  function createRoom(payload: JoinRoomPayload) {
    clearError()
    socket.emit('join_room', {
      ...payload,
      roomCode: payload.roomCode.toUpperCase(),
      create: true,
    })
  }

  function joinRoom(payload: JoinRoomPayload) {
    clearError()
    socket.emit('join_room', {
      ...payload,
      roomCode: payload.roomCode.toUpperCase(),
    })
  }

  function leaveRoom() {
    if (!roomCode.value) {
      return
    }
    socket.emit('leave_room', { roomCode: roomCode.value })
    room.value = null
    privateState.value = null
    roomCode.value = ''
    playerId.value = ''
  }

  function toggleReady() {
    if (!roomCode.value) {
      return
    }
    socket.emit('toggle_ready', { roomCode: roomCode.value })
  }

  function startGame() {
    if (!roomCode.value) {
      return
    }
    socket.emit('start_game', { roomCode: roomCode.value })
  }

  function addBot() {
    if (!roomCode.value) {
      return
    }
    socket.emit('add_bot', { roomCode: roomCode.value })
  }

  function autofillBots() {
    if (!roomCode.value) {
      return
    }
    socket.emit('autofill_bots', { roomCode: roomCode.value })
  }

  function updateBotSettings(settings: { difficulty?: BotDifficulty; targetPlayerCount?: number; allowBotDirectMessages?: boolean }) {
    if (!roomCode.value) {
      return
    }
    const payload: UpdateBotSettingsPayload = {
      roomCode: roomCode.value,
      ...settings,
    }
    socket.emit('update_bot_settings', payload)
  }

  function submitAnswer(answer: string) {
    if (!roomCode.value) {
      return
    }
    const payload: SubmitAnswerPayload = {
      roomCode: roomCode.value,
      answer,
    }
    socket.emit('submit_answer', payload)
  }

  function submitVote(guesses: Record<string, 'truth' | 'false'>) {
    if (!roomCode.value) {
      return
    }
    const payload: AdjudicatorVotePayload = {
      roomCode: roomCode.value,
      guesses,
    }
    socket.emit('adjudicator_vote', payload)
  }

  function nextRound() {
    if (!roomCode.value) {
      return
    }
    socket.emit('next_round', { roomCode: roomCode.value })
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
    socket.emit('chat_message', payload)
  }

  return {
    room,
    privateState,
    roomCode,
    playerId,
    self,
    isHost,
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
  }
})
