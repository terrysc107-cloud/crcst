'use client'

import * as React from 'react'
import * as ProgressPrimitive from '@radix-ui/react-progress'

import { cn } from '@/lib/utils'

type ProgressColor = 'teal' | 'amber' | 'correct'

const indicatorColor: Record<ProgressColor, string> = {
  teal: 'bg-teal',
  amber: 'bg-amber',
  correct: 'bg-correct',
}

const trackColor: Record<ProgressColor, string> = {
  teal: 'bg-teal/20',
  amber: 'bg-amber/20',
  correct: 'bg-correct/20',
}

function Progress({
  className,
  value,
  color = 'teal',
  ...props
}: React.ComponentProps<typeof ProgressPrimitive.Root> & {
  color?: ProgressColor
}) {
  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      className={cn(
        'relative h-2 w-full overflow-hidden rounded-full',
        trackColor[color],
        className,
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        data-slot="progress-indicator"
        className={cn('h-full w-full flex-1 transition-all', indicatorColor[color])}
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      />
    </ProgressPrimitive.Root>
  )
}

export { Progress }
