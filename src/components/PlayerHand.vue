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
        :class="card.playable && !interactionLocked ? 'cursor-pointer touch-manipulation' : ''"
        :style="cardStyle(card, index, hoveredIndex === index)"
        @mouseenter="hoveredIndex = index"
        @mouseleave="hoveredIndex = null"
        @click="handleCardClick(card)"
      >
        <Card
          :title="card.title"
          :subtitle="card.subtitle"
          :tone="card.tone"
          :is-flipped="resolveFlipped(card)"
          :is-wild="card.isWild"
          :is-played="card.isPlayed"
          :selected="isCardSelected(card, index)"
          :pending="isPendingCard(card)"
          :flip-key="flipKey"
          :size="compact ? 'sm' : 'md'"
          :back-label="card.backLabel || 'Hidden card'"
          :badge-label="card.badgeLabel || 'Knowem'"
          :interactive="card.playable && !interactionLocked"
          :play-animation-key="card.playAnimationKey"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import Card from './Card.vue'
import type { PlayedCardType } from '@/types/game'

export interface HandCardItem {
  id: string
  title: string
  subtitle?: string
  tone: 'truth' | 'false' | 'wild' | 'neutral'
  revealed: boolean
  isFlipped?: boolean
  isWild?: boolean
  isPlayed?: boolean
  playable?: boolean
  cardType?: PlayedCardType
  playAnimationKey?: string | number
  backLabel?: string
  badgeLabel?: string
}

const props = withDefaults(
  defineProps<{
    cards: HandCardItem[]
    compact?: boolean
    emptyLabel?: string
    flipKey?: string | number
    selectedCardType?: PlayedCardType | null
    pendingCardType?: PlayedCardType | null
    interactionLocked?: boolean
  }>(),
  {
    compact: false,
    emptyLabel: 'No cards',
    flipKey: '',
    selectedCardType: null,
    pendingCardType: null,
    interactionLocked: false,
  },
)

const emit = defineEmits<{
  cardClick: [card: HandCardItem & { isFlipped: boolean }]
}>()

const hoveredIndex = ref<number | null>(null)
const localFlipState = ref<Record<string, boolean>>({})

watch(
  () => [props.flipKey, props.cards.map((card) => card.id).join('|')],
  () => {
    localFlipState.value = {}
  },
  { immediate: true },
)

const containerClass = computed(() => (props.compact ? 'min-h-24 w-full max-w-[320px]' : 'min-h-36 w-full max-w-[560px]'))
const handClass = computed(() =>
  props.compact ? 'flex-wrap justify-center gap-2 sm:gap-2.5' : 'flex-wrap justify-center gap-3 sm:gap-3.5',
)

function isPendingCard(card: HandCardItem) {
  return Boolean(props.pendingCardType && card.cardType === props.pendingCardType)
}

function isCardSelected(card: HandCardItem, index: number) {
  return hoveredIndex.value === index || Boolean(props.selectedCardType && card.cardType === props.selectedCardType)
}

function cardStyle(card: HandCardItem, index: number, hovered: boolean) {
  const centerOffset = index - (props.cards.length - 1) / 2
  const baseLift = props.compact ? 0 : Math.abs(centerOffset) * 2.2
  const baseRotate = props.compact ? 0 : centerOffset * 2.8
  const selected = isCardSelected(card, index)
  const pending = isPendingCard(card)
  const lift = pending ? -18 : selected ? baseLift - 11 : baseLift * -1
  const rotate = pending ? baseRotate * 0.18 : selected ? baseRotate * 0.32 : baseRotate
  const scale = pending ? 1.055 : selected ? 1.04 : 1

  return {
    transform: `translateY(${lift}px) rotate(${rotate}deg) scale(${scale})`,
    zIndex: pending ? props.cards.length + 3 : selected ? props.cards.length + 2 : index + 1,
  }
}

function resolveFlipped(card: HandCardItem) {
  return localFlipState.value[card.id] ?? card.isFlipped ?? card.revealed
}

function handleCardClick(card: HandCardItem) {
  if (!card.playable || props.interactionLocked) {
    return
  }

  const nextFlipped = !resolveFlipped(card)
  localFlipState.value = {
    ...localFlipState.value,
    [card.id]: nextFlipped,
  }
  emit('cardClick', {
    ...card,
    isFlipped: nextFlipped,
  })
}
</script>