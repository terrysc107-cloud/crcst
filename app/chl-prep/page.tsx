import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "CHL Exam Prep — Certified Healthcare Leader Practice Questions",
  description:
    "240+ CHL practice questions for the Certified Healthcare Leader certification exam. Master leadership, quality management, and regulatory compliance. Start free.",
  alternates: { canonical: "https://spdcertprep.com/chl-prep" },
  openGraph: {
    title: "CHL Exam Prep — Certified Healthcare Leader | SPD Cert Prep",
    description: "240+ CHL practice questions with AI study chat and domain mastery tracking.",
    url: "https://spdcertprep.com/chl-prep",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Course",
  name: "CHL Certification Exam Prep",
  description:
    "240+ practice questions for the Certified Healthcare Leader (CHL) exam, covering leadership, quality management, and regulatory compliance.",
  provider: {
    "@type": "Organization",
    name: "Aseptic Technical Solutions",
    sameAs: "https://spdcertprep.com",
  },
  url: "https://spdcertprep.com/chl-prep",
  courseMode: ["online", "self-paced"],
  educationalLevel: "professional",
  isAccessibleForFree: true,
};

export default function ChlPrepPage() {
  return (
    <div className="min-h-screen bg-navy text-white" style={{ fontFamily: "'DM Sans', sans-serif" }}>
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
        <div className="inline-flex items-center gap-2 bg-navy-3/20 border border-navy-3/50 rounded-full px-4 py-1.5 mb-6">
          <span className="w-2 h-2 rounded-full bg-teal-3 inline-block" />
          <span className="font-mono text-teal-3 text-[0.7rem] font-semibold tracking-widest">CHL EXAM PREP</span>
        </div>

        <h1 className="text-[clamp(2rem,5vw,3.6rem)] font-black leading-tight mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>
          CHL Practice Questions
          <br />
          <span className="text-teal-2">Lead Your SPD Department With Confidence</span>
        </h1>

        <p className="text-white/65 text-lg leading-relaxed max-w-2xl mx-auto mb-10">
          The CHL exam certifies sterile processing professionals as healthcare leaders. Our 240+ CHL practice questions cover leadership principles, quality management, regulatory compliance, and department operations — everything you need to demonstrate leadership readiness on exam day.
        </p>

        <div className="flex flex-wrap gap-4 justify-center">
          <Link href="/pricing"
            className="px-8 py-4 rounded-xl font-semibold text-lg text-white shadow-lg shadow-teal/25 hover:-translate-y-0.5 transition-all"
            style={{ background: "linear-gradient(135deg, var(--teal), var(--teal-2))" }}>
            Unlock CHL Access
          </Link>
          <Link href="/crcst"
            className="px-7 py-4 rounded-xl text-base font-medium border border-white/20 bg-white/5 text-white/80 hover:border-teal/50 hover:text-teal transition-all">
            Try Free First
          </Link>
        </div>
      </section>

      {/* Content */}
      <section className="max-w-3xl mx-auto px-4 py-12 space-y-8">
        <div className="bg-white/[0.03] border border-white/8 rounded-2xl p-8">
          <h2 className="text-2xl font-bold mb-4 text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
            What the CHL Exam Tests
          </h2>
          <p className="text-white/65 leading-relaxed">
            The Certified Healthcare Leader (CHL) certification is designed for experienced sterile processing professionals who are moving into leadership roles — supervisors, managers, and department directors. The CHL exam covers team management, performance evaluation, budget management, regulatory compliance (TJC, AAMI, OSHA), quality improvement methodologies, and patient safety culture. It's one of the most respected leadership credentials in the SPD field.
          </p>
        </div>

        <div className="bg-white/[0.03] border border-white/8 rounded-2xl p-8">
          <h2 className="text-2xl font-bold mb-4 text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
            Who Should Pursue the CHL
          </h2>
          <p className="text-white/65 leading-relaxed">
            If you've held your CRCST for at least two years and are working as — or aspiring to — a lead tech, supervisor, or manager in a sterile processing department, the CHL is your next step. Many hospital systems require the CHL for supervisory promotions. Earning it demonstrates that you understand not just the technical side of sterile processing, but also how to build and lead high-performing teams, manage compliance, and drive quality outcomes.
          </p>
        </div>

        <div className="bg-white/[0.03] border border-white/8 rounded-2xl p-8">
          <h2 className="text-2xl font-bold mb-4 text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
            Leadership Questions, Not Just Technical Knowledge
          </h2>
          <p className="text-white/65 leading-relaxed">
            The CHL exam is notably different from the CRCST. Where CRCST questions are technical and procedural, CHL questions are situational and judgment-based. You'll be asked how to handle staffing conflicts, how to respond to a TJC audit, how to build a corrective action plan, or how to interpret quality data. Our 240+ CHL practice questions mirror this style exactly — scenario-driven situations where the right answer requires leadership judgment, not just technical recall.
          </p>
        </div>

        <div className="bg-white/[0.03] border border-white/8 rounded-2xl p-8">
          <h2 className="text-2xl font-bold mb-4 text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
            Regulatory Knowledge for CHL Candidates
          </h2>
          <p className="text-white/65 leading-relaxed">
            A significant portion of the CHL exam covers regulatory and standards knowledge: AAMI standards, The Joint Commission (TJC) requirements, OSHA regulations, and FDA guidance on reusable medical devices. Our CHL question bank covers all major regulatory frameworks with detailed explanations of what each standard requires and why it matters. The AI Study Chat can walk you through complex regulatory scenarios at any hour.
          </p>
        </div>

        <div className="bg-white/[0.03] border border-white/8 rounded-2xl p-8">
          <h2 className="text-2xl font-bold mb-4 text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
            The Triple Crown: CRCST + CHL + CER
          </h2>
          <p className="text-white/65 leading-relaxed">
            Many SPD professionals aspire to hold all three HSPA certifications: CRCST, CHL, and CER. Known informally as the Triple Crown, this combination demonstrates mastery of the technical, leadership, and specialist dimensions of sterile processing. SPD Cert Prep covers all three on one platform. With Triple Crown access, you get unlimited questions and AI chat for every cert at a single one-time price.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-3xl mx-auto px-4 py-8">
        <div className="grid grid-cols-3 gap-4">
          {[
            { value: "240+", label: "CHL Questions" },
            { value: "AI", label: "Study Chat" },
            { value: "$39", label: "All 3 Certs" },
          ].map((s) => (
            <div key={s.label} className="text-center bg-white/[0.03] border border-white/8 rounded-xl p-5">
              <div className="font-serif text-3xl font-black text-teal-2 mb-1">{s.value}</div>
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
          <Link href="/cer-prep" className="px-4 py-2 rounded-lg border border-amber/30 text-amber text-sm hover:bg-amber/10 transition-colors">CER Exam Prep →</Link>
          <Link href="/pricing" className="px-4 py-2 rounded-lg border border-white/20 text-white/60 text-sm hover:text-white hover:border-white/40 transition-colors">Pricing →</Link>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 text-center border-t border-white/7">
        <h2 className="text-3xl font-black mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
          Ready to lead your department?
        </h2>
        <p className="text-white/55 mb-8 max-w-lg mx-auto">CHL access is included in the Triple Crown plan. One payment — all three certifications.</p>
        <Link href="/pricing"
          className="inline-flex px-8 py-4 rounded-xl font-semibold text-white text-lg shadow-lg shadow-teal/25 hover:-translate-y-0.5 transition-all"
          style={{ background: "linear-gradient(135deg, var(--teal), var(--teal-2))" }}>
          Get CHL Access →
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/7 px-4 py-8 text-center">
        <div className="flex flex-wrap justify-center gap-6 text-white/35 text-xs font-mono mb-3">
          <Link href="/" className="hover:text-white/60 transition-colors">Home</Link>
          <Link href="/crcst-prep" className="hover:text-white/60 transition-colors">CRCST Prep</Link>
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
