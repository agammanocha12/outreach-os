'use client'
import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import type { Lead } from '@/lib/types'

const STATUS_STYLES: Record<string, string> = {
  new: 'bg-[#f5f5f7] text-[#6e6e73]',
  sent: 'bg-[#e8f0fe] text-[#0071e3]',
  opened: 'bg-[#f0eafe] text-[#8e44d9]',
  replied: 'bg-[#fff4e0] text-[#bf6000]',
  demo: 'bg-[#fff9e0] text-[#946000]',
  customer: 'bg-[#e6f9ed] text-[#1a7a3a]',
  dead: 'bg-[#fff0f0] text-[#c0392b]',
}

interface Props {
  leads: Lead[]
  onStatusChange: (id: string, status: string) => void
  onDelete: (id: string) => void
}

export default function LeadsTable({ leads, onStatusChange, onDelete }: Props) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const filtered = leads.filter(l => {
    const matchSearch =
      !search ||
      l.business_name.toLowerCase().includes(search.toLowerCase()) ||
      (l.city ?? '').toLowerCase().includes(search.toLowerCase()) ||
      (l.email ?? '').toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'all' || l.status === statusFilter
    return matchSearch && matchStatus
  })

  return (
    <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] border border-[#e0e0e5]/60 overflow-hidden">
      <div className="p-4 border-b border-[#f0f0f5] flex gap-3">
        <input
          type="text"
          placeholder="Search business, city, email…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 rounded-xl px-3 py-2 text-[13px] bg-[#f5f5f7] border-0 focus:outline-none focus:ring-2 focus:ring-[#0071e3]/30 text-[#1d1d1f] placeholder-[#86868b]"
        />
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="rounded-xl px-3 py-2 text-[13px] bg-[#f5f5f7] border-0 focus:outline-none focus:ring-2 focus:ring-[#0071e3]/30 text-[#1d1d1f]"
        >
          <option value="all">All statuses</option>
          {['new', 'sent', 'opened', 'replied', 'demo', 'customer', 'dead'].map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="text-[#86868b] text-[11px] uppercase tracking-wide border-b border-[#f0f0f5]">
              <th className="text-left px-5 py-3 font-medium">Business</th>
              <th className="text-left px-4 py-3 font-medium">City</th>
              <th className="text-left px-4 py-3 font-medium">Email</th>
              <th className="text-center px-4 py-3 font-medium">Score</th>
              <th className="text-center px-4 py-3 font-medium">Rating</th>
              <th className="text-left px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-5 py-10 text-center text-[#86868b]">
                  No leads found
                </td>
              </tr>
            )}
            {filtered.map(lead => (
              <tr key={lead.id} className="border-b border-[#f5f5f7] last:border-0 hover:bg-[#fafafa] transition-colors">
                <td className="px-5 py-3">
                  <span className="font-medium text-[#1d1d1f]">{lead.business_name}</span>
                  {lead.owner_name && (
                    <div className="text-[11px] text-[#86868b]">{lead.owner_name}</div>
                  )}
                </td>
                <td className="px-4 py-3 text-[#6e6e73]">{lead.city ?? '—'}</td>
                <td className="px-4 py-3 text-[#6e6e73] max-w-[180px] truncate">{lead.email ?? '—'}</td>
                <td className="px-4 py-3 text-center">
                  <span
                    className="inline-block px-2 py-0.5 rounded-lg text-[11px] font-semibold"
                    style={{
                      background: lead.score >= 80 ? '#e6f9ed' : lead.score >= 60 ? '#fff9e0' : '#f5f5f7',
                      color: lead.score >= 80 ? '#1a7a3a' : lead.score >= 60 ? '#946000' : '#6e6e73',
                    }}
                  >
                    {lead.score}
                  </span>
                </td>
                <td className="px-4 py-3 text-center text-[#6e6e73]">
                  {lead.rating ? `${lead.rating}★` : '—'}
                  {lead.review_count ? (
                    <div className="text-[11px] text-[#86868b]">({lead.review_count})</div>
                  ) : null}
                </td>
                <td className="px-4 py-3">
                  <select
                    value={lead.status}
                    onChange={e => onStatusChange(lead.id, e.target.value)}
                    className={`text-[11px] px-2.5 py-1 rounded-full border-0 font-medium cursor-pointer ${
                      STATUS_STYLES[lead.status] ?? 'bg-[#f5f5f7] text-[#6e6e73]'
                    }`}
                  >
                    {['new', 'sent', 'opened', 'replied', 'demo', 'customer', 'dead'].map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => onDelete(lead.id)}
                    className="text-[#d2d2d7] hover:text-[#ff3b30] transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="px-5 py-3 border-t border-[#f0f0f5] text-[11px] text-[#86868b]">
        {filtered.length} of {leads.length} leads
      </div>
    </div>
  )
}
