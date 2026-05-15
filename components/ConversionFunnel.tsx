'use client'

interface FunnelData {
  leads: number
  sent: number
  opened: number
  replied: number
  demo: number
  customer: number
}

interface Props {
  funnel: FunnelData
}

const stages = [
  { key: 'leads' as const, label: 'Total Leads', color: '#0071e3' },
  { key: 'sent' as const, label: 'Sent', color: '#5e5ce6' },
  { key: 'opened' as const, label: 'Opened', color: '#bf5af2' },
  { key: 'replied' as const, label: 'Replied', color: '#ff9f0a' },
  { key: 'demo' as const, label: 'Demo', color: '#ff6b00' },
  { key: 'customer' as const, label: 'Customer', color: '#34c759' },
]

function pct(num: number, denom: number): string {
  if (!denom) return '—'
  return `${Math.round((num / denom) * 100)}%`
}

export default function ConversionFunnel({ funnel }: Props) {
  const maxVal = funnel.leads || 1

  return (
    <div className="bg-white rounded-2xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.06)] border border-[#e0e0e5]/60">
      <h3 className="text-[15px] font-semibold text-[#1d1d1f] mb-5">Conversion Funnel</h3>
      <div className="space-y-3">
        {stages.map((stage, i) => {
          const val = funnel[stage.key]
          const prev = i > 0 ? funnel[stages[i - 1].key] : val
          const width = maxVal > 0 ? Math.max(3, Math.round((val / maxVal) * 100)) : 3
          return (
            <div key={stage.key}>
              <div className="flex items-center justify-between text-[13px] mb-1.5">
                <span className="text-[#6e6e73]">{stage.label}</span>
                <div className="flex items-center gap-3">
                  {i > 0 && (
                    <span className="text-[#86868b] text-[11px]">{pct(val, prev)}</span>
                  )}
                  <span className="font-semibold text-[#1d1d1f] w-6 text-right">{val}</span>
                </div>
              </div>
              <div className="h-1.5 rounded-full bg-[#f5f5f7]">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${width}%`, background: stage.color }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
