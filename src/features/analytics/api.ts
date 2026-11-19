import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { getData } from '../../shared/api/client'
import type { PeriodSelection } from '../../shared/utils/period'
import type { AnalyticsData } from './data/analytics'

/** Indicadores e gráficos do período. Ao trocar de período, os dados anteriores ficam até chegarem os novos. */
export function useAnalytics({ period, reference }: PeriodSelection) {
  return useQuery({
    queryKey: ['analytics', period, reference],
    queryFn: ({ signal }) => getData<AnalyticsData>(`/analytics?period=${period}&reference=${reference}`, signal),
    placeholderData: keepPreviousData,
  })
}
