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
