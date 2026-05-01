<template>
  <section class="glass-panel p-5 sm:p-6">
    <div class="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
      <div>
        <span class="pill">Lobby</span>
        <h2 class="mt-4 font-display text-3xl text-white">{{ room.name }}</h2>
        <p class="mt-2 max-w-2xl text-sm text-slate-300">
          Invite friends with code <span class="font-semibold text-cyan-300">{{ room.code }}</span> and get everyone ready before the host starts the first round.
        </p>
        <p class="mt-2 text-sm text-slate-500">
          Running solo works too. Add bots to fill the table and the server will play their turns automatically.
        </p>
      </div>
      <div class="grid gap-3 sm:grid-cols-2 lg:w-[560px]">
        <button
          class="action-button bg-white text-slate-950 hover:bg-slate-200"
          @click="$emit('toggleReady')"
        >
          {{ selfPlayer?.ready ? 'Unready' : 'Ready up' }}
        </button>
        <button
          class="action-button border border-white/10 bg-white/5 text-white hover:bg-white/10"
          :disabled="!canAddBot"
          @click="$emit('addBot')"
        >
          Add bot
        </button>
        <button
          class="action-button border border-white/10 bg-white/5 text-white hover:bg-white/10"
          :disabled="!canAddBot"
          @click="$emit('autofillBots')"
        >
          Auto-fill table
        </button>
        <button
          class="action-button bg-cyan-400 text-slate-950 hover:bg-cyan-300"
          :disabled="!canStart"
          @click="$emit('startGame')"
        >
          Start game
        </button>
      </div>
    </div>

    <div class="mt-6 grid gap-4 rounded-3xl border border-white/10 bg-slate-950/40 p-4 lg:grid-cols-2">
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
          class="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-left text-sm text-white transition hover:border-cyan-400/40"
          type="button"
          @click="toggleBotDms"
        >
          <span>{{ room.botSettings.allowBotDirectMessages ? 'Bots can DM players' : 'Bots stay in room chat only' }}</span>
          <span class="pill !px-2 !py-0.5">{{ room.botSettings.allowBotDirectMessages ? 'on' : 'off' }}</span>
        </button>
      </label>
      <div class="rounded-2xl border border-cyan-400/15 bg-cyan-400/8 p-4 lg:col-span-2">
        <p class="text-xs uppercase tracking-[0.24em] text-cyan-300">Difficulty hint</p>
        <p class="mt-2 text-sm text-slate-200">{{ difficultyHint }}</p>
      </div>
    </div>

    <div class="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <div v-for="player in room.players" :key="player.id" class="rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3">
        <div class="flex items-center justify-between gap-3">
          <div>
            <p class="font-medium text-white">{{ player.username }}</p>
            <p class="text-xs uppercase tracking-[0.24em] text-slate-500">{{ player.connected ? 'online' : 'offline' }}</p>
          </div>
          <span class="pill" :class="player.ready ? '!border-cyan-400/30 !text-cyan-300' : '!text-slate-500'">
            {{ player.ready ? 'ready' : 'waiting' }}
          </span>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
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
