type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string
  hint?: string
}

export function Field({ label, hint, className, ...props }: InputProps) {
  return (
    <label className="block">
      <div className="mb-1 text-sm font-medium text-slate-700 dark:text-slate-200">{label}</div>
      <input
        className={[
          'w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 outline-none',
          'focus:border-blue-500 focus:ring-2 focus:ring-blue-500/25',
          'dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100',
          'dark:focus:border-indigo-300 dark:focus:ring-indigo-300/25',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        {...props}
      />
      {hint ? <div className="mt-1 text-xs text-slate-500 dark:text-slate-300/80">{hint}</div> : null}
    </label>
  )
}

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  label: string
}

export function SelectField({ label, className, children, ...props }: SelectProps) {
  return (
    <label className="block">
      <div className="mb-1 text-sm font-medium text-slate-700 dark:text-slate-200">{label}</div>
      <select
        className={[
          'w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 outline-none',
          'focus:border-blue-500 focus:ring-2 focus:ring-blue-500/25',
          'dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100',
          'dark:focus:border-indigo-300 dark:focus:ring-indigo-300/25',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        {...props}
      >
        {children}
      </select>
    </label>
  )
}

export function CheckboxField({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (next: boolean) => void
}) {
  return (
    <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-950">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span className="text-sm text-slate-900 dark:text-slate-100">{label}</span>
    </label>
  )
}

