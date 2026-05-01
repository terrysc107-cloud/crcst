import type { Metadata } from 'next'
import { Inter, Libre_Baskerville, DM_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import FeedbackButton from '@/components/FeedbackButton'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const libreBaskerville = Libre_Baskerville({
  subsets: ['latin'],
  weight: ['400', '700'],
  style: ['normal', 'italic'],
  variable: '--font-libre-baskerville',
  display: 'swap',
})

const dmMono = DM_Mono({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  variable: '--font-dm-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'SPD Cert Prep',
  description: 'Pass your HSPA certification — 790+ verified questions covering CRCST, CHL, and CER with AI study chat.',
  generator: 'Next.js',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${libreBaskerville.variable} ${dmMono.variable}`}>
      <body className="font-sans antialiased bg-background text-foreground">
        {children}
        <FeedbackButton />
        <Analytics />
      </body>
    </html>
  )
}
