import { addMonths, endOfMonth, format, startOfMonth } from 'date-fns'
import { he } from 'date-fns/locale'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ShiftCard } from '../components/ShiftCard'
import { ShiftEditorSheet } from '../components/ShiftEditorSheet'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Fab } from '../components/ui/Fab'
import { useProfileSettings } from '../hooks/useProfileSettings'
import { useSessionUser } from '../hooks/useSessionUser'
import { calcShiftPay } from '../lib/calc'
import { listShiftsForMonth, upsertShift, deleteShift } from '../lib/shifts'
import type { Shift } from '../types/domain'

function iso(d: Date) {
  return format(d, 'yyyy-MM-dd')
}

export function HomePage() {
  const { user } = useSessionUser()
  const { settings, loading: settingsLoading } = useProfileSettings(user?.id ?? null)

  const [month, setMonth] = useState(() => startOfMonth(new Date()))
  const monthLabel = useMemo(() => format(month, 'LLLL yyyy', { locale: he }), [month])
  const monthStartIso = useMemo(() => iso(startOfMonth(month)), [month])
  const monthEndIso = useMemo(() => iso(endOfMonth(month)), [month])

  const [shifts, setShifts] = useState<Shift[]>([])
  const [loading, setLoading] = useState(true)
  const [editorOpen, setEditorOpen] = useState(false)
  const [selected, setSelected] = useState<Shift | null>(null)

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

  const totals = useMemo(() => {
    if (settings.hourly_rate <= 0) return { gross: 0, count: shifts.length }
    const gross = shifts.reduce((sum, s) => sum + calcShiftPay(s, settings).gross, 0)
    return { gross, count: shifts.length }
  }, [settings, shifts])

  const fallbackDateIso = useMemo(() => iso(new Date()), [])

  return (
    <div className="space-y-3">
      <Card>
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-sm font-bold text-white">יומן מפתח</div>
            <div className="mt-1 text-xs text-slate-300/80">
              מסך סיכום למצב הפרויקט: מה בוצע, מה חסר, ומה הצעדים הבאים.
            </div>
          </div>
          <Link className="text-sm font-semibold text-indigo-200 hover:text-white" to="/dev-journal">
            פתיחה
          </Link>
        </div>
      </Card>

      <Card>
        <div className="flex items-center justify-between gap-2">
          <Button variant="ghost" onClick={() => setMonth((m) => addMonths(m, -1))}>
            ←
          </Button>
          <div className="text-sm font-bold text-white">{monthLabel}</div>
          <Button variant="ghost" onClick={() => setMonth((m) => addMonths(m, 1))}>
            →
          </Button>
        </div>
        <div className="mt-2 text-xs text-slate-300/80">
          {settings.hourly_rate > 0 ? `הערכת ברוטו לחודש: ₪${totals.gross.toFixed(0)}` : 'הגדר תעריף בהגדרות כדי לראות שכר משוער.'}
        </div>
      </Card>

      {loading || settingsLoading ? (
        <Card>טוען משמרות…</Card>
      ) : shifts.length === 0 ? (
        <Card>
          אין משמרות בחודש הזה. לחץ על “הוספה” כדי להתחיל.
        </Card>
      ) : (
        <div className="space-y-3">
          {shifts.map((s) => (
            <ShiftCard
              key={s.id}
              shift={s}
              settings={settings}
              onClick={() => {
                setSelected(s)
                setEditorOpen(true)
              }}
            />
          ))}
        </div>
      )}

      <Fab
        onClick={() => {
          setSelected(null)
          setEditorOpen(true)
        }}
      />

      <ShiftEditorSheet
        open={editorOpen}
        onClose={() => setEditorOpen(false)}
        shift={selected}
        settings={settings}
        fallbackDateIso={fallbackDateIso}
        onSave={async (draft) => {
          if (!user?.id) return
          const saved = await upsertShift({
            id: draft.id,
            user_id: user.id,
            date: draft.date,
            start_time: `${draft.start_time}:00`,
            end_time: `${draft.end_time}:00`,
            shift_type: draft.shift_type,
            ashel: draft.ashel,
            notes: draft.notes || null,
          })
          setShifts((prev) => {
            const exists = prev.some((p) => p.id === saved.id)
            const next = exists ? prev.map((p) => (p.id === saved.id ? saved : p)) : [saved, ...prev]
            return next
          })
        }}
        onDelete={async (id) => {
          await deleteShift(id)
          setShifts((prev) => prev.filter((s) => s.id !== id))
        }}
      />
    </div>
  )
}

