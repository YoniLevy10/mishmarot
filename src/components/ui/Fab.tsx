export function Fab({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="fixed bottom-5 left-1/2 z-40 -translate-x-1/2 rounded-full bg-blue-600 px-5 py-3 text-sm font-extrabold text-white shadow-lg shadow-blue-600/30 ring-1 ring-blue-500/30 hover:bg-blue-700"
      aria-label="הוספת משמרת"
    >
      + הוספה
    </button>
  )
}

