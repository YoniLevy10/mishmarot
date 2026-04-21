import type { User } from '@supabase/supabase-js'
import { useTheme } from '../hooks/useTheme'
import { supabase } from '../lib/supabase'

export function AppHeader({
  user,
  onExport,
  showExport,
}: {
  user: User | null
  onExport?: () => void
  showExport?: boolean
}) {
  const { theme, toggle } = useTheme()

  return (
    <header className="sticky top-0 z-20 -mx-4 mb-4 border-b border-slate-200/80 bg-white/80 backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-950/70">
      <div className="mx-auto flex h-14 max-w-lg items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-600 shadow-sm">
            <span className="text-sm text-white">⏱</span>
          </div>
          <span className="text-sm font-extrabold tracking-tight text-slate-900 dark:text-white">משמרות</span>
        </div>

        <div className="flex items-center gap-1">
          {showExport ? (
            <button
              type="button"
              onClick={onExport}
              className="rounded-xl p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-900 dark:hover:text-white"
              title="ייצוא Excel"
            >
              <DownloadIcon />
            </button>
          ) : null}

          <button
            type="button"
            onClick={toggle}
            className="rounded-xl p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-900 dark:hover:text-white"
            title="מצב תצוגה"
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>

          {user?.user_metadata && (user.user_metadata as { avatar_url?: string }).avatar_url ? (
            <button
              type="button"
              title="התנתק"
              onClick={() => supabase.auth.signOut()}
              className="h-8 w-8 overflow-hidden rounded-full ring-1 ring-slate-200/80 dark:ring-slate-800"
            >
              <img
                src={(user.user_metadata as { avatar_url?: string }).avatar_url}
                alt=""
                className="h-full w-full object-cover"
              />
            </button>
          ) : (
            <button
              type="button"
              title="התנתק"
              onClick={() => supabase.auth.signOut()}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-xs font-extrabold text-blue-700 dark:bg-blue-950 dark:text-blue-200"
            >
              {(user?.email?.[0] ?? '?').toUpperCase()}
            </button>
          )}
        </div>
      </div>
    </header>
  )
}

function DownloadIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  )
}
