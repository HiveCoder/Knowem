<template>
  <div
    class="rounded-2xl border px-4 py-3 transition duration-200 hover:-translate-y-0.5 hover:border-[rgba(124,156,255,0.22)]"
    :class="[
      isSelf ? 'border-[rgba(124,156,255,0.46)] bg-[rgba(124,156,255,0.10)]' : 'border-white/10 bg-white/[0.03]',
      player.isAdjudicator ? 'shadow-[0_0_0_1px_rgba(124,156,255,0.18)]' : '',
    ]"
  >
    <div class="flex items-center gap-3">
      <div class="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950/70 text-sm font-semibold text-blue-200">
        {{ player.avatarSeed || player.username.slice(0, 2).toUpperCase() }}
      </div>
      <div class="min-w-0 flex-1">
        <div class="flex items-center gap-2">
          <p class="truncate font-medium text-white">{{ player.username }}</p>
          <UiBadge v-if="isSelf" tone="accent">you</UiBadge>
          <UiBadge v-if="player.isBot" tone="muted">bot</UiBadge>
          <UiBadge v-if="player.isAdjudicator" tone="accent">judge</UiBadge>
        </div>
        <p class="text-xs text-slate-400">
          {{ playerStatus }}
        </p>
        <p v-if="!compact && player.isBot && player.botPersonalityLabel" class="mt-1 text-[11px] uppercase tracking-[0.22em] text-blue-300">
          {{ player.botPersonalityLabel }}
        </p>
        <p v-if="!compact && player.isBot && player.botPersonalityHint" class="mt-1 text-xs text-slate-500">
          {{ player.botPersonalityHint }}
        </p>
      </div>
      <div class="text-right text-sm">
        <div class="font-semibold text-slate-100">{{ player.score }}</div>
        <div class="text-[11px] uppercase tracking-[0.24em] text-slate-500">pts</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import UiBadge from '@/components/ui/UiBadge.vue'
import type { PublicPlayer } from '@/types/game'

const props = defineProps<{
  player: PublicPlayer
  isSelf?: boolean
  compact?: boolean
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
