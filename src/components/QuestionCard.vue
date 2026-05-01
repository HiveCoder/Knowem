<template>
  <section class="glass-panel overflow-hidden p-6 sm:p-8" v-motion :initial="{ opacity: 0, y: 18 }" :enter="{ opacity: 1, y: 0 }">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <span class="pill !border-amber-400/20 !bg-amber-400/10 !text-amber-100">{{ phaseLabel }}</span>
      <span v-if="countdownText" class="pill !border-white/10 !bg-white/[0.04] !text-slate-300">{{ countdownText }}</span>
    </div>
    <div class="mt-6 rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(24,18,10,0.62),rgba(12,18,31,0.84))] px-6 py-7 text-center shadow-[0_18px_40px_rgba(2,6,23,0.16)]">
      <p class="text-sm uppercase tracking-[0.35em] text-slate-500">Question card</p>
      <h2 class="mt-4 text-2xl font-semibold leading-tight tracking-tight text-white sm:text-4xl">
        {{ question || 'Waiting for the next reveal...' }}
      </h2>
      <p class="mt-4 text-sm text-slate-400">Read the prompt, frame your answer, and keep the table guessing.</p>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import type { Phase } from '@/types/game'

const props = defineProps<{
  question: string | null
  phase: Phase
  turnEndsAt: number | null
}>()

const now = ref(Date.now())
let timer: number | undefined

onMounted(() => {
  timer = window.setInterval(() => {
    now.value = Date.now()
  }, 1000)
})

onBeforeUnmount(() => {
  window.clearInterval(timer)
})

const phaseLabel = computed(() => props.phase.replace('_', ' '))
const countdownText = computed(() => {
  if (!props.turnEndsAt) {
    return ''
  }
  const seconds = Math.max(0, Math.ceil((props.turnEndsAt - now.value) / 1000))
  return `${seconds}s left`
})
</script>
