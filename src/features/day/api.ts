import { useQuery } from '@tanstack/react-query'
import { getData } from '../../shared/api/client'
import type { DayData } from './pages/DayPage'

/** Detalhe de uma data: totais, distribuição por hora, manhã e tarde, e salas. */
export function useDay(date: string) {
  return useQuery({
    queryKey: ['day', date],
    queryFn: ({ signal }) => getData<DayData>(`/calendar/days/${date}`, signal),
  })
}
