<template>
  <section class="glass-panel p-4 sm:p-5">
    <div class="flex items-center justify-between">
      <h3 class="font-display text-lg text-white">Scoreboard</h3>
      <span class="pill">Live</span>
    </div>
    <div class="mt-4 space-y-3">
      <div
        v-for="player in rankedPlayers"
        :key="player.id"
        class="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3"
      >
        <div>
          <p class="font-medium text-white">{{ player.username }}</p>
          <p class="text-xs uppercase tracking-[0.24em] text-slate-500">
            {{ player.isAdjudicator ? 'adjudicator' : 'contestant' }}
          </p>
        </div>
        <div class="text-lg font-semibold text-gold-400">{{ player.score }}</div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { PublicPlayer } from '@/types/game'

const props = defineProps<{
  players: PublicPlayer[]
}>()

const rankedPlayers = computed(() => [...props.players].sort((left, right) => right.score - left.score))
</script>
