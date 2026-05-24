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
