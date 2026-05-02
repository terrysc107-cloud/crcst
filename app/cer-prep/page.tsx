import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "CER Exam Prep — Certified Endoscope Reprocessor Practice Questions",
  description:
    "147+ CER practice questions for the Certified Endoscope Reprocessor certification exam. Master flexible and rigid endoscope reprocessing protocols. Start free.",
  alternates: { canonical: "https://spdcertprep.com/cer-prep" },
  openGraph: {
    title: "CER Exam Prep — Certified Endoscope Reprocessor | SPD Cert Prep",
    description: "147+ CER practice questions covering all 16 course chapters with AI-powered study chat.",
    url: "https://spdcertprep.com/cer-prep",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Course",
  name: "CER Certification Exam Prep",
  description:
    "147+ practice questions for the Certified Endoscope Reprocessor (CER) exam, covering all 16 HSPA course chapters including flexible and rigid endoscope reprocessing.",
  provider: {
    "@type": "Organization",
    name: "Aseptic Technical Solutions",
    sameAs: "https://spdcertprep.com",
  },
  url: "https://spdcertprep.com/cer-prep",
  courseMode: ["online", "self-paced"],
  educationalLevel: "professional",
  isAccessibleForFree: true,
};

export default function CerPrepPage() {
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
        <div className="inline-flex items-center gap-2 bg-amber/10 border border-amber/30 rounded-full px-4 py-1.5 mb-6">
          <span className="w-2 h-2 rounded-full bg-amber inline-block" />
          <span className="font-mono text-amber text-[0.7rem] font-semibold tracking-widest">CER EXAM PREP</span>
        </div>

        <h1 className="text-[clamp(2rem,5vw,3.6rem)] font-black leading-tight mb-6" style={{ fontFamily: "var(--font-display)" }}>
          CER Practice Questions
          <br />
          <span className="text-amber">Master Endoscope Reprocessing</span>
        </h1>

        <p className="text-white/65 text-lg leading-relaxed max-w-2xl mx-auto mb-10">
          The CER exam is one of the most specialized certifications in sterile processing. Our 147+ CER practice questions cover all 16 course chapters — from basic endoscope anatomy to high-level disinfection protocols, leak testing, and scope storage — so you're fully prepared when it matters.
        </p>

        <div className="flex flex-wrap gap-4 justify-center">
          <Link href="/pricing"
            className="px-8 py-4 rounded-xl font-semibold text-lg text-white shadow-lg shadow-amber/20 hover:-translate-y-0.5 transition-all"
            style={{ background: "linear-gradient(135deg, var(--amber), var(--amber-2))" }}>
            Unlock CER Access
          </Link>
          <Link href="/crcst"
            className="px-7 py-4 rounded-xl text-base font-medium border border-white/20 bg-white/5 text-white/80 hover:border-amber/50 hover:text-amber transition-all">
            Try Free First
          </Link>
        </div>
      </section>

      {/* Content */}
      <section className="max-w-3xl mx-auto px-4 py-12 space-y-8">
        <div className="bg-white/[0.03] border border-white/8 rounded-2xl p-8">
          <h2 className="text-2xl font-bold mb-4 text-white" style={{ fontFamily: "var(--font-display)" }}>
            What the CER Certification Exam Tests
          </h2>
          <p className="text-white/65 leading-relaxed">
            The Certified Endoscope Reprocessor (CER) exam is administered by HSPA and covers the complete endoscope reprocessing workflow. Exam content includes endoscope anatomy and components, pre-cleaning and point-of-use care, manual cleaning procedures, leak testing, high-level disinfection (HLD), automated endoscope reprocessors (AERs), drying and storage, infection prevention principles, and regulatory compliance for endoscopy units. It spans both flexible and rigid endoscopes across all specialty types — GI, bronchoscopy, urology, and ENT.
          </p>
        </div>

        <div className="bg-white/[0.03] border border-white/8 rounded-2xl p-8">
          <h2 className="text-2xl font-bold mb-4 text-white" style={{ fontFamily: "var(--font-display)" }}>
            Why Endoscope Reprocessing Requires Specialized Training
          </h2>
          <p className="text-white/65 leading-relaxed">
            Endoscope-related infections are among the most studied and publicized healthcare-associated infection events in hospital systems. Unlike surgical instruments that can be terminally sterilized, most flexible endoscopes cannot tolerate heat sterilization and must be processed using multi-step HLD protocols with narrow margins for error. A missed cleaning step or improper drying can result in patient harm. The CER certification exists because this specialty demands dedicated expertise — and our practice questions reflect that depth.
          </p>
        </div>

        <div className="bg-white/[0.03] border border-white/8 rounded-2xl p-8">
          <h2 className="text-2xl font-bold mb-4 text-white" style={{ fontFamily: "var(--font-display)" }}>
            16 Chapters, 147+ Practice Questions
          </h2>
          <p className="text-white/65 leading-relaxed">
            The HSPA CER curriculum is organized into 16 course chapters. Our question bank covers each chapter individually — so you can study in a focused, chapter-by-chapter format or mix questions across chapters for full-length practice exams. Our domain mastery dashboard shows your accuracy by chapter, so you always know which chapters need more work before exam day. Chapter-specific AI study chat lets you go deep on any topic without switching tools.
          </p>
        </div>

        <div className="bg-white/[0.03] border border-white/8 rounded-2xl p-8">
          <h2 className="text-2xl font-bold mb-4 text-white" style={{ fontFamily: "var(--font-display)" }}>
            High-Level Disinfection Protocol Questions
          </h2>
          <p className="text-white/65 leading-relaxed">
            HLD protocol questions are consistently among the most challenging on the CER exam. Candidates must understand the differences between chemical disinfectants (OPA, glutaraldehyde, peracetic acid, hydrogen peroxide), minimum effective concentration testing, contact time requirements, and temperature specifications. Our HLD-focused question set includes detailed rationale for every answer so you understand the "why" behind each protocol step — not just the correct sequence to memorize.
          </p>
        </div>

        <div className="bg-white/[0.03] border border-white/8 rounded-2xl p-8">
          <h2 className="text-2xl font-bold mb-4 text-white" style={{ fontFamily: "var(--font-display)" }}>
            CER as Your Specialist Career Move
          </h2>
          <p className="text-white/65 leading-relaxed">
            Endoscopy is one of the fastest-growing procedure volumes in hospitals. That growth is creating sustained demand for endoscope reprocessing specialists. Technicians who hold the CER certification are increasingly sought after by endoscopy units, GI labs, and multi-specialty OR suites. In many systems, CER certification comes with a pay differential. Pair it with your CRCST and CHL and you have the most complete credential set in the sterile processing field.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-3xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { value: "147+", label: "CER Questions" },
            { value: "16", label: "Course Chapters" },
            { value: "$39", label: "All 3 Certs" },
          ].map((s) => (
            <div key={s.label} className="text-center bg-white/[0.03] border border-white/8 rounded-xl p-5">
              <div className="font-serif text-3xl font-black text-amber mb-1">{s.value}</div>
              <div className="font-mono text-white/45 text-xs tracking-widest uppercase">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Internal links */}
      <section className="max-w-3xl mx-auto px-4 py-10">
        <h2 className="text-xl font-bold mb-5 text-white">Also on SPD Cert Prep</h2>
        <div className="flex flex-wrap gap-3">
          <Link href="/crcst-prep" className="px-4 py-2 rounded-lg border border-teal/30 text-teal text-sm hover:bg-teal/10 transition-colors">CRCST Exam Prep →</Link>
          <Link href="/chl-prep" className="px-4 py-2 rounded-lg border border-teal-2/30 text-teal-2 text-sm hover:bg-teal-2/10 transition-colors">CHL Exam Prep →</Link>
          <Link href="/pricing" className="px-4 py-2 rounded-lg border border-white/20 text-white/60 text-sm hover:text-white hover:border-white/40 transition-colors">Pricing →</Link>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 text-center border-t border-white/7">
        <h2 className="text-3xl font-black mb-4" style={{ fontFamily: "var(--font-display)" }}>
          Ready to master endoscope reprocessing?
        </h2>
        <p className="text-white/55 mb-8 max-w-lg mx-auto">CER access is included in the Triple Crown plan. One payment — CRCST, CHL, and CER.</p>
        <Link href="/pricing"
          className="inline-flex px-8 py-4 rounded-xl font-semibold text-white text-lg shadow-lg shadow-amber/20 hover:-translate-y-0.5 transition-all"
          style={{ background: "linear-gradient(135deg, var(--amber), var(--amber-2))" }}>
          Get CER Access →
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/7 px-4 py-8 text-center">
        <div className="flex flex-wrap justify-center gap-6 text-white/35 text-xs font-mono mb-3">
          <Link href="/" className="hover:text-white/60 transition-colors">Home</Link>
          <Link href="/crcst-prep" className="hover:text-white/60 transition-colors">CRCST Prep</Link>
          <Link href="/chl-prep" className="hover:text-white/60 transition-colors">CHL Prep</Link>
          <Link href="/pricing" className="hover:text-white/60 transition-colors">Pricing</Link>
          <Link href="/terms" className="hover:text-white/60 transition-colors">Terms</Link>
          <Link href="/privacy" className="hover:text-white/60 transition-colors">Privacy</Link>
        </div>
        <p className="text-white/20 text-xs font-mono">© 2026 Scott Advisory Group · Aseptic Technical Solutions</p>
      </footer>
    </div>
  );
}
