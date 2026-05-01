<template>
  <UiPanel padding="lg">
    <div class="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
      <div>
        <UiBadge tone="accent">Lobby</UiBadge>
        <h2 class="mt-4 text-3xl font-semibold tracking-tight text-white">{{ room.name }}</h2>
        <p class="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
          Invite friends with code <span class="font-semibold text-blue-300">{{ room.code }}</span> and get everyone ready before the host starts the first round.
        </p>
        <p class="mt-2 text-sm text-slate-500">
          Running solo works too. Add bots to fill the table and the server will play their turns automatically.
        </p>
      </div>
      <div class="grid gap-3 sm:grid-cols-2 lg:w-[560px]">
        <UiButton variant="primary" @click="$emit('toggleReady')">
          {{ selfPlayer?.ready ? 'Unready' : 'Ready up' }}
        </UiButton>
        <UiButton variant="secondary" :disabled="!canAddBot" @click="$emit('addBot')">
          Add bot
        </UiButton>
        <UiButton variant="secondary" :disabled="!canAddBot" @click="$emit('autofillBots')">
          Auto-fill table
        </UiButton>
        <UiButton variant="secondary" :disabled="!canStart" @click="$emit('startGame')">
          Start game
        </UiButton>
      </div>
    </div>

    <div class="mt-6 grid gap-4 rounded-[28px] border border-white/10 bg-[rgba(12,19,35,0.78)] p-4 lg:grid-cols-2">
      <label class="space-y-2">
        <span class="text-xs uppercase tracking-[0.24em] text-slate-500">Bot difficulty</span>
        <select class="input-shell" :value="room.botSettings.difficulty" @change="handleDifficultyChange">
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
      </label>
      <label class="space-y-2">
        <span class="text-xs uppercase tracking-[0.24em] text-slate-500">Auto-fill target</span>
        <select class="input-shell" :value="String(room.botSettings.targetPlayerCount)" @change="handleTargetChange">
          <option v-for="count in targetOptions" :key="count" :value="String(count)">{{ count }} players</option>
        </select>
      </label>
      <label class="space-y-2 lg:col-span-2">
        <span class="text-xs uppercase tracking-[0.24em] text-slate-500">Bot DM policy</span>
        <button
          class="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-left text-sm text-white transition hover:border-[rgba(124,156,255,0.36)]"
          type="button"
          @click="toggleBotDms"
        >
          <span>{{ room.botSettings.allowBotDirectMessages ? 'Bots can DM players' : 'Bots stay in room chat only' }}</span>
          <UiBadge tone="muted">{{ room.botSettings.allowBotDirectMessages ? 'on' : 'off' }}</UiBadge>
        </button>
      </label>
      <div class="rounded-2xl border border-[rgba(124,156,255,0.16)] bg-[rgba(124,156,255,0.08)] p-4 lg:col-span-2">
        <p class="text-xs uppercase tracking-[0.24em] text-blue-300">Difficulty hint</p>
        <p class="mt-2 text-sm text-slate-200">{{ difficultyHint }}</p>
      </div>
    </div>

    <div class="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <div v-for="player in room.players" :key="player.id" class="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
        <div class="flex items-center justify-between gap-3">
          <div>
            <p class="font-medium text-white">{{ player.username }}</p>
            <p class="text-xs uppercase tracking-[0.24em] text-slate-500">{{ player.connected ? 'online' : 'offline' }}</p>
          </div>
          <UiBadge :tone="player.ready ? 'accent' : 'muted'">
            {{ player.ready ? 'ready' : 'waiting' }}
          </UiBadge>
        </div>
      </div>
    </div>
  </UiPanel>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import UiBadge from '@/components/ui/UiBadge.vue'
import UiButton from '@/components/ui/UiButton.vue'
import UiPanel from '@/components/ui/UiPanel.vue'
import type { BotDifficulty, RoomState } from '@/types/game'

const props = defineProps<{
  room: RoomState
  selfId: string
  canStart: boolean
  canAddBot: boolean
}>()

const emit = defineEmits<{
  toggleReady: []
  addBot: []
  autofillBots: []
  updateBotSettings: [settings: { difficulty?: BotDifficulty; targetPlayerCount?: number }]
  startGame: []
}>()

const selfPlayer = computed(() => props.room.players.find((player) => player.id === props.selfId) ?? null)
const targetOptions = computed(() => Array.from({ length: props.room.maxPlayers - 1 }, (_value, index) => index + 2))
const difficultyHint = computed(() => {
  if (props.room.botSettings.difficulty === 'easy') {
    return 'Easy bots miss plenty of tells, overreact often, and only catch a small share of bluffs.'
  }
  if (props.room.botSettings.difficulty === 'hard') {
    return 'Hard bots read the room sharply, punish weak lies, and make adjudicator rounds noticeably harsher.'
  }
  return 'Medium bots are balanced: credible at reading the table without feeling omniscient.'
})

function handleDifficultyChange(event: Event) {
  const target = event.target as HTMLSelectElement
  emit('updateBotSettings', { difficulty: target.value as BotDifficulty })
}

function handleTargetChange(event: Event) {
  const target = event.target as HTMLSelectElement
  emit('updateBotSettings', { targetPlayerCount: Number(target.value) })
}

function toggleBotDms() {
  emit('updateBotSettings', { allowBotDirectMessages: !props.room.botSettings.allowBotDirectMessages })
}
</script>
