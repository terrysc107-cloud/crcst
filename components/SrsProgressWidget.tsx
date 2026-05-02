'use client'

import type { SrsStats } from '@/lib/dal/srs'

interface SrsProgressWidgetProps {
  srsStats: SrsStats
  totalQuestions: number
}

export default function SrsProgressWidget({ srsStats, totalQuestions }: SrsProgressWidgetProps) {
  return (
    <div className="mx-6 mt-6 p-4 bg-white border border-cream-2 rounded-lg">
      <div className="text-xs tracking-widest text-text-3 mb-3">
        SPACED REPETITION PROGRESS
      </div>
      <div className="flex gap-4">
        <div className="flex-1 text-center">
          <div className="font-serif text-2xl text-correct">{srsStats.mastered}</div>
          <div className="text-xs text-text-3 mt-1">Mastered</div>
        </div>
        <div className="flex-1 text-center">
          <div className="font-serif text-2xl text-amber">{srsStats.learning}</div>
          <div className="text-xs text-text-3 mt-1">Learning</div>
        </div>
        <div className="flex-1 text-center">
          <div className="font-serif text-2xl text-navy">
            {totalQuestions - srsStats.mastered - srsStats.learning}
          </div>
          <div className="text-xs text-text-3 mt-1">New</div>
        </div>
      </div>
      {srsStats.nextDue && (
        <div className="mt-3 text-xs text-text-3 text-center">
          Next review:{' '}
          <span className="text-amber font-mono">
            {new Date(srsStats.nextDue + 'T12:00:00Z').toLocaleDateString(undefined, {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
            })}
          </span>
        </div>
      )}
    </div>
  )
}
