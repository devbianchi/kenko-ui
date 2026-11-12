import { useSearchParams } from 'react-router'
import { CountCard, MetricCard } from '../../../shared/components/DashboardCard'
import { MonthTransition } from '../../../shared/components/MonthTransition'
import { UpcomingAppointments } from '../components/UpcomingAppointments'
import { durationDifference, formatDay, formatDuration, homeData, readHomeMonth } from '../data/home'
import type { HomeData } from '../data/home'

export function HomePage({ data = homeData }: { data?: HomeData }) {
  const [searchParams] = useSearchParams()
  const month = readHomeMonth(searchParams.get('month'))
  const { bestDay, peakHour, bestRoom } = data

  return (
    <div>
      <div className="mt-8 grid grid-cols-1 gap-5 min-[1000px]:grid-cols-[var(--spacing-sidebar)_minmax(0,1fr)]">
        <aside className="grid grid-cols-2 gap-2 sm:grid-cols-4 min-[1000px]:flex min-[1000px]:flex-col" aria-label="Resumo mensal de consultas">
          <MonthTransition value={month}>
            {displayedMonth => {
              const monthName = new Intl.DateTimeFormat('pt-BR', { month: 'short', timeZone: 'UTC' })
                .format(new Date(`${displayedMonth}-15T12:00:00Z`))
              return <div className="flex min-h-status-card flex-col items-center justify-center rounded-card bg-primary text-background" aria-label={`Mês selecionado: ${displayedMonth}`}>
                <span className="text-month leading-[.85] font-semibold capitalize">{monthName}</span><span className="text-month leading-[.85] font-semibold">{displayedMonth.slice(0, 4)}</span>
              </div>
            }}
          </MonthTransition>
          <CountCard label="Completas" value={data.appointments.complete} tone="dark" />
          <CountCard label="Pendentes" value={data.appointments.pending} />
          <CountCard label="Canceladas" value={data.appointments.cancelled} />
        </aside>
        <div className="min-w-0">
          <div className="pt-2 pb-4">
            <h1 className="text-metric leading-tight font-bold tracking-tight min-[1000px]:text-page">Olá, {data.clinic.name}</h1>
            <p className="mt-1 leading-snug">Aqui estão as informações gerais sobre as consultas do seu mês.</p>
          </div>
          <section className="grid grid-cols-2 gap-1 min-[1000px]:grid-cols-[repeat(3,minmax(0,1fr))_minmax(0,2fr)]" aria-label="Indicadores mensais">
            <MetricCard title="Melhor Dia" value={bestDay ? formatDay(bestDay.date) : '—'}
              detail={bestDay ? `(${bestDay.appointmentCount} consultas)` : 'Sem dados no período'}
              to={bestDay ? `/calendar/${bestDay.date}` : undefined} />
            <MetricCard title="Hora de pico" value={peakHour ? `${String(peakHour.hour).padStart(2, '0')}:00` : '—'}
              detail={peakHour ? `(${new Intl.NumberFormat('pt-BR', { signDisplay: 'exceptZero', maximumFractionDigits: 1 }).format(peakHour.aboveAverage)} consultas acima da média)` : 'Sem dados no período'} />
            <MetricCard title="Melhor sala" value={bestRoom?.name ?? '—'}
              detail={bestRoom ? `(${bestRoom.appointmentCount} consultas)` : 'Sem dados no período'} />
            <MetricCard title="Mediana de atendimento" to="/analytics"
              value={formatDuration(data.attendanceDuration.seconds)}
              detail={durationDifference(data.attendanceDuration.differenceSeconds)} />
          </section>
          <UpcomingAppointments appointments={data.upcomingAppointments} now={new Date()} />
        </div>
      </div>
    </div>
  )
}
