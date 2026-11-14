import { useId, useState } from 'react'
import { createPortal } from 'react-dom'

type HourlySeries = { hours: readonly number[]; counts: readonly number[] }

function alignedPoints({ hours, counts }: HourlySeries) {
  return hours.slice(0, Math.min(hours.length, counts.length)).map((hour, index) => ({
    hour,
    count: Math.max(0, counts[index] ?? 0),
  }))
}

export function HourlyAppointmentsChart(series: HourlySeries) {
  const tooltipId = useId()
  const [tooltipVisible, setTooltipVisible] = useState(false)
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const [position, setPosition] = useState({ left: 0, top: 0 })

  function showTooltip(index: number, clientX: number, clientY: number) {
    setPosition({ left: clientX, top: clientY })
    setActiveIndex(index)
    setTooltipVisible(true)
  }
  const points = alignedPoints(series).filter(({ hour }) => hour >= 7 && hour < 18)
  const activePoint = activeIndex === null ? undefined : points[activeIndex]
  const maximum = Math.max(0, ...points.map(point => point.count))
  const chartHeight = 112
  const slotWidth = points.length === 0 ? 0 : 600 / points.length
  const barWidth = Math.min(28, slotWidth * 0.62)

  return (
    <figure aria-label="Consultas por horário">
      <figcaption className="mb-3 font-heading text-body font-semibold">Consultas por Horário</figcaption>
      {points.length === 0 ? <p className="py-8 text-center text-text-muted">Sem horários cadastrados.</p> : (
        <div className="relative">
        {activePoint && createPortal(
          <div id={tooltipId} role="tooltip" aria-hidden={!tooltipVisible} className={`pointer-events-none fixed z-10 -mt-3 -translate-x-1/2 -translate-y-full rounded-lg bg-foreground px-3 py-2 max-w-full font-body text-sm font-semibold text-background shadow-card transition-opacity duration-150 ease-out motion-reduce:transition-none starting:opacity-0 ${tooltipVisible ? 'opacity-100' : 'opacity-0'}`} style={position}>
            {String(activePoint.hour).padStart(2, '0')}:00 — {activePoint.count} consultas
          </div>, document.body
        )}
        <svg role="img" aria-label={`Consultas por horário, ${points.length} horários`} viewBox="0 0 600 120" className="h-32 w-full overflow-visible" preserveAspectRatio="none">
          {points.map(({ hour, count }, index) => {
            const height = maximum === 0 ? 0 : count / maximum * chartHeight
            const x = index * slotWidth + (slotWidth - barWidth) / 2
            const tooltip = `${String(hour).padStart(2, '0')}:00 — ${count} consultas`
            return <g key={`${hour}-${index}`}>
              <rect x={x} y={chartHeight - Math.max(height, 8) + 4} width={barWidth} height={Math.max(height, 8)} rx="6" fill={count === 0 ? 'transparent' : 'var(--color-primary)'} tabIndex={0} aria-label={tooltip}
                aria-describedby={tooltipVisible && activeIndex === index ? tooltipId : undefined}
                onPointerEnter={event => showTooltip(index, event.clientX, event.clientY)}
                onPointerMove={event => showTooltip(index, event.clientX, event.clientY)}
                onPointerLeave={() => setTooltipVisible(false)}
                onFocus={event => {
                  const bounds = event.currentTarget.getBoundingClientRect()
                  showTooltip(index, bounds.left + bounds.width / 2, bounds.top)
                }} onBlur={() => setTooltipVisible(false)}
                onKeyDown={event => { if (event.key === 'Escape') setTooltipVisible(false) }}
              />
            </g>
          })}
        </svg>
        <div aria-hidden="true" className="grid text-center text-label" style={{ gridTemplateColumns: `repeat(${points.length}, minmax(0, 1fr))` }}>
          {points.map(({ hour }, index) => <span key={`${hour}-${index}`}>{hour}</span>)}
        </div>
        </div>
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
