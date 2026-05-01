<template>
  <section class="space-y-5">
    <div class="glass-panel p-3 sm:p-4">
      <div class="poker-table relative min-h-[620px] overflow-hidden rounded-[2rem] border border-emerald-400/10 bg-[radial-gradient(circle_at_top,_rgba(28,86,58,0.5),_rgba(8,24,18,0.9)_40%,_rgba(4,10,11,1)_80%)] p-4 sm:min-h-[720px] sm:p-6">
        <div class="absolute inset-5 rounded-[1.75rem] border border-white/5 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.02),0_40px_80px_rgba(0,0,0,0.42)]" />
        <Deck :round="room.game.round" :trigger-key="lastDealtAt || room.game.round" :seats="deckTargets" />

        <div class="relative z-10 flex flex-wrap items-center justify-between gap-3">
          <span class="pill !border-emerald-400/25 !bg-emerald-400/10 !text-emerald-100">Round {{ room.game.round }}</span>
          <div class="flex flex-wrap items-center gap-2">
            <span class="pill">{{ phaseLabel }}</span>
            <span v-if="selfPlayer?.isAdjudicator" class="pill !border-gold-400/30 !text-gold-400">Adjudicator</span>
          </div>
        </div>

        <div class="absolute left-1/2 top-1/2 z-10 w-[min(88%,420px)] -translate-x-1/2 -translate-y-1/2 text-center">
          <div class="rounded-[2rem] border border-white/10 bg-slate-950/40 px-5 py-6 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-md sm:px-7 sm:py-7">
            <p class="text-xs uppercase tracking-[0.34em] text-emerald-200/70">Center Table</p>
            <h2 class="mt-4 font-display text-2xl leading-tight text-white sm:text-3xl">{{ room.game.question || 'Shuffling the next question...' }}</h2>
            <p class="mt-4 text-sm text-slate-300">{{ phaseTitle }}</p>
          </div>
        </div>

        <div
          v-for="seat in tableSeats"
          :key="seat.player.id"
          class="absolute z-10 w-[180px] -translate-x-1/2 -translate-y-1/2 sm:w-[220px]"
          :style="{ left: `${seat.left}%`, top: `${seat.top}%` }"
          v-motion
          :initial="{ opacity: 0, scale: 0.82, y: 24 }"
          :enter="{ opacity: 1, scale: seat.player.isAdjudicator ? 1.03 : 1, y: 0 }"
        >
          <div class="relative rounded-[1.75rem] border border-white/10 bg-black/20 px-3 py-3 shadow-[0_18px_50px_rgba(0,0,0,0.35)] backdrop-blur-md" :class="seat.player.isAdjudicator ? 'adjudicator-spotlight' : ''">
            <div class="flex items-center justify-between gap-3">
              <div class="min-w-0">
                <p class="truncate font-medium text-white">{{ seat.player.username }}</p>
                <p class="text-[11px] uppercase tracking-[0.28em] text-slate-400">{{ seat.player.isAdjudicator ? 'reading the table' : seat.positionLabel }}</p>
              </div>
              <div class="rounded-full border border-white/10 bg-slate-950/60 px-3 py-1 text-sm font-semibold text-gold-300">{{ seat.player.score }}</div>
            </div>

            <div class="mt-4 flex justify-center">
              <PlayerHand :cards="seat.cards" :compact="!seat.isSelf" :empty-label="seat.player.isAdjudicator ? 'Judging' : 'Waiting'" :flip-key="room.game.round" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
      <div class="glass-panel p-5 sm:p-6">
        <div class="flex items-center justify-between gap-3">
          <div>
            <p class="pill">Phase Control</p>
            <h3 class="mt-4 font-display text-2xl text-white">{{ phaseTitle }}</h3>
          </div>
          <span class="pill !border-emerald-400/25 !text-emerald-100">Poker flow</span>
        </div>

        <div v-if="!selfPlayer?.isAdjudicator" class="mt-6 space-y-4" v-motion :initial="{ opacity: 0, y: 14 }" :enter="{ opacity: 1, y: 0 }">
          <textarea
            v-model="draftAnswer"
            rows="5"
            class="input-shell resize-none"
            :disabled="!canAnswer"
            placeholder="Your answer goes here. Sell the lie or own the truth."
          />
          <button class="action-button w-full bg-cyan-400 text-slate-950 hover:bg-cyan-300" :disabled="!canSubmitAnswer" @click="submitOwnAnswer">
            {{ selfPlayer?.hasAnswered ? 'Answer locked in' : 'Submit answer' }}
          </button>
          <p class="text-sm text-slate-400">{{ statusLine }}</p>
        </div>

        <div v-else class="mt-6 space-y-4" v-motion :initial="{ opacity: 0, y: 14 }" :enter="{ opacity: 1, y: 0 }">
          <div v-if="judgableAnswers.length === 0" class="rounded-2xl border border-dashed border-white/10 px-4 py-10 text-center text-sm text-slate-500">
            Waiting for players to submit their answers.
          </div>
          <div v-for="player in judgableAnswers" :key="player.id" class="rounded-3xl border border-white/10 bg-slate-950/55 p-4">
            <div class="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p class="font-medium text-white">{{ player.username }}</p>
                <p class="mt-2 text-sm leading-6 text-slate-300">{{ player.answerText }}</p>
              </div>
              <div class="flex gap-2">
                <button class="action-button min-w-24 bg-cyan-400 text-slate-950 hover:bg-cyan-300" :class="guesses[player.id] === 'truth' ? '!ring-2 !ring-cyan-100' : ''" @click="guesses[player.id] = 'truth'">
                  Truth
                </button>
                <button class="action-button min-w-24 bg-coral-400 text-slate-950 hover:bg-coral-300" :class="guesses[player.id] === 'false' ? '!ring-2 !ring-coral-100' : ''" @click="guesses[player.id] = 'false'">
                  Lie
                </button>
              </div>
            </div>
          </div>
          <button class="action-button w-full bg-gold-400 text-slate-950 hover:bg-gold-300" :disabled="!canSubmitVotes" @click="submitJudgement">
            Lock adjudicator verdict
          </button>
        </div>
      </div>

      <div class="glass-panel p-5 sm:p-6">
        <div class="flex items-center justify-between gap-3">
          <div>
            <p class="pill">Your Hand</p>
            <h3 class="mt-4 font-display text-2xl text-white">Private role spread</h3>
          </div>
          <span class="pill !border-white/10 !text-slate-300">Hover cards</span>
        </div>
        <div class="mt-6 flex justify-center rounded-[2rem] border border-white/10 bg-black/15 px-4 py-8">
          <PlayerHand :cards="selfCards" :empty-label="selfPlayer?.isAdjudicator ? 'Adjudicator' : 'Waiting for deal'" :flip-key="room.game.round" />
        </div>
        <p class="mt-5 text-sm text-slate-400">{{ statusLine }}</p>
      </div>
    </div>

    <EndRoundModal :open="room.game.phase === 'results' && showResults" :results="room.game.results" :can-advance="canAdvance" @close="dismissResults" @next-round="$emit('nextRound')" />
  </section>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import Deck from './Deck.vue'
