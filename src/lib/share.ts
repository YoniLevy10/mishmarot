import type { Shift, ShiftCalc } from '../types/domain'

export async function shareShift(shift: Shift, calc: ShiftCalc) {
  const d = new Date(`${shift.date}T00:00:00`)
  const text = `📋 משמרת ${d.getDate()}/${d.getMonth() + 1}
⏰ ${shift.start_time.slice(0, 5)}–${shift.end_time.slice(0, 5)} (${calc.totalHours.toFixed(1)} שע')
${calc.nightHours > 0 ? `🌙 לילה: ${calc.nightHours.toFixed(1)} שע'\n` : ''}💰 ₪${Math.round(calc.gross).toLocaleString('he-IL')}`

  try {
    if (navigator.share) {
      await navigator.share({ text })
      return
    }
  } catch {
    // fall through
  }

  await navigator.clipboard.writeText(text)
}
