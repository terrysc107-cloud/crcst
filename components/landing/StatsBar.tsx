import { createClient } from "@supabase/supabase-js";

async function fetchStats() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) return { questionsAnswered: 0, badgesClaimed: 0 };

  try {
    const sb = createClient(url, key);

    const [{ count: qCount }, { count: bCount }] = await Promise.all([
      sb.from("question_attempts").select("*", { count: "exact", head: true }),
      sb.from("certified_users").select("*", { count: "exact", head: true }),
    ]);

    return {
      questionsAnswered: qCount ?? 0,
      badgesClaimed: bCount ?? 0,
    };
  } catch {
    return { questionsAnswered: 0, badgesClaimed: 0 };
  }
}

export default async function StatsBar() {
  const { questionsAnswered, badgesClaimed } = await fetchStats();

  const stats = [
    {
      value: questionsAnswered > 0 ? questionsAnswered.toLocaleString() : "787+",
      label: "Questions Answered",
    },
    { value: "3", label: "Certifications Covered" },
    {
      value: badgesClaimed > 0 ? badgesClaimed.toLocaleString() : "100+",
      label: "Badges Claimed",
    },
    { value: "24", label: "CRCST Content Domains" },
  ];

  return (
    <section className="border-t border-white/7 border-b border-white/7 bg-white/[0.02] py-10 px-4">
      <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
        {stats.map((s, i) => (
          <div key={i}>
            <div className="font-serif text-3xl md:text-4xl font-black text-teal leading-none">
              {s.value}
            </div>
            <div className="font-mono text-white/45 text-xs mt-1.5 tracking-widest uppercase">
              {s.label}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
