'use client'
import { useEffect, useState } from 'react'
import LeadsTable from '@/components/LeadsTable'
import type { Lead } from '@/lib/types'
import { RefreshCw, Search } from 'lucide-react'

const DEFAULT_NICHE = 'HVAC and plumbing'
const DEFAULT_CITIES = 'Suffolk County NY,Nassau County NY,Queens NY,Long Island NY'

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [showScrapeModal, setShowScrapeModal] = useState(false)
  const [niche, setNiche] = useState(DEFAULT_NICHE)
  const [cities, setCities] = useState(DEFAULT_CITIES)
  const [count, setCount] = useState(400)
  const [scrapeStatus, setScrapeStatus] = useState('')
  const [scraping, setScraping] = useState(false)

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

  async function handleStartScrape() {
    setScraping(true)
    setScrapeStatus('')
    try {
      const res = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ niche, cities, count }),
      })
      const data = await res.json()
      if (res.ok) {
        setScrapeStatus('Queued — bot will start scraping within 10 seconds. Telegram will notify when done.')
        setTimeout(() => setShowScrapeModal(false), 2500)
      } else {
        setScrapeStatus(`Error: ${data.error}${data.details ? ' — ' + data.details : ''}`)
      }
    } catch (err) {
      setScrapeStatus(`Error: ${(err as Error).message}`)
    } finally {
      setScraping(false)
    }
  }

  function openScrapeModal() {
    setNiche(DEFAULT_NICHE)
    setCities(DEFAULT_CITIES)
    setCount(400)
    setScrapeStatus('')
    setShowScrapeModal(true)
  }

  return (
    <div className="p-8 space-y-5">
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
              Queues a job for the bot running on your machine. You&apos;ll get a Telegram notification when it starts and when it finishes.
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-medium text-[#86868b] uppercase tracking-wide block mb-1.5">Niche</label>
                <input
                  type="text"
                  value={niche}
                  onChange={e => setNiche(e.target.value)}
                  className="w-full rounded-xl px-3.5 py-2.5 text-[13px] bg-[#f5f5f7] border-0 focus:outline-none focus:ring-2 focus:ring-[#0071e3]/30"
                />
              </div>
              <div>
                <label className="text-[11px] font-medium text-[#86868b] uppercase tracking-wide block mb-1.5">Cities (comma-separated)</label>
                <textarea
                  value={cities}
                  onChange={e => setCities(e.target.value)}
                  rows={2}
                  className="w-full rounded-xl px-3.5 py-2.5 text-[13px] bg-[#f5f5f7] border-0 resize-none focus:outline-none focus:ring-2 focus:ring-[#0071e3]/30"
                />
              </div>
              <div>
                <label className="text-[11px] font-medium text-[#86868b] uppercase tracking-wide block mb-1.5">Target count</label>
                <input
                  type="number"
                  value={count}
                  onChange={e => setCount(parseInt(e.target.value) || 0)}
                  className="w-32 rounded-xl px-3.5 py-2.5 text-[13px] bg-[#f5f5f7] border-0 focus:outline-none focus:ring-2 focus:ring-[#0071e3]/30"
                />
              </div>
            </div>

            {scrapeStatus && (
              <p className={`text-[12px] mt-4 ${scrapeStatus.startsWith('Error') ? 'text-red-600' : 'text-[#1a7a3a]'}`}>
                {scrapeStatus}
              </p>
            )}

            <div className="flex justify-end gap-2 mt-5">
              <button
                onClick={() => setShowScrapeModal(false)}
                disabled={scraping}
                className="px-4 py-2 text-[13px] font-medium rounded-xl bg-[#f5f5f7] text-[#1d1d1f] hover:bg-[#eaeaec] transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleStartScrape}
                disabled={scraping || !niche || !cities}
                className="px-4 py-2 text-[13px] font-medium rounded-xl text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                style={{ background: '#0071e3' }}
              >
                {scraping ? 'Queueing…' : 'Start scrape'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
