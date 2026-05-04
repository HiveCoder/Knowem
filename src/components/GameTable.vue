<template>
  <section class="space-y-6">
    <UiPanel padding="lg">
      <div class="grid gap-4 xl:grid-cols-[1.18fr_0.82fr] xl:items-start">
        <div>
          <div class="flex flex-wrap items-center gap-2.5">
            <UiBadge tone="accent">Round {{ room.game.round }}</UiBadge>
            <UiBadge tone="muted">{{ phaseLabel }}</UiBadge>
            <UiBadge v-if="selfPlayer?.isAdjudicator" tone="accent">Adjudicator</UiBadge>
          </div>
          <h2 class="mt-4 text-2xl font-semibold tracking-tight text-white sm:text-3xl">Live game area</h2>
          <p class="mt-2 max-w-2xl text-sm leading-6 text-slate-400">{{ phaseTitle }}</p>
        </div>

        <div class="grid gap-3 sm:grid-cols-3">
          <div class="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <p class="text-[11px] uppercase tracking-[0.24em] text-slate-500">Connected</p>
            <p class="mt-3 text-2xl font-semibold text-white">{{ topPlayers.length }}</p>
            <p class="mt-1 text-xs text-slate-400">players at the table</p>
          </div>
          <div class="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <p class="text-[11px] uppercase tracking-[0.24em] text-slate-500">Answers</p>
            <p class="mt-3 text-2xl font-semibold text-white">{{ judgableAnswers.length }}</p>
            <p class="mt-1 text-xs text-slate-400">ready for review</p>
          </div>
          <div class="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <p class="text-[11px] uppercase tracking-[0.24em] text-slate-500">Your seat</p>
            <p class="mt-3 text-lg font-semibold text-white">{{ selfPlayer?.isAdjudicator ? 'Judge' : 'Contestant' }}</p>
            <p class="mt-1 text-xs text-slate-400">{{ selfPlayer?.hasAnswered ? 'Locked in' : 'Awaiting action' }}</p>
          </div>
        </div>
      </div>
    </UiPanel>

    <UiPanel padding="lg" class="overflow-hidden">
      <div class="grid gap-6 lg:grid-cols-[minmax(0,0.86fr)_minmax(0,1.35fr)_minmax(0,0.86fr)] lg:items-start xl:gap-8">
        <aside class="order-2 min-w-0 lg:order-1">
          <div class="rounded-[28px] border border-white/10 bg-white/[0.03] p-4 sm:p-5">
            <div class="flex items-center justify-between gap-3">
              <div>
                <p class="text-xs uppercase tracking-[0.3em] text-slate-500">Left lane</p>
                <p class="mt-2 text-sm text-slate-400">Table seats and hidden role cards.</p>
              </div>
              <UiBadge tone="muted">{{ leftSeats.length }} seats</UiBadge>
            </div>

            <div class="mt-5 grid gap-4 overflow-hidden lg:max-h-[38rem] lg:overflow-y-auto lg:pr-1 soft-scrollbar">
              <div v-if="leftSeats.length === 0" class="rounded-[24px] border border-dashed border-white/10 px-4 py-10 text-center text-sm text-slate-500">
                Empty lane
              </div>

              <article v-for="seat in leftSeats" :key="seat.player.id" class="overflow-hidden rounded-[24px] border border-white/10 bg-slate-950/40 p-4">
                <div class="flex items-center justify-between gap-3">
                  <div class="min-w-0">
                    <p class="truncate font-medium text-white">{{ seat.player.username }}</p>
                    <p class="mt-1 text-[11px] uppercase tracking-[0.24em] text-slate-500">{{ seat.player.isAdjudicator ? 'reading the table' : seat.positionLabel }}</p>
                  </div>
                  <div class="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-sm font-semibold text-slate-100">{{ seat.player.score }}</div>
                </div>

                <div class="mt-4 overflow-hidden rounded-[22px] border border-white/10 bg-white/[0.02] px-3 py-4">
                  <PlayerHand :cards="seat.cards" compact :empty-label="seat.player.isAdjudicator ? 'Judging' : 'Waiting'" :flip-key="room.game.round" />
                </div>
              </article>
            </div>
          </div>
        </aside>

        <div class="order-1 min-w-0 lg:order-2">
          <div class="poker-table overflow-hidden rounded-[30px] border border-white/10 p-4 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.02),0_24px_60px_rgba(2,6,23,0.22)] sm:p-6">
            <div class="grid gap-5">
              <div class="rounded-[24px] border border-white/10 bg-[rgba(7,10,18,0.52)] px-5 py-5 text-center backdrop-blur-md sm:px-6">
                <p class="text-xs uppercase tracking-[0.34em] text-slate-400">Focus area</p>
                <h3 class="mt-4 text-2xl font-semibold leading-tight text-white sm:text-3xl">{{ room.game.question || 'Shuffling the next question...' }}</h3>
                <p class="mt-3 text-sm leading-6 text-slate-300">{{ phaseTitle }}</p>
              </div>

              <div class="relative mx-auto w-full max-w-[580px] overflow-hidden rounded-[28px] border border-white/10 bg-[rgba(8,12,22,0.34)] px-4 py-5 backdrop-blur-md sm:px-5 sm:py-5">
                <Deck :round="room.game.round" :trigger-key="lastDealtAt || room.game.round" :seats="deckTargets" />

                <div class="relative z-10 flex min-h-[250px] flex-col items-center justify-center gap-4 sm:min-h-[280px]">
                  <transition name="table-play">
                    <div v-if="playedCard" :key="playedCard.id" class="pointer-events-none absolute inset-x-0 top-4 flex justify-center px-4">
                      <div class="flex flex-col items-center gap-2 rounded-[28px] border border-white/10 bg-[rgba(10,14,26,0.56)] px-3 py-3 backdrop-blur-md shadow-[0_24px_60px_rgba(2,6,23,0.32)] sm:px-4">
                        <Card
                          :title="playedCard.title"
                          :subtitle="playedCard.subtitle"
                          :tone="playedCard.tone"
                          :is-flipped="true"
                          :is-wild="playedCard.isWild"
                          :is-played="true"
                          :play-animation-key="playedCardAnimationKey"
                          size="md"
                          badge-label="Played"
                          back-label="Played card"
                        />
                        <p class="text-center text-[11px] uppercase tracking-[0.24em] text-slate-300">
                          {{ playedCard.username }} played {{ playedCard.isWild ? 'a wild card' : 'to center table' }}
                        </p>
                      </div>
                    </div>
                  </transition>

                  <UiBadge tone="muted">Active cards</UiBadge>

                  <div class="w-full overflow-hidden rounded-[24px] border border-white/10 bg-slate-950/45 px-3 py-5 shadow-[0_18px_40px_rgba(2,6,23,0.16)] sm:px-4">
                    <PlayerHand :cards="focusCards" :empty-label="selfPlayer?.isAdjudicator ? 'Adjudicator' : 'Waiting for deal'" :flip-key="room.game.round" />
                  </div>
                </div>
              </div>

              <div class="grid gap-3 sm:grid-cols-3">
                <div class="rounded-[22px] border border-white/10 bg-slate-950/35 p-4">
                  <p class="text-[11px] uppercase tracking-[0.24em] text-slate-500">Connected</p>
                  <p class="mt-3 text-2xl font-semibold text-white">{{ topPlayers.length }}</p>
                </div>
                <div class="rounded-[22px] border border-white/10 bg-slate-950/35 p-4">
                  <p class="text-[11px] uppercase tracking-[0.24em] text-slate-500">Answers ready</p>
                  <p class="mt-3 text-2xl font-semibold text-white">{{ judgableAnswers.length }}</p>
                </div>
                <div class="rounded-[22px] border border-white/10 bg-slate-950/35 p-4">
                  <p class="text-[11px] uppercase tracking-[0.24em] text-slate-500">Your seat</p>
                  <p class="mt-3 text-lg font-semibold text-white">{{ selfPlayer?.isAdjudicator ? 'Judge' : 'Contestant' }}</p>
                  <p class="mt-1 text-xs text-slate-400">{{ selfPlayer?.hasAnswered ? 'Locked in' : 'Awaiting action' }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <aside class="order-3 min-w-0">
          <div class="rounded-[28px] border border-white/10 bg-white/[0.03] p-4 sm:p-5">
            <div class="flex items-center justify-between gap-3">
              <div>
                <p class="text-xs uppercase tracking-[0.3em] text-slate-500">Right lane</p>
                <p class="mt-2 text-sm text-slate-400">Mirror lane for the rest of the table.</p>
              </div>
              <UiBadge tone="muted">{{ rightSeats.length }} seats</UiBadge>
            </div>

            <div class="mt-5 grid gap-4 overflow-hidden lg:max-h-[38rem] lg:overflow-y-auto lg:pr-1 soft-scrollbar">
              <div v-if="rightSeats.length === 0" class="rounded-[24px] border border-dashed border-white/10 px-4 py-10 text-center text-sm text-slate-500">
                Empty lane
              </div>

              <article v-for="seat in rightSeats" :key="seat.player.id" class="overflow-hidden rounded-[24px] border border-white/10 bg-slate-950/40 p-4">
                <div class="flex items-center justify-between gap-3">
                  <div class="min-w-0">
                    <p class="truncate font-medium text-white">{{ seat.player.username }}</p>
                    <p class="mt-1 text-[11px] uppercase tracking-[0.24em] text-slate-500">{{ seat.player.isAdjudicator ? 'reading the table' : seat.positionLabel }}</p>
                  </div>
                  <div class="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-sm font-semibold text-slate-100">{{ seat.player.score }}</div>
                </div>

                <div class="mt-4 overflow-hidden rounded-[22px] border border-white/10 bg-white/[0.02] px-3 py-4">
                  <PlayerHand :cards="seat.cards" compact :empty-label="seat.player.isAdjudicator ? 'Judging' : 'Waiting'" :flip-key="room.game.round" />
                </div>
              </article>
            </div>
          </div>
        </aside>
      </div>
    </UiPanel>

    <div class="grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
      <UiPanel padding="lg">
        <div class="flex items-center justify-between gap-3">
          <div>
            <UiBadge tone="accent">Actions</UiBadge>
            <h3 class="mt-4 text-2xl font-semibold tracking-tight text-white">Controls and choices</h3>
          </div>
          <UiBadge tone="muted">Bottom rail</UiBadge>
        </div>

        <div v-if="!selfPlayer?.isAdjudicator" class="mt-6 space-y-4" v-motion :initial="{ opacity: 0, y: 14 }" :enter="{ opacity: 1, y: 0 }">
          <textarea
            v-model="draftAnswer"
            rows="5"
            class="input-shell resize-none"
            :disabled="!canAnswer"
            :placeholder="props.privateState?.wildCard === 'safe_pass' ? 'Type an answer or leave blank to safe pass.' : 'Your answer goes here. Sell the lie or own the truth.'"
          />
          <UiButton variant="primary" block :disabled="!canSubmitAnswer" @click="submitOwnAnswer">
            {{ selfPlayer?.hasAnswered ? 'Answer locked in' : props.privateState?.wildCard === 'safe_pass' ? 'Submit answer or pass' : 'Submit answer' }}
          </UiButton>
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
                <UiButton class="min-w-24" variant="primary" :class="guesses[player.id] === 'truth' ? '!ring-2 !ring-blue-100' : ''" @click="guesses[player.id] = 'truth'">
                  Truth
                </UiButton>
                <UiButton class="min-w-24" variant="danger" :class="guesses[player.id] === 'false' ? '!ring-2 !ring-rose-100' : ''" @click="guesses[player.id] = 'false'">
                  Lie
                </UiButton>
              </div>
            </div>
          </div>

          <UiButton variant="secondary" block :disabled="!canSubmitVotes" @click="submitJudgement">
            Lock adjudicator verdict
          </UiButton>
        </div>
      </UiPanel>

      <UiPanel padding="lg">
        <div class="flex items-center justify-between gap-3">
          <div>
            <UiBadge tone="accent">Your hand</UiBadge>
            <h3 class="mt-4 text-2xl font-semibold tracking-tight text-white">Private role spread</h3>
          </div>
          <UiBadge tone="muted">Hover cards</UiBadge>
        </div>

        <div class="mt-6 overflow-hidden rounded-[28px] border border-white/10 bg-[rgba(8,12,22,0.42)] px-3 py-5 sm:px-5 sm:py-5">
          <PlayerHand
            :cards="selfCards"
            :empty-label="selfPlayer?.isAdjudicator ? 'Adjudicator' : 'Waiting for deal'"
            :flip-key="room.game.round"
            @card-click="handleSelfCardClick"
          />
        </div>
        <div v-if="canPlaySelectedCard" class="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-[22px] border border-amber-400/20 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">
          <p>Selected {{ selectedCardLabel }}. Play it to the center table for everyone to see.</p>
          <UiButton variant="secondary" class="!border-amber-200/30 !text-amber-50" @click="playSelectedCard">Play card to center</UiButton>
        </div>
        <p class="mt-5 text-sm text-slate-400">{{ statusLine }}</p>
      </UiPanel>
    </div>

    <EndRoundModal :open="room.game.phase === 'results' && showResults" :results="room.game.results" :can-advance="canAdvance" @close="dismissResults" @next-round="$emit('nextRound')" />
  </section>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import Card from './Card.vue'
import Deck from './Deck.vue'
import EndRoundModal from './EndRoundModal.vue'
import PlayerHand, { type HandCardItem } from './PlayerHand.vue'
import UiBadge from '@/components/ui/UiBadge.vue'
import UiButton from '@/components/ui/UiButton.vue'
import UiPanel from '@/components/ui/UiPanel.vue'
import type { PlayedCardType, PrivateState, RoomState } from '@/types/game'

const WILD_CARD_DETAILS = {
  forced_truth: {
    title: 'Forced Truth',
    subtitle: 'Truth overrides your base role',
    status: 'Forced Truth is active. Your role resolves as truth this round.',
  },
  forced_bluff: {
    title: 'Forced Bluff',
    subtitle: 'Lie even if your base card says truth',
    status: 'Forced Bluff is active. Your role resolves as a lie this round.',
  },
  counter: {
    title: 'Counter Card',
    subtitle: 'Blocks judge bonus on a correct read',
    status: 'Counter is active. A correct read on you does not pay the adjudicator.',
  },
  double_bluff: {
    title: 'Double Bluff',
    subtitle: 'Missed lies pay out extra',
    status: 'Double Bluff is active. If your lie lands, it earns bonus player points.',
  },
  echo: {
    title: 'Echo',
    subtitle: 'A miss against you pays an echo bonus',
    status: 'Echo is active. A missed read on you pays an extra point.',
  },
  misdirect: {
    title: 'Misdirect',
    subtitle: 'Your revealed role flips for scoring',
    status: 'Misdirect is active. Your role is flipped during scoring.',
  },
  reverse_read: {
    title: 'Reverse Read',
    subtitle: 'The judge call flips before scoring',
    status: 'Reverse Read is active. The adjudicator call is inverted against you.',
  },
  safe_pass: {
    title: 'Safe Pass',
    subtitle: 'You can pass and still bank a guarded point',
    status: 'Safe Pass is active. You may submit no answer and still lock in a guarded point.',
  },
  silencer: {
    title: 'Silencer',
    subtitle: 'Your answer text stays hidden while judging',
    status: 'Silencer is active. The adjudicator reads your role without seeing your text.',
  },
  spotlight: {
    title: 'Spotlight',
    subtitle: 'This read pays double stakes',
    status: 'Spotlight is active. The score swing on your read is doubled.',
  },
} as const

const props = defineProps<{
  room: RoomState
  privateState: PrivateState | null
  selfId: string
  canAdvance: boolean
  lastDealtAt: number
  lastCardPlayedAt: number
}>()

const emit = defineEmits<{
  submitAnswer: [answer: string]
  submitVote: [guesses: Record<string, 'truth' | 'false'>]
  playCard: [cardType: PlayedCardType]
  nextRound: []
}>()

const draftAnswer = ref('')
const showResults = ref(true)
const guesses = reactive<Record<string, 'truth' | 'false'>>({})
const selectedCardType = ref<PlayedCardType | null>(null)

const focusSeatPresets = [
  { left: 50, top: 14 },
  { left: 20, top: 42 },
  { left: 80, top: 42 },
  { left: 50, top: 76 },
  { left: 28, top: 20 },
  { left: 72, top: 20 },
]

watch(
  () => props.room.game.round,
  () => {
    draftAnswer.value = ''
    showResults.value = true
    selectedCardType.value = null
    for (const key of Object.keys(guesses)) {
      delete guesses[key]
    }
  },
  { immediate: true },
)

const selfPlayer = computed(() => props.room.players.find((player) => player.id === props.selfId) ?? null)
const topPlayers = computed(() => props.room.players.filter((player) => player.connected))
const canAnswer = computed(() => {
  if (!selfPlayer.value || selfPlayer.value.isAdjudicator) {
    return false
  }
  return props.room.game.phase === 'question_reveal' || props.room.game.phase === 'answer_phase'
})
const canSubmitAnswer = computed(() => {
  if (!canAnswer.value || selfPlayer.value?.hasAnswered) {
    return false
  }

  return draftAnswer.value.trim().length > 2 || props.privateState?.wildCard === 'safe_pass'
})
const judgableAnswers = computed(() => props.room.players.filter((player) => !player.isAdjudicator && player.answerText))
const canSubmitVotes = computed(() => judgableAnswers.value.length > 0 && judgableAnswers.value.every((player) => guesses[player.id]))
const phaseLabel = computed(() => props.room.game.phase.replace('_', ' '))
const playedCard = computed(() => props.room.game.playedCard)
const playedCardAnimationKey = computed(() => playedCard.value?.playedAt ?? props.lastCardPlayedAt)
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
    return 'Verdicts are in. Review the swing, then reset for the next deal.'
  }
  return 'Waiting for the room.'
})
const statusLine = computed(() => {
  if (props.room.game.phase === 'results') {
    return 'Round scoring is settled. Review the recap, watch the standings shift, and get ready for the next question.'
  }
  if (selfPlayer.value?.hasAnswered) {
    return 'Your answer is locked. Watch the table and prepare for the verdict.'
  }
  if (props.privateState?.wildCard) {
    return describeWildCard(props.privateState.wildCard).status
  }
  return 'Answer in text now. Voice room can be layered in later without changing the state model.'
})

