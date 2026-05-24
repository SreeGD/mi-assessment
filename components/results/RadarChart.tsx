// components/results/RadarChart.tsx

import { INTELLIGENCES } from '@/lib/intelligences'
import type { IntelligenceScore } from '@/lib/types'

type Props = {
  scores: IntelligenceScore[]
}

const SIZE = 200
const CENTER = SIZE / 2
const MAX_RADIUS = 80
const N = 10

function polarToCartesian(angle: number, radius: number) {
  const rad = (angle - 90) * (Math.PI / 180)
  return {
    x: CENTER + radius * Math.cos(rad),
    y: CENTER + radius * Math.sin(rad),
  }
}

function buildPolygon(radii: number[]): string {
  return radii
    .map((r, i) => {
      const angle = (360 / N) * i
      const { x, y } = polarToCartesian(angle, r)
      return `${x},${y}`
    })
    .join(' ')
}

const GRID_LEVELS = [0.25, 0.5, 0.75, 1]

export function RadarChart({ scores: rawScores }: Props) {
  const scoreMap = Object.fromEntries(rawScores.map(s => [s.intelligence, s.normalized]))
  const ordered = INTELLIGENCES.map(i => ({
    ...i,
    normalized: scoreMap[i.key] ?? 0,
  }))

  const dataRadii = ordered.map(i => (i.normalized / 100) * MAX_RADIUS)
  const dataPolygon = buildPolygon(dataRadii)

  return (
    <div className="bg-slate-800 rounded-xl p-4 text-center">
      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} width="100%" className="max-w-[220px] mx-auto block">
        {GRID_LEVELS.map(level => (
          <polygon
            key={level}
            points={buildPolygon(Array(N).fill(MAX_RADIUS * level))}
            fill="none"
            stroke="#334155"
            strokeWidth="0.8"
          />
        ))}

        {INTELLIGENCES.map((_, i) => {
          const angle = (360 / N) * i
          const outer = polarToCartesian(angle, MAX_RADIUS)
          return (
            <line
              key={i}
              x1={CENTER} y1={CENTER}
              x2={outer.x} y2={outer.y}
              stroke="#334155"
              strokeWidth="0.5"
            />
          )
        })}

        <polygon
          points={dataPolygon}
          fill="rgba(99,102,241,0.2)"
          stroke="#6366f1"
          strokeWidth="1.5"
        />

        {ordered.map((intel, i) => {
          const angle = (360 / N) * i
          const r = (intel.normalized / 100) * MAX_RADIUS
          const dot = polarToCartesian(angle, r)
          const label = polarToCartesian(angle, MAX_RADIUS + 14)
          return (
            <g key={intel.key}>
              <circle cx={dot.x} cy={dot.y} r="3" fill={intel.color} />
              <text
                x={label.x}
                y={label.y}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="7"
                fill={intel.color}
              >
                {intel.emoji}
              </text>
            </g>
          )
        })}
      </svg>
      <p className="text-slate-500 text-xs mt-2">All 10 intelligences</p>
    </div>
  )
}
