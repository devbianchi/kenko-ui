import { Outlet, useLocation } from 'react-router'
import { AppHeader } from './AppHeader'

export function AppLayout() {
  const isShowcase = useLocation().pathname.startsWith('/showcase')

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
