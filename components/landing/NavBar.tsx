"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function NavBar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 h-16 flex items-center justify-between px-6 md:px-8 transition-all duration-300 ${
        scrolled
          ? "bg-navy/95 backdrop-blur-md border-b border-white/5"
          : "bg-transparent"
      }`}
    >
      <div className="flex items-center gap-2">
        <span className="text-xl">⚙️</span>
        <span className="font-serif text-lg font-bold text-white">
          SPD Cert <em className="not-italic text-teal">Prep</em>
        </span>
      </div>

      <div className="hidden md:flex items-center gap-8">
        {["Features", "Certifications", "Pricing", "FAQ"].map((label) => (
          <a
            key={label}
            href={`#${label.toLowerCase()}`}
            className="text-white/60 text-sm font-medium hover:text-teal transition-colors"
          >
            {label}
          </a>
        ))}
      </div>

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
      </div>
    </nav>
  );
}
