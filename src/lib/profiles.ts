import type { Profile, UserSettings } from '../types/domain'
import { supabase } from './supabase'

export const DEFAULT_SETTINGS: UserSettings = {
  role: 'מאבטח חמוש',
  hourly_rate: 0,
  base_daily_hours: 6.67,
  ashel_rate: 28,
  travel_daily: 0,
}

export function normalizeSettings(profile: Profile | null): UserSettings {
  return {
    role: profile?.role ?? DEFAULT_SETTINGS.role,
    hourly_rate: Number(profile?.hourly_rate ?? DEFAULT_SETTINGS.hourly_rate),
    base_daily_hours: Number(profile?.base_daily_hours ?? DEFAULT_SETTINGS.base_daily_hours),
    ashel_rate: Number(profile?.ashel_rate ?? DEFAULT_SETTINGS.ashel_rate),
    travel_daily: Number(profile?.travel_daily ?? DEFAULT_SETTINGS.travel_daily),
  }
}

export async function ensureProfile(userId: string) {
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle()
  if (error) throw error
  if (data) return data as Profile

  const { data: inserted, error: insertError } = await supabase
    .from('profiles')
    .insert({ id: userId })
    .select('*')
    .single()

  if (insertError) throw insertError
  return inserted as Profile
}

export async function updateProfile(userId: string, patch: Partial<UserSettings>) {
  const payload = {
    id: userId,
    role: patch.role,
    hourly_rate: patch.hourly_rate,
    base_daily_hours: patch.base_daily_hours,
    ashel_rate: patch.ashel_rate,
    travel_daily: patch.travel_daily,
  }
  const { data, error } = await supabase.from('profiles').upsert(payload).select('*').single()
  if (error) throw error
  return data as Profile
}

