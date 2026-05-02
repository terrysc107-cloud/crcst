'use client'

import { useMemo } from 'react'
import { Tooltip, ResponsiveContainer, Cell } from 'recharts'

interface Props {
  activityData: Array<{ date: string; count: number }>
  weeks?: number
}

function buildGrid(activityData: Array<{ date: string; count: number }>, weeks: number) {
  const map = new Map(activityData.map(d => [d.date, d.count]))

  // Build a grid of the last `weeks` weeks ending on the most recent Sunday
  const today = new Date()
  const dayOfWeek = today.getDay() // 0 = Sun
  const endDate = new Date(today)
  endDate.setDate(today.getDate() - dayOfWeek + 6)  // end on Saturday of current week

  const days: Array<{ date: string; count: number; week: number; dow: number }> = []
  for (let w = weeks - 1; w >= 0; w--) {
    for (let d = 0; d <= 6; d++) {
      const date = new Date(endDate)
      date.setDate(endDate.getDate() - w * 7 - (6 - d))
      const str = date.toISOString().split('T')[0]
      days.push({ date: str, count: map.get(str) ?? 0, week: weeks - 1 - w, dow: d })
    }
  }
  return days
}

function intensity(count: number): string {
  if (count === 0) return 'rgba(255,255,255,0.06)'
  if (count < 5)  return 'rgba(20,189,172,0.3)'
  if (count < 15) return 'rgba(20,189,172,0.6)'
  if (count < 30) return 'rgba(20,189,172,0.85)'
  return '#14BDAC'
}

const DOW_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTH_LABELS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

export default function StreakHeatmap({ activityData, weeks = 26 }: Props) {
  const grid = useMemo(() => buildGrid(activityData, weeks), [activityData, weeks])

  // Find month label positions (first occurrence of each month in the grid)
  const monthPositions = useMemo(() => {
    const seen = new Map<string, number>()
    for (const cell of grid) {
      const month = cell.date.slice(0, 7)
      if (!seen.has(month)) seen.set(month, cell.week)
    }
    return Array.from(seen.entries()).map(([ym, week]) => ({
      label: MONTH_LABELS[parseInt(ym.split('-')[1]) - 1],
      week,
    }))
  }, [grid])

  const CELL = 13
  const GAP  = 2
  const step = CELL + GAP

  const totalWidth  = weeks * step + 30  // 30px for dow labels
  const totalHeight = 7 * step + 20       // 20px for month labels

  return (
    <div style={{ overflowX: 'auto', paddingBottom: '0.5rem' }}>
      <svg
        width={totalWidth}
        height={totalHeight}
        style={{ display: 'block', minWidth: totalWidth }}
      >
        {/* Month labels */}
        {monthPositions.map(({ label, week }) => (
          <text
            key={label + week}
            x={30 + week * step}
            y={10}
            fontSize={9}
            fill="rgba(255,255,255,0.35)"
            fontFamily="monospace"
          >
            {label}
          </text>
        ))}

        {/* Day-of-week labels */}
        {[1, 3, 5].map(dow => (
          <text
            key={dow}
            x={0}
            y={20 + dow * step + CELL / 2 + 3}
            fontSize={8}
            fill="rgba(255,255,255,0.3)"
            fontFamily="monospace"
          >
            {DOW_LABELS[dow]}
          </text>
        ))}

        {/* Cells */}
        {grid.map(cell => (
          <g key={cell.date}>
            <rect
              x={30 + cell.week * step}
              y={20 + cell.dow * step}
              width={CELL}
              height={CELL}
              rx={2}
              fill={intensity(cell.count)}
            />
            <title>
              {cell.date}: {cell.count > 0 ? `${cell.count} questions` : 'No activity'}
            </title>
          </g>
        ))}
      </svg>

      {/* Legend */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.5rem', justifyContent: 'flex-end' }}>
        <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)', fontFamily: 'monospace' }}>Less</span>
        {[0, 3, 10, 20, 35].map(n => (
          <div key={n} style={{ width: 10, height: 10, borderRadius: 2, background: intensity(n) }} />
        ))}
        <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)', fontFamily: 'monospace' }}>More</span>
      </div>
    </div>
  )
}
