import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Get Started — SPD Cert Companion',
  description: 'Choose your certification and set up your study plan.',
  robots: { index: false, follow: false },
}

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return children
}
