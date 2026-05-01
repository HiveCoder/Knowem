<template>
  <button :class="buttonClass" :type="type">
    <slot />
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
    size?: 'sm' | 'md'
    block?: boolean
    type?: 'button' | 'submit' | 'reset'
  }>(),
  {
    variant: 'secondary',
    size: 'md',
    block: false,
    type: 'button',
  },
)

const buttonClass = computed(() => {
  const sizeClass = props.size === 'sm' ? 'px-3.5 py-2 text-sm' : 'px-4 py-2.5 text-sm'
  const widthClass = props.block ? 'w-full' : ''

  if (props.variant === 'primary') {
    return ['action-button', sizeClass, widthClass, 'bg-[rgb(124,156,255)] text-slate-950 hover:scale-[1.01] hover:bg-[rgb(146,173,255)]']
  }
  if (props.variant === 'ghost') {
    return ['action-button', sizeClass, widthClass, 'border border-white/5 bg-transparent text-slate-300 hover:bg-white/[0.04]']
  }
  if (props.variant === 'danger') {
    return ['action-button', sizeClass, widthClass, 'bg-rose-400/90 text-slate-950 hover:scale-[1.01] hover:bg-rose-300']
  }

  return ['action-button', sizeClass, widthClass, 'border border-white/10 bg-white/[0.04] text-slate-100 hover:scale-[1.01] hover:bg-white/[0.07]']
})
</script>