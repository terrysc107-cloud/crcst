import type { Metadata } from 'next'
import { Libre_Baskerville, DM_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import HelpFAB from '@/components/HelpFAB'
import './globals.css'

const libreBaskerville = Libre_Baskerville({
  subsets: ['latin'],
  weight: ['400', '700'],
  style: ['normal', 'italic'],
  variable: '--font-serif',
})

const dmMono = DM_Mono({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  variable: '--font-mono',
})

const SITE_URL = 'https://spdcertprep.com'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'SPD Cert Prep — CRCST, CHL & CER Practice Questions',
    template: '%s | SPD Cert Prep',
  },
  description:
    'Pass your HSPA certification the first time. 787+ exam-aligned questions for CRCST, CHL, and CER with AI-powered study chat and domain mastery tracking.',
  keywords: [
    'CRCST practice questions',
    'CRCST exam prep',
    'CHL certification exam',
    'CER exam prep',
    'sterile processing certification',
    'HSPA exam practice',
    'SPD certification study',
    'CBSPD practice test',
  ],
  authors: [{ name: 'Aseptic Technical Solutions' }],
  creator: 'Scott Advisory Group',
  openGraph: {
    type: 'website',
    siteName: 'SPD Cert Prep',
    title: 'SPD Cert Prep — Pass Your CRCST / CBSPD Certification The First Time',
    description:
      '787+ exam-aligned practice questions for CRCST, CHL, and CER certifications with AI study chat and domain mastery tracking.',
    url: SITE_URL,
    images: [
      {
        url: '/opengraph-image',
        width: 1200,
        height: 630,
        alt: 'SPD Cert Prep — Pass your CRCST / CBSPD certification the first time',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SPD Cert Prep — Pass Your CRCST / CBSPD Certification The First Time',
    description:
      '787+ exam-aligned practice questions for CRCST, CHL, and CER certifications.',
    images: ['/opengraph-image'],
  },
  alternates: {
    canonical: SITE_URL,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
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

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      url: SITE_URL,
      name: 'SPD Cert Prep',
      description: 'CRCST, CHL, and CER certification exam prep for sterile processing professionals.',
      publisher: { '@id': `${SITE_URL}/#organization` },
    },
    {
      '@type': 'Organization',
      '@id': `${SITE_URL}/#organization`,
      name: 'Aseptic Technical Solutions',
      url: SITE_URL,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/icon.svg`,
      },
      contactPoint: {
        '@type': 'ContactPoint',
        email: 'support@spdcertprep.com',
        contactType: 'customer support',
      },
    },
    {
      '@type': 'Course',
      '@id': `${SITE_URL}/crcst-prep#course`,
      name: 'CRCST Certification Exam Prep',
      description:
        'Comprehensive practice question bank and AI study chat for the CRCST (Certified Registered Central Service Technician) exam.',
      provider: { '@id': `${SITE_URL}/#organization` },
      url: `${SITE_URL}/crcst-prep`,
      courseMode: ['online', 'self-paced'],
      educationalLevel: 'professional',
      teaches: 'Sterile processing, decontamination, and instrument reprocessing for CRCST certification',
    },
    {
      '@type': 'Product',
      '@id': `${SITE_URL}/#product`,
      name: 'SPD Cert Prep — Pro Access',
      description:
        'Unlimited CRCST, CHL, and CER practice questions, AI Study Chat, and domain mastery tracking for 90 days.',
      brand: { '@id': `${SITE_URL}/#organization` },
      offers: [
        {
          '@type': 'Offer',
          name: 'Pro',
          price: '19',
          priceCurrency: 'USD',
          availability: 'https://schema.org/InStock',
          url: `${SITE_URL}/pricing`,
        },
        {
          '@type': 'Offer',
          name: 'Triple Crown',
          price: '39',
          priceCurrency: 'USD',
          availability: 'https://schema.org/InStock',
          url: `${SITE_URL}/pricing`,
        },
      ],
    },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${libreBaskerville.variable} ${dmMono.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="font-mono antialiased bg-cream text-text">
        {children}
        <HelpFAB />
        <Analytics />
      </body>
    </html>
  )
}
