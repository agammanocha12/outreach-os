interface Props {
  pipelineLeads: number
  monthlyPrice: number
}

export default function PipelineValue({ pipelineLeads, monthlyPrice }: Props) {
  const closeRate = 0.38
  const annualValue = Math.round(pipelineLeads * closeRate * monthlyPrice * 12)
  const customers = Math.round(pipelineLeads * closeRate)

  const rows = [
    { label: 'Active leads', value: pipelineLeads },
    { label: 'Est. close rate', value: '38%' },
    { label: 'Est. customers', value: customers },
  ]

  return (
    <div className="bg-white rounded-2xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.06)] border border-[#e0e0e5]/60">
      <h3 className="text-[15px] font-semibold text-[#1d1d1f] mb-5">Pipeline Value</h3>
      <div className="space-y-3">
        {rows.map(r => (
          <div key={r.label} className="flex justify-between items-center">
            <span className="text-[13px] text-[#6e6e73]">{r.label}</span>
            <span className="text-[13px] font-medium text-[#1d1d1f]">{r.value}</span>
          </div>
        ))}
        <div className="pt-3 mt-1 border-t border-[#f0f0f5]">
          <div className="flex justify-between items-center">
            <span className="text-[13px] font-medium text-[#1d1d1f]">Est. ARR</span>
            <span className="text-[22px] font-semibold tracking-tight" style={{ color: '#34c759' }}>
              ${annualValue.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
