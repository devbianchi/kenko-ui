import { useParams } from 'react-router'
import { DashboardCard, CountCard } from '../../../shared/components/DashboardCard'
import { diaMock } from '../../../../mocks/day/dia'
import { DayPeriodChart, HourlyAppointmentsChart } from '../components/DayCharts'

export type DayData = {
  summary: { total: number; complete: number; pending: number; cancelled: number }
  appointmentsByHour: { hours: readonly number[]; counts: readonly number[] }
  rooms: readonly { id: string; name: string; appointmentCount: number; cancelledCount: number; totalSlots: number; occupiedSlots: number; peakHour: number | null }[]
}

function formatSelectedDate(value: string | undefined) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return ''
  const date = new Date(`${value}T12:00:00Z`)
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) return ''
  const dayAndMonth = new Intl.DateTimeFormat('pt-BR', { day: 'numeric', month: 'long', timeZone: 'UTC' }).format(date)
  const year = new Intl.DateTimeFormat('pt-BR', { year: 'numeric', timeZone: 'UTC' }).format(date)
  const weekday = new Intl.DateTimeFormat('pt-BR', { weekday: 'long', timeZone: 'UTC' }).format(date)
  return `${dayAndMonth}/${year}, ${weekday}`
}

function formatOccupancy(occupied: number, capacity: number) {
  if (capacity <= 0) return '—'
  return `${Math.round((occupied / capacity) * 100)}%`
}

export function DayPage({ data = diaMock.data }: { data?: DayData }) {
  const { date } = useParams()
  const { summary, appointmentsByHour, rooms } = data
  const selectedDate = formatSelectedDate(date)

  return (
    <div className="space-y-5">
      <header>
        <h1 className="font-heading text-metric leading-tight font-bold tracking-tight text-foreground sm:text-page">{selectedDate || 'Data não disponível'}</h1>
        <p className="mt-1 text-body text-text-muted">Consultas</p>
      </header>

      <section aria-label="Resumo de consultas do dia" className="grid grid-cols-2 gap-2 min-[850px]:grid-cols-5">
        <CountCard label="Total" value={summary.total} tone="dark" />
        <CountCard label="Canceladas" value={summary.cancelled} tone="cancelled" />
        <CountCard label="Completas" value={summary.complete} />
        <CountCard label="Pendentes" value={summary.pending} />
        <CountCard label="Taxa de Completude" value={summary.total === 0 ? null : Math.round(summary.complete / summary.total * 100)} suffix="%" tone="primary" />
      </section>

      <div className="grid grid-cols-1 gap-4 min-[900px]:grid-cols-[minmax(0,0.58fr)_minmax(0,1.12fr)]">
        <div className="grid gap-4">
          <DashboardCard label="Consultas por horário" className="p-4">
            <HourlyAppointmentsChart hours={appointmentsByHour.hours} counts={appointmentsByHour.counts} />
          </DashboardCard>
          <DashboardCard label="Resumo por período" className="p-4">
            <DayPeriodChart hours={appointmentsByHour.hours} counts={appointmentsByHour.counts} />
          </DashboardCard>
        </div>

        <DashboardCard label="Informações por sala" className="p-4">
          <h2 className="mb-2 font-heading text-section font-semibold">Informações por sala</h2>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[34rem] border-separate border-spacing-y-1 text-center text-body">
              <thead>
                <tr className="bg-brand text-foreground">
                  <th scope="col" className="rounded-l-lg border-y border-l border-border px-2 py-2 font-semibold">Sala</th>
                  <th scope="col" className="border-y border-border px-2 py-2 font-semibold">Consultas (Canceladas)</th>
                  <th scope="col" className="border-y border-border px-2 py-2 font-semibold">Ocupação</th>
                  <th scope="col" className="rounded-r-lg border-y border-r border-border px-2 py-2 font-semibold">Horário de Pico</th>
                </tr>
              </thead>
              <tbody>
                {rooms.map(room => (
                  <tr key={room.id}>
                    <th scope="row" className="rounded-l-lg border-y border-l border-border px-2 py-2 font-medium">{room.name}</th>
                    <td className="border-y border-border px-2 py-2">{room.appointmentCount}{room.cancelledCount ? ` (${room.cancelledCount})` : ''}</td>
                    <td className="border-y border-border px-2 py-2">{formatOccupancy(room.occupiedSlots, room.totalSlots)}</td>
                    <td className="rounded-r-lg border-y border-r border-border px-2 py-2">{room.peakHour === null ? '—' : `${String(room.peakHour).padStart(2, '0')}:00`}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </DashboardCard>
      </div>
    </div>
  )
}
