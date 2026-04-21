import { useEffect, useMemo, useState } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import type { Session } from '@supabase/supabase-js'
import { supabase, supabaseEnv } from '../lib/supabase'
import { ensureProfile } from '../lib/profiles'

export function AuthGate() {
  const location = useLocation()
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [profileReady, setProfileReady] = useState(false)

  useEffect(() => {
    let alive = true

    if (!supabaseEnv.ok) {
      setSession(null)
      setLoading(false)
      return () => {
        alive = false
      }
    }

    async function boot() {
      const { data, error } = await supabase.auth.getSession()
      if (!alive) return
      if (error) {
        setSession(null)
        setLoading(false)
        return
      }
      setSession(data.session)
      setLoading(false)
    }

    boot()

    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
      setProfileReady(false)
      setLoading(false)
    })

    return () => {
      alive = false
      sub.subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    let alive = true
    async function ensure() {
      if (!session?.user?.id) return
      try {
        await ensureProfile(session.user.id)
        if (alive) setProfileReady(true)
      } catch {
        if (alive) setProfileReady(true)
      }
    }
    ensure()
    return () => {
      alive = false
    }
  }, [session?.user?.id])

  const shouldAllow = useMemo(() => Boolean(session?.user?.id), [session?.user?.id])

  if (loading) {
    return (
      <div className="app-shell min-h-[100svh] px-4 py-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 text-slate-700 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200">
          טוען…
        </div>
      </div>
    )
  }

  if (!shouldAllow) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  if (!profileReady) {
    return (
      <div className="app-shell min-h-[100svh] px-4 py-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 text-slate-700 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200">
          מכין פרופיל…
        </div>
      </div>
    )
  }

  return <Outlet />
}

