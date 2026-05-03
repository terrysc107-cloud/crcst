"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const NAV_LINKS = ["Features", "Certifications", "Pricing", "FAQ"] as const;

export default function NavBar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 40);
      if (window.scrollY > 40) setMobileOpen(false);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 h-16 flex items-center justify-between px-6 md:px-8 transition-all duration-300 ${
          scrolled
            ? "bg-navy/95 backdrop-blur-md border-b border-white/5"
            : "bg-transparent"
        }`}
      >
        {/* Logo */}
        <div className="flex items-center gap-2">
          <span className="text-xl">⚙️</span>
          <span className="font-serif text-lg font-bold text-white">
            SPD Cert <em className="not-italic text-teal">Prep</em>
          </span>
        </div>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((label) => (
            <a
              key={label}
              href={`#${label.toLowerCase()}`}
              className="text-white/60 text-sm font-medium hover:text-teal transition-colors"
            >
              {label}
            </a>
          ))}
        </div>

        {/* Right-side actions */}
        <div className="flex items-center gap-3">
          <Link
            href="/crcst"
            className="hidden sm:inline-flex items-center px-4 py-2 rounded-lg border border-white/20 bg-white/5 text-white/80 text-sm font-medium hover:border-teal/50 hover:text-teal hover:bg-teal/5 transition-all"
          >
            Sign In
          </Link>
          <Link
            href="/crcst"
            className="inline-flex items-center px-4 py-2 rounded-lg bg-gradient-to-r from-navy-3 to-teal text-white text-sm font-semibold shadow-lg shadow-teal/25 hover:-translate-y-0.5 hover:shadow-teal/40 transition-all"
          >
            Start Free
          </Link>

          {/* Hamburger — mobile only */}
          <button
            className="md:hidden flex flex-col justify-center gap-[5px] w-9 h-9 rounded-lg border border-white/15 bg-white/5 hover:bg-white/10 transition-colors"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
          >
            <span
              className={`block mx-auto w-4 h-[2px] bg-white rounded transition-all duration-200 origin-center ${
                mobileOpen ? "rotate-45 translate-y-[7px]" : ""
              }`}
            />
            <span
              className={`block mx-auto w-4 h-[2px] bg-white rounded transition-all duration-200 ${
                mobileOpen ? "opacity-0 scale-x-0" : ""
              }`}
            />
            <span
              className={`block mx-auto w-4 h-[2px] bg-white rounded transition-all duration-200 origin-center ${
                mobileOpen ? "-rotate-45 -translate-y-[7px]" : ""
              }`}
            />
          </button>
        </div>
      </nav>

      {/* Mobile dropdown */}
      <div
        className={`fixed top-16 left-0 right-0 z-40 md:hidden transition-all duration-300 ${
          mobileOpen
            ? "opacity-100 pointer-events-auto translate-y-0"
            : "opacity-0 pointer-events-none -translate-y-2"
        }`}
      >
        <div className="bg-navy/98 backdrop-blur-md border-b border-white/10 px-6 py-3">
          {NAV_LINKS.map((label) => (
            <a
              key={label}
              href={`#${label.toLowerCase()}`}
              onClick={() => setMobileOpen(false)}
              className="flex items-center py-3 text-white/70 font-medium border-b border-white/6 last:border-0 hover:text-teal transition-colors"
            >
              {label}
            </a>
          ))}
          <div className="pt-3 pb-1">
            <Link
              href="/crcst"
              onClick={() => setMobileOpen(false)}
              className="block text-center py-3 rounded-xl font-semibold text-sm text-white shadow-lg shadow-teal/20 hover:opacity-90 transition-opacity"
              style={{ background: "linear-gradient(135deg, var(--teal), var(--teal-2))" }}
            >
              Start Studying Free →
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
