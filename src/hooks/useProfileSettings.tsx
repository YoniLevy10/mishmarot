import { useEffect, useState } from 'react'
import type { Profile, UserSettings } from '../types/domain'
import { normalizeSettings } from '../lib/profiles'
import { supabase } from '../lib/supabase'

export function useProfileSettings(userId: string | null) {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [settings, setSettings] = useState<UserSettings>(normalizeSettings(null))
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let alive = true
    async function load() {
      if (!userId) {
        setProfile(null)
        setSettings(normalizeSettings(null))
        setLoading(false)
        return
      }
      setLoading(true)
      const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle()
      if (!alive) return
      if (error) {
        setProfile(null)
        setSettings(normalizeSettings(null))
        setLoading(false)
        return
      }
      setProfile((data as Profile) ?? null)
      setSettings(normalizeSettings((data as Profile) ?? null))
      setLoading(false)
    }
    load()
    return () => {
      alive = false
    }
  }, [userId])

  return { profile, settings, loading, setProfile, setSettings }
}

