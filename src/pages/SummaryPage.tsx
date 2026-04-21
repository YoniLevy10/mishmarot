import { addMonths, endOfMonth, format, startOfMonth } from 'date-fns'
import { he } from 'date-fns/locale'
import { useEffect, useMemo, useState } from 'react'
import { AppHeader } from '../components/AppHeader'
import { MonthlyChart } from '../components/MonthlyChart'
import { SummaryHero } from '../components/SummaryHero'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { useProfileSettings } from '../hooks/useProfileSettings'
import { useSessionUser } from '../hooks/useSessionUser'
import { calcShiftPay } from '../lib/calc'
import { exportToExcel } from '../lib/export'
import { listShiftsForMonth, listShiftsForRange } from '../lib/shifts'
import type { Shift } from '../types/domain'

function iso(d: Date) {
  return format(d, 'yyyy-MM-dd')
}

type TabKey = 'משמרות' | 'שעות' | 'לילה' | 'אש"ל'

export function SummaryPage() {
  const { user } = useSessionUser()
  const { settings } = useProfileSettings(user?.id ?? null)
  const [month] = useState(() => startOfMonth(new Date()))

  const monthLabel = useMemo(() => format(month, 'LLLL yyyy', { locale: he }), [month])
  const monthStartIso = useMemo(() => iso(startOfMonth(month)), [month])
  const monthEndIso = useMemo(() => iso(endOfMonth(month)), [month])

  const [tab, setTab] = useState<TabKey>('משמרות')
  const [shifts, setShifts] = useState<Shift[]>([])
  const [prevShifts, setPrevShifts] = useState<Shift[]>([])
  const [chartShifts, setChartShifts] = useState<Shift[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let alive = true
    async function load() {
      if (!user?.id) return
      setLoading(true)
      try {
        const data = await listShiftsForMonth(user.id, monthStartIso, monthEndIso)
        if (!alive) return
        setShifts(data)

        const prevMonth = addMonths(month, -1)
        const prevStart = iso(startOfMonth(prevMonth))
        const prevEnd = iso(endOfMonth(prevMonth))
        const prev = await listShiftsForMonth(user.id, prevStart, prevEnd)
        if (!alive) return
        setPrevShifts(prev)

        const chartStartMonth = addMonths(month, -5)
        const chartStart = iso(startOfMonth(chartStartMonth))
        const chartEnd = monthEndIso
        const chart = await listShiftsForRange(user.id, chartStart, chartEnd)
        if (!alive) return
        setChartShifts(chart)
      } finally {
        if (alive) setLoading(false)
      }
    }
    load()
    return () => {
      alive = false
    }
  }, [user?.id, monthStartIso, monthEndIso])

  const rows = useMemo(() => {
    return shifts.map((s) => ({ shift: s, calc: settings.hourly_rate > 0 ? calcShiftPay(s, settings) : null }))
  }, [settings, shifts])

  const totals = useMemo(() => {
    const totalHours = rows.reduce((sum, r) => sum + (r.calc?.totalHours ?? 0), 0)
    const nightHours = rows.reduce((sum, r) => sum + (r.calc?.nightHours ?? 0), 0)
    const ashel = rows.reduce((sum, r) => sum + (r.calc?.ashel ?? 0), 0)
    const shiftGross = rows.reduce((sum, r) => sum + (r.calc?.gross ?? 0), 0)
    const uniqueDays = new Set(shifts.map((s) => s.date)).size
    const travel = settings.travel_daily * uniqueDays
    const gross = shiftGross + travel
    return { totalHours, nightHours, ashel, travel, gross }
  }, [rows, settings.travel_daily, shifts])

  const prevTotals = useMemo(() => {
    if (settings.hourly_rate <= 0) return { gross: 0 }
    const shiftGross = prevShifts.reduce((sum, s) => sum + calcShiftPay(s, settings).gross, 0)
    const uniqueDays = new Set(prevShifts.map((s) => s.date)).size
    return { gross: shiftGross + settings.travel_daily * uniqueDays }
  }, [prevShifts, settings])

  const trend = useMemo(() => {
    if (settings.hourly_rate <= 0) return 0
    if (prevTotals.gross <= 0) return 0
    return ((totals.gross - prevTotals.gross) / prevTotals.gross) * 100
  }, [prevTotals.gross, settings.hourly_rate, totals.gross])

  const chartData = useMemo(() => {
    if (settings.hourly_rate <= 0) return []
    // last 6 months including current month
    const months: { key: string; month: number; year: number; gross: number }[] = []
    for (let i = 5; i >= 0; i -= 1) {
      const m = addMonths(month, i - 5)
      months.push({
        key: `${m.getFullYear()}-${m.getMonth()}`,
        month: m.getMonth(),
        year: m.getFullYear(),
        gross: 0,
      })
    }

    for (const s of chartShifts) {
      const d = new Date(`${s.date}T00:00:00`)
      const key = `${d.getFullYear()}-${d.getMonth()}`
      const bucket = months.find((x) => x.key === key)
      if (!bucket) continue
      bucket.gross += calcShiftPay(s, settings).gross
    }

    // add travel per month based on unique days in that month
    for (const bucket of months) {
      const inMonth = chartShifts.filter((s) => {
        const d = new Date(`${s.date}T00:00:00`)
        return d.getFullYear() === bucket.year && d.getMonth() === bucket.month
      })
      const days = new Set(inMonth.map((s) => s.date)).size
      bucket.gross += settings.travel_daily * days
    }

    return months.map(({ month, year, gross }) => ({ month, year, gross }))
  }, [chartShifts, month, settings])

  return (
    <div className="space-y-3">
      <AppHeader
        user={user}
        showExport
        onExport={() => {
          if (!user) return
          exportToExcel(shifts, settings, monthLabel)
        }}
      />

      <SummaryHero
        gross={totals.gross}
        hours={totals.totalHours}
        shifts={shifts.length}
        trend={trend}
      />

      <MonthlyChart data={chartData} />

      <Card>
        <div className="text-sm font-extrabold text-slate-900 dark:text-white">סיכום חודשי · {monthLabel}</div>
        <div className="mt-2 text-xs text-slate-500 dark:text-slate-300/80">הערכה בלבד — לא כולל ניכויים ומס.</div>
      </Card>

      <Card>
        <div className="text-lg font-extrabold text-emerald-700 dark:text-emerald-300">
          {settings.hourly_rate > 0 ? `₪${totals.gross.toFixed(0)}` : '—'}
        </div>
        <div className="mt-2 grid grid-cols-2 gap-2 text-sm text-slate-700 dark:text-slate-200/90">
          <div>
            שעות: <span className="font-bold text-slate-900 dark:text-white">{totals.totalHours.toFixed(2)}</span>
          </div>
          <div>
            לילה: <span className="font-bold text-slate-900 dark:text-white">{totals.nightHours.toFixed(2)}</span>
          </div>
          <div>
            אש"ל: <span className="font-bold text-slate-900 dark:text-white">₪{totals.ashel.toFixed(0)}</span>
          </div>
          <div>
            נסיעות: <span className="font-bold text-slate-900 dark:text-white">₪{totals.travel.toFixed(0)}</span>
          </div>
        </div>
      </Card>

      <div className="flex gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm dark:border-slate-800 dark:bg-slate-950/40">
        {(['משמרות', 'שעות', 'לילה', 'אש"ל'] as TabKey[]).map((k) => (
          <Button
            key={k}
            variant={tab === k ? 'primary' : 'ghost'}
            className="flex-1"
            onClick={() => setTab(k)}
          >
            {k}
          </Button>
        ))}
      </div>

      {loading ? (
        <Card>
          <div className="text-sm text-slate-700 dark:text-slate-200">טוען…</div>
        </Card>
      ) : (
        <Card>
          {tab === 'משמרות' ? (
            <div className="space-y-2 text-sm">
              {rows.map(({ shift, calc }) => (
                <div key={shift.id} className="flex items-center justify-between gap-3 border-b border-slate-200 pb-2 last:border-b-0 last:pb-0 dark:border-slate-800/80">
                  <div className="text-slate-700 dark:text-slate-200/90">
                    {shift.date} · {shift.start_time.slice(0, 5)}–{shift.end_time.slice(0, 5)}
                  </div>
                  <div className="font-extrabold text-emerald-700 dark:text-emerald-300">{calc ? `₪${calc.gross.toFixed(0)}` : '—'}</div>
                </div>
              ))}
            </div>
          ) : null}

          {tab === 'שעות' ? (
            <div className="space-y-2 text-sm">
              {rows.map(({ shift, calc }) => (
                <div key={shift.id} className="flex items-center justify-between gap-3 border-b border-slate-200 pb-2 last:border-b-0 last:pb-0 dark:border-slate-800/80">
                  <div className="text-slate-700 dark:text-slate-200/90">{shift.date}</div>
                  <div className="font-bold text-slate-900 dark:text-white">{(calc?.totalHours ?? 0).toFixed(2)}</div>
                </div>
              ))}
            </div>
          ) : null}

          {tab === 'לילה' ? (
            <div className="space-y-2 text-sm">
              {rows.map(({ shift, calc }) => (
                <div key={shift.id} className="flex items-center justify-between gap-3 border-b border-slate-200 pb-2 last:border-b-0 last:pb-0 dark:border-slate-800/80">
                  <div className="text-slate-700 dark:text-slate-200/90">{shift.date}</div>
                  <div className="font-bold text-slate-900 dark:text-white">{(calc?.nightHours ?? 0).toFixed(2)}</div>
                </div>
              ))}
            </div>
          ) : null}

          {tab === "אש\"ל" ? (
            <div className="space-y-2 text-sm">
              {rows.map(({ shift, calc }) => (
                <div key={shift.id} className="flex items-center justify-between gap-3 border-b border-slate-200 pb-2 last:border-b-0 last:pb-0 dark:border-slate-800/80">
                  <div className="text-slate-700 dark:text-slate-200/90">{shift.date}</div>
                  <div className="font-bold text-slate-900 dark:text-white">₪{(calc?.ashel ?? 0).toFixed(0)}</div>
                </div>
              ))}
            </div>
          ) : null}
        </Card>
      )}
    </div>
  )
}

