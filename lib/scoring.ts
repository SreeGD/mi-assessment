// lib/scoring.ts

import type { Answer, AssessmentResult, IntelligenceScore, Tier } from './types'
import {
  INTELLIGENCE_KEYS,
  INTELLIGENCE_MAX_SCORE,
  generateHeroLabel,
} from './intelligences'

export function scoreAssessment(answers: Answer[], tier: Tier): AssessmentResult {
  // Accumulate raw points per intelligence
  const raw: Record<string, number> = Object.fromEntries(
    INTELLIGENCE_KEYS.map(k => [k, 0])
  )
  for (const answer of answers) {
    raw[answer.intelligence] = (raw[answer.intelligence] ?? 0) + answer.points
  }

  // Normalize to 0–100 (capped at 100)
  const scores: IntelligenceScore[] = INTELLIGENCE_KEYS.map(key => {
    const rawVal = raw[key]
    return {
      intelligence: key,
      raw: rawVal,
      normalized: Math.min(100, Math.round((rawVal / INTELLIGENCE_MAX_SCORE) * 100)),
    }
  })

  // Sort descending
  scores.sort((a, b) => b.normalized - a.normalized)

  const topThree = scores.slice(0, 3).map(s => s.intelligence)

  return {
    tier,
    scores,
    topThree,
    heroLabel: generateHeroLabel(scores),
  }
}
