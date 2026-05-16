interface StatsCardProps {
  label: string
  value: string | number
  sub?: string
  color?: 'blue' | 'green' | 'purple' | 'orange'
}

const gradients: Record<string, string> = {
  blue:   'linear-gradient(135deg, #0071e3 0%, #42a5f5 100%)',
  green:  'linear-gradient(135deg, #34c759 0%, #30d158 100%)',
  purple: 'linear-gradient(135deg, #bf5af2 0%, #9b59b6 100%)',
  orange: 'linear-gradient(135deg, #ff9f0a 0%, #ff6b00 100%)',
}

export default function StatsCard({ label, value, sub, color = 'blue' }: StatsCardProps) {
  return (
    <div
      className="rounded-2xl p-5 text-white shadow-[0_4px_20px_rgba(0,0,0,0.15)]"
      style={{ background: gradients[color] }}
    >
      <p className="text-[12px] font-medium uppercase tracking-widest opacity-80 mb-3">{label}</p>
      <p className="text-[36px] font-bold tracking-tight leading-none mb-2">{value}</p>
      {sub && <p className="text-[12px] opacity-70">{sub}</p>}
    </div>
  )
}
