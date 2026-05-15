'use client'
import { useState } from 'react'
import { CheckCircle, ExternalLink } from 'lucide-react'
import type { Reply, ReplyCategory } from '@/lib/types'

const CATEGORY_STYLES: Record<ReplyCategory, { bg: string; text: string; dot: string }> = {
  HOT:        { bg: '#fff0f0', text: '#c0392b', dot: '#ff3b30' },
  WARM:       { bg: '#fff4e0', text: '#bf6000', dot: '#ff9f0a' },
  COLD:       { bg: '#f5f5f7', text: '#6e6e73', dot: '#86868b' },
  COMPETITOR: { bg: '#fff9e0', text: '#946000', dot: '#ffd60a' },
  OOO:        { bg: '#e8f0fe', text: '#0055b3', dot: '#0071e3' },
  UNKNOWN:    { bg: '#f5f5f7', text: '#6e6e73', dot: '#86868b' },
}

const CATEGORY_EMOJI: Record<ReplyCategory, string> = {
  HOT: '🔥', WARM: '📬', COLD: '❄️', COMPETITOR: '⚡', OOO: '✈️', UNKNOWN: '❓',
}

interface Props {
  reply: Reply & { business_name: string; suggested_response: string }
  onHandled: (id: string) => void
}

export default function ReplyCard({ reply, onHandled }: Props) {
  const [loading, setLoading] = useState(false)
  const [response, setResponse] = useState(reply.suggested_response)

  const style = CATEGORY_STYLES[reply.category]
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
      className="bg-white rounded-2xl p-5 shadow-[0_2px_12px_rgba(0,0,0,0.06)] border"
      style={{ borderColor: reply.category === 'HOT' ? '#ffb3ae' : '#e0e0e5' }}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="font-semibold text-[15px] text-[#1d1d1f]">{reply.business_name}</div>
          <div className="text-[12px] text-[#86868b] mt-0.5">
            {new Date(reply.received_at).toLocaleString()}
          </div>
        </div>
        <span
          className="text-[11px] font-semibold px-2.5 py-1 rounded-full"
          style={{ background: style.bg, color: style.text }}
        >
          {CATEGORY_EMOJI[reply.category]} {reply.category}
        </span>
      </div>

      <div className="rounded-xl p-3.5 text-[13px] text-[#1d1d1f] mb-4 whitespace-pre-wrap leading-relaxed bg-[#f5f5f7]">
        {reply.body}
      </div>

      {reply.category !== 'COLD' && reply.category !== 'OOO' && (
        <div className="mb-4">
          <label className="text-[11px] font-medium text-[#86868b] uppercase tracking-wide block mb-1.5">
            Suggested reply
          </label>
          <textarea
            value={response}
            onChange={e => setResponse(e.target.value)}
            rows={3}
            className="w-full rounded-xl px-3.5 py-2.5 text-[13px] bg-[#f5f5f7] border-0 resize-none focus:outline-none focus:ring-2 focus:ring-[#0071e3]/30 text-[#1d1d1f]"
          />
          <a
            href={gmailComposeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 mt-2 text-[13px] font-medium px-3.5 py-2 rounded-xl transition-colors text-white"
            style={{ background: '#0071e3' }}
          >
            <ExternalLink size={13} />
            Open in Gmail
          </a>
        </div>
      )}

      <button
        onClick={handleMark}
        disabled={loading}
        className="inline-flex items-center gap-1.5 text-[13px] text-[#86868b] hover:text-[#34c759] disabled:opacity-50 transition-colors"
      >
        <CheckCircle size={15} />
        {loading ? 'Marking…' : 'Mark handled'}
      </button>
    </div>
  )
}
