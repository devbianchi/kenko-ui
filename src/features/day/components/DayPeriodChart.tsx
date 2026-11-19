/** Manhã (antes de 12h) e tarde, como a API entrega: o corte é feito no servidor, no fuso de negócio. */
export function DayPeriodChart({ morning, afternoon }: { morning: number; afternoon: number }) {
  const totals = { morning, afternoon }
  const maximum = Math.max(morning, afternoon)

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
