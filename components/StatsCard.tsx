interface StatsCardProps {
  label: string
  value: string | number
  sub?: string
  color?: 'blue' | 'green' | 'purple' | 'orange'
}

const accents: Record<string, string> = {
  blue: '#0071e3',
  green: '#34c759',
  purple: '#bf5af2',
  orange: '#ff9f0a',
}

export default function StatsCard({ label, value, sub, color = 'blue' }: StatsCardProps) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-[0_2px_12px_rgba(0,0,0,0.06)] border border-[#e0e0e5]/60">
      <div className="flex items-center gap-2 mb-3">
        <span
          className="w-2 h-2 rounded-full"
          style={{ background: accents[color] }}
        />
        <p className="text-[13px] font-medium text-[#6e6e73] uppercase tracking-wide">{label}</p>
      </div>
      <p className="text-[32px] font-semibold tracking-tight text-[#1d1d1f] leading-none">{value}</p>
      {sub && <p className="text-[13px] text-[#86868b] mt-2">{sub}</p>}
    </div>
  )
}
