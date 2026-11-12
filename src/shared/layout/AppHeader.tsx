import { CalendarDaysIcon, ChartBarIcon, HomeIcon, ArrowRightStartOnRectangleIcon } from '@heroicons/react/24/outline'
import { Link, NavLink } from 'react-router'
import type { ReactNode } from 'react'

const links = [
  { to: '/home', label: 'Início', icon: HomeIcon },
  { to: '/analytics', label: 'Analytics', icon: ChartBarIcon },
  { to: '/calendar', label: 'Calendário', icon: CalendarDaysIcon },
]
const iconClasses = 'grid size-10 place-items-center rounded-full transition-colors duration-150 motion-reduce:transition-none'

export function AppHeader({ showcase = false, actions }: { showcase?: boolean; actions?: ReactNode }) {
  return (
    <header className="mx-auto flex max-w-dashboard-header flex-wrap items-center gap-4 min-[1000px]:flex-nowrap">
      {!showcase && (
        <nav aria-label="Navegação principal" className="flex w-56 shrink-0 items-center justify-between rounded-full bg-foreground p-2">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} end={to === '/home'} aria-label={label} title={label}
              className={({ isActive }) => `${iconClasses} ${isActive ? 'bg-background text-foreground' : 'text-background hover:bg-nav-hover'}`}>
              <Icon className="size-6" strokeWidth={2} />
            </NavLink>
          ))}
          <Link to="/showcase" aria-label="Showcase" title="Showcase" className={`${iconClasses} text-background hover:bg-nav-hover`}>
            <ArrowRightStartOnRectangleIcon className="size-6" strokeWidth={2} />
          </Link>
        </nav>
      )}
      <div className="flex min-h-14 min-w-0 flex-1 basis-full flex-wrap items-center justify-between gap-2 rounded-lg bg-brand px-4 py-2 text-foreground sm:py-0 min-[1000px]:basis-auto min-[1000px]:flex-nowrap">
        <Link to="/home" className="inline-flex shrink-0 items-center gap-2 no-underline" aria-label="Kenko, página inicial">
          <span className="translate-y-[.12em] font-brand text-brand font-normal underline decoration-secondary decoration-dotted decoration-2 underline-offset-4 tracking-wide">KENKO</span>
          <span className="font-brand-japanese text-section font-normal tracking-widest" lang="ja">ケンコ</span>
        </Link>
        {actions}
      </div>
    </header>
  )
}
