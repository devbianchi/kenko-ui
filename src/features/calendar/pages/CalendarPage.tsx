import { useSearchParams } from 'react-router'
import { PageHeading } from '../../../shared/components/PageHeading'
import { QueryState } from '../../../shared/components/QueryState'
import { useCalendar } from '../api'
import { readCalendarMonth } from '../data/calendar'
import { MonthCalendar } from '../components/MonthCalendar'

export function CalendarPage() {
  const [searchParams] = useSearchParams()
  const month = readCalendarMonth(searchParams.get('month'))
  const query = useCalendar(month)

  return (
    <div>
      <PageHeading title="Calendário" description="Analise os dados referentes a um dia específico clicando nele." />
      <QueryState query={query}>
        {data => <MonthCalendar month={month} today={data.today} countsByDate={data.countsByDate} />}
      </QueryState>
    </div>
  )
}
