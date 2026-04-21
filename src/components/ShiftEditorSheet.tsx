import { useMemo, useState } from 'react'
import type { Shift, ShiftType, UserSettings } from '../types/domain'
import { BottomSheet } from './ui/BottomSheet'
import { Button } from './ui/Button'
import { Card } from './ui/Card'
import { CheckboxField, Field, SelectField } from './ui/Field'
import { calcShiftPay, calcTotalHours, calcNightHours } from '../lib/calc'

type Draft = {
  id?: string
  date: string
  start_time: string
  end_time: string
  shift_type: ShiftType
  ashel: boolean
  notes: string
}

function fromShift(shift: Shift | null, fallbackDateIso: string): Draft {
  return {
    id: shift?.id,
    date: shift?.date ?? fallbackDateIso,
    start_time: (shift?.start_time ?? '08:00').slice(0, 5),
    end_time: (shift?.end_time ?? '14:40').slice(0, 5),
    shift_type: (shift?.shift_type as ShiftType) ?? 'נוכחות',
    ashel: shift?.ashel ?? true,
    notes: shift?.notes ?? '',
  }
}

export function ShiftEditorSheet({
  open,
  onClose,
  shift,
  settings,
  fallbackDateIso,
  onSave,
  onDelete,
}: {
  open: boolean
  onClose: () => void
  shift: Shift | null
  settings: UserSettings
  fallbackDateIso: string
  onSave: (draft: Draft) => Promise<void>
  onDelete: (id: string) => Promise<void>
}) {
  const [draft, setDraft] = useState<Draft>(() => fromShift(shift, fallbackDateIso))
  const [busy, setBusy] = useState(false)

  // reset when opening/shift changes
  useMemo(() => {
    if (open) setDraft(fromShift(shift, fallbackDateIso))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, shift?.id, fallbackDateIso])

  const total = useMemo(() => calcTotalHours(`${draft.start_time}:00`, `${draft.end_time}:00`), [draft.start_time, draft.end_time])
  const night = useMemo(() => calcNightHours(`${draft.start_time}:00`, `${draft.end_time}:00`), [draft.start_time, draft.end_time])

  const pseudoShift: Shift = useMemo(
    () => ({
      id: draft.id ?? 'draft',
      user_id: 'me',
      date: draft.date,
      start_time: `${draft.start_time}:00`,
      end_time: `${draft.end_time}:00`,
      shift_type: draft.shift_type,
      ashel: draft.ashel,
      notes: draft.notes,
      created_at: null,
    }),
    [draft],
  )

  const calc = useMemo(() => (settings.hourly_rate > 0 ? calcShiftPay(pseudoShift, settings) : null), [pseudoShift, settings])

  return (
    <BottomSheet open={open} title={shift ? 'עריכת משמרת' : 'הוספת משמרת'} onClose={onClose}>
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <Field
            label="תאריך"
            type="date"
            value={draft.date}
            onChange={(e) => setDraft((d) => ({ ...d, date: e.target.value }))}
          />
          <SelectField
            label="סוג משמרת"
            value={draft.shift_type}
            onChange={(e) => setDraft((d) => ({ ...d, shift_type: e.target.value as ShiftType }))}
          >
            <option value="נוכחות">נוכחות</option>
            <option value="תפקיד">תפקיד</option>
            <option value="עפ.הסכם">עפ.הסכם</option>
          </SelectField>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field
            label="כניסה"
            type="time"
            value={draft.start_time}
            onChange={(e) => setDraft((d) => ({ ...d, start_time: e.target.value }))}
          />
          <Field
            label="יציאה"
            type="time"
            value={draft.end_time}
            onChange={(e) => setDraft((d) => ({ ...d, end_time: e.target.value }))}
          />
        </div>

        <CheckboxField label='אש"ל' checked={draft.ashel} onChange={(next) => setDraft((d) => ({ ...d, ashel: next }))} />

        <Field
          label="הערות"
          value={draft.notes}
          onChange={(e) => setDraft((d) => ({ ...d, notes: e.target.value }))}
          placeholder="אופציונלי"
        />

        <Card>
          <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
            <div>
              סה״כ: <span className="font-extrabold text-white">{total.toFixed(2)}</span> שעות
            </div>
            <div>
              לילה: <span className="font-extrabold text-white">{night.toFixed(2)}</span> שעות
            </div>
            <div>
              שכר: <span className="font-extrabold text-emerald-300">{calc ? `₪${calc.gross.toFixed(0)}` : '—'}</span>
            </div>
          </div>
          {settings.hourly_rate <= 0 ? (
            <div className="mt-2 text-xs text-slate-300/80">כדי לראות שכר משוער, הגדר תעריף לשעה במסך “הגדרות”.</div>
          ) : null}
        </Card>

        <div className="flex gap-2">
          <Button
            className="flex-1"
            disabled={busy}
            onClick={async () => {
              setBusy(true)
              try {
                await onSave(draft)
                onClose()
              } finally {
                setBusy(false)
              }
            }}
          >
            שמור
          </Button>
          {shift?.id ? (
            <Button
              variant="danger"
              disabled={busy}
              onClick={async () => {
                setBusy(true)
                try {
                  await onDelete(shift.id)
                  onClose()
                } finally {
                  setBusy(false)
                }
              }}
            >
              מחיקה
            </Button>
          ) : null}
        </div>
      </div>
    </BottomSheet>
  )
}

