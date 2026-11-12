import { ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline'
import { Link } from 'react-router'
import { MonthTransition } from '../../../shared/components/MonthTransition'
import { formatCalendarMonthTitle, getVisibleCalendarDates } from '../data/calendar'

const weekdays = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']

export function MonthCalendar({
  month,
  today,
  countsByDate,
}: {
  month: string
  today: string
  countsByDate: Readonly<Record<string, number>>
}) {
  return (
    <MonthTransition value={month}>
      {displayedMonth => {
        const dates = getVisibleCalendarDates(displayedMonth)
        const rows = dates.length === 42 ? 'grid-rows-6' : 'grid-rows-5'
        return <section aria-label={`Calendário de ${displayedMonth}`} className="flex h-[calc(100dvh-22rem)] min-h-64 flex-col rounded-card border border-border p-2 shadow-card sm:h-[calc(100dvh-18rem)] sm:p-4">
          <h2 className="mb-1 text-section leading-tight font-bold capitalize sm:text-[2.125em]">{formatCalendarMonthTitle(displayedMonth)}</h2>
          <div className="grid grid-cols-7 gap-1 rounded-lg bg-brand px-1 py-1 text-center text-[clamp(0.65rem,1.4vh,0.875em)] font-semibold sm:gap-2 sm:px-3 sm:py-2">
            {weekdays.map(day => <span key={day}>{day}</span>)}
          </div>
          <div className={`mt-1 grid min-h-0 flex-1 grid-cols-7 ${rows} gap-1 sm:gap-2`}>
            {dates.map(({ date, day, inMonth }) => {
              const isToday = date === today
              const count = countsByDate[date] ?? 0
              return (
                <Link
                  key={date}
                  to={`/calendar/${date}`}
                  aria-label={`${date}, ${count} consultas${isToday ? ', hoje' : ''}`}
                  className={`group relative flex min-h-0 flex-col items-center justify-center gap-0.5 rounded-lg p-0.5 text-center shadow-card motion-safe:transition-[scale,box-shadow] motion-safe:duration-200 motion-safe:ease-out motion-safe:hover:scale-102 motion-safe:hover:shadow-card-hover motion-safe:active:scale-100 motion-reduce:transition-none sm:gap-1 sm:rounded-xl sm:p-1 ${isToday ? 'bg-brand' : 'bg-background'} ${inMonth ? 'text-foreground' : 'text-gray'}`}
                >
                  <ArrowTopRightOnSquareIcon aria-hidden="true" className="absolute right-0.5 top-0.5 size-3 sm:right-1 sm:top-1 sm:size-3.5" />
                  <span className="border-b border-dotted border-secondary text-[clamp(0.85em,3.8vh,2.5em)] leading-none font-bold max-[639px]:text-[clamp(0.85em,2.4vh,1.25em)]">{day}</span>
                  <span className="text-[clamp(0.65rem,1.4vh,0.875em)] leading-none text-text-muted">{count} consultas</span>
                </Link>
              )
            })}
          </div>
        </section>
      }}
    </MonthTransition>
  )
}
