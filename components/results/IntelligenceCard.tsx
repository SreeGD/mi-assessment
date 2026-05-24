// components/results/IntelligenceCard.tsx

import { getIntelligence } from '@/lib/intelligences'
import type { IntelligenceScore } from '@/lib/types'

type Props = {
  score: IntelligenceScore
  rank: number
}

export function IntelligenceCard({ score, rank }: Props) {
  const intel = getIntelligence(score.intelligence)
  return (
    <div
      className="bg-slate-800 rounded-xl p-4"
      style={{ borderLeft: `3px solid ${intel.color}` }}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{intel.emoji}</span>
          <span className="font-bold text-sm" style={{ color: intel.color }}>
            #{rank} {intel.name}
          </span>
        </div>
        <span className="font-bold text-sm" style={{ color: intel.color }}>
          {score.normalized}%
        </span>
      </div>
      <div className="bg-slate-900 rounded-full h-1.5 mb-3">
        <div
          className="h-1.5 rounded-full transition-all"
          style={{ width: `${score.normalized}%`, backgroundColor: intel.color }}
        />
      </div>
      <p className="text-slate-400 text-xs leading-relaxed">{intel.shortDescription}</p>
    </div>
  )
}
