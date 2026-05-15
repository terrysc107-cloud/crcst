import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "Nursing Prep — Train Clinical Judgment Before You Touch a Real Patient",
    template: "%s | Nursing Prep",
  },
  description:
    "The only NCLEX prep built around clinical reasoning, not question volume. AI patient simulation, NGN case studies, and shift-mode training for nursing students and repeat NCLEX takers.",
  keywords: [
    "NCLEX prep",
    "NCLEX-RN study",
    "clinical judgment NCLEX",
    "NGN case studies",
    "Next Generation NCLEX",
    "NCLEX repeat taker",
    "AI nursing simulation",
    "clinical reasoning training",
    "nursing student study",
    "NCLEX clinical judgment measure",
  ],
};

export default function NursingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
