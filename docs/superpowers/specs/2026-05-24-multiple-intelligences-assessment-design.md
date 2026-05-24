# Multiple Intelligences Assessment Website — Design Spec
**Date:** 2026-05-24  
**Status:** Approved  
**Stack:** Next.js App Router (pure frontend, no backend)

---

## Overview

A free, anonymous web application that assesses an individual's profile across Howard Gardner's 10 Multiple Intelligences (classic 9 + Digital). Users select their age tier, complete a mixed-format assessment, and receive a personalized results page with a radar chart, ranked intelligence profiles, and tailored recommendations. The site serves students (K–12), adults, educators, parents, and career-seekers.

**Core principles:**
- Fully anonymous — no login, no database, no server-side state
- Age-appropriate — 4 separate question banks tuned to each tier
- Actionable results — not just scores, but learning strategies, career paths, and subject recommendations
- Frictionless — results computed entirely in the browser; shareable via URL hash

---

## The 10 Intelligences

| # | Intelligence | Emoji | Description |
|---|---|---|---|
| 1 | Linguistic | 📚 | Sensitivity to spoken/written language; love of words |
| 2 | Logical-Mathematical | 🔢 | Ability to analyze problems logically, think abstractly |
| 3 | Spatial | 🗺️ | Capacity to think in three dimensions, visualize |
| 4 | Musical | 🎵 | Skill in recognizing and creating rhythm, pitch, timbre |
| 5 | Bodily-Kinesthetic | 🤸 | Expertise in using one's body, hand-eye coordination |
| 6 | Interpersonal | 👥 | Capacity to understand others' intentions and motivations |
| 7 | Intrapersonal | 🪞 | Capacity to understand oneself, feelings, motivations |
| 8 | Naturalist | 🌿 | Ability to recognize and categorize natural objects |
| 9 | Existential | ✨ | Sensitivity to deep questions about existence and meaning |
| 10 | Digital | 💻 | Fluency with technology, digital systems, and tools *(modern addition)* |

---

## Age Tiers

| Tier | Route | Ages | Grades | Question Style |
|---|---|---|---|---|
| Elementary | `/assess/elementary` | 5–10 | K–5 | Short prompts, emoji choices, very simple vocabulary |
| Middle School | `/assess/middle` | 11–13 | 6–8 | Relatable school/hobby scenarios, casual tone |
| High School | `/assess/highschool` | 14–18 | 9–12 | Self-reflective, identity/future-aware framing |
| Adult / College | `/assess/adult` | 18+ | College+ | Professional/career lens, workplace scenarios |

---

## Site Architecture

```
/                           Landing page
/assess                     Age tier selector
/assess/elementary          Assessment wizard — Elementary
/assess/middle              Assessment wizard — Middle School
/assess/highschool          Assessment wizard — High School
/assess/adult               Assessment wizard — Adult
/results                    Results page (scores passed via URL hash)
/learn                      About Gardner's MI theory
/intelligence/[slug]        Deep-dive page per intelligence (10 pages)
/for-educators              How to use MI assessment in the classroom
```

---

## Pages

### `/` — Landing Page

**Purpose:** Introduce the tool, build trust, drive users to start the assessment.

**Sections:**
1. **Nav** — Logo, About, For Educators, Learn More
2. **Hero** — Headline ("Discover How *You* Are Intelligent"), subheading, primary CTA button ("Take the Free Assessment"), social proof line ("Free · Anonymous · Science-Backed · No sign-up required")
3. **Intelligence pills** — all 10 intelligences shown with emoji and color-coded badges
4. **How it works** — 3-step strip: Pick Your Level → Answer Questions (~10–15 min) → Get Your Profile
5. **Footer** — Attribution to Gardner's research, audience callouts

---

### `/assess` — Age Tier Selector

**Purpose:** Route users to the right question bank.

**Layout:** 2×2 grid of tier cards, each showing:
- Emoji icon + color-coded border
- Tier name + age/grade range badge
- One-line description of question style
- Attribute tags (tone descriptor, estimated time)

**Footer strip:** "🔒 No sign-up needed · Results stay in your browser · Completely free"

---

### `/assess/[tier]` — Assessment Wizard

**Purpose:** Deliver the assessment in two sequential steps.

**Step 1 — Scenario Questions (10 questions, one per intelligence)**
- Situational prompt (e.g., "You have a free afternoon. What do you naturally do?")
- Each question is anchored to one intelligence; 4 options where one clearly maps to that intelligence and three are distractors from other intelligences
- Emoji per option, single-select, tap/click to choose
- Progress bar showing question X of 10

