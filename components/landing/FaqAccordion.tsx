"use client";

import { useState } from "react";

const FAQS = [
  {
    q: "Which certifications does this cover?",
    a: "Currently CRCST, CHL, and CER certifications — plus a Situational Judgment (SJT) module. All question banks are built from current industry content outlines.",
  },
  {
    q: "How many questions are in the question bank?",
    a: "787+ questions across CRCST (400), CHL (240), and CER (147), categorized by domain, chapter, and difficulty. New questions are added regularly.",
  },
  {
    q: "Is the content aligned to the actual exam?",
    a: "Yes. All questions are mapped to the official content outlines for each certification. We include both multiple choice and true/false question types.",
  },
  {
    q: "What is the AI Study Chat?",
    a: "A Claude-powered chatbot specialized in sterile processing, instrumentation, and certification content. Ask it to explain a concept, quiz you verbally, or clarify a confusing answer.",
  },
  {
    q: "Can I use this on my phone?",
    a: "Yes. SPD Cert Prep is a web app that works on any device — phone, tablet, or computer. No download required.",
  },
  {
    q: "What happens after I pass?",
    a: "You can claim a digital certification badge by entering your name and certification details. Your badge is yours to download and share on LinkedIn. You'll also get guided toward your next certification.",
  },
];

export default function FaqAccordion() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="divide-y divide-white/7">
      {FAQS.map((faq, i) => (
        <div key={i} className="overflow-hidden">
          <button
            className="w-full flex items-center justify-between gap-4 py-5 text-left text-white/90 font-medium hover:text-teal transition-colors"
            onClick={() => setOpen(open === i ? null : i)}
            aria-expanded={open === i}
          >
            <span>{faq.q}</span>
            <span
              className={`text-teal text-xl flex-shrink-0 transition-transform duration-300 ${
                open === i ? "rotate-45" : "rotate-0"
              }`}
            >
              +
            </span>
          </button>
          <div
            className={`overflow-hidden transition-all duration-300 ease-in-out ${
              open === i ? "max-h-48 opacity-100 pb-5" : "max-h-0 opacity-0"
            }`}
          >
            <p className="text-white/55 text-sm leading-relaxed">{faq.a}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
