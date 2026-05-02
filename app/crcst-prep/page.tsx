import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "CRCST Practice Questions — Free Exam Prep",
  description:
    "400+ CRCST practice questions aligned to the official HSPA content outline. Master sterilization, decontamination, and instrument processing. Start free today.",
  alternates: { canonical: "https://spdcertprep.com/crcst-prep" },
  openGraph: {
    title: "CRCST Practice Questions — Free Exam Prep | SPD Cert Prep",
    description: "400+ CRCST practice questions mapped to the HSPA content outline with AI-powered study chat.",
    url: "https://spdcertprep.com/crcst-prep",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Course",
  name: "CRCST Certification Exam Prep",
  description:
    "400+ practice questions for the Certified Registered Central Service Technician (CRCST) exam, organized by domain with AI study chat.",
  provider: {
    "@type": "Organization",
    name: "Aseptic Technical Solutions",
    sameAs: "https://spdcertprep.com",
  },
  url: "https://spdcertprep.com/crcst-prep",
  courseMode: ["online", "self-paced"],
  educationalLevel: "professional",
  isAccessibleForFree: true,
  hasCourseInstance: {
    "@type": "CourseInstance",
    courseMode: "online",
  },
};

export default function CrcstPrepPage() {
  return (
    <div className="min-h-screen bg-navy text-white" style={{ fontFamily: "var(--font-dm-sans)" }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Nav */}
      <nav className="px-6 py-4 border-b border-white/7 flex items-center justify-between">
        <Link href="/" className="font-serif text-lg font-bold text-white hover:text-teal transition-colors">
          SPD Cert <em className="not-italic text-teal">Prep</em>
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/crcst" className="text-white/60 text-sm hover:text-white transition-colors">Sign In</Link>
          <Link href="/crcst"
            className="px-4 py-2 rounded-lg text-sm font-semibold text-white"
            style={{ background: "linear-gradient(135deg, var(--teal), var(--teal-2))" }}>
            Start Free
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="inline-flex items-center gap-2 bg-teal/10 border border-teal/30 rounded-full px-4 py-1.5 mb-6">
          <span className="w-2 h-2 rounded-full bg-teal inline-block" />
          <span className="font-mono text-teal text-[0.7rem] font-semibold tracking-widest">CRCST EXAM PREP</span>
        </div>

        <h1 className="text-[clamp(2rem,5vw,3.6rem)] font-black leading-tight mb-6" style={{ fontFamily: "var(--font-display)" }}>
          CRCST Practice Questions
          <br />
          <span className="text-teal">Built for Sterile Processing Professionals</span>
        </h1>

        <p className="text-white/65 text-lg leading-relaxed max-w-2xl mx-auto mb-10">
          The CRCST exam covers 24 content domains and tests your knowledge of sterilization, decontamination, instrument processing, and regulatory compliance. Our 400+ practice questions are mapped directly to the HSPA official content outline so you study exactly what shows up on exam day.
        </p>

        <div className="flex flex-wrap gap-4 justify-center">
          <Link href="/crcst"
            className="px-8 py-4 rounded-xl font-semibold text-lg text-white shadow-lg shadow-teal/25 hover:-translate-y-0.5 transition-all"
            style={{ background: "linear-gradient(135deg, var(--teal), var(--teal-2))" }}>
            Start Free CRCST Practice
          </Link>
          <Link href="/pricing"
            className="px-7 py-4 rounded-xl text-base font-medium border border-white/20 bg-white/5 text-white/80 hover:border-teal/50 hover:text-teal transition-all">
            View Pricing
          </Link>
        </div>
      </section>

      {/* Content */}
      <section className="max-w-3xl mx-auto px-4 py-12 space-y-8">
        <div className="bg-white/[0.03] border border-white/8 rounded-2xl p-8">
          <h2 className="text-2xl font-bold mb-4 text-white" style={{ fontFamily: "var(--font-display)" }}>
            What the CRCST Exam Covers
          </h2>
          <p className="text-white/65 leading-relaxed">
            The Certified Registered Central Service Technician (CRCST) certification is administered by the Healthcare Sterile Processing Association (HSPA). It is the most widely recognized entry-level certification for sterile processing department (SPD) professionals. The exam tests across 24 domains including decontamination procedures, packaging and sterilization, sterile storage, distribution, quality management, and anatomy and physiology of surgical instruments. Candidates must demonstrate both theoretical knowledge and practical understanding of infection prevention best practices.
          </p>
        </div>

        <div className="bg-white/[0.03] border border-white/8 rounded-2xl p-8">
          <h2 className="text-2xl font-bold mb-4 text-white" style={{ fontFamily: "var(--font-display)" }}>
            Why CRCST Practice Questions Matter
          </h2>
          <p className="text-white/65 leading-relaxed">
            Passive reading of the HSPA study guide rarely leads to first-time pass rates. The CRCST exam is application-based — it tests whether you can apply knowledge in realistic scenarios, not just recall definitions. Our CRCST practice questions are written in the same clinical, scenario-driven style as the actual exam. Every question includes a detailed explanation so you understand why the correct answer is correct and why the distractors are wrong. This is how lasting learning happens.
          </p>
        </div>

        <div className="bg-white/[0.03] border border-white/8 rounded-2xl p-8">
          <h2 className="text-2xl font-bold mb-4 text-white" style={{ fontFamily: "var(--font-display)" }}>
            AI-Powered Study Chat for CRCST
          </h2>
          <p className="text-white/65 leading-relaxed">
            When you hit a concept you don't understand — Spaulding Classification, biological indicator protocols, sterilization temperature ranges — our AI Study Chat gives you a plain-language explanation in seconds. Powered by Claude, it's trained on sterile processing content and speaks the language of the CRCST exam. Ask it to quiz you verbally, explain a concept differently, or walk through a step-by-step procedure. It's like having an expert instructor available at 11 PM the night before your exam.
          </p>
        </div>

        <div className="bg-white/[0.03] border border-white/8 rounded-2xl p-8">
          <h2 className="text-2xl font-bold mb-4 text-white" style={{ fontFamily: "var(--font-display)" }}>
            Domain Mastery Tracking for the CRCST
          </h2>
          <p className="text-white/65 leading-relaxed">
            The CRCST exam weights different domains differently. Most candidates are weak in the same two or three areas — regulatory compliance, contamination control, or instrument identification — but they don't know it until they see the exam score report. Our domain mastery dashboard shows your accuracy across all 24 CRCST content domains in real time. You always know which areas need more work before it's too late to fix them. Study smarter, not more hours.
          </p>
        </div>

        <div className="bg-white/[0.03] border border-white/8 rounded-2xl p-8">
          <h2 className="text-2xl font-bold mb-4 text-white" style={{ fontFamily: "var(--font-display)" }}>
            From CRCST to Triple Crown
          </h2>
          <p className="text-white/65 leading-relaxed">
            The CRCST is just the beginning. Most SPD professionals who pass the CRCST go on to pursue the CHL (Certified Healthcare Leader) or CER (Certified Endoscope Reprocessor) certifications. SPD Cert Prep covers all three on a single platform. Once you've claimed your CRCST badge, your study history, domain scores, and AI chat context carry over as you start your next certification journey. One subscription — three certs.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-3xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { value: "400+", label: "CRCST Questions" },
            { value: "24", label: "Content Domains" },
            { value: "Free", label: "To Get Started" },
          ].map((s) => (
            <div key={s.label} className="text-center bg-white/[0.03] border border-white/8 rounded-xl p-5">
              <div className="font-serif text-3xl font-black text-teal mb-1">{s.value}</div>
              <div className="font-mono text-white/45 text-xs tracking-widest uppercase">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Internal links */}
      <section className="max-w-3xl mx-auto px-4 py-10">
        <h2 className="text-xl font-bold mb-5 text-white">Also on SPD Cert Prep</h2>
        <div className="flex flex-wrap gap-3">
          <Link href="/chl-prep" className="px-4 py-2 rounded-lg border border-teal/30 text-teal text-sm hover:bg-teal/10 transition-colors">CHL Exam Prep →</Link>
          <Link href="/cer-prep" className="px-4 py-2 rounded-lg border border-amber/30 text-amber text-sm hover:bg-amber/10 transition-colors">CER Exam Prep →</Link>
          <Link href="/pricing" className="px-4 py-2 rounded-lg border border-white/20 text-white/60 text-sm hover:text-white hover:border-white/40 transition-colors">Pricing →</Link>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 text-center border-t border-white/7">
        <h2 className="text-3xl font-black mb-4" style={{ fontFamily: "var(--font-display)" }}>
          Ready to pass your CRCST?
        </h2>
        <p className="text-white/55 mb-8 max-w-lg mx-auto">Start with 20 free questions per hour — no credit card required. Upgrade anytime for unlimited access.</p>
        <Link href="/crcst"
          className="inline-flex px-8 py-4 rounded-xl font-semibold text-white text-lg shadow-lg shadow-teal/25 hover:-translate-y-0.5 transition-all"
          style={{ background: "linear-gradient(135deg, var(--teal), var(--teal-2))" }}>
          Start CRCST Practice Free →
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/7 px-4 py-8 text-center">
        <div className="flex flex-wrap justify-center gap-6 text-white/35 text-xs font-mono mb-3">
          <Link href="/" className="hover:text-white/60 transition-colors">Home</Link>
          <Link href="/chl-prep" className="hover:text-white/60 transition-colors">CHL Prep</Link>
          <Link href="/cer-prep" className="hover:text-white/60 transition-colors">CER Prep</Link>
          <Link href="/pricing" className="hover:text-white/60 transition-colors">Pricing</Link>
          <Link href="/terms" className="hover:text-white/60 transition-colors">Terms</Link>
          <Link href="/privacy" className="hover:text-white/60 transition-colors">Privacy</Link>
        </div>
        <p className="text-white/20 text-xs font-mono">© 2026 Scott Advisory Group · Aseptic Technical Solutions</p>
      </footer>
    </div>
  );
}
