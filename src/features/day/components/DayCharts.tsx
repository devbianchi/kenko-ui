type HourlySeries = { hours: readonly number[]; counts: readonly number[] }

function alignedPoints({ hours, counts }: HourlySeries) {
  return hours.slice(0, Math.min(hours.length, counts.length)).map((hour, index) => ({
    hour,
    count: Math.max(0, counts[index] ?? 0),
  }))
}

export function HourlyAppointmentsChart(series: HourlySeries) {
  const points = alignedPoints(series).filter(({ hour }) => hour >= 7 && hour < 18)
  const maximum = Math.max(0, ...points.map(point => point.count))
  const chartHeight = 112
  const slotWidth = points.length === 0 ? 0 : 600 / points.length
  const barWidth = Math.min(28, slotWidth * 0.62)

  return (
    <figure aria-label="Consultas por horário">
      <figcaption className="mb-3 font-heading text-body font-semibold">Consultas por Horário</figcaption>
      {points.length === 0 ? <p className="py-8 text-center text-text-muted">Sem horários cadastrados.</p> : (
        <>
        <svg role="img" aria-label={`Consultas por horário, ${points.length} horários`} viewBox="0 0 600 120" className="h-32 w-full overflow-visible" preserveAspectRatio="none">
          {points.map(({ hour, count }, index) => {
            const height = maximum === 0 ? 0 : count / maximum * chartHeight
            const x = index * slotWidth + (slotWidth - barWidth) / 2
            const tooltip = `${String(hour).padStart(2, '0')}:00 — ${count} consultas`
            return <g key={`${hour}-${index}`}>
              <title>{tooltip}</title>
              <rect x={x} y={chartHeight - height + 4} width={barWidth} height={height} rx="6" fill="var(--color-primary)" tabIndex={0} aria-label={tooltip}>
                <title>{tooltip}</title>
              </rect>
            </g>
          })}
        </svg>
        <div aria-hidden="true" className="grid text-center text-label" style={{ gridTemplateColumns: `repeat(${points.length}, minmax(0, 1fr))` }}>
          {points.map(({ hour }, index) => <span key={`${hour}-${index}`}>{hour}</span>)}
        </div>
        </>
      )}
    </figure>
  )
}

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
