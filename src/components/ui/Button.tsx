import type { ButtonHTMLAttributes } from 'react'

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'ghost' | 'danger'
}

export function Button({ className, variant = 'primary', ...props }: Props) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition active:scale-[0.99] disabled:opacity-50'
  const variants: Record<NonNullable<Props['variant']>, string> = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    ghost:
      'border border-slate-200 bg-white text-slate-800 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:hover:bg-slate-900',
    danger: 'bg-rose-600 text-white hover:bg-rose-500',
  }

  return <button className={[base, variants[variant], className].filter(Boolean).join(' ')} {...props} />
}

