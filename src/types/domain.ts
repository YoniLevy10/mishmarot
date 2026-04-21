export type ShiftType = 'נוכחות' | 'תפקיד' | 'עפ.הסכם'

export type Profile = {
  id: string
  role: string | null
  hourly_rate: number | null
  base_daily_hours: number | null
  ashel_rate: number | null
  travel_daily: number | null
  created_at: string | null
}

export type Shift = {
  id: string
  user_id: string
  date: string // YYYY-MM-DD
  start_time: string // HH:mm:ss or HH:mm
  end_time: string // HH:mm:ss or HH:mm
  shift_type: ShiftType | null
  ashel: boolean | null
  notes: string | null
  created_at: string | null
}

export type UserSettings = {
  hourly_rate: number
  base_daily_hours: number
  ashel_rate: number
  travel_daily: number
  role: string
}

export type ShiftCalc = {
  totalHours: number
  nightHours: number
  basePay: number
  ashel: number
  travel: number
  gross: number
}

