// components/assessment/AssessmentWizard.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Question, Tier, IntelligenceKey, Answer } from '@/lib/types'
import { INTELLIGENCES } from '@/lib/intelligences'
import { scoreAssessment } from '@/lib/scoring'
import { encodeResults } from '@/lib/urlState'
import { ProgressBar } from './ProgressBar'
import { IntelligenceTracker } from './IntelligenceTracker'
import { ScenarioQuestion } from './ScenarioQuestion'
import { LikertQuestion } from './LikertQuestion'

type Props = {
  tier: Tier
  questions: { scenario: Question[]; likert: Question[] }
}

export function AssessmentWizard({ tier, questions }: Props) {
  const router = useRouter()
  const allQuestions = [...questions.scenario, ...questions.likert]
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Map<string, Answer>>(new Map())
  const [processing, setProcessing] = useState(false)

  const current = allQuestions[step]
  const isScenario = current.type === 'scenario'
  const isLikert = current.type === 'likert'

  const currentAnswer = answers.get(current.id) ?? null

  const scenarioSelected: IntelligenceKey | null =
    isScenario && currentAnswer ? (currentAnswer.intelligence as IntelligenceKey) : null

  const likertValue: number | null =
    isLikert && currentAnswer ? currentAnswer.points : null

  function handleScenarioSelect(intelligence: IntelligenceKey) {
    const updated = new Map(answers)
    updated.set(current.id, {
      questionId: current.id,
      intelligence,
      points: 4,
    })
    setAnswers(updated)
  }

  function handleLikertChange(value: number) {
    if (current.type !== 'likert') return
    const points = current.reverse ? 6 - value : value
    const updated = new Map(answers)
    updated.set(current.id, {
      questionId: current.id,
      intelligence: current.intelligence,
      points,
    })
    setAnswers(updated)
  }

  const canAdvance = answers.has(current.id)

  function handleNext() {
    if (!canAdvance) return
    if (step < allQuestions.length - 1) {
      setStep(s => s + 1)
    } else {
      setProcessing(true)
      const answerList = Array.from(answers.values())
      const result = scoreAssessment(answerList, tier)
      const hash = encodeResults(result)
      router.push(`/results#${hash}`)
    }
  }

  function handleBack() {
    if (step > 0) setStep(s => s - 1)
  }

  const likertCompleted = INTELLIGENCES
    .map(i => i.key)
    .filter(key => {
      const count = questions.likert.filter((q: Question) =>
        q.type === 'likert' && q.intelligence === key && answers.has(q.id)
      ).length
      return count === 4
    })

  const progressColor = step < questions.scenario.length ? '#6366f1' : '#f59e0b'
  const totalQ = allQuestions.length

  if (processing) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
        <div className="text-4xl mb-4 animate-pulse">🧠</div>
        <h2 className="text-white text-xl font-bold mb-2">Calculating your profile...</h2>
        <p className="text-slate-400 text-sm">Analyzing your unique intelligence profile</p>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <div className="bg-slate-900 rounded-2xl overflow-hidden border border-slate-800">
        <ProgressBar current={step + 1} total={totalQ} color={progressColor} />

        <div className="p-6">
          <p className="text-xs text-slate-600 uppercase tracking-widest mb-4">
            {isScenario ? 'Step 1 of 2 · Scenario Questions' : 'Step 2 of 2 · Statements'}
          </p>

          {isLikert && current.type === 'likert' && (
            <IntelligenceTracker
              completed={likertCompleted}
              current={current.intelligence}
            />
          )}

          {isScenario && current.type === 'scenario' && (
            <ScenarioQuestion
              question={current}
              selectedIntelligence={scenarioSelected}
              onSelect={handleScenarioSelect}
            />
          )}
          {isLikert && current.type === 'likert' && (
            <LikertQuestion
              question={current}
              value={likertValue}
              onChange={handleLikertChange}
            />
          )}

          <div className="flex justify-between mt-8">
            <button
              onClick={handleBack}
              disabled={step === 0}
              className="px-5 py-2 rounded-lg border border-slate-700 text-slate-400 text-sm disabled:opacity-30 hover:bg-slate-800 transition-colors"
            >
              ← Back
            </button>
            <button
              onClick={handleNext}
              disabled={!canAdvance}
              className="px-6 py-2 rounded-lg text-sm font-bold disabled:opacity-30 transition-colors"
              style={canAdvance ? { backgroundColor: progressColor, color: step < questions.scenario.length ? '#fff' : '#000' } : { backgroundColor: '#334155', color: '#64748b' }}
            >
              {step === totalQ - 1 ? 'See My Results →' : 'Next →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
