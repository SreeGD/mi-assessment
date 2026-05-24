# Multiple Intelligences Assessment — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a free, anonymous Next.js web app that assesses users across 10 intelligences across 4 age tiers and delivers a personalized radar-chart results page.

**Architecture:** Pure frontend Next.js 15 app — all assessment logic runs client-side, scores encoded in URL hash for sharing. Dynamic `/assess/[tier]` route loads tier-specific JSON question banks; shared `AssessmentWizard` component handles wizard state. No backend, no auth, no database.

**Tech Stack:** Next.js 15 (App Router), TypeScript, Tailwind CSS v4, Vitest + React Testing Library, custom SVG radar chart.

---

## File Map

```
app/
  layout.tsx
  page.tsx                          # Landing
  assess/
    page.tsx                        # Tier selector
    [tier]/page.tsx                 # Dynamic assessment wizard
  results/page.tsx                  # Results (reads URL hash)
  learn/page.tsx
  intelligence/[slug]/page.tsx
  for-educators/page.tsx
components/
  shared/Nav.tsx
  assessment/
    AssessmentWizard.tsx
    ScenarioQuestion.tsx
    LikertQuestion.tsx
    ProgressBar.tsx
    IntelligenceTracker.tsx
  results/
    RadarChart.tsx
    IntelligenceCard.tsx
    RecommendationPanel.tsx
lib/
  types.ts
  intelligences.ts
  scoring.ts
  urlState.ts
data/
  questions/elementary.json
  data/questions/middle.json
  data/questions/highschool.json
  data/questions/adult.json
  recommendations/elementary.json
  recommendations/middle.json
  recommendations/highschool.json
  recommendations/adult.json
tests/
  scoring.test.ts
  urlState.test.ts
```

---

## Task 1: Scaffold Next.js Project

**Files:**
- Create: `package.json`, `tsconfig.json`, `vitest.config.ts`, `vitest.setup.ts`, `.gitignore`

- [ ] **Step 1: Create Next.js app**

```bash
cd /Users/srmallip/projects/mi
npx create-next-app@latest . \
  --typescript \
  --tailwind \
  --app \
  --no-src-dir \
  --import-alias "@/*" \
  --yes
```

Expected: Next.js 15 project scaffolded with App Router, TypeScript, Tailwind CSS v4.

- [ ] **Step 2: Install Vitest + React Testing Library**

```bash
npm install -D vitest @vitejs/plugin-react @testing-library/react \
  @testing-library/jest-dom @testing-library/user-event jsdom
```

- [ ] **Step 3: Create vitest.config.ts**

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './vitest.setup.ts',
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, '.') },
  },
})
```

- [ ] **Step 4: Create vitest.setup.ts**

```typescript
// vitest.setup.ts
import '@testing-library/jest-dom'
```

- [ ] **Step 5: Add test script to package.json**

In `package.json`, add to `"scripts"`:
```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 6: Create data directories**

```bash
mkdir -p data/questions data/recommendations tests
```

- [ ] **Step 7: Verify scaffold**

```bash
npm run build
```

Expected: Build succeeds with default Next.js pages.

- [ ] **Step 8: Commit**

```bash
git init
git add -A
git commit -m "feat: scaffold Next.js 15 + Vitest"
```

---

## Task 2: TypeScript Types

**Files:**
- Create: `lib/types.ts`

- [ ] **Step 1: Create lib/types.ts**

```typescript
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
```

- [ ] **Step 2: Commit**

```bash
git add lib/types.ts
git commit -m "feat: add TypeScript types"
```

---

## Task 3: Intelligence Metadata

**Files:**
- Create: `lib/intelligences.ts`

- [ ] **Step 1: Create lib/intelligences.ts**

```typescript
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
```

- [ ] **Step 2: Commit**

```bash
git add lib/intelligences.ts
git commit -m "feat: add intelligence metadata"
```

---

## Task 4: Scoring Engine + Tests

**Files:**
- Create: `lib/scoring.ts`, `tests/scoring.test.ts`

- [ ] **Step 1: Write failing tests**

```typescript
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
```

- [ ] **Step 2: Run — expect FAIL**

```bash
npm test tests/scoring.test.ts
```

Expected: `Cannot find module '@/lib/scoring'`

- [ ] **Step 3: Implement lib/scoring.ts**

```typescript
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
```

- [ ] **Step 4: Run — expect PASS**

```bash
npm test tests/scoring.test.ts
```

Expected: All 8 tests pass.

- [ ] **Step 5: Commit**

```bash
git add lib/scoring.ts tests/scoring.test.ts
git commit -m "feat: scoring engine with tests"
```

---

## Task 5: URL State Encoder/Decoder + Tests

**Files:**
- Create: `lib/urlState.ts`, `tests/urlState.test.ts`

- [ ] **Step 1: Write failing tests**

```typescript
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
  topThree: ['linguistic', 'logical', 'spatial'],
  heroLabel: 'Linguistic Thinker',
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
    expect(decoded!.topThree).toEqual(['linguistic', 'logical', 'spatial'])
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
```

- [ ] **Step 2: Run — expect FAIL**

```bash
npm test tests/urlState.test.ts
```

- [ ] **Step 3: Implement lib/urlState.ts**

```typescript
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
```

- [ ] **Step 4: Run — expect PASS**

```bash
npm test tests/urlState.test.ts
```

- [ ] **Step 5: Run all tests**

```bash
npm test
```

Expected: All tests pass.

- [ ] **Step 6: Commit**

```bash
git add lib/urlState.ts tests/urlState.test.ts
git commit -m "feat: URL state encoder/decoder with tests"
```

---

## Task 6: Middle School Question Bank

**Files:**
- Create: `data/questions/middle.json`

**Scoring note:** Each scenario option awards 4 pts to its `option.intelligence`. Each intelligence appears as a scenario option exactly 4 times across the 10 questions (max 16 scenario pts). 4 Likert × max 5 = 20. Total max = 36.

- [ ] **Step 1: Create data/questions/middle.json**

```json
{
  "scenario": [
    {
      "id": "ms-s-01",
      "type": "scenario",
      "intelligence": "linguistic",
      "prompt": "Your class is making a project about a country. You volunteer to...",
      "options": [
        { "text": "Write the narration and descriptions", "emoji": "📖", "intelligence": "linguistic" },
        { "text": "Design the maps and visual layout", "emoji": "🗺️", "intelligence": "spatial" },
        { "text": "Compose a short song or chant about the country", "emoji": "🎵", "intelligence": "musical" },
        { "text": "Build a 3D model of a famous landmark", "emoji": "🏗️", "intelligence": "bodily" }
      ]
    },
    {
      "id": "ms-s-02",
      "type": "scenario",
      "intelligence": "logical",
      "prompt": "Your group has a $20 budget for a class party. You...",
      "options": [
        { "text": "Make a spreadsheet to compare prices and maximize what you can buy", "emoji": "🔢", "intelligence": "logical" },
        { "text": "Ask everyone what they most want and find a compromise", "emoji": "👥", "intelligence": "interpersonal" },
        { "text": "Quietly think through what would make the party most meaningful", "emoji": "🪞", "intelligence": "intrapersonal" },
        { "text": "Suggest spending it on a nature activity like a garden visit", "emoji": "🌿", "intelligence": "naturalist" }
      ]
    },
    {
      "id": "ms-s-03",
      "type": "scenario",
      "intelligence": "spatial",
      "prompt": "Your school needs a new mural for the entrance hall. You offer to...",
      "options": [
        { "text": "Sketch the layout and lead the visual design", "emoji": "🗺️", "intelligence": "spatial" },
        { "text": "Design it around a theme about life or community", "emoji": "✨", "intelligence": "existential" },
        { "text": "Build an interactive digital version for the school website", "emoji": "💻", "intelligence": "digital" },
        { "text": "Write a poem or quote that captures the school's spirit", "emoji": "📖", "intelligence": "linguistic" }
      ]
    },
    {
      "id": "ms-s-04",
      "type": "scenario",
      "intelligence": "musical",
      "prompt": "Your class is putting together an assembly performance. You most want to...",
      "options": [
        { "text": "Compose or arrange the music for it", "emoji": "🎵", "intelligence": "musical" },
        { "text": "Plan the timing, transitions, and running order", "emoji": "🔢", "intelligence": "logical" },
        { "text": "Choreograph the movement and dance sections", "emoji": "🤸", "intelligence": "bodily" },
        { "text": "Coordinate the team and make sure everyone feels included", "emoji": "👥", "intelligence": "interpersonal" }
      ]
    },
    {
      "id": "ms-s-05",
      "type": "scenario",
      "intelligence": "bodily",
      "prompt": "After a stressful exam week, you recover best by...",
      "options": [
        { "text": "Going for a run, shooting hoops, or doing something physical", "emoji": "🤸", "intelligence": "bodily" },
        { "text": "Spending time alone — journaling or just thinking quietly", "emoji": "🪞", "intelligence": "intrapersonal" },
        { "text": "Going outside for a walk — nature completely resets you", "emoji": "🌿", "intelligence": "naturalist" },
        { "text": "Sitting with bigger questions — what's the point of all this pressure?", "emoji": "✨", "intelligence": "existential" }
      ]
    },
    {
      "id": "ms-s-06",
      "type": "scenario",
      "intelligence": "interpersonal",
      "prompt": "A classmate seems left out of the group chat. You...",
      "options": [
        { "text": "Reach out in person and make sure they feel included", "emoji": "👥", "intelligence": "interpersonal" },
        { "text": "Add them to the group or set up a new chat that includes everyone", "emoji": "💻", "intelligence": "digital" },
        { "text": "Write them a friendly note or message", "emoji": "📖", "intelligence": "linguistic" },
        { "text": "Figure out why the group dynamic shifted and suggest a fix", "emoji": "🔢", "intelligence": "logical" }
      ]
    },
    {
      "id": "ms-s-07",
      "type": "scenario",
      "intelligence": "intrapersonal",
      "prompt": "You're choosing what kind of project to do for a free assignment. You want something that...",
      "options": [
        { "text": "Lets you explore your own thoughts, values, and identity deeply", "emoji": "🪞", "intelligence": "intrapersonal" },
        { "text": "Lets you design or illustrate something visually striking", "emoji": "🗺️", "intelligence": "spatial" },
        { "text": "Lets you write or perform original music", "emoji": "🎵", "intelligence": "musical" },
        { "text": "Involves movement, building, or hands-on making", "emoji": "🤸", "intelligence": "bodily" }
      ]
    },
    {
      "id": "ms-s-08",
      "type": "scenario",
      "intelligence": "naturalist",
      "prompt": "On a school field trip to a forest, you spend most of your time...",
      "options": [
        { "text": "Examining plants, insects, and tracking what you observe", "emoji": "🌿", "intelligence": "naturalist" },
        { "text": "Chatting and exploring with your friends", "emoji": "👥", "intelligence": "interpersonal" },
        { "text": "Thinking about what the forest symbolizes and its deeper meaning", "emoji": "✨", "intelligence": "existential" },
        { "text": "Photographing everything and thinking about how to edit and share it", "emoji": "💻", "intelligence": "digital" }
      ]
    },
    {
      "id": "ms-s-09",
      "type": "scenario",
      "intelligence": "existential",
      "prompt": "Your class debates whether AI will ever be truly 'conscious.' You...",
      "options": [
        { "text": "Jump in — consciousness and what makes us human fascinate you", "emoji": "✨", "intelligence": "existential" },
        { "text": "Write a structured argument outlining both sides", "emoji": "📖", "intelligence": "linguistic" },
        { "text": "Map out the logical steps of what consciousness would actually require", "emoji": "🔢", "intelligence": "logical" },
        { "text": "Draw a diagram of the relationship between brain, AI, and awareness", "emoji": "🗺️", "intelligence": "spatial" }
      ]
    },
    {
      "id": "ms-s-10",
      "type": "scenario",
      "intelligence": "digital",
      "prompt": "You want to document your class trip. You...",
      "options": [
        { "text": "Build a quick website or edit a video to capture and share it", "emoji": "💻", "intelligence": "digital" },
        { "text": "Write a song or poem about the day", "emoji": "🎵", "intelligence": "musical" },
        { "text": "Keep a private journal of your own reflections and feelings", "emoji": "🪞", "intelligence": "intrapersonal" },
        { "text": "Focus on nature photography — plants, animals, and landscapes", "emoji": "🌿", "intelligence": "naturalist" }
      ]
    }
  ],
  "likert": [
    { "id": "ms-l-lin-01", "type": "likert", "intelligence": "linguistic", "statement": "I enjoy reading books or stories in my free time.", "reverse": false },
    { "id": "ms-l-lin-02", "type": "likert", "intelligence": "linguistic", "statement": "I find it easy to explain my ideas clearly to others.", "reverse": false },
    { "id": "ms-l-lin-03", "type": "likert", "intelligence": "linguistic", "statement": "I like writing — journals, stories, or creative pieces.", "reverse": false },
    { "id": "ms-l-lin-04", "type": "likert", "intelligence": "linguistic", "statement": "I notice when someone uses an interesting or unusual word.", "reverse": false },
    { "id": "ms-l-log-01", "type": "likert", "intelligence": "logical", "statement": "I enjoy solving math or logic problems, even outside of school.", "reverse": false },
    { "id": "ms-l-log-02", "type": "likert", "intelligence": "logical", "statement": "I like finding patterns and figuring out how things connect.", "reverse": false },
    { "id": "ms-l-log-03", "type": "likert", "intelligence": "logical", "statement": "I prefer having a clear step-by-step approach when solving problems.", "reverse": false },
    { "id": "ms-l-log-04", "type": "likert", "intelligence": "logical", "statement": "I enjoy strategy games like chess, Sudoku, or coding puzzles.", "reverse": false },
    { "id": "ms-l-spa-01", "type": "likert", "intelligence": "spatial", "statement": "I can easily picture how an object looks from a different angle.", "reverse": false },
    { "id": "ms-l-spa-02", "type": "likert", "intelligence": "spatial", "statement": "I enjoy drawing, doodling, or designing things visually.", "reverse": false },
    { "id": "ms-l-spa-03", "type": "likert", "intelligence": "spatial", "statement": "I have a good sense of direction and rarely get confused about where I am.", "reverse": false },
    { "id": "ms-l-spa-04", "type": "likert", "intelligence": "spatial", "statement": "When working through a problem, I often sketch or diagram it.", "reverse": false },
    { "id": "ms-l-mus-01", "type": "likert", "intelligence": "musical", "statement": "I can remember a melody after hearing it just once or twice.", "reverse": false },
    { "id": "ms-l-mus-02", "type": "likert", "intelligence": "musical", "statement": "Music strongly affects my mood — the right song changes how I feel.", "reverse": false },
    { "id": "ms-l-mus-03", "type": "likert", "intelligence": "musical", "statement": "I often catch myself humming, tapping, or keeping a beat without realizing it.", "reverse": false },
    { "id": "ms-l-mus-04", "type": "likert", "intelligence": "musical", "statement": "I immediately notice when something sounds off-key or a rhythm is wrong.", "reverse": false },
    { "id": "ms-l-bod-01", "type": "likert", "intelligence": "bodily", "statement": "I learn better by doing than by reading or listening.", "reverse": false },
    { "id": "ms-l-bod-02", "type": "likert", "intelligence": "bodily", "statement": "I enjoy sports, dancing, building things, or other hands-on activities.", "reverse": false },
    { "id": "ms-l-bod-03", "type": "likert", "intelligence": "bodily", "statement": "I find it hard to sit still for long stretches of time.", "reverse": false },
    { "id": "ms-l-bod-04", "type": "likert", "intelligence": "bodily", "statement": "I pick up physical activities quickly and have good coordination.", "reverse": false },
    { "id": "ms-l-itp-01", "type": "likert", "intelligence": "interpersonal", "statement": "I enjoy working in groups more than working alone.", "reverse": false },
    { "id": "ms-l-itp-02", "type": "likert", "intelligence": "interpersonal", "statement": "I can usually sense how someone is feeling even before they say anything.", "reverse": false },
    { "id": "ms-l-itp-03", "type": "likert", "intelligence": "interpersonal", "statement": "Friends often come to me when they need advice or someone to talk to.", "reverse": false },
    { "id": "ms-l-itp-04", "type": "likert", "intelligence": "interpersonal", "statement": "I'm good at getting a group to cooperate and stay on track.", "reverse": false },
    { "id": "ms-l-itr-01", "type": "likert", "intelligence": "intrapersonal", "statement": "I think deeply about who I am, what I value, and what I want in life.", "reverse": false },
    { "id": "ms-l-itr-02", "type": "likert", "intelligence": "intrapersonal", "statement": "I prefer to work alone and set my own goals and pace.", "reverse": false },
    { "id": "ms-l-itr-03", "type": "likert", "intelligence": "intrapersonal", "statement": "I have a clear sense of my own strengths and weaknesses.", "reverse": false },
    { "id": "ms-l-itr-04", "type": "likert", "intelligence": "intrapersonal", "statement": "I track my feelings and reflect on my emotions — through journaling or quiet thinking.", "reverse": false },
    { "id": "ms-l-nat-01", "type": "likert", "intelligence": "naturalist", "statement": "I notice details about nature — plants, animals, weather — that others often miss.", "reverse": false },
    { "id": "ms-l-nat-02", "type": "likert", "intelligence": "naturalist", "statement": "I feel more relaxed and happy when I spend time outdoors.", "reverse": false },
    { "id": "ms-l-nat-03", "type": "likert", "intelligence": "naturalist", "statement": "I enjoy learning the names and facts about different animals or plants.", "reverse": false },
    { "id": "ms-l-nat-04", "type": "likert", "intelligence": "naturalist", "statement": "I care deeply about environmental issues and protecting the natural world.", "reverse": false },
    { "id": "ms-l-exi-01", "type": "likert", "intelligence": "existential", "statement": "I often wonder about big questions — like why we exist or what happens after we die.", "reverse": false },
    { "id": "ms-l-exi-02", "type": "likert", "intelligence": "existential", "statement": "Deep questions about fairness, meaning, or purpose genuinely fascinate me.", "reverse": false },
    { "id": "ms-l-exi-03", "type": "likert", "intelligence": "existential", "statement": "I enjoy conversations about consciousness, the universe, or what makes us human.", "reverse": false },
    { "id": "ms-l-exi-04", "type": "likert", "intelligence": "existential", "statement": "I think a lot about what it means to live a good and meaningful life.", "reverse": false },
    { "id": "ms-l-dig-01", "type": "likert", "intelligence": "digital", "statement": "I pick up new apps, devices, or software quickly without much help.", "reverse": false },
    { "id": "ms-l-dig-02", "type": "likert", "intelligence": "digital", "statement": "I enjoy creating things digitally — videos, games, websites, or graphics.", "reverse": false },
    { "id": "ms-l-dig-03", "type": "likert", "intelligence": "digital", "statement": "I naturally understand how digital tools and systems work.", "reverse": false },
    { "id": "ms-l-dig-04", "type": "likert", "intelligence": "digital", "statement": "I feel comfortable finding information online and judging whether it's trustworthy.", "reverse": false }
  ]
}
```

