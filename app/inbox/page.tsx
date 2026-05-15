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
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inbox</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {replies.length} unhandled {replies.length === 1 ? 'reply' : 'replies'}
          </p>
        </div>
        <button onClick={fetchReplies} className="text-gray-400 hover:text-gray-600 transition-colors">
          <RefreshCw size={18} />
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="animate-spin text-gray-400" size={24} />
        </div>
      ) : replies.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <p className="text-gray-400 text-lg">No unhandled replies</p>
          <p className="text-gray-300 text-sm mt-1">Check back after sends go out</p>
        </div>
      ) : (
        <div className="space-y-4">
          {hot.length > 0 && (
            <>
              <h2 className="text-sm font-semibold text-red-600 uppercase tracking-wide">
                🔥 Hot — reply within the hour
              </h2>
              {hot.map(r => (
                <ReplyCard key={r.id} reply={r} onHandled={handleHandled} />
              ))}
            </>
          )}
          {other.length > 0 && (
            <>
              {hot.length > 0 && (
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide pt-2">
                  Other replies
                </h2>
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
