import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { getData } from '../../shared/api/client'
import type { HomeData } from './data/home'

/** Indicadores do mês e próximas consultas. Ao trocar de mês, os dados anteriores ficam até chegarem os novos. */
export function useHome(month: string) {
  return useQuery({
    queryKey: ['dashboard', month],
    queryFn: ({ signal }) => getData<HomeData>(`/dashboard?month=${month}`, signal),
    placeholderData: keepPreviousData,
  })
}