- [ ] **Step 2: Commit**

```bash
git add data/questions/middle.json
git commit -m "feat: middle school question bank (50 questions)"
```

---

## Task 7: Elementary Question Bank

**Files:**
- Create: `data/questions/elementary.json`

Same 10 scenario question intelligence distribution as middle school. Likert statements use short, simple vocabulary for ages 5–10.

- [ ] **Step 1: Create data/questions/elementary.json**

```json
{
  "scenario": [
    {
      "id": "el-s-01", "type": "scenario", "intelligence": "linguistic",
      "prompt": "It's free project time! You want to...",
      "options": [
        { "text": "Write a fun story or poem", "emoji": "📖", "intelligence": "linguistic" },
        { "text": "Draw a big colorful picture", "emoji": "🎨", "intelligence": "spatial" },
        { "text": "Make up a silly song about it", "emoji": "🎵", "intelligence": "musical" },
        { "text": "Build a model out of blocks or clay", "emoji": "🧱", "intelligence": "bodily" }
      ]
    },
    {
      "id": "el-s-02", "type": "scenario", "intelligence": "logical",
      "prompt": "You have 12 crayons to share with 3 friends. You...",
      "options": [
        { "text": "Count them out carefully so everyone gets the same", "emoji": "🔢", "intelligence": "logical" },
        { "text": "Ask everyone which colors they want most", "emoji": "👥", "intelligence": "interpersonal" },
        { "text": "Think quietly about the fairest way", "emoji": "🪞", "intelligence": "intrapersonal" },
        { "text": "Sort them by color like sorting leaves by type", "emoji": "🌿", "intelligence": "naturalist" }
      ]
    },
    {
      "id": "el-s-03", "type": "scenario", "intelligence": "spatial",
      "prompt": "Your class is making a treasure map. You want to...",
      "options": [
        { "text": "Draw all the paths and landmarks on it", "emoji": "🗺️", "intelligence": "spatial" },
        { "text": "Add symbols that feel magical and meaningful", "emoji": "✨", "intelligence": "existential" },
        { "text": "Make it on a computer or tablet", "emoji": "💻", "intelligence": "digital" },
        { "text": "Write all the clues and riddles", "emoji": "📖", "intelligence": "linguistic" }
      ]
    },
    {
      "id": "el-s-04", "type": "scenario", "intelligence": "musical",
      "prompt": "At recess, what sounds most fun to you?",
      "options": [
        { "text": "Making up songs or clapping rhythms with friends", "emoji": "🎵", "intelligence": "musical" },
        { "text": "Counting how many times you can jump rope", "emoji": "🔢", "intelligence": "logical" },
        { "text": "Doing cartwheels and relay races", "emoji": "🤸", "intelligence": "bodily" },
        { "text": "Playing with your best friend all day", "emoji": "👥", "intelligence": "interpersonal" }
      ]
    },
    {
      "id": "el-s-05", "type": "scenario", "intelligence": "bodily",
      "prompt": "Your best kind of break from school is...",
      "options": [
        { "text": "Running around or playing a sport", "emoji": "🤸", "intelligence": "bodily" },
        { "text": "Sitting quietly and daydreaming", "emoji": "🪞", "intelligence": "intrapersonal" },
        { "text": "Looking for bugs, flowers, or clouds outside", "emoji": "🌿", "intelligence": "naturalist" },
        { "text": "Wondering about something mysterious", "emoji": "✨", "intelligence": "existential" }
      ]
    },
    {
      "id": "el-s-06", "type": "scenario", "intelligence": "interpersonal",
      "prompt": "A new kid at school looks lonely. You...",
      "options": [
        { "text": "Walk over and ask them to play with you", "emoji": "👥", "intelligence": "interpersonal" },
        { "text": "Show them the cool things you can do on the school iPad", "emoji": "💻", "intelligence": "digital" },
        { "text": "Leave them a friendly note on their desk", "emoji": "📖", "intelligence": "linguistic" },
        { "text": "Think about the best way to include them in the group", "emoji": "🔢", "intelligence": "logical" }
      ]
    },
    {
      "id": "el-s-07", "type": "scenario", "intelligence": "intrapersonal",
      "prompt": "When something upsets you, you feel better by...",
      "options": [
        { "text": "Thinking it through quietly by yourself", "emoji": "🪞", "intelligence": "intrapersonal" },
        { "text": "Drawing or painting how you feel", "emoji": "🎨", "intelligence": "spatial" },
        { "text": "Humming a song that matches your mood", "emoji": "🎵", "intelligence": "musical" },
        { "text": "Running around or playing outside", "emoji": "🤸", "intelligence": "bodily" }
      ]
    },
    {
      "id": "el-s-08", "type": "scenario", "intelligence": "naturalist",
      "prompt": "Outside at recess, you love to...",
      "options": [
        { "text": "Look closely at bugs, plants, and animals", "emoji": "🌿", "intelligence": "naturalist" },
        { "text": "Play games with lots of friends", "emoji": "👥", "intelligence": "interpersonal" },
        { "text": "Wonder why the sky is blue or where clouds come from", "emoji": "✨", "intelligence": "existential" },
        { "text": "Take photos of things with a tablet", "emoji": "💻", "intelligence": "digital" }
      ]
    },
    {
      "id": "el-s-09", "type": "scenario", "intelligence": "existential",
      "prompt": "You wonder most about...",
      "options": [
        { "text": "Why people are alive and what happens when they die", "emoji": "✨", "intelligence": "existential" },
        { "text": "How to describe your feelings in a perfect poem", "emoji": "📖", "intelligence": "linguistic" },
        { "text": "How numbers explain patterns in everything around us", "emoji": "🔢", "intelligence": "logical" },
        { "text": "Where animals go at night and how they find food", "emoji": "🌿", "intelligence": "naturalist" }
      ]
    },
    {
      "id": "el-s-10", "type": "scenario", "intelligence": "digital",
      "prompt": "For show-and-tell, you would bring...",
      "options": [
        { "text": "A cool video or app you made on a device", "emoji": "💻", "intelligence": "digital" },
        { "text": "A song you wrote and want to perform", "emoji": "🎵", "intelligence": "musical" },
        { "text": "Your special journal of drawings and thoughts", "emoji": "🪞", "intelligence": "intrapersonal" },
        { "text": "A collection of cool things you found in nature", "emoji": "🌿", "intelligence": "naturalist" }
      ]
    }
  ],
  "likert": [
    { "id": "el-l-lin-01", "type": "likert", "intelligence": "linguistic", "statement": "I love reading books and stories.", "reverse": false },
    { "id": "el-l-lin-02", "type": "likert", "intelligence": "linguistic", "statement": "I am good at explaining things using words.", "reverse": false },
    { "id": "el-l-lin-03", "type": "likert", "intelligence": "linguistic", "statement": "I enjoy writing stories, poems, or letters.", "reverse": false },
    { "id": "el-l-lin-04", "type": "likert", "intelligence": "linguistic", "statement": "I notice when someone uses a cool or interesting word.", "reverse": false },
    { "id": "el-l-log-01", "type": "likert", "intelligence": "logical", "statement": "I love solving math problems.", "reverse": false },
    { "id": "el-l-log-02", "type": "likert", "intelligence": "logical", "statement": "I like finding patterns in things.", "reverse": false },
    { "id": "el-l-log-03", "type": "likert", "intelligence": "logical", "statement": "I like having clear steps to follow.", "reverse": false },
    { "id": "el-l-log-04", "type": "likert", "intelligence": "logical", "statement": "I enjoy puzzles and brain teasers.", "reverse": false },
    { "id": "el-l-spa-01", "type": "likert", "intelligence": "spatial", "statement": "I can picture things in my head really well.", "reverse": false },
    { "id": "el-l-spa-02", "type": "likert", "intelligence": "spatial", "statement": "I love drawing and making pictures.", "reverse": false },
    { "id": "el-l-spa-03", "type": "likert", "intelligence": "spatial", "statement": "I know where I am and don't get lost easily.", "reverse": false },
    { "id": "el-l-spa-04", "type": "likert", "intelligence": "spatial", "statement": "I like to draw pictures when I am trying to figure something out.", "reverse": false },
    { "id": "el-l-mus-01", "type": "likert", "intelligence": "musical", "statement": "I can remember a song after only hearing it a few times.", "reverse": false },
    { "id": "el-l-mus-02", "type": "likert", "intelligence": "musical", "statement": "Music makes me feel different emotions.", "reverse": false },
    { "id": "el-l-mus-03", "type": "likert", "intelligence": "musical", "statement": "I often hum or tap a beat without thinking about it.", "reverse": false },
    { "id": "el-l-mus-04", "type": "likert", "intelligence": "musical", "statement": "I can tell when something sounds wrong in a song.", "reverse": false },
    { "id": "el-l-bod-01", "type": "likert", "intelligence": "bodily", "statement": "I learn best by doing things with my hands.", "reverse": false },
    { "id": "el-l-bod-02", "type": "likert", "intelligence": "bodily", "statement": "I love sports, dancing, or building things.", "reverse": false },
    { "id": "el-l-bod-03", "type": "likert", "intelligence": "bodily", "statement": "It is hard for me to sit still for a long time.", "reverse": false },
    { "id": "el-l-bod-04", "type": "likert", "intelligence": "bodily", "statement": "I am good at sports and moving my body.", "reverse": false },
    { "id": "el-l-itp-01", "type": "likert", "intelligence": "interpersonal", "statement": "I like working with other kids more than working alone.", "reverse": false },
    { "id": "el-l-itp-02", "type": "likert", "intelligence": "interpersonal", "statement": "I can tell when my friend is sad even if they don't say so.", "reverse": false },
    { "id": "el-l-itp-03", "type": "likert", "intelligence": "interpersonal", "statement": "My friends come to me when they need help or feel sad.", "reverse": false },
    { "id": "el-l-itp-04", "type": "likert", "intelligence": "interpersonal", "statement": "I am good at helping groups work together.", "reverse": false },
    { "id": "el-l-itr-01", "type": "likert", "intelligence": "intrapersonal", "statement": "I think a lot about who I am and what I like.", "reverse": false },
    { "id": "el-l-itr-02", "type": "likert", "intelligence": "intrapersonal", "statement": "I like to work by myself sometimes.", "reverse": false },
    { "id": "el-l-itr-03", "type": "likert", "intelligence": "intrapersonal", "statement": "I know what I am good at and what I need to work on.", "reverse": false },
    { "id": "el-l-itr-04", "type": "likert", "intelligence": "intrapersonal", "statement": "I pay attention to how I am feeling inside.", "reverse": false },
    { "id": "el-l-nat-01", "type": "likert", "intelligence": "naturalist", "statement": "I notice plants, animals, and bugs that others miss.", "reverse": false },
    { "id": "el-l-nat-02", "type": "likert", "intelligence": "naturalist", "statement": "I feel happy and calm when I am outside in nature.", "reverse": false },
    { "id": "el-l-nat-03", "type": "likert", "intelligence": "naturalist", "statement": "I like learning about different animals and plants.", "reverse": false },
    { "id": "el-l-nat-04", "type": "likert", "intelligence": "naturalist", "statement": "I care a lot about taking care of nature.", "reverse": false },
    { "id": "el-l-exi-01", "type": "likert", "intelligence": "existential", "statement": "I wonder why people are alive and what life means.", "reverse": false },
    { "id": "el-l-exi-02", "type": "likert", "intelligence": "existential", "statement": "I think about big questions like fairness and being good.", "reverse": false },
    { "id": "el-l-exi-03", "type": "likert", "intelligence": "existential", "statement": "I like talking about deep ideas.", "reverse": false },
    { "id": "el-l-exi-04", "type": "likert", "intelligence": "existential", "statement": "I think about what it means to be a good person.", "reverse": false },
    { "id": "el-l-dig-01", "type": "likert", "intelligence": "digital", "statement": "I learn new apps and games really fast.", "reverse": false },
    { "id": "el-l-dig-02", "type": "likert", "intelligence": "digital", "statement": "I love making things on a computer or tablet.", "reverse": false },
    { "id": "el-l-dig-03", "type": "likert", "intelligence": "digital", "statement": "I understand how computers and devices work.", "reverse": false },
    { "id": "el-l-dig-04", "type": "likert", "intelligence": "digital", "statement": "I am good at finding things online.", "reverse": false }
  ]
}
```

- [ ] **Step 2: Commit**

```bash
git add data/questions/elementary.json
git commit -m "feat: elementary question bank (50 questions)"
```

---

## Task 8: High School Question Bank

**Files:**
- Create: `data/questions/highschool.json`

- [ ] **Step 1: Create data/questions/highschool.json**

