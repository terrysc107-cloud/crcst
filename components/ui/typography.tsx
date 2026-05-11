import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

// ── Heading ──────────────────────────────────────────────────────────────────
const headingVariants = cva('font-display font-black leading-tight tracking-tight', {
  variants: {
    size: {
      '4xl': 'text-[clamp(2.2rem,5vw,3.5rem)]',
      '3xl': 'text-[clamp(1.8rem,4vw,2.8rem)]',
      '2xl': 'text-[clamp(1.5rem,3.5vw,2.2rem)]',
      xl:   'text-[clamp(1.3rem,3vw,1.9rem)]',
      lg:   'text-xl',
      md:   'text-lg',
      sm:   'text-base',
    },
    color: {
      default: 'text-navy',
      white:   'text-white',
      teal:    'text-teal',
      amber:   'text-amber',
      muted:   'text-text-3',
    },
  },
  defaultVariants: { size: '2xl', color: 'default' },
})

export function Heading({
  as: Tag = 'h2',
  className,
  size,
  color,
  children,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement> &
  VariantProps<typeof headingVariants> & {
    as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
  }) {
  return (
    <Tag className={cn(headingVariants({ size, color }), className)} {...props}>
      {children}
    </Tag>
  )
}

// ── Text ─────────────────────────────────────────────────────────────────────
const textVariants = cva('font-sans', {
  variants: {
    size: {
      xl:  'text-[1.15rem]',
      lg:  'text-[1rem]',
      md:  'text-[0.95rem]',
      sm:  'text-sm',
      xs:  'text-xs',
      '2xs': 'text-[0.72rem]',
    },
    color: {
      default: 'text-text',
      muted:   'text-text-2',
      faint:   'text-text-3',
      white:   'text-white',
      'white-muted': 'text-white/60',
      teal:    'text-teal',
      amber:   'text-amber',
    },
    weight: {
      light:    'font-light',
      normal:   'font-normal',
      medium:   'font-medium',
      semibold: 'font-semibold',
      bold:     'font-bold',
    },
    leading: {
      tight:   'leading-tight',
      snug:    'leading-snug',
      normal:  'leading-normal',
      relaxed: 'leading-relaxed',
    },
  },
  defaultVariants: { size: 'md', color: 'default', weight: 'normal', leading: 'relaxed' },
})

export function Text({
  as: Tag = 'p',
  className,
  size,
  color,
  weight,
  leading,
  children,
  ...props
}: React.HTMLAttributes<HTMLElement> &
  VariantProps<typeof textVariants> & {
    as?: 'p' | 'span' | 'div' | 'li'
  }) {
  return (
    <Tag className={cn(textVariants({ size, color, weight, leading }), className)} {...props}>
      {children}
    </Tag>
  )
}

// ── Label (section label / eyebrow) ──────────────────────────────────────────
const labelVariants = cva('font-mono tracking-widest uppercase', {
  variants: {
    size: { sm: 'text-[0.68rem]', md: 'text-[0.72rem]', lg: 'text-[0.8rem]' },
    color: {
      teal:  'text-teal',
      amber: 'text-amber',
      muted: 'text-text-3',
      'white-muted': 'text-white/45',
    },
  },
  defaultVariants: { size: 'md', color: 'teal' },
})

export function Label({
  as: Tag = 'p',
  className,
  size,
  color,
  children,
  ...props
}: React.HTMLAttributes<HTMLElement> &
  VariantProps<typeof labelVariants> & {
    as?: 'p' | 'span' | 'div'
  }) {
  return (
    <Tag className={cn(labelVariants({ size, color }), className)} {...props}>
      {children}
    </Tag>
  )
}

// ── Numeric ───────────────────────────────────────────────────────────────────
const numericVariants = cva('font-mono tabular-nums', {
  variants: {
    size: {
      '3xl': 'text-3xl font-black',
      '2xl': 'text-2xl font-bold',
      xl:    'text-xl font-bold',
      lg:    'text-lg font-semibold',
      md:    'text-base font-semibold',
      sm:    'text-sm font-medium',
      xs:    'text-xs font-medium',
    },
    color: {
      default: 'text-navy',
      teal:    'text-teal',
      amber:   'text-amber',
      white:   'text-white',
      muted:   'text-text-3',
    },
  },
  defaultVariants: { size: 'lg', color: 'teal' },
})

export function Numeric({
  as: Tag = 'span',
  className,
  size,
  color,
  children,
  ...props
}: React.HTMLAttributes<HTMLElement> &
  VariantProps<typeof numericVariants> & {
    as?: 'span' | 'div' | 'p'
  }) {
  return (
    <Tag className={cn(numericVariants({ size, color }), className)} {...props}>
      {children}
    </Tag>
  )
}
