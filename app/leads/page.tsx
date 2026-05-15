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
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Leads</h1>
          <p className="text-sm text-gray-400 mt-0.5">{leads.length} total leads, sorted by score</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={fetchLeads}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <RefreshCw size={18} />
          </button>
          <button
            onClick={openScrapeModal}
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            <Search size={15} />
            Scrape new leads
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="animate-spin text-gray-400" size={24} />
        </div>
      ) : (
        <LeadsTable
          leads={leads}
          onStatusChange={handleStatusChange}
          onDelete={handleDelete}
        />
      )}

      {showScrapeModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-lg w-full mx-4 shadow-xl">
            <h2 className="font-bold text-lg mb-3">Scrape New Leads</h2>
            <p className="text-sm text-gray-600 mb-4">
              Run this command in your terminal. It scrapes Google Maps and adds
              leads directly to your database.
            </p>
            <div className="bg-gray-900 text-green-400 rounded-lg p-4 font-mono text-sm break-all mb-4">
              {scrapeCmd}
            </div>
            <p className="text-xs text-gray-400 mb-4">
              You&apos;ll get a Telegram notification when it completes with the lead count.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => navigator.clipboard.writeText(scrapeCmd)}
                className="px-4 py-2 text-sm bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Copy command
              </button>
              <button
                onClick={() => setShowScrapeModal(false)}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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
