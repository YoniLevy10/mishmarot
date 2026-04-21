import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'
import { calcShiftPay } from './calc'
import type { Shift, UserSettings } from '../types/domain'

function uniqueDates(shifts: Shift[]) {
  return new Set(shifts.map((s) => s.date))
}

export function exportToExcel(shifts: Shift[], settings: UserSettings, monthName: string) {
  const travelTotal = settings.travel_daily * uniqueDates(shifts).size

  const rows = shifts.map((s) => {
    const c = calcShiftPay(s, settings)
    const d = new Date(`${s.date}T00:00:00`)
    return {
      תאריך: `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`,
      יום: ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'][d.getDay()],
      כניסה: s.start_time.slice(0, 5),
      יציאה: s.end_time.slice(0, 5),
      'סה"כ שעות': +c.totalHours.toFixed(2),
      'שעות לילה': +c.nightHours.toFixed(2),
      'שעות 125%': +c.over125.toFixed(2),
      'שעות 150%': +c.over150.toFixed(2),
      שישי: c.isFriday ? 'כן' : '',
      שבת: c.isSaturday ? 'כן' : '',
      'אש"ל': c.ashel,
      נסיעות: '',
      'שכר ברוטו': +c.gross.toFixed(2),
    }
  })

  const total = shifts.reduce(
    (acc, s) => {
      const c = calcShiftPay(s, settings)
      acc.gross += c.gross
      acc.hours += c.totalHours
      return acc
    },
    { gross: 0, hours: 0 },
  )

  rows.push({} as any)
  rows.push({
    תאריך: 'סה"כ',
    'סה"כ שעות': +total.hours.toFixed(2),
    נסיעות: travelTotal,
    'שכר ברוטו': +(total.gross + travelTotal).toFixed(2),
  } as any)

  const ws = XLSX.utils.json_to_sheet(rows, { skipHeader: false })
  ;(ws as any)['!dir'] = 'rtl'

  ws['!cols'] = [
    { wch: 12 },
    { wch: 8 },
    { wch: 8 },
    { wch: 8 },
    { wch: 12 },
    { wch: 12 },
    { wch: 12 },
    { wch: 12 },
    { wch: 6 },
    { wch: 6 },
    { wch: 8 },
    { wch: 8 },
    { wch: 12 },
  ]

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, monthName)
  const buf = XLSX.write(wb, { type: 'array', bookType: 'xlsx' })
  saveAs(new Blob([buf]), `משמרות_${monthName}.xlsx`)
}
