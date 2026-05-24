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