const sideSeats = computed(() => {
  const players = props.room.players.filter((player) => player.connected && player.id !== props.selfId)
  return players.map((player, index) => ({
    player,
    positionLabel: index % 2 === 0 ? 'table left' : 'table right',
    cards: handCardsForPlayer(player, false),
  }))
})

const leftSeats = computed(() => sideSeats.value.filter((_seat, index) => index % 2 === 0))
const rightSeats = computed(() => sideSeats.value.filter((_seat, index) => index % 2 === 1))
const selfCards = computed<HandCardItem[]>(() => handCardsForPlayer(selfPlayer.value ?? null, true))
const focusCards = computed<HandCardItem[]>(() => {
  if (selfPlayer.value?.isAdjudicator) {
    return [
      {
        id: 'judge-focus',
        title: 'Adjudicator',
        subtitle: 'Read the room and catch the bluff',
        tone: 'neutral',
        revealed: true,
        badgeLabel: 'Judge',
      },
    ]
  }

  return selfCards.value
})
const canPlaySelectedCard = computed(() => Boolean(selectedCardType.value && canAnswer.value && !selfPlayer.value?.hasAnswered))
const selectedCardLabel = computed(() => (selectedCardType.value === 'wild' ? 'wild card' : 'primary card'))

const deckTargets = computed(() =>
  topPlayers.value
    .filter((player) => !player.isAdjudicator)
    .map((player, index) => {
      const preset = focusSeatPresets[index] ?? focusSeatPresets[focusSeatPresets.length - 1]
      const cards = handCardsForPlayer(player, player.id === props.selfId)
      return {
        id: player.id,
        left: preset.left,
        top: preset.top,
        cardCount: cards.length || 2,
      }
    }),
)

