<template>
  <div class="card-shell" :class="sizeClass">
    <div ref="innerRef" class="card-inner will-change-transform">
      <div class="card-face card-back" :class="backToneClass">
        <div class="flex h-full flex-col justify-between rounded-[inherit] border border-white/10 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.08),_transparent_45%),linear-gradient(145deg,_rgba(8,15,32,0.98),_rgba(4,10,24,0.98))] p-4">
          <span class="pill w-fit !border-white/10 !bg-white/5 !text-slate-300">Knowem</span>
          <div>
            <p class="text-[11px] uppercase tracking-[0.34em] text-slate-500">{{ backLabel }}</p>
            <h3 class="mt-3 font-display text-lg text-white">Table Deck</h3>
          </div>
        </div>
      </div>

      <div class="card-face card-front" :class="frontToneClass">
        <div class="flex h-full flex-col justify-between rounded-[inherit] border border-current/20 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.18),_transparent_38%),linear-gradient(160deg,_rgba(255,255,255,0.12),_rgba(255,255,255,0.02))] p-4">
          <span class="pill w-fit !border-current/25 !bg-black/10 !text-current">{{ badgeLabel }}</span>
          <div>
            <p v-if="subtitle" class="text-[11px] uppercase tracking-[0.34em] opacity-75">{{ subtitle }}</p>
            <h3 class="mt-3 font-display text-xl leading-tight">{{ title }}</h3>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import gsap from 'gsap'

const props = withDefaults(
  defineProps<{
    title: string
    subtitle?: string
    tone?: 'truth' | 'false' | 'wild' | 'neutral'
    revealed?: boolean
    flipKey?: string | number
    size?: 'sm' | 'md'
    backLabel?: string
    badgeLabel?: string
  }>(),
  {
    tone: 'neutral',
    revealed: false,
    flipKey: '',
    size: 'md',
    backLabel: 'Hidden card',
    badgeLabel: 'Knowem',
  },
)

const innerRef = ref<HTMLElement | null>(null)

const sizeClass = computed(() => (props.size === 'sm' ? 'h-28 w-20 sm:h-32 sm:w-24' : 'h-40 w-28 sm:h-44 sm:w-32'))
const frontToneClass = computed(() => {
  if (props.tone === 'truth') {
    return 'text-cyan-100 shadow-[0_12px_40px_rgba(14,185,207,0.22)]'
  }
  if (props.tone === 'false') {
    return 'text-coral-100 shadow-[0_12px_40px_rgba(255,93,82,0.24)]'
  }
  if (props.tone === 'wild') {
    return 'text-gold-100 shadow-[0_12px_40px_rgba(230,185,61,0.24)]'
  }
  return 'text-slate-100 shadow-[0_12px_30px_rgba(5,8,22,0.32)]'
})
const backToneClass = computed(() => (props.tone === 'false' ? 'text-coral-200' : props.tone === 'wild' ? 'text-gold-200' : 'text-cyan-200'))

async function animateFlip() {
  await nextTick()
  if (!innerRef.value) {
    return
  }

  gsap.killTweensOf(innerRef.value)
  gsap.to(innerRef.value, {
    rotateY: props.revealed ? 180 : 0,
    duration: 0.72,
    ease: 'power3.out',
    force3D: true,
  })
}

watch(() => [props.revealed, props.flipKey], animateFlip)

onMounted(() => {
  if (innerRef.value) {
    gsap.set(innerRef.value, { rotateY: props.revealed ? 180 : 0 })
  }
})
</script>

<style scoped>
.card-shell {
  perspective: 1200px;
}

.card-inner {
  position: relative;
  height: 100%;
  width: 100%;
  transform-style: preserve-3d;
}

.card-face {
  position: absolute;
  inset: 0;
  border-radius: 1.5rem;
  backface-visibility: hidden;
}

.card-front {
  transform: rotateY(180deg);
}

.card-back,
.card-front {
  box-shadow: 0 18px 40px rgba(2, 8, 18, 0.45);
}
</style>