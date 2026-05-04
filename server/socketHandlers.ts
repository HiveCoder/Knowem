import type { Server } from 'socket.io'
import type { AdjudicatorVotePayload, ChatPayload, JoinRoomPayload, PlayCardPayload, SubmitAnswerPayload, UpdateBotSettingsPayload } from '../shared/game.js'
import { GameEngine } from './gameEngine.js'

export function registerSocketHandlers(io: Server, engine: GameEngine) {
  io.on('connection', (socket) => {
    let currentPlayerId: string | null = null

    const syncRoom = (roomCode: string) => {
      const roomState = engine.getRoomState(roomCode)
      io.to(roomCode).emit('room_state', roomState)

      for (const player of engine.listRoomPlayers(roomCode)) {
        if (!player.connected || player.isBot) {
          continue
        }
        io.to(player.socketId).emit('private_state', engine.getPrivateState(roomCode, player.id))
      }
    }

    socket.on('join_room', (payload: JoinRoomPayload) => {
      try {
        const { roomCode, playerId } = engine.joinRoom(payload, socket.id)
        currentPlayerId = playerId
        socket.join(roomCode)
        socket.emit('joined_room', { roomCode, playerId })
        syncRoom(roomCode)
      } catch (error) {
        socket.emit('room_error', error instanceof Error ? error.message : 'Unable to join room.')
      }
    })

    socket.on('leave_room', ({ roomCode }: { roomCode: string }) => {
      if (!currentPlayerId) {
        return
      }
      engine.leaveRoom(roomCode, currentPlayerId)
      socket.leave(roomCode)
      currentPlayerId = null
      if (engine.hasRoom(roomCode)) {
        syncRoom(roomCode)
      }
    })

    socket.on('toggle_ready', ({ roomCode }: { roomCode: string }) => {
      try {
        if (!currentPlayerId) {
          return
        }
        engine.toggleReady(roomCode, currentPlayerId)
        syncRoom(roomCode)
      } catch (error) {
        socket.emit('room_error', error instanceof Error ? error.message : 'Unable to change ready state.')
      }
    })

    socket.on('add_bot', ({ roomCode }: { roomCode: string }) => {
      try {
        if (!currentPlayerId) {
          return
        }
        engine.addBot(roomCode, currentPlayerId)
        syncRoom(roomCode)
      } catch (error) {
        socket.emit('room_error', error instanceof Error ? error.message : 'Unable to add bot.')
      }
    })

    socket.on('autofill_bots', ({ roomCode }: { roomCode: string }) => {
      try {
        if (!currentPlayerId) {
          return
        }
        engine.autofillBots(roomCode, currentPlayerId)
        syncRoom(roomCode)
      } catch (error) {
        socket.emit('room_error', error instanceof Error ? error.message : 'Unable to autofill bots.')
      }
    })

    socket.on('update_bot_settings', (payload: UpdateBotSettingsPayload) => {
      try {
        if (!currentPlayerId) {
          return
        }
        engine.updateBotSettings(payload.roomCode, currentPlayerId, payload)
        syncRoom(payload.roomCode)
      } catch (error) {
        socket.emit('room_error', error instanceof Error ? error.message : 'Unable to update bot settings.')
      }
    })

    socket.on('start_game', ({ roomCode }: { roomCode: string }) => {
      try {
        if (!currentPlayerId) {
          return
        }
        engine.startGame(roomCode, currentPlayerId)
        io.to(roomCode).emit('deal_cards', { roomCode })
        syncRoom(roomCode)
      } catch (error) {
        socket.emit('room_error', error instanceof Error ? error.message : 'Unable to start game.')
      }
    })

    socket.on('submit_answer', (payload: SubmitAnswerPayload) => {
      try {
        if (!currentPlayerId) {
          return
        }
        engine.submitAnswer(currentPlayerId, payload)
        syncRoom(payload.roomCode)
      } catch (error) {
        socket.emit('room_error', error instanceof Error ? error.message : 'Unable to submit answer.')
      }
    })

    socket.on('card_played', (payload: PlayCardPayload) => {
      try {
        if (!currentPlayerId) {
          return
        }
        const event = engine.playCard(currentPlayerId, payload)
        io.to(payload.roomCode).emit('cardPlayed', event)
        syncRoom(payload.roomCode)
      } catch (error) {
        socket.emit('room_error', error instanceof Error ? error.message : 'Unable to play card.')
      }
    })

    socket.on('adjudicator_vote', (payload: AdjudicatorVotePayload) => {
      try {
        if (!currentPlayerId) {
          return
        }
        engine.adjudicatorVote(currentPlayerId, payload)
        syncRoom(payload.roomCode)
      } catch (error) {
        socket.emit('room_error', error instanceof Error ? error.message : 'Unable to submit verdict.')
      }
    })

    socket.on('next_round', ({ roomCode }: { roomCode: string }) => {
      try {
        engine.nextRound(roomCode)
        io.to(roomCode).emit('deal_cards', { roomCode })
        syncRoom(roomCode)
      } catch (error) {
        socket.emit('room_error', error instanceof Error ? error.message : 'Unable to advance round.')
      }
    })

    socket.on('chat_message', (payload: ChatPayload) => {
      try {
        if (!currentPlayerId) {
          return
        }
        const message = engine.addChatMessage(payload.roomCode, currentPlayerId, payload.message, payload.toPlayerId)
        if (payload.toPlayerId) {
          syncRoom(payload.roomCode)
        } else {
          io.to(payload.roomCode).emit('chat_message', message)
          syncRoom(payload.roomCode)
        }
      } catch (error) {
        socket.emit('room_error', error instanceof Error ? error.message : 'Unable to send message.')
      }
    })

    socket.on('disconnect', () => {
      const roomCode = engine.markDisconnected(socket.id)
      if (roomCode) {
        syncRoom(roomCode)
      }
    })
  })
}