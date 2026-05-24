// app/for-educators/page.tsx
import Link from 'next/link'

export default function ForEducatorsPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold text-white mb-2">For Educators</h1>
      <p className="text-slate-400 mb-8">
        Use the MindMap MI assessment to understand your students&apos; learning profiles and differentiate your teaching.
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
            body: "Use the Learning Strategies panel in each student's results to find study methods matched to their profile. Offer alternative assessment formats (verbal, visual, kinesthetic, musical) based on class intelligence distribution.",
          },
          {
            icon: '💬',
            title: 'Facilitate Class Discussion',
            body: "Have students share their top intelligences and discuss: \"How does your profile show up in how you prefer to work?\" This builds metacognition and appreciation for diverse learning styles.",
          },
          {
            icon: '🖨️',
            title: 'Export Student Reports',
            body: 'Students can click &quot;Export PDF&quot; on their results page to generate a printable report with their name. These can be collected for portfolio or discussion purposes.',
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
