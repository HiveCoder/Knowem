<template>
  <component :is="tag" class="glass-panel" :class="paddingClass">
    <slot />
  </component>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    tag?: string
    padding?: 'sm' | 'md' | 'lg'
  }>(),
  {
    tag: 'section',
    padding: 'md',
  },
)

const paddingClass = computed(() => {
  if (props.padding === 'sm') {
    return 'p-4 sm:p-5'
  }
  if (props.padding === 'lg') {
    return 'p-6 sm:p-7'
  }
  return 'p-5 sm:p-6'
})
</script>