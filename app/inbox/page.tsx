'use client'
import { useEffect, useState } from 'react'
import ReplyCard from '@/components/ReplyCard'
import type { Reply } from '@/lib/types'
import { RefreshCw } from 'lucide-react'

interface ReplyWithMeta extends Reply {
  business_name: string
  suggested_response: string
}

export default function InboxPage() {
  const [replies, setReplies] = useState<ReplyWithMeta[]>([])
  const [loading, setLoading] = useState(true)

  async function fetchReplies() {
    setLoading(true)
    try {
      const res = await fetch('/api/inbox')
      if (res.ok) setReplies(await res.json())
    } catch {}
    setLoading(false)
  }

  useEffect(() => {
    fetchReplies()
    const id = setInterval(fetchReplies, 30000)
    return () => clearInterval(id)
  }, [])

  function handleHandled(id: string) {
    setReplies(prev => prev.filter(r => r.id !== id))
  }

  const hot = replies.filter(r => r.category === 'HOT')
  const other = replies.filter(r => r.category !== 'HOT')

  return (
    <div className="p-8 space-y-5 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[28px] font-semibold tracking-tight text-[#1d1d1f]">Inbox</h1>
          <p className="text-[13px] text-[#86868b] mt-0.5">
            {replies.length} unhandled {replies.length === 1 ? 'reply' : 'replies'}
          </p>
        </div>
        <button onClick={fetchReplies} className="text-[#86868b] hover:text-[#1d1d1f] transition-colors p-2 rounded-xl hover:bg-white">
          <RefreshCw size={16} />
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="animate-spin text-[#86868b]" size={22} />
        </div>
      ) : replies.length === 0 ? (
        <div className="bg-white rounded-2xl p-14 text-center shadow-[0_2px_12px_rgba(0,0,0,0.06)] border border-[#e0e0e5]/60">
          <p className="text-[17px] font-medium text-[#1d1d1f]">All clear</p>
          <p className="text-[13px] text-[#86868b] mt-1">No unhandled replies. Check back after sends go out.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {hot.length > 0 && (
            <>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold text-[#ff3b30] uppercase tracking-widest">🔥 Hot — reply within the hour</span>
              </div>
              {hot.map(r => (
                <ReplyCard key={r.id} reply={r} onHandled={handleHandled} />
              ))}
            </>
          )}
          {other.length > 0 && (
            <>
              {hot.length > 0 && (
                <div className="pt-2">
                  <span className="text-[11px] font-semibold text-[#86868b] uppercase tracking-widest">Other replies</span>
                </div>
              )}
              {other.map(r => (
                <ReplyCard key={r.id} reply={r} onHandled={handleHandled} />
              ))}
            </>
          )}
        </div>
      )}
    </div>
  )
}
