'use client'
import { useEffect, useState } from 'react'
import LeadsTable from '@/components/LeadsTable'
import type { Lead } from '@/lib/types'
import { RefreshCw, Search } from 'lucide-react'

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [showScrapeModal, setShowScrapeModal] = useState(false)
  const [scrapeCmd, setScrapeCmd] = useState('')

  async function fetchLeads() {
    setLoading(true)
    try {
      const res = await fetch('/api/leads')
      if (res.ok) setLeads(await res.json())
    } catch {}
    setLoading(false)
  }

  useEffect(() => { fetchLeads() }, [])

  async function handleStatusChange(id: string, status: string) {
    setLeads(prev => prev.map(l => l.id === id ? { ...l, status: status as Lead['status'] } : l))
    await fetch(`/api/leads/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this lead?')) return
    setLeads(prev => prev.filter(l => l.id !== id))
    await fetch(`/api/leads/${id}`, { method: 'DELETE' })
  }

  function openScrapeModal() {
    setScrapeCmd('npm run scrape -- "HVAC and plumbing" "Suffolk County NY,Nassau County NY,Queens NY,Long Island NY" 400')
    setShowScrapeModal(true)
  }

  return (
    <div className="p-8 space-y-5 max-w-6xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[28px] font-semibold tracking-tight text-[#1d1d1f]">Leads</h1>
          <p className="text-[13px] text-[#86868b] mt-0.5">{leads.length} total leads, sorted by score</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchLeads}
            className="text-[#86868b] hover:text-[#1d1d1f] transition-colors p-2 rounded-xl hover:bg-white"
          >
            <RefreshCw size={16} />
          </button>
          <button
            onClick={openScrapeModal}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-medium text-white transition-opacity hover:opacity-90"
            style={{ background: '#0071e3' }}
          >
            <Search size={14} />
            Scrape new leads
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="animate-spin text-[#86868b]" size={22} />
        </div>
      ) : (
        <LeadsTable leads={leads} onStatusChange={handleStatusChange} onDelete={handleDelete} />
      )}

      {showScrapeModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full mx-4 shadow-[0_24px_64px_rgba(0,0,0,0.16)]">
            <h2 className="font-semibold text-[17px] text-[#1d1d1f] mb-2">Scrape New Leads</h2>
            <p className="text-[13px] text-[#6e6e73] mb-4 leading-relaxed">
              Run this command in your local terminal. It scrapes Google Maps and adds leads directly to your database.
            </p>
            <div className="bg-[#1d1d1f] text-[#30d158] rounded-xl p-4 font-mono text-[12px] break-all mb-4 leading-relaxed">
              {scrapeCmd}
            </div>
            <p className="text-[11px] text-[#86868b] mb-5">
              You&apos;ll get a Telegram notification when it completes with the lead count.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => navigator.clipboard.writeText(scrapeCmd)}
                className="px-4 py-2 text-[13px] font-medium rounded-xl bg-[#f5f5f7] text-[#1d1d1f] hover:bg-[#eaeaec] transition-colors"
              >
                Copy command
              </button>
              <button
                onClick={() => setShowScrapeModal(false)}
                className="px-4 py-2 text-[13px] font-medium rounded-xl text-white transition-opacity hover:opacity-90"
                style={{ background: '#0071e3' }}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
