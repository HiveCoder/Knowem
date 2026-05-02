<template>
  <div
    class="group relative aspect-[3/4] w-full max-w-[12rem] [perspective:1200px]"
    v-motion
    :initial="{ opacity: 0, rotateY: 18, y: 28 }"
    :enter="{ opacity: 1, rotateY: 0, y: 0 }"
  >
    <div class="relative h-full w-full rounded-2xl transition duration-200 group-hover:-translate-y-0.5 group-hover:scale-[1.02] [transform-style:preserve-3d]" :class="revealed ? '[transform:rotateY(180deg)]' : ''">
      <div class="absolute inset-0 rounded-2xl border border-zinc-800 bg-zinc-900 p-5 shadow-[0_10px_22px_rgba(0,0,0,0.22)] [backface-visibility:hidden]">
        <div class="flex h-full flex-col justify-between">
          <div class="flex items-start justify-between gap-3">
            <span class="rounded-full border border-zinc-700 bg-zinc-800 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-300">Knowem</span>
            <span class="h-2.5 w-2.5 rounded-full bg-zinc-500" />
          </div>
          <div class="space-y-3 text-center">
            <p class="text-[11px] uppercase tracking-[0.34em] text-zinc-500">Hold to reveal</p>
            <h3 class="text-2xl font-semibold tracking-tight text-zinc-100">Hidden card</h3>
            <p class="text-sm text-zinc-400">Shared card system preview with calmer motion and cleaner spacing.</p>
          </div>
          <p class="text-center text-[11px] uppercase tracking-[0.24em] text-zinc-500">Table preview</p>
        </div>
      </div>
      <div
        class="absolute inset-0 rounded-2xl border border-zinc-800 bg-zinc-900 p-5 shadow-[0_10px_22px_rgba(0,0,0,0.2)] [backface-visibility:hidden] [transform:rotateY(180deg)]"
        :class="toneClass"
      >
        <div class="flex h-full flex-col justify-between">
          <div class="flex items-start justify-between gap-3">
            <div>
              <p class="text-[11px] uppercase tracking-[0.32em] text-zinc-500">{{ toneLabel }}</p>
              <span class="mt-2 inline-flex rounded-full border border-zinc-700 bg-zinc-800 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-300">Action</span>
            </div>
            <span class="h-2.5 w-2.5 rounded-full" :class="dotClass" />
          </div>
          <div class="space-y-3 text-center">
            <p class="text-xs uppercase tracking-[0.34em] text-zinc-500">{{ subtitle }}</p>
            <h3 class="text-3xl font-semibold tracking-tight text-zinc-100">{{ title }}</h3>
          </div>
          <div class="text-[11px] uppercase tracking-[0.24em] text-zinc-500">
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
    return 'text-zinc-100'
  }
  if (props.tone === 'false') {
    return 'text-zinc-100'
  }
  if (props.tone === 'wild') {
    return 'text-zinc-100'
  }
  if (props.tone === 'question') {
    return 'text-zinc-100'
  }
  return 'text-zinc-100'
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
    return 'bg-emerald-500'
  }
  if (props.tone === 'false') {
    return 'bg-rose-500'
  }
  if (props.tone === 'wild') {
    return 'bg-amber-500'
  }
  if (props.tone === 'question') {
    return 'bg-slate-500'
  }
  return 'bg-slate-500'
})
</script>