import EndRoundModal from './EndRoundModal.vue'
import PlayerHand, { type HandCardItem } from './PlayerHand.vue'
import type { PrivateState, RoomState } from '@/types/game'

const props = defineProps<{
  room: RoomState
  privateState: PrivateState | null
  selfId: string
  canAdvance: boolean
  lastDealtAt: number
}>()

const emit = defineEmits<{
  submitAnswer: [answer: string]
  submitVote: [guesses: Record<string, 'truth' | 'false'>]
  nextRound: []
}>()

const draftAnswer = ref('')
const showResults = ref(true)
const guesses = reactive<Record<string, 'truth' | 'false'>>({})

const seatPresets = [
  { left: 50, top: 84, positionLabel: 'your seat' },
  { left: 50, top: 14, positionLabel: 'north rail' },
  { left: 18, top: 28, positionLabel: 'west corner' },
  { left: 82, top: 28, positionLabel: 'east corner' },
  { left: 14, top: 54, positionLabel: 'left wing' },
  { left: 86, top: 54, positionLabel: 'right wing' },
  { left: 28, top: 14, positionLabel: 'upper left' },
  { left: 72, top: 14, positionLabel: 'upper right' },
]

watch(
  () => props.room.game.round,
  () => {
    draftAnswer.value = ''
    showResults.value = true
    for (const key of Object.keys(guesses)) {
      delete guesses[key]
    }
  },
  { immediate: true },
)

