import type { ButtonHTMLAttributes } from 'react'

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'ghost' | 'danger'
}

export function Button({ className, variant = 'primary', ...props }: Props) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition active:scale-[0.99] disabled:opacity-50'
  const variants: Record<NonNullable<Props['variant']>, string> = {
    primary: 'bg-indigo-400 text-slate-950 hover:bg-indigo-300',
    ghost: 'bg-slate-800/60 text-slate-100 hover:bg-slate-800',
    danger: 'bg-rose-500 text-white hover:bg-rose-400',
  }

  return <button className={[base, variants[variant], className].filter(Boolean).join(' ')} {...props} />
}

