import { currentBusinessMonth, MIN_SELECTABLE_MONTH } from '../../../shared/utils/month'

// Formato de data em GET /api/dashboard?month=YYYY-MM, conforme o contrato da API.
export type UpcomingAppointment = {
  id: string
  status: 'pending' | 'complete' | 'cancelled'
  startsAt: string
  endsAt: string
  patient: { id: string; name: string }
  specialty: { id: string; name: string }
  doctor: { id: string; name: string }
  room: { id: string; name: string }
}

export type HomeData = {
  clinic: { id: string; name: string }
  appointments: { total: number; complete: number; pending: number; cancelled: number }
  bestDay: { date: string; appointmentCount: number } | null
  peakHour: { hour: number; appointmentCount: number; otherBusinessHoursAverage: number; aboveAverage: number } | null
  bestRoom: { id: string; name: string; appointmentCount: number } | null
  attendanceDuration: { statistic: 'median'; seconds: number | null; previousSeconds: number | null; differenceSeconds: number | null }
  upcomingAppointments: readonly UpcomingAppointment[]
}

export const businessTimeZone = 'America/Sao_Paulo'

export function readHomeMonth(value: string | null) {
  const maxMonth = currentBusinessMonth()
  const month = value && /^(?!0000)\d{4}-(0[1-9]|1[0-2])$/.test(value) ? value : maxMonth
  if (month < MIN_SELECTABLE_MONTH) return MIN_SELECTABLE_MONTH
  return month > maxMonth ? maxMonth : month
}

export function formatDay(date: string) {
  return new Intl.DateTimeFormat('pt-BR', { timeZone: businessTimeZone, day: '2-digit', month: '2-digit' }).format(new Date(`${date}T12:00:00-03:00`))
}

export function durationDifference(seconds: number | null) {
  if (seconds === null) return 'Sem comparação com o mês anterior'
  if (seconds === 0) return 'Sem variação em relação ao mês anterior'
  const difference = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 }).format(Math.abs(seconds))
  return `${seconds < 0 ? 'Melhoria' : 'Aumento'} de ${difference}s em relação ao mês anterior`
}
