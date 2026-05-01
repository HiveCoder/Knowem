<template>
  <div class="space-y-5" v-if="room">
    <header class="glass-panel flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
      <div>
        <div class="flex flex-wrap items-center gap-3">
          <span class="pill">Room {{ room.code }}</span>
          <span class="pill">{{ room.game.started ? `Round ${room.game.round}` : 'Pre-game lobby' }}</span>
        </div>
        <h1 class="mt-4 font-display text-3xl text-white">{{ room.name }}</h1>
        <p class="mt-2 text-sm text-slate-300">Invite link: {{ inviteLink }}</p>
      </div>
      <div class="flex flex-wrap gap-3">
        <button class="action-button border border-white/10 bg-white/5 text-white hover:bg-white/10" @click="copyInvite">Copy invite</button>
        <button class="action-button bg-coral-400 text-slate-950 hover:bg-coral-300" @click="leaveRoom">Leave room</button>
      </div>
    </header>

    <div v-if="game.latestError" class="rounded-2xl border border-coral-400/30 bg-coral-400/10 px-4 py-3 text-sm text-coral-100">
      {{ game.latestError }}
    </div>

    <div v-if="game.connectionState !== 'connected'" class="rounded-2xl border border-amber-400/20 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">
      {{ game.backendStatusMessage || 'Realtime backend is reconnecting.' }}
    </div>

    <div v-if="!room.game.started" class="grid gap-5 xl:grid-cols-[1.3fr_0.7fr]">
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
      <div class="space-y-5">
        <PlayerList :players="room.players" :self-id="game.playerId" />
        <ScoreBoard :players="room.players" />
      </div>
    </div>

    <div v-else class="grid gap-5 2xl:grid-cols-[1.45fr_0.85fr_0.95fr] xl:grid-cols-[1.35fr_0.8fr]">
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
      <div class="space-y-5">
        <PlayerList :players="room.players" :self-id="game.playerId" />
        <ScoreBoard :players="room.players" />
      </div>
      <ChatPanel
        :messages="room.chat"
        :players="room.players"
        :self-id="game.playerId"
        :allow-bot-direct-messages="room.botSettings.allowBotDirectMessages"
        @send="game.sendChatMessage"
      />
    </div>
  </div>

  <div v-else class="mx-auto flex min-h-[70vh] max-w-lg items-center">
    <div class="glass-panel w-full p-6 sm:p-8">
      <span class="pill">Reconnect</span>
      <h1 class="mt-4 font-display text-3xl text-white">Join room {{ roomCode }}</h1>
      <p class="mt-3 text-sm text-slate-400">If you opened an invite link directly, enter the room password if required and reconnect with your stored username.</p>
      <p v-if="game.backendStatusMessage" class="mt-3 text-sm text-amber-200">{{ game.backendStatusMessage }}</p>
      <div class="mt-6 space-y-4">
        <input v-model="password" class="input-shell" type="password" placeholder="Room password (optional)" />
        <button class="action-button w-full bg-cyan-400 text-slate-950 hover:bg-cyan-300" :disabled="!session.hasUsername || !game.isBackendReachable" @click="rejoinRoom">
          Join room
        </button>
      </div>
    </div>
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
