import { useSearchParams } from 'react-router'
import { PageHeading } from '../../../shared/components/PageHeading'
import { calendarData, readCalendarMonth } from '../data/calendar'
import { MonthCalendar } from '../components/MonthCalendar'

export function CalendarPage() {
  const [searchParams] = useSearchParams()
  const month = readCalendarMonth(searchParams.get('month'))

  return (
    <div>
      <PageHeading title="Calendário" description="Analise os dados referentes a um dia específico clicando nele." />
      <MonthCalendar month={month} today={calendarData.today} countsByDate={calendarData.countsByDate} />
    </div>
  )
}