```json
{
  "scenario": [
    {
      "id": "hs-s-01", "type": "scenario", "intelligence": "linguistic",
      "prompt": "For a major group project, you naturally take on...",
      "options": [
        { "text": "Writing and editing — crafting the narrative and explanations", "emoji": "📖", "intelligence": "linguistic" },
        { "text": "Visual design — creating the layout, graphics, and presentation", "emoji": "🗺️", "intelligence": "spatial" },
        { "text": "The soundtrack or audio elements that set the tone", "emoji": "🎵", "intelligence": "musical" },
        { "text": "Hands-on production — building the physical components", "emoji": "🤸", "intelligence": "bodily" }
      ]
    },
    {
      "id": "hs-s-02", "type": "scenario", "intelligence": "logical",
      "prompt": "Your friend group needs to split a complex bill fairly. You...",
      "options": [
        { "text": "Calculate each person's exact share based on what they ordered", "emoji": "🔢", "intelligence": "logical" },
        { "text": "Gauge the vibe of the group and find what everyone agrees on", "emoji": "👥", "intelligence": "interpersonal" },
        { "text": "Think through what feels ethically right to you", "emoji": "🪞", "intelligence": "intrapersonal" },
        { "text": "Suggest a simple equal split — divide like sharing resources in nature", "emoji": "🌿", "intelligence": "naturalist" }
      ]
    },
    {
      "id": "hs-s-03", "type": "scenario", "intelligence": "spatial",
      "prompt": "Your school is redesigning the common area. You...",
      "options": [
        { "text": "Immediately start sketching layout ideas and spatial arrangements", "emoji": "🗺️", "intelligence": "spatial" },
        { "text": "Think about what kind of space creates meaningful community", "emoji": "✨", "intelligence": "existential" },
        { "text": "Research and mockup a design using architecture or design software", "emoji": "💻", "intelligence": "digital" },
        { "text": "Write a proposal describing the vision and its rationale", "emoji": "📖", "intelligence": "linguistic" }
      ]
    },
    {
      "id": "hs-s-04", "type": "scenario", "intelligence": "musical",
      "prompt": "You're studying for finals. Your most effective approach is...",
      "options": [
        { "text": "Creating songs, beats, or rhythmic patterns to memorize key facts", "emoji": "🎵", "intelligence": "musical" },
        { "text": "Building structured outlines and logical concept maps", "emoji": "🔢", "intelligence": "logical" },
        { "text": "Pacing, using flashcards physically, or studying while moving", "emoji": "🤸", "intelligence": "bodily" },
        { "text": "Forming a study group and talking through the material together", "emoji": "👥", "intelligence": "interpersonal" }
      ]
    },
    {
      "id": "hs-s-05", "type": "scenario", "intelligence": "bodily",
      "prompt": "Given a completely free weekend, you'd most naturally...",
      "options": [
        { "text": "Train for a sport, go hiking, or work with your hands on a project", "emoji": "🤸", "intelligence": "bodily" },
        { "text": "Spend extended time in reflection — journaling, meditating, or thinking", "emoji": "🪞", "intelligence": "intrapersonal" },
        { "text": "Spend the whole time outdoors exploring natural environments", "emoji": "🌿", "intelligence": "naturalist" },
        { "text": "Get absorbed in philosophical reading or deep contemplation", "emoji": "✨", "intelligence": "existential" }
      ]
    },
    {
      "id": "hs-s-06", "type": "scenario", "intelligence": "interpersonal",
      "prompt": "Someone in your friend group is clearly struggling. You...",
      "options": [
        { "text": "Reach out directly and have a real conversation about what's going on", "emoji": "👥", "intelligence": "interpersonal" },
        { "text": "Send them a thoughtful message with links to resources that might help", "emoji": "💻", "intelligence": "digital" },
        { "text": "Write them a letter expressing your support", "emoji": "📖", "intelligence": "linguistic" },
        { "text": "Analyze the situation and try to identify a concrete solution", "emoji": "🔢", "intelligence": "logical" }
      ]
    },
    {
      "id": "hs-s-07", "type": "scenario", "intelligence": "intrapersonal",
      "prompt": "When making a major decision about your future, you...",
      "options": [
        { "text": "Spend significant time alone examining your values, fears, and goals", "emoji": "🪞", "intelligence": "intrapersonal" },
        { "text": "Create a visual map of the options and their outcomes", "emoji": "🗺️", "intelligence": "spatial" },
        { "text": "Process your feelings through music — writing or listening", "emoji": "🎵", "intelligence": "musical" },
        { "text": "Work through it physically — running or building something clears your mind", "emoji": "🤸", "intelligence": "bodily" }
      ]
    },
    {
      "id": "hs-s-08", "type": "scenario", "intelligence": "naturalist",
      "prompt": "On a field research trip, you're most engaged when...",
      "options": [
        { "text": "Observing, cataloging, and analyzing the natural environment", "emoji": "🌿", "intelligence": "naturalist" },
        { "text": "Collaborating with peers and sharing discoveries", "emoji": "👥", "intelligence": "interpersonal" },
        { "text": "Thinking about humanity's relationship with the natural world", "emoji": "✨", "intelligence": "existential" },
        { "text": "Documenting everything through photography and data collection", "emoji": "💻", "intelligence": "digital" }
      ]
    },
    {
      "id": "hs-s-09", "type": "scenario", "intelligence": "existential",
      "prompt": "In a philosophy class debate about free will, you...",
      "options": [
        { "text": "Drive the conversation — these questions feel fundamental to you", "emoji": "✨", "intelligence": "existential" },
        { "text": "Craft a carefully structured argument with precise language", "emoji": "📖", "intelligence": "linguistic" },
        { "text": "Systematically break down the logical premises of each position", "emoji": "🔢", "intelligence": "logical" },
        { "text": "Draw a conceptual diagram to map out the different philosophical positions", "emoji": "🗺️", "intelligence": "spatial" }
      ]
    },
    {
      "id": "hs-s-10", "type": "scenario", "intelligence": "digital",
      "prompt": "For your senior capstone project, you choose to...",
      "options": [
        { "text": "Build an interactive app, website, or data visualization", "emoji": "💻", "intelligence": "digital" },
        { "text": "Compose and produce an original music project or podcast", "emoji": "🎵", "intelligence": "musical" },
        { "text": "Write a deeply personal reflective essay or memoir", "emoji": "🪞", "intelligence": "intrapersonal" },
        { "text": "Conduct field research on an environmental topic", "emoji": "🌿", "intelligence": "naturalist" }
      ]
    }
  ],
  "likert": [
    { "id": "hs-l-lin-01", "type": "likert", "intelligence": "linguistic", "statement": "Reading and writing feel like natural extensions of how I think.", "reverse": false },
    { "id": "hs-l-lin-02", "type": "likert", "intelligence": "linguistic", "statement": "I can articulate complex ideas in ways that others understand clearly.", "reverse": false },
    { "id": "hs-l-lin-03", "type": "likert", "intelligence": "linguistic", "statement": "I'm drawn to storytelling, poetry, or analytical writing as creative outlets.", "reverse": false },
    { "id": "hs-l-lin-04", "type": "likert", "intelligence": "linguistic", "statement": "I'm sensitive to how word choice shapes meaning and perception.", "reverse": false },
    { "id": "hs-l-log-01", "type": "likert", "intelligence": "logical", "statement": "I find genuine satisfaction in solving complex mathematical or logical problems.", "reverse": false },
    { "id": "hs-l-log-02", "type": "likert", "intelligence": "logical", "statement": "I instinctively look for underlying patterns and systems in everything.", "reverse": false },
    { "id": "hs-l-log-03", "type": "likert", "intelligence": "logical", "statement": "I'm drawn to evidence-based reasoning and skeptical of unsupported claims.", "reverse": false },
    { "id": "hs-l-log-04", "type": "likert", "intelligence": "logical", "statement": "Abstract thinking and conceptual frameworks come naturally to me.", "reverse": false },
    { "id": "hs-l-spa-01", "type": "likert", "intelligence": "spatial", "statement": "I think in images and spatial relationships as much as in words.", "reverse": false },
    { "id": "hs-l-spa-02", "type": "likert", "intelligence": "spatial", "statement": "Art, design, architecture, or visual media genuinely captivates me.", "reverse": false },
    { "id": "hs-l-spa-03", "type": "likert", "intelligence": "spatial", "statement": "I can navigate new spaces quickly and have a strong sense of direction.", "reverse": false },
    { "id": "hs-l-spa-04", "type": "likert", "intelligence": "spatial", "statement": "I often sketch or visualize ideas before I can articulate them verbally.", "reverse": false },
    { "id": "hs-l-mus-01", "type": "likert", "intelligence": "musical", "statement": "Music is a core part of how I process emotions and experiences.", "reverse": false },
    { "id": "hs-l-mus-02", "type": "likert", "intelligence": "musical", "statement": "I have a refined ear — I notice subtle details in rhythm, melody, and harmony.", "reverse": false },
    { "id": "hs-l-mus-03", "type": "likert", "intelligence": "musical", "statement": "Creating or performing music is one of the most natural forms of expression for me.", "reverse": false },
    { "id": "hs-l-mus-04", "type": "likert", "intelligence": "musical", "statement": "The emotional and structural complexity of music is something I deeply appreciate.", "reverse": false },
    { "id": "hs-l-bod-01", "type": "likert", "intelligence": "bodily", "statement": "I learn and retain information best through physical experience and doing.", "reverse": false },
    { "id": "hs-l-bod-02", "type": "likert", "intelligence": "bodily", "statement": "Physical pursuits — sports, dance, building, or craftsmanship — are central to who I am.", "reverse": false },
    { "id": "hs-l-bod-03", "type": "likert", "intelligence": "bodily", "statement": "My body is an important tool for thinking and problem-solving.", "reverse": false },
    { "id": "hs-l-bod-04", "type": "likert", "intelligence": "bodily", "statement": "I feel most alive and focused when I'm physically engaged in something.", "reverse": false },
    { "id": "hs-l-itp-01", "type": "likert", "intelligence": "interpersonal", "statement": "I'm deeply attuned to the emotional states and motivations of people around me.", "reverse": false },
    { "id": "hs-l-itp-02", "type": "likert", "intelligence": "interpersonal", "statement": "I'm naturally drawn to leadership, mentorship, or collaborative team dynamics.", "reverse": false },
    { "id": "hs-l-itp-03", "type": "likert", "intelligence": "interpersonal", "statement": "People frequently seek me out for perspective, advice, or emotional support.", "reverse": false },
    { "id": "hs-l-itp-04", "type": "likert", "intelligence": "interpersonal", "statement": "I find genuine energy and insight in human connection and group dynamics.", "reverse": false },
    { "id": "hs-l-itr-01", "type": "likert", "intelligence": "intrapersonal", "statement": "Self-knowledge — understanding my values, fears, and motivations — is something I actively pursue.", "reverse": false },
    { "id": "hs-l-itr-02", "type": "likert", "intelligence": "intrapersonal", "statement": "I'm most productive and creative when I have significant uninterrupted time alone.", "reverse": false },
    { "id": "hs-l-itr-03", "type": "likert", "intelligence": "intrapersonal", "statement": "I have a strong, clear sense of personal identity and what I stand for.", "reverse": false },
    { "id": "hs-l-itr-04", "type": "likert", "intelligence": "intrapersonal", "statement": "Inner reflection — through journaling, meditation, or contemplation — is a regular practice.", "reverse": false },
    { "id": "hs-l-nat-01", "type": "likert", "intelligence": "naturalist", "statement": "I have a deep, genuine connection to the natural world and its patterns.", "reverse": false },
    { "id": "hs-l-nat-02", "type": "likert", "intelligence": "naturalist", "statement": "Time in natural environments fundamentally restores and recharges me.", "reverse": false },
    { "id": "hs-l-nat-03", "type": "likert", "intelligence": "naturalist", "statement": "I'm drawn to ecology, biology, environmental science, or conservation.", "reverse": false },
    { "id": "hs-l-nat-04", "type": "likert", "intelligence": "naturalist", "statement": "The environmental crisis feels like a deeply personal and urgent concern to me.", "reverse": false },
    { "id": "hs-l-exi-01", "type": "likert", "intelligence": "existential", "statement": "I'm genuinely preoccupied with questions about consciousness, mortality, and meaning.", "reverse": false },
    { "id": "hs-l-exi-02", "type": "likert", "intelligence": "existential", "statement": "Philosophy, theology, or ethics aren't just academic — they feel personally essential.", "reverse": false },
    { "id": "hs-l-exi-03", "type": "likert", "intelligence": "existential", "statement": "I need my work and life to connect to something larger than individual success.", "reverse": false },
    { "id": "hs-l-exi-04", "type": "likert", "intelligence": "existential", "statement": "Questions about the nature of reality, time, and existence genuinely energize me.", "reverse": false },
    { "id": "hs-l-dig-01", "type": "likert", "intelligence": "digital", "statement": "I pick up new technologies intuitively and enjoy exploring what they can do.", "reverse": false },
    { "id": "hs-l-dig-02", "type": "likert", "intelligence": "digital", "statement": "Creating with digital tools — coding, design, video, or data — is genuinely satisfying.", "reverse": false },
    { "id": "hs-l-dig-03", "type": "likert", "intelligence": "digital", "statement": "I think naturally in terms of systems, algorithms, and digital structures.", "reverse": false },
    { "id": "hs-l-dig-04", "type": "likert", "intelligence": "digital", "statement": "I'm thoughtful about how technology shapes society, knowledge, and human behavior.", "reverse": false }
  ]
}
```

- [ ] **Step 2: Commit**

```bash
git add data/questions/highschool.json
git commit -m "feat: high school question bank (50 questions)"
```

---

## Task 9: Adult Question Bank

**Files:**
- Create: `data/questions/adult.json`

- [ ] **Step 1: Create data/questions/adult.json**

```json
{
  "scenario": [
    {
      "id": "ad-s-01", "type": "scenario", "intelligence": "linguistic",
      "prompt": "On a high-stakes work project, you naturally gravitate toward...",
      "options": [
        { "text": "Owning the written deliverables — reports, proposals, and narratives", "emoji": "📖", "intelligence": "linguistic" },
        { "text": "Designing the visual presentation and data visualization", "emoji": "🗺️", "intelligence": "spatial" },
        { "text": "Shaping the tone and rhythm of how the message lands", "emoji": "🎵", "intelligence": "musical" },
        { "text": "Prototyping, building, and hands-on execution", "emoji": "🤸", "intelligence": "bodily" }
      ]
    },
    {
      "id": "ad-s-02", "type": "scenario", "intelligence": "logical",
      "prompt": "When facing a complex strategic decision at work, you...",
      "options": [
        { "text": "Build a structured framework — data, criteria, and weighted trade-offs", "emoji": "🔢", "intelligence": "logical" },
        { "text": "Read the stakeholders and build consensus before deciding", "emoji": "👥", "intelligence": "interpersonal" },
        { "text": "Spend time in deep reflection to clarify your values and priorities", "emoji": "🪞", "intelligence": "intrapersonal" },
        { "text": "Look for patterns from precedent — what has history or nature shown?", "emoji": "🌿", "intelligence": "naturalist" }
      ]
    },
    {
      "id": "ad-s-03", "type": "scenario", "intelligence": "spatial",
      "prompt": "Your team needs to rethink the office workspace. You...",
      "options": [
        { "text": "Immediately start sketching floor plans and visualizing the flow", "emoji": "🗺️", "intelligence": "spatial" },
        { "text": "Ask deeper questions: what kind of culture do we want this space to reflect?", "emoji": "✨", "intelligence": "existential" },
        { "text": "Research and prototype using design tools or virtual floor plan software", "emoji": "💻", "intelligence": "digital" },
        { "text": "Write a brief outlining the vision, principles, and rationale", "emoji": "📖", "intelligence": "linguistic" }
      ]
    },
    {
      "id": "ad-s-04", "type": "scenario", "intelligence": "musical",
      "prompt": "To decompress after an intense work week, you most naturally...",
      "options": [
        { "text": "Play, listen to, or create music — it resets you completely", "emoji": "🎵", "intelligence": "musical" },
        { "text": "Tackle a puzzle, a side project, or something analytically engaging", "emoji": "🔢", "intelligence": "logical" },
        { "text": "Train, hike, cook, or work with your hands — physical activity restores you", "emoji": "🤸", "intelligence": "bodily" },
        { "text": "Gather with people you care about — social energy recharges you", "emoji": "👥", "intelligence": "interpersonal" }
      ]
    },
    {
      "id": "ad-s-05", "type": "scenario", "intelligence": "bodily",
      "prompt": "Your ideal professional development experience would be...",
      "options": [
        { "text": "A hands-on workshop, field experience, or active simulation", "emoji": "🤸", "intelligence": "bodily" },
        { "text": "A solo retreat for deep reflection and personal clarity", "emoji": "🪞", "intelligence": "intrapersonal" },
        { "text": "An immersive outdoor experience connecting work to the natural world", "emoji": "🌿", "intelligence": "naturalist" },
        { "text": "A philosophical or values-based retreat on leadership and meaning", "emoji": "✨", "intelligence": "existential" }
      ]
    },
    {
      "id": "ad-s-06", "type": "scenario", "intelligence": "interpersonal",
      "prompt": "A colleague is visibly struggling in a meeting. You...",
      "options": [
        { "text": "Catch their eye, create space for them, and check in afterward", "emoji": "👥", "intelligence": "interpersonal" },
        { "text": "Send a supportive message with relevant resources after the meeting", "emoji": "💻", "intelligence": "digital" },
        { "text": "Follow up with a thoughtful written note or email", "emoji": "📖", "intelligence": "linguistic" },
        { "text": "Identify what's causing the difficulty and propose a structural fix", "emoji": "🔢", "intelligence": "logical" }
      ]
    },
    {
      "id": "ad-s-07", "type": "scenario", "intelligence": "intrapersonal",
      "prompt": "When navigating a major career transition, you rely most on...",
      "options": [
        { "text": "Deep inner work — values clarification, journaling, and extended reflection", "emoji": "🪞", "intelligence": "intrapersonal" },
        { "text": "Mapping options visually and creating structured diagrams of possibilities", "emoji": "🗺️", "intelligence": "spatial" },
        { "text": "Processing the transition emotionally through music and creative outlets", "emoji": "🎵", "intelligence": "musical" },
        { "text": "Physical activity and hands-on projects that keep you grounded", "emoji": "🤸", "intelligence": "bodily" }
      ]
    },
    {
      "id": "ad-s-08", "type": "scenario", "intelligence": "naturalist",
      "prompt": "In your professional life, you're most drawn to work that...",
      "options": [
        { "text": "Connects to natural systems — sustainability, ecology, or living environments", "emoji": "🌿", "intelligence": "naturalist" },
        { "text": "Centers on human connection, community, and collective well-being", "emoji": "👥", "intelligence": "interpersonal" },
        { "text": "Addresses fundamental questions about meaning, justice, or purpose", "emoji": "✨", "intelligence": "existential" },
        { "text": "Leverages technology to scale impact and solve systemic problems", "emoji": "💻", "intelligence": "digital" }
      ]
    },
    {
      "id": "ad-s-09", "type": "scenario", "intelligence": "existential",
      "prompt": "When evaluating whether to take a new role, your primary question is...",
      "options": [
        { "text": "Does this work matter — does it connect to something meaningful?", "emoji": "✨", "intelligence": "existential" },
        { "text": "Can I craft narratives and ideas that genuinely move people?", "emoji": "📖", "intelligence": "linguistic" },
        { "text": "Does the strategy make sense — is there a clear, logical path to impact?", "emoji": "🔢", "intelligence": "logical" },
        { "text": "Can I shape how things look, feel, and function in the world?", "emoji": "🗺️", "intelligence": "spatial" }
      ]
    },
    {
      "id": "ad-s-10", "type": "scenario", "intelligence": "digital",
      "prompt": "In your ideal role, you would spend significant time...",
      "options": [
        { "text": "Building systems, tools, or platforms that create scale and leverage", "emoji": "💻", "intelligence": "digital" },
        { "text": "Creating or curating content with strong aesthetic and emotional resonance", "emoji": "🎵", "intelligence": "musical" },
        { "text": "Doing deep, focused individual work with significant autonomy", "emoji": "🪞", "intelligence": "intrapersonal" },
        { "text": "Working directly with natural environments or living systems", "emoji": "🌿", "intelligence": "naturalist" }
      ]
    }
  ],
  "likert": [
    { "id": "ad-l-lin-01", "type": "likert", "intelligence": "linguistic", "statement": "Written and verbal communication are genuine professional strengths of mine.", "reverse": false },
    { "id": "ad-l-lin-02", "type": "likert", "intelligence": "linguistic", "statement": "I can adapt my language and communication style for different audiences and contexts.", "reverse": false },
    { "id": "ad-l-lin-03", "type": "likert", "intelligence": "linguistic", "statement": "I gravitate toward roles that involve crafting narratives, explanations, or persuasive content.", "reverse": false },
    { "id": "ad-l-lin-04", "type": "likert", "intelligence": "linguistic", "statement": "Language patterns — in literature, media, law, or rhetoric — consistently engage my attention.", "reverse": false },
    { "id": "ad-l-log-01", "type": "likert", "intelligence": "logical", "statement": "Quantitative analysis, systems thinking, and logical frameworks are core to how I work.", "reverse": false },
    { "id": "ad-l-log-02", "type": "likert", "intelligence": "logical", "statement": "I'm drawn to roles involving strategy, data, research, or complex problem-solving.", "reverse": false },
    { "id": "ad-l-log-03", "type": "likert", "intelligence": "logical", "statement": "I evaluate claims rigorously and naturally look for evidence before drawing conclusions.", "reverse": false },
    { "id": "ad-l-log-04", "type": "likert", "intelligence": "logical", "statement": "I find genuine intellectual satisfaction in deconstructing complex problems into components.", "reverse": false },
    { "id": "ad-l-spa-01", "type": "likert", "intelligence": "spatial", "statement": "Visual thinking — design, architecture, mapping, or data visualization — is a professional strength.", "reverse": false },
    { "id": "ad-l-spa-02", "type": "likert", "intelligence": "spatial", "statement": "I'm attuned to aesthetics, spatial relationships, and how things look and feel.", "reverse": false },
    { "id": "ad-l-spa-03", "type": "likert", "intelligence": "spatial", "statement": "In my best work, I'm translating ideas into visual or spatial form.", "reverse": false },
    { "id": "ad-l-spa-04", "type": "likert", "intelligence": "spatial", "statement": "I navigate new environments quickly and have a strong intuitive sense of space.", "reverse": false },
    { "id": "ad-l-mus-01", "type": "likert", "intelligence": "musical", "statement": "Music is not a hobby — it's a fundamental part of how I process and create.", "reverse": false },
    { "id": "ad-l-mus-02", "type": "likert", "intelligence": "musical", "statement": "I'm deeply sensitive to rhythm, cadence, and the emotional texture of sound.", "reverse": false },
    { "id": "ad-l-mus-03", "type": "likert", "intelligence": "musical", "statement": "I bring a musician's ear for pattern, structure, and timing to my professional work.", "reverse": false },
    { "id": "ad-l-mus-04", "type": "likert", "intelligence": "musical", "statement": "Creating, performing, or analyzing music is one of my most authentic modes of expression.", "reverse": false },
    { "id": "ad-l-bod-01", "type": "likert", "intelligence": "bodily", "statement": "Physical craft — athletic, culinary, surgical, or artisanal — is central to my professional identity.", "reverse": false },
    { "id": "ad-l-bod-02", "type": "likert", "intelligence": "bodily", "statement": "I do my best thinking and problem-solving when physically engaged.", "reverse": false },
    { "id": "ad-l-bod-03", "type": "likert", "intelligence": "bodily", "statement": "Hands-on execution and embodied skill are where I add the most distinctive value.", "reverse": false },
    { "id": "ad-l-bod-04", "type": "likert", "intelligence": "bodily", "statement": "Kinesthetic learning — learning by doing — has always been my most effective mode.", "reverse": false },
    { "id": "ad-l-itp-01", "type": "likert", "intelligence": "interpersonal", "statement": "Reading people, building trust, and navigating complex human dynamics are core professional skills.", "reverse": false },
    { "id": "ad-l-itp-02", "type": "likert", "intelligence": "interpersonal", "statement": "I thrive in roles involving leadership, facilitation, coaching, or stakeholder management.", "reverse": false },
    { "id": "ad-l-itp-03", "type": "likert", "intelligence": "interpersonal", "statement": "I have a track record of building effective teams and resolving interpersonal conflict.", "reverse": false },
    { "id": "ad-l-itp-04", "type": "likert", "intelligence": "interpersonal", "statement": "Emotional intelligence is something I actively develop and apply in professional relationships.", "reverse": false },
    { "id": "ad-l-itr-01", "type": "likert", "intelligence": "intrapersonal", "statement": "Self-awareness — knowing my values, triggers, and growth edges — is a professional priority.", "reverse": false },
    { "id": "ad-l-itr-02", "type": "likert", "intelligence": "intrapersonal", "statement": "I do my best work with significant autonomy, clear personal ownership, and time to think.", "reverse": false },
    { "id": "ad-l-itr-03", "type": "likert", "intelligence": "intrapersonal", "statement": "I have a strong, stable sense of professional identity and the type of work that fulfills me.", "reverse": false },
    { "id": "ad-l-itr-04", "type": "likert", "intelligence": "intrapersonal", "statement": "Reflective practices — journaling, coaching, therapy, or meditation — are part of my professional toolkit.", "reverse": false },
    { "id": "ad-l-nat-01", "type": "likert", "intelligence": "naturalist", "statement": "Work connected to natural systems, living environments, or ecological thinking energizes me.", "reverse": false },
    { "id": "ad-l-nat-02", "type": "likert", "intelligence": "naturalist", "statement": "I notice environmental patterns and systemic relationships that others often overlook.", "reverse": false },
    { "id": "ad-l-nat-03", "type": "likert", "intelligence": "naturalist", "statement": "Sustainability, conservation, or human-nature relationships are professionally meaningful to me.", "reverse": false },
    { "id": "ad-l-nat-04", "type": "likert", "intelligence": "naturalist", "statement": "The natural world has been a consistent source of insight, restoration, and inspiration throughout my career.", "reverse": false },
    { "id": "ad-l-exi-01", "type": "likert", "intelligence": "existential", "statement": "Purpose and meaning are non-negotiable criteria when I evaluate professional opportunities.", "reverse": false },
    { "id": "ad-l-exi-02", "type": "likert", "intelligence": "existential", "statement": "I'm drawn to work at the intersection of ethics, philosophy, and human well-being.", "reverse": false },
    { "id": "ad-l-exi-03", "type": "likert", "intelligence": "existential", "statement": "Questions about what makes a life well-lived shape my professional choices.", "reverse": false },
    { "id": "ad-l-exi-04", "type": "likert", "intelligence": "existential", "statement": "I need my work to contribute to something larger than organizational metrics or personal advancement.", "reverse": false },
    { "id": "ad-l-dig-01", "type": "likert", "intelligence": "digital", "statement": "Technology fluency and digital systems thinking are core professional competencies of mine.", "reverse": false },
    { "id": "ad-l-dig-02", "type": "likert", "intelligence": "digital", "statement": "I'm drawn to roles involving software, data, automation, or digital product development.", "reverse": false },
    { "id": "ad-l-dig-03", "type": "likert", "intelligence": "digital", "statement": "I pick up new platforms and tools quickly and enjoy the process of mastering them.", "reverse": false },
    { "id": "ad-l-dig-04", "type": "likert", "intelligence": "digital", "statement": "I think carefully about how technology shapes culture, power, and human experience.", "reverse": false }
  ]
}
```

