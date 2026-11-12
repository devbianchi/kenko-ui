import { Outlet, useLocation, useMatch } from 'react-router'
import { AppHeader } from './AppHeader'

export function AppLayout() {
  const pathname = useLocation().pathname
  const isShowcase = pathname.startsWith('/showcase')
  const isHome = useMatch('/home')

  if (isHome) {
    return <main className="mx-auto w-[90%] max-w-[1568px] pt-[clamp(20px,1.61vw,28px)] pb-8"><Outlet /></main>
  }

  return (
    <div className="min-h-screen px-4 py-5 sm:px-8 sm:py-7">
      <div className="mx-auto max-w-[1280px]">
        <AppHeader showcase={isShowcase} />
        <main className="pt-8 sm:pt-10">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
