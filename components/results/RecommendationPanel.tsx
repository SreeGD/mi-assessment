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

export function RecommendationPanel({ tier, recommendations }: Omit<Props, 'topIntelligence'> & { topIntelligence: IntelligenceKey }) {
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
