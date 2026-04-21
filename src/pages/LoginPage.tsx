import { Navigate, useLocation } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import { supabase, supabaseEnv } from '../lib/supabase'
import type { AuthError, Session } from '@supabase/supabase-js'
import { Button } from '../components/ui/Button'
import { Field } from '../components/ui/Field'

export function LoginPage() {
  const location = useLocation()
  const [session, setSession] = useState<Session | null>(null)
  const [mode, setMode] = useState<'sign_in' | 'sign_up'>('sign_in')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<AuthError | null>(null)
  const canSubmit = useMemo(() => email.trim().length > 3 && password.length >= 6, [email, password])

  useEffect(() => {
    let alive = true
    supabase.auth.getSession().then(({ data }) => {
      if (!alive) return
      setSession(data.session)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s))
    return () => {
      alive = false
      sub.subscription.unsubscribe()
    }
  }, [])

  const redirectTo = (location.state as { from?: string } | null)?.from ?? '/'
  if (session?.user) return <Navigate to={redirectTo} replace />

  if (!supabaseEnv.ok) {
    return (
      <div className="app-shell min-h-[100svh] px-4 py-8">
        <div className="mb-6 rounded-2xl bg-slate-800/60 p-5">
          <div className="text-2xl font-extrabold text-white">משמרות</div>
          <div className="mt-1 text-sm text-slate-300/80">חסר קונפיגורציה של Supabase</div>
        </div>

        <div className="rounded-2xl bg-slate-800/60 p-4 text-slate-200">
          <div className="text-sm font-bold text-white">צריך להגדיר ב‑Vercel:</div>
          <ul className="mt-2 list-inside list-disc text-sm text-slate-200/90">
            {supabaseEnv.missing.map((name) => (
              <li key={name}>
                <code className="text-slate-100">{name}</code>
              </li>
            ))}
          </ul>
          <div className="mt-3 text-xs text-slate-300/80">אחרי שמגדירים, עושים Redeploy ואז רענון לדף.</div>
        </div>
      </div>
    )
  }

  async function submit() {
    if (!canSubmit || submitting) return
    setSubmitting(true)
    setError(null)
    try {
      if (mode === 'sign_in') {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        })
        if (error) setError(error)
        return
      }

      const { error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
      })
      if (error) setError(error)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="app-shell min-h-[100svh] px-4 py-8">
      <div className="mb-6 rounded-2xl bg-slate-800/60 p-5">
        <div className="text-2xl font-extrabold text-white">משמרות</div>
        <div className="mt-1 text-sm text-slate-300/80">
          {mode === 'sign_in' ? 'כניסה עם אימייל' : 'הרשמה עם אימייל'}
        </div>
      </div>

      <div className="rounded-2xl bg-slate-800/60 p-4 text-slate-200">
        <div className="space-y-3">
          <Field
            label="אימייל"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            inputMode="email"
          />
          <Field
            label="סיסמה"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={mode === 'sign_in' ? 'current-password' : 'new-password'}
          />

          {error ? (
            <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-100">
              {error.message}
            </div>
          ) : null}

          <Button onClick={submit} disabled={!canSubmit || submitting}>
            {submitting ? 'טוען…' : mode === 'sign_in' ? 'כניסה' : 'הרשמה'}
          </Button>

          <button
            type="button"
            className="w-full rounded-xl px-3 py-2 text-sm text-slate-200/80 hover:bg-slate-900/30"
            onClick={() => {
              setError(null)
              setMode((m) => (m === 'sign_in' ? 'sign_up' : 'sign_in'))
            }}
          >
            {mode === 'sign_in' ? 'אין לך משתמש? הרשמה' : 'כבר יש לך משתמש? כניסה'}
          </button>
        </div>
      </div>
    </div>
  )
}

