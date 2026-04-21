import type { Shift, ShiftCalc, UserSettings } from '../types/domain'
import { isFriday, isSaturday } from './date'

function normTime(t: string): string {
  // Accept "HH:mm" or "HH:mm:ss"
  return t.length === 5 ? `${t}:00` : t
}

export function calcShiftPay(shift: Shift, settings: UserSettings): ShiftCalc {
  const totalHours = calcTotalHours(normTime(shift.start_time), normTime(shift.end_time))
  const nightHours = calcNightHours(normTime(shift.start_time), normTime(shift.end_time))
  const isFri = isFriday(shift.date)
  const isSat = isSaturday(shift.date)
  const rate = settings.hourly_rate
  const base = settings.base_daily_hours

  let pay = 0

  if (isSat) {
    pay = totalHours * rate * 1.5
  } else if (isFri) {
    const baseHours = Math.min(totalHours, base)
    const overHours = Math.max(0, totalHours - base)
    pay = baseHours * rate * 1.25 + overHours * rate * 1.5
  } else {
    const baseHours = Math.min(totalHours, base)
    const over = Math.max(0, totalHours - base)
    const over125 = Math.min(over, 2)
    const over150 = Math.max(0, over - 2)
    pay = baseHours * rate + over125 * rate * 1.25 + over150 * rate * 1.5
  }

  // Night bonus: 50% on each night hour
  pay += nightHours * rate * 0.5

  const ashel = shift.ashel ? settings.ashel_rate : 0
  const travel = settings.travel_daily

  return {
    totalHours,
    nightHours,
    basePay: pay,
    ashel,
    travel,
    gross: pay + ashel + travel,
  }
}

export function calcTotalHours(start: string, end: string): number {
  const [sh, sm] = start.split(':').map(Number)
  const [eh, em] = end.split(':').map(Number)
  const s = sh + sm / 60
  const e = eh + em / 60
  return e <= s ? 24 - s + e : e - s
}

export function calcNightHours(start: string, end: string): number {
  // Night = 22:00–06:00
  const total = calcTotalHours(start, end)
  const [sh, sm] = start.split(':').map(Number)
  const [eh, em] = end.split(':').map(Number)
  let s = sh + sm / 60
  let e = eh + em / 60
  if (e <= s) e += 24

  let night = 0
  // 22:00–24:00
  const n1s = 22
  const n1e = 24
  const o1 = Math.min(e, n1e) - Math.max(s, n1s)
  if (o1 > 0) night += o1

  // 00:00–06:00 (as 24–30 in same axis)
  const n2s = 24
  const n2e = 30
  const o2 = Math.min(e, n2e) - Math.max(s, n2s)
  if (o2 > 0) night += o2

  // If started before 06:00 on same day
  if (s < 6) {
    night += Math.min(e, 6) - s
  }

  return Math.min(night, total)
}

