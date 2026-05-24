// lib/types.ts

export type IntelligenceKey =
  | 'linguistic'
  | 'logical'
  | 'spatial'
  | 'musical'
  | 'bodily'
  | 'interpersonal'
  | 'intrapersonal'
  | 'naturalist'
  | 'existential'
  | 'digital'

export type Tier = 'elementary' | 'middle' | 'highschool' | 'adult'

export type ScenarioOption = {
  text: string
  emoji: string
  intelligence: IntelligenceKey
}

export type ScenarioQuestion = {
  id: string
  type: 'scenario'
  intelligence: IntelligenceKey   // anchor — which intelligence this question is designed to surface
  prompt: string
  options: ScenarioOption[]       // each option maps to a different intelligence
}

export type LikertQuestion = {
  id: string
  type: 'likert'
  intelligence: IntelligenceKey
  statement: string
  reverse: boolean                // if true, scoring engine applies: points = 6 - raw
}

export type Question = ScenarioQuestion | LikertQuestion

// Pre-processed answer: reverse scoring already applied in wizard
export type Answer = {
  questionId: string
  intelligence: IntelligenceKey
  points: number  // scenario: 4 pts to selected option's intelligence; likert: 1–5 (or 6-raw if reverse)
}

export type IntelligenceScore = {
  intelligence: IntelligenceKey
  raw: number
  normalized: number  // 0–100
}

export type AssessmentResult = {
  tier: Tier
  scores: IntelligenceScore[]   // sorted descending by normalized
  topThree: IntelligenceKey[]
  heroLabel: string             // e.g. "Musical Thinker" or "Musical-Spatial Thinker"
}
