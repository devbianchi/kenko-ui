import { calendarioMock } from '../../../../mocks/calendar/calendario'
import { currentBusinessMonth, MIN_SELECTABLE_MONTH } from '../../../shared/utils/month'

export const calendarData = calendarioMock.data
export const CALENDAR_FALLBACK_MONTH = calendarData.today.slice(0, 7)

export function readCalendarMonth(value: string | null) {
  const candidate = value && /^(?!0000)\d{4}-(0[1-9]|1[0-2])$/.test(value)
    ? value
    : CALENDAR_FALLBACK_MONTH
  const maximum = currentBusinessMonth()
  if (candidate < MIN_SELECTABLE_MONTH) return MIN_SELECTABLE_MONTH
  return candidate > maximum ? maximum : candidate
}

export function getVisibleCalendarDates(month: string) {
  const [year, monthNumber] = month.split('-').map(Number)
  const firstDay = new Date(Date.UTC(year, monthNumber - 1, 1))
  const startOffset = firstDay.getUTCDay()
  const daysInMonth = new Date(Date.UTC(year, monthNumber, 0)).getUTCDate()
  const totalDays = Math.max(5, Math.ceil((startOffset + daysInMonth) / 7)) * 7

  return Array.from({ length: totalDays }, (_, index) => {
    const date = new Date(Date.UTC(year, monthNumber - 1, 1 - startOffset + index))
    return {
      date: `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-${String(date.getUTCDate()).padStart(2, '0')}`,
      day: date.getUTCDate(),
      inMonth: date.getUTCMonth() === monthNumber - 1,
    }
  })
}

export function formatCalendarMonthTitle(month: string) {
  const monthName = new Intl.DateTimeFormat('pt-BR', { month: 'long', timeZone: 'UTC' })
    .format(new Date(`${month}-15T12:00:00Z`))
  const titleMonth = monthName[0].toLocaleUpperCase('pt-BR') + monthName.slice(1)
  return `${titleMonth} | ${month.slice(0, 4)}`
}
