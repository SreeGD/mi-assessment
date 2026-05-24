// components/results/ExportPDFModal.tsx
'use client'

import { useState, useRef, useEffect } from 'react'

type Props = {
  defaultHeroLabel: string
  onConfirm: (name: string) => void
  onCancel: () => void
}

export function ExportPDFModal({ defaultHeroLabel, onConfirm, onCancel }: Props) {
  const [name, setName] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onConfirm(name.trim())
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
        <div className="text-3xl text-center mb-3">📄</div>
        <h2 className="text-white font-bold text-center text-lg mb-1">Export Your Results</h2>
        <p className="text-slate-400 text-sm text-center mb-5">
          Add your name to personalize the PDF. Leave blank to export anonymously.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-slate-400 text-xs mb-1.5">Your name (optional)</label>
            <input
              ref={inputRef}
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Alex Johnson"
              maxLength={60}
              className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-2.5 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors"
            />
          </div>

          {name.trim() && (
            <div className="bg-slate-800 rounded-lg p-3 text-xs text-slate-400">
              Preview: <span className="text-white">{name.trim()}</span> &mdash; {defaultHeroLabel}
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2.5 rounded-lg border border-slate-700 text-slate-400 text-sm hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold transition-colors"
            >
              Export PDF
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
