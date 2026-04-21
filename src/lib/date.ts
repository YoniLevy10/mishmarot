import { format, isFriday as _isFriday, isSaturday as _isSaturday, parseISO } from 'date-fns'
import { he } from 'date-fns/locale'

export function fmtDateHebrew(dateIso: string) {
  return format(parseISO(dateIso), 'dd/MM/yyyy', { locale: he })
}

export function dayNameHebrew(dateIso: string) {
  return format(parseISO(dateIso), 'EEEE', { locale: he })
}

export function isFriday(dateIso: string) {
  return _isFriday(parseISO(dateIso))
}

export function isSaturday(dateIso: string) {
  return _isSaturday(parseISO(dateIso))
}

