// tests/urlState.test.ts
import { describe, it, expect } from 'vitest'
import { encodeResults, decodeResults } from '@/lib/urlState'
import type { AssessmentResult } from '@/lib/types'
import { INTELLIGENCES } from '@/lib/intelligences'

const mockResult: AssessmentResult = {
  tier: 'highschool',
  scores: INTELLIGENCES.map((intel, i) => ({
    intelligence: intel.key,
    raw: (i + 1) * 2,
    normalized: Math.min(100, Math.round(((i + 1) * 2) / 36 * 100)),
  })),
  topThree: ['digital', 'existential', 'naturalist'],
  heroLabel: 'Digital-Existential Thinker',
}

describe('encodeResults', () => {
  it('includes tier in the encoded string', () => {
    expect(encodeResults(mockResult)).toContain('t=highschool')
  })

  it('includes scores in the encoded string', () => {
    const hash = encodeResults(mockResult)
    expect(hash).toContain('s=')
    expect(hash).toContain('linguistic:')
  })
})

describe('decodeResults', () => {
  it('round-trips without data loss', () => {
    const hash = encodeResults(mockResult)
    const decoded = decodeResults(hash)
    expect(decoded).not.toBeNull()
    expect(decoded!.tier).toBe('highschool')
    expect(decoded!.scores).toHaveLength(10)
    expect(decoded!.topThree).toEqual(['digital', 'existential', 'naturalist'])
  })

  it('handles hash with leading # character', () => {
    const hash = '#' + encodeResults(mockResult)
    const decoded = decodeResults(hash)
    expect(decoded).not.toBeNull()
  })

  it('returns null for empty string', () => {
    expect(decodeResults('')).toBeNull()
  })

  it('returns null for malformed input', () => {
    expect(decodeResults('garbage-data')).toBeNull()
  })

  it('returns null when scores count is not 10', () => {
    expect(decodeResults('t=adult&s=linguistic:50')).toBeNull()
  })
})
