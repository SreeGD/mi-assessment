# 🧠 MindMap MI — Multiple Intelligences Assessment

A free, anonymous web application that assesses your profile across Howard Gardner's **10 Multiple Intelligences**. Select your age tier, complete a 50-question assessment, and receive a personalized results page with a radar chart, ranked intelligence profiles, and tailored recommendations.

---

## ✨ Features

- **10 Intelligences** — All 9 of Gardner's canonical intelligences + Digital (modern addition)
- **4 Age Tiers** — Elementary (K–5), Middle School (6–8), High School (9–12), Adult/College
- **50 Questions per tier** — 10 scenario-based + 40 Likert-scale statements
- **SVG Radar Chart** — Custom-built, no external charting library
- **Shareable Results** — Full profile encoded in URL hash, no server needed
- **PDF Export** — Print your results with your name via browser print dialog
- **Fully Anonymous** — No login, no database, no server-side state
- **Science-Backed** — Based on Howard Gardner's research (1983+)

---

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🏗️ Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 15 (App Router) |
| Styling | Tailwind CSS v4 |
| Charts | Custom SVG (no external library) |
| State | React `useState` + URL hash |
| Data | Static JSON question/recommendation banks |
| TypeScript | Full type safety |
| Testing | Vitest + React Testing Library |

---

## 📁 Project Structure

```
app/
├── page.tsx                    # Landing page
├── assess/
│   ├── page.tsx                # Age tier selector
│   └── [tier]/page.tsx         # Assessment wizard (elementary/middle/highschool/adult)
├── results/page.tsx            # Results page (reads URL hash)
├── learn/page.tsx              # About MI theory
├── intelligence/[slug]/        # 10 deep-dive pages
└── for-educators/page.tsx      # Educator guide

components/
├── assessment/                 # ScenarioQuestion, LikertQuestion, ProgressBar, IntelligenceTracker
└── results/                    # RadarChart, IntelligenceCard, RecommendationPanel, ExportPDFModal

lib/
├── types.ts                    # All TypeScript types
├── intelligences.ts            # Master intelligence list + hero label logic
├── scoring.ts                  # scoreAssessment() — pure function
└── urlState.ts                 # URL hash encode/decode

data/
├── questions/                  # 4 × 50 questions (200 total)
└── recommendations/            # 4 × 10 recommendation sets
```

---

## 🧪 Running Tests

```bash
npm test
```

15 tests covering the scoring algorithm and URL state encoding/decoding.

---

## 🗺️ The 10 Intelligences

| Intelligence | Emoji |
|---|---|
| Linguistic | 📚 |
| Logical-Mathematical | 🔢 |
| Spatial | 🗺️ |
| Musical | 🎵 |
| Bodily-Kinesthetic | 🤸 |
| Interpersonal | 👥 |
| Intrapersonal | 🪞 |
| Naturalist | 🌿 |
| Existential | ✨ |
| Digital *(modern addition)* | 💻 |

---

## 📊 Scoring

- **Scenario questions** — Selecting the correct intelligence option: **4 pts**; each intelligence also appears as a distractor in other questions (max 16 pts from scenarios)
- **Likert statements** — 1–5 scale; reversed items use `score = 6 - raw`; 4 statements per intelligence (max 20 pts)
- **Max per intelligence:** 36 pts → normalized to 0–100%
- **Hero label:** Dual (e.g., "Digital-Musical Thinker") if top 2 are within 10 normalized points; otherwise single

---

## 🌐 Deploying to Vercel

```bash
npx vercel
```

Or connect the GitHub repo at [vercel.com](https://vercel.com) for automatic deployments on every push.

---

## 📄 License

MIT — Free to use, adapt, and share.

---

*Based on Howard Gardner's theory of Multiple Intelligences (1983). The Digital intelligence is a modern extension not part of Gardner's original framework.*
