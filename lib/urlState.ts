// lib/urlState.ts

import type { AssessmentResult, IntelligenceScore } from './types'
import { generateHeroLabel } from './intelligences'

export function encodeResults(result: AssessmentResult): string {
  const scoresStr = result.scores
    .map(s => `${s.intelligence}:${s.normalized}`)
    .join(',')
  return `t=${result.tier}&s=${scoresStr}`
}

export function decodeResults(hash: string): AssessmentResult | null {
  try {
    if (!hash) return null
    const clean = hash.startsWith('#') ? hash.slice(1) : hash
    const params = new URLSearchParams(clean)
    const tier = params.get('t') as AssessmentResult['tier'] | null
    const scoresStr = params.get('s')
    if (!tier || !scoresStr) return null

    const scores: IntelligenceScore[] = scoresStr.split(',').map(entry => {
      const [intelligence, normalizedStr] = entry.split(':')
      return {
        intelligence: intelligence as AssessmentResult['scores'][number]['intelligence'],
        raw: 0,
        normalized: parseInt(normalizedStr, 10),
      }
    })

    if (scores.length !== 10) return null
    if (scores.some(s => isNaN(s.normalized))) return null

    const sorted = [...scores].sort((a, b) => b.normalized - a.normalized)
    const topThree = sorted.slice(0, 3).map(s => s.intelligence)

    return {
      tier,
      scores: sorted,
      topThree,
      heroLabel: generateHeroLabel(sorted),
    }
  } catch {
    return null
  }
}
