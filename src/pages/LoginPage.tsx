import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { Navigate, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase, supabaseEnv } from '../lib/supabase'
import type { Session } from '@supabase/supabase-js'

export function LoginPage() {
  const location = useLocation()
  const [session, setSession] = useState<Session | null>(null)

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

  return (
    <div className="app-shell min-h-[100svh] px-4 py-8">
      <div className="mb-6 rounded-2xl bg-slate-800/60 p-5">
        <div className="text-2xl font-extrabold text-white">משמרות</div>
        <div className="mt-1 text-sm text-slate-300/80">כניסה / הרשמה עם אימייל</div>
      </div>

      <div className="rounded-2xl bg-slate-800/60 p-4">
        <Auth
          supabaseClient={supabase}
          providers={[]}
          appearance={{
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: '#818cf8',
                  brandAccent: '#a5b4fc',
                  inputBackground: '#0b1224',
                  inputBorder: '#334155',
                  inputText: '#e5e7eb',
                  inputLabelText: '#e5e7eb',
                  defaultButtonBackground: '#111827',
                  defaultButtonBackgroundHover: '#0f172a',
                  defaultButtonBorder: '#334155',
                  defaultButtonText: '#e5e7eb',
                },
              },
            },
          }}
          theme="dark"
          localization={{
            variables: {
              sign_in: {
                email_label: 'אימייל',
                password_label: 'סיסמה',
                button_label: 'כניסה',
                loading_button_label: 'טוען…',
                link_text: 'כבר יש לך משתמש? כניסה',
              },
              sign_up: {
                email_label: 'אימייל',
                password_label: 'סיסמה',
                button_label: 'הרשמה',
                loading_button_label: 'טוען…',
                link_text: 'אין לך משתמש? הרשמה',
              },
              forgotten_password: {
                email_label: 'אימייל',
                button_label: 'שלח לינק איפוס',
                loading_button_label: 'טוען…',
                link_text: 'שכחת סיסמה?',
              },
              update_password: {
                password_label: 'סיסמה חדשה',
                button_label: 'עדכן סיסמה',
                loading_button_label: 'טוען…',
              },
            },
          }}
        />
      </div>
    </div>
  )
}

