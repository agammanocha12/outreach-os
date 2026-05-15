'use client'
import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import type { Lead } from '@/lib/types'

const STATUS_COLORS: Record<string, string> = {
  new: 'bg-gray-100 text-gray-700',
  sent: 'bg-blue-100 text-blue-700',
  opened: 'bg-indigo-100 text-indigo-700',
  replied: 'bg-purple-100 text-purple-700',
  demo: 'bg-yellow-100 text-yellow-700',
  customer: 'bg-green-100 text-green-700',
  dead: 'bg-red-100 text-red-700',
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
    <div className="bg-white rounded-xl border border-gray-200">
      <div className="p-4 border-b border-gray-100 flex gap-3">
        <input
          type="text"
          placeholder="Search business, city, email…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All statuses</option>
          {['new', 'sent', 'opened', 'replied', 'demo', 'customer', 'dead'].map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
              <th className="text-left px-4 py-3">Business</th>
              <th className="text-left px-4 py-3">City</th>
              <th className="text-left px-4 py-3">Email</th>
              <th className="text-center px-4 py-3">Score</th>
              <th className="text-center px-4 py-3">Rating</th>
              <th className="text-left px-4 py-3">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                  No leads found
                </td>
              </tr>
            )}
            {filtered.map(lead => (
              <tr key={lead.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">
                  {lead.business_name}
                  {lead.owner_name && (
                    <div className="text-xs text-gray-400">{lead.owner_name}</div>
                  )}
                </td>
                <td className="px-4 py-3 text-gray-500">{lead.city ?? '—'}</td>
                <td className="px-4 py-3 text-gray-500 max-w-[180px] truncate">
                  {lead.email ?? '—'}
                </td>
                <td className="px-4 py-3 text-center">
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-xs font-bold ${
                      lead.score >= 80
                        ? 'bg-green-100 text-green-700'
                        : lead.score >= 60
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {lead.score}
                  </span>
                </td>
                <td className="px-4 py-3 text-center text-gray-500">
                  {lead.rating ? `${lead.rating}★` : '—'}
                  {lead.review_count ? (
                    <div className="text-xs text-gray-400">({lead.review_count})</div>
                  ) : null}
                </td>
                <td className="px-4 py-3">
                  <select
                    value={lead.status}
                    onChange={e => onStatusChange(lead.id, e.target.value)}
                    className={`text-xs px-2 py-1 rounded-full border-0 font-medium cursor-pointer ${
                      STATUS_COLORS[lead.status] ?? 'bg-gray-100 text-gray-700'
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
                    className="text-gray-300 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={15} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="px-4 py-3 border-t border-gray-100 text-xs text-gray-400">
        {filtered.length} of {leads.length} leads
      </div>
    </div>
  )
}
