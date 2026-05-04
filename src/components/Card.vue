<template>
  <div
    ref="shellRef"
    class="card-shell"
    :class="[
      sizeClass,
      selected ? 'card-shell-selected' : '',
      imageMode ? 'card-shell-image' : '',
      interactive ? 'card-shell-interactive' : '',
      isPlayed ? 'card-shell-played' : '',
      pending ? 'card-shell-pending' : '',
      showWildBadge ? 'card-shell-wild' : '',
    ]"
    :style="shellStyle"
    :role="interactive ? 'button' : undefined"
    :tabindex="interactive ? 0 : undefined"
    @pointermove="handlePointerMove"
    @pointerleave="resetPointerTilt"
    @click="handleActivate"
    @keydown.enter.prevent="handleActivate"
    @keydown.space.prevent="handleActivate"
  >
    <div class="card-specular" aria-hidden="true" />
    <div v-if="showWildBadge" class="card-wild-badge">WILD CARD</div>
    <div ref="innerRef" class="card-inner will-change-transform">
      <div class="card-face card-back" :class="backToneClass">
        <div v-if="backImageSrc" class="card-media-surface">
          <div class="card-art-fill" :style="backArtStyle" :aria-label="`${backLabel} back`" role="img" />
        </div>

        <div v-else class="card-backdrop flex h-full flex-col justify-between rounded-[inherit] border p-4 sm:p-5">
          <div class="flex items-start justify-between gap-3">
            <span class="card-chip w-fit">Knowem</span>
            <span class="card-dot" :class="toneDotClass" />
          </div>
          <div class="space-y-3 text-center">
            <p class="text-[10px] uppercase tracking-[0.34em] text-zinc-500">{{ backLabel }}</p>
            <h3 class="text-lg font-semibold tracking-tight text-zinc-100">Table Deck</h3>
            <p class="text-xs text-zinc-400">Clean, hidden state until the round reveals it.</p>
          </div>
          <p class="text-center text-[11px] uppercase tracking-[0.28em] text-zinc-500">Hold to reveal</p>
        </div>
      </div>

      <div class="card-face card-front" :class="frontToneClass">
        <div v-if="frontImageSrc" class="card-media-surface">
          <div class="card-art-fill" :style="frontArtStyle" :aria-label="title" role="img" />
        </div>

        <div v-else class="card-frontdrop flex h-full flex-col justify-between rounded-[inherit] border p-4 text-current sm:p-5">
          <div class="flex items-start justify-between gap-3">
            <div>
              <p class="text-[10px] uppercase tracking-[0.34em] text-zinc-500">{{ toneLabel }}</p>
              <span class="card-chip mt-2 inline-flex">{{ badgeLabel }}</span>
            </div>
            <span class="card-dot" :class="toneDotClass" />
          </div>

          <div class="flex flex-1 items-center justify-center py-2 text-center">
            <div>
              <p v-if="subtitle" class="text-[11px] uppercase tracking-[0.28em] text-zinc-500">{{ subtitle }}</p>
              <h3 class="mt-3 text-xl font-semibold leading-tight text-zinc-100 sm:text-[1.45rem]">{{ title }}</h3>
            </div>
          </div>

          <div class="flex items-center justify-between gap-3 text-[11px] uppercase tracking-[0.24em] text-zinc-500">
            <span>{{ footerLabel }}</span>
            <span>{{ toneLabel }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import gsap from 'gsap'
import { resolveCardBackImage, resolveCardFrontImage } from '@/assets/card-art'

const props = withDefaults(
  defineProps<{
    title: string
    subtitle?: string
    tone?: 'truth' | 'false' | 'wild' | 'question' | 'neutral'
    isFlipped?: boolean
    revealed?: boolean
    isWild?: boolean
    isPlayed?: boolean
    interactive?: boolean
    playAnimationKey?: string | number
    flipKey?: string | number
    size?: 'sm' | 'md'
    backLabel?: string
    badgeLabel?: string
    selected?: boolean
    pending?: boolean
  }>(),
  {
    tone: 'neutral',
    isFlipped: undefined,
    revealed: false,
    isWild: false,
    isPlayed: false,
    interactive: false,
    playAnimationKey: '',
    flipKey: '',
    size: 'md',
    backLabel: 'Hidden card',
    badgeLabel: 'Knowem',
    selected: false,
    pending: false,
  },
)

const emit = defineEmits<{
  activate: []
}>()

const innerRef = ref<HTMLElement | null>(null)
const shellRef = ref<HTMLElement | null>(null)
const tiltX = ref(0)
const tiltY = ref(0)
const glowOpacity = ref(0)
const resolvedFlipped = computed(() => props.isFlipped ?? props.revealed)
const showWildBadge = computed(() => props.isWild || props.tone === 'wild')

const sizeClass = computed(() => (props.size === 'sm' ? 'aspect-[826/574] w-[7.1rem] sm:w-[7.75rem]' : 'aspect-[826/574] w-[10rem] sm:w-[11rem]'))
const frontImageSrc = computed(() => resolveCardFrontImage(props.title))
const backImageSrc = computed(() =>
  resolveCardBackImage({
    tone: props.tone,
    title: props.title,
    backLabel: props.backLabel,
    badgeLabel: props.badgeLabel,
  }),
)
const imageMode = computed(() => Boolean(frontImageSrc.value || backImageSrc.value))
const frontArtStyle = computed(() =>
  frontImageSrc.value
    ? {
        backgroundImage: `url(${frontImageSrc.value})`,
      }
    : undefined,
)
const backArtStyle = computed(() =>
  backImageSrc.value
    ? {
        backgroundImage: `url(${backImageSrc.value})`,
      }
    : undefined,
)
const frontToneClass = computed(() => {
  if (props.tone === 'truth') {
    return 'text-zinc-100'
  }
  if (props.tone === 'false') {
    return 'text-zinc-100'
  }
  if (props.tone === 'wild') {
    return 'text-zinc-100'
  }
  if (props.tone === 'question') {
    return 'text-zinc-100'
  }
  return 'text-zinc-100'
})
const backToneClass = computed(() => {
  if (props.tone === 'false') {
    return 'text-zinc-100'
  }
  if (props.tone === 'wild') {
    return 'text-zinc-100'
  }
  if (props.tone === 'question') {
    return 'text-zinc-100'
  }
  return 'text-zinc-100'
})

const toneLabel = computed(() => {
  if (props.tone === 'truth') {
    return 'Truth'
  }
  if (props.tone === 'false') {
    return 'False'
  }
  if (props.tone === 'wild') {
    return 'Wild'
  }
  if (props.tone === 'question') {
    return 'Question'
  }
  return 'Table'
})

const footerLabel = computed(() => {
  if (props.tone === 'truth') {
    return 'Play honest'
  }
  if (props.tone === 'false') {
    return 'Sell the bluff'
  }
  if (props.tone === 'wild') {
    return 'Rule shift'
  }
  if (props.tone === 'question') {
    return 'Prompt card'
  }
  return 'Hidden state'
})

const toneDotClass = computed(() => {
  if (props.tone === 'truth') {
    return 'bg-emerald-500'
  }
  if (props.tone === 'false') {
    return 'bg-rose-500'
  }
  if (props.tone === 'wild') {
    return 'bg-amber-500'
  }
  if (props.tone === 'question') {
    return 'bg-slate-700'
  }
  return 'bg-slate-600'
})
const shellStyle = computed(() => ({
  '--card-tilt-x': `${tiltX.value}deg`,
  '--card-tilt-y': `${tiltY.value}deg`,
  '--card-glow-opacity': `${glowOpacity.value}`,
}))

async function animateFlip() {
  await nextTick()
  if (!innerRef.value || !shellRef.value) {
    return
  }

  gsap.killTweensOf([innerRef.value, shellRef.value])
  gsap.timeline()
    .to(shellRef.value, {
      y: -8,
      scale: 1.02,
      duration: 0.16,
      ease: 'power2.out',
      force3D: true,
    })
    .to(
      innerRef.value,
      {
        rotateY: resolvedFlipped.value ? 180 : 0,
        duration: 0.56,
        ease: 'power2.inOut',
        force3D: true,
      },
      0,
    )
    .to(
      shellRef.value,
      {
        y: 0,
        scale: 1,
        duration: 0.32,
        ease: 'power2.out',
        force3D: true,
      },
      0.24,
    )
}

async function animatePlayedState() {
  await nextTick()
  if (!shellRef.value || !innerRef.value || !props.isPlayed) {
    return
  }

  gsap.killTweensOf([shellRef.value, innerRef.value])
  const timeline = gsap.timeline()
  timeline
    .fromTo(
      shellRef.value,
      {
        y: 46,
        scale: 0.84,
        opacity: 0,
        filter: 'drop-shadow(0 8px 18px rgba(0,0,0,0.18))',
      },
      {
        y: props.isWild ? -16 : -10,
        scale: props.isWild ? 1.16 : 1.045,
        opacity: 1,
        duration: props.isWild ? 0.22 : 0.26,
        ease: 'power3.out',
      },
    )
    .to(
      innerRef.value,
      {
        rotateY: 180,
        duration: props.isWild ? 0.48 : 0.52,
        ease: 'power2.inOut',
      },
      props.isWild ? 0.04 : 0.08,
    )
    .to(
      shellRef.value,
      {
        y: 0,
        scale: 1,
        duration: props.isWild ? 0.34 : 0.3,
        ease: props.isWild ? 'elastic.out(1, 0.56)' : 'bounce.out',
      },
      props.isWild ? '>-0.02' : '>-=0.02',
    )

  if (props.isWild) {
    timeline
      .to(
        shellRef.value,
        {
          boxShadow: '0 0 0 1px rgba(251,191,36,0.65), 0 0 36px rgba(251,191,36,0.55), 0 24px 46px rgba(15,23,42,0.52)',
          duration: 0.18,
          ease: 'power1.out',
        },
        0.08,
      )
      .to(
        shellRef.value,
        {
          boxShadow: '0 0 0 1px rgba(251,191,36,0.3), 0 0 16px rgba(251,191,36,0.3), 0 18px 36px rgba(15,23,42,0.36)',
          repeat: 2,
          yoyo: true,
          duration: 0.22,
          ease: 'sine.inOut',
        },
        0.28,
      )
  }
}

async function animatePendingState() {
  await nextTick()
  if (!shellRef.value || props.isPlayed) {
    return
  }

  gsap.killTweensOf(shellRef.value)

  if (props.pending) {
    gsap.timeline()
      .to(shellRef.value, {
        y: -14,
        scale: props.isWild ? 1.08 : 1.05,
        rotate: props.isWild ? -2.2 : -1.2,
        duration: 0.18,
        ease: 'power2.out',
        force3D: true,
      })
      .to(shellRef.value, {
        y: -10,
        scale: props.isWild ? 1.06 : 1.03,
        rotate: 0,
        duration: 0.2,
        ease: 'sine.out',
        force3D: true,
      })
    return
  }

  gsap.to(shellRef.value, {
    y: 0,
    scale: 1,
    rotate: 0,
    duration: 0.22,
    ease: 'power2.out',
    force3D: true,
  })
}

function handlePointerMove(event: PointerEvent) {
  if (!shellRef.value || event.pointerType === 'touch') {
    return
  }

  const bounds = shellRef.value.getBoundingClientRect()
  const horizontal = (event.clientX - bounds.left) / bounds.width - 0.5
  const vertical = (event.clientY - bounds.top) / bounds.height - 0.5

  tiltY.value = Number((horizontal * 8).toFixed(2))
  tiltX.value = Number((vertical * -7).toFixed(2))
  glowOpacity.value = 0.55
}

function resetPointerTilt() {
  tiltX.value = 0
  tiltY.value = 0
  glowOpacity.value = 0
}

function handleActivate() {
  if (!props.interactive) {
    return
  }

  emit('activate')
}

watch(() => [resolvedFlipped.value, props.flipKey], animateFlip)
watch(() => [props.isPlayed, props.playAnimationKey], animatePlayedState)
watch(() => props.pending, animatePendingState)

onMounted(() => {
  if (innerRef.value) {
    gsap.set(innerRef.value, {
      rotateY: resolvedFlipped.value ? 180 : 0,
      transformPerspective: 1200,
      transformStyle: 'preserve-3d',
    })
  }
})
</script>

<style scoped>
.card-shell {
  --card-tilt-x: 0deg;
  --card-tilt-y: 0deg;
  --card-glow-opacity: 0;
  position: relative;
  perspective: 1200px;
  transition: transform 220ms ease, filter 220ms ease;
  transform-origin: center center;
  transform: translateY(0) rotateX(var(--card-tilt-x)) rotateY(var(--card-tilt-y));
}

.card-shell:hover {
  transform: translateY(-4px) rotateX(var(--card-tilt-x)) rotateY(var(--card-tilt-y));
  filter: brightness(1.02);
}

.card-shell-interactive {
  cursor: pointer;
}

.card-shell-selected {
  transform: translateY(-4px) rotateX(var(--card-tilt-x)) rotateY(var(--card-tilt-y));
}

.card-shell-played {
  filter: drop-shadow(0 22px 42px rgba(2, 6, 23, 0.38));
}

.card-shell-pending {
  filter: drop-shadow(0 20px 38px rgba(56, 189, 248, 0.24));
}

.card-shell-wild {
  filter: drop-shadow(0 18px 36px rgba(245, 158, 11, 0.28));
}

.card-shell-image {
  filter: drop-shadow(0 16px 28px rgba(0, 0, 0, 0.34));
}

.card-specular {
  position: absolute;
  inset: 0;
  z-index: 3;
  border-radius: 1.1rem;
  pointer-events: none;
  opacity: var(--card-glow-opacity);
  background:
    radial-gradient(circle at 18% 14%, rgba(255, 255, 255, 0.24), rgba(255, 255, 255, 0) 28%),
    linear-gradient(120deg, rgba(255, 255, 255, 0.12), rgba(255, 255, 255, 0) 32%, rgba(255, 255, 255, 0.08) 55%, rgba(255, 255, 255, 0) 72%);
  mix-blend-mode: screen;
  transition: opacity 180ms ease;
}

.card-wild-badge {
  position: absolute;
  right: 0.75rem;
  top: 0.75rem;
  z-index: 4;
  border-radius: 9999px;
  border: 1px solid rgba(251, 191, 36, 0.4);
  background: rgba(120, 53, 15, 0.68);
  color: rgb(254 243 199);
  padding: 0.24rem 0.58rem;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.24em;
  text-transform: uppercase;
  box-shadow: 0 0 18px rgba(251, 191, 36, 0.18);
}

.card-inner {
  position: relative;
  height: 100%;
  width: 100%;
  transform-style: preserve-3d;
  transform-origin: center center;
}

.card-face {
  position: absolute;
  inset: 0;
  border-radius: 1.1rem;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
  transform-style: preserve-3d;
  overflow: hidden;
}

.card-front {
  transform: rotateY(180deg) translateZ(1px);
}

.card-chip {
  border-radius: 9999px;
  border: 1px solid rgba(63, 63, 70, 0.9);
  background: rgba(39, 39, 42, 0.88);
  color: rgb(212 212 216);
  padding: 0.35rem 0.7rem;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.22em;
  text-transform: uppercase;
}

.card-dot {
  height: 0.7rem;
  width: 0.7rem;
  border-radius: 9999px;
}

.card-backdrop {
  border-color: rgba(63, 63, 70, 0.9);
  background:
    radial-gradient(circle at top, rgba(255, 255, 255, 0.08), transparent 34%),
    linear-gradient(180deg, rgba(24, 24, 27, 0.98), rgba(15, 15, 18, 0.98));
}

.card-frontdrop {
  border-color: rgba(63, 63, 70, 0.9);
  background:
    radial-gradient(circle at top, rgba(255, 255, 255, 0.05), transparent 32%),
    linear-gradient(180deg, rgba(24, 24, 27, 0.98), rgba(15, 15, 18, 0.98));
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.08);
}

.card-back,
.card-front {
  box-shadow: 0 16px 34px rgba(0, 0, 0, 0.24);
}

.card-shell-selected .card-front,
.card-shell-selected .card-back {
  box-shadow: 0 0 0 1px rgba(148, 163, 184, 0.26), 0 22px 42px rgba(2, 6, 23, 0.3);
}

.card-media-surface {
  position: absolute;
  inset: 0;
  border-radius: inherit;
  overflow: hidden;
  background: transparent;
}

.card-art-fill {
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
  transform: translateZ(0);
  transition: transform 220ms ease, filter 220ms ease;
}

.card-shell:hover .card-art-fill,
.card-shell-selected .card-art-fill {
  transform: scale(1.025) translateZ(0);
  filter: saturate(1.04);
}
</style>