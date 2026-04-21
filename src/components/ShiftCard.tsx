import type { Shift, ShiftCalc, UserSettings } from '../types/domain'
import { calcShiftPay } from '../lib/calc'
import { dayNameHebrew, fmtDateHebrew, isFriday, isSaturday } from '../lib/date'
import { shareShift } from '../lib/share'

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

  const border = sat ? 'border-indigo-400' : fri ? 'border-amber-500' : 'border-slate-200 dark:border-slate-700'
  const dayBadge = sat ? 'שבת' : fri ? 'שישי' : null

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick()
        }
      }}
      className={[
        'w-full cursor-pointer rounded-2xl border bg-white p-4 text-right shadow-sm outline-none',
        'hover:bg-slate-50 active:scale-[0.995] transition',
        'focus-visible:ring-2 focus-visible:ring-blue-500/40',
        'dark:bg-slate-900 dark:hover:bg-slate-900/80',
        border,
      ].join(' ')}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm text-slate-800 dark:text-slate-200/90">
            <span className="font-bold">{fmtDateHebrew(shift.date)}</span>{' '}
            <span className="text-slate-500 dark:text-slate-300/80">({dayNameHebrew(shift.date)})</span>
          </div>
          <div className="mt-1 text-xs text-slate-500 dark:text-slate-300/80">
            {shift.start_time.slice(0, 5)}–{shift.end_time.slice(0, 5)} · {shift.shift_type ?? 'נוכחות'}
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          <div className="flex items-center gap-2">
            {calc ? (
              <button
                type="button"
                className="rounded-xl border border-slate-200 bg-white px-2 py-1 text-[11px] font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-900"
                onClick={(e) => {
                  e.stopPropagation()
                  void shareShift(shift, calc)
                }}
              >
                שיתוף
              </button>
            ) : null}
          </div>

          {dayBadge ? (
            <span
              className={[
                'rounded-full px-2 py-0.5 text-[11px] font-bold',
                sat ? 'bg-indigo-500/10 text-indigo-700 dark:bg-indigo-400/15 dark:text-indigo-200' : 'bg-amber-500/10 text-amber-800 dark:bg-amber-500/15 dark:text-amber-200',
              ].join(' ')}
            >
              {dayBadge}
            </span>
          ) : null}

          {calc?.nightHours ? (
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-800 dark:bg-slate-950/60 dark:text-slate-200">
              🌙 {calc.nightHours.toFixed(2)} ש׳ לילה
            </span>
          ) : null}
        </div>
      </div>

      <div className="mt-3 flex items-baseline justify-between gap-3">
        <div className="text-sm text-slate-700 dark:text-slate-200/90">
          סה״כ: <span className="font-bold">{calc?.totalHours.toFixed(2) ?? '—'}</span> שעות
        </div>
        <div className="text-sm text-slate-700 dark:text-slate-200/90">
          שכר: <span className="font-extrabold text-emerald-700 dark:text-emerald-300">{calc ? `₪${calc.gross.toFixed(0)}` : '—'}</span>
        </div>
      </div>
    </div>
  )
}

