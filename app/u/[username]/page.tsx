import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";

// ── Types ────────────────────────────────────────────────────────────────────

interface Profile {
  id: string;
  username: string;
  display_name: string | null;
  created_at: string;
}

interface CertifiedUser {
  cert: string;
  pass_date: string;
  full_name: string;
}

// ── Data fetching ─────────────────────────────────────────────────────────────

async function getProfileData(username: string): Promise<{ profile: Profile; certs: CertifiedUser[] } | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;

  const sb = createClient(url, key);

  const { data: profile } = await sb
    .from("public_profiles")
    .select("id, username, display_name, created_at")
    .eq("username", username)
    .single();

  if (!profile) return null;

  const { data: certs } = await sb
    .from("certified_users")
    .select("cert, pass_date, full_name")
    .eq("user_id", profile.id)
    .order("pass_date", { ascending: true });

  return { profile, certs: certs ?? [] };
}

// ── Metadata ─────────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}): Promise<Metadata> {
  const { username } = await params;
  const data = await getProfileData(username);
  const displayName = data?.profile.display_name ?? username;

  return {
    title: `${displayName} — SPD Cert Prep`,
    description: `View ${displayName}'s sterile processing certifications earned on SPD Cert Prep.`,
    alternates: { canonical: `https://spdcertprep.com/u/${username}` },
    openGraph: {
      title: `${displayName} — Certified Sterile Processing Professional`,
      description: `View ${displayName}'s CRCST, CHL, and CER certifications.`,
      url: `https://spdcertprep.com/u/${username}`,
    },
  };
}

// ── Badge card ───────────────────────────────────────────────────────────────

const CERT_STYLES: Record<string, { label: string; color: string; icon: string }> = {
  CRCST: { label: "Certified Registered Central Service Technician", color: "text-teal", icon: "⚙️" },
  CHL:   { label: "Certified Healthcare Leader",                     color: "text-teal-2", icon: "🎖️" },
  CER:   { label: "Certified Endoscope Reprocessor",                 color: "text-amber",  icon: "🔬" },
};

function CertBadgeCard({ cert, passDate }: { cert: string; passDate: string }) {
  const style = CERT_STYLES[cert] ?? { label: cert, color: "text-teal", icon: "🏅" };
  const formatted = new Date(passDate + "T12:00:00").toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-6 flex items-start gap-4">
      <span className="text-4xl">{style.icon}</span>
      <div>
        <div className={`font-mono text-xl font-black tracking-wider mb-1 ${style.color}`}>{cert}</div>
        <div className="text-white/70 text-sm mb-1">{style.label}</div>
        <div className="font-mono text-white/35 text-xs tracking-wider">EARNED {formatted.toUpperCase()}</div>
      </div>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const data = await getProfileData(username);

  if (!data) notFound();

  const { profile, certs } = data;
  const displayName = profile.display_name ?? username;
  const joinDate = new Date(profile.created_at).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="min-h-screen bg-navy text-white" style={{ fontFamily: "var(--font-dm-sans)" }}>

      {/* Nav */}
      <nav className="px-6 py-4 border-b border-white/7 flex items-center justify-between">
        <Link href="/" className="font-serif text-lg font-bold text-white hover:text-teal transition-colors">
          SPD Cert <em className="not-italic text-teal">Prep</em>
        </Link>
        <Link href="/crcst"
          className="px-4 py-2 rounded-lg text-sm font-semibold text-white"
          style={{ background: "linear-gradient(135deg, var(--teal), var(--teal-2))" }}>
          Start Free
        </Link>
      </nav>

      {/* Profile header */}
      <section className="max-w-2xl mx-auto px-4 py-16 text-center">
        {/* Avatar placeholder */}
        <div className="w-20 h-20 rounded-full bg-teal/20 border-2 border-teal/40 flex items-center justify-center mx-auto mb-6 text-3xl">
          {displayName.charAt(0).toUpperCase()}
        </div>

        <h1 className="text-3xl font-black mb-2" style={{ fontFamily: "var(--font-display)" }}>
          {displayName}
        </h1>
        <p className="font-mono text-white/40 text-xs tracking-widest mb-2 uppercase">
          @{username}
        </p>
        <p className="text-white/45 text-sm">
          Sterile Processing Professional · Member since {joinDate}
        </p>
      </section>

      {/* Certifications */}
      <section className="max-w-2xl mx-auto px-4 pb-16">
        {certs.length > 0 ? (
          <>
            <div className="flex items-center gap-3 mb-6">
              <h2 className="font-mono text-teal text-xs tracking-[0.12em] uppercase">Earned Certifications</h2>
              <span className="bg-teal/10 border border-teal/30 rounded-full px-2.5 py-0.5 font-mono text-teal text-[0.7rem]">
                {certs.length}
              </span>
            </div>
            <div className="space-y-4">
              {certs.map((c, i) => (
                <CertBadgeCard key={i} cert={c.cert} passDate={c.pass_date} />
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-12 bg-white/[0.02] border border-white/8 rounded-2xl">
            <div className="text-4xl mb-4">🎯</div>
            <p className="text-white/45 text-sm">No certifications claimed yet.</p>
            <p className="text-white/30 text-xs mt-1 mb-6">Check back after the exam!</p>
            <Link
              href="/crcst"
              className="inline-flex px-5 py-2.5 rounded-xl font-semibold text-sm text-white shadow-lg shadow-teal/20 hover:-translate-y-0.5 transition-all"
              style={{ background: "linear-gradient(135deg, var(--teal), var(--teal-2))" }}
            >
              Start Preparing Free →
            </Link>
          </div>
        )}
      </section>

      {/* CTA */}
      {certs.length > 0 && (
        <section className="max-w-2xl mx-auto px-4 pb-20 text-center">
          <div className="bg-teal/5 border border-teal/20 rounded-2xl p-8">
            <p className="text-white/60 text-sm mb-4">
              Studying for your own certification?
            </p>
            <Link href="/crcst"
              className="inline-flex px-6 py-3 rounded-xl font-semibold text-sm text-white shadow-lg shadow-teal/20 hover:-translate-y-0.5 transition-all"
              style={{ background: "linear-gradient(135deg, var(--teal), var(--teal-2))" }}>
              Start Free on SPD Cert Prep →
            </Link>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="border-t border-white/7 px-4 py-8 text-center">
        <p className="text-white/20 text-xs font-mono">
          © 2026 Scott Advisory Group · Aseptic Technical Solutions ·{" "}
          <Link href="/" className="hover:text-white/40 transition-colors">spdcertprep.com</Link>
        </p>
      </footer>
    </div>
  );
}