const selfPlayer = computed(() => props.room.players.find((player) => player.id === props.selfId) ?? null)
const canAnswer = computed(() => {
  if (!selfPlayer.value || selfPlayer.value.isAdjudicator) {
    return false
  }
  return props.room.game.phase === 'question_reveal' || props.room.game.phase === 'answer_phase'
})
const canSubmitAnswer = computed(() => canAnswer.value && draftAnswer.value.trim().length > 2 && !selfPlayer.value?.hasAnswered)
const judgableAnswers = computed(() => props.room.players.filter((player) => !player.isAdjudicator && player.answerText))
const canSubmitVotes = computed(() => judgableAnswers.value.length > 0 && judgableAnswers.value.every((player) => guesses[player.id]))
const phaseLabel = computed(() => props.room.game.phase.replace('_', ' '))
const phaseTitle = computed(() => {
  if (props.room.game.phase === 'question_reveal') {
    return 'Question is live. Time to shape the story.'
  }
  if (props.room.game.phase === 'answer_phase') {
    return 'Answers are coming in.'
  }
  if (props.room.game.phase === 'judging_phase') {
    return 'Judge the room.'
  }
  if (props.room.game.phase === 'results') {
    return 'Round results.'
  }
  return 'Waiting for the room.'
})
const statusLine = computed(() => {
  if (selfPlayer.value?.hasAnswered) {
    return 'Your answer is locked. Watch the table and prepare for the verdict.'
  }
  if (props.privateState?.wildCard === 'forced_truth') {
    return 'Forced Truth overrides your role this round. Answer honestly.'
  }
  if (props.privateState?.wildCard === 'counter') {
    return 'Counter card is active this round. Wild effects bounce off you.'
  }
  return 'Answer in text now. Voice room can be layered in later without changing the state model.'
})
const orderedPlayers = computed(() => {
  const players = props.room.players.filter((player) => player.connected)
  const self = players.find((player) => player.id === props.selfId)
  const others = players.filter((player) => player.id !== props.selfId)
  return self ? [self, ...others] : players
})

const selfCards = computed<HandCardItem[]>(() => handCardsForPlayer(selfPlayer.value ?? null, true))
const tableSeats = computed(() =>
  orderedPlayers.value.map((player, index) => {
    const preset = seatPresets[index] ?? seatPresets[seatPresets.length - 1]
    return {
      player,
      left: preset.left,
      top: preset.top,
      positionLabel: preset.positionLabel,
      isSelf: player.id === props.selfId,
      cards: handCardsForPlayer(player, player.id === props.selfId),
    }
  }),
)

const deckTargets = computed(() =>
  tableSeats.value
    .filter((seat) => !seat.player.isAdjudicator)
    .map((seat) => ({
      id: seat.player.id,
      left: seat.left,
      top: seat.top,
      cardCount: seat.cards.length || 2,
    })),
)

function handCardsForPlayer(player: RoomState['players'][number] | null, isSelf: boolean): HandCardItem[] {
  if (!player) {
    return []
  }

  if (player.isAdjudicator) {
    return []
  }

  if (isSelf) {
    return [
      {
        id: `${player.id}-primary`,
        title: props.privateState?.primaryCard === 'false' ? 'False Card' : 'Truth Card',
        subtitle: props.privateState?.primaryCard === 'false' ? 'Lie convincingly' : 'Tell the truth',
        tone: props.privateState?.primaryCard === 'false' ? 'false' : 'truth',
        revealed: true,
        badgeLabel: 'Primary',
      },
      {
        id: `${player.id}-wild`,
        title: props.privateState?.wildCard === 'forced_truth' ? 'Forced Truth' : props.privateState?.wildCard === 'counter' ? 'Counter Card' : 'No Wild',
        subtitle:
          props.privateState?.wildCard === 'forced_truth'
            ? 'Truth overrides role'
            : props.privateState?.wildCard === 'counter'
              ? 'Negates an incoming wild'
              : 'No modifier this round',
        tone: 'wild',
        revealed: true,
        badgeLabel: 'Wild',
      },
    ]
  }

  if (props.room.game.phase === 'results' && player.primaryCardKnown) {
    return [
      {
        id: `${player.id}-primary-known`,
        title: player.primaryCardKnown === 'false' ? 'False Card' : 'Truth Card',
        subtitle: player.botPersonalityLabel || 'Revealed role',
        tone: player.primaryCardKnown === 'false' ? 'false' : 'truth',
        revealed: true,
        badgeLabel: 'Reveal',
      },
      {
        id: `${player.id}-wild-known`,
        title: player.wildCardKnown === 'forced_truth' ? 'Forced Truth' : player.wildCardKnown === 'counter' ? 'Counter Card' : 'No Wild',
        subtitle: player.wildCardKnown ? 'Shown at reveal' : 'No modifier',
        tone: 'wild',
        revealed: true,
        badgeLabel: 'Wild',
      },
    ]
  }

  return [
    {
      id: `${player.id}-hidden-primary`,
      title: 'Hidden Card',
      subtitle: player.botPersonalityLabel || 'Unknown role',
      tone: 'neutral',
      revealed: false,
      backLabel: 'Primary card',
      badgeLabel: 'Hidden',
    },
    {
      id: `${player.id}-hidden-wild`,
      title: 'Hidden Card',
      subtitle: 'Wild modifier',
      tone: 'neutral',
      revealed: false,
      backLabel: 'Wild card',
      badgeLabel: 'Hidden',
    },
  ]
}

function submitOwnAnswer() {
  if (!canSubmitAnswer.value) {
    return
  }
  emit('submitAnswer', draftAnswer.value.trim())
}

function submitJudgement() {
  if (!canSubmitVotes.value) {
    return
  }
  emit('submitVote', { ...guesses })
}

function dismissResults() {
  showResults.value = false
}
</script>
