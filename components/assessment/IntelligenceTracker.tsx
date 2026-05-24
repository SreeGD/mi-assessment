// components/assessment/IntelligenceTracker.tsx

import { INTELLIGENCES } from '@/lib/intelligences'
import type { IntelligenceKey } from '@/lib/types'

type Props = {
  completed: IntelligenceKey[]
  current: IntelligenceKey
}

export function IntelligenceTracker({ completed, current }: Props) {
  return (
    <div className="bg-slate-800 rounded-lg px-3 py-2.5 mb-5">
      <p className="text-slate-500 text-xs mb-2">Intelligences covered so far</p>
      <div className="flex flex-wrap gap-1.5">
        {INTELLIGENCES.map(intel => {
          const isDone = completed.includes(intel.key)
          const isCurrent = intel.key === current
          return (
            <span
              key={intel.key}
              className="text-xs px-2 py-0.5 rounded-full border font-medium"
              style={
                isDone
                  ? { backgroundColor: intel.color, color: '#0f172a', borderColor: intel.color }
                  : isCurrent
                  ? { backgroundColor: 'transparent', color: intel.color, borderColor: intel.color }
                  : { backgroundColor: 'transparent', color: '#475569', borderColor: '#334155' }
              }
            >
              {intel.emoji} {intel.name}{isDone ? ' ✓' : isCurrent ? ' ←' : ''}
            </span>
          )
        })}
      </div>
    </div>
  )
}
