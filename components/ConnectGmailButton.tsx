'use client'
import { useState } from 'react'
import { Mail, CheckCircle } from 'lucide-react'

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
        <div className="flex items-center gap-2 text-[13px] px-3.5 py-2 rounded-xl bg-[#e6f9ed] text-[#1a7a3a]">
          <CheckCircle size={14} />
          <span>{gmailAddress ?? 'Gmail connected'}</span>
        </div>
        <button
          onClick={handleDisconnect}
          disabled={loading}
          className="text-[13px] text-[#ff3b30] hover:opacity-70 disabled:opacity-50 transition-opacity"
        >
          {loading ? 'Disconnecting…' : 'Disconnect'}
        </button>
      </div>
    )
  }

  return (
    <a
      href="/api/auth/gmail"
      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-medium text-white transition-opacity hover:opacity-90"
      style={{ background: '#0071e3' }}
    >
      <Mail size={15} />
      Connect Gmail
    </a>
  )
}
