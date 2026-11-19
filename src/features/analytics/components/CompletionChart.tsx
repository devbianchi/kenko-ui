import { percent, type AnalyticsData } from '../data/analytics'

// O gráfico só desenha rótulo, conclusão e média móvel; as contagens do ponto ficam fora.
type Point = Pick<AnalyticsData['completionSeries']['points'][number], 'label' | 'percentage' | 'movingAverage'>
const plotWidth = 600
const plotHeight = 120

function xPosition(index: number, length: number) {
  return length === 1 ? plotWidth / 2 : index * plotWidth / (length - 1)
}

function linePath(points: readonly Point[], field: 'percentage' | 'movingAverage') {
  let command = 'M'
  const parts: string[] = []
  points.forEach((point, index) => {
    const value = point[field]
    if (value === null) {
      command = 'M'
      return
    }
    parts.push(`${command}${xPosition(index, points.length)},${plotHeight * (1 - value / 100)}`)
    command = 'L'
  })
  return parts.join(' ')
}

export function CompletionChart({ points }: { points: readonly Point[] }) {
  if (!points.length) return <p className="text-label text-text-muted">Sem dados no período.</p>
  return (
    <div className="mt-4 grid grid-cols-[auto_minmax(0,1fr)] gap-x-3 gap-y-2 text-xs text-text-muted">
      <div aria-hidden="true" className="flex h-32 justify-between flex-col sm:h-44"><span>100%</span><span>50%</span><span>0%</span></div>
      <div className="mx-4">
        <svg role="img" aria-label="Taxa de conclusão e média móvel" viewBox={`0 0 ${plotWidth} ${plotHeight}`} preserveAspectRatio="none" className="h-32 w-full overflow-visible sm:h-44">
          {(['percentage', 'movingAverage'] as const).map(field => {
            const color = field === 'percentage' ? 'var(--color-tertiary)' : 'var(--color-secondary)'
            return <g key={field}>
              <path d={linePath(points, field)} fill="none" stroke={color} strokeWidth={field === 'percentage' ? 2 : 4}
                strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
              {points.map((point, index) => {
                const value = point[field]
                if (value === null) return null
                return <circle key={point.label} cx={xPosition(index, points.length)} cy={plotHeight * (1 - value / 100)} r="2.5" fill={color}>
                  <title>{point.label} · {field === 'percentage' ? 'Conclusão' : 'Média móvel'}: {percent(value)}</title>
                </circle>
              })}
            </g>
          })}
        </svg>
        <div className="relative mt-2 h-4" aria-hidden="true">
          {points.map((point, i) => <span key={point.label} className="absolute -translate-x-1/2 whitespace-nowrap"
            style={{ left: `${xPosition(i, points.length) / plotWidth * 100}%` }}>{point.label}</span>)}
        </div>
      </div>
      <ul className="sr-only">{points.map(point => <li key={point.label}>
        {point.label} · Conclusão: {percent(point.percentage)} · Média móvel: {percent(point.movingAverage)}
      </li>)}</ul>
    </div>
  )
}
