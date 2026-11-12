import { Outlet, useLocation, useMatch, useSearchParams } from 'react-router'
import { useEffect } from 'react'
import { MonthPicker } from '../components/MonthPicker'
import { readCalendarMonth } from '../../features/calendar/data/calendar'
import { readHomeMonth } from '../../features/home/data/home'
import { AppHeader } from './AppHeader'

export function AppLayout() {
  const isHome = useMatch('/home')
  const isCalendar = useMatch('/calendar')
  const isShowcase = useLocation().pathname.startsWith('/showcase')
  const [searchParams, setSearchParams] = useSearchParams()
  const rawMonth = searchParams.get('month')
  const month = isHome ? readHomeMonth(rawMonth) : readCalendarMonth(rawMonth)

  useEffect(() => {
    if ((!isHome && !isCalendar) || rawMonth === null || rawMonth === month) return
    setSearchParams(previous => {
      const next = new URLSearchParams(previous)
      next.set('month', month)
      return next
    }, { replace: true })
  }, [isHome, isCalendar, month, rawMonth, setSearchParams])

  function applyMonth(value: string) {
    setSearchParams(previous => {
      const next = new URLSearchParams(previous)
      next.set('month', value)
      return next
    })
  }

  const actions = isHome || isCalendar ? <MonthPicker value={month} onChange={applyMonth} /> : undefined

  return (
    <div className="[--spacing:0.25em] min-h-screen w-[90%] max-w-[1568px] mx-auto pt-[clamp(20px,1.61vw,28px)] pb-8 text-sm min-[1000px]:text-[clamp(12px,1.035vw,18px)]">
      <AppHeader showcase={isShowcase} actions={actions} />
      <main className={`mx-auto w-full max-w-dashboard-header ${isHome ? 'pt-0' : 'pt-8 sm:pt-10'}`}>
        <Outlet />
      </main>
    </div>
  )
}
