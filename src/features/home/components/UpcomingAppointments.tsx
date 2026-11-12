import { ForwardIcon } from '@heroicons/react/24/outline'
import { DashboardCard } from '../../../shared/components/DashboardCard'
import { businessTimeZone, selectUpcoming } from '../data/home'
import type { UpcomingAppointment } from '../data/home'

export function UpcomingAppointments({ appointments, now }: {
  appointments: readonly UpcomingAppointment[]
  now: Date
}) {
  const upcoming = selectUpcoming(appointments, now)

  return (
    <section aria-labelledby="upcoming-title">
      <h2 id="upcoming-title" className="mt-4 mb-4 flex items-center gap-2 text-section leading-snug font-bold"><ForwardIcon className="size-6 shrink-0" aria-hidden="true" />Próximas Consultas</h2>
      {upcoming.length === 0 ? (
        <DashboardCard label="Próximas consultas vazias" className="flex min-h-metric-card items-center justify-center p-5 text-center">
          <div className="space-y-2">
            <p>Nenhuma consulta futura agendada.</p>
            <p className="text-text-muted">As próximas consultas aparecerão aqui.</p>
          </div>
        </DashboardCard>
      ) : (
        <ul className="grid grid-cols-1 gap-1 min-[400px]:grid-cols-2 min-[640px]:grid-cols-3 min-[1000px]:grid-cols-5">
          {upcoming.map(appointment => {
            const date = new Date(appointment.startsAt)
            const time = new Intl.DateTimeFormat('pt-BR', { timeZone: businessTimeZone, hour: '2-digit', minute: '2-digit' }).format(date)
            return (
              <li key={appointment.id} className="min-w-0">
                <DashboardCard label={`Consulta de ${appointment.patient.name}`} className="h-full min-h-metric-card p-3 leading-snug wrap-anywhere">
                  <time dateTime={appointment.startsAt} className="flex flex-col">
                    <span className="text-metric leading-tight font-semibold">{time}</span>
                  </time>
                  <p className="text-section font-semibold text-secondary">{appointment.room.name}</p>
                  <p className="text-text-muted">{appointment.patient.name}</p>
                  <p className="text-text-muted">{appointment.specialty.name}</p>
                </DashboardCard>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
