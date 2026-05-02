<template>
  <div class="card-shell" :class="[sizeClass, selected ? 'card-shell-selected' : '']">
    <div ref="innerRef" class="card-inner will-change-transform">
      <div class="card-face card-back" :class="backToneClass">
        <div class="card-backdrop flex h-full flex-col justify-between rounded-[inherit] border p-4 sm:p-5">
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
        <div class="card-frontdrop flex h-full flex-col justify-between rounded-[inherit] border p-4 text-current sm:p-5">
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

const props = withDefaults(
  defineProps<{
    title: string
    subtitle?: string
    tone?: 'truth' | 'false' | 'wild' | 'question' | 'neutral'
    revealed?: boolean
    flipKey?: string | number
    size?: 'sm' | 'md'
    backLabel?: string
    badgeLabel?: string
    selected?: boolean
  }>(),
  {
    tone: 'neutral',
    revealed: false,
    flipKey: '',
    size: 'md',
    backLabel: 'Hidden card',
    badgeLabel: 'Knowem',
    selected: false,
  },
)

const innerRef = ref<HTMLElement | null>(null)

const sizeClass = computed(() => (props.size === 'sm' ? 'aspect-[3/4] w-[5.25rem] sm:w-[5.75rem]' : 'aspect-[3/4] w-[7.25rem] sm:w-[8rem]'))
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

async function animateFlip() {
  await nextTick()
  if (!innerRef.value) {
    return
  }

  gsap.killTweensOf(innerRef.value)
  gsap.to(innerRef.value, {
    rotateY: props.revealed ? 180 : 0,
    duration: 0.58,
    ease: 'power2.out',
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
  transition: transform 220ms ease, filter 220ms ease;
}

.card-shell:hover {
  transform: translateY(-2px) scale(1.02);
  filter: brightness(1.015);
}

.card-shell-selected {
  transform: translateY(-1px) scale(1.02);
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
  border-radius: 1rem;
  backface-visibility: hidden;
}

.card-front {
  transform: rotateY(180deg);
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
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04);
}

.card-back,
.card-front {
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
}

.card-shell-selected .card-front,
.card-shell-selected .card-back {
  box-shadow: 0 0 0 1px rgba(82, 82, 91, 0.9), 0 12px 22px rgba(0, 0, 0, 0.24);
}
</style>