<template>
  <span class="pill" :class="toneClass">
    <slot />
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    tone?: 'neutral' | 'accent' | 'muted' | 'success' | 'danger'
  }>(),
  {
    tone: 'neutral',
  },
)

const toneClass = computed(() => {
  if (props.tone === 'accent') {
    return '!border-[rgba(124,156,255,0.24)] !bg-[rgba(124,156,255,0.12)] !text-[rgb(191,219,254)]'
  }
  if (props.tone === 'success') {
    return '!border-emerald-400/20 !bg-emerald-400/10 !text-emerald-200'
  }
  if (props.tone === 'danger') {
    return '!border-rose-400/20 !bg-rose-400/10 !text-rose-200'
  }
  if (props.tone === 'muted') {
    return '!border-white/5 !bg-white/[0.04] !text-slate-400'
  }
  return ''
})
</script>