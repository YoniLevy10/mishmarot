import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

const MONTH_NAMES = ['ינו', 'פבר', 'מרץ', 'אפר', 'מאי', 'יוני', 'יולי', 'אוג', 'ספט', 'אוק', 'נוב', 'דצמ']

export function MonthlyChart({ data }: { data: { month: number; year: number; gross: number }[] }) {
  const chartData = data.map((d) => ({
    name: MONTH_NAMES[d.month] ?? String(d.month),
    gross: Math.round(d.gross),
  }))

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">השוואת חודשים</h3>
      <ResponsiveContainer width="100%" height={160}>
        <BarChart data={chartData} barSize={28}>
          <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
          <YAxis hide />
          <Tooltip
            formatter={(v) => {
              const n = typeof v === 'number' ? v : Number(v)
              const safe = Number.isFinite(n) ? n : 0
              return [`₪${safe.toLocaleString('he-IL')}`, 'ברוטו']
            }}
            contentStyle={{
              background: '#0f172a',
              border: 'none',
              borderRadius: 12,
              color: '#e2e8f0',
              fontSize: 12,
            }}
          />
          <Bar dataKey="gross" radius={[8, 8, 0, 0]}>
            {chartData.map((_, i) => (
              <Cell key={i} fill={i === chartData.length - 1 ? '#2563eb' : '#e2e8f0'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