**Step 2 — Likert Statements (40 questions, 4 per intelligence)**
- Intelligence badge shown (e.g., "🌿 Naturalist Intelligence")
- First-person statement to rate on a 1–5 scale
- 5 circular buttons labeled 1–5 with "Strongly Disagree" / "Strongly Agree" anchors
- Mini intelligence progress tracker showing which of the 10 have been covered
- Progress bar showing X of 40 + overall % complete

**Both steps:**
- Back/Next navigation buttons
- No question skipping (Next disabled until answered)
- Smooth transition between questions
- After final question: brief processing screen ("Calculating your profile...") → redirect to `/results`

**Question bank structure (per tier JSON):**
```ts
type ScenarioQuestion = {
  id: string          // e.g. "ms-s-03"
  type: "scenario"
  prompt: string
  options: {
    text: string
    emoji: string
    intelligence: IntelligenceKey
  }[]
}

type LikertQuestion = {
  id: string          // e.g. "hs-l-21"
  type: "likert"
  intelligence: IntelligenceKey
  statement: string
  reverse: boolean    // if true, score = 6 - raw value
}
```

**Question counts:** 10 scenario + 40 Likert = 50 questions per tier. Total content: ~200 questions across 4 tiers.

---

### `/results` — Results Page

**Purpose:** Deliver the user's intelligence profile with context and actionable guidance.

**Data source:** Scores encoded in URL hash (e.g., `#scores=musical:92,spatial:85,...&tier=highschool`). No server, no storage.

**Sections:**

1. **Actions bar** — Print, Share Results (copy URL), Retake
2. **Hero banner** — Personalized label ("You're a Musical-Spatial Thinker") + one-line character description. Gradient background.
3. **Two-column layout:**
   - *Left:* SVG radar/spider chart showing all 10 intelligence scores
   - *Right:* Top 3 intelligence cards — each with rank, emoji, name, score %, score bar, and 2-sentence description
4. **Recommendations strip (3 panels, tier-adapted):**
   - Learning Strategies — study tips matched to top intelligences
   - Career Paths — role suggestions relevant to top profile + age tier
   - Subjects to Lean Into — academic subjects to pursue
5. **Full breakdown** — expandable/scrollable section showing all 10 intelligence scores in rank order
6. **Footer CTAs** — "For Educators" view, links to `/intelligence/[slug]` deep dives

**Recommendation content** is stored in `data/recommendations/[tier].json`, keyed by intelligence, so it adapts both to tier and to which intelligences ranked highest.

---

### `/learn` — About MI Theory

Static educational page covering:
- Gardner's original 1983 research and subsequent additions
- Why multiple intelligences matter for learning and self-understanding
- Brief description of each of the 10 intelligences
- Links to `/intelligence/[slug]` for deeper reading

---

### `/intelligence/[slug]` — Intelligence Deep-Dives (10 pages)

Each page covers one intelligence:
- Definition and what it looks and feels like
- Famous people known for this intelligence
- How this intelligence shows up in learning
- Careers and activities that draw on it
- Tips for developing it further
- CTA to take the assessment

**Slugs:** `linguistic`, `logical-mathematical`, `spatial`, `musical`, `bodily-kinesthetic`, `interpersonal`, `intrapersonal`, `naturalist`, `existential`, `digital`

---

### `/for-educators` — Educator Guide

- How to use MI assessment in classroom settings
- Printable class result summaries (browser print)
- Tips for differentiating instruction by intelligence profile
- Link to have students complete the assessment

---

## Scoring Algorithm

Pure client-side function: `scoreAssessment(answers: Answer[], tier: Tier): IntelligenceScore[]`

**Scoring rules:**
1. **Scenario questions** — 10 questions, one per intelligence. Selecting the answer mapped to that intelligence awards **4 points**; selecting a distractor awards **0 points**
2. **Likert questions** — raw value 1–5; if `reverse: true`, score = `6 - raw`; 4 questions per intelligence
3. **Raw max per intelligence** = 4 (scenario) + 20 (Likert: 4 × 5 max) = **24 points**
4. **Normalize** to 0–100%: `normalized = Math.round((raw / 24) * 100)`
5. **Rank** all 10 from highest to lowest
6. **Top 3** drive the hero label, recommendation content, and result card highlights

