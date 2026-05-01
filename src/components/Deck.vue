<template>
  <div ref="tableRef" class="pointer-events-none absolute inset-0 z-20 overflow-hidden">
    <div class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
      <div class="relative h-32 w-24 sm:h-36 sm:w-28">
        <div
          v-for="index in 6"
          :key="`stack-${index}`"
          :ref="registerStackRef"
          class="absolute left-1/2 top-1/2 h-32 w-24 -translate-x-1/2 -translate-y-1/2 rounded-[1.35rem] border border-white/10 bg-[linear-gradient(145deg,_rgba(3,12,28,0.98),_rgba(7,18,34,0.98))] shadow-[0_10px_30px_rgba(2,8,18,0.45)] will-change-transform sm:h-36 sm:w-28"
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
      class="absolute left-1/2 top-1/2 h-28 w-20 -translate-x-1/2 -translate-y-1/2 rounded-[1.15rem] border border-white/10 bg-[linear-gradient(145deg,_rgba(4,12,28,0.98),_rgba(9,22,40,0.98))] shadow-[0_16px_34px_rgba(2,8,18,0.45)] opacity-0 will-change-transform sm:h-32 sm:w-24"
    >
      <div class="flex h-full items-end rounded-[inherit] bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.08),_transparent_42%)] p-3">
        <span class="pill !border-white/10 !bg-white/5 !px-2 !py-0.5 !text-[10px] !tracking-[0.3em]">Knowem</span>
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
      x: (_index: number) => gsap.utils.random(-26, 26),
      y: (_index: number) => gsap.utils.random(-18, 18),
      rotate: () => gsap.utils.random(-10, 10),
      duration: 0.28,
      ease: 'power2.out',
      stagger: 0.03,
    })
    .to(
      stackRefs.value,
      {
        keyframes: [
          { x: () => gsap.utils.random(-36, 36), y: () => gsap.utils.random(-18, 18), duration: 0.12 },
          { x: () => gsap.utils.random(-30, 30), y: () => gsap.utils.random(-18, 18), duration: 0.12 },
          { x: () => gsap.utils.random(-18, 18), y: () => gsap.utils.random(-12, 12), duration: 0.12 },
        ],
        ease: 'power1.inOut',
        stagger: 0.02,
      },
      '-=0.08',
    )
    .to(stackRefs.value, {
      x: 0,
      y: 0,
      rotate: 0,
      duration: 0.32,
      ease: 'power3.out',
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
    const arcY = targetY - 60 - Math.abs(targetX) * 0.08

    gsap.fromTo(
      element,
      { opacity: 1, x: centerX, y: centerY, rotate: gsap.utils.random(-8, 8), scale: 1 },
      {
        keyframes: [
          { x: targetX * 0.35, y: arcY, rotate: gsap.utils.random(-12, 12), duration: 0.26, ease: 'power1.out' },
          { x: targetX, y: targetY, rotate: gsap.utils.random(-8, 8), duration: 0.34, ease: 'power2.inOut' },
        ],
        delay: index * 0.14,
        onStart: () => emitSound('deal'),
        onComplete: () => {
          gsap.to(element, { opacity: 0, duration: 0.12, delay: 0.08 })
        },
      },
    )
  })
}

watch(() => props.triggerKey, runDealAnimation)
</script>