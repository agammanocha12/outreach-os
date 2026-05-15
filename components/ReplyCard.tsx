'use client'
import { useState } from 'react'
import { CheckCircle, ExternalLink } from 'lucide-react'
import type { Reply, ReplyCategory } from '@/lib/types'

const CATEGORY_COLORS: Record<ReplyCategory, string> = {
  HOT: 'bg-red-100 text-red-700 border-red-200',
  WARM: 'bg-orange-100 text-orange-700 border-orange-200',
  COLD: 'bg-gray-100 text-gray-600 border-gray-200',
  COMPETITOR: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  OOO: 'bg-blue-100 text-blue-700 border-blue-200',
  UNKNOWN: 'bg-gray-100 text-gray-600 border-gray-200',
}

const CATEGORY_EMOJI: Record<ReplyCategory, string> = {
  HOT: '🔥',
  WARM: '📬',
  COLD: '❄️',
  COMPETITOR: '⚡',
  OOO: '✈️',
  UNKNOWN: '❓',
}

interface Props {
  reply: Reply & { business_name: string; suggested_response: string }
  onHandled: (id: string) => void
}

export default function ReplyCard({ reply, onHandled }: Props) {
  const [loading, setLoading] = useState(false)
  const [response, setResponse] = useState(reply.suggested_response)

  const gmailComposeUrl = `https://mail.google.com/mail/u/0/?view=cm&fs=1&body=${encodeURIComponent(response)}`

  async function handleMark() {
    setLoading(true)
    try {
      await fetch(`/api/replies/${reply.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ handled: true }),
      })
      onHandled(reply.id)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className={`bg-white rounded-xl border p-5 ${
        reply.category === 'HOT' ? 'border-red-300 shadow-sm' : 'border-gray-200'
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="font-semibold text-gray-900">{reply.business_name}</div>
          <div className="text-xs text-gray-400 mt-0.5">
            {new Date(reply.received_at).toLocaleString()}
          </div>
        </div>
        <span
          className={`text-xs font-semibold px-2 py-1 rounded-full border ${
            CATEGORY_COLORS[reply.category]
          }`}
        >
          {CATEGORY_EMOJI[reply.category]} {reply.category}
        </span>
      </div>

      <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700 mb-4 whitespace-pre-wrap">
        {reply.body}
      </div>

      {reply.category !== 'COLD' && reply.category !== 'OOO' && (
        <div className="mb-4">
          <label className="text-xs font-medium text-gray-500 block mb-1">
            Suggested reply (edit before sending)
          </label>
          <textarea
            value={response}
            onChange={e => setResponse(e.target.value)}
            rows={3}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <a
            href={gmailComposeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 mt-2 text-sm bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ExternalLink size={13} />
            Send via Gmail
          </a>
        </div>
      )}

      <button
        onClick={handleMark}
        disabled={loading}
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-green-600 disabled:opacity-50 transition-colors"
      >
        <CheckCircle size={15} />
        {loading ? 'Marking…' : 'Mark handled'}
      </button>
    </div>
  )
}
