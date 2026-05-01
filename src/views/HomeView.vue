<template>
  <div class="grid min-h-[calc(100vh-3rem)] items-center gap-8 lg:grid-cols-[1.1fr_0.9fr]">
    <section class="space-y-6">
      <span class="pill">Realtime party game</span>
      <div class="max-w-3xl">
        <h1 class="font-display text-5xl leading-none text-white sm:text-6xl xl:text-7xl">
          Bluff boldly. Judge badly. Knowem anyway.
        </h1>
        <p class="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
          Knowem is a dark, fast social deduction table where one player judges a room full of truths, lies, and wild-card chaos in realtime.
        </p>
      </div>

      <div class="glass-panel max-w-xl p-5 sm:p-6">
        <label class="text-sm uppercase tracking-[0.28em] text-slate-500">Username</label>
        <input v-model="username" class="input-shell mt-3" maxlength="20" placeholder="Choose a display name" />
        <p class="mt-3 text-sm text-slate-400">No account required. Your temporary identity stays in local storage for quick reconnects.</p>
      </div>

      <div class="flex flex-wrap gap-4">
        <button class="action-button bg-cyan-400 text-slate-950 hover:bg-cyan-300" :disabled="!game.isBackendReachable" @click="createOpen = true">Create room</button>
        <button class="action-button border border-white/10 bg-white/5 text-white hover:bg-white/10" :disabled="!game.isBackendReachable" @click="joinOpen = true">Join room</button>
      </div>

      <div v-if="!game.isBackendReachable || game.isConnecting" class="glass-panel max-w-xl p-5 sm:p-6">
        <p class="text-sm uppercase tracking-[0.28em] text-slate-500">Connection</p>
        <h3 class="mt-3 font-display text-2xl text-white">
          {{ game.isConnecting ? 'Connecting to realtime backend...' : 'Realtime backend unavailable' }}
        </h3>
        <p class="mt-3 text-sm text-slate-300">
          {{ game.backendStatusMessage || `Set VITE_SOCKET_URL to your hosted Socket.io backend before deploying to Vercel.` }}
        </p>
      </div>

      <div class="grid gap-4 sm:grid-cols-3">
        <div class="glass-panel p-4">
          <p class="text-sm uppercase tracking-[0.24em] text-slate-500">Core loop</p>
          <p class="mt-2 text-sm text-slate-300">Reveal the question, answer under a hidden role, then let the adjudicator pick apart the room.</p>
        </div>
        <div class="glass-panel p-4">
          <p class="text-sm uppercase tracking-[0.24em] text-slate-500">Realtime</p>
          <p class="mt-2 text-sm text-slate-300">Room presence, chat, readiness, scoring, and round transitions are all Socket.io-driven.</p>
        </div>
        <div class="glass-panel p-4">
          <p class="text-sm uppercase tracking-[0.24em] text-slate-500">Responsive</p>
          <p class="mt-2 text-sm text-slate-300">Built for mobile and desktop with animated cards, glass panels, and a table-first layout.</p>
        </div>
      </div>
    </section>

    <section class="glass-panel overflow-hidden p-6 sm:p-8">
      <div class="flex items-center justify-between">
        <span class="pill">Live preview</span>
        <span class="pill !border-coral-400/20 !text-coral-300">Dark mode</span>
      </div>

      <div class="mt-6 grid gap-4">
        <div class="rounded-[28px] border border-white/10 bg-slate-950/60 p-5">
          <p class="text-xs uppercase tracking-[0.34em] text-slate-500">Question</p>
          <h2 class="mt-3 font-display text-3xl text-white">{{ featuredQuestion }}</h2>
        </div>
        <div class="grid gap-4 sm:grid-cols-2">
          <ActionCard title="Truth Card" subtitle="Answer honestly" tone="truth" :revealed="true" />
          <ActionCard title="False Card" subtitle="Sell the lie" tone="false" :revealed="true" />
        </div>
      </div>
    </section>

    <CreateRoomModal :open="createOpen" :username="session.username" @close="createOpen = false" @create="handleCreate" />
    <JoinRoomModal :open="joinOpen" :username="session.username" @close="joinOpen = false" @join="handleJoin" />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import ActionCard from '@/components/ActionCard.vue'
import CreateRoomModal from '@/components/CreateRoomModal.vue'
import JoinRoomModal from '@/components/JoinRoomModal.vue'
import { sampleQuestions } from '@/assets/questions'
import { useGameStore } from '@/stores/game'
import { useSessionStore } from '@/stores/session'

const router = useRouter()
const session = useSessionStore()
const game = useGameStore()

const createOpen = ref(false)
const joinOpen = ref(false)
const username = computed({
  get: () => session.username,
  set: (value: string) => session.setUsername(value),
})
const featuredQuestion = sampleQuestions[0]

watch(
  () => game.roomCode,
  (code) => {
    if (code) {
      createOpen.value = false
      joinOpen.value = false
      router.push(`/room/${code}`)
    }
  },
)

function handleCreate(payload: { roomName: string; roomCode: string; password?: string }) {
  game.createRoom({
    sessionId: session.sessionId,
    username: session.username,
    roomCode: payload.roomCode,
    roomName: payload.roomName,
    password: payload.password,
  })
}

function handleJoin(payload: { roomCode: string; password?: string }) {
  game.joinRoom({
    sessionId: session.sessionId,
    username: session.username,
    roomCode: payload.roomCode,
    password: payload.password,
  })
}
</script>
