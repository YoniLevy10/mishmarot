import { NavLink, Outlet } from 'react-router-dom'

function TabLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <NavLink
      to={to}
      end={to === '/'}
      className={({ isActive }) =>
        [
          'flex-1 rounded-xl px-3 py-2 text-center text-sm font-medium',
          isActive ? 'bg-slate-700 text-white' : 'text-slate-200/80 hover:bg-slate-800/60',
        ].join(' ')
      }
    >
      {children}
    </NavLink>
  )
}

export function AppLayout() {
  return (
    <div className="app-shell min-h-[100svh] px-4 py-5">
      <header className="mb-4">
        <div className="rounded-2xl bg-slate-800/60 px-4 py-3">
          <div className="text-lg font-bold tracking-tight">משמרות</div>
          <div className="text-xs text-slate-300/80">ניהול משמרות וחישוב שכר (RODA)</div>
        </div>
      </header>

      <nav className="mb-4 flex gap-2 rounded-2xl bg-slate-900/40 p-2">
        <TabLink to="/">משמרות</TabLink>
        <TabLink to="/summary">סיכום</TabLink>
        <TabLink to="/settings">הגדרות</TabLink>
        <TabLink to="/dev-journal">יומן</TabLink>
      </nav>

      <main className="pb-16">
        <Outlet />
      </main>
    </div>
  )
}

