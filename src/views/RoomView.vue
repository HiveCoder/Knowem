<template>
  <div v-if="room" class="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-[1460px] items-center">
    <div class="w-full space-y-6">
      <div class="grid gap-6 xl:grid-cols-[minmax(0,1.22fr)_380px]">
        <UiPanel tag="header" padding="lg" class="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div class="min-w-0">
            <div class="flex flex-wrap items-center gap-2.5">
              <UiBadge tone="accent">Room {{ room.code }}</UiBadge>
              <UiBadge tone="muted">{{ room.game.started ? `Round ${room.game.round}` : 'Lobby' }}</UiBadge>
              <UiBadge v-if="game.isHost" tone="success">Host</UiBadge>
            </div>
            <h1 class="mt-5 text-3xl font-semibold tracking-tight text-white sm:text-4xl">{{ room.name }}</h1>
            <p class="mt-2 text-sm leading-6 text-slate-400">A calmer, centered table layout with the roster up top and the live game flow anchored in the middle.</p>
            <div class="mt-4 rounded-2xl border border-white/10 bg-[rgba(12,19,35,0.72)] px-4 py-3 text-sm text-slate-300">
              <p class="text-[11px] uppercase tracking-[0.22em] text-slate-500">Invite link</p>
              <p class="mt-2 truncate">{{ inviteLink }}</p>
            </div>
          </div>
          <div class="flex w-full flex-wrap gap-3 lg:w-auto lg:justify-end">
            <UiButton variant="secondary" @click="copyInvite">Copy invite</UiButton>
            <UiButton variant="danger" @click="leaveRoom">Leave room</UiButton>
          </div>
        </UiPanel>

        <PlayerList :players="room.players" :self-id="game.playerId" compact />
      </div>

      <div v-if="game.latestError" class="rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
        {{ game.latestError }}
      </div>

      <div v-if="game.connectionState !== 'connected'" class="rounded-2xl border border-amber-400/20 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">
        {{ game.backendStatusMessage || 'Realtime backend is reconnecting.' }}
      </div>

      <div v-if="!room.game.started" class="grid gap-6 xl:grid-cols-[minmax(0,1.25fr)_360px] xl:items-start">
        <RoomLobby
          :room="room"
          :self-id="game.playerId"
          :can-start="game.canStart"
          :can-add-bot="game.isHost && room.players.length < room.maxPlayers"
          @toggle-ready="game.toggleReady"
          @add-bot="game.addBot"
          @autofill-bots="game.autofillBots"
          @update-bot-settings="game.updateBotSettings"
          @start-game="game.startGame"
        />
        <div class="space-y-6">
          <ScoreBoard :players="room.players" />
        </div>
      </div>

      <div v-else class="grid gap-6 xl:grid-cols-[minmax(0,1.58fr)_360px] xl:items-start">
        <GameTable
          :room="room"
          :private-state="game.privateState"
          :self-id="game.playerId"
          :can-advance="game.isHost"
          :last-dealt-at="game.lastDealtAt"
          @submit-answer="game.submitAnswer"
          @submit-vote="game.submitVote"
          @next-round="game.nextRound"
        />
        <div class="space-y-6">
          <ScoreBoard :players="room.players" />
          <ChatPanel
            :messages="room.chat"
            :players="room.players"
            :self-id="game.playerId"
            :allow-bot-direct-messages="room.botSettings.allowBotDirectMessages"
            @send="game.sendChatMessage"
          />
        </div>
      </div>
    </div>
  </div>

  <div v-else class="mx-auto flex min-h-[70vh] max-w-lg items-center">
    <UiPanel class="w-full" padding="lg">
      <UiBadge tone="accent">Reconnect</UiBadge>
      <h1 class="mt-4 text-3xl font-semibold tracking-tight text-white">Join room {{ roomCode }}</h1>
      <p class="mt-3 text-sm text-slate-400">If you opened an invite link directly, enter the room password if required and reconnect with your stored username.</p>
      <p v-if="game.backendStatusMessage" class="mt-3 text-sm text-amber-200">{{ game.backendStatusMessage }}</p>
      <div class="mt-6 space-y-4">
        <input v-model="password" class="input-shell" type="password" placeholder="Room password (optional)" />
        <UiButton variant="primary" block :disabled="!session.hasUsername || !game.isBackendReachable" @click="rejoinRoom">
          Join room
        </UiButton>
      </div>
    </UiPanel>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ChatPanel from '@/components/ChatPanel.vue'
import GameTable from '@/components/GameTable.vue'
import PlayerList from '@/components/PlayerList.vue'
import RoomLobby from '@/components/RoomLobby.vue'
import ScoreBoard from '@/components/ScoreBoard.vue'
import UiBadge from '@/components/ui/UiBadge.vue'
import UiButton from '@/components/ui/UiButton.vue'
import UiPanel from '@/components/ui/UiPanel.vue'
import { useGameStore } from '@/stores/game'
import { useSessionStore } from '@/stores/session'

const route = useRoute()
const router = useRouter()
const game = useGameStore()
const session = useSessionStore()

const password = ref('')
const roomCode = computed(() => String(route.params.code || '').toUpperCase())
const room = computed(() => (game.roomCode === roomCode.value ? game.room : null))
const inviteLink = computed(() => `${window.location.origin}/room/${roomCode.value}`)

watch(
  roomCode,
  (code) => {
    if (game.roomCode && game.roomCode !== code) {
      game.leaveRoom()
    }
  },
  { immediate: true },
)

function rejoinRoom() {
  game.joinRoom({
    sessionId: session.sessionId,
    username: session.username,
    roomCode: roomCode.value,
    password: password.value.trim() || undefined,
  })
}

function leaveRoom() {
  game.leaveRoom()
  router.push('/')
}

async function copyInvite() {
  await navigator.clipboard.writeText(inviteLink.value)
}
</script>
