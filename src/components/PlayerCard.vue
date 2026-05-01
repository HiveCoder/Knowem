<template>
  <div
    class="rounded-2xl border px-4 py-3 transition"
    :class="[
      isSelf ? 'border-cyan-400/60 bg-cyan-400/10' : 'border-white/10 bg-white/5',
      player.isAdjudicator ? 'shadow-[0_0_0_1px_rgba(248,214,109,0.35)]' : '',
    ]"
  >
    <div class="flex items-center gap-3">
      <div class="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950/70 font-display text-sm font-semibold text-cyan-300">
        {{ player.avatarSeed || player.username.slice(0, 2).toUpperCase() }}
      </div>
      <div class="min-w-0 flex-1">
        <div class="flex items-center gap-2">
          <p class="truncate font-medium text-white">{{ player.username }}</p>
          <span v-if="isSelf" class="pill !px-2 !py-0.5">you</span>
          <span v-if="player.isBot" class="pill !border-cyan-400/30 !text-cyan-300">bot</span>
          <span v-if="player.isAdjudicator" class="pill !border-gold-400/30 !text-gold-400">judge</span>
        </div>
        <p class="text-xs text-slate-400">
          {{ playerStatus }}
        </p>
        <p v-if="player.isBot && player.botPersonalityLabel" class="mt-1 text-[11px] uppercase tracking-[0.22em] text-cyan-400">
          {{ player.botPersonalityLabel }}
        </p>
        <p v-if="player.isBot && player.botPersonalityHint" class="mt-1 text-xs text-slate-500">
          {{ player.botPersonalityHint }}
        </p>
      </div>
      <div class="text-right text-sm">
        <div class="font-semibold text-gold-400">{{ player.score }}</div>
        <div class="text-[11px] uppercase tracking-[0.24em] text-slate-500">pts</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { PublicPlayer } from '@/types/game'

const props = defineProps<{
  player: PublicPlayer
  isSelf?: boolean
}>()

const playerStatus = computed(() => {
  if (!props.player.connected) {
    return 'Disconnected'
  }
  if (props.player.isBot) {
    return 'Ready bot'
  }
  return props.player.ready ? 'Ready' : 'Not ready'
})
</script>
