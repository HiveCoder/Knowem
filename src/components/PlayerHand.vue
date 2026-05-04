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
    spreadApart?: boolean
    centerRevealActive?: boolean
  }>(),
  {
    compact: false,
    emptyLabel: 'No cards',
    flipKey: '',
    selectedCardType: null,
    pendingCardType: null,
    interactionLocked: false,
    spreadApart: false,
    centerRevealActive: false,
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

const containerClass = computed(() => {
  if (props.compact) {
    return 'min-h-28 w-full max-w-[380px]'
  }

  if (props.spreadApart && props.centerRevealActive) {
    return 'min-h-44 w-full max-w-[1080px]'
  }

  return props.spreadApart ? 'min-h-44 w-full max-w-[860px]' : 'min-h-40 w-full max-w-[680px]'
})
const handClass = computed(() =>
  props.compact
    ? 'flex-wrap justify-center gap-2.5 sm:gap-3'
    : props.spreadApart && props.centerRevealActive
      ? 'justify-between gap-0 px-5 sm:px-12 lg:px-20'
      : props.spreadApart
      ? 'justify-between gap-3 px-3 sm:px-6'
      : 'flex-wrap justify-center gap-3.5 sm:gap-4',
)

function isPendingCard(card: HandCardItem) {
  return Boolean(props.pendingCardType && card.cardType === props.pendingCardType)
}

function isCardSelected(card: HandCardItem, index: number) {
  return hoveredIndex.value === index || Boolean(props.selectedCardType && card.cardType === props.selectedCardType)
}

function cardStyle(card: HandCardItem, index: number, hovered: boolean) {
  const centerOffset = index - (props.cards.length - 1) / 2
  const handParkedAside = props.spreadApart && props.centerRevealActive
  const revealOffsetBoost = props.spreadApart ? (handParkedAside ? 0 : 34) : 0
  const baseLift = props.compact ? 0 : props.spreadApart ? Math.abs(centerOffset) * (handParkedAside ? 2.4 : 1.2) : Math.abs(centerOffset) * 2.2
  const baseRotate = props.compact ? 0 : props.spreadApart ? centerOffset * (handParkedAside ? 6 : 5.5) : centerOffset * 2.8
  const selected = isCardSelected(card, index)
  const pending = isPendingCard(card)
  const revealLift = handParkedAside ? 12 : 0
  const spreadX = props.spreadApart ? centerOffset * revealOffsetBoost : 0
  const lift = pending ? (handParkedAside ? 10 : -18) : selected ? baseLift - (props.spreadApart ? 8 : 11) : baseLift * -1 + revealLift
  const rotate = pending ? baseRotate * 0.12 : selected ? baseRotate * 0.24 : baseRotate
  const scale = pending ? (handParkedAside ? 0.7 : 1.02) : selected ? (props.centerRevealActive ? 0.82 : 0.98) : props.spreadApart ? (props.centerRevealActive ? 0.78 : 0.92) : 1
  const opacity = pending && handParkedAside ? 0 : handParkedAside && !pending ? 0.68 : 1

  return {
    transform: `translateX(${spreadX}px) translateY(${lift}px) rotate(${rotate}deg) scale(${scale})`,
    zIndex: pending ? props.cards.length + 3 : selected ? props.cards.length + 2 : index + 1,
    opacity,
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