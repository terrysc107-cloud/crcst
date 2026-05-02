import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Press Kit — SPD Cert Prep",
  description:
    "Press resources for SPD Cert Prep — product description, key stats, logo assets, and founder contact information.",
  alternates: { canonical: "https://spdcertprep.com/press" },
  robots: { index: false, follow: true },
};

export default function PressPage() {
  return (
    <div className="min-h-screen bg-navy text-white" style={{ fontFamily: "'DM Sans', sans-serif" }}>

      {/* Nav */}
      <nav className="px-6 py-4 border-b border-white/7 flex items-center justify-between">
        <Link href="/" className="font-serif text-lg font-bold text-white hover:text-teal transition-colors">
          SPD Cert <em className="not-italic text-teal">Prep</em>
        </Link>
        <Link href="mailto:support@spdcertprep.com"
          className="px-4 py-2 rounded-lg text-sm font-semibold text-white"
          style={{ background: "linear-gradient(135deg, var(--teal), var(--teal-2))" }}>
          Press Inquiry
        </Link>
      </nav>

      {/* Header */}
      <section className="max-w-3xl mx-auto px-4 py-20">
        <div className="inline-flex items-center gap-2 bg-teal/10 border border-teal/30 rounded-full px-4 py-1.5 mb-6">
          <span className="font-mono text-teal text-[0.7rem] font-semibold tracking-widest">PRESS KIT</span>
        </div>

        <h1 className="text-[clamp(2rem,5vw,3.2rem)] font-black leading-tight mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
          Press Resources
        </h1>
        <p className="text-white/55 text-lg leading-relaxed">
          Everything you need to cover SPD Cert Prep. Questions not answered here?{" "}
          <a href="mailto:support@spdcertprep.com" className="text-teal hover:underline">Email us directly.</a>
        </p>
      </section>

      {/* Product Description */}
      <section className="max-w-3xl mx-auto px-4 pb-12">
        <div className="bg-white/[0.03] border border-white/8 rounded-2xl p-8 mb-8">
          <h2 className="font-mono text-teal text-xs tracking-[0.12em] uppercase mb-4">Product</h2>
          <h3 className="text-xl font-bold mb-3 text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
            About SPD Cert Prep
          </h3>
          <p className="text-white/65 leading-relaxed">
            SPD Cert Prep is an exam preparation platform built specifically for sterile processing department (SPD) professionals pursuing HSPA certification. The platform covers three certifications — CRCST (Certified Registered Central Service Technician), CHL (Certified Healthcare Leader), and CER (Certified Endoscope Reprocessor) — with 787+ exam-aligned practice questions, AI-powered study chat, domain mastery tracking, and digital certification badges. It is built by Aseptic Technical Solutions and Scott Advisory Group, based in Baltimore.
          </p>
        </div>

        {/* Key Stats */}
        <div className="bg-white/[0.03] border border-white/8 rounded-2xl p-8 mb-8">
          <h2 className="font-mono text-teal text-xs tracking-[0.12em] uppercase mb-6">Key Stats</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { value: "787+", label: "Practice Questions" },
              { value: "3", label: "Certifications Covered" },
              { value: "24", label: "CRCST Domains" },
              { value: "16", label: "CER Chapters" },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <div className="font-serif text-3xl font-black text-teal mb-1">{s.value}</div>
                <div className="font-mono text-white/40 text-xs tracking-widest uppercase">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Logo Downloads */}
        <div className="bg-white/[0.03] border border-white/8 rounded-2xl p-8 mb-8">
          <h2 className="font-mono text-teal text-xs tracking-[0.12em] uppercase mb-4">Logo & Brand Assets</h2>
          <p className="text-white/55 text-sm mb-6 leading-relaxed">
            For media use. Please do not modify colors or proportions. Use on dark backgrounds where possible.
          </p>
          <div className="space-y-3">
            {[
              { label: "SVG Logo (Dark background)", note: "Recommended for web use", href: "/icon.svg" },
              { label: "PNG Logo 32×32 (Light)", note: "Favicon variant", href: "/icon-light-32x32.png" },
              { label: "PNG Logo 32×32 (Dark)", note: "Favicon variant", href: "/icon-dark-32x32.png" },
            ].map((a) => (
              <div key={a.label} className="flex items-center justify-between gap-4 p-4 border border-white/8 rounded-xl">
                <div>
                  <div className="text-white text-sm font-medium">{a.label}</div>
                  <div className="text-white/40 text-xs mt-0.5">{a.note}</div>
                </div>
                <a href={a.href} download
                  className="px-3 py-1.5 rounded-lg border border-teal/40 text-teal text-xs font-mono hover:bg-teal/10 transition-colors">
                  Download
                </a>
              </div>
            ))}
          </div>
          <p className="text-white/30 text-xs mt-4 font-mono">
            {/* TODO: Add full brand asset zip download when available */}
            Full brand kit (colors, typography, usage guidelines) — contact us for the complete package.
          </p>
        </div>

        {/* Contact */}
        <div className="bg-white/[0.03] border border-white/8 rounded-2xl p-8 mb-8">
          <h2 className="font-mono text-teal text-xs tracking-[0.12em] uppercase mb-4">Press Contact</h2>
          <div className="space-y-2">
            <div className="flex items-center gap-3 text-sm">
              <span className="font-mono text-white/40 w-20">Email</span>
              <a href="mailto:support@spdcertprep.com" className="text-teal hover:underline">support@spdcertprep.com</a>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <span className="font-mono text-white/40 w-20">Website</span>
              <a href="https://spdcertprep.com" className="text-white/70 hover:text-white transition-colors">spdcertprep.com</a>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <span className="font-mono text-white/40 w-20">Company</span>
              <span className="text-white/70">Scott Advisory Group · Aseptic Technical Solutions</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <span className="font-mono text-white/40 w-20">Location</span>
              <span className="text-white/70">Baltimore, MD</span>
            </div>
          </div>
        </div>

        {/* Founder Note */}
        <div className="bg-teal/[0.04] border border-teal/20 rounded-2xl p-8">
          <h2 className="font-mono text-teal text-xs tracking-[0.12em] uppercase mb-6">A Note From the Founder</h2>

          <div className="space-y-5 text-white/70 leading-relaxed">
            <p>
              Sterile processing is one of the most underrecognized disciplines in healthcare. SPD technicians process thousands of instruments per day, each one a potential vector for infection if handled incorrectly. The professionals who do this work are meticulous, skilled, and essential — but the certification process that proves their competence has historically been supported by expensive prep materials or nothing at all.
            </p>

            <p>
              SPD Cert Prep started from a simple premise: the people who protect surgical patients deserve world-class exam preparation, not a $300 textbook and a hope. We built this platform to give every sterile processing professional — whether they're studying at 6 AM before a day shift or 11 PM after one — access to the same quality of practice materials that exam prep platforms in other fields take for granted. AI-powered explanations. Adaptive question banks. Real data on where you're weak and what to do about it.
            </p>

            <p>
              The sterile processing field is growing. Certification rates are rising. Facilities are tightening compliance requirements. The window to build something meaningful in this space is right now — and we're building it with the people who work in it. If you're covering certification prep, continuing education, healthcare workforce development, or the intersection of AI and clinical education, we'd love to talk.
            </p>
          </div>

          <div className="mt-8 pt-6 border-t border-white/10">
            <div className="text-white font-semibold text-sm">Scott Advisory Group</div>
            <div className="text-white/45 text-xs font-mono mt-0.5">Aseptic Technical Solutions · Baltimore, MD</div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/7 px-4 py-8 text-center">
        <div className="flex flex-wrap justify-center gap-6 text-white/35 text-xs font-mono mb-3">
          <Link href="/" className="hover:text-white/60 transition-colors">Home</Link>
          <Link href="/pricing" className="hover:text-white/60 transition-colors">Pricing</Link>
          <Link href="/crcst-prep" className="hover:text-white/60 transition-colors">CRCST Prep</Link>
          <Link href="/terms" className="hover:text-white/60 transition-colors">Terms</Link>
          <Link href="/privacy" className="hover:text-white/60 transition-colors">Privacy</Link>
        </div>
        <p className="text-white/20 text-xs font-mono">© 2026 Scott Advisory Group · Aseptic Technical Solutions</p>
      </footer>
    </div>
  );
}
