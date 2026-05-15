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
  A: '#0071e3',
  B: '#bf5af2',
  C: '#34c759',
}

const LABELS: Record<string, string> = {
  A: "calls you're missing",
  B: 'missed emergency calls',
  C: 'quick question',
}

export default function ABTestResults({ variantCounts }: Props) {
  const data = ['A', 'B', 'C'].map(v => ({
    variant: v,
    sends: variantCounts[v] ?? 0,
  }))

  const total = data.reduce((s, d) => s + d.sends, 0)

  return (
    <div className="bg-white rounded-2xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.06)] border border-[#e0e0e5]/60">
      <h3 className="text-[15px] font-semibold text-[#1d1d1f] mb-1">A/B Subject Lines</h3>
      <p className="text-[13px] text-[#86868b] mb-4">{total} total sends</p>
      <div className="space-y-1.5 mb-5">
        {data.map(d => (
          <div key={d.variant} className="flex items-center gap-2 text-[13px]">
            <span
              className="w-2 h-2 rounded-full shrink-0"
              style={{ background: COLORS[d.variant] ?? '#86868b' }}
            />
            <span className="font-medium text-[#1d1d1f]">{d.variant}</span>
            <span className="text-[#6e6e73]">"{LABELS[d.variant]}"</span>
            <span className="ml-auto text-[#86868b]">{d.sends}</span>
          </div>
        ))}
      </div>
      <ResponsiveContainer width="100%" height={120}>
        <BarChart data={data} margin={{ top: 0, right: 0, left: -24, bottom: 0 }} barSize={28}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f5" />
          <XAxis dataKey="variant" tick={{ fontSize: 12, fill: '#6e6e73' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 12, fill: '#86868b' }} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{ borderRadius: 12, border: '1px solid #e0e0e5', boxShadow: '0 4px 16px rgba(0,0,0,0.08)', fontSize: 13 }}
            formatter={(value) => [`${typeof value === 'number' ? value : 0} sends`, 'Volume']}
            labelFormatter={(label) => `Variant ${label}`}
          />
          <Bar dataKey="sends" radius={[6, 6, 0, 0]}>
            {data.map((entry) => (
              <Cell key={entry.variant} fill={COLORS[entry.variant] ?? '#86868b'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
