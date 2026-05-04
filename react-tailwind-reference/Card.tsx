import type { CardTone } from './types'

type CardProps = {
  title: string
  subtitle?: string
  tone?: CardTone
  isFlipped?: boolean
  isWild?: boolean
  isPlayed?: boolean
  interactive?: boolean
  selected?: boolean
  playAnimationKey?: string | number
  backLabel?: string
  badgeLabel?: string
  onActivate?: () => void
}

const toneClasses: Record<CardTone, string> = {
  truth: 'from-emerald-500/30 to-emerald-900/70 border-emerald-300/25',
  false: 'from-rose-500/30 to-rose-950/70 border-rose-300/25',
  wild: 'from-amber-400/30 to-amber-950/70 border-amber-200/30',
  question: 'from-sky-500/30 to-sky-950/70 border-sky-200/30',
  neutral: 'from-slate-400/20 to-slate-950/70 border-white/10',
}

export function Card({
  title,
  subtitle,
  tone = 'neutral',
  isFlipped = false,
  isWild = false,
  isPlayed = false,
  interactive = false,
  selected = false,
  playAnimationKey,
  backLabel = 'Hidden card',
  badgeLabel = 'Knowem',
  onActivate,
}: CardProps) {
  const shellClassName = [
    'group relative aspect-[826/574] w-40 rounded-[26px] transition duration-300 [perspective:1200px]',
    interactive ? 'cursor-pointer' : '',
    selected ? '-translate-y-1' : '',
    isPlayed ? 'drop-shadow-[0_22px_42px_rgba(2,6,23,0.38)]' : 'drop-shadow-[0_16px_30px_rgba(2,6,23,0.26)]',
    isWild ? 'drop-shadow-[0_0_28px_rgba(251,191,36,0.25)]' : '',
  ].join(' ')

  const innerClassName = [
    'relative h-full w-full rounded-[26px] transition-transform duration-500 [transform-style:preserve-3d]',
    isFlipped ? '[transform:rotateY(180deg)]' : '',
    playAnimationKey ? 'animate-[card-pop_480ms_cubic-bezier(0.22,1,0.36,1)]' : '',
  ].join(' ')

  return (
    <button
      type="button"
      className={shellClassName}
      onClick={interactive ? onActivate : undefined}
      aria-pressed={selected}
    >
      {isWild ? (
        <span className="absolute right-3 top-3 z-20 rounded-full border border-amber-200/40 bg-amber-950/80 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.24em] text-amber-100">
          Wild Card
        </span>
      ) : null}

      <div className={innerClassName}>
        <div className="absolute inset-0 rounded-[26px] border border-white/10 bg-[linear-gradient(180deg,rgba(148,163,184,0.18),rgba(15,23,42,0.9))] p-4 text-left [backface-visibility:hidden]">
          <div className="flex h-full flex-col justify-between rounded-[20px] border border-white/10 bg-slate-950/70 p-4 text-slate-200">
            <div>
              <p className="text-[10px] uppercase tracking-[0.28em] text-slate-400">{badgeLabel}</p>
              <p className="mt-4 text-2xl font-semibold tracking-tight text-white">{backLabel}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-300">
              Flip to reveal
            </div>
          </div>
        </div>

        <div
          className={[
            'absolute inset-0 rounded-[26px] border bg-gradient-to-br p-4 text-left [backface-visibility:hidden] [transform:rotateY(180deg)]',
            toneClasses[tone],
          ].join(' ')}
        >
          <div className="flex h-full flex-col justify-between rounded-[20px] border border-white/10 bg-slate-950/70 p-4 text-slate-100">
            <div>
              <p className="text-[10px] uppercase tracking-[0.28em] text-slate-300">{badgeLabel}</p>
              <h3 className="mt-4 text-2xl font-semibold tracking-tight text-white">{title}</h3>
              {subtitle ? <p className="mt-2 text-sm leading-5 text-slate-300">{subtitle}</p> : null}
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs uppercase tracking-[0.24em] text-slate-300">
              {isPlayed ? 'Center table' : 'In hand'}
            </div>
          </div>
        </div>
      </div>
    </button>
  )
}