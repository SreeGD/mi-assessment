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
  'logical-mathematical': {
    definition: 'Logical-mathematical intelligence is the capacity to think conceptually and abstractly, to discern logical or numerical patterns, and to reason through complex problem chains.',
    famousPeople: ['Albert Einstein', 'Ada Lovelace', 'Stephen Hawking', 'Alan Turing', 'Marie Curie'],
    inLearning: 'Logical learners thrive with structured problem-solving, experiments, and systems thinking. They excel at finding patterns, working with data, and reasoning from first principles.',
    careers: ['Software Engineer', 'Mathematician', 'Data Scientist', 'Doctor', 'Actuary', 'Financial Analyst', 'Research Scientist'],
    developTips: ['Practice mental math and logic puzzles daily', 'Learn to code — programming makes abstract logic concrete', 'Study statistics and probability', 'Play chess or strategy games', 'Break every problem down into its component parts'],
  },
  spatial: {
    definition: 'Spatial intelligence is the capacity to perceive the visual-spatial world accurately, to transform and recreate perceptions, and to think in three-dimensional terms.',
    famousPeople: ['Leonardo da Vinci', 'Frank Lloyd Wright', "Georgia O'Keeffe", 'Elon Musk', 'Pablo Picasso'],
    inLearning: 'Spatial learners excel with maps, diagrams, charts, and visual representations. They learn best through drawing, modeling, and visualizing concepts before reading about them.',
    careers: ['Architect', 'Graphic Designer', 'Surgeon', 'Pilot', 'Film Director', 'Urban Planner', 'UX Designer'],
    developTips: ['Draw concept maps and diagrams for everything you study', 'Explore drawing, painting, or 3D modeling', 'Study architecture, design, or photography', 'Navigate without GPS — build your internal map', 'Watch documentaries and visual explanations over text'],
  },
  musical: {
    definition: 'Musical intelligence is the capacity to perceive, discriminate, transform, and express musical forms — including sensitivity to rhythm, pitch, timbre, and the emotional power of sound.',
    famousPeople: ['Mozart', 'Beyoncé', 'Ludwig van Beethoven', 'Björk', 'John Coltrane'],
    inLearning: 'Musical learners often memorize through song and rhythm, respond strongly to the acoustic environment, and find deep engagement through music composition and analysis.',
    careers: ['Musician', 'Music Producer', 'Composer', 'Music Therapist', 'Audio Engineer', 'Sound Designer', 'Music Educator'],
    developTips: ['Learn an instrument — even basic music theory transforms your listening', 'Use music mnemonics to memorize anything', "Compose short pieces to express ideas you can't put into words", 'Study music theory to understand what you hear intuitively', 'Attend live performances across genres'],
  },
  'bodily-kinesthetic': {
    definition: "Bodily-kinesthetic intelligence is the capacity to use one's body skillfully — to handle objects with precision, and to use the body to express ideas or feelings.",
    famousPeople: ['Serena Williams', 'Mikhail Baryshnikov', 'Muhammad Ali', 'Simone Biles', 'Charlie Chaplin'],
    inLearning: 'Bodily-kinesthetic learners retain information best through movement, hands-on activities, and physical demonstrations. They need to do — not just observe.',
    careers: ['Surgeon', 'Physical Therapist', 'Athlete', 'Chef', 'Dancer', 'Firefighter', 'Craftsperson'],
    developTips: ['Take movement breaks every 30 minutes while studying', 'Learn through building, crafting, and physical models', 'Study martial arts, dance, or a sport to develop body awareness', 'Use hands-on internships and apprenticeships as learning tools', 'Act out historical events, stories, and scientific processes'],
  },
  interpersonal: {
    definition: "Interpersonal intelligence is the capacity to understand other people — their moods, motivations, intentions, and desires — and to work effectively with them.",
    famousPeople: ['Nelson Mandela', 'Oprah Winfrey', 'Martin Luther King Jr.', 'Mother Teresa', 'Barack Obama'],
    inLearning: 'Interpersonal learners thrive in group settings, collaborative projects, and teaching others. They learn through discussion, debate, and social problem-solving.',
    careers: ['Therapist', 'Manager', 'Social Worker', 'Teacher', 'HR Leader', 'Politician', 'Mediator'],
    developTips: ["Practice active listening — focus fully, don't plan your response", 'Seek out diverse social environments and perspectives', 'Study psychology, sociology, and human behavior', "Teach or mentor others — it's the best way to solidify knowledge", 'Volunteer for leadership roles in group settings'],
  },
  intrapersonal: {
    definition: "Intrapersonal intelligence is the capacity to understand oneself — to have an accurate model of oneself including one's desires, fears, strengths, and weaknesses — and to use that understanding to regulate one's life.",
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
    developTips: ['Read foundational philosophy — Plato, Nietzsche, Camus, de Beauvoir', 'Journal about your evolving worldview and its contradictions', "Engage with faith traditions — even ones you don't hold", 'Study the history of ideas across cultures and centuries', 'Ask "why does this matter?" for everything you encounter'],
  },
  digital: {
    definition: 'Digital intelligence is the fluency to work with digital systems, computational tools, and networked information — to create, debug, and reimagine digital artifacts, and to understand how technology shapes human experience.',
    famousPeople: ['Ada Lovelace', 'Tim Berners-Lee', 'Grace Hopper', 'Linus Torvalds', 'Reshma Saujani'],
    inLearning: 'Digital learners are energized by building things — apps, websites, scripts, and interactive media. They learn best by doing, breaking, and rebuilding digital systems.',
    careers: ['Software Engineer', 'AI/ML Engineer', 'UX Designer', 'Cybersecurity Analyst', 'Product Manager', 'Tech Entrepreneur'],
    developTips: ['Build real projects in every new domain you enter', 'Contribute to open-source projects', 'Compete in hackathons and coding competitions', 'Study the ethics and social impact of technology, not just the code', 'Follow tech thinkers who challenge assumptions about how technology shapes society'],
  },
}

export default async function IntelligencePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const intel = INTELLIGENCES.find(i => i.slug === slug)
  if (!intel) notFound()

  const details = INTEL_DETAILS[slug]
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
          className="inline-block px-8 py-3 rounded-xl font-semibold text-slate-900 transition-colors"
          style={{ backgroundColor: intel.color }}
        >
          Discover Your Intelligence Profile
        </Link>
      </div>
    </div>
  )
}
