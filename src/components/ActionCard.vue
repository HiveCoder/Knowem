<template>
  <div
    class="group relative h-44 [perspective:1200px]"
    v-motion
    :initial="{ opacity: 0, rotateY: 18, y: 28 }"
    :enter="{ opacity: 1, rotateY: 0, y: 0 }"
  >
    <div class="relative h-full w-full rounded-[28px] transition duration-500 group-hover:-translate-y-1 group-hover:scale-[1.02] [transform-style:preserve-3d]" :class="revealed ? '[transform:rotateY(180deg)]' : ''">
      <div class="absolute inset-0 rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(18,28,46,0.94),rgba(10,15,27,0.98))] p-5 shadow-[0_18px_34px_rgba(2,6,23,0.22)] [backface-visibility:hidden]">
        <div class="flex h-full flex-col justify-between">
          <div class="flex items-start justify-between gap-3">
            <span class="pill w-fit">Knowem</span>
            <span class="h-2.5 w-2.5 rounded-full bg-slate-400/80" />
          </div>
          <div class="space-y-3 text-center">
            <p class="text-[11px] uppercase tracking-[0.34em] text-slate-500">Hold to reveal</p>
            <h3 class="text-2xl font-semibold tracking-tight text-white">Hidden card</h3>
            <p class="text-sm text-slate-400">Premium digital cards with calm, tactile motion.</p>
          </div>
          <p class="text-center text-[11px] uppercase tracking-[0.24em] text-slate-500">Table preview</p>
        </div>
      </div>
      <div
        class="absolute inset-0 rounded-[28px] border p-5 shadow-[0_18px_34px_rgba(2,6,23,0.18)] [backface-visibility:hidden] [transform:rotateY(180deg)]"
        :class="toneClass"
      >
        <div class="flex h-full flex-col justify-between">
          <div class="flex items-start justify-between gap-3">
            <div>
              <p class="text-[11px] uppercase tracking-[0.32em] opacity-70">{{ toneLabel }}</p>
              <span class="pill mt-2 w-fit !border-current/20 !bg-black/10 !text-current">Action</span>
            </div>
            <span class="h-2.5 w-2.5 rounded-full" :class="dotClass" />
          </div>
          <div class="space-y-3 text-center">
            <p class="text-xs uppercase tracking-[0.34em] opacity-70">{{ subtitle }}</p>
            <h3 class="text-3xl font-semibold tracking-tight">{{ title }}</h3>
          </div>
          <div class="text-[11px] uppercase tracking-[0.24em] opacity-70">
            {{ footerLabel }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    title: string
    subtitle: string
    tone?: 'truth' | 'false' | 'wild' | 'question' | 'neutral'
    revealed?: boolean
  }>(),
  {
    tone: 'neutral',
    revealed: true,
  },
)

const toneClass = computed(() => {
  if (props.tone === 'truth') {
    return 'border-blue-400/30 bg-blue-400/10 text-blue-100'
  }
  if (props.tone === 'false') {
    return 'border-rose-400/30 bg-rose-400/10 text-rose-100'
  }
  if (props.tone === 'wild') {
    return 'border-violet-400/30 bg-violet-400/10 text-violet-100'
  }
  if (props.tone === 'question') {
    return 'border-amber-400/30 bg-amber-400/10 text-amber-100'
  }
  return 'border-white/10 bg-white/5 text-white'
})

const toneLabel = computed(() => {
  if (props.tone === 'truth') {
    return 'Truth'
  }
  if (props.tone === 'false') {
    return 'False'
  }
  if (props.tone === 'wild') {
    return 'Wild'
  }
  if (props.tone === 'question') {
    return 'Question'
  }
  return 'Neutral'
})

const footerLabel = computed(() => {
  if (props.tone === 'truth') {
    return 'Tell it straight'
  }
  if (props.tone === 'false') {
    return 'Craft the bluff'
  }
  if (props.tone === 'wild') {
    return 'Shift the round'
  }
  if (props.tone === 'question') {
    return 'Prompt the table'
  }
  return 'Hidden role'
})

const dotClass = computed(() => {
  if (props.tone === 'truth') {
    return 'bg-blue-300 shadow-[0_0_18px_rgba(96,165,250,0.45)]'
  }
  if (props.tone === 'false') {
    return 'bg-rose-300 shadow-[0_0_18px_rgba(251,113,133,0.45)]'
  }
  if (props.tone === 'wild') {
    return 'bg-violet-300 shadow-[0_0_18px_rgba(196,181,253,0.45)]'
  }
  if (props.tone === 'question') {
    return 'bg-amber-300 shadow-[0_0_18px_rgba(252,211,77,0.45)]'
  }
  return 'bg-slate-300 shadow-[0_0_18px_rgba(148,163,184,0.4)]'
})
</script>
