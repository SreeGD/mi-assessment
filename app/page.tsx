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
