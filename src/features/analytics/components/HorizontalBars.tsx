import { useChartTooltip } from '../../../shared/hooks/useChartTooltip'

type BarRow = {
  id?: string
  label: string
  detail?: string
  description?: string
  segments: readonly { width: number; color: string }[]
}

export function HorizontalBars({ rows }: { rows: readonly BarRow[] }) {
  const { triggerProps, renderTooltip } = useChartTooltip()
  if (rows.length === 0) return <p className="text-label text-text-muted">Sem dados no período.</p>
  return (
    <ul className="grid grid-cols-[minmax(5em,22%)_1fr_auto] items-center gap-x-3 gap-y-2 text-[0.85em]">
      {rows.map(row => (
        <li key={row.id ?? row.label} className="col-span-full grid grid-cols-subgrid items-center">
          <span>{row.label}</span>
          <div className="flex h-6 min-w-0 items-stretch"
            {...(row.description ? {
              role: 'img', 'aria-label': `${row.label} — ${row.description}`, ...triggerProps(row.label),
            } : { 'aria-hidden': true })}>
            {row.segments.filter(segment => segment.width > 0).map(segment => (
              <span key={segment.color} className={`first:rounded-l-md last:rounded-r-md ${segment.color}`}
                style={{ width: `${segment.width}%` }} />
            ))}
          </div>
          {row.description && renderTooltip(row.label, row.description)}
          {row.detail && <span className="text-right font-semibold tabular-nums">{row.detail}</span>}
        </li>
      ))}
    </ul>
  )
}
