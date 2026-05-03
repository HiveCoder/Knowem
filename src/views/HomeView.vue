<template>
  <div class="grid min-h-[calc(100vh-3rem)] items-center gap-8 lg:grid-cols-[1.08fr_0.92fr]">
    <section class="space-y-6">
      <UiBadge tone="accent">Realtime party game</UiBadge>
      <div class="max-w-3xl">
        <h1 class="text-5xl font-semibold leading-none tracking-tight text-white sm:text-6xl xl:text-7xl">
          Bluff boldly. Judge badly. Knowem anyway.
        </h1>
        <p class="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
          Knowem is a dark, fast social deduction table where one player judges a room full of truths, lies, and wild-card chaos in realtime.
        </p>
      </div>

      <UiPanel class="max-w-xl" padding="lg">
        <label class="text-sm uppercase tracking-[0.28em] text-slate-500">Username</label>
        <input v-model="username" class="input-shell mt-3" maxlength="20" placeholder="Choose a display name" />
        <p class="mt-3 text-sm text-slate-400">No account required. Your temporary identity stays in local storage for quick reconnects.</p>
      </UiPanel>

      <div class="flex flex-wrap gap-4">
        <UiButton variant="primary" :disabled="!game.isBackendReachable" @click="createOpen = true">Create room</UiButton>
        <UiButton variant="secondary" :disabled="!game.isBackendReachable" @click="joinOpen = true">Join room</UiButton>
      </div>

      <UiPanel v-if="!game.hasRealtimeConfig" class="max-w-2xl border-amber-400/20 bg-amber-400/10" padding="lg">
        <p class="text-sm uppercase tracking-[0.28em] text-amber-200/80">Deployment setup required</p>
        <h3 class="mt-3 text-2xl font-semibold tracking-tight text-white">Realtime is disabled until Vercel knows your backend URL.</h3>
        <p class="mt-3 text-sm leading-6 text-slate-200">
          Set <span class="font-semibold text-white">VITE_SOCKET_URL</span> in Vercel to your deployed backend HTTPS origin, then make sure the backend
          <span class="font-semibold text-white">CORS_ORIGIN</span> includes your Vercel frontend domain.
        </p>
        <div class="mt-4 rounded-2xl border border-white/10 bg-slate-950/40 p-4 text-sm text-slate-300">
          <p><span class="font-semibold text-white">Vercel:</span> <span class="font-mono">VITE_SOCKET_URL=https://your-backend-host.example.com</span></p>
          <p class="mt-2"><span class="font-semibold text-white">Backend:</span> <span class="font-mono">CORS_ORIGIN=https://your-app.vercel.app</span></p>
        </div>
      </UiPanel>

      <UiPanel v-if="!game.isBackendReachable || game.isConnecting" class="max-w-xl" padding="lg">
        <p class="text-sm uppercase tracking-[0.28em] text-slate-500">Connection</p>
        <h3 class="mt-3 text-2xl font-semibold tracking-tight text-white">
          {{ game.isConnecting ? 'Connecting to realtime backend...' : 'Realtime backend unavailable' }}
        </h3>
        <p class="mt-3 text-sm text-slate-300">
          {{ game.backendStatusMessage || `Set VITE_SOCKET_URL to your hosted Socket.io backend before deploying to Vercel.` }}
        </p>
      </UiPanel>

      <div class="grid gap-4 sm:grid-cols-3">
        <UiPanel padding="sm">
          <p class="text-sm uppercase tracking-[0.24em] text-slate-500">Core loop</p>
          <p class="mt-2 text-sm text-slate-300">Reveal the question, answer under a hidden role, then let the adjudicator pick apart the room.</p>
        </UiPanel>
        <UiPanel padding="sm">
          <p class="text-sm uppercase tracking-[0.24em] text-slate-500">Realtime</p>
          <p class="mt-2 text-sm text-slate-300">Room presence, chat, readiness, scoring, and round transitions are all Socket.io-driven.</p>
        </UiPanel>
        <UiPanel padding="sm">
          <p class="text-sm uppercase tracking-[0.24em] text-slate-500">Responsive</p>
          <p class="mt-2 text-sm text-slate-300">Built for mobile and desktop with animated cards, glass panels, and a table-first layout.</p>
        </UiPanel>
      </div>
    </section>

    <UiPanel class="overflow-hidden" padding="lg">
      <div class="flex items-center justify-between">
        <UiBadge tone="muted">Live preview</UiBadge>
        <UiBadge tone="accent">Dark mode</UiBadge>
      </div>

      <div class="mt-6 grid gap-4">
        <div class="rounded-[28px] border border-white/10 bg-[rgba(8,12,22,0.46)] p-5">
          <p class="text-xs uppercase tracking-[0.34em] text-slate-500">Question</p>
          <h2 class="mt-3 text-3xl font-semibold tracking-tight text-white">{{ featuredQuestion }}</h2>
        </div>
        <div class="grid justify-center gap-3 sm:grid-cols-2 sm:gap-4">
          <div class="mx-auto w-full max-w-[11rem] sm:max-w-[12rem]">
            <ActionCard title="Truth Card" subtitle="Answer honestly" tone="truth" :revealed="true" />
          </div>
          <div class="mx-auto w-full max-w-[11rem] sm:max-w-[12rem]">
            <ActionCard title="False Card" subtitle="Sell the lie" tone="false" :revealed="true" />
          </div>
        </div>
      </div>
    </UiPanel>

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
import UiBadge from '@/components/ui/UiBadge.vue'
import UiButton from '@/components/ui/UiButton.vue'
import UiPanel from '@/components/ui/UiPanel.vue'
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
