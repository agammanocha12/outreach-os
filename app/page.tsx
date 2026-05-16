'use client'
import { useEffect, useState, useCallback } from 'react'
import StatsCard from '@/components/StatsCard'
import ConversionFunnel from '@/components/ConversionFunnel'
import PipelineValue from '@/components/PipelineValue'
import ABTestResults from '@/components/ABTestResults'
import { RefreshCw, Send, Zap } from 'lucide-react'

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
      setSendMsg(res.ok ? `Sent ${d.sent} emails` : `Error: ${d.error}`)
      await fetchStats()
    } catch {
      setSendMsg('Failed to send')
    } finally {
      setSending(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <RefreshCw className="animate-spin text-[#86868b]" size={22} />
      </div>
    )
  }

  const s = stats

  return (
    <div className="p-6 space-y-4 h-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[22px] font-semibold tracking-tight text-[#1d1d1f]">Dashboard</h1>
          <p className="text-[12px] text-[#86868b] mt-0.5">Auto-refreshes every 30s</p>
        </div>
        <button
          onClick={fetchStats}
          className="text-[#86868b] hover:text-[#1d1d1f] transition-colors p-2 rounded-xl hover:bg-white cursor-pointer"
          aria-label="Refresh dashboard"
        >
          <RefreshCw size={15} />
        </button>
      </div>

      {/* Row 1: 4 stat cards */}
      <div className="grid grid-cols-4 gap-4">
        <StatsCard label="Total Leads" value={(s?.totalLeads ?? 0).toLocaleString()} sub={`${s?.pipelineLeads ?? 0} in pipeline`} color="blue" />
        <StatsCard label="Emails Sent" value={(s?.totalSent ?? 0).toLocaleString()} sub={`${s?.sentToday ?? 0} today`} color="purple" />
        <StatsCard label="Reply Rate" value={`${s?.replyRate ?? 0}%`} sub={`${s?.hotReplies ?? 0} hot · ${s?.warmReplies ?? 0} warm`} color="orange" />
        <StatsCard label="Customers" value={s?.customers ?? 0} sub={`$${(s?.mrr ?? 0).toLocaleString()}/mo MRR`} color="green" />
      </div>

      {/* Row 2: Funnel (span 2) + Pipeline + Quick Send */}
      <div className="grid grid-cols-4 gap-4">
        <div className="col-span-2">
          <ConversionFunnel funnel={s?.funnel ?? { leads: 0, sent: 0, opened: 0, replied: 0, demo: 0, customer: 0 }} />
        </div>
        <PipelineValue pipelineLeads={s?.pipelineLeads ?? 0} monthlyPrice={400} />

        {/* Quick Send */}
        <div className="bg-white rounded-2xl p-5 shadow-[0_2px_12px_rgba(0,0,0,0.06)] border border-[#e0e0e5]/60 flex flex-col">
          <div className="flex items-center gap-2 mb-2">
            <Zap size={15} className="text-[#0071e3]" />
            <h3 className="text-[14px] font-semibold text-[#1d1d1f]">Quick Send</h3>
          </div>
          <p className="text-[12px] text-[#6e6e73] mb-4 leading-relaxed flex-1">
            Send to the next 5 top-scored leads. Auto-sends run at 10am ET on weekdays.
          </p>
          <button
            onClick={handleSendNow}
            disabled={sending}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-medium text-white disabled:opacity-50 transition-opacity hover:opacity-90 cursor-pointer"
            style={{ background: '#0071e3' }}
          >
            <Send size={13} />
            {sending ? 'Sending…' : 'Send 5 now'}
          </button>
          {sendMsg && <p className="text-[12px] mt-2 text-[#6e6e73]">{sendMsg}</p>}
        </div>
      </div>

      {/* Row 3: A/B Tests + Recent Activity */}
      <div className="grid grid-cols-4 gap-4">
        <ABTestResults variantCounts={s?.variantCounts ?? { A: 0, B: 0, C: 0 }} />

        {/* Recent Activity spans 3 cols */}
        <div className="col-span-3 bg-white rounded-2xl p-5 shadow-[0_2px_12px_rgba(0,0,0,0.06)] border border-[#e0e0e5]/60">
          <h3 className="text-[14px] font-semibold text-[#1d1d1f] mb-4">Recent Activity</h3>
          {(s?.recentActivity ?? []).length === 0 ? (
            <p className="text-[13px] text-[#86868b]">
              No sends yet. Scrape leads to get started, then flip the toggle in Settings.
            </p>
          ) : (
            <div>
              {(s?.recentActivity ?? []).map((a, i) => (
                <div
                  key={a.id}
                  className={`flex items-center justify-between py-2.5 text-[13px] ${
                    i < (s?.recentActivity ?? []).length - 1 ? 'border-b border-[#f5f5f7]' : ''
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#0071e3] shrink-0" />
                    <span className="font-medium text-[#1d1d1f] shrink-0">{a.leads?.business_name}</span>
                    <span className="text-[#86868b] truncate">{a.subject}</span>
                  </div>
                  <span className="text-[#86868b] text-[12px] shrink-0 ml-4">
                    {a.sent_at ? new Date(a.sent_at).toLocaleDateString() : ''}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
