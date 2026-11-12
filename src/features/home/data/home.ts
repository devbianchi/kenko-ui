import { homeMock } from '../../../../mocks/home/home'
import { currentBusinessMonth, MIN_SELECTABLE_MONTH } from '../../../shared/utils/month'

// Tipos de apresentação do protótipo; não são contratos da futura API.
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
  clinic: { name: string }
  appointments: { total: number; complete: number; pending: number; cancelled: number }
  bestDay: { date: string; appointmentCount: number } | null
  peakHour: { hour: number; appointmentCount: number; otherBusinessHoursAverage: number; aboveAverage: number } | null
  bestRoom: { id: string; name: string; appointmentCount: number } | null
  attendanceDuration: { statistic: 'median'; seconds: number | null; previousSeconds: number | null; differenceSeconds: number | null }
  upcomingAppointments: readonly UpcomingAppointment[]
}

export const HOME_MOCK_MONTH = '2026-11'
export const homeData: HomeData = homeMock.data
export const businessTimeZone = 'America/Sao_Paulo'

export function readHomeMonth(value: string | null) {
  const month = value && /^(?!0000)\d{4}-(0[1-9]|1[0-2])$/.test(value) ? value : HOME_MOCK_MONTH
  const maxMonth = currentBusinessMonth()
  if (month < MIN_SELECTABLE_MONTH) return MIN_SELECTABLE_MONTH
  return month > maxMonth ? maxMonth : month
}

export function formatDay(date: string) {
  return new Intl.DateTimeFormat('pt-BR', { timeZone: businessTimeZone, day: '2-digit', month: '2-digit' }).format(new Date(`${date}T12:00:00-03:00`))
}

export function formatDuration(seconds: number | null) {
  if (seconds === null) return '—'
  const rounded = Math.round(seconds)
  return `${Math.floor(rounded / 60)}m${String(rounded % 60).padStart(2, '0')}s`
}

export function durationDifference(seconds: number | null) {
  if (seconds === null) return 'Sem comparação com o mês anterior'
  if (seconds === 0) return 'Sem variação em relação ao mês anterior'
  const difference = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 }).format(Math.abs(seconds))
  return `${seconds < 0 ? 'Melhoria' : 'Aumento'} de ${difference}s em relação ao mês anterior`
}

export function selectUpcoming(appointments: readonly UpcomingAppointment[], now: Date) {
  return appointments
    .filter(appointment => appointment.status === 'pending' && new Date(appointment.startsAt).getTime() > now.getTime())
    .sort((first, second) => Date.parse(first.startsAt) - Date.parse(second.startsAt))
    .slice(0, 5)
}
