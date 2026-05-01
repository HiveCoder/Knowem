<template>
  <div class="relative" :class="containerClass">
    <div v-if="cards.length === 0" class="flex h-full items-center justify-center rounded-2xl border border-dashed border-white/10 bg-black/10 px-4 py-5 text-center text-xs uppercase tracking-[0.26em] text-slate-500">
      {{ emptyLabel }}
    </div>

    <div v-else class="relative h-full w-full">
      <div
        v-for="(card, index) in cards"
        :key="card.id"
        class="absolute bottom-0 left-1/2 will-change-transform transition duration-200"
        :style="cardStyle(index, hoveredIndex === index)"
        @mouseenter="hoveredIndex = index"
        @mouseleave="hoveredIndex = null"
      >
        <Card
          :title="card.title"
          :subtitle="card.subtitle"
          :tone="card.tone"
          :revealed="card.revealed"
          :flip-key="flipKey"
          :size="compact ? 'sm' : 'md'"
          :back-label="card.backLabel || 'Hidden card'"
          :badge-label="card.badgeLabel || 'Knowem'"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import Card from './Card.vue'

export interface HandCardItem {
  id: string
  title: string
  subtitle?: string
  tone: 'truth' | 'false' | 'wild' | 'neutral'
  revealed: boolean
  backLabel?: string
  badgeLabel?: string
}

const props = withDefaults(
  defineProps<{
    cards: HandCardItem[]
    compact?: boolean
    emptyLabel?: string
    flipKey?: string | number
  }>(),
  {
    compact: false,
    emptyLabel: 'No cards',
    flipKey: '',
  },
)

const hoveredIndex = ref<number | null>(null)

const containerClass = computed(() => (props.compact ? 'h-36 w-[180px] sm:w-[210px]' : 'h-48 w-[250px] sm:w-[320px]'))

function cardStyle(index: number, hovered: boolean) {
  const total = props.cards.length
  const spread = props.compact ? 24 : 34
  const offset = (index - (total - 1) / 2) * spread
  const baseRotation = (index - (total - 1) / 2) * 10
  const lift = hovered ? -20 : 0
  const scale = hovered ? 1.05 : 1

  return {
    transform: `translateX(calc(-50% + ${offset}px)) translateY(${lift}px) rotate(${baseRotation}deg) scale(${scale})`,
    zIndex: hovered ? total + 2 : index + 1,
  }
}
</script>