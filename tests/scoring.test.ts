// tests/scoring.test.ts
import { describe, it, expect } from 'vitest'
import { scoreAssessment } from '@/lib/scoring'
import type { Answer, Tier } from '@/lib/types'
import { INTELLIGENCE_MAX_SCORE } from '@/lib/intelligences'

const tier: Tier = 'middle'

describe('scoreAssessment', () => {
  it('returns scores for all 10 intelligences', () => {
    const result = scoreAssessment([], tier)
    expect(result.scores).toHaveLength(10)
  })

  it('normalizes a perfect score to 100', () => {
    const maxAnswers: Answer[] = [
      // 4 scenario hits (16 pts)
      { questionId: 'a', intelligence: 'linguistic', points: 4 },
      { questionId: 'b', intelligence: 'linguistic', points: 4 },
      { questionId: 'c', intelligence: 'linguistic', points: 4 },
      { questionId: 'd', intelligence: 'linguistic', points: 4 },
      // 4 Likert at max 5 (20 pts)
      { questionId: 'e', intelligence: 'linguistic', points: 5 },
      { questionId: 'f', intelligence: 'linguistic', points: 5 },
      { questionId: 'g', intelligence: 'linguistic', points: 5 },
      { questionId: 'h', intelligence: 'linguistic', points: 5 },
    ]
    const result = scoreAssessment(maxAnswers, tier)
    const ling = result.scores.find(s => s.intelligence === 'linguistic')
    expect(ling?.raw).toBe(INTELLIGENCE_MAX_SCORE)
    expect(ling?.normalized).toBe(100)
  })

  it('returns scores sorted descending by normalized value', () => {
    const answers: Answer[] = [
      { questionId: 'a', intelligence: 'digital', points: 20 },
      { questionId: 'b', intelligence: 'linguistic', points: 36 },
    ]
    const result = scoreAssessment(answers, tier)
    expect(result.scores[0].intelligence).toBe('linguistic')
    expect(result.scores[0].normalized).toBeGreaterThanOrEqual(result.scores[1].normalized)
  })

  it('sets topThree to top 3 intelligences', () => {
    const answers: Answer[] = [
      { questionId: 'a', intelligence: 'musical', points: 30 },
      { questionId: 'b', intelligence: 'spatial', points: 25 },
      { questionId: 'c', intelligence: 'digital', points: 20 },
      { questionId: 'd', intelligence: 'logical', points: 10 },
    ]
    const result = scoreAssessment(answers, tier)
    expect(result.topThree).toHaveLength(3)
    expect(result.topThree[0]).toBe('musical')
    expect(result.topThree[1]).toBe('spatial')
    expect(result.topThree[2]).toBe('digital')
  })

  it('generates single hero label when top score leads by more than 10 pts', () => {
    const answers: Answer[] = [
      { questionId: 'a', intelligence: 'musical', points: 36 },
      { questionId: 'b', intelligence: 'spatial', points: 10 },
    ]
    const result = scoreAssessment(answers, tier)
    expect(result.heroLabel).toBe('Musical Thinker')
  })

  it('generates dual hero label when top two are within 10 normalized points', () => {
    const answers: Answer[] = [
      { questionId: 'a', intelligence: 'musical', points: 36 },
      { questionId: 'b', intelligence: 'spatial', points: 33 },
    ]
    const result = scoreAssessment(answers, tier)
    expect(result.heroLabel).toContain('Musical')
    expect(result.heroLabel).toContain('Spatial')
  })

  it('clamps normalized score to max 100', () => {
    const answers: Answer[] = [
      { questionId: 'a', intelligence: 'linguistic', points: 999 },
    ]
    const result = scoreAssessment(answers, tier)
    const ling = result.scores.find(s => s.intelligence === 'linguistic')
    expect(ling!.normalized).toBe(100)
  })

  it('returns zero scores for intelligences with no answers', () => {
    const result = scoreAssessment([], tier)
    result.scores.forEach(s => {
      expect(s.raw).toBe(0)
      expect(s.normalized).toBe(0)
    })
  })
})