- [ ] **Step 2: Commit**

```bash
git add data/questions/adult.json
git commit -m "feat: adult question bank (50 questions)"
```


---

## Task 10: Question Quality Review

**Files:**
- Read: `data/questions/elementary.json`, `data/questions/middle.json`, `data/questions/highschool.json`, `data/questions/adult.json`
- Create: `scripts/validate-questions.ts`

This task verifies that every question bank is age-appropriate, psychometrically sound, and structurally correct before any UI is built on top of it.

- [ ] **Step 1: Run automated JSON structure validation**

Create `scripts/validate-questions.ts`:

```typescript
// scripts/validate-questions.ts
// Run with: npx ts-node scripts/validate-questions.ts

import fs from 'fs'
import path from 'path'

const TIERS = ['elementary', 'middle', 'highschool', 'adult'] as const
const INTELLIGENCE_KEYS = [
  'linguistic','logical','spatial','musical','bodily',
  'interpersonal','intrapersonal','naturalist','existential','digital'
] as const

let errors = 0
function fail(msg: string) { console.error(`  ❌ ${msg}`); errors++ }
function pass(msg: string) { console.log(`  ✓  ${msg}`) }

for (const tier of TIERS) {
  console.log(`\n── ${tier.toUpperCase()} ────────────────────`)
  const filePath = path.join('data', 'questions', `${tier}.json`)
  const raw = JSON.parse(fs.readFileSync(filePath, 'utf-8'))

  // Check counts
  if (raw.scenario.length !== 10)
    fail(`Expected 10 scenario questions, got ${raw.scenario.length}`)
  else pass('10 scenario questions')

  if (raw.likert.length !== 40)
    fail(`Expected 40 Likert questions, got ${raw.likert.length}`)
  else pass('40 Likert questions')

  // Check all IDs are unique
  const allIds = [...raw.scenario, ...raw.likert].map((q: any) => q.id)
  const uniqueIds = new Set(allIds)
  if (uniqueIds.size !== allIds.length)
    fail(`Duplicate IDs found: ${allIds.filter((id: string, i: number) => allIds.indexOf(id) !== i)}`)
  else pass('All IDs unique')

  // Check scenario option distribution (each intelligence should appear exactly 4 times)
  const optionCounts: Record<string, number> = Object.fromEntries(INTELLIGENCE_KEYS.map(k => [k, 0]))
  for (const q of raw.scenario) {
    if (q.options.length !== 4)
      fail(`Question ${q.id}: expected 4 options, got ${q.options.length}`)
    for (const opt of q.options) {
      if (!INTELLIGENCE_KEYS.includes(opt.intelligence))
        fail(`Question ${q.id}: unknown intelligence "${opt.intelligence}"`)
      optionCounts[opt.intelligence]++
    }
  }
  const badCounts = Object.entries(optionCounts).filter(([, c]) => c !== 4)
  if (badCounts.length > 0)
    fail(`Uneven option distribution: ${badCounts.map(([k,c]) => `${k}=${c}`).join(', ')}`)
  else pass('Each intelligence appears exactly 4 times in scenario options')

  // Check each scenario question's anchor intelligence appears in its own options
  for (const q of raw.scenario) {
    const optIntelligences = q.options.map((o: any) => o.intelligence)
    if (!optIntelligences.includes(q.intelligence))
      fail(`Scenario ${q.id}: anchor intelligence "${q.intelligence}" not present in options`)
  }
  pass('Every scenario question has its anchor intelligence as one option')

  // Check Likert coverage (each intelligence has exactly 4 Likert items)
  const likertCounts: Record<string, number> = Object.fromEntries(INTELLIGENCE_KEYS.map(k => [k, 0]))
  for (const q of raw.likert) {
    if (!INTELLIGENCE_KEYS.includes(q.intelligence))
      fail(`Likert ${q.id}: unknown intelligence "${q.intelligence}"`)
    likertCounts[q.intelligence]++
  }
  const badLikert = Object.entries(likertCounts).filter(([, c]) => c !== 4)
  if (badLikert.length > 0)
    fail(`Uneven Likert distribution: ${badLikert.map(([k,c]) => `${k}=${c}`).join(', ')}`)
  else pass('Each intelligence has exactly 4 Likert statements')

  // Check all required fields present
  for (const q of raw.scenario) {
    if (!q.id || !q.prompt || !q.options) fail(`Scenario ${q.id}: missing required fields`)
    for (const opt of q.options) {
      if (!opt.text || !opt.emoji || !opt.intelligence)
        fail(`Option in ${q.id}: missing text, emoji, or intelligence`)
    }
  }
  for (const q of raw.likert) {
    if (!q.id || !q.statement || typeof q.reverse !== 'boolean')
      fail(`Likert ${q.id}: missing required fields`)
  }
  pass('All required fields present')
}

console.log(`\n${errors === 0 ? '✅ All checks passed' : `❌ ${errors} error(s) found — fix before proceeding`}`)
process.exit(errors > 0 ? 1 : 0)
```

Run it:
```bash
npx ts-node --project tsconfig.json scripts/validate-questions.ts
```

Expected: All checks pass for all 4 tiers. Fix any failures before proceeding.

- [ ] **Step 2: Manual age-appropriateness review — Elementary**

Open `data/questions/elementary.json`. For each of the 10 scenario questions, verify:
- [ ] Vocabulary is K-5 level (no words beyond ~4th grade reading level)
- [ ] Scenarios are relatable to ages 5–10 (home, school, playground, hobbies)
- [ ] Each option is clearly distinct and a real choice a child would make
- [ ] Emoji choices accurately represent the action described

For each of the 40 Likert statements, verify:
- [ ] Statements are first-person ("I like...", "I enjoy...", "I find it easy to...")
- [ ] Vocabulary is accessible (no abstract jargon)
- [ ] Each statement maps unambiguously to one intelligence
- [ ] No statement could equally apply to two different intelligences

Flag any issues in a comment at the top of the file. Revise and re-run Step 1 after any edits.

- [ ] **Step 3: Manual age-appropriateness review — Middle School**

Open `data/questions/middle.json`. For each scenario question, verify:
- [ ] Scenarios reference school/social contexts meaningful to grades 6–8 (group projects, social dynamics, extracurriculars)
- [ ] Tone is casual and peer-relatable, not clinical
- [ ] No scenario assumes a specific socioeconomic background

For each Likert statement, verify:
- [ ] Framing is self-reflective without being overly introspective for this age
- [ ] No statements that could feel pressuring or shame-inducing

- [ ] **Step 4: Manual age-appropriateness review — High School**

Open `data/questions/highschool.json`. For each scenario question, verify:
- [ ] Scenarios reference identity, future-thinking, and real-world application
- [ ] Questions feel like genuine self-reflection prompts, not quizzes
- [ ] Career references are exploratory, not prescriptive

For each Likert statement, verify:
- [ ] First-person framing is consistent throughout ("I tend to...", "I am...")
- [ ] Statements distinguish high school experience from adult professional life

- [ ] **Step 5: Manual age-appropriateness review — Adult**

Open `data/questions/adult.json`. For each scenario question, verify:
- [ ] Scenarios are workplace/professional or adult life contexts
- [ ] No scenario assumes a specific career already exists (some adults are exploring)
- [ ] College students and career-changers would find the scenarios accessible

For each Likert statement, verify:
- [ ] Professional framing is appropriate but not exclusionary
- [ ] Statements are specific enough to discriminate between intelligences clearly

- [ ] **Step 6: Cross-tier intelligence alignment check**

For each intelligence, read one question from each tier for that intelligence side-by-side. Verify:
- The same underlying construct is being measured across all 4 tiers
- The difficulty/sophistication scales appropriately from elementary → adult
- No question from one tier is essentially a copy of a question from another tier

Tiers × Intelligences to check (10 rows, 4 columns):

| Intelligence | Elementary | Middle | High School | Adult |
|---|---|---|---|---|
| Linguistic | el-s-01 | ms-s-01 | hs-s-01 | ad-s-01 |
| Logical | el-s-02 | ms-s-02 | hs-s-02 | ad-s-02 |
| Spatial | el-s-03 | ms-s-03 | hs-s-03 | ad-s-03 |
| Musical | el-s-04 | ms-s-04 | hs-s-04 | ad-s-04 |
| Bodily | el-s-05 | ms-s-05 | hs-s-05 | ad-s-05 |
| Interpersonal | el-s-06 | ms-s-06 | hs-s-06 | ad-s-06 |
| Intrapersonal | el-s-07 | ms-s-07 | hs-s-07 | ad-s-07 |
| Naturalist | el-s-08 | ms-s-08 | hs-s-08 | ad-s-08 |
| Existential | el-s-09 | ms-s-09 | hs-s-09 | ad-s-09 |
| Digital | el-s-10 | ms-s-10 | hs-s-10 | ad-s-10 |

- [ ] **Step 7: Commit validated question banks**

After all reviews pass with no open issues:

```bash
git add data/questions/ scripts/validate-questions.ts
git commit -m "chore: question quality review + validation script"
```

---

## Task 11: Recommendations Data

**Files:**
- Create: `data/recommendations/elementary.json`
- Create: `data/recommendations/middle.json`
- Create: `data/recommendations/highschool.json`
- Create: `data/recommendations/adult.json`

Each file is keyed by `IntelligenceKey`. Each entry has: `characterDescription` (shown in hero), `learningStrategies` (array of strings), `careerPaths` (array of strings), `subjects` (array of strings).

- [ ] **Step 1: Create data/recommendations/elementary.json**