**Hero label generation:**
- Top 1 intelligence only → `"You're a [Intelligence] Thinker"` (e.g., "You're a Musical Thinker")
- Top 2 intelligences within 10 points of each other → `"You're a [#1]-[#2] Thinker"` (e.g., "You're a Musical-Spatial Thinker")
- The one-line character description is looked up from `data/recommendations/[tier].json` using the top intelligence as key

**URL encoding for sharing:**
```
/results#t=highschool&s=musical:92,spatial:85,digital:78,linguistic:71,...
```
Decoded on the results page — no server needed, link is fully shareable.

---

## Data Files

```
data/
├── questions/
│   ├── elementary.json     # 50 questions (10 scenario + 40 Likert), K-5 vocabulary
│   ├── middle.json         # 50 questions, grades 6-8 scenarios
│   ├── highschool.json     # 50 questions, self-reflective
│   └── adult.json          # 50 questions, career/workplace framing
└── recommendations/
    ├── elementary.json     # Learning strategies + activity suggestions per intelligence
    ├── middle.json         # Learning strategies + subject suggestions
    ├── highschool.json     # Learning strategies + career paths + subjects
    └── adult.json          # Career paths + professional development + workplace tips
```

---

## Project Structure

```
/
├── app/
│   ├── page.tsx                        # Landing page
│   ├── assess/
│   │   ├── page.tsx                    # Tier selector
│   │   ├── elementary/page.tsx
│   │   ├── middle/page.tsx
│   │   ├── highschool/page.tsx
│   │   └── adult/page.tsx
│   ├── results/page.tsx
│   ├── learn/page.tsx
│   ├── intelligence/
│   │   └── [slug]/page.tsx
│   └── for-educators/page.tsx
│
├── components/
│   ├── assessment/
│   │   ├── ScenarioQuestion.tsx        # Single scenario question UI
│   │   ├── LikertQuestion.tsx          # Single Likert question UI
│   │   ├── ProgressBar.tsx             # Step + overall progress
│   │   └── IntelligenceTracker.tsx     # Mini 10-badge progress strip
│   └── results/
│       ├── RadarChart.tsx              # SVG radar chart, no external lib
│       ├── IntelligenceCard.tsx        # Ranked intelligence card with score bar
│       └── RecommendationPanel.tsx     # Learning / career / subject panel
│
├── lib/
│   ├── scoring.ts                      # scoreAssessment() — pure function
│   ├── types.ts                        # All TypeScript types
│   ├── intelligences.ts                # Master list: 10 intelligences + metadata
│   └── urlState.ts                     # Encode/decode scores in URL hash
│
└── data/
    ├── questions/
    │   ├── elementary.json
    │   ├── middle.json
    │   ├── highschool.json
    │   └── adult.json
    └── recommendations/
        ├── elementary.json
        ├── middle.json
        ├── highschool.json
        └── adult.json
```

---

## Tech Stack

| Layer | Choice | Rationale |
|---|---|---|
| Framework | Next.js 15 (App Router) | Static-friendly, great for SEO, Vercel-native |
| Styling | Tailwind CSS v4 | Utility-first, fast iteration |
| Charts | Custom SVG | No Recharts/D3 dependency; radar chart is simple enough to build in SVG |
| State | React `useState` / URL hash | No Zustand/Redux needed; wizard state is local, results passed via URL |
| Data | Static JSON | No database; all question/recommendation content is bundled |
| Deployment | Vercel (or any static host) | Zero-config, free tier sufficient |
| TypeScript | Yes | Full type safety on question banks, scores, and recommendations |

---

## Key Design Decisions

1. **No backend, no auth, no database** — reduces complexity dramatically; results live in URL hash enabling sharing without persistence
2. **Separate question banks per tier** — enables genuinely age-native questions rather than vocabulary-swapped versions of the same content
3. **SVG radar chart** — avoids heavy charting library for a shape that's simple to build; no runtime dependency
4. **URL hash for result sharing** — `#t=highschool&s=musical:92,...` encodes the full profile; shareable, bookmarkable, zero server cost
5. **Recommendations as data** — `data/recommendations/[tier].json` means career/study tips can be updated without touching component code
6. **10 intelligences including Digital** — extends Gardner's canonical 9 with a modern Digital intelligence relevant for career guidance in 2025+

---

## Out of Scope (v1)

- User accounts and saved history
- Teacher dashboards or class management
- PDF export (browser print suffices for v1)
- Retake comparison / score delta over time
- Internationalization / multi-language support
- Admin CMS for question editing
