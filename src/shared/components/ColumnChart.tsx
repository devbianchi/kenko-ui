import { useChartTooltip } from '../hooks/useChartTooltip'

export type Column = { label: string; count: number; description: string; fill: string }

export function ColumnChart({ points, label, histogram = false }: {
  points: readonly Column[]
  label: string
  histogram?: boolean
}) {
  const { triggerProps, renderTooltip } = useChartTooltip()
  const maximum = Math.max(0, ...points.map(point => point.count))
  const chartHeight = 112
  const slotWidth = points.length === 0 ? 0 : 600 / points.length
  const barWidth = histogram ? slotWidth * 0.9 : Math.min(28, slotWidth * 0.62)

  return (
    <div className="relative">
      <svg role="img" aria-label={label} viewBox="0 0 600 120" className={histogram ? "h-36 w-full border-b border-border" : "h-32 w-full overflow-visible"} preserveAspectRatio="none">
        {points.map(({ label, count, description, fill }, index) => {
          const height = maximum === 0 ? 0 : count / maximum * chartHeight
          const x = index * slotWidth + (slotWidth - barWidth) / 2
          const barHeight = count === 0 || !histogram ? Math.max(height, 8) : height
          return <g key={`${label}-${index}`}>
            <rect x={x} y={chartHeight - barHeight + 4} width={barWidth} height={barHeight} rx="6" fill={count === 0 ? 'transparent' : fill} aria-label={description}
              {...triggerProps(index)} />
            {renderTooltip(index, description)}
          </g>
        })}
      </svg>
      <div aria-hidden="true" className={`grid text-center ${histogram ? "text-xs text-text-muted" : "text-label"}`} style={{ gridTemplateColumns: `repeat(${points.length}, minmax(0, 1fr))` }}>
        {points.map(({ label }, index) => <span key={`${label}-${index}`}>{label}</span>)}
      </div>
    </div>
  )
}
