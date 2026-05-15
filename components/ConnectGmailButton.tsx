'use client'
import { useState } from 'react'
import { Mail } from 'lucide-react'

interface Props {
  connected: boolean
  gmailAddress: string | null
  onDisconnect: () => void
}

export default function ConnectGmailButton({ connected, gmailAddress, onDisconnect }: Props) {
  const [loading, setLoading] = useState(false)

  const handleDisconnect = async () => {
    setLoading(true)
    try {
      await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gmail_refresh_token: null, paused: true }),
      })
      onDisconnect()
    } finally {
      setLoading(false)
    }
  }

  if (connected) {
    return (
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
          <Mail size={16} />
          <span>{gmailAddress ?? 'Gmail connected'}</span>
          <span className="text-green-500">✓</span>
        </div>
        <button
          onClick={handleDisconnect}
          disabled={loading}
          className="text-sm text-red-600 hover:underline disabled:opacity-50"
        >
          {loading ? 'Disconnecting…' : 'Disconnect'}
        </button>
      </div>
    )
  }

  return (
    <a
      href="/api/auth/gmail"
      className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
    >
      <Mail size={16} />
      Connect Gmail
    </a>
  )
}
