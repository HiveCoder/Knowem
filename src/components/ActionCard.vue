<template>
  <div
    class="group relative w-full max-w-[13rem]"
    v-motion
    :initial="{ opacity: 0, rotateY: 18, y: 28 }"
    :enter="{ opacity: 1, rotateY: 0, y: 0 }"
  >
    <Card :title="title" :subtitle="subtitle" :tone="tone" :revealed="revealed" />
  </div>
</template>

<script setup lang="ts">
import Card from './Card.vue'

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
</script>
