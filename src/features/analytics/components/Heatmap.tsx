import type { AnalyticsData } from '../data/analytics'
import { useChartTooltip } from '../../../shared/hooks/useChartTooltip'

const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

export function Heatmap({ rows, bucketStartHours }: AnalyticsData['conversationHeatmap']) {
  const { triggerProps, renderTooltip } = useChartTooltip()
  if (!rows.length || !bucketStartHours.length) return <p className="text-label text-text-muted">Sem dados no período.</p>
  const maximum = Math.max(1, ...rows.flatMap(row => row.counts))
  return (
    <>
      <table aria-label="Inícios de conversas por dia da semana e horário" className="w-full table-fixed border-separate border-spacing-0.5 text-center text-[0.72em]">
        <thead><tr><th scope="col"><span className="sr-only">Dia</span></th>
          {bucketStartHours.map(hour => <th key={hour} scope="col" className="font-normal text-text-muted">{hour}h</th>)}
        </tr></thead>
        <tbody>{rows.map(({ weekday, counts }) => (
          <tr key={weekday}>
            <th scope="row" className="text-left font-semibold">{days[weekday]}</th>
            {bucketStartHours.map((hour, i) => {
              const count = counts[i] ?? 0
              const value = `${days[weekday]}, ${hour}h–${hour + 2}h: ${count}`
              const cellKey = `${weekday}-${hour}`
              return <td key={hour} aria-label={value} {...triggerProps(cellKey)} className="h-8 rounded-sm"
                style={{ backgroundColor: `color-mix(in srgb, var(--color-tertiary-2) ${count / maximum * 100}%, var(--color-tertiary))` }}>
                <span className="sr-only">{count}</span>
                {renderTooltip(cellKey, value)}
              </td>
            })}
          </tr>
        ))}</tbody>
      </table>
      <p className="mt-2 text-xs text-text-muted">Quanto mais escuro, mais conversas.</p>
    </>
  )
}
