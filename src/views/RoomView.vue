<template>
  <div v-if="room" class="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-[1460px] items-start py-2 sm:py-4">
    <div class="w-full space-y-6 pb-36 sm:pb-24">
      <div class="grid gap-6 xl:grid-cols-[minmax(0,1.22fr)_380px]">
        <UiPanel tag="header" padding="lg" class="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div class="min-w-0">
            <div class="flex flex-wrap items-center gap-2.5">
              <UiBadge tone="accent">Room {{ room.code }}</UiBadge>
              <UiBadge tone="muted">{{ room.game.started ? `Round ${room.game.round}` : 'Lobby' }}</UiBadge>
              <UiBadge v-if="game.isHost" tone="success">Host</UiBadge>
            </div>
            <h1 class="mt-5 text-3xl font-semibold tracking-tight text-white sm:text-4xl">{{ room.name }}</h1>
            <p class="mt-2 max-w-2xl text-sm leading-6 text-slate-400">A calmer, structured table with cleaner card density, clearer hierarchy, and a centered play surface that keeps the game readable as the round evolves.</p>
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

      <div v-else class="space-y-6">
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

        <ScoreBoard :players="room.players" />
      </div>

      <ChatPanel
        :room-code="room.code"
        :messages="room.chat"
        :players="room.players"
        :self-id="game.playerId"
        :allow-bot-direct-messages="room.botSettings.allowBotDirectMessages"
        @send="game.sendChatMessage"
      />
    </div>
  </div>

  <div v-else class="mx-auto flex min-h-[72vh] w-full max-w-3xl items-center justify-center px-4 py-8 sm:px-6">
    <UiPanel class="w-full overflow-hidden" padding="lg">
      <div class="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(280px,0.9fr)] lg:items-start">
        <div class="min-w-0">
          <UiBadge tone="accent">Reconnect</UiBadge>
          <h1 class="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">Recover room {{ roomCode }}</h1>
          <p class="mt-3 max-w-xl text-sm leading-6 text-slate-400">
            Older room links now try to recover using your stored identity first. If the room is password protected or your session expired, rejoin manually below.
          </p>

          <div class="mt-6 grid gap-3 sm:grid-cols-2">
            <div class="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4">
              <p class="text-[11px] uppercase tracking-[0.24em] text-slate-500">Saved identity</p>
              <p class="mt-3 text-lg font-semibold text-white">{{ draftUsername || 'No username saved' }}</p>
              <p class="mt-1 text-sm text-slate-400">Used for fast reconnect when the backend is reachable.</p>
            </div>
            <div class="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4">
              <p class="text-[11px] uppercase tracking-[0.24em] text-slate-500">Connection</p>
              <p class="mt-3 text-lg font-semibold text-white">{{ connectionLabel }}</p>
              <p class="mt-1 text-sm text-slate-400">{{ reconnectHelperText }}</p>
            </div>
          </div>

          <div class="mt-6 rounded-[24px] border border-white/10 bg-[rgba(8,12,22,0.45)] px-4 py-4 text-sm text-slate-300">
            <p class="text-[11px] uppercase tracking-[0.22em] text-slate-500">Room recovery</p>
            <p class="mt-3 leading-6">
              {{ autoJoinMessage }}
            </p>
          </div>
        </div>

        <div class="rounded-[26px] border border-white/10 bg-[rgba(8,12,22,0.42)] p-5">
          <div class="flex items-center justify-between gap-3">
            <div>
              <p class="text-[11px] uppercase tracking-[0.24em] text-slate-500">Manual rejoin</p>
              <h2 class="mt-2 text-xl font-semibold tracking-tight text-white">Step back into the room</h2>
            </div>
            <UiBadge tone="muted">{{ game.isBackendReachable ? 'Online' : 'Offline' }}</UiBadge>
          </div>

          <div class="mt-5 space-y-4">
            <input v-model="draftUsername" class="input-shell" type="text" maxlength="20" placeholder="Display name" />
            <input v-model="password" class="input-shell" type="password" placeholder="Room password (optional)" />

            <p v-if="game.backendStatusMessage" class="rounded-2xl border border-amber-400/20 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">
              {{ game.backendStatusMessage }}
            </p>
            <p v-if="game.latestError" class="rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
              {{ game.latestError }}
            </p>

            <div class="grid gap-3 sm:grid-cols-2">
              <UiButton variant="primary" block :disabled="!canRejoin" @click="rejoinRoom">
                Rejoin room
              </UiButton>
              <UiButton variant="secondary" block @click="router.push('/')">
                Back home
              </UiButton>
            </div>
          </div>
        </div>
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
const draftUsername = ref(session.username)
const attemptedAutoRejoin = ref(false)
const roomCode = computed(() => String(route.params.code || '').toUpperCase())
const room = computed(() => (game.roomCode === roomCode.value ? game.room : null))
const inviteLink = computed(() => `${window.location.origin}/room/${roomCode.value}`)
const canRejoin = computed(() => draftUsername.value.trim().length >= 2 && game.isBackendReachable)
const connectionLabel = computed(() => {
  if (game.connectionState === 'connected') {
    return 'Live backend ready'
  }
  if (game.connectionState === 'reconnecting') {
    return 'Reconnecting'
  }
  if (game.connectionState === 'offline') {
    return 'Backend unavailable'
  }
  return 'Connecting'
})
const reconnectHelperText = computed(() => {
  if (game.connectionState === 'connected') {
    return 'Stored sessions can be restored immediately.'
  }
  if (game.connectionState === 'reconnecting') {
    return 'Waiting for the realtime service before retrying.'
  }
  if (game.connectionState === 'offline') {
    return 'Manual rejoin stays disabled until the backend comes back.'
  }
  return 'Checking realtime service health.'
})
const autoJoinMessage = computed(() => {
  if (!draftUsername.value.trim()) {
    return 'No saved username was found for this browser session, so automatic room recovery is unavailable until you enter one.'
  }
  if (attemptedAutoRejoin.value && !room.value) {
    return 'An automatic reconnect was attempted. If the room is protected or your prior session is gone, use the manual form to recover access.'
  }
  if (game.connectionState === 'connected') {
    return `When possible, Knowem will try to restore ${draftUsername.value.trim()} automatically before asking for manual re-entry.`
  }
  return 'Once the backend is reachable, this view will try a lightweight reconnect with your stored identity.'
})

watch(
  roomCode,
  (code) => {
    attemptedAutoRejoin.value = false
    if (game.roomCode && game.roomCode !== code) {
      game.leaveRoom()
    }
  },
  { immediate: true },
)

watch(
  () => session.username,
  (value) => {
    if (!draftUsername.value.trim()) {
      draftUsername.value = value
    }
  },
)

watch(
  [roomCode, () => game.connectionState, () => room.value, () => session.hasUsername],
  () => {
    if (attemptedAutoRejoin.value || room.value || !session.hasUsername || password.value.trim()) {
      return
    }
    if (game.connectionState !== 'connected') {
      return
    }

    attemptedAutoRejoin.value = true
    rejoinRoom()
  },
)

function rejoinRoom() {
  const username = draftUsername.value.trim().slice(0, 20)
  if (username.length < 2) {
    return
  }

  session.setUsername(username)
  game.joinRoom({
    sessionId: session.sessionId,
    username,
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
