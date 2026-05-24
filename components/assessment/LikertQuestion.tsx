// components/assessment/LikertQuestion.tsx

import { getIntelligence } from '@/lib/intelligences'
import type { LikertQuestion as LikertQuestionType } from '@/lib/types'

type Props = {
  question: LikertQuestionType
  value: number | null
  onChange: (value: number) => void
}

const LIKERT_LABEL: Record<number, string> = {
  1: 'Strongly Disagree',
  2: 'Disagree',
  3: 'Neutral',
  4: 'Agree',
  5: 'Strongly Agree',
}

export function LikertQuestion({ question, value, onChange }: Props) {
  const intel = getIntelligence(question.intelligence)

  return (
    <div>
      <span
        className="inline-block text-xs px-3 py-1 rounded-full border mb-4 font-medium"
        style={{ color: intel.color, borderColor: intel.color }}
      >
        {intel.emoji} {intel.name} Intelligence
      </span>

      <p className="text-white font-semibold text-lg leading-relaxed mb-6">{question.statement}</p>

      <div className="mb-4">
        <div className="flex justify-between text-xs text-slate-500 mb-2">
          <span>Strongly<br />Disagree</span>
          <span className="text-right">Strongly<br />Agree</span>
        </div>
        <div className="flex gap-3 justify-center">
          {[1, 2, 3, 4, 5].map(n => (
            <button
              key={n}
              onClick={() => onChange(n)}
              className="w-11 h-11 rounded-full border-2 text-sm font-semibold transition-all"
              style={
                value === n
                  ? { backgroundColor: intel.color, borderColor: intel.color, color: '#0f172a' }
                  : { backgroundColor: '#1e293b', borderColor: '#334155', color: '#94a3b8' }
              }
            >
              {n}
            </button>
          ))}
        </div>
        {value !== null && (
          <p className="text-center text-xs mt-2" style={{ color: intel.color }}>
            {LIKERT_LABEL[value]}
          </p>
        )}
      </div>
    </div>
  )
}
