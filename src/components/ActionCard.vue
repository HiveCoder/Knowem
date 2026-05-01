<template>
  <div
    class="group relative h-44 [perspective:1200px]"
    v-motion
    :initial="{ opacity: 0, rotateY: 18, y: 28 }"
    :enter="{ opacity: 1, rotateY: 0, y: 0 }"
  >
    <div class="relative h-full w-full rounded-[28px] transition duration-500 [transform-style:preserve-3d]" :class="revealed ? '[transform:rotateY(180deg)]' : ''">
      <div class="absolute inset-0 rounded-[28px] border border-white/10 bg-slate-950/70 p-5 [backface-visibility:hidden]">
        <div class="flex h-full flex-col justify-between">
          <span class="pill w-fit">Knowem</span>
          <div>
            <p class="text-xs uppercase tracking-[0.34em] text-slate-500">Hold to reveal</p>
            <h3 class="mt-3 font-display text-2xl text-white">Hidden card</h3>
          </div>
        </div>
      </div>
      <div
        class="absolute inset-0 rounded-[28px] border p-5 [backface-visibility:hidden] [transform:rotateY(180deg)]"
        :class="toneClass"
      >
        <div class="flex h-full flex-col justify-between">
          <span class="pill w-fit !border-current/30 !text-current">Action</span>
          <div>
            <p class="text-xs uppercase tracking-[0.34em] opacity-70">{{ subtitle }}</p>
            <h3 class="mt-3 font-display text-3xl">{{ title }}</h3>
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
    tone?: 'truth' | 'false' | 'wild' | 'neutral'
    revealed?: boolean
  }>(),
  {
    tone: 'neutral',
    revealed: true,
  },
)

const toneClass = computed(() => {
  if (props.tone === 'truth') {
    return 'border-cyan-400/40 bg-cyan-400/12 text-cyan-200'
  }
  if (props.tone === 'false') {
    return 'border-coral-400/40 bg-coral-400/12 text-coral-200'
  }
  if (props.tone === 'wild') {
    return 'border-gold-400/40 bg-gold-400/12 text-gold-200'
  }
  return 'border-white/10 bg-white/5 text-white'
})
</script>
