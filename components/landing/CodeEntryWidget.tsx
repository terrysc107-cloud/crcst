"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CodeEntryWidget() {
  const router = useRouter();
  const [code, setCode] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Keep dashes, uppercase everything, strip other non-alphanumeric chars
    const cleaned = e.target.value
      .toUpperCase()
      .replace(/[^A-Z0-9-]/g, "")
      .slice(0, 20);
    setCode(cleaned);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = code.trim();
    if (trimmed.length > 0) {
      sessionStorage.setItem("pending_redeem_code", trimmed);
    }
    router.push(trimmed.length >= 8 ? `/redeem?code=${encodeURIComponent(trimmed)}` : "/redeem");
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-center gap-2 w-full max-w-sm mx-auto">
      <input
        value={code}
        onChange={handleChange}
        placeholder="Enter your access code"
        autoComplete="off"
        spellCheck={false}
        inputMode="text"
        aria-label="Access code"
        className="flex-1 w-full sm:w-auto px-4 py-2.5 rounded-lg bg-white/8 border border-teal/30 text-white placeholder-white/30 font-mono text-sm tracking-widest text-center focus:outline-none focus:border-teal/60 transition-colors uppercase"
      />
      <button
        type="submit"
        className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-teal/20 border border-teal/40 text-teal text-sm font-semibold hover:bg-teal/30 hover:border-teal/60 transition-all whitespace-nowrap"
      >
        Activate →
      </button>
    </form>
  );
}
