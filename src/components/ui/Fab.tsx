export function Fab({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="fixed bottom-5 left-1/2 z-40 -translate-x-1/2 rounded-full bg-emerald-400 px-5 py-3 text-sm font-extrabold text-slate-950 shadow-lg shadow-emerald-500/30"
      aria-label="הוספת משמרת"
    >
      + הוספה
    </button>
  )
}

