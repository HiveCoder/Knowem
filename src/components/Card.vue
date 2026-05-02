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
            <p class="text-[10px] uppercase tracking-[0.34em] text-slate-500">{{ backLabel }}</p>
            <h3 class="text-lg font-semibold tracking-tight text-white">Table Deck</h3>
            <p class="text-xs text-slate-400">Drawn into play when the round begins.</p>
          </div>
          <p class="text-center text-[11px] uppercase tracking-[0.28em] text-slate-500">Hold to reveal</p>
        </div>
      </div>

      <div class="card-face card-front" :class="frontToneClass">
        <div class="card-frontdrop flex h-full flex-col justify-between rounded-[inherit] border p-4 text-current sm:p-5">
          <div class="flex items-start justify-between gap-3">
            <div>
              <p class="text-[10px] uppercase tracking-[0.34em] opacity-70">{{ toneLabel }}</p>
              <span class="card-chip mt-2 inline-flex !border-current/15 !bg-black/10 !text-current">{{ badgeLabel }}</span>
            </div>
            <span class="card-dot" :class="toneDotClass" />
          </div>

          <div class="flex flex-1 items-center justify-center py-2 text-center">
            <div>
              <p v-if="subtitle" class="text-[11px] uppercase tracking-[0.28em] opacity-70">{{ subtitle }}</p>
              <h3 class="mt-3 text-xl font-semibold leading-tight sm:text-[1.45rem]">{{ title }}</h3>
            </div>
          </div>

          <div class="flex items-center justify-between gap-3 text-[11px] uppercase tracking-[0.24em] opacity-65">
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

const sizeClass = computed(() => (props.size === 'sm' ? 'h-28 w-20 sm:h-32 sm:w-24' : 'h-40 w-28 sm:h-44 sm:w-32'))
const frontToneClass = computed(() => {
  if (props.tone === 'truth') {
    return 'text-slate-900 shadow-[0_16px_28px_rgba(15,23,42,0.16)]'
  }
  if (props.tone === 'false') {
    return 'text-slate-900 shadow-[0_16px_28px_rgba(15,23,42,0.16)]'
  }
  if (props.tone === 'wild') {
    return 'text-slate-900 shadow-[0_16px_28px_rgba(15,23,42,0.16)]'
  }
  if (props.tone === 'question') {
    return 'text-slate-900 shadow-[0_16px_28px_rgba(15,23,42,0.16)]'
  }
  return 'text-slate-900 shadow-[0_16px_28px_rgba(15,23,42,0.18)]'
})
const backToneClass = computed(() => {
  if (props.tone === 'false') {
    return 'text-slate-100'
  }
  if (props.tone === 'wild') {
    return 'text-slate-100'
  }
  if (props.tone === 'question') {
    return 'text-slate-100'
  }
  return 'text-slate-100'
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
  transform: translateY(-4px);
  filter: brightness(1.01);
}

.card-shell-selected {
  transform: translateY(-2px);
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

.card-chip {
  border-radius: 9999px;
  border: 1px solid rgba(15, 23, 42, 0.12);
  background: rgba(255, 255, 255, 0.72);
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
  border-color: rgba(255, 255, 255, 0.08);
  background:
    linear-gradient(135deg, rgba(255, 255, 255, 0.06) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.06) 50%, rgba(255, 255, 255, 0.06) 75%, transparent 75%, transparent),
    linear-gradient(180deg, rgba(28, 74, 140, 0.98), rgba(19, 52, 104, 0.98));
  background-size: 14px 14px, auto;
}

.card-frontdrop {
  border-color: rgba(15, 23, 42, 0.14);
  background:
    radial-gradient(circle at top, rgba(255, 255, 255, 0.92), transparent 36%),
    linear-gradient(180deg, rgba(250, 248, 242, 0.98), rgba(239, 235, 227, 0.98));
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.7);
}

.card-back,
.card-front {
  box-shadow: 0 16px 26px rgba(15, 23, 42, 0.18);
}

.card-shell-selected .card-front,
.card-shell-selected .card-back {
  box-shadow: 0 0 0 1px rgba(15, 23, 42, 0.12), 0 20px 30px rgba(15, 23, 42, 0.2);
}
</style>