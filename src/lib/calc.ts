import type { Shift, ShiftCalc, UserSettings } from '../types/domain'
import { isFriday, isSaturday } from './date'

function normTime(t: string): string {
  // Accept "HH:mm" or "HH:mm:ss"
  return t.length === 5 ? `${t}:00` : t
}

export function calcShiftPay(shift: Shift, settings: UserSettings): ShiftCalc {
  const start = normTime(shift.start_time)
  const end = normTime(shift.end_time)

  const totalHours = calcTotalHours(start, end)
  const nightHours = calcNightHours(start, end)
  const isFri = isFriday(shift.date)
  const isSat = isSaturday(shift.date)
  const rate = settings.hourly_rate
  const baseDaily = settings.base_daily_hours

  let baseHours = 0
  let over125 = 0
  let over150 = 0
  let pay = 0

  if (isSat) {
    baseHours = totalHours
    over125 = 0
    over150 = 0
    pay = totalHours * rate * 1.5
  } else if (isFri) {
    baseHours = Math.min(totalHours, baseDaily)
    const overHours = Math.max(0, totalHours - baseDaily)
    over125 = 0
    over150 = overHours
    pay = baseHours * rate * 1.25 + over150 * rate * 1.5
  } else {
    baseHours = Math.min(totalHours, baseDaily)
    const over = Math.max(0, totalHours - baseDaily)
    over125 = Math.min(over, 2)
    over150 = Math.max(0, over - 2)
    pay = baseHours * rate + over125 * rate * 1.25 + over150 * rate * 1.5
  }

  const nightBonus = nightHours * rate * 0.5

  const tm20Hours = baseHours
  const tm50Hours = nightHours

  const ashel = shift.ashel ? settings.ashel_rate : 0
  // Travel is modeled as a daily allowance (not per-shift). Call-sites should aggregate by date/month.
  const travel = 0

  const gross = pay + nightBonus + ashel + travel

  return {
    totalHours,
    baseHours,
    over125,
    over150,
    nightHours,
    isFriday: isFri,
    isSaturday: isSat,
    tm20Hours,
    tm50Hours,
    basePay: pay,
    nightBonus,
    ashel,
    travel,
    gross,
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

