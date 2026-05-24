// lib/intelligences.ts

import type { IntelligenceKey } from './types'

export type IntelligenceInfo = {
  key: IntelligenceKey
  name: string
  emoji: string
  color: string
  slug: string
  shortDescription: string
}

export const INTELLIGENCES: IntelligenceInfo[] = [
  {
    key: 'linguistic',
    name: 'Linguistic',
    emoji: '📚',
    color: '#6366f1',
    slug: 'linguistic',
    shortDescription: 'Sensitivity to spoken and written language; a love of words and stories.',
  },
  {
    key: 'logical',
    name: 'Logical-Mathematical',
    emoji: '🔢',
    color: '#60a5fa',
    slug: 'logical-mathematical',
    shortDescription: 'Ability to analyze problems logically and think abstractly with numbers.',
  },
  {
    key: 'spatial',
    name: 'Spatial',
    emoji: '🗺️',
    color: '#34d399',
    slug: 'spatial',
    shortDescription: 'Capacity to think in three dimensions and visualize spatial relationships.',
  },
  {
    key: 'musical',
    name: 'Musical',
    emoji: '🎵',
    color: '#f472b6',
    slug: 'musical',
    shortDescription: 'Skill in recognizing and creating musical rhythm, pitch, and timbre.',
  },
  {
    key: 'bodily',
    name: 'Bodily-Kinesthetic',
    emoji: '🤸',
    color: '#fb923c',
    slug: 'bodily-kinesthetic',
    shortDescription: 'Expertise in using the body and fine motor skills with precision.',
  },
  {
    key: 'interpersonal',
    name: 'Interpersonal',
    emoji: '👥',
    color: '#fbbf24',
    slug: 'interpersonal',
    shortDescription: 'Capacity to understand and work effectively with other people.',
  },
  {
    key: 'intrapersonal',
    name: 'Intrapersonal',
    emoji: '🪞',
    color: '#c084fc',
    slug: 'intrapersonal',
    shortDescription: 'Capacity to understand oneself — emotions, goals, and motivations.',
  },
  {
    key: 'naturalist',
    name: 'Naturalist',
    emoji: '🌿',
    color: '#4ade80',
    slug: 'naturalist',
    shortDescription: 'Ability to recognize and categorize natural objects and phenomena.',
  },
  {
    key: 'existential',
    name: 'Existential',
    emoji: '✨',
    color: '#94a3b8',
    slug: 'existential',
    shortDescription: 'Sensitivity to deep questions about existence, meaning, and consciousness.',
  },
  {
    key: 'digital',
    name: 'Digital',
    emoji: '💻',
    color: '#38bdf8',
    slug: 'digital',
    shortDescription: 'Fluency with technology, digital systems, and computational thinking.',
  },
]

export const INTELLIGENCE_KEYS: IntelligenceKey[] = INTELLIGENCES.map(i => i.key)

// Scoring: each intelligence appears as a scenario option exactly 4 times (4 pts each = 16 max)
// plus 4 Likert questions at max 5 pts each (20 max). Total max = 36.
export const INTELLIGENCE_MAX_SCORE = 36

export function getIntelligence(key: IntelligenceKey): IntelligenceInfo {
  const info = INTELLIGENCES.find(i => i.key === key)
  if (!info) throw new Error(`Unknown intelligence key: ${key}`)
  return info
}

export function generateHeroLabel(sortedScores: Array<{ intelligence: IntelligenceKey; normalized: number }>): string {
  const [first, second] = sortedScores
  const firstName = getIntelligence(first.intelligence).name
  if (second && first.normalized - second.normalized <= 10) {
    const secondName = getIntelligence(second.intelligence).name
    return `${firstName}-${secondName} Thinker`
  }
  return `${firstName} Thinker`
}
