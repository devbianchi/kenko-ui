import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { getData } from '../../shared/api/client'
import { getVisibleRange } from './data/calendar'
import type { CalendarData } from './data/calendar'

/** Contagem de consultas por data no intervalo visível da grade do mês. */
export function useCalendar(month: string) {
  const { startDate, endDateExclusive } = getVisibleRange(month)
  return useQuery({
    queryKey: ['calendar', startDate, endDateExclusive],
    queryFn: ({ signal }) =>
      getData<CalendarData>(`/calendar?startDate=${startDate}&endDateExclusive=${endDateExclusive}`, signal),
    placeholderData: keepPreviousData,
  })
}
