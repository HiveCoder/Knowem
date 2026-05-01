<template>
  <UiPanel padding="sm" class="h-full">
    <div class="flex items-center justify-between gap-3">
      <div>
        <p class="text-xs uppercase tracking-[0.24em] text-slate-500">Table roster</p>
        <h3 class="mt-2 text-lg font-semibold text-white">Players</h3>
      </div>
      <UiBadge tone="muted">{{ players.length }}/8</UiBadge>
    </div>
    <div class="mt-4 grid gap-3" :class="compact ? 'sm:grid-cols-2 xl:grid-cols-1' : ''">
      <PlayerCard v-for="player in players" :key="player.id" :player="player" :is-self="player.id === selfId" :compact="compact" />
    </div>
  </UiPanel>
</template>

<script setup lang="ts">
import PlayerCard from './PlayerCard.vue'
import UiBadge from '@/components/ui/UiBadge.vue'
import UiPanel from '@/components/ui/UiPanel.vue'
import type { PublicPlayer } from '@/types/game'

defineProps<{
  players: PublicPlayer[]
  selfId: string
  compact?: boolean
}>()
</script>
