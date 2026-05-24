// components/assessment/ScenarioQuestion.tsx

import type { ScenarioQuestion as ScenarioQuestionType } from '@/lib/types'
import type { IntelligenceKey } from '@/lib/types'

type Props = {
  question: ScenarioQuestionType
  selectedIntelligence: IntelligenceKey | null
  onSelect: (intelligence: IntelligenceKey) => void
}

export function ScenarioQuestion({ question, selectedIntelligence, onSelect }: Props) {
  return (
    <div>
      <p className="text-slate-500 text-xs uppercase tracking-widest mb-3">What sounds most like you?</p>
      <p className="text-white font-semibold text-lg leading-relaxed mb-6">{question.prompt}</p>
      <div className="flex flex-col gap-3">
        {question.options.map(opt => {
          const isSelected = selectedIntelligence === opt.intelligence
          return (
            <button
              key={opt.intelligence}
              onClick={() => onSelect(opt.intelligence)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all"
              style={
                isSelected
                  ? { backgroundColor: '#6366f1', borderColor: '#6366f1', color: '#fff' }
                  : { backgroundColor: '#1e293b', borderColor: '#334155', color: '#e2e8f0' }
              }
            >
              <span className="text-xl shrink-0">{opt.emoji}</span>
              <span className="text-sm font-medium">{opt.text}</span>
              {isSelected && <span className="ml-auto text-white text-sm">✓</span>}
            </button>
          )
        })}
      </div>
    </div>
  )
}