```json
{
  "linguistic": {
    "characterDescription": "You love words, stories, and the magic of language.",
    "learningStrategies": ["Read aloud to yourself", "Write stories about what you learn", "Play word games and puzzles", "Use rhymes to remember facts"],
    "careerPaths": ["Author", "Teacher", "Journalist", "Librarian", "Storyteller"],
    "subjects": ["Reading", "Writing", "Language Arts", "Drama", "Social Studies"]
  },
  "logical": {
    "characterDescription": "You love figuring things out and solving puzzles.",
    "learningStrategies": ["Use charts and organized notes", "Look for patterns in what you study", "Try math games and logic puzzles", "Ask 'why' and 'how' questions"],
    "careerPaths": ["Scientist", "Engineer", "Computer Programmer", "Mathematician", "Doctor"],
    "subjects": ["Math", "Science", "Coding", "Chess Club", "Logic Puzzles"]
  },
  "spatial": {
    "characterDescription": "You think in pictures and love making things look amazing.",
    "learningStrategies": ["Draw pictures and diagrams to learn", "Use color-coded notes", "Build models of what you study", "Watch videos that show things visually"],
    "careerPaths": ["Artist", "Architect", "Game Designer", "Illustrator", "Animator"],
    "subjects": ["Art", "Geometry", "Science", "Geography", "Design"]
  },
  "musical": {
    "characterDescription": "You hear the world in rhythms, melodies, and beats.",
    "learningStrategies": ["Set facts to music or rhymes", "Study with background music", "Clap or tap rhythms to memorize things", "Create songs about what you learn"],
    "careerPaths": ["Musician", "Music Teacher", "Songwriter", "Music Producer", "Conductor"],
    "subjects": ["Music", "Band", "Choir", "Dance", "Drama"]
  },
  "bodily": {
    "characterDescription": "You learn best when you're moving and doing things with your hands.",
    "learningStrategies": ["Take movement breaks while studying", "Act out what you're learning", "Build or make things to understand concepts", "Study standing up or walking"],
    "careerPaths": ["Athlete", "Physical Therapist", "Chef", "Dancer", "Builder"],
    "subjects": ["PE", "Art", "Science Labs", "Drama", "Woodworking"]
  },
  "interpersonal": {
    "characterDescription": "You have a gift for understanding people and making friends.",
    "learningStrategies": ["Study in groups", "Teach what you know to a friend", "Use role-playing to understand different perspectives", "Join clubs and team activities"],
    "careerPaths": ["Teacher", "Counselor", "Community Leader", "Social Worker", "Coach"],
    "subjects": ["Social Studies", "Language Arts", "Drama", "Community Service", "Health"]
  },
  "intrapersonal": {
    "characterDescription": "You know yourself well and love quiet time to think and dream.",
    "learningStrategies": ["Keep a learning journal", "Set personal goals before each study session", "Reflect on what you learned at the end of each day", "Choose topics that connect to your interests"],
    "careerPaths": ["Writer", "Counselor", "Researcher", "Entrepreneur", "Therapist"],
    "subjects": ["Writing", "Reading", "Art", "Independent Projects", "Social Studies"]
  },
  "naturalist": {
    "characterDescription": "You notice animals, plants, and patterns in the natural world.",
    "learningStrategies": ["Learn outside when possible", "Collect and categorize natural objects", "Connect lessons to nature examples", "Keep a nature journal with drawings"],
    "careerPaths": ["Biologist", "Zookeeper", "Park Ranger", "Vet", "Environmental Scientist"],
    "subjects": ["Science", "Nature Studies", "Geography", "Art", "Gardening Club"]
  },
  "existential": {
    "characterDescription": "You ask big questions about life and love thinking deeply.",
    "learningStrategies": ["Connect learning to big 'why' questions", "Read stories with deep meanings", "Journal about what you wonder about", "Discuss ideas with trusted adults"],
    "careerPaths": ["Philosopher", "Minister", "Counselor", "Author", "Educator"],
    "subjects": ["Reading", "Social Studies", "Art", "Philosophy for Kids", "Writing"]
  },
  "digital": {
    "characterDescription": "You love computers, apps, and figuring out how technology works.",
    "learningStrategies": ["Use educational apps and games to learn", "Create digital projects about topics you study", "Watch how-to videos and tutorials", "Try coding games like Scratch"],
    "careerPaths": ["Software Developer", "Game Designer", "Robotics Engineer", "Digital Artist", "Tech Inventor"],
    "subjects": ["Computer Science", "Math", "Science", "Coding Club", "Digital Art"]
  }
}
```

- [ ] **Step 2: Create data/recommendations/middle.json**

```json
{
  "linguistic": {
    "characterDescription": "Language is your superpower — you think in words and communicate with impact.",
    "learningStrategies": ["Rewrite notes in your own words", "Join debate club or creative writing", "Record yourself explaining concepts", "Read widely across genres"],
    "careerPaths": ["Journalist", "Author", "Lawyer", "Editor", "Speech-Language Pathologist", "Marketing Copywriter"],
    "subjects": ["English/ELA", "History", "Drama", "Debate", "Foreign Languages"]
  },
  "logical": {
    "characterDescription": "You love patterns, puzzles, and the satisfaction of finding the right answer.",
    "learningStrategies": ["Organize notes into flowcharts or diagrams", "Work through practice problems before asking for help", "Code simple programs to test ideas", "Use apps like Khan Academy for structured learning"],
    "careerPaths": ["Engineer", "Data Scientist", "Doctor", "Accountant", "Programmer", "Mathematician"],
    "subjects": ["Math", "Science", "Computer Science", "Economics", "Logic/Philosophy"]
  },
  "spatial": {
    "characterDescription": "You see the world in vivid images and can visualize things others can't.",
    "learningStrategies": ["Mind-map your notes", "Use diagrams and infographics", "Sketch concepts before writing about them", "Watch documentaries that show things visually"],
    "careerPaths": ["Architect", "Graphic Designer", "Animator", "Surgeon", "Game Developer", "Urban Planner"],
    "subjects": ["Art", "Geometry", "Geography", "Design/Maker", "Photography"]
  },
  "musical": {
    "characterDescription": "You feel rhythm and melody everywhere — music is how you think.",
    "learningStrategies": ["Create songs or raps to memorize formulas or timelines", "Use rhythmic pattern-reading for studying", "Study with instrumental music", "Join band, choir, or music production"],
    "careerPaths": ["Musician", "Music Producer", "Film Composer", "Music Educator", "Sound Designer"],
    "subjects": ["Music", "Band/Orchestra", "Choir", "Drama", "Media Arts"]
  },
  "bodily": {
    "characterDescription": "You learn by doing, building, and moving — your body is part of your brain.",
    "learningStrategies": ["Take frequent study breaks to move", "Build models or use props to explain concepts", "Act out historical events or science processes", "Type notes instead of handwriting if that helps you focus"],
    "careerPaths": ["Physical Therapist", "Athlete", "Chef", "Surgeon", "Choreographer", "Craftsperson"],
    "subjects": ["PE", "Science Labs", "Maker/Tech Ed", "Drama", "Art"]
  },
  "interpersonal": {
    "characterDescription": "You read people naturally and bring groups together.",
    "learningStrategies": ["Form study groups and take the lead", "Teach concepts to classmates to solidify your understanding", "Volunteer for group projects and leadership roles", "Use discussion-based learning whenever possible"],
    "careerPaths": ["Counselor", "Teacher", "Social Worker", "Manager", "Community Organizer", "Politician"],
    "subjects": ["Social Studies", "Health", "Drama", "Leadership", "Community Service"]
  },
  "intrapersonal": {
    "characterDescription": "You know yourself deeply and work best with independence and purpose.",
    "learningStrategies": ["Keep a study journal tracking what clicked and what didn't", "Set personal learning goals each week", "Choose independent projects that connect to your interests", "Reflect before tests: what do I actually know vs. think I know?"],
    "careerPaths": ["Psychologist", "Entrepreneur", "Author", "Life Coach", "Research Scientist"],
    "subjects": ["English/Writing", "Psychology", "Independent Study", "Philosophy", "Counseling-related electives"]
  },
  "naturalist": {
    "characterDescription": "You notice details in the natural world that others walk right past.",
    "learningStrategies": ["Use biological examples and analogies to understand any subject", "Study outside when possible", "Keep a nature journal with observations", "Connect current events to ecological systems"],
    "careerPaths": ["Biologist", "Environmental Scientist", "Veterinarian", "Marine Biologist", "Park Ranger", "Ecologist"],
    "subjects": ["Biology", "Earth Science", "Environmental Studies", "Geography", "Chemistry"]
  },
  "existential": {
    "characterDescription": "You wrestle with the big questions — and that's one of your greatest strengths.",
    "learningStrategies": ["Connect all subjects to a 'why does this matter?' question", "Journal about ethical dilemmas and your evolving views", "Join philosophy club or ethics discussions", "Seek out teachers who welcome deep questions"],
    "careerPaths": ["Philosopher", "Theologian", "Ethicist", "Author", "Counselor", "Social Justice Advocate"],
    "subjects": ["Philosophy", "Religion/Ethics", "History", "English Literature", "Sociology"]
  },
  "digital": {
    "characterDescription": "Technology is your native language — you navigate digital systems instinctively.",
    "learningStrategies": ["Use digital tools to organize and visualize your learning", "Build apps, games, or websites as project alternatives", "Follow tech YouTubers and podcasts about things that interest you", "Contribute to open-source projects or coding competitions"],
    "careerPaths": ["Software Engineer", "UX Designer", "Cybersecurity Analyst", "Game Developer", "AI Researcher"],
    "subjects": ["Computer Science", "Math", "Digital Media", "Engineering", "Robotics Club"]
  }
}
```

- [ ] **Step 3: Create data/recommendations/highschool.json**

```json
{
  "linguistic": {
    "characterDescription": "Language is your primary lens for understanding the world — words are how you think, persuade, and connect.",
    "learningStrategies": ["Write summaries in your own voice to internalize material", "Debate ideas out loud with peers or teachers", "Read primary sources and original texts, not just summaries", "Keep a vocabulary and ideas journal"],
    "careerPaths": ["Journalist", "Author", "Lawyer", "PR/Communications", "Editor", "Linguist", "Screenwriter"],
    "subjects": ["AP English", "Debate", "Creative Writing", "Foreign Languages", "History", "Law & Government"]
  },
  "logical": {
    "characterDescription": "You see structure where others see chaos — logic and systems thinking are your native language.",
    "learningStrategies": ["Solve problems before reading solutions", "Create frameworks and decision trees for complex topics", "Code projects that test the concepts you're studying", "Pursue math competitions and science olympiad"],
    "careerPaths": ["Engineer", "Data Scientist", "Actuary", "Software Developer", "Doctor", "Investment Analyst", "Research Scientist"],
    "subjects": ["AP Calculus", "Statistics", "Computer Science", "Physics", "Economics", "AP Chemistry"]
  },
  "spatial": {
    "characterDescription": "You think in images and visualize solutions that others can't see yet.",
    "learningStrategies": ["Diagram everything — concepts, timelines, relationships", "Use visual note-taking methods like sketchnotes", "Create infographics and visual essays as study tools", "Watch lectures with strong visual components"],
    "careerPaths": ["Architect", "UX/UI Designer", "Surgeon", "Film Director", "Game Designer", "Urban Planner", "Animator"],
    "subjects": ["AP Art", "Geometry", "Architecture", "Photography", "Computer Graphics", "Geography"]
  },
  "musical": {
    "characterDescription": "You think in patterns, rhythm, and tone — music is your deepest form of intelligence.",
    "learningStrategies": ["Use music mnemonics for memorization", "Study with instrumental music at a consistent tempo", "Find rhythmic patterns in math, poetry, and language", "Pursue original composition as a form of personal expression"],
    "careerPaths": ["Musician", "Music Producer", "Film Composer", "Music Educator", "Audio Engineer", "Sound Designer", "Music Therapist"],
    "subjects": ["AP Music Theory", "Band/Orchestra", "Composition", "Music Production", "Drama", "Film Studies"]
  },
  "bodily": {
    "characterDescription": "Your body is part of your cognitive system — hands-on experience is how you truly understand.",
    "learningStrategies": ["Do lab work and hands-on projects over reading", "Use physical movement to memorize sequences or processes", "Build prototypes and models as study tools", "Take on internships or apprenticeships in physical crafts"],
    "careerPaths": ["Physical Therapist", "Surgeon", "Athlete", "Choreographer", "Chef", "Firefighter", "Physical Education Teacher"],
    "subjects": ["AP Physics Labs", "Engineering", "PE", "Drama", "Culinary Arts", "Nursing/CNA"]
  },
  "interpersonal": {
    "characterDescription": "You read people and rooms with uncanny accuracy — social intelligence is your edge.",
    "learningStrategies": ["Lead study groups and teach concepts to peers", "Use collaborative projects to explore ideas", "Seek out mentors and meaningful conversations with adults", "Volunteer and intern in roles involving people"],
    "careerPaths": ["Manager", "Counselor", "Teacher", "Social Worker", "Politician", "Sales/Business Development", "HR Professional"],
    "subjects": ["Psychology", "Sociology", "Leadership", "Speech/Debate", "Community Service", "AP Government"]
  },
  "intrapersonal": {
    "characterDescription": "You know yourself deeply — self-awareness is one of the rarest and most powerful intelligences.",
    "learningStrategies": ["Reflect weekly: what did you learn, how did you grow, what confused you?", "Choose electives and projects aligned with genuine interests", "Use journaling to process difficult material", "Set autonomous learning goals and track your own progress"],
    "careerPaths": ["Psychologist", "Author", "Entrepreneur", "Researcher", "Life Coach", "Philosopher", "Independent Artist"],
    "subjects": ["AP Psychology", "Creative Writing", "Independent Study", "Philosophy", "Entrepreneurship"]
  },
  "naturalist": {
    "characterDescription": "You notice details in living systems and ecological patterns that most people miss entirely.",
    "learningStrategies": ["Connect every subject to natural systems (biology in history, chemistry in ecology)", "Keep field notes and nature journals", "Pursue environmental clubs and outdoor programs", "Study taxonomy and classification as a learning framework"],
    "careerPaths": ["Biologist", "Environmental Scientist", "Veterinarian", "Marine Biologist", "Ecologist", "Environmental Policy Analyst"],
    "subjects": ["AP Biology", "AP Environmental Science", "Earth Science", "Chemistry", "Statistics for Ecology"]
  },
  "existential": {
    "characterDescription": "You grapple with the biggest questions — purpose, meaning, justice, and consciousness.",
    "learningStrategies": ["Connect all subjects to deeper 'why' questions", "Read philosophy and social theory alongside textbooks", "Engage with ethics debates in every subject area", "Write personally and philosophically, not just analytically"],
    "careerPaths": ["Philosopher", "Theologian", "Author", "Social Justice Lawyer", "Counselor", "Ethicist", "Nonprofit Leader"],
    "subjects": ["AP Philosophy", "AP Literature", "Ethics", "Religion/Theology", "Sociology", "AP Government"]
  },
  "digital": {
    "characterDescription": "Technology feels like a native language — you build, break, and improve digital systems intuitively.",
    "learningStrategies": ["Build real projects as learning tools (apps, websites, scripts)", "Follow technology news and understand the deeper implications", "Contribute to open-source or compete in hackathons", "Use tools like GitHub, Figma, or Jupyter to document your work"],
    "careerPaths": ["Software Engineer", "UX Designer", "AI/ML Engineer", "Cybersecurity Analyst", "Product Manager", "Game Developer"],
    "subjects": ["AP Computer Science", "Statistics", "Engineering", "Digital Media Arts", "Robotics", "AP Physics"]
  }
}
```

- [ ] **Step 4: Create data/recommendations/adult.json**

```json
{
  "linguistic": {
    "characterDescription": "Language is your most powerful professional instrument — you communicate with precision, nuance, and impact.",
    "learningStrategies": ["Write to think — summarize new knowledge in your own voice", "Seek out roles with writing, presenting, or storytelling components", "Read primary sources and diverse perspectives on your field", "Lead with narrative when explaining complex ideas to others"],
    "careerPaths": ["Content Strategist", "Journalist", "Attorney", "Communications Director", "Author", "Editor", "Policy Writer"],
    "subjects": ["Communication & Rhetoric", "Creative Writing", "Law", "Linguistics", "Journalism", "Marketing"]
  },
  "logical": {
    "characterDescription": "You build mental frameworks instinctively — analysis, strategy, and structured problem-solving are your professional edge.",
    "learningStrategies": ["Approach new domains systematically — map the structure before the details", "Use data to challenge your own assumptions", "Build decision frameworks for complex professional choices", "Pursue roles that reward strategic and analytical thinking"],
    "careerPaths": ["Software Engineer", "Data Scientist", "Financial Analyst", "Management Consultant", "Researcher", "Product Manager"],
    "subjects": ["Statistics & Data Analysis", "Systems Thinking", "Finance", "Operations Research", "Computer Science"]
  },
  "spatial": {
    "characterDescription": "You translate ideas into form — visual, spatial, and design thinking are genuine professional strengths.",
    "learningStrategies": ["Diagram systems and concepts before working on them", "Use visual tools like Figma, Miro, or Mural for thinking", "Translate complex topics into infographics and visual explanations", "Pursue roles where aesthetics and function intersect"],
    "careerPaths": ["UX/UI Designer", "Architect", "Data Visualization Specialist", "Film Director", "Product Designer", "Interior Designer"],
    "subjects": ["Design Thinking", "Architecture", "Data Visualization", "3D Modeling", "Urban Planning"]
  },
  "musical": {
    "characterDescription": "Your mind moves to rhythm and pattern — music is both your identity and a lens through which you understand everything.",
    "learningStrategies": ["Use rhythm and cadence as structure in professional presentations", "Leverage your pattern sensitivity in analytical or creative work", "Build music into your professional development practice", "Seek roles where your sonic and creative sensibility adds value"],
    "careerPaths": ["Music Producer", "Audio Engineer", "Composer", "Music Educator", "Music Therapist", "Sound Designer", "Podcast Producer"],
    "subjects": ["Music Production", "Audio Technology", "Music Business", "Music Therapy", "Media Arts"]
  },
  "bodily": {
    "characterDescription": "Physical craft, embodied expertise, and kinesthetic precision are at the core of your professional identity.",
    "learningStrategies": ["Learn by doing — prioritize hands-on internships and applied work", "Use movement and physical anchors to retain complex information", "Seek mentorships and apprenticeships in your craft", "Build portfolios of tangible work rather than written reports"],
    "careerPaths": ["Surgeon", "Physical Therapist", "Chef", "Athlete / Coach", "Craftsperson", "Occupational Therapist", "Dance Educator"],
    "subjects": ["Kinesiology", "Physical Therapy", "Culinary Arts", "Medicine", "Athletic Training"]
  },
  "interpersonal": {
    "characterDescription": "You read people, build trust, and create alignment — social intelligence is your most transferable professional asset.",
    "learningStrategies": ["Reflect on each significant professional interaction: what worked, what didn't?", "Invest in coaching and mentoring others as a learning practice", "Seek 360-degree feedback to calibrate your interpersonal impact", "Build diverse networks — different perspectives sharpen social intelligence"],
    "careerPaths": ["Executive / People Manager", "HR Leader", "Therapist / Counselor", "Sales Director", "Organizational Consultant", "Nonprofit Leader"],
    "subjects": ["Organizational Psychology", "Leadership Development", "Negotiation", "Coaching", "Conflict Resolution"]
  },
  "intrapersonal": {
    "characterDescription": "Self-awareness is your compass — you know your values, your limits, and the kind of work that truly fulfills you.",
    "learningStrategies": ["Maintain a professional reflection journal — track growth, not just output", "Build in solitude for your best thinking — protect deep work time", "Use coaching or therapy as professional development tools", "Evaluate career decisions against personal values, not just compensation"],
    "careerPaths": ["Psychologist", "Independent Consultant", "Author / Researcher", "Entrepreneur", "Executive Coach", "Philosopher"],
    "subjects": ["Psychology", "Mindfulness & Well-being", "Philosophy", "Entrepreneurship", "Organizational Behavior"]
  },
  "naturalist": {
    "characterDescription": "You see living systems, ecological patterns, and natural order where others see background noise.",
    "learningStrategies": ["Use biological systems as mental models for organizational and social challenges", "Pursue field-based learning and applied ecology whenever possible", "Connect sustainability and environmental thinking to your professional context", "Study classification systems across domains — they activate naturalist thinking"],
    "careerPaths": ["Biologist / Ecologist", "Environmental Policy Analyst", "Veterinarian", "Conservation Scientist", "Sustainability Consultant", "Marine Biologist"],
    "subjects": ["Ecology", "Environmental Science", "Conservation Biology", "Sustainability Studies", "Zoology"]
  },
  "existential": {
    "characterDescription": "Purpose, meaning, and ethics are not abstract concepts to you — they drive every significant professional decision.",
    "learningStrategies": ["Evaluate every professional opportunity through the lens of meaning and alignment", "Engage with philosophy, theology, and social theory alongside domain expertise", "Write and speak about values and purpose — it clarifies and strengthens them", "Seek organizations with explicit mission alignment"],
    "careerPaths": ["Ethicist", "Nonprofit / Social Enterprise Leader", "Philosopher", "Theologian", "Therapist", "Policy Advocate", "Author"],
    "subjects": ["Philosophy", "Ethics", "Theology", "Social Justice", "Political Science", "Nonprofit Management"]
  },
  "digital": {
    "characterDescription": "Technology is both your craft and your worldview — you build, optimize, and reimagine digital systems at a professional level.",
    "learningStrategies": ["Build projects in every new domain you enter — applied beats theoretical", "Stay current with technology trends and their second-order effects", "Contribute to open-source or build in public as a learning practice", "Use tools like GitHub, Notion, and data platforms to create a professional artifact trail"],
    "careerPaths": ["Software Engineer", "AI/ML Engineer", "CTO / VP Engineering", "Product Manager", "Cybersecurity Expert", "Digital Entrepreneur"],
    "subjects": ["Software Engineering", "Machine Learning", "Cybersecurity", "Product Management", "Data Science"]
  }
}
```

