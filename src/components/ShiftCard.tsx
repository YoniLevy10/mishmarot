import type { Shift, ShiftCalc, UserSettings } from '../types/domain'
import { calcShiftPay } from '../lib/calc'
import { dayNameHebrew, fmtDateHebrew, isFriday, isSaturday } from '../lib/date'

export function ShiftCard({
  shift,
  settings,
  onClick,
}: {
  shift: Shift
  settings: UserSettings
  onClick: () => void
}) {
  const calc: ShiftCalc | null = settings.hourly_rate > 0 ? calcShiftPay(shift, settings) : null
  const fri = isFriday(shift.date)
  const sat = isSaturday(shift.date)

  const border = sat ? 'border-indigo-400' : fri ? 'border-amber-500' : 'border-slate-700'
  const dayBadge = sat ? 'שבת' : fri ? 'שישי' : null

  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'w-full rounded-2xl border bg-slate-800/60 p-4 text-right',
        'hover:bg-slate-800 active:scale-[0.995] transition',
        border,
      ].join(' ')}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm text-slate-200/90">
            <span className="font-bold">{fmtDateHebrew(shift.date)}</span>{' '}
            <span className="text-slate-300/80">({dayNameHebrew(shift.date)})</span>
          </div>
          <div className="mt-1 text-xs text-slate-300/80">
            {shift.start_time.slice(0, 5)}–{shift.end_time.slice(0, 5)} · {shift.shift_type ?? 'נוכחות'}
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          {dayBadge ? (
            <span
              className={[
                'rounded-full px-2 py-0.5 text-[11px] font-bold',
                sat ? 'bg-indigo-400/15 text-indigo-200' : 'bg-amber-500/15 text-amber-200',
              ].join(' ')}
            >
              {dayBadge}
            </span>
          ) : null}

          {calc?.nightHours ? (
            <span className="rounded-full bg-slate-900/50 px-2 py-0.5 text-[11px] text-slate-200">
              🌙 {calc.nightHours.toFixed(2)} ש׳ לילה
            </span>
          ) : null}
        </div>
      </div>

      <div className="mt-3 flex items-baseline justify-between gap-3">
        <div className="text-sm text-slate-200/90">
          סה״כ: <span className="font-bold">{calc?.totalHours.toFixed(2) ?? '—'}</span> שעות
        </div>
        <div className="text-sm text-slate-200/90">
          שכר: <span className="font-extrabold text-emerald-300">{calc ? `₪${calc.gross.toFixed(0)}` : '—'}</span>
        </div>
      </div>
    </button>
  )
}

