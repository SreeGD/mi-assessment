// components/assessment/ProgressBar.tsx

type Props = {
  current: number   // 1-based current question number
  total: number
  color?: string
}

export function ProgressBar({ current, total, color = '#6366f1' }: Props) {
  const pct = Math.round((current / total) * 100)
  return (
    <div className="bg-slate-800 px-5 py-3">
      <div className="flex justify-between items-center mb-1.5 text-xs text-slate-400">
        <span>Question {current} of {total}</span>
        <span style={{ color }}>{pct}%</span>
      </div>
      <div className="bg-slate-900 rounded-full h-1.5">
        <div
          className="h-1.5 rounded-full transition-all duration-300"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  )
}
