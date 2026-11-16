import { useSearchParams } from 'react-router'
import { PeriodPicker } from '../../../shared/components/MonthPicker'
import type { PeriodSelection } from '../../../shared/utils/period'
import { readAnalyticsPeriod } from '../data/analytics'

export function AnalyticsFilter() {
  const [params, setParams] = useSearchParams()
  const selection = readAnalyticsPeriod(params)
  if (!selection) return null

  function apply(selection: PeriodSelection) {
    const next = new URLSearchParams(params)
    next.set('period', selection.period)
    next.set('reference', selection.reference)
    setParams(next)
  }

  return <PeriodPicker {...selection} allowPeriodChange onApply={apply} />
}
