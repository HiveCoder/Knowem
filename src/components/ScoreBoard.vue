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
    <div class="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4">
      <p class="text-[11px] uppercase tracking-[0.24em] text-slate-500">Points guide</p>
      <div class="mt-3 grid gap-3 sm:grid-cols-3">
        <div>
          <p class="text-sm font-medium text-white">Judge points</p>
          <p class="mt-1 text-xs leading-5 text-slate-400">Correct truth or lie reads increase the adjudicator score.</p>
        </div>
        <div>
          <p class="text-sm font-medium text-white">Player points</p>
          <p class="mt-1 text-xs leading-5 text-slate-400">Contestants score when a bluff lands or a modifier protects their answer.</p>
        </div>
        <div>
          <p class="text-sm font-medium text-white">Wild swings</p>
          <p class="mt-1 text-xs leading-5 text-slate-400">Effects like `spotlight`, `counter`, and `reverse read` can change who gets paid.</p>
        </div>
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
