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
        :class="slotClass"
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

        <div v-if="layout === 'focus'" class="mt-3 flex flex-col items-center gap-1 px-2 text-center">
          <p class="text-sm font-medium leading-5 text-slate-100 sm:text-[0.95rem]">{{ card.title }}</p>
          <p v-if="card.subtitle" class="max-w-[11rem] text-[11px] leading-4 text-slate-400 sm:text-xs">{{ card.subtitle }}</p>
        </div>
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
    layout?: 'default' | 'focus'
  }>(),
  {
    compact: false,
    emptyLabel: 'No cards',
    flipKey: '',
    layout: 'default',
  },
)

const hoveredIndex = ref<number | null>(null)

const containerClass = computed(() => {
  if (props.layout === 'focus') {
    return 'min-h-[20rem] w-full max-w-[34rem] overflow-hidden'
  }
  return props.compact ? 'min-h-36 w-full max-w-[240px]' : 'min-h-52 w-full max-w-[420px]'
})

const handClass = computed(() => {
  if (props.layout === 'focus') {
    return 'flex-wrap items-start gap-4 sm:gap-5'
  }
  return props.compact ? 'flex-wrap gap-2.5 sm:flex-nowrap sm:gap-3' : 'flex-wrap gap-3 sm:flex-nowrap sm:gap-4'
})

const slotClass = computed(() => (props.layout === 'focus' ? 'flex flex-col items-center justify-start' : ''))

function cardStyle(index: number, hovered: boolean) {
  if (props.layout === 'focus') {
    return {
      transform: `translateY(${hovered ? -6 : 0}px) scale(${hovered ? 1.01 : 1})`,
      zIndex: hovered ? props.cards.length + 2 : index + 1,
    }
  }

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