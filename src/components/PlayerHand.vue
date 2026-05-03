<template>
  <div class="relative" :class="containerClass">
    <div v-if="cards.length === 0" class="flex h-full items-center justify-center rounded-2xl border border-dashed border-white/10 bg-black/10 px-4 py-5 text-center text-xs uppercase tracking-[0.26em] text-slate-500">
      {{ emptyLabel }}
    </div>

    <div v-else class="flex h-full w-full items-center justify-center" :class="handClass">
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

const containerClass = computed(() => (props.compact ? 'min-h-24 w-full max-w-[320px]' : 'min-h-36 w-full max-w-[560px]'))
const handClass = computed(() =>
  props.compact ? 'flex-wrap justify-center gap-2 sm:gap-2.5' : 'flex-wrap justify-center gap-3 sm:gap-3.5',
)

function cardStyle(index: number, hovered: boolean) {
  const centerOffset = index - (props.cards.length - 1) / 2
  const baseLift = props.compact ? 0 : Math.abs(centerOffset) * 2.2
  const baseRotate = props.compact ? 0 : centerOffset * 2.8
  const lift = hovered ? baseLift - 8 : baseLift * -1
  const rotate = hovered ? baseRotate * 0.45 : baseRotate
  const scale = hovered ? 1.035 : 1

  return {
    transform: `translateY(${lift}px) rotate(${rotate}deg) scale(${scale})`,
    zIndex: hovered ? props.cards.length + 2 : index + 1,
  }
}
</script>