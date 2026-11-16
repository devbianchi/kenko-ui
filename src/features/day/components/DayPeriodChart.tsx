import { alignedPoints, type HourlySeries } from './hourlySeries'

export function DayPeriodChart(series: HourlySeries) {
  const totals = alignedPoints(series).reduce((periods, { hour, count }) => {
    const key = hour < 12 ? 'morning' : 'afternoon'
    periods[key] += count
    return periods
  }, { morning: 0, afternoon: 0 })
  const maximum = Math.max(totals.morning, totals.afternoon)

  return (
    <figure aria-label="Resumo por período">
      <figcaption className="mb-3 font-heading text-body font-semibold">Resumo por período</figcaption>
      <div className="grid h-32 grid-cols-2 items-end gap-3" role="img" aria-label={`Manhã: ${totals.morning}; Tarde: ${totals.afternoon}`}>
        {([
          { label: 'Manhã', value: totals.morning, color: 'bg-tertiary' },
          { label: 'Tarde', value: totals.afternoon, color: 'bg-secondary' },
        ]).map(period => (
          <div key={period.label} className="flex h-full flex-col items-center justify-end">
            <span className="mb-1 text-label">{period.value}</span>
            <div className={`w-full rounded-t-md ${period.color}`} style={{ height: maximum === 0 ? '0%' : `${period.value / maximum * 75}%` }} aria-hidden="true" />
            <span className="mt-1">{period.label}</span>
          </div>
        ))}
      </div>
    </figure>
  )
}
