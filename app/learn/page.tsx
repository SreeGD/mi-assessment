// app/learn/page.tsx
import Link from 'next/link'
import { INTELLIGENCES } from '@/lib/intelligences'

export default function LearnPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold text-white mb-2">About Multiple Intelligences</h1>
      <p className="text-slate-400 mb-8">
        Howard Gardner&apos;s theory, introduced in <em>Frames of Mind</em> (1983), proposed that human intelligence is not a single fixed capacity, but a set of distinct cognitive abilities — each with its own developmental arc and neural basis.
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
