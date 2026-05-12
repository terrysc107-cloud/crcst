"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

const NAV_LINKS = ["Features", "Certifications", "Pricing", "FAQ"];

export default function NavBar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close mobile menu on scroll
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
        {/* Logo */}
        <a href="/" className="flex items-center gap-2 shrink-0">
          <span className="text-xl" aria-hidden>⚙️</span>
          <span className="font-serif text-lg font-bold text-white">
            SPD Cert <em className="not-italic text-teal">Prep</em>
          </span>
        </a>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((label) => (
            <a
              key={label}
              href={`#${label.toLowerCase()}`}
              className="text-white/60 text-sm font-medium hover:text-teal transition-colors duration-200"
            >
              {label}
            </a>
          ))}
        </div>

        {/* Desktop CTAs */}
        <div className="hidden sm:flex items-center gap-3">
          <Link
            href="/crcst"
            className="inline-flex items-center px-4 py-2 rounded-lg border border-white/20 bg-white/5 text-white/80 text-sm font-medium hover:border-teal/50 hover:text-teal hover:bg-teal/5 transition-all"
          >
            Sign In
          </Link>
          <Link
            href="/crcst?signup=1"
            className="inline-flex items-center px-4 py-2 rounded-lg bg-gradient-to-r from-navy-3 to-teal text-white text-sm font-semibold shadow-lg shadow-teal/25 hover:-translate-y-0.5 hover:shadow-teal/40 transition-all active:scale-95"
          >
            Start Free →
          </Link>
        </div>

        {/* Mobile: show Start Free + hamburger */}
        <div className="flex sm:hidden items-center gap-2">
          <Link
            href="/crcst?signup=1"
            className="inline-flex items-center px-3 py-1.5 rounded-lg bg-teal text-white text-sm font-semibold"
          >
            Start Free
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

      {/* Mobile dropdown menu */}
      {mobileOpen && (
        <div className="fixed top-16 left-0 right-0 z-40 bg-navy/97 backdrop-blur-md border-b border-white/10 px-6 py-4 flex flex-col gap-1 fadeUp sm:hidden">
          {NAV_LINKS.map((label) => (
            <a
              key={label}
              href={`#${label.toLowerCase()}`}
              onClick={() => setMobileOpen(false)}
              className="py-3 text-white/70 text-base font-medium hover:text-teal transition-colors border-b border-white/5 last:border-0"
            >
              {label}
            </a>
          ))}
          <div className="pt-3 flex flex-col gap-2">
            <Link
              href="/crcst"
              onClick={() => setMobileOpen(false)}
              className="w-full text-center py-3 rounded-lg border border-white/20 text-white/80 text-sm font-medium hover:border-teal/50 hover:text-teal transition-all"
            >
              Sign In
            </Link>
            <Link
              href="/crcst?signup=1"
              onClick={() => setMobileOpen(false)}
              className="w-full text-center py-3 rounded-lg bg-gradient-to-r from-navy-3 to-teal text-white text-sm font-semibold"
            >
              Start Free — No credit card needed
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
