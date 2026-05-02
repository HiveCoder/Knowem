<template>
  <div class="relative" :class="containerClass">
    <div v-if="cards.length === 0" class="flex h-full items-center justify-center rounded-2xl border border-dashed border-white/10 bg-black/10 px-4 py-5 text-center text-xs uppercase tracking-[0.26em] text-slate-500">
      {{ emptyLabel }}
    </div>

    <div v-else class="flex h-full w-full items-end justify-center" :class="handClass">
      <div
        v-for="(card, index) in cards"
        :key="card.id"
        class="relative shrink-0 will-change-transform transition duration-200"
        :style="cardStyle(index, hoveredIndex === index)"
        @mouseenter="hoveredIndex = index"
        @mouseleave="hoveredIndex = null"
      >
        <Card
          :title="card.title"
          :subtitle="card.subtitle"
          :tone="card.tone"
          :revealed="card.revealed"
          :selected="hoveredIndex === index"
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

const containerClass = computed(() => (props.compact ? 'min-h-36 w-full max-w-[240px]' : 'min-h-52 w-full max-w-[420px]'))
const handClass = computed(() =>
  props.compact ? 'flex-wrap gap-2.5 sm:flex-nowrap sm:gap-3' : 'flex-wrap gap-3 sm:flex-nowrap sm:gap-4',
)

function cardStyle(index: number, hovered: boolean) {
  const total = props.cards.length
  const centerOffset = index - (total - 1) / 2
  const baseRotation = props.compact ? centerOffset * 2.5 : centerOffset * 3
  const lift = hovered ? -10 : 0
  const scale = hovered ? 1.02 : 1

  return {
    transform: `translateY(${lift}px) rotate(${baseRotation}deg) scale(${scale})`,
    zIndex: hovered ? total + 2 : index + 1,
  }
}
</script>