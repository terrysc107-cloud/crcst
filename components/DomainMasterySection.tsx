'use client'

interface DomainMasterySectionProps {
  domains: string[]
  domainMastery: Record<string, { correct: number; total: number }>
}

export default function DomainMasterySection({ domains, domainMastery }: DomainMasterySectionProps) {
  const getPct = (domain: string) => {
    const m = domainMastery[domain]
    if (!m || m.total === 0) return 0
    return Math.round((m.correct / m.total) * 100)
  }

  return (
    <>
      <div className="text-xs tracking-widest text-text-3 mb-4">
        DOMAIN MASTERY
      </div>
      <div className="grid grid-cols-2 gap-3">
        {domains.map((domain) => {
          const pct = getPct(domain)
          const mastery = domainMastery[domain]
          return (
            <div key={domain} className="bg-white rounded-lg p-3 border border-cream-2">
              <div className="font-serif text-sm text-navy font-bold mb-2 truncate">
                {domain}
              </div>
              <div className="w-full h-1.5 bg-cream-2 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    pct >= 70 ? 'bg-correct' : pct >= 40 ? 'bg-amber' : 'bg-teal'
                  }`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <div className="text-xs text-text-3 mt-1">
                {pct}% ({mastery?.total || 0} questions)
              </div>
            </div>
          )
        })}
      </div>
    </>
  )
}
