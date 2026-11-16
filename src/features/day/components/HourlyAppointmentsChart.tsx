import { ColumnChart } from '../../../shared/components/ColumnChart'
import { alignedPoints, type HourlySeries } from './hourlySeries'

export function HourlyAppointmentsChart(series: HourlySeries) {
  const points = alignedPoints(series)
    .filter(({ hour }) => hour >= 7 && hour < 18)
    .map(({ hour, count }) => ({
      label: String(hour),
      count,
      description: `${String(hour).padStart(2, '0')}:00 — ${count} consultas`,
      fill: 'var(--color-primary)',
    }))

  return (
    <figure aria-label="Consultas por horário">
      <figcaption className="mb-3 font-heading text-body font-semibold">Consultas por Horário</figcaption>
      {points.length === 0
        ? <p className="py-8 text-center text-text-muted">Sem horários cadastrados.</p>
        : <ColumnChart points={points} label={`Consultas por horário, ${points.length} horários`} />}
    </figure>
  )
}
