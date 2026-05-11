import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

// ─── Heading ──────────────────────────────────────────────────────────────────

const headingVariants = cva('font-display leading-tight tracking-tight', {
  variants: {
    size: {
      '4xl': 'text-4xl',
      '3xl': 'text-3xl',
      '2xl': 'text-2xl',
      xl: 'text-xl',
      lg: 'text-lg',
    },
    weight: {
      normal: 'font-normal',
      semibold: 'font-semibold',
      bold: 'font-bold',
      black: 'font-black',
    },
    color: {
      default: 'text-foreground',
      teal: 'text-teal',
      amber: 'text-amber',
      muted: 'text-text-3',
    },
  },
  defaultVariants: {
    size: '2xl',
    weight: 'bold',
    color: 'default',
  },
})

type HeadingTag = 'h1' | 'h2' | 'h3' | 'h4'

interface HeadingProps
  extends React.HTMLAttributes<HTMLHeadingElement>,
    VariantProps<typeof headingVariants> {
  as?: HeadingTag
}

function Heading({ as: Tag = 'h2', size, weight, color, className, ...props }: HeadingProps) {
  return <Tag className={cn(headingVariants({ size, weight, color }), className)} {...props} />
}

// ─── Text ─────────────────────────────────────────────────────────────────────

const textVariants = cva('font-sans', {
  variants: {
    size: {
      xs: 'text-xs',
      sm: 'text-sm',
      base: 'text-base',
      lg: 'text-lg',
    },
    color: {
      default: 'text-foreground',
      muted: 'text-text-3',
      teal: 'text-teal',
      amber: 'text-amber',
    },
  },
  defaultVariants: {
    size: 'base',
    color: 'default',
  },
})

interface TextProps
  extends React.HTMLAttributes<HTMLParagraphElement>,
    VariantProps<typeof textVariants> {
  as?: 'p' | 'span' | 'div'
}

function Text({ as: Tag = 'p', size, color, className, ...props }: TextProps) {
  return <Tag className={cn(textVariants({ size, color }), className)} {...props} />
}

// ─── Label ────────────────────────────────────────────────────────────────────

const labelVariants = cva('font-mono uppercase tracking-widest', {
  variants: {
    size: {
      xs: 'text-[0.65rem]',
      sm: 'text-xs',
      base: 'text-sm',
    },
    color: {
      default: 'text-foreground',
      teal: 'text-teal',
      amber: 'text-amber',
      muted: 'text-text-3',
    },
  },
  defaultVariants: {
    size: 'xs',
    color: 'muted',
  },
})

interface LabelProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof labelVariants> {
  as?: 'span' | 'div' | 'label'
}

function Label({ as: Tag = 'div', size, color, className, ...props }: LabelProps) {
  return <Tag className={cn(labelVariants({ size, color }), className)} {...props} />
}

// ─── Numeric ──────────────────────────────────────────────────────────────────

const numericVariants = cva('font-mono tabular-nums font-bold', {
  variants: {
    size: {
      sm: 'text-sm',
      base: 'text-base',
      lg: 'text-lg',
      xl: 'text-xl',
      '2xl': 'text-2xl',
      '3xl': 'text-3xl',
      '4xl': 'text-4xl',
      '5xl': 'text-5xl',
    },
    color: {
      default: 'text-foreground',
      teal: 'text-teal',
      amber: 'text-amber',
      muted: 'text-text-3',
    },
  },
  defaultVariants: {
    size: '2xl',
    color: 'default',
  },
})

interface NumericProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof numericVariants> {
  as?: 'span' | 'div'
}

function Numeric({ as: Tag = 'span', size, color, className, ...props }: NumericProps) {
  return <Tag className={cn(numericVariants({ size, color }), className)} {...props} />
}

export { Heading, headingVariants, Text, textVariants, Label, labelVariants, Numeric, numericVariants }
