interface StatsCardProps {
  label: string
  value: string | number
  sub?: string
  color?: 'blue' | 'green' | 'purple' | 'orange'
}

const colors = {
  blue: 'bg-blue-50 border-blue-200',
  green: 'bg-green-50 border-green-200',
  purple: 'bg-purple-50 border-purple-200',
  orange: 'bg-orange-50 border-orange-200',
}

export default function StatsCard({ label, value, sub, color = 'blue' }: StatsCardProps) {
  return (
    <div className={`rounded-xl border p-5 ${colors[color]}`}>
      <p className="text-sm text-gray-500 font-medium">{label}</p>
      <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
      {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
    </div>
  )
}
