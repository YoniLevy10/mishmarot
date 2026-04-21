import { useEffect } from 'react'

export function BottomSheet({
  open,
  title,
  onClose,
  children,
}: {
  open: boolean
  title: string
  onClose: () => void
  children: React.ReactNode
}) {
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    if (open) window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-label="סגירה"
      />
      <div className="absolute bottom-0 left-0 right-0 mx-auto max-w-[430px] rounded-t-3xl bg-slate-800 p-4 shadow-xl">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="text-base font-bold text-slate-100">{title}</div>
          <button
            type="button"
            className="rounded-xl bg-slate-900/50 px-3 py-1 text-sm text-slate-200 hover:bg-slate-900"
            onClick={onClose}
          >
            סגור
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

