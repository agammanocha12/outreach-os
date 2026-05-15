'use client'
import { useEffect, useState, useCallback } from 'react'
import StatsCard from '@/components/StatsCard'
import ConversionFunnel from '@/components/ConversionFunnel'
import PipelineValue from '@/components/PipelineValue'
import ABTestResults from '@/components/ABTestResults'
import { RefreshCw, Send } from 'lucide-react'

interface DashboardStats {
  totalLeads: number
  sentToday: number
  totalSent: number
  totalOpens: number
  totalReplies: number
  hotReplies: number
  warmReplies: number
  unhandledReplies: number
  customers: number
  mrr: number
  pipelineLeads: number
  replyRate: number
  variantCounts: Record<string, number>
  recentActivity: Array<{
    id: string
    sent_at: string
    subject: string
    leads: { business_name: string }
  }>
  funnel: {
    leads: number
    sent: number
    opened: number
    replied: number
    demo: number
    customer: number
  }
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [sendMsg, setSendMsg] = useState('')

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch('/api/dashboard')
      if (res.ok) setStats(await res.json())
    } catch {}
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchStats()
    const id = setInterval(fetchStats, 30000)
    return () => clearInterval(id)
  }, [fetchStats])

  async function handleSendNow() {
    setSending(true)
    setSendMsg('')
    try {
      const res = await fetch('/api/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ count: 5 }),
      })
      const d = await res.json()
      setSendMsg(res.ok ? `✓ Sent ${d.sent} emails` : `Error: ${d.error}`)
      await fetchStats()
    } catch {
      setSendMsg('Failed to send')
    } finally {
      setSending(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-64">
        <RefreshCw className="animate-spin text-gray-400" size={24} />
      </div>
    )
  }

  const s = stats

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-400 mt-0.5">Auto-refreshes every 30s</p>
        </div>
        <button
          onClick={fetchStats}
          className="text-gray-400 hover:text-gray-600 transition-colors"
          title="Refresh"
        >
          <RefreshCw size={18} />
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          label="Total Leads"
          value={(s?.totalLeads ?? 0).toLocaleString()}
          sub={`${s?.pipelineLeads ?? 0} in pipeline`}
          color="blue"
        />
        <StatsCard
          label="Emails Sent"
          value={(s?.totalSent ?? 0).toLocaleString()}
          sub={`${s?.sentToday ?? 0} today`}
          color="purple"
        />
        <StatsCard
          label="Reply Rate"
          value={`${s?.replyRate ?? 0}%`}
          sub={`${s?.hotReplies ?? 0} hot · ${s?.warmReplies ?? 0} warm`}
          color="orange"
        />
        <StatsCard
          label="Customers"
          value={s?.customers ?? 0}
          sub={`$${(s?.mrr ?? 0).toLocaleString()}/mo MRR`}
          color="green"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ConversionFunnel
          funnel={s?.funnel ?? { leads: 0, sent: 0, opened: 0, replied: 0, demo: 0, customer: 0 }}
        />
        <PipelineValue pipelineLeads={s?.pipelineLeads ?? 0} monthlyPrice={400} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ABTestResults variantCounts={s?.variantCounts ?? { A: 0, B: 0, C: 0 }} />

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-800 mb-4">Quick Send</h3>
          <p className="text-sm text-gray-500 mb-4">
            Manually send to the next 5 top-scored leads. Automatic sends happen at 10am + 2pm.
          </p>
          <button
            onClick={handleSendNow}
            disabled={sending}
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            <Send size={15} />
            {sending ? 'Sending…' : 'Send 5 now'}
          </button>
          {sendMsg && <p className="text-sm mt-2 text-gray-600">{sendMsg}</p>}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="font-semibold text-gray-800 mb-4">Recent Activity</h3>
        {(s?.recentActivity ?? []).length === 0 ? (
          <p className="text-sm text-gray-400">
            No sends yet. Scrape leads to get started, then flip the toggle in Settings.
          </p>
        ) : (
          <div className="divide-y divide-gray-50">
            {(s?.recentActivity ?? []).map(a => (
              <div
                key={a.id}
                className="flex items-center justify-between py-2 text-sm"
              >
                <div>
                  <span className="font-medium text-gray-800">
                    {a.leads?.business_name}
                  </span>
                  <span className="text-gray-400 ml-2 text-xs truncate max-w-xs inline-block align-bottom">
                    {a.subject}
                  </span>
                </div>
                <span className="text-gray-400 text-xs shrink-0 ml-4">
                  {a.sent_at ? new Date(a.sent_at).toLocaleDateString() : ''}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