- [ ] **Step 5: Commit**

```bash
git add data/recommendations/
git commit -m "feat: recommendations data for all 4 tiers"
```

---

## Task 12: Shared Layout + Nav

**Files:**
- Modify: `app/layout.tsx`
- Create: `components/shared/Nav.tsx`

- [ ] **Step 1: Create components/shared/Nav.tsx**

```tsx
// components/shared/Nav.tsx
'use client'

import Link from 'next/link'

export function Nav() {
  return (
    <nav className="bg-slate-900 border-b border-slate-800 px-6 py-3 flex items-center justify-between">
      <Link href="/" className="text-violet-400 font-bold text-sm flex items-center gap-2">
        🧠 MindMap MI
      </Link>
      <div className="flex items-center gap-4 text-sm">
        <Link href="/learn" className="text-slate-400 hover:text-slate-200 transition-colors">
          Learn
        </Link>
        <Link href="/for-educators" className="text-slate-400 hover:text-slate-200 transition-colors">
          For Educators
        </Link>
        <Link
          href="/assess"
          className="bg-violet-600 hover:bg-violet-500 text-white px-4 py-1.5 rounded-lg transition-colors font-medium"
        >
          Take Assessment
        </Link>
      </div>
    </nav>
  )
}
```

- [ ] **Step 2: Update app/layout.tsx**

```tsx
// app/layout.tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Nav } from '@/components/shared/Nav'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'MindMap MI — Discover How You Are Intelligent',
  description: 'A free, anonymous assessment based on Howard Gardner\'s Multiple Intelligences theory. Discover your unique intelligence profile across 10 domains.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-slate-950 text-slate-100 min-h-screen`}>
        <Nav />
        <main>{children}</main>
      </body>
    </html>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add app/layout.tsx components/shared/Nav.tsx
