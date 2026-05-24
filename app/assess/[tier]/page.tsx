// app/assess/[tier]/page.tsx
import { notFound } from 'next/navigation'
import type { Tier, Question } from '@/lib/types'
import { AssessmentWizard } from '@/components/assessment/AssessmentWizard'

const VALID_TIERS: Tier[] = ['elementary', 'middle', 'highschool', 'adult']

export function generateStaticParams() {
  return VALID_TIERS.map(tier => ({ tier }))
}

async function getQuestions(tier: Tier) {
  const data = await import(`@/data/questions/${tier}.json`)
  return data.default as { scenario: Question[]; likert: Question[] }
}

export default async function AssessmentPage({ params }: { params: Promise<{ tier: string }> }) {
  const { tier: tierParam } = await params
  const tier = tierParam as Tier
  if (!VALID_TIERS.includes(tier)) notFound()

  const questions = await getQuestions(tier)
  return (
    <div className="min-h-screen bg-slate-950 py-8">
      <AssessmentWizard tier={tier} questions={questions} />
    </div>
  )
}
