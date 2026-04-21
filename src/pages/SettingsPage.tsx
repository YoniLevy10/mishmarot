import { useMemo, useState } from 'react'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Field } from '../components/ui/Field'
import { useProfileSettings } from '../hooks/useProfileSettings'
import { useSessionUser } from '../hooks/useSessionUser'
import { updateProfile } from '../lib/profiles'
import { supabase } from '../lib/supabase'

function toNum(v: string): number {
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}

export function SettingsPage() {
  const { user } = useSessionUser()
  const { settings, setSettings, loading } = useProfileSettings(user?.id ?? null)
  const [busy, setBusy] = useState(false)

  const canSave = useMemo(() => Boolean(user?.id) && !busy && !loading, [user?.id, busy, loading])

  return (
    <div className="space-y-3">
      <Card>
        <div className="text-sm font-bold text-white">הגדרות</div>
        <div className="mt-1 text-xs text-slate-300/80">נשמר לפי המשתמש ב־Supabase.</div>
      </Card>

      <Card>
        <div className="space-y-3">
          <Field
            label="תפקיד"
            value={settings.role}
            onChange={(e) => setSettings((s) => ({ ...s, role: e.target.value }))}
            placeholder="למשל: מאבטח חמוש"
          />

          <Field
            label="תעריף שעתי ברוטו (₪)"
            inputMode="decimal"
            value={String(settings.hourly_rate)}
            onChange={(e) => setSettings((s) => ({ ...s, hourly_rate: toNum(e.target.value) }))}
          />

          <div className="grid grid-cols-2 gap-3">
            <Field
              label="שעות בסיס יומיות"
              inputMode="decimal"
              value={String(settings.base_daily_hours)}
              onChange={(e) => setSettings((s) => ({ ...s, base_daily_hours: toNum(e.target.value) }))}
              hint="ברירת מחדל: 6.67"
            />
            <Field
              label='אש"ל יומי (₪)'
              inputMode="decimal"
              value={String(settings.ashel_rate)}
              onChange={(e) => setSettings((s) => ({ ...s, ashel_rate: toNum(e.target.value) }))}
              hint="ברירת מחדל: 28"
            />
          </div>

          <Field
            label="נסיעות יומיות (₪)"
            inputMode="decimal"
            value={String(settings.travel_daily)}
            onChange={(e) => setSettings((s) => ({ ...s, travel_daily: toNum(e.target.value) }))}
          />

          <div className="flex gap-2">
            <Button
              className="flex-1"
              disabled={!canSave}
              onClick={async () => {
                if (!user?.id) return
                setBusy(true)
                try {
                  await updateProfile(user.id, settings)
                } finally {
                  setBusy(false)
                }
              }}
            >
              שמור
            </Button>
            <Button
              variant="danger"
              disabled={busy}
              onClick={async () => {
                setBusy(true)
                try {
                  await supabase.auth.signOut()
                } finally {
                  setBusy(false)
                }
              }}
            >
              יציאה
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}

