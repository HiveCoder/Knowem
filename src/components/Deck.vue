<template>
  <div ref="tableRef" class="pointer-events-none absolute inset-0 z-20 overflow-hidden">
    <div class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
      <div class="relative h-20 w-28 sm:h-24 sm:w-36">
        <div
          v-for="index in 6"
          :key="`stack-${index}`"
          :ref="registerStackRef"
          class="absolute left-1/2 top-1/2 h-20 w-28 -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl shadow-[0_10px_20px_rgba(0,0,0,0.2)] will-change-transform sm:h-24 sm:w-36"
          :style="deckArtStyle"
        />
      </div>
    </div>

    <div
      v-for="seat in seats"
      :key="`anchor-${seat.id}`"
      :ref="(element) => registerAnchorRef(seat.id, element)"
      class="absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 opacity-0"
      :style="{ left: `${seat.left}%`, top: `${seat.top}%` }"
    />

    <div
      v-for="card in dealSequence"
      :key="card.id"
      :ref="registerFlightRef"
      class="absolute left-1/2 top-1/2 h-20 w-28 -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl shadow-[0_10px_20px_rgba(0,0,0,0.18)] opacity-0 will-change-transform sm:h-24 sm:w-36"
      :style="deckArtStyle"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import gsap from 'gsap'
import { deckBackImage } from '@/assets/card-art'
import { emitSound } from '@/utils/sound'

interface SeatTarget {
  id: string
  left: number
  top: number
  cardCount: number
}

const props = defineProps<{
  round: number
  triggerKey: number
  seats: SeatTarget[]
}>()

const tableRef = ref<HTMLElement | null>(null)
const stackRefs = ref<HTMLElement[]>([])
const flightRefs = ref<HTMLElement[]>([])
const anchorRefs = new Map<string, HTMLElement>()

const dealSequence = computed(() => {
  const maxCardCount = props.seats.reduce((highestCount, seat) => Math.max(highestCount, seat.cardCount), 0)
  const sequence: Array<{ id: string; seatId: string; cardIndex: number; order: number }> = []

  for (let cardIndex = 0; cardIndex < maxCardCount; cardIndex += 1) {
    for (const seat of props.seats) {
      if (cardIndex >= seat.cardCount) {
        continue
      }

      sequence.push({
        id: `${seat.id}-${cardIndex}`,
        seatId: seat.id,
        cardIndex,
        order: sequence.length,
      })
    }
  }

  return sequence
})

const deckArtStyle = {
  backgroundImage: `url(${deckBackImage})`,
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat',
  backgroundSize: 'cover',
}

function registerStackRef(element: Element | null) {
  if (element instanceof HTMLElement && !stackRefs.value.includes(element)) {
    stackRefs.value.push(element)
  }
}

function registerFlightRef(element: Element | null) {
  if (element instanceof HTMLElement && !flightRefs.value.includes(element)) {
    flightRefs.value.push(element)
  }
}

function registerAnchorRef(id: string, element: Element | null) {
  if (element instanceof HTMLElement) {
    anchorRefs.set(id, element)
  }
}

async function runDealAnimation() {
  if (props.round < 1) {
    return
  }

  await nextTick()

  if (!tableRef.value || stackRefs.value.length === 0 || flightRefs.value.length === 0) {
    return
  }

  const dealerOriginX = 0
  const dealerOriginY = -82
  const seatOrder = new Map(props.seats.map((seat, index) => [seat.id, index]))
  const seatCount = Math.max(props.seats.length, 1)

  gsap.killTweensOf([...stackRefs.value, ...flightRefs.value])
  gsap.set(stackRefs.value, {
    x: 0,
    y: dealerOriginY,
    rotate: 0,
    opacity: 1,
    zIndex: (_index: number, _target: Element, targets: Element[]) => targets.length,
  })

  gsap.set(flightRefs.value, {
    x: dealerOriginX,
    y: dealerOriginY,
    rotate: 0,
    opacity: 0,
    zIndex: 50,
  })

  emitSound('shuffle')

  const shuffleTimeline = gsap.timeline()
  shuffleTimeline
    .to(stackRefs.value, {
      y: (_index: number) => gsap.utils.random(-12, 6),
      rotate: () => gsap.utils.random(-4, 4),
      scale: () => gsap.utils.random(0.985, 1.015),
      duration: 0.2,
      ease: 'power1.out',
      stagger: 0.02,
    })
    .to(
      stackRefs.value,
      {
        keyframes: [
          { y: () => gsap.utils.random(-16, -8), rotate: () => gsap.utils.random(-5, 5), duration: 0.08 },
          { y: () => gsap.utils.random(-10, 1), rotate: () => gsap.utils.random(-3, 3), duration: 0.08 },
        ],
        ease: 'power1.inOut',
        stagger: 0.02,
      },
      '-=0.04',
    )
    .to(stackRefs.value, {
      x: 0,
      y: dealerOriginY,
      rotate: 0,
      scale: 1,
      duration: 0.24,
      ease: 'power2.out',
      stagger: 0.02,
    })

  await shuffleTimeline.then()

  flightRefs.value.forEach((element, index) => {
    const card = dealSequence.value[index]
    const anchor = card ? anchorRefs.get(card.seatId) : null
    if (!anchor || !tableRef.value) {
      return
    }

    const tableBounds = tableRef.value.getBoundingClientRect()
    const anchorBounds = anchor.getBoundingClientRect()
    const targetX = anchorBounds.left + anchorBounds.width / 2 - (tableBounds.left + tableBounds.width / 2)
    const targetY = anchorBounds.top + anchorBounds.height / 2 - (tableBounds.top + tableBounds.height / 2)
    const seat = props.seats.find((entry) => entry.id === card.seatId)
    const seatIndex = seatOrder.get(card.seatId) ?? 0
    const totalCards = Math.max(seat?.cardCount ?? 2, 2)
    const seatOffset = (card.cardIndex - (totalCards - 1) / 2) * 18
    const finalX = targetX + seatOffset
    const midpointX = finalX * 0.38
    const arcY = targetY - 48 - Math.abs(finalX) * 0.08
    const cardLapDelay = card.cardIndex * 0.16
    const seatDelay = seatIndex * 0.045
    const delay = cardLapDelay + seatDelay
    const liftScale = card.cardIndex === 0 ? 1.03 : 1.01
    const landingDuration = 0.18 + card.cardIndex * 0.01

    gsap.fromTo(
      element,
      { opacity: 1, x: dealerOriginX, y: dealerOriginY, rotate: gsap.utils.random(-7, 7), scale: 0.96 },
      {
        keyframes: [
          { x: midpointX, y: arcY, rotate: gsap.utils.random(-11, 11), scale: liftScale, duration: 0.11, ease: 'power1.out' },
          { x: finalX, y: targetY, rotate: gsap.utils.random(-4, 4), scale: 1, duration: landingDuration, ease: 'power2.out' },
          { y: targetY - 6, duration: 0.06, ease: 'power1.out' },
          { y: targetY, duration: 0.08, ease: 'power1.in' },
        ],
        delay,
        onStart: () => {
          if (seatIndex === 0 || seatCount <= 2) {
            emitSound('deal')
          }
        },
        onComplete: () => {
          gsap.to(element, { opacity: 0, scale: 0.98, duration: 0.1, delay: 0.04 })
        },
      },
    )
  })
}

watch(() => props.triggerKey, runDealAnimation)
</script>