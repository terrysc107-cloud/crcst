import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'You Passed — SPD Cert Companion',
  description: 'Claim your sterile processing certification badge and celebrate your achievement.',
  robots: { index: false, follow: false },
}

export default function PassedLayout({ children }: { children: React.ReactNode }) {
  return children
}
