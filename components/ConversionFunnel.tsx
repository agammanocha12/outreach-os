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
  { key: 'leads' as const, label: 'Total Leads', color: 'bg-blue-500' },
  { key: 'sent' as const, label: 'Sent', color: 'bg-indigo-500' },
  { key: 'opened' as const, label: 'Opened', color: 'bg-violet-500' },
  { key: 'replied' as const, label: 'Replied', color: 'bg-purple-500' },
  { key: 'demo' as const, label: 'Demo', color: 'bg-pink-500' },
  { key: 'customer' as const, label: 'Customer', color: 'bg-green-500' },
]

function pct(num: number, denom: number): string {
  if (!denom) return '—'
  return `${Math.round((num / denom) * 100)}%`
}

export default function ConversionFunnel({ funnel }: Props) {
  const maxVal = funnel.leads || 1

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <h3 className="font-semibold text-gray-800 mb-4">Conversion Funnel</h3>
      <div className="space-y-2">
        {stages.map((stage, i) => {
          const val = funnel[stage.key]
          const prev = i > 0 ? funnel[stages[i - 1].key] : val
          const width = maxVal > 0 ? Math.max(4, Math.round((val / maxVal) * 100)) : 4
          return (
            <div key={stage.key}>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-gray-600">{stage.label}</span>
                <div className="flex items-center gap-3">
                  {i > 0 && (
                    <span className="text-gray-400 text-xs">{pct(val, prev)} from prev</span>
                  )}
                  <span className="font-semibold text-gray-900 w-8 text-right">{val}</span>
                </div>
              </div>
              <div className="h-5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full ${stage.color} rounded-full transition-all`}
                  style={{ width: `${width}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
