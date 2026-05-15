interface Props {
  pipelineLeads: number
  monthlyPrice: number
}

export default function PipelineValue({ pipelineLeads, monthlyPrice }: Props) {
  const closeRate = 0.38
  const annualValue = Math.round(pipelineLeads * closeRate * monthlyPrice * 12)
  const customers = Math.round(pipelineLeads * closeRate)

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <h3 className="font-semibold text-gray-800 mb-4">Pipeline Value</h3>
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Active leads</span>
          <span className="font-semibold">{pipelineLeads}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Est. close rate</span>
          <span className="font-semibold">38%</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Est. customers</span>
          <span className="font-semibold">{customers}</span>
        </div>
        <div className="border-t pt-3 flex justify-between items-center">
          <span className="text-sm font-medium text-gray-700">Est. ARR</span>
          <span className="text-lg font-bold text-green-600">
            ${annualValue.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  )
}
