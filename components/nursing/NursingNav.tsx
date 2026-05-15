"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, ArrowLeft } from "lucide-react";

const NAV_LINKS = [
  { label: "Features",    href: "#features" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Specialties", href: "#specialties" },
  { label: "Pricing",     href: "#pricing" },
];

export default function NursingNav() {
  const [scrolled, setScrolled]     = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (scrolled && mobileOpen) setMobileOpen(false);
  }, [scrolled, mobileOpen]);

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 h-16 flex items-center justify-between px-6 md:px-8 transition-all duration-300 ${
          scrolled || mobileOpen
            ? "bg-navy/97 backdrop-blur-md border-b border-white/5"
            : "bg-transparent"
        }`}
      >
        {/* Logo + back link */}
        <div className="flex items-center gap-4 shrink-0">
          <Link
            href="/"
            className="hidden md:flex items-center gap-1.5 text-white/35 text-xs font-mono hover:text-white/60 transition-colors"
          >
            <ArrowLeft className="w-3 h-3" />
            SPD Cert Prep
          </Link>
          <span className="hidden md:block w-px h-4 bg-white/10" />
          <a href="/nursing" className="flex items-center gap-2">
            <span className="text-xl" aria-hidden>🩺</span>
            <span className="font-serif text-lg font-bold text-white">
              Nursing <em className="not-italic" style={{ color: "#E02B4B" }}>Prep</em>
            </span>
            <span
              className="hidden sm:inline-flex items-center rounded-full px-2 py-0.5 font-mono text-[0.6rem] font-bold tracking-widest"
              style={{ background: "rgba(224,43,75,0.15)", border: "1px solid rgba(224,43,75,0.35)", color: "#E02B4B" }}
            >
              BETA
            </span>
          </a>
        </div>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map(({ label, href }) => (
            <a
              key={label}
              href={href}
              className="text-white/60 text-sm font-medium transition-colors duration-200"
              style={{ ["--hover-color" as string]: "#E02B4B" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#E02B4B")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "")}
            >
              {label}
            </a>
          ))}
        </div>

        {/* Desktop CTAs */}
        <div className="hidden sm:flex items-center gap-3">
          <Link
            href="/nursing/cases"
            className="inline-flex items-center px-4 py-2 rounded-lg border border-white/20 bg-white/5 text-white/80 text-sm font-medium transition-all hover:bg-white/10 hover:text-white"
          >
            Sign In
          </Link>
          <Link
            href="/nursing/cases"
            className="inline-flex items-center px-4 py-2 rounded-lg text-white text-sm font-semibold hover:-translate-y-0.5 transition-all active:scale-95"
            style={{
              background: "linear-gradient(135deg, #E02B4B, #f06074)",
              boxShadow: "0 4px 14px rgba(224,43,75,0.35)",
            }}
          >
            Try Free Case →
          </Link>
        </div>

        {/* Mobile */}
        <div className="flex sm:hidden items-center gap-2">
          <Link
            href="/nursing/cases"
            className="inline-flex items-center px-3 py-1.5 rounded-lg text-white text-sm font-semibold"
            style={{ background: "#E02B4B" }}
          >
            Try Free
          </Link>
          <button
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            className="p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div className="fixed top-16 left-0 right-0 z-40 bg-navy/97 backdrop-blur-md border-b border-white/10 px-6 py-4 flex flex-col gap-1 sm:hidden">
          <Link
            href="/"
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-1.5 py-2 text-white/40 text-sm font-mono border-b border-white/8 mb-1"
          >
            <ArrowLeft className="w-3 h-3" />
            Back to SPD Cert Prep
          </Link>
          {NAV_LINKS.map(({ label, href }) => (
            <a
              key={label}
              href={href}
              onClick={() => setMobileOpen(false)}
              className="py-3 text-white/70 text-base font-medium border-b border-white/5 last:border-0 transition-colors"
            >
              {label}
            </a>
          ))}
          <div className="pt-3 flex flex-col gap-2">
            <Link
              href="/nursing/cases"
              onClick={() => setMobileOpen(false)}
              className="w-full text-center py-3 rounded-lg border border-white/20 text-white/80 text-sm font-medium"
            >
              Sign In
            </Link>
            <Link
              href="/nursing/cases"
              onClick={() => setMobileOpen(false)}
              className="w-full text-center py-3 rounded-lg text-white text-sm font-semibold"
              style={{ background: "linear-gradient(135deg, #E02B4B, #f06074)" }}
            >
              Try a Free Case Study — No card needed
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
