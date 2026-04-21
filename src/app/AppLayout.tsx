import { NavLink, Outlet } from 'react-router-dom'

function TabLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <NavLink
      to={to}
      end={to === '/'}
      className={({ isActive }) =>
        [
          'flex-1 rounded-xl px-3 py-2 text-center text-sm font-semibold',
          isActive
            ? 'bg-blue-600 text-white shadow-sm'
            : 'text-slate-600 hover:bg-slate-100 dark:text-slate-200/80 dark:hover:bg-slate-900/60',
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
      <nav className="mb-4 flex gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm dark:border-slate-800 dark:bg-slate-950/40">
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

