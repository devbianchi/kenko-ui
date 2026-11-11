import { CalendarDays, ChartNoAxesColumn, House, MessageCircle } from 'lucide-react'
import { Link, NavLink } from 'react-router'

const links = [
  { to: '/home', label: 'Início', icon: House },
  { to: '/analytics', label: 'Analytics', icon: ChartNoAxesColumn },
  { to: '/calendar', label: 'Calendário', icon: CalendarDays },
]

export function AppHeader({ showcase = false }: { showcase?: boolean }) {
  return (
    <header className="flex items-center gap-4">
      {!showcase && (
        <nav aria-label="Navegação principal" className="flex shrink-0 items-center gap-1 rounded-full bg-ink p-2">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/home'}
              aria-label={label}
              title={label}
              className={({ isActive }) => `nav-icon ${isActive ? 'nav-icon-active' : ''}`}
            >
              <Icon size={21} strokeWidth={2} />
            </NavLink>
          ))}
          <Link to="/showcase" aria-label="Showcase" title="Showcase" className="nav-icon">
            <MessageCircle size={20} strokeWidth={2} />
          </Link>
        </nav>
      )}
      <Link to="/home" className="brand-bar" aria-label="Kenko, página inicial">
        <span className="font-serif text-[25px] tracking-[0.06em]">KENKO</span>
        <span className="text-[19px] tracking-[0.12em]" lang="ja">ケンコ</span>
      </Link>
    </header>
  )
}
