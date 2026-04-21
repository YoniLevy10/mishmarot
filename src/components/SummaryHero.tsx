export function SummaryHero({
  gross,
  hours,
  shifts,
  trend,
}: {
  gross: number
  hours: number
  shifts: number
  trend: number
}) {
  return (
    <div className="rounded-3xl bg-gradient-to-br from-blue-600 to-blue-700 p-6 text-white shadow-sm">
      <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-blue-100">הערכת שכר חודשי</p>
      <div className="mb-4 flex items-end gap-2">
        <span className="text-4xl font-extrabold tabular-nums">₪{Math.round(gross).toLocaleString('he-IL')}</span>
        {trend !== 0 ? (
          <span className={`mb-1 text-sm font-semibold ${trend > 0 ? 'text-emerald-200' : 'text-rose-200'}`}>
            {trend > 0 ? '↑' : '↓'} {Math.abs(trend).toFixed(0)}%
          </span>
        ) : null}
      </div>
      <div className="flex gap-6">
        <div>
          <p className="text-xs text-blue-100">משמרות</p>
          <p className="text-lg font-extrabold tabular-nums">{shifts}</p>
        </div>
        <div>
          <p className="text-xs text-blue-100">שעות</p>
          <p className="text-lg font-extrabold tabular-nums">{hours.toFixed(1)}</p>
        </div>
        <div>
          <p className="text-xs text-blue-100">ממוצע למשמרת</p>
          <p className="text-lg font-extrabold tabular-nums">
            ₪{shifts > 0 ? Math.round(gross / shifts).toLocaleString('he-IL') : 0}
          </p>
        </div>
      </div>
      <p className="mt-3 text-xs text-blue-100/90">* הערכה בלבד — לא כולל ניכויים ומס</p>
    </div>
  )
}
