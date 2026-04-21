import { endOfMonth, format, startOfMonth } from 'date-fns'
import { he } from 'date-fns/locale'
import { useEffect, useMemo, useState } from 'react'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { useProfileSettings } from '../hooks/useProfileSettings'
import { useSessionUser } from '../hooks/useSessionUser'
import { calcShiftPay } from '../lib/calc'
import { listShiftsForMonth } from '../lib/shifts'
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
    const travel = rows.reduce((sum, r) => sum + (r.calc?.travel ?? 0), 0)
    const gross = rows.reduce((sum, r) => sum + (r.calc?.gross ?? 0), 0)
    return { totalHours, nightHours, ashel, travel, gross }
  }, [rows])

  return (
    <div className="space-y-3">
      <Card>
        <div className="text-sm font-bold text-white">סיכום חודשי · {monthLabel}</div>
        <div className="mt-2 text-xs text-slate-300/80">הערכה בלבד — לא כולל ניכויים ומס.</div>
      </Card>

      <Card>
        <div className="text-lg font-extrabold text-emerald-300">
          {settings.hourly_rate > 0 ? `₪${totals.gross.toFixed(0)}` : '—'}
        </div>
        <div className="mt-2 grid grid-cols-2 gap-2 text-sm text-slate-200/90">
          <div>שעות: <span className="font-bold text-white">{totals.totalHours.toFixed(2)}</span></div>
          <div>לילה: <span className="font-bold text-white">{totals.nightHours.toFixed(2)}</span></div>
          <div>אש"ל: <span className="font-bold text-white">₪{totals.ashel.toFixed(0)}</span></div>
          <div>נסיעות: <span className="font-bold text-white">₪{totals.travel.toFixed(0)}</span></div>
        </div>
      </Card>

      <div className="flex gap-2 rounded-2xl bg-slate-900/40 p-2">
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
        <Card>טוען…</Card>
      ) : (
        <Card>
          {tab === 'משמרות' ? (
            <div className="space-y-2 text-sm">
              {rows.map(({ shift, calc }) => (
                <div key={shift.id} className="flex items-center justify-between gap-3 border-b border-slate-700/60 pb-2 last:border-b-0 last:pb-0">
                  <div className="text-slate-200/90">
                    {shift.date} · {shift.start_time.slice(0, 5)}–{shift.end_time.slice(0, 5)}
                  </div>
                  <div className="font-extrabold text-emerald-300">{calc ? `₪${calc.gross.toFixed(0)}` : '—'}</div>
                </div>
              ))}
            </div>
          ) : null}

          {tab === 'שעות' ? (
            <div className="space-y-2 text-sm">
              {rows.map(({ shift, calc }) => (
                <div key={shift.id} className="flex items-center justify-between gap-3 border-b border-slate-700/60 pb-2 last:border-b-0 last:pb-0">
                  <div className="text-slate-200/90">{shift.date}</div>
                  <div className="font-bold text-white">{(calc?.totalHours ?? 0).toFixed(2)}</div>
                </div>
              ))}
            </div>
          ) : null}

          {tab === 'לילה' ? (
            <div className="space-y-2 text-sm">
              {rows.map(({ shift, calc }) => (
                <div key={shift.id} className="flex items-center justify-between gap-3 border-b border-slate-700/60 pb-2 last:border-b-0 last:pb-0">
                  <div className="text-slate-200/90">{shift.date}</div>
                  <div className="font-bold text-white">{(calc?.nightHours ?? 0).toFixed(2)}</div>
                </div>
              ))}
            </div>
          ) : null}

          {tab === "אש\"ל" ? (
            <div className="space-y-2 text-sm">
              {rows.map(({ shift, calc }) => (
                <div key={shift.id} className="flex items-center justify-between gap-3 border-b border-slate-700/60 pb-2 last:border-b-0 last:pb-0">
                  <div className="text-slate-200/90">{shift.date}</div>
                  <div className="font-bold text-white">₪{(calc?.ashel ?? 0).toFixed(0)}</div>
                </div>
              ))}
            </div>
          ) : null}
        </Card>
      )}
    </div>
  )
}

