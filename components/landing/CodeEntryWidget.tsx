"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CodeEntryWidget() {
  const router = useRouter();
  const [code, setCode] = useState("");

  const formatInput = (raw: string): string => {
    // Uppercase and remove anything that's not alphanumeric or dash
    const clean = raw.toUpperCase().replace(/[^A-Z0-9-]/g, "");

    // If the user is typing a wholesale code (already has dashes mid-string
    // that don't fit the XXXX-XXXX-XXXX pattern), preserve as-is up to 24 chars
    const strippedFlat = clean.replace(/-/g, "");
    if (strippedFlat.length <= 12 && !/-(?:TC|PRO)-/i.test(clean)) {
      // Auto-format as XXXX-XXXX-XXXX access code
      const flat = strippedFlat.slice(0, 12);
      const parts: string[] = [];
      for (let i = 0; i < flat.length; i += 4) parts.push(flat.slice(i, i + 4));
      return parts.join("-");
    }
    // Wholesale code — preserve dashes, cap at 24 chars
    return clean.slice(0, 24);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCode(formatInput(e.target.value));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = code.trim();
    if (trimmed.length < 6) return;
    sessionStorage.setItem("pending_redeem_code", trimmed);
    router.push(`/redeem?code=${encodeURIComponent(trimmed)}`);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-center gap-2 w-full max-w-sm mx-auto">
      <input
        value={code}
        onChange={handleChange}
        placeholder="XXXX-XXXX-XXXX"
        autoComplete="off"
        spellCheck={false}
        inputMode="text"
        aria-label="Access code"
        className="flex-1 w-full sm:w-auto px-4 py-2.5 rounded-lg bg-white/8 border border-teal/30 text-white placeholder-white/30 font-mono text-sm tracking-widest text-center focus:outline-none focus:border-teal/60 transition-colors uppercase"
      />
      <button
        type="submit"
        disabled={code.trim().length < 6}
        className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-teal/20 border border-teal/40 text-teal text-sm font-semibold hover:bg-teal/30 hover:border-teal/60 transition-all whitespace-nowrap disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Activate →
      </button>
    </form>
  );
}
