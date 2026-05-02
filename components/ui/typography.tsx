import { cn } from '@/lib/utils'
import { ElementType, ReactNode } from 'react'

interface TypographyProps {
  as?: ElementType
  className?: string
  children: ReactNode
}

/** Display serif — Libre Baskerville. Use for headings and titles. */
export function Heading({ as: Tag = 'div', className, children }: TypographyProps) {
  return <Tag className={cn('font-serif', className)}>{children}</Tag>
}

/** Body sans — DM Sans (--font-body). Use for prose and UI copy. */
export function Text({ as: Tag = 'p', className, children }: TypographyProps) {
  return (
    <Tag className={cn('[font-family:var(--font-body,ui-sans-serif,system-ui,sans-serif)]', className)}>
      {children}
    </Tag>
  )
}

/** Mono — DM Mono. Use for scores, counts, and numeric stats only. */
export function Numeric({ as: Tag = 'div', className, children }: TypographyProps) {
  return <Tag className={cn('font-mono tabular-nums', className)}>{children}</Tag>
}
