import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'
import { useNavigate, useParams } from 'react-router'
import { DashboardCard, CountCard } from '../../../shared/components/DashboardCard'
import { MonthTransition } from '../../../shared/components/MonthTransition'
import { currentBusinessMonth, MIN_SELECTABLE_MONTH } from '../../../shared/utils/month'
import { diaMock } from '../../../../mocks/day/dia'
import { DayPeriodChart, HourlyAppointmentsChart } from '../components/DayCharts'

export type DayData = {
  summary: { total: number; complete: number; pending: number; cancelled: number }
  appointmentsByHour: { hours: readonly number[]; counts: readonly number[] }
  rooms: readonly { id: string; name: string; appointmentCount: number; cancelledCount: number; totalSlots: number; occupiedSlots: number; peakHour: number | null }[]
}

function parseDate(value: string | undefined) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null
  const date = new Date(`${value}T12:00:00Z`)
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) return null
  return date
}

function addDays(date: Date, amount: number) {
  const next = new Date(date)
  next.setUTCDate(next.getUTCDate() + amount)
  return next.toISOString().slice(0, 10)
}

function capitalize(value: string) {
  return value.charAt(0).toLocaleUpperCase('pt-BR') + value.slice(1)
}

function formatDateHeading(date: Date) {
  const day = new Intl.DateTimeFormat('pt-BR', { day: 'numeric', timeZone: 'UTC' }).format(date)
  const month = capitalize(new Intl.DateTimeFormat('pt-BR', { month: 'long', timeZone: 'UTC' }).format(date))
  const year = new Intl.DateTimeFormat('pt-BR', { year: 'numeric', timeZone: 'UTC' }).format(date)
  const weekday = capitalize(new Intl.DateTimeFormat('pt-BR', { weekday: 'long', timeZone: 'UTC' }).format(date))
  return { title: `${day} de ${month}`, subtitle: `${year}, ${weekday}` }
}

function formatOccupancy(occupied: number, capacity: number) {
  if (capacity <= 0) return '—'
  return `${Math.round((occupied / capacity) * 100)}%`
}

function DayContent({ date, data }: { date: string; data: DayData }) {
  const navigate = useNavigate()
  const { summary, appointmentsByHour, rooms } = data
  const selectedDate = parseDate(date)
  const dateValue = selectedDate?.toISOString().slice(0, 10) ?? ''
  const selectedMonth = dateValue.slice(0, 7)
  const isValidMonth = selectedMonth >= MIN_SELECTABLE_MONTH && selectedMonth <= currentBusinessMonth()
  const canMovePrevious = Boolean(selectedDate && isValidMonth && addDays(selectedDate, -1).slice(0, 7) >= MIN_SELECTABLE_MONTH)
  const canAdvance = Boolean(selectedDate && isValidMonth && addDays(selectedDate, 1).slice(0, 7) <= currentBusinessMonth())
  const dateHeading = selectedDate && isValidMonth ? formatDateHeading(selectedDate) : null

  function moveToDay(offset: number) {
    if (!selectedDate || !isValidMonth) return
    const nextDate = addDays(selectedDate, offset)
    const targetMonth = nextDate.slice(0, 7)
    if (targetMonth < MIN_SELECTABLE_MONTH || targetMonth > currentBusinessMonth()) return
    navigate(`/calendar/${nextDate}`)
  }

  return (
    <div className="space-y-5">
      <header>
        <div role="group" aria-label="Navegação entre dias" className="flex items-center gap-1.5 sm:gap-2">
          <button type="button" aria-label="Dia anterior" disabled={!canMovePrevious} onClick={() => moveToDay(-1)}
            className={`grid size-8 shrink-0 place-items-center rounded-full bg-foreground text-background transition-[scale,opacity] duration-200 ease-out hover:scale-102 hover:opacity-70 active:scale-95 disabled:cursor-not-allowed motion-reduce:transition-none ${canMovePrevious ? '' : 'invisible'}`}>
            <ChevronLeftIcon className="size-6" aria-hidden="true" />
          </button>
          <button type="button" aria-label="Próximo dia" disabled={!canAdvance} onClick={() => moveToDay(1)}
            className={`grid size-8 shrink-0 place-items-center rounded-full bg-foreground text-background transition-[scale,opacity] duration-200 ease-out hover:scale-102 hover:opacity-70 active:scale-95 disabled:cursor-not-allowed motion-reduce:transition-none ${canAdvance ? '' : 'invisible'}`}>
            <ChevronRightIcon className="size-6" aria-hidden="true" />
          </button>
          <h1 className="min-w-0 font-heading text-metric leading-tight font-bold tracking-tight text-foreground sm:text-page">{dateHeading?.title ?? 'Data não disponível'}</h1>
        </div>
        <div className="mt-1 flex items-center justify-between gap-4">
          <p className="text-body font-semibold text-foreground sm:text-section">{dateHeading?.subtitle ?? ''}</p>
          <p className="text-body text-text-muted sm:text-section">Consultas</p>
        </div>
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

        <DashboardCard label="Informações por sala" motion={false} className="p-4">
          <h2 className="mb-2 font-heading text-section font-semibold">Informações por sala</h2>
          <div className="overflow-x-auto p-2">
            <table className="w-full min-w-[34rem] border-separate border-spacing-y-1 text-center text-body">
              <thead>
                <tr className="bg-brand text-foreground [clip-path:inset(0_round_var(--radius-lg))]">
                  <th scope="col" className="rounded-l-lg border-y border-l border-border px-2 py-2 font-semibold">Sala</th>
                  <th scope="col" className="border-y border-border px-2 py-2 font-semibold">Consultas (Canceladas)</th>
                  <th scope="col" className="border-y border-border px-2 py-2 font-semibold">Ocupação</th>
                  <th scope="col" className="rounded-r-lg border-y border-r border-border px-2 py-2 font-semibold">Horário de Pico</th>
                </tr>
              </thead>
              <tbody>
                {rooms.map(room => (
                  <tr key={room.id} className="rounded-lg bg-background motion-safe:transition-transform motion-safe:duration-200 motion-safe:ease-out motion-safe:hover:scale-102 motion-safe:active:scale-100 motion-reduce:transition-none">
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

export function DayPage({ data = diaMock.data }: { data?: DayData }) {
  const { date = '' } = useParams()
  return <MonthTransition value={date}>{displayedDate => <DayContent date={displayedDate} data={data} />}</MonthTransition>
}
