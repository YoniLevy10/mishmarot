import { supabase } from './supabase'
import type { Shift } from '../types/domain'

export async function listShiftsForMonth(userId: string, monthStart: string, monthEnd: string) {
  const { data, error } = await supabase
    .from('shifts')
    .select('*')
    .eq('user_id', userId)
    .gte('date', monthStart)
    .lte('date', monthEnd)
    .order('date', { ascending: false })
    .order('start_time', { ascending: false })

  if (error) throw error
  return (data ?? []) as Shift[]
}

export async function listShiftsForRange(userId: string, rangeStart: string, rangeEnd: string) {
  const { data, error } = await supabase
    .from('shifts')
    .select('*')
    .eq('user_id', userId)
    .gte('date', rangeStart)
    .lte('date', rangeEnd)
    .order('date', { ascending: true })
    .order('start_time', { ascending: true })

  if (error) throw error
  return (data ?? []) as Shift[]
}

export async function upsertShift(shift: Partial<Shift> & { user_id: string }) {
  const { data, error } = await supabase.from('shifts').upsert(shift).select('*').single()
  if (error) throw error
  return data as Shift
}

export async function deleteShift(id: string) {
  const { error } = await supabase.from('shifts').delete().eq('id', id)
  if (error) throw error
}

