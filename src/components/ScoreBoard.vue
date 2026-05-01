<template>
  <UiPanel padding="sm">
    <div class="flex items-center justify-between gap-3">
      <div>
        <p class="text-xs uppercase tracking-[0.24em] text-slate-500">Snapshot</p>
        <h3 class="mt-2 text-lg font-semibold text-white">Scoreboard</h3>
      </div>
      <UiBadge tone="muted">Live</UiBadge>
    </div>
    <div class="mt-4 space-y-3">
      <div
        v-for="player in rankedPlayers"
        :key="player.id"
        class="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3"
      >
        <div>
          <p class="font-medium text-white">{{ player.username }}</p>
          <p class="text-xs uppercase tracking-[0.24em] text-slate-500">
            {{ player.isAdjudicator ? 'adjudicator' : 'contestant' }}
          </p>
        </div>
        <div class="text-lg font-semibold text-slate-100">{{ player.score }}</div>
      </div>
    </div>
  </UiPanel>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import UiBadge from '@/components/ui/UiBadge.vue'
import UiPanel from '@/components/ui/UiPanel.vue'
import type { PublicPlayer } from '@/types/game'

const props = defineProps<{
  players: PublicPlayer[]
}>()

const rankedPlayers = computed(() => [...props.players].sort((left, right) => right.score - left.score))
</script>
