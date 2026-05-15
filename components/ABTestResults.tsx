'use client'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'

interface Props {
  variantCounts: Record<string, number>
}

const COLORS: Record<string, string> = {
  A: '#3b82f6',
  B: '#8b5cf6',
  C: '#10b981',
}

const LABELS: Record<string, string> = {
  A: "calls you're missing",
  B: 'missed emergency calls',
  C: 'quick question',
}

export default function ABTestResults({ variantCounts }: Props) {
  const data = ['A', 'B', 'C'].map(v => ({
    variant: `${v}: ${LABELS[v]}`,
    short: v,
    sends: variantCounts[v] ?? 0,
  }))

  const total = data.reduce((s, d) => s + d.sends, 0)

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <h3 className="font-semibold text-gray-800 mb-1">A/B Subject Lines</h3>
      <p className="text-xs text-gray-400 mb-4">{total} total sends</p>
      <div className="space-y-2 mb-4">
        {data.map(d => (
          <div key={d.short} className="text-xs text-gray-500">
            <span className="font-semibold text-gray-700">{d.short}:</span>{' '}
            "{LABELS[d.short]}" — {d.sends} sends
          </div>
        ))}
      </div>
      <ResponsiveContainer width="100%" height={140}>
        <BarChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="short" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip
            formatter={(value) => [`${typeof value === 'number' ? value : 0} sends`, 'Volume']}
            labelFormatter={(label) => `Variant ${label}`}
          />
          <Bar dataKey="sends" radius={[4, 4, 0, 0]}>
            {data.map((entry) => (
              <Cell key={entry.short} fill={COLORS[entry.short] ?? '#6b7280'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