git commit -m "feat: shared layout and Nav component"
```

---

## Task 13: Landing Page

**Files:**
- Modify: `app/page.tsx`

- [ ] **Step 1: Write app/page.tsx**

```tsx
// app/page.tsx
import Link from 'next/link'
import { INTELLIGENCES } from '@/lib/intelligences'

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-slate-950 via-violet-950 to-slate-950 px-6 py-24 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
          Discover How <em className="text-violet-400 not-italic">You</em> Are Intelligent
        </h1>
        <p className="text-slate-400 text-lg max-w-xl mx-auto mb-8">
          A free, science-backed assessment of Howard Gardner's Multiple Intelligences. 
          Get your personal profile in under 15 minutes.
        </p>
        <Link
          href="/assess"
          className="inline-block bg-violet-600 hover:bg-violet-500 text-white font-bold px-8 py-4 rounded-xl text-lg transition-colors"
        >
          Take the Free Assessment
        </Link>
        <p className="text-slate-500 text-sm mt-4">
          Free · Anonymous · Science-Backed · No sign-up required
        </p>
      </section>

      {/* Intelligence Pills */}
      <section className="px-6 py-12 max-w-4xl mx-auto">
        <h2 className="text-center text-slate-400 text-sm uppercase tracking-widest mb-6">
          10 Intelligences Assessed
        </h2>
        <div className="flex flex-wrap gap-3 justify-center">
          {INTELLIGENCES.map(intel => (
            <Link
              key={intel.key}
              href={`/intelligence/${intel.slug}`}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border border-slate-700 hover:border-slate-500 bg-slate-900 hover:bg-slate-800 transition-colors"
              style={{ color: intel.color }}
            >
              <span>{intel.emoji}</span>
              <span>{intel.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="px-6 py-12 bg-slate-900 border-y border-slate-800">
        <h2 className="text-center text-white font-bold text-xl mb-8">How It Works</h2>
        <div className="max-w-3xl mx-auto grid md:grid-cols-3 gap-6 text-center">
          {[
            { step: '1', icon: '🎯', title: 'Pick Your Level', desc: 'Choose from Elementary, Middle School, High School, or Adult.' },
            { step: '2', icon: '✍️', title: 'Answer Questions', desc: 'Complete 10 scenario + 40 statement questions (~10–15 min).' },
            { step: '3', icon: '🧠', title: 'Get Your Profile', desc: 'See your radar chart, top intelligences, and tailored recommendations.' },
          ].map(item => (
            <div key={item.step} className="bg-slate-800 rounded-xl p-6">
              <div className="text-3xl mb-3">{item.icon}</div>
              <h3 className="text-white font-semibold mb-2">{item.title}</h3>
              <p className="text-slate-400 text-sm">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-8 text-center text-slate-500 text-sm">
        <p>Based on Howard Gardner's Theory of Multiple Intelligences (1983, 2000)</p>
        <p className="mt-1">For students, educators, parents, and career-seekers</p>
      </footer>
    </div>
  )
}
```

- [ ] **Step 2: Verify**

```bash
npm run dev
```

Open `http://localhost:3000`. Verify hero, intelligence pills, and how-it-works strip render correctly.

- [ ] **Step 3: Commit**

```bash
git add app/page.tsx
git commit -m "feat: landing page"
```

---

## Task 14: Tier Selector Page

**Files:**
- Create: `app/assess/page.tsx`

- [ ] **Step 1: Create app/assess/page.tsx**

```tsx
// app/assess/page.tsx
import Link from 'next/link'

const TIERS = [
  {
    id: 'elementary',
    icon: '🌱',
    name: 'Elementary',
    ages: 'Ages 5–10 · K–5',
    desc: 'Short prompts with simple vocabulary and emoji choices',
    tags: ['Friendly tone', '~10 min'],
    color: '#4ade80',
  },
  {
    id: 'middle',
    icon: '🚀',
    name: 'Middle School',
    ages: 'Ages 11–13 · Grades 6–8',
    desc: 'Relatable school and hobby scenarios in a casual tone',
    tags: ['Casual tone', '~12 min'],
    color: '#60a5fa',
  },
  {
    id: 'highschool',
    icon: '🔭',
    name: 'High School',
    ages: 'Ages 14–18 · Grades 9–12',
    desc: 'Self-reflective questions with identity and future framing',
    tags: ['Reflective tone', '~13 min'],
    color: '#a78bfa',
  },
  {
    id: 'adult',
    icon: '💼',
    name: 'Adult / College',
    ages: 'Ages 18+ · College & Beyond',
    desc: 'Professional and career-focused lens with workplace scenarios',
    tags: ['Professional tone', '~15 min'],
    color: '#f472b6',
  },
]

export default function AssessPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold text-white text-center mb-2">Choose Your Level</h1>
      <p className="text-slate-400 text-center mb-10">
        Select the age group that fits you best — questions are tailored to each tier
      </p>

      <div className="grid sm:grid-cols-2 gap-4">
        {TIERS.map(tier => (
          <Link
            key={tier.id}
            href={`/assess/${tier.id}`}
            className="block bg-slate-900 border-2 hover:bg-slate-800 rounded-xl p-6 transition-all hover:scale-[1.01]"
            style={{ borderColor: `${tier.color}44` }}
          >
            <div className="flex items-center gap-3 mb-3">
              <span className="text-3xl">{tier.icon}</span>
              <div>
                <h2 className="text-white font-bold" style={{ color: tier.color }}>{tier.name}</h2>
                <span className="text-slate-500 text-xs">{tier.ages}</span>
              </div>
            </div>
            <p className="text-slate-400 text-sm mb-3">{tier.desc}</p>
            <div className="flex gap-2 flex-wrap">
              {tier.tags.map(tag => (
                <span
                  key={tag}
                  className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700"
                >
                  {tag}
                </span>
              ))}
            </div>
          </Link>
        ))}
      </div>

      <p className="text-center text-slate-600 text-xs mt-8">
        🔒 No sign-up needed · Results stay in your browser · Completely free
      </p>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add app/assess/page.tsx
git commit -m "feat: tier selector page"
```

---

## Task 15: Assessment Components

**Files:**
- Create: `components/assessment/ProgressBar.tsx`
- Create: `components/assessment/IntelligenceTracker.tsx`
- Create: `components/assessment/ScenarioQuestion.tsx`
- Create: `components/assessment/LikertQuestion.tsx`

- [ ] **Step 1: Create components/assessment/ProgressBar.tsx**

```tsx
// components/assessment/ProgressBar.tsx

type Props = {
  current: number   // 1-based current question number
  total: number
  color?: string    // Tailwind color class for the bar, e.g. '#10b981'
}

export function ProgressBar({ current, total, color = '#6366f1' }: Props) {
  const pct = Math.round((current / total) * 100)
  return (
    <div className="bg-slate-800 px-5 py-3">
      <div className="flex justify-between items-center mb-1.5 text-xs text-slate-400">
        <span>Question {current} of {total}</span>
        <span style={{ color }}>{pct}%</span>
      </div>
      <div className="bg-slate-900 rounded-full h-1.5">
        <div
          className="h-1.5 rounded-full transition-all duration-300"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create components/assessment/IntelligenceTracker.tsx**

```tsx
// components/assessment/IntelligenceTracker.tsx

import { INTELLIGENCES } from '@/lib/intelligences'
import type { IntelligenceKey } from '@/lib/types'

type Props = {
  completed: IntelligenceKey[]  // intelligences with all 4 Likert answered
  current: IntelligenceKey      // intelligence currently being assessed
}

export function IntelligenceTracker({ completed, current }: Props) {
  return (
    <div className="bg-slate-800 rounded-lg px-3 py-2.5 mb-5">
      <p className="text-slate-500 text-xs mb-2">Intelligences covered so far</p>
      <div className="flex flex-wrap gap-1.5">
        {INTELLIGENCES.map(intel => {
          const isDone = completed.includes(intel.key)
          const isCurrent = intel.key === current
          return (
            <span
              key={intel.key}
              className="text-xs px-2 py-0.5 rounded-full border font-medium"
              style={
                isDone
                  ? { backgroundColor: intel.color, color: '#0f172a', borderColor: intel.color }
                  : isCurrent
                  ? { backgroundColor: 'transparent', color: intel.color, borderColor: intel.color }
                  : { backgroundColor: 'transparent', color: '#475569', borderColor: '#334155' }
              }
            >
              {intel.emoji} {intel.name}{isDone ? ' ✓' : isCurrent ? ' ←' : ''}
            </span>
          )
        })}
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Create components/assessment/ScenarioQuestion.tsx**

```tsx
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
```

- [ ] **Step 4: Create components/assessment/LikertQuestion.tsx**

```tsx
// components/assessment/LikertQuestion.tsx

import { getIntelligence } from '@/lib/intelligences'
import type { LikertQuestion as LikertQuestionType } from '@/lib/types'

type Props = {
  question: LikertQuestionType
  value: number | null   // 1–5, null if unanswered
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
      {/* Intelligence badge */}
      <span
        className="inline-block text-xs px-3 py-1 rounded-full border mb-4 font-medium"
        style={{ color: intel.color, borderColor: intel.color }}
      >
        {intel.emoji} {intel.name} Intelligence
      </span>

      <p className="text-white font-semibold text-lg leading-relaxed mb-6">{question.statement}</p>

      {/* Likert scale */}
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
```

- [ ] **Step 5: Commit**

```bash
git add components/assessment/
git commit -m "feat: assessment UI components"
```

---

## Task 16: Assessment Wizard + Dynamic Route

**Files:**
- Create: `components/assessment/AssessmentWizard.tsx`
- Create: `app/assess/[tier]/page.tsx`

- [ ] **Step 1: Create components/assessment/AssessmentWizard.tsx**

```tsx
// components/assessment/AssessmentWizard.tsx
'use client'

import { useState, useEffect } from 'react'
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
  const [step, setStep] = useState(0)         // 0-based index into allQuestions
  const [answers, setAnswers] = useState<Map<string, Answer>>(new Map())
  const [processing, setProcessing] = useState(false)

  const current = allQuestions[step]
  const isScenario = current.type === 'scenario'
  const isLikert = current.type === 'likert'

  // Current answer
  const currentAnswer = answers.get(current.id) ?? null

  // For scenario: which intelligence option is selected
  const scenarioSelected: IntelligenceKey | null =
    isScenario && currentAnswer ? (currentAnswer.intelligence as IntelligenceKey) : null

  // For Likert: 1–5 value
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
      // Final question answered — score and redirect
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

  // Completed Likert intelligences (all 4 questions answered)
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
        {/* Progress */}
        <ProgressBar current={step + 1} total={totalQ} color={progressColor} />

        {/* Question area */}
        <div className="p-6">
          {/* Phase label */}
          <p className="text-xs text-slate-600 uppercase tracking-widest mb-4">
            {isScenario ? 'Step 1 of 2 · Scenario Questions' : 'Step 2 of 2 · Statements'}
          </p>

          {/* Intelligence tracker (Likert phase only) */}
          {isLikert && current.type === 'likert' && (
            <IntelligenceTracker
              completed={likertCompleted}
              current={current.intelligence}
            />
          )}

          {/* Question */}
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

          {/* Navigation */}
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
```

- [ ] **Step 2: Create app/assess/[tier]/page.tsx**

```tsx
// app/assess/[tier]/page.tsx
import { notFound } from 'next/navigation'
import type { Tier } from '@/lib/types'
import { AssessmentWizard } from '@/components/assessment/AssessmentWizard'

const VALID_TIERS: Tier[] = ['elementary', 'middle', 'highschool', 'adult']

export function generateStaticParams() {
  return VALID_TIERS.map(tier => ({ tier }))
}

async function getQuestions(tier: Tier) {
  const data = await import(`@/data/questions/${tier}.json`)
  return data.default as { scenario: any[]; likert: any[] }
}

export default async function AssessmentPage({ params }: { params: { tier: string } }) {
  const tier = params.tier as Tier
  if (!VALID_TIERS.includes(tier)) notFound()

  const questions = await getQuestions(tier)
  return (
    <div className="min-h-screen bg-slate-950 py-8">
      <AssessmentWizard tier={tier} questions={questions} />
    </div>
  )
}
```

- [ ] **Step 3: Verify**

```bash
npm run dev
```

Navigate to `http://localhost:3000/assess/middle`. Complete a few questions — verify:
- Progress bar advances correctly
- Scenario selection highlights chosen option
- Next button disabled until an answer is selected
- Likert buttons work with correct visual feedback
- Intelligence tracker updates after 4 Likert questions per intelligence

- [ ] **Step 4: Commit**

```bash
git add components/assessment/AssessmentWizard.tsx app/assess/[tier]/page.tsx
git commit -m "feat: assessment wizard with dynamic tier routing"
```

---

## Task 17: Results Components

**Files:**
- Create: `components/results/RadarChart.tsx`
- Create: `components/results/IntelligenceCard.tsx`
- Create: `components/results/RecommendationPanel.tsx`

- [ ] **Step 1: Create components/results/RadarChart.tsx**

```tsx
// components/results/RadarChart.tsx

import { INTELLIGENCES } from '@/lib/intelligences'
import type { IntelligenceScore } from '@/lib/types'

type Props = {
  scores: IntelligenceScore[]
}

const SIZE = 200
const CENTER = SIZE / 2
const MAX_RADIUS = 80
const N = 10  // 10 intelligences

function polarToCartesian(angle: number, radius: number) {
  const rad = (angle - 90) * (Math.PI / 180)
  return {
    x: CENTER + radius * Math.cos(rad),
    y: CENTER + radius * Math.sin(rad),
  }
}

function buildPolygon(radii: number[]): string {
  return radii
    .map((r, i) => {
      const angle = (360 / N) * i
      const { x, y } = polarToCartesian(angle, r)
      return `${x},${y}`
    })
    .join(' ')
}

// Build 4 concentric grid polygons at 25%, 50%, 75%, 100%
const GRID_LEVELS = [0.25, 0.5, 0.75, 1]

export function RadarChart({ scores: rawScores }: Props) {
  // Sort scores by INTELLIGENCES order for consistent positioning
  const scoreMap = Object.fromEntries(rawScores.map(s => [s.intelligence, s.normalized]))
  const ordered = INTELLIGENCES.map(i => ({
    ...i,
    normalized: scoreMap[i.key] ?? 0,
  }))

  const dataRadii = ordered.map(i => (i.normalized / 100) * MAX_RADIUS)
  const dataPolygon = buildPolygon(dataRadii)

  return (
    <div className="bg-slate-800 rounded-xl p-4 text-center">
      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} width="100%" className="max-w-[220px] mx-auto block">
        {/* Grid */}
        {GRID_LEVELS.map(level => (
          <polygon
            key={level}
            points={buildPolygon(Array(N).fill(MAX_RADIUS * level))}
            fill="none"
            stroke="#334155"
            strokeWidth="0.8"
          />
        ))}

        {/* Axes */}
        {INTELLIGENCES.map((_, i) => {
          const angle = (360 / N) * i
          const outer = polarToCartesian(angle, MAX_RADIUS)
          return (
            <line
              key={i}
              x1={CENTER} y1={CENTER}
              x2={outer.x} y2={outer.y}
              stroke="#334155"
              strokeWidth="0.5"
            />
          )
        })}

        {/* Score fill */}
        <polygon
          points={dataPolygon}
          fill="rgba(99,102,241,0.2)"
          stroke="#6366f1"
          strokeWidth="1.5"
        />

        {/* Dots + labels */}
        {ordered.map((intel, i) => {
          const angle = (360 / N) * i
          const r = (intel.normalized / 100) * MAX_RADIUS
          const dot = polarToCartesian(angle, r)
          const label = polarToCartesian(angle, MAX_RADIUS + 14)
          return (
            <g key={intel.key}>
              <circle cx={dot.x} cy={dot.y} r="3" fill={intel.color} />
              <text
                x={label.x}
                y={label.y}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="7"
                fill={intel.color}
              >
                {intel.emoji}
              </text>
            </g>
          )
        })}
      </svg>
      <p className="text-slate-500 text-xs mt-2">All 10 intelligences</p>
    </div>
  )
}
```

- [ ] **Step 2: Create components/results/IntelligenceCard.tsx**

```tsx
// components/results/IntelligenceCard.tsx

import { getIntelligence } from '@/lib/intelligences'
import type { IntelligenceScore } from '@/lib/types'

type Props = {
  score: IntelligenceScore
  rank: number
}

export function IntelligenceCard({ score, rank }: Props) {
  const intel = getIntelligence(score.intelligence)
  return (
    <div
      className="bg-slate-800 rounded-xl p-4"
      style={{ borderLeft: `3px solid ${intel.color}` }}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{intel.emoji}</span>
          <span className="font-bold text-sm" style={{ color: intel.color }}>
            #{rank} {intel.name}
          </span>
        </div>
        <span className="font-bold text-sm" style={{ color: intel.color }}>
          {score.normalized}%
        </span>
      </div>
      <div className="bg-slate-900 rounded-full h-1.5 mb-3">
        <div
          className="h-1.5 rounded-full transition-all"
          style={{ width: `${score.normalized}%`, backgroundColor: intel.color }}
        />
      </div>
      <p className="text-slate-400 text-xs leading-relaxed">{intel.shortDescription}</p>
    </div>
  )
}
```

- [ ] **Step 3: Create components/results/RecommendationPanel.tsx**

```tsx
// components/results/RecommendationPanel.tsx

import type { IntelligenceKey, Tier } from '@/lib/types'

type RecommendationEntry = {
  characterDescription: string
  learningStrategies: string[]
  careerPaths: string[]
  subjects: string[]
}

type Props = {
  topIntelligence: IntelligenceKey
  tier: Tier
  recommendations: RecommendationEntry
}

export function RecommendationPanel({ topIntelligence, tier, recommendations }: Props) {
  const panels = [
    {
      icon: '🎓',
      title: 'Learning Strategies',
      items: recommendations.learningStrategies,
    },
    {
      icon: '🚀',
      title: tier === 'elementary' || tier === 'middle'
        ? 'Future Careers to Explore'
        : 'Career Paths',
      items: recommendations.careerPaths,
    },
    {
      icon: '📚',
      title: 'Subjects to Lean Into',
      items: recommendations.subjects,
    },
  ]

  return (
    <div className="grid sm:grid-cols-3 gap-4">
      {panels.map(panel => (
        <div key={panel.title} className="bg-slate-800 rounded-xl p-4">
          <div className="text-2xl mb-2">{panel.icon}</div>
          <h3 className="text-white text-sm font-semibold mb-2">{panel.title}</h3>
          <ul className="text-slate-400 text-xs space-y-1">
            {panel.items.map(item => (
              <li key={item} className="flex items-start gap-1">
                <span className="text-slate-600 mt-0.5">·</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}
```

- [ ] **Step 4: Commit**

```bash
git add components/results/
git commit -m "feat: results components (radar, cards, recommendations)"
```

---

## Task 18: PDF Export with Name

**Files:**
- Create: `components/results/ExportPDFModal.tsx`
- Modify: `app/globals.css` (add print styles)

The PDF export uses `window.print()` triggered after the user enters their name. The name is injected into the page title and the results hero before printing. A `@media print` stylesheet hides interactive chrome and formats the page cleanly.

- [ ] **Step 1: Create components/results/ExportPDFModal.tsx**

```tsx
// components/results/ExportPDFModal.tsx
'use client'

import { useState, useRef, useEffect } from 'react'

type Props = {
  defaultHeroLabel: string   // e.g. "Musical-Spatial Thinker"
  onConfirm: (name: string) => void
  onCancel: () => void
}

export function ExportPDFModal({ defaultHeroLabel, onConfirm, onCancel }: Props) {
  const [name, setName] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onConfirm(name.trim())
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
        <div className="text-3xl text-center mb-3">📄</div>
        <h2 className="text-white font-bold text-center text-lg mb-1">Export Your Results</h2>
        <p className="text-slate-400 text-sm text-center mb-5">
          Add your name to personalize the PDF. Leave blank to export anonymously.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-slate-400 text-xs mb-1.5">Your name (optional)</label>
            <input
              ref={inputRef}
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Alex Johnson"
              maxLength={60}
              className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-2.5 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors"
            />
          </div>

          {name.trim() && (
            <div className="bg-slate-800 rounded-lg p-3 text-xs text-slate-400">
              Preview: <span className="text-white">{name.trim()}</span> — {defaultHeroLabel}
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2.5 rounded-lg border border-slate-700 text-slate-400 text-sm hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold transition-colors"
            >
              Export PDF
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Add print styles to app/globals.css**

Append to the end of `app/globals.css`:

```css
/* ── Print / PDF Export ─────────────────────────────────────── */
@media print {
  /* Hide interactive chrome */
  nav,
  .print-hide {
    display: none !important;
  }

  /* Force light background for printing */
  body {
    background: white !important;
    color: #0f172a !important;
  }

  /* Reset dark backgrounds on result sections */
  .print-section {
    background: white !important;
    color: #0f172a !important;
    border-color: #e2e8f0 !important;
  }

  /* Page break control */
  .print-break-before {
    break-before: page;
  }

  /* Show print header */
  .print-only {
    display: block !important;
  }

  @page {
    margin: 1.5cm;
    size: A4;
  }
}

/* Hidden from screen, shown during print */
.print-only {
  display: none;
}
```

- [ ] **Step 3: Commit**

```bash
git add components/results/ExportPDFModal.tsx app/globals.css
git commit -m "feat: PDF export modal with name input and print styles"
```

---

## Task 19: Results Page

**Files:**
- Create: `app/results/page.tsx`

The results page is a client component — it reads `window.location.hash` to decode scores, displays the full profile, and wires up the Export PDF flow.

- [ ] **Step 1: Create app/results/page.tsx**

```tsx
// app/results/page.tsx
'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { decodeResults } from '@/lib/urlState'
import { INTELLIGENCES, getIntelligence } from '@/lib/intelligences'
import type { AssessmentResult } from '@/lib/types'
import { RadarChart } from '@/components/results/RadarChart'
import { IntelligenceCard } from '@/components/results/IntelligenceCard'
import { RecommendationPanel } from '@/components/results/RecommendationPanel'
import { ExportPDFModal } from '@/components/results/ExportPDFModal'

export default function ResultsPage() {
  const [result, setResult] = useState<AssessmentResult | null>(null)
  const [recommendations, setRecommendations] = useState<any>(null)
  const [showPDFModal, setShowPDFModal] = useState(false)
  const [printName, setPrintName] = useState<string | null>(null)

  useEffect(() => {
    const hash = window.location.hash
    const decoded = decodeResults(hash)
    if (!decoded) return
    setResult(decoded)
    // Load recommendations for this tier
    import(`@/data/recommendations/${decoded.tier}.json`)
      .then(mod => setRecommendations(mod.default))
      .catch(() => {})
  }, [])

  function handleExportPDF(name: string) {
    setPrintName(name || null)
    setShowPDFModal(false)
    // Brief delay for state to render, then print
    setTimeout(() => window.print(), 150)
  }

  function handleShare() {
    navigator.clipboard.writeText(window.location.href).then(() => {
      alert('Link copied to clipboard!')
    })
  }

  if (!result) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
        <div className="text-4xl mb-4">🤔</div>
        <h2 className="text-white text-xl font-bold mb-2">No results found</h2>
        <p className="text-slate-400 text-sm mb-6">
          It looks like you navigated here directly. Take the assessment first!
        </p>
        <Link href="/assess" className="bg-violet-600 text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-violet-500 transition-colors">
          Take the Assessment
        </Link>
      </div>
    )
  }

  const topIntelligence = getIntelligence(result.topThree[0])
  const tierLabel: Record<string, string> = {
    elementary: 'Elementary',
    middle: 'Middle School',
    highschool: 'High School',
    adult: 'Adult / College',
  }

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Print-only header (hidden on screen) */}
      <div className="print-only border-b border-slate-200 pb-4 mb-6">
        <h1 className="text-2xl font-bold text-slate-900">
          {printName ? `${printName}'s ` : ''}Multiple Intelligences Profile
        </h1>
        <p className="text-slate-500 text-sm">
          {tierLabel[result.tier]} · Generated by MindMap MI · mindmapmi.com
        </p>
      </div>

      {/* Actions bar */}
      <div className="bg-slate-900 border-b border-slate-800 px-6 py-3 flex items-center justify-between print-hide">
        <Link href="/" className="text-violet-400 font-bold text-sm">🧠 MindMap MI</Link>
        <div className="flex gap-2">
          <button
            onClick={() => setShowPDFModal(true)}
            className="bg-slate-800 border border-slate-700 text-slate-300 text-xs px-3 py-1.5 rounded-lg hover:bg-slate-700 transition-colors flex items-center gap-1.5"
          >
            📄 Export PDF
          </button>
          <button
            onClick={handleShare}
            className="bg-violet-600 text-white text-xs px-3 py-1.5 rounded-lg hover:bg-violet-500 transition-colors"
          >
            🔗 Share Results
          </button>
          <Link
            href="/assess"
            className="bg-slate-800 border border-slate-700 text-slate-400 text-xs px-3 py-1.5 rounded-lg hover:bg-slate-700 transition-colors"
          >
            🔄 Retake
          </Link>
        </div>
      </div>

      {/* Hero */}
      <div
        className="px-6 py-10 text-center print-section"
        style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)' }}
      >
        {printName && (
          <p className="text-violet-300 text-sm mb-1">{printName}'s Profile</p>
        )}
        <p className="text-violet-400 text-xs uppercase tracking-widest mb-2">
          Your Intelligence Profile · {tierLabel[result.tier]}
        </p>
        <h1 className="text-white text-2xl font-bold mb-2">
          You're a <span style={{ color: topIntelligence.color }}>{result.heroLabel}</span>
        </h1>
        <p className="text-slate-400 text-sm max-w-md mx-auto">
          {recommendations?.[result.topThree[0]]?.characterDescription ?? topIntelligence.shortDescription}
        </p>
      </div>

      {/* Radar + Top 3 */}
      <div className="max-w-4xl mx-auto px-6 py-8 grid md:grid-cols-2 gap-8 items-start">
        <div>
          <p className="text-slate-500 text-xs uppercase tracking-widest mb-3">All 10 Intelligences</p>
          <RadarChart scores={result.scores} />
        </div>
        <div>
          <p className="text-slate-500 text-xs uppercase tracking-widest mb-3">Your Top Intelligences</p>
          <div className="flex flex-col gap-3">
            {result.topThree.map((key, i) => {
              const score = result.scores.find(s => s.intelligence === key)!
              return <IntelligenceCard key={key} score={score} rank={i + 1} />
            })}
          </div>
        </div>
      </div>

      {/* Recommendations */}
      {recommendations && (
        <div className="max-w-4xl mx-auto px-6 pb-8">
          <p className="text-slate-500 text-xs uppercase tracking-widest mb-3">
            Tailored Recommendations · {tierLabel[result.tier]}
          </p>
          <RecommendationPanel
            topIntelligence={result.topThree[0]}
            tier={result.tier}
            recommendations={recommendations[result.topThree[0]]}
          />
        </div>
      )}

      {/* Full breakdown */}
      <div className="max-w-4xl mx-auto px-6 pb-12 print-break-before">
        <details className="group">
          <summary className="cursor-pointer text-slate-500 text-sm py-3 border-t border-slate-800 flex items-center justify-between hover:text-slate-300 transition-colors print-hide">
            <span>See all 10 intelligence scores ↓</span>
          </summary>
          <div className="mt-4 flex flex-col gap-2">
            {result.scores.map((score, i) => {
              const intel = getIntelligence(score.intelligence)
              return (
                <div key={score.intelligence} className="flex items-center gap-3">
                  <span className="text-slate-500 text-xs w-4 text-right">{i + 1}</span>
                  <span className="text-lg">{intel.emoji}</span>
                  <span className="text-slate-300 text-sm w-32">{intel.name}</span>
                  <div className="flex-1 bg-slate-800 rounded-full h-1.5">
                    <div
                      className="h-1.5 rounded-full"
                      style={{ width: `${score.normalized}%`, backgroundColor: intel.color }}
                    />
                  </div>
                  <span className="text-slate-400 text-xs w-8 text-right">{score.normalized}%</span>
                </div>
              )
            })}
          </div>
        </details>
      </div>

      {/* Footer CTAs */}
      <div className="border-t border-slate-800 px-6 py-6 flex flex-wrap gap-4 justify-center print-hide">
        <Link href="/for-educators" className="text-slate-400 text-sm hover:text-slate-200 transition-colors">
          📋 For Educators
        </Link>
        <Link href="/learn" className="bg-violet-600 text-white text-sm px-5 py-2 rounded-lg hover:bg-violet-500 transition-colors">
          Learn more about your intelligences →
        </Link>
      </div>

      {/* PDF Modal */}
      {showPDFModal && (
        <ExportPDFModal
          defaultHeroLabel={result.heroLabel}
          onConfirm={handleExportPDF}
          onCancel={() => setShowPDFModal(false)}
        />
      )}
    </div>
  )
}
```

- [ ] **Step 2: Verify end-to-end**

```bash
npm run dev
```

1. Go to `http://localhost:3000/assess/highschool`
2. Complete all 50 questions
3. Confirm redirect to `/results#t=highschool&s=...`
4. Verify: hero label, radar chart, top 3 cards, recommendations all render
5. Click **Export PDF**: verify modal appears with name input
6. Enter a name → verify name appears in preview text
7. Click **Export PDF**: verify browser print dialog opens with name in header
8. Click **Share Results**: verify URL is copied to clipboard
9. Click **Retake**: verify redirect back to `/assess`

- [ ] **Step 3: Commit**

```bash
git add app/results/page.tsx
git commit -m "feat: results page with radar chart, recommendations, and PDF export"
```

---

## Task 20: Supporting Pages

**Files:**
- Create: `app/learn/page.tsx`
- Create: `app/intelligence/[slug]/page.tsx`
- Create: `app/for-educators/page.tsx`

- [ ] **Step 1: Create app/learn/page.tsx**

```tsx
// app/learn/page.tsx
import Link from 'next/link'
import { INTELLIGENCES } from '@/lib/intelligences'

export default function LearnPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold text-white mb-2">About Multiple Intelligences</h1>
      <p className="text-slate-400 mb-8">
        Howard Gardner's theory, introduced in <em>Frames of Mind</em> (1983), proposed that human intelligence is not a single fixed capacity, but a set of distinct cognitive abilities — each with its own developmental arc and neural basis.
      </p>

      <section className="mb-8 bg-slate-900 rounded-xl p-6 border border-slate-800">
        <h2 className="text-white font-bold text-lg mb-3">Why Multiple Intelligences Matter</h2>
        <p className="text-slate-400 text-sm leading-relaxed">
          Traditional IQ tests measure a narrow band of linguistic and logical-mathematical ability. Gardner argued that this misses the full spectrum of how people think, learn, and contribute. Recognizing all intelligences helps educators design richer learning environments, helps students find their strengths, and helps adults make more fulfilling career and life choices.
        </p>
      </section>

      <h2 className="text-white font-bold text-xl mb-4">The 10 Intelligences</h2>
      <div className="flex flex-col gap-3">
        {INTELLIGENCES.map(intel => (
          <Link
            key={intel.key}
            href={`/intelligence/${intel.slug}`}
            className="flex items-start gap-4 bg-slate-900 border border-slate-800 rounded-xl p-4 hover:bg-slate-800 transition-colors"
          >
            <span className="text-2xl">{intel.emoji}</span>
            <div>
              <h3 className="text-white font-semibold" style={{ color: intel.color }}>{intel.name}</h3>
              <p className="text-slate-400 text-sm">{intel.shortDescription}</p>
            </div>
            <span className="ml-auto text-slate-600 text-sm">→</span>
          </Link>
        ))}
      </div>

      <div className="mt-10 text-center">
        <Link
          href="/assess"
          className="inline-block bg-violet-600 hover:bg-violet-500 text-white px-8 py-3 rounded-xl font-semibold transition-colors"
        >
          Discover Your Intelligence Profile
        </Link>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create app/intelligence/[slug]/page.tsx**

```tsx
// app/intelligence/[slug]/page.tsx
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { INTELLIGENCES } from '@/lib/intelligences'

export function generateStaticParams() {
  return INTELLIGENCES.map(i => ({ slug: i.slug }))
}

const INTEL_DETAILS: Record<string, {
  definition: string
  famousPeople: string[]
  inLearning: string
  careers: string[]
  developTips: string[]
}> = {
  linguistic: {
    definition: 'Linguistic intelligence is the capacity to use language effectively — to understand the nuances of written and spoken words, construct complex sentences, and communicate ideas with precision and flair.',
    famousPeople: ['Maya Angelou', 'Barack Obama', 'J.K. Rowling', 'Shakespeare', 'Malala Yousafzai'],
    inLearning: 'Linguistic learners thrive with reading, writing, storytelling, debate, and word games. They memorize best through verbal repetition, poetry, and explaining concepts to others.',
    careers: ['Author', 'Journalist', 'Lawyer', 'Teacher', 'Editor', 'Public Relations', 'Linguist', 'Screenwriter'],
    developTips: ['Read widely across genres and disciplines', 'Write daily — journaling, essays, or fiction', 'Join a debate club or public speaking group', 'Learn a second language', 'Practice explaining complex ideas in simple terms'],
  },
  logical: {
    definition: 'Logical-mathematical intelligence is the capacity to think conceptually and abstractly, to discern logical or numerical patterns, and to reason through complex problem chains.',
    famousPeople: ['Albert Einstein', 'Ada Lovelace', 'Stephen Hawking', 'Alan Turing', 'Marie Curie'],
    inLearning: 'Logical learners thrive with structured problem-solving, experiments, and systems thinking. They excel at finding patterns, working with data, and reasoning from first principles.',
    careers: ['Software Engineer', 'Mathematician', 'Data Scientist', 'Doctor', 'Actuary', 'Financial Analyst', 'Research Scientist'],
    developTips: ['Practice mental math and logic puzzles daily', 'Learn to code — programming makes abstract logic concrete', 'Study statistics and probability', 'Play chess or strategy games', 'Break every problem down into its component parts'],
  },
  spatial: {
    definition: 'Spatial intelligence is the capacity to perceive the visual-spatial world accurately, to transform and recreate perceptions, and to think in three-dimensional terms.',
    famousPeople: ['Leonardo da Vinci', 'Frank Lloyd Wright', 'Georgia O\'Keeffe', 'Elon Musk', 'Pablo Picasso'],
    inLearning: 'Spatial learners excel with maps, diagrams, charts, and visual representations. They learn best through drawing, modeling, and visualizing concepts before reading about them.',
    careers: ['Architect', 'Graphic Designer', 'Surgeon', 'Pilot', 'Film Director', 'Urban Planner', 'UX Designer'],
    developTips: ['Draw concept maps and diagrams for everything you study', 'Explore drawing, painting, or 3D modeling', 'Study architecture, design, or photography', 'Navigate without GPS — build your internal map', 'Watch documentaries and visual explanations over text'],
  },
  musical: {
    definition: 'Musical intelligence is the capacity to perceive, discriminate, transform, and express musical forms — including sensitivity to rhythm, pitch, timbre, and the emotional power of sound.',
    famousPeople: ['Mozart', 'Beyoncé', 'Ludwig van Beethoven', 'Björk', 'John Coltrane'],
    inLearning: 'Musical learners often memorize through song and rhythm, respond strongly to the acoustic environment, and find deep engagement through music composition and analysis.',
    careers: ['Musician', 'Music Producer', 'Composer', 'Music Therapist', 'Audio Engineer', 'Sound Designer', 'Music Educator'],
    developTips: ['Learn an instrument — even basic music theory transforms your listening', 'Use music mnemonics to memorize anything', 'Compose short pieces to express ideas you can\'t put into words', 'Study music theory to understand what you hear intuitively', 'Attend live performances across genres'],
  },
  'bodily-kinesthetic': {
    definition: 'Bodily-kinesthetic intelligence is the capacity to use one\'s body skillfully — to handle objects with precision, and to use the body to express ideas or feelings.',
    famousPeople: ['Serena Williams', 'Mikhail Baryshnikov', 'Muhammad Ali', 'Simone Biles', 'Charlie Chaplin'],
    inLearning: 'Bodily-kinesthetic learners retain information best through movement, hands-on activities, and physical demonstrations. They need to do — not just observe.',
    careers: ['Surgeon', 'Physical Therapist', 'Athlete', 'Chef', 'Dancer', 'Firefighter', 'Craftsperson'],
    developTips: ['Take movement breaks every 30 minutes while studying', 'Learn through building, crafting, and physical models', 'Study martial arts, dance, or a sport to develop body awareness', 'Use hands-on internships and apprenticeships as learning tools', 'Act out historical events, stories, and scientific processes'],
  },
  interpersonal: {
    definition: 'Interpersonal intelligence is the capacity to understand other people — their moods, motivations, intentions, and desires — and to work effectively with them.',
    famousPeople: ['Nelson Mandela', 'Oprah Winfrey', 'Martin Luther King Jr.', 'Mother Teresa', 'Barack Obama'],
    inLearning: 'Interpersonal learners thrive in group settings, collaborative projects, and teaching others. They learn through discussion, debate, and social problem-solving.',
    careers: ['Therapist', 'Manager', 'Social Worker', 'Teacher', 'HR Leader', 'Politician', 'Mediator'],
    developTips: ['Volunteer for leadership roles in group settings', 'Practice active listening — focus fully, don\'t plan your response', 'Seek out diverse social environments and perspectives', 'Study psychology, sociology, and human behavior', 'Teach or mentor others — it\'s the best way to solidify knowledge'],
  },
  intrapersonal: {
    definition: 'Intrapersonal intelligence is the capacity to understand oneself — to have an accurate model of oneself including one\'s desires, fears, strengths, and weaknesses — and to use that understanding to regulate one\'s life.',
    famousPeople: ['Sigmund Freud', 'Plato', 'Virginia Woolf', 'Marcus Aurelius', 'Frida Kahlo'],
    inLearning: 'Intrapersonal learners work best independently, set their own goals, and reflect deeply on learning experiences. They need time for introspection and self-paced work.',
    careers: ['Psychologist', 'Author', 'Philosopher', 'Entrepreneur', 'Researcher', 'Life Coach'],
    developTips: ['Keep a daily reflection journal', 'Practice mindfulness or meditation', 'Set personal learning goals and track your own progress', 'Seek therapy or coaching as a development tool, not just for crises', 'Read philosophy, autobiography, and psychology'],
  },
  naturalist: {
    definition: 'Naturalist intelligence is the capacity to recognize, categorize, and draw upon certain features of the environment — living and non-living — to classify and understand natural phenomena.',
    famousPeople: ['Charles Darwin', 'Jane Goodall', 'David Attenborough', 'Rachel Carson', 'E.O. Wilson'],
    inLearning: 'Naturalist learners excel at classification, pattern recognition in living systems, and learning outdoors. They make connections between disciplines through natural analogies.',
    careers: ['Biologist', 'Ecologist', 'Veterinarian', 'Park Ranger', 'Marine Biologist', 'Conservation Scientist'],
    developTips: ['Keep a field journal with observations of your natural environment', 'Study taxonomy and classification systems in biology', 'Volunteer with conservation or wildlife organizations', 'Bring natural examples into every subject you study', 'Spend time in nature deliberately — without a device'],
  },
  existential: {
    definition: 'Existential intelligence is the sensitivity and capacity to tackle deep questions about human existence — the meaning of life, why we die, and how we got here — and to address the mystery of human consciousness.',
    famousPeople: ['Socrates', 'Viktor Frankl', 'Simone de Beauvoir', 'Albert Camus', 'Rumi'],
    inLearning: 'Existential learners need to connect what they study to larger meaning and purpose. They thrive in philosophy, ethics, and humanities, and are energized by questions that have no single right answer.',
    careers: ['Philosopher', 'Theologian', 'Author', 'Therapist', 'Ethicist', 'Nonprofit Leader', 'Social Justice Advocate'],
    developTips: ['Read foundational philosophy — Plato, Nietzsche, Camus, de Beauvoir', 'Journal about your evolving worldview and its contradictions', 'Engage with faith traditions — even ones you don\'t hold', 'Study the history of ideas across cultures and centuries', 'Ask "why does this matter?" for everything you encounter'],
  },
  digital: {
    definition: 'Digital intelligence is the fluency to work with digital systems, computational tools, and networked information — to create, debug, and reimagine digital artifacts, and to understand how technology shapes human experience.',
    famousPeople: ['Ada Lovelace', 'Tim Berners-Lee', 'Grace Hopper', 'Linus Torvalds', 'Reshma Saujani'],
    inLearning: 'Digital learners are energized by building things — apps, websites, scripts, and interactive media. They learn best by doing, breaking, and rebuilding digital systems.',
    careers: ['Software Engineer', 'AI/ML Engineer', 'UX Designer', 'Cybersecurity Analyst', 'Product Manager', 'Tech Entrepreneur'],
    developTips: ['Build real projects in every new domain you enter', 'Contribute to open-source projects', 'Compete in hackathons and coding competitions', 'Study the ethics and social impact of technology, not just the code', 'Follow tech thinkers who challenge assumptions about how technology shapes society'],
  },
}

export default function IntelligencePage({ params }: { params: { slug: string } }) {
  const intel = INTELLIGENCES.find(i => i.slug === params.slug)
  if (!intel) notFound()

  const details = INTEL_DETAILS[params.slug]
  if (!details) notFound()

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <Link href="/learn" className="text-slate-500 text-sm hover:text-slate-300 transition-colors mb-6 block">
        ← All Intelligences
      </Link>

      <div className="flex items-center gap-4 mb-6">
        <span className="text-5xl">{intel.emoji}</span>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: intel.color }}>{intel.name} Intelligence</h1>
          <p className="text-slate-400 text-sm">{intel.shortDescription}</p>
        </div>
      </div>

      <div className="space-y-6">
        <section className="bg-slate-900 rounded-xl p-5 border border-slate-800">
          <h2 className="text-white font-bold mb-2">What Is It?</h2>
          <p className="text-slate-400 text-sm leading-relaxed">{details.definition}</p>
        </section>

        <section className="bg-slate-900 rounded-xl p-5 border border-slate-800">
          <h2 className="text-white font-bold mb-3">Famous Examples</h2>
          <div className="flex flex-wrap gap-2">
            {details.famousPeople.map(name => (
              <span key={name} className="text-xs px-3 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">{name}</span>
            ))}
          </div>
        </section>

        <section className="bg-slate-900 rounded-xl p-5 border border-slate-800">
          <h2 className="text-white font-bold mb-2">In Learning</h2>
          <p className="text-slate-400 text-sm leading-relaxed">{details.inLearning}</p>
        </section>

        <section className="bg-slate-900 rounded-xl p-5 border border-slate-800">
          <h2 className="text-white font-bold mb-3">Career Paths</h2>
          <div className="flex flex-wrap gap-2">
            {details.careers.map(c => (
              <span key={c} className="text-xs px-3 py-1 rounded-full border text-slate-300 border-slate-600">{c}</span>
            ))}
          </div>
        </section>

        <section className="bg-slate-900 rounded-xl p-5 border border-slate-800">
          <h2 className="text-white font-bold mb-3">How to Develop It</h2>
          <ul className="space-y-2">
            {details.developTips.map(tip => (
              <li key={tip} className="flex items-start gap-2 text-sm text-slate-400">
                <span style={{ color: intel.color }}>→</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className="mt-10 text-center">
        <Link
          href="/assess"
          className="inline-block px-8 py-3 rounded-xl font-semibold text-white transition-colors"
          style={{ backgroundColor: intel.color, color: '#0f172a' }}
        >
          Discover Your Intelligence Profile
        </Link>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Create app/for-educators/page.tsx**

```tsx
// app/for-educators/page.tsx
import Link from 'next/link'

export default function ForEducatorsPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold text-white mb-2">For Educators</h1>
      <p className="text-slate-400 mb-8">
        Use the MindMap MI assessment to understand your students' learning profiles and differentiate your teaching.
      </p>

      <div className="space-y-5">
        {[
          {
            icon: '🎯',
            title: 'Have Students Complete the Assessment',
            body: 'Direct students to the appropriate tier (/assess/elementary, /assess/middle, /assess/highschool). The assessment is fully anonymous — no accounts, no data collected.',
          },
          {
            icon: '📊',
            title: 'Review Individual Profiles',
            body: 'Students can share their results URL (via the Share Results button) with you or print their profile using Export PDF. The printed report includes their hero label, top 3 intelligences, and all 10 scores.',
          },
          {
            icon: '🧩',
            title: 'Differentiate Instruction',
            body: 'Use the Learning Strategies panel in each student\'s results to find study methods matched to their profile. Offer alternative assessment formats (verbal, visual, kinesthetic, musical) based on class intelligence distribution.',
          },
          {
            icon: '💬',
            title: 'Facilitate Class Discussion',
            body: 'Have students share their top intelligences and discuss: "How does your profile show up in how you prefer to work?" This builds metacognition and appreciation for diverse learning styles.',
          },
          {
            icon: '🖨️',
            title: 'Export Student Reports',
            body: 'Students can click "Export PDF" on their results page to generate a printable report with their name. These can be collected for portfolio or discussion purposes.',
          },
          {
            icon: '📚',
            title: 'Recommended Reading',
            body: 'Gardner, H. (1983). Frames of Mind. Basic Books. | Gardner, H. (1999). Intelligence Reframed. Basic Books. | Armstrong, T. (2009). Multiple Intelligences in the Classroom. ASCD.',
          },
        ].map(item => (
          <div key={item.title} className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <div className="flex items-start gap-3">
              <span className="text-2xl">{item.icon}</span>
              <div>
                <h2 className="text-white font-semibold mb-1">{item.title}</h2>
                <p className="text-slate-400 text-sm leading-relaxed">{item.body}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10 text-center">
        <Link
          href="/assess"
          className="inline-block bg-violet-600 hover:bg-violet-500 text-white px-8 py-3 rounded-xl font-semibold transition-colors"
        >
          Take the Assessment Yourself First
        </Link>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Commit**

```bash
git add app/learn/page.tsx app/intelligence/ app/for-educators/page.tsx
git commit -m "feat: learn, intelligence deep-dives, and educator pages"
```

---

## Task 21: Final Build + Smoke Test

**Files:** None — verification only.

- [ ] **Step 1: Run full test suite**

```bash
npm test
```

Expected: All tests in `tests/scoring.test.ts` and `tests/urlState.test.ts` pass.

- [ ] **Step 2: Run production build**

```bash
npm run build
```

Expected: Build completes with no TypeScript errors. Note any warnings about `params` being async in Next.js 15 — if raised, update `[tier]/page.tsx` and `[slug]/page.tsx` to `async function Page({ params }: ...) { const { tier } = await params }`.

- [ ] **Step 3: Smoke test all routes**

```bash
npm run start
```

Check each route:
- [ ] `http://localhost:3000/` — Landing page renders, all 10 intelligence pills show
- [ ] `http://localhost:3000/assess` — 4 tier cards render
- [ ] `http://localhost:3000/assess/elementary` — Wizard loads, all scenario options clickable
- [ ] `http://localhost:3000/assess/middle` — Wizard loads
- [ ] `http://localhost:3000/assess/highschool` — Wizard loads
- [ ] `http://localhost:3000/assess/adult` — Wizard loads
- [ ] Complete full highschool assessment → `/results` page renders with radar chart, top 3, recommendations
- [ ] Export PDF → modal appears → enter name → print dialog opens with name in header
- [ ] Share Results → URL copied to clipboard
- [ ] `/learn` — All 10 intelligences listed with links
- [ ] `/intelligence/musical` — Deep-dive page renders
- [ ] `/for-educators` — Page renders

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "feat: complete MI assessment website v1"
```

---

*End of implementation plan. 21 tasks. Build sequentially; each task's tests and commit create a stable checkpoint before the next task begins.*
