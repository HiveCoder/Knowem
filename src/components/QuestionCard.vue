<template>
  <section class="glass-panel overflow-hidden p-6 sm:p-8" v-motion :initial="{ opacity: 0, y: 18 }" :enter="{ opacity: 1, y: 0 }">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <span class="pill">{{ phaseLabel }}</span>
      <span v-if="countdownText" class="pill !border-coral-400/30 !text-coral-400">{{ countdownText }}</span>
    </div>
    <div class="mt-6">
      <p class="text-sm uppercase tracking-[0.35em] text-slate-500">Question card</p>
      <h2 class="mt-3 font-display text-2xl leading-tight text-white sm:text-4xl">
        {{ question || 'Waiting for the next reveal...' }}
      </h2>
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
