import { useMemo, useState } from 'react'
import { Card } from './Card'
import { PlayerHand } from './PlayerHand'
import type { HandCardItem, PlayedCardState, PlayedCardType, PrivateState, PublicPlayer, RoomSnapshot } from './types'

type GameTableProps = {
  room: RoomSnapshot
  privateState: PrivateState | null
  selfId: string
  lastCardPlayedAt: number
  onPlayCard: (cardType: PlayedCardType) => void
}

const wildCardLabels: Record<string, { title: string; subtitle: string }> = {
  forced_truth: { title: 'Forced Truth', subtitle: 'Truth overrides the base role.' },
  forced_bluff: { title: 'Forced Bluff', subtitle: 'A bluff overrides the base role.' },
  counter: { title: 'Counter Card', subtitle: 'Blocks the judge bonus on a correct read.' },
  double_bluff: { title: 'Double Bluff', subtitle: 'A missed lie pays extra.' },
  echo: { title: 'Echo', subtitle: 'A missed read echoes into bonus pressure.' },
  misdirect: { title: 'Misdirect', subtitle: 'The revealed role flips at scoring time.' },
  reverse_read: { title: 'Reverse Read', subtitle: 'The judge call flips before scoring.' },
  safe_pass: { title: 'Safe Pass', subtitle: 'You can pass and still bank a guarded point.' },
  silencer: { title: 'Silencer', subtitle: 'Your answer text stays hidden while judged.' },
  spotlight: { title: 'Spotlight', subtitle: 'The score swing doubles on this play.' },
}

function buildSelfCards(privateState: PrivateState | null, canAnswer: boolean): HandCardItem[] {
  if (!privateState?.primaryCard) {
    return []
  }

  const primaryTone = privateState.primaryCard === 'false' ? 'false' : 'truth'
  const wild = privateState.wildCard ? wildCardLabels[privateState.wildCard] : null

  return [
    {
      id: 'primary-card',
      title: privateState.primaryCard === 'false' ? 'False Card' : 'Truth Card',
      subtitle: privateState.primaryCard === 'false' ? 'Lie convincingly' : 'Tell the truth',
      tone: primaryTone,
      revealed: true,
      isFlipped: true,
      playable: canAnswer,
      cardType: 'primary',
      badgeLabel: 'Primary',
    },
    {
      id: 'wild-card',
      title: wild?.title ?? 'No Wild Card',
      subtitle: wild?.subtitle ?? 'No modifier this round',
      tone: 'wild',
      revealed: true,
      isFlipped: true,
      isWild: Boolean(privateState.wildCard),
      playable: canAnswer && Boolean(privateState.wildCard),
      cardType: 'wild',
      badgeLabel: 'Wild',
    },
  ]
}

export function GameTable({ room, privateState, selfId, lastCardPlayedAt, onPlayCard }: GameTableProps) {
  const [selectedCardType, setSelectedCardType] = useState<PlayedCardType | null>(null)
  const selfPlayer = room.players.find((player) => player.id === selfId) ?? null
  const canAnswer = room.game.phase === 'answer_collection' && Boolean(selfPlayer) && !selfPlayer.isAdjudicator && !selfPlayer.hasAnswered
  const selfCards = useMemo(() => buildSelfCards(privateState, canAnswer), [privateState, canAnswer])
  const playedCard: PlayedCardState | null = room.game.playedCard

  return (
    <section className="space-y-6">
      <div className="rounded-[32px] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.14),transparent_42%),linear-gradient(180deg,rgba(7,12,22,0.92),rgba(2,6,23,0.96))] p-5 shadow-[0_28px_80px_rgba(2,6,23,0.38)]">
        <div className="relative flex min-h-[320px] flex-col items-center justify-center overflow-hidden rounded-[28px] border border-white/10 bg-[rgba(8,12,22,0.55)] px-4 py-8">
          {playedCard ? (
            <div key={playedCard.id + String(lastCardPlayedAt)} className="pointer-events-none absolute inset-x-0 top-4 flex justify-center px-4">
              <div className="flex flex-col items-center gap-2 rounded-[28px] border border-white/10 bg-[rgba(10,14,26,0.56)] px-4 py-3 backdrop-blur-md shadow-[0_24px_60px_rgba(2,6,23,0.32)]">
                <Card
                  title={playedCard.title}
                  subtitle={playedCard.subtitle}
                  tone={playedCard.tone}
                  isFlipped={true}
                  isWild={playedCard.isWild}
                  isPlayed={true}
                  playAnimationKey={playedCard.playedAt}
                  badgeLabel="Played"
                  backLabel="Played card"
                />
                <p className="text-center text-[11px] uppercase tracking-[0.24em] text-slate-300">
                  {playedCard.username} played {playedCard.isWild ? 'a wild card' : 'to center table'}
                </p>
              </div>
            </div>
          ) : null}

          <div className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] uppercase tracking-[0.24em] text-slate-400">
            Active cards
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm uppercase tracking-[0.26em] text-slate-500">Question</p>
            <h2 className="mt-3 max-w-3xl text-3xl font-semibold tracking-tight text-white">
              {room.game.question ?? 'Waiting for the next reveal.'}
            </h2>
          </div>
        </div>

        <div className="mt-6 overflow-hidden rounded-[28px] border border-white/10 bg-[rgba(8,12,22,0.42)] px-3 py-5 sm:px-5">
          <PlayerHand
            cards={selfCards}
            flipKey={room.game.round}
            emptyLabel={selfPlayer?.isAdjudicator ? 'Adjudicator' : 'Waiting for deal'}
            onCardClick={(card) => setSelectedCardType(card.isFlipped ? card.cardType ?? null : null)}
          />
        </div>

        {selectedCardType && canAnswer ? (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-[22px] border border-amber-400/20 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">
            <p>Selected {selectedCardType === 'wild' ? 'wild card' : 'primary card'}. Play it to the center table for everyone to see.</p>
            <button
              type="button"
              className="rounded-full border border-amber-200/30 bg-white/5 px-4 py-2 text-sm font-medium text-amber-50 transition hover:bg-white/10"
              onClick={() => onPlayCard(selectedCardType)}
            >
              Play card to center
            </button>
          </div>
        ) : null}
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        {room.players.map((player: PublicPlayer) => (
          <div key={player.id} className="rounded-[24px] border border-white/10 bg-white/[0.03] px-4 py-4">
            <p className="text-lg font-semibold text-white">{player.username}</p>
            <p className="mt-1 text-sm text-slate-400">{player.isAdjudicator ? 'Adjudicator' : 'Contestant'}</p>
            <p className="mt-3 text-[11px] uppercase tracking-[0.24em] text-slate-500">Score</p>
            <p className="mt-1 text-2xl font-semibold text-slate-100">{player.score}</p>
          </div>
        ))}
      </div>
    </section>
  )
}