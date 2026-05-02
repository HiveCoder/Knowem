<template>
  <transition name="fade">
    <div v-if="open" class="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/70 px-4 backdrop-blur-sm">
      <div class="glass-panel w-full max-w-4xl p-6 sm:p-8" v-motion :initial="{ opacity: 0, scale: 0.96, y: 16 }" :enter="{ opacity: 1, scale: 1, y: 0 }">
        <div class="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p class="pill">Round recap</p>
            <h3 class="mt-4 font-display text-3xl text-white sm:text-4xl">Truths, lies, and fallout</h3>
            <p class="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
              The verdict is in. Review who sold the bluff, where the judge scored, and how the round points shifted before the next deal.
            </p>
          </div>
          <button class="rounded-full border border-white/10 p-2 text-slate-400 transition hover:border-white/20 hover:text-white" @click="$emit('close')">
            <span class="sr-only">Close results</span>
            <svg viewBox="0 0 20 20" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="1.6">
              <path d="M5 5l10 10M15 5 5 15" stroke-linecap="round" />
            </svg>
          </button>
        </div>

        <div class="mt-6 grid gap-3 sm:grid-cols-3">
          <div class="rounded-[24px] border border-white/10 bg-white/[0.04] p-4">
            <p class="text-[11px] uppercase tracking-[0.24em] text-slate-500">Judge reads</p>
            <p class="mt-3 text-3xl font-semibold text-white">{{ correctCalls }}</p>
            <p class="mt-2 text-sm text-slate-400">correct calls this round</p>
          </div>
          <div class="rounded-[24px] border border-white/10 bg-white/[0.04] p-4">
            <p class="text-[11px] uppercase tracking-[0.24em] text-slate-500">Bluff escapes</p>
            <p class="mt-3 text-3xl font-semibold text-white">{{ deceptiveWins }}</p>
            <p class="mt-2 text-sm text-slate-400">lies that slipped past the verdict</p>
          </div>
          <div class="rounded-[24px] border border-white/10 bg-white/[0.04] p-4">
            <p class="text-[11px] uppercase tracking-[0.24em] text-slate-500">Round swing</p>
            <p class="mt-3 text-3xl font-semibold text-white">{{ totalPointsAwarded }}</p>
            <p class="mt-2 text-sm text-slate-400">points distributed across the table</p>
          </div>
        </div>

        <div class="mt-6 grid gap-3">
          <article
            v-for="result in orderedResults"
            :key="result.playerId"
            class="rounded-[28px] border px-5 py-5 transition"
            :class="resultCardClass(result)"
          >
            <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div class="min-w-0">
                <div class="flex flex-wrap items-center gap-2.5">
                  <p class="text-lg font-semibold text-white">{{ result.username }}</p>
                  <span class="pill !border-white/10 !bg-white/[0.06] !text-slate-200">{{ resultLabel(result) }}</span>
                  <span class="pill" :class="result.actualRole === 'false' ? '!border-rose-400/20 !bg-rose-400/10 !text-rose-200' : '!border-cyan-400/20 !bg-cyan-400/10 !text-cyan-200'">
                    {{ roleLabel(result.actualRole) }}
                  </span>
                </div>
                <p class="mt-3 text-sm text-slate-300">
                  Judge called <span class="font-medium text-white">{{ roleLabel(result.guessedRole) }}</span>
                  and the table revealed <span class="font-medium text-white">{{ roleLabel(result.actualRole) }}</span>.
                </p>
              </div>

              <div class="grid gap-3 sm:grid-cols-2 lg:min-w-[280px]">
                <div class="rounded-[22px] border border-white/10 bg-slate-950/40 px-4 py-3">
                  <p class="text-[11px] uppercase tracking-[0.24em] text-slate-500">Judge points</p>
                  <p class="mt-2 text-2xl font-semibold text-amber-200">+{{ result.awardedToAdjudicator }}</p>
                </div>
                <div class="rounded-[22px] border border-white/10 bg-slate-950/40 px-4 py-3">
                  <p class="text-[11px] uppercase tracking-[0.24em] text-slate-500">Player points</p>
                  <p class="mt-2 text-2xl font-semibold text-cyan-200">+{{ result.awardedToPlayer }}</p>
                </div>
              </div>
            </div>
          </article>
        </div>

        <div class="mt-6 flex flex-col gap-3 rounded-[28px] border border-white/10 bg-[rgba(8,12,22,0.5)] p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p class="text-sm font-medium text-white">{{ canAdvance ? 'Host can continue when ready.' : 'Waiting for the host to deal the next round.' }}</p>
            <p class="mt-1 text-sm text-slate-400">Close this recap if you want the table visible while scores settle.</p>
          </div>
          <button
            class="action-button w-full bg-cyan-400 text-slate-950 hover:bg-cyan-300 sm:w-auto sm:min-w-48"
            :disabled="!canAdvance"
            @click="$emit('nextRound')"
          >
            Next round
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { RoundResult } from '@/types/game'

const props = defineProps<{
  open: boolean
  results: RoundResult[]
  canAdvance: boolean
}>()

defineEmits<{
  close: []
  nextRound: []
}>()

const orderedResults = computed(() =>
  [...props.results].sort((left, right) => {
    const leftTotal = left.awardedToAdjudicator + left.awardedToPlayer
    const rightTotal = right.awardedToAdjudicator + right.awardedToPlayer
    return rightTotal - leftTotal
  }),
)

const correctCalls = computed(() => props.results.filter((result) => result.guessedRole === result.actualRole).length)
const deceptiveWins = computed(() => props.results.filter((result) => result.actualRole === 'false' && result.guessedRole !== result.actualRole).length)
const totalPointsAwarded = computed(() =>
  props.results.reduce((total, result) => total + result.awardedToAdjudicator + result.awardedToPlayer, 0),
)

function roleLabel(role: RoundResult['actualRole']) {
  return role === 'false' ? 'Lie' : 'Truth'
}

function resultLabel(result: RoundResult) {
  if (result.guessedRole === result.actualRole) {
    return 'Judge read it right'
  }
  if (result.actualRole === 'false') {
    return 'Bluff landed'
  }
  return 'Truth slipped by'
}

function resultCardClass(result: RoundResult) {
  if (result.guessedRole === result.actualRole) {
    return 'border-emerald-400/20 bg-emerald-400/[0.08]'
  }
  if (result.actualRole === 'false') {
    return 'border-rose-400/20 bg-rose-400/[0.08]'
  }
  return 'border-cyan-400/20 bg-cyan-400/[0.08]'
}
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