function handCardsForPlayer(player: RoomState['players'][number] | null, isSelf: boolean): HandCardItem[] {
  if (!player || player.isAdjudicator) {
    return []
  }

  if (isSelf) {
    const wildDetails = describeWildCard(props.privateState?.wildCard ?? null)
    return [
      {
        id: `${player.id}-primary`,
        title: props.privateState?.primaryCard === 'false' ? 'False Card' : 'Truth Card',
        subtitle: props.privateState?.primaryCard === 'false' ? 'Lie convincingly' : 'Tell the truth',
        tone: props.privateState?.primaryCard === 'false' ? 'false' : 'truth',
        revealed: true,
        isFlipped: true,
        playable: canAnswer.value,
        cardType: 'primary',
        badgeLabel: 'Primary',
      },
      {
        id: `${player.id}-wild`,
        title: wildDetails.title,
        subtitle: wildDetails.subtitle,
        tone: 'wild',
        revealed: true,
        isFlipped: true,
        isWild: true,
        playable: canAnswer.value && Boolean(props.privateState?.wildCard),
        cardType: 'wild',
        badgeLabel: 'Wild',
      },
    ]
  }

  if (props.room.game.phase === 'results' && player.primaryCardKnown) {
    const wildDetails = describeWildCard(player.wildCardKnown ?? null)
    return [
      {
        id: `${player.id}-primary-known`,
        title: player.primaryCardKnown === 'false' ? 'False Card' : 'Truth Card',
        subtitle: player.botPersonalityLabel || 'Revealed role',
        tone: player.primaryCardKnown === 'false' ? 'false' : 'truth',
        revealed: true,
        isFlipped: true,
        badgeLabel: 'Reveal',
      },
      {
        id: `${player.id}-wild-known`,
        title: wildDetails.title,
        subtitle: player.wildCardKnown ? wildDetails.subtitle : 'No modifier this round',
        tone: 'wild',
        revealed: true,
        isFlipped: true,
        isWild: Boolean(player.wildCardKnown),
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

function playerCardClass(player: RoomState['players'][number]) {
  if (player.isAdjudicator) {
    return 'border-gold-400/30 bg-gold-400/10'
  }

  if (player.id === props.selfId) {
    return 'border-cyan-400/30 bg-cyan-400/10'
  }

  return 'border-white/10 bg-white/[0.03]'
}

function topStatusLabel(player: RoomState['players'][number]) {
  if (!player.connected) {
    return 'offline'
  }

  if (player.isAdjudicator) {
    return 'adjudicating'
  }

  return player.ready ? 'ready' : 'waiting'
}

function submitOwnAnswer() {
  if (!canSubmitAnswer.value) {
    return
  }
  emit('submitAnswer', draftAnswer.value.trim())
}

function handleSelfCardClick(card: HandCardItem & { isFlipped: boolean }) {
  selectedCardType.value = card.isFlipped && card.cardType ? card.cardType : null
}

function playSelectedCard() {
  if (!selectedCardType.value) {
    return
  }
  emit('playCard', selectedCardType.value)
}

function describeWildCard(wildCard: PrivateState['wildCard']) {
  if (!wildCard) {
    return {
      title: 'No Wild',
      subtitle: 'No modifier this round',
      status: 'No wild modifier is active this round.',
    }
  }

  return WILD_CARD_DETAILS[wildCard]
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

<style scoped>
.table-play-enter-active,
.table-play-leave-active {
  transition: opacity 260ms ease, transform 420ms cubic-bezier(0.22, 1, 0.36, 1);
}

.table-play-enter-from,
.table-play-leave-to {
  opacity: 0;
  transform: translateY(56px) scale(0.84);
}
</style>
