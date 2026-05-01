import Link from 'next/link'

export const metadata = {
  title: 'Privacy Policy | SPD Cert Prep',
  description: 'Privacy Policy for SPD Cert Prep',
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <Link href="/" className="text-sm text-teal-600 hover:underline mb-8 block">← Back to home</Link>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
        <p className="text-sm text-gray-500 mb-10">Last updated: April 25, 2026</p>

        <div className="prose prose-gray max-w-none space-y-8 text-gray-700 leading-relaxed">

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Who We Are</h2>
            <p>SPD Cert Prep is operated by Scott Advisory Group. This Privacy Policy explains how we collect, use, and protect your personal information when you use spdcertprep.com ("the Service"). Contact us at <a href="mailto:support@spdcertprep.com" className="text-teal-600 hover:underline">support@spdcertprep.com</a> with any privacy questions.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Information We Collect</h2>
            <p><strong>Account information:</strong> When you register, we collect your email address and the certification track you are studying for.</p>
            <p className="mt-2"><strong>Usage data:</strong> We track your quiz attempts, scores, question history, and study activity to provide performance analytics and personalized feedback.</p>
            <p className="mt-2"><strong>Payment information:</strong> Payments are processed by Stripe. We do not store your credit card number. We retain your Stripe customer ID and subscription status to manage your account.</p>
            <p className="mt-2"><strong>Communications:</strong> If you use the AI study assistant or submit feedback, we store those messages to improve the Service and respond to your requests.</p>
            <p className="mt-2"><strong>Technical data:</strong> We may collect your IP address, browser type, device type, and pages visited for security and analytics purposes.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">3. How We Use Your Information</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>To provide and operate the Service</li>
              <li>To track your study progress and display performance analytics</li>
              <li>To process payments and manage subscription access</li>
              <li>To respond to your support requests and feedback</li>
              <li>To send transactional emails (account confirmation, payment receipts)</li>
              <li>To improve our question bank and study materials</li>
              <li>To detect and prevent fraud or abuse</li>
            </ul>
            <p className="mt-3">We do not sell your personal information to third parties.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Third-Party Services</h2>
            <p>We use the following third-party services, each with their own privacy policies:</p>
            <ul className="list-disc list-inside mt-3 space-y-2">
              <li><strong>Supabase</strong> — database and authentication hosting</li>
              <li><strong>Stripe</strong> — payment processing</li>
              <li><strong>Anthropic</strong> — AI assistant (Claude) for study coaching</li>
              <li><strong>Vercel</strong> — hosting and deployment</li>
              <li><strong>PostHog</strong> — product analytics</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Data Retention</h2>
            <p>We retain your account data and study history for as long as your account is active. If you request account deletion, we will delete your personal data within 30 days, except where retention is required by law (e.g., payment records).</p>
            <p className="mt-2">To request deletion, email <a href="mailto:support@spdcertprep.com" className="text-teal-600 hover:underline">support@spdcertprep.com</a>.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Data Security</h2>
            <p>We use industry-standard security measures including encrypted connections (HTTPS), hashed passwords via Supabase Auth, and row-level security on our database. No method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Your Rights</h2>
            <p>You have the right to:</p>
            <ul className="list-disc list-inside mt-3 space-y-2">
              <li>Access the personal data we hold about you</li>
              <li>Correct inaccurate data</li>
              <li>Request deletion of your account and data</li>
              <li>Object to or restrict certain processing</li>
              <li>Export your data in a portable format</li>
            </ul>
            <p className="mt-3">To exercise these rights, contact us at <a href="mailto:support@spdcertprep.com" className="text-teal-600 hover:underline">support@spdcertprep.com</a>.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">8. Children's Privacy</h2>
            <p>The Service is intended for adults pursuing professional certification. We do not knowingly collect personal information from children under 13. If you believe a child has provided us with personal information, contact us immediately.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">9. Changes to This Policy</h2>
            <p>We may update this Privacy Policy from time to time. We will notify you of material changes by email or by posting a notice on the Service. Continued use after changes constitutes acceptance of the updated policy.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">10. Contact</h2>
            <p>Privacy questions or requests: <a href="mailto:support@spdcertprep.com" className="text-teal-600 hover:underline">support@spdcertprep.com</a></p>
            <p className="mt-1">Scott Advisory Group — Baltimore, Maryland, USA</p>
          </section>

        </div>
      </div>
    </div>
  )
}
