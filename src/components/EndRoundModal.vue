<template>
  <transition name="fade">
    <div v-if="open" class="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/70 px-4 backdrop-blur-sm">
      <div class="glass-panel w-full max-w-2xl p-6 sm:p-8" v-motion :initial="{ opacity: 0, scale: 0.96, y: 16 }" :enter="{ opacity: 1, scale: 1, y: 0 }">
        <div class="flex items-center justify-between gap-3">
          <div>
            <p class="pill">Round recap</p>
            <h3 class="mt-4 font-display text-3xl text-white">Truths, lies, and fallout</h3>
          </div>
          <button class="rounded-full border border-white/10 p-2 text-slate-400 transition hover:text-white" @click="$emit('close')">Skip</button>
        </div>

        <div class="mt-6 space-y-3">
          <div v-for="result in results" :key="result.playerId" class="rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-4">
            <div class="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p class="font-medium text-white">{{ result.username }}</p>
                <p class="text-sm text-slate-400">Guess: {{ result.guessedRole }} · Actual: {{ result.actualRole }}</p>
              </div>
              <div class="text-right text-sm">
                <p class="text-gold-400">Judge +{{ result.awardedToAdjudicator }}</p>
                <p class="text-cyan-300">Player +{{ result.awardedToPlayer }}</p>
              </div>
            </div>
          </div>
        </div>

        <button
          class="action-button mt-6 w-full bg-cyan-400 text-slate-950 hover:bg-cyan-300"
          :disabled="!canAdvance"
          @click="$emit('nextRound')"
        >
          Next round
        </button>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import type { RoundResult } from '@/types/game'

defineProps<{
  open: boolean
  results: RoundResult[]
  canAdvance: boolean
}>()

defineEmits<{
  close: []
  nextRound: []
}>()
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.18s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
