<template>
  <div ref="tableRef" class="pointer-events-none absolute inset-0 z-20 overflow-hidden">
    <div class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
      <div class="relative h-32 w-24 sm:h-36 sm:w-28">
        <div
          v-for="index in 6"
          :key="`stack-${index}`"
          :ref="registerStackRef"
          class="absolute left-1/2 top-1/2 h-32 w-24 -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-zinc-800 bg-zinc-900 shadow-[0_10px_20px_rgba(0,0,0,0.2)] will-change-transform sm:h-36 sm:w-28"
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
      v-for="card in flightCards"
      :key="card.id"
      :ref="registerFlightRef"
      class="absolute left-1/2 top-1/2 h-28 w-20 -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-zinc-800 bg-zinc-900 shadow-[0_10px_20px_rgba(0,0,0,0.18)] opacity-0 will-change-transform sm:h-32 sm:w-24"
    >
      <div class="flex h-full items-end rounded-[inherit] bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.05),_transparent_40%)] p-3">
        <span class="rounded-full border border-zinc-700 bg-zinc-800 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-zinc-300">Knowem</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import gsap from 'gsap'

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

const flightCards = computed(() =>
  props.seats.flatMap((seat) =>
    Array.from({ length: seat.cardCount }, (_value, cardIndex) => ({
      id: `${seat.id}-${cardIndex}`,
      seatId: seat.id,
      cardIndex,
    })),
  ),
)

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

function emitSound(name: 'shuffle' | 'deal') {
  window.dispatchEvent(new CustomEvent('knowem:sound', { detail: { name } }))
}

async function runDealAnimation() {
  if (props.round < 1) {
    return
  }

  await nextTick()

  if (!tableRef.value || stackRefs.value.length === 0 || flightRefs.value.length === 0) {
    return
  }

  const centerX = 0
  const centerY = 0

  gsap.killTweensOf([...stackRefs.value, ...flightRefs.value])
  gsap.set(stackRefs.value, {
    x: 0,
    y: 0,
    rotate: 0,
    opacity: 1,
    zIndex: (_index: number, _target: Element, targets: Element[]) => targets.length,
  })

  gsap.set(flightRefs.value, {
    x: 0,
    y: 0,
    rotate: 0,
    opacity: 0,
    zIndex: 50,
  })

  emitSound('shuffle')

  const shuffleTimeline = gsap.timeline()
  shuffleTimeline
    .to(stackRefs.value, {
      y: (_index: number) => gsap.utils.random(-10, 4),
      rotate: () => gsap.utils.random(-3, 3),
      duration: 0.18,
      ease: 'power1.out',
      stagger: 0.02,
    })
    .to(
      stackRefs.value,
      {
        keyframes: [
          { y: () => gsap.utils.random(-14, -6), duration: 0.08 },
          { y: () => gsap.utils.random(-8, 2), duration: 0.08 },
        ],
        ease: 'power1.inOut',
        stagger: 0.02,
      },
      '-=0.04',
    )
    .to(stackRefs.value, {
      x: 0,
      y: 0,
      rotate: 0,
      duration: 0.22,
      ease: 'power2.out',
      stagger: 0.02,
    })

  await shuffleTimeline.then()

  flightRefs.value.forEach((element, index) => {
    const card = flightCards.value[index]
    const anchor = card ? anchorRefs.get(card.seatId) : null
    if (!anchor || !tableRef.value) {
      return
    }

    const tableBounds = tableRef.value.getBoundingClientRect()
    const anchorBounds = anchor.getBoundingClientRect()
    const targetX = anchorBounds.left + anchorBounds.width / 2 - (tableBounds.left + tableBounds.width / 2)
    const targetY = anchorBounds.top + anchorBounds.height / 2 - (tableBounds.top + tableBounds.height / 2)
    const seatOffset = (card.cardIndex - (Math.max(card.cardCount ?? 2, 2) - 1) / 2) * 18
    const finalX = targetX + seatOffset
    const arcY = targetY - 34 - Math.abs(finalX) * 0.04

    gsap.fromTo(
      element,
      { opacity: 1, x: centerX, y: centerY - 8, rotate: gsap.utils.random(-4, 4), scale: 1 },
      {
        keyframes: [
          { x: finalX * 0.42, y: arcY, rotate: gsap.utils.random(-5, 5), duration: 0.18, ease: 'power1.out' },
          { x: finalX, y: targetY, rotate: gsap.utils.random(-3, 3), duration: 0.22, ease: 'power2.out' },
        ],
        delay: index * 0.11,
        onStart: () => emitSound('deal'),
        onComplete: () => {
          gsap.to(element, { opacity: 0, duration: 0.08, delay: 0.03 })
        },
      },
    )
  })
}

watch(() => props.triggerKey, runDealAnimation)
</script>