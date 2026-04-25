import Link from 'next/link'

export const metadata = {
  title: 'Terms of Service | SPD Cert Prep',
  description: 'Terms of Service for SPD Cert Prep',
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <Link href="/" className="text-sm text-teal-600 hover:underline mb-8 block">← Back to home</Link>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">Terms of Service</h1>
        <p className="text-sm text-gray-500 mb-10">Last updated: April 25, 2026</p>

        <div className="prose prose-gray max-w-none space-y-8 text-gray-700 leading-relaxed">

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Agreement to Terms</h2>
            <p>By accessing or using SPD Cert Prep ("the Service") at spdcertprep.com, you agree to be bound by these Terms of Service. If you do not agree, do not use the Service. The Service is operated by Scott Advisory Group ("we," "us," or "our").</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Description of Service</h2>
            <p>SPD Cert Prep is an online study and exam preparation platform for sterile processing professionals pursuing CRCST, CER, and CHL certifications through IAHCSMM. We provide practice questions, mock exams, study guides, an AI-powered study assistant, and performance tracking tools.</p>
            <p className="mt-2">We are not affiliated with IAHCSMM or any certifying body. Passing our practice exams does not guarantee passing official certification exams.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">3. Accounts</h2>
            <p>You must provide accurate information when creating an account. You are responsible for maintaining the security of your account and password. You may not share your account with others. We reserve the right to terminate accounts that violate these terms.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Payments and Refund Policy</h2>
            <p>We offer one-time payment plans that provide access to premium features for 90 days from the date of purchase. All payments are processed securely through Stripe.</p>
            <ul className="list-disc list-inside mt-3 space-y-2">
              <li><strong>Pro Plan:</strong> $19 — 90 days of full CRCST exam access</li>
              <li><strong>Triple Crown Plan:</strong> $39 — 90 days of full access for CRCST, CER, and CHL</li>
            </ul>
            <p className="mt-3"><strong>Refund Policy:</strong> We offer a full refund within 7 days of purchase if you are not satisfied, provided you have completed fewer than 50 practice questions. To request a refund, contact us at support@spdcertprep.com. Refunds are processed within 5–10 business days. After 7 days or 50 questions, all sales are final.</p>
            <p className="mt-3">Access expires automatically at the end of your 90-day period. There are no automatic renewals — you will not be charged again without taking explicit action.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Free Tier</h2>
            <p>Free accounts have access to a limited number of practice questions and features per day. We reserve the right to change free tier limits at any time with reasonable notice.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Acceptable Use</h2>
            <p>You agree not to:</p>
            <ul className="list-disc list-inside mt-3 space-y-2">
              <li>Share, resell, or distribute access to the Service</li>
              <li>Attempt to scrape, copy, or redistribute our question bank or content</li>
              <li>Use automated tools or bots to access the Service</li>
              <li>Attempt to circumvent usage limits or payment gates</li>
              <li>Use the AI assistant for any purpose other than exam study</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Intellectual Property</h2>
            <p>All content on the Service, including practice questions, explanations, study materials, and software, is owned by Scott Advisory Group or its licensors and is protected by copyright. You may not reproduce, distribute, or create derivative works without our written permission.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">8. Disclaimer of Warranties</h2>
            <p>The Service is provided "as is" without warranties of any kind, either express or implied. We do not guarantee that the Service will be uninterrupted, error-free, or that practice content will reflect the exact content of official certification exams. Your use of the Service is at your own risk.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">9. Limitation of Liability</h2>
            <p>To the maximum extent permitted by law, Scott Advisory Group shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the Service, including but not limited to failure to pass a certification exam.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">10. Changes to Terms</h2>
            <p>We may update these Terms at any time. We will notify users of material changes by email or by posting a notice on the Service. Continued use after changes constitutes acceptance of the new terms.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">11. Governing Law</h2>
            <p>These Terms are governed by the laws of the State of Maryland, United States, without regard to conflict of law principles.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">12. Contact</h2>
            <p>Questions about these Terms? Contact us at <a href="mailto:support@spdcertprep.com" className="text-teal-600 hover:underline">support@spdcertprep.com</a>.</p>
          </section>

        </div>
      </div>
    </div>
  )
}
