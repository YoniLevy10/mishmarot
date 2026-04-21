import { Navigate, useLocation } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import { supabase, supabaseEnv } from '../lib/supabase'
import type { Session } from '@supabase/supabase-js'
import { useTheme } from '../hooks/useTheme'

export function LoginPage() {
  const location = useLocation()
  const { theme, toggle } = useTheme()
  const [session, setSession] = useState<Session | null>(null)
  const [isSignup, setIsSignup] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
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
      <div className="app-shell min-h-[100svh] px-4 py-10" dir="rtl">
        <div className="mx-auto w-full max-w-sm rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="text-xl font-extrabold text-slate-900 dark:text-white">משמרות</div>
          <div className="mt-1 text-sm text-slate-500 dark:text-slate-300/80">חסר קונפיגורציה של Supabase</div>

          <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-900 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-50">
            <div className="font-bold">צריך להגדיר ב‑Vercel:</div>
            <ul className="mt-2 list-inside list-disc">
              {supabaseEnv.missing.map((name) => (
                <li key={name}>
                  <code className="font-semibold">{name}</code>
                </li>
              ))}
            </ul>
            <div className="mt-2 text-xs text-rose-900/80 dark:text-rose-100/80">אחרי שמגדירים, עושים Redeploy ואז רענון לדף.</div>
          </div>
        </div>
      </div>
    )
  }

  async function handleGoogle() {
    setError('')
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
        queryParams: { prompt: 'select_account' },
      },
    })
    if (error) setError(error.message)
  }

  async function handleEmail() {
    if (!canSubmit || submitting) return
    setSubmitting(true)
    setError('')
    try {
      const fn = isSignup
        ? supabase.auth.signUp({ email: email.trim(), password })
        : supabase.auth.signInWithPassword({ email: email.trim(), password })
      const { error } = await fn
      if (error) setError(error.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="app-shell flex min-h-[100svh] items-center justify-center px-4 py-10" dir="rtl">
      <div className="relative w-full max-w-sm">
        <button
          type="button"
          onClick={toggle}
          className="absolute -top-2 left-0 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 shadow-sm hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-900"
          aria-label="החלפת ערכת נושא"
        >
          {theme === 'dark' ? 'מצב בהיר' : 'מצב כהה'}
        </button>

        <div className="text-center">
          <div className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 shadow-sm">
            <span className="text-2xl text-white">⏱</span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">משמרות</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-300/80">ניהול משמרות וחישוב שכר</p>
        </div>

        <div className="mt-10 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <button
            type="button"
            onClick={handleGoogle}
            className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-950"
          >
            <GoogleIcon />
            כניסה עם Google
          </button>

          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-100 dark:border-slate-800" />
            </div>
            <div className="relative flex justify-center text-xs text-slate-400">
              <span className="bg-white px-3 dark:bg-slate-900">או</span>
            </div>
          </div>

          <div className="space-y-3">
            <input
              type="email"
              placeholder="אימייל"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              inputMode="email"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
            />
            <input
              type="password"
              placeholder="סיסמה"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={isSignup ? 'new-password' : 'current-password'}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
            />

            {error ? <p className="text-xs text-rose-600 dark:text-rose-300">{error}</p> : null}

            <button
              type="button"
              onClick={handleEmail}
              disabled={!canSubmit || submitting}
              className="w-full rounded-xl bg-blue-600 py-3 text-sm font-extrabold text-white transition hover:bg-blue-700 disabled:opacity-50"
            >
              {submitting ? '…' : isSignup ? 'הרשמה' : 'כניסה'}
            </button>

            <button
              type="button"
              onClick={() => {
                setError('')
                setIsSignup((v) => !v)
              }}
              className="w-full text-center text-xs text-slate-500 transition hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-300"
            >
              {isSignup ? 'יש לך חשבון? כניסה' : 'אין חשבון? הרשמה'}
            </button>
          </div>
        </div>

        <div className="mt-4 text-center text-[11px] text-slate-400 dark:text-slate-500">
          Google OAuth דורש הפעלה ב‑Supabase Dashboard (Providers → Google) + Redirect URL של Supabase.
        </div>
      </div>
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 002.38-5.88c0-.57-.05-.66-.15-1.18z"
      />
      <path
        fill="#34A853"
        d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2.01a4.8 4.8 0 01-7.18-2.54H1.83v2.07A8 8 0 008.98 17z"
      />
      <path fill="#FBBC05" d="M4.5 10.52a4.8 4.8 0 010-3.04V5.41H1.83a8 8 0 000 7.18l2.67-2.07z" />
      <path fill="#EA4335" d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 001.83 5.4L4.5 7.49a4.77 4.77 0 014.48-3.31z" />
    </svg>
  )
}

